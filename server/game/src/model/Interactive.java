package model;

// Key này dùng để chứa các dữ liệu tương tác với bạn bè
// Key sẽ expire trong 30 ngày (khi load nếu null thì phải new object)
// Các dữ liệu trong key này không qua trọng và có thể reset

import data.ConstInfo;
import extension.EnvConfig;
import model.key.InfoKeyUser;
import service.ServiceSaveUserData;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.metric.MetricLog;

import java.util.Arrays;
import java.util.Map;

public class Interactive
{
    private transient int userId;

    private MachineRepair[] machineRepairs;

    private Interactive ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Interactive create (int userId)
    {
        Interactive o = new Interactive();
        o.init(userId);
        return o;
    }

    private void init (int userId)
    {
        this.userId = userId;

        int maxFloor = ConstInfo.maxFloor();
        if (machineRepairs == null)
            machineRepairs = new MachineRepair[maxFloor];
        else if (machineRepairs.length < maxFloor)
            machineRepairs = Arrays.copyOf(machineRepairs, maxFloor);
    }

    public void update ()
    {
        int curTime = Time.getUnixTime();
        for (int i = 0; i < machineRepairs.length; i++)
        {
            MachineRepair m = machineRepairs[i];
            if (m == null)
                continue;
            if (m.timeExpire > 0 && m.timeExpire < curTime)
                machineRepairs[i] = null;
        }
    }

    public MachineRepair getMachineRepair (int floor)
    {
        if (machineRepairs == null || floor < 0 || floor >= machineRepairs.length)
            return null;
        return machineRepairs[floor];
    }

    public boolean setMachineRepair (int floor, int num, int userId, String avatar)
    {
        if (machineRepairs[floor] != null)
            return false;

        machineRepairs[floor] = new MachineRepair(userId, avatar, num);
        return true;
    }

    public void setExpireMachineRepair (int floor)
    {
        machineRepairs[floor].timeExpire = ServiceSaveUserData.getTimeNextSave() + 3;
    }

    public static class MachineRepair
    {
        public int    userId;
        public String avatar;
        public int    num;
        public int    timeExpire;

        public MachineRepair (int userId, String avatar, int num)
        {
            this.userId = userId;
            this.avatar = avatar;
            this.num = num;
        }
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.INTERACTIVE;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static Interactive decode (int userId, Object raw)
    {
        try
        {
            if (raw == null)
                return Interactive.create(userId);

            Interactive obj = Json.fromJson((String) raw, Interactive.class);
            obj.init(userId);
            obj.update();
            return obj;
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static boolean set (String bucketId, int userId, Interactive object)
    {
        return db(bucketId).set(keyName(userId), object.encode(), expire());
    }

    public static Interactive get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static Interactive get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    //-----------------------------------------------------------------------
}
