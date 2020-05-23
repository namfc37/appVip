package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckUnlock extends Command
{
    public RequestTruckUnlock (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {

    }
}
