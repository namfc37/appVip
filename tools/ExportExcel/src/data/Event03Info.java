package data;

import java.util.Map;
import java.util.TreeMap;

public class Event03Info
{
	public String E03_TYPE;
	public String E03_ID;
	public String E03_POINT;
	public String E03_PLANT;
	public String E03_DROPITEM;
	public String E03_START_TIME;
	public String E03_END_TIME;
	
	public int E03_UNIX_START_TIME;
	public int E03_UNIX_END_TIME;
	
	public PlantDropItemInfo E03_PLANT_DROP_LIST;
	public FeatureDropItemInfo E03_FEATURE_DROP_LIST;
	public PuzzleInfo E03_PUZZLE;
	public IBShopInfo E03_SHOP;
	
	public Map<Integer, TreeMap<Integer, Event03Reward>> E03_REWARDS;
}
