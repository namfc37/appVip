package data.ranking;

import util.Time;
import util.collection.MapItem;

import java.util.Collections;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.NavigableSet;

public class TopAction
{
    private String   ID;
    private String[] ACTIONS;

    private NavigableSet<Integer>                                 LEVELS;
    private NavigableMap<Integer, NavigableMap<Integer, MapItem>> REWARDS;

    private String START_TIME;
    private String END_TIME;
    private String REWARD_TIME;

    private int UNIX_START_TIME;
    private int UNIX_END_TIME;
    private int UNIX_REWARD_TIME;

    private int     DEFAULT_REQUIRE;
    private MapItem DEFAULT_REWARDS;

    public void init ()
    {
        LEVELS = Collections.unmodifiableNavigableSet(LEVELS);

        for (Integer lv : REWARDS.keySet())
        {
            NavigableMap<Integer, MapItem> groupLevelrewards = REWARDS.get(lv);
            for (Integer top : groupLevelrewards.keySet())
            {
                MapItem items = groupLevelrewards.get(top);
                items = items.toUnmodifiableMapItem();
                groupLevelrewards.put(top, items);
            }

            groupLevelrewards = Collections.unmodifiableNavigableMap(groupLevelrewards);
            REWARDS.put(lv, groupLevelrewards);
        }

        REWARDS = Collections.unmodifiableNavigableMap(REWARDS);
        DEFAULT_REWARDS = DEFAULT_REWARDS.toUnmodifiableMapItem();
    }

    public String RANKING_ID ()
    {
        return ID;
    }

    public int DEFAULT_REQUIRE ()
    {
        return DEFAULT_REQUIRE;
    }

    public MapItem DEFAULT_REWARDS ()
    {
        return DEFAULT_REWARDS;
    }

    public int UNIX_START_TIME ()
    {
        return UNIX_START_TIME;
    }

    public int UNIX_END_TIME ()
    {
        return UNIX_END_TIME;
    }

    public int UNIX_REWARD_TIME ()
    {
        return UNIX_REWARD_TIME;
    }

    public boolean isActive ()
    {
        int time = Time.getUnixTime();
        return UNIX_START_TIME() < time && time < UNIX_END_TIME();
    }

    public int getGroup (int lv)
    {
        return LEVELS.ceiling(lv);
    }

    public NavigableSet<Integer> getGroups ()
    {
        return LEVELS;
    }

    public MapItem getReward (int level, int order)
    {
        Entry<Integer, NavigableMap<Integer, MapItem>> group = REWARDS.ceilingEntry(level);
        if (group == null)
            return null;

        Entry<Integer, MapItem> reward = group.getValue().ceilingEntry(order);
        if (reward == null)
            return null;

        return reward.getValue();
    }
}
