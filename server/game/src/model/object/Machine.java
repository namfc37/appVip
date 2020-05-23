package model.object;

import cmd.ErrorConst;
import data.*;
import model.Interactive;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.ArrayDeque;
import java.util.concurrent.ThreadLocalRandom;

public class Machine extends Encoder.IObject implements KeyDefine
{
    private int                timeStartUnlock; //thời gian bắt đầu unlock
    private boolean            isFinishUnlock;
    private short              level;
    private short              numSlot;         // == 0: chưa unlock, > 0: đã unlock
    private int                durability;
    private int                workingTime;
    private ArrayDeque<String> store;
    private int                timeStart;
    private int                timeFinish;
    private ArrayDeque<String> produceItems;

    public transient MachineInfo info;
    public transient Floor       floor;

    private Machine ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Machine create ()
    {
        Machine o = new Machine();
        o.store = new ArrayDeque<>();
        o.produceItems = new ArrayDeque<>();

        return o;
    }

    public void init (int idFloor)
    {
        info = ConstInfo.getMachineInfo(idFloor);
    }

    public void update ()
    {
        updateProduce();
    }

    private void updateProduce ()
    {
        int curTime = Time.getUnixTime();
        while (store.size() < maxStore() && produceItems.size() > 0)
        {
            if (timeStart == 0)
            {
                setTimeProduce(curTime);
                break;
            }

            if (timeFinish > curTime)
                break;

            String item = produceItems.poll();
            setTimeProduce(timeFinish);
            store.add(item);
        }

        if (store.size() >= maxStore())
            clearTimeProduce();
        if (produceItems.isEmpty())
            clearTimeProduce();
    }

    private void setTimeProduce (int time)
    {
        String product = produceItems.peek();
        if (product != null)
        {
            MachineInfo.Level infoLevel = info.getLevel(level);
            ItemInfo info = ConstInfo.getItemInfo(product);
            ProductInfo pInfo = (ProductInfo) info;
            ComboManager combo = floor.game.getComboManager();

            timeStart = time;
            timeFinish = timeStart + Math.max(10, combo.productionTime(floor.getId(), pInfo.PRODUCTION_TIME(), 0, infoLevel.REDUCE_TIME));
        }
        else
        {
            clearTimeProduce();
        }
    }

    private void clearTimeProduce ()
    {
        timeStart = 0;
        timeFinish = 0;
    }

    public boolean isUnlock ()
    {
        return numSlot > 0;
    }

    public void startUnlock (int time)
    {
        timeStartUnlock = time;
    }

    public boolean canFinishUnlock ()
    {
        return timeStartUnlock > 0 && timeStartUnlock < Time.getUnixTime();
    }

    public void finishUnlock ()
    {
        isFinishUnlock = true;
        timeStartUnlock = 0;
        level = 1;
        numSlot = (short) info.INIT_SLOT();
        repair();
    }

    public int timeWaitUnlock ()
    {
        return timeStartUnlock + info.TIME_START() - Time.getUnixTime();
    }

    public void skipTimeUnlock ()
    {
        timeStartUnlock = 1;
    }

    public int needRepair ()
    {
        if (!isUnlock())
            return 0;

        return info.DURABILITY(level) - durability;
    }

    public int calcPriceRepair ()
    {
        MachineInfo.Level infoLevel = info.getLevel(level);
        return (info.DURABILITY(level) - durability) * infoLevel.GOLD_MAINTAIN;
    }

    public void repair ()
    {
        durability = info.DURABILITY(level);
    }

    public void repair (int num)
    {
        durability = Math.min(info.DURABILITY(level), durability + num);
    }

    public byte checkUpgrade ()
    {
        if (!isUnlock())
            return ErrorConst.NOT_UNLOCK;

        MachineInfo.Level infoNextLevel = info.getLevel(level + 1);
        if (infoNextLevel == null)
            return ErrorConst.LIMIT_LEVEL;

        if (workingTime < infoNextLevel.ACTIVE_TIME)
            return ErrorConst.NOT_ENOUGH_TIME;

        return ErrorConst.SUCCESS;
    }

    public boolean upgrade ()
    {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        if (random.nextInt(100) < info.getLevel(level + 1).UPGRADE_RATIO)
        {
            level++;
            durability = info.DURABILITY(level);
            return true;
        }
        return false;
    }

    public int getPriceGoldUpgrade ()
    {
        return info.getLevel(level + 1).GOLD_UNLOCK;
    }

    public boolean canBuySlot ()
    {
        if (!isUnlock())
            return false;

        return numSlot < info.maxSlot();
    }

    public int priceBuySlot ()
    {
        return info.priceSlot(numSlot);
    }

    public void addSlot ()
    {
        numSlot++;
    }

    public byte checkBuyWorkingTime ()
    {
        if (!isUnlock())
            return ErrorConst.NOT_UNLOCK;

        MachineInfo.Level infoNextLevel = info.getLevel(level + 1);
        if (infoNextLevel == null)
            return ErrorConst.LIMIT_LEVEL;

        if (workingTime >= infoNextLevel.ACTIVE_TIME)
            return ErrorConst.INVALID_ACTION;

        return ErrorConst.SUCCESS;
    }

    public int requireTimeWorking ()
    {
        MachineInfo.Level infoNextLevel = info.getLevel(level + 1);
        return infoNextLevel.ACTIVE_TIME - workingTime;
    }

    public void addWorkingTime ()
    {
        MachineInfo.Level infoNextLevel = info.getLevel(level + 1);
        workingTime = infoNextLevel.ACTIVE_TIME;
    }

    public byte checkProduce (String product, int userLevel)
    {
        if (!isUnlock())
            return ErrorConst.NOT_UNLOCK;
        if (produceItems.size() >= numSlot)
            return ErrorConst.FULL_SLOT;
        if (store.size() >= maxStore())
            return ErrorConst.FULL_STORE;
        if (!info.hasProduct(product))
            return ErrorConst.INVALID_ACTION;
        int levelUnlock = ConstInfo.getItemInfo(product).LEVEL_UNLOCK();
        if (levelUnlock > 0 && userLevel < levelUnlock)
            return ErrorConst.LIMIT_LEVEL;
        return ErrorConst.SUCCESS;
    }

    private int maxStore ()
    {
        return info.INIT_STORE() + numSlot;
    }

    public void produce (ProductInfo info)
    {
        produceItems.add(info.ID());
        durability--;
        workingTime += info.PRODUCTION_TIME();

        if (timeStart == 0 && store.size() < maxStore())
            setTimeProduce(Time.getUnixTime());
    }

    public MapItem harvestItems ()
    {
        if (!isUnlock())
            return null;
        if (store.isEmpty())
            return null;

        String product = store.peek();

        MachineInfo.Level infoLevel = info.getLevel(level);
        ItemInfo info = ConstInfo.getItemInfo(product);
        ProductInfo productInfo = (ProductInfo) info;

        MapItem items = new MapItem(2);
        items.put(product, 1);

        ComboManager combo = floor.game.getComboManager();
        int exp = combo.productionExp(floor.getId(), productInfo.EXP_RECEIVE(), productInfo.EXP_RECEIVE(), infoLevel.EXP_BONUS);

        items.put(ItemId.EXP, exp);

        floor.game.addUpgradeItem(ItemType.PRODUCT, items);

        return items;
    }

    private void updateTimeProduce ()
    {
        if (store.size() >= maxStore())
            clearTimeProduce();
        else if (timeStart == 0 && produceItems.size() > 0)
            setTimeProduce(Time.getUnixTime());
    }

    public void harvest ()
    {
        store.poll();
        updateTimeProduce();
    }

    public byte checkSkipTimeProduce ()
    {
        if (!isUnlock())
            return ErrorConst.NOT_UNLOCK;
        if (produceItems.isEmpty())
            return ErrorConst.EMPTY_PRODUCE;
        if (store.size() >= maxStore())
            return ErrorConst.FULL_STORE;
        if (timeStart == 0)
            return ErrorConst.INVALID_ACTION;

        return ErrorConst.SUCCESS;
    }

    public int timeWait ()
    {
        return timeFinish - timeStart;
    }

    public int timeSkip ()
    {
        return timeFinish - Time.getUnixTime();
    }

    public void skipTimeProduce ()
    {
        store.add(produceItems.poll());
        clearTimeProduce();
        updateTimeProduce();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(MACHINE_TIME_START_UNLOCK, timeStartUnlock);
        msg.put(MACHINE_IS_FINISH_UNLOCK, isFinishUnlock);
        msg.put(MACHINE_LEVEL, level);
        msg.put(MACHINE_NUM_SLOT, numSlot);
        msg.put(MACHINE_DURABILITY, durability);
        msg.put(MACHINE_WORKING_TIME, workingTime);
        msg.putStrings(MACHINE_STORE, store);
        msg.put(MACHINE_TIME_START_PRODUCE, timeStart);
        msg.put(MACHINE_TIME_FINISH_PRODUCE, timeFinish);
        msg.putStrings(MACHINE_PRODUCE_ITEMS, produceItems);

        Interactive.MachineRepair repair = floor.game.interactive.getMachineRepair(floor.getId());
        if (repair != null)
        {
            boolean isFriendView = floor.game.userControl == null;
            boolean isFriendRepair = repair.timeExpire == 0;
            if (isFriendView || isFriendRepair)
            {
                msg.put(MACHINE_FRIEND_ID, repair.userId);
                msg.put(MACHINE_FRIEND_AVATAR, repair.avatar);
                msg.put(MACHINE_FRIEND_REPAIR, repair.num);
            }
        }
    }

    public short getLevel ()
    {
        return level;
    }

    public short getNumSlot ()
    {
        return numSlot;
    }

    public int getDurability ()
    {
        return durability;
    }

    public int getWorkingTime ()
    {
        return workingTime;
    }

    public String headProduceItem ()
    {
        return produceItems.peek();
    }

    public int appraisal ()
    {
        if (!isUnlock())
            return 0;

        MachineInfo.Level infoLevel = info.getLevel(level);
        return infoLevel.APPRAISAL;
    }

    public String getFirstItemStore()
    {
        return store.peekFirst();
    }

    public static class Builder
    {
        private Machine machine;

        public Builder (Machine machine)
        {
            this.machine = machine;
        }

        public Builder setTimeStartUnlock (int timeStartUnlock)
        {
            machine.timeStartUnlock = timeStartUnlock;
            return this;
        }

        public Builder setLevel (short level)
        {
            machine.level = level;
            return this;
        }

        public Builder setNumSlot (short numSlot)
        {
            machine.numSlot = numSlot;
            return this;
        }

        public Builder setDurability (short durability)
        {
            machine.durability = durability;
            return this;
        }

        public Builder setWorkingTime (int workingTime)
        {
            machine.workingTime = workingTime;
            return this;
        }

        public Builder setTimeProduce (int timeProduce)
        {
            setTimeProduce(Time.getUnixTime());
            return this;
        }

        public Builder addStore (int oldProductId)
        {
            ItemInfo info = ConstInfo.getOldItem(ItemInfo.OLD_TYPE_PRODUCT, oldProductId);
            if (info != null)
                machine.store.add(info.ID());

            return this;
        }

        public Builder addProduceItem (int oldProductId)
        {
            ItemInfo info = ConstInfo.getOldItem(ItemInfo.OLD_TYPE_PRODUCT, oldProductId);
            if (info != null)
                machine.produceItems.add(info.ID());

            return this;
        }

    }
}

