package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseEvent02ExchangePack extends Message
{
    public ResponseEvent02ExchangePack (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseEvent02ExchangePack packData (int mailId, MapItem reward, MapItem removeItem, MapItem updateItem)
    {
        put(MAIL_UID, mailId); //id mail chứa quà
        put(KEY_REWARD_ITEMS, reward); //danh sách quà
        put(KEY_REQUIRE_ITEMS,removeItem); //vật phẩm đã dùng
        put(KEY_UPDATE_ITEMS,updateItem);
        return this;
    }
}
