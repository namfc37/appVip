package data;

import java.util.TreeMap;

public class DiceInfo
{
    private TreeMap<Integer, SlotInfo[][]> DAILY;
    private TreeMap<Integer, SlotInfo[][]> EVENT;

    public static class SlotInfo
    {
        private String id;
        private int    num;
        private int    rate;

        public String getId ()
        {
            return id;
        }

        public int getNum ()
        {
            return num;
        }

        public int getRate ()
        {
            return rate;
        }
    }

    public SlotInfo[] getSlots (boolean isEvent, int level, int point)
    {
        SlotInfo[] slots = new SlotInfo[MiscInfo.DICE_SPIN_SIZE()];
        SlotInfo[][] data = (isEvent ? EVENT : DAILY).floorEntry(level).getValue();
        int round, pos;
        if (point >= 0)
        {
            round = point / MiscInfo.DICE_SPIN_SIZE();
            pos = point % MiscInfo.DICE_SPIN_SIZE();
        }
        else
        {
            round = 0;
            pos = 0;
        }
        System.arraycopy(data[round % data.length], pos, slots, pos, MiscInfo.DICE_SPIN_SIZE() - pos);
        System.arraycopy(data[(round + 1) % data.length], 0, slots, 0, pos);
        return slots;
    }

    /*public static void test ()
    {
        test(false);
        test(true);
    }

    public static void test (boolean isEvent)
    {
        Debug.info("isEvent", isEvent, "start");
        DiceInfo d = ConstInfo.getDiceInfo();
        for (int t = 0; t < 1000; t++)
            for (short lv = 1; lv < 200; lv++)
                for (int point = 1; point < 100; point++)
                    d.getSlots(isEvent, lv, point);
        Debug.info("isEvent", isEvent, "end");
    }*/

}
