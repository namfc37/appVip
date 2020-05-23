package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberDonate extends Command
{
    public int memberId;

    public RequestGuildMemberDonate (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        memberId = readInt(KEY_USER_ID);
    }
}
