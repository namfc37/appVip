package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

public class ResponseFishingFish extends Message
{
    public ResponseFishingFish (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingFish packData (Fishing.Minigame minigame)
    {
        put(KEY_FISHING_MINIGAME, minigame);
        return this;
    }
}
