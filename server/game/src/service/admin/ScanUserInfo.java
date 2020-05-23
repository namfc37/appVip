package service.admin;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.ConstInfo;
import extension.EnvConfig;
import model.CoinCash;
import model.UserBrief;
import model.UserGame;
import org.apache.log4j.PropertyConfigurator;
import util.Json;
import util.Time;
import util.metric.MetricLog;

import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class ScanUserInfo
{
    public static final String  INPUT_FOLDER  = "./userRegistered";
    public static final String  OUTPUT_FOLDER = "./userInfo";
    public static final String OUTPUT_FILE   = "userInfo_";
    public final static String SEPARATOR     = "\t";

    private static final int STEP_SLEEP = 50;
    private static final int TIME_SLEEP = 10;

    private static int numFile, numLine, numMatchZone, numBrief, numGame;
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
            scanUserInfo();
            long delta = System.currentTimeMillis() - timeStart;

            MetricLog.console("*** FINISHED ***");
            MetricLog.console("zone", EnvConfig.zone());
            MetricLog.console("numFile", numFile);
            MetricLog.console("numLine", numLine);
            MetricLog.console("numMatchZone", numMatchZone);
            MetricLog.console("numBrief", numBrief);
            MetricLog.console("numGame", numGame);

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

    private static void scanUserInfo ()
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
            Files.lines(input).forEach(line -> readUserInfo(line, output));
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Read file", input.getFileName());
        }
    }

    private static void readUserInfo (String line, BufferedWriter output)
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

            result = "Parse json";
            JsonObject o = Json.parse(line).getAsJsonObject();
            sUserId = o.get("s_userID").getAsString();
            int userId = Integer.parseInt(sUserId);

            result = "Check zone";
            JsonElement eZone = o.get("s_serverID");
            switch (EnvConfig.zone())
            {
                case "vn":
                    if (eZone != null)
                    {
                        String sZone = eZone.getAsString();
                        if (!sZone.startsWith(EnvConfig.zone()))
                            return;
                    }
                    break;

                case "sea":
                case "br":
                    if (eZone == null)
                        return;
                    String sZone = eZone.getAsString();
                    if (!sZone.startsWith(EnvConfig.zone()))
                        return;
                    break;

                default:
                    return;
            }

            numMatchZone++;

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

                        result = "OK";
                    }
                }
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Read user", sUserId);
        }

        write(output, sUserId, username, bucketId, timeRegister, timeLogin, level, coin, totalConvert, gold, coinCash, coinPromo, result);

    }

    public static void write (BufferedWriter output, String sUserId, Object... ao)
    {
        try
        {
            output.write(sUserId);
            output.write(SEPARATOR);

            for (Object o : ao)
            {
                if (o != null)
                    output.write(o.toString());
                output.write(SEPARATOR);
            }
            output.newLine();
        }
        catch (Exception e)
        {
            MetricLog.exception(e, "Write user", sUserId);
        }
    }
}
