package model.guild;

import model.key.InfoKeyData;
import util.Common;
import util.Time;

public class GuildDerbyLockStart
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.GUILD_DERBY_LOCK_START;

    private static String keyName (int timeStart)
    {
        return INFO_KEY.keyName(timeStart);
    }

    public static boolean add (int timeStart)
    {
        return INFO_KEY.db().add(keyName(timeStart), Integer.toString(Time.getUnixTime()), INFO_KEY.expire());
    }

    public static long get (int timeStart)
    {
        return Common.stringToLong(INFO_KEY.db().get(keyName(timeStart)), -1);
    }

    public static boolean delete (int timeStart)
    {
        return INFO_KEY.db().delete(keyName(timeStart));
    }
}
