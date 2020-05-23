package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPlantHarvest extends Command
{
    public byte[] iFloors;
    public byte[] iSlots;

    public RequestPlantHarvest (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloors = readByteArray(KEY_FLOOR);
        iSlots = readByteArray(KEY_SLOT_ID);
    }
}
