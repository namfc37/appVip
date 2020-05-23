package data;

import util.Time;
import util.collection.MapItem;

public class IBShopInfo
{
    String TAB;
    String NAME;
    String GFX;
    Item[] ITEMS;

    public static class Item
    {
        String  ITEM_NAME;
        int     ITEM_QUANTITY;
        int     UNLOCK_LEVEL;
        int     SALE_OFF_PERCENT;
        int     IS_NEW;
        int     LIMIT_DAY;
        String  PRICE_TYPE;
        int     PRICE_NUM;
        MapItem GIFT_WHEN_BUY;
        int[][] SALE_DURATION;
        String  USE_IN;

        public boolean isSaleOff ()
        {
            return Time.isInDuration(SALE_DURATION);
        }

        public boolean isSaleOff (int curTime)
        {
            return Time.isInDuration(SALE_DURATION, curTime);
        }

        public int getTimeOpen ()
        {
            return Time.getTimeOpenDuration(SALE_DURATION);
        }

        public int getTimeOpen (int curTime)
        {
            return Time.getTimeOpenDuration(SALE_DURATION, curTime);
        }

        public String ITEM_NAME ()
        {
            return ITEM_NAME;
        }

        public int ITEM_QUANTITY ()
        {
            return ITEM_QUANTITY;
        }

        public int UNLOCK_LEVEL ()
        {
            return UNLOCK_LEVEL;
        }

        public int SALE_OFF_PERCENT ()
        {
            return SALE_OFF_PERCENT;
        }

        public int LIMIT_DAY ()
        {
            return LIMIT_DAY;
        }

        public String PRICE_TYPE ()
        {
            return PRICE_TYPE;
        }

        public int PRICE_NUM ()
        {
            return PRICE_NUM;
        }

        public MapItem GIFT_WHEN_BUY ()
        {
            return GIFT_WHEN_BUY;
        }

        public String USE_IN ()
        {
            return USE_IN;
        }
    }

    public static String getId (String id, int num, String priceType)
    {
        return id + "_" + num + "_" + priceType;
    }
}
