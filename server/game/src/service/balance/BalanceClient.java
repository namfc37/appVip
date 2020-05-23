package service.balance;

import extension.EnvConfig;
import service.udp.MsgWorkerInfo;
import util.Time;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class BalanceClient
{
    private static boolean         isRunning;

    public synchronized static void start ()
    {
        if (isRunning)
            return;
        isRunning = true;

        long curTime = Time.getTimeMillis();
        int period = EnvConfig.getBalance().getPeriod();
        long delay = 2 * period - (curTime % period);

        ShareLoopGroup.scheduleAtFixedRate(() -> sendWorkerInfo(), delay, EnvConfig.getBalance().getPeriod(), TimeUnit.MILLISECONDS, true);
    }

    private static void sendWorkerInfo ()
    {
        try
        {
            MsgWorkerInfo msg = MsgWorkerInfo.create();
            String raw = msg.encode();
            EnvConfig.udpAdmin.write(BalanceServer.address, raw);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public synchronized static void stop ()
    {
        if (!isRunning)
            return;

        isRunning = false;
    }
}
