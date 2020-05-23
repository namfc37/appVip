package model;

import model.key.InfoKeyUser;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class CoinFramework
{
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.FRAMEWORK_COIN;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public static long get (int userId)
    {
        return Common.stringToLong(db().get(keyName(userId)), 0);
    }
}
