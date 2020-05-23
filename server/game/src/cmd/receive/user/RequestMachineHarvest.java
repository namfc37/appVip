package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineHarvest extends Command
{
    public byte iFloor;

    public RequestMachineHarvest (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
    }
}
