package model;

import model.key.InfoKeyData;
import util.memcached.AbstractDbKeyValue;

public class LockAction
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.LOCK_ACTION;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String id)
    {
        return INFO_KEY.keyName(id);
    }

    public static int expire ()
    {
        return INFO_KEY.expire();
    }

    public static boolean lock (String id, String data)
    {
        return db().add(keyName(id), data, expire());
    }

    public static boolean unlock (String id)
    {
        return db().delete(keyName(id));
    }

    public static boolean exist (String id)
    {
        return db().get(keyName(id)) != null;
    }
}
