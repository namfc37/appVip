package util.redis;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import util.Address;
import util.Common;
import util.Json;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class RedisManager
{
    private final static String KEY_TEST           = "REDIS_MANAGER_TEST";
    private final static int    UPDATE_STATS_DELAY = Time.SECOND_IN_MINUTE;

    private static CountDownLatch                       latch;
    private static ConcurrentHashMap<String, JedisPool> mapPool  = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, Redis>     mapRedis = new ConcurrentHashMap<>();

    public synchronized static void start (String filePath) throws Exception
    {
        Debug.info("RedisManager", "start", filePath);

        JsonObject map = Json.parseFromFile(filePath).getAsJsonObject();
        latch = new CountDownLatch(map.size());

        for (Map.Entry<String, JsonElement> e : map.entrySet())
        {
            JsonObject bucket = e.getValue().getAsJsonObject();
            String ip = bucket.get("serverIp").getAsString();
            int port = bucket.get("serverPort").getAsInt();
            Debug.info("RedisManager", "connect", ip, port);

            new Thread(new Connection(e.getKey(), ip, port)).start();
        }

        latch.await();

        if (mapPool.size() != map.size())
            throw new Exception("RedisManager can NOT connect all buckets");

        new ServiceStat().run();
        ShareLoopGroup.scheduleWithFixedDelay(new ServiceStat(),
                                              5,
                                              UPDATE_STATS_DELAY,
                                              TimeUnit.SECONDS,
                                              true);
    }

    public synchronized static void stop ()
    {
    }

    private static class Connection implements Runnable
    {
        private String id;
        private String ip;
        private int    port;

        public Connection (String id, String ip, int port)
        {
            this.id = id;
            this.ip = ip;
            this.port = port;
        }

        @Override
        public void run ()
        {
            JedisPoolConfig config = new JedisPoolConfig();
            config.setMaxTotal(64);

            JedisPool pool = new JedisPool(config, ip, port);
            if (test(pool))
                mapPool.put(id, pool);
            latch.countDown();
        }

        private boolean test (JedisPool pool)
        {
            try (Jedis j = pool.getResource())
            {
                String time = LocalDateTime.now().toString();
                j.hset(KEY_TEST, Address.PRIVATE_HOST, time);
                return true;
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
            return false;
        }
    }

    //Jedis is AutoCloseable. MUST USE try-with-resource statement to avoid leak connection.
    //Example:  try (Jedis j = pool.getResource())
    static Jedis getJedisFromPool (String id)
    {
        JedisPool pool = mapPool.get(id);
        if (pool == null)
            return null;
        return pool.getResource();
    }

    public static Redis getRedis (String id)
    {
        Redis redis = mapRedis.get(id);
        if (redis != null)
            return redis;
        JedisPool pool = mapPool.get(id);
        if (pool == null)
            return null;
        redis = new Redis(id, pool);
        mapRedis.put(id, redis);
        return redis;
    }

    public static class Stats
    {
        public long upTime;
        public long keys;
        public long expires;
        public long curSize;

        public long avgHits;
        public long avgMisses;

        public transient long hits;
        public transient long misses;
    }

    private static Map<String, Stats> mapStats = new HashMap<>();

    public static Map<String, Stats> getMapStats ()
    {
        return mapStats;
    }

    private static class ServiceStat implements Runnable
    {
        @Override
        public void run ()
        {
            Map<String, Stats> curStats = new HashMap<>();
            for (String id : mapPool.keySet())
            {
                try (Jedis j = getJedisFromPool(id))
                {
                    Stats cur = new Stats();
                    Map<String, String> mapInfo = new HashMap<>();
                    String sInfo = j.info();
                    for (String line : sInfo.split("[\r\n]"))
                    {
                        if (line.startsWith("#"))
                            continue;
                        int pos = line.indexOf(":");
                        if (pos < 0)
                            continue;
                        String key = line.substring(0, pos);
                        String value = line.substring(pos + 1);
                        if (key.startsWith("db"))
                        {
                            String[] av = value.split("[=,]");
                            cur.keys += Integer.parseInt(av[1]);
                            cur.expires += Integer.parseInt(av[3]);
                        }
                        mapInfo.put(key, value);
                    }

                    cur.curSize = Common.stringToLong(mapInfo.get("used_memory"));
                    cur.hits = Common.stringToLong(mapInfo.get("keyspace_hits"));
                    cur.misses = Common.stringToLong(mapInfo.get("keyspace_misses"));

                    Stats old = mapStats.get(id);
                    if (old != null)
                    {
                        long delta = cur.upTime - old.upTime;
                        if (delta > 0)
                        {
                            cur.avgHits = (cur.hits - old.hits) / delta;
                            cur.avgMisses = (cur.misses - old.misses) / delta;
                        }
                    }
                    curStats.put(id, cur);
                }
                catch (Exception e)
                {
                    MetricLog.exception(e);
                }
            }
            mapStats = curStats;
        }

    }
}
