package model.object;

import data.*;
import model.UserGame;
import model.mail.MailBox;
import user.UserControl;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class Truck extends Encoder.IObject implements KeyDefine
{
    int status;
    int level;
    int deliveryCount;
    int timeStart;
    int timeFinish;

    List<Bag> bags;

    private MapItem deliveryReward;
    private MapItem deliveryEventItems;

    private Truck ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Truck create ()
    {
        Truck o = new Truck();
        o.status = MiscDefine.TRUCK_STATUS_LOCK;
        o.level = 1;
        o.bags = new ArrayList<>();
        o.deliveryReward = new MapItem();
        return o;
    }

    public void update (UserGame userGame)
    {
        int currentTime = Time.getUnixTime();
        if (currentTime < timeFinish)
            return;

        switch (status)
        {
            case MiscDefine.TRUCK_STATUS_LOCK:
                break;
            case MiscDefine.TRUCK_STATUS_UNLOCK:
                active(userGame);
                break;
            case MiscDefine.TRUCK_STATUS_ACTIVE:
                inactive(userGame);
                break;
            case MiscDefine.TRUCK_STATUS_INACTIVE:
                active(userGame);
                break;
        }
    }

    public int getLevel ()
    {
        return level;
    }

    public int getTimeWait ()
    {
        return timeFinish - timeStart;
    }

    public int getDeliveryCount ()
    {
        return deliveryCount;
    }

    public boolean isLock ()
    {
        return status == MiscDefine.TRUCK_STATUS_LOCK;
    }

    public boolean isUnlock ()
    {
        return status == MiscDefine.TRUCK_STATUS_UNLOCK;
    }

    public boolean isActive ()
    {
        return status == MiscDefine.TRUCK_STATUS_ACTIVE;
    }

    public boolean isInactive ()
    {
        return status == MiscDefine.TRUCK_STATUS_INACTIVE;
    }

    public boolean canDelivery ()
    {
        if (status != MiscDefine.TRUCK_STATUS_ACTIVE)
            return false;
        for (int i = 0, size = bags.size(); i < size; i++)
        {
            if (!bags.get(i).isPacked) return false;
        }
        return true;
    }

    public boolean canUpgrade ()
    {
        int nextLevel = level + 1;

        TruckInfo.Level truckLevelInfo = ConstInfo.getTruckInfo().getTruckLevelInfo(nextLevel);

        return truckLevelInfo != null && deliveryCount >= truckLevelInfo.DELIVERY_REQ();

    }

    public boolean canCancelDelivery ()
    {
        if (status != MiscDefine.TRUCK_STATUS_ACTIVE)
            return false;
        for (int i = 0, size = bags.size(); i < size; i++)
        {
            if (bags.get(i).isPacked) return false;
        }
        return true;
    }

    public boolean unlock (UserGame userGame)
    {
        if (status != MiscDefine.TRUCK_STATUS_LOCK)
            return false;

        status = MiscDefine.TRUCK_STATUS_UNLOCK;
        timeStart = Time.getUnixTime();
        timeFinish = timeStart + MiscInfo.TRUCK_UNLOCK_TIME();
        return true;
    }

    public int calcTimeSkip ()
    {
        return timeFinish - Time.getUnixTime();
    }

    public void skipTime ()
    {
        timeStart = 0;
        timeFinish = 0;
    }

    public boolean upgrade ()
    {
        if (canUpgrade())
        {
            level = level + 1;
            return true;
        }
        return false;
    }

    public boolean delivery (UserGame userGame)
    {
        if (canDelivery())
        {
            inactive(userGame);
            deliveryCount += 1;
            return true;
        }
        return false;
    }

    public boolean cancelDelivery (UserGame userGame)
    {
        if (canCancelDelivery())
        {
            inactive(userGame);
            return true;
        }
        return false;
    }

    public boolean active (UserGame userGame)
    {

        if (status != MiscDefine.TRUCK_STATUS_UNLOCK && status != MiscDefine.TRUCK_STATUS_INACTIVE)
            return false;
        TruckInfo.TruckRequireInfo truckRequireInfo = ConstInfo.getTruckInfo().getTruckRequireInfo(userGame.getLevel());
        if (status == MiscDefine.TRUCK_STATUS_UNLOCK)
        {
            genBags(userGame);
        }

        status = MiscDefine.TRUCK_STATUS_ACTIVE;
        timeStart = Time.getUnixTime();
        timeFinish = timeStart + calcTimeStay(truckRequireInfo);

        return true;
    }

    int genTimeLeave ()
    {
        ThreadLocalRandom r = ThreadLocalRandom.current();

        int min = MiscInfo.TRUCK_LEAVE_DURATION_MIN();
        int max = MiscInfo.TRUCK_LEAVE_DURATION_MAX() + MiscInfo.TRUCK_INCREASE_STEP() - 1;

        int timeLeave = r.nextInt(min, max) / MiscInfo.TRUCK_INCREASE_STEP() * MiscInfo.TRUCK_INCREASE_STEP();

        TruckInfo.Level truckLevelInfo = ConstInfo.getTruckInfo().getTruckLevelInfo(level);
        timeLeave -= timeLeave * truckLevelInfo.ARRIVE_REDUCE_TIME() / 100;
        // System.out.println("Time Leave: " + timeLeave + "s   = "+ timeLeave / MiscInfo.TRUCK_INCREASE_STEP() + " hours" );
        return timeLeave;
    }

    public boolean inactive (UserGame userGame)
    {
        if (status != MiscDefine.TRUCK_STATUS_ACTIVE)
            return false;

        status = MiscDefine.TRUCK_STATUS_INACTIVE;
        clearBags();
        genBags(userGame);
        int curTime = Time.getUnixTime();
        int timeLeave = genTimeLeave();
        if (timeFinish + timeLeave <= curTime)
        {
            active(userGame);
        }
        else
        {
            timeStart = Math.min(curTime, timeFinish);
            timeFinish = timeStart + timeLeave;
        }

        return true;
    }

    public int calcTimeStay (TruckInfo.TruckRequireInfo truckRequireInfo)
    {

        int timeStay = (int) (bags.size() * truckRequireInfo.STAY_RATIO() + ThreadLocalRandom.current().nextInt(1, 3)) * 3600;
        return timeStay;
    }

    public Bag getBag (int id)
    {
        return bags.get(id);
    }

    public MapItem getDeliveryReward ()
    {
        return deliveryReward;
    }

    public MapItem getDeliveryEventItems ()
    {
        return deliveryEventItems;
    }

    public void clearBags ()
    {
        bags.clear();
    }

    public void genBags (UserGame userGame)
    {
        bags.clear();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        TruckInfo.TruckRequireInfo truckRequireInfo = ConstInfo.getTruckInfo().getTruckRequireInfo(userGame.getLevel());

        int numItemType = r.nextInt(truckRequireInfo.MIN_ITEM_TYPE(), truckRequireInfo.MAX_ITEM_TYPE() + 1);

        int numBagsPerType = r.nextInt(truckRequireInfo.MIN_BAG_NUM_PER_ITEM_TYPE(), truckRequireInfo.MAX_BAG_NUM_PER_ITEM_TYPE() + 1);

        int numEasyItemType = Math.min(numItemType, r.nextInt(MiscInfo.TRUCK_MIN_EASY_ITEM_TYPE(), MiscInfo.TRUCK_MAX_EASY_ITEM_TYPE() + 1));
        int numMediumItemType = Math.min(numItemType - numEasyItemType, r.nextInt(MiscInfo.TRUCK_MIN_MEDIUM_ITEM_TYPE(), MiscInfo.TRUCK_MAX_MEDIUM_ITEM_TYPE() + 1));
        int numHardItemType = Math.max(numItemType - numEasyItemType - numMediumItemType, 0);

        ArrayList<String> setItem = new ArrayList<>();

        //TODO optimize
        setItem.addAll(randomItemRequest(r, numEasyItemType, this.filter(truckRequireInfo.EASY_REQUIRE(), userGame.getLevel())));
        for (int i = 0, size = setItem.size(); i < size; i++)
        {
            for (int j = 0; j < numBagsPerType; j++)
                addBags(r, userGame, setItem.get(i), truckRequireInfo.MIN_NUM_REQUIRE_ITEM_EASY(), truckRequireInfo.MAX_NUM_REQUIRE_ITEM_EASY());
        }
        setItem.clear();

        setItem.addAll(randomItemRequest(r, numMediumItemType, this.filter(truckRequireInfo.MEDIUM_REQUIRE(), userGame.getLevel())));
        for (int i = 0, size = setItem.size(); i < size; i++)
        {
            for (int j = 0; j < numBagsPerType; j++)
                addBags(r, userGame, setItem.get(i), truckRequireInfo.MIN_NUM_REQUIRE_ITEM_MEDIUM(), truckRequireInfo.MAX_NUM_REQUIRE_ITEM_MEDIUM());
        }
        setItem.clear();

        setItem.addAll(randomItemRequest(r, numHardItemType, this.filter(truckRequireInfo.HARD_REQUIRE(), userGame.getLevel())));
        for (int i = 0, size = setItem.size(); i < size; i++)
        {
            for (int j = 0; j < numBagsPerType; j++)
                addBags(r, userGame, setItem.get(i), truckRequireInfo.MIN_NUM_REQUIRE_ITEM_HARD(), truckRequireInfo.MAX_NUM_REQUIRE_ITEM_HARD());
        }
        setItem.clear();

        deliveryReward.clear();
        deliveryReward.put(truckRequireInfo.REWARDS());
        deliveryReward.put(ItemId.REPU, truckRequireInfo.REPUTATION());

        //Gachapon
        int quantity = MiscInfo.GACHAPON_TRUCK_DELIVERY_TICKET();
        if (quantity > 0) deliveryReward.increase(ItemId.VE_GACHA, quantity);

        //gen event item
        MapItem temp = new MapItem();
        Festival festival = userGame.getFestival();
        temp.increase(festival.collectEP(userGame, CmdDefine.TRUCK_DELIVERY, ""));

        Fishing fishing = userGame.getFishing();
        temp.increase(fishing.collectEP(userGame, CmdDefine.TRUCK_DELIVERY, ""));

        if (temp.size() > 0)
        {
            if (deliveryReward == null)
                deliveryReward = temp;
            else
                deliveryReward.increase(temp);
        }
    }


    public Bag createBag (UserGame userGame, String item, int num)
    {
        TruckInfo.TruckRequireInfo truckRequireInfo = ConstInfo.getTruckInfo().getTruckRequireInfo(userGame.getLevel());
        TruckInfo.Level truckLevelInfo = ConstInfo.getTruckInfo().getTruckLevelInfo(level);
        Bag bag = new Bag();
        bag.item = item;
        bag.num = num;
        bag.isPacked = false;

        int gold = 0, exp = 0;
        ItemInfo info = ConstInfo.getItemInfo(bag.item);
        switch (info.TYPE())
        {
            case ItemType.PLANT:
                PlantInfo plantInfo = (PlantInfo) info;
                gold = Math.round(bag.num * plantInfo.GOLD_BASIC() * truckRequireInfo.GOLD_COEFFICIENT_RATIO());
                exp = Math.round(bag.num * plantInfo.EXP_BASIC() * truckRequireInfo.EXP_COEFFICIENT_RATIO());
                break;

            case ItemType.PEST:
                PestInfo pestInfo = (PestInfo) info;
                gold = Math.round(bag.num * pestInfo.GOLD_BASIC() * truckRequireInfo.GOLD_COEFFICIENT_RATIO());
                exp = Math.round(bag.num * pestInfo.EXP_BASIC() * truckRequireInfo.EXP_COEFFICIENT_RATIO());
                break;

            case ItemType.MINERAL:
                MaterialInfo materialInfo = (MaterialInfo) info;
                gold = Math.round(bag.num * materialInfo.GOLD_BASIC() * truckRequireInfo.GOLD_COEFFICIENT_RATIO());
                exp = Math.round(bag.num * materialInfo.EXP_BASIC() * truckRequireInfo.EXP_COEFFICIENT_RATIO());
                break;
        }
        gold = Math.max(1, gold);
        exp = Math.max(1, exp);

        gold += gold * truckLevelInfo.GOLD_BONUS() / 100;
        exp += exp * truckLevelInfo.EXP_BONUS() / 100;

        bag.packReward = new MapItem();
        bag.packReward.put(ItemId.GOLD, gold);
        bag.packReward.put(ItemId.EXP, exp);

        //gen event item
        MapItem temp = new MapItem();
        Festival festival = userGame.getFestival();
        temp.increase(festival.collectEP(userGame, CmdDefine.TRUCK_PACK, ""));

        Fishing fishing = userGame.getFishing();
        temp.increase(fishing.collectEP(userGame, CmdDefine.TRUCK_PACK, ""));

        if (temp.size() > 0)
        {
            if (bag.packReward == null)
                bag.packReward = temp;
            else
                bag.packReward.increase(temp);
        }
        return bag;
    }

    private void addBags (ThreadLocalRandom random, UserGame game, String item, int min, int max)
    {
        int num = random.nextInt(min, max + 1);
        bags.add(createBag(game, item, num));
    }

    private static ArrayList<String> randomItemRequest (ThreadLocalRandom random, int numGet, MapItem setItemRequest)
    {
        ArrayList<String> setItem = new ArrayList<>();

        MapItem mapItemRandom = new MapItem();
        mapItemRandom.put(setItemRequest);

        int totalRate = 0;

        for (util.collection.MapItem.Entry entry : mapItemRandom)
        {

            totalRate += entry.value();
        }

        for (int i = 0; i < numGet; i++)
        {
            int rate = random.nextInt(1, totalRate + 1);
            int currentRate = 0;
            for (util.collection.MapItem.Entry entry : mapItemRandom)
            {
                currentRate += entry.value();
                if (currentRate >= rate)
                {
                    setItem.add(entry.key());
                    totalRate -= entry.value();
                    mapItemRandom.remove(entry.key());
                    break;
                }
            }
        }
        //System.out.println(Json.toJsonPretty(setItem));
        return setItem;

    }

    private MapItem filter (MapItem src, int userLevel)
    {
        MapItem item = new MapItem();

        for (util.collection.MapItem.Entry entry : src)
        {
            ItemInfo info = ConstInfo.getItemInfo(entry.key());
            boolean lock = false;
            switch (info.TYPE())
            {
                case ItemType.PLANT:
                    PlantInfo plantInfo = (PlantInfo) info;
                    lock = userLevel < plantInfo.LEVEL_UNLOCK();
                    break;
                case ItemType.PEST:
                    PestInfo pestInfo = (PestInfo) info;
                    lock = userLevel < pestInfo.LEVEL_UNLOCK();
                    break;
                case ItemType.MINERAL:
                    lock = userLevel < MiscInfo.MINE_USER_LEVEL();
                    break;
            }

            if (lock)
                continue;

            item.put(entry.key(), entry.value());
        }

        return item;
    }

    public void pack (int bagId)
    {
        bags.get(bagId).pack();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(TRUCK_STATUS, status);
        msg.put(TRUCK_LEVEL, level);
        msg.put(TRUCK_TIME_START, timeStart);
        msg.put(TRUCK_TIME_FINISH, timeFinish);
        msg.put(TRUCK_DELIVERY_COUNT, deliveryCount);
        msg.put(TRUCK_BAGS, bags);
        msg.put(TRUCK_DELIVERY_REWARD, deliveryReward);
        msg.put(TRUCK_DELIVERY_EVENT_ITEMS, deliveryEventItems);
    }

    public static class Bag extends Encoder.IObject
    {

        private String  item;
        private int     num;
        private boolean isPacked;
        private MapItem packReward;
        private MapItem packEventItems;

        public boolean isPacked ()
        {
            return isPacked;
        }

        public String getItem ()
        {
            return item;
        }

        public int getNum ()
        {
            return num;
        }

        public MapItem getPackReward ()
        {
            return packReward;
        }

        public MapItem getPackEventItems ()
        {
            return packEventItems;
        }

        private Bag ()
        {
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(TRUCK_BAG_ITEM, item);
            msg.put(TRUCK_BAG_NUM, num);
            msg.put(TRUCK_BAG_IS_PACKED, isPacked);
            msg.put(TRUCK_PACK_REWARD, packReward);
            msg.put(TRUCK_PACK_EVENT_ITEMS, packEventItems);
        }

        public Bag (String item, int num, MapItem packReward, MapItem packEventItems)
        {
            this.item = item;
            this.num = num;
            isPacked = false;
            this.packReward = packReward;
            this.packEventItems = packEventItems;
        }

        public void pack ()
        {
            isPacked = true;
        }
    }

    public static void testGenBags ()
    {
        TreeMap<String, Integer> truckRequestMap = new TreeMap<>();

        TreeMap<String, Float> truckRequestRateMap = new TreeMap<>();
        int testLevel = 50;
        int total = 0;
        TruckInfo.TruckRequireInfo truckRequireInfo = ConstInfo.getTruckInfo().getTruckRequireInfo(testLevel);

        for (int i = 0; i < 1350000; i++)
        {
            ArrayList<String> setItem = randomItemRequest(ThreadLocalRandom.current(), 2, truckRequireInfo.EASY_REQUIRE());
            for (int j = 0, size = setItem.size(); j < size; j++)
                if (!truckRequestMap.containsKey(setItem.get(j)))
                    truckRequestMap.put(setItem.get(j), 1);
                else
                    truckRequestMap.put(setItem.get(j), truckRequestMap.get(setItem.get(j)) + 1);
        }
        for (String key : truckRequestMap.keySet())
        {
            total += truckRequestMap.get(key);
            // truckRequestRateMap.put(key,truckRequestMap.get(key) * 100 /  )
        }

        for (String key : truckRequestMap.keySet())
        {
            //total += truckRequestMap.get(key);
            float rate = truckRequestMap.get(key) * 100 / Float.valueOf(total);
            truckRequestRateMap.put(key, rate);
        }

        System.out.println("Result:" + truckRequestRateMap.entrySet());
    }
}
