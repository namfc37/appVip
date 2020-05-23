package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckGet extends Command
{
    public RequestTruckGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {

    }
}
