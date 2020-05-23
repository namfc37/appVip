package data;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.Set;
import java.util.TreeMap;

import util.collection.MapItem;

public class FlippingCardsInfo
{
	private Map<Integer, MapItem> CHECKPOINTS;
	private NavigableMap<Integer, Float> TIME_RATIO;
	private String TICKET_ID;
	private String ITEM1_ID;
	private String ITEM2_ID;
	private String ITEM3_ID;
	
	public String TICKET_ID () { return TICKET_ID; }
	public String ITEM1_ID () { return ITEM1_ID; }
	public String ITEM2_ID () { return ITEM2_ID; }
	public String ITEM3_ID () { return ITEM3_ID; }
	
	private MapItem GAME_START_REQUIRE;
	private MapItem BUFF_ITEM_1;
	private MapItem BUFF_ITEM_2;
	private MapItem BUFF_ITEM_3;
	
	private Map<String, MapItem> BUFF_ITEMS;

	public void init()
	{
		Set<Integer> keys = CHECKPOINTS.keySet();
		for (Integer key : keys)
		{
			MapItem items = CHECKPOINTS.get(key);
			items = items.toUnmodifiableMapItem();
			CHECKPOINTS.put (key, items);
		}
		
		CHECKPOINTS = Collections.unmodifiableMap(CHECKPOINTS);
		TIME_RATIO = Collections.unmodifiableNavigableMap(TIME_RATIO);
		
		GAME_START_REQUIRE = new MapItem ();
		GAME_START_REQUIRE.increase(MiscInfo.FLIPPINGCARDS_TICKET(), MiscInfo.FLIPPINGCARDS_BOARD_REQUIRE_TICKET());
		GAME_START_REQUIRE = GAME_START_REQUIRE.toUnmodifiableMapItem();
		
		BUFF_ITEM_1 = new MapItem ();
		BUFF_ITEM_1.increase(MiscInfo.FLIPPINGCARDS_BOARD_ITEM1_ID(), 1);
		BUFF_ITEM_1 = BUFF_ITEM_1.toUnmodifiableMapItem();
		
		BUFF_ITEM_2 = new MapItem ();
		BUFF_ITEM_2.increase(MiscInfo.FLIPPINGCARDS_BOARD_ITEM2_ID(), 1);
		BUFF_ITEM_2 = BUFF_ITEM_2.toUnmodifiableMapItem();
		
		BUFF_ITEM_3 = new MapItem ();
		BUFF_ITEM_3.increase(MiscInfo.FLIPPINGCARDS_BOARD_ITEM3_ID(), 1);
		BUFF_ITEM_3 = BUFF_ITEM_3.toUnmodifiableMapItem();
		
		BUFF_ITEMS = new HashMap<String, MapItem> ();
		BUFF_ITEMS.put(MiscInfo.FLIPPINGCARDS_BOARD_ITEM1_ID(), BUFF_ITEM_1);
		BUFF_ITEMS.put(MiscInfo.FLIPPINGCARDS_BOARD_ITEM2_ID(), BUFF_ITEM_2);
		BUFF_ITEMS.put(MiscInfo.FLIPPINGCARDS_BOARD_ITEM3_ID(), BUFF_ITEM_3);
		BUFF_ITEMS = Collections.unmodifiableMap(BUFF_ITEMS);
	}
	
	public MapItem getRewardAtCheckpoint (int checkpoint)
	{
		return CHECKPOINTS.get(checkpoint);
	}
	
	public float getRatio (int playTime)
	{
		Entry<Integer, Float> entry = TIME_RATIO.ceilingEntry(playTime);
		if (entry == null)
			entry = TIME_RATIO.lastEntry();
		
		return entry == null ? 1 : entry.getValue();
	}
	
	public MapItem GAME_START_REQUIRE()
	{
		return GAME_START_REQUIRE;
	}
	
	public MapItem getBuffItemRequire(String itemId)
	{
		return BUFF_ITEMS.get (itemId);
	}
}
