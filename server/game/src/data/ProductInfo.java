package data;

import util.collection.MapItem;

public class ProductInfo extends ItemInfo
{
    private String  MACHINE_ID;
    private MapItem REQUIRE_ITEM;
    private int     PRODUCTION_TIME;
    private int     EXP_RECEIVE;
    private float   GOLD_BASIC;
    private float   EXP_BASIC;
    private int     IS_FIND_BY_TOM;
    private String  GFX;

    @Override
    void buildCache ()
    {
        REQUIRE_ITEM = REQUIRE_ITEM.toUnmodifiableMapItem();
    }

    @Override
    public boolean isProductInfo ()
    {
        return true;
    }

    public String MACHINE_ID ()
    {
        return MACHINE_ID;
    }

    public int PRODUCTION_TIME ()
    {
        return PRODUCTION_TIME;
    }

    public int EXP_RECEIVE ()
    {
        return EXP_RECEIVE;
    }

    public float GOLD_BASIC ()
    {
        return GOLD_BASIC;
    }

    public float EXP_BASIC ()
    {
        return EXP_BASIC;
    }

    public int IS_FIND_BY_TOM ()
    {
        return IS_FIND_BY_TOM;
    }

    public MapItem REQUIRE_ITEM ()
    {
        return REQUIRE_ITEM;
    }
}
