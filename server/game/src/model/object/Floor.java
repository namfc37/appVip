package model.object;

import data.ConstInfo;
import data.KeyDefine;
import data.SkinInfo;
import model.UserGame;
import util.serialize.Encoder;

public class Floor extends Encoder.IObject implements KeyDefine
{
    public final static byte NUM_SLOT = 6;

    private int       id;
    private Machine   machine;
    private Slot[]    slots;
    private CloudSkin skin;

    public transient UserGame game;

    private Floor ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Floor create (int id, UserGame game)
    {
        Floor floor = new Floor();
        floor.machine = Machine.create();
        floor.slots = new Slot[NUM_SLOT];
        for (int i = 0; i < NUM_SLOT; i++)
            floor.slots[i] = Slot.create(i);

        floor.skin = CloudSkin.create();

        floor.init(id, game);
        return floor;
    }

    public void init (int id, UserGame game)
    {
        this.id = id;
        this.game = game;
        machine.floor = this;

        for (Slot slot : slots)
            slot.floor = this;

        machine.init(id);
    }

    public void applySkin (SkinInfo newSkin)
    {
        if (newSkin == null)
            return;

        if (this.skin == null)
            this.skin = CloudSkin.create();

        this.skin.apply(newSkin);
    }

    public void clearSkin ()
    {
        this.skin = CloudSkin.create();
    }

    public void update ()
    {
        machine.update();
    }

    public Slot getSlot (int iSlot)
    {
        if (iSlot < 0 || iSlot >= slots.length)
            return null;

        return slots[iSlot];
    }

    public Machine getMachine ()
    {
        return machine;
    }

    public int getId ()
    {
        return id;
    }

    public CloudSkin getSkin ()
    {
        return this.skin;
    }

    public boolean hasSkin ()
    {
        if (skin == null)
            return false;

        if (skin.isExpire())
        {
            skin.reset();
            return false;
        }

        return true;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(FLOOR_MACHINE, machine);
        msg.put(FLOOR_SLOTS, slots);
        msg.put(FLOOR_SKIN, skin);
    }

    public int appraisal ()
    {
        int value = ConstInfo.getFloorInfo(this.id).APPRAISAL();

        if (hasSkin())
            value += getSkin().appraisal();

        value += machine.appraisal();

        for (int i = 0; i < NUM_SLOT; i++)
        {
            Slot s = slots[i];
            if (s == null)
                continue;

            value += s.appraisal();
        }

        return value;
    }

    public static class Builder
    {
        private Floor floor;

        public Builder (Floor floor)
        {
            this.floor = floor;
        }

        public Machine.Builder getMachine ()
        {
            return new Machine.Builder(floor.getMachine());
        }

        public Slot.Builder getSlot (int iSlot)
        {
            return new Slot.Builder(floor.slots[iSlot]);
        }
    }

    public int gmRecallItemPot (String id, int numRecall)
    {
        int totalRemove = 0;
        for (Slot slot : slots)
        {
            if (totalRemove >= numRecall)
                break;
            if (slot == null)
                continue;
            if (!id.equals(slot.getPot()))
                continue;
            slot.harvest();
            slot.removePot();
            totalRemove++;
        }
        return totalRemove;
    }
}
