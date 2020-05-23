package data;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Event02Info
{
	public String E02_TYPE;
	public String E02_ID;
	public String E02_POINT;
	public String E02_PLANT;
	public String E02_DROPITEM;
	public String E02_START_TIME;
	public String E02_END_TIME;
	
	public int E02_UNIX_START_TIME;
	public int E02_UNIX_END_TIME;
	
	public PlantDropItemInfo E02_PLANT_DROP_LIST;
	public FeatureDropItemInfo E02_FEATURE_DROP_LIST;
	public PuzzleInfo E02_PUZZLE;
	public HarvestDropItemInfo E02_HARVEST_DROP_LIST;
	public IBShopInfo E02_SHOP;

	public Map<Integer, TreeMap<Integer, Event02Reward>> E02_REWARDS;
	public TreeMap<Integer, TreeMap<Integer, Event02RewardPack>> E02_REWARDS_PACK;
}
