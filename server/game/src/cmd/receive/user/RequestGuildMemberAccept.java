package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildMemberAccept extends Command
{
    public int[] memberIds;


    public RequestGuildMemberAccept (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
		memberIds = readIntArray(KEY_USER_ID);
    }
}
