package exportexcel.sheet;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import data.DailyGiftInfo;
import exportexcel.ExportExcel;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class DailyGift extends ParseWorkbook
{
    public DailyGift (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        if (ExportExcel.isServer)
        {
            DailyGiftInfo info = new DailyGiftInfo();
            info.NEW_USER = parseGift("NEW_USER", true);
            info.EVENT = parseGift("EVENT", false);

            addConstInfo(info, null);
        }
    }

    private TreeMap<Integer, List<Map<String, Integer>>> parseGift (String sheetName, boolean isNewUser)
    {
        ParseSheetRow ps = parseSheetRow(sheetName);
        TreeMap<Integer, List<Map<String, Integer>>> o = new TreeMap<>();

        int numDay;
        for (numDay = 1; ; numDay++)
        {
            if (!ps.containsName("DAY_" + numDay))
                break;
        }
        numDay--;

        if (isNewUser)
        {
            int len = Define.miscJson.get("DAILY_GIFT_NEW_USER_DURATION").getAsInt();
            if (len < numDay)
                throwRuntimeException("duration new user < numGift");
        }
        else
        {
            for (JsonElement e : Define.miscJson.get("DAILY_GIFT_EVENT_DURATION").getAsJsonArray())
            {
                JsonArray duration = e.getAsJsonArray();
                int delta = (duration.get(1).getAsInt() - duration.get(0).getAsInt()) / (24 * 3600);
                if (delta != numDay)
                    throwRuntimeException("duration event != numGift");
            }
        }

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            int level = ps.getInt(row, "LEVEL");
            List<Map<String, Integer>> list = new ArrayList<>();
            o.put(level, list);

            for (int day = 1; day <= numDay; day++)
                list.add(ps.getMapItemNum(row, "DAY_" + day));
        }

        return o;
    }
}
