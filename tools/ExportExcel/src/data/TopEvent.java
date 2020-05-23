package data;

import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

public class TopEvent
{
	public String EVENT_ID;
    public List<Integer> LEVELS;
    public TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> REWARDS;
    public TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> BONUS;
//	public String START_TIME;
//	public String END_TIME;
//	
//	public int UNIX_START_TIME;
//	public int UNIX_END_TIME;
}
