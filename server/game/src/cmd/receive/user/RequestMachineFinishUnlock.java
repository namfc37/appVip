package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineFinishUnlock extends Command
{
    public byte iFloor;

    public RequestMachineFinishUnlock (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
    }
}
