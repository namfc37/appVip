package util.memcached;

import net.spy.memcached.CASValue;

import java.net.SocketAddress;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.Map;

public abstract class AbstractDbKeyValue
{
    protected final String  id;
    protected final boolean isBucketUser;

    protected AbstractDbKeyValue (String id, boolean isBucketUser)
    {
        this.id = id;
        this.isBucketUser = isBucketUser;
    }

    final static int NO_EXPIRATION = 0;

    private final static int MIN_EXPIRATION = (int) ((new GregorianCalendar(2000, 1 - 1, 1)).getTimeInMillis() / 1000);

    public abstract void disconnect ();

    public String getId ()
    {
        return id;
    }

    public boolean isBucketUser ()
    {
        return isBucketUser;
    }

    public abstract boolean set (String key, Object value);

    public abstract boolean set (String key, Object value, int expiration);

    public abstract boolean asyncSet (String key, Object value);

    public abstract boolean asyncSet (String key, Object value, int expiration);

    public abstract boolean cas (String key, long cas, Object value);

    public abstract boolean cas (String key, long cas, Object value, int expiration);

    public abstract Object get (String key);

    public abstract CASValue<Object> gets (String key);

    public abstract Map<String, Object> getMulti (Collection<String> keys);

    public abstract boolean delete (String key);

    public abstract boolean add (String key, Object value);

    public abstract boolean add (String key, Object value, int expiration);

    public abstract boolean replace (String key, Object value);

    public abstract boolean replace (String key, Object value, int expiration);

    public abstract boolean append (String key, String value, long cas);

    public abstract void asyncDecr (String key, long offset);

    public abstract long decrement (String key, long offset);

    public abstract long decrement (String key, long offset, long initialValue);

    public abstract long decrement (String key, long offset, long initialValue, int expiration);

    public abstract void asyncIncr (String key, long offset);

    public abstract long increment (String key, long offset);

    public abstract long increment (String key, long offset, long initialValue);

    public abstract long increment (String key, long offset, long initialValue, int expiration);

    public abstract boolean touch (String key, int expiration);

    public abstract void asyncTouch (String key, int expiration);

    public abstract Map<SocketAddress, Map<String, String>> getStats ();

    public static int modifyExpiration (int expiration)
    {
        if (expiration <= NO_EXPIRATION)
            return NO_EXPIRATION;
        if (expiration <= MIN_EXPIRATION)
            return expiration + (int) (System.currentTimeMillis() / 1000);
        return expiration;
    }
}
