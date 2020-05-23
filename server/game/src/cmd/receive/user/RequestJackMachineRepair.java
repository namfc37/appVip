package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestJackMachineRepair extends Command
{
    public byte  iFloor;
    public short level;
    public int   num;

    public RequestJackMachineRepair (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
        level = readByte(KEY_LEVEL);
        num = readInt(KEY_NUM);
    }
}
