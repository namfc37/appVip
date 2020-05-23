package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAirshipRequestHelp extends Command
{
    public byte idSlot;

    public RequestAirshipRequestHelp (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        idSlot = readByte(KEY_SLOT_ID);
    }
}
