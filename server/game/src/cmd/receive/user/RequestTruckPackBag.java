package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckPackBag extends Command
{
    public int bagId;

    public RequestTruckPackBag (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        bagId = readInt(KEY_SLOT_ID);
    }
}
