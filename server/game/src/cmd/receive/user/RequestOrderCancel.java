package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestOrderCancel extends Command
{
    public int id;

    public RequestOrderCancel (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readInt(KEY_SLOT_ID);
    }
}
