package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckPackBag extends Message
{
    public ResponseTruckPackBag(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckPackBag packData (int idSlot, Truck truck, short level, long exp, long gold, int reputation, MapItem updateItems)
    {
        put(KEY_SLOT_ID, idSlot);
        put(KEY_TRUCK, truck);

        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
