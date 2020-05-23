package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckSkipTimeUnlock extends Message
{
    public ResponseTruckSkipTimeUnlock(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckSkipTimeUnlock packData (Truck truck, long coin)
    {
        put(KEY_TRUCK, truck);
        put(KEY_COIN, coin);

        return this;
    }
}
