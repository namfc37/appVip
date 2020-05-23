package data.guild;

import java.util.*;

public class GuildData
{
	private Map<Integer, Level> LEVELS;
	private Map<String, Donate> DONATE_ITEMS;
	private Map<Integer, Avatar> AVATAR;
	private Map<Integer, Emoji> EMOJI;
	
	private Set<String> AVATAR_FILES;
	private Set<String> EMOJI_FILES;

	public void init()
	{
		LEVELS = Collections.unmodifiableMap(LEVELS);
		DONATE_ITEMS = Collections.unmodifiableMap(DONATE_ITEMS);
		
		AVATAR_FILES = new HashSet<String> ();
		for (Avatar avatar : AVATAR.values())
			AVATAR_FILES.add (avatar.FILE());
		
		EMOJI_FILES = new HashSet<String> ();
		for (Emoji emoji : EMOJI.values())
			EMOJI_FILES.add (emoji.FILE());
		
		AVATAR = Collections.unmodifiableMap(AVATAR);
		AVATAR_FILES = Collections.unmodifiableSet(AVATAR_FILES);
		EMOJI = Collections.unmodifiableMap(EMOJI);
		EMOJI_FILES = Collections.unmodifiableSet(EMOJI_FILES);
	}

	public int getMemberLimit(int level)
	{
		Level levelInfo = LEVELS.get(level);
		return levelInfo == null ? 0 : levelInfo.MEMBERS; 
	}

	public int getDeputyLimit(int level)
	{
		Level levelInfo = LEVELS.get(level);
		return levelInfo == null ? 0 : levelInfo.DEPUTY; 
	}

	public Donate getDonate(String itemId)
	{
		Donate donateInfo = DONATE_ITEMS.get(itemId);
		return donateInfo;
	}
	
	public boolean checkAvatar(String avatar)
	{
		return AVATAR_FILES.contains(avatar);
	}

	public boolean checkEmoji(String emoji)
	{
		return EMOJI_FILES.contains(emoji);
	}

	public static class Level
	{
		private int ID;
		private int DEPUTY;
		private int MEMBERS;
	}
	
	public static class Donate
	{
		private String ITEM_ID;
		private int QUANTITY;
		private int DONATE_LIMIT;
		
		public int ITEM_NUM () { return QUANTITY; }
		public int LIMIT_PER_MEMBER () { return DONATE_LIMIT; }
	}
	
	public static class Avatar
	{
		private int ID;
		private String FILE;
		private int PRICE;
		
		public String FILE () { return FILE; }
	}
	
	public static class Emoji
	{
		private int ID;
		private String FILE;
		
		public String FILE () { return FILE; }
	}
}
