package service.friend;

import bitzero.util.common.business.Debug;
import data.MiscInfo;
import data.UserLevelInfo;
import extension.EnvConfig;
import model.FriendList;
import org.apache.log4j.PropertyConfigurator;
import util.Address;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

public class FriendServer
{
    public static InetSocketAddress address;

    private static boolean isRunning;

    private static ConcurrentHashMap<Integer, FriendInfo> mapId;
    private static CacheSuggest[]                         suggests;

    private static CacheInfo info;

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            EnvConfig.start();
            addShutdownHook();

            if (EnvConfig.service() != EnvConfig.Service.FRIEND)
                throw new RuntimeException("Can not run FriendServer.main() when service is " + EnvConfig.service());

            start();

            EnvConfig.markRunning();
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }
    }

    private static void addShutdownHook ()
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try
            {
                stop();
                EnvConfig.stop();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }));
    }

    public static synchronized void start ()
    {
        if (isRunning)
            return;
        if (EnvConfig.environment() != EnvConfig.Environment.LOCAL && !Address.PRIVATE_HOST.equals(EnvConfig.getFriend().getHost()))
            throw new UnsupportedOperationException("FriendServer start in wrong server");
        isRunning = true;

        MetricLog.info("FriendServer", "start", Address.PRIVATE_HOST);

        load();
        ShareLoopGroup.scheduleWithFixedDelay(() -> save(),
                                              EnvConfig.getFriend().getPeriodSave(),
                                              EnvConfig.getFriend().getPeriodSave(),
                                              TimeUnit.SECONDS, true);
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        EnvConfig.markStopping();
        MetricLog.info("FriendServer", "stop", Address.PRIVATE_HOST);

        save();

        isRunning = false;
    }

    private static synchronized void load ()
    {
        int curTime = Time.getUnixTime();
        int minTime = curTime - MiscInfo.FRIEND_CACHE_TIME();

        mapId = new ConcurrentHashMap<>();
        suggests = new CacheSuggest[UserLevelInfo.maxLevel()];
        for (int i = 0; i < suggests.length; i++)
            suggests[i] = new CacheSuggest(i);

        info = CacheInfo.get();
        if (info == null)
        {
            info = new CacheInfo();
        }
        else
        {
            for (int i = 1; i <= info.numKey; i++)
            {
                List<FriendInfo> items = CacheData.get(i);
                if (items == null)
                    continue;
                for (FriendInfo item : items)
                {
                    if (item.getTime() > minTime)
                    {
                        mapId.put(item.getId(), item);
                        suggests[item.getLevel()].add(item);
                    }
                }
            }
        }

//        Debug.trace("FriendServer", "LOAD", type, Json.toJson(info));
    }

    private static synchronized void save ()
    {
        try
        {
            info.numKey = 0;
            int curTime = Time.getUnixTime();
            int minTime = curTime - MiscInfo.FRIEND_CACHE_TIME();
            FriendInfo item;

            List<FriendInfo> items = new ArrayList<>(EnvConfig.getFriend().getItemPerKey());
            for (Map.Entry<Integer, FriendInfo> entry : mapId.entrySet())
            {
                item = entry.getValue();
                if (item.getTime() <= minTime)
                {
                    mapId.remove(entry.getKey());
                    continue;
                }
                item.update(curTime);
                items.add(item);

                if (items.size() == EnvConfig.getFriend().getItemPerKey())
                    saveData(items);
            }

            if (items.size() > 0)
                saveData(items);

            saveInfo();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }

//        Debug.trace("FriendServer", "SAVE", type, Json.toJson(info));
    }

    private static void saveInfo ()
    {
        info.time = Time.getUnixTime();
        CacheInfo.set(info);
    }

    private static void saveData (List<FriendInfo> items)
    {
        info.numKey++;
        CacheData.set(info.numKey, items);
        items.clear();
    }

    public static void userUpdate (FriendInfo fInfo)
    {
        if (fInfo.getLevel() >= MiscInfo.FRIEND_CACHE_LEVEL())
        {
            FriendInfo curInfo = mapId.putIfAbsent(fInfo.getId(), fInfo);
            if (curInfo != null)
                curInfo.mergeFrom(fInfo);
        }
    }

    public static void userLogin (String bucket, FriendInfo fInfo)
    {
        //Debug.info("userLogin", fInfo.getId(), bucket, Json.toJson(fInfo));
        //logSuggestSize();

        if (fInfo.getLevel() >= MiscInfo.FRIEND_CACHE_LEVEL())
        {
            FriendInfo curInfo = mapId.putIfAbsent(fInfo.getId(), fInfo);
            if (curInfo == null)
            {
                suggests[fInfo.getLevel()].add(fInfo);
            }
            else
            {
                if (curInfo.getLevel() != fInfo.getLevel())
                    suggests[fInfo.getLevel()].add(curInfo);
                curInfo.mergeFrom(fInfo);
            }
        }

        FriendList f = null;
        if (MiscInfo.FRIEND_ACTIVE())
            f = FriendList.get(bucket, fInfo.getId());

        if (f == null)
            f = FriendList.create(fInfo.getId());
        else
            f.updateInfo();

        //add new suggest
        if (f.refreshSuggest())
        {
            //Debug.info("refreshSuggest", fInfo.getId());
            ThreadLocalRandom r = ThreadLocalRandom.current();
            int level = Math.max(fInfo.getLevel(), MiscInfo.FRIEND_CACHE_LEVEL());
            for (int i = MiscInfo.FRIEND_SUGGEST_NUM() * 3; i >= 0; i--)
            {
                if (r.nextBoolean())
                    addSuggest(f, level);
                else
                    addSuggest(f, level + r.nextInt(MiscInfo.FRIEND_SUGGEST_MIN_LEVEL(), MiscInfo.FRIEND_SUGGEST_MAX_LEVEL() + 1));

                if (f.numSuggest() >= MiscInfo.FRIEND_SUGGEST_NUM())
                    break;
            }
            if (f.numSuggest() == 0)
                f.setTimeSuggest(Time.getUnixTime() + MiscInfo.FRIEND_SUGGEST_TIME_RETRY());
        }

        FriendList.set(bucket, fInfo.getId(), f);
    }

    private static void addSuggest (FriendList f, int level)
    {
        //Debug.info("addSuggest", "level", level);
        f.addSuggest(suggests[level].next());
    }

    public static FriendInfo get (int id)
    {
        return mapId.get(id);
    }

    public static int numCache ()
    {
        return mapId == null ? 0 : mapId.size();
    }

    public static void logSuggestSize ()
    {
        for (int level = 0; level < suggests.length; level++)
        {
            Debug.info("num suggest in level", level, suggests[level].size());
        }
    }
}
