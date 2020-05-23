package model.object;

import data.ComboInfo;
import data.ConstInfo;
import data.ItemInfo;
import data.MiscDefine;
import model.UserGame;
import util.Time;

import java.util.*;

public class ComboManager
{
    private List<ComboFloor> floors         = new ArrayList<>();
    private int[]            buffNum        = new int[MiscDefine.BUFF_NUM_BUFF];
    private int[]            buffPer        = new int[MiscDefine.BUFF_NUM_BUFF];
    private int              nextTimeUpdate = -1;

    private transient UserGame game;

    public ComboManager (UserGame game)
    {
        this.game = game;
        update();
    }

    public void update ()
    {
        //clear
        Arrays.fill(buffNum, 0);
        Arrays.fill(buffPer, 0);
        floors.clear();

        nextTimeUpdate = -1;

        //add combo info
        for (byte idFloor = 0; idFloor < game.numFloor(); idFloor++)
        {
            ComboFloor floor = new ComboFloor(idFloor);
            floors.add(floor);
            for (byte idSlot = 0; idSlot < Floor.NUM_SLOT; idSlot++)
            {
                Slot slot = game.getSlot(idFloor, idSlot);
                if (slot == null)
                    continue;
                String pot = slot.getPot();
                if (pot != null)
                    floor.add(pot);
                String decor = slot.getDecor();
                if (decor != null)
                    floor.add(decor);
            }

            Floor cloud = game.getFloor(idFloor);
            if (cloud.hasSkin())
            {
                CloudSkin skin = cloud.getSkin();

                if (nextTimeUpdate == -1 || nextTimeUpdate > skin.getEndTime())
                    nextTimeUpdate = skin.getEndTime();

                floor.add(skin.getSkinId());
            }
        }

        int numItem, numBuff;
        for (ComboFloor f : floors)
        {
            Iterator<Combo> it = f.combos.values().iterator();
            while (it.hasNext())
            {
                Combo combo = it.next();
                ComboInfo comboInfo = ConstInfo.getComboInfo(combo.id);

                //kiểm nếu số item trong combo không đủ thì xóa combo
                numItem = combo.items.size();
                if (numItem < comboInfo.INIT())
                {
                    it.remove();
                    continue;
                }
                //duyệt qua các thuộc tính đang active
                numBuff = comboInfo.STEP() == 0 ? comboInfo.NUM_BUFF_INFO() - 1 : (numItem - comboInfo.INIT()) / comboInfo.STEP();
                for (int i = 0; i <= numBuff; i++)
                {
                    ComboInfo.BuffInfo buffInfo = comboInfo.BUFF_INFO(i);
                    int[] buff;
                    if (buffInfo.getArea() == MiscDefine.GLOBAL)
                    {
                        if (buffInfo.getUnit() == MiscDefine.NUM)
                            buff = buffNum;
                        else
                            buff = buffPer;
                    }
                    else
                    {
                        if (buffInfo.getUnit() == MiscDefine.NUM)
                            buff = f.buffNum;
                        else
                            buff = f.buffPer;
                    }
                    buff[buffInfo.getType()] += buffInfo.getValue() + buffInfo.getBonus() * (numItem - 1);
                }
            }
        }
        //MetricLog.info(Json.toJsonPretty(this));
    }

    public boolean needUpdate ()
    {
        return nextTimeUpdate > -1 && nextTimeUpdate < Time.getUnixTime();
    }

    private class ComboFloor
    {
        private int                    idFloor;
        private HashMap<String, Combo> combos  = new HashMap<>();
        private int[]                  buffNum = new int[MiscDefine.BUFF_NUM_BUFF];
        private int[]                  buffPer = new int[MiscDefine.BUFF_NUM_BUFF];

        public ComboFloor (int id)
        {
            this.idFloor = id;
        }

        private void add (String item)
        {
            ItemInfo info = ConstInfo.getItemInfo(item);
            if (info == null || info.COMBO_ID() == null)
                return;
            Combo combo = combos.get(info.COMBO_ID());
            if (combo == null)
                combos.put(info.COMBO_ID(), new Combo(info));
            else
                combo.items.add(item);
        }
    }

    private class Combo
    {
        private String          id;
        private HashSet<String> items;

        public Combo (ItemInfo info)
        {
            id = info.COMBO_ID();
            items = new HashSet<>();
            items.add(info.ID());
        }
    }

    private int sumNum (int type, int floor, int init)
    {
        int sum = init + buffNum[type];
        if (floor >= 0 && floor < floors.size())
            sum += floors.get(floor).buffNum[type];
        return sum;
    }

    private int sumPercent (int type, int floor, int init)
    {
        int sum = init + buffPer[type];
        if (floor >= 0 && floor < floors.size())
            sum += floors.get(floor).buffPer[type];
        return sum;
    }

    private int calcTime (int type, int floor, int value, int initNum, int initPercent)
    {
        int num = sumNum(type, floor, initNum);
        int percent = sumPercent(type, floor, initPercent);

        return (value * (100 - percent) / 100) - num;
    }

    private int calcValue (int type, int floor, int value, int initNum, int initPercent)
    {
        int num = sumNum(type, floor, initNum);
        int percent = sumPercent(type, floor, initPercent);

        return (value * percent / 100) + num;
    }

    public int harvestTime (int floor, int value, int initNum, int initPercent)
    {
        return calcTime(MiscDefine.BUFF_HARVEST_TIME, floor, value, initNum, initPercent);
    }

    public int harvestGold (int floor, int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_HARVEST_GOLD, floor, value, initNum, initPercent);
    }

    public int harvestExp (int floor, int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_HARVEST_EXP, floor, value, initNum, initPercent);
    }

    public int productionTime (int floor, int value, int initNum, int initPercent)
    {
        return calcTime(MiscDefine.BUFF_PRODUCTION_TIME, floor, value, initNum, initPercent);
    }

    public int productionExp (int floor, int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_PRODUCT_COLLECT_EXP, floor, value, initNum, initPercent);
    }

    public int orderGold (int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_ORDER_GOLD, -1, value, initNum, initPercent);
    }

    public int orderExp (int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_ORDER_EXP, -1, value, initNum, initPercent);
    }

    public int airshipGold (int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_AIRSHIP_GOLD, -1, value, initNum, initPercent);
    }

    public int airshipExp (int value, int initNum, int initPercent)
    {
        return calcValue(MiscDefine.BUFF_AIRSHIP_EXP, -1, value, initNum, initPercent);
    }
}
