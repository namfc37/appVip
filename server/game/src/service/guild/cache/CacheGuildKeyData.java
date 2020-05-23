package service.guild.cache;

import com.google.gson.reflect.TypeToken;
import extension.EnvConfig;
import model.key.InfoKeyData;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.List;

public class CacheGuildKeyData
{
    private static InfoKeyData infoKey ()
    {
        return InfoKeyData.GUILD_CACHE;
    }

    private static AbstractDbKeyValue db ()
    {
        return infoKey().db();
    }

    private static String keyName (int id)
    {
        return infoKey().keyName(id);
    }

    private static int expire ()
    {
        return infoKey().expire();
    }

    public static String encode (List<CacheGuildInfo> items)
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(items) : Json.toJson(items);
    }

    public static List<CacheGuildInfo> decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                List<CacheGuildInfo> obj = Json.fromJson((String) raw, new TypeToken<List<CacheGuildInfo>>() {}.getType());
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (int id, List<CacheGuildInfo> items)
    {
        return db().set(keyName(id), encode(items), expire());
    }

    public static Object getRaw (int id)
    {
        return db().get(keyName(id));
    }

    public static List<CacheGuildInfo> get (int id)
    {
        return decode(getRaw(id));
    }
}
