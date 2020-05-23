package service;

import bitzero.server.BitZeroServer;
import bitzero.server.entities.managers.ConnectionStats;
import com.sun.management.OperatingSystemMXBean;
import extension.EnvConfig;
import model.system.MonitorInfo;
import service.friend.FriendServer;
import service.guild.cache.CacheGuildServer;
import service.newsboard.NewsBoardServer;
import sun.management.ManagementFactoryHelper;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;
import util.server.ServerConstant;

import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class MonitorSystem implements Runnable
{
    private static final long PERIOD = Time.MILLISECOND_IN_MINUTE;
    private static final int  MB     = 1048576;

    private static OperatingSystemMXBean osBean;
    private static int                   numProcessors;

    private static boolean         isRunning;

    private static long lastInBytes;
    private static long lastOutBytes;
    private static long lastException;

    public static synchronized void start ()
    {
        if (isRunning)
            return;

        long curTime = Time.getTimeMillis();
        long delay = PERIOD - (curTime % PERIOD);

        //gọi lần đầu để warm up
        osBean = (OperatingSystemMXBean) ManagementFactoryHelper.getOperatingSystemMXBean();
        osBean.getProcessCpuLoad();

        Runtime runtime = Runtime.getRuntime();
        numProcessors = runtime.availableProcessors();

        ShareLoopGroup.scheduleAtFixedRate(new MonitorSystem(), delay, PERIOD, TimeUnit.MILLISECONDS, true);
        isRunning = true;
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        isRunning = false;
    }

    @Override
    public void run ()
    {
        try
        {
            final int MB = 1048576;

            int cpuProcess = cpuProcess();
            int cpuSystem = cpuSystem();
            long ramProcess = Runtime.getRuntime().totalMemory() / MB;
            long ramFree = osBean.getFreePhysicalMemorySize() / MB;
            int numItemAirship = NewsBoardServer.numItemAirship();
            int numItemPrivateShop = NewsBoardServer.numItemPrivateShop();
            int numFriend = FriendServer.numCache();
            int numCacheGuild = CacheGuildServer.numCacheGuild();

            long numException = MetricLog.getNumException() - lastException;
            lastException += numException;

            long inBytes = 0;
            long outBytes = 0;
            int conSocket = 0;
            int conWebSocket = 0;
            int currentConnection = 0;
            int currentUser = 0;

            if (EnvConfig.service() == EnvConfig.Service.GAME)
            {
                BitZeroServer bz = BitZeroServer.getInstance();
                if (bz != null && bz.isStarted())
                {
                    inBytes = bz.getStatsManager().getTotalInBytes() - lastInBytes;
                    lastInBytes += inBytes;

                    outBytes = bz.getStatsManager().getTotalOutBytes() - lastOutBytes;
                    lastOutBytes += outBytes;

                    ConnectionStats connStats = bz.getStatsManager().getUserStats();
                    conSocket = connStats.getSocketCount();
                    conWebSocket = connStats.getWebsocketSessionCount();
                    currentConnection = conSocket + conWebSocket;
                    currentUser = bz.getUserManager().getUserCount();
                }
            }

            if (ServerConstant.IS_METRICLOG)
                MetricLog.monitorSystem(currentUser,
                                        currentConnection,
                                        cpuProcess,
                                        cpuSystem,
                                        ramProcess,
                                        ramFree,
                                        inBytes,
                                        outBytes,
                                        numException,
                                        numItemAirship,
                                        numItemPrivateShop,
                                        numFriend,
                                        numCacheGuild,
                                        conSocket,
                                        conWebSocket);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }

        try
        {
            if (EnvConfig.service() == EnvConfig.Service.BALANCE)
                MonitorInfo.update();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static int numProcessors ()
    {
        return numProcessors;
    }

    public static int cpuProcess ()
    {
        return (int) Math.floor(osBean.getProcessCpuLoad() * 100);
    }

    public static int cpuSystem ()
    {
        return (int) Math.floor(osBean.getSystemCpuLoad() * 100);
    }

    public static long memSystemFree ()
    {
        return osBean.getFreePhysicalMemorySize();
    }

    public static long memProcessUsed ()
    {
        return Runtime.getRuntime().totalMemory();
    }
}
