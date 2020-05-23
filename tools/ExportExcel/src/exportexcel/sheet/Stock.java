package exportexcel.sheet;

import data.StockInfo;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.HashMap;

public class Stock extends ParseWorkbook
{
    public static HashMap<Integer,Integer> typeToStock = new HashMap<>();

    public Stock (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseInfo = parseSheetRow("Sheet1");
        ParseSheetRow parseUpgrade = parseSheetRow("Upgrade");

        ArrayList<StockInfo> listInfo = new ArrayList<>();

        for (int row = 1, maxRow = parseInfo.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            StockInfo info = new StockInfo();

            info.ID = parseInfo.getInt(row, "ID");
            info.NAME = parseInfo.getString(row, "NAME");
            info.CAPACITY_INIT = parseInfo.getInt(row, "CAPACITY_INIT");
            info.CAPACITY_ADD = parseInfo.getInt(row, "CAPACITY_ADD");

            String strValue = parseInfo.getString(row, "CONTAIN_TYPES");
            info.CONTAIN_TYPES = toSetType(strValue);

            for (Integer type : info.CONTAIN_TYPES)
                typeToStock.put(type, info.ID);

            if (info.CAPACITY_INIT > 0)
            {
                info.LEVELS = new ArrayList<>();

                for (int r2 = 1, maxRow2 = parseUpgrade.sheet.getLastRowNum(); r2 <= maxRow2; r2++)
                {
                    Row row2 = parseUpgrade.sheet.getRow(r2);

                    StockInfo.Level level = new StockInfo.Level();
                    strValue = row2.getCell(parseUpgrade.getIdCol("APPRAISAL")).getStringCellValue();
                    int[] appraisalData = getArrayInt(strValue);
                    int stockIndex = info.ID;
                    if (stockIndex < appraisalData.length)
                        level.APPRAISAL = appraisalData[stockIndex];
                    else
                        level.APPRAISAL = 0;
                    Integer colNum = parseUpgrade.getIdCol("STOCK_" + info.ID);
                    if (colNum != null)
                    {
                        level.REQUIRE_ITEM = parseUpgrade.getMapItemNum(r2, colNum);
                    }

                    info.LEVELS.add(level);
                }
            }

            listInfo.add(info);
        }

        addConstInfo(listInfo, null);
    }
}