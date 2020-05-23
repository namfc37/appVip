package data.ranking;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import data.MiscInfo;
import data.festival.EventInfo;
import util.Time;
import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;

public class RankingBoardInfo
{
    private TopLevel               TOP_LEVEL;
    private TopAppraisal           TOP_APPRAISAL;
    private Map<String, TopAction> TOP_ACTIONS;
    private Map<String, TopEvent>  TOP_EVENTS;

    private NavigableMap<Integer, TopAction> TOP_ACTION_TIMELINE;
    private Map<String, TopId>               TOP_IDS;
    private Map<String, TopId>               TOP_REWARD_IDS;

    public void init ()
    {
        TOP_LEVEL.init();
        TOP_APPRAISAL.init();

        for (TopEvent t : TOP_EVENTS.values())
            t.init();

        TOP_EVENTS = Collections.unmodifiableMap(TOP_EVENTS);

        TOP_ACTION_TIMELINE = new TreeMap<Integer, TopAction>();
        for (TopAction t : TOP_ACTIONS.values())
        {
            t.init();

            if (t.UNIX_START_TIME() > 0)
                TOP_ACTION_TIMELINE.put(t.UNIX_START_TIME(), t);
        }

        TOP_ACTION_TIMELINE = Collections.unmodifiableNavigableMap(TOP_ACTION_TIMELINE);
        TOP_ACTIONS = Collections.unmodifiableMap(TOP_ACTIONS);

        TOP_IDS = new HashMap<String, TopId>();
        TOP_REWARD_IDS = new HashMap<String, TopId>();

        NavigableSet<Integer> lvs = TOP_LEVEL.getGroups();
        for (int lv : lvs)
        {
            String key = MiscInfo.TOP_LEVEL() + "_" + lv;
            TOP_IDS.put(key, new TopId(MiscInfo.TOP_LEVEL(), lv, -1));
        }

        lvs = TOP_APPRAISAL.getGroups();
        for (int lv : lvs)
        {
            String key = MiscInfo.TOP_APPRAISAL() + "_" + lv;
            TOP_IDS.put(key, new TopId(MiscInfo.TOP_APPRAISAL(), lv, -1));
        }

        for (TopAction t : TOP_ACTIONS.values())
        {
            if (t.UNIX_START_TIME() < 1)
                continue;

            lvs = t.getGroups();
            for (int lv : lvs)
            {
                String key = t.RANKING_ID() + "_" + lv + "_" + t.UNIX_START_TIME();
                TOP_IDS.put(key, new TopId(t.RANKING_ID(), lv, t.UNIX_START_TIME()));
                TOP_REWARD_IDS.put(key, new TopId(t.RANKING_ID(), lv, t.UNIX_START_TIME()));
            }
        }

        for (TopEvent t : TOP_EVENTS.values())
        {
            EventInfo info = ConstInfo.getFestival().getAction(t.EVENT_ID());
            if (info == null)
                continue;

            lvs = t.getGroups();
            for (int lv : lvs)
            {
                String key = t.RANKING_ID() + "_" + lv + "_" + t.UNIX_START_TIME();
                TOP_IDS.put(key, new TopId(t.RANKING_ID(), lv, t.UNIX_START_TIME()));
                TOP_REWARD_IDS.put(key, new TopId(t.RANKING_ID(), lv, t.UNIX_START_TIME()));
            }
        }

        TOP_IDS = Collections.unmodifiableMap(TOP_IDS);
        TOP_REWARD_IDS = Collections.unmodifiableMap(TOP_REWARD_IDS);
    }

    public TopAction TOP_ACTION (String id)
    {
        if (TOP_ACTIONS.containsKey(id))
            return TOP_ACTIONS.get(id);

        return null;
    }

    public TopAction CURRENT_TOP_ACTION ()
    {
        if (TOP_ACTION_TIMELINE.size() == 0)
            return null;

        int current = Time.getUnixTime();
        if (current < TOP_ACTION_TIMELINE.firstKey())
            return null;

        Entry<Integer, TopAction> topEntry = TOP_ACTION_TIMELINE.floorEntry(current);
        if (topEntry == null)
            return null;

        TopAction action = topEntry.getValue();
        if (action.UNIX_START_TIME() > current || current > action.UNIX_END_TIME())
            return null;

        return action;
    }

    public TopAction PREVIOUS_TOP_ACTION ()
    {
        if (TOP_ACTION_TIMELINE.size() == 0)
            return null;

        int current = Time.getUnixTime();
        if (current < TOP_ACTION_TIMELINE.firstKey())
            return null;

        int previous = TOP_ACTION_TIMELINE.floorKey(current);
        if (previous > TOP_ACTION_TIMELINE.firstKey() && previous < TOP_ACTION_TIMELINE.lastKey())
        {
            Entry<Integer, TopAction> previousEntry = TOP_ACTION_TIMELINE.floorEntry(previous);
            if (previousEntry.getValue().UNIX_END_TIME() > current)
                previous -= 1;
        }

        Entry<Integer, TopAction> topEntry = TOP_ACTION_TIMELINE.floorEntry(previous);
        if (topEntry == null)
            return null;

        TopAction action = topEntry.getValue();
        return action;
    }

    public TopEvent CURRENT_TOP_EVENT ()
    {
        EventInfo eventInfo = ConstInfo.getFestival().getCurrentAction();
        if (eventInfo == null)
            return null;

        return TOP_EVENTS.get(MiscInfo.TOP_EVENT() + "_" + eventInfo.ID());
    }

    public TopEvent PREVIOUS_TOP_EVENT ()
    {
        EventInfo eventInfo = ConstInfo.getFestival().getPreviousAction();
        if (eventInfo == null)
            return null;

        return TOP_EVENTS.get(MiscInfo.TOP_EVENT() + "_" + eventInfo.ID());
    }

    public Set<String> TOP_IDS ()
    {
        return TOP_IDS.keySet();
    }

    public Set<String> TOP_REWARD_IDS ()
    {
        return TOP_REWARD_IDS.keySet();
    }

    public MapItem getDefaultReward (String rankingID, int point)
    {
        TopAction action = getTopAction(rankingID);
        if (action == null || !action.isActive())
            return null;

        if (point < action.DEFAULT_REQUIRE())
            return null;

        return action.DEFAULT_REWARDS();
    }

    public MapItem getReward (String comboRankingID, int lv, int order)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        lv = Math.min(lv, id.groupLv);
        if (id == null || id.groupLv < lv)
            return null;

        if (TOP_ACTIONS.containsKey(id.rankingID))
        {
            TopAction topAction = TOP_ACTIONS.get(id.rankingID);
            if (topAction == null || topAction.UNIX_START_TIME() != id.timeStart)
                return null;

            return topAction.getReward(lv, order);
        }

        if (TOP_EVENTS.containsKey(id.rankingID))
        {
            TopEvent topEvent = TOP_EVENTS.get(id.rankingID);
            if (topEvent == null || topEvent.UNIX_START_TIME() != id.timeStart)
                return null;

            return topEvent.getReward(lv, order);
        }

        return null;
    }

    public MapItem getBonus (String comboRankingID, int lv, int order)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        lv = Math.min(lv, id.groupLv);
        if (id == null || id.groupLv < lv)
            return null;

        if (TOP_EVENTS.containsKey(id.rankingID))
        {
            TopEvent topEvent = TOP_EVENTS.get(id.rankingID);
            if (topEvent == null || topEvent.UNIX_START_TIME() != id.timeStart)
                return null;

            return topEvent.getBonus(lv, order);
        }

        return null;
    }

    public int getRewardTime (String comboRankingID)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        if (id == null)
            return 0;

        if (TOP_ACTIONS.containsKey(id.rankingID))
        {
            TopAction topAction = TOP_ACTIONS.get(id.rankingID);
            if (topAction == null)
                return 0;

            return topAction.UNIX_REWARD_TIME();
        }

        if (TOP_EVENTS.containsKey(id.rankingID))
        {
            TopEvent topEvent = TOP_EVENTS.get(id.rankingID);
            if (topEvent == null)
                return 0;

            return topEvent.UNIX_REWARD_TIME();
        }

        return 0;
    }

    public int getEndTime (String comboRankingID)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        if (id == null)
            return 0;

        if (TOP_ACTIONS.containsKey(id.rankingID))
        {
            TopAction topAction = TOP_ACTIONS.get(id.rankingID);
            if (topAction == null)
                return 0;

            return topAction.UNIX_END_TIME();
        }

        if (TOP_EVENTS.containsKey(id.rankingID))
        {
            TopEvent topEvent = TOP_EVENTS.get(id.rankingID);
            if (topEvent == null)
                return 0;

            return topEvent.UNIX_END_TIME();
        }

        return 0;
    }
    
    public TopAction getTopAction (String rankingID)
    {
        if (!TOP_ACTIONS.containsKey(rankingID))
            return null;

        return TOP_ACTIONS.get(rankingID);
    }

    public TopEvent getTopEvent (String eventID)
    {
        if (!TOP_EVENTS.containsKey(eventID))
            return null;

        return TOP_EVENTS.get(eventID);
    }

    public boolean validRankingID (String rankingID)
    {
        return TOP_ACTIONS.containsKey(rankingID);
    }

    public int getGroupLevel (String rankingID, int lv)
    {
        if (rankingID.equalsIgnoreCase(MiscInfo.TOP_LEVEL()))
            return TOP_LEVEL.getGroup(lv);

        if (rankingID.equalsIgnoreCase(MiscInfo.TOP_APPRAISAL()))
            return TOP_APPRAISAL.getGroup(lv);

        if (TOP_EVENTS.containsKey(rankingID))
            return TOP_EVENTS.get(rankingID).getGroup(lv);

        if (TOP_ACTIONS.containsKey(rankingID))
            return TOP_ACTIONS.get(rankingID).getGroup(lv);

        return 0;
    }

    public NavigableSet<Integer> getGroupLevels (String rankingID)
    {
        if (rankingID.equalsIgnoreCase(MiscInfo.TOP_LEVEL()))
            return TOP_LEVEL.getGroups();

        if (rankingID.equalsIgnoreCase(MiscInfo.TOP_APPRAISAL()))
            return TOP_APPRAISAL.getGroups();

        if (TOP_EVENTS.containsKey(rankingID))
            return TOP_EVENTS.get(rankingID).getGroups();

        if (TOP_ACTIONS.containsKey(rankingID))
            return TOP_ACTIONS.get(rankingID).getGroups();

        return null;
    }

    public String getMailTitle (String comboRankingID)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        if (id == null)
            return "TXT_MAIL_TOP_REWARD_TITLE";

        if (TOP_ACTIONS.containsKey(id.rankingID))
            return MiscInfo.TOP_ACTION_TITLE();

        if (TOP_EVENTS.containsKey(id.rankingID))
            return MiscInfo.TOP_EVENT_TITLE();

        return "TXT_MAIL_TOP_REWARD_TITLE";
    }

    public int getGroupLevel (String comboRankingID)
    {
        TopId id = TOP_IDS.get(comboRankingID);
        if (id == null)
            return -1;

        return id.groupLv;
    }

    private static class TopId
    {
        String rankingID;
        int    groupLv;
        int    timeStart;

        private TopId (String rankingID, int groupLv, int timeStart)
        {
            this.rankingID = rankingID;
            this.groupLv = groupLv;
            this.timeStart = timeStart;
        }
    }

}