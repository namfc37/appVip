package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestPotMove extends Command
{
    public byte fromFloor;
    public byte fromSlot;
    public byte toFloor;
    public byte toSlot;

    public RequestPotMove (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        fromFloor = readByte(KEY_FROM_FLOOR);
        fromSlot = readByte(KEY_FROM_SLOT_ID);
        toFloor = readByte(KEY_FLOOR);
        toSlot = readByte(KEY_SLOT_ID);
    }
}
