package cmd.send.user;

import cmd.Message;
import model.object.FlippingCards;

public class ResponseFlippingCardsCheckpointReward extends Message
{
    public ResponseFlippingCardsCheckpointReward (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public Message packData(FlippingCards flippingCard, int mailId)
	{
        put(KEY_FLIPPINGCARDS, flippingCard);
        put(MAIL_UID, mailId);
        
        return this;
	}
}