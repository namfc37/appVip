package data;

public class PlantInfo extends ItemInfo
{
    private int    GROW_TIME;
    private int    HARVEST_EXP;
    private int    ITEM_RECEIVE_RATIO;
    private float  GOLD_BASIC;
    private float  EXP_BASIC;
    private String BUG_ID;
    private int    BUG_APPEAR_RATIO;
    private int    SEED_TIME;
    private float  GOLD_BASIC_DO;
    private float  EXP_BASIC_DO_FREE;
    private float  EXP_BASIC_DO_PAID;
    private int    HARVEST_GOLD;
    private int    IS_FIND_BY_TOM;
    private String GFX;
    private String EVENT_ID;

    public int GROW_TIME ()
    {
        return GROW_TIME;
    }

    public int HARVEST_EXP ()
    {
        return HARVEST_EXP;
    }

    public int ITEM_RECEIVE_RATIO ()
    {
        return ITEM_RECEIVE_RATIO;
    }

    public float GOLD_BASIC ()
    {
        return GOLD_BASIC;
    }

    public float EXP_BASIC ()
    {
        return EXP_BASIC;
    }

    public String BUG_ID ()
    {
        return BUG_ID;
    }

    public int BUG_APPEAR_RATIO ()
    {
        return BUG_APPEAR_RATIO;
    }

    public int SEED_TIME ()
    {
        return SEED_TIME;
    }

    public float GOLD_BASIC_DO ()
    {
        return GOLD_BASIC_DO;
    }

    public float EXP_BASIC_DO_FREE ()
    {
        return EXP_BASIC_DO_FREE;
    }

    public float EXP_BASIC_DO_PAID ()
    {
        return EXP_BASIC_DO_PAID;
    }

    public int HARVEST_GOLD ()
    {
        return HARVEST_GOLD;
    }

    public int IS_FIND_BY_TOM ()
    {
        return IS_FIND_BY_TOM;
    }

    public String EVENT_ID ()
    {
        return EVENT_ID;
    }

    public boolean isEventTree ()
    {
        return EVENT_ID != null && !EVENT_ID.isEmpty();
    }
}

