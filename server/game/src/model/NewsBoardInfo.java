package model;

import extension.EnvConfig;
import model.key.InfoKeyData;
import service.newsboard.Type;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

public class NewsBoardInfo
{
    public int numKey;
    public int time;

    private static InfoKeyData infoKey (Type type)
    {
        return type == Type.PRIVATE_SHOP ? InfoKeyData.NEWS_BOARD_PRIVATE_SHOP : InfoKeyData.NEWS_BOARD_AIR_SHIP;
    }

    private static AbstractDbKeyValue db (Type type)
    {
        return infoKey(type).db();
    }

    private static String keyName (Type type)
    {
        return infoKey(type).keyName("info");
    }

    private static int expire (Type type)
    {
        return infoKey(type).expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static NewsBoardInfo decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                NewsBoardInfo obj = Json.fromJson((String) raw, NewsBoardInfo.class);
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (Type type, NewsBoardInfo object)
    {
        return db(type).set(keyName(type), object.encode(), expire(type));
    }

    public static Object getRaw (Type type)
    {
        return db(type).get(keyName(type));
    }

    public static NewsBoardInfo get (Type type)
    {
        return decode(getRaw(type));
    }
}
