package exportexcel.sheet;

import data.*;
import data.IBShopInfo.Item;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

public class Event03 extends ParseWorkbook {
    public Event03Info info;

    public Event03(String inputName) throws Exception {
        super(inputName);
    }

    @Override
    public void handle() {
        Define.parseMiscInfo(parseSheetRow("Misc Info"));

        parseInfo();
        parseFeatureDrop("Feature Drop");
        parsePlantDrop("Plant Drop");
        parseRewards("Rewards");

        addConstInfo(info, null);
    }

    private void parseInfo() {
        this.info = new Event03Info();
        this.info.E03_TYPE = Define.miscJson.get("EV03_TYPE").getAsString();
        this.info.E03_ID = Define.miscJson.get("EV03_ID").getAsString();
        this.info.E03_POINT = Define.miscJson.get("EV03_POINT").getAsString();
        this.info.E03_PLANT =			Define.miscJson.get("EV01_PLANT").getAsString();
        this.info.E03_DROPITEM =		Define.miscJson.get("EV03_DROP_ITEM").getAsString();
        this.info.E03_START_TIME = Define.miscJson.get("EV03_TIME_START").getAsString();
        this.info.E03_END_TIME = Define.miscJson.get("EV03_TIME_END").getAsString();

//		convert to itemId
        this.info.E03_ID = Util.toItemId(this.info.E03_ID);
        this.info.E03_POINT = Util.toItemId(this.info.E03_POINT);
        this.info.E03_DROPITEM =		Util.toItemId (this.info.E03_DROPITEM);


//		override key
        Define.miscJson.addProperty("EV03_ID", this.info.E03_ID);
        Define.miscJson.addProperty("EV03_POINT", this.info.E03_POINT);
        Define.miscJson.addProperty("EV03_PLANT", this.info.E03_PLANT);
        Define.miscJson.addProperty("EV03_DROP_ITEM", this.info.E03_DROPITEM);

//		convert time
        this.info.E03_UNIX_START_TIME = Util.toUnixTime(this.info.E03_START_TIME);
        this.info.E03_UNIX_END_TIME = Util.toUnixTime(this.info.E03_END_TIME);
        EventInfo.setEventDuration(this.info.E03_ID, this.info.E03_UNIX_START_TIME, this.info.E03_UNIX_END_TIME);

        this.info.E03_PLANT_DROP_LIST = new PlantDropItemInfo();
        this.info.E03_FEATURE_DROP_LIST = new FeatureDropItemInfo(this.info.E03_DROPITEM);
        this.info.E03_PUZZLE = new PuzzleInfo();

        this.info.E03_SHOP = new IBShopInfo();
        this.info.E03_SHOP.TAB = "event";
        this.info.E03_SHOP.NAME = "event";
        this.info.E03_SHOP.GFX = "";
        this.info.E03_SHOP.ITEMS = new ArrayList<Item>();

        this.info.E03_REWARDS = new TreeMap<Integer, TreeMap<Integer, Event03Reward>>();
    }

    private void parseFeatureDrop(String idSheet) {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        for (int r = 1; r <= maxRow; r++) {
            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
                break;

            String featureActionId = parseSheet.isEmptyCell(r, "ACTION") ? "" : parseSheet.getString(r, "ACTION");
            String option = parseSheet.isEmptyCell(r, "OPTION") ? "" : parseSheet.getString(r, "OPTION");
            float rate = parseSheet.isEmptyCell(r, "RATE") ? 1 : parseSheet.getFloat(r, "RATE");
            int quantity = parseSheet.isEmptyCell(r, "QUANTITY") ? -1 : parseSheet.getInt(r, "QUANTITY");
            int dailyLimit = parseSheet.isEmptyCell(r, "DAILY LIMIT") ? -1 : parseSheet.getInt(r, "DAILY LIMIT");
            String dropItemId = parseSheet.isEmptyCell(r, "TARGET_FISHING_TOKEN") ? "" : Util.toItemId(parseSheet.getString(r, "TARGET_FISHING_TOKEN"));

            if (featureActionId.isEmpty())
                continue;

            String temp = tryParseString(option);
            if (temp != null)
                option = temp;

            this.info.E03_FEATURE_DROP_LIST.add(featureActionId, option, rate, quantity, dailyLimit, dropItemId);
        }
    }

    private String tryParseString(String input) {
        if (input == "null" || input == null || input.isEmpty())
            return input;

        String itemId = ParseWorkbook.mapIdName.inverse().get(input.toLowerCase());
        if (itemId != null)
            return itemId;

        //String defineNum = Define.defineToString(input);
        String defineNum = ActionInfo.getActionStringValue(input);
        if (defineNum != null)
            return defineNum;

        return null;
    }

    private void parsePlantDrop(String idSheet) {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        for (int r = 1; r <= maxRow; r++) {
            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
                break;

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                continue;

            String item = parseSheet.getItemId(r, "ITEM");
            float rate = parseSheet.getFloat(r, "RATE");
            int min = parseSheet.getInt(r, "MIN");
            int max = parseSheet.getInt(r, "MAX");
            int userLimit = parseSheet.getInt(r, "USER LIMIT");
            int serverLimit = parseSheet.getInt(r, "SERVER LIMIT");
            boolean isVietNamOnly = parseSheet.getBoolean(r, "IS_VIETNAM_ONLY");
            this.info.E03_PLANT_DROP_LIST.add(item, rate, min, max, userLimit, serverLimit, isVietNamOnly);
        }
    }

    private void parseRewards(String idSheet) {
        HashMap<Integer, Event03Reward> checkIds = new HashMap<Integer, Event03Reward>();

        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        for (int r = 1; r <= maxRow; r++) {
            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
                break;

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                continue;

            int id = parseSheet.getInt(r, "REWARD_ID");
            if (checkIds.containsKey(id)) {
                throwRuntimeException(r, 0, "Double REWARD_ID: " + id);
                break;
            }

            int checkpoint = parseSheet.getInt(r, "EVENT POINTS") * 100;
            int groupLv = parseSheet.getInt(r, "GROUP_LV");
            if (groupLv < 0)
                groupLv = Integer.MAX_VALUE;

            int total = -1;

            if (!parseSheet.isEmptyCell(r, "REWARD_NUM"))
                total = parseSheet.getInt(r, "REWARD_NUM");

            Event03Reward reward = new Event03Reward(total);
            reward.id = id;

            for (int i = 0; i < 6; i++) {
                if (parseSheet.isEmptyCell(r, "REWARD_" + i))
                    continue;

                HashMap<String, Integer> items = parseSheet.getMapItemNum(r, "REWARD_" + i);
                int rate = -1;

                if (!parseSheet.isEmptyCell(r, "RATE_" + i))
                    rate = parseSheet.getInt(r, "RATE_" + i);

                reward.add(items, rate);
            }

            checkIds.put(id, reward);

            if (reward.check()) {
                TreeMap<Integer, Event03Reward> checkpoint_rewards = this.info.E03_REWARDS.get(checkpoint);
                if (checkpoint_rewards == null) {
                    checkpoint_rewards = new TreeMap<Integer, Event03Reward>();
                    this.info.E03_REWARDS.put(checkpoint, checkpoint_rewards);
                }

                checkpoint_rewards.put(groupLv, reward);
            } else
                throwRuntimeException(r, "checkpoint " + checkpoint + " parse fail");
        }
    }

    private void parsePuzzle(String idSheet) {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        for (int r = 1; r <= maxRow; r++) {
            Row row = parseSheet.sheet.getRow(r);
            if (row == null)
                break;

            Cell cell = row.getCell(0);
            if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                continue;

            String id = parseSheet.getString(r, "ID");
            HashMap<String, Integer> require = parseSheet.getMapItemNum(r, "REQUIRE");
            HashMap<String, Integer> rewards = parseSheet.getMapItemNum(r, "REWARDS");
            int displayOrder = parseSheet.getInt(r, "DISPLAY_ORDER");
            boolean isVietNamOnly = parseSheet.getBoolean(r, "IS_VIETNAM_ONLY");
            this.info.E03_PUZZLE.add(id, require, rewards, displayOrder, isVietNamOnly);
        }
    }
}