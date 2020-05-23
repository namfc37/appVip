package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestGachaGetReward extends Command
{
    public String id;

    public RequestGachaGetReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        id = readString(KEY_ITEM_ID);
    }
}
