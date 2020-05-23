package model.ranking;

import model.key.InfoKeyData;
import util.memcached.AbstractDbKeyValue;

public class RankingAddReward
{
    private final static InfoKeyData INFO_KEY = InfoKeyData.RANKING_ADD_REWARD;

    public static int expire ()
    {
        return INFO_KEY.expire();
    }

    private static AbstractDbKeyValue db ()
    {
        return INFO_KEY.db();
    }

    private static String keyName (String key, int rank)
    {
        return INFO_KEY.keyName(key + INFO_KEY.SEPARATOR + rank);
    }

    public static boolean add (String key, int rank, int userId)
    {
        return db().add(keyName(key, rank), Integer.toString(userId), expire());
    }

    public static boolean delete (String key, int rank)
    {
        return db().delete(keyName(key, rank));
    }

    public static String get (String key, int rank)
    {
        return (String) db().get(keyName(key, rank));
    }
}
