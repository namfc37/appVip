package cmd.send.user;

import cmd.Message;
import model.object.Slot;

public class ResponsePlantSkipTime extends Message
{
    public ResponsePlantSkipTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePlantSkipTime packData (long coin, byte iFloor, byte iSlot, Slot slot)
    {
        put(KEY_COIN, coin);
        put(KEY_FLOOR, iFloor);
        put(KEY_SLOT_ID, iSlot);
        put(KEY_SLOT_OBJECT, slot);

        return this;
    }
}
