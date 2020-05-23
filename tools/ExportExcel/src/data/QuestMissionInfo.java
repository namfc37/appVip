package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

public class QuestMissionInfo
{
    public TreeMap<Integer, Group> GROUPS;
    public TreeMap<Integer, Mission> MISSIONS;
    
    public static class Group
    {
    	public int ID;
    	public int LEVEL;
    	public ArrayList<Integer> MISSIONS;
    	public HashMap<String, Integer> REWARDS;
    	public String TITLE;
    	public String DESC;
    }
    
    public static class Mission
    {
    	public int ID;
		public int GROUP;
    	public int ACTION_ID;
    	public Object TARGET;
    	public int REQUIRE;
    	
//    	public String HINT;
    }
}
