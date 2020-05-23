package data;

import java.util.HashMap;

public class PlantDropItemInfo
{
	public HashMap<String, Rule> drop;
	
	public PlantDropItemInfo ()
	{
		this.drop = new HashMap<String, Rule> ();
	}
	
	public boolean add (String item, float rate, int min, int max, int userLimit, int serverLimit, boolean isVietNamOnly)
	{
		Rule dropRule = new Rule (rate, min, max, userLimit, serverLimit, isVietNamOnly);
		drop.put(item, dropRule);
		
		return true;
	}
	
	public static class Rule
	{
		public float rate;
		public int min;
		public int max;
		public int userLimit;
		public int serverLimit;
		public boolean isVietNamOnly;
		
		public Rule (float rate, int min, int max, int userLimit, int serverLimit, boolean isVietNamOnly)
		{
			this.rate = rate;
			this.min = min;
			this.max = max;
			this.userLimit = userLimit;
			this.serverLimit = serverLimit;
			this.isVietNamOnly = isVietNamOnly;
		}
	}
}