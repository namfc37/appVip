package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTomBuy extends Command
{
    public byte slot;

    public RequestTomBuy (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        slot = readByte(KEY_SLOT_ID);
    }
}
