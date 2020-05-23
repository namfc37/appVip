package exportexcel.sheet;

import data.ProductInfo;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class Product extends ParseWorkbook
{
    public static final LinkedHashMap<String, ProductInfo> products = new LinkedHashMap<>();

    public Product (String inputName) throws Exception
    {
        super(inputName, "PRODUCT", "PEARL");
    }

    @Override
    public void handle ()
    {
        parse("PRODUCT");
        parse("PEARL");

        addConstInfo(products, products);
    }

    private void parse (String idString)
    {
        ParseSheetRow parseSheet = parseSheetRow(idString);

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            Row oRow = parseSheet.sheet.getRow(row);
            if (oRow == null)
                break;

            Cell cell = oRow.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
            {
                continue;
            }

            ProductInfo info = new ProductInfo();
            parseItemInfo(parseSheet, info, row);
            products.put(info.ID, info);

            Integer iValue = UserLevel.GetProductLevelUnlock(info.ID);
            if (iValue == null)
            {
                info.LEVEL_UNLOCK = parseSheet.getInt(row, "LEVEL_UNLOCK");
            }
            else
            {
                info.LEVEL_UNLOCK = iValue;
            }

            info.MACHINE_ID = parseSheet.getItemId(row, "MACHINE_ID");

            info.REQUIRE_ITEM = new HashMap<>();
            String v = parseSheet.getString(row, "REQUIRE_ITEM");
            if (v.length() > 0 && !v.equals("-1"))
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

            info.PRODUCTION_TIME = parseSheet.getInt(row, "PRODUCTION_TIME");
            info.EXP_RECEIVE = parseSheet.getInt(row, "EXP_RECEIVE");
            info.DIAMOND_BUY = parseSheet.getInt(row, "DIAMOND_BUY");
            info.GOLD_BASIC = parseSheet.getFloat(row, "GOLD_BASIC");
            info.EXP_BASIC = parseSheet.getFloat(row, "EXP_BASIC");
            info.GFX = parseSheet.getString(row, "GFX");
        }
    }
}