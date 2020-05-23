package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPotPut;
import model.object.Slot;

public class ResponsePotPut extends Message
{
    public ResponsePotPut (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePotPut packData (RequestPotPut request, Slot[] slots, int remainPot)
    {
        put(KEY_POT, request.pot);
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_REMAIN_ITEM, remainPot);

        return this;
    }
}
