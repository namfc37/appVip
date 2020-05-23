package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopGetMoney;
import model.PrivateShop;

public class ResponsePrivateShopGetMoney extends Message
{
    public ResponsePrivateShopGetMoney (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopGetMoney packData (RequestPrivateShopGetMoney request, PrivateShop shop, long gold)
    {
        put(KEY_SLOT_ID, request.idSlot);
        put(KEY_GOLD, gold);
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
