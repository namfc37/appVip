package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAccumulateStore extends Command
{
	public String itemID;

    public RequestAccumulateStore (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    	itemID = readString(KEY_ITEM_ID);
    }
}
