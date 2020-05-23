package util.memcached;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import util.Log;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
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
    private final static int    UPDATE_STATS_DELAY = 10;

    private static final ConcurrentHashMap<String, AbstractDbKeyValue> mapBucket   = new ConcurrentHashMap<>();
    private static final ArrayList<AbstractDbKeyValue>                 userBuckets = new ArrayList<>();
    private static String          smallestUserBucket;
    private static ScheduledFuture future;

    public synchronized static void start (String filePath) throws Exception
    {
        Log.info("Use " + filePath);

        CountDownLatch latch;
        int numBucket;

        try (BufferedReader reader = Files.newBufferedReader(Paths.get(filePath), StandardCharsets.UTF_8))
        {
            JsonParser parser = new JsonParser();
            Set<Map.Entry<String, JsonElement>> setBucketInfo = parser.parse(reader).getAsJsonObject().entrySet();
            numBucket = setBucketInfo.size();
            latch = new CountDownLatch(numBucket);

            for (Map.Entry<String, JsonElement> o : setBucketInfo)
            {
                String bucketId = o.getKey();
                if (mapBucket.containsKey(bucketId))
                {
                    throw new Exception("Duplicate bucket id " + bucketId);
                }
                JsonObject info = o.getValue().getAsJsonObject();
                new Thread(new Connection(bucketId, info, latch)).start();
            }
        }

        latch.await();
        if (mapBucket.size() != numBucket)
            throw new Exception("Num bucket not match (numBucket=" + numBucket + ", size=" + mapBucket.size() + ")");

        Log.info("Check database connection");
        findSmallestUserBucket();
        int numRetry = 0;
        boolean connectSuccess = false;

        while (numRetry < 50)
        {
            long time = System.currentTimeMillis();
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
//            future = ShareLoopGroup.scheduleWithFixedDelay(new ServiceTest(),
//                                                           UPDATE_STATS_DELAY,
//                                                           UPDATE_STATS_DELAY,
//                                                           TimeUnit.SECONDS);
        }
        else
        {
            throw new Exception("Check database fail");
        }

        Log.info("Connect database success. Num user bucket is " + userBuckets.size() + ". Num retry is " + numRetry);
    }

    public static int numUserBucket ()
    {
        return userBuckets.size();
    }

    public static String getSmallestUserBucket ()
    {
        return smallestUserBucket;
    }

    private static void findSmallestUserBucket ()
    {
        String smallBucket = null;
        double smallWeight = Double.MAX_VALUE;
        double curWeight;
        long curSize, totalSize;

        if (userBuckets.size() == 1)
        {
            smallBucket = userBuckets.get(0).getId();
        }
        else
        {
            for (AbstractDbKeyValue db : userBuckets)
            {
                for (Map<String, String> info : db.getStats().values())
                {
                    curSize = Long.parseLong(info.get("bytes"));
                    totalSize = Long.parseLong(info.get("ep_max_size"));
                    curWeight = (double) curSize * 1000000d / (double) totalSize;
                    if (curWeight < smallWeight)
                    {
                        smallWeight = curWeight;
                        smallBucket = db.getId();
                    }
                    break;
                }
            }
        }

        if (smallBucket != null)
        {
            smallestUserBucket = smallBucket;
        }
    }

    private static class ServiceTest implements Runnable
    {
        @Override
        public void run ()
        {
            long time = System.currentTimeMillis();

            for (AbstractDbKeyValue db : mapBucket.values())
                db.set(KEY_TEST, db.getId() + "," + time);
            findSmallestUserBucket();
        }
    }

    public synchronized static void stop ()
    {
        if (future != null)
            future.cancel(false);
        for (AbstractDbKeyValue db : mapBucket.values())
        {
            db.disconnect();
        }
    }

    public static AbstractDbKeyValue get (String bucketId)
    {
        return mapBucket.get(bucketId);
    }

    public static int getNumBucket ()
    {
        return mapBucket.size();
    }

    private static class Connection implements Runnable
    {
        private final String         bucketId;
        private final JsonObject     bucketInfo;
        private final CountDownLatch latch;

        Connection (String bucketId, JsonObject bucketInfo, CountDownLatch latch)
        {
            this.bucketId = bucketId;
            this.bucketInfo = bucketInfo;
            this.latch = latch;
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
                    db = new FileStore(bucketId, localFolder);
                    mapBucket.put(bucketId, db);
                    Log.info("Bucket", bucketId, "LOCAL_FOLDER", localFolder, isBucketUser);
                }
                else
                {
                    String serverIp = getStringInfo(PROPERTY_SERVER_IP, null);
                    int serverPort = getIntInfo(PROPERTY_SERVER_PORT, 11211);
                    int opBlockTime = getIntInfo(PROPERTY_OP_BLOCKTIME, 500);
                    int opTimeout = getIntInfo(PROPERTY_OP_TIMEOUT, 2500);
                    int compressThreshold = getIntInfo(PROPERTY_COMPRESS_THRESHOLD, 6400);

                    db = new SpyMemcached(bucketId, serverIp, serverPort, opBlockTime, opTimeout, compressThreshold);

                    mapBucket.put(bucketId, db);
                    Log.info("Bucket", bucketId, serverIp, serverPort, opBlockTime, opTimeout, compressThreshold, isBucketUser);
                }

                if (isBucketUser)
                {
                    synchronized (userBuckets)
                    {
                        userBuckets.add(db);
                    }
                }
            }
            catch (Exception e)
            {
                Log.exception(e);
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
