package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineFinishUnlock extends Message
{
    public ResponseMachineFinishUnlock (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineFinishUnlock packData (byte iFloor, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);

        return this;
    }
}
