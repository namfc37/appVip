package cmd.send.user;

import cmd.Message;
import model.object.Gachapon;
import util.collection.MapItem;

public class ResponseGachaponReceiveReward extends Message
{
    public ResponseGachaponReceiveReward(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseGachaponReceiveReward packData (Gachapon gachapon, MapItem updateItem)
    {
        put(GAME_GACHAPON, gachapon);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        return this;
    }
}
