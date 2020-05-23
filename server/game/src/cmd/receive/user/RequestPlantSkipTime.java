package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPlantSkipTime extends Command
{
    public int  clientCoin;
    public int  priceCoin;
    public byte iFloor;
    public byte iSlot;

    public RequestPlantSkipTime (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        clientCoin = readInt(KEY_CLIENT_COIN);
        priceCoin = readInt(KEY_PRICE_COIN);
        iFloor = readByte(KEY_FLOOR);
        iSlot = readByte(KEY_SLOT_ID);
    }
}
