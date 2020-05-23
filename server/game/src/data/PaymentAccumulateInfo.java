package data;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.NavigableSet;
import java.util.TreeSet;
import java.util.Map.Entry;

import data.PaymentAccumulateInfo.OpenTime;
import extension.EnvConfig;
import util.Time;
import util.collection.MapItem;

public class PaymentAccumulateInfo
{
	private Map<Integer, NavigableMap<Integer, Reward>> MILESTONES;
	private Map<Integer, Reward> MILESTONE_REWARD_IDS;
	private Map<Integer, Integer> REWARDS_CHECKPOINTS;
	private Map<String, Package> SHOP;
	private String TOKEN_ID;
	private int UNIX_TIME_START;
	private int UNIX_TIME_END;
    
	public int UNIX_TIME_END() { return UNIX_TIME_END; }
	public int UNIX_TIME_START() { return UNIX_TIME_START; }
	public String ID() { return "ACCUMULATE_" + UNIX_TIME_START; }
	public Map<String, Package> SHOP_ITEMS() { return SHOP; }
    
    public boolean isActive ()
    {
        int currentTime = Time.getUnixTime();
        return this.isActive(currentTime);
    }

    public boolean isActive (int time)
    {
    	if (!MiscInfo.ACCUMULATE_ACTIVE())
    		return false;
    	
        return UNIX_TIME_START() < time && time < UNIX_TIME_END();
    }

    public void init ()
    {
    	MILESTONE_REWARD_IDS = new HashMap<Integer, Reward>();
    	REWARDS_CHECKPOINTS = new HashMap<Integer, Integer>();
    	
    	for(int checkpoint : MILESTONES.keySet())
    	{
    		NavigableMap<Integer, Reward> groupLv = MILESTONES.get(checkpoint);
    		
    		for (int lv : groupLv.keySet())
    		{
    			Reward reward = groupLv.get(lv);
    			reward.init ();
    			
    			MILESTONE_REWARD_IDS.put(reward.ID(), reward);
    			REWARDS_CHECKPOINTS.put(reward.ID(), checkpoint);
    		}
    		
    		groupLv = Collections.unmodifiableNavigableMap(groupLv);
    		MILESTONES.put (checkpoint, groupLv);
    	}
    	
    	for(Package pack : SHOP.values())
    	{
    		pack.init ();
    		SHOP.put(pack.ID(), pack);
    	}
    		
    	MILESTONE_REWARD_IDS = Collections.unmodifiableMap(MILESTONE_REWARD_IDS);
    	MILESTONES = Collections.unmodifiableMap(MILESTONES);
    	SHOP = Collections.unmodifiableMap(SHOP);
    }

	public int coinToToken(int coinConvert)
	{
		return coinConvert / MiscInfo.ACCUMULATE_COIN_TO_TOKEN();
	}
    
    public int getMilestoneCheckpoint (int rewardID)
    {
    	Integer checkpoint = REWARDS_CHECKPOINTS.get(rewardID);
    	return checkpoint == null ? -1 : checkpoint.intValue();
    }
    
    public Reward getMilestoneReward (int checkpoint, int level)
    {
        NavigableMap<Integer, Reward> groupLv = MILESTONES.get(checkpoint);
        if (groupLv == null)
            return null;

        Entry<Integer, Reward> entry = groupLv.ceilingEntry(level);
        if (entry == null)
            return null;
        
        return entry.getValue();
    }
    
    public boolean storeCheck (String itemID)
    {
    	return SHOP.containsKey(itemID);
    }

	public boolean countryCheck(String itemID, String country)
	{
		if (!SHOP.containsKey(itemID)) return false;
		Package packageInfo = SHOP.get(itemID);
		return !packageInfo.IS_VIETNAM_ONLY() || country.equals(MiscDefine.COUNTRY_VIETNAM);
	}

    public int storeLimitPerUser(String itemID)
	{
		Package pack = SHOP.get(itemID);
		return pack == null ? 0 : pack.LIMIT_PER_USER();
	}
    
	public MapItem storeItem (String itemID)
	{
		Package pack = SHOP.get(itemID);
		return pack == null ? null : pack.ITEMS();
	}
	
	public int storeItemPrice (String itemID)
	{
		Package pack = SHOP.get(itemID);
		return pack == null ? Integer.MAX_VALUE : pack.PRICE();
	}
    
	public static class Reward
	{
		private int ID;
		private MapItem ITEMS;
		
	    public void init ()
	    {
	    	ITEMS = ITEMS.toUnmodifiableMapItem();
	    }

		public int ID() { return ID; }
		public MapItem ITEMS() { return ITEMS; }
	}
	
	public static class Package
	{
		public String ID;
		public int PRICE;
		public int[] LEVELS;
		
		public String ITEM;
		public int NUM;
		public MapItem BONUS;
		public MapItem ITEMS;
		
		public List<OpenTime> OPEN_TIMES;
		private NavigableSet<Integer> OPEN_MINUTES;
		public int LIMIT;
		public int LIMIT_PER_DAY;
		public int LIMIT_PER_USER;
		private int QUANTITY_PER_TURN;
		private boolean IS_VIETNAM_ONLY;
		
		public String ID() { return ID; }
		public int PRICE() { return PRICE; }
//		public String ITEM() { return ITEM; }
//		public int NUM() { return NUM; }
//		public MapItem BONUS() { return BONUS; }
		public MapItem ITEMS() { return ITEMS; }
		public List<OpenTime> OPEN_TIMES() { return OPEN_TIMES; }
		public NavigableSet<Integer> OPEN_MINUTES() { return OPEN_MINUTES; }
		public int LIMIT() { return LIMIT; }
		public int LIMIT_PER_DAY() { return LIMIT_PER_DAY; }
		public int LIMIT_PER_USER() { return LIMIT_PER_USER; }
		public int QUANTITY_PER_TURN() { return QUANTITY_PER_TURN; }
		public boolean IS_VIETNAM_ONLY(){ return IS_VIETNAM_ONLY;}

	    public void init ()
	    {
	    	OPEN_MINUTES = new TreeSet <Integer> ();
	    	for (OpenTime openTime : OPEN_TIMES)
	    		OPEN_MINUTES.add(openTime.HOUR * 60 + openTime.MINUTE);
	    	
	    	QUANTITY_PER_TURN = OPEN_TIMES.size() == 0 ? 0 : (int) Math.ceil(1.0f * LIMIT_PER_DAY / OPEN_TIMES.size());
	    	
	    	ITEMS = new MapItem (ITEM, NUM);
	    	ITEMS.increase(BONUS);
	    	
	    	BONUS = BONUS.toUnmodifiableMapItem();
	    	ITEMS = ITEMS.toUnmodifiableMapItem();
	    	OPEN_TIMES = Collections.unmodifiableList(OPEN_TIMES);
	    	OPEN_MINUTES = Collections.unmodifiableNavigableSet(OPEN_MINUTES);
	    }

	}
	
	public static class OpenTime
	{
		private int HOUR;
		private int MINUTE;
	}


}
