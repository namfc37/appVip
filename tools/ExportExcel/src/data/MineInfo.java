package data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

public class MineInfo
{
	public TreeMap<Integer, MineRequireInfo> REQUIRE_ITEMS = new TreeMap<Integer, MineRequireInfo> ();
	public HashMap<String, MineProductInfo> PRODUCT_ITEMS = new HashMap<String, MineProductInfo> ();
	
	public static class MineRequireInfo
	{
		public int USER_LEVEL = 0;
		public int MIN_ITEM_TYPE = 0;
		public int MAX_ITEM_TYPE = 0;
		public HashMap<String, Integer> EASY_REQUIRE = new HashMap<String, Integer> ();
		public HashMap<String, Integer> MEDIUM_REQUIRE = new HashMap<String, Integer> ();
		public HashMap<String, Integer> HARD_REQUIRE = new HashMap<String, Integer> ();
		public int MIN_NUM_REQUIRE_ITEM_EASY = 0;
		public int MAX_NUM_REQUIRE_ITEM_EASY = 0;
		public int MIN_NUM_REQUIRE_ITEM_MEDIUM = 0;
		public int MAX_NUM_REQUIRE_ITEM_MEDIUM = 0;
		public int MIN_NUM_REQUIRE_ITEM_HARD = 0;
		public int MAX_NUM_REQUIRE_ITEM_HARD = 0;
	}
	
	public static class MineProductInfo
	{
		public String ITEM_NAME = "";
		public int RATE = 0;
		public ArrayList<Integer> NUMBER_TYPES_TO_REWARDS = new ArrayList<Integer>();
	}
}
