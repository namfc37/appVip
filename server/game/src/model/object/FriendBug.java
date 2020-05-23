package model.object;

import data.UserLevelInfo;
import util.Time;
import util.collection.MapItem;

public class FriendBug
{
    private final static int STATUS_INACTIVE = 0;
    private final static int STATUS_ACTIVE   = 1;

    private int     status;   //trạng thái
    private int     id;       //id của nhà bạn
    private int     numCatch; //số bọ đã bắt
    private int     timeWait; //thời gian chờ trước khi có bọ
    private MapItem bugs;     //bọ

    private transient boolean isChanged;

    private FriendBug ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static FriendBug create (int level)
    {
        FriendBug o = new FriendBug();
        o.setInactive(level);
        return o;
    }

    private void setInactive (int level)
    {
        status = STATUS_INACTIVE;
        id = 0;
        numCatch = 0;
        timeWait = Time.getUnixTime() + UserLevelInfo.genFriendBugTime(level);
        bugs = null;
    }

    public void init ()
    {
        if (bugs != null)
            bugs.setAutoTrim(true);
    }

    private void setActive (int level, int friendId)
    {
        status = STATUS_ACTIVE;
        id = friendId;
        numCatch = 0;
        timeWait = 0;
        bugs = UserLevelInfo.genFriendBug(level);
    }

    public void reset (int level, int friendId)
    {
        int curTime = Time.getUnixTime();
        isChanged = false;
        if (status == STATUS_INACTIVE)
        {
            if (curTime < timeWait)
                return;
            isChanged = true;
            setActive(level, friendId);
        }
        else
        {
            if (id == friendId && numCatch == 0 && bugs.size() > 0)
                return;
            isChanged = true;
            setInactive(level);
        }
    }

    public boolean hasBug (String id)
    {
        return bugs != null && bugs.get(id) > 0;
    }

    public boolean catchBug (int level, String id)
    {
        bugs.decrease(id, 1);
        numCatch++;
        return !UserLevelInfo.isFakeFriendBug(level);
    }

    public MapItem getBugs ()
    {
        return bugs;
    }

    public int getStatus ()
    {
        return status;
    }

    public boolean isChanged ()
    {
        return isChanged;
    }

    public int getId ()
    {
        return id;
    }
}
