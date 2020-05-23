package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingDropHook extends Command
{
    public String hookId;

    public RequestFishingDropHook (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        hookId = readString(KEY_FISHING_HOOK);
    }
}
