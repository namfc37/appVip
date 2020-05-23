package model;

import model.key.InfoKeyFixed;
import util.Common;
import util.memcached.AbstractDbKeyValue;

public class NumConvert
{
    private final static InfoKeyFixed INFO_KEY = InfoKeyFixed.NUM_CONVERT;

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName ()
    {
        return INFO_KEY.keyName();
    }

    public static boolean add ()
    {
        return db().add(keyName(), "0");
    }

    public static long get ()
    {
        return Common.stringToLong(db().get(keyName()), -1);
    }

    public static long increment ()
    {
        return db().increment(keyName(), 1);
    }
}
