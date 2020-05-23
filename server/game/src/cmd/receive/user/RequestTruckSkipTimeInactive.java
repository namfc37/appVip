package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTruckSkipTimeInactive extends Command
{
    public int priceCoin;
    public int clientCoin;

    public RequestTruckSkipTimeInactive (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        priceCoin = readInt(KEY_PRICE_COIN);
        clientCoin = readInt(KEY_CLIENT_COIN);
    }
}
