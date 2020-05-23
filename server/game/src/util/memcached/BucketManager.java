package util.memcached;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import util.Common;
import util.Json;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class BucketManager
{
    private final static String PROPERTY_LOCAL_FOLDER       = "localFolder";
    private final static String PROPERTY_SERVER_IP          = "serverIp";
    private final static String PROPERTY_SERVER_PORT        = "serverPort";
    private final static String PROPERTY_OP_TIMEOUT         = "opTimeOut";
    private final static String PROPERTY_OP_BLOCKTIME       = "opBlockTime";
    private final static String PROPERTY_COMPRESS_THRESHOLD = "compressThreshold";
    private final static String PROPERTY_IS_USER_BUCKET     = "isUserBucket";

    private final static String KEY_TEST           = "BUCKET_MANAGER_TEST";
    private final static int    UPDATE_STATS_DELAY = Time.SECOND_IN_MINUTE;

    private static Map<String, AbstractDbKeyValue> mapBucket;
    private static List<AbstractDbKeyValue>        userBuckets;
    private static String                          smallestUserBucket;

    public synchronized static void start (String filePath) throws Exception
    {
        Debug.info("BucketManager", "start", filePath);

        ConcurrentHashMap<String, AbstractDbKeyValue> mapCheck = new ConcurrentHashMap<>();
        CountDownLatch latch;
        int numBucket;

        try (BufferedReader reader = Files.newBufferedReader(Paths.get(filePath), StandardCharsets.UTF_8))
        {
            Set<Map.Entry<String, JsonElement>> setBucketInfo = JsonParser.parseReader(reader).getAsJsonObject().entrySet();
            numBucket = setBucketInfo.size();
            latch = new CountDownLatch(numBucket);

            for (Map.Entry<String, JsonElement> o : setBucketInfo)
            {
                String bucketId = o.getKey();
                if (mapCheck.containsKey(bucketId))
                {
                    throw new Exception("Duplicate bucket id " + bucketId);
                }
                JsonObject info = o.getValue().getAsJsonObject();
                new Thread(new Connection(bucketId, info, latch, mapCheck)).start();
            }
        }

        latch.await();

        mapBucket = new HashMap<>();
        userBuckets = new ArrayList<>();
        for (AbstractDbKeyValue db : mapCheck.values())
        {
            mapBucket.put(db.id, db);
            if (db.isBucketUser)
                userBuckets.add(db);
        }

        mapBucket = Collections.unmodifiableMap(mapBucket);
        userBuckets = Collections.unmodifiableList(userBuckets);

        if (mapBucket.size() != numBucket)
            throw new Exception("Num bucket not match (numBucket=" + numBucket + ", size=" + mapBucket.size() + ")");

        Debug.info("Check database connection");
        int numRetry = 0;
        boolean connectSuccess = false;

        while (numRetry < 50)
        {
            String time = LocalDateTime.now().toString();
            connectSuccess = true;

            for (AbstractDbKeyValue db : mapBucket.values())
            {
                if (db == null || db.set(KEY_TEST, db.getId() + "," + time) == false)
                    connectSuccess = false;
            }

            if (connectSuccess)
            {
                break;
            }
            else
            {
                numRetry++;
                Thread.sleep(50);
            }
        }

        if (connectSuccess)
        {
            new ServiceStat().run(); //khởi tạo dữ liệu lần đầu để tính trung bình hit
            ShareLoopGroup.scheduleWithFixedDelay(new ServiceStat(),
                                                           5,
                                                           UPDATE_STATS_DELAY,
                                                           TimeUnit.SECONDS, true);
        }
        else
        {
            throw new Exception("Check database fail");
        }

        Debug.info("Connect database success. Num user bucket is " + userBuckets.size() + ". Num retry is " + numRetry);
    }

    public static int numUserBucket ()
    {
        return userBuckets.size();
    }

    public static String getSmallestUserBucket ()
    {
        return smallestUserBucket;
    }

    public static class Stats
    {
        public boolean isCache;
        public long    time;
        public long    numItem;
        public long    curSize;
        public long    maxSize;

        public long avgGet;
        public long avgSet;
        public long avgDelete;
        public long avgIncrease;
        public long avgDecrease;
        public long avgCas;

        public transient long cmd_get;
        public transient long cmd_set;
        public transient long delete_hits;
        public transient long incr_hits;
        public transient long decr_hits;
        public transient long cas_hits;
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
            Map<String, String> curInfo = null;
            try
            {
                String smallBucket = null;
                double smallWeight = Double.MAX_VALUE;
                double curWeight;

                Map<String, Stats> curStats = new HashMap<>();
                for (AbstractDbKeyValue db : mapBucket.values())
                {
                    for (Map<String, String> info : db.getStats().values())
                    {
                        curInfo = info;
                        Stats cur = new Stats();
                        curStats.put(db.id, cur);

                        cur.time = Common.stringToLong(info.get("time"), 0);
                        cur.numItem = Common.stringToLong(info.get("curr_items"), 0);
                        cur.curSize = Common.stringToLong(info.get("bytes"), 0);

                        cur.cmd_get = Common.stringToLong(info.get("cmd_get"), 0);
                        cur.cmd_set = Common.stringToLong(info.get("cmd_set"), 0);
                        cur.delete_hits = Common.stringToLong(info.get("delete_hits"), 0);
                        cur.incr_hits = Common.stringToLong(info.get("incr_hits"), 0);
                        cur.decr_hits = Common.stringToLong(info.get("decr_hits"), 0);
                        cur.cas_hits = Common.stringToLong(info.get("cas_hits"), 0);

                        Stats old = mapStats.get(db.id);
                        if (old != null)
                        {
                            long delta = cur.time - old.time;
                            if (delta > 0)
                            {
                                cur.avgGet = (cur.cmd_get - old.cmd_get) / delta;
                                cur.avgSet = (cur.cmd_set - old.cmd_set) / delta;
                                cur.avgDelete = (cur.delete_hits - old.delete_hits) / delta;
                                cur.avgIncrease = (cur.incr_hits - old.incr_hits) / delta;
                                cur.avgDecrease = (cur.decr_hits - old.decr_hits) / delta;
                                cur.avgCas = (cur.cas_hits - old.cas_hits) / delta;
                            }
                        }

                        if (info.containsKey("ep_max_size")) //Couchbase Buckets
                        {
                            cur.isCache = false;
                            cur.maxSize = Common.stringToLong(info.get("ep_max_size"), 0);
                        }
                        else //Memcached Buckets
                        {
                            cur.isCache = true;
                            cur.maxSize = Common.stringToLong(info.get("engine_maxbytes"), 0);
                        }

                        if (db.isBucketUser)
                        {
                            curWeight = (double) cur.curSize / cur.maxSize;
                            if (curWeight < smallWeight)
                            {
                                smallWeight = curWeight;
                                smallBucket = db.id;
                            }
                        }
                        break;
                    }
                }

                mapStats = curStats;

                if (smallBucket != null)
                    smallestUserBucket = smallBucket;
            }
            catch (Exception e)
            {
                MetricLog.exception(e, Json.toJson(curInfo));
            }
        }
    }

    public synchronized static void stop ()
    {
        for (AbstractDbKeyValue db : mapBucket.values())
        {
            db.disconnect();
        }
    }

    public static Map<String, AbstractDbKeyValue> getMapBucket ()
    {
        return mapBucket;
    }

    public static List<AbstractDbKeyValue> getUserBuckets ()
    {
        return userBuckets;
    }

    public static AbstractDbKeyValue get (String bucketId)
    {
        return mapBucket.get(bucketId);
    }

    public static boolean containsBucket (String id)
    {
        if (id == null || id.isEmpty())
            return false;
        return mapBucket.containsKey(id);
    }

    public static int getNumBucket ()
    {
        return mapBucket.size();
    }

    private static class Connection implements Runnable
    {
        private final String                                        bucketId;
        private final JsonObject                                    bucketInfo;
        private final CountDownLatch                                latch;
        private final ConcurrentHashMap<String, AbstractDbKeyValue> mapCheck;

        Connection (String bucketId, JsonObject bucketInfo, CountDownLatch latch, ConcurrentHashMap<String, AbstractDbKeyValue> mapCheck)
        {
            this.bucketId = bucketId;
            this.bucketInfo = bucketInfo;
            this.latch = latch;
            this.mapCheck = mapCheck;
        }

        @Override
        public void run ()
        {
            try
            {
                AbstractDbKeyValue db;
                boolean isBucketUser = getBoolInfo(PROPERTY_IS_USER_BUCKET, false);

                if (bucketInfo.has(PROPERTY_LOCAL_FOLDER))
                {
                    String localFolder = getStringInfo(PROPERTY_LOCAL_FOLDER, null);
                    db = new FileStore(bucketId, isBucketUser, localFolder);
                    mapCheck.put(bucketId, db);
                    Debug.info("Bucket", bucketId, "LOCAL_FOLDER", localFolder, isBucketUser);
                }
                else
                {
                    String serverIp = getStringInfo(PROPERTY_SERVER_IP, null);
                    int serverPort = getIntInfo(PROPERTY_SERVER_PORT, 11211);
                    int opBlockTime = getIntInfo(PROPERTY_OP_BLOCKTIME, 500);
                    int opTimeout = getIntInfo(PROPERTY_OP_TIMEOUT, 2500);
                    int compressThreshold = getIntInfo(PROPERTY_COMPRESS_THRESHOLD, 2048);

                    db = new SpyMemcached(bucketId, isBucketUser, serverIp, serverPort, opBlockTime, opTimeout, compressThreshold);

                    mapCheck.put(bucketId, db);
                    Debug.info("Bucket", bucketId, serverIp, serverPort, opBlockTime, opTimeout, compressThreshold, isBucketUser);
                }
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
            latch.countDown();
        }

        private String getStringInfo (String key, String defaultValue) throws Exception
        {
            JsonPrimitive element = bucketInfo.getAsJsonPrimitive(key);
            if (element == null)
            {
                if (defaultValue == null)
                    throw new Exception("Null info " + key + " in bucket " + bucketId);

                return defaultValue;
            }

            if (!element.isString())
                throw new Exception("Wrong info " + key + " in bucket " + bucketId);
            return element.getAsString();
        }

        private int getIntInfo (String key, int defaultValue) throws Exception
        {
            JsonPrimitive element = bucketInfo.getAsJsonPrimitive(key);
            if (element == null)
                return defaultValue;
            if (!element.isNumber())
                throw new Exception("Wrong info " + key + " in bucket " + bucketId);
            return element.getAsInt();
        }

        private boolean getBoolInfo (String key, boolean defaultValue) throws Exception
        {
            JsonPrimitive element = bucketInfo.getAsJsonPrimitive(key);
            if (element == null)
                return defaultValue;
            if (!element.isBoolean())
                throw new Exception("Wrong info " + key + " in bucket " + bucketId);
            return element.getAsBoolean();
        }
    }
}
