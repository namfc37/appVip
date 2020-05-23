package service.friend;

import extension.EnvConfig;
import model.key.InfoKeyData;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

class CacheInfo
{
    public int numKey;
    public int time;

    private static InfoKeyData infoKey ()
    {
        return InfoKeyData.FRIEND_CACHE;
    }

    private static AbstractDbKeyValue db ()
    {
        return infoKey().db();
    }

    private static String keyName ()
    {
        return infoKey().keyName("info");
    }

    private static int expire ()
    {
        return infoKey().expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static CacheInfo decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                CacheInfo obj = Json.fromJson((String) raw, CacheInfo.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (CacheInfo object)
    {
        return db().set(keyName(), object.encode(), expire());
    }

    public static Object getRaw ()
    {
        return db().get(keyName());
    }

    public static CacheInfo get ()
    {
        return decode(getRaw());
    }
}
