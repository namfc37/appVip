package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineUnlock extends Command
{
    public byte floor;

    public RequestMachineUnlock (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        floor = readByte(KEY_FLOOR);
    }
}
