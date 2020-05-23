package model;

import model.key.InfoKeyData;
import util.memcached.AbstractDbKeyValue;

public class ConvertOldUser
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.CONVERT_OLD_USER;

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

    public static boolean add (String facebookId, int userId)
    {
        return db().add(keyName(facebookId), Integer.toString(userId), expire());
    }

    public static boolean delete (String facebookId)
    {
        return db().delete(keyName(facebookId));
    }
}
