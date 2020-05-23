package data;

import model.object.Chest;
import util.Time;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class ChestInfo extends ItemInfo
{
    private String                   PRICE_TYPE;
    private int[]                    PRICE_TURN;
    private int                      TIME_WAIT;
    private int[][]                  DURATION;
    private Map<Integer, List<Item>> GROUPS;
    private Rate[]                   RATES;

    private class Item
    {
        private String id;
        private int    num;
    }

    private class Rate
    {
        private int[] group;
        private int[] rate;
    }

    @Override
    void buildCache ()
    {

    }

    public String getPriceType ()
    {
        return PRICE_TYPE;
    }

    public int getPriceNum (int turn)
    {
        if (PRICE_TURN == null)
            return 0;
        if (turn < 0 || turn >= PRICE_TURN.length)
            return -1;
        return PRICE_TURN[turn];
    }

    public int getTimeWait ()
    {
        return TIME_WAIT;
    }

    public boolean isActive (int turn)
    {
        boolean inDuration = DURATION == null || Time.isInDuration(DURATION);
        boolean hasTurn = PRICE_TURN == null || turn < PRICE_TURN.length;
        return inDuration && hasTurn;
    }

    public List<Chest.Slot> genSlots (int turn)
    {
        Rate table = RATES[turn % RATES.length];
        int len = table.group.length;
        List<Chest.Slot> r = new ArrayList<>(len);
        HashSet<Item> setItem = new HashSet<>();
        ThreadLocalRandom random = ThreadLocalRandom.current();

        Item item = null;
        int pos;
        for (int i = 0; i < len; i++)
        {
            Chest.Slot slot = new Chest.Slot();
            r.add(slot);
            slot.rate = table.rate[i];
            List<Item> items = GROUPS.get(table.group[i]);
            pos = random.nextInt(items.size());
            for (int j = 0; j < items.size(); j++)
            {
                item = items.get((pos + j) % items.size());
                if (setItem.add(item))
                    break;
            }
            slot.id = item.id;
            slot.num = item.num;
        }

        Collections.shuffle(r);
        return r;
    }

    /*public void test ()
    {
        Debug.info("test", ID());
        for (int test = 0; test < 100000; test++)
        {
            for (int turn = 0; turn < 20; turn++)
            {
                List<Chest.Slot> slots = genSlots(turn);
                for (Chest.Slot slot : slots)
                {
                    if (slot.id == null || slot.id.isEmpty())
                        throw new RuntimeException("Invalid id");
                    if (slot.num <= 0)
                        throw new RuntimeException("Invalid num");
                }
            }
        }
        Debug.info("test", ID(), "done");
    }*/
}

