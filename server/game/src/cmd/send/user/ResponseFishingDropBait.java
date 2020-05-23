package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

public class ResponseFishingDropBait extends Message
{
    public ResponseFishingDropBait (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingDropBait packData (Fishing.Pond pond, Fishing.Minigame minigame, MapItem updateItems)
    {
        put(KEY_FISHING_POND, pond);
        put(KEY_FISHING_MINIGAME, minigame);
        put(KEY_UPDATE_ITEMS, updateItems);
        return this;
    }
}
