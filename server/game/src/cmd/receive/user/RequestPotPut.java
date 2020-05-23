package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPotPut extends Command
{
    public String pot;
    public byte[] iFloors;
    public byte[] iSlots;

    public RequestPotPut (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        pot = readString(KEY_POT);
        iFloors = readByteArray(KEY_FLOOR);
        iSlots = readByteArray(KEY_SLOT_ID);
    }
}
