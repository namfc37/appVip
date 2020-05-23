package model.guild;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import data.guild.GuildDerbyData.MilestoneInfo;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

public class DerbyMilestoneReward extends Encoder.IObject implements KeyDefine
{
	private int timeEndA;
	private int milestone;
	private Map<Integer, Choose> rewards;
	private boolean claim;
	private int rewardStatus;
	
	private DerbyMilestoneReward () {}
	
	public static DerbyMilestoneReward create (int timeEnd, int milestone)
	{
		DerbyMilestoneReward info = new DerbyMilestoneReward ();
		info.timeEndA = timeEnd;
		info.milestone = milestone;
		info.rewards = new HashMap<Integer, Choose> ();
		info.claim = false;
		info.rewardStatus = MiscDefine.GUILD_DERBY_REWARD_STATUS_NORMAL;
		MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneById(milestone);
		if (max == null)
			return null;
		
		for (int i = 0; i <= max.ID(); i++)
		{
			Choose choose = Choose.create(i, MiscInfo.DERBY_MEMBER_REWARD_NUMBER());
			if (choose == null)
				break;
			
			info.rewards.put (i, choose);
		}	
		
		return info;
	}

	public static DerbyMilestoneReward createByLeagueID (int timeEnd, String leagueID)
	{
		DerbyMilestoneReward info = new DerbyMilestoneReward ();
		info.timeEndA = timeEnd;
		info.rewards = new HashMap<Integer, Choose> ();
		info.claim = false;
		info.rewardStatus = MiscDefine.GUILD_DERBY_REWARD_STATUS_NORMAL;

		MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneByLeagueID(leagueID);
		info.milestone = max.ID();
		if (max == null)
			return null;

		for (int i = 0; i <= max.ID(); i++)
		{
			Choose choose = Choose.create(i, MiscInfo.DERBY_MEMBER_REWARD_NUMBER());
			if (choose == null)
				break;

			info.rewards.put (i, choose);
		}

		return info;
	}

	public int getMilestone()
	{
		return this.milestone;
	}

	public static void test (int testSize, int milestone)
	{
        Map<Integer, Integer> total = new TreeMap<Integer, Integer> ();
        int count = 0;
        int size = 0;
        
        int endTime = Time.getUnixTime() + Time.SECOND_IN_DAY;
        
        for (int i = 0; i < testSize; i++)
        {
            DerbyMilestoneReward rewards = DerbyMilestoneReward.create(endTime, milestone);
            if (rewards == null)
            	continue;
            
            for (int id : rewards.rewardIds())
            {
            	Integer id_count = total.get(id);
            	if (id_count == null)
            		id_count = 1;
            	else
            		id_count += 1;
            	
            	total.put(id, id_count);
            	count += 1;
            }
            size += rewards.size ();
        }
        
    	Debug.info("DerbyMilestoneReward", "test", testSize, milestone, 1.0f * size / testSize);
        
        for (int id : total.keySet())
        {
        	int id_count = total.get(id);
        	float rate = 100.0f * id_count / count;
        	Debug.info("DerbyMilestoneReward", milestone, id, id_count, count, rate);
        }
	}

	public void update(int timeEnd, int milestone)
	{
		if (this.timeEndA >= timeEnd)
			return;

		MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneById(milestone);
		if (max == null)
			return;
		
		this.timeEndA = timeEnd;
		this.milestone = milestone;
		this.rewards.clear();
		this.claim = false;
		
		for (int i = 0; i <= max.ID(); i++)
		{
			Choose choose = Choose.create(i, MiscInfo.DERBY_MEMBER_REWARD_NUMBER());
			if (choose == null)
				break;
			
			this.rewards.put (i, choose);
		}
	}

	public void updateByLeagueId(int timeEnd, String leagueID)
	{
		if (this.timeEndA >= timeEnd)
			return;

		this.timeEndA = timeEnd;
		this.rewards.clear();
		this.claim = false;

		MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneByLeagueID(leagueID);
		this.milestone = max.ID();
		if (max == null)
			return ;

		for (int i = 0; i <= max.ID(); i++)
		{
			Choose choose = Choose.create(i, MiscInfo.DERBY_MEMBER_REWARD_NUMBER());
			if (choose == null)
				break;

			this.rewards.put (i, choose);
		}
	}

	public void updateBeforeClaim(int milestone)
	{
		if (this.timeEndA < Time.getUnixTime())
			return;
			this.milestone = milestone;
		if (milestone < 0) {
			clearReward();
		}
		else
		{
			MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneById(milestone);
			if (max == null)
				return;
			int lengthReward = this.rewards.size();
			for (int i = max.ID() + 1; i < lengthReward; i++) {
				this.rewards.remove(i);
			}
			this.rewardStatus = MiscDefine.GUILD_DERBY_REWARD_STATUS_REMOVED;
		}
	}

	public void clearReward()
	{
		if (this.rewardStatus == MiscDefine.GUILD_DERBY_REWARD_STATUS_CLEARED) return;
		this.rewards.clear();
		this.rewardStatus = MiscDefine.GUILD_DERBY_REWARD_STATUS_CLEARED;
	}

	public byte setChooseIds (int[] rewardIds)
	{
//		check
		for (int i = 0; i < rewardIds.length; i++)
		{
			Choose choose = rewards.get(i);
			if (choose == null)
				return ErrorConst.NULL_SLOT;

			int chooseId = rewardIds [i];	
			if (chooseId < 0)
				continue;
			
			if (!choose.all.containsKey(chooseId))
				return ErrorConst.INVALID_ITEM;
		}

//		save
		for (int i = 0; i < rewardIds.length; i++)
			rewards.get(i).rewardId = rewardIds [i];
		
		return ErrorConst.SUCCESS;
	}
	
	public int[] getChooseIds ()
	{
		if (rewards == null)
			return null;
		
		int[] ids = new int [rewards.size()];
		for (int i = 0; i < ids.length; i++)
			if (rewards.containsKey(i))
			ids [i] = rewards.get(i).rewardId;
		
		return ids;
	}

	public boolean isExpire()
	{
		return timeEndA < Time.getUnixTime();
	}

	public MapItem getRewards()
	{
		int [] rewardIds = getChooseIds();
		
		MapItem selects = new MapItem ();
		for (int i = 0; i < rewardIds.length; i++)
		{
			Choose choose = rewards.get(i);
			int rewardId = rewardIds [i];
			
			MapItem rewards = choose.get (rewardId);
			if (rewards == null)
				return null;
			
			selects.increase(rewards);
		}
		
		return selects;
	}

	public boolean isClaim()
	{
		return claim;
	}
	
	public void claimCheck()
	{
		claim = true;
	}

	public byte change ()
	{
		MilestoneInfo max = ConstInfo.getGuildDerbyData().getMilestoneById(milestone);
		if (max == null)
			return ErrorConst.FAIL;
		
		for (Choose old : rewards.values())	
			old.change();
		
		return ErrorConst.SUCCESS;
	}
	
	@Override
	public void putData(Encoder msg)
	{
		msg.put(DERBY_REWARD_ITEMS, rewards.values());
		msg.put(DERBY_REWARD_TIME_END, timeEndA);
		msg.put(DERBY_REWARD_CLAIM, claim);
	}

	public Set<Integer> rewardIds () { return rewards.keySet(); }

	public int size() { return rewards.size(); }

	public static class Choose extends Encoder.IObject implements KeyDefine
	{
		private int id;
		private int rewardId;
		private Map<Integer, MapItem> all;
		
		private Choose () {}
		
		public static Choose create (int milestoneId, int number)
		{
			MilestoneInfo milestoneInfo = ConstInfo.getGuildDerbyData().getMilestoneById (milestoneId);
			if (milestoneInfo == null)
				return null;

			Choose choose = new Choose ();
			choose.id = milestoneId;
			choose.rewardId = -1;
			choose.all = milestoneInfo.generateRewards (number, null, true);
			
			return choose;
		}
		
		public boolean change ()
		{
			MilestoneInfo milestoneInfo = ConstInfo.getGuildDerbyData().getMilestoneById (this.id);
			if (milestoneInfo == null)
				return false;
			
			Set<Integer> expect = new HashSet<Integer>();
			expect.add(rewardId);

			MapItem choose = all.get(rewardId);
			
			int num = MiscInfo.DERBY_MEMBER_REWARD_NUMBER();
			if (choose != null)
				num -= 1;
			
			all = milestoneInfo.generateRewards (num, expect, false);
			
			if (choose != null)
				all.put(rewardId, choose);
			
			return true;
		}
		
		public MapItem get(int rewardId)
		{
			return all.get(rewardId);
		}
		
		@Override
		public void putData(Encoder msg)
		{
			msg.put(DERBY_REWARD_MILESTONE_ID, id);
			msg.put(DERBY_REWARD_MILESTONE_CHOOSE, rewardId);
			msg.putInts(DERBY_REWARD_MILESTONE_SLOT_ID, all.keySet());
			msg.putMapItem(DERBY_REWARD_MILESTONE_SLOT_ITEM, all.values());
		}
	}
}
