package cmd.send.user;

import cmd.Message;
import model.object.Machine;
import util.collection.MapItem;

public class ResponseMachineHarvest extends Message
{
    public ResponseMachineHarvest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineHarvest packData (byte iFloor, Machine machine, MapItem updateItem, short level, long exp, MapItem eventItem)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_MACHINE_EVENT_ITEM, eventItem);

        return this;
    }
}
