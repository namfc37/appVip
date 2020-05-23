package cmd.send.user;

import cmd.Message;
import model.object.Chest;
import util.collection.MapItem;

public class ResponseGachaGetReward extends Message
{
    public ResponseGachaGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseGachaGetReward packData (long coin, long gold, int reputation, MapItem updateItem, Chest chest)
    {
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        put(KEY_CHEST, chest);

        return this;
    }
}
