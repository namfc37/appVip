package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineRepair extends Command
{
    public byte iFloor;

    public RequestMachineRepair (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
    }
}
