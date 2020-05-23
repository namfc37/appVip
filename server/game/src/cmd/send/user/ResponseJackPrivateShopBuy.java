package cmd.send.user;

import cmd.Message;
import model.object.JackShop;
import util.collection.MapItem;

public class ResponseJackPrivateShopBuy extends Message
{
    public ResponseJackPrivateShopBuy (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseJackPrivateShopBuy packData (JackShop jackShop, long gold, MapItem updateItem)
    {
        put(KEY_JACK_SHOP, jackShop);
        put(KEY_GOLD, gold);
        put(KEY_UPDATE_ITEMS, updateItem);

        return this;
    }
}
