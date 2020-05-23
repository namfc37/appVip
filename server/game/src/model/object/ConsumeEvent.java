package model.object;

import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.*;

public class ConsumeEvent extends Encoder.IObject implements KeyDefine
{

    private int                          timeStart;
    private HashMap<String, ConsumeType> listConsume;

    private ConsumeEvent ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static ConsumeEvent create ()
    {
        ConsumeEvent s = new ConsumeEvent();
        s.listConsume = new HashMap<>();
        s.timeStart = 0;
        return s;
    }

    public void update ()
    {
        ConsumeEventInfo consumeEventInfo = ConstInfo.getConsumeEventInfo();
        int curTime = Time.getUnixTime();
        if (curTime >= MiscInfo.CONSUME_TIME_START() && curTime <= MiscInfo.CONSUME_TIME_END())
        {
            if (this.timeStart != MiscInfo.CONSUME_TIME_START())
            {
                this.timeStart = MiscInfo.CONSUME_TIME_START();
                consumeEventInfo.resetConsumeType(listConsume);
            }
        }
    }

    public void addConsumed (String id, int num)
    {
        int curTime = Time.getUnixTime();
        if (curTime < MiscInfo.CONSUME_TIME_START() || curTime > MiscInfo.CONSUME_TIME_END())
            return;
        if (timeStart != MiscInfo.CONSUME_TIME_START())
            update();

        if (!this.listConsume.containsKey(id))
            return;

        ConsumeType consumeType = this.listConsume.get(id);
        if (consumeType == null) return;
        consumeType.addConsumed(num);
    }

    public void generateSlot (String id)
    {
        if (!this.listConsume.containsKey(id)) return;

        ConsumeType consumeType = this.listConsume.get(id);
        consumeType.generateSlots();
    }

    public boolean spin (String id)
    {
        if (!this.listConsume.containsKey(id)) return false;

        ConsumeType consumeType = this.listConsume.get(id);
        return consumeType.spin();
    }

    public MapItem getConsumeInfo ()
    {
        MapItem consumeInfo = new MapItem();

        for (Map.Entry<String, ConsumeType> entry : listConsume.entrySet())
        {
            String type = entry.getKey();
            ConsumeType consumeType = entry.getValue();
            int typeConsumed = consumeType.getConsumed();
            if (typeConsumed > 0)
            {
                consumeInfo.increase(type, typeConsumed);
            }
        }
        return consumeInfo;
    }


    public ConsumeType getConsumeType (String id)
    {
        return this.listConsume.get(id);
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(CONSUME_LIST_CONSUME, listConsume.values());
    }

    public static class ConsumeType extends Encoder.IObject implements KeyDefine
    {
        private String        type;
        private int           consumed;
        private int           pointConsumed;
        private int           milestone;
        private int           status;
        private List<MapItem> slots;
        private int           winSlot;
        private int           winSlotType;

        public int getConsumed ()
        {
            return consumed;
        }

        public int getPointConsumed ()
        {
            return pointConsumed;
        }

        public int getMilestone ()
        {
            return milestone;
        }

        public int getWinSlotType ()
        {
            return winSlotType;
        }

        public void setWinSlot (int winSlot)
        {
            this.winSlot = winSlot;
        }

        public void setWinSlotType (int winSlotType)
        {
            this.winSlotType = winSlotType;
        }

        public ConsumeType (String type)
        {
            this.type = type;
            this.consumed = 0;
            this.slots = new ArrayList<>();
            this.milestone = 0;
            this.winSlot = -1;
            this.status = MiscDefine.CONSUME_TYPE_STATUS_CLOSE;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(CONSUME_TYPE_CONSUMED, consumed);
            msg.put(CONSUME_TYPE_POINT_CONSUMED, pointConsumed);
            msg.put(CONSUME_TYPE_MILESTONE, milestone);
            msg.put(CONSUME_TYPE_STATUS, status);
            msg.put(CONSUME_TYPE_WINSLOT, winSlot);
            msg.put(CONSUME_TYPE_WINSLOT_TYPE, winSlotType);
            msg.putMapItem(CONSUME_TYPE_SLOTS, slots);
        }

        public void reset ()
        {
            consumed = 0;
            slots.clear();
            milestone = 0;
        }

        public boolean canSpin ()
        {
            ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = ConstInfo.getConsumeEventInfo().getConsumeEventTypeInfo(type);
            return (this.status == MiscDefine.CONSUME_TYPE_STATUS_CLOSE && this.pointConsumed + consumeEventTypeInfo.CONSUME_CONVERT() * consumeEventTypeInfo.POINT_CONVERT() <= this.consumed);
        }

        public MapItem getReward ()
        {
            return this.slots.get(this.winSlot);
        }

        public int getStatus ()
        {
            return status;
        }

        public boolean spin ()
        {
            ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = ConstInfo.getConsumeEventInfo().getConsumeEventTypeInfo(type);
            if (consumeEventTypeInfo == null || !canSpin())
                return false;
            this.status = MiscDefine.CONSUME_TYPE_STATUS_OPEN;
            this.pointConsumed += consumeEventTypeInfo.CONSUME_CONVERT() * consumeEventTypeInfo.POINT_CONVERT();
            return true;
        }


        public void addConsumed (int consumed)
        {
            this.consumed += consumed;
        }

        public void generateSlots ()
        {
            slots.clear();
            this.status = MiscDefine.CONSUME_TYPE_STATUS_CLOSE;
            this.winSlot = -1;
            slots = ConstInfo.getConsumeEventInfo().genSlots(type, this.consumed, this);
            ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = ConstInfo.getConsumeEventInfo().getTypeInfo(type);

            if (consumeEventTypeInfo != null)
                this.milestone = consumeEventTypeInfo.RATES().floorKey(Math.max(consumeEventTypeInfo.RATES().firstKey(), this.consumed));
            else
                this.milestone = this.consumed;
        }

        public MapItem getWinSlot (int idx)
        {
            if (slots == null || winSlot < 0 || winSlot >= slots.size())
                return null;
            return slots.get(idx);
        }


    }

    public static void test ()
    {

        ConsumeType test = new ConsumeType(ItemId.COIN);
        TreeMap<MapItem, Integer> testCount = new TreeMap<>();

        TreeMap<Integer, Integer> rateGroup = new TreeMap<>();
        TreeMap<Integer, Float> rateMap = new TreeMap<>();
        test.consumed = 6000;
        int total = 0;

        for (int i = 0; i < 1000000; i++)
        {
            test.generateSlots();
            if (!rateGroup.containsKey(test.winSlotType))
                rateGroup.put(test.winSlotType, 1);
            else
                rateGroup.put(test.winSlotType, rateGroup.get(test.winSlotType) + 1);
        }

        for (Integer key : rateGroup.keySet())
        {
            total += rateGroup.get(key);
            // truckRequestRateMap.put(key,truckRequestMap.get(key) * 100 /  )
        }
        for (Integer key : rateGroup.keySet())
        {
            //total += truckRequestMap.get(key);
            float rate = rateGroup.get(key) * 100 / Float.valueOf(total);
            rateMap.put(key, rate);
        }
        System.out.println("Type: " + test.type + " Consumed: " + test.consumed + " \nResult:" + rateMap.entrySet());
    }
}
