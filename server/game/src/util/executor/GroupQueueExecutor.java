package util.executor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

//Executor chạy tuần tự các task của từng group
public class GroupQueueExecutor<K>
{
    private final ConcurrentHashMap<K, GroupQueue<K>>  map  = new ConcurrentHashMap<>();
    private final ConcurrentLinkedQueue<GroupQueue<K>> pool = new ConcurrentLinkedQueue<>();

    public void add (K id, Runnable task)
    {
        map.computeIfAbsent(id, k -> {
            GroupQueue<K> group = pool.poll();
            if (group == null)
                return new GroupQueue<>(id, this);
            group.reset(id);
            return group;
        }).add(task);
    }

    void remove (K id, GroupQueue<K> groupQueue)
    {
        if (map.remove(id, groupQueue))
            pool.add(groupQueue);
    }
}
