package data;

import util.collection.MapItem;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class UserLevelInfo
{
    static UserLevelInfo instance;

    short[]    LEVEL;
    long[]     EXP;
    String[][] SEED_UNLOCK;
    String[][] POT_UNLOCK;
    String[][] PROD_UNLOCK;
    int[]      FLOOR_UNLOCK;
    String[]   MACHINE_UNLOCK;
    String[][] REWARD_ITEM_NAME;
    int[][]    REWARD_ITEM_NUM;
    int[]      GOLD_PER_DIAMOND;
    int[]      ORDER_SLOT_UNLOCK;

    //file Constants
    private int[]              DO_FREE_UNLOCK;
    private int[]              DO_PAID_UNLOCK;
    private int[]              NEW_ORDER_WAIT_TIME;
    private int[]              DO_PLANT_PER_ORDER;
    private int[]              DO_FREE_PLANT_MAX;
    private int[]              DO_PAID_PLANT_MAX;
    private List<List<String>> DO_RANDOM_PLANT_NAME;
    private int[]              ORDER_BUG_PEARL_RATE;
    private int[]              ORDER_BUG_RATE;
    private int[]              BUG_PEARL_PER_ORDER;
    private int[]              ORDER_BUG_PEARL_MAX;
    private int[]              NO_PLANT_RATE;
    private int[]              NO_ITEM_PER_ORDER;
    private int[]              NO_ITEM_MAX;
    private int[]              ORDER_CONTROL_ENOUGH;
    private float[]            DAILY_ORDER_DIAMOND_RATIO;
    private float[]            DO_FREE_GOLD_COEFFICIENT_RATIO;
    private float[]            DO_FREE_EXP_COEFFICIENT_RATIO;
    private float[]            DO_PAID_GOLD_COEFFICIENT_RATIO;
    private float[]            DO_PAID_EXP_COEFFICIENT_RATIO;
    private float[]            BUG_PEARL_COEFFICIENT_RATIO;
    private float[]            NO_GOLD_COEFFICIENT_RATIO;
    private float[]            NO_XP_COEFFICIENT_RATIO;

    int[]      MAX_AIRSHIP_PER_DAY;
    String[][] AIRSHIP_REWARD_NAME;
    int[][]    AIRSHIP_REWARD_NUM;
    float[]    AIRSHIP_STAY_RATIO;
    int[]      AIRSHIP_MIN_ITEM_TYPE;
    int[]      AIRSHIP_MAX_ITEM_TYPE;
    int[]      AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE;
    int[]      AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE;
    String[][] AIRSHIP_EASY_REQUEST_NAME;
    int[][]    AIRSHIP_EASY_REQUEST_PERCENT;
    String[][] AIRSHIP_MEDIUM_REQUEST_NAME;
    int[][]    AIRSHIP_MEDIUM_REQUEST_PERCENT;
    String[][] AIRSHIP_HARD_REQUEST_NAME;
    int[][]    AIRSHIP_HARD_REQUEST_PERCENT;
    int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY;
    int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY;
    int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM;
    int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM;
    int[]      AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD;
    int[]      AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD;

    private List<TreeMap<Integer, Integer>> BUG_TIME_RANGE;
    private int[][]                         BUG_NUM;
    private int[]                           BUG_PERCENT_FAKE;
    private List<TreeMap<Integer, String>>  BUG_APPEAR;

    private int[] PS_ITEM_EXPIRED_TIME;
    public  int[] FRIEND_REPU_DAILY_LIMIT;

    //cache info
    ArrayList<MapItem>             REWARD_ITEM;
    TreeMap<Integer, List<String>> TREE_UNLOCK_PLANT;
    TreeMap<Integer, List<String>> TREE_UNLOCK_PRODUCT;
    TreeMap<Integer, List<String>> TREE_UNLOCK_PEST;
    TreeMap<Integer, List<String>> TREE_UNLOCK_PEARL;
    TreeMap<Integer, List<String>> TREE_UNLOCK_POT;
    TreeMap<Integer, List<String>> TREE_UNLOCK_MINERAL;
    TreeMap<Integer, List<String>> TREE_UNLOCK_MATERIAL;
    HashMap<String, Integer>       MAP_LEVEL_UNLOCK;

    ArrayList<MapItem>                       AIRSHIP_REWARD;
    ArrayList<NavigableMap<Integer, String>> TREE_AIRSHIP_EASY_REQUEST;
    ArrayList<NavigableMap<Integer, String>> TREE_AIRSHIP_MEDIUM_REQUEST;
    ArrayList<NavigableMap<Integer, String>> TREE_AIRSHIP_HARD_REQUEST;


    public static int LEVEL (int level)
    {
        return instance.LEVEL[level];
    }

    public static long EXP (int level)
    {
        return instance.EXP[level];
    }

    public static int GOLD_PER_DIAMOND (int level)
    {
        return instance.GOLD_PER_DIAMOND[level];
    }

    public static int ORDER_SLOT_UNLOCK (int level)
    {
        return instance.ORDER_SLOT_UNLOCK[level];
    }

    public static MapItem REWARD_ITEM (int level)
    {
        return instance.REWARD_ITEM.get(level);
    }

    public static short maxLevel ()
    {
        return (short) instance.LEVEL.length;
    }

    public static int priceGoldToCoin (int level, double priceGold)
    {
        return Math.max(1, (int) Math.ceil(priceGold / instance.GOLD_PER_DIAMOND[level]));
    }

    //file Constants
    public static int DO_FREE_UNLOCK (int level)
    {
        return instance.DO_FREE_UNLOCK[level];
    }

    public static int DO_PAID_UNLOCK (int level)
    {
        return instance.DO_PAID_UNLOCK[level];
    }

    public static int NEW_ORDER_WAIT_TIME (int level)
    {
        return instance.NEW_ORDER_WAIT_TIME[level];
    }

    public static int DO_PLANT_PER_ORDER (int level)
    {
        return instance.DO_PLANT_PER_ORDER[level];
    }

    public static int DO_FREE_PLANT_MAX (int level)
    {
        return instance.DO_FREE_PLANT_MAX[level];
    }

    public static int DO_PAID_PLANT_MAX (int level)
    {
        return instance.DO_PAID_PLANT_MAX[level];
    }

    public static List<String> DO_RANDOM_PLANT_NAME (int level)
    {
        return instance.DO_RANDOM_PLANT_NAME.get(level);
    }

    public static int ORDER_BUG_PEARL_RATE (int level)
    {
        return instance.ORDER_BUG_PEARL_RATE[level];
    }

    public static int ORDER_BUG_RATE (int level)
    {
        return instance.ORDER_BUG_RATE[level];
    }

    public static int BUG_PEARL_PER_ORDER (int level)
    {
        return instance.BUG_PEARL_PER_ORDER[level];
    }

    public static int ORDER_BUG_PEARL_MAX (int level)
    {
        return instance.ORDER_BUG_PEARL_MAX[level];
    }

    public static int NO_PLANT_RATE (int level)
    {
        return instance.NO_PLANT_RATE[level];
    }

    public static int NO_ITEM_PER_ORDER (int level)
    {
        return instance.NO_ITEM_PER_ORDER[level];
    }

    public static int NO_ITEM_MAX (int level)
    {
        return instance.NO_ITEM_MAX[level];
    }

    public static int ORDER_CONTROL_ENOUGH (int level)
    {
        return instance.ORDER_CONTROL_ENOUGH[level];
    }

    public static float DAILY_ORDER_DIAMOND_RATIO (int level)
    {
        return instance.DAILY_ORDER_DIAMOND_RATIO[level];
    }

    public static float DO_FREE_GOLD_COEFFICIENT_RATIO (int level)
    {
        return instance.DO_FREE_GOLD_COEFFICIENT_RATIO[level];
    }

    public static float DO_FREE_EXP_COEFFICIENT_RATIO (int level)
    {
        return instance.DO_FREE_EXP_COEFFICIENT_RATIO[level];
    }

    public static float DO_PAID_GOLD_COEFFICIENT_RATIO (int level)
    {
        return instance.DO_PAID_GOLD_COEFFICIENT_RATIO[level];
    }

    public static float DO_PAID_EXP_COEFFICIENT_RATIO (int level)
    {
        return instance.DO_PAID_EXP_COEFFICIENT_RATIO[level];
    }

    public static float BUG_PEARL_COEFFICIENT_RATIO (int level)
    {
        return instance.BUG_PEARL_COEFFICIENT_RATIO[level];
    }

    public static float NO_GOLD_COEFFICIENT_RATIO (int level)
    {
        return instance.NO_GOLD_COEFFICIENT_RATIO[level];
    }

    public static float NO_XP_COEFFICIENT_RATIO (int level)
    {
        return instance.NO_XP_COEFFICIENT_RATIO[level];
    }

    public static int MAX_AIRSHIP_PER_DAY (int level)
    {
        return instance.MAX_AIRSHIP_PER_DAY[level];
    }

    public static float AIRSHIP_STAY_RATIO (int level)
    {
        return instance.AIRSHIP_STAY_RATIO[level];
    }

    public static int AIRSHIP_MIN_ITEM_TYPE (int level)
    {
        return instance.AIRSHIP_MIN_ITEM_TYPE[level];
    }

    public static int AIRSHIP_MAX_ITEM_TYPE (int level)
    {
        return instance.AIRSHIP_MAX_ITEM_TYPE[level];
    }

    public static int AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE (int level)
    {
        return instance.AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE[level];
    }

    public static int AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE (int level)
    {
        return instance.AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE[level];
    }

    public static int AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY (int level)
    {
        return instance.AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY[level];
    }

    public static int AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY (int level)
    {
        return instance.AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY[level];
    }

    public static int AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM (int level)
    {
        return instance.AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM[level];
    }

    public static int AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM (int level)
    {
        return instance.AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM[level];
    }

    public static int AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD (int level)
    {
        return instance.AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD[level];
    }

    public static int AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD (int level)
    {
        return instance.AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD[level];
    }

    public static final List<String> EMPTY_LIST_STRING = Collections.unmodifiableList(new ArrayList<>());

    public static List<String> UNLOCK_PLANT (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_PLANT.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static List<String> UNLOCK_PRODUCT (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_PRODUCT.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static List<String> UNLOCK_PEST (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_PEST.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static List<String> UNLOCK_PEARL (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_PEARL.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static List<String> UNLOCK_POT (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_POT.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static List<String> UNLOCK_MINERAL (int level)
    {
        Map.Entry<Integer, List<String>> entry = instance.TREE_UNLOCK_MINERAL.floorEntry(level);
        return entry == null ? EMPTY_LIST_STRING : entry.getValue();
    }

    public static int getUnlockLevel (String id)
    {
        Integer v = instance.MAP_LEVEL_UNLOCK.get(id);
        return v == null ? 0 : v;
    }

    public static NavigableMap<Integer, String> TREE_AIRSHIP_EASY_REQUEST (int level)
    {
        return instance.TREE_AIRSHIP_EASY_REQUEST.get(level);
    }

    public static NavigableMap<Integer, String> TREE_AIRSHIP_MEDIUM_REQUEST (int level)
    {
        return instance.TREE_AIRSHIP_MEDIUM_REQUEST.get(level);
    }

    public static NavigableMap<Integer, String> TREE_AIRSHIP_HARD_REQUEST (int level)
    {
        return instance.TREE_AIRSHIP_HARD_REQUEST.get(level);
    }

    public static MapItem AIRSHIP_REWARD (int level)
    {
        return instance.AIRSHIP_REWARD.get(level);
    }

    public static MapItem genFriendBug (int level)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int num = r.nextInt(instance.BUG_NUM[level][0], instance.BUG_NUM[level][1] + 1);
        MapItem m = new MapItem(true, num);
        String id;
        TreeMap<Integer, String> treeBug = instance.BUG_APPEAR.get(level);
        for (int i = 0; i < num; i++)
        {
            id = treeBug.floorEntry(r.nextInt(100)).getValue();
            m.increase(id, 1);
        }
        return m;
    }

    public static int genFriendBugTime (int level)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int pos = Math.min(level, instance.BUG_TIME_RANGE.size() - 1);
        TreeMap<Integer, Integer> tree = instance.BUG_TIME_RANGE.get(pos);
        return tree.floorEntry(r.nextInt(100)).getValue();
    }

    public static boolean isFakeFriendBug (int level)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int pos = Math.min(level, instance.BUG_PERCENT_FAKE.length - 1);
        int rate = instance.BUG_PERCENT_FAKE[pos];
        return r.nextInt(100) < rate;
    }

    public static int PS_ITEM_EXPIRED_TIME (int level)
    {
        return instance.PS_ITEM_EXPIRED_TIME[level];
    }

    public static int FRIEND_REPU_DAILY_LIMIT (int level)
    {
        return instance.FRIEND_REPU_DAILY_LIMIT[level];
    }
}
