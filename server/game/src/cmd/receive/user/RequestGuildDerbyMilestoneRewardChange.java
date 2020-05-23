package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyMilestoneRewardChange extends Command
{
	public int clientPrice;
	public int clientCoin;
	public int[] rewardId;
	
	public RequestGuildDerbyMilestoneRewardChange (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	clientPrice = readInt(KEY_PRICE_COIN);
    	clientCoin = readInt(KEY_CLIENT_COIN);
    	rewardId = readIntArray(KEY_SLOT_ID);
    }
}
