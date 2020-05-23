package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFriendBugCatch extends Command
{
    public String id;

    public RequestFriendBugCatch (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readString(KEY_ITEM_ID);
    }
}
