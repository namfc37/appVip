package exportexcel.sheet;

import data.SkipTimeInfo;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

public class SkipTime extends ParseWorkbook
{
    public SkipTime (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        LinkedHashMap<String, TreeMap<Integer, SkipTimeInfo>> skipTimes = new LinkedHashMap<>();
        int maxCol = 100;
        Row firstRow = parseSheet.sheet.getRow(0);
        for (int aCol = 1; aCol < maxCol; aCol += 3)
        {
            Cell cell = firstRow.getCell(aCol);
            if (cell == null) break;
            String sValue = cell.getStringCellValue();
            if (sValue.length() > 0)
            {
                String typeName = sValue.split("_")[0];
                for (Map.Entry<String, Integer> e : Define.mapType.entrySet())
                {
                    if (typeName.compareTo(e.getKey()) == 0)
                    {
                        TreeMap<Integer, SkipTimeInfo> tree = new TreeMap<>();
                        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
                        {
                            if (parseSheet.isEmptyCell(row, typeName + "_TIME_RANGE"))
                                break;

                            SkipTimeInfo ratioInfo = new SkipTimeInfo();
                            ratioInfo.TIME_RANGE = parseSheet.getInt(row, typeName + "_TIME_RANGE");
                            ratioInfo.RATIO = parseSheet.getFloat(row, typeName + "_RATIO");
                            ratioInfo.DIAMOND_DEFAULT = parseSheet.getInt(row, typeName + "_DIAMOND_DEFAULT");

                            tree.put(ratioInfo.TIME_RANGE, ratioInfo);
                        }
                        skipTimes.put(typeName, tree);
                    }
                }
            }
            else
            {
                break;
            }
        }
        addConstInfo(skipTimes, null);
    }
}