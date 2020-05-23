package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestLuckySpin extends Command
{
    public int clientCoin;
    public int priceCoin;

    public RequestLuckySpin (Decoder dataCmd)
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
