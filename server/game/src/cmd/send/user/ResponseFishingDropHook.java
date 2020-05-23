package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

public class ResponseFishingDropHook extends Message
{
    public ResponseFishingDropHook (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingDropHook packData (Fishing.Pond fishingPond, Fishing.Minigame fishingMinigame, MapItem updateItems)
    {
        put(KEY_FISHING_POND, fishingPond);
        put(KEY_FISHING_MINIGAME, fishingMinigame);
        put(KEY_UPDATE_ITEMS, updateItems);

        return this;
    }
}
