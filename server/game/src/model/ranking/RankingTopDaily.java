package model.ranking;

import com.google.gson.reflect.TypeToken;
import data.ranking.RankingBoard;
import extension.EnvConfig;
import model.key.InfoKeyData;
import util.Json;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class RankingTopDaily
{
    private final static InfoKeyData       INFO_KEY  = InfoKeyData.RANKING_TOP_DAILY;
    public final static  DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String key, String day)
    {
        return INFO_KEY.keyName(key + INFO_KEY.SEPARATOR + day);
    }

    public static int expire ()
    {
        return INFO_KEY.expire();
    }

    public static String curDay ()
    {
        return LocalDate.now().format(formatter);
    }

    public static boolean set (String key, List<RankingBoard.Item> items)
    {
        return set(key, curDay(), items);
    }

    public static boolean set (String key, String day, List<RankingBoard.Item> items)
    {
        return db().set(keyName(key, day), encode(items), expire());
    }

    public static List<RankingBoard.Item> get (String key)
    {
        return get(key, curDay());
    }

    public static List<RankingBoard.Item> get (String key, String day)
    {
        return decode(db().get(keyName(key, day)));
    }

    public static String encode (List<RankingBoard.Item> items)
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(items) : Json.toJson(items);
    }

    public static List<RankingBoard.Item> decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                List<RankingBoard.Item> obj = Json.fromJson((String) raw, new TypeToken<List<RankingBoard.Item>>() {}.getType());
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }
}
