package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMailMarkRead extends Command
{
    public int[] uids;

    public RequestMailMarkRead (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
