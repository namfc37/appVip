package model.object;

import data.*;
import util.serialize.Encoder;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class JackShop extends Encoder.IObject implements KeyDefine
{
    private ArrayList<Slot> slots;

    private JackShop ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static JackShop create ()
    {
        JackShop o = new JackShop();

        return o;
    }

    public static class Slot extends Encoder.IObject
    {
        private String  item;
        private int     num;
        private int     price;
        private boolean isSold;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(PS_SLOT_ITEM, item);
            msg.put(PS_SLOT_NUM, num);
            msg.put(PS_SLOT_PRICE, price);
            msg.put(PS_SLOT_IS_SOLD, isSold);
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

        public void setSold ()
        {
            isSold = true;
        }
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(PS_SLOTS, slots);
    }

    public void resetDaily (int level)
    {
        level = Math.max(level, MiscInfo.PS_USER_LEVEL());

        slots = new ArrayList<>();

        JackGardenInfo.Shop info = ConstInfo.getJackGardenInfo().getShop(level);
        addSlot(UserLevelInfo.UNLOCK_PLANT(level), info.PLANT_SLOT(), info.QUANTITY());
        addSlot(UserLevelInfo.UNLOCK_PEST(level), info.BUG_SLOT(), info.QUANTITY());
    }

    private void addSlot (List<String> items, int numSlot, int quantity)
    {
        if (quantity <= 0)
            return;

        ThreadLocalRandom r = ThreadLocalRandom.current();
        for (int i = 0; i < numSlot; i++)
        {
            String id = items.get(r.nextInt(items.size()));
            ItemInfo info = ConstInfo.getItemInfo(id);
            if (info == null || info.JACK_PS_GOLD() <= 0)
                continue;

            Slot slot = new Slot();
            slot.item = id;
            slot.num = quantity;
            slot.price = info.JACK_PS_GOLD() * quantity;

            slots.add(slot);
        }
    }

    public Slot getSlot (int id)
    {
        if (id < 0 || id >= slots.size())
            return null;
        return slots.get(id);
    }
}
