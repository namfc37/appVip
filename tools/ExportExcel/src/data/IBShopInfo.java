package data;

import java.util.List;
import java.util.Map;

public class IBShopInfo
{
    public String     TAB;
    public String     NAME;
    public String     GFX;
    public List<Item> ITEMS;

    public static class Item
    {
        public String               ITEM_NAME;
        public int                  ITEM_QUANTITY;
        public int                  UNLOCK_LEVEL;
        public int                  SALE_OFF_PERCENT;
        public int                  IS_NEW;
        public int                  LIMIT_DAY;
        public String               PRICE_TYPE;
        public int                  PRICE_NUM;
        public Map<String, Integer> GIFT_WHEN_BUY;
        public int[][]              SALE_DURATION;
        public String               USE_IN;
    }
}
