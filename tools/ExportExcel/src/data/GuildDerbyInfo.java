package data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;

public class GuildDerbyInfo
{
	public Map<String, LeagueInfo> LEAGUES;
	public NavigableMap<Integer, Integer> MEMBER_BONUS;
	public NavigableMap<Integer, Integer> RANK_BONUS;
	
	public NavigableMap<Integer, MilestoneInfo> MILESTONE;
	public Map<String, TaskInfo> TASKS;
	public Map<String, List<TaskDetail>> TASK_DETAIL;
	
	public static class LeagueInfo
	{
		public String ID;
		public String NAME;
		public int ORDER;
		public int MEMBER_TASK_LIMIT;
		public int REWARDS_MILESTONE;
		public NavigableMap<Integer, Map<String, Integer>> REWARDS_RANK;

		public LeagueInfo(String id)
		{
			this.ID = id;
		}
	}
	
	public static class MilestoneInfo
	{
		public int ID;
		public int POINT;
		public List<MilestoneRewardInfo> REWARDS;

		public MilestoneInfo(int id)
		{
			this.ID = id;
			this.POINT = id;
			this.REWARDS = new ArrayList<GuildDerbyInfo.MilestoneRewardInfo> ();
		}
	}
	
	public static class MilestoneRewardInfo
	{
		public int ID;
		public int RATE;
		public Map<String, Integer> REWARDS;
		public int DEFAULT_RATE;
	}

	public static class TaskInfo
	{
	    public String                           ACTION;
	    public int                              ACTION_ID;
	    public NavigableMap<Integer, TaskLevel> LV;
		public int								MIN_LEVEL_REQUIRE;
	}
	
	public static class TaskLevel
	{
		public int   LV;
	    public int   MIN;
	    public int   MAX;
	    public int   RATE;
	    public float RATIO;
		
	}

    public static class TaskDetail
    {
        public String   TARGET;
        public int      LEVEL;
        public int      RATE;
        public int      REQUIRE_MIN;
        public int      REQUIRE_MAX;
        public int      DURATION;
        public int      DERBY_POINT;
    }
}
