package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPrivateShopSkipTime extends Command
{
    public int clientCoin;
    public int priceCoin;

    public RequestPrivateShopSkipTime (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
    }
}
