package exportexcel.sheet;

import data.ItemInfo;
import data.UserLevelInfo;
import exportexcel.Const;
import exportexcel.ExportExcel;
import exportexcel.Log;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class UserLevel extends ParseWorkbook
{
    public static UserLevelInfo             levelInfo;
    public static int                       maxLevel;
    public static HashMap<String, Integer>  PlantsUnlockAtLevel   = new HashMap<>();
    public static HashMap<String, Integer>  PotsUnlockAtLevel     = new HashMap<>();
    public static HashMap<String, Integer>  MachinesUnlockAtLevel = new HashMap<>();
    public static HashMap<Integer, Integer> FloorsUnlockAtLevel   = new HashMap<>();
    public static HashMap<String, Integer>  ProductsUnlockAtLevel = new HashMap<>();

    public static Integer GetPlantLevelUnlock (String plantId)
    {
        return PlantsUnlockAtLevel.get(plantId);
    }

    public static Integer GetPotLevelUnlock (String potId)
    {
        return PotsUnlockAtLevel.get(potId);
    }

    public static Integer GetMachineLevelUnlock (String machineId)
    {
        return MachinesUnlockAtLevel.get(machineId);
    }

    public static Integer GetFloorLevelUnlock (int floorId)
    {
        return FloorsUnlockAtLevel.get(floorId);
    }

    public static Integer GetProductLevelUnlock (String productId)
    {
        return ProductsUnlockAtLevel.get(productId);
    }

    public UserLevel (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        maxLevel = 0;
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            Row row = parseSheet.sheet.getRow(r);

            Cell cell = row.getCell(parseSheet.getIdCol("LEVEL"));
            if (cell == null)
                break;
            if (cell.getNumericCellValue() != r - 1)
                throwRuntimeException(r, -1, "Level not match " + cell.getNumericCellValue() + " != " + r);
            maxLevel++;
        }
        levelInfo = new UserLevelInfo();
        levelInfo.LEVEL = new short[maxLevel];
        levelInfo.EXP = new long[maxLevel];
        levelInfo.SEED_UNLOCK = new String[maxLevel][];
        levelInfo.POT_UNLOCK = new String[maxLevel][];
        levelInfo.PROD_UNLOCK = new String[maxLevel][];
        levelInfo.FLOOR_UNLOCK = new int[maxLevel];
        levelInfo.MACHINE_UNLOCK = new String[maxLevel];
        levelInfo.REWARD_ITEM_NAME = new String[maxLevel][];
        levelInfo.REWARD_ITEM_NUM = new int[maxLevel][];
        levelInfo.GOLD_PER_DIAMOND = new int[maxLevel];
        levelInfo.ORDER_SLOT_UNLOCK = new int[maxLevel];

        int idx = 0;
        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            Row oRow = parseSheet.sheet.getRow(row);

            Cell cell = oRow.getCell(parseSheet.getIdCol("LEVEL"));
            if (cell == null)
                break;
            int level = row - 1;
            if (cell.getNumericCellValue() != level)
                throwRuntimeException(row, -1, "Level not match " + cell.getNumericCellValue() + " != " + row);

            levelInfo.LEVEL[idx] = (short) level;
            levelInfo.EXP[idx] = parseSheet.getLong(row, "EXP");

            HashMap<String, Integer> rewardItemMap = parseSheet.getMapItemNum(row, "REWARD_ITEM");
            ArrayList<String> arrayListString = new ArrayList<>();
            String v = parseSheet.getString(row, "SEED_UNLOCK");
            if (v.length() > 0 && v.equals("-1") == false)
            {
                HashMap<String, Integer> mapItemNum = Util.getMapItemNum(row, -1, v);
                if (mapItemNum.size() > 0)
                {
                    for (Map.Entry<String, Integer> e : mapItemNum.entrySet())
                    {
                        arrayListString.add(e.getKey());
                        if (PlantsUnlockAtLevel.put(e.getKey(), level) != null)
                            throwRuntimeException(row, -1, "Duplicate item: " + idToName(e.getKey()) + " (" + e.getKey() + ")");
                        addItem(rewardItemMap, e.getKey(), e.getValue());
                    }
                }
            }

            levelInfo.SEED_UNLOCK[idx] = convertArrayString(arrayListString);

            arrayListString = new ArrayList<>();
            v = parseSheet.getString(row, "POT_UNLOCK");
            if (v.length() > 0 && v.equals("-1") == false)
            {
                HashMap<String, Integer> mapItemNum = Util.getMapItemNum(row, -1, v);
                if (mapItemNum.size() > 0)
                {
                    for (Map.Entry<String, Integer> e : mapItemNum.entrySet())
                    {
                        arrayListString.add(e.getKey());
                        if (PotsUnlockAtLevel.put(e.getKey(), level) != null)
                            throwRuntimeException(row, -1, "Duplicate item: " + idToName(e.getKey()) + " (" + e.getKey() + ")");
                        addItem(rewardItemMap, e.getKey(), e.getValue());
                    }
                }
            }
            levelInfo.POT_UNLOCK[idx] = convertArrayString(arrayListString);

            arrayListString = new ArrayList<>();
            v = parseSheet.getString(row, "PROD_UNLOCK");
            if (v != null && v.length() > 0 && v.equals("-1") == false)
            {
                HashMap<String, Integer> mapItemNum = Util.getMapItemNum(row, -1, v);
                if (mapItemNum.size() > 0)
                {
                    for (Map.Entry<String, Integer> e : mapItemNum.entrySet())
                    {
                        arrayListString.add(e.getKey());
                        if (ProductsUnlockAtLevel.put(e.getKey(), level) != null)
                            throwRuntimeException(row, -1, "Duplicate item: " + idToName(e.getKey()) + " (" + e.getKey() + ")");
                        addItem(rewardItemMap, e.getKey(), e.getValue());
                    }
                }
            }
            levelInfo.PROD_UNLOCK[idx] = convertArrayString(arrayListString);

            for (String product : levelInfo.PROD_UNLOCK[idx])
            {
                ItemInfo pInfo = mapItemInfo.get(product);
                if (pInfo == null)
                    throwRuntimeException(row, -1, "Null info item: " + idToName(product) + " (" + product + ")");
                if (pInfo.LEVEL_UNLOCK == null)
                    pInfo.LEVEL_UNLOCK = level;
                else if (pInfo.LEVEL_UNLOCK != level)
                    throwRuntimeException(row, -1, "Invalid LEVEL_UNLOCK item: " + idToName(product) + " (" + product + "), level " + level + " != " + pInfo.LEVEL_UNLOCK);
            }

            int intValue = parseSheet.getInt(row, "FLOOR_UNLOCK");
            if (intValue < 0)
                FloorsUnlockAtLevel.put(intValue, level);
            levelInfo.FLOOR_UNLOCK[idx] = intValue;

            v = parseSheet.getString(row, "MACHINE_UNLOCK");
            if (v.length() > 0 && v.equals("-1") == false)
            {
                levelInfo.MACHINE_UNLOCK[idx] = Util.toItemId(v);
                MachinesUnlockAtLevel.put(levelInfo.MACHINE_UNLOCK[idx], level);
            }

            levelInfo.GOLD_PER_DIAMOND[idx] = parseSheet.getInt(row, "GOLD_PER_DIAMOND");
            levelInfo.ORDER_SLOT_UNLOCK[idx] = parseSheet.getInt(row, "ORDER_SLOT_UNLOCK");

            int num = parseSheet.getInt(row, "REWARD_GOLD");
            if (num > 0)
                addItem(rewardItemMap, Const.ITEM_GOLD, num);

            num = parseSheet.getInt(row, "REWARD_REPUTATION");
            if (num > 0)
                addItem(rewardItemMap, Const.ITEM_REPUTATION, num);

            num = parseSheet.getInt(row, "REWARD_DIAMOND");
            if (num > 0)
                addItem(rewardItemMap, Const.ITEM_COIN, num);

            levelInfo.REWARD_ITEM_NAME[idx] = convertKeyStrings(rewardItemMap);
            levelInfo.REWARD_ITEM_NUM[idx] = convertValueInts(rewardItemMap);

            idx++;
        }

        parseSheet = parseSheetRow("Constant");

        levelInfo.DO_FREE_UNLOCK = new int[maxLevel];
        levelInfo.DO_PAID_UNLOCK = new int[maxLevel];
        levelInfo.NEW_ORDER_WAIT_TIME = new int[maxLevel];
        levelInfo.MAX_AIRSHIP_PER_DAY = new int[maxLevel];
        levelInfo.AIRSHIP_REWARD_NAME = new String[maxLevel][];
        levelInfo.AIRSHIP_REWARD_NUM = new int[maxLevel][];
        levelInfo.FRIEND_REPU_DAILY_LIMIT = new int[maxLevel];

        if (ExportExcel.isServer)
        {
            levelInfo.DO_PLANT_PER_ORDER = new int[maxLevel];
            levelInfo.DO_FREE_PLANT_MAX = new int[maxLevel];
            levelInfo.DO_PAID_PLANT_MAX = new int[maxLevel];
            levelInfo.DO_RANDOM_PLANT_NAME = new String[maxLevel][];
            levelInfo.ORDER_BUG_PEARL_RATE = new int[maxLevel];
            levelInfo.ORDER_BUG_RATE = new int[maxLevel];
            levelInfo.BUG_PEARL_PER_ORDER = new int[maxLevel];
            levelInfo.ORDER_BUG_PEARL_MAX = new int[maxLevel];
            levelInfo.NO_PLANT_RATE = new int[maxLevel];
            levelInfo.NO_ITEM_PER_ORDER = new int[maxLevel];
            levelInfo.NO_ITEM_MAX = new int[maxLevel];
            levelInfo.ORDER_CONTROL_ENOUGH = new int[maxLevel];
            levelInfo.DAILY_ORDER_DIAMOND_RATIO = new float[maxLevel];
            levelInfo.DO_FREE_GOLD_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.DO_FREE_EXP_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.DO_PAID_GOLD_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.DO_PAID_EXP_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.BUG_PEARL_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.NO_GOLD_COEFFICIENT_RATIO = new float[maxLevel];
            levelInfo.NO_XP_COEFFICIENT_RATIO = new float[maxLevel];


            levelInfo.AIRSHIP_STAY_RATIO = new float[maxLevel];
            levelInfo.AIRSHIP_MIN_ITEM_TYPE = new int[maxLevel];
            levelInfo.AIRSHIP_MAX_ITEM_TYPE = new int[maxLevel];
            levelInfo.AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE = new int[maxLevel];
            levelInfo.AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE = new int[maxLevel];
            levelInfo.AIRSHIP_EASY_REQUEST_NAME = new String[maxLevel][];
            levelInfo.AIRSHIP_EASY_REQUEST_PERCENT = new int[maxLevel][];
            levelInfo.AIRSHIP_MEDIUM_REQUEST_NAME = new String[maxLevel][];
            levelInfo.AIRSHIP_MEDIUM_REQUEST_PERCENT = new int[maxLevel][];
            levelInfo.AIRSHIP_HARD_REQUEST_NAME = new String[maxLevel][];
            levelInfo.AIRSHIP_HARD_REQUEST_PERCENT = new int[maxLevel][];
            levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY = new int[maxLevel];
            levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY = new int[maxLevel];
            levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM = new int[maxLevel];
            levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM = new int[maxLevel];
            levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD = new int[maxLevel];
            levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD = new int[maxLevel];

            levelInfo.PS_ITEM_EXPIRED_TIME = new int[maxLevel];
        }

        String colName;
        int rateA, rateB;
        idx = 0;
        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            Row oRow = parseSheet.sheet.getRow(row);

            Cell cell = oRow.getCell(parseSheet.getIdCol("LEVEL"));
            if (cell == null)
                break;
            int level = (int) cell.getNumericCellValue();
            if (level != row - 1)
                throwRuntimeException(row, -1, "CONSTANT Level not match " + cell.getNumericCellValue() + " != " + row);
            if (idx >= maxLevel)
                break;

            //read constants
            levelInfo.DO_FREE_UNLOCK[idx] = parseSheet.getInt(row, "DO_FREE_UNLOCK");
            levelInfo.DO_PAID_UNLOCK[idx] = parseSheet.getInt(row, "DO_PAID_UNLOCK");
            levelInfo.NEW_ORDER_WAIT_TIME[idx] = parseSheet.getInt(row, "NEW_ORDER_WAIT_TIME");
            if (levelInfo.NEW_ORDER_WAIT_TIME[idx] < 0)
                throwRuntimeException(row, -1, "NEW_ORDER_WAIT_TIME < 0");

            HashMap<String, Integer> mapItem = parseSheet.getMapItemNum(row, "AIRSHIP_REWARD");
            int num = parseSheet.getInt(row, "AIRSHIP_REPUTATION");
            if (num > 0)
                addItem(mapItem, Const.ITEM_REPUTATION, num);
            levelInfo.AIRSHIP_REWARD_NAME[idx] = convertKeyStrings(mapItem);
            levelInfo.AIRSHIP_REWARD_NUM[idx] = convertValueInts(mapItem);
            levelInfo.MAX_AIRSHIP_PER_DAY[idx] = parseSheet.getInt(row, "MAX_AIRSHIP_PER_DAY");
            levelInfo.FRIEND_REPU_DAILY_LIMIT[idx] = parseSheet.getInt(row, "FRIEND_REPU_DAILY_LIMIT");

            if (ExportExcel.isServer)
            {
                levelInfo.DO_FREE_PLANT_MAX[idx] = parseSheet.getInt(row, "DO_FREE_PLANT_MAX");
                levelInfo.DO_PAID_PLANT_MAX[idx] = parseSheet.getInt(row, "DO_PAID_PLANT_MAX");
                levelInfo.DO_RANDOM_PLANT_NAME[idx] = parseSheet.toArrayItemId(row, "DO_RANDOM_PLANT_NAME");

                levelInfo.DO_PLANT_PER_ORDER[idx] = Math.max(1, Math.min(levelInfo.DO_RANDOM_PLANT_NAME[idx].length, parseSheet.getInt(row, "DO_PLANT_PER_ORDER")));

                levelInfo.ORDER_BUG_PEARL_RATE[idx] = parseSheet.getInt(row, "ORDER_BUG_PEARL_RATE");

                rateA = parseSheet.getInt(row, "ORDER_BUG_RATE");
                rateB = parseSheet.getInt(row, "ORDER_PEARL_RATE");
                levelInfo.ORDER_BUG_RATE[idx] = rateA + (100 - rateA) * (100 - rateB) / 100;

                levelInfo.BUG_PEARL_PER_ORDER[idx] = parseSheet.getInt(row, "BUG_PEARL_PER_ORDER");
                levelInfo.ORDER_BUG_PEARL_MAX[idx] = parseSheet.getInt(row, "ORDER_BUG_PEARL_MAX");

                rateA = parseSheet.getInt(row, "NO_PLANT_RATE");
                rateB = parseSheet.getInt(row, "NO_PRODUCT_RATE");
                levelInfo.NO_PLANT_RATE[idx] = rateA + (100 - rateA) * (100 - rateB) / 100;

                levelInfo.NO_ITEM_PER_ORDER[idx] = parseSheet.getInt(row, "NO_ITEM_PER_ORDER");
                levelInfo.NO_ITEM_MAX[idx] = parseSheet.getInt(row, "NO_ITEM_MAX");

                rateA = parseSheet.getInt(row, "ORDER_CONTROL_ENOUGH");
                rateB = parseSheet.getInt(row, "ORDER_CONTROL_MISS");
                levelInfo.ORDER_CONTROL_ENOUGH[idx] = rateA + (100 - rateA) * (100 - rateB) / 100;

                levelInfo.DAILY_ORDER_DIAMOND_RATIO[idx] = parseSheet.getFloat(row, "DAILY_ORDER_DIAMOND_RATIO");
                levelInfo.DO_FREE_GOLD_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "DO_FREE_GOLD_COEFFICIENT_RATIO");
                levelInfo.DO_FREE_EXP_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "DO_FREE_EXP_COEFFICIENT_RATIO");
                levelInfo.DO_PAID_GOLD_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "DO_PAID_GOLD_COEFFICIENT_RATIO");
                levelInfo.DO_PAID_EXP_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "DO_PAID_EXP_COEFFICIENT_RATIO");
                levelInfo.BUG_PEARL_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "BUG_PEARL_COEFFICIENT_RATIO");
                levelInfo.NO_GOLD_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "NO_GOLD_COEFFICIENT_RATIO");
                levelInfo.NO_XP_COEFFICIENT_RATIO[idx] = parseSheet.getFloat(row, "NO_XP_COEFFICIENT_RATIO");

                levelInfo.AIRSHIP_STAY_RATIO[idx] = parseSheet.getFloat(row, "AIRSHIP_STAY_RATIO");
                levelInfo.AIRSHIP_MIN_ITEM_TYPE[idx] = parseSheet.getInt(row, "AIRSHIP_MIN_ITEM_TYPE");
                levelInfo.AIRSHIP_MAX_ITEM_TYPE[idx] = parseSheet.getInt(row, "AIRSHIP_MAX_ITEM_TYPE");
                levelInfo.AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE[idx] = parseSheet.getInt(row, "AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE");
                levelInfo.AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE[idx] = parseSheet.getInt(row, "AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE");

                colName = "AIRSHIP_EASY_REQUEST";
                mapItem = parseSheet.getMapItemNum(row, colName);
                levelInfo.AIRSHIP_EASY_REQUEST_NAME[idx] = convertKeyStrings(mapItem);
                levelInfo.AIRSHIP_EASY_REQUEST_PERCENT[idx] = convertValuePercent(mapItem);
                checkLevel(colName, level, levelInfo.AIRSHIP_EASY_REQUEST_NAME[idx]);

                colName = "AIRSHIP_MEDIUM_REQUEST";
                mapItem = parseSheet.getMapItemNum(row, colName);
                levelInfo.AIRSHIP_MEDIUM_REQUEST_NAME[idx] = convertKeyStrings(mapItem);
                levelInfo.AIRSHIP_MEDIUM_REQUEST_PERCENT[idx] = convertValuePercent(mapItem);
                checkLevel(colName, level, levelInfo.AIRSHIP_MEDIUM_REQUEST_NAME[idx]);

                colName = "AIRSHIP_HARD_REQUEST";
                mapItem = parseSheet.getMapItemNum(row, colName);
                levelInfo.AIRSHIP_HARD_REQUEST_NAME[idx] = convertKeyStrings(mapItem);
                levelInfo.AIRSHIP_HARD_REQUEST_PERCENT[idx] = convertValuePercent(mapItem);
                checkLevel(colName, level, levelInfo.AIRSHIP_HARD_REQUEST_NAME[idx]);

                levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY[idx] = parseSheet.getInt(row, "AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY");
                levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY[idx] = parseSheet.getInt(row, "AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY");
                levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM[idx] = parseSheet.getInt(row, "AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM");
                levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM[idx] = parseSheet.getInt(row, "AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM");
                levelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD[idx] = parseSheet.getInt(row, "AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD");
                levelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD[idx] = parseSheet.getInt(row, "AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD");

                levelInfo.PS_ITEM_EXPIRED_TIME[idx] = parseSheet.getInt(row, "PS_ITEM_EXPIRED_TIME");
            }

            idx++;
        }

        levelInfo.EXP[maxLevel - 1] = 0;//exp của level cuối cùng phải bằng 0

        addConstInfo(levelInfo, null);
    }

    public void checkLevel (String colName, int level, String[] items)
    {
        boolean hasError = false;
        for (String item : items)
        {
            ItemInfo info = mapItemInfo.get(item);
            if (info.LEVEL_UNLOCK > 0 && level > 0 && level < info.LEVEL_UNLOCK)
            {
                hasError = true;
                Log.console("[" + colName + "]", "[Level " + level + "]", idToName(item), "LEVEL_UNLOCK", info.LEVEL_UNLOCK);
                continue;
            }
        }
//        if (hasError)
//        {
//            throwRuntimeException("error in checkLevel");
//        }
    }
}
