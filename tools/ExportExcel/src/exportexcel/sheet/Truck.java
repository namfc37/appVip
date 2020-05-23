package exportexcel.sheet;


import data.TruckInfo;
import exportexcel.ExportExcel;
import exportexcel.Log;

import java.util.Map;
import java.util.TreeMap;

public class Truck extends ParseWorkbook {
    public static TruckInfo truckInfo = new TruckInfo();

    public Truck(String inputName) throws Exception {
        super(inputName);
    }

    @Override
    public void handle() throws Exception {

        Define.parseMiscInfo(parseSheetRow("Misc Info"));
        if (ExportExcel.isServer) parseTruckRequire(parseSheetRow("TruckRequireInfo"));
        parseTruckLevel(parseSheetRow("TruckLevel"));
        addConstInfo(truckInfo, null);
    }

    private void parseTruckRequire(ParseSheetRow ps) {
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++) {
            TruckInfo.TruckRequireInfo truckRequireInfo = new TruckInfo.TruckRequireInfo();
            truckRequireInfo.LEVEL = ps.getInt(row, "LEVEL");
            truckRequireInfo.STAY_RATIO = ps.getFloat(row, "TRUCK_STAY_RATIO");
            truckRequireInfo.GOLD_COEFFICIENT_RATIO = ps.getFloat(row, "TRUCK_GOLD_COEFFICIENT_RATIO");
            truckRequireInfo.EXP_COEFFICIENT_RATIO = ps.getFloat(row, "TRUCK_EXP_COEFFICIENT_RATIO");
            truckRequireInfo.MIN_ITEM_TYPE = ps.getInt(row, "TRUCK_MIN_ITEM_TYPE");
            truckRequireInfo.MAX_ITEM_TYPE = ps.getInt(row, "TRUCK_MAX_ITEM_TYPE");
            truckRequireInfo.MIN_BAG_NUM_PER_ITEM_TYPE = ps.getInt(row, "TRUCK_MIN_BAG_NUM_PER_ITEM_TYPE");
            truckRequireInfo.MAX_BAG_NUM_PER_ITEM_TYPE = ps.getInt(row, "TRUCK_MAX_BAG_NUM_PER_ITEM_TYPE");
            truckRequireInfo.EASY_REQUIRE.putAll(ps.getMapItemNum(row, "TRUCK_EASY_REQUEST"));
            truckRequireInfo.MEDIUM_REQUIRE.putAll(ps.getMapItemNum(row, "TRUCK_MEDIUM_REQUEST"));
            truckRequireInfo.HARD_REQUIRE.putAll(ps.getMapItemNum(row, "TRUCK_HARD_REQUEST"));
          /*  int percent = 0;
            for (Map.Entry<String,Integer> entry : truckRequireInfo.EASY_REQUIRE.entrySet())
            {
                String key=entry.getKey();
                Integer value=entry.getValue();
                entry.setValue(percent + value);
                System.out.println("Key "+key + " value "+value);
                percent=entry.getValue();
            }

            percent=0;


            for (Map.Entry<String,Integer> entry : truckRequireInfo.MEDIUM_REQUIRE.entrySet())
            {
                String key=entry.getKey();
                Integer value=entry.getValue();

                entry.setValue(percent + value);
                System.out.println("Key "+key + " value "+value);
                percent=entry.getValue();
            }*/
            truckRequireInfo.MIN_NUM_REQUIRE_ITEM_EASY = ps.getInt(row, "TRUCK_MIN_NUM_REQUIRE_ITEM_EASY");
            truckRequireInfo.MAX_NUM_REQUIRE_ITEM_EASY = ps.getInt(row, "TRUCK_MAX_NUM_REQUIRE_ITEM_EASY");
            truckRequireInfo.MIN_NUM_REQUIRE_ITEM_MEDIUM = ps.getInt(row, "TRUCK_MIN_NUM_REQUIRE_ITEM_MEDIUM");
            truckRequireInfo.MAX_NUM_REQUIRE_ITEM_MEDIUM = ps.getInt(row, "TRUCK_MAX_NUM_REQUIRE_ITEM_MEDIUM");
            truckRequireInfo.MIN_NUM_REQUIRE_ITEM_HARD = ps.getInt(row, "TRUCK_MIN_NUM_REQUIRE_ITEM_HARD");
            truckRequireInfo.MAX_NUM_REQUIRE_ITEM_HARD = ps.getInt(row, "TRUCK_MAX_NUM_REQUIRE_ITEM_HARD");
            truckRequireInfo.REPUTATION = ps.getInt(row, "TRUCK_REPUTATION");
            truckRequireInfo.REWARDS = ps.getMapItemNum(row,"TRUCK_REWARD");

            truckInfo.REQUIRES_INFO.put(truckRequireInfo.LEVEL, truckRequireInfo);
            // truckInfo.truckRequireInfoList.put(truckRequireInfo.LEVEL,truckRequireInfo);
        }
    }

    private void parseTruckLevel(ParseSheetRow ps) {
        int maxRow = ps.sheet.getLastRowNum() + 1;
        truckInfo.LEVELS = new TruckInfo.Level[maxRow - 1];
        for (int row = 1; row < maxRow; row++) {
            TruckInfo.Level truckLevel = new TruckInfo.Level();
          //  truckLevel.LEVEL = ps.getInt(row, "LEVEL");
            truckLevel.DELIVERY_REQ = ps.getInt(row, "DELIVERY REQ");
            truckLevel.GOLD_UPGRADE = ps.getInt(row, "GOLD_UPGRADE");
            truckLevel.UPGRADE_RATIO = ps.getInt(row, "UPGRADE_RATIO");
            truckLevel.ARRIVE_REDUCE_TIME = ps.getInt(row, "ARRIVE_REDUCE_TIME");
            truckLevel.EXP_BONUS = ps.getInt(row, "EXP_BONUS");
            truckLevel.GOLD_BONUS = ps.getInt(row, "GOLD_BONUS");

            truckInfo.LEVELS[row - 1] = truckLevel;
            // truckInfo.truckRequireInfoList.put(truckRequireInfo.LEVEL,truckRequireInfo);
        }
    }

/*
    private void parseVIPInfo(ParseSheetRow ps)
    {

        int maxRow = ps.sheet.getLastRowNum() + 1;
        for (int row = 1; row < maxRow; row++)
        {
            VIPInfo.VIPItem vipInfoItem = new VIPInfo.VIPItem();
            vipInfoItem.ID = ps.getString(row, "ID");
            vipInfoItem.DURATION = ps.getInt(row,"DURATION");
            vipInfoItem.CONVERT_GOLD_BONUS = ps.getInt(row,"CONVERT_GOLD_BONUS");
            vipInfoItem.DAILY_LOGIN_REWARD =ps.getMapItemNum(row, "DAILY_LOGIN_REWARD");
            vipInfoItem.UPGRADE_POT_RATE = ps.getInt(row, "UPGRADE_POT_RATE");
            vipInfoItem.BLACKSMITH_RATE = ps.getInt(row, "BLACKSMITH_RATE");
            vipInfoItem.AIRSHIP_GOLD_BONUS = ps.getInt(row, "AIRSHIP_GOLD_BONUS");
            vipInfoItem.BUG_RATE = ps.getInt(row, "BUG_RATE");

            vipInfo.VIP_ITEMS.put(vipInfoItem.ID,vipInfoItem);
        }

    }
    */
}
