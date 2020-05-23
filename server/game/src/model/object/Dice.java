package model.object;

import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.concurrent.ThreadLocalRandom;

public class Dice extends Encoder.IObject implements KeyDefine
{
    private int     timeStart;
    private boolean isEvent;

    private int     spentCoin;
    private int     numTicket;
    private int     numSpin;
    private int     point;
    private int     incomplete;
    private boolean isX2;
    private Slot[]  slots;
    private int     lastPoint;

    public MapItem eventItems;

    private Dice ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Dice create ()
    {
        Dice o = new Dice();
        return o;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(DICE_TIME_START, timeStart);
        msg.put(DICE_TIME_END, isEvent ? MiscInfo.getTimeEndDiceEventDuration(timeStart) : Time.nextTimeResetDaily());
        msg.put(DICE_IS_EVENT, isEvent);
        msg.put(DICE_SPENT_COIN, spentCoin);
        msg.put(DICE_NUM_TICKET, numTicket);
        msg.put(DICE_POS, point % MiscInfo.DICE_SPIN_SIZE());
        msg.put(DICE_INCOMPLETE, incomplete);
        msg.put(DICE_IS_X2, isX2);
        msg.put(DICE_SLOTS, slots);
        msg.put(DICE_EVENT_ITEMS, eventItems);
        msg.put(DICE_NUM_SPIN, numSpin);
    }

    public class Slot extends Encoder.IObject implements KeyDefine
    {
        private String item;
        private int    num;
        private int    rate;

        public Slot (String item, int num, int rate)
        {
            this.item = item;
            this.num = num;
            this.rate = rate;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(DICE_SLOT_ITEM, item);
            msg.put(DICE_SLOT_NUM, num);
        }

        public String getItem ()
        {
            return item;
        }

        public int getNum (boolean isX2)
        {
            return isX2 ? num * 2 : num;
        }
    }

    public void resetDaily (UserGame game)
    {
        int curStart = MiscInfo.getTimeOpenDiceEventDuration();

        //đang trong event
        if (curStart > 0)
        {
            if (isEvent == false || timeStart != curStart)
                reset(game, true, curStart);
        }
        else
        {
            reset(game, false, Time.curTimeResetDaily());
        }
    }

    private void reset (UserGame game, boolean isEvent, int curStart)
    {
        int level = Math.max(game.getLevel(), MiscInfo.DICE_USER_LEVEL());
        this.isEvent = isEvent;
        timeStart = curStart;

        spentCoin = 0;
        numSpin = 0;
        numTicket = isEvent ? MiscInfo.DICE_EVENT_ADD(0) : MiscInfo.DICE_DAILY_ADD(0);
        point = -1;
        lastPoint = -1;
        incomplete = -1;
        isX2 = false;
        initSlot(level);
        resetEventItems(game);
    }

    private void initSlot (int level)
    {
        DiceInfo.SlotInfo[] infos = ConstInfo.getDiceInfo().getSlots(isEvent, level, point);
        slots = new Slot[infos.length];

        for (int i = 0; i < MiscInfo.DICE_SPIN_SIZE(); i++)
        {
            slots[i] = new Slot(infos[i].getId(), infos[i].getNum(), infos[i].getRate());
        }
    }

    private void updateSlot (int level)
    {
        DiceInfo.SlotInfo[] infos = ConstInfo.getDiceInfo().getSlots(isEvent, level, point);
        int i;
        for (; lastPoint < point; lastPoint++)
        {
            if (lastPoint < 0)
                continue;
            i = lastPoint % MiscInfo.DICE_SPIN_SIZE();
            slots[i] = new Slot(infos[i].getId(), infos[i].getNum(), infos[i].getRate());
        }
    }

    public Slot spin (int level)
    {
        numSpin++;
        numTicket--;

        int maxSpin = 6;
        int totalRate = 0;
        for (int i = 1; i <= maxSpin; i++)
        {
            Slot slot = slots[(point + i) % MiscInfo.DICE_SPIN_SIZE()];
            if (slot.rate <= 0)
                continue;
            totalRate += slot.rate;
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = random.nextInt(totalRate);

        lastPoint = point;
        for (int i = 0; i < maxSpin; i++)
        {
            point++;
            incomplete = point % MiscInfo.DICE_SPIN_SIZE();
            Slot slot = slots[incomplete];
            if (slot.rate <= 0)
                continue;
            rate -= slot.rate;
            if (rate <= 0)
                break;
        }

        updateSlot(level);

        return slots[incomplete];
    }

    public Slot getIncompleteSlot ()
    {
        if (incomplete < 0)
            return null;
        return slots[incomplete];
    }

    public void complete (UserGame game)
    {
        if (incomplete >= 0)
        {
            Slot slot = slots[incomplete];
            if (slot.item.equals(ItemId.X2))
                isX2 = true;
            else
            {
                if (slot.item.equals(ItemId.DICE))
                    numTicket += isX2 ? 2 : 1;
                isX2 = false;
            }

        }
        incomplete = -1;
        resetEventItems(game);
    }

    private void resetEventItems (UserGame game)
    {
        Festival festival = game.getFestival();
        if (festival == null)
            eventItems = null;
        else
            eventItems = festival.collectEP(game, CmdDefine.DICE_SPIN, numSpin);

        Fishing fishing = game.getFishing();
        eventItems.increase(fishing.collectEP(game, CmdDefine.DICE_SPIN, numSpin));
    }

    public void addSpentCoin (int value)
    {
        int oldSpentCoin = spentCoin;
        spentCoin += value;
        int mark;

        if (isEvent)
        {
            for (int i = 1; i < MiscInfo.DICE_EVENT_PRICE_SIZE(); i++)
            {
                mark = MiscInfo.DICE_EVENT_PRICE(i);
                if (mark > spentCoin)
                    break;
                if (mark <= oldSpentCoin)
                    continue;
                numTicket += MiscInfo.DICE_EVENT_ADD(i);
            }
        }
        else
        {
            for (int i = 1; i < MiscInfo.DICE_DAILY_PRICE_SIZE(); i++)
            {
                mark = MiscInfo.DICE_DAILY_PRICE(i);
                if (mark > spentCoin)
                    break;
                if (mark <= oldSpentCoin)
                    continue;
                numTicket += MiscInfo.DICE_DAILY_ADD(i);
            }
        }
    }

    public int getNumTicket ()
    {
        return numTicket;
    }

    public int getIncomplete ()
    {
        return incomplete;
    }

    public boolean isX2 ()
    {
        return isX2;
    }

    public int getNumSpin ()
    {
        return numSpin;
    }
}
