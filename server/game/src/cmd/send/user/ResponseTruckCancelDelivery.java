package cmd.send.user;

import cmd.Message;
import model.object.Truck;
import util.collection.MapItem;

public class ResponseTruckCancelDelivery extends Message
{
    public ResponseTruckCancelDelivery(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTruckCancelDelivery packData (Truck truck)
    {
        put(KEY_TRUCK, truck);

        return this;
    }
}
