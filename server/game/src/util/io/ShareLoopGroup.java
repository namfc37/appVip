package util.io;

import bitzero.util.common.business.Debug;
import io.netty.channel.nio.NioEventLoopGroup;
import util.metric.MetricLog;

import java.util.concurrent.*;

/**
 * Created by CPU01736-local on 3/11/2015.
 */
public class ShareLoopGroup
{
    private static NioEventLoopGroup     BOSS;
    private static NioEventLoopGroup     WORKER = new NioEventLoopGroup();
    private static ConcurrentLinkedQueue<ScheduledFuture<?>> autoShutdownFutures = new ConcurrentLinkedQueue<>();

    static
    {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> shutdown()));
    }

    public static synchronized void shutdown ()
    {
        Debug.info("ShareLoopGroup.shutdown");
        try
        {
            if (BOSS != null)
                BOSS.shutdownGracefully();

            ScheduledFuture<?> f;
            while ((f = autoShutdownFutures.poll()) != null)
            {
                if (!f.isDone() && !f.isCancelled())
                    f.cancel(false);
            }

            if (WORKER != null)
                WORKER.shutdownGracefully();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static boolean isShareLoopGroop (NioEventLoopGroup group)
    {
        return group == BOSS || group == WORKER;
    }

    public static synchronized NioEventLoopGroup boss ()
    {
        if (BOSS == null)
            BOSS = new NioEventLoopGroup();
        return BOSS;
    }

    public static NioEventLoopGroup worker ()
    {
        return WORKER;
    }

    public final static ScheduledFuture<?> schedule (Runnable command, long delay, TimeUnit unit, boolean autoShutdown)
    {
        ScheduledFuture<?> f = WORKER.schedule(command, delay, unit);
        if (autoShutdown)
        {
            autoShutdownFutures.add(f);
            return null;
        }
        return f;
    }

    public final static <V> ScheduledFuture<V> schedule (Callable<V> callable, long delay, TimeUnit unit, boolean autoShutdown)
    {
        ScheduledFuture<V> f =  WORKER.schedule(callable, delay, unit);
        if (autoShutdown)
        {
            autoShutdownFutures.add(f);
            return null;
        }
        return f;
    }

    public final static ScheduledFuture<?> scheduleAtFixedRate (Runnable command, long initialDelay, long period, TimeUnit unit, boolean autoShutdown)
    {
        ScheduledFuture<?> f = WORKER.scheduleAtFixedRate(command, initialDelay, period, unit);
        if (autoShutdown)
        {
            autoShutdownFutures.add(f);
            return null;
        }
        return f;
    }

    public final static ScheduledFuture<?> scheduleWithFixedDelay (Runnable command, long initialDelay, long delay, TimeUnit unit, boolean autoShutdown)
    {
        ScheduledFuture<?> f = WORKER.scheduleWithFixedDelay(command, initialDelay, delay, unit);
        if (autoShutdown)
        {
            autoShutdownFutures.add(f);
            return null;
        }
        return f;
    }

    public final static Future<?> submit (Runnable command)
    {
        return WORKER.submit(command);
    }
}
