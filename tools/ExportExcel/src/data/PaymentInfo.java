package data;

import java.util.*;

public class PaymentInfo
{
    public int     RATE_VND_TO_COIN;
    public int     RATE_SMS_PERCENT;
    public int     RATE_COIN_TO_GOLD;
    public int     RATE_LOCAL_TO_VND;
    public boolean USE_PRICE_CENT;

    public boolean            ACTIVE_IAP;
    public Collection<String> ACTIVE_SMS;
    public boolean            ACTIVE_CARD_ZING;
    public Collection<String> ACTIVE_CARD;
    public boolean            ACTIVE_ATM;
    public Collection<String> ACTIVE_WALLET;
    public Collection<String> ACTIVE_BANKING;
    public Collection<String> ACTIVE_CREDIT;

    public boolean              FIRST_CHARGE_ITEM_ACTIVE;
    public Map<String, Integer> FIRST_CHARGE_ITEM_IAP;
    public Map<String, Integer> FIRST_CHARGE_ITEM_SMS;
    public Map<String, Integer> FIRST_CHARGE_ITEM_ZING;
    public Map<String, Integer> FIRST_CHARGE_ITEM_CARD;
    public Map<String, Integer> FIRST_CHARGE_ITEM_ATM;
    public Map<String, Integer> FIRST_CHARGE_ITEM_WALLET;
    public Map<String, Integer> FIRST_CHARGE_ITEM_BANKING;
    public Map<String, Integer> FIRST_CHARGE_ITEM_CREDIT;
    public int                  TIME_CHECK_OFFER_EXPIRE;

    public int                      OFFER_NEWBIE_LEVEL;
    public TreeMap<Integer, String> OFFER_NEWBIE_OFFER;

    public int                      OFFER_SPECIAL_LEVEL;
    public int                      OFFER_SPECIAL_TOTAL_PURCHASE;
    public TreeMap<Integer, String> OFFER_SPECIAL_NO_PURCHASE;
    public TreeMap<Integer, String> OFFER_SPECIAL_LOW_PURCHASE;
    public TreeMap<Integer, String> OFFER_SPECIAL_HIGH_PURCHASE;
    public int                      OFFER_SPECIAL_RESET_MIN;
    public int                      OFFER_SPECIAL_RESET_MAX;


    public int                      OFFER_SUPER_LEVEL;
    public int                      OFFER_SUPER_PERIOD_DAY;
    public int                      OFFER_SUPER_PERIOD_PURCHASE;
    public TreeMap<Integer, String> OFFER_SUPER_NO_PURCHASE;
    public TreeMap<Integer, String> OFFER_SUPER_LOW_PURCHASE;
    public TreeMap<Integer, String> OFFER_SUPER_HIGH_PURCHASE;
    public int                      OFFER_SUPER_RESET_MIN;
    public int                      OFFER_SUPER_RESET_MAX;

    public int                      OFFER_RARE_PERIOD_DAY_MIN;
    public int                      OFFER_RARE_PERIOD_DAY_MAX;
    public int                      OFFER_RARE_NEWBIE_PERIOD_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_NEWBIE_NO_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_NEWBIE_LOW_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_NEWBIE_HIGH_PURCHASE;
    public int                      OFFER_RARE_NEWBIE_RESET_MIN;
    public int                      OFFER_RARE_NEWBIE_RESET_MAX;


    public int                      OFFER_RARE_SPECIAL_PERIOD_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SPECIAL_NO_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SPECIAL_LOW_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SPECIAL_HIGH_PURCHASE;
    public int                      OFFER_RARE_SPECIAL_RESET_MIN;
    public int                      OFFER_RARE_SPECIAL_RESET_MAX;



    public int                      OFFER_RARE_SUPER_PERIOD_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SUPER_NO_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SUPER_LOW_PURCHASE;
    public TreeMap<Integer, String> OFFER_RARE_SUPER_HIGH_PURCHASE;
    public int                      OFFER_RARE_SUPER_RESET_MIN;
    public int                      OFFER_RARE_SUPER_RESET_MAX;

    public int                      DISPLAY_TAB_IAP;
    public int                      DISPLAY_TAB_COIN2GOLD;
    public int                      DISPLAY_TAB_SMS;
    public int                      DISPLAY_TAB_CARD;
    public int                      DISPLAY_TAB_ATM;
    public int                      DISPLAY_TAB_WALLET;
    public int                      DISPLAY_TAB_BANKING;
    public int                      DISPLAY_TAB_CREDIT;
    public int                      DISPLAY_TAB_COUNT;
    public int                      DISPLAY_TAB_BANK;
    public int                      DISPLAY_TAB_OFFER;


    public LinkedHashMap<String, Item> MAP_ITEM = new LinkedHashMap<>();
    public List<Item>                  ITEMS    = new ArrayList<>();

    public LinkedHashMap<String, Offer> MAP_OFFER = new LinkedHashMap<>();
    public List<Offer>                  OFFERS    = new ArrayList<>();

    public RuleLocal RULE_LOCAL;

    public static class Item
    {
        public String             ID;
        public int                TYPE;
        public int                SUB_TYPE;
        public Collection<String> CHANNEL;
        public Collection<String> CHANNEL_PREPAID;
        public Collection<String> CHANNEL_POSTPAID;
        public String             NAME;
        public Integer            COIN;
        public int                QUANTITY;
        public int                BONUS_QUANTITY;
        public int                PRICE_VND;
        public int                PRICE_LOCAL;
        public int                FIRST_CHARGE_PERCENT;
        public int                PROMOTION_PERCENT;
        public int[][]            PROMOTION_DURATION;
        public int                NEXT_PAY_COUNTDOWN;
        public int                LIMIT_DAY;
        public boolean            IS_HOT;
        public String             PACK_DESCRIPTION;
    }

    public static class Offer
    {
        public String                   ID;
        public boolean                  CHECK_ACTIVE;
        public Integer                  PRICE_COIN;
        public Integer                  PRICE_VND;
        public Integer                  PRICE_LOCAL;
        public HashMap<String, Integer> REWARDS;
        public Integer                  COOLDOWN_MIN;
        public Integer                  COOLDOWN_MAX;
        public String                   COOLDOWN_ACTIVE;
        public Integer                  DURATION;
        public String                   DURATION_ACTIVE_PURCHASE;
        public String                   DURATION_ACTIVE_NO_PURCHASE;
        public Integer                  REPEAT_DAY;
        public String                   GFX;
    }

    public static class RuleLocal
    {
        public int                USER_LEVEL;
        public int                DAILY_PLAYING_TIME;
        public Collection<String> ALLOW_COUNTRY;
        public Collection<String> SKIP_PACKAGE_NAME;
        public Collection<String> SKIP_TYPE;
    }
}
