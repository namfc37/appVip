package cmd.send.user;

import cmd.Message;
import model.AccumulateStore;
import model.object.UserAccumulate;
import util.collection.MapItem;

public class ResponseAccumulateGet extends Message
{
    public ResponseAccumulateGet (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public ResponseAccumulateGet packData(UserAccumulate accumulate, AccumulateStore store, MapItem mapItem)
	{
        put(KEY_DATA, accumulate);
        put(KEY_UPDATE_ITEMS, mapItem);
        put(KEY_ITEMS, store);
		
        return this;
	}
}
