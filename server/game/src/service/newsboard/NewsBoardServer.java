package service.newsboard;

import bitzero.util.common.business.Debug;
import data.MiscInfo;
import extension.EnvConfig;
import model.NewsBoardData;
import model.NewsBoardInfo;
import org.apache.log4j.PropertyConfigurator;
import service.guild.cache.CacheGuildServer;
import util.Address;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.TimeUnit;

public class NewsBoardServer
{
    public static NewsBoardServer   privateShop;
    public static NewsBoardServer   airship;
    public static InetSocketAddress address;

    private static boolean isRunning;

    private final Type                                       type;
    private final ConcurrentSkipListMap<Long, NewsBoardItem> mapItem = new ConcurrentSkipListMap<>();

    private NewsBoardInfo info;

    public NewsBoardServer (Type type)
    {
        this.type = type;
        load();
        int period = EnvConfig.getNewsBoard().getPeriodSave();
        long delay = period - (Time.getUnixTime() % period) + period; //save vào đầu chu kỳ
        ShareLoopGroup.scheduleWithFixedDelay(() -> save(), delay, period, TimeUnit.SECONDS, true);
    }

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            EnvConfig.start();
            addShutdownHook();

            if (EnvConfig.service() != EnvConfig.Service.NEWSBOARD)
                throw new RuntimeException("Can not run NewsBoardServer.main() when service is " + EnvConfig.service());

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
        if (EnvConfig.environment() != EnvConfig.Environment.LOCAL && !Address.PRIVATE_HOST.equals(EnvConfig.getNewsBoard().getHost()))
            throw new UnsupportedOperationException("NewsBoardServer start in wrong server");
        isRunning = true;

        MetricLog.info("NewsBoardServer", "start", Address.PRIVATE_HOST);
        privateShop = new NewsBoardServer(Type.PRIVATE_SHOP);
        airship = new NewsBoardServer(Type.AIRSHIP);
        CacheGuildServer.start();
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        EnvConfig.markStopping();
        MetricLog.info("NewsBoardServer", "stop", Address.PRIVATE_HOST);

        if (privateShop != null)
            privateShop.save();

        if (airship != null)
            airship.save();

        CacheGuildServer.stop();

        isRunning = false;
    }

    private synchronized void load ()
    {
        info = NewsBoardInfo.get(type);
        if (info == null)
        {
            info = new NewsBoardInfo();
        }
        else
        {
            for (int i = 1; i <= info.numKey; i++)
            {
                List<NewsBoardItem> items = NewsBoardData.get(type, i);
                if (items == null)
                    continue;
                for (NewsBoardItem item : items)
                    mapItem.put(item.getUid(), item);
            }
        }

//        Debug.trace("NewsBoardServer", "LOAD", type, Json.toJson(info));
    }

    private synchronized void save ()
    {
        try
        {
            info.numKey = 0;
            int curTime = Time.getUnixTime();
            int timeFinish;
            NewsBoardItem item;

            List<NewsBoardItem> items = new ArrayList<>(EnvConfig.getNewsBoard().getItemPerKey());
            for (Map.Entry<Long, NewsBoardItem> entry : mapItem.entrySet())
            {
                item = entry.getValue();
                if (type == Type.PRIVATE_SHOP)
                    timeFinish = item.timeAd + MiscInfo.PS_DURATION_AD();
                else
                    timeFinish = item.timeAd;
                if (timeFinish < curTime)
                {
                    mapItem.remove(entry.getKey());
                    continue;
                }
                items.add(item);

                if (items.size() == EnvConfig.getNewsBoard().getItemPerKey())
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

//        Debug.trace("NewsBoardServer", "SAVE", type, Json.toJson(info));
    }

    private void saveInfo ()
    {
        info.time = Time.getUnixTime();
        NewsBoardInfo.set(type, info);
    }

    private void saveData (List<NewsBoardItem> items)
    {
        info.numKey++;
        NewsBoardData.set(type, info.numKey, items);
        items.clear();
    }

    public void add (NewsBoardItem item)
    {
        Debug.info("add", type, item.userId, item.idSlot);
        mapItem.put(item.getUid(), item);
    }

    public void delete (int userId, int uidSlot)
    {
        Debug.info("delete", type, userId, uidSlot);
        mapItem.remove(getUid(userId, uidSlot));
    }

    public static long getUid (int userId, int uidSlot)
    {
        return ((long) userId << 32) | uidSlot;
    }

    public static int numItemAirship ()
    {
        return airship == null ? -1 : airship.mapItem.size();
    }

    public static int numItemPrivateShop ()
    {
        return privateShop == null ? -1 : privateShop.mapItem.size();
    }

    public int size ()
    {
        return mapItem.size();
    }
}
