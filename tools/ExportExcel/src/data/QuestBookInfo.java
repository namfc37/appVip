package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

public class QuestBookInfo
{
    public Map<String, QuestAction> QUESTS = new LinkedHashMap<>();
    public List<SpecialReward> SPECIAL_REWARDS = new ArrayList<>();
    public NavigableMap<Integer, LevelRatio> LEVEL_RATIO = new TreeMap<Integer, LevelRatio> ();  
	
	public static class QuestAction
	{
	    public String            ACTION;
	    public int               ACTION_ID;
	    public int               MIN;
	    public int               MAX;
	    public int               RATE;
	    public float             RATIO;
	    public List<QuestItem>   QUEST_ITEMS;
	}

    public static class QuestItem
    {
        public String                   TARGET;
        public int                      LEVEL;
        public int                      RATE;
        public int                      REQUIRE_MIN;
        public int                      REQUIRE_MAX;
        public String                   SKIP_PRICE_TYPE;
        public int                      SKIP_PRICE_NUM;
        public HashMap<String, Integer> REWARD;
    }
    
    public static class SpecialReward
    {
        public int                      RATE;
        public HashMap<String, Integer> REWARD;
    }
    
    public static class LevelRatio
    {
    	public float EXP;
    	public float GOLD;
    }
}
