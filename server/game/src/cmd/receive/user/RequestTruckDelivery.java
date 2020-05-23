package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckDelivery extends Command
{
    public RequestTruckDelivery (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {

    }
}
