package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestMailDelete extends Command
{
    public int[] uids;

    public RequestMailDelete (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        uids = readIntArray(KEY_UID);
    }
}
