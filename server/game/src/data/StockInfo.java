package data;

import util.collection.MapItem;

import java.util.List;

public class StockInfo
{
    private int ID;
    private int CAPACITY_INIT;
    private int CAPACITY_ADD;
    int[] CONTAIN_TYPES;
    private List<Level> LEVELS;

    public int CAPACITY_INIT ()
    {
        return CAPACITY_INIT;
    }

    public int CAPACITY_ADD ()
    {
        return CAPACITY_ADD;
    }

    public static class Level
    {
        public int     APPRAISAL;
        public MapItem REQUIRE_ITEM;
    }

    public int maxLevel ()
    {
        return LEVELS.size();
    }

    public Level levelInfo (int level)
    {
        int id = level - 1;
        if (id < 0 || id >= LEVELS.size())
            return null;
        return LEVELS.get(id);
    }

    public int ID ()
    {
        return ID;
    }
}
