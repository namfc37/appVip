package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyGetGroup extends Command
{
    public RequestGuildDerbyGetGroup (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    }
}
