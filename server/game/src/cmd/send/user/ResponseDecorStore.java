package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestDecorStore;
import model.object.Slot;
import util.collection.MapItem;

public class ResponseDecorStore extends Message
{
    public ResponseDecorStore (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseDecorStore packData (RequestDecorStore request, Slot[] slots, MapItem updateItem)
    {
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
