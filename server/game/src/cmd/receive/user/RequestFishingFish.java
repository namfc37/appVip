package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingFish extends Command
{
    public int point;

    public RequestFishingFish (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        point = readInt(KEY_FISHING_POINT);
    }
}
