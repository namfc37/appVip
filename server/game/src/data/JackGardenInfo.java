package data;

import java.util.TreeMap;

public class JackGardenInfo
{
    private TreeMap<Integer, Shop>    SHOPS;
    private TreeMap<Integer, Machine> MACHINES;

    public class Shop
    {
        private int PLANT_SLOT;
        private int BUG_SLOT;
        private int QUANTITY;

        public int PLANT_SLOT ()
        {
            return PLANT_SLOT;
        }

        public int BUG_SLOT ()
        {
            return BUG_SLOT;
        }

        public int QUANTITY ()
        {
            return QUANTITY;
        }
    }

    public class Machine
    {
        private int DURABILITY_MIN;
        private int DURABILITY_MAX;

        public int DURABILITY_MIN ()
        {
            return DURABILITY_MIN;
        }

        public int DURABILITY_MAX ()
        {
            return DURABILITY_MAX;
        }
    }

    public Shop getShop (int level)
    {
        return SHOPS.floorEntry(level).getValue();
    }

    public Machine getMachine (int level)
    {
        return MACHINES.floorEntry(level).getValue();
    }
}
