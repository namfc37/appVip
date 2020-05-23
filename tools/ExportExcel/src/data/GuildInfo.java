package data;

import java.util.HashMap;
import java.util.TreeMap;

public class GuildInfo
{
	public TreeMap<Integer, Level> LEVELS;
	public HashMap<String, Donate> DONATE_ITEMS;
	public HashMap<Integer, Avatar> AVATAR;
	public HashMap<Integer, Emoji> EMOJI;
	
	public static class Level
	{
		public int ID;
		public int DEPUTY;
		public int MEMBERS;
	}
	
	public static class Donate
	{
		public String ITEM_ID;
		public int QUANTITY;
		public int DONATE_LIMIT;
	}
	
	public static class Avatar
	{
		public int ID;
		public String FILE;
		public int PRICE;
	}
	
	public static class Emoji
	{
		public int ID;
		public String FILE;
	}
}
