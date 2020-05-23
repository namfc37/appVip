package cmd.send.user;

import cmd.Message;
import model.PrivateShop;

public class ResponsePrivateShopGet extends Message
{
    public ResponsePrivateShopGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopGet packData (PrivateShop shop)
    {
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
