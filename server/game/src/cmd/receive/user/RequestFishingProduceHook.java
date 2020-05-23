package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestFishingProduceHook extends Command
{
    public int slotIndex;
    public String hookId;

    public RequestFishingProduceHook (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
        slotIndex = readInt(KEY_FISHING_SLOT_INDEX);
        hookId = readString(KEY_FISHING_HOOK);
    }
}
