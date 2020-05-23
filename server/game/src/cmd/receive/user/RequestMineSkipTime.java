package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMineSkipTime extends Command
{
    public int priceCoin;
    public int clientCoin;

    public RequestMineSkipTime (Decoder dataCmd)
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