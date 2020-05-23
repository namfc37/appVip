package util.executor;

import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;

public class GroupQueue<K> implements Runnable
{
    private GroupQueueExecutor<K> executor;
    private K                  id;

    private final AtomicBoolean                   isRunning = new AtomicBoolean();
    private final ConcurrentLinkedQueue<Runnable> queue     = new ConcurrentLinkedQueue<>();

    public GroupQueue (K id, GroupQueueExecutor<K> executor)
    {
        this.id = id;
        this.executor = executor;
    }

    public void reset (K id)
    {
        this.id = id;
        isRunning.set(false);
    }

    @Override
    public void run ()
    {
        Runnable nextTask;
        while ((nextTask = queue.poll()) != null)
        {
            try
            {
                nextTask.run();
            }
            catch (Exception e)
            {
                MetricLog.exception(e, id);
            }
        }
        executor.remove(id, this);
    }

    public void add (Runnable task)
    {
        queue.add(task);
        if (isRunning.compareAndSet(false, true))
            ShareLoopGroup.submit(this);
    }

    public int size ()
    {
        return queue.size();
    }
}
