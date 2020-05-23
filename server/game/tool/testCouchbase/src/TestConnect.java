import util.Log;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TestConnect
{
    static final int TIME_OUT = 1000;

    static ExecutorService executorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
    static CountDownLatch latch;
    static Map<String, InfoDatabase>                 mapDatabase = new HashMap<>();
    static ConcurrentSkipListMap<String, InfoBucket> buckets     = new ConcurrentSkipListMap<>();

    public static void main (String[] args) throws Exception
    {
        String fileDatabase = "./data/listDatabase.txt";
        List<String> lines = Files.readAllLines(Paths.get(fileDatabase), StandardCharsets.UTF_8);

        Log.info("Load list database");
        for (String line : lines)
        {
            if (line == null)
                continue;
            String ip = line.trim();
            if (ip.isEmpty())
                continue;
            mapDatabase.put(ip, new InfoDatabase(ip));
        }

        Log.info("Test connect database", mapDatabase.size());
        latch = new CountDownLatch(mapDatabase.size());
        for (final InfoDatabase info : mapDatabase.values())
        {
            executorService.submit(new Runnable()
            {
                @Override
                public void run ()
                {
                    info.test();
                }
            });
        }
        latch.await();

        Log.info("Test connect bucket", buckets.size());
        latch = new CountDownLatch(buckets.size());
        for (final InfoBucket info : buckets.values())
        {
            executorService.submit(new Runnable()
            {
                @Override
                public void run ()
                {
                    info.test();
                }
            });
        }
        latch.await();

        Log.info();
        Log.info("Time", new Date(), System.currentTimeMillis() / 1000);

        for (InfoDatabase info : mapDatabase.values())
        {
            Log.info("Connect pool", info.ip, info.timeRaw8091, info.timeConnectPool, info.timeRaw11210);
        }

        Log.info();

        HashSet<String> setIp = new HashSet<>();
        for (final InfoBucket info : buckets.values())
        {
            setIp.add(info.ip);
            if (info.timeConnectRaw < 0)
            {
                Log.info("Connect raw FAIL", info.ip, info.port, info.name);
                continue;
            }

            if (info.timeConnectSpy < 0)
            {
                Log.info("Connect spy FAIL", info.ip, info.port, info.name);
                continue;
            }

            Log.info("Bucket", info.ip, info.port,
                     info.timeConnectRaw,
                     info.timeConnectSpy,
                     info.timeSet,
                     info.timeGet,
                     info.timeDelete,
                     info.name
                    );
        }

        for (InfoDatabase info : mapDatabase.values())
        {
            if (setIp.contains(info.ip))
                continue;
            Log.info("Connect pool FAIL", info.ip, info.timeRaw8091, info.timeConnectPool, info.timeRaw11210);
        }

        System.exit(0);
    }
}