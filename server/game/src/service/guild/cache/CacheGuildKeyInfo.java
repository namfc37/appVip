package service.guild.cache;

import extension.EnvConfig;
import model.key.InfoKeyData;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.Map;

public class CacheGuildKeyInfo
{
    public int                  numKey;
    public int                  time;
    public int                  derbyStartTime;
    public Map<String, Integer> derbyNumGroup; //LEAGUE, num

    private static InfoKeyData infoKey ()
    {
        return InfoKeyData.GUILD_CACHE;
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

    public static CacheGuildKeyInfo decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                CacheGuildKeyInfo obj = Json.fromJson((String) raw, CacheGuildKeyInfo.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (CacheGuildKeyInfo object)
    {
        return db().set(keyName(), object.encode(), expire());
    }

    public static Object getRaw ()
    {
        return db().get(keyName());
    }

    public static CacheGuildKeyInfo get ()
    {
        return decode(getRaw());
    }
}
