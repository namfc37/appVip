package model.object;

import java.util.HashMap;
import java.util.Map;

import cmd.ErrorConst;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscInfo;
import data.QuestMissionInfo;
import util.collection.MapItem;
import util.serialize.Encoder;

public class QuestMission extends Encoder.IObject implements KeyDefine
{
	private int group;
	private Map<Integer, Mission> missions;
	private MapItem rewards;
	private boolean isClaimRewards;
	
    private QuestMission () {}
    
    public static QuestMission create (short userLevel)
    {
    	if (!MiscInfo.QUEST_MISSION_ACTIVE())
    		return null;
    	
    	if (MiscInfo.QUEST_MISSION_USER_LEVEL_MIN() > userLevel || userLevel > MiscInfo.QUEST_MISSION_USER_LEVEL_MAX())
    		return null;
    	
    	QuestMissionInfo.Group info = ConstInfo.getQuestMissionInfo().getGroupByLevel (userLevel);
    	if (info == null)
    		return null;
    	
    	QuestMission questMission = new QuestMission ();
    	boolean isSuccess = questMission.initQuest(info);
    	
    	return isSuccess ? questMission : null;
    }

	public int ID() { return group; }
    public MapItem REWARDS () { return this.rewards; } 
    public boolean IS_CLAIM_REWARDS () { return this.isClaimRewards; }
    public Map<Integer, Mission> MISSIONS () { return this.missions; }
    public boolean IS_FINISH ()
    {
    	for (Mission mission : this.missions.values())
    		if (!mission.IS_FINISH())
    			return false;
    	
    	return true;
    }
    
	public boolean hasMission(int missionId)
	{
		return missions.containsKey(missionId);
	}
    
    private boolean initQuest (QuestMissionInfo.Group info)
    {
    	if (info == null)
    		return false;

    	int group = info.ID ();
    	MapItem rewards = info.REWARDS ();
    	
    	Map<Integer, Mission> missions = new HashMap<Integer, Mission>();
    	for (Integer missionId : info.MISSIONS ())
    	{
    		QuestMissionInfo.Mission missionInfo = ConstInfo.getQuestMissionInfo().getMission (missionId);
    		Mission mission = Mission.create(missionInfo);
    		if (mission != null)
    			missions.put (mission.ID(), mission);
    	}
    	
    	if (missions.size() != 0)
    	{
    		this.group = group;
    		this.rewards = rewards;
    		this.missions = missions;
    		this.isClaimRewards = false;
    		return true;
    	}
    	
    	return false;
    }

	public byte updateProgress(int missionId, int missionCurrent)
	{
		Mission mission = missions.get(missionId);
		if (mission == null)
			return ErrorConst.INVALID_SLOT_ID;
		
		return mission.updateProgress (missionCurrent);
	}

	public int getCurrent(int missionId)
	{
		Mission mission = missions.get(missionId);
		if (mission == null)
			return -1;
		
		return mission.CURRENT();
	}
    
    public void checkClaimRewards ()
    {
    	this.isClaimRewards = true;
    }
    
    public void next (short userLevel)
    {
    	if (!IS_FINISH())
    		return;
    	
    	if (!IS_CLAIM_REWARDS())
    		return;
    	
    	if (userLevel > MiscInfo.QUEST_MISSION_USER_LEVEL_MAX())
    		return;
    	
    	QuestMissionInfo.Group info = ConstInfo.getQuestMissionInfo().getGroup (this.group + 1);
    	if (!this.initQuest (info))
    		this.clean();
    }
    
    private void clean()
    {
		this.group = -1;
		this.rewards = null;
		this.missions = null;
		this.isClaimRewards = true;
	}

	@Override
    public void putData (Encoder msg)
    {
        msg.put(QUEST_MISSION_GROUP_ID, ID());

        msg.put(QUEST_MISSION_REWARDS, REWARDS());
    	
    	if (MISSIONS() != null)
    		msg.put(QUEST_MISSION_ITEMS, MISSIONS().values());
    	
    	msg.put(QUEST_MISSION_CLAIM_REWARDS, IS_CLAIM_REWARDS());
    }

	public boolean gmChange(int missionId)
	{
		QuestMissionInfo.Group info = ConstInfo.getQuestMissionInfo().getGroup(missionId);
		if (info == null)
			return false;
				
		return this.initQuest(info);
	}

    private static class Mission extends Encoder.IObject implements KeyDefine
    {
    	private int id;
    	private int action;
    	private String target;
    	private int require;
    	private int current;
    	
    	private Mission () {};

		public int ID() { return id; }
		private int ACTION() { return action; }
		private String TARGET() { return target; }
		private int REQUIRE() { return require; }
		private int CURRENT() { return current; }
        public boolean IS_FINISH () { return current >= require; }

		private static Mission create (QuestMissionInfo.Mission info)
    	{
        	if (info == null)
        		return null;
        	
    		Mission mission = new Mission ();
    		mission.id = info.ID ();
    		mission.action = info.ACTION ();
    		mission.target = info.TARGET ();
    		mission.require = info.REQUIRE ();
    		mission.current = 0;
    		
    		return mission;
    	}
    	
    	public byte updateProgress(int missionCurrent)
    	{
            if (current >= require)
                return ErrorConst.INVALID_STATUS;

            if (missionCurrent < 0 || missionCurrent <= current)
                return ErrorConst.INVALID_NUM;

            current = Math.min(missionCurrent, require);
            return ErrorConst.SUCCESS;
		}
	    
	    @Override
	    public void putData (Encoder msg)
	    {
            msg.put(QUEST_ID, ID());
            msg.put(QUEST_ACTION, ACTION());
            msg.put(QUEST_TARGET, TARGET());
            msg.put(QUEST_REQUIRE, REQUIRE());
            msg.put(QUEST_CURRENT, CURRENT());
	    }
    }
}
