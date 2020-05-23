package cmd.send.user;

import cmd.Message;
import model.object.Tom;
import util.collection.MapItem;

public class ResponseTomReduceTime extends Message
{
    public ResponseTomReduceTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTomReduceTime packData (Tom tom, MapItem updateItems)
    {
        put(KEY_TOM, tom);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
