package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckGet extends Message
{
    public ResponseTruckGet(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckGet packData (Truck truck)
    {
        put(KEY_TRUCK, truck);

        return this;
    }
}
