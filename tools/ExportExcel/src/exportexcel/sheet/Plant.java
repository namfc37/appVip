package exportexcel.sheet;

import data.ItemInfo;
import data.PestInfo;
import data.PlantInfo;
import exportexcel.ExportExcel;
import org.apache.poi.ss.usermodel.Row;

import java.util.LinkedHashMap;

public class Plant extends ParseWorkbook
{
    public Plant (String inputName) throws Exception
    {
        super(inputName, "Sheet1");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        LinkedHashMap<String, PlantInfo> plants = new LinkedHashMap<>();

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            Row oRow = parseSheet.sheet.getRow(row);
            if (oRow == null)
            {
                //throwRuntimeException(row, null, "Max row not match ");
                break;
            }
            PlantInfo info = new PlantInfo();
            parseItemInfo(parseSheet, info, row);
            plants.put(info.ID, info);

            info.GROW_TIME = parseSheet.getInt(row, "GROW_TIME");
            info.HARVEST_EXP = parseSheet.getInt(row, "HARVEST_EXP");
            info.ITEM_RECEIVE_RATIO = parseSheet.getInt(row, "ITEM_RECEIVE_RATIO");
            info.DIAMOND_BUY = parseSheet.getInt(row, "DIAMOND_BUY");
            info.GOLD_BASIC = parseSheet.getFloat(row, "GOLD_BASIC");
            info.EXP_BASIC = parseSheet.getFloat(row, "EXP_BASIC");
            info.BUG_ID = parseSheet.getItemId(row, "BUG_ID");
            info.BUG_APPEAR_RATIO = parseSheet.getInt(row, "BUG_APPEAR_RATIO");

            Integer value = UserLevel.GetPlantLevelUnlock(info.ID);
            if (value == null)
            {
                info.LEVEL_UNLOCK = parseSheet.getInt(row, "LEVEL_UNLOCK");
            }
            else
            {
                info.LEVEL_UNLOCK = value;
            }

            if (info.BUG_ID != null)
            {
                ItemInfo bugInfo = mapItemInfo.get(info.BUG_ID);
                bugInfo.LEVEL_UNLOCK = (bugInfo.LEVEL_UNLOCK == null) ? info.LEVEL_UNLOCK : Math.min(bugInfo.LEVEL_UNLOCK, info.LEVEL_UNLOCK);
            }

            info.SEED_TIME = parseSheet.getInt(row, "SEED_TIME");
            info.GOLD_BASIC_DO = parseSheet.getFloat(row, "GOLD_BASIC_DO");
            info.EXP_BASIC_DO_FREE = parseSheet.getFloat(row, "EXP_BASIC_DO_FREE");
            info.EXP_BASIC_DO_PAID = parseSheet.getFloat(row, "EXP_BASIC_DO_PAID");
            info.HARVEST_GOLD = parseSheet.getInt(row, "HARVEST_GOLD");
            info.ICON_PATH = parseSheet.getString(row,"ICON_PATH");
            info.GFX = parseSheet.getString(row, "GFX");
            info.EVENT_ID = parseSheet.getItemId(row, "EVENT_ID");
            if (info.EVENT_ID != null)
                info.STOCK = 3; //Kho event

            if (ExportExcel.isServer)
            {
                info.JACK_PS_GOLD = parseSheet.getInt(row, "JACK_PS_GOLD");
                if (info.JACK_PS_GOLD < 0)
                    throwRuntimeException("Invalid JACK_PS_GOLD " + info.JACK_PS_GOLD);
            }
            else
            {
                info.SCALE = parseSheet.getFloat(row, "SCALE");
            }
        }

        for (PestInfo pestInfo : Pest.mapPest.values())
            if (pestInfo.LEVEL_UNLOCK == null)
                pestInfo.LEVEL_UNLOCK = 1;

        addConstInfo(plants, plants);
    }
}