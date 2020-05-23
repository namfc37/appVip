package model;

import data.*;
import data.festival.Event02Info;
import extension.EnvConfig;
import model.key.InfoKeyUser;
import model.object.Festival;
import net.spy.memcached.CASValue;
import service.UdpHandler;
import service.newsboard.NewsBoardItem;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class PrivateShop extends Encoder.IObject implements KeyDefine
{
    private transient int userId;

    private byte   numFriendSlot;
    private byte   numBuySlot;
    private int    timeAd;         //thời gian quảng cáo trước
    private Slot[] slots;

    private PrivateShop ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static PrivateShop create (int userId)
    {
        PrivateShop o = new PrivateShop();
        o.userId = userId;
        o.slots = new Slot[MiscInfo.PS_NUM_FREE_SLOT()];
        o.init();
        return o;
    }

    public static class Slot extends Encoder.IObject
    {
        private String  item;
        private int     num;
        private int     price;
        private boolean isSold;
        private int     timePut;
        private int     timeAd;
        private int     buyerId;
        private String  buyerAvatar;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(PS_SLOT_ITEM, item);
            msg.put(PS_SLOT_NUM, num);
            msg.put(PS_SLOT_PRICE, price);
            msg.put(PS_SLOT_IS_SOLD, isSold);
            msg.put(PS_SLOT_TIME_AD, timeAd);
            msg.put(PS_SLOT_BUYER_ID, buyerId);
            msg.put(PS_SLOT_BUYER_AVATAR, buyerAvatar);
        }

        public String getItem ()
        {
            return item;
        }

        public int getNum ()
        {
            return num;
        }

        public int getPrice ()
        {
            return price;
        }

        public boolean isSold ()
        {
            return isSold;
        }

        public void setSold (int buyerId, String buyerAvatar)
        {
            isSold = true;
            this.buyerId = buyerId;
            this.buyerAvatar = buyerAvatar;
        }
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(PS_NUM_FRIEND_SLOT, numFriendSlot);
        msg.put(PS_NUM_BUY_SLOT, numBuySlot);
        msg.put(PS_SLOTS, slots);
        msg.put(PS_TIME_AD, timeAd);
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.PRIVATE_SHOP;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static PrivateShop decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                PrivateShop obj = Json.fromJson((String) raw, PrivateShop.class);
                obj.userId = userId;
                obj.init();
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static boolean set (String bucketId, int userId, PrivateShop object)
    {
        return db(bucketId).set(keyName(userId), object.encode());
    }

    public static PrivateShop get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static PrivateShop get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    public static CasValue<PrivateShop> gets (String bucketId, int userId)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (String bucketId, int userId, long cas, PrivateShop object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode());
    }

    //-----------------------------------------------------------------------

    public void init ()
    {
        if (Time.getUnixTime() > ConstInfo.getFestival().getEvent02().UNIX_END_TIME())
        handleEventItemsExpired(ItemId.EVENT_2);
    }

    private void handleEventItemsExpired(String eventType)
    {
        List<String> itemIdsExpired = UserGame.getItemIdsExpired(eventType);
        for (Slot slot : slots)
        {
            if (slot != null && itemIdsExpired.contains(slot.getItem()))
            {
                slot.isSold = true;
            }
        }
    }

    public boolean hasSlot (int idSlot)
    {
        return idSlot >= 0 && idSlot < slots.length;
    }

    public boolean isEmptySlot (int idSlot)
    {
        return slots[idSlot] == null;
    }

    public Slot put (int idSlot, String itemId, int itemNum, int price, boolean useAd, String displayName, String avatar, String userBucket)
    {
        Slot slot = new Slot();
        slots[idSlot] = slot;

        slot.item = itemId;
        slot.num = itemNum;
        slot.price = price;
        slot.timePut = Time.getUnixTime();
        if (useAd)
            useAd(userId, displayName, avatar, userBucket, idSlot);

        return slot;
    }

    public boolean hasFreeAd ()
    {
        return timeWaitFreeAd() <= 0;
    }

    public int timeWaitFreeAd ()
    {
        return (timeAd + MiscInfo.PS_COUNTDOWN_AD()) - Time.getUnixTime();
    }

    public boolean isSold (int idSlot)
    {
        return slots[idSlot].isSold;
    }

    public boolean hasAd (int idSlot)
    {
        return slots[idSlot].timeAd + MiscInfo.PS_DURATION_AD() > Time.getUnixTime();
    }

    public void skipTimeAd ()
    {
        timeAd = Time.getUnixTime() - MiscInfo.PS_COUNTDOWN_AD();
    }

    public Slot cancel (int userId, int idSlot)
    {
        if (hasAd(idSlot))
            UdpHandler.sendPrivateShopDelete(userId, idSlot);
        return close(idSlot);
    }

    public void useAd (int userId, String displayName, String avatar, String userBucket, int idSlot)
    {
        timeAd = Time.getUnixTime();
        Slot slot = slots[idSlot];
        slot.timeAd = timeAd;

        UdpHandler.sendPrivateShopAdd(new NewsBoardItem(userId, displayName, avatar, userBucket, idSlot, slot.item, slot.num, slot.price, 0, slot.timeAd));
    }

    public Slot close (int idSlot)
    {
        Slot oldSlot = slots[idSlot];
        slots[idSlot] = null;
        return oldSlot;
    }

    public byte getNumFriendSlot ()
    {
        return numFriendSlot;
    }

    public byte getNumBuySlot ()
    {
        return numBuySlot;
    }

    public void buySlotByCoin ()
    {
        numBuySlot++;
        slots = Arrays.copyOf(slots, slots.length + 1);
    }

    public void buySlotByFriend ()
    {
        numFriendSlot++;
        slots = Arrays.copyOf(slots, slots.length + 1);
    }

    public Slot get (int idSlot)
    {
        return slots[idSlot];
    }

    public static class Builder
    {
        private PrivateShop shop;

        public Builder (int userId)
        {
            shop = create(userId);
        }

        public Builder setNumFriendSlot (byte numFriendSlot)
        {
            shop.numFriendSlot = numFriendSlot;
            return this;
        }

        public Builder setNumBuySlot (byte numBuySlot)
        {
            shop.numBuySlot = numBuySlot;
            return this;
        }

        public Builder setTimeAd (int timeAd)
        {
            shop.timeAd = timeAd;
            return this;
        }

        public Builder put (int idSlot, String itemId, int itemNum, int price, boolean useAd, String userBucket)
        {
            return put(idSlot, itemId, itemNum, price, useAd, userBucket, 0, null, null);
        }

        public Builder put (int idSlot, String itemId, int itemNum, int price, boolean useAd, String userBucket, long buyerId, String buyerName, String buyerAvatar)
        {
            Slot slot = shop.put(idSlot, itemId, itemNum, price, useAd, buyerName, buyerAvatar, userBucket);
            slot.buyerId = (int) buyerId;
            //slot.buyerName = buyerName;
            slot.buyerAvatar = buyerAvatar;
            return this;
        }

        public PrivateShop toObject ()
        {
            return shop;
        }
    }

    public static Builder newBuilder (int userId)
    {
        return new Builder(userId);
    }

    public boolean autoBuyItem (int userLevel)
    {
        boolean result = false;
        int curTime = Time.getUnixTime();
        for (Slot slot : slots)
        {
            if (slot == null || slot.isSold)
                continue;
            if (curTime - slot.timePut < UserLevelInfo.PS_ITEM_EXPIRED_TIME(userLevel))
                continue;
            if (slot.timeAd > 0 && slot.timeAd + MiscInfo.PS_DURATION_AD() > curTime)
                continue;
            slot.setSold(0, null);
            result = true;
        }
        return result;
    }
}
