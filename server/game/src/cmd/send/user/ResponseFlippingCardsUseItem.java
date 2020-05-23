package cmd.send.user;

import cmd.Message;
import util.collection.MapItem;

public class ResponseFlippingCardsUseItem extends Message
{
    public ResponseFlippingCardsUseItem (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public Message packData(MapItem updateItems, String activeItemId)
	{
		put(KEY_ITEMS, activeItemId);
		put(KEY_UPDATE_ITEMS, updateItems);
		
        return this;
	}
}