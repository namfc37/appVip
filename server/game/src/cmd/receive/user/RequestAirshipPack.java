package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAirshipPack extends Command
{
    public byte idSlot;

    public RequestAirshipPack (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        idSlot = readByte(KEY_SLOT_ID);
    }
}
