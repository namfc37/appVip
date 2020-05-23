package exportexcel.sheet;

import data.PestInfo;
import exportexcel.ExportExcel;

import java.util.HashMap;
import java.util.LinkedHashMap;

public class Pest extends ParseWorkbook
{
    public static HashMap<String, PestInfo> mapPest = new HashMap<>();
    public Pest (String inputName) throws Exception
    {
        super(inputName, "Sheet1");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");
        LinkedHashMap<String, PestInfo> pests = new LinkedHashMap<>();

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            PestInfo info = new PestInfo();
            parseItemInfo(parseSheet, info, row);

            pests.put(info.ID, info);
            mapPest.put(info.ID, info);

            info.DIAMOND_BUY = parseSheet.getInt(row, "DIAMON_BUY");
            info.GOLD_BASIC = parseSheet.getFloat(row, "GOLD_BASIC");
            info.EXP_BASIC = parseSheet.getFloat(row, "EXP_BASIC");
            info.BUG_TYPE = parseSheet.getInt(row, "BUG_TYPE");
            info.GFX = parseSheet.getString(row, "GFX");
            info.CATCH_EXP = parseSheet.getInt(row, "CATCH_EXP");
            info.LEVEL_UNLOCK = parseSheet.getInt(row,"LEVEL_UNLOCK");
            if (ExportExcel.isServer)
            {
                info.JACK_PS_GOLD = parseSheet.getInt(row, "JACK_PS_GOLD");
                if (info.JACK_PS_GOLD < 0)
                    throwRuntimeException("Invalid JACK_PS_GOLD " + info.JACK_PS_GOLD);
            }
        }
        addConstInfo(pests, pests);
    }
}