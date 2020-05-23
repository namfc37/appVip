package data.ranking;

import data.ConstInfo;
import data.MiscInfo;
import data.festival.EventInfo;
import util.collection.MapItem;

import java.util.Collections;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.NavigableSet;

public class TopEvent
{
    private String                                                EVENT_ID;
    private String                                                RANKING_ID;
    private NavigableSet<Integer>                                 LEVELS;
    private NavigableMap<Integer, NavigableMap<Integer, MapItem>> REWARDS;
    private NavigableMap<Integer, NavigableMap<Integer, MapItem>> BONUS;

    public void init ()
    {
        RANKING_ID = MiscInfo.TOP_EVENT() + "_" + EVENT_ID;
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
        for (Integer lv : BONUS.keySet())
        {
            NavigableMap<Integer, MapItem> groupLevelBonus = BONUS.get(lv);
            for (Integer top : groupLevelBonus.keySet())
            {
                MapItem items = groupLevelBonus.get(top);
                items = items.toUnmodifiableMapItem();
                groupLevelBonus.put(top, items);
            }

            groupLevelBonus = Collections.unmodifiableNavigableMap(groupLevelBonus);
            BONUS.put(lv, groupLevelBonus);
        }

        BONUS = Collections.unmodifiableNavigableMap(BONUS);
    }

    public String EVENT_ID ()
    {
        return EVENT_ID;
    }

    public String RANKING_ID ()
    {
        return RANKING_ID;
    }

    public String EVENT_TOKEN ()
    {
        EventInfo action = ConstInfo.getFestival().getAction(EVENT_ID);
        return action == null ? null : action.POINT();
    }

    public int UNIX_START_TIME ()
    {
        EventInfo action = ConstInfo.getFestival().getAction(EVENT_ID);
        return action == null ? -1 : action.UNIX_START_TIME();
    }

    public int UNIX_END_TIME ()
    {
        EventInfo action = ConstInfo.getFestival().getAction(EVENT_ID);
        return action == null ? -1 : action.UNIX_END_TIME();
    }

    public int UNIX_REWARD_TIME ()
    {
        EventInfo action = ConstInfo.getFestival().getAction(EVENT_ID);
        return action == null ? -1 : (action.UNIX_END_TIME() + 30 * 60);
    }

    public boolean isOpen ()
    {
        EventInfo action = ConstInfo.getFestival().getAction(EVENT_ID);
        return action == null ? false : action.isActive();
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

    public MapItem getBonus(int level, int order)
    {
        Entry<Integer, NavigableMap<Integer, MapItem>> group = BONUS.ceilingEntry(level);
        if (group == null)
            return null;

        Entry<Integer, MapItem> bonus = group.getValue().ceilingEntry(order);
        if (bonus == null)
            return null;

        return bonus.getValue();
    }
}
