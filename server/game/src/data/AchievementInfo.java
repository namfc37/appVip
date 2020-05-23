package data;

import util.collection.MapItem;

import java.util.ArrayList;
import java.util.TreeMap;

public class AchievementInfo
{
    public static AchievementInfo instance;

    private ArrayList<Task>           tasks;
    private TreeMap<Integer, MapItem> trophyRewards;

    public static class Task
    {
        private int      ID;
        private int      GROUP;
        private int      ACTION;
        private String   TARGET_ID;
        private Target[] TARGETS;

        public int ID ()
        {
            return ID;
        }

        public Target getTarget (int star)
        {
            if (star < 0 || star >= TARGETS.length)
                return null;
            return TARGETS[star];
        }
    }

    public static class Target
    {
        private int     POINT;
        private int     TROPHY;
        private MapItem REWARDS;

        public int POINT ()
        {
            return POINT;
        }

        public int TROPHY ()
        {
            return TROPHY;
        }

        public MapItem REWARDS ()
        {
            return REWARDS;
        }
    }

    public static Task getTask (int id)
    {
        if (id < 0 || id > instance.tasks.size())
            return null;
        return instance.tasks.get(id);
    }

    public static int numTask ()
    {
        return instance.tasks.size();
    }

    public static int getNextTrophyReward (int lastRewardPoint)
    {
        Integer next = instance.trophyRewards.higherKey(lastRewardPoint);
        return next == null ? -1 : next;
    }

    public static MapItem getTrophyReward (int point)
    {
        return instance.trophyRewards.get(point);
    }
}
