package model;

import extension.EnvConfig;
import model.key.InfoKeyUser;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;
import util.metric.MetricLog;

public class UserBrief
{
    private int    userId;
    private String username;
    private String bucketId;
    private int    oldUserId;

    public int    timeRegister;
    public int    timeLogin;
    public int    timeLogout;
    public int    level;
    public String deviceId;
    public String displayName;
    public String avatar;
    public String clientCode;
    public int    minClientCode;

    private UserBrief ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static UserBrief create (int userId, String username, int oldUserId)
    {
        UserBrief o = new UserBrief();
        o.userId = userId;
        o.username = username;
        o.bucketId = BucketManager.getSmallestUserBucket();
        o.oldUserId = oldUserId;

        o.timeRegister = Time.getUnixTime();

        return o;
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.BRIEF;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static UserBrief decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                UserBrief obj = Json.fromJson((String) raw, UserBrief.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static boolean add (int userId, UserBrief object)
    {
        return db().add(keyName(userId), object.encode());
    }

    public static boolean delete (int userId)
    {
        return db().delete(keyName(userId));
    }

    public static boolean set (int userId, UserBrief object)
    {
        return db().set(keyName(userId), object.encode());
    }

    public static Object getRaw (int userId)
    {
        return db().get(keyName(userId));
    }

    public static UserBrief get (int userId)
    {
        return decode(userId, getRaw(userId));
    }

    //-----------------------------------------------------------------------

    public int getUserId ()
    {
        return userId;
    }

    public String getBucketId ()
    {
        return bucketId;
    }

    public String getUsername ()
    {
        return username;
    }

    public int getOldUserId ()
    {
        return oldUserId;
    }
}
