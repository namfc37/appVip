package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGachaOpenChest extends Command
{
    public String id;
    public int    clientCoin;
    public int    priceCoin;

    public RequestGachaOpenChest (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readString(KEY_ITEM_ID);
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
    }
}
