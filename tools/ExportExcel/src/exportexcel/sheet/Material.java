package exportexcel.sheet;

import data.MaterialInfo;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.LinkedHashMap;

public class Material extends ParseWorkbook
{
    public static LinkedHashMap<String, MaterialInfo> materials = new LinkedHashMap<>();

    public Material (String inputName) throws Exception
    {
        super(inputName, "MATERIAL", "MINERAL", "MINIGAME","GACHAPON");
    }

    @Override
    public void handle ()
    {
        parse("MATERIAL");
        parse("MINERAL");
        parse("MINIGAME");
        parse("GACHAPON");

        addConstInfo(materials, materials);
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

            MaterialInfo info = new MaterialInfo();
            parseItemInfo(parseSheet, info, r);
            materials.put(info.ID, info);

            info.SUB_TYPE = Define.toSubTypeInt(parseSheet.getString(r, "SUB_TYPE"));

            info.DIAMOND_BUY = parseSheet.getInt(r, "DIAMOND_BUY");

            info.LUCKY_PERCENT = parseSheet.getInt(r, "LUCKY_PERCENT");
            if (info.LUCKY_PERCENT <= 0)
                info.LUCKY_PERCENT = null;

            info.GOLD_BASIC = parseSheet.getFloat(r, "GOLD_BASIC");
            info.EXP_BASIC = parseSheet.getFloat(r, "EXP_BASIC");


            info.GFX = parseSheet.getString(r, "GFX");
        }
    }
}