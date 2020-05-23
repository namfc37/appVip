package model;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import extension.EnvConfig;
import model.key.InfoKeyData;
import net.spy.memcached.CASValue;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;

public class DropLimitItem
{
    private static ConcurrentHashMap<String, DropLimitItem> map = new ConcurrentHashMap<>();

    private transient String        keyName;
    private transient AtomicBoolean lock;

    private String  event;
    private int     timeOpen;
    private int     timeEnd;
    private String  item;
    private int     limit;
    private int     limitUser;
    private int     num;
    private MapItem countUser;
    private int     timeDrop;

    private DropLimitItem ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static void init (String event, String item, int[][] durations, int limit, int limitUser)
    {
        int timeOpen = Time.getTimeOpenDuration(durations);
        if (timeOpen <= 0)
            return;
        int timeEnd = Time.getTimeEndDuration(durations, timeOpen);
        init(event, item, timeOpen, timeEnd, limit, limitUser);
    }

    public static void init (String event, String item, int timeOpen, int timeEnd, int limit, int limitUser)
    {
        DropLimitItem o = get(event, timeOpen, item);
        if (o == null)
        {
            o = DropLimitItem.create(event, timeOpen, timeEnd, item, limit, limitUser);
            if (!add(o))
            {
                o = get(event, timeOpen, item);
                if (o == null)
                {
                    MetricLog.info("DropLimitItem.init() FAIL", event, item, timeOpen, timeEnd);
                    return;
                }
            }
        }

        map.put(o.keyName, o);
    }

    public static boolean isDrop (String event, int timeOpen, String item, int userId)
    {
        return isDrop(event, timeOpen, item, userId, Time.getUnixTime());
    }

    private static boolean isDrop (String event, int timeOpen, String item, int userId, int curTime)
    {
        String key = keyName(event, timeOpen, item);
        DropLimitItem o = map.get(key);
        if (o == null)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "null object", key);
            return false;
        }
        String sUserId = Integer.toString(userId);

        if (!o.quickCheck(sUserId, curTime))
            return false;

        ThreadLocalRandom r = ThreadLocalRandom.current();
        if (r.nextInt(10) > 0)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "rate");
            return false;
        }

        //DO NOT USE SYNCHRONIZED TO REPLACE lock
        if (!o.lock.compareAndSet(false, true))
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "lock");
            return false;
        }

        try
        {
            CasValue<DropLimitItem> c = gets(event, timeOpen, item);
            o = c.object;
            map.put(o.keyName, o);

            if (!o.quickCheck(sUserId, curTime))
                return false;

            o.num++;
            o.countUser.increase(sUserId, 1);
            o.timeDrop = curTime;
            o.chooseTimeDrop(curTime);

            if (cas(c.cas, o))
            {
                MetricLog.actionUser("DROP_LIMIT_ITEM",
                                     userId,
                                     (short) -1,
                                     "",
                                     null,
                                     null,
                                     ErrorConst.SUCCESS,
                                     event,
                                     timeOpen,
                                     item,
                                     o.num,                         // số lượng item đã rớt
                                     o.countUser.get(sUserId),      // số lượng item user có
                                     o.timeEnd,
                                     curTime
                                    );
            }
            else
            {
                Debug.trace("DropLimitItem", event, timeOpen, item, "cas fail");
                o = get(event, timeOpen, item);
                return false;
            }

            return true;
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }

        o.lock.set(false);
        return true;
    }

    private boolean quickCheck (String userId, int curTime)
    {
        if (lock.get())
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "lock");
            return false;
        }
        if (num >= limit)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "limit server", "num", num, "limit", limit);
            return false;
        }
        if (curTime >= timeEnd)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "end event", curTime, timeEnd);
            return false;
        }
        if (curTime < timeDrop)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "timeDrop", timeDrop, "curTime", curTime);
            return false;
        }
        if (limitUser > 0 && countUser.get(userId) >= limitUser)
        {
            Debug.trace("DropLimitItem", event, timeOpen, item, "limit user", userId, "count", countUser.get(userId), "limitUser", limitUser);
            return false;
        }
        return true;
    }

    private void chooseTimeDrop (int curTime)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        if (num >= limit || timeEnd <= curTime)
            timeDrop = Integer.MAX_VALUE;
        else
        {
            int step = (timeEnd - timeDrop) / (limit - num);
            if (step >= 4)
                timeDrop += step * 3 / 4 + r.nextInt(step / 4);
            else
                timeDrop += step;
        }
    }

    private static DropLimitItem create (String event, int timeOpen, int timeEnd, String item, int limit, int limitUser)
    {
        DropLimitItem o = new DropLimitItem();
        o.event = event;
        o.timeOpen = timeOpen;
        o.timeEnd = timeEnd;
        o.item = item;
        o.limit = limit;
        o.limitUser = limitUser;
        o.timeDrop = timeOpen;
        o.chooseTimeDrop(Time.getUnixTime());

        o.init();

        return o;
    }

    private void init ()
    {
        keyName = keyName(event, timeOpen, item);
        lock = new AtomicBoolean();

        if (countUser == null)
            countUser = new MapItem();
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyData INFO_KEY = InfoKeyData.DROP_LIMIT_ITEM;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String event, int timeOpen, String item)
    {
        String id = event + INFO_KEY.SEPARATOR + timeOpen + INFO_KEY.SEPARATOR + item;
        return INFO_KEY.keyName(id);
    }

    private static int expire ()
    {
        return 0;
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static DropLimitItem decode (String event, int timeOpen, String item, Object raw)
    {
        try
        {
            if (raw != null)
            {
                DropLimitItem obj = Json.fromJson((String) raw, DropLimitItem.class);
                obj.init();
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, event, timeOpen, item);
        }
        return null;
    }

    public static Object getRaw (String event, int timeOpen, String item)
    {
        return db().get(keyName(event, timeOpen, item));
    }

    private static boolean add (DropLimitItem object)
    {
        return db().add(object.keyName, object.encode(), expire());
    }

    public static DropLimitItem get (String event, int timeOpen, String item)
    {
        return decode(event, timeOpen, item, getRaw(event, timeOpen, item));
    }

    public static CasValue<DropLimitItem> gets (String event, int timeOpen, String item)
    {
        CASValue<Object> raw = db().gets(keyName(event, timeOpen, item));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(event, timeOpen, item, raw.getValue()));
    }

    public static boolean cas (long cas, DropLimitItem object)
    {
        return db().cas(object.keyName, cas, object.encode(), expire());
    }
    //-----------------------------------------------------------------------

    public static void test ()
    {
        String event = "ev";
        int curTime = Time.getUnixTime();
        String item = "T0";

        int deltaTime = 3600;
        int[][] durations = {{curTime, curTime + deltaTime}};
        int timeOpen = Time.getTimeOpenDuration(durations);

        int limit = 10;
        int limitUser = 2;
        int numUser = limit * 2;

        int call = 0;
        int count = 0;
        init(event, item, durations, limit, limitUser);
        ThreadLocalRandom r = ThreadLocalRandom.current();

        curTime += deltaTime / 2;
        MAIN_LOOP:
        for (int i = 0; i <= deltaTime; i++)
        {
            curTime++;
            for (int j = 0; j < 10; j++)
            {
                call++;
                if (isDrop(event, timeOpen, item, r.nextInt(1, numUser + 1), curTime))
                {
                    count++;
                    if (count >= 10)
                        break MAIN_LOOP;
                }
            }
        }

        Debug.info("timeOpen", timeOpen, "limit", limit, "call", call, "count", count);
    }
}
