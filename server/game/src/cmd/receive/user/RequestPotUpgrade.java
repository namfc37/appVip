package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPotUpgrade extends Command
{
    public byte   iFloor;
    public byte   iSlot;
    public String greenGrass;

    public RequestPotUpgrade (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
        iSlot = readByte(KEY_SLOT_ID);
        greenGrass = readString(KEY_GREEN_GRASS);
    }
}
