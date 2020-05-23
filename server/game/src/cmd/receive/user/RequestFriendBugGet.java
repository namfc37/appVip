package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendBugGet extends Command
{
    public int friendId;

    public RequestFriendBugGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
    }
}
