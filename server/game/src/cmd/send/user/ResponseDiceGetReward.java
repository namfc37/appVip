package cmd.send.user;

import cmd.Message;
import model.object.Dice;
import util.collection.MapItem;

public class ResponseDiceGetReward extends Message
{
    public ResponseDiceGetReward (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseDiceGetReward packData (long coin, Dice data, int winSlot, MapItem updateItem)
    {
        put(KEY_COIN, coin);
        put(KEY_DICE, data);
        put(KEY_SLOT_ID, winSlot);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi

        return this;
    }
}