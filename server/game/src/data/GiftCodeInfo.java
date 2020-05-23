package data;

import util.Time;
import util.collection.MapItem;

import java.util.HashMap;

public class GiftCodeInfo
{
    public static GiftCodeInfo instance;

    private HashMap<String, Multiple> multiples;
    private HashMap<String, Single>   singles;

    public static class Multiple
    {
        private String  code;
        private int[][] duration;
        private MapItem rewards;
        private String  title;
        private String  content;

        public boolean isActive ()
        {
            return Time.isInDuration(duration);
        }

        public MapItem getRewards ()
        {
            return rewards;
        }

        public String getTitle ()
        {
            return title;
        }

        public String getContent ()
        {
            return content;
        }
    }

    public static class Single
    {
        private String  group;
        private int     limitPerUser;
        private int[][] duration;
        private MapItem rewards;
        private String  title;
        private String  content;

        public boolean isActive ()
        {
            return Time.isInDuration(duration);
        }

        public MapItem getRewards ()
        {
            return rewards;
        }

        public String getGroup ()
        {
            return group;
        }

        public int getLimitPerUser ()
        {
            return limitPerUser;
        }

        public String getTitle ()
        {
            return title;
        }

        public String getContent ()
        {
            return content;
        }
    }

    public static Multiple getMultiple (String code)
    {
        return instance.multiples.get(code);
    }

    public static Single getSingle (String group)
    {
        return instance.singles.get(group);
    }
}
