package cmd.send.user;

import cmd.Message;
import model.object.Machine;
import util.collection.MapItem;

public class ResponseMachineProduce extends Message
{
    public ResponseMachineProduce (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineProduce packData (byte iFloor, String product, Machine machine, MapItem updateItem)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_PRODUCT, product);
        put(KEY_MACHINE, machine);
        put(KEY_UPDATE_ITEMS, updateItem);

        return this;
    }
}
