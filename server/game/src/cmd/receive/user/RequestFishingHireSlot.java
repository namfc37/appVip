package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingHireSlot extends Command
{
    public int clientCoin;
    public int clientPrice;
    public int indexSlot;

    public RequestFishingHireSlot (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        clientCoin= readInt(KEY_CLIENT_COIN);
        clientPrice = readInt(KEY_PRICE_COIN);
        indexSlot = readInt(KEY_FISHING_SLOT_INDEX);
    }
}
