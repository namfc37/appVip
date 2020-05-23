package data;

import exportexcel.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Event03Reward
{
	public int id;
	public int num;
	public List<Reward> items;
	
	public Event03Reward(int total)
	{
		this.num = total;
		this.items = new ArrayList<Reward> ();
	}
	
	public void add (HashMap<String, Integer> mapitem, int rate)
	{
		if (num < 1)
			rate = -1;
		
		for (String itemId : mapitem.keySet())
		{
			int number = mapitem.get(itemId);
			Reward r = new Reward (itemId, number, rate);
			items.add(r);
			
			break;
		}
	}
	
	public boolean check ()
	{
		if (num > 0)
		{
			if (num > items.size())
			{
				Log.debug("Event03Reward", num, items.size(), "not enough items");
				return false;
			}
		}
		
		ArrayList<String> checkItems = new ArrayList<String> ();
		for (Reward r : items)
		{
			if (checkItems.contains(r.id))
			{
				Log.debug("Event03Reward", r.id, "double item id");
				return false;
			}
			
			checkItems.add(r.id);
		}
		
		items.sort((a, b) -> a.rate - b.rate);
		
		return true;
	}
	
	public static class Reward
	{
		public String id;
		public int quantity;
		public int rate;
		
		public Reward (String itemId, int num, int rate)
		{
			this.id = itemId;
			this.quantity = num;
			this.rate = rate;
		}
	}
}
