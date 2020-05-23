package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingCollectHook extends Command
{
    public int slotIndex;

    public RequestFishingCollectHook (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        slotIndex = readInt(KEY_FISHING_SLOT_INDEX);
    }
}
