package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckCancelDelivery extends Command
{
    public RequestTruckCancelDelivery (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {

    }
}
