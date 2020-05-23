package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestStockUpgrade extends Command
{
    public int  clientCoin;
    public int  priceCoin;
    public byte stockId;

    public RequestStockUpgrade (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        stockId = readByte(KEY_SLOT_ID);
        priceCoin = readInt(KEY_PRICE_COIN);
        clientCoin = readInt(KEY_CLIENT_COIN);
    }
}
