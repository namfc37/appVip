package cmd.send.user;

import cmd.Message;
import model.object.FlippingCards;
import model.object.FlippingCards.Result;
import util.collection.MapItem;

public class ResponseFlippingCardsGameEnd extends Message
{
    public ResponseFlippingCardsGameEnd (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public Message packData(FlippingCards flippingCard, Result gameResult, long gold, long exp, MapItem updateItems)
	{
        put(KEY_FLIPPINGCARDS, flippingCard);
        put(KEY_DATA, gameResult);
        put(KEY_UPDATE_ITEMS, updateItems);
        put(KEY_GOLD, gold);
        put(KEY_EXP, exp);

        return this;
	}
}