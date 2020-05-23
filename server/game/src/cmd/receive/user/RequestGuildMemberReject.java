package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGuildMemberReject extends Command
{
    public int[] userIds;

    public RequestGuildMemberReject (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        userIds = readIntArray(KEY_USER_ID);
    }
}
