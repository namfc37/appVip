package data;

import util.collection.MapItem;

public class FloorInfo
{
    private int     ID;
    private int     USER_LEVEL;
    private MapItem REQUIRE_ITEM;
    private int     APPRAISAL;
    private String  MACHINE;

    public void init ()
    {
        REQUIRE_ITEM = REQUIRE_ITEM.toUnmodifiableMapItem();
    }

    public int ID ()
    {
        return ID;
    }

    public int USER_LEVEL ()
    {
        return USER_LEVEL;
    }

    public MapItem REQUIRE_ITEM ()
    {
        return REQUIRE_ITEM;
    }

    public int APPRAISAL ()
    {
        return APPRAISAL;
    }

    public String MACHINE ()
    {
        return MACHINE;
    }
}
