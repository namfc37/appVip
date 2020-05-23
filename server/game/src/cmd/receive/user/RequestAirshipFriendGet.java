package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAirshipFriendGet extends Command
{
    public int    friendId;
    public String bucket;

    public RequestAirshipFriendGet (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        friendId = readInt(KEY_FRIEND_ID);
        bucket = readString(KEY_BUCKET);
    }
}
