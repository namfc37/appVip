package cmd.send.user;

import cmd.Message;
import model.FriendList;

public class ResponseFriendNotifyAdd extends Message
{
    public ResponseFriendNotifyAdd (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendNotifyAdd packData (FriendList friendList, int friendId)
    {
        put(KEY_FRIEND_LIST, friendList);
        put(KEY_UID, friendId);

        return this;
    }
}
