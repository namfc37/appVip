package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMailGetReward extends Command
{
    public int[] uids;

    public RequestMailGetReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
