package service.friend;

import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import model.object.RankingPR;
import util.Time;
import util.serialize.Encoder;

public class FriendInfo extends Encoder.IObject implements KeyDefine
{
    private int    id;
    private String name;
    private String avatar;
    private int    level;
    private int    time;
    private String bucket;

    public  int[]  rankingData;
    public  int[]  rankingExpire;
    private String vipType;
    private int    vipExpire;

    public FriendInfo (int id, String name, String avatar, int level, String bucket, RankingPR pr, String vip, int vipExpire)
    {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.level = level;
        this.bucket = bucket;
        this.time = Time.getUnixTime();
        this.vipType = vip;
        this.vipExpire = vipExpire;

        if (pr == null)
            RankingPR.toFriendRanking(this, level);
        else
            pr.toFriendRanking(this);
    }

    public void update (int curTime)
    {
        if (rankingData != null && rankingData != null)
        {
            for (int i = 0, len = Math.min(rankingData.length, rankingExpire.length); i < len; i++)
            {
                //expire data xếp hạn
                if (rankingExpire[i] > 0 && rankingExpire[i] < curTime)
                {
                    rankingData[i] = 0;
                    rankingExpire[i] = 0;
                }
            }
        }
        if (vipExpire > 0 && curTime >= vipExpire)
            resetVip();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(FRIEND_ID, id);
        msg.put(FRIEND_NAME, name);
        msg.put(FRIEND_AVATAR, avatar);
        msg.put(FRIEND_LEVEL, level);
        msg.put(FRIEND_BUCKET, bucket);

        if (MiscInfo.RANKING_BOARD_ACTIVE())
            msg.put(FRIEND_RANKING_PR, rankingData);

        msg.put(FRIEND_VIP, vipType);
    }

    public int getId ()
    {
        return id;
    }

    public String getName ()
    {
        return name;
    }

    public String getAvatar ()
    {
        return avatar;
    }

    public int getLevel ()
    {
        return level;
    }

    public int getTime ()
    {
        return time;
    }

    public void mergeFrom (FriendInfo newInfo)
    {
        if (newInfo == null)
            return;
        if (time == newInfo.time)
            return;
        name = newInfo.name;
        avatar = newInfo.avatar;
        level = newInfo.level;
        time = newInfo.time;
        bucket = newInfo.bucket;

        if (newInfo.vipType == null || newInfo.vipType.isEmpty())
        {
            resetVip();
        }
        else
        {
            vipType = newInfo.vipType;
            vipExpire = newInfo.vipExpire;
        }

        rankingData = newInfo.rankingData;
        rankingExpire = newInfo.rankingExpire;

        if (rankingExpire == null)
            RankingPR.toFriendRanking(this, level);
    }

    public String getVip ()
    {
        return vipType;
    }

    private void resetVip ()
    {
        vipType = MiscDefine.VIP_INACTIVE;
        vipExpire = 0;
    }

    public String getBucket ()
    {
        return bucket;
    }

}
