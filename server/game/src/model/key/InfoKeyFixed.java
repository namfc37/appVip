package model.key;

import util.Database;
import util.memcached.AbstractDbKeyValue;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;

public class InfoKeyFixed extends AbstractInfoKey
{
    public final static EnumMap<BUCKET, List<InfoKeyFixed>> mapBucket = new EnumMap<>(BUCKET.class);

    public final static InfoKeyFixed NUM_REGISTER = new InfoKeyFixed("NUM_REGISTER", BUCKET.INDEX, 0);
    public final static InfoKeyFixed NUM_USER     = new InfoKeyFixed("NUM_USER", BUCKET.INDEX, 0);
    public final static InfoKeyFixed MAIL_MANAGER = new InfoKeyFixed("MAIL_MANAGER", BUCKET.INDEX, 0);
    public final static InfoKeyFixed BALANCE_INFO = new InfoKeyFixed("BALANCE_INFO", BUCKET.INDEX, 0);

    //Key dùng convert data phiên bản cũ
    public final static InfoKeyFixed NUM_CONVERT = new InfoKeyFixed("NUM_CONVERT", BUCKET.INDEX, 0);

    public InfoKeyFixed (String suffix, BUCKET bucket, int expire)
    {
        super(suffix, bucket, expire);
        mapBucket.computeIfAbsent(bucket, k -> new ArrayList<>()).add(this);
    }

    public String keyName ()
    {
        StringBuilder sb = pool.get()
                               .append(PREFIX)
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
