package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

/**
 * Created by CPU12398-local on 8/27/2019.
 */
public class FishingInfo {


    public TreeMap<Integer, FishRate> FISH_RATES = new TreeMap<Integer, FishRate>();
    public HashMap<String, TreeMap<Integer, List<RewardDefault>>> FISHING_REWARD = new HashMap<>();

    //public HashMap<String, TreeMap<Integer, List<TreeMap<String, Integer>>>> FISHING_REWARD = new HashMap<>();
    //public HashMap<String, TreeMap<Integer, List<Integer>>> FISHING_REWARD = new HashMap<>();

    public List<MinigameBar> FISHING_MINIGAME_BAR = new ArrayList<>();
    public TreeMap<Integer, int[]> FISHING_MINIGAME_BAR_RATE = new TreeMap<>();

    public HashMap<String, TreeMap<String, FishWeight>> FISH_WEIGHT = new HashMap<>();
    public HashMap<String, TreeMap<Integer, FishReward>> FISH_REWARD = new HashMap<>();

    public FeatureDropItemInfo FEATURE_DROP_LIST;

    public static class MinigameBar
    {
        public String TYPE;
        public int    AREA_MIN;
        public int    AREA_MAX;
        public int    APPEAR_TIME;
        public int    SLIDER_SPEED;
	public String GFX;
    }

    public static class FishWeight{
        public float  MIN;
        public float  MAX;
    }

    public static class FishReward{
        public int   GOLD;
        public int   EXP;
    }

    public static class FishRate {
        public int FISH_NUM_MIN;
        public int FISH_NUM_MAX;
        public HashMap<String, Integer> FISH_RATE = new HashMap<>();
    }

    public static class RewardDefault {
        public TreeMap<String, Integer> reward = new TreeMap<>();
        public int rate;

        public RewardDefault(HashMap<String, Integer> rewards, int rate) {
            reward.putAll(rewards);
            this.rate = rate;
        }
    }

}
