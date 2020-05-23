package data;

import java.util.List;

public class TomInfo
{
    public float          GOLD_BASIC;
    public List<PackInfo> packs;

    public static class PackInfo
    {
        public int MIN_NUM;
        public int MAX_NUM;
        public int MIN_GOLD_RATIO;
        public int MAX_GOLD_RATIO;
    }
}
