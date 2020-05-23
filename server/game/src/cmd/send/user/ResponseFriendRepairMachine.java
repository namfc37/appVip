package cmd.send.user;

import cmd.Message;
import model.object.Machine;
import util.collection.MapItem;

public class ResponseFriendRepairMachine extends Message
{
    public ResponseFriendRepairMachine (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendRepairMachine packData (byte iFloor, Machine machine, long gold, int reputation, MapItem updateItem, MapItem dropItem)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);

        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);

        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_BONUS_ITEMS, dropItem);

        return this;
    }
}
