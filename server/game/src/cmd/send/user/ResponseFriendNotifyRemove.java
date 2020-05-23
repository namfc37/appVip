package cmd.send.user;

import cmd.Message;
import model.FriendList;

public class ResponseFriendNotifyRemove extends Message
{
    public ResponseFriendNotifyRemove (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendNotifyRemove packData (FriendList friendList, int friendId)
    {
        put(KEY_FRIEND_LIST, friendList);
        put(KEY_UID, friendId);

        return this;
    }
}
