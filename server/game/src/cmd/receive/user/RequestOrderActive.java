package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestOrderActive extends Command
{
    public int clientCoin;
    public int priceCoin;
    public int id;

    public RequestOrderActive (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
        id = readInt(KEY_SLOT_ID);
    }
}
