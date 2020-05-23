package model;

import model.key.InfoKeyData;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class MapDeviceId
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.MAP_DEVICE_ID;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String deviceId)
    {
        return INFO_KEY.keyName(deviceId);
    }

    public static boolean set (String deviceId, int userId)
    {
        return db().set(keyName(deviceId), Integer.toString(userId));
    }

    public static int get (String deviceId)
    {
        return Common.stringToInt(db().get(keyName(deviceId)), -1);
    }

    public static boolean delete (String deviceId)
    {
        return db().delete(keyName(deviceId));
    }
}
