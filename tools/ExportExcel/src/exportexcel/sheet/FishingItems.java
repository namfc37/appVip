package exportexcel.sheet;

import data.FishingItemInfo;
import data.Hook;
import data.ItemInfo;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.LinkedHashMap;

public class FishingItems extends ParseWorkbook {
    public static LinkedHashMap<String, ItemInfo> fishingItem = new LinkedHashMap<>();

    public FishingItems(String inputName) throws Exception {
        super(inputName,"Fishing Items", "Hook");
    }

    @Override
    public void handle() {
        parse("Fishing Items");
        parseHook("Hook");
        addConstInfo(fishingItem, fishingItem);
    }

    private void parseHook(String idSheet) {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++) {

            Row row = parseSheet.sheet.getRow(r);
            if (row == null) {
                break;
            }

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK) {
                continue;
            }

            Hook info = new Hook();
            parseItemInfo(parseSheet, info, r);
            fishingItem.put(info.ID, info);

            info.SUB_TYPE = Define.toSubTypeInt(parseSheet.getString(r, "SUB_TYPE"));

            info.FISH = Util.toItemId(parseSheet.getString(r, "FISH"));
            info.DIAMOND_BUY = parseSheet.getInt(r, "DIAMOND_BUY");
            info.GOLD_DEFAULT = parseSheet.getInt(r, "GOLD_DEFAULT");
            info.GOLD_MIN = parseSheet.getInt(r, "GOLD_MIN");
            info.GOLD_MAX = parseSheet.getInt(r, "GOLD_MAX");
            info.GOLD_JACK = parseSheet.getInt(r, "GOLD_JACK");
            info.REQUIRE_DEFAULT.putAll(parseSheet.getMapItemNum(r,"REQUIRE_DEFAULT"));
            info.REQUIRE_ITEM_RATE.putAll(parseSheet.getMapItemNum(r, "REQUIRE_ITEM_RATE"));
            info.REQUIRE_ITEM_NUM = parseSheet.getInt(r,"REQUIRE_ITEM_NUM");
            info.PRODUCTION_TIME = parseSheet.getInt(r,"PRODUCTION_TIME");

            info.COLOR_MINIGAME_BAR = parseSheet.getString(r,"COLOR_MINIGAME_BAR");
            info.GFX = parseSheet.getString(r, "GFX");
        }
    }

    private void parse (String idSheet)
    {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {

            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
            {
                break;
            }

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
            {
                continue;
            }

            FishingItemInfo info = new FishingItemInfo();
            parseItemInfo(parseSheet, info, r);
            fishingItem.put(info.ID, info);

            info.SUB_TYPE = Define.toSubTypeInt(parseSheet.getString(r, "SUB_TYPE"));

            info.DIAMOND_BUY = parseSheet.getInt(r, "DIAMOND_BUY");
            info.GOLD_DEFAULT = parseSheet.getInt(r, "GOLD_DEFAULT");
            info.GOLD_MIN = parseSheet.getInt(r, "GOLD_MIN");
            info.GOLD_MAX = parseSheet.getInt(r, "GOLD_MAX");
            info.GOLD_JACK = parseSheet.getInt(r, "GOLD_JACK");
            info.GFX = parseSheet.getString(r, "GFX");
        }
    }
}