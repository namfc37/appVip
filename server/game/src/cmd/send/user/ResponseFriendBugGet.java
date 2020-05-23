package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseFriendBugGet extends Message
{
    public ResponseFriendBugGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendBugGet packData (int friendId, MapItem bugs)
    {
        put(KEY_FRIEND_ID, friendId);
        put(KEY_FRIEND_BUG, bugs);

        return this;
    }
}
