package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckSkipTimeInactive extends Message
{
    public ResponseTruckSkipTimeInactive(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckSkipTimeInactive packData (Truck truck, long coin)
    {
        put(KEY_TRUCK, truck);
        put(KEY_COIN, coin);

        return this;
    }
}
