package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseNotifyRepairMachine extends Message
{
    public ResponseNotifyRepairMachine (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseNotifyRepairMachine packData (byte iFloor, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);

        return this;
    }
}
