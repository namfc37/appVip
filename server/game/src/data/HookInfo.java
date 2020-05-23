package data;

import util.collection.MapItem;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HookInfo extends ItemInfo
{
    private String FISH;

    private MapItem REQUIRE_DEFAULT;
    private MapItem REQUIRE_ITEM_RATE;
    private int     REQUIRE_ITEM_NUM;
    private int     PRODUCTION_TIME;
    private int     GOLD_BASIC;
    private int     EXP_BASIC;

    private String GFX;

    public MapItem REQUIRE_ITEM_RATE ()
    {
        return REQUIRE_ITEM_RATE;
    }

    public String FISH ()
    {
        return FISH;
    }

    public MapItem REQUIRE_DEFAULT ()
    {
        return REQUIRE_DEFAULT;
    }

    public int REQUIRE_ITEM_NUM ()
    {
        return REQUIRE_ITEM_NUM;
    }

    public int PRODUCTION_TIME ()
    {
        return PRODUCTION_TIME;
    }

    public int GOLD_BASIC ()
    {
        return GOLD_BASIC;
    }

    public int EXP_BASIC ()
    {
        return EXP_BASIC;
    }

    public String GFX ()
    {
        return GFX;
    }
}
