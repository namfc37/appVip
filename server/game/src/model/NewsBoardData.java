package model;

import com.google.gson.reflect.TypeToken;
import extension.EnvConfig;
import model.key.InfoKeyData;
import service.newsboard.NewsBoardItem;
import service.newsboard.Type;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.List;

public class NewsBoardData
{
    private static InfoKeyData infoKey (Type type)
    {
        return type == Type.PRIVATE_SHOP ? InfoKeyData.NEWS_BOARD_PRIVATE_SHOP : InfoKeyData.NEWS_BOARD_AIR_SHIP;
    }

    private static AbstractDbKeyValue db (Type type)
    {
        return infoKey(type).db();
    }

    private static String keyName (Type type, int id)
    {
        return infoKey(type).keyName(id);
    }

    private static int expire (Type type)
    {
        return infoKey(type).expire();
    }

    public static String encode (List<NewsBoardItem> items)
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(items) : Json.toJson(items);
    }

    public static List<NewsBoardItem> decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                List<NewsBoardItem> obj = Json.fromJson((String) raw, new TypeToken<List<NewsBoardItem>>() {}.getType());
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (Type type, int id, List<NewsBoardItem> items)
    {
        return db(type).set(keyName(type, id), encode(items), expire(type));
    }

    public static Object getRaw (Type type, int id)
    {
        return db(type).get(keyName(type, id));
    }

    public static List<NewsBoardItem> get (Type type, int id)
    {
        return decode(getRaw(type, id));
    }
}
