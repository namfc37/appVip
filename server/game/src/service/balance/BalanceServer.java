package service.balance;

import com.google.gson.JsonObject;
import extension.EnvConfig;
import model.NumRegister;
import model.NumUser;
import model.system.BalanceInfo;
import org.apache.log4j.PropertyConfigurator;
import service.guild.GuildManager;
import service.udp.MsgWorkerInfo;
import util.Json;
import util.io.BootstrapInfo;
import util.io.SSLContextLoader;
import util.io.ShareLoopGroup;
import util.io.http.HttpServer;
import util.memcached.BucketManager;
import util.metric.MetricLog;
import util.redis.RedisManager;

import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class BalanceServer
{
    private static ConcurrentHashMap<String, Service> mapService;
    private static BalanceInfo                        info;

    public static HttpServer        http, https;
    public static InetSocketAddress address;

    public static void main (String[] args)
    {
        try
        {
            PropertyConfigurator.configure("config/log4j.properties");
            EnvConfig.start();
            addShutdownHook();

            if (EnvConfig.service() != EnvConfig.Service.BALANCE)
                throw new RuntimeException("Can not run BalanceServer.main() when service is " + EnvConfig.service());

            int period = EnvConfig.getBalance().getPeriod();
            int timeout = EnvConfig.getBalance().getTimeout();
            if (timeout < period)
                throw new RuntimeException("timeout < period");

            mapService = new ConcurrentHashMap<>();
            load();

            ShareLoopGroup.scheduleWithFixedDelay(() -> resetSimulate(), period, period, TimeUnit.MILLISECONDS, true);

            http = new HttpServer("http.Balance", new BootstrapInfo(null, EnvConfig.getUser().getPort()));
            http.start(new HttpServerInitializer());

            https = new HttpServer("https.Balance", new BootstrapInfo(null, EnvConfig.getUser().getPortWebSocket()));
            https.start(new HttpServerInitializer(SSLContextLoader.forServer(EnvConfig.getKeyStoreFile(), EnvConfig.getKeyStorePass())));

            EnvConfig.markRunning();
        }
        catch (Exception e)
        {
            MetricLog.console(e);
            MetricLog.exception(e);
            System.exit(1);
        }
    }

    private static void addShutdownHook ()
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try
            {
                stop();
            }
            catch (Exception e)
            {
                MetricLog.exception(e);
            }
        }));
    }

    public static synchronized void stop ()
    {
        EnvConfig.markStopping();
        save();

        if (http != null)
        {
            http.stop();
            http = null;
        }

        if (https != null)
        {
            https.stop();
            https = null;
        }

        EnvConfig.stop();
    }

    private static synchronized void load ()
    {
        loadKeyInfo();
    }

    private static synchronized void save ()
    {
        if (info != null)
            BalanceInfo.set(info);
    }

    private static void loadKeyInfo ()
    {
        info = BalanceInfo.get();
        if (info == null)
        {
            info = BalanceInfo.create();
            info.setActive(EnvConfig.Service.GAME.name(), 1, 1);

            BalanceInfo.set(info);
        }

        info.initGroup();
    }

    public static void addWorker (final MsgWorkerInfo info)
    {
        if (mapService == null)
            return;
        Service service = mapService.get(info.service);
        if (service == null)
            service = mapService.computeIfAbsent(info.service, k -> new Service(info.service));
        service.addWorker(info);
    }

    public static MsgWorkerInfo chooseWorker (String feature, int group, int code)
    {
        Service f = mapService.get(feature);
        if (f == null)
            return null;

        if (group > 0)
            return f.chooseWorker(group, code);

        if (code > 0)
        {
            if (code <= info.getCode())
                return f.chooseActiveWorker(code);
            return f.chooseInactiveWorker(code);
        }

        if (group == 0)
            return f.chooseActiveWorker(code);
        return f.chooseInactiveWorker(code);
    }

    static void resetSimulate ()
    {
        try
        {
            addWorker(MsgWorkerInfo.create());

            for (Service f : mapService.values())
                f.resetSimulate();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static String setActive (String service, int active, int code)
    {
        Service o = mapService.get(service);
        if (o == null)
            return "Null service";
        String result = o.setActive(active);
        if (result == null)
        {
            info.setActive(service, active, code);
            BalanceInfo.set(info);
        }
        return result;
    }

    public static void initGroup (String service, int active, int inactive)
    {
        mapService.computeIfAbsent(service, k -> new Service(service)).initGroup(active, inactive);
    }

    public static BalanceInfo getInfo ()
    {
        return info;
    }

    public static JsonObject toJsonObject ()
    {
        JsonObject o = new JsonObject();
        o.add("mapService", Json.toJsonTree(mapService));
        o.add("couchbase", Json.toJsonTree(BucketManager.getMapStats()));
        o.add("redis", Json.toJsonTree(RedisManager.getMapStats()));
        o.addProperty("numRegister", NumRegister.get());
        o.addProperty("numUser", NumUser.get());
        o.addProperty("guildNumRegister", GuildManager.numRegister());
        o.add("info", Json.toJsonTree(info));

        return o;
    }

    public static String toJson ()
    {
        return Json.toJsonPretty(toJsonObject());
    }

    public static String toTableStatus ()
    {
        StringBuilder s = new StringBuilder();
        s.append("<!DOCTYPE html>");
        s.append("<html>");
        s.append("<style>");

        s.append("table {");
        s.append("width:100%;");
        s.append("}");

        s.append("table, th, td {");
        s.append("border: 1px solid black;");
        s.append("border-collapse: collapse;");
        s.append("}");

        s.append("th, td {");
        s.append("padding: 15 px;");
        s.append("text - align:left;");
        s.append("}");

        s.append("table tr:nth - child(even) {");
        s.append("background - color: #DFF0D8;");
        s.append("}");

        s.append("table tr:nth - child(odd) {");
        s.append("background - color: #0;");
        s.append("}");

        s.append("</style >");
        s.append("</head >");

        s.append("<body >");

        s.append("<h2 > Service </h2 >");
        s.append("<table >");
        s.append("<tr >");
        s.append("<th > IP </th >");
        s.append("<th > IP </th >");
        s.append("<th > Service </th >");
        s.append("<th > Group </th >");
        s.append("<th > Active </th >");
        s.append("<th > CCU </th >");
        s.append("<th > Conn </th >");
        s.append("<th > CPU<br>Process </th >");
        s.append("<th > CPU<br>Sys </th >");
        s.append("<th > Mem<br>Process </th >");
        s.append("<th > Mem<br>Free </th >");
        s.append("<th > Error </th >");
        s.append("<th > prShop </th >");
        s.append("<th > airship </th >");
        s.append("<th > friend </th >");
        s.append("<th > upTime </th >");
        s.append("<th > revision </th >");
        s.append("<th > time </th >");
        s.append("</tr >");

        for (Service service : mapService.values())
            service.addTableStatus(s);

        s.append("</table >");
        s.append("<br >");

        s.append("<h2 > Couchbase </h2 >");
        s.append("<table >");
        s.append("<tr >");
        s.append("<th > Bucket </th >");
        s.append("<th > Type </th >");
        s.append("<th > CurSize </th >");
        s.append("<th > MaxSize </th >");
        s.append("<th > Item </th >");
        s.append("<th > Get </th >");
        s.append("<th > Set </th >");
        s.append("<th > Delete </th >");
        s.append("<th > Incr </th >");
        s.append("<th > Decr </th >");
        s.append("<th > CAS </th >");
        s.append("</tr >");

        for (Map.Entry<String, BucketManager.Stats> e : BucketManager.getMapStats().entrySet())
        {
            BucketManager.Stats stats = e.getValue();

            s.append("<tr >");
            s.append("<td >").append(e.getKey()).append("</td >");
            s.append("<td >").append(stats.isCache ? "cached" : "base").append("</td >");
            s.append("<td >").append(stats.curSize).append("</td >");
            s.append("<td >").append(stats.maxSize).append("</td >");
            s.append("<td >").append(stats.numItem).append("</td >");
            s.append("<td >").append(stats.avgGet).append("</td >");
            s.append("<td >").append(stats.avgSet).append("</td >");
            s.append("<td >").append(stats.avgDelete).append("</td >");
            s.append("<td >").append(stats.avgIncrease).append("</td >");
            s.append("<td >").append(stats.avgDecrease).append("</td >");
            s.append("<td >").append(stats.avgCas).append("</td >");
            s.append("</tr >");
        }

        s.append("</table >");
        s.append("<br >");


        s.append("</body >");
        s.append("</html >");

        return s.toString();
    }
}
