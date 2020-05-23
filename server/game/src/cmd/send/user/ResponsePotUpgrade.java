package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPotUpgrade;
import model.object.Slot;
import util.collection.MapItem;

public class ResponsePotUpgrade extends Message
{
    public ResponsePotUpgrade (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePotUpgrade packData (RequestPotUpgrade request, Slot slot, MapItem updateItem)
    {
        put(KEY_FLOOR, request.iFloor);
        put(KEY_SLOT_ID, request.iSlot);
        put(KEY_SLOT_OBJECT, slot);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
