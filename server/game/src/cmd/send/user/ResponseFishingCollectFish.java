package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

public class ResponseFishingCollectFish extends Message
{
    public ResponseFishingCollectFish (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingCollectFish packData (Fishing fishing, MapItem updateItems, int level, long exp, long gold)
    {
        put(KEY_FISHING, fishing);
        put(KEY_UPDATE_ITEMS, updateItems);
        put(KEY_LEVEL, level);
        put(KEY_EXP, exp);
        put(KEY_GOLD, gold);

        return this;
    }
}
