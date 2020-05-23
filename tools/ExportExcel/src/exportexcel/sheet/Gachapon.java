package exportexcel.sheet;

import data.GachaponInfo;
import java.util.ArrayList;
import java.util.HashMap;

public class Gachapon extends ParseWorkbook {
    public static GachaponInfo gachaponInfo = new GachaponInfo();

    public Gachapon(String inputName) throws Exception {
        super(inputName);
    }

    @Override
    public void handle() throws Exception {
        Define.parseMiscInfo(parseSheetRow("Misc Info"));
        parseRewards("Rewards Default");
        parseSpecialRewards("Rewards Special");
        addConstInfo(gachaponInfo, null);
    }
    private void parseRewards(String idSheet) {
        ParseSheetRow ps = parseSheetRow(idSheet);
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++)
        {
            GachaponInfo.RewardInfo rewardInfo = new GachaponInfo.RewardInfo();
            rewardInfo.REWARD_ID = ps.getInt(row, "REWARD_ID");
            rewardInfo.REWARDS.putAll(ps.getMapItemNum(row, "REWARDS"));
            if (rewardInfo.REWARDS.isEmpty())
                throwRuntimeException("Empty reward in ID: " + rewardInfo.REWARD_ID);
            rewardInfo.TURN_NUMBER = ps.getInt(row,"TURN_NUMBER");
            rewardInfo.RATE = ps.getInt(row, "RATE");
            rewardInfo.DISPLAY_COLOR = ps.getInt(row,"DISPLAY_COLOR");
            gachaponInfo.REWARDS_DEFAULT.add(rewardInfo);
        }
    }

    private void parseSpecialRewards(String idSheet) {
        ParseSheetRow ps = parseSheetRow(idSheet);
        int numRow = ps.sheet.getLastRowNum() + 1;
        int currentMilestone = 0;

        HashMap<String, Integer> rewards = new HashMap<>();
        for (int row = 1; row < numRow; row++) {
            if (ps.isEmptyCell(row, "TURN_MILESTONE")) {
                GachaponInfo.RewardInfo rewardInfo = new GachaponInfo.RewardInfo();
                rewardInfo.REWARD_ID = ps.getInt(row,"REWARD_ID");
                rewardInfo.REWARDS.putAll(ps.getMapItemNum(row, "REWARDS"));
                if (rewardInfo.REWARDS.isEmpty())
                    throwRuntimeException("Empty reward in ID: " + rewardInfo.REWARD_ID);
                rewardInfo.RATE = ps.getInt(row,"RATE");
                gachaponInfo.REWARDS_SPECIAL.get(currentMilestone).add(rewardInfo);

            } else {
                currentMilestone = ps.getInt(row, "TURN_MILESTONE");
                gachaponInfo.REWARDS_SPECIAL.put(currentMilestone,new ArrayList<>());
                rewards.clear();
            }
        }
    }

}
