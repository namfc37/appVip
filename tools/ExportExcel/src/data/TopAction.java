package data;

import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

public class TopAction
{
	public String ID;
	public String[] ACTIONS;
	
    public List<Integer> LEVELS;
    public TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> REWARDS;

	public String START_TIME;
	public String END_TIME;
	public String REWARD_TIME;
	
	public int UNIX_START_TIME;
	public int UNIX_END_TIME;
	public int UNIX_REWARD_TIME;
	
    public int DEFAULT_REQUIRE;
    public HashMap<String, Integer> DEFAULT_REWARDS;
    
    public String SLOGAN_TEXT_ID;
    public String DESC_TEXT_ID;
    public String ICON;
}
