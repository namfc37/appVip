package model.system;

import com.google.gson.JsonObject;
import model.key.InfoKeyData;
import service.balance.BalanceServer;
import util.Json;
import util.Time;
import util.metric.MetricLog;

public class MonitorInfo
{
    private int        id;
    private JsonObject data;

    public String encode ()
    {
        return data.toString();
    }

    public static MonitorInfo decode (int id, Object raw)
    {
        MonitorInfo obj = new MonitorInfo();
        obj.id = id;
        try
        {
            if (raw == null)
                obj.data = new JsonObject();
            else
                obj.data = Json.parse((String) raw).getAsJsonObject();
        }
        catch (Exception e)
        {
            MetricLog.exception(e, id);
        }
        return obj;
    }

    public static void update ()
    {
        JsonObject info = BalanceServer.toJsonObject();
        updateDaily(info);
        updateHourly(info);
    }

    public static boolean updateDaily (JsonObject info)
    {
        int time = Time.getUnixTime();
        int day = time / Time.SECOND_IN_DAY;
        int block = time / Time.SECOND_IN_MINUTE * 10;
        return update(InfoKeyData.MONITOR_DAILY, day, block, info);
    }

    public static boolean updateHourly (JsonObject info)
    {
        int time = Time.getUnixTime();
        int hour = time / Time.SECOND_IN_HOUR;
        int block = time / Time.SECOND_IN_MINUTE;
        return update(InfoKeyData.MONITOR_HOURLY, hour, block, info);
    }

    public static boolean update (InfoKeyData infoKey, int id, int block, JsonObject info)
    {
        MonitorInfo o = get(infoKey, id);
        o.data.add(Integer.toString(block), info);
        return o.set(infoKey);
    }

    public boolean set (InfoKeyData infoKey)
    {
        return infoKey.db().set(infoKey.keyName(id), encode(), infoKey.expire());
    }

    public static Object getRaw (InfoKeyData infoKey, int id)
    {
        return infoKey.db().get(infoKey.keyName(id));
    }

    public static MonitorInfo get (InfoKeyData infoKey, int id)
    {
        return decode(id, getRaw(infoKey, id));
    }
}
