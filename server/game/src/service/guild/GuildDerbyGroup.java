package service.guild;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import data.KeyDefine;
import service.guild.cache.CacheGuildInfo;
import service.guild.cache.GuildDerbyTime;
import util.Time;
import util.serialize.Encoder;

public class GuildDerbyGroup extends Encoder.IObject implements KeyDefine
{
    private String             id;
    private String             league;
    private int                start;
    private int                end;
    private int                reward;
    
//  list guild in derby, short info, current point
    private Map<Integer, Item> items;
    
//  this class just a cache, so it can be old, reload them
    private transient Integer expired;
    
    private GuildDerbyGroup () {}
    
    public static GuildDerbyGroup create (String league, String groupId)
    {
    	GuildDerbyGroup group = new GuildDerbyGroup ();
    	group.id = groupId;
    	group.league = league;
    	group.start = -1;
    	group.end = -1;
    	group.items = new HashMap <Integer, Item> ();
    	group.expired = -1;
    	
    	return group;
    }
    
    public String GROUP_ID ()
    {
        return id;
    }

    public String LEAGUE ()
    {
        return league;
    }

    public int TIME_START ()
    {
        return start;
    }

    public int TIME_END ()
    {
        return end;
    }
    
	public long SIZE()
	{
		return items == null ? 0 : items.size();
	}
	
	public void setExpired(int time)
	{
		if (expired == null)
			expired = time;
	}
	
	public boolean isExpire()
	{
		return expired != null && expired < Time.getUnixTime();
	}

	public void setTime(GuildDerbyTime derbyTime)
	{
		this.start = derbyTime.getStartTime();
		this.end = derbyTime.getEndTime();
		this.reward = derbyTime.getRewardTime();
	}

    @Override
    public void putData (Encoder msg)
    {
        msg.put(GUILD_DERBY_GROUP_ID, GROUP_ID());
        msg.put(GUILD_DERBY_LEAGUE_ID, LEAGUE());
        msg.put(GUILD_DERBY_TIME_START, TIME_START());
        msg.put(GUILD_DERBY_TIME_END, TIME_END());
        msg.put(GUILD_DERBY_GROUP_ITEMS, items.values());
    }

	public void add(CacheGuildInfo info)
	{
		if (info == null)
			return;
		
		Item item = this.items.get(info.getId());
		if (item == null)
		{
			item = Item.create(info.getId(), info.getName(), info.getAvatar(), info.getNumMember(), 0);
			this.items.put (item.GUILD_ID(), item);
		}
		else
			item.update (info.getAvatar(), info.getNumMember());
	}

	public void add(GuildInfo info)
	{
		if (info == null)
			return;
		
		Item item = this.items.get(info.getId());
		if (item == null)
		{
			item = Item.create(info.getId(), info.getName(), info.getAvatar(), info.getMemberNumber(), 0);
			this.items.put (item.GUILD_ID(), item);
		}
		else
			item.update (info.getAvatar(), info.getMemberNumber());
	}

	public boolean containsGuild (int guildId)
	{
		return this.items.containsKey(guildId);
	}
	
	public void update (int guildId, int point)
	{
		
	}
    
	public Collection<Item> guilds () { return items.values(); }
    
	public Set<Integer> guildIds () { return items.keySet(); }
	
	public Map<Integer, Integer> getPoints ()
	{
		Map<Integer, Integer> points = new HashMap<Integer, Integer> ();
		for (Item guild : items.values())
			if (guild.point > 0)
				points.put(guild.id, guild.point);
		
		return points;
	}
	
	public static class Item extends Encoder.IObject implements KeyDefine
	{
	    private int    id;
	    private String name;
	    private String avatar;
	    private int    members;
	    private int    point;
	    
	    private Item () {}
	    
		public static Item create (int guildId, String guildName, String guildAvatar, int memberNumber, int point)
	    {
	    	Item i = new Item();
	        i.id = guildId;
	        i.name = guildName;
	        i.avatar = guildAvatar;
	        i.members = memberNumber;
	        i.point = point;
	        return i;
	    }

	    public int GUILD_ID ()
	    {
	        return id;
	    }

	    public String GUILD_NAME ()
	    {
	        return name;
	    }

	    public String GUILD_AVATAR ()
	    {
	        return avatar;
	    }

	    public int MEMBERS ()
	    {
	        return members;
	    }

	    public int POINT ()
	    {
	        return point;
	    }
		
	    public void update(String avatar2, int numMember)
		{
		}

	    @Override
	    public void putData (Encoder msg)
	    {
	        msg.put(GUILD_DERBY_RECORD_ID, GUILD_ID());
	        msg.put(GUILD_DERBY_RECORD_NAME, GUILD_NAME());
	        msg.put(GUILD_DERBY_RECORD_AVATAR, GUILD_AVATAR());
	        msg.put(GUILD_DERBY_RECORD_MEMBER, MEMBERS());
	        msg.put(GUILD_DERBY_RECORD_POINT, POINT());
	    }
	}
}