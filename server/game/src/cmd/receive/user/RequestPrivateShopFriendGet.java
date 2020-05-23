package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPrivateShopFriendGet extends Command
{
    public int    friendId;
    public String bucket;

    public RequestPrivateShopFriendGet (Decoder dataCmd)
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
