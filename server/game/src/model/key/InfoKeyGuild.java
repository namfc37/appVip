package model.key;

import util.Time;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;

public class InfoKeyGuild extends AbstractInfoKey
{
    public final static EnumMap<BUCKET, List<InfoKeyGuild>> mapBucket = new EnumMap<>(BUCKET.class);

    public final static InfoKeyGuild IDS       = new InfoKeyGuild("gIds",     BUCKET.INDEX, 0);
    public final static InfoKeyGuild INFO      = new InfoKeyGuild("gInfo",    BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild INFO_LOCK = new InfoKeyGuild("giLock",   BUCKET.INDEX, 30); //30s
    public final static InfoKeyGuild MEMBER    = new InfoKeyGuild("gMembers", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild WAITING   = new InfoKeyGuild("gWaiting", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DONATES   = new InfoKeyGuild("gDonates", BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild GUESTS    = new InfoKeyGuild("gGuests",  BUCKET.INDEX, Time.SECOND_IN_30_DAY);

    public final static InfoKeyGuild DERBY                = new InfoKeyGuild("gDerby",          BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DERBY_TASK           = new InfoKeyGuild("gdTask",          BUCKET.INDEX, Time.SECOND_IN_30_DAY);
	public final static InfoKeyGuild DERBY_TASK_LOCK      = new InfoKeyGuild("gdTaskLock",      BUCKET.INDEX, 30); //30s
	public final static InfoKeyGuild DERBY_TASK_DOING     = new InfoKeyGuild("gdTaskDoing",     BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DERBY_TASK_OLD       = new InfoKeyGuild("gdTaskOld",       BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DERBY_MEMBER         = new InfoKeyGuild("gdMembers",       BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DERBY_GROUP_RANKING  = new InfoKeyGuild("gdGroupRanking",  BUCKET.INDEX, Time.SECOND_IN_30_DAY);
    public final static InfoKeyGuild DERBY_LEAGUE_RANKING = new InfoKeyGuild("gdLeagueRanking", BUCKET.INDEX, 3 * Time.SECOND_IN_30_DAY);

    public InfoKeyGuild (String suffix, BUCKET bucket, int expire)
    {
        super(suffix, bucket, expire);
        mapBucket.computeIfAbsent(bucket, k -> new ArrayList<>()).add(this);
    }

    public String keyName ()
    {
        StringBuilder sb = pool.get()
                               .append(PREFIX)
                               .append(SEPARATOR)
                               .append(suffix);
        String keyName = sb.toString();
        pool.add(sb);
        return keyName;
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
}
