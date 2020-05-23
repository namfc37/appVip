package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseBlacksmithMakePot extends Message
{
    public ResponseBlacksmithMakePot (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseBlacksmithMakePot packData (boolean isForgeSuccess, long gold, MapItem updateItem)
    {
        put(KEY_BLACKSMITH_SUCCESS, isForgeSuccess); //thao tác đúc thành công
        put(KEY_GOLD, gold);//update gold còn lại
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        return this;
    }
}
