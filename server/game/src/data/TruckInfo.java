package data;

import util.collection.MapItem;

import java.util.*;

public class TruckInfo
{
    private NavigableMap<Integer, TruckRequireInfo> REQUIRES_INFO;
    private Level[]                                 LEVELS;

    public NavigableMap<Integer, TruckRequireInfo> REQUIRES_INFO ()
    {
        return REQUIRES_INFO;
    }

    public TruckRequireInfo getTruckRequireInfo (int level)
    {
        return REQUIRES_INFO.get(REQUIRES_INFO.floorKey(level));

    }

    public Level[] LEVELS ()
    {
        return LEVELS;
    }

    public void init ()
    {
        for (Integer level : this.REQUIRES_INFO.keySet())
            this.REQUIRES_INFO.get(level).init();
        REQUIRES_INFO = Collections.unmodifiableNavigableMap(REQUIRES_INFO);

    }

    public Level getTruckLevelInfo (int level)
    {
        if (level > LEVELS.length) return null;
        return LEVELS[level - 1];
    }


    public static class TruckRequireInfo
    {
        private int   LEVEL;
        private float STAY_RATIO;
        private float GOLD_COEFFICIENT_RATIO;
        private float EXP_COEFFICIENT_RATIO;
        private int   MIN_ITEM_TYPE;
        private int   MAX_ITEM_TYPE;
        private int   MIN_BAG_NUM_PER_ITEM_TYPE;
        private int   MAX_BAG_NUM_PER_ITEM_TYPE;

        private MapItem EASY_REQUIRE;
        private MapItem MEDIUM_REQUIRE;
        private MapItem HARD_REQUIRE;

        private int     MIN_NUM_REQUIRE_ITEM_EASY;
        private int     MAX_NUM_REQUIRE_ITEM_EASY;
        private int     MIN_NUM_REQUIRE_ITEM_MEDIUM;
        private int     MAX_NUM_REQUIRE_ITEM_MEDIUM;
        private int     MIN_NUM_REQUIRE_ITEM_HARD;
        private int     MAX_NUM_REQUIRE_ITEM_HARD;
        private int     REPUTATION;
        private MapItem REWARDS;

        public void init ()
        {
            this.EASY_REQUIRE = this.EASY_REQUIRE.toUnmodifiableMapItem();
            this.MEDIUM_REQUIRE = this.MEDIUM_REQUIRE.toUnmodifiableMapItem();
            this.HARD_REQUIRE = this.HARD_REQUIRE.toUnmodifiableMapItem();
            this.REWARDS = this.REWARDS.toUnmodifiableMapItem();
        }

        public int MIN_ITEM_TYPE ()
        {
            return MIN_ITEM_TYPE;
        }

        public int LEVEL ()
        {
            return LEVEL;
        }

        public float STAY_RATIO ()
        {
            return STAY_RATIO;
        }

        public float GOLD_COEFFICIENT_RATIO ()
        {
            return GOLD_COEFFICIENT_RATIO;
        }

        public float EXP_COEFFICIENT_RATIO ()
        {
            return EXP_COEFFICIENT_RATIO;
        }

        public int MAX_ITEM_TYPE ()
        {
            return MAX_ITEM_TYPE;
        }

        public int MIN_BAG_NUM_PER_ITEM_TYPE ()
        {
            return MIN_BAG_NUM_PER_ITEM_TYPE;
        }

        public int MAX_BAG_NUM_PER_ITEM_TYPE ()
        {
            return MAX_BAG_NUM_PER_ITEM_TYPE;
        }

        public MapItem EASY_REQUIRE ()
        {
            return EASY_REQUIRE;
        }

        public MapItem MEDIUM_REQUIRE ()
        {
            return MEDIUM_REQUIRE;
        }

        public MapItem HARD_REQUIRE ()
        {
            return HARD_REQUIRE;
        }

        public int MIN_NUM_REQUIRE_ITEM_EASY ()
        {
            return MIN_NUM_REQUIRE_ITEM_EASY;
        }

        public int MAX_NUM_REQUIRE_ITEM_EASY ()
        {
            return MAX_NUM_REQUIRE_ITEM_EASY;
        }

        public int MIN_NUM_REQUIRE_ITEM_MEDIUM ()
        {
            return MIN_NUM_REQUIRE_ITEM_MEDIUM;
        }

        public int MAX_NUM_REQUIRE_ITEM_MEDIUM ()
        {
            return MAX_NUM_REQUIRE_ITEM_MEDIUM;
        }

        public int MIN_NUM_REQUIRE_ITEM_HARD ()
        {
            return MIN_NUM_REQUIRE_ITEM_HARD;
        }

        public int MAX_NUM_REQUIRE_ITEM_HARD ()
        {
            return MAX_NUM_REQUIRE_ITEM_HARD;
        }

        public int REPUTATION ()
        {
            return REPUTATION;
        }

        public MapItem REWARDS ()
        {
            return REWARDS;
        }

    }

    public static class Level
    {
        // public int LEVEL;
        private int DELIVERY_REQ;
        private int GOLD_UPGRADE;
        private int UPGRADE_RATIO;
        private int ARRIVE_REDUCE_TIME;
        private int EXP_BONUS;
        private int GOLD_BONUS;


        public int DELIVERY_REQ ()
        {
            return DELIVERY_REQ;
        }

        public int GOLD_UPGRADE ()
        {
            return GOLD_UPGRADE;
        }

        public int UPGRADE_RATIO ()
        {
            return UPGRADE_RATIO;
        }

        public int ARRIVE_REDUCE_TIME ()
        {
            return ARRIVE_REDUCE_TIME;
        }

        public int EXP_BONUS ()
        {
            return EXP_BONUS;
        }

        public int GOLD_BONUS ()
        {
            return GOLD_BONUS;
        }
    }
}
