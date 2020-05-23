package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopPut;
import model.PrivateShop;

public class ResponsePrivateShopPut extends Message
{
    public ResponsePrivateShopPut (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopPut packData (RequestPrivateShopPut request, PrivateShop shop, long coin, long gold, int remainItem)
    {
        put(KEY_COIN, coin);
        put(KEY_GOLD, gold);
        put(KEY_PRIVATE_SHOP, shop);
        put(KEY_SLOT_ID, request.idSlot);
        put(KEY_ITEM_ID, request.item);
        put(KEY_REMAIN_ITEM, remainItem);

        return this;
    }
}
