package data;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

public class StockInfo
{
    public int              ID;
    public String           NAME;
    public int              CAPACITY_INIT;
    public int              CAPACITY_ADD;
    public HashSet<Integer> CONTAIN_TYPES;
    public List<Level>      LEVELS;

    public static class Level
    {
        public int                  APPRAISAL;
        public Map<String, Integer> REQUIRE_ITEM;
    }
}
