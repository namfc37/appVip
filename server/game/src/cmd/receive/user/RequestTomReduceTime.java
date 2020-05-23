package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestTomReduceTime extends Command
{
    public String support;
    public int    num;

    public RequestTomReduceTime (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        support = readString(KEY_ITEM_SUPPORT);
        num = readInt(KEY_ITEM_NUM);
    }
}
