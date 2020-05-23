package cmd.send.user;

import cmd.Message;
import model.object.Fishing;
import util.collection.MapItem;

public class ResponseFishingGet extends Message
{
    public ResponseFishingGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public ResponseFishingGet packData (Fishing fishing)
    {
        put(KEY_FISHING, fishing);
        return this;
    }
}
