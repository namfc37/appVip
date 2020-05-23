package model;

import model.key.InfoKeyData;
import util.Common;
import util.Time;
import util.memcached.AbstractDbKeyValue;

public class GiftCodeSingle
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.GIFTCODE_SINGLE;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String id)
    {
        return INFO_KEY.keyName(id);
    }

    public static boolean add (String id)
    {
        return db().add(keyName(id), Integer.toString(Time.getUnixTime()), INFO_KEY.expire());
    }

    public static long get (String id)
    {
        return Common.stringToLong(db().get(keyName(id)), -1);
    }

    public static boolean delete (String id)
    {
        return db().delete(keyName(id));
    }
}
