package service.guild.cache;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import data.MiscDefine;
import data.MiscInfo;
import data.guild.GuildDerbyData;
import extension.EnvConfig;
import model.key.InfoKeyGuild;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.Tuple;
import service.guild.GuildDerbyGroup;
import service.guild.GuildInfo;
import service.guild.GuildManager;
import service.newsboard.NewsBoardServer;
import service.udp.MsgDeleteGuildInfo;
import service.udp.MsgUpdateGuildInfo;
import service.udp.MsgUpdateGuildLeague;
import util.Database;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;
import util.redis.Redis;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class CacheGuildClient
{
    private static boolean                     isRunning;
    private static GuildDerbyTime              derbyTime, nextDerbyTime;

    private static Map<Integer, Map<Integer, ConcurrentLinkedQueue<CacheGuildInfo>>> mapSuggest; //type, <numMember, queue<Info>>

    private static ConcurrentHashMap<String, ConcurrentHashMap<Integer, IncreasePoint>> updateGroupPoint  = new ConcurrentHashMap<>(); //group, guild, point
    private static ConcurrentHashMap<String, GuildDerbyGroup> cacheLeagueTop = new ConcurrentHashMap<>(); //group, ranking
    private static ConcurrentHashMap<String, GuildDerbyGroup> cacheGroup = new ConcurrentHashMap<>(); //group, ranking

    public synchronized static void start ()
    {
        if (isRunning)
            return;
        isRunning = true;

        if (MiscInfo.GUILD_ACTIVE())
        {
            load();
            int period = MiscInfo.GUILD_CACHE_PERIOD_SAVE();
            long delay = period - (Time.getUnixTime() % period) + period / 2; //load vào giữa chu kỳ
            ShareLoopGroup.scheduleWithFixedDelay(() -> load(), delay, period, TimeUnit.SECONDS, true);

            int PERIOD_SAVE = 10;
            ShareLoopGroup.scheduleWithFixedDelay(() -> save(), PERIOD_SAVE, PERIOD_SAVE, TimeUnit.SECONDS, true);
        }

        if (MiscInfo.DERBY_ACTIVE())
        {
            int period = 1000;
            long delay = period - (Time.getTimeMillis() % period);
            ShareLoopGroup.scheduleAtFixedRate(() -> updateDerbyTime(), delay, period, TimeUnit.MILLISECONDS, true);

            //load bảng cache league định kỳ
            loadLeagueTopCache();
            long nextHour = LocalDateTime.now().withMinute(0).withSecond(0).plusHours(1).toEpochSecond(Time.zone);
            long timeWait = nextHour - Time.getUnixTime();
            ShareLoopGroup.scheduleWithFixedDelay(() -> loadLeagueTopCache(), timeWait + MiscInfo.RANKING_UPDATE_DELAY() / 2, Time.SECOND_IN_HOUR, TimeUnit.SECONDS, true);
        }
    }

    public synchronized static void stop ()
    {
        if (!isRunning)
            return;

        isRunning = false;
    }

    private static synchronized void save ()
    {
        Redis redis = Database.ranking();
        try (Jedis j = redis.getResource())
        {
            InfoKeyGuild infoKey = InfoKeyGuild.DERBY_GROUP_RANKING;
            Map<String, Map<Integer, IncreasePoint>> mapLeague = new HashMap<>();

            for (Map.Entry<String, ConcurrentHashMap<Integer, IncreasePoint>> entry : updateGroupPoint.entrySet())
            {
                String idGroup = entry.getKey();
                String keyName = infoKey.keyName(idGroup);
                ConcurrentHashMap<Integer, IncreasePoint> group = entry.getValue();
                if (group.isEmpty())
                    continue;
                for (Iterator<IncreasePoint> it = group.values().iterator(); it.hasNext(); )
                {
                    IncreasePoint info = it.next();
                    it.remove();

                    j.zincrby(keyName, (double) info.point, Integer.toString(info.id));

                    mapLeague.computeIfAbsent(info.league, s -> new HashMap<>()).put(info.id, info);
                }
                redis.expire(keyName, infoKey.expire());
            }

            int week = Time.curWeek();
            for (Map.Entry<String, Map<Integer, IncreasePoint>> entry : mapLeague.entrySet())
            {
                String league = entry.getKey();
                String keyName = LeagueRanking.keyName(league, week);
                Map<Integer, IncreasePoint> mapGuild = entry.getValue();
                for (IncreasePoint info : mapGuild.values())
                    j.zincrby(keyName, (double) info.point, Integer.toString(info.id));

                redis.expire(keyName, LeagueRanking.expire());
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static synchronized void load ()
    {
        try
        {
            Map<Integer, Map<Integer, ConcurrentLinkedQueue<CacheGuildInfo>>> mapByType = new HashMap<>();
            CacheGuildKeyInfo info = CacheGuildKeyInfo.get();

            if (info != null)
            {
                int curTime = Time.getUnixTime();

                for (int i = 1; i <= info.numKey; i++)
                {
                    List<CacheGuildInfo> items = CacheGuildKeyData.get(i);
                    if (items == null || items.isEmpty())
                        continue;

                    for (CacheGuildInfo item : items)
                    {
                        if (item.getTimeExpire() > 0 && item.getTimeExpire() < curTime)
                            continue;

                        if (item.getNumMember() >= ConstInfo.getGuildData().getMemberLimit(item.getLevel()))
                            continue;

                        Map<Integer, ConcurrentLinkedQueue<CacheGuildInfo>> mapByNum = mapByType.get(item.getType());
                        if (mapByNum == null)
                        {
                            mapByNum = new TreeMap<>();
                            mapByType.put(item.getType(), mapByNum);
                        }

                        ConcurrentLinkedQueue<CacheGuildInfo> queueInfo = mapByNum.get(item.getNumMember());
                        if (queueInfo == null)
                        {
                            queueInfo = new ConcurrentLinkedQueue<>();
                            mapByNum.put(item.getNumMember(), queueInfo);
                        }

                        queueInfo.add(item);
                    }
                }
            }
            CacheGuildClient.mapSuggest = mapByType;
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static void updateDerbyTime ()
    {
        derbyTime = new GuildDerbyTime();
        nextDerbyTime = new GuildDerbyTime(derbyTime.getRewardTime() + 1);
    }

    public static void updateGuildInfo (GuildInfo info)
    {
        MsgUpdateGuildInfo msg = new MsgUpdateGuildInfo(new CacheGuildInfo(info));
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
    }

    public static void updateGuildLeague (int id, String rank)
    {
        MsgUpdateGuildLeague msg = new MsgUpdateGuildLeague(id, rank);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
    }

    public static void deleteGuildInfo (int guildId)
    {
    	MsgDeleteGuildInfo msg = new MsgDeleteGuildInfo(guildId);
        String raw = msg.encode();
        EnvConfig.udpAdmin.write(NewsBoardServer.address, raw);
    }
    
    public static Collection<CacheGuildInfo> getSuggestGuilds ()
    {
        HashSet<CacheGuildInfo> set = new HashSet<>();

        addSuggestGuilds(MiscDefine.GUILD_TYPE_OPEN, set);
        addSuggestGuilds(MiscDefine.GUILD_TYPE_REQUEST, set);
        addSuggestGuilds(MiscDefine.GUILD_TYPE_CLOSE, set);

        return set;
    }

    private static void addSuggestGuilds (int type, HashSet<CacheGuildInfo> set)
    {
        if (set.size() >= MiscInfo.GUILD_SUGGEST_SIZE())
            return;

        Map<Integer, ConcurrentLinkedQueue<CacheGuildInfo>> mapByNum = mapSuggest.get(type);
        if (mapByNum == null)
            return;

        for (int i = 0; i < 3; i++)
        {
            for (ConcurrentLinkedQueue<CacheGuildInfo> queue : mapByNum.values())
            {
                CacheGuildInfo guildInfo = queue.poll();
                if (guildInfo == null)
                    continue;
                
                if (!GuildManager.exists(guildInfo.getId()))
                {
                	deleteGuildInfo (guildInfo.getId());
                	continue;
                }
                
                set.add(guildInfo);
                queue.add(guildInfo);

                if (set.size() >= MiscInfo.GUILD_SUGGEST_SIZE())
                    return;
            }
        }
    }

    private static class IncreasePoint
    {
        private int    id;
        private int    point;
        private String league;

        private IncreasePoint (int id, String league)
        {
            this.id = id;
            this.league = league;
        }

        private synchronized void increase (int delta)
        {
            point += delta;
        }
    }

    public static int getNextDerbyTimeValue()
    {
        if (Time.getUnixTime() < derbyTime.getStartTime())
            return derbyTime.getStartTime();
        return nextDerbyTime.getStartTime();
    }

    public static void increaseDerbyPoint (final String idGroup, final int idGuild, final String league, final int increment)
    {
        Debug.info("CacheGuildClient", "IncreasePoint", idGroup, idGroup, increment);
        if (increment == 0)
            return;

        ConcurrentHashMap<Integer, IncreasePoint> group = updateGroupPoint.computeIfAbsent(idGroup, id -> new ConcurrentHashMap<>());
        IncreasePoint point = group.computeIfAbsent(idGuild, id -> new IncreasePoint(idGuild, league));
        point.increase(increment);
    }

    public static void loadLeagueTopCache ()
    {
        GuildDerbyData data = ConstInfo.getGuildDerbyData();
        for (String league : data.getLeagueOrder())
        {
        	GuildDerbyGroup group = LeagueTop.get(league);
            if (group != null)
                cacheLeagueTop.put(group.LEAGUE(), group);
        }
    }

    public static GuildDerbyGroup getLeagueTop (String league)
    {
    	GuildDerbyGroup group = cacheLeagueTop.get(league);
        if (group != null)
            return group;
        
        group = LeagueTop.get(league);
        if (group != null)
        	cacheLeagueTop.put(group.LEAGUE(), group);
        
        return group;
    }
    
    public static GuildDerbyGroup getDerbyGroup (String groupId)
    {
    	GuildDerbyGroup group = cacheGroup.get(groupId);
        if (group != null && !group.isExpire ())
            return group;

        group = DerbyGroup.get(groupId);
        if (group != null)
        	cacheGroup.put(groupId, group);
        
        return group;
    }
}