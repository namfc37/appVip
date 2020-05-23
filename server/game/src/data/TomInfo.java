package data;

public class TomInfo
{
    private float      GOLD_BASIC;
    private PackInfo[] packs;

    public static class PackInfo
    {
        private int MIN_NUM;
        private int MAX_NUM;
        private int MIN_GOLD_RATIO;
        private int MAX_GOLD_RATIO;

        public int MIN_NUM ()
        {
            return MIN_NUM;
        }

        public int MAX_NUM ()
        {
            return MAX_NUM;
        }

        public int MIN_GOLD_RATIO ()
        {
            return MIN_GOLD_RATIO;
        }

        public int MAX_GOLD_RATIO ()
        {
            return MAX_GOLD_RATIO;
        }
    }

    public float GOLD_BASIC ()
    {
        return GOLD_BASIC;
    }

    public int getNumPackInfo ()
    {
        return packs.length;
    }

    public PackInfo getPackInfo (int id)
    {
        return packs[id];
    }
}
