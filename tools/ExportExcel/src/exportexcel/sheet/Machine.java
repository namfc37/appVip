package exportexcel.sheet;

import data.MachineInfo;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.util.ArrayList;
import java.util.LinkedHashMap;

public class Machine extends ParseWorkbook
{
    public Machine (String inputName) throws Exception
    {
        super(inputName, "Sheet1");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");
        LinkedHashMap<String, MachineInfo> listInfo = new LinkedHashMap<>();

        Sheet unlockSheet = workbook.getSheet("Unlock");
        Sheet slotSheet = workbook.getSheet("Slot");
        Sheet appraisalSheet = workbook.getSheet("Appraisal");

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            MachineInfo info = new MachineInfo();
            parseItemInfo(parseSheet, info, row);

            info.FLOOR = parseSheet.getInt(row, "FLOOR");
            if (info.FLOOR >= 0)
                Floor.listInfo.get(info.FLOOR).MACHINE = info.ID;

            Integer iValue = UserLevel.GetMachineLevelUnlock(info.ID);
            if (iValue == null)
            {
                info.LEVEL_UNLOCK = parseSheet.getInt(row, "LEVEL_UNLOCK");
            }
            else
            {
                info.LEVEL_UNLOCK = iValue;
            }

            info.GOLD_START = parseSheet.getInt(row, "GOLD_START");
            info.TIME_START = parseSheet.getInt(row, "TIME_START");

            String strValue = parseSheet.getString(row, "PRODUCT_ID");
            if (strValue.length() > 0)
            {
                info.PRODUCT_ID = Util.toArrayItemId(strValue);
            }
            else
            {
                info.PRODUCT_ID = new String[0];
            }
            info.DURABILITY_INIT = parseSheet.getInt(row, "DURABILITY_INIT");
            info.DURABILITY_ADD = parseSheet.getInt(row, "DURABILITY_ADD");
            info.LIBRARY_ORDER = parseSheet.getInt(row, "LIBRARY_ORDER");
            info.INIT_STORE = parseSheet.getInt(row, "INIT_STORE");
            info.GFX = parseSheet.getString(row, "GFX");

            info.LEVELS = new ArrayList<>();

            int maxCol = 100;
            for (int aRow = 1, aMaxRow = unlockSheet.getLastRowNum(); aRow <= aMaxRow; aRow++)
            {
                Row aSheetRow = unlockSheet.getRow(aRow);
                String itemId = aSheetRow.getCell(0).getStringCellValue();
                if (itemId.length() > 0 && itemId.compareTo(info.ID) == 0)
                {
                    for (int aCol = 1; aCol < maxCol; aCol++)
                    {
                        Cell cell = aSheetRow.getCell(aCol);
                        if (cell == null) break;
                        String sValue = cell.getStringCellValue();
                        if (sValue.length() > 0)
                        {
                            int[] data = getArrayInt(sValue);
                            if (data.length == 8)
                            {
                                MachineInfo.Level aLevel = new MachineInfo.Level();
                                aLevel.ACTIVE_TIME = data[0];
                                aLevel.GOLD_UNLOCK = data[1];
                                aLevel.UPGRADE_RATIO = data[2];
                                aLevel.EXP_BONUS = data[3];
                                aLevel.REDUCE_TIME = data[4];
                                aLevel.EXP_ORDER = data[5];
                                aLevel.GOLD_ORDER = data[6];
                                aLevel.GOLD_MAINTAIN = data[7];
                                aLevel.APPRAISAL = 0;
                                info.LEVELS.add(aLevel);
                            }
                            else
                            {
                                throwRuntimeException(aRow, -1, "Missing machine unlock value");
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                    break;
                }
            }

            Row firstRow = appraisalSheet.getRow(0);
            for (int aCol = 1; aCol < maxCol; aCol++)
            {
                Cell cell = firstRow.getCell(aCol);
                String itemId = cell.getStringCellValue();
                if (itemId.length() > 0 && itemId.compareTo(info.ID) == 0)
                {
                    int level = 0;
                    for (int aRow = 1, aMaxRow = appraisalSheet.getLastRowNum(); aRow <= aMaxRow; aRow++)
                    {
                        Row aSheetRow = appraisalSheet.getRow(aRow);
                        Cell aCell = aSheetRow.getCell(aCol);
                        if (level >= info.LEVELS.size())
                        {
                            MachineInfo.Level aLevel = new MachineInfo.Level();
                            aLevel.ACTIVE_TIME = 0;
                            aLevel.GOLD_UNLOCK = 0;
                            aLevel.UPGRADE_RATIO = 0;
                            aLevel.EXP_BONUS = 0;
                            aLevel.REDUCE_TIME = 0;
                            aLevel.EXP_ORDER = 0;
                            aLevel.GOLD_ORDER = 0;
                            aLevel.GOLD_MAINTAIN = 0;
                            aLevel.APPRAISAL = (int) aCell.getNumericCellValue();
                            info.LEVELS.add(aLevel);
                        }
                        else
                        {
                            MachineInfo.Level aLevel = info.LEVELS.get(level);
                            aLevel.APPRAISAL = (int) aCell.getNumericCellValue();
                        }
                        level++;
                    }
                    break;
                }
            }
            ArrayList<Integer> listUnlock = new ArrayList<>();
            for (int aRow = 1, aMaxRow = slotSheet.getLastRowNum(); aRow <= aMaxRow; aRow++)
            {
                Row aSheetRow = slotSheet.getRow(aRow);
                String itemId = aSheetRow.getCell(0).getStringCellValue();
                if (itemId.length() > 0 && itemId.compareTo(info.ID) == 0)
                {
                    for (int aCol = 1; aCol < maxCol; aCol++)
                    {
                        Cell cell = aSheetRow.getCell(aCol);
                        if (cell == null)
                        {
                            break;
                        }
                        else
                        {
                            int intValue = (int) cell.getNumericCellValue();
                            listUnlock.add(intValue);
                        }
                    }
                    break;
                }
            }
            info.UNLOCK_REQUIRES_DIAMOND = new ArrayList<>();
            for (int i = 0; i < listUnlock.size(); i++)
            {
                if (listUnlock.get(i) < 0)
                    break;
                info.UNLOCK_REQUIRES_DIAMOND.add(listUnlock.get(i));
            }

            for (int price : info.UNLOCK_REQUIRES_DIAMOND)
            {
                if (price > 0)
                    break;
                info.INIT_SLOT++;
            }

            listInfo.put(info.ID, info);
        }

        addConstInfo(listInfo, listInfo);
    }
}