package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTomCancel extends Command
{
    public RequestTomCancel (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}
