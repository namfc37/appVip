package cmd.send.user;

import cmd.Message;
import model.AirShip;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckUnlock extends Message
{
    public ResponseTruckUnlock(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckUnlock packData (Truck truck, MapItem updateItems)
    {
        put(KEY_TRUCK, truck);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
