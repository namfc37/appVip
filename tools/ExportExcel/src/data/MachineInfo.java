package data;

import java.util.List;

public class MachineInfo extends ItemInfo
{
    public int           FLOOR;
    public int           GOLD_START;
    public int           TIME_START;
    public String[]      PRODUCT_ID;
    public int           DURABILITY_INIT;
    public int           DURABILITY_ADD;
    public int           LIBRARY_ORDER;
    public int           INIT_STORE;
    public int           INIT_SLOT;
    public List<Level>   LEVELS;
    public List<Integer> UNLOCK_REQUIRES_DIAMOND;
    public String        GFX;

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
}
