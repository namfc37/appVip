package model.key;

import util.Database;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.BucketManager;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;

public class InfoKeyUser extends AbstractInfoKey
{
    public final static EnumMap<BUCKET, List<InfoKeyUser>> mapBucket = new EnumMap<>(BUCKET.class);

    public final static InfoKeyUser ONLINE = new InfoKeyUser("uOnline", BUCKET.CACHE, 0);

    public final static InfoKeyUser BRIEF = new InfoKeyUser("uBrief", BUCKET.INDEX, 0);
    public final static InfoKeyUser BAN   = new InfoKeyUser("uBan", BUCKET.INDEX, -1);

    public final static InfoKeyUser GAME         = new InfoKeyUser("uGame", BUCKET.USER, 0);
    public final static InfoKeyUser PRIVATE_SHOP = new InfoKeyUser("uPrivateShop", BUCKET.USER, 0);
    public final static InfoKeyUser AIR_SHIP     = new InfoKeyUser("uAirShip", BUCKET.USER, 0);
    public final static InfoKeyUser MAIL_BOX     = new InfoKeyUser("uMailbox", BUCKET.USER, Time.SECOND_IN_30_DAY);
    public final static InfoKeyUser FRIEND_LIST  = new InfoKeyUser("uFriend", BUCKET.USER, 0);
    public final static InfoKeyUser INTERACTIVE  = new InfoKeyUser("uInter", BUCKET.USER, Time.SECOND_IN_30_DAY);
    public final static InfoKeyUser GUILD        = new InfoKeyUser("uGuild", BUCKET.USER, 0);

    //DO NOT USE OR EDIT! Key do framework quản lý.
    public final static InfoKeyUser FRAMEWORK_ONLINE = new InfoKeyUser("online", BUCKET.INDEX, 0);
    public final static InfoKeyUser FRAMEWORK_COIN   = new InfoKeyUser("xu", BUCKET.INDEX, 0);

    //DO NOT EDIT! Key share với Billing
    public final static InfoKeyUser BILLING_COIN_CASH  = new InfoKeyUser("bCoinCash", BUCKET.INDEX, 0);
    public final static InfoKeyUser BILLING_COIN_PROMO = new InfoKeyUser("bCoinPromo", BUCKET.INDEX, 0);
    public final static InfoKeyUser BILLING_PROCESSING = new InfoKeyUser("bProcessing", BUCKET.INDEX, 0);

    public InfoKeyUser (String suffix, BUCKET bucket, int expire)
    {
        super(suffix, bucket, expire);
        mapBucket.computeIfAbsent(bucket, k -> new ArrayList<>()).add(this);
    }

    public String keyName (int userId)
    {
        StringBuilder sb = pool.get()
                               .append(PREFIX)
                               .append(userId).append(SEPARATOR)
                               .append(suffix);
        String keyName = sb.toString();
        pool.add(sb);
        return keyName;
    }

    public AbstractDbKeyValue db ()
    {
        if (bucket == BUCKET.INDEX)
            return Database.index();
        if (bucket == BUCKET.CACHE)
            return Database.cache();
        return null;
    }

    public AbstractDbKeyValue db (String bucketId)
    {
        if (bucket == BUCKET.USER)
            return BucketManager.get(bucketId);
        return null;
    }
}
