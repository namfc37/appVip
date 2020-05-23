package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendDenyRequest extends Command
{
    public int[] uids;

    public RequestFriendDenyRequest (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
