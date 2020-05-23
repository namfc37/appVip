package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPrivateShopPut extends Command
{
    public int     idSlot;
    public int     clientCoin;
    public int     fee;
    public String  item;
    public int     num;
    public int     priceSell;
    public boolean useAd;

    public RequestPrivateShopPut (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        idSlot = readByte(KEY_SLOT_ID);
        clientCoin = readInt(KEY_CLIENT_COIN);
        fee = readInt(KEY_FEE);
        item = readString(KEY_ITEM_ID);
        num = readInt(KEY_ITEM_NUM);
        priceSell = readInt(KEY_PRICE_SELL);
        useAd = readBoolean(KEY_USE_AD);
    }
}
