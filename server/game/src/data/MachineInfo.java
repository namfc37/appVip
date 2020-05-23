package data;

import java.util.HashSet;

public class MachineInfo extends ItemInfo
{
    private int             FLOOR;
    private int             GOLD_START;
    private int             TIME_START;
    private HashSet<String> PRODUCT_ID;
    private int             DURABILITY_INIT;
    private int             DURABILITY_ADD;
    private int             LIBRARY_ORDER;
    private int             INIT_STORE;
    private int             INIT_SLOT;
    private Level[]         LEVELS;
    private int[]           UNLOCK_REQUIRES_DIAMOND;
    private String          GFX;

    public int FLOOR ()
    {
        return FLOOR;
    }

    public int GOLD_START ()
    {
        return GOLD_START;
    }

    public int TIME_START ()
    {
        return TIME_START;
    }

    public int DURABILITY (short level)
    {
        return DURABILITY_INIT + (level - 1) * DURABILITY_ADD;
    }

    public int LIBRARY_ORDER ()
    {
        return LIBRARY_ORDER;
    }

    public int INIT_STORE ()
    {
        return INIT_STORE;
    }

    public int INIT_SLOT ()
    {
        return INIT_SLOT;
    }

    public static class Level
    {
        public int ACTIVE_TIME;
        public int GOLD_UNLOCK;
        public int UPGRADE_RATIO;
        public int EXP_BONUS;
        public int REDUCE_TIME;
        public int EXP_ORDER;
        public int GOLD_ORDER;
        public int GOLD_MAINTAIN;
        public int APPRAISAL;
    }

    public Level getLevel (int level)
    {
        level--;
        if (level < 0 || level >= LEVELS.length)
            return null;
        return LEVELS[level];
    }

    public int priceSlot (int id)
    {
        return UNLOCK_REQUIRES_DIAMOND[id];
    }

    public int maxSlot ()
    {
        return UNLOCK_REQUIRES_DIAMOND.length;
    }

    public boolean hasProduct (String id)
    {
        return PRODUCT_ID.contains(id);
    }

    public int DURABILITY_INIT ()
    {
        return DURABILITY_INIT;
    }
}
