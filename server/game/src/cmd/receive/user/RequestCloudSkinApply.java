package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestCloudSkinApply extends Command
{
    public int    floorId;
    public String itemId;
    public int    itemNum;

    public RequestCloudSkinApply (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        floorId = readInt(KEY_FLOOR);
        itemId = readString(KEY_ITEM_ID);
        itemNum = readInt(KEY_ITEM_NUM);
    }
}
