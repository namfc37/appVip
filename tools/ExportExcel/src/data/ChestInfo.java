package data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChestInfo extends ItemInfo
{
    public String                   PRICE_TYPE;
    public int[]                    PRICE_TURN;
    public int                      TIME_WAIT;
    public int[][]                  DURATION;
    public Map<Integer, List<Item>> GROUPS;
    public List<Rate>               RATES;
    public Integer                  DISPLAY_ORDER;

    public static class Item
    {
        public String id;
        public int    num;

        public Item (String id, int num)
        {
            this.id = id;
            this.num = num;
        }
    }

    public static class Rate
    {
        public List<Integer> group = new ArrayList<>();
        public List<Integer> rate  = new ArrayList<>();
    }
}