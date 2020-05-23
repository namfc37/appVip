package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPlantHarvest;
import model.object.Slot;
import util.collection.MapItem;

public class ResponsePlantHarvest extends Message
{
    public ResponsePlantHarvest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePlantHarvest packData (RequestPlantHarvest request,
                                          Slot[] slots,
                                          MapItem updateItem,
                                          short level,
                                          long exp,
                                          long gold)
    {
        put(KEY_FLOOR, request.iFloors);
        put(KEY_SLOT_ID, request.iSlots);
        put(KEY_SLOT_OBJECT, slots);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);
        return this;
    }
}
