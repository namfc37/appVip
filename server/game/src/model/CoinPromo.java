package model;

import model.key.InfoKeyUser;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class CoinPromo
{
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.BILLING_COIN_PROMO;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public static boolean add (int userId, long value)
    {
        return db().add(keyName(userId), Long.toString(value));
    }

    public static boolean delete (int userId)
    {
        return db().delete(keyName(userId));
    }

    public static long get (int userId)
    {
        return Common.stringToLong(db().get(keyName(userId)), 0);
    }
}
