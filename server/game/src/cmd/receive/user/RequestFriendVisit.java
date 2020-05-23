package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendVisit extends Command
{
    public int friendId;

    public RequestFriendVisit (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
    }
}
