package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberKick extends Command
{
    public int[] userIds;

    public RequestGuildMemberKick (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        userIds = readIntArray(KEY_USER_ID);
    }
}
