package cmd.send.user;

import cmd.Message;
import model.AccumulateStore;
import model.object.UserAccumulate;
import util.collection.MapItem;

public class ResponseAccumulateStore extends Message
{
    public ResponseAccumulateStore (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public Message packData(UserAccumulate accumulate, AccumulateStore store, MapItem updateItem, String packId)
	{
		put(KEY_DATA, accumulate);
        put(KEY_ITEMS, store);
        put(KEY_UPDATE_ITEMS, updateItem);
        put(KEY_ITEM_ID, packId);
        
        return this;
	}
}
