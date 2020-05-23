package data;

import java.util.Map;
import java.util.TreeMap;

public class Event01Info
{
	public String E01_TYPE;
	public String E01_ID;
	public String E01_POINT;
	public String E01_PLANT;
	public String E01_DROPITEM;
	public String E01_START_TIME;
	public String E01_END_TIME;
	
	public int E01_UNIX_START_TIME;
	public int E01_UNIX_END_TIME;
	
	public PlantDropItemInfo E01_PLANT_DROP_LIST;
	public FeatureDropItemInfo E01_FEATURE_DROP_LIST;
	public PuzzleInfo E01_PUZZLE;
	public IBShopInfo E01_SHOP;
	
	public Map<Integer, TreeMap<Integer, Event01Reward>> E01_REWARDS; 
}
