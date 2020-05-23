package data;

import java.util.HashMap;
import java.util.TreeMap;

public class DropItemInfo
{
	public HashMap<String, TreeMap<Integer,HashMap<String, Rule>>> drop;

	public DropItemInfo()
	{
		this.drop = new HashMap<>();
	}
	
	public boolean addRule (String action,int timeRange,String item, float rate, int min, int max, int userDailyLimit)
	{
		Rule dropRule = new Rule (rate, min, max, userDailyLimit);
		if (drop.get(action) == null)
			drop.put(action, new TreeMap<>());
		if (drop.get(action).get(timeRange) == null)
			drop.get(action).put(timeRange, new HashMap<>());
		drop.get(action).get(timeRange).put(item, dropRule);
		
		return true;
	}
	
	public static class Rule
	{
		public float rate;
		public int min;
		public int max;
		public int userDailyLimit;
		public Rule (float rate, int min, int max, int userDailyLimit)
		{
			this.rate = rate;
			this.min = min;
			this.max = max;
			this.userDailyLimit = userDailyLimit;
		}
	}
}