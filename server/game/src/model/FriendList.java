package model;

import bitzero.util.common.business.Debug;
import data.KeyDefine;
import data.MiscInfo;
import extension.EnvConfig;
import model.key.InfoKeyUser;
import net.spy.memcached.CASValue;
import service.friend.FriendInfo;
import service.friend.FriendServer;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.*;

public class FriendList extends Encoder.IObject implements KeyDefine
{
    private transient int userId;

    private HashMap<Integer, FriendInfo> friends;
    private HashMap<Integer, FriendInfo> requests;
    private HashMap<Integer, FriendInfo> suggests;
    private int                          timeSuggest;

    @Override
    public void putData (Encoder msg)
    {
        msg.put(FRIEND_FRIENDS, friends.values());
        msg.put(FRIEND_REQUESTS, requests.values());
        msg.put(FRIEND_SUGGESTS, suggests.values());
    }

    private FriendList ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static FriendList create (int userId)
    {
        FriendList f = new FriendList();
        f.userId = userId;
        f.friends = new HashMap<>();
        f.requests = new LinkedHashMap<>();
        f.suggests = new HashMap<>();

        return f;
    }

    public void init (int userId)
    {
        this.userId = userId;
    }

    public void update ()
    {
        reduceRequest();
        reduceFriend();
    }

    public void updateInfo ()
    {
        int curTime = Time.getUnixTime();
        friends.remove(userId);
        requests.remove(userId);
        suggests.remove(userId);

        reduceRequest();
        reduceFriend();

        for (FriendInfo curInfo : friends.values())
        {
            FriendInfo newInfo = FriendServer.get(curInfo.getId());
            curInfo.mergeFrom(newInfo);
            curInfo.update(curTime);
        }

        for (FriendInfo curInfo : requests.values())
        {
            FriendInfo newInfo = FriendServer.get(curInfo.getId());
            curInfo.mergeFrom(newInfo);
            curInfo.update(curTime);
        }
    }

    private void reduceFriend ()
    {
        if (friends.size() > MiscInfo.FRIEND_LIMIT())
        {
            List<FriendInfo> oldFriend = new ArrayList<>(friends.values());
            oldFriend.sort(Comparator.comparingInt(FriendInfo::getLevel).reversed());

            friends = new HashMap<>();
            for (int i = 0; i < MiscInfo.FRIEND_LIMIT(); i++)
            {
                FriendInfo info = oldFriend.get(i);
                friends.put(info.getId(), info);
            }
        }
    }

    private void reduceRequest ()
    {
        if (requests.size() > MiscInfo.FRIEND_LIMIT_REQUEST())
        {
            HashMap<Integer, FriendInfo> old = requests;
            requests = new HashMap<>();
            for (FriendInfo info : old.values())
            {
                requests.put(info.getId(), info);
                if (requests.size() == MiscInfo.FRIEND_LIMIT_REQUEST())
                    break;
            }
        }
    }

    private void removeOldRequest ()
    {
        if (requests.size() < MiscInfo.FRIEND_LIMIT_REQUEST())
            return;

        FriendInfo old = null;
        for (FriendInfo info : requests.values())
        {
            if (old == null || info.getTime() < old.getTime())
                old = info;
        }
        if (old != null)
            requests.remove(old.getId());
    }

    public FriendInfo getRequest (int userId)
    {
        return requests.get(userId);
    }

    public void addRequest (FriendInfo f)
    {
        removeOldRequest();
        requests.put(f.getId(), f);
        suggests.remove(f.getId());
    }

    public boolean removeRequest (int userId)
    {
        FriendInfo f = requests.remove(userId);
        return f != null;
    }

    public boolean refreshSuggest ()
    {
        int curTime = Time.getUnixTime();
        if (Math.abs(curTime - timeSuggest) < MiscInfo.FRIEND_SUGGEST_TIME_WAIT() - 10)
            return false;

        suggests.clear();
        timeSuggest = curTime;
        return true;
    }

    public void addSuggest (FriendInfo f)
    {
        //Debug.info("addSuggest", userId, "add", f == null ? "" : f.getId());
        if (f == null)
            return;
        int id = f.getId();
        if (id == userId || friends.containsKey(id) || requests.containsKey(id))
            return;
        suggests.put(id, f);
    }

    public FriendInfo getSuggest (int userId)
    {
        return suggests.get(userId);
    }

    public boolean hasSuggest (int id)
    {
        return suggests.containsKey(id);
    }

    public void removeSuggest (int id)
    {
        suggests.remove(id);
    }

    public int numSuggest ()
    {
        return suggests.size();
    }

    public int numFriend ()
    {
        return friends.size();
    }

    public int numRequest ()
    {
        return requests.size();
    }

    public boolean hasFriend (int id)
    {
        return friends.containsKey(id);
    }

    public void removeFriend (int id)
    {
        friends.remove(id);
    }

    public void addFriend (FriendInfo f)
    {
        int id = f.getId();
        friends.put(id, f);
        requests.remove(id);
        suggests.remove(id);
    }

    public int getTimeSuggest ()
    {
        return timeSuggest;
    }

    public void setTimeSuggest (int timeSuggest)
    {
        this.timeSuggest = timeSuggest;
    }

    public String getFriendBucket (int userId)
    {
        FriendInfo info = friends.get(userId);
        return info == null ? null : info.getBucket();
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.FRIEND_LIST;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static FriendList decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                FriendList obj = Json.fromJson((String) raw, FriendList.class);
                obj.init(userId);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static boolean set (String bucketId, int userId, FriendList object)
    {
        return db(bucketId).set(keyName(userId), object.encode(), expire());
    }

    public static FriendList get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static FriendList get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    public static CasValue<FriendList> gets (String bucketId, int userId)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (String bucketId, int userId, long cas, FriendList object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode(), expire());
    }

    //-----------------------------------------------------------------------
}
