package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestCloudSkinClear extends Command
{
    public int floorId;

    public RequestCloudSkinClear (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        floorId = readInt(KEY_FLOOR);
    }
}
