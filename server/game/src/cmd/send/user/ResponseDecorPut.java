package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestDecorPut;
import model.object.Slot;

public class ResponseDecorPut extends Message
{
    public ResponseDecorPut (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseDecorPut packData (RequestDecorPut request, Slot[] slots, int remainDecor)
    {
        put(KEY_DECOR, request.decor);
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_REMAIN_ITEM, remainDecor);

        return this;
    }
}
