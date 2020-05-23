package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPlant extends Command
{
    public String plant;
    public byte[] iFloors;
    public byte[] iSlots;
    public int[]  iTimes;

    public RequestPlant (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        plant = readString(KEY_PLANT);
        iFloors = readByteArray(KEY_FLOOR);
        iSlots = readByteArray(KEY_SLOT_ID);
        iTimes = readIntArray(KEY_TIME);
    }
}
