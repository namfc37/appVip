package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseMineReceiveRewards extends Message
{
    public ResponseMineReceiveRewards (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseMineReceiveRewards packData (MapItem updateItems)
    {
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}