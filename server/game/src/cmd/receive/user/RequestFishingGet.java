package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingGet extends Command
{

    public RequestFishingGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}
