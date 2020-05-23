package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildSetDeputy extends Command
{
    public int targetId;
    public int role;

    public RequestGuildSetDeputy (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        targetId = readInt(KEY_USER_ID);
        role = readInt(KEY_STATUS);
    }
}