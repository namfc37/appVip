package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMachineProduce extends Command
{
    public byte   iFloor;
    public String product;

    public RequestMachineProduce (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
        iFloor = readByte(KEY_FLOOR);
        product = readString(KEY_PRODUCT);
    }
}
