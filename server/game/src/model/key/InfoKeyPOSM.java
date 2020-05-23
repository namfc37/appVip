package model.key;

import util.Time;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;

public class InfoKeyPOSM extends AbstractInfoKey
{
    public final static EnumMap<BUCKET, List<InfoKeyPOSM>> mapBucket = new EnumMap<>(BUCKET.class);

    public final static InfoKeyPOSM POSM_USER_INFO       = new InfoKeyPOSM("POSM_",     BUCKET.INDEX, Time.SECOND_IN_30_DAY);


    public InfoKeyPOSM(String suffix, BUCKET bucket, int expire)
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

    public String keyName (String eventID, Object timeStart)
    {
        StringBuilder sb = pool.get()
                .append(suffix)
                .append(eventID).append(SEPARATOR)
                .append(timeStart);
        String keyName = sb.toString();
        pool.add(sb);
        return keyName;
    }
}
