package service.newsboard;

import data.KeyDefine;
import util.serialize.Encoder;

public class NewsBoardItem extends Encoder.IObject implements KeyDefine
{
    int    userId;
    String userName;
    String avatar;
    int    idSlot;
    String item;
    int    num;
    int    gold;
    int    exp;
    int    timeAd;
    String bucket;

    public NewsBoardItem (int userId,
                          String displayName,
                          String avatar,
                          String userBucket,
                          int idSlot,
                          String item,
                          int num,
                          int gold,
                          int exp,
                          int timeAd)
    {
        this.userId = userId;
        this.userName = displayName;
        this.avatar = avatar;
        this.bucket = userBucket;
        this.idSlot = idSlot;
        this.item = item;
        this.num = num;
        this.gold = gold;
        this.exp = exp;
        this.timeAd = timeAd;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(NB_SLOT_USER_ID, userId);
        msg.put(NB_SLOT_USER_NAME, userName);
        msg.put(NB_SLOT_USER_AVATAR, avatar);
        msg.put(NB_SLOT_ID, idSlot);
        msg.put(NB_SLOT_ITEM, item);
        msg.put(NB_SLOT_NUM, num);
        msg.put(NB_SLOT_GOLD, gold);
        msg.put(NB_SLOT_EXP, exp);
        msg.put(NB_SLOT_TIME_AD, timeAd);
        msg.put(NB_SLOT_USER_BUCKET, bucket);
    }

    public int getUserId ()
    {
        return userId;
    }

    public int getIdSlot ()
    {
        return idSlot;
    }

    long getUid ()
    {
        return NewsBoardServer.getUid(userId, idSlot);
    }

    public String getBucket ()
    {
        return bucket;
    }
}
