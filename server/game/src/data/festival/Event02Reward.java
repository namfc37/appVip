package data.festival;

import bitzero.util.common.business.Debug;
import util.Json;
import util.collection.MapItem;
import util.metric.MetricLog;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Event02Reward
{
    private int          id;
    private int          num;
    private List<Reward> items;

    public int ID ()
    {
        return id;
    }

    public void init ()
    {
        items = Collections.unmodifiableList(this.items);
    }

    public void test ()
    {
        ArrayList<String> ids = new ArrayList<String>();
        for (Reward r : items)
            ids.add(r.id);

        Debug.info("Event02Info", "num", num, items.size(), Json.toJson(ids));

        int testCount = 100000;
        MapItem totals = new MapItem();
        for (int i = 0; i < testCount; i++)
        {
            MapItem test = generate();
            if (num > 0 && num != test.size())
            {
                Debug.info("Event02Info", "wrong", num, MetricLog.toString(test));
                test = generate();
                System.exit(0);
            }

            totals.increase(test);
        }

        for (Reward r : items)
        {
            int itemTotal = totals.get(r.id);
            int count = itemTotal / r.quantity;
            double rate = 1.0 * count / testCount;

            Debug.info("Event02Info", r.id, r.quantity, r.rate, itemTotal, count, rate);
        }
    }

    public MapItem generate ()
    {
        MapItem rewards = new MapItem();

        if (num < 1)
        {
            for (Reward r : items)
                rewards.increase(r.id, r.quantity);
        }
        else
        {
            List<Reward> temp = new ArrayList<Reward>();
            ThreadLocalRandom random = ThreadLocalRandom.current();

            double total = 0;
            int remain = num;

            for (Reward r : items)
            {
                if (r.rate > 0)
                {
                    total += r.rate;
                    temp.add(r);
                }
                else
                {
                    remain -= 1;
                    rewards.increase(r.id, r.quantity);
                }
            }

            while (remain > 0 && temp.size() > 0)
            {
                List<Integer> removeIds = new ArrayList<Integer>();

                for (int i = 0; i < temp.size(); i++)
                {
                    Reward r = temp.get(i);
                    double rate = r.rate / total;
                    if (rate < random.nextDouble())
                        continue;

                    removeIds.add(i);
                }

                if (removeIds.isEmpty())
                    continue;

                try
                {
                    int removeId = removeIds.get(random.nextInt(0, removeIds.size()));

                    Reward r = temp.remove(removeId);
                    rewards.increase(r.id, r.quantity);
                    total -= r.rate;
                    remain -= 1;
                }
                catch (Exception e)
                {
                    Debug.info("error");
                }
            }
        }

        return rewards.toUnmodifiableMapItem();
    }

    private static class Reward
    {
        private String id;
        private int    quantity;
        private int    rate;

        private Reward ()
        {
        }
    }
}
