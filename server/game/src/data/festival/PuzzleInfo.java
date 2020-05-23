package data.festival;

import util.collection.MapItem;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class PuzzleInfo
{
    private Map<String, Puzzle> PUZZLES = new HashMap<String, Puzzle>();

    public void init ()
    {
        for (Puzzle p : PUZZLES.values())
            p.init();

        PUZZLES = Collections.unmodifiableMap(PUZZLES);
    }

    public MapItem getRequire (String puzzleId)
    {
        Puzzle p = PUZZLES.get(puzzleId);
        if (p == null)
            return null;

        return p.require();
    }

    public MapItem getRewards (String puzzleId)
    {
        Puzzle p = PUZZLES.get(puzzleId);
        if (p == null)
            return null;

        return p.rewards();
    }

    public static class Puzzle
    {
        private String  id;
        private MapItem require;
        private MapItem rewards;

        public void init ()
        {
            require = require.toUnmodifiableMapItem();
            rewards = rewards.toUnmodifiableMapItem();
        }

        public MapItem require ()
        {
            return require;
        }

        public MapItem rewards ()
        {
            return rewards;
        }
    }
}
