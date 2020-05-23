package exportexcel.sheet;

import data.*;
import exportexcel.Log;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

public class Fishing extends ParseWorkbook {

    public FishingInfo fishingInfo = new FishingInfo();

    public Fishing(String inputName) throws Exception {
        super(inputName);
    }

    @Override
    public void handle() {
        Define.parseMiscInfo(parseSheetRow("Misc info"));
        parseFishRate(parseSheetRow("Fish Rate"));
        parseFishingReward(parseSheetRow("Reward Default"));
        parseMinigameBar(parseSheetRow("Minigame bar"));
        parseMinigameBarRate(parseSheetRow("Minigame bar Rate"));
        parseFishWeight(parseSheetRow("Fish Weight"));
        parseFishReward(parseSheetRow("Fish Reward"));
        parseFeatureDrop("Feature Drop");
        addConstInfo(fishingInfo, null);
    }

    private void parseFishRate(ParseSheetRow ps) {
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++) {
            FishingInfo.FishRate fishRate = new FishingInfo.FishRate();

            int turn = ps.getInt(row, "TURN");
            fishRate.FISH_NUM_MIN = ps.getInt(row, "FISH_NUM_MIN");
            fishRate.FISH_NUM_MAX = ps.getInt(row, "FISH_NUM_MAX");
            fishRate.FISH_RATE = ps.getMapItemNum(row, "FISH_RATE");

            fishingInfo.FISH_RATES.put(turn, fishRate);
        }
    }

    private void parseFishingReward(ParseSheetRow ps) {
        int numRow = ps.sheet.getLastRowNum() + 1;
        String currentFish = "";
        int currentMilestone = 0;

        for (int row = 1; row < numRow; row++) {
            if (ps.isEmptyCell(row, "FISH")) {

                if (ps.isEmptyCell(row, "MILESTONE")) {
                    //Log.debug("cell: ", ps.getMapItemNum(row, "REWARD"));
                    HashMap<String, Integer> mapItem = ps.getMapItemNum(row, "REWARD");
                    int rate = ps.getInt(row, "RATE");

                    FishingInfo.RewardDefault rewardDefault = new FishingInfo.RewardDefault(mapItem, rate);
                    fishingInfo.FISHING_REWARD.get(currentFish).get(currentMilestone).add(rewardDefault);
                } else {
                    // Log.debug("cell: ", ps.getInt(row, "MILESTONE"));
                    currentMilestone = ps.getInt(row, "MILESTONE");
                    if (!fishingInfo.FISHING_REWARD.get(currentFish).containsKey(currentMilestone))
                        fishingInfo.FISHING_REWARD.get(currentFish).put(currentMilestone, new ArrayList<FishingInfo.RewardDefault>());
                }
            } else {
                // Log.debug("cell: ", ps.getString(row, "FISH"));
                currentFish = ps.getString(row, "FISH");
                if (!fishingInfo.FISHING_REWARD.containsKey(currentFish))
                    fishingInfo.FISHING_REWARD.put(currentFish, new TreeMap<Integer, List<FishingInfo.RewardDefault>>());
            }
        }
    }

    private void parseMinigameBar(ParseSheetRow ps) {
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++) {
            FishingInfo.MinigameBar minigameBar = new FishingInfo.MinigameBar();
            minigameBar.TYPE = ps.getString(row, "TYPE");
            minigameBar.AREA_MIN = ps.getInt(row, "AREA_MIN");
            minigameBar.AREA_MAX = ps.getInt(row, "AREA_MAX");
            minigameBar.APPEAR_TIME = ps.getInt(row, "APPEAR_TIME");
            minigameBar.SLIDER_SPEED = ps.getInt(row, "SLIDER_SPEED");
	    minigameBar.GFX = ps.getString(row,"GFX");
            fishingInfo.FISHING_MINIGAME_BAR.add(minigameBar);
        }
    }
    private void parseMinigameBarRate(ParseSheetRow ps) {
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++) {
            int level = ps.getInt(row, "LEVEL");
            int[] rate = ps.getArrayInt(row, "RATE");
            if (rate.length < fishingInfo.FISHING_MINIGAME_BAR.size())
                throw new RuntimeException("size Rate: "+ rate.length +"< num Type of Minigame bar : "+  fishingInfo.FISHING_MINIGAME_BAR.size());
           fishingInfo.FISHING_MINIGAME_BAR_RATE.put(level,rate);
        }
    }
    private String tryParseString(String input) {
        if (input == "null" || input == null || input.isEmpty())
            return input;

        String itemId = ParseWorkbook.mapIdName.inverse().get(input.toLowerCase());
        if (itemId != null)
            return itemId;

        String defineNum = Define.defineToString(input);
        if (defineNum != null)
            return defineNum;

        return null;
    }

    private void parseFeatureDrop(String idSheet) {
        ParseSheetRow parseSheet = parseSheetRow(idSheet);
        int maxRow = parseSheet.sheet.getLastRowNum();
        this.fishingInfo.FEATURE_DROP_LIST = new FeatureDropItemInfo(Util.toItemId(Define.miscJson.get("FISHING_DEFAULT_DROP_ITEM").getAsString()));
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

            this.fishingInfo.FEATURE_DROP_LIST.add(featureActionId, option, rate, quantity, dailyLimit, dropItemId);
        }
    }

    private void parseFishWeight(ParseSheetRow ps) {
        int numRow = ps.sheet.getLastRowNum() + 1;
        String currentType = "";

        for (int row = 1; row < numRow; row++) {
            if (ps.isEmptyCell(row, "TYPE")) {

                String fish = Util.toItemId(ps.getString(row, "FISH_NAME"));
                FishingInfo.FishWeight fishWeight = new FishingInfo.FishWeight();
                fishWeight.MIN = ps.getFloat(row, "MIN");
                fishWeight.MAX = ps.getFloat(row, "MAX");
                if (!fishingInfo.FISH_WEIGHT.get(currentType).containsKey(fish))
                    fishingInfo.FISH_WEIGHT.get(currentType).put(fish, fishWeight);
            } else {
                currentType = ps.getString(row, "TYPE");
                if (!fishingInfo.FISH_WEIGHT.containsKey(currentType))
                    fishingInfo.FISH_WEIGHT.put(currentType, new TreeMap<String, FishingInfo.FishWeight>());
            }
        }
    }

    private void parseFishReward(ParseSheetRow ps) {
        int numRow = ps.sheet.getLastRowNum() + 1;
        String currentFish = "";

        for (int row = 1; row < numRow; row++) {
            if (ps.isEmptyCell(row, "FISH")) {

                int groupLV =ps.getInt(row, "GROUP_LV");
                FishingInfo.FishReward fishReward = new FishingInfo.FishReward();
                fishReward.GOLD = ps.getInt(row, "GOLD");
                fishReward.EXP = ps.getInt(row, "EXP");
                if (!fishingInfo.FISH_REWARD.get(currentFish).containsKey(groupLV))
                    fishingInfo.FISH_REWARD.get(currentFish).put(groupLV, fishReward);
            } else {
                currentFish =  Util.toItemId(ps.getString(row, "FISH"));
                if (!fishingInfo.FISH_REWARD.containsKey(currentFish))
                    fishingInfo.FISH_REWARD.put(currentFish, new TreeMap<>());
            }
        }
    }
}