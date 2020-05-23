package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPrivateShopCancel extends Command
{
    public int idSlot;
    public int clientCoin;
    public int priceCoin;

    public RequestPrivateShopCancel (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        idSlot = readByte(KEY_SLOT_ID);
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
    }
}
