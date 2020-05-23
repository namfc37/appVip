package model;

import extension.EnvConfig;
import model.key.InfoKeyUser;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

public class UserBan
{
    private String admin;
    private String reason;
    private int    timeFinish;

    private UserBan ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    private static UserBan create (String admin, String reason, int timeFinish)
    {
        UserBan o = new UserBan();
        o.admin = admin;
        o.reason = reason;
        o.timeFinish = timeFinish;
        return o;
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.BAN;

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

    public static UserBan decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                UserBan obj = Json.fromJson((String) raw, UserBan.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static boolean set (int userId, String admin, String reason, int timeFinish)
    {
        UserBan o = UserBan.create(admin, reason, timeFinish);
        return db().set(keyName(userId), o.encode(), timeFinish);
    }

    public static boolean delete (int userId)
    {
        return db().delete(keyName(userId));
    }

    public static Object getRaw (int userId)
    {
        return db().get(keyName(userId));
    }

    public static UserBan get (int userId)
    {
        return decode(userId, getRaw(userId));
    }

    //-----------------------------------------------------------------------
}
