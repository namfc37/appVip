package service.balance;

import service.udp.MsgWorkerInfo;

import java.util.concurrent.ConcurrentHashMap;

class Service
{
    private String                            feature;
    private int                               active   = -1;
    private int                               inactive = -1;
    private ConcurrentHashMap<Integer, Group> mapGroup = new ConcurrentHashMap<>();

    private transient Group groupActive;
    private transient Group groupInactive;

    public Service (String id)
    {
        feature = id;
    }

    void addWorker (MsgWorkerInfo info)
    {
        Group group = mapGroup.get(info.group);
        if (group == null)
            group = mapGroup.computeIfAbsent(info.group, k -> new Group(info.group));
        group.addWorker(info);
    }

    MsgWorkerInfo chooseWorker (int group, int code)
    {
        Group g = mapGroup.get(group);
        if (g != null)
            return g.chooseWorker(code);
        return null;
    }

    MsgWorkerInfo chooseActiveWorker (int code)
    {
        if (groupActive == null && active >= 0)
            groupActive = mapGroup.get(active);
        if (groupActive != null)
            return groupActive.chooseWorker(code);
        return null;
    }

    MsgWorkerInfo chooseInactiveWorker (int code)
    {
        if (groupInactive == null && inactive >= 0)
            groupInactive = mapGroup.get(inactive);
        if (groupInactive != null)
            return groupInactive.chooseWorker(code);
        return null;
    }

    void resetSimulate ()
    {
        for (Group g : mapGroup.values())
            g.resetSimulate();
    }

    void initGroup (int active, int inactive)
    {
        this.active = active;
        groupActive = mapGroup.computeIfAbsent(active, k -> new Group(active));

        this.inactive = inactive;
        groupInactive = mapGroup.computeIfAbsent(inactive, k -> new Group(inactive));
    }

    public String setActive (int group)
    {
        Group o = mapGroup.get(group);
        if (o == null)
            return "Null group";

        if (active != group)
        {
            groupInactive = groupActive;
            inactive = active;
        }

        groupActive = o;
        active = group;

        return null;
    }

    public void addTableStatus (StringBuilder s)
    {
        for (Group group : mapGroup.values())
            group.addTableStatus(s);
    }
}
