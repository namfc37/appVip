package model.object;

import bitzero.util.common.business.Debug;
import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Fishing extends Encoder.IObject implements KeyDefine
{
    int totalFish = 0;
    MapItem                  dailyFish;
    Pond                     pond;
    Minigame                 minigame;
    List<Slot>               slots;
    HashMap<String, MapItem> hookProduceRequire;
    private HashMap<String, MapItem> featureDropItems;

    public transient int lastTimeDropHook;

    private int timeResetDaily;

    public void putData (Encoder msg)
    {
        msg.put(FISHING_TOTAL_FISH, totalFish);
        msg.put(FISHING_DAILY_FISH, dailyFish);
        msg.put(FISHING_POND, pond);
        msg.put(FISHING_MINIGAME, minigame);
        msg.put(FISHING_SLOTS, slots);
        msg.putStrings(FISHING_HOOK_PRODUCE_LIST_NAME, hookProduceRequire.keySet());
        msg.putMapItem(FISHING_HOOK_PRODUCE_LIST_REQUIRE, hookProduceRequire.values());
    }

    public static Fishing create (int level)
    {
        Fishing o = new Fishing();
        o.dailyFish = new MapItem();
        o.slots = new ArrayList<>();
        o.pond = Pond.create();
        o.hookProduceRequire = new HashMap<>();
        o.minigame = Minigame.create(level);
        o.timeResetDaily = Time.nextTimeResetDaily();
        o.featureDropItems = new HashMap<String, MapItem>();
        //o.updateSlots();
        for (int i = 0; i < MiscInfo.FISHING_SLOTS_PRICE_SIZE(); i++)
        {
            int status = MiscInfo.FISHING_SLOTS_PRICE(i) > 0 ? MiscDefine.FISHING_SLOT_STATUS_LOCK : MiscDefine.FISHING_SLOT_STATUS_EMPTY;

            o.slots.add(Slot.create(status));
        }
        return o;
    }

    public List<Slot> getSlots ()
    {
        return slots;
    }

    public Minigame getMinigame ()
    {
        return minigame;
    }

    public Pond getPond ()
    {
        return pond;
    }

    public HashMap<String, MapItem> getHookProduceRequire ()
    {
        return hookProduceRequire;
    }

    public MapItem getDailyFish ()
    {
        return dailyFish;
    }

    public int getFishCountDaily(String fish)
    {
        if (dailyFish != null)
            return dailyFish.get(fish);
        return 0;
    }

    public int getTotalFish ()
    {
        return totalFish;
    }

    public MapItem collectEP (UserGame userGame, short feature)
    {
        return collectEP(userGame, feature, "default");
    }

    public MapItem collectEP (UserGame userGame, short feature, boolean option)
    {
        return collectEP(userGame, feature, String.valueOf(option));
    }

    public MapItem collectEP (UserGame userGame, short feature, long option)
    {
        return collectEP(userGame, feature, String.valueOf(option));
    }

    public MapItem collectEP (UserGame userGame, short feature, String option)
    {
        String featureName = CmdName.get(feature);
        FishingInfo fishingInfo = ConstInfo.getFishingInfo();
        if (fishingInfo == null) return MapItem.EMPTY;
        if (featureName == null || featureName.isEmpty())
            return MapItem.EMPTY;

        List<String> actionIds = ConstInfo.getFestival().getActions();
        if (actionIds == null || actionIds.isEmpty())
            return MapItem.EMPTY;

        MapItem EPs = new MapItem();

        if (userGame.getLevel() < MiscInfo.FISHING_USER_LEVEL() || !MiscInfo.FISHING_ACTIVE())
            return EPs;

        String ruleId = ConstInfo.getFishingInfo().getDropRuleId(featureName, option);
        if (ruleId == null || ruleId.isEmpty())
            return null;

        if (!featureDropItems.containsKey(ruleId))
            featureDropItems.put(ruleId, new MapItem());

        MapItem todayReceive = featureDropItems.get(ruleId);
        MapItem item = fishingInfo.generateDropItem(featureName, option, todayReceive);
        todayReceive.increase(item);
        Debug.info("Fishing",
                   "collectEP",
                   feature,
                   option,
                   MetricLog.toString(item),
                   MetricLog.toString(todayReceive));

        EPs.increase(item);

        return EPs;
    }

    public boolean canDropHook (ItemInfo itemInfo)
    {
        boolean checkFish = false;
        HookInfo hookInfo = (HookInfo) itemInfo;

        if (pond.fish.isEnough(hookInfo.FISH(), 1))
        {
            checkFish = true;
        }

        return (pond.status == MiscDefine.FISHING_POND_STATUS_ACTIVE && minigame.status == MiscDefine.FISHING_MINIGAME_STATUS_INACTIVE && checkFish);
    }

    public void dropHook (String hookName) //Thả câu
    {
       // pond.isDroppedHook = true;
        minigame.status = MiscDefine.FISHING_MINIGAME_STATUS_ACTIVE;
        minigame.hook = hookName;
    }

    public boolean canFishing ()
    {
        return (minigame.status == MiscDefine.FISHING_MINIGAME_STATUS_ACTIVE && !pond.fish.isEmpty());
    }

    public void fish (int point, int level)  //Thực hiện câu
    {
        minigame.generateReward(point, dailyFish, level);
    }

    public MapItem getReward ()
    {
        return minigame.getReward();
    }

    public void resetDaily (int level)
    {
        if (timeResetDaily > Time.getUnixTime())
            return;
        timeResetDaily = Time.nextTimeResetDaily();
        dailyFish.clear();
        pond.resetDaily();
        featureDropItems.clear();
        minigame.reset(level);
//        update();
        for (int i = 0, size = slots.size(); i < size; i++)
        {
            if (MiscInfo.FISHING_SLOTS_PRICE(i) > 0)
                slots.get(i).status = MiscDefine.FISHING_SLOT_STATUS_LOCK;
        }
    }

    public void update (int level)
    {
        pond.update();
        //updateSlots();
        if (Time.getUnixTime() > timeResetDaily)
        {
            resetDaily(level);
        }
    }

    private void updateSlots ()
    {
        int slotsSize = slots.size();
        int constantSlotsSize = MiscInfo.FISHING_SLOTS_PRICE_SIZE();

        if (slotsSize < constantSlotsSize)
        {
            for (int i = slotsSize; i < constantSlotsSize; i++)
            {
                int status = MiscInfo.FISHING_SLOTS_PRICE(i) > 0 ? MiscDefine.FISHING_SLOT_STATUS_LOCK : MiscDefine.FISHING_SLOT_STATUS_EMPTY;
                slots.add(Slot.create(status));
            }
        }
        else if (slotsSize > constantSlotsSize)
        {
            for (int i = slotsSize - 1; i >= constantSlotsSize; i--)
                if (slots.get(i).canRemove())
                    slots.remove(i);
                else
                    slots.get(i).status = MiscDefine.FISHING_SLOT_STATUS_LOCK;
        }

    }

    public boolean canCollectFish ()
    {
        ItemInfo itemInfo = ConstInfo.getItemInfo(minigame.fish);
        return (minigame.status == MiscDefine.FISHING_MINIGAME_STATUS_FINISH && itemInfo != null && itemInfo.SUB_TYPE() == ItemSubType.FISH);
    }

    public void collectFish (int level)
    {
        String fishId = minigame.fish;
        pond.fish.decrease(fishId, 1);

        if (pond.fish.get(fishId) <= 0)
            pond.fish.remove(fishId);
        dailyFish.increase(fishId, 1);
        totalFish += 1;

        if (pond.fish.size() <= 0)
        {
            pond.inactive();
        }
        minigame.reset(level);
    }

    public boolean canCollectHook (int index)
    {
        if (index < 0 || index >= slots.size())
            return false;
        return slots.get(index).canCollect();
    }

    public String getSlotHook (int slotIndex)
    {
        if (slotIndex < 0 || slotIndex >= slots.size())
            return "";
        return slots.get(slotIndex).hook;
    }

    public boolean collectHook (int index)
    {
        if (index < 0 || index >= slots.size())
            return false;
        slots.get(index).collect(index);
        return true;
    }

    public boolean canHireSlot (int index)
    {
        if (index < 0 || index >= slots.size())
            return false;
        return slots.get(index).canHire();
    }

    public boolean hireSlot (int index)
    {
        if (index < 0 || index >= slots.size())
            return false;
        slots.get(index).hire();
        return true;
    }

    public boolean canProduceHook (int index)
    {
        if (index < 0 || index >= slots.size())
            return false;
        return slots.get(index).canProduce();
    }

    public boolean produceHook (int index, HookInfo hookInfo, int userLevel)
    {
        if (index < 0 || index >= slots.size())
            return false;
        slots.get(index).produce(hookInfo);
        generateNewHookRequire(hookInfo, userLevel);
        return true;
    }

    public MapItem getHookRequire (String hook)
    {
        MapItem require = new MapItem();
        ItemInfo itemInfo = ConstInfo.getItemInfo(hook);
        if (itemInfo != null && itemInfo.TYPE() == ItemType.HOOK)
        {
            HookInfo hookInfo = (HookInfo) itemInfo;
            require.increase(hookInfo.REQUIRE_DEFAULT());
            if (this.hookProduceRequire.containsKey(hook))
                require.increase(this.hookProduceRequire.get(hook));
        }

        return require;
    }

    private void generateNewHookRequire (HookInfo hookInfo, int userLevel)
    {
        MapItem mapItem = new MapItem();
        String itemRequire = randomItemRequest(ThreadLocalRandom.current(), this.filter(hookInfo.REQUIRE_ITEM_RATE(), userLevel));
        if (!itemRequire.equals(""))
        {
            mapItem.increase(itemRequire, hookInfo.REQUIRE_ITEM_NUM());
            hookProduceRequire.put(hookInfo.ID(), mapItem);
        }
    }

    private static String randomItemRequest (ThreadLocalRandom random, MapItem setItemRequest)
    {
        String item = "";

        MapItem mapItemRandom = new MapItem();
        mapItemRandom.put(setItemRequest);

        int totalRate = 0;

        for (util.collection.MapItem.Entry entry : mapItemRandom)
        {
            totalRate += entry.value();
        }

        int rate = random.nextInt(0, totalRate + 1);
        int currentRate = 0;
        for (util.collection.MapItem.Entry entry : mapItemRandom)
        {
            currentRate += entry.value();
            if (currentRate >= rate)
            {
                return entry.key();
            }
        }
        return item;

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
                case ItemType.PEARL:
                case ItemType.PRODUCT:
                    ProductInfo productInfo = (ProductInfo) info;
                    lock = userLevel < productInfo.LEVEL_UNLOCK();
            }

            if (lock)
                continue;

            item.put(entry.key(), entry.value());
        }

        return item;
    }

    public boolean canDropBait ()
    {
       // return (!pond.isDroppedHook
                //&& pond.status == MiscDefine.FISHING_POND_STATUS_INACTIVE
      //  );
        return true;
    }

    public void dropBait (int level)
    {
        pond.callFish();
        minigame.reset(level);
    }

    public static class Pond extends Encoder.IObject
    {
        int     status;
        int     turn;
        int     timeReset;
       // boolean isDroppedHook;
        MapItem fish;

        public static Pond create ()
        {
            Pond o = new Pond();
            o.fish = ConstInfo.getFishingInfo().generateNewFishes(1);
            o.turn = 1;
            o.status = MiscDefine.FISHING_POND_STATUS_ACTIVE;
            o.timeReset = Time.nextTimeResetDaily();
            return o;
        }

        private void resetDaily ()
        {
            status = MiscDefine.FISHING_POND_STATUS_ACTIVE;
            turn = 1;
            fish = ConstInfo.getFishingInfo().generateNewFishes(turn);
            timeReset = Time.nextTimeResetDaily();
        }

        private void callFish ()
        {
            status = MiscDefine.FISHING_POND_STATUS_ACTIVE;
            turn += 1;
            fish = ConstInfo.getFishingInfo().generateNewFishes(turn);
           // isDroppedHook = false;
        }

        //câu hết cá, chờ lượt cá mới
        private void inactive ()
        {
            status = MiscDefine.FISHING_POND_STATUS_INACTIVE;
            turn += 1;
            fish = ConstInfo.getFishingInfo().generateNewFishes(turn);
            timeReset = Math.min(Time.getUnixTime() + MiscInfo.FISHING_COOLDOWN(), Time.nextTimeResetDaily());
            //isDroppedHook = false;
        }

        // cập nhật lại trạng thái hồ cá
        private void update ()
        {
            if (Time.getUnixTime() < timeReset)
                return;
            if (status == MiscDefine.FISHING_POND_STATUS_INACTIVE)
            {
                timeReset = Time.nextTimeResetDaily();
                status = MiscDefine.FISHING_POND_STATUS_ACTIVE;
            }
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(FISHING_POND_STATUS, status);
            msg.put(FISHING_POND_TURN, turn);
            msg.put(FISHING_POND_TIME_RESET, timeReset);
           // msg.put(FISHING_POND_IS_DROPED_HOOK, isDroppedHook);
            msg.put(FISHING_POND_FISH, fish);
        }
    }

    public static class Slot extends Encoder.IObject
    {
        int    status;
        String hook;
        int    timeFinish;

        public static Slot create (int status)
        {
            Slot o = new Slot();
            o.hook = "";
            o.status = status;
            return o;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(FISHING_SLOT_STATUS, status);
            msg.put(FISHING_SLOT_HOOK, hook);
            msg.put(FISHING_SLOT_TIME_FINISH, timeFinish);
        }

        private boolean canRemove ()
        {
            return status != MiscDefine.FISHING_SLOT_STATUS_PROCESS && hook.equals("");
        }

        private boolean canProduce ()
        {
            return hook.equals("") && status == MiscDefine.FISHING_SLOT_STATUS_EMPTY;
        }

        private void produce (HookInfo hookInfo)
        {
            status = MiscDefine.FISHING_SLOT_STATUS_PROCESS;
            hook = hookInfo.ID();
            timeFinish = Time.getUnixTime() + hookInfo.PRODUCTION_TIME();
        }

        private boolean canHire ()
        {
            return status == MiscDefine.FISHING_SLOT_STATUS_LOCK;
        }

        private void hire ()
        {
            status = MiscDefine.FISHING_SLOT_STATUS_EMPTY;
        }

        private boolean canCollect ()
        {
            return !hook.equals("") && Time.getUnixTime() >= timeFinish;
        }

        private void collect (int index)
        {
            hook = "";
            if (status != MiscDefine.FISHING_SLOT_STATUS_LOCK)
                status = MiscDefine.FISHING_SLOT_STATUS_EMPTY;
            timeFinish = Time.nextTimeResetDaily();
        }
    }

    public static class Minigame extends Encoder.IObject
    {
        int     status;
        String  hook;
        String  fish;
        MapItem reward;
        String  type;
        int     areaMin;
        int     areaMax;
        int     weight;

        public int getWeight() {
            return weight;
        }

        public static Minigame create (int level)
        {
            Minigame o = new Minigame();
            o.hook = "";
            o.reward = new MapItem();
            o.type = "";
            o.status = MiscDefine.FISHING_MINIGAME_STATUS_INACTIVE;
            o.generateMinigame(level);
            return o;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(FISHING_MINIGAME_STATUS, status);
            msg.put(FISHING_MINIGAME_HOOK, hook);
            msg.put(FISHING_MINIGAME_FISH, fish);
            msg.put(FISHING_MINIGAME_WEIGHT, weight);
            msg.put(FISHING_MINIGAME_REWARD, reward);
            msg.put(FISHING_MINIGAME_TYPE, type);
            msg.put(FISHING_MINIGAME_BAR_MIN, areaMin);
            msg.put(FISHING_MINIGAME_BAR_MAX, areaMax);
        }

        private MapItem getReward ()
        {
            MapItem rewardReturn = new MapItem();
            if (reward != null && !reward.isEmpty())
                rewardReturn.increase(reward);
            if (ConstInfo.getItemInfo(fish) != null)
                rewardReturn.increase(fish, 1);
            return rewardReturn;
        }

        private void reset (int level)
        {
            status = MiscDefine.FISHING_MINIGAME_STATUS_INACTIVE;
            reward.clear();
            hook = "";
            type = "";
            areaMax = 0;
            areaMin = 0;
            weight = 0;
            fish = "";
            generateMinigame(level);
        }

        // sử dụng tạo thanh minigame lúc thả mồi câu
        public void generateMinigame (int level)
        {
            FishingInfo.MinigameBar minigameBar = ConstInfo.getFishingInfo().generateMinigameBar(level);
            ThreadLocalRandom random = ThreadLocalRandom.current();
            int range = random.nextInt(minigameBar.AREA_MIN(), minigameBar.AREA_MAX() + 1);
            areaMax = random.nextInt(10 + range, Math.max(90, 11 + range));
            areaMin = areaMax - range;
            type = minigameBar.TYPE();
        }

        public void generateReward (int point, MapItem dailyFish, int userLevel)
        {
            reward.clear();
            status = MiscDefine.FISHING_MINIGAME_STATUS_FINISH;
            fish = ItemId.CA_XAM;
            FishingInfo fishingInfo = ConstInfo.getFishingInfo();
            ItemInfo itemInfo = ConstInfo.getItemInfo(hook);
            if (itemInfo != null && itemInfo.TYPE() == ItemType.HOOK)
            {
                HookInfo hookInfo = (HookInfo) itemInfo;
                if (point >= areaMin && point <= areaMax)
                    fish = hookInfo.FISH();
            }
            FishingInfo.FishWeight fishWeight = fishingInfo.getFishWeight(type, fish);
            if (fishWeight != null)
            {
                int areaMid = (areaMax + areaMin) / 2;
                if (fish.equals(ItemId.CA_XAM) ) areaMid = 50;
                float range = fish.equals(ItemId.CA_XAM)? 100.0f : areaMax - areaMin;
                float percentWeight = range - Math.abs(areaMid - point)*2;
                float weight = fishWeight.MIN() + percentWeight * (fishWeight.MAX() - fishWeight.MIN()) / range;

                this.weight = (int) (weight * 100);
                if (ConstInfo.getFestival().getEvent03().isActive())
                {
                    reward.increase(MiscInfo.EV03_POINT(), this.weight);
                }

                FishingInfo.FishReward fishReward = fishingInfo.getFishReward(fish, userLevel);
                if (fishReward != null)
                {

                    int exp = (int) (fishReward.EXP() * weight);
                    int gold = (int) (fishReward.GOLD() * weight);
                    if (exp > 0) reward.increase(ItemId.EXP, exp);
                    if (gold > 0) reward.increase(ItemId.GOLD, gold);
                }
                int curDailyFish = dailyFish.get(fish);

                if (fishingInfo.FISHING_REWARD().containsKey(fish))
                {
                    List<FishingInfo.RewardDefault> listRewardDefault = fishingInfo.FISHING_REWARD().get(fish).get(curDailyFish + 1);
                    if (listRewardDefault != null && listRewardDefault.size() > 0)
                    {
                        reward.increase(randomReward(listRewardDefault));
                    }
                }
            }

        }

        public MapItem randomReward (List<FishingInfo.RewardDefault> listRewardDefault)
        {
            int totalRate = 0;
            for (FishingInfo.RewardDefault rewardDefault : listRewardDefault)
            {
                totalRate += rewardDefault.rate();
            }
            ThreadLocalRandom random = ThreadLocalRandom.current();

            int rate = random.nextInt(1, totalRate + 1);
            int currentRate = 0;
            for (FishingInfo.RewardDefault rewardDefault : listRewardDefault)
            {
                currentRate += rewardDefault.rate();
                if (currentRate >= rate)
                {
                    return rewardDefault.reward();
                }
            }
            return new MapItem();
        }

        public String randomFish (MapItem fishes)
        {
            int totalRate = 0;
            for (util.collection.MapItem.Entry entry : fishes)
            {
                totalRate += entry.value();
            }
            ThreadLocalRandom random = ThreadLocalRandom.current();
            int rate = random.nextInt(1, totalRate + 1);
            int currentRate = 0;
            for (util.collection.MapItem.Entry entry : fishes)
            {
                currentRate += entry.value();
                if (currentRate >= rate)
                {
                    return entry.key();
                }
            }
            return "";
        }
    }
}
