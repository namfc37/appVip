package cmd.send.user;

import cmd.Message;
import model.object.FlippingCards;
import util.collection.MapItem;

public class ResponseFlippingCardsGameStart extends Message
{
    public ResponseFlippingCardsGameStart (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public Message packData(FlippingCards flippingCard, MapItem updateItems)
	{
		put(KEY_FLIPPINGCARDS, flippingCard);
		put(KEY_UPDATE_ITEMS, updateItems);
		
        return this;
	}
}