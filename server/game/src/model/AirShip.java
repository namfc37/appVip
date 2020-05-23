package model;

import data.*;
import extension.EnvConfig;
import model.key.InfoKeyUser;
import model.object.ComboManager;
import model.object.Festival;
import model.object.Fishing;
import net.spy.memcached.CASValue;
import service.UdpHandler;
import service.newsboard.NewsBoardItem;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class AirShip extends Encoder.IObject implements KeyDefine
{
    private transient int userId;

    private byte       status;
    private int        timeStart;
    private int        timeFinish;
    private int        numRequest;
    private List<Slot> slots;
    private MapItem    eventItems;

    private AirShip ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static AirShip create (int userId)
    {
        AirShip o = new AirShip();
        o.status = MiscDefine.AIRSHIP_STATUS_LOCK;
        o.userId = userId;
        o.slots = new ArrayList<>();
        return o;
    }

    public boolean update (UserGame game)
    {
        boolean isChanged = false;
        int curTime = Time.getUnixTime();
        switch (status)
        {
            case MiscDefine.AIRSHIP_STATUS_UNLOCK:
                if (timeFinish <= curTime)
                {
                    active(game, curTime);
                    game.increaseNumAirShip();
                    isChanged = true;
                }
                break;

            case MiscDefine.AIRSHIP_STATUS_ACTIVE:
                if (timeFinish <= curTime)
                {
                    inactive(game, timeFinish);
                    if (status != MiscDefine.AIRSHIP_STATUS_LIMIT && timeFinish <= curTime)
                    {
                        status = MiscDefine.AIRSHIP_STATUS_ACTIVE;
                        calcTimeActive(game.getLevel(), curTime);
                        game.increaseNumAirShip();
                    }
                    isChanged = true;
                }
                break;

            case MiscDefine.AIRSHIP_STATUS_INACTIVE:
                if (timeFinish <= curTime)
                {
                    status = MiscDefine.AIRSHIP_STATUS_ACTIVE;
                    calcTimeActive(game.getLevel(), curTime);
                    game.increaseNumAirShip();
                    isChanged = true;
                }
                break;

            case MiscDefine.AIRSHIP_STATUS_LIMIT:
                if (game.getNumAirShip() == 0)
                {
                    active(game, curTime);
                    game.increaseNumAirShip();
                    isChanged = true;
                }
                break;
        }

        if (game.getNumAirShip() > UserLevelInfo.MAX_AIRSHIP_PER_DAY(game.getLevel()))
        {
            status = MiscDefine.AIRSHIP_STATUS_LIMIT;
            isChanged = true;
        }
        return isChanged;
    }

    public void friendUpdate ()
    {
        if (status == MiscDefine.AIRSHIP_STATUS_ACTIVE && timeFinish <= Time.getUnixTime())
            status = MiscDefine.AIRSHIP_STATUS_INACTIVE;
    }

    public void replaceEventItems (MapItem eventItems)
    {
        if (status == MiscDefine.AIRSHIP_STATUS_ACTIVE)
        {
            for (Slot slot : slots)
                slot.eventItems = slot.canHelp() ? eventItems : null;
        }
    }

    private void reset (UserGame game)
    {
        int level = game.getLevel();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        slots.clear();

        int numType = r.nextInt(UserLevelInfo.AIRSHIP_MIN_ITEM_TYPE(level), UserLevelInfo.AIRSHIP_MAX_ITEM_TYPE(level) + 1);
        int numCargo = r.nextInt(UserLevelInfo.AIRSHIP_MIN_CARGO_NUM_PER_ITEM_TYPE(level), UserLevelInfo.AIRSHIP_MAX_CARGO_NUM_PER_ITEM_TYPE(level) + 1);
        HashSet<String> setItem = new HashSet<>();

        addSlot(r, game, numCargo, setItem,
                UserLevelInfo.TREE_AIRSHIP_EASY_REQUEST(level),
                UserLevelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_EASY(level),
                UserLevelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_EASY(level)
               );
        numType--;

        for (int i = Math.min(numType, r.nextInt(0, 3)); i > 0; i--)
        {
            addSlot(r, game, numCargo, setItem,
                    UserLevelInfo.TREE_AIRSHIP_MEDIUM_REQUEST(level),
                    UserLevelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_MEDIUM(level),
                    UserLevelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_MEDIUM(level));
            numType--;
        }

        for (int i = numType; i > 0; i--)
        {
            addSlot(r, game, numCargo, setItem,
                    UserLevelInfo.TREE_AIRSHIP_HARD_REQUEST(level),
                    UserLevelInfo.AIRSHIP_MIN_NUM_REQUIRE_ITEM_HARD(level),
                    UserLevelInfo.AIRSHIP_MAX_NUM_REQUIRE_ITEM_HARD(level));
        }

        slots.sort(Comparator.comparing(Slot::getLevelUnlock).thenComparing(Slot::getNum));
        numRequest = 0;

        Festival festival = game.getFestival();
        eventItems = festival.collectEP(game, CmdDefine.AIRSHIP_DELIVERY);

       // Fishing fishing = game.getFishing();
        //eventItems.increase(fishing.collectEP(game,CmdDefine.AIRSHIP_DELIVERY));
    }

    private void calcTimeActive (int level, int time)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        timeStart = time;
        timeFinish = timeStart + (int) ((slots.size() * UserLevelInfo.AIRSHIP_STAY_RATIO(level) + r.nextInt(1, 3)) * 3600);
    }

    private void calcTimeInactive (int level, int time)
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int numStep = (MiscInfo.AS_LEAVE_DURATION_MAX() - MiscInfo.AS_LEAVE_DURATION_MIN()) / MiscInfo.AS_INCREASE_STEP();
        timeStart = time;
        timeFinish = timeStart + MiscInfo.AS_LEAVE_DURATION_MIN() + r.nextInt(0, numStep + 1) * MiscInfo.AS_INCREASE_STEP();
    }

    private void addSlot (ThreadLocalRandom r, UserGame game, int numSlot, HashSet<String> setItem, NavigableMap<Integer, String> treeItem, int minItem, int maxItem)
    {
        String item = null;
        for (int i = 0; i < treeItem.size(); i++)
        {
            item = treeItem.floorEntry(r.nextInt(100)).getValue();
            if (setItem.add(item))
                break;
        }

        if (item == null)
            return;

        int num;
        for (int i = 0; i < numSlot; i++)
        {
            num = r.nextInt(minItem, maxItem + 1);
            slots.add(genSlot(game, item, num));
        }
    }

    private Slot genSlot (UserGame game, String item, int num)
    {
        int level = game.getLevel();
        Slot slot = new Slot();
        slot.item = item;
        slot.num = num;

        int gold = 0, exp = 0;
        ItemInfo info = ConstInfo.getItemInfo(slot.item);
        switch (info.TYPE())
        {
            case ItemType.PLANT:
                PlantInfo plantInfo = (PlantInfo) info;
                gold = Math.round(slot.num * plantInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(level));
                exp = Math.round(slot.num * plantInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(level));
                break;
            case ItemType.PEARL:
            case ItemType.PRODUCT:
                ProductInfo productInfo = (ProductInfo) info;
                gold = Math.round(slot.num * productInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(level));
                exp = Math.round(slot.num * productInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(level));
                break;
        }
        gold = Math.max(1, gold);
        exp = Math.max(1, exp);

        ComboManager combo = game.getComboManager();

        slot.rewardItems = new MapItem();
        slot.rewardItems.put(ItemId.GOLD, combo.airshipGold(gold, gold, 0));
        slot.rewardItems.put(ItemId.EXP, combo.airshipExp(exp, exp, 0));

        slot.levelUnlock = info.LEVEL_UNLOCK();

        Festival festival = game.getFestival();
        slot.eventItems = festival.collectEP(game, CmdDefine.AIRSHIP_PACK);

        Fishing fishing = game.getFishing();
        slot.eventItems.increase(fishing.collectEP(game,CmdDefine.AIRSHIP_PACK));

        return slot;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(AS_STATUS, status);
        msg.put(AS_TIME_START, timeStart);
        msg.put(AS_TIME_FINISH, timeFinish);
        msg.put(AS_NUM_REQUEST, numRequest);
        msg.put(AS_SLOTS, slots);
        msg.put(AS_DELIVERY_EVENT_ITEMS, eventItems);
    }

    public static class Slot extends Encoder.IObject
    {
        private boolean isPacked;
        private boolean isRequest;
        private String  item;
        private int     num;
        private int     helperId;
        private String  helperAvatar;
        private MapItem rewardItems;
        private MapItem eventItems;

        public transient int levelUnlock;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(AS_SLOT_IS_PACKED, isPacked);
            msg.put(AS_SLOT_IS_REQUEST, isRequest);
            msg.put(AS_SLOT_ITEM, item);
            msg.put(AS_SLOT_NUM, num);
            msg.put(AS_SLOT_HELPER_ID, helperId);
            msg.put(AS_SLOT_HELPER_AVATAR, helperAvatar);
            msg.put(AS_SLOT_REWARD_ITEMS, rewardItems);
            msg.put(AS_SLOT_EVENT_ITEMS, eventItems);
        }

        public boolean isPacked ()
        {
            return isPacked;
        }

        public void pack ()
        {
            isPacked = true;
        }

        public void pack (int id, String avatar)
        {
            isPacked = true;
            helperId = id;
            helperAvatar = avatar;
        }

        public void requestHelp (int userId, String displayName, String avatar, String userBucket, int idSlot, int timeFinish)
        {
            isRequest = true;
            UdpHandler.sendAirshipAdd(new NewsBoardItem(userId,
                                                        displayName,
                                                        avatar,
                                                        userBucket,
                                                        idSlot,
                                                        item,
                                                        num,
                                                        rewardItems.get(ItemId.GOLD),
                                                        rewardItems.get(ItemId.EXP),
                                                        timeFinish
            ));
        }

        public String getItem ()
        {
            return item;
        }

        public int getNum ()
        {
            return num;
        }

        public MapItem getRewardItems ()
        {
            return rewardItems;
        }

        public MapItem getEventItems ()
        {
            return eventItems;
        }

        public boolean canHelp ()
        {
            if (isPacked)
                return false;
            return isRequest;
        }

        public int getLevelUnlock ()
        {
            return levelUnlock;
        }

        public boolean isRequest ()
        {
            return isRequest;
        }
    }

    //-----------------------------------------------------------------------
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.AIR_SHIP;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static AirShip decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
                AirShip obj = Json.fromJson((String) raw, AirShip.class);
                obj.userId = userId;
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

    public static boolean set (String bucketId, int userId, AirShip object)
    {
        return db(bucketId).set(keyName(userId), object.encode(), expire());
    }

    public static AirShip get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static AirShip get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    public static CasValue<AirShip> gets (String bucketId, int userId)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (String bucketId, int userId, long cas, AirShip object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode(), expire());
    }

    //-----------------------------------------------------------------------

    public boolean isLock ()
    {
        return status == MiscDefine.AIRSHIP_STATUS_LOCK;
    }

    public void unlock ()
    {
        status = MiscDefine.AIRSHIP_STATUS_UNLOCK;
        timeStart = Time.getUnixTime();
        timeFinish = timeStart + MiscInfo.AS_UNLOCK_TIME();
    }

    public boolean canSkipTimeUnlock ()
    {
        return (status == MiscDefine.AIRSHIP_STATUS_UNLOCK) && (timeFinish > Time.getUnixTime());
    }

    public int calcTimeSkip ()
    {
        return timeFinish - Time.getUnixTime();
    }

    public int getTimeWait ()
    {
        return timeFinish - timeStart;
    }

    public void skipTime ()
    {
        timeStart = 0;
        timeFinish = 0;
    }

    public boolean canSkipTimeInactive ()
    {
        return (status == MiscDefine.AIRSHIP_STATUS_INACTIVE) && (timeFinish > Time.getUnixTime());
    }

    public Slot getSlot (int id)
    {
        if (id < 0 || id >= slots.size())
            return null;
        return slots.get(id);
    }

    public boolean canCancel ()
    {
        if (!isActive())
            return false;
        for (Slot slot : slots)
            if (slot.isPacked)
                return false;
        return true;
    }

    public boolean canDelivery ()
    {
        if (!isActive())
            return false;

        for (Slot slot : slots)
            if (!slot.isPacked)
                return false;

        return true;
    }

    public void active (UserGame game, int time)
    {
        status = MiscDefine.AIRSHIP_STATUS_ACTIVE;
        reset(game);
        calcTimeActive(game.getLevel(), time);
    }

    public void inactive (UserGame game, int time)
    {
        status = MiscDefine.AIRSHIP_STATUS_INACTIVE;
        reset(game);
        calcTimeInactive(game.getLevel(), time);

        if (game.getNumAirShip() >= UserLevelInfo.MAX_AIRSHIP_PER_DAY(game.getLevel()))
            status = MiscDefine.AIRSHIP_STATUS_LIMIT;
    }

    public boolean isActive ()
    {
        return status == MiscDefine.AIRSHIP_STATUS_ACTIVE;
    }

    public boolean canRequestHelp ()
    {
        return numRequest < MiscInfo.AS_REQUEST_LIMIT_PER_AIRSHIP();
    }

    public void increaseNumRequest ()
    {
        numRequest++;
    }

    public void gmSetNumRequest (int value)
    {
        numRequest = value;
    }

    public void gmSetTimeFinish (int value)
    {
        timeFinish = value;
    }

    public boolean canHelp (int friendId)
    {
        int count = 0;
        for (Slot slot : slots)
            if (slot.helperId == friendId)
                count++;
        return count < MiscInfo.AS_HELP_LIMIT_PER_AIRSHIP();
    }

    public int getTimeFinish ()
    {
        return timeFinish;
    }

    public int numSlot ()
    {
        return slots.size();
    }

    public MapItem getEventItems ()
    {
        return eventItems;
    }
}
