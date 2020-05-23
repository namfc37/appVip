package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseFloorUpgrade extends Message
{
    public ResponseFloorUpgrade (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFloorUpgrade packData (byte iFloor, MapItem updateItem)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
