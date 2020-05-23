package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineUpdateFriendRepair extends Command
{
    public byte iFloor;

    public RequestMachineUpdateFriendRepair (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
    }
}
