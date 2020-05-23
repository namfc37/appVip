package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestDecorPut extends Command
{
    public String decor;
    public byte[] iFloors;
    public byte[] iSlots;

    public RequestDecorPut (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        decor = readString(KEY_DECOR);
        iFloors = readByteArray(KEY_FLOOR);
        iSlots = readByteArray(KEY_SLOT_ID);
    }
}
