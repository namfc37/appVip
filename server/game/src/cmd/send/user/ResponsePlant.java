package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPlant;
import model.object.Slot;

public class ResponsePlant extends Message
{
    public ResponsePlant (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePlant packData (RequestPlant request, Slot[] slots, int remainPlant)
    {
        put(KEY_PLANT, request.plant);
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_REMAIN_ITEM, remainPlant);
        put(KEY_SLOT_OBJECT, slots);

        return this;
    }
}
