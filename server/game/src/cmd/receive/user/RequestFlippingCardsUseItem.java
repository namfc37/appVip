package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFlippingCardsUseItem extends Command
{
    public String itemId;
    public int    itemNum;

    public RequestFlippingCardsUseItem (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        itemId = readString(KEY_ITEM_ID);
        itemNum = readInt(KEY_ITEM_NUM);
    }
}

