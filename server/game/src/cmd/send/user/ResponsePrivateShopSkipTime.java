package cmd.send.user;

import cmd.Message;
import cmd.receive.user.RequestPrivateShopSkipTime;
import model.PrivateShop;

public class ResponsePrivateShopSkipTime extends Message
{
    public ResponsePrivateShopSkipTime (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponsePrivateShopSkipTime packData (RequestPrivateShopSkipTime request, PrivateShop shop, long coin)
    {
        put(KEY_COIN, coin);
        put(KEY_PRIVATE_SHOP, shop);

        return this;
    }
}
