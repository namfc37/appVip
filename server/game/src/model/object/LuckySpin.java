package model.object;

import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class LuckySpin extends Encoder.IObject implements KeyDefine
{
    private int        numPay;
    private boolean    isX2;
    private byte       numSpin;
    private List<Slot> slots;
    private byte       incomplete;

    private int              timeReset;
    private TreeSet<Integer> nextTimeReset;

    public MapItem eventItems;

    private LuckySpin ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static LuckySpin create ()
    {
        LuckySpin o = new LuckySpin();
        return o;
    }

    public void resetDaily (UserGame game)
    {
        timeReset = 0;
        nextTimeReset = null;
    }

    public void update (UserGame game)
    {
        if (nextTimeReset == null)
        {
            nextTimeReset = new TreeSet<>();
            for (int i = 0; i < MiscInfo.SPIN_RESET_HOURS_SIZE(); i++)
            {
                //Debug.info("LuckySpin.update", "add", i, MiscInfo.SPIN_RESET_HOURS(i));
                nextTimeReset.add(Time.getTimebyHours(MiscInfo.SPIN_RESET_HOURS(i)));
            }
        }

        boolean isReset = false;
        if (nextTimeReset != null)
        {
            int curTime = Time.getUnixTime();
            for (Iterator<Integer> it = nextTimeReset.iterator(); it.hasNext(); )
            {
                int time = it.next();
                if (curTime < time)
                    break;
                it.remove();
                //Debug.info("LuckySpin.update", "remove", time);
                if (timeReset < time)
                {
                    isReset = true;
                    break;
                }
            }
        }

        boolean isEmpty = slots == null;

        if (isEmpty || isReset)
            reset(game);
    }

    private void reset (UserGame game)
    {
        //Debug.trace("LuckySpin.reset");
        int level = game.getLevel();
        if (level < MiscInfo.SPIN_USER_LEVEL())
            level = MiscInfo.SPIN_USER_LEVEL();

        timeReset = Time.getUnixTime();
        eventItems = null;
        isX2 = false;
        numSpin = 0;
        slots = new ArrayList<>();
        incomplete = -1;

        LuckySpinInfo info = ConstInfo.getLuckySpinInfo();
        ThreadLocalRandom r = ThreadLocalRandom.current();

        addItem(MiscInfo.SPIN_PLANT_SLOT(), info.plant(level), MiscInfo.SPIN_PLANT_RECEIVE_NUM(), r, level);
        addItem(MiscInfo.SPIN_PRODUCT_SLOT(), info.product(level), MiscInfo.SPIN_PRODUCT_RECIEVE_NUM(), r, level);
        addItem(MiscInfo.SPIN_MATERIAL_SLOT(), info.material(level), MiscInfo.SPIN_MATERIAL_RECIEVE_NUM(), r, level);
        addItem(MiscInfo.SPIN_POT_SLOT(), info.pot(level), MiscInfo.SPIN_POT_RECIEVE_NUM(), r, level);
        addItem(MiscInfo.SPIN_DECOR_SLOT(), info.decor(level), MiscInfo.SPIN_DECOR_RECIEVE_NUM(), r, level);
        addItem(MiscInfo.SPIN_GOLD_SLOT(), ItemId.GOLD, info.gold(level));
        addItem(MiscInfo.SPIN_COIN_SLOT(), ItemId.COIN, MiscInfo.SPIN_COIN_RECIEVE_NUM());
        Collections.shuffle(slots);

        //rải đều vị trí x2
        for (int i = 0; i < MiscInfo.SPIN_X2_SLOT(); i++)
            slots.add(i * 6 + r.nextInt(5), new Slot(ItemId.X2, 1));

        resetEventItems(game);
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(SPIN_X2, isX2);
        msg.put(SPIN_NUM_SPIN, numSpin);
        msg.put(SPIN_SLOTS, slots);
        msg.put(SPIN_INCOMPLETE, incomplete);
        msg.put(SPIN_EVENT_ITEMS, eventItems);
    }

    public static class Slot extends Encoder.IObject implements KeyDefine
    {
        private String item;
        private int    num;

        private transient int rate;

        public Slot (String item, int num)
        {
            this.item = item;
            this.num = num;
        }

        @Override
        public void putData (Encoder msg)
        {
            msg.put(SPIN_SLOT_ITEM, item);
            msg.put(SPIN_SLOT_NUM, num);
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

    private void resetEventItems (UserGame game)
    {
        Festival festival = game.getFestival();
        if (festival == null)
            eventItems = null;
        else
            eventItems = festival.collectEP(game, CmdDefine.LUCKY_SPIN, numSpin);
        Fishing fishing = game.getFishing();
        eventItems.increase(fishing.collectEP(game, CmdDefine.LUCKY_SPIN, numSpin));
    }

    private void addItem (int numSlot, String[] items, int num, ThreadLocalRandom r, int level)
    {
        if (numSlot <= 0 || items == null || items.length == 0)
            return;
        List<String> allowItems = new ArrayList<>(numSlot);
        for (String id : items)
        {
            ItemInfo info = ConstInfo.getItemInfo(id);
            if (info.LEVEL_UNLOCK() <= level)
                allowItems.add(id);
        }

        for (int i = 0; i < numSlot; i++)
        {
            String id = allowItems.remove(r.nextInt(allowItems.size()));
            slots.add(new Slot(id, num));
        }
    }

    private void addItem (int numSlot, String item, int num)
    {
        if (numSlot <= 0)
            return;
        for (int i = 0; i < numSlot; i++)
            slots.add(new Slot(item, num));
    }

    public Slot spin ()
    {
        int group;

        if (isX2)
            group = MiscInfo.SPIN_GROUP_X2();
        else
            group = MiscInfo.SPIN_GROUP_NORMAL();

        int maxSpin = Math.min(6, slots.size());
        int idSpin = numSpin % MiscInfo.SPIN_PRICE_TURN_SIZE();
        boolean useCoin = MiscInfo.SPIN_PRICE_TURN(idSpin) > 0;
        if (useCoin)
        {
            numPay++;
            if (numPay > MiscInfo.SPIN_MARK_GROUP_COIN())
            {
                group = MiscInfo.SPIN_GROUP_COIN();
                numPay = 0;
            }
        }
        numSpin++;

        LuckySpinInfo info = ConstInfo.getLuckySpinInfo();
        int totalRate = 0;
        for (int i = 0; i < maxSpin; i++)
        {
            Slot slot = slots.get(i);
            ItemInfo itemInfo = ConstInfo.getItemInfo(slot.item);
            switch (itemInfo.TYPE())
            {
                case ItemType.PLANT:
                    slot.rate = info.ratePlant(group, idSpin);
                    break;
                case ItemType.PEARL:
                case ItemType.PRODUCT:
                    slot.rate = info.rateProduct(group, idSpin);
                    break;
                case ItemType.MATERIAL:
                    slot.rate = info.rateMaterial(group, idSpin);
                    break;
                case ItemType.POT:
                    slot.rate = info.ratePot(group, idSpin);
                    break;
                case ItemType.DECOR:
                    slot.rate = info.rateDecor(group, idSpin);
                    break;
                default:
                    switch (itemInfo.ID())
                    {
                        case ItemId.COIN:
                            slot.rate = info.rateCoin(group, idSpin);
                            break;
                        case ItemId.GOLD:
                            slot.rate = info.rateGold(group, idSpin);
                            break;
                        case ItemId.X2:
                            slot.rate = info.rateX2(group, idSpin);
                            break;
                        default:
                            slot.rate = 0;
                    }
            }
            totalRate += slot.rate;
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = random.nextInt(totalRate);
        incomplete = -1;
        for (byte i = 0; i < maxSpin; i++)
        {
            Slot slot = slots.get(i);
            if (slot.rate <= 0)
                continue;
            rate -= slot.rate;
            if (rate <= 0)
            {
                incomplete = i;
                break;
            }
        }
        if (incomplete < 0)
            incomplete = (byte) random.nextInt(maxSpin);
        return slots.get(incomplete);
    }

    public boolean isX2 ()
    {
        return isX2;
    }

    public byte getNumSpin ()
    {
        return numSpin;
    }

    public byte getIncomplete ()
    {
        return incomplete;
    }

    public Slot getIncompleteSlot ()
    {
        if (incomplete < 0 || incomplete >= slots.size())
            return null;
        return slots.get(incomplete);
    }

    public void complete (UserGame game)
    {
        if (incomplete >= 0 && incomplete < slots.size())
        {
            Slot slot = slots.remove(incomplete);
            if (slot.item.equals(ItemId.X2))
                isX2 = true;
        }
        incomplete = -1;

        resetEventItems(game);
    }

    /*public static void test ()
    {
        LuckySpin o = LuckySpin.create();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int level = r.nextInt(MiscInfo.SPIN_USER_LEVEL(), 100);
        MetricLog.info("level", level);
        MetricLog.info("before reset", Json.toJsonPretty(o));
        o.reset(level);
        MetricLog.info("after reset", o.slots.size(), Json.toJsonPretty(o));
        for (int i = 1; i <= MiscInfo.SPIN_PRICE_TURN_SIZE(); i++)
        {
            Slot slot = o.spin();
            MetricLog.info("spin", i, "slot", o.incomplete, Json.toJson(slot));
            MetricLog.info("spin", o.slots.size(), Json.toJsonPretty(o));
            o.complete();
            MetricLog.info("complete", o.slots.size(), Json.toJsonPretty(o));
        }

        o.reset(level);
        MetricLog.info("reset", o.slots.size(), Json.toJsonPretty(o));
    }*/
}
