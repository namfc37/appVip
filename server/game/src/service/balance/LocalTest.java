package service.balance;

import bitzero.util.common.business.Debug;
import extension.EnvConfig;
import service.udp.MsgWorkerInfo;
import util.Json;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

public class LocalTest
{
    public static void test ()
    {
        final int WARMUP = 5;
        final int ITERATIONS = 45;
        final int NUM_GET = 100000;
        final int NUM_SERVER = 10;
        final String SERVICE = EnvConfig.Service.GAME.name();
        final int GROUP = 1;
        final int CODE = 1;
        final int CORE = 10;
        ThreadLocalRandom random = ThreadLocalRandom.current();
        Map<String, MsgWorkerInfo> map = new HashMap<>();

        for (int numWorker = 1; numWorker <= NUM_SERVER; numWorker++)
        {
            MsgWorkerInfo m = MsgWorkerInfo.create();
            m.time = System.currentTimeMillis();
            m.service = SERVICE;
            m.group = GROUP;
            m.privateHost = "10.199.230." + numWorker;
            m.numCore = CORE; //random.nextInt(1, CORE + 1);
            m.connection = random.nextInt(10000);
            map.put(m.privateHost, m);

            BalanceServer.addWorker(m);
        }
        BalanceServer.setActive(SERVICE, GROUP, CODE);
        BalanceServer.resetSimulate();

        int numNull = 0;
        long deltaTime = 0;
        for (int test = 0, len = WARMUP + ITERATIONS; test < len; test++)
        {
            long begin = System.currentTimeMillis();
            for (int i = 0; i < NUM_GET; i++)
            {
                MsgWorkerInfo m = BalanceServer.chooseWorker(SERVICE, GROUP, CODE);
                if (m == null)
                    numNull++;
//                else
//                    Debug.info(m.privateHost);
            }
            if (test >= WARMUP)
                deltaTime += System.currentTimeMillis() - begin;
        }

        Debug.info(Json.toJsonPretty(map.values()));
        Debug.info("numNull", numNull);
        Debug.info("hit/ms", ITERATIONS * NUM_GET / deltaTime);
    }
}
