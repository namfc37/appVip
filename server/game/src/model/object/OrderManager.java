package model.object;

import data.ItemSubType;
import data.KeyDefine;
import data.MiscInfo;
import data.UserLevelInfo;
import model.UserGame;
import util.serialize.Encoder;

import java.util.Arrays;

public class OrderManager extends Encoder.IObject implements KeyDefine
{
    private int     genUid;
    private short   numNormal;
    private short   numDaily;
    private Order   dailyOrder;
    private Order[] normalOrders;
    private Order   deliveryOrder;

    private OrderManager ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static OrderManager create ()
    {
        OrderManager o = new OrderManager();

        o.normalOrders = new Order[0];

        return o;
    }


    @Override
    public void putData (Encoder msg)
    {
        msg.put(ORDER_MANAGER_NUM_NORMAL, numNormal);
        msg.put(ORDER_MANAGER_NUM_DAILY, numDaily);
        msg.put(ORDER_MANAGER_DAILY, dailyOrder);
        msg.put(ORDER_MANAGER_NORMAL, normalOrders);
        msg.put(ORDER_MANAGER_DELIVERY, deliveryOrder);
    }

    public void reset ()
    {
        numNormal = 0;
        numDaily = 0;
        dailyOrder = null;
        //for (int i = 0; i < normalOrders.length; i++)
        //normalOrders[i] = null;
    }

    private int nextUid (int type, int slot)
    {
        genUid++;
        if (genUid >= 1000)
            genUid = 1;

        return type * 1000_000 + slot * 1000 + genUid;
    }

    private Order setDailyOrder (UserGame game)
    {
        dailyOrder = Order.createDailyOrder(game, numDaily);
        if (dailyOrder != null)
        {
            numDaily++;
            dailyOrder.setId(nextUid(0, 0));
        }

        return dailyOrder;
    }

    private Order setNormalOrder (UserGame game, int slot)
    {
        Order order = Order.createNormalOrder(game, numNormal);
        numNormal++;
        order.setId(nextUid(1, slot));
        order.slotId = slot;
        normalOrders[slot] = order;

        return order;
    }

    public void update (UserGame game)
    {
        if (dailyOrder == null)
        {
            if (game.getLevel() >= MiscInfo.DO_USER_LEVEL())
                setDailyOrder(game);
        }
        else
            dailyOrder.update(game);

        int numNormalOrder = UserLevelInfo.ORDER_SLOT_UNLOCK(game.getLevel());
        if (game.getLevel() >= MiscInfo.DO_USER_LEVEL())
            numNormalOrder--; //trừ đi số lượng dailyOrder (đang là 1)

        if (normalOrders.length < numNormalOrder)
            normalOrders = Arrays.copyOf(normalOrders, numNormalOrder);

        for (int i = 0; i < normalOrders.length; i++)
        {
            if (normalOrders[i] == null)
                setNormalOrder(game, i);
            else
            {
                normalOrders[i].update(game);
                normalOrders[i].slotId = i;
            }
        }
    }

    public Order getOrder (UserGame game, int id)
    {
        Order order = null;
        if (dailyOrder != null && dailyOrder.getId() == id)
        {
            order = dailyOrder;
            order.slotId = -1;
        }

        for (int i = 0; i < normalOrders.length; i++)
        {
            if (normalOrders[i].getId() == id)
            {
                order = normalOrders[i];
                order.slotId = i;
            }
        }

        if (order != null)
            order.update(game);

        return order;
    }

    public Order delivery (UserGame game, Order order)
    {
        deliveryOrder = order;
        deliveryOrder.delivery();

        if (order == dailyOrder)
            order = setDailyOrder(game);
        else
            order = setNormalOrder(game, order.slotId);

        return order;
    }

    public Order cancel (UserGame game, Order oldOrder)
    {
        Order newOrder;
        if (oldOrder == dailyOrder)
        {
            newOrder = setDailyOrder(game);
            if (newOrder != null)
            {
                if (newOrder.getSubType() == ItemSubType.ORDER_DAILY_FREE)
                    newOrder.cancel();
                else if (oldOrder.getSubType() == ItemSubType.ORDER_DAILY_PAID && oldOrder.isInactive())
                    newOrder.cancel();
            }
        }
        else
        {
            newOrder = setNormalOrder(game, oldOrder.slotId);
            if (newOrder != null)
                newOrder.cancel();
        }

        return newOrder;
    }

    public Order getDeliveryOrder ()
    {
        return deliveryOrder;
    }

    public void resetDeliveryOrder ()
    {
        deliveryOrder = null;
    }

    public void levelUp (UserGame game)
    {
        numDaily = 0;
        dailyOrder = null;
        update(game);
    }

}
