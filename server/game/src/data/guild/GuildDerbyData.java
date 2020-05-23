package data.guild;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import data.KeyDefine;
import util.collection.MapItem;
import util.serialize.Encoder;

public class GuildDerbyData
{
	private Map<String, LeagueInfo> LEAGUES;
	private List<String> LEAGUE_ORDER;
	private NavigableMap<Integer, Integer> MEMBER_BONUS;
	private NavigableMap<Integer, Integer> RANK_BONUS;
	
	private NavigableMap<Integer, MilestoneInfo> MILESTONE;
	private Map<Integer, MilestoneInfo> MILESTONE_IDS;
	
	private Map<String, TaskInfo> TASKS;
	private Map<String, List<TaskDetail>> TASK_DETAIL;
	
	private Map<String, Integer> ACTION_ID;
	private Map<Integer, String> ACTION_NAME;

	public void init()
	{
		ArrayList<Integer> milestones = MILESTONE.keySet().stream().collect(Collectors.toCollection(ArrayList::new));
		
		LEAGUE_ORDER = new ArrayList<String> ();
		for (LeagueInfo info : LEAGUES.values())
		{
			info.init ();
			info.REWARDS_MILESTONE = milestones.get (info.REWARDS_MILESTONE - 1);
			LEAGUE_ORDER.add(info.ID);
		}
		
		LEAGUE_ORDER.sort((a, b) -> LEAGUES.get(a).ORDER - LEAGUES.get(b).ORDER);

		MILESTONE_IDS = new HashMap<Integer, MilestoneInfo> ();
		for (MilestoneInfo info : MILESTONE.values())
		{
			info.init ();
			
			MILESTONE_IDS.put(info.ID(), info);
		}
		
		ACTION_ID = new HashMap<> ();
		ACTION_NAME = new HashMap<> ();
		for (TaskInfo info : TASKS.values())
		{
			info.init ();
			ACTION_ID.put(info.ACTION, info.ACTION_ID);
			ACTION_NAME.put(info.ACTION_ID, info.ACTION);
		}
		
		for (String action : TASK_DETAIL.keySet())
		{
			List<TaskDetail> info = TASK_DETAIL.get(action);
			info = Collections.unmodifiableList(info);
			TASK_DETAIL.put (action, info);
		}
		
		LEAGUES = Collections.unmodifiableMap(LEAGUES);
		LEAGUE_ORDER = Collections.unmodifiableList(LEAGUE_ORDER);
		MEMBER_BONUS = Collections.unmodifiableNavigableMap(MEMBER_BONUS);
		RANK_BONUS = Collections.unmodifiableNavigableMap(RANK_BONUS);
		
		MILESTONE = Collections.unmodifiableNavigableMap(MILESTONE);
		MILESTONE_IDS = Collections.unmodifiableMap(MILESTONE_IDS);
		
		TASKS = Collections.unmodifiableMap(TASKS);
		ACTION_ID = Collections.unmodifiableMap(ACTION_ID);
		ACTION_NAME = Collections.unmodifiableMap(ACTION_NAME);
		TASK_DETAIL = Collections.unmodifiableMap(TASK_DETAIL);
	}
	
	public LeagueInfo getLeague(String leagueId)
	{
		LeagueInfo temp = LEAGUES.get(leagueId);
		if (temp == null)
			temp = getLeagueDefault();
		
		return temp;
	}
	
	public LeagueInfo getLeagueDefault()
	{
		String id = LEAGUE_ORDER.get(0);
		return LEAGUES.get(id);
	}
	
	public LeagueInfo getLeagueLast()
	{
		String id = LEAGUE_ORDER.get(LEAGUE_ORDER.size() - 1);
		return LEAGUES.get(id);
	}
	
	public List<String> getLeagueOrder()
	{
		return LEAGUE_ORDER;
	}
	
	public String getLeagueDown(String league)
	{
		int index = LEAGUE_ORDER.indexOf(league);
		if (index > 0)
			index -= 1;
		else
			index = 0;
		
		return LEAGUE_ORDER.get(index);
	}

	public String getLeagueUp(String league)
	{
		int index = LEAGUE_ORDER.indexOf(league);
		if (index < LEAGUE_ORDER.size () - 1)
			index += 1;
		else
			index = LEAGUE_ORDER.size () - 1;
		
		return LEAGUE_ORDER.get(index);
	}
	
	public List<String> generateTask (int lv, Map<String, Integer> current_tasks, int add_tasks, int maxGuildMemberLv)
	{
		Map <String, TaskLevel> lv_rate = new HashMap<String, TaskLevel> ();
		Map <String, Integer> normal = new HashMap<String, Integer> ();
		Map <String, Integer> forge = new HashMap<String, Integer> ();
		
		for (String action : TASKS.keySet())
		{
			TaskInfo info = TASKS.get(action);
			TaskLevel level = info.getLv(lv);
			
			int amount = current_tasks.containsKey(action) ? current_tasks.get(action) : 0;
			if (amount < level.MAX && level.RATE > 0 && info.MIN_LEVEL_REQUIRE <= maxGuildMemberLv)
				amount = level.MAX - amount;
			else
				amount = 0;
			
			if (amount > 0)
			{
				lv_rate.put(action, level);
				
				if (level.MIN > 0)
					forge.put(action, amount);
				else
					normal.put(action, amount);
			}
		}
		
		List<String> newTaskId = new ArrayList <String> ();
        ThreadLocalRandom random = ThreadLocalRandom.current();
		
		for (int i = 0; i < add_tasks; i++)
		{
			Map<String, Integer> temp = forge.size() > 0 ? forge : normal;
			NavigableMap<Integer, String> choose = new TreeMap<Integer, String> ();
			
			int rate = 0;
			for (String action : temp.keySet())
			{
				rate += lv_rate.get(action).RATE;
				choose.put(rate, action);
			}
			
			rate = (int) Math.ceil(random.nextFloat() * rate);
			rate = choose.ceilingKey(rate);
			String task = choose.get(rate);
			newTaskId.add(task);
			
			int remain = temp.get(task) - 1;
			if (remain < 1)
				temp.remove (task);
			else
				temp.put (task, remain);
		}
		
		return newTaskId;
	}
	
	public int getTaskActionId (String action)
	{
		return this.ACTION_ID.get(action);
	}
	
	public String getTaskActionName (int actionId)
	{
		return this.ACTION_NAME.get(actionId);
	}
	
	public TaskDetail generateTaskDetail (String action, HashMap<String, List<String>> newTasks, int maxGuildMemberLv)
	{
        ThreadLocalRandom random = ThreadLocalRandom.current();
		List<TaskDetail> tasks = this.TASK_DETAIL.get(action);
		NavigableMap<Integer, TaskDetail> choose = new TreeMap<Integer, TaskDetail> ();
		List<String> newTasksTarget = newTasks.get(action);
		int rate = 0;
		for (TaskDetail task : tasks)
		{
			if (task.RATE > 0 && (newTasksTarget == null || !newTasksTarget.contains(task.TARGET)) && task.LEVEL <= maxGuildMemberLv)
			{
				rate += task.RATE;
				choose.put(rate, task);
			}
		}
		rate = (int) Math.ceil(random.nextFloat() * rate);
		rate = choose.ceilingKey(rate);
		TaskDetail task = choose.get(rate);
		
		return task;
	}

	public MilestoneInfo findMilestone(String league, int point)
	{
		LeagueInfo leagueInfo = getLeague (league);
		if (leagueInfo == null)
			return null;
		
		point = Math.min(point, leagueInfo.REWARDS_MILESTONE);
		if (point < MILESTONE.firstKey())
			return null;
		
		point = MILESTONE.floorKey(point);
		return MILESTONE.get(point);
	}

	public MilestoneInfo getMilestoneByLeagueID(String league)
	{
		LeagueInfo leagueInfo = getLeague (league);
		if (leagueInfo == null)
			return null;
		return MILESTONE.get(leagueInfo.REWARDS_MILESTONE);
	}

	public MilestoneInfo getMilestone (int point)
	{
		if (point < MILESTONE.firstKey())
			return null;
		
		point = MILESTONE.floorKey(point);
		return MILESTONE.get(point);
	}
	
	public MilestoneInfo getMilestoneById(int milestoneId)
	{
		return MILESTONE_IDS.get (milestoneId);
	}
	
	public int getFisrtMilestone ()
	{
		return MILESTONE.firstKey();
	}
	
	public int getPositionBonus(int order)
	{
		if (order < RANK_BONUS.firstKey())
			return RANK_BONUS.firstEntry().getValue();
		
		Entry<Integer, Integer> entry = RANK_BONUS.floorEntry(order);
		return entry != null ? entry.getValue() : 0;
	}
	
	public int getSizeBonus(int memberActive)
	{
		if (memberActive < MEMBER_BONUS.firstKey())
			return MEMBER_BONUS.firstEntry().getValue();
		
		Entry<Integer, Integer> entry = MEMBER_BONUS.floorEntry(memberActive);
		return entry != null ? entry.getValue() : 0;
	}
	
	public static class LeagueInfo
	{
		private String ID;
		private String NAME;
		private int ORDER;
		private int MEMBER_TASK_LIMIT;
		private int REWARDS_MILESTONE;
		private NavigableMap<Integer, MapItem> REWARDS_RANK;
		
		public void init()
		{
			for (Integer rank : REWARDS_RANK.keySet())
			{
				MapItem rewards = REWARDS_RANK.get (rank);
				REWARDS_RANK.put (rank, rewards.toUnmodifiableMapItem());
			}
			
			REWARDS_RANK = Collections.unmodifiableNavigableMap(REWARDS_RANK);
		}

		public String ID() { return ID; }

		public int ORDER() { return ORDER; }
		
		public int MEMBER_TASK_LIMIT() { return MEMBER_TASK_LIMIT; }
		
		public MapItem getRankingReward (int order)
		{
			if (order < REWARDS_RANK.firstKey())
				return REWARDS_RANK.firstEntry().getValue();
			
			Entry<Integer, MapItem> entry = REWARDS_RANK.floorEntry(order);
			return entry != null ? entry.getValue() : null;
		}
	}
	
	public static class MilestoneInfo
	{
		private int ID;
		private int POINT;
		private List<MilestoneRewardInfo> REWARDS;
		
		public void init()
		{
			for (MilestoneRewardInfo info : REWARDS)
				info.init ();
			
			REWARDS = Collections.unmodifiableList(REWARDS);	
		}

		public int ID() { return ID; }
		
		public int POINT() { return POINT; }

		public Map<Integer, MapItem> generateRewards(int number, Set<Integer> expect, boolean isInit)
		{

			//isInit: first time init rewards. All user is the same.
			if (number < 1)
				return null;
			
			Map<Integer, MapItem> listRewards = new HashMap<Integer, MapItem> ();
	        ThreadLocalRandom random = ThreadLocalRandom.current();
			
	        List<Integer> ids = new ArrayList<Integer> ();
	        int totalRate = 0;
	        for (int index = 0; index < REWARDS.size(); index++)
	        {
	        	MilestoneRewardInfo info = REWARDS.get(index);
	        	if (expect != null && expect.contains(info.ID))
	        		continue;
	        	
	        	totalRate += isInit ? info.DEFAULT_RATE: info.RATE;
	        	ids.add(index);
	        }
	        
	        Collections.shuffle(ids);
	        
			for (int i = 0; i < number; i++)
			{
				int rate = (int) Math.ceil(random.nextFloat() * totalRate);
				Integer chooseIndex = null;
				for (int index : ids)
				{
		        	MilestoneRewardInfo info = REWARDS.get(index);
		        	int rateUse = isInit ? info.DEFAULT_RATE: info.RATE;
		        	if (rate <= rateUse)
		        	{
		        		chooseIndex = index;
		        		break;
		        	}
		        	
		        	rate -= rateUse;
				}
				
				if (chooseIndex == null)
					continue;
				
				MilestoneRewardInfo choose = REWARDS.get(chooseIndex);
	        	listRewards.put(choose.ID, choose.REWARDS);
	        	
				ids.remove (chooseIndex);
	        	totalRate -= isInit ? choose.DEFAULT_RATE: choose.RATE;
			}
			
			return listRewards;
		}
	}
	
	public static class MilestoneRewardInfo
	{
		private int ID;
		private int RATE;
		private MapItem REWARDS;
		private int DEFAULT_RATE;
		
		public void init()
		{
			REWARDS = REWARDS.toUnmodifiableMapItem();
		}
	}

	public static class TaskInfo
	{
		private String                           ACTION;
	    private int                              ACTION_ID;
	    private NavigableMap<Integer, TaskLevel> LV;
		private int 							 MIN_LEVEL_REQUIRE;
	    
		public void init()
		{
			LV = Collections.unmodifiableNavigableMap(LV);
		}
		
		public TaskLevel getLv (int lv)
		{
			lv = this.LV.ceilingKey(lv);
			return this.LV.get(lv);
		}
	}
	
	public static class TaskLevel
	{
		private int   LV;
		private int   MIN;
	    private int   MAX;
	    private int   RATE;
	    private float RATIO;
	}

    public static class TaskDetail
    {
    	private String TARGET;
    	private int    LEVEL;
    	private int    RATE;
    	private int    REQUIRE_MIN;
    	private int    REQUIRE_MAX;
    	private int    DURATION;
        private int    DERBY_POINT;
        
    	public String TARGET () { return TARGET; }
    	public int LEVEL () { return LEVEL; }
    	public int REQUIRE ()
    	{
    		if (REQUIRE_MIN == 0)
    			return 1;
    		
            ThreadLocalRandom random = ThreadLocalRandom.current();
    		return random.nextInt(REQUIRE_MIN, REQUIRE_MAX + 1);
    	}
    	public int DURATION () { return DURATION; }
    	public int DERBY () { return DERBY_POINT; }  
    }
}