package data;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import util.collection.MapItem;

public class QuestMissionInfo
{
	private Map<Integer, Group> GROUPS;
	private Map<Integer, Mission> MISSIONS;
    
    public void init ()
    {
    	for (Group group : GROUPS.values())
    	{
    		group.MISSIONS = Collections.unmodifiableList(group.MISSIONS);
    		group.REWARDS = group.REWARDS.toUnmodifiableMapItem();
    	}
    	
    	GROUPS = Collections.unmodifiableMap(GROUPS);
    	MISSIONS = Collections.unmodifiableMap(MISSIONS);
    }

	public Group getGroup(int groupId)
	{
		return GROUPS.get(groupId);
	}

	public Group getGroupByLevel(short userLevel)
	{
		Group choose = null;
		for (int groupId : GROUPS.keySet())
		{
			Group group = GROUPS.get(groupId);
			if (group.LEVEL > userLevel)
				break;
			
			if (choose == null || choose.LEVEL < group.LEVEL)
				choose = group;
		}
		
		return choose;
	}
	
	public Mission getMission(Integer missionId)
	{
		return MISSIONS.get(missionId);
	}
    
    public static class Group
    {
    	private int ID;
    	private int LEVEL;
    	private List<Integer> MISSIONS;
    	private MapItem REWARDS;
    	
    	private String TITLE;
    	private String DESC;
		
		public int ID()
		{
			return ID;
		}
    	
		public List<Integer> MISSIONS()
		{
			return MISSIONS;
		}
		
		public MapItem REWARDS()
		{
			return REWARDS;
		}
    }
    
    public static class Mission
    {
    	private int ID;
    	private int GROUP;
    	private int ACTION_ID;
    	private String TARGET;
    	private int REQUIRE;
    	
//    	private String HINT;

		public int ID() { return ID; }
		public int ACTION() { return ACTION_ID; }
		public String TARGET() { return TARGET; }
		public int REQUIRE() { return REQUIRE; }
    }
}
