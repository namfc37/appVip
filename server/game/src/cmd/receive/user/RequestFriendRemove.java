package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendRemove extends Command
{
    public int[] uids;

    public RequestFriendRemove (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
