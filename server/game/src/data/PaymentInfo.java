package data;

import util.Common;
import util.Time;
import util.collection.MapItem;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class PaymentInfo
{
    final static Map<String, PaymentInfo> map = new HashMap<>();

    private int     RATE_VND_TO_COIN;
    private int     RATE_SMS_PERCENT;
    private int     RATE_COIN_TO_GOLD;
    private int     RATE_LOCAL_TO_VND;
    private boolean USE_PRICE_CENT;

    private boolean     ACTIVE_IAP;
    private Set<String> ACTIVE_SMS;
    private boolean     ACTIVE_CARD_ZING;
    private Set<String> ACTIVE_CARD;
    private boolean     ACTIVE_ATM;
    private Set<String> ACTIVE_WALLET;
    private Set<String> ACTIVE_BANKING;
    private Set<String> ACTIVE_CREDIT;

    private boolean FIRST_CHARGE_ITEM_ACTIVE;
    private MapItem FIRST_CHARGE_ITEM_IAP;
    private MapItem FIRST_CHARGE_ITEM_SMS;
    private MapItem FIRST_CHARGE_ITEM_ZING;
    private MapItem FIRST_CHARGE_ITEM_CARD;
    private MapItem FIRST_CHARGE_ITEM_ATM;
    private MapItem FIRST_CHARGE_ITEM_WALLET;
    private MapItem FIRST_CHARGE_ITEM_BANKING;
    private MapItem FIRST_CHARGE_ITEM_CREDIT;

    private int TIME_CHECK_OFFER_EXPIRE;

    private int                      OFFER_NEWBIE_LEVEL;
    private TreeMap<Integer, String> OFFER_NEWBIE_OFFER;

    private int                      OFFER_SPECIAL_LEVEL;
    private int                      OFFER_SPECIAL_TOTAL_PURCHASE;
    private TreeMap<Integer, String> OFFER_SPECIAL_NO_PURCHASE;
    private TreeMap<Integer, String> OFFER_SPECIAL_LOW_PURCHASE;
    private TreeMap<Integer, String> OFFER_SPECIAL_HIGH_PURCHASE;
    private int                      OFFER_SPECIAL_RESET_MIN;
    private int                      OFFER_SPECIAL_RESET_MAX;

    private int                      OFFER_SUPER_LEVEL;
    private int                      OFFER_SUPER_PERIOD_DAY;
    private int                      OFFER_SUPER_PERIOD_PURCHASE;
    private TreeMap<Integer, String> OFFER_SUPER_NO_PURCHASE;
    private TreeMap<Integer, String> OFFER_SUPER_LOW_PURCHASE;
    private TreeMap<Integer, String> OFFER_SUPER_HIGH_PURCHASE;
    private int                      OFFER_SUPER_RESET_MIN;
    private int                      OFFER_SUPER_RESET_MAX;

    private int                      OFFER_RARE_PERIOD_DAY_MIN;
    private int                      OFFER_RARE_PERIOD_DAY_MAX;
    private int                      OFFER_RARE_NEWBIE_PERIOD_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_NEWBIE_NO_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_NEWBIE_LOW_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_NEWBIE_HIGH_PURCHASE;
    private int                      OFFER_RARE_NEWBIE_RESET_MIN;
    private int                      OFFER_RARE_NEWBIE_RESET_MAX;


    private int                      OFFER_RARE_SPECIAL_PERIOD_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SPECIAL_NO_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SPECIAL_LOW_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SPECIAL_HIGH_PURCHASE;
    private int                      OFFER_RARE_SPECIAL_RESET_MIN;
    private int                      OFFER_RARE_SPECIAL_RESET_MAX;


    private int                      OFFER_RARE_SUPER_PERIOD_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SUPER_NO_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SUPER_LOW_PURCHASE;
    private TreeMap<Integer, String> OFFER_RARE_SUPER_HIGH_PURCHASE;
    private int                      OFFER_RARE_SUPER_RESET_MIN;
    private int                      OFFER_RARE_SUPER_RESET_MAX;


    private Map<String, Item>  MAP_ITEM;
    private Map<String, Offer> MAP_OFFER;
    private RuleLocal          RULE_LOCAL;

    public static class Item
    {
        private String      ID;
        private int         TYPE;
        private int         SUB_TYPE;
        private String      NAME;
        private Set<String> CHANNEL;
        private int         COIN;
        private int         QUANTITY;
        private int         BONUS_QUANTITY;
        private int         PRICE_VND;
        private int         PRICE_LOCAL;
        private int         FIRST_CHARGE_PERCENT;
        private int         PROMOTION_PERCENT;
        private int[][]     PROMOTION_DURATION;
        private int         NEXT_PAY_COUNTDOWN;
        private int         LIMIT_DAY;
        private boolean     IS_HOT;
        private String      PACK_DESCRIPTION;

        public int TYPE ()
        {
            return TYPE;
        }

        public int SUB_TYPE ()
        {
            return SUB_TYPE;
        }

        public int NEXT_PAY_COUNTDOWN ()
        {
            return NEXT_PAY_COUNTDOWN;
        }

        public int LIMIT_DAY ()
        {
            return LIMIT_DAY;
        }

        public int COIN ()
        {
            return COIN;
        }

        public boolean isPromotion (int time)
        {
            return Time.isInDuration(PROMOTION_DURATION, time);
        }

        public int FIRST_CHARGE_PERCENT ()
        {
            return FIRST_CHARGE_PERCENT;
        }

        public int PROMOTION_PERCENT ()
        {
            return PROMOTION_PERCENT;
        }

        public int QUANTITY ()
        {
            return QUANTITY;
        }

        public int BONUS_QUANTITY ()
        {
            return BONUS_QUANTITY;
        }

        public String ID ()
        {
            return ID;
        }

        public int PRICE_VND ()
        {
            return PRICE_VND;
        }

        public int PRICE_LOCAL ()
        {
            return PRICE_LOCAL;
        }

        public boolean hasChannel (String id)
        {
            return CHANNEL == null ? true : CHANNEL.contains(id);
        }
    }

    public static class Offer
    {
        private String  ID;
        private boolean CHECK_ACTIVE;
        private int     PRICE_COIN;
        private int     PRICE_VND;
        private MapItem REWARDS;
        private int     COOLDOWN_MIN;
        private int     COOLDOWN_MAX;
        private String  COOLDOWN_ACTIVE;
        private int     DURATION;
        private String  DURATION_ACTIVE_PURCHASE;
        private String  DURATION_ACTIVE_NO_PURCHASE;
        private int     REPEAT_DAY;

        public String ID ()
        {
            return ID;
        }

        public boolean CHECK_ACTIVE ()
        {
            return CHECK_ACTIVE;
        }

        public int PRICE_COIN ()
        {
            return PRICE_COIN;
        }

        public int PRICE_VND ()
        {
            return PRICE_VND;
        }

        public MapItem REWARDS ()
        {
            return REWARDS;
        }

        public int COOLDOWN_MIN ()
        {
            return COOLDOWN_MIN;
        }

        public int COOLDOWN_MAX ()
        {
            return COOLDOWN_MAX;
        }

        public String COOLDOWN_ACTIVE ()
        {
            return COOLDOWN_ACTIVE;
        }

        public int DURATION ()
        {
            return DURATION;
        }

        public String DURATION_ACTIVE_PURCHASE ()
        {
            return DURATION_ACTIVE_PURCHASE;
        }

        public String DURATION_ACTIVE_NO_PURCHASE ()
        {
            return DURATION_ACTIVE_NO_PURCHASE;
        }

        public int REPEAT_DAY ()
        {
            return REPEAT_DAY;
        }
    }

    public class RuleLocal
    {
        private int         USER_LEVEL;
        private int         DAILY_PLAYING_TIME;
        private Set<String> ALLOW_COUNTRY;
        private Set<String> SKIP_PACKAGE_NAME;
        private Set<String> SKIP_TYPE;
    }

    public int RATE_VND_TO_COIN ()
    {
        return RATE_VND_TO_COIN;
    }

    public static PaymentInfo get (String zone)
    {
        return map.get(zone);
    }

    public int RATE_SMS_PERCENT ()
    {
        return RATE_SMS_PERCENT;
    }

    public int RATE_COIN_TO_GOLD ()
    {
        return RATE_COIN_TO_GOLD;
    }

    public int RATE_LOCAL_TO_VND ()
    {
        return RATE_LOCAL_TO_VND;
    }

    public boolean USE_PRICE_CENT ()
    {
        return USE_PRICE_CENT;
    }

    public boolean ACTIVE_IAP ()
    {
        return ACTIVE_IAP;
    }

    public boolean ACTIVE_CARD_ZING ()
    {
        return ACTIVE_CARD_ZING;
    }

    public boolean ACTIVE_ATM ()
    {
        return ACTIVE_ATM;
    }

    public boolean FIRST_CHARGE_ITEM_ACTIVE ()
    {
        return FIRST_CHARGE_ITEM_ACTIVE;
    }

    public MapItem FIRST_CHARGE_ITEM_IAP ()
    {
        return FIRST_CHARGE_ITEM_IAP;
    }

    public MapItem FIRST_CHARGE_ITEM_SMS ()
    {
        return FIRST_CHARGE_ITEM_SMS;
    }

    public MapItem FIRST_CHARGE_ITEM_ZING ()
    {
        return FIRST_CHARGE_ITEM_ZING;
    }

    public MapItem FIRST_CHARGE_ITEM_CARD ()
    {
        return FIRST_CHARGE_ITEM_CARD;
    }

    public MapItem FIRST_CHARGE_ITEM_ATM ()
    {
        return FIRST_CHARGE_ITEM_ATM;
    }

    public MapItem FIRST_CHARGE_ITEM_WALLET ()
    {
        return FIRST_CHARGE_ITEM_WALLET;
    }

    public MapItem FIRST_CHARGE_ITEM_CREDIT ()
    {
        return FIRST_CHARGE_ITEM_CREDIT;
    }
    public int TIME_CHECK_OFFER_EXPIRE ()
    {
        return TIME_CHECK_OFFER_EXPIRE;
    }
    public MapItem FIRST_CHARGE_ITEM_BANKING ()
    {
        return FIRST_CHARGE_ITEM_BANKING;
    }

    public Item getItem (String id)
    {
        return MAP_ITEM.get(id);
    }

    public int OFFER_NEWBIE_LEVEL ()
    {
        return OFFER_NEWBIE_LEVEL;
    }

    public String OFFER_NEWBIE_OFFER_RANDOM ()
    {
        return Common.randomInTree(OFFER_NEWBIE_OFFER, 100);
    }

    public int OFFER_SPECIAL_LEVEL ()
    {
        return OFFER_SPECIAL_LEVEL;
    }

    public int OFFER_SPECIAL_TOTAL_PURCHASE ()
    {
        return OFFER_SPECIAL_TOTAL_PURCHASE;
    }

    public String OFFER_SPECIAL_NO_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SPECIAL_NO_PURCHASE, 100);
    }

    public String OFFER_SPECIAL_LOW_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SPECIAL_LOW_PURCHASE, 100);
    }

    public String OFFER_SPECIAL_HIGH_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SPECIAL_HIGH_PURCHASE, 100);
    }

    public int OFFER_SUPER_LEVEL ()
    {
        return OFFER_SUPER_LEVEL;
    }

    public int OFFER_SUPER_PERIOD_DAY ()
    {
        return OFFER_SUPER_PERIOD_DAY;
    }

    public int OFFER_SUPER_PERIOD_PURCHASE ()
    {
        return OFFER_SUPER_PERIOD_PURCHASE;
    }

    public String OFFER_SUPER_NO_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SUPER_NO_PURCHASE, 100);
    }

    public String OFFER_SUPER_LOW_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SUPER_LOW_PURCHASE, 100);
    }

    public String OFFER_SUPER_HIGH_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_SUPER_HIGH_PURCHASE, 100);
    }

    public int OFFER_SUPER_RESET_MIN ()
    {
        return OFFER_SUPER_RESET_MIN;
    }

    public int OFFER_SUPER_RESET_MAX ()
    {
        return OFFER_SUPER_RESET_MAX;
    }

    public int OFFER_SPECIAL_RESET_MIN ()
    {
        return OFFER_SPECIAL_RESET_MIN;
    }

    public int OFFER_SPECIAL_RESET_MAX ()
    {
        return OFFER_SPECIAL_RESET_MAX;
    }

    public Offer getOffer (String id)
    {
        return MAP_OFFER.get(id);
    }

    public int RULE_LOCAL_USER_LEVEL ()
    {
        return RULE_LOCAL.USER_LEVEL;
    }

    public int RULE_LOCAL_DAILY_PLAYING_TIME ()
    {
        return RULE_LOCAL.DAILY_PLAYING_TIME;
    }

    public boolean RULE_LOCAL_ALLOW_COUNTRY (String id)
    {
        return RULE_LOCAL.ALLOW_COUNTRY == null ? false : RULE_LOCAL.ALLOW_COUNTRY.contains(id);
    }

    public boolean RULE_LOCAL_SKIP_PACKAGE_NAME (String id)
    {
        return RULE_LOCAL.SKIP_PACKAGE_NAME == null ? false : RULE_LOCAL.SKIP_PACKAGE_NAME.contains(id);
    }

    public boolean RULE_LOCAL_SKIP_TYPE (String id)
    {
        return RULE_LOCAL.SKIP_TYPE == null ? false : RULE_LOCAL.SKIP_TYPE.contains(id);
    }

    public int OFFER_RARE_PERIOD_DAY_MIN ()
    {
        return OFFER_RARE_PERIOD_DAY_MIN;
    }

    public int OFFER_RARE_PERIOD_DAY_MAX ()
    {
        return OFFER_RARE_PERIOD_DAY_MAX;
    }

    public int OFFER_RARE_NEWBIE_PERIOD_PURCHASE ()
    {
        return OFFER_RARE_NEWBIE_PERIOD_PURCHASE;
    }

    public String OFFER_RARE_NEWBIE_NO_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_NEWBIE_NO_PURCHASE, 100);
    }

    public String OFFER_RARE_NEWBIE_LOW_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_NEWBIE_LOW_PURCHASE, 100);
    }

    public String OFFER_RARE_NEWBIE_HIGH_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_NEWBIE_HIGH_PURCHASE, 100);
    }

    public int OFFER_RARE_NEWBIE_RESET_MIN ()
    {
        return OFFER_RARE_NEWBIE_RESET_MIN;
    }

    public int OFFER_RARE_NEWBIE_RESET_MAX ()
    {
        return OFFER_RARE_NEWBIE_RESET_MAX;
    }

    public int OFFER_RARE_SPECIAL_PERIOD_PURCHASE ()
    {
        return OFFER_RARE_SPECIAL_PERIOD_PURCHASE;
    }

    public String OFFER_RARE_SPECIAL_NO_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SPECIAL_NO_PURCHASE, 100);
    }

    public String OFFER_RARE_SPECIAL_LOW_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SPECIAL_LOW_PURCHASE, 100);
    }

    public String OFFER_RARE_SPECIAL_HIGH_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SPECIAL_HIGH_PURCHASE, 100);
    }

    public int OFFER_RARE_SPECIAL_RESET_MIN ()
    {
        return OFFER_RARE_SPECIAL_RESET_MIN;
    }

    public int OFFER_RARE_SPECIAL_RESET_MAX ()
    {
        return OFFER_RARE_SPECIAL_RESET_MAX;
    }

    public int OFFER_RARE_SUPER_PERIOD_PURCHASE ()
    {
        return OFFER_RARE_SUPER_PERIOD_PURCHASE;
    }

    public String OFFER_RARE_SUPER_NO_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SUPER_NO_PURCHASE, 100);
    }

    public String OFFER_RARE_SUPER_LOW_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SUPER_LOW_PURCHASE, 100);
    }

    public String OFFER_RARE_SUPER_HIGH_PURCHASE_RANDOM ()
    {
        return Common.randomInTree(OFFER_RARE_SUPER_HIGH_PURCHASE, 100);
    }

    public int OFFER_RARE_SUPER_RESET_MIN ()
    {
        return OFFER_RARE_SUPER_RESET_MIN;
    }

    public int OFFER_RARE_SUPER_RESET_MAX ()
    {
        return OFFER_RARE_SUPER_RESET_MAX;
    }
}
