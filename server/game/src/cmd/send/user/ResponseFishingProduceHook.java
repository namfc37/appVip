package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

import java.util.HashMap;
import java.util.List;

public class ResponseFishingProduceHook extends Message
{


    public ResponseFishingProduceHook (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingProduceHook packData (List<Fishing.Slot> slots, HashMap<String, MapItem> hookProduceRequire, MapItem updateItems)
    {
        put(KEY_FISHING_SLOTS, slots);
        putStrings(KEY_FISHING_HOOK_PRODUCE_LIST_NAME,hookProduceRequire.keySet());
        putMapItem(KEY_FISHING_HOOK_PRODUCE_LIST_REQUIRE,hookProduceRequire.values());
        put(KEY_UPDATE_ITEMS, updateItems);
        return this;
    }
}
