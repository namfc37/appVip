package service.guild;

import java.util.*;

import data.ConstInfo;
import data.KeyDefine;
import data.guild.GuildData.Donate;
import data.MiscInfo;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

public class GuildDonate extends Encoder.IObject implements KeyDefine
{
	private int owner;
	private int start;
	private int end;

	private String itemId;
	private int itemNum;
	
	private Map<Integer, Integer> donators;
	
	private GuildDonate () {}
	
	public static GuildDonate create (int userId, String itemId)
	{
		Donate data = ConstInfo.getGuildData().getDonate (itemId);
		if (data == null)
			return null;
			
		GuildDonate info = new GuildDonate ();
		info.owner = userId;
		info.start = Time.getUnixTime();
		info.end = info.start + MiscInfo.GUILD_DONATE_DURATION();
		info.itemId = itemId;
		info.itemNum = data.ITEM_NUM();
		info.donators = new HashMap<> ();
		
		return info;
	}

	public int getOwner()
	{
		return owner;
	}

	public String getItemId()
	{
		return itemId;
	}
	
	public int getStart()
	{
		return start;
	}
	
	public int getEnd ()
	{
		return end;
	}
	
	public boolean isExpire ()
	{
		return Time.getUnixTime() > end;
	}

	public boolean isDone()
	{
		return itemNum <= getTotal();
	}

	public MapItem getItems()
	{
		MapItem item = new MapItem ();
		
		item.increase(itemId, getTotal ());
		return item;
	}
	
	public int getTotal ()
	{
		int total = 0;
		for (int v : donators.values())
			total += v;
		
		return total;
	}
	
	public int getRemain ()
	{
		return itemNum - getTotal ();
	}

	public int getDonatorRemain (int userId)
	{
		Donate donateData = ConstInfo.getGuildData().getDonate(itemId);
		if (donateData == null)
			return 0;
		
		if (donators != null && donators.containsKey(userId))
			return donateData.LIMIT_PER_MEMBER() - donators.get(userId);
		
		return donateData.LIMIT_PER_MEMBER();
	}

	public void addDonator(int userId)
	{
		if (donators == null)
			donators = new HashMap<> ();
		
		Integer c = donators.get (userId);
		if (c == null)
			c = 0;
		
		c += 1;
		donators.put (userId, c);
	}
	
    @Override
    public void putData (Encoder msg)
    {
        msg.put(GUILD_DONATE_OWNER, owner);
        msg.put(GUILD_DONATE_ITEM, itemId);
        msg.put(GUILD_DONATE_NUM, itemNum);
        msg.put(GUILD_DONATE_TIME_START, start);
        msg.put(GUILD_DONATE_TIME_END, end);
        
        if (donators.isEmpty())
        	return;
        
        List<Integer> temp = new ArrayList<Integer> ();
        for (int id : donators.keySet())
        {
        	temp.add(id);
        	temp.add(donators.get(id));
        }

        msg.put(GUILD_DONATE_CURRENT, getTotal ());
        msg.putInts(GUILD_DONATE_DONATORS, temp);
    }
}