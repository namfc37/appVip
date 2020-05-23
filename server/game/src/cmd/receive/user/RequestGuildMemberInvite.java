package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberInvite extends Command
{
    public int userId;

    public RequestGuildMemberInvite (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        userId = readInt(KEY_USER_ID);
    }
}
