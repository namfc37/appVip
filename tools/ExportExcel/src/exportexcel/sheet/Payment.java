package exportexcel.sheet;

import data.PaymentInfo;
import exportexcel.ExportExcel;
import exportexcel.Log;
import exportexcel.Util;

import java.util.*;

public class Payment extends ParseWorkbook
{
    public static HashMap<String, PaymentInfo> mapInfo = new HashMap<>();

    private final String      country;
    private final PaymentInfo info = new PaymentInfo();

    public Payment (String inputName, String country) throws Exception
    {
        super(inputName);
        this.country = country.toUpperCase();
        mapInfo.put(this.country, info);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("Info"));
        Define.parseMiscDefine(parseSheetRow("MiscDefine"));

        parseInfo();
        parse("TAB_COIN");
        parse("TAB_GOLD");
        parse("TAB_OFFER");
        parseOfferConfig();
        parseDisplayOrder();
        parseOfferInfo();
        parseRuleLocal();

        if (ExportExcel.isServer)
        {
            info.ITEMS = null;
            info.OFFERS = null;
        }
        else
        {
            info.MAP_ITEM = null;
            info.MAP_OFFER = null;
        }

        addConstInfo(info, null);
    }

    private void parseRuleLocal ()
    {
        if (!ExportExcel.isServer)
            return;
        ParseSheetCol sc = parseSheetCol("RuleLocal");
        info.RULE_LOCAL = new PaymentInfo.RuleLocal();
        info.RULE_LOCAL.USER_LEVEL = sc.getInt("USER_LEVEL");
        info.RULE_LOCAL.DAILY_PLAYING_TIME = sc.getInt("DAILY_PLAYING_TIME");
        info.RULE_LOCAL.ALLOW_COUNTRY = sc.getCollectionString("ALLOW_COUNTRY");
        info.RULE_LOCAL.SKIP_PACKAGE_NAME = sc.getCollectionString("SKIP_PACKAGE_NAME");
        info.RULE_LOCAL.SKIP_TYPE = sc.getCollectionString("SKIP_TYPE");
    }

    private void parseInfo ()
    {
        ParseSheetCol sc = parseSheetCol("Info");
        info.RATE_VND_TO_COIN = sc.getInt("RATE_VND_TO_COIN");
        info.RATE_SMS_PERCENT = sc.getInt("RATE_SMS_PERCENT");
        info.RATE_COIN_TO_GOLD = sc.getInt("RATE_COIN_TO_GOLD");
        info.RATE_LOCAL_TO_VND = sc.getInt("RATE_LOCAL_TO_VND");
        info.USE_PRICE_CENT = sc.getBoolean("USE_PRICE_CENT");

        info.ACTIVE_IAP = sc.getBoolean("ACTIVE_IAP");
        info.ACTIVE_CARD_ZING = sc.getBoolean("ACTIVE_CARD_ZING");
        info.ACTIVE_CARD = getOperators("CARD", sc.getCollectionString("ACTIVE_CARD"));
        info.ACTIVE_ATM = sc.getBoolean("ACTIVE_ATM");
        info.ACTIVE_SMS = getOperators("SMS", sc.getCollectionString("ACTIVE_SMS"));
        info.ACTIVE_WALLET = getOperators("WALLET", sc.getCollectionString("ACTIVE_WALLET"));
        info.ACTIVE_BANKING = getOperators("BANKING", sc.getCollectionString("ACTIVE_BANKING"));
        info.ACTIVE_CREDIT = getOperators("CREDIT", sc.getCollectionString("ACTIVE_CREDIT"));

        info.FIRST_CHARGE_ITEM_ACTIVE = sc.getBoolean("FIRST_CHARGE_ITEM_ACTIVE");
        info.FIRST_CHARGE_ITEM_IAP = sc.getMapItemNum("FIRST_CHARGE_ITEM_IAP");
        info.FIRST_CHARGE_ITEM_SMS = sc.getMapItemNum("FIRST_CHARGE_ITEM_SMS");
        info.FIRST_CHARGE_ITEM_ZING = sc.getMapItemNum("FIRST_CHARGE_ITEM_ZING");
        info.FIRST_CHARGE_ITEM_CARD = sc.getMapItemNum("FIRST_CHARGE_ITEM_CARD");
        info.FIRST_CHARGE_ITEM_ATM = sc.getMapItemNum("FIRST_CHARGE_ITEM_ATM");
        info.FIRST_CHARGE_ITEM_WALLET = sc.getMapItemNum("FIRST_CHARGE_ITEM_WALLET");
        info.FIRST_CHARGE_ITEM_BANKING = sc.getMapItemNum("FIRST_CHARGE_ITEM_BANKING");
        info.FIRST_CHARGE_ITEM_CREDIT = sc.getMapItemNum("FIRST_CHARGE_ITEM_CREDIT");
        info.TIME_CHECK_OFFER_EXPIRE = sc.getInt("TIME_CHECK_OFFER_EXPIRE");
    }

    private void parseOfferConfig ()
    {
        ParseSheetCol sc = parseSheetCol("OfferConfig");
        info.OFFER_NEWBIE_LEVEL = sc.getInt("OFFER_NEWBIE_LEVEL");
        info.OFFER_NEWBIE_OFFER = sc.getMapRate("OFFER_NEWBIE_OFFER");

        info.OFFER_SPECIAL_LEVEL = sc.getInt("OFFER_SPECIAL_LEVEL");
        info.OFFER_SPECIAL_TOTAL_PURCHASE = sc.getInt("OFFER_SPECIAL_TOTAL_PURCHASE");
        info.OFFER_SPECIAL_NO_PURCHASE = sc.getMapRate("OFFER_SPECIAL_NO_PURCHASE");
        info.OFFER_SPECIAL_LOW_PURCHASE = sc.getMapRate("OFFER_SPECIAL_LOW_PURCHASE");
        info.OFFER_SPECIAL_HIGH_PURCHASE = sc.getMapRate("OFFER_SPECIAL_HIGH_PURCHASE");
        info.OFFER_SPECIAL_RESET_MIN = sc.getInt("OFFER_SPECIAL_RESET_MIN");
        info.OFFER_SPECIAL_RESET_MAX = sc.getInt("OFFER_SPECIAL_RESET_MAX");

        info.OFFER_SUPER_LEVEL = sc.getInt("OFFER_SUPER_LEVEL");
        info.OFFER_SUPER_PERIOD_DAY = sc.getInt("OFFER_SUPER_PERIOD_DAY");
        info.OFFER_SUPER_PERIOD_PURCHASE = sc.getInt("OFFER_SUPER_PERIOD_PURCHASE");
        info.OFFER_SUPER_NO_PURCHASE = sc.getMapRate("OFFER_SUPER_NO_PURCHASE");
        info.OFFER_SUPER_LOW_PURCHASE = sc.getMapRate("OFFER_SUPER_LOW_PURCHASE");
        info.OFFER_SUPER_HIGH_PURCHASE = sc.getMapRate("OFFER_SUPER_HIGH_PURCHASE");
        info.OFFER_SUPER_RESET_MIN = sc.getInt("OFFER_SUPER_RESET_MIN");
        info.OFFER_SUPER_RESET_MAX = sc.getInt("OFFER_SUPER_RESET_MAX");

        info.OFFER_RARE_PERIOD_DAY_MIN = sc.getInt("OFFER_RARE_PERIOD_DAY_MIN");
        info.OFFER_RARE_PERIOD_DAY_MAX = sc.getInt("OFFER_RARE_PERIOD_DAY_MAX");

        info.OFFER_RARE_NEWBIE_PERIOD_PURCHASE = sc.getInt("OFFER_RARE_NEWBIE_PERIOD_PURCHASE");
        info.OFFER_RARE_NEWBIE_NO_PURCHASE = sc.getMapRate("OFFER_RARE_NEWBIE_NO_PURCHASE");
        info.OFFER_RARE_NEWBIE_LOW_PURCHASE = sc.getMapRate("OFFER_RARE_NEWBIE_LOW_PURCHASE");
        info.OFFER_RARE_NEWBIE_HIGH_PURCHASE = sc.getMapRate("OFFER_RARE_NEWBIE_HIGH_PURCHASE");
        info.OFFER_RARE_NEWBIE_RESET_MIN = sc.getInt("OFFER_RARE_NEWBIE_RESET_MIN");
        info.OFFER_RARE_NEWBIE_RESET_MAX = sc.getInt("OFFER_RARE_NEWBIE_RESET_MAX");


        info.OFFER_RARE_SPECIAL_PERIOD_PURCHASE = sc.getInt("OFFER_RARE_SPECIAL_PERIOD_PURCHASE");
        info.OFFER_RARE_SPECIAL_NO_PURCHASE = sc.getMapRate("OFFER_RARE_SPECIAL_NO_PURCHASE");
        info.OFFER_RARE_SPECIAL_LOW_PURCHASE = sc.getMapRate("OFFER_RARE_SPECIAL_LOW_PURCHASE");
        info.OFFER_RARE_SPECIAL_HIGH_PURCHASE = sc.getMapRate("OFFER_RARE_SPECIAL_HIGH_PURCHASE");
        info.OFFER_RARE_SPECIAL_RESET_MIN = sc.getInt("OFFER_RARE_SPECIAL_RESET_MIN");
        info.OFFER_RARE_SPECIAL_RESET_MAX = sc.getInt("OFFER_RARE_SPECIAL_RESET_MAX");


        info.OFFER_RARE_SUPER_PERIOD_PURCHASE = sc.getInt("OFFER_RARE_SUPER_PERIOD_PURCHASE");
        info.OFFER_RARE_SUPER_NO_PURCHASE = sc.getMapRate("OFFER_RARE_SUPER_NO_PURCHASE");
        info.OFFER_RARE_SUPER_LOW_PURCHASE = sc.getMapRate("OFFER_RARE_SUPER_LOW_PURCHASE");
        info.OFFER_RARE_SUPER_HIGH_PURCHASE = sc.getMapRate("OFFER_RARE_SUPER_HIGH_PURCHASE");
        info.OFFER_RARE_SUPER_RESET_MIN = sc.getInt("OFFER_RARE_SUPER_RESET_MIN");
        info.OFFER_RARE_SUPER_RESET_MAX = sc.getInt("OFFER_RARE_SUPER_RESET_MAX");
    }

    private void parseOfferInfo ()
    {
        ParseSheetRow ps = parseSheetRow("OfferInfo");

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            PaymentInfo.Offer offer = new PaymentInfo.Offer();
            offer.ID = ps.getString(row, "ID");
            Define.addDefineString(offer.ID, offer.ID, null);

            offer.CHECK_ACTIVE = ps.getBoolean(row, "CHECK_ACTIVE");

            info.MAP_OFFER.put(offer.ID, offer);
            info.OFFERS.add(offer);

            offer.PRICE_VND = ps.getInt(row, "PRICE_VND");
            offer.PRICE_COIN = offer.PRICE_VND / info.RATE_VND_TO_COIN;
            offer.PRICE_LOCAL = ps.getInt(row, "PRICE_LOCAL");
            offer.REWARDS = ps.getMapItemNum(row, "REWARDS");
            offer.GFX = ps.getString(row, "GFX");
            offer.REPEAT_DAY = ps.getInt(row, "REPEAT_DAY");

            if (ExportExcel.isServer)
            {
                offer.COOLDOWN_MIN = ps.getInt(row, "COOLDOWN_MIN");
                offer.COOLDOWN_MAX = ps.getInt(row, "COOLDOWN_MAX");
                offer.COOLDOWN_ACTIVE = ps.getString(row, "COOLDOWN_ACTIVE");
                offer.DURATION = ps.getInt(row, "DURATION");
                offer.DURATION_ACTIVE_PURCHASE = ps.getString(row, "DURATION_ACTIVE_PURCHASE");
                offer.DURATION_ACTIVE_NO_PURCHASE = ps.getString(row, "DURATION_ACTIVE_NO_PURCHASE");
            }
        }

        String id;
        for (PaymentInfo.Offer offer : info.MAP_OFFER.values())
        {
            id = offer.COOLDOWN_ACTIVE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && info.MAP_OFFER.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in COOLDOWN_ACTIVE");

            id = offer.DURATION_ACTIVE_PURCHASE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && info.MAP_OFFER.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in DURATION_ACTIVE_PURCHASE");

            id = offer.DURATION_ACTIVE_NO_PURCHASE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && info.MAP_OFFER.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in DURATION_ACTIVE_NO_PURCHASE");

            id = offer.ID;
            if (country.equals("VN") && offer.PRICE_VND.intValue() != offer.PRICE_LOCAL.intValue() )
            {
                throwRuntimeException("PRICE_VND & PRICE_LOCAL not match: " + id);
            }
        }

        checkExistOffer(info.OFFER_NEWBIE_OFFER.values());
        checkExistOffer(info.OFFER_SPECIAL_NO_PURCHASE.values());
        checkExistOffer(info.OFFER_SPECIAL_LOW_PURCHASE.values());
        checkExistOffer(info.OFFER_SPECIAL_HIGH_PURCHASE.values());
        checkExistOffer(info.OFFER_SUPER_NO_PURCHASE.values());
        checkExistOffer(info.OFFER_SUPER_LOW_PURCHASE.values());
        checkExistOffer(info.OFFER_SUPER_HIGH_PURCHASE.values());
    }

    private void parseDisplayOrder()
    {
        ParseSheetCol sc = parseSheetCol("TabOrderDisplay");

            info.DISPLAY_TAB_IAP = sc.getInt("TAB_IAP");
            info.DISPLAY_TAB_COIN2GOLD = sc.getInt("TAB_COIN2GOLD");
            info.DISPLAY_TAB_SMS = sc.getInt("TAB_SMS");
            info.DISPLAY_TAB_CARD = sc.getInt("TAB_CARD");
            info.DISPLAY_TAB_ATM = sc.getInt("TAB_ATM");
            info.DISPLAY_TAB_WALLET = sc.getInt("TAB_WALLET");
            info.DISPLAY_TAB_BANKING = sc.getInt("TAB_BANKING");
            info.DISPLAY_TAB_CREDIT = sc.getInt("TAB_CREDIT");
            info.DISPLAY_TAB_COUNT = sc.getInt("TAB_COUNT");
            info.DISPLAY_TAB_BANK = sc.getInt("TAB_BANK");
            info.DISPLAY_TAB_OFFER = sc.getInt("TAB_OFFER");
    }

    public static PaymentInfo getInfo (String country)
    {
        return mapInfo.get(country);
    }

    private void parse (String sheetName)
    {
        ParseSheetRow ps = parseSheetRow(sheetName);

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            PaymentInfo.Item item = new PaymentInfo.Item();
            item.ID = ps.getString(row, "ID");
            if (item.ID == null)
                continue;

            boolean isActive = ps.getBoolean(row, "IS_ACTIVE");
            if (!isActive)
                continue;

            item.TYPE = Define.toTypeInt(ps.getString(row, "TYPE"));
            String subType = ps.getString(row, "SUB_TYPE");
            item.SUB_TYPE = Define.toSubTypeInt(subType);
            item.CHANNEL = getOperators(subType, ps.getString(row, "CHANNEL"));
            item.CHANNEL_PREPAID = getOperators(subType, ps.getString(row, "CHANNEL_PREPAID"));
            item.CHANNEL_POSTPAID = getOperators(subType, ps.getString(row, "CHANNEL_POSTPAID"));

            if (item.CHANNEL_PREPAID.isEmpty() && item.CHANNEL_POSTPAID.isEmpty())
            {
                item.CHANNEL_PREPAID = null;
                item.CHANNEL_POSTPAID = null;
            }

            if (info.MAP_ITEM.put(item.ID, item) != null)
                throwRuntimeException("Duplicate id " + item.ID);
            info.ITEMS.add(item);

            item.NAME = ps.getString(row, "NAME");
            item.QUANTITY = ps.getInt(row, "QUANTITY");
            item.PRICE_VND = ps.getInt(row, "PRICE_VND");
            item.PRICE_LOCAL = ps.getInt(row, "PRICE_LOCAL");

            if (item.SUB_TYPE == Define.toSubTypeInt("CARD") || item.SUB_TYPE == Define.toSubTypeInt("ZING"))
            {
                item.QUANTITY = 0;
                item.PRICE_VND = 0;
            }
            else
            {
                if (item.QUANTITY < 0)
                    throwRuntimeException(item.ID + " : Invalid QUANTITY " + item.QUANTITY);

                if (item.PRICE_VND <= 0)
                    throwRuntimeException(item.ID + " : Invalid PRICE_VND " + item.PRICE_VND);
                item.COIN = item.PRICE_VND / info.RATE_VND_TO_COIN;


                int quantity;
                if (item.TYPE == Define.toTypeInt("TAB_COIN"))
                {
                    quantity = item.COIN;
                }
                else if (item.TYPE == Define.toTypeInt("TAB_GOLD"))
                {
                    quantity = item.PRICE_VND * info.RATE_COIN_TO_GOLD / info.RATE_VND_TO_COIN;
                }
                else
                {
                    quantity = 0;
                }


                boolean isSMS = (item.SUB_TYPE == Define.toSubTypeInt("SMS"));
                if (isSMS)
                    quantity = quantity * info.RATE_SMS_PERCENT / 100;

                if (quantity != item.QUANTITY)
                    throwRuntimeException("sheetName: " + sheetName + ", row: " + row + ", id: " + item.ID + " : Invalid QUANTITY " + item.QUANTITY + ", expect: " + quantity + ", price: " + item.PRICE_VND + ", isSMS: " + isSMS + ", type: " + item.TYPE);

                /*
                int priceLocal = item.PRICE_VND / info.RATE_LOCAL_TO_VND;
                if (info.USE_PRICE_CENT)
                {
                    priceLocal *= 100;
                    if (Math.abs(priceLocal - item.PRICE_LOCAL) > 1)
                        throwRuntimeException(item.ID + " : priceLocal (" + priceLocal + ") != item.PRICE_LOCAL (" + item.PRICE_LOCAL + ")");
                }
                else
                {
                    if (priceLocal != item.PRICE_LOCAL)
                    {
                        Log.debug("item.PRICE_VND", item.PRICE_VND);
                        Log.debug("item.RATE_LOCAL_TO_VND", info.RATE_LOCAL_TO_VND);
                        throwRuntimeException(item.ID + " : priceLocal (" + priceLocal + ") != item.PRICE_LOCAL (" + item.PRICE_LOCAL + ")");
                    }
                }
                */
            }

            item.BONUS_QUANTITY = ps.getInt(row, "BONUS_QUANTITY");
            if (item.BONUS_QUANTITY < 0)
                throwRuntimeException(item.ID + " : Invalid BONUS_QUANTITY " + item.BONUS_QUANTITY);

            item.FIRST_CHARGE_PERCENT = ps.getInt(row, "FIRST_CHARGE_PERCENT");
            if (item.FIRST_CHARGE_PERCENT < 0)
                throwRuntimeException(item.ID + " : Invalid FIRST_CHARGE_PERCENT " + item.FIRST_CHARGE_PERCENT);

            item.PROMOTION_PERCENT = ps.getInt(row, "PROMOTION_PERCENT");
            if (item.PROMOTION_PERCENT < 0)
                throwRuntimeException(item.ID + " : Invalid PROMOTION_PERCENT " + item.PROMOTION_PERCENT);

            item.PROMOTION_DURATION = Util.toPeriods(null, row, ps.getString(row, "PROMOTION_DURATION"));

            item.NEXT_PAY_COUNTDOWN = ps.getInt(row, "NEXT_PAY_COUNTDOWN");
            if (item.NEXT_PAY_COUNTDOWN < 0)
                throwRuntimeException(item.ID + " : Invalid NEXT_PAY_COUNTDOWN " + item.NEXT_PAY_COUNTDOWN);

            item.LIMIT_DAY = ps.getInt(row, "LIMIT_DAY");
            if (item.LIMIT_DAY < 0)
                throwRuntimeException(item.ID + " : Invalid LIMIT_DAY " + item.LIMIT_DAY);


            item.IS_HOT = ps.getBoolean(row, "IS_HOT");
            item.PACK_DESCRIPTION = ps.getString(row, "PACK_DESCRIPTION");
        }
    }

    private Collection<String> getOperators (String subType, String value)
    {
        if (value == null || value.isEmpty())
            return new ArrayList<>();
        return getOperators(subType, Util.getCollectionString(value));
    }

    private Collection<String> getOperators (String subType, Collection<String> set)
    {
        Collection<String> result = new ArrayList<>();
        if (set != null)
        {
            for (String op : set)
            {
                String define = country + "_" + subType + "_" + op;
                String value = Define.defineToString(define);
                if (value == null)
                    throwRuntimeException("Unknown define: " + define);

                result.add(value);
            }
        }
        return result;
    }

    public void checkExistOffer (Collection<String> offers)
    {
        for (String offer : offers)
        {
            if (!info.MAP_OFFER.containsKey(offer))
                throwRuntimeException("Invalid offer " + offer + " in offer " + offer);
        }
    }
}
