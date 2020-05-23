package data;

import model.object.ConsumeEvent;
import util.Time;
import util.collection.MapItem;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class ConsumeEventInfo
{
    private Map<String, ConsumeEventTypeInfo> types;

    public ConsumeEventTypeInfo getTypeInfo (String key)
    {
        return types.get(key);
    }

    public void resetConsumeType (Map<String, ConsumeEvent.ConsumeType> map)
    {
        map.clear();
        for (String key : types.keySet())
        {
            ConsumeEvent.ConsumeType type = new ConsumeEvent.ConsumeType(key);
            type.generateSlots();
            map.put(key, type);
        }
    }

    public void init ()
    {
        for (ConsumeEventTypeInfo r : this.types.values())
            r.init();
    }

    public boolean isInDuration ()
    {
        int curTime = Time.getUnixTime();
        return (curTime >= MiscInfo.CONSUME_TIME_START() && curTime <= MiscInfo.CONSUME_TIME_END());
    }

    public ConsumeEventTypeInfo getConsumeEventTypeInfo (String id)
    {
        return types.get(id);
    }

    public List<MapItem> genSlots (String id, int consumed, ConsumeEvent.ConsumeType consumeType)
    {
        ConsumeEventTypeInfo consumeEventTypeInfo = types.get(id);

        //  System.out.println("Last key :"+ consumeEventTypeInfo.RATES.lastKey());

        Rate table = consumeEventTypeInfo.RATES.floorEntry(Math.max(consumed, consumeEventTypeInfo.RATES.firstKey())).getValue();
        int len = table.group.size();
        List<MapItem> r = new ArrayList<>(len);
        HashSet<MapItem> setItem = new HashSet<>();
        ThreadLocalRandom random = ThreadLocalRandom.current();

        MapItem item = null;
        int pos;
        int totalRate = 0;


        for (int i = 0; i < len; i++)
        {
            MapItem slot = new MapItem();
            r.add(slot);
            List<MapItem> items = consumeEventTypeInfo.GROUPS.get(table.group.get(i));
            pos = random.nextInt(items.size());
            for (int j = 0; j < items.size(); j++)
            {
                item = items.get((pos + j) % items.size());
                if (setItem.add(item))
                    break;
            }
            slot.increase(item);
            totalRate += table.rate.get(i);
        }

        int rate = random.nextInt(totalRate);
        int winSlot = -1;
        int winSlotType = -1;

        for (int t = 0, size = table.rate.size(); t < size; t++)
        {
            winSlot++;
            winSlotType = table.group.get(winSlot);
            if (table.rate.get(t) <= 0)
                continue;
            rate -= table.rate.get(t);
            if (rate <= 0)
                break;
        }
        consumeType.setWinSlotType(winSlotType);
        consumeType.setWinSlot(winSlot);

        return r;
    }

    public static class ConsumeEventTypeInfo
    {

        private int CONSUME_CONVERT;
        private int POINT_CONVERT;


        public int CONSUME_CONVERT ()
        {
            return CONSUME_CONVERT;
        }

        public int POINT_CONVERT ()
        {
            return POINT_CONVERT;
        }

        public TreeMap<Integer, List<MapItem>> GROUPS ()
        {
            return GROUPS;
        }

        public TreeMap<Integer, Rate> RATES ()
        {
            return RATES;
        }

        private TreeMap<Integer, List<MapItem>> GROUPS;
        private TreeMap<Integer, Rate>          RATES;

        public void init ()
        {

        }

    }

    public static class Item
    {
        private String id;
        private int    num;

        public Item (String id, int num)
        {
            this.id = id;
            this.num = num;
        }
    }

    public static class Rate
    {
        private List<Integer> group = new ArrayList<>();
        private List<Integer> rate  = new ArrayList<>();
    }
}