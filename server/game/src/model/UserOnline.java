package model;

import extension.EnvConfig;
import model.key.InfoKeyUser;
import util.Address;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

public class UserOnline
{
    private int    timeLogin;
    private String privateHost;
    private int    group;
    private int    portUser;
    private int    portUdp;

    private UserOnline ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    private static UserOnline create (int timeLogin)
    {
        UserOnline o = new UserOnline();
        o.timeLogin = timeLogin;
        o.privateHost = Address.PRIVATE_HOST;
        o.group = EnvConfig.group();
        o.portUser = EnvConfig.getUser().getPort();
        o.portUdp = EnvConfig.getUdp().getPort();
        return o;
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.ONLINE;

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

    public static UserOnline decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                UserOnline obj = Json.fromJson((String) raw, UserOnline.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static boolean add (int userId, int timeLogin)
    {
        UserOnline o = UserOnline.create(timeLogin);
        return db().add(keyName(userId), o.encode());
    }

    public static boolean delete (int userId)
    {
        return db().delete(keyName(userId));
    }

    public static Object getRaw (int userId)
    {
        return db().get(keyName(userId));
    }

    public static UserOnline get (int userId)
    {
        return decode(userId, getRaw(userId));
    }

    //-----------------------------------------------------------------------


    public String getPrivateHost ()
    {
        return privateHost;
    }

    public int getGroup ()
    {
        return group;
    }

    public int getPortUser ()
    {
        return portUser;
    }

    public int getPortUdp ()
    {
        return portUdp;
    }
}
