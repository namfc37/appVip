package model.object;

import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.concurrent.ThreadLocalRandom;

public class Slot extends Encoder.IObject implements KeyDefine
{
    private int  id;
    private String  decor;
    private String  pot;
    private String  plant;
    private String  pest;
    private int     timeStart;
    private int     timeFinish;
    private MapItem dropItems;
    private MapItem eventItems;

    public transient Floor floor;

    private Slot ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Slot create (int id)
    {
        Slot slot = new Slot();
        slot.id = id;
        return slot;
    }

    public void plant (String idPlant, int time, int bonusBugRate)
    {
        plant = idPlant;

        PotInfo potInfo = (PotInfo) ConstInfo.getItemInfo(pot);
        PlantInfo plantInfo = (PlantInfo) ConstInfo.getItemInfo(plant);
        ThreadLocalRandom random = ThreadLocalRandom.current();

        UserGame game = floor.game;
        ComboManager combo = game.getComboManager();
        timeStart = time;
        timeFinish = timeStart + Math.max(10, combo.harvestTime(floor.getId(), plantInfo.GROW_TIME(), potInfo.TIME_DECREASE_DEFAULT(), 0));
        if (plantInfo.EVENT_ID() != null)
        {
            timeFinish = timeStart + plantInfo.GROW_TIME();
        }

        int ratePest = potInfo.BUG_APPEAR_RATIO() + plantInfo.BUG_APPEAR_RATIO();
        ratePest += bonusBugRate;

        dropItems = new MapItem(3);
        eventItems = null;
        int gold, percentGold;
        int exp;
        if (plantInfo.EVENT_ID() == null)
        {
            dropItems.put(plant, 2);
            gold = combo.harvestGold(floor.getId(), plantInfo.HARVEST_GOLD(), plantInfo.HARVEST_GOLD(), potInfo.GOLD_INCREASE());
            exp = combo.harvestExp(floor.getId(), plantInfo.HARVEST_EXP(), plantInfo.HARVEST_EXP() + potInfo.EXP_INCREASE(), 0);

            percentGold = 0;
            for (int i = Floor.NUM_SLOT - 1; i >= 0; i--)
            {
                String decor = floor.getSlot(i).getDecor();
                if (decor == null)
                    continue;
                DecorInfo decorInfo = (DecorInfo) ConstInfo.getItemInfo(decor);

                percentGold += decorInfo.GOLD_INCREASE();
                exp += decorInfo.EXP_INCREASE();

                timeFinish -= decorInfo.TIME_DECREASE_DEFAULT();
                ratePest += decorInfo.BUG_APPEAR_RATIO();
            }
            gold += percentGold * plantInfo.HARVEST_GOLD() / 100;

            game.addUpgradeItem(ItemType.PLANT, dropItems);
        }
        else //cây event
        {
            gold = plantInfo.HARVEST_GOLD();
            exp = plantInfo.HARVEST_EXP();
        }

        if (gold > 0)
            dropItems.put(ItemId.GOLD, gold);
        if (exp > 0)
            dropItems.put(ItemId.EXP, exp);

        game.countPlant++;
        if (game.getLevel() > 1)
        {
            if (ratePest >= 100 || (ratePest > 0 && random.nextInt(100) < ratePest))
                pest = plantInfo.BUG_ID();
            else
                pest = null;
        }
        else
        {
            if (game.countPlant >= 7 && game.countPlant <= 12 && floor.getId() == 0 && id == 0)
                pest = plantInfo.BUG_ID();
            else
                pest = null;
        }
    }

    public int getTimeHarvest ()
    {
        return timeFinish;
    }

    public String getPlant ()
    {
        return plant;
    }

    public String getPot ()
    {
        return pot;
    }

    public void putPot (String idPot)
    {
        pot = idPot;
    }

    public void removePot ()
    {
        pot = null;
    }

    public String getDecor ()
    {
        return decor;
    }

    public void putDecor (String idDecor)
    {
        decor = idDecor;
    }

    public void removeDecor ()
    {
        decor = null;
    }

    public void skipTime ()
    {
        timeStart = 0;
        timeFinish = 0;
        pest = null;
    }

    public boolean canUpgradePot ()
    {
        return pot != null;
    }

    public boolean isEmptyPot ()
    {
        return pot != null && plant == null;
    }

    public boolean canPutPot ()
    {
        return pot == null;
    }

    public boolean hasDecor ()
    {
        return decor != null;
    }

    public boolean canSkipTime ()
    {
        return pot != null && plant != null && timeStart > 0;
    }

    public boolean canCatchBug (int time)
    {
        if (pot == null || plant == null || timeStart == 0 || pest == null)
            return false;
        if (floor.game.getLevel() <= 1)
            return true;
        return time < getTimeHarvest();
    }

    public boolean canHarvest ()
    {
        if (pot == null || plant == null)
            return false;

        if (timeStart > 0)
        {
            int timeHarvest = getTimeHarvest();
            int curTime = Time.getUnixTime();

            if (curTime < timeHarvest)
                return false;
        }

        return true;
    }

    public void harvest ()
    {
        plant = null;
        pest = null;
        timeStart = 0;
        timeFinish = 0;
        dropItems = null;
        eventItems = null;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(SLOT_DECOR, decor);
        msg.put(SLOT_POT, pot);
        msg.put(SLOT_PLANT, plant);
        msg.put(SLOT_PEST, pest);
        msg.put(SLOT_TIME_START, timeStart);
        msg.put(SLOT_TIME_FINISH, timeFinish);
        msg.put(SLOT_DROP_ITEMS, dropItems);
        msg.put(SLOT_EVENT_ITEMS, eventItems);
    }


    public String getPest ()
    {
        return pest;
    }

    public void removePest ()
    {
        pest = null;
    }

    public static class Builder
    {
        private Slot slot;

        public Builder (Slot slot)
        {
            this.slot = slot;
        }

        public Builder setDecor (int oldId)
        {
            ItemInfo info = ConstInfo.getOldItem(ItemInfo.OLD_TYPE_DECOR, oldId);
            if (info != null)
                slot.decor = info.ID();

            return this;
        }

        public Builder setPot (short oldId)
        {
            ItemInfo info = ConstInfo.getOldItem(ItemInfo.OLD_TYPE_POT, oldId);
            if (info != null)
                slot.pot = info.ID();

            return this;
        }

        public Builder setPlant (short oldId)
        {
            ItemInfo info = ConstInfo.getOldItem(ItemInfo.OLD_TYPE_PLANT, oldId);
            if (info != null)
                slot.plant = info.ID();

            return this;
        }

        public Builder setPest (boolean hasPest)
        {
            if (!hasPest)
                return this;

            PlantInfo plantInfo = (PlantInfo) ConstInfo.getItemInfo(slot.plant);
            if (plantInfo != null)
                slot.pest = plantInfo.BUG_ID();

            return this;
        }

        public Builder setTimeStart (int timeStart)
        {
            slot.timeStart = timeStart;

            return this;
        }
    }

    public MapItem getDropItems ()
    {
        return dropItems;
    }

    public MapItem getEventItems ()
    {
        return eventItems;
    }

    public void resetEventItems ()
    {
        if (eventItems == null)
            eventItems = new MapItem();
        else
            eventItems.clear();
    }

    //Add event item lúc harvest. Client sẽ hiện thị rớt sau khi nhận được response
    public void addEventItems (String id, int num)
    {
        if (id == null || num <= 0)
            return;
        if (eventItems == null)
            eventItems = new MapItem();
        eventItems.increase(id, num);
    }

    public void addEventItems (MapItem items)
    {
        if (items == null || items.isEmpty())
            return;

        if (eventItems == null)
            eventItems = new MapItem();

        eventItems.increase(items);
    }

    public int appraisal ()
    {
        int value = 0;

        if (pot != null && !pot.isEmpty())
        {
            PotInfo potInfo = (PotInfo) ConstInfo.getItemInfo(pot, ItemType.POT);
            if (potInfo != null)
                value += potInfo.APPRAISAL();
        }

        if (decor != null && !decor.isEmpty())
        {
            DecorInfo decorInfo = (DecorInfo) ConstInfo.getItemInfo(decor, ItemType.DECOR);
            if (decorInfo != null)
                value += decorInfo.APPRAISAL();
        }

        return value;
    }
}
