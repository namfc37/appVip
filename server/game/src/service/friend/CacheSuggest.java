package service.friend;

import extension.EnvConfig;
import util.AtomicInteger;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Created by CPU10399-local on 2/29/2016.
 */
public class CacheSuggest
{
    private int                                    level;
    private ConcurrentLinkedQueue<FriendInfo>      queue;
    private ConcurrentHashMap<Integer, FriendInfo> setId;

    private int maxSize;

    public CacheSuggest (int level)
    {
        this.level = level;

        maxSize = EnvConfig.getFriend().getItemPerLevel();

        queue = new ConcurrentLinkedQueue<>();
        setId = new ConcurrentHashMap<>(maxSize);
    }

    public void add (FriendInfo info)
    {
        if (setId.putIfAbsent(info.getId(), info) != null)
            return;
        if (setId.size() >= maxSize)
        {
            FriendInfo old = queue.poll();
            setId.remove(old.getId());
        }
        queue.add(info);
    }

    public void remove (FriendInfo info)
    {
        setId.remove(info.getId());
    }

    public FriendInfo next ()
    {
        FriendInfo info = queue.poll();
        if (info == null)
            return null;
        if (info.getLevel() == level)
            queue.add(info);
        else
            setId.remove(info.getId());
        return info;
    }

    public int size ()
    {
        return setId.size();
    }
}
