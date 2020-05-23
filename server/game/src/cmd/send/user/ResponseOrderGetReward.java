package cmd.send.user;

import cmd.Message;
import model.object.Order;
import util.collection.MapItem;

public class ResponseOrderGetReward extends Message
{
    public ResponseOrderGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseOrderGetReward packData (Order order, short level, long exp, long coin, long gold, MapItem updateItem)
    {
        put(KEY_OLD_ORDER, order);
        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_UPDATE_ITEMS, updateItem);

        return this;
    }
}
