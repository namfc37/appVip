package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseFriendBugCatch extends Message
{
    public ResponseFriendBugCatch (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFriendBugCatch packData (String id, MapItem bugs, MapItem updateItem, MapItem dropItem)
    {
        put(KEY_ITEM_ID, id);
        put(KEY_FRIEND_BUG, bugs);

        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_BONUS_ITEMS, dropItem);

        return this;
    }
}
