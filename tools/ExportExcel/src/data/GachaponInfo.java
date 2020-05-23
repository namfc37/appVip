package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

public class GachaponInfo
{
    public ArrayList<RewardInfo> REWARDS_DEFAULT = new ArrayList<>();
    public HashMap<Integer,  ArrayList<RewardInfo>> REWARDS_SPECIAL = new HashMap<>();

    public static class RewardInfo {
        public int REWARD_ID;
        public HashMap<String, Integer> REWARDS = new HashMap<>();
        public int RATE;
        public int TURN_NUMBER;
        public int DISPLAY_COLOR;
    }
}
