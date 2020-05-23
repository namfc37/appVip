package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

import java.util.List;

public class ResponseFishingHireSlot extends Message
{
    public ResponseFishingHireSlot (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingHireSlot packData (List<Fishing.Slot> slots, long coin)
    {
        put(KEY_FISHING_SLOTS, slots);
        put(KEY_COIN, coin);
        return this;
    }
}
