package model.key;

import bitzero.util.config.bean.ConstantMercury;
import util.pool.PoolStringBuilder;

import java.util.*;

public abstract class AbstractInfoKey
{
    public final static char   SEPARATOR = '_';
    public final static String PREFIX    = ConstantMercury.PREFIX_SNSGAME_GENERAL;

    protected static final PoolStringBuilder pool      = new PoolStringBuilder(64);
    protected final static Set<String>       setSuffix = new HashSet<>();

    public final static EnumMap<BUCKET, List<AbstractInfoKey>> mapBucket = new EnumMap<>(BUCKET.class);

    public enum BUCKET
    {
        CACHE,
        INDEX,
        USER;
    }

    protected String suffix;
    protected BUCKET bucket;
    protected int    expire;

    public AbstractInfoKey (String suffix, BUCKET bucket, int expire)
    {
        this.suffix = suffix;
        this.bucket = bucket;
        this.expire = expire;

        if (!setSuffix.add(suffix))
            throw new RuntimeException("Duplicate suffix: " + suffix);
        if (bucket == null)
            throw new RuntimeException("Null bucket");

        mapBucket.computeIfAbsent(bucket, k -> new ArrayList<>()).add(this);
    }

    public String getSuffix ()
    {
        return suffix;
    }

    public BUCKET getBucket ()
    {
        return bucket;
    }

    public int expire ()
    {
        return expire;
    }
}