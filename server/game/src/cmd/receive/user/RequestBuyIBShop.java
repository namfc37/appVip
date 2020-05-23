package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestBuyIBShop extends Command
{
    public int    clientCoin;
    public int    priceCoin;
    public String priceType;
    public String itemId;
    public int    itemNum;

    public RequestBuyIBShop (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        priceCoin = readInt(KEY_PRICE_COIN);
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceType = readString(KEY_PRICE_TYPE);
        itemId = readString(KEY_ITEM_ID);
        itemNum = readInt(KEY_ITEM_NUM);
    }
}
