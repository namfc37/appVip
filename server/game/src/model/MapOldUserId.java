package model;

import model.key.InfoKeyData;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class MapOldUserId
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.MAP_OLD_USER_ID;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int oldUserId)
    {
        return INFO_KEY.keyName(oldUserId);
    }

    public static boolean set (int oldUserId, int userId)
    {
        return db().set(keyName(oldUserId), Integer.toString(userId));
    }

    public static int get (int oldUserId)
    {
        return Common.stringToInt(db().get(keyName(oldUserId)), -1);
    }
}
