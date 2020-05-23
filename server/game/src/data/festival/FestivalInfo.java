package data.festival;

import data.ItemInfo;
import data.ItemType;
import data.PlantInfo;
import util.Time;
import util.collection.MapItem;

import java.util.*;
import java.util.Map.Entry;

public class FestivalInfo
{
    private Event01Info                      event01;
    private Event02Info                      event02;
    private Event03Info                      event03;
    private HashMap<String, EventInfo>       agenda;
    private NavigableMap<Integer, EventInfo> timeline;
    private ArrayList<String>                actionIds;

    private List<String> items;

    public void setEvent01 (Event01Info info)
    {
        this.event01 = info;
    }

    public Event01Info getEvent01 ()
    {
        return event01;
    }

    public void setEvent02 (Event02Info info)
    {
        this.event02 = info;
    }

    public Event02Info getEvent02 ()
    {
        return event02;
    }

    public Event03Info getEvent03 ()
    {
        return event03;
    }

    public void setEvent03 (Event03Info info)
    {
        this.event03 = info;
    }

    public void init (HashMap<String, ItemInfo> mapItemInfo)
    {
        event01.init();
        event02.init();
        event03.init();

        agenda = new HashMap<String, EventInfo>();
        agenda.put(event01.ID(), event01);
        agenda.put(event02.ID(), event02);
        agenda.put(event03.ID(), event03);

        timeline = new TreeMap<Integer, EventInfo>();
        for (EventInfo info : agenda.values())
            timeline.put(info.UNIX_START_TIME(), info);

        timeline = Collections.unmodifiableNavigableMap(timeline);

        actionIds = new ArrayList<String>();
        actionIds.add(event01.ID());
        actionIds.add(event02.ID());
        actionIds.add(event03.ID());

//      select all event item and group by event id 
        items = new ArrayList<String>();
        for (String id : mapItemInfo.keySet())
        {
            ItemInfo item = mapItemInfo.get(id);
            String eventId = null;
            switch (item.TYPE())
            {
                case ItemType.EVENT:
                {
                    items.add(id);
                }
                break;
                case ItemType.PLANT:
                {
                    PlantInfo plant = (PlantInfo) item;
                    if (plant != null && plant.isEventTree())
                        items.add(id);
                }
                break;
            }
        }

        items = Collections.unmodifiableList(items);
    }

    public List<String> getActions ()
    {
        return actionIds;
    }

    public EventInfo getAction (String id)
    {
        return agenda.get(id);
    }

    public EventInfo getCurrentAction ()
    {
        if (timeline.size() == 0)
            return null;

        int current = Time.getUnixTime();
        if (current < timeline.firstKey())
            return null;

        Entry<Integer, EventInfo> entry = timeline.floorEntry(current);
        if (entry == null)
            return null;

        EventInfo info = entry.getValue();
        if (info.isActive(current))
            return info;

        return null;
    }

    public EventInfo getPreviousAction ()
    {
        if (timeline.size() == 0)
            return null;

        int current = Time.getUnixTime();
        if (current < timeline.firstKey())
            return null;

        int previous = timeline.floorKey(current);
        if (previous > timeline.firstKey() && previous < timeline.lastKey())
        {
            Entry<Integer, EventInfo> previousEntry = timeline.floorEntry(previous);
            if (previousEntry.getValue().UNIX_END_TIME() > current)
                previous -= 1;
        }

        Entry<Integer, EventInfo> entry = timeline.floorEntry(previous);
        if (entry == null)
            return null;

        EventInfo info = entry.getValue();
        return info;
    }

    public boolean isExpire (String id)
    {
        if (id == null || id.isEmpty())
            return false;

        EventInfo action = getAction(id);
        if (action == null)
            return false;

        if (action.isActive())
            return false;

        return true;
    }

    public ArrayList<String> getExpireAction ()
    {
        ArrayList<String> actions = new ArrayList<String>();
        for (String id : agenda.keySet())
        {
            EventInfo info = agenda.get(id);
            if (info == null || !info.isActive())
                actions.add(id);
        }

        return actions;
    }

    public List<String> getEventtemIds ()
    {
        return items;
    }

    public MapItem getPuzzleRequire (String eventId, String puzzleId)
    {
        EventInfo info = getAction(eventId);
        if (info == null || !info.isActive())
            return null;

        return info.PUZZLE().getRequire(puzzleId);
    }

    public MapItem getPuzzleReward (String eventId, String puzzleId)
    {
        EventInfo info = getAction(eventId);
        if (info == null || !info.isActive())
            return null;

        return info.PUZZLE().getRewards(puzzleId);
    }
}
