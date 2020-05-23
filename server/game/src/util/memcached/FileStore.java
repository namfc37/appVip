package util.memcached;

import net.spy.memcached.CASValue;
import util.Time;

import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;

public class FileStore extends AbstractDbKeyValue
{
    private static final String EXTENSION_EXPIRE    = ".expire";
    private static final String EXTENSION_CAS       = ".cas";
    private static final String EXTENSION_IS_STRING = ".string";

    private static final Object lock = new Object();

    private             String           folder;
    public static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss dd-MM-yyyy");

    public FileStore (String id, boolean isBucketUser, String folder)
    {
        super(id, isBucketUser);
        try
        {
            if (!folder.endsWith("/"))
            {
                folder += "/";
            }
            this.folder = folder;

            Path path = Paths.get(folder);

            if (!Files.isDirectory(path))
            {
                Files.createDirectories(path);
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    @Override
    public void disconnect ()
    {
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
        expiration = modifyExpiration(expiration);

        if ((expiration != 0) && (expiration <= System.currentTimeMillis() / 1000))
        {
            delete(key);
        }
        else
        {
            try
            {
                if (expiration != 0)
                {
                    Files.write(Paths.get(getKeyPath(key + EXTENSION_EXPIRE)), dateFormat.format(new Date(expiration * 1000L)).getBytes());
                    Files.setAttribute(Paths.get(getKeyPath(key + EXTENSION_EXPIRE)), "dos:hidden", true);
                }
                return saveFile(getKeyPath(key), value);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        }
        return false;
    }

    @Override
    public boolean asyncSet (String key, Object value)
    {
        return set(key, value);
    }

    @Override
    public boolean asyncSet (String key, Object value, int expiration)
    {
        return set(key, value, expiration);
    }

    public static boolean saveFile (String path, Object value) throws Exception
    {
        if (value instanceof Number)
        {
            value = value.toString();
        }
        if (value instanceof byte[])
        {
            Files.write(Paths.get(path), (byte[]) value);
            return true;
        }
        if (value instanceof String)
        {
            Files.write(Paths.get(path), ((String) value).getBytes("UTF-8"));
            Files.write(Paths.get(path + EXTENSION_IS_STRING), new byte[0]);
            Files.setAttribute(Paths.get(path + EXTENSION_IS_STRING), "dos:hidden", true);
            return true;
        }
        throw new Exception("Not support this type: " + value.getClass().getName());
    }

    @Override
    public Object get (String key)
    {
        synchronized (lock)
        {
            try
            {
                int expiration;
                Path p = Paths.get(getKeyPath(key + EXTENSION_EXPIRE));
                if (Files.isRegularFile(p))
                {
                    String str = new String(Files.readAllBytes(p));
                    if (str.length() > 0)
                    {
                        expiration = (int) (dateFormat.parse(str).getTime() / 1000);
                        if ((expiration != 0) && (expiration <= System.currentTimeMillis() / 1000))
                        {
                            delete(key);
                            return null;
                        }
                    }
                }

                p = Paths.get(getKeyPath(key));
                if (Files.isRegularFile(p))
                {
                    byte[] data = Files.readAllBytes(p);
                    return Files.isRegularFile(Paths.get(getKeyPath(key + EXTENSION_IS_STRING)))
                            ? new String(data, "UTF-8")
                            : data;
                }
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
            return null;
        }
    }

    @Override
    public CASValue<Object> gets (String key)
    {
        synchronized (lock)
        {
            long cas;
            Object value;
            try
            {
                cas = new Random().nextLong();
                value = get(key);
                Files.write(Paths.get(getKeyPath(key + EXTENSION_CAS)), ("" + cas).getBytes());
                Files.setAttribute(Paths.get(getKeyPath(key + EXTENSION_CAS)), "dos:hidden", true);
                return new CASValue<>(cas, value);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
            return null;
        }
    }

    @Override
    public boolean cas (String key, long cas, Object value)
    {
        return cas(key, cas, value, 0);
    }

    @Override
    public boolean cas (String key, long cas, Object value, int expiration)
    {
        try
        {
            if (("" + cas).equals(new String(Files.readAllBytes(Paths.get(getKeyPath(key + EXTENSION_CAS))))))
            {
                Files.deleteIfExists(Paths.get(getKeyPath(key + EXTENSION_CAS)));
                set(key, value, expiration);
                return true;
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public Map<String, Object> getMulti (Collection<String> keys)
    {
        HashMap<String, Object> map = new HashMap<>();
        for (String key : keys)
        {
            map.put(key, get(key));
        }
        return map;
    }

    @Override
    public boolean delete (String key)
    {
        try
        {
            Files.deleteIfExists(Paths.get(getKeyPath(key + EXTENSION_CAS)));
            Files.deleteIfExists(Paths.get(getKeyPath(key + EXTENSION_EXPIRE)));
            Files.deleteIfExists(Paths.get(getKeyPath(key + EXTENSION_IS_STRING)));
            return Files.deleteIfExists(Paths.get(getKeyPath(key)));
        }
        catch (Exception e)
        {
            e.printStackTrace();
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
        if (get(key) == null)
        {
            return set(key, value, expiration);
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
        if (get(key) != null)
        {
            return set(key, value, expiration);
        }
        return false;
    }

    @Override
    public void asyncDecr (String key, long offset)
    {
        decrement(key, offset);
    }

    @Override
    public void asyncIncr (String key, long offset)
    {
        increment(key, offset);
    }

    @Override
    public long decrement (String key, long offset)
    {
        return increment(key, -offset);
    }

    @Override
    public long decrement (String key, long offset, long initialValue)
    {
        return increment(key, -offset, initialValue);
    }

    @Override
    public long decrement (String key, long offset, long initialValue, int expiration)
    {
        return increment(key, -offset, initialValue, expiration);
    }

    @Override
    public long increment (String key, long offset)
    {
        return incr(key, offset, false, 0);
    }

    @Override
    public long increment (String key, long offset, long initialValue)
    {
        return incr(key, offset, initialValue, 0);
    }

    @Override
    public long increment (String key, long offset, long initialValue, int expiration)
    {
        return incr(key, offset, initialValue, expiration);
    }

    public long incr (String key, long offset, Object initialValue, int expiration)
    {
        Object o = get(key);
        long value;
        boolean hasInitialValue = (initialValue instanceof Long);
        boolean isSuccess = true;

        if (o == null)
        {
            if (hasInitialValue)
            {
                value = (Long) initialValue;
            }
            else
            {
                value = -1;
                isSuccess = false;
                System.out.println("!!!ERROR!!! FileStore can not increment / decrement not exist key");
            }
        }
        else
        {
            value = Long.parseLong((String) o);
            value += offset;
        }

        if (isSuccess && (set(key, "" + value, expiration) == false))
        {
            value = -1;
            System.out.println("!!!ERROR!!! FileStore can not increment / decrement expired key");
        }

        return value;
    }

    private String getKeyPath (String key)
    {
        return folder + key;
    }

    @Override
    public boolean append (String key, String value, long cas)
    {
        byte[] data = (byte[]) get(key);
        if (data != null)
        {
            String str = new String(data) + value;
            set(key, str);
            return true;
        }
        return false;
    }

    @Override
    public boolean touch (String key, int expiration)
    {
        return set(key, get(key), expiration);
    }

    @Override
    public void asyncTouch (String key, int expiration)
    {
        set(key, get(key), expiration);
    }

    private final static Map<SocketAddress, Map<String, String>> STATS;

    static
    {
        Map<String, String> info = new HashMap<>();
        info.put("time", Long.toString(Time.getUnixTime()));

        info.put("curr_items", "1");
        info.put("bytes", "1");

        info.put("cmd_get", "0");
        info.put("cmd_set", "0");
        info.put("delete_hits", "0");
        info.put("incr_hits", "0");
        info.put("decr_hits", "0");
        info.put("cas_hits", "0");

        info.put("ep_max_size", "48000000000");

        STATS = new HashMap<>();
        STATS.put(new InetSocketAddress("127.0.0.1", 11211), info);
    }

    @Override
    public Map<SocketAddress, Map<String, String>> getStats ()
    {
        return STATS;
    }
}
