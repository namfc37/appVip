package model.key;

import util.Database;
import util.Time;
import util.memcached.AbstractDbKeyValue;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;

public class InfoKeyData extends AbstractInfoKey
{
    public final static EnumMap<BUCKET, List<InfoKeyData>> mapBucket = new EnumMap<>(BUCKET.class);

    public final static InfoKeyData ADMIN_TRANSACTION = new InfoKeyData("adminTransaction", BUCKET.CACHE, Time.SECOND_IN_30_DAY);

    public final static InfoKeyData SYSTEM_MONITOR = new InfoKeyData("sysMonitor", BUCKET.INDEX, 0);

    public final static InfoKeyData NEWS_BOARD_PRIVATE_SHOP = new InfoKeyData("nbPrivateShop", BUCKET.INDEX, Time.SECOND_IN_7_DAY);
    public final static InfoKeyData NEWS_BOARD_AIR_SHIP     = new InfoKeyData("nbAirShip", BUCKET.INDEX, Time.SECOND_IN_7_DAY);
    public final static InfoKeyData GUILD_CACHE             = new InfoKeyData("guildCache", BUCKET.INDEX, Time.SECOND_IN_7_DAY);
    public final static InfoKeyData FRIEND_CACHE            = new InfoKeyData("frCache", BUCKET.INDEX, Time.SECOND_IN_7_DAY);

    public final static InfoKeyData DROP_LIMIT_ITEM = new InfoKeyData("limitItem", BUCKET.INDEX, 0);

    public final static InfoKeyData MONITOR_DAILY  = new InfoKeyData("monitorDaily", BUCKET.INDEX, 0);
    public final static InfoKeyData MONITOR_HOURLY = new InfoKeyData("monitorHourly", BUCKET.CACHE, Time.SECOND_IN_30_DAY);

    public final static InfoKeyData GIFTCODE_USED   = new InfoKeyData("gcUsed", BUCKET.INDEX, 0);
    public final static InfoKeyData GIFTCODE_SINGLE = new InfoKeyData("gcSingle", BUCKET.INDEX, 3 * Time.SECOND_IN_30_DAY);

    public final static InfoKeyData RANKING_TOP_DAILY  = new InfoKeyData("rTopDaily", BUCKET.INDEX, 3 * Time.SECOND_IN_30_DAY);
    public final static InfoKeyData RANKING_ADD_REWARD = new InfoKeyData("rAddReward", BUCKET.INDEX, 3 * Time.SECOND_IN_30_DAY);

    public final static InfoKeyData CONVERT_OLD_USER = new InfoKeyData("cvOldUser", BUCKET.CACHE, 3 * Time.SECOND_IN_30_DAY);

    public final static InfoKeyData CHAT_HISTORY = new InfoKeyData("chatHistory", BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    public final static InfoKeyData GUILD_DERBY_LOCK_START  = new InfoKeyData("gdLockStart", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyData GUILD_DERBY_LOCK_END    = new InfoKeyData("gdLockEndA", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyData GUILD_DERBY_LOCK_REWARD = new InfoKeyData("gdLockRewardA", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyData GUILD_DERBY_LEAGUE_TOP  = new InfoKeyData("gdLeagueTop", BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    public final static InfoKeyData LOCK_ACTION = new InfoKeyData("lockAction", BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    //Key dùng convert data phiên bản cũ
    public final static InfoKeyData MAP_FACEBOOK_ID = new InfoKeyData("mFacebookId", BUCKET.INDEX, 0);
    public final static InfoKeyData MAP_OLD_USER_ID = new InfoKeyData("mOldUserId", BUCKET.INDEX, 0);

    //DO NOT EDIT! Key share với Billing
    public final static InfoKeyData MAP_USER_NAME       = new InfoKeyData("mUsername", BUCKET.INDEX, 0);
    public final static InfoKeyData BILLING_TRANSACTION = new InfoKeyData("bTransaction", BUCKET.INDEX, -1);
    public final static InfoKeyData GOOGLE_TRANSACTION  = new InfoKeyData("gTransaction", BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    //Key dùng cho bản test không có portal
    public final static InfoKeyData MAP_DEVICE_ID = new InfoKeyData("mDeviceId", BUCKET.INDEX, 0);
    
    //Key dùng cho tính năng nạp tính lũy
    public final static InfoKeyData ACCUMULATE_STORE = new InfoKeyData("accumulate_store", BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    public InfoKeyData (String suffix, BUCKET bucket, int expire)
    {
        super(suffix, bucket, expire);
        mapBucket.computeIfAbsent(bucket, k -> new ArrayList<>()).add(this);
    }

    public String keyName (Object id)
    {
        StringBuilder sb = pool.get()
                               .append(PREFIX)
                               .append(id).append(SEPARATOR)
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
}
