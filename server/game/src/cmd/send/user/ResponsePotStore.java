package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPotStore;
import model.object.Slot;
import util.collection.MapItem;

public class ResponsePotStore extends Message
{
    public ResponsePotStore (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePotStore packData (RequestPotStore request, Slot[] slots, MapItem updateItem)
    {
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
