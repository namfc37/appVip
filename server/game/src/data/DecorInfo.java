package data;

public class DecorInfo extends ItemInfo
{
    private int    APPRAISAL;
    private int    DECOR_LIBRARY_ORDER;
    private String GFX;
    private String SKIN;
    private int    EXP_INCREASE;
    private int    GOLD_INCREASE;
    private int    TIME_DECREASE_DEFAULT;
    private int    BUG_APPEAR_RATIO;

    public int APPRAISAL ()
    {
        return APPRAISAL;
    }

    public int DECOR_LIBRARY_ORDER ()
    {
        return DECOR_LIBRARY_ORDER;
    }

    public int EXP_INCREASE ()
    {
        return EXP_INCREASE;
    }

    public int GOLD_INCREASE ()
    {
        return GOLD_INCREASE;
    }

    public int TIME_DECREASE_DEFAULT ()
    {
        return TIME_DECREASE_DEFAULT;
    }

    public int BUG_APPEAR_RATIO ()
    {
        return BUG_APPEAR_RATIO;
    }

    @Override
    void buildCache ()
    {

    }
}
