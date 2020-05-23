package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPotMove;
import model.object.Slot;

public class ResponsePotMove extends Message
{
    public ResponsePotMove (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePotMove packData (RequestPotMove request, Slot fromSlot, Slot toSlot)
    {
        put(KEY_FROM_FLOOR, request.fromFloor);
        put(KEY_FROM_SLOT_ID, request.fromSlot);
        put(KEY_FROM_SLOT_OBJECT, fromSlot);
        put(KEY_FLOOR, request.toFloor);
        put(KEY_SLOT_ID, request.toSlot);
        put(KEY_SLOT_OBJECT, toSlot);

        return this;
    }
}
