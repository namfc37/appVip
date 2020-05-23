package model;

import model.key.InfoKeyData;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class MapUserName
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.MAP_USER_NAME;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String deviceId)
    {
        return INFO_KEY.keyName(deviceId.toLowerCase());
    }

    public static boolean set (String username, int userId)
    {
        return db().set(keyName(username), Integer.toString(userId));
    }

    public static int get (String username)
    {
        return Common.stringToInt(db().get(keyName(username)), -1);
    }
}
