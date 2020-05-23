package service.newsboard;

import data.MiscInfo;
import data.UserLevelInfo;
import extension.EnvConfig;
import model.NewsBoardData;
import model.NewsBoardInfo;
import util.AtomicInteger;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

public class NewsBoardClient
{
    public static NewsBoardClient privateShop;
    public static NewsBoardClient airship;

    private static boolean isRunning;

    private final Type type;


    private TreeMap<Integer, Cache> treeCache;

    public synchronized static void start ()
    {
        if (isRunning)
            return;
        isRunning = true;

        privateShop = new NewsBoardClient(Type.PRIVATE_SHOP);
        airship = new NewsBoardClient(Type.AIRSHIP);
    }

    public synchronized static void stop ()
    {
        if (!isRunning)
            return;

        isRunning = false;
    }

    public NewsBoardClient (Type type)
    {
        this.type = type;
        load();

        int period = EnvConfig.getNewsBoard().getPeriodSave();
        long delay = period - (Time.getUnixTime() % period) + period / 2; //load vào giữa chu kỳ
        ShareLoopGroup.scheduleWithFixedDelay(() -> load(), delay, period, TimeUnit.SECONDS, true);
    }

    private synchronized void load ()
    {
        TreeMap<Integer, Cache> tree = new TreeMap<>();

        try
        {
            NewsBoardInfo info = NewsBoardInfo.get(type);

            if (info != null)
            {
                int level;
                Cache cache;
                int curTime = Time.getUnixTime();
                int timeFinish;

                for (int i = 1; i <= info.numKey; i++)
                {
                    List<NewsBoardItem> items = NewsBoardData.get(type, i);
                    if (items == null)
                        continue;

                    for (NewsBoardItem item : items)
                    {
                        if (type == Type.PRIVATE_SHOP)
                            timeFinish = item.timeAd + MiscInfo.PS_DURATION_AD();
                        else
                            timeFinish = item.timeAd;
                        if (timeFinish < curTime)
                            continue;

                        level = UserLevelInfo.getUnlockLevel(item.item);
                        cache = tree.get(level);
                        if (cache == null)
                        {
                            cache = new Cache();
                            tree.put(level, cache);
                        }

                        cache.items.add(item);
                    }
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }

        treeCache = tree;
    }

    private static class Cache
    {
        private AtomicInteger       pos   = new AtomicInteger();
        private List<NewsBoardItem> items = new ArrayList<>();

        private NewsBoardItem getItem ()
        {
            int i = pos.incrementAndGet();
            return items.get(i % items.size());
        }
    }

    public HashSet<NewsBoardItem> getItems (int userId, int userLevel)
    {
        HashSet<NewsBoardItem> result = new HashSet<>();
        if (treeCache == null)
            return result;
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int level;

        for (int i = MiscInfo.NB_NUM_ITEM() * 2; i > 0; i--)
        {
            level = random.nextInt(1, userLevel + 1);
            Map.Entry<Integer, Cache> cache = treeCache.floorEntry(level);
            if (cache == null)
                continue;

            NewsBoardItem item = cache.getValue().getItem();
            if (item == null || item.userId == userId)
                continue;

            result.add(item);

            if (result.size() >= MiscInfo.NB_NUM_ITEM())
                break;
        }

        return result;
    }
}
