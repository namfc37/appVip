package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestOrderDelivery extends Command
{
    public int id;

    public RequestOrderDelivery (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readInt(KEY_SLOT_ID);
    }
}
