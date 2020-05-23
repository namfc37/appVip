package data;

import java.util.TreeMap;

public class JackGardenInfo
{
    public TreeMap<Integer,Shop> SHOPS;
    public TreeMap<Integer,Machine> MACHINES;

    public static class Shop
    {
        public int PLANT_SLOT;
        public int BUG_SLOT;
        public int QUANTITY;
    }

    public static class Machine
    {
        public int DURABILITY_MIN;
        public int DURABILITY_MAX;
    }
}
