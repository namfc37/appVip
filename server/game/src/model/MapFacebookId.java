package model;

import model.key.InfoKeyData;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class MapFacebookId
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.MAP_FACEBOOK_ID;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String facebookId)
    {
        return INFO_KEY.keyName(facebookId);
    }

    public static boolean set (String facebookId, int userId)
    {
        return db().set(keyName(facebookId), Integer.toString(userId));
    }

    public static int get (String facebookId)
    {
        return Common.stringToInt(db().get(keyName(facebookId)), -1);
    }
}
