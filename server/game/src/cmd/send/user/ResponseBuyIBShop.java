package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseBuyIBShop extends Message
{
    public ResponseBuyIBShop (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseBuyIBShop packData (long coin, long gold, int reputation, MapItem updateItem, MapItem ibShopCount)
    {
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_REPUTATION, reputation);
        put(KEY_UPDATE_ITEMS, updateItem); //update số lượng các item thay đổi
        put(KEY_IBSHOP_COUNT, ibShopCount);

        return this;
    }
}
