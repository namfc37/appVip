package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineSkipTimeUnlock extends Message
{
    public ResponseMachineSkipTimeUnlock (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineSkipTimeUnlock packData (byte iFloor, long coin, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_COIN, coin);
        put(KEY_MACHINE, machine);

        return this;
    }
}
