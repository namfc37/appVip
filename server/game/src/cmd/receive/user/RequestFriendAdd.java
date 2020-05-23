package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendAdd extends Command
{
    public int[] uids;

    public RequestFriendAdd (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
