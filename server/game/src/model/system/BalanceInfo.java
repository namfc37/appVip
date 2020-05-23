package model.system;

import extension.EnvConfig;
import model.key.InfoKeyFixed;
import service.balance.BalanceServer;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.HashMap;
import java.util.Map;

public class BalanceInfo
{
    private int                   time;
    private int                   code;
    private HashMap<String, Info> groups;

    //maintenance
    private int    mtTimeStart;
    private int    mtTimeFinish;
    private String mtMsg;

    private BalanceInfo ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static BalanceInfo create ()
    {
        BalanceInfo o = new BalanceInfo();
        o.init();

        return o;
    }

    public void init ()
    {
        if (groups == null)
            groups = new HashMap<>();
        if (!isMaintenance())
            resetMaintenance();
    }

    private static class Info
    {
        private int active;
        private int inactive;
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyFixed INFO_KEY = InfoKeyFixed.BALANCE_INFO;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName ()
    {
        return INFO_KEY.keyName();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static BalanceInfo decode (Object raw)
    {
        try
        {
            if (raw != null)
            {
                BalanceInfo obj = Json.fromJson((String) raw, BalanceInfo.class);
                obj.init();
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return null;
    }

    public static boolean set (BalanceInfo o)
    {
        o.time = Time.getUnixTime();
        return db().set(keyName(), o.encode(), 0);
    }

    public static Object getRaw ()
    {
        return db().get(keyName());
    }

    public static BalanceInfo get ()
    {
        return decode(getRaw());
    }
    //-----------------------------------------------------------------------

    public void setActive (String service, int group, int code)
    {
        this.code = code;
        Info info = groups.get(service);
        if (info == null)
        {
            info = new Info();
            groups.put(service, info);

            info.inactive = group;
            info.active = group;
        }
        else
        {
            info.inactive = info.active;
            info.active = group;
        }
    }

    public void initGroup ()
    {
        for (Map.Entry<String, Info> e : groups.entrySet())
        {
            Info info = e.getValue();
            BalanceServer.initGroup(e.getKey(), info.active, info.inactive);
        }
    }

    public void setMaintenance (int timeStart, int timeFinish, String msg)
    {
        mtTimeStart = timeStart;
        mtTimeFinish = timeFinish;
        mtMsg = msg;
    }

    public boolean resetMaintenance ()
    {
        if (mtTimeStart <= 0)
            return false;

        mtTimeStart = 0;
        mtTimeFinish = 0;
        mtMsg = "";
        return true;
    }

    public boolean isMaintenance ()
    {
        if (mtTimeStart <= 0)
            return false;
        int curTime = Time.getUnixTime();
        return mtTimeStart <= curTime && curTime <= mtTimeFinish;
    }

    public String getMaintenanceMsg ()
    {
        return mtMsg;
    }

    public int getCode ()
    {
        return code;
    }
}