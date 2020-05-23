package model.object;

import data.*;
import org.omg.CORBA.TIMEOUT;
import util.Time;
import util.serialize.Encoder;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Chest extends Encoder.IObject implements KeyDefine
{
    private String     id;
    private byte       status;
    private int        turn;
    private int        timeStart;
    private int        timeFinish;
    private String     priceType;
    private int        priceTurn;
    private List<Slot> slots;
    private int        winSlot;
    private boolean    useStock;

    private Chest ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Chest create (ChestInfo info)
    {
        Chest o = new Chest();
        o.id = info.ID();
        o.resetDaily(info);
        return o;
    }

    public void update ()
    {
        if (status == MiscDefine.CHEST_STATUS_OPEN && slots == null)
            genSlots(ConstInfo.getChestInfo(id));
    }

    public void resetDaily (ChestInfo info)
    {
        turn = 0;
        update(info);

        //Mở rương đồng lúc reset daily
        if (id.equals(ItemId.RUONG_DONG))
            timeFinish = timeStart;
    }

    private void update (ChestInfo info)
    {
        if (status == MiscDefine.CHEST_STATUS_OPEN)
            return;
        if (!info.isActive(turn))
        {
            status = MiscDefine.CHEST_STATUS_INACTIVE;
            timeStart = 0;
            timeFinish = 0;
            priceType = null;
            priceTurn = 0;
            slots = null;
            winSlot = -1;
            return;
        }

        status = MiscDefine.CHEST_STATUS_ACTIVE;
        timeStart = Time.getUnixTime();
        timeFinish = timeStart + info.getTimeWait();
        priceType = info.getPriceType();
        priceTurn = info.getPriceNum(turn);
        genSlots(info);
    }

    private void genSlots (ChestInfo info)
    {
        slots = info.genSlots(turn);

        int totalRate = 0;
        for (Slot slot : slots)
            totalRate += slot.rate;

        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = random.nextInt(totalRate);

        winSlot = -1;
        for (Slot slot : slots)
        {
            winSlot++;
            if (slot.rate <= 0)
                continue;
            rate -= slot.rate;
            if (rate <= 0)
                break;
        }
    }

    public Slot getWinSlot ()
    {
        if (status != MiscDefine.CHEST_STATUS_OPEN || slots == null || winSlot < 0 || winSlot >= slots.size())
            return null;
        return slots.get(winSlot);
    }

    public void finish ()
    {
        if (!useStock)
            turn++;
        status = MiscDefine.CHEST_STATUS_DONE;
        update(ConstInfo.getChestInfo(id));
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(CHEST_ID, id);
        msg.put(CHEST_STATUS, status);
        msg.put(CHEST_TURN, turn);
        msg.put(CHEST_TIME_START, timeStart);
        msg.put(CHEST_TIME_FINISH, timeFinish);
        msg.put(CHEST_PRICE_TYPE, priceType);
        msg.put(CHEST_PRICE_TURN, priceTurn);
        msg.put(CHEST_SLOTS, slots);
        msg.put(CHEST_WIN_SLOT, isOpening() ? winSlot : -1);
    }

    public static class Slot extends Encoder.IObject implements KeyDefine
    {
        public String id;
        public int    num;

        public  int rate;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(CHEST_SLOT_ITEM, id);
            msg.put(CHEST_SLOT_NUM, num);
        }
    }

    public String getPriceType ()
    {
        return priceType;
    }

    public int getPriceTurn ()
    {
        return priceTurn;
    }

    public boolean isOpening ()
    {
        return status == MiscDefine.CHEST_STATUS_OPEN;
    }

    public void open (boolean useStock)
    {
        status = MiscDefine.CHEST_STATUS_OPEN;
        if (slots == null)
            genSlots(ConstInfo.getChestInfo(id));
        this.useStock = useStock;
    }

    public boolean isStatusActive ()
    {
        return status == MiscDefine.CHEST_STATUS_ACTIVE;
    }

    public boolean isStatusInactive ()
    {
        return status == MiscDefine.CHEST_STATUS_INACTIVE;
    }

    public boolean isWaiting ()
    {
        return timeFinish > 0 && Time.getUnixTime() < timeFinish;
    }

    public String getId ()
    {
        return id;
    }
}
