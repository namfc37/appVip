package cmd.receive.user;


import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingDropBait extends Command
{
    String itemId;

    public RequestFishingDropBait (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        itemId=readString(KEY_ITEM_ID);
    }
}
