package data;

import java.util.HashMap;

public class GiftCodeInfo
{
    public HashMap<String, Multiple> multiples = new HashMap<>();
    public HashMap<String, Single>   singles   = new HashMap<>();

    public static class Multiple
    {
        public String                   code;
        public int[][]                  duration;
        public HashMap<String, Integer> rewards;
        public String                   title;
        public String                   content;
    }

    public static class Single
    {
        public String                   group;
        public int                      limitPerUser;
        public int[][]                  duration;
        public HashMap<String, Integer> rewards;
        public String                   title;
        public String                   content;
    }
}
