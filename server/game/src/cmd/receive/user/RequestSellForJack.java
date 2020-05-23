package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestSellForJack extends Command
{
    public String id;
    public int    num;

    public RequestSellForJack (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readString(KEY_ITEM_ID);
        num = readInt(KEY_ITEM_NUM);
    }
}
