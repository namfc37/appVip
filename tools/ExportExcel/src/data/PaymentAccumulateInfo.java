package data;

import java.util.List;
import java.util.Map;
import java.util.NavigableMap;

public class PaymentAccumulateInfo
{
	public Map<Integer, NavigableMap<Integer, Reward>> MILESTONES;
	public Map<String, Package> SHOP;
	public String TOKEN_ID;
	public int UNIX_TIME_START;
	public int UNIX_TIME_END;

	public static class Reward
	{
		public int ID;
		public Map<String, Integer> ITEMS;
	}
	
	public static class Package
	{
		public String ID;
		public int PRICE;
		public int[] LEVELS;
		public String ITEM;
		public int NUM;
		public Map<String, Integer> BONUS;
		public List<OpenTime> OPEN_TIMES;
		public int LIMIT;
		public int LIMIT_PER_DAY;
		public int LIMIT_PER_USER;
		public String DESC;
		public String TITLE;
		public boolean IS_VIETNAM_ONLY;
	}
	
	public static class OpenTime
	{
		public int HOUR;
		public int MINUTE;
		
		public OpenTime(int hour, int minute)
		{
			this.HOUR = hour;
			this.MINUTE = minute;
		}
	}
}
