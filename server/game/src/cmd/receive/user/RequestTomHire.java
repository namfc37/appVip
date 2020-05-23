package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTomHire extends Command
{
    public byte type;
    public int  clientCoin;
    public int  priceCoin;

    public RequestTomHire (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        type = readByte(KEY_TYPE);
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
    }
}
