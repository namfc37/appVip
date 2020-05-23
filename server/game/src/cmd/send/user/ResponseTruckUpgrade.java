package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckUpgrade extends Message
{
    public ResponseTruckUpgrade(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckUpgrade packData (Truck truck, MapItem updateItems)
    {
        put(KEY_TRUCK, truck);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
