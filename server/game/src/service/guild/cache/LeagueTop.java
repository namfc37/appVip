package service.guild.cache;

import com.google.gson.reflect.TypeToken;
import extension.EnvConfig;
import model.key.InfoKeyData;
import service.guild.GuildDerbyGroup;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.List;

public class LeagueTop
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.GUILD_DERBY_LEAGUE_TOP;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String league, int week)
    {
        return INFO_KEY.keyName(league + INFO_KEY.SEPARATOR + week);
    }

    public static int expire ()
    {
        return INFO_KEY.expire();
    }

    public static boolean set (String league, GuildDerbyGroup group)
    {
        return set(league, Time.curWeek(), group);
    }

    public static boolean set (String league, int week, GuildDerbyGroup group)
    {
        return db().set(keyName(league, week), encode(group), expire());
    }

    public static GuildDerbyGroup get (String league)
    {
        return get(league, Time.curWeek());
    }

    public static GuildDerbyGroup get (String league, int week)
    {
        return decode(db().get(keyName(league, week)));
    }

    public static String encode (GuildDerbyGroup group)
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(group) : Json.toJson(group);
    }

    public static GuildDerbyGroup decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
            	GuildDerbyGroup obj = Json.fromJson((String) raw, new TypeToken<GuildDerbyGroup>() {}.getType());
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
