package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineGet extends Message
{
    public ResponseMachineGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineGet packData (byte iFloor, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);

        return this;
    }
}
