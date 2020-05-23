package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildSetPresident extends Command
{
    public int targetId;

    public RequestGuildSetPresident (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        targetId = readInt(KEY_USER_ID);
    }
}