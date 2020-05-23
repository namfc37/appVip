package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineGet extends Command
{
    public byte iFloor;

    public RequestMachineGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
    }
}
