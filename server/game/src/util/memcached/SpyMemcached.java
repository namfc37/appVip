package util.memcached;


import net.spy.memcached.CASResponse;
import net.spy.memcached.CASValue;
import net.spy.memcached.ConnectionFactoryBuilder;
import net.spy.memcached.MemcachedClient;
import net.spy.memcached.internal.OperationFuture;
import net.spy.memcached.transcoders.SerializingTranscoder;

import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

public class SpyMemcached extends AbstractDbKeyValue
{
    private final MemcachedClient client;

    public SpyMemcached (String id, boolean isBucketUser, String serverIp, int serverPort, int opBlockTime, int opTimeOut, int compressThreshold) throws Exception
    {
        super(id, isBucketUser);

        ArrayList<InetSocketAddress> addrs = new ArrayList<>();
        addrs.add(new InetSocketAddress(serverIp, serverPort));

        ConnectionFactoryBuilder cfb = new ConnectionFactoryBuilder();
        if (opBlockTime > 0)
            cfb.setOpQueueMaxBlockTime(opBlockTime);
        if (opTimeOut > 0)
            cfb.setOpTimeout(opTimeOut);

        client = new MemcachedClient(cfb.build(), addrs);

        if (compressThreshold > 0)
            ((SerializingTranscoder) client.getTranscoder()).setCompressionThreshold(compressThreshold);
    }

    @Override
    public void disconnect ()
    {
        client.shutdown();
    }

    @Override
    public String getId ()
    {
        return id;
    }

    @Override
    public boolean set (String key, Object value)
    {
        return set(key, value, AbstractDbKeyValue.NO_EXPIRATION);
    }

    @Override
    public boolean set (String key, Object value, int expiration)
    {
        OperationFuture<Boolean> f = client.set(key, modifyExpiration(expiration), value);
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public boolean asyncSet (String key, Object value)
    {
        client.set(key, AbstractDbKeyValue.NO_EXPIRATION, value);
        return true;
    }

    @Override
    public boolean asyncSet (String key, Object value, int expiration)
    {
        client.set(key, modifyExpiration(expiration), value);
        return true;
    }

    @Override
    public Object get (String key)
    {
        return client.get(key);
    }

    @Override
    public CASValue<Object> gets (String key)
    {
        return client.gets(key);
    }

    @Override
    public boolean cas (String key, long cas, Object value)
    {
        return client.cas(key, cas, value) == CASResponse.OK;
    }

    @Override
    public boolean cas (String key, long cas, Object value, int expiration)
    {
        return client.cas(key, cas, expiration, value, client.getTranscoder()) == CASResponse.OK;
    }

    @Override
    public Map<String, Object> getMulti (Collection<String> keys)
    {
        return client.getBulk(keys);
    }

    @Override
    public boolean delete (String key)
    {
        OperationFuture<Boolean> f = client.delete(key);
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public boolean add (String key, Object value)
    {
        return add(key, value, AbstractDbKeyValue.NO_EXPIRATION);
    }

    @Override
    public boolean add (String key, Object value, int expiration)
    {
        OperationFuture<Boolean> f = client.add(key, modifyExpiration(expiration), value);
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public boolean replace (String key, Object value)
    {
        return replace(key, value, AbstractDbKeyValue.NO_EXPIRATION);
    }

    @Override
    public boolean replace (String key, Object value, int expiration)
    {
        OperationFuture<Boolean> f = client.replace(key, modifyExpiration(expiration), value);
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public void asyncDecr (String key, long offset)
    {
        client.asyncDecr(key, offset);
    }

    @Override
    public void asyncIncr (String key, long offset)
    {
        client.asyncIncr(key, offset);
    }

    @Override
    public long decrement (String key, long offset)
    {
        return client.decr(key, offset);
    }

    @Override
    public long decrement (String key, long offset, long initialValue)
    {
        return client.decr(key, offset, initialValue);
    }

    @Override
    public long decrement (String key, long offset, long initialValue, int expiration)
    {
        return client.decr(key, offset, initialValue, modifyExpiration(expiration));
    }

    @Override
    public long increment (String key, long offset)
    {
        return client.incr(key, offset);
    }

    @Override
    public long increment (String key, long offset, long initialValue)
    {
        return client.incr(key, offset, initialValue);
    }

    @Override
    public long increment (String key, long offset, long initialValue, int expiration)
    {
        return client.incr(key, offset, initialValue, modifyExpiration(expiration));
    }

    @Override
    public boolean append (String key, String value, long cas)
    {
        OperationFuture<Boolean> f = client.append(cas, key, value);
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public boolean touch (String key, int expiration)
    {
        OperationFuture<Boolean> f = client.touch(key, modifyExpiration(expiration));
        try
        {
            return f.get();
        }
        catch (Exception e)
        {
            f.cancel();
        }
        return false;
    }

    @Override
    public void asyncTouch (String key, int expiration)
    {
        client.touch(key, modifyExpiration(expiration));
    }

    @Override
    public Map<SocketAddress, Map<String, String>> getStats ()
    {
        return client.getStats();
    }
}
