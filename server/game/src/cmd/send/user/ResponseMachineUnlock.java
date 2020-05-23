package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineUnlock extends Message
{
    public ResponseMachineUnlock (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineUnlock packData (byte floor, long gold, Machine machine)
    {
        put(KEY_FLOOR, floor);
        put(KEY_GOLD, gold);
        put(KEY_MACHINE, machine);

        return this;
    }
}
