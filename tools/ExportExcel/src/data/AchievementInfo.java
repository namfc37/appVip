package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

public class AchievementInfo
{
    public ArrayList<Task>                            tasks;
    public TreeMap<Integer, HashMap<String, Integer>> trophyRewards;

    public static class Task
    {
        public int      ID;
        public int      GROUP;
        public int      ACTION;
        public String   TARGET_ID;
        public Target[] TARGETS;
    }

    public static class Target
    {
        public int                      POINT;
        public int                      TROPHY;
        public HashMap<String, Integer> REWARDS;
    }
}
