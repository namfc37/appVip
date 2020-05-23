package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopAd;
import model.PrivateShop;

public class ResponsePrivateShopAd extends Message
{
    public ResponsePrivateShopAd (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopAd packData (RequestPrivateShopAd request, PrivateShop shop)
    {
        put(KEY_PRIVATE_SHOP, shop);
        put(KEY_SLOT_ID, request.idSlot);

        return this;
    }
}
