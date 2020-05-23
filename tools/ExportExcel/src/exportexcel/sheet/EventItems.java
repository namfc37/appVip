package exportexcel.sheet;

import java.util.LinkedHashMap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.EventInfo;
import data.EventItemInfo;

public class EventItems extends ParseWorkbook
{
    public static LinkedHashMap<String, EventItemInfo> items = new LinkedHashMap<>();

    public EventItems (String inputName) throws Exception
    {
        super(inputName, "Items");
    }

    @Override
    public void handle ()
    {
        parse("Items");

        addConstInfo(items, items);
    }

    private void parse (String idSheet)
    {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        for (int r = 1; r <= maxRow; r++)
        {
            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
                break;

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                continue;

            EventItemInfo info = new EventItemInfo();
            parseItemInfo(parseSheet, info, r);
            info.SUB_TYPE = Define.toSubTypeInt(parseSheet.getString(r, "SUB_TYPE"));
            info.GFX = parseSheet.getString(r, "GFX");
            info.USE_IN = parseSheet.getItemId(r, "USE IN");
            info.DIAMOND_BUY = parseSheet.getInt(r,"DIAMOND_BUY");
            info.GOLD_DEFAULT = parseSheet.getInt(r,"GOLD_DEFAULT");
            info.GOLD_MIN = parseSheet.getInt(r, "GOLD_MIN");
            info.GOLD_MAX = parseSheet.getInt(r, "GOLD_MAX");
            info.GOLD_CONVERT = parseSheet.getInt(r, "GOLD_CONVERT");
//          info.USE_DURATION = new int [][] {EventInfo.eventDuration(info.USE_IN)};
            items.put(info.ID, info);
        }
    }
}