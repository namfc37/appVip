package service.admin;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import extension.EnvConfig;
import model.CoinCash;
import model.NumUser;
import model.UserBrief;
import model.UserGame;
import model.key.AbstractInfoKey;
import model.key.InfoKeyData;
import model.key.InfoKeyUser;
import org.apache.log4j.PropertyConfigurator;
import payment.billing.Billing;
import payment.billing.PurchaseInfo;
import util.Database;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;
import util.metric.MetricLog;

import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class DeleteOldUser
{
    public static final  String INPUT_FOLDER  = ScanUserInfo.OUTPUT_FOLDER;
    public static final  String OUTPUT_FOLDER = "./userDeleted";
    private static final String OUTPUT_FILE   = "userDeleted_";

    private static final int STEP_SLEEP = 50;
    private static final int TIME_SLEEP = 10;

    private static final long TIME_LAST_LOGIN = LocalDateTime.of(2019, 9, 1, 0, 0).toEpochSecond(Time.zone);
    private static final int MIN_LEVEL = 15;

    private static int numFile, numLine, numMatchDelete, numBrief, numGame, numDeleted;
    private static long timeStart;

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            addShutdownHook();

            EnvConfig.readConfig();
            EnvConfig.markStarting();

            EnvConfig.connectDatabase(false);
            ConstInfo.load();

            EnvConfig.markRunning();

            timeStart = System.currentTimeMillis();
            scan();
            long delta = System.currentTimeMillis() - timeStart;

            MetricLog.console("*** FINISHED ***");
            MetricLog.console("zone", EnvConfig.zone());
            MetricLog.console("numFile", numFile);
            MetricLog.console("numLine", numLine);
            MetricLog.console("numMatchDelete", numMatchDelete);
            MetricLog.console("numBrief", numBrief);
            MetricLog.console("numGame", numGame);
            MetricLog.console("numDeleted", numDeleted);
            MetricLog.console("TIME_LAST_LOGIN", TIME_LAST_LOGIN, 1567296000);

            long timeProcess = delta / 1000;
            MetricLog.console("timeProcess", timeProcess, "s");
            MetricLog.console("speedLine", timeProcess > 0 ? numLine / timeProcess : 0, "line / s");
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }

        System.exit(0);
    }

    private static void addShutdownHook ()
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try
            {
                EnvConfig.markStopping();
                EnvConfig.disconnectDatabase();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
            EnvConfig.markTerminated();
        }));
    }

    private static void scan ()
    {
        try (Stream<Path> walk = Files.walk(Paths.get(INPUT_FOLDER)); BufferedWriter bw = Files.newBufferedWriter(Paths.get(OUTPUT_FOLDER + "/" + OUTPUT_FILE + Time.timeBackup() + ".txt")))
        {
            walk.filter(Files::isRegularFile)
                .forEach(path -> readFile(path, bw));
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private static void readFile (Path input, BufferedWriter output)
    {
        numFile++;
        try
        {
            MetricLog.console("Read file", input.getFileName(), "numFile", numFile, "numLine", numLine);
            Files.lines(input).forEach(line -> readLine(line, output));
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Read file", input.getFileName());
        }
    }

    private static void readLine (String line, BufferedWriter output)
    {
        numLine++;
        if (line == null || line.isEmpty())
            return;

        String sUserId = "";
        String username = "";
        String bucketId = "";
        int level = 0;
        long coin = 0;
        long totalConvert = 0;
        long gold = 0;
        long timeRegister = 0;
        long timeLogin = 0;
        long coinCash = 0;
        long coinPromo = 0;
        String result = "";

        try
        {
            if ((numLine % STEP_SLEEP) == 0)
                Thread.sleep(TIME_SLEEP);

            result = "parse line";
            String[] params = line.split(ScanUserInfo.SEPARATOR);
            sUserId = params[0];

            timeRegister = Long.parseLong(params[3]);
            timeLogin = Long.parseLong(params[4]);
            level = Integer.parseInt(params[5]);
            totalConvert = Long.parseLong(params[7]);

            result = canDelete(timeRegister, timeLogin, totalConvert, coinCash, level);
            if (result == null)
            {
                numMatchDelete++;
                int userId = Integer.parseInt(sUserId);

                result = "Check id";
                if (userId > 0)
                {
                    result = "Get brief";
                    UserBrief brief = UserBrief.get(userId);

                    if (brief != null)
                    {
                        numBrief++;
                        username = brief.getUsername();
                        bucketId = brief.getBucketId();
                        level = brief.level;
                        timeRegister = brief.timeRegister;
                        timeLogin = brief.timeLogin;

                        result = "Get game";
                        UserGame game = UserGame.get(brief.getBucketId(), userId, null);
                        if (game != null)
                        {
                            numGame++;
                            level = game.getLevel();
                            coin = game.coin;
                            gold = game.getGold();
                            totalConvert = game.getPayment().getTotalConvert();

                            result = "Get coin cash";
                            coinCash = CoinCash.get(userId);

                            result = "Get coin promo";
                            coinPromo = CoinCash.get(userId);

                            result = canDelete(timeRegister, timeLogin, totalConvert, coinCash, level);

                            if (result == null)
                                result = deleteUserData(brief);
                        }
                    }
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Read user", sUserId);
        }

        ScanUserInfo.write(output, sUserId, username, bucketId, timeRegister, timeLogin, level, coin, totalConvert, gold, coinCash, coinPromo, result);

    }

    private static String canDelete (long timeRegister, long timeLogin, long totalConvert, long coinCash, int level)
    {
        if (timeRegister >= TIME_LAST_LOGIN)
            return "Check timeRegister fail";
        if (timeLogin >= TIME_LAST_LOGIN)
            return "Check timeLogin fail";
        if (totalConvert > 0)
            return "Check totalConvert fail";
        if (coinCash > 0)
            return "Check coinCash fail";
        if (level >= MIN_LEVEL)
            return "Check level fail";

        return null;
    }

    private static String deleteUserData (UserBrief brief)
    {
        AbstractDbKeyValue db = BucketManager.get(brief.getBucketId());
        Map<String, Boolean> results = new HashMap<>();

        InfoKeyData infoKeyData = InfoKeyData.MAP_DEVICE_ID;
        String keyName = infoKeyData.keyName(brief.deviceId);
        results.put(keyName, infoKeyData.db().delete(keyName));

        infoKeyData = InfoKeyData.MAP_USER_NAME;
        keyName = infoKeyData.keyName(brief.getUsername());
        results.put(keyName, infoKeyData.db().delete(keyName));

        for (Map.Entry<AbstractInfoKey.BUCKET, List<InfoKeyUser>> entry : InfoKeyUser.mapBucket.entrySet())
        {
            for (InfoKeyUser info : entry.getValue())
            {
                keyName = info.keyName(brief.getUserId());
                switch (entry.getKey())
                {
                    case CACHE:
                        results.put(keyName, Database.cache().delete(keyName));
                        break;
                    case INDEX:
                        results.put(keyName, Database.index().delete(keyName));
                        break;
                    default:
                        results.put(keyName, db.delete(keyName));
                }
            }
        }

        NumUser.decrement();

        MetricLog.gm("DeleteOldUser",
                     "tool",
                     "",
                     "Inactive",
                     brief.getUserId(),
                     0,
                     Json.toJson(results)
                    );

        //Debug.info("Delete user data", brief.getUserId(), "Success", Json.toJsonPretty(results));

        return null;
    }

    private static void deleteUserData (int userId)
    {
        UserBrief brief = UserBrief.get(userId);
        if (brief == null)
            Debug.info("Delete user data", userId, "FAIL");
        else
            deleteUserData(brief);
    }
}
