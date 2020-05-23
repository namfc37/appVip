package cmd.send.user;

import cmd.Message;
import model.FriendList;

public class ResponseFriendGet extends Message
{
    public ResponseFriendGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendGet packData (FriendList friendList)
    {
        put(KEY_FRIEND_LIST, friendList);

        return this;
    }
}
