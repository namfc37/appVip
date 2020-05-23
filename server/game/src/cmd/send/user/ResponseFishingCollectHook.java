package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

import java.util.List;

public class ResponseFishingCollectHook extends Message
{
    public ResponseFishingCollectHook (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingCollectHook packData (List<Fishing.Slot> slots, MapItem updateItem)
    {
        put(KEY_FISHING_SLOTS, slots);
        put(KEY_UPDATE_ITEMS, updateItem);
        return this;
    }
}
