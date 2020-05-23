package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTomFind extends Command
{
    public String item;
    public String support;

    public RequestTomFind (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        item = readString(KEY_ITEM_ID);
        support = readString(KEY_ITEM_SUPPORT);
    }
}
