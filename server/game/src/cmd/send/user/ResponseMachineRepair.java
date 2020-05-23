package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineRepair extends Message
{
    public ResponseMachineRepair (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineRepair packData (byte iFloor, long gold, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_GOLD, gold);
        put(KEY_MACHINE, machine);

        return this;
    }
}
