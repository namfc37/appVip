package model;

import model.key.InfoKeyData;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class GiftCodeUsed
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.GIFTCODE_USED;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String id)
    {
        return INFO_KEY.keyName(id);
    }

    public static long get (String id)
    {
        return Common.stringToLong(db().get(keyName(id)), -1);
    }

    public static long increment (String id)
    {
        return db().increment(keyName(id), 1, 0);
    }
}
