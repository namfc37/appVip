package model.object;

import data.*;
import model.UserGame;
import util.Time;
import util.collection.MapItem;
import util.serialize.Encoder;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class Order extends Encoder.IObject implements KeyDefine
{
    private static byte[] NO_NPC = {MiscDefine.NPC_02,
                                    MiscDefine.NPC_03,
                                    MiscDefine.NPC_05,
                                    MiscDefine.NPC_06,
                                    MiscDefine.NPC_07,
                                    MiscDefine.NPC_08,
                                    MiscDefine.NPC_09,
                                    MiscDefine.NPC_10,
                                    MiscDefine.NPC_11
    };

    private int     id;
    private byte    subType;
    private byte    status;
    private int     time;
    private int     price;
    private byte    npc;
    private MapItem requireItems;
    private MapItem rewardItems;
    private MapItem bonusItems; //tính dựa trên reward và % của bộ chậu + máy bọ

    transient int slotId;

    private Order ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    void update (UserGame game)
    {
        if (status == MiscDefine.ORDER_STATUS_CANCEL && getTimeFinish(game.getLevel()) <= Time.getUnixTime())
        {
            if (price > 0)
                inactive();
            else
                active();
        }
    }

    public int getTimeFinish (int userLevel)
    {
        return time + getTimeWait(userLevel);
    }

    public int getTimeWait (int userLevel)
    {
        if (subType == ItemSubType.ORDER_DAILY_PAID)
            return MiscInfo.ORDER_TIME_WAIT_PAID_ORDER();

        return UserLevelInfo.NEW_ORDER_WAIT_TIME(userLevel);
    }

    public boolean isDaily ()
    {
        return subType == ItemSubType.ORDER_DAILY_PAID || subType == ItemSubType.ORDER_DAILY_FREE;
    }

    private void genBonusItems (UserGame game, int exp, int gold)
    {
        UserGame.BonusOrder bonus = game.getBonusOrder();
        ComboManager combo = game.getComboManager();
        MapItem temp = new MapItem();

        exp = combo.orderExp(exp, 0, bonus.percentExp);
        gold = combo.orderGold(gold, 0, bonus.percentGold);

        if (exp > 0)
            temp.put(ItemId.EXP, exp);

        if (gold > 0)
            temp.put(ItemId.GOLD, gold);

        //gen event item
        Festival festival = game.getFestival();
        temp.increase(festival.collectEP(game, CmdDefine.ORDER_GET_REWARD, ItemSubType.NAME[getSubType()]));

        if (temp.size() > 0)
        {
            if (bonusItems == null)
                bonusItems = temp;
            else
                bonusItems.increase(temp);
        }
    }

    static Order createDailyOrder (UserGame game, int numDaily)
    {
        int maxFreeOrder = UserLevelInfo.DO_FREE_UNLOCK(game.getLevel());
        int maxPaidOrder = UserLevelInfo.DO_PAID_UNLOCK(game.getLevel());

        if (numDaily < maxFreeOrder)
            return genDaily(game, ItemSubType.ORDER_DAILY_FREE, numDaily);
        if (numDaily < maxFreeOrder + maxPaidOrder)
            return genDaily(game, ItemSubType.ORDER_DAILY_PAID, numDaily);

        return null;
    }

    private static int genNumType (int itemPerOrder, ThreadLocalRandom random)
    {
        return 1 + random.nextInt(itemPerOrder);
    }

    private static int genNumItem (int numType, int max, ThreadLocalRandom random)
    {
        int min = numType;
        int numTotal = (max > min) ? random.nextInt(min, max + 1) : min;
        return Math.max(numTotal / numType, 1);
    }

    private static Order genDaily (UserGame game, byte subType, int numDaily)
    {
        int userLevel = game.getLevel();
        ThreadLocalRandom random = ThreadLocalRandom.current();

        Order o = new Order();
        o.id = numDaily + 1;
        o.subType = subType;
        o.npc = MiscDefine.NPC_SNOW_WHITE;

        int numType, numItem;
        if (subType == ItemSubType.ORDER_DAILY_FREE)
        {
            numType = genNumType(UserLevelInfo.DO_PLANT_PER_ORDER(userLevel), random);
            numItem = genNumItem(numType, UserLevelInfo.DO_FREE_PLANT_MAX(userLevel), random);
        }
        else
        {
            numType = genNumType(UserLevelInfo.DO_PLANT_PER_ORDER(userLevel), random);
            numItem = genNumItem(numType, UserLevelInfo.DO_PAID_PLANT_MAX(userLevel), random);
        }

        o.requireItems = chooseItem(game, numType, numItem, 100, UserLevelInfo.DO_RANDOM_PLANT_NAME(userLevel), null, random);

        float fGold = 0;
        float fExp = 0;
        PlantInfo info;
        int num;
        int expHarvest = 0;
        for (MapItem.Entry e : o.requireItems)
        {
            info = (PlantInfo) ConstInfo.getItemInfo(e.key(), ItemType.PLANT);
            num = e.value();
            if (subType == ItemSubType.ORDER_DAILY_FREE)
            {
                fGold += num * info.GOLD_BASIC_DO() * UserLevelInfo.DO_FREE_GOLD_COEFFICIENT_RATIO(userLevel);
                fExp += num * info.EXP_BASIC_DO_FREE() * UserLevelInfo.DO_FREE_EXP_COEFFICIENT_RATIO(userLevel);
            }
            else
            {
                fGold += num * info.GOLD_BASIC_DO() * UserLevelInfo.DO_PAID_GOLD_COEFFICIENT_RATIO(userLevel);
                fExp += num * info.EXP_BASIC_DO_PAID() * UserLevelInfo.DO_PAID_EXP_COEFFICIENT_RATIO(userLevel);
            }
            expHarvest += num * info.HARVEST_EXP();
        }

        int gold = (int) Math.max(Math.ceil(fGold), 1);
        int exp = (int) Math.max(Math.ceil(fExp), 1);

        o.rewardItems = new MapItem(2);
        o.rewardItems.put(ItemId.GOLD, gold);
        o.rewardItems.put(ItemId.EXP, exp);

        //Gachapon
        int quantity = MiscInfo.GACHAPON_ORDER_DELIVERY_TICKET();
        if (quantity > 0) o.rewardItems.increase(ItemId.VE_GACHA, quantity);

        //Fishing item
        Fishing fishing = game.getFishing();
        o.rewardItems.increase(fishing.collectEP(game, CmdDefine.ORDER_GET_REWARD, ItemSubType.NAME[subType]));

        o.genBonusItems(game, exp, gold);

        if (subType == ItemSubType.ORDER_DAILY_FREE)
        {
            o.status = MiscDefine.ORDER_STATUS_ACTIVE;
        }
        else
        {
            int numPaid = numDaily - UserLevelInfo.DO_FREE_UNLOCK(userLevel);
            o.price = (int) Math.max(1,
                                     Math.ceil(expHarvest * UserLevelInfo.DO_PAID_EXP_COEFFICIENT_RATIO(userLevel) * UserLevelInfo.DAILY_ORDER_DIAMOND_RATIO(userLevel) / MiscInfo
                                             .EXP_PER_DIAMOND(numPaid)));
            o.status = MiscDefine.ORDER_STATUS_INACTIVE;
        }

        return o;
    }

    private static void checkEnough (UserGame game, int numType, int numItem, List<String> items, ArrayDeque<String> miss, ArrayDeque<String> enough)
    {
        ArrayList<String> checkItems = new ArrayList<>(items);
        Collections.shuffle(checkItems);

        String id;
        for (int i = Math.min(numType * 2, items.size() - 1); i >= 0; i--)
        {
            id = checkItems.get(i);
            if (game.numStockItem(id) < numItem)
                miss.add(id);
            else
                enough.add(id);
        }
    }

    private static String chooseItem (int rateEnough, ArrayDeque<String> miss, ArrayDeque<String> enough, ThreadLocalRandom random)
    {
        if (random.nextInt(100) < rateEnough)
        {
            if (enough.size() > 0)
                return enough.poll();
            else
                return miss.poll();
        }
        else
        {
            if (miss.size() > 0)
                return miss.poll();
            else
                return enough.poll();
        }
    }

    private static MapItem chooseItem (UserGame game,
                                       int numType,
                                       int numItem,
                                       int rateA,
                                       List<String> itemsA,
                                       List<String> itemsB,
                                       ThreadLocalRandom random)
    {
        MapItem chooseItems = new MapItem();
        int userLevel = game.getLevel();

        if (itemsA == null || itemsA.isEmpty())
            rateA = -1;
        else if (itemsB == null || itemsB.isEmpty())
            rateA = 100;

        ArrayDeque<String> missA = null, enoughA = null, missB = null, enoughB = null;
        if (rateA > 0)
        {
            missA = new ArrayDeque<>();
            enoughA = new ArrayDeque<>();
            checkEnough(game, numType, numItem, itemsA, missA, enoughA);
        }
        if (rateA < 100)
        {
            missB = new ArrayDeque<>();
            enoughB = new ArrayDeque<>();
            checkEnough(game, numType, numItem, itemsB, missB, enoughB);
        }

        int rateEnough = UserLevelInfo.ORDER_CONTROL_ENOUGH(userLevel);
        String id;
        int rate;

        for (int t = 0; t < numType; t++)
        {
            rate = random.nextInt(100);
            if (rate < rateA)
                id = chooseItem(rateEnough, missA, enoughA, random);
            else
                id = chooseItem(rateEnough, missB, enoughB, random);

            if (id != null)
                chooseItems.put(id, numItem);
        }

        return chooseItems;
    }


    static Order createNormalOrder (UserGame game, int numNormal)
    {
        int userLevel = game.getLevel();
        ThreadLocalRandom random = ThreadLocalRandom.current();
        int rate = random.nextInt(100);

        if (rate < UserLevelInfo.ORDER_BUG_PEARL_RATE(userLevel))
            return genNormal(game, ItemSubType.ORDER_NORMAL_BUG, random, numNormal);
        else
            return genNormal(game, ItemSubType.ORDER_NORMAL_PLANT, random, numNormal);
    }

    private static Order genNormal (UserGame game, byte subType, ThreadLocalRandom random, int numNormal)
    {
        int userLevel = game.getLevel();

        Order o = new Order();
        o.id = numNormal + 1;
        o.subType = subType;
        o.status = MiscDefine.ORDER_STATUS_ACTIVE;

        int numType, numItem, rateA;
        List<String> itemsA, itemsB;
        if (subType == ItemSubType.ORDER_NORMAL_BUG)
        {
            o.npc = MiscDefine.NPC_TINKLE_BELL;
            numType = genNumType(UserLevelInfo.BUG_PEARL_PER_ORDER(userLevel), random);
            numItem = genNumItem(numType, UserLevelInfo.ORDER_BUG_PEARL_MAX(userLevel), random);
            rateA = UserLevelInfo.ORDER_BUG_RATE(userLevel);
            itemsA = UserLevelInfo.UNLOCK_PEST(userLevel);
            itemsB = UserLevelInfo.UNLOCK_PEARL(userLevel);
        }
        else
        {
            o.npc = NO_NPC[random.nextInt(NO_NPC.length)];
            numType = genNumType(UserLevelInfo.NO_ITEM_PER_ORDER(userLevel), random);
            numItem = genNumItem(numType, UserLevelInfo.NO_ITEM_MAX(userLevel), random);
            rateA = UserLevelInfo.NO_PLANT_RATE(userLevel);
            itemsA = UserLevelInfo.UNLOCK_PLANT(userLevel);
            itemsB = UserLevelInfo.UNLOCK_PRODUCT(userLevel);
        }
        o.requireItems = chooseItem(game, numType, numItem, rateA, itemsA, itemsB, random);

        float fGold = 0;
        float fExp = 0;
        ItemInfo info;
        int num;
        for (MapItem.Entry e : o.requireItems)
        {
            info = ConstInfo.getItemInfo(e.key());
            num = e.value();
            switch (info.TYPE())
            {
                case ItemType.PLANT:
                    PlantInfo plantInfo = (PlantInfo) info;
                    fGold += num * plantInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(userLevel);
                    fExp += num * plantInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(userLevel);
                    break;
                case ItemType.PRODUCT:
                    ProductInfo productInfo = (ProductInfo) info;
                    fGold += num * productInfo.GOLD_BASIC() * UserLevelInfo.NO_GOLD_COEFFICIENT_RATIO(userLevel);
                    fExp += num * productInfo.EXP_BASIC() * UserLevelInfo.NO_XP_COEFFICIENT_RATIO(userLevel);
                    break;
                case ItemType.PEST:
                    PestInfo pestInfo = (PestInfo) info;
                    fGold += num * pestInfo.GOLD_BASIC() * UserLevelInfo.BUG_PEARL_COEFFICIENT_RATIO(userLevel);
                    fExp += num * pestInfo.EXP_BASIC() * UserLevelInfo.BUG_PEARL_COEFFICIENT_RATIO(userLevel);
                    break;
                case ItemType.PEARL:
                    ProductInfo pearlInfo = (ProductInfo) info;
                    fGold += num * pearlInfo.GOLD_BASIC() * UserLevelInfo.BUG_PEARL_COEFFICIENT_RATIO(userLevel);
                    fExp += num * pearlInfo.EXP_BASIC() * UserLevelInfo.BUG_PEARL_COEFFICIENT_RATIO(userLevel);
                    break;
            }
        }

        int gold = (int) Math.max(Math.ceil(fGold), 1);
        int exp = (int) Math.max(Math.ceil(fExp), 1);

        o.rewardItems = new MapItem(2);
        o.rewardItems.put(ItemId.GOLD, gold);
        o.rewardItems.put(ItemId.EXP, exp);

        //Gachapon
        int quantity = MiscInfo.GACHAPON_ORDER_DELIVERY_TICKET();
        if (quantity > 0) o.rewardItems.increase(ItemId.VE_GACHA, quantity);

        //Fishing item
        Fishing fishing = game.getFishing();
        o.rewardItems.increase(fishing.collectEP(game, CmdDefine.ORDER_GET_REWARD, ItemSubType.NAME[subType]));

        o.genBonusItems(game, exp, gold);

        return o;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(ORDER_ID, id);
        msg.put(ORDER_SUB_TYPE, subType);
        msg.put(ORDER_STATUS, status);
        msg.put(ORDER_TIME, time);
        msg.put(ORDER_PRICE, price);
        msg.put(ORDER_NPC, npc);
        msg.put(ORDER_REQUIRE_ITEMS, requireItems);
        msg.put(ORDER_REWARD_ITEMS, rewardItems);
        msg.put(ORDER_BONUS_ITEMS, bonusItems);
    }

    public boolean isActive ()
    {
        return status == MiscDefine.ORDER_STATUS_ACTIVE;
    }

    public boolean isInactive ()
    {
        return status == MiscDefine.ORDER_STATUS_INACTIVE;
    }

    public boolean isCancel ()
    {
        return status == MiscDefine.ORDER_STATUS_CANCEL;
    }

    public MapItem getRequireItems ()
    {
        return requireItems;
    }

    public MapItem getRewardItems ()
    {
        return rewardItems;
    }

    public MapItem getBonusItems ()
    {
        return bonusItems;
    }

    public int getId ()
    {
        return id;
    }

    void setId (int id)
    {
        this.id = id;
    }

    void delivery ()
    {
        status = MiscDefine.ORDER_STATUS_DELIVERY;
        time = Time.getUnixTime();
    }

    void cancel ()
    {
        status = MiscDefine.ORDER_STATUS_CANCEL;
        time = Time.getUnixTime();
    }

    public void active ()
    {
        status = MiscDefine.ORDER_STATUS_ACTIVE;
        time = 0;
        price = 0;
    }

    public void inactive ()
    {
        status = MiscDefine.ORDER_STATUS_INACTIVE;
        time = 0;
    }

    public boolean canGetReward ()
    {
        //return status == MiscDefine.ORDER_STATUS_DELIVERY && time + MiscInfo.ORDER_TIME_DELIVERY() <= Time.getUnixTime();
        return status == MiscDefine.ORDER_STATUS_DELIVERY;
    }

    public int getPrice ()
    {
        return price;
    }

    public byte getSubType ()
    {
        return subType;
    }

    public int getTime ()
    {
        return time;
    }

    /*public static void test ()
    {
        Debug.info("start test");
        User user = new User(new Session());
        UserControl control = new UserControl(null, user, UserBrief.create(1, "1", 1));
        UserGame.create(1, control);
        UserGame game = control.game;
        int count = 0;
        for (short lv = 1; lv < 250; lv++)
        {
            Debug.info("test level", lv);
            game.gmSetLevelExp(lv,1);
            int maxFreeOrder = UserLevelInfo.DO_FREE_UNLOCK(game.getLevel());
            int maxPaidOrder = UserLevelInfo.DO_PAID_UNLOCK(game.getLevel());
            for (int test = 0; test < 10000; test++)
            {
                for (int num = 1; num < maxFreeOrder + maxPaidOrder; num++)
                {
                    Order order = createDailyOrder(game, num);
                    count++;
                    test(order, lv, num);
                }

                for (int num = 1; num < maxFreeOrder + maxPaidOrder; num++)
                {
                    Order order = createNormalOrder(game, num);
                    count++;
                    test(order, lv, num);
                }
            }
        }
        Debug.info("finish test", "count", count);
    }

    public static void test (Order order, int lv, int num)
    {
        if (order.requireItems.isEmpty())
            throw new RuntimeException("level:" + lv + ", num:" + num + ", Empty requireItems");
        for (MapItem.Entry e : order.requireItems)
        {
            if (e.key() == null || e.key().isEmpty())
                throw new RuntimeException("level:" + lv + ", num:" + num + ", Empty key");
            if (e.value() <= 0)
                throw new RuntimeException("level:" + lv + ", num:" + num + ", key: " + e.key() + ", num: " + e.value());
        }
    }*/
}
