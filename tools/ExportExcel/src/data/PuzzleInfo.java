package data;

import java.util.HashMap;

public class PuzzleInfo
{
	public HashMap<String, Puzzle> PUZZLES = new HashMap<String, Puzzle> ();
	
	public void add (String id, HashMap<String, Integer> require, HashMap<String, Integer> rewards, int displayOrder, boolean isVietNamOnly)
	{
		Puzzle p = new Puzzle ();
		p.id = id;
		p.require = require;
		p.rewards = rewards;
		p.DISPLAY_ORDER = displayOrder;
		p.IS_VIETNAM_ONLY = isVietNamOnly;
		PUZZLES.put(p.id, p);
	}

	public void add (String id, HashMap<String, Integer> require, HashMap<String, Integer> rewards) {
		Puzzle p = new Puzzle ();
		p.id = id;
		p.require = require;
		p.rewards = rewards;
		PUZZLES.put(p.id, p);
	}

	public static class Puzzle
	{
		public String id;
		public HashMap<String, Integer> require;
		public HashMap<String, Integer> rewards;
		public int DISPLAY_ORDER;
		public boolean IS_VIETNAM_ONLY;
	}
}
