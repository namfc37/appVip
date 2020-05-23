package data;

import java.util.List;
import java.util.TreeMap;

public class UserLevelInfo
{
    public short[]    LEVEL;
    public long[]     EXP;
    public String[][] SEED_UNLOCK;
    public String[][] POT_UNLOCK;
    public String[][] PROD_UNLOCK;
    public int[]      FLOOR_UNLOCK;
    public String[]   MACHINE_UNLOCK;
    public String[][] REWARD_ITEM_NAME;
    public int[][]    REWARD_ITEM_NUM;
    public int[]      GOLD_PER_DIAMOND;
    public int[]      ORDER_SLOT_UNLOCK;

    //file Constants
    public int[] DO_FREE_UNLOCK;
    public int[] DO_PAID_UNLOCK;
    public int[] NEW_ORDER_WAIT_TIME;

    public int[]      DO_PLANT_PER_ORDER;
    public int[]      DO_FREE_PLANT_MAX;
    public int[]      DO_PAID_PLANT_MAX;
    public String[][] DO_RANDOM_PLANT_NAME;
    public int[]      ORDER_BUG_PEARL_RATE;
    public int[]      ORDER_BUG_RATE;
    public int[]      BUG_PEARL_PER_ORDER;
    public int[]      ORDER_BUG_PEARL_MAX;
    public int[]      NO_PLANT_RATE;
    public int[]      NO_ITEM_PER_ORDER;
    public int[]      NO_ITEM_MAX;
    public int[]      ORDER_CONTROL_ENOUGH;
    public float[]    DAILY_ORDER_DIAMOND_RATIO;
    public float[]    DO_FREE_GOLD_COEFFICIENT_RATIO;
    public float[]    DO_FREE_EXP_COEFFICIENT_RATIO;
    public float[]    DO_PAID_GOLD_COEFFICIENT_RATIO;
    public float[]    DO_PAID_EXP_COEFFICIENT_RATIO;
    public float[]    BUG_PEARL_COEFFICIENT_RATIO;
    public float[]    NO_GOLD_COEFFICIENT_RATIO;
    public float[]    NO_XP_COEFFICIENT_RATIO;

    public int[]      MAX_AIRSHIP_PER_DAY;
    public String[][] AIRSHIP_REWARD_NAME;
    public int[][]    AIRSHIP_REWARD_NUM;
    public float[]    AIRSHIP_STAY_RATIO;
    public int[]      AIRSHIP_MIN_ITEM_TYPE;
    public int[]      AIRSHIP_MAX_ITEM_TYPE;
    public int[]      AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE;
    public int[]      AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE;
    public String[][] AIRSHIP_EASY_REQUEST_NAME;
    public int[][]    AIRSHIP_EASY_REQUEST_PERCENT;
    public String[][] AIRSHIP_MEDIUM_REQUEST_NAME;
    public int[][]    AIRSHIP_MEDIUM_REQUEST_PERCENT;
    public String[][] AIRSHIP_HARD_REQUEST_NAME;
    public int[][]    AIRSHIP_HARD_REQUEST_PERCENT;
    public int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY;
    public int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY;
    public int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM;
    public int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM;
    public int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD;
    public int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD;

    public List<TreeMap<Integer, Integer>> BUG_TIME_RANGE;
    public int[][]                         BUG_NUM;
    public int[]                           BUG_PERCENT_FAKE;
    public List<TreeMap<Integer, String>>  BUG_APPEAR;

    public int[] PS_ITEM_EXPIRED_TIME;
    public int[] FRIEND_REPU_DAILY_LIMIT;
}
