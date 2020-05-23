package cmd.send.user;

import cmd.Message;
import model.object.Gachapon;
import util.collection.MapItem;

public class ResponseGachaponSpin extends Message

{

    public ResponseGachaponSpin(short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseGachaponSpin packData (Gachapon gachapon, MapItem updateItem, int color)
    {
        put(GAME_GACHAPON, gachapon);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        put(KEY_GACHAPON_COLOR,color);
        return this;
    }
}
