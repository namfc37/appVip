package util;

import model.NumConvert;
import model.NumRegister;
import model.NumUser;
import model.mail.MailManager;
import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;
import util.redis.Redis;
import util.redis.RedisManager;

public class Database
{
    public static final String INDEX = "index";
    public static final String CACHE = "cache";
    public static final String USER  = "user_";

    public static final String RANKING = "ranking";

    private static AbstractDbKeyValue BUCKET_INDEX;
    private static AbstractDbKeyValue BUCKET_CACHE;

    public static void init (boolean userInitKey)
    {
        BUCKET_INDEX = BucketManager.get(INDEX);
        BUCKET_CACHE = BucketManager.get(CACHE);

        if (userInitKey)
        {
            NumRegister.add();
            NumUser.add();
            NumConvert.add();
            MailManager.add();
        }
    }

    public static AbstractDbKeyValue index ()
    {
        return BUCKET_INDEX;
    }

    public static AbstractDbKeyValue cache ()
    {
        return BUCKET_CACHE;
    }

    public static AbstractDbKeyValue user (int id)
    {
        return BucketManager.get(USER + id);
    }

    public static Redis ranking ()
    {
        return RedisManager.getRedis(RANKING);
    }
}
