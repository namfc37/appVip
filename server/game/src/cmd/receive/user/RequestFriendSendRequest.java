package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendSendRequest extends Command
{
    public int[] uids;

    public RequestFriendSendRequest (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
