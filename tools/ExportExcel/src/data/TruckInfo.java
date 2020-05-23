package data;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.TreeMap;

/**
 * Created by CPU12398-local on 8/27/2019.
 */
public class TruckInfo {


    public TreeMap<Integer, TruckRequireInfo> REQUIRES_INFO = new TreeMap<Integer, TruckRequireInfo> ();
    public Level[] LEVELS;

    public static class TruckRequireInfo
    {
        public int LEVEL;
        public float STAY_RATIO;
        public float GOLD_COEFFICIENT_RATIO;
        public float EXP_COEFFICIENT_RATIO;
        public int MIN_ITEM_TYPE;
        public int MAX_ITEM_TYPE;
        public int MIN_BAG_NUM_PER_ITEM_TYPE;
        public int MAX_BAG_NUM_PER_ITEM_TYPE;

        public TreeMap<String, Integer> EASY_REQUIRE = new TreeMap<String, Integer> ();
        public TreeMap<String, Integer> MEDIUM_REQUIRE = new TreeMap<String, Integer> ();
        public TreeMap<String, Integer> HARD_REQUIRE = new TreeMap<String, Integer> ();

        public int MIN_NUM_REQUIRE_ITEM_EASY;
        public int MAX_NUM_REQUIRE_ITEM_EASY;
        public int MIN_NUM_REQUIRE_ITEM_MEDIUM;
        public int MAX_NUM_REQUIRE_ITEM_MEDIUM;
        public int MIN_NUM_REQUIRE_ITEM_HARD;
        public int MAX_NUM_REQUIRE_ITEM_HARD;
        public int REPUTATION;
        public HashMap<String, Integer> REWARDS = new HashMap<String, Integer>();

    }
    public static class Level
    {
       // public int LEVEL;
        public int DELIVERY_REQ;
        public int GOLD_UPGRADE;
        public int UPGRADE_RATIO;
        public int ARRIVE_REDUCE_TIME;
        public int EXP_BONUS;
        public int GOLD_BONUS;
    }
}
