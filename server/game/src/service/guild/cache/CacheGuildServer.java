package service.guild.cache;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import data.ConstInfo;
import data.MiscDefine;
import data.MiscInfo;
import data.guild.GuildDerbyData;
import model.guild.GuildDerbyLockEnd;
import model.guild.GuildDerbyLockReward;
import model.guild.GuildDerbyLockStart;
import model.key.InfoKeyGuild;
import redis.clients.jedis.Tuple;
import service.GuildHandler;
import service.guild.GuildDerby;
import service.guild.GuildDerby.Member;
import service.guild.GuildInfo;
import service.guild.GuildManager;
import service.guild.GuildDerbyGroup;
import service.guild.GuildDerbyGroup.Item;
import util.Address;
import util.Database;
import util.Time;
import util.collection.MapItem;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;
import util.redis.Redis;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class CacheGuildServer
{
    private static boolean                     isRunning;

    private static ConcurrentHashMap<Integer, CacheGuildInfo> mapItem;
    private static CacheGuildKeyInfo                          info;
    private static GuildDerbyTime                             derbyTime;

    public static synchronized void start ()
    {
        if (isRunning)
            return;
        
        isRunning = true;
        MetricLog.info("CacheGuildServer", "start", Address.PRIVATE_HOST);

        if (!MiscInfo.GUILD_ACTIVE())
        	return;
        
        load();
        int period = MiscInfo.GUILD_CACHE_PERIOD_SAVE();
        long delay1 = period - (Time.getUnixTime() % period) + period; //save vào đầu chu kỳ
        ShareLoopGroup.scheduleWithFixedDelay(() -> save(), delay1, period, TimeUnit.SECONDS, true);

        if (!MiscInfo.DERBY_ACTIVE())
        	return;

        initTimeGuildDerby();
        buildLeagueTopCache();
        long timeMidnight = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).toEpochSecond(Time.zone);
        for (int i = 0, len = MiscInfo.RANKING_UPDATE_HOURS_SIZE(); i < len; i++)
        {
            int hour = MiscInfo.RANKING_UPDATE_HOURS(i);
            long delay2 = timeMidnight + hour * Time.SECOND_IN_HOUR - Time.getUnixTime();
            if (delay2 < 0)
                delay2 += Time.SECOND_IN_DAY;
         
            ShareLoopGroup.scheduleAtFixedRate(() -> buildLeagueTopCache(), delay2, Time.SECOND_IN_DAY, TimeUnit.SECONDS, true);
        }
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        MetricLog.info("CacheGuildServer", "stop", Address.PRIVATE_HOST);

        isRunning = false;
    }

    private static synchronized void load ()
    {
        try
        {
            mapItem = new ConcurrentHashMap<>();

            info = CacheGuildKeyInfo.get();
            if (info == null)
            {
                info = new CacheGuildKeyInfo();
            }
            else
            {
                for (int i = 1; i <= info.numKey; i++)
                {
                    List<CacheGuildInfo> items = CacheGuildKeyData.get(i);
                    if (items == null)
                        continue;
                    for (CacheGuildInfo item : items)
                        mapItem.put(item.getId(), item);
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static synchronized void save ()
    {
        Set<Integer> removeIds = new HashSet<>();

        try
        {
            info.numKey = 0;
            int curTime = Time.getUnixTime();
            CacheGuildInfo item;

            int maxSize = MiscInfo.GUILD_CACHE_KEY_SIZE();
            List<CacheGuildInfo> items = new ArrayList<>(maxSize);
            List<CacheGuildInfo> updateItems = new ArrayList<>();
            for (Map.Entry<Integer, CacheGuildInfo> entry : mapItem.entrySet())
            {
                item = entry.getValue();
                if (item.getTimeExpire() > 0 && item.getTimeExpire() < curTime)
                {
                    GuildInfo gInfo =  GuildManager.getGuildInfo(item.getId());
                    if (gInfo == null || gInfo.getTimeExpire() < curTime)
                    {
                        mapItem.remove(entry.getKey());
                        removeIds.add(entry.getKey());
                        continue;
                    }
                    item = new CacheGuildInfo(gInfo);
                    updateItems.add(item);
                }
                items.add(item);

                if (items.size() == maxSize)
                    saveData(items);
            }

            if (items.size() > 0)
                saveData(items);

            saveInfo();

            if (removeIds.size() > 0)
                GuildHandler.systemCheckAndDisband(removeIds);

            for (CacheGuildInfo uItem : updateItems)
                mapItem.put(uItem.getId(), uItem);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static void saveInfo ()
    {
        info.time = Time.getUnixTime();
        CacheGuildKeyInfo.set(info);
    }

    private static void saveData (List<CacheGuildInfo> items)
    {
        info.numKey++;
        CacheGuildKeyData.set(info.numKey, items);
        items.clear();
    }

    public static void updateGuildInfo (CacheGuildInfo newInfo)
    {
        if (mapItem == null || newInfo == null)
            return;

        CacheGuildInfo oldInfo = mapItem.put(newInfo.getId(), newInfo);
        if (oldInfo != null && oldInfo.getLeague() != null && newInfo.getLeague() == null)
            newInfo.setLeague(oldInfo.getLeague());
    }

    public static void updateGuildRank (int id, String rank)
    {
        if (mapItem == null)
            return;

        CacheGuildInfo info = mapItem.get(id);
        if (info == null)
            return;
        info.setLeague(rank);
    }

    public static void deleteGuildInfo (int guildId)
    {
        if (mapItem == null)
            return;

        mapItem.remove (guildId);
    }

    public static void initTimeGuildDerby ()
    {
        if (MiscInfo.DERBY_DURATION() <= 0)
            throw new RuntimeException("DERBY_DURATION <= 0");
        if (MiscInfo.DERBY_DURATION() >= 7 * Time.SECOND_IN_DAY)
            throw new RuntimeException("DERBY_DURATION >= 7 days");

        int curTime = Time.getUnixTime();
        derbyTime = new GuildDerbyTime();
        derbyTime.logInfo("curDerbyTime");

        GuildDerbyTime nextDerby = new GuildDerbyTime(derbyTime.getRewardTime() + 1);
        nextDerby.logInfo("nextDerbyTime");
        
        int delayToStart, delayToEnd, delayToReward;

        if (curTime < derbyTime.getStartTime())
        {
            MetricLog.info("CacheGuildServer", "before time start");
            delayToStart = derbyTime.delayToStart();
            delayToEnd = derbyTime.delayToEnd();
            delayToReward = derbyTime.delayToReward();
        }
        else if (curTime < derbyTime.getEndTime())
        {
            MetricLog.info("CacheGuildServer", "before time end");
            delayToStart = nextDerby.delayToStart();
            delayToEnd = derbyTime.delayToEnd();
            delayToReward = derbyTime.delayToReward();

            beginGuildDerby();
        }
        else if (curTime < derbyTime.getRewardTime())
        {
            MetricLog.info("CacheGuildServer", "before time reward");
            delayToStart = nextDerby.delayToStart();
            delayToEnd = nextDerby.delayToEnd();
            delayToReward = derbyTime.delayToReward();

            endGuildDerby();
        }
        else
        {
            MetricLog.info("CacheGuildServer", "next derby");
            delayToStart = nextDerby.delayToStart();
            delayToEnd = nextDerby.delayToEnd();
            delayToReward = nextDerby.delayToReward();

            rewardGuildDerby();
        }
        MetricLog.info("CacheGuildServer", "delay", delayToStart, delayToEnd, delayToReward);

        ShareLoopGroup.scheduleAtFixedRate(() -> beginGuildDerby(), delayToStart, GuildDerbyTime.DURATION, TimeUnit.SECONDS, true);
        ShareLoopGroup.scheduleAtFixedRate(() -> endGuildDerby(), delayToEnd, GuildDerbyTime.DURATION, TimeUnit.SECONDS, true);
        ShareLoopGroup.scheduleAtFixedRate(() -> rewardGuildDerby(), delayToReward, GuildDerbyTime.DURATION, TimeUnit.SECONDS, true);
    }

    private static void beginGuildDerby ()
    {
        ShareLoopGroup.submit(() -> {
            try
            {
                derbyTime = new GuildDerbyTime();
                boolean addLock = GuildDerbyLockStart.add(derbyTime.getStartTime());
                MetricLog.info("beginGuildDerby", "startTime", derbyTime.getStartTime(), "addLock", addLock);
                if (!addLock)
                    return;

                Map<String, List<CacheGuildInfo>> mapGuildByLeague = new HashMap<>();
                GuildDerbyData data = ConstInfo.getGuildDerbyData();
                for (String league : data.getLeagueOrder())
                    mapGuildByLeague.put(league, new ArrayList<>(512));
                String leagueDefault = data.getLeagueDefault().ID();

                for (CacheGuildInfo guild : mapItem.values())
                {
					MetricLog.info("beginGuildDerby", guild.getId(), guild.isDisband(), guild.getTimeExpire(), Time.getUnixTime(), guild.getNumMember(), MiscInfo.DERBY_JOIN_MEMBER_REQUIRE());
			
                	if (guild.isDisband()
                	||  guild.getTimeExpire() < Time.getUnixTime()
                	||  guild.getNumMember() < MiscInfo.DERBY_JOIN_MEMBER_REQUIRE()) 
                        continue;
                	
                    String league = guild.getLeague();
                    if (league == null || !mapGuildByLeague.containsKey(league))
                        league = leagueDefault;
                    List<CacheGuildInfo> group = mapGuildByLeague.get(league);
                    if (group == null)
                        continue;
                    group.add(guild);
                }

                for (List<CacheGuildInfo> group : mapGuildByLeague.values())
                    group.sort((o1, o2) -> Integer.compare(o2.getTimeUpdate(), o1.getTimeUpdate()));

                info.derbyStartTime = derbyTime.getStartTime();
                info.derbyNumGroup = new HashMap<>();
                for (Map.Entry<String, List<CacheGuildInfo>> e : mapGuildByLeague.entrySet())
                {
                    String league = e.getKey();
                    List<CacheGuildInfo> group = e.getValue();
                    int size = MiscInfo.DERBY_GROUP_SIZE();

                    int countGroup = 0;
                    String groupId = null;
                    if (group.size() > 0)
                    {
                        for (int i = 0; i < group.size(); i++)
                        {
                            if ((i % size) == 0)
                            {
                            	countGroup++;
                                groupId = DerbyGroup.getId(derbyTime.getStartTime(), league, countGroup);
                            }
                            
                            CacheGuildInfo info = group.get(i);
                            initGuildDerby(league, info.getId(), groupId, derbyTime.getStartTime(), derbyTime.getEndTime(), derbyTime.getRewardTime());
                        }
                    }
                    info.derbyNumGroup.put(league, countGroup);
                }
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        });
    }

    private static void initGuildDerby (String league, int idGuild, String idGroup, int startTime, int endTime, int rewardTime)
    {
        try
        {
			GuildInfo info = GuildInfo.load(idGuild);
			if (info == null)
				return;

			info.loadMembers();
			boolean result = false;
			GuildDerby derby = GuildManager.getGuildDerbyInfo(idGuild);
			if (derby == null)
			{
				derby = GuildDerby.create (info, league, idGroup, startTime, endTime, rewardTime);
				result = derby != null; 
			}
			else
				result = derby.reset (info, league, idGroup, startTime, endTime, rewardTime);
			
			MetricLog.info("initGuildDerby", info == null ? "null" : info.getId(), league, idGroup, startTime, endTime, rewardTime, result);
			
			if (result)
				derby.save();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static void endGuildDerby ()
    {
        ShareLoopGroup.submit(() -> {
            try
            {
                derbyTime = new GuildDerbyTime();
                boolean addLock = GuildDerbyLockEnd.add(derbyTime.getStartTime());
                MetricLog.info("endGuildDerby", "startTime", derbyTime.getStartTime(), "addLock", addLock);
                if (!addLock)
                    return;

                if (info.derbyStartTime < 1)
                	return;

                for (Map.Entry<String, Integer> entry : info.derbyNumGroup.entrySet())
                {
                    int num = entry.getValue();
                    if (num <= 0)
                        continue;
                    
                    String league = entry.getKey();
	                for (int i = 0; i < num; i++)
                    {
                        String idGroup = DerbyGroup.getId (derbyTime.getStartTime(), league, i + 1);
                        DerbyGroup.end (derbyTime.getStartTime(), league, idGroup);
                    }
                }
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        });
    }

    private static void rewardGuildDerby ()
    {
        ShareLoopGroup.submit(() -> {
            try
            {
                derbyTime = new GuildDerbyTime();
                boolean addLock = GuildDerbyLockReward.add(derbyTime.getStartTime());
                MetricLog.info("rewardGuildDerby", "startTime", derbyTime.getStartTime(), "addLock", addLock);
                if (!addLock)
                    return;

//              build current week board, all league with guild and final point
                Map<String, Map<Integer, Integer>> board = new HashMap<String, Map<Integer, Integer>> ();
                for (Map.Entry<String, Integer> entry : info.derbyNumGroup.entrySet())
                {
                    String league = entry.getKey();
                    int num = entry.getValue();
                    
	                for (int i = 0; i < num; i++)
	                {
	                	String idGroup = DerbyGroup.getId (derbyTime.getStartTime(), league, i + 1);
	                	Set<Integer> guildIds = DerbyGroup.getGuildIds (idGroup);
	                	
	                	for (int guildId : guildIds)
	                	{
	                		GuildDerby derby = GuildManager.getGuildDerbyInfo(guildId);
	                		board
	                			.computeIfAbsent(derby.getLeague(), (l) -> new TreeMap<Integer, Integer> ())
	                			.put(derby.getGuildId(), derby.getGlobalPoint());
	                	}
	                }
                }
                
//              first weeks, we don't have diamond, so check it empty and skip next step
                String topRank = ConstInfo.getGuildDerbyData().getLeagueLast().ID();
                Map<Integer, Integer> currentWeek = board.get(topRank);
                if (currentWeek == null || currentWeek.size() == 0)
                	return;

                int currentWeekId = Time.curWeek();
//              TODO: create current week cache
//              LeagueTop.set(topRank, group);
                
                Map<Integer, Map<Integer, Integer>> topList = new HashMap <Integer, Map<Integer, Integer>>();
                topList.put (currentWeekId, currentWeek);
             
//              collect top point 
                for (int weekId = currentWeekId - 1; weekId > currentWeekId - 4; weekId -= 1)
                {
                    GuildDerbyGroup group = LeagueTop.get(topRank, weekId);
                    Map<Integer, Integer> week = group.getPoints ();
                    topList.put (weekId, week);
                }
                
//              calculator
                GuildDerbyGroup finalGroup = GuildDerbyGroup.create(MiscInfo.DERBY_LEAGUE_GLOBAL (), MiscInfo.DERBY_LEAGUE_GLOBAL ());
                for (int guildId : currentWeek.keySet())
                {
                	int point = currentWeek.get(guildId);
                	int weeks = 1;
                    for (int weekId = currentWeekId - 1; weekId > currentWeekId - 4; weekId -= 1)
                    {
                        Map<Integer, Integer> week = topList.get (weekId);
                        if (!week.containsKey(guildId) || week.get (guildId) < 1)
                        	break;
                        
                        weeks += 1;
                        point += week.get (guildId);
                    }
                    
                    point = point / weeks;
                    
                    finalGroup.add(mapItem.get(guildId));
                    finalGroup.update(guildId, point);
                }
                
                LeagueTop.set(finalGroup.LEAGUE(), finalGroup);
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        });
    }

    public static int getStartTimeGuildDerby ()
    {
        if (derbyTime == null)
            return new GuildDerbyTime().getStartTime();

        return derbyTime.getStartTime();
    }

    public static void expireDerbyGroupPoint (String idGroup)
    {
        Redis r = Database.ranking();

        InfoKeyGuild infoKey = InfoKeyGuild.DERBY_GROUP_RANKING;
        String key = infoKey.keyName(idGroup);
        r.expire(key, infoKey.expire());
    }

    public static GuildDerbyGroup getLeagueTopRedis (String league)
    {
        return getLeagueTopRedis(league, MiscInfo.RANKING_BOARD_ITEM_NUM());
    }

    public static GuildDerbyGroup getLeagueTopRedis (String league, int num)
    {
    	GuildDerbyGroup group = LeagueTop.get(league);
    	if (group == null)
    		group = GuildDerbyGroup.create(league, league);

        Set<Tuple> dbTop = Database.ranking().zrevrangeWithScores(league, 0, num - 1);
        for (Tuple tuple : dbTop)
        {
            int guildId = Integer.parseInt(tuple.getElement());
            if (!group.containsGuild (guildId))
            {
            	GuildInfo info = GuildManager.getGuildInfo(guildId);
            	if (info == null)
            		continue;
            	
            	group.add (info);
            }
            
            int point = (int) tuple.getScore();
            group.update (guildId, point);
        }
        
        return group;
    }

    public static void buildLeagueTopCache ()
    {
        //Debug.info("CacheGuildServer", "buildLeagueTopCache", Address.PRIVATE_HOST, EnvConfig.group());

        GuildDerbyData data = ConstInfo.getGuildDerbyData();
        for (String league : data.getLeagueOrder())
        {
            byte result;
            try
            {
            	GuildDerbyGroup group = getLeagueTopRedis(league);
                LeagueTop.set(group.LEAGUE(), group);
                result = ErrorConst.SUCCESS;
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
                result = ErrorConst.EXCEPTION;
            }
            Debug.info("CacheGuildServer", "buildLeagueTopCache", result, league);
        }
    }

	public static int numCacheGuild()
	{
		return mapItem == null ? 0 : mapItem.size();
	}

	private static void reloadMissingInfo ()
    {
        int numRegister = GuildManager.numRegister();
        if (numRegister <= 0)
            return;

        int curTime = Time.getUnixTime();
        int idGuild, numMissing = 0;
        for (int i = 0; i < numRegister; i++)
        {
            idGuild = GuildManager.countToId(i);
            if (mapItem.contains(idGuild))
                continue;
            GuildInfo gInfo =  GuildManager.getGuildInfo(idGuild);
            if (gInfo == null || gInfo.getTimeExpire() < curTime)
                continue;
            mapItem.put(idGuild, new CacheGuildInfo(gInfo));
            MetricLog.info("reloadMissingInfo", "reload", idGuild);
        }

        MetricLog.info("reloadMissingInfo", "result", "numRegister", numRegister, "numCache", mapItem.size(), "numMissing", numMissing);
    }
}
