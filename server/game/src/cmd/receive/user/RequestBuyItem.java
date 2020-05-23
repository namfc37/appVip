package cmd.receive.user;

import cmd.Command;
import util.collection.MapItem;
import util.serialize.Decoder;

public class RequestBuyItem extends Command
{
    public int     clientCoin;
    public int     priceCoin;
    public MapItem items;

    public RequestBuyItem (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        items = readMapItem(KEY_ITEMS);
        priceCoin = readInt(KEY_PRICE_COIN);
        clientCoin = readInt(KEY_CLIENT_COIN);
    }
}
