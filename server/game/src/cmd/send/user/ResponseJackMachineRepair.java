package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseJackMachineRepair extends Message
{
    public ResponseJackMachineRepair (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseJackMachineRepair packData (long gold, byte[] jackMachine, int reputation, MapItem updateItem, MapItem dropItem)
    {
        put(KEY_GOLD, gold);
        put(KEY_JACK_MACHINE, jackMachine);
        put(KEY_REPUTATION, reputation);

        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_BONUS_ITEMS, dropItem);

        return this;
    }
}
