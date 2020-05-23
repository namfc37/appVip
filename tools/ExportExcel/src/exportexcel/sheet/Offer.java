package exportexcel.sheet;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.OfferInfo;
import data.PaymentInfo;
import exportexcel.ExportExcel;

import java.util.LinkedHashMap;
import java.util.Map;

public class Offer extends ParseWorkbook
{
    public static Map<String, OfferInfo> map = new LinkedHashMap<>();

    private final String country;

    public Offer (String inputName, String country) throws Exception
    {
        super(inputName + " " + country + ".xlsx");
        this.country = country.toUpperCase();
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        PaymentInfo paymentInfo = Payment.getInfo(country);

        ParseSheetRow ps = parseSheetRow("OFFER");

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            OfferInfo info = new OfferInfo();
            info.ID = ps.getString(row, "ID");
            info.TYPE = ps.getString(row, "TYPE");
            map.put(info.ID, info);

            info.PRICE_VND = ps.getInt(row, "PRICE_VND");
            info.PRICE_COIN = info.PRICE_VND / paymentInfo.RATE_VND_TO_COIN;
            info.REWARDS = ps.getMapItemNum(row, "REWARDS");
            info.GFX = ps.getString(row, "GFX");
            info.REPEAT_DAY = ps.getInt(row, "REPEAT_DAY");

            if (ExportExcel.isServer)
            {
                info.COOLDOWN_MIN = ps.getInt(row, "COOLDOWN_MIN");
                info.COOLDOWN_MAX = ps.getInt(row, "COOLDOWN_MAX");
                info.COOLDOWN_ACTIVE = ps.getString(row, "COOLDOWN_ACTIVE");
                info.DURATION = ps.getInt(row, "DURATION");
                if (info.DURATION <= 0)
                    throwRuntimeException("DURATION <= 0");
                info.DURATION_ACTIVE_PURCHASE = ps.getString(row, "DURATION_ACTIVE_PURCHASE");
                info.DURATION_ACTIVE_NO_PURCHASE = ps.getString(row, "DURATION_ACTIVE_NO_PURCHASE");
            }
        }

        String id;
        for (OfferInfo info : map.values())
        {
            id = info.COOLDOWN_ACTIVE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && map.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in COOLDOWN_ACTIVE");

            id = info.DURATION_ACTIVE_PURCHASE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && map.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in DURATION_ACTIVE_PURCHASE");

            id = info.DURATION_ACTIVE_NO_PURCHASE;
            if (id != null && id.equalsIgnoreCase("RESET") == false && map.containsKey(id) == false)
                throwRuntimeException("Invalid id " + id + " in DURATION_ACTIVE_NO_PURCHASE");
        }

        checkExistOffer("OFFER_NEWBIE_OFFER");
        checkExistOffer("OFFER_SPECIAL_NO_PURCHASE");
        checkExistOffer("OFFER_SPECIAL_LOW_PURCHASE");
        checkExistOffer("OFFER_SPECIAL_HIGH_PURCHASE");
        checkExistOffer("OFFER_SUPER_LOW_PURCHASE");
        checkExistOffer("OFFER_SUPER_HIGH_PURCHASE");

        addConstInfo(map, null);
    }

    public static void checkExistOffer (String id)
    {
        JsonElement e = Define.miscJson.get(id);
        if (e == null)
            throwRuntimeException("Invalid id " + id);
        JsonObject o = e.getAsJsonObject();
        for (String rate : o.keySet())
        {
            String offer = o.get(rate).getAsString();
            if (!map.containsKey(offer))
                throwRuntimeException("Invalid offer " + offer + " in id " + id);
        }
    }
}
