package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseBuyItem extends Message
{
    public ResponseBuyItem (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseBuyItem packData (long coin, MapItem updateItem)
    {
        put(KEY_COIN, coin);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
