package cmd.send.user;

import cmd.Message;
import model.object.Slot;
import util.collection.MapItem;

public class ResponsePlantCatchBug extends Message
{
    public ResponsePlantCatchBug (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePlantCatchBug packData (short level, long exp, byte[] iFloors, byte[] iSlots, Slot[] slots, MapItem updateItem, MapItem[] bonusItems)
    {
        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_FLOOR, iFloors);
        put(KEY_SLOT_ID, iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_BONUS_ITEMS, bonusItems);

        return this;
    }
}
