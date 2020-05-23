package cmd.send.user;

import cmd.Message;
import model.PrivateShop;

public class ResponsePrivateShopUnlockFriend extends Message
{
    public ResponsePrivateShopUnlockFriend (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopUnlockFriend packData (PrivateShop shop)
    {
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
