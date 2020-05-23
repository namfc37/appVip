package cmd.send.user;

import cmd.Message;
import model.object.Tom;
import util.collection.MapItem;

public class ResponseTomHire extends Message
{
    public ResponseTomHire (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseTomHire packData (long coin, Tom tom, MapItem updateItems, MapItem dropItem)
    {
        put(KEY_COIN, coin);
        put(KEY_TOM, tom);
        put(KEY_UPDATE_ITEMS, updateItems);
        put(KEY_BONUS_ITEMS, dropItem);

        return this;
    }
}
