package cmd.send.user;

import cmd.Message;
import model.object.Tom;
import util.collection.MapItem;

public class ResponseTomBuy extends Message
{
    public ResponseTomBuy (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTomBuy packData (Tom tom, long gold, MapItem updateItems)
    {
        put(KEY_TOM, tom);
        put(KEY_GOLD, gold);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
