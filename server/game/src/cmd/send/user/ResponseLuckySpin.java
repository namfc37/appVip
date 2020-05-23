package cmd.send.user;

import cmd.Message;
import model.object.LuckySpin;
import util.collection.MapItem;

public class ResponseLuckySpin extends Message
{
    public ResponseLuckySpin (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseLuckySpin packData (long coin, LuckySpin data, byte winSlot, MapItem updateItem)
    {
        put(KEY_COIN, coin);
        put(KEY_LUCKY_SPIN, data);
        put(KEY_SLOT_ID, winSlot);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}
