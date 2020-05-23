package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopUnlockCoin;
import model.PrivateShop;

public class ResponsePrivateShopUnlockCoin extends Message
{
    public ResponsePrivateShopUnlockCoin (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopUnlockCoin packData (RequestPrivateShopUnlockCoin request, PrivateShop shop, long coin)
    {
        put(KEY_COIN, coin);
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
