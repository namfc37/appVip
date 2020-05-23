package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopCancel;
import model.PrivateShop;

public class ResponsePrivateShopCancel extends Message
{
    public ResponsePrivateShopCancel (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopCancel packData (RequestPrivateShopCancel request, PrivateShop shop, long coin)
    {
        put(KEY_SLOT_ID, request.idSlot);
        put(KEY_COIN, coin);
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
