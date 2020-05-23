package data.festival;

import data.*;
import model.DropLimitItem;
import util.collection.MapItem;

import java.util.HashMap;
import java.util.TreeMap;
import java.util.concurrent.ThreadLocalRandom;

public class HarvestDropItemInfo
{
    private HashMap<String, TreeMap<Integer, HashMap<String, Rule>>> drop;

    public void init ()
    {
    }

    public boolean contains (String action)
    {
        if (drop == null) return false;
        return drop.containsKey(action);
    }

    public MapItem generate (String action, String option, MapItem received)
    {
        MapItem receive = new MapItem();

        ItemInfo itemInfo = ConstInfo.getItemInfo(option);

        int time = 0;
        if (itemInfo.TYPE() == ItemType.PLANT)
        {
            PlantInfo plantInfo = (PlantInfo) itemInfo;
            time = plantInfo.GROW_TIME();
        }
        else if (itemInfo.TYPE() == ItemType.PRODUCT || itemInfo.TYPE() == ItemType.PEARL)
        {
            ProductInfo productInfo = (ProductInfo) itemInfo;
            time = productInfo.PRODUCTION_TIME();
        }

        HashMap<String, Rule> rules = drop.get(action).floorEntry(time).getValue();

        for (String itemId : rules.keySet())
        {
            int quantity = 0;

            Rule rule = rules.get(itemId);

            if (rule == null)
                return receive;

            int itemReceived = received == null ? 0 : received.get(itemId);

            quantity = rule.generate(itemReceived);

            if (quantity > 0)
                receive.increase(itemId, quantity);
        }

        return receive;
    }

    public static class Rule
    {
        private float rate;
        private int   min;
        private int   max;
        private int   userDailyLimit;


        public int generate (int received)
        {
            if (userDailyLimit > 0 && userDailyLimit <= received)
                return 0;

            ThreadLocalRandom random = ThreadLocalRandom.current();
            if (rate < random.nextFloat())
                return 0;

            return Math.min(userDailyLimit - received, random.nextInt(min, max + 1));
        }
    }
}
