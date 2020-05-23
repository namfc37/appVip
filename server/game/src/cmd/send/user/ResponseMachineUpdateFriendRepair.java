package cmd.send.user;

import cmd.Message;
import model.object.Machine;

public class ResponseMachineUpdateFriendRepair extends Message
{
    public ResponseMachineUpdateFriendRepair (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMachineUpdateFriendRepair packData (byte iFloor, Machine machine)
    {
        put(KEY_FLOOR, iFloor);
        put(KEY_MACHINE, machine);

        return this;
    }
}
