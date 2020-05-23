package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingCollectFish extends Command
{

    public RequestFishingCollectFish (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    }
}
