package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineUpgrade extends Message
{
    public ResponseMachineUpgrade (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineUpgrade packData (byte iFloor, long coin, long gold, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_GOLD, gold);
        put(KEY_COIN, coin);
        put(KEY_MACHINE, machine);

        return this;
    }
}
