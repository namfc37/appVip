package cmd.send.user;

import cmd.Message;
import model.FriendList;

public class ResponseFriendNotifyRequest extends Message
{
    public ResponseFriendNotifyRequest (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendNotifyRequest packData (FriendList friendList, int friendId)
    {
        put(KEY_FRIEND_LIST, friendList);
        put(KEY_UID, friendId);

        return this;
    }
}
