package exportexcel.sheet;

import data.PotInfo;
import exportexcel.Const;
import exportexcel.ExportExcel;
import exportexcel.Log;
import exportexcel.Util;

import java.util.*;

public class Pot extends ParseWorkbook
{
    public Pot (String inputName) throws Exception
    {
        super(inputName, "Sheet1");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        LinkedHashMap<String, PotInfo> pots = new LinkedHashMap<>();

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
//            Row row = sheet.getRow(r);
//            Cell cell = row.getCell(mapName.get("OLD_ID"));

            PotInfo info = new PotInfo();
            parseItemInfo(parseSheet, info, row);
            if (info.ID == null)
                continue;

            pots.put(info.ID, info);
            info.EXP_INCREASE = parseSheet.getInt(row, "EXP_INCREASE");
            //group gold to REQUIRE_ITEM
            info.REQUIRE_ITEM = new HashMap<>();

            addItem(info.REQUIRE_ITEM, Const.ITEM_GOLD, parseSheet.getInt(row, "UPGRADE_GOLD"));
            String v = parseSheet.getString(row, "UPGRADE_ITEM");
            if (v.length() > 0 && !v.equals("NA"))
            {
                HashMap<String, Integer> mapItemNum = Util.getMapItemNum(row, -1, v);
                if (mapItemNum.size() > 0)
                {
                    for (Map.Entry<String, Integer> e : mapItemNum.entrySet())
                    {
                        addItem(info.REQUIRE_ITEM, e.getKey(), e.getValue());
                    }
                }
            }
            info.UPGRADE_RATIO = parseSheet.getInt(row, "UPGRADE_RATIO");

            v = parseSheet.getString(row, "SELECTION_RATE");
            if (v != null && v.length() > 0 && !v.equals("-1"))
            {
                info.SELECTION_RATE = getArrayInt(v);
            }

            info.BUG_APPEAR_RATIO = parseSheet.getInt(row, "BUG_APPEAR_RATIO");

            Integer iValue = UserLevel.GetPotLevelUnlock(info.ID);
            if (iValue == null)
            {
                info.LEVEL_UNLOCK = parseSheet.getInt(row, "LEVEL_UNLOCK");
            }
            else
            {
                info.LEVEL_UNLOCK = iValue;
            }

            info.APPRAISAL = Math.round(parseSheet.getFloat(row, "APPRAISAL"));
            info.TIME_DECREASE_DEFAULT = parseSheet.getInt(row, "TIME_DECREASE_DEFAULT");
            info.POT_RANKING_STAR = parseSheet.defineToByte(row, "POT_RAKING_STAR");
            info.GOLD_INCREASE = parseSheet.getInt(row, "GOLD_INCREASE");


            info.POT_LIBRARY_ORDER = parseSheet.getInt(row, "POT_LIBRARY_ORDER");
            info.GFX = parseSheet.getString(row, "GFX");
            info.SKIN = parseSheet.getString(row, "SKIN");

            if (!ExportExcel.isServer)
                info.PLANT_POS = parseSheet.getInt(row, "PLANT_POS");
        }

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
//            Row row = parseSheet.sheet.getRow(r);
            String key = parseSheet.getString(row, "ID");
            if (key == null)
                continue;

            PotInfo info = pots.get(key);
            if (info == null)
                Log.debug("Null pot info", key);
            String[] nextId = parseSheet.toArrayItemId(row, "UPGRADE_NEXT_ID");
            if (nextId == null || nextId.length == 0)
                info.UPGRADE_NEXT_ID = Collections.emptyList();
            else
                info.UPGRADE_NEXT_ID = Arrays.asList(nextId);

            if (info.UPGRADE_NEXT_ID.size() <= 1)
            {
                info.SELECTION_RATE = null;
            }
            else
            {
                if (info.UPGRADE_NEXT_ID.size() != info.SELECTION_RATE.length)
                    throwRuntimeException(row, -1, "UPGRADE_NEXT_ID.size != SELECTION_RATE.size");
            }
        }
        addConstInfo(pots, pots);
    }
}