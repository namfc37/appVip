package cmd.receive.user;

import util.serialize.Decoder;
import cmd.Command;

public class RequestGuildDerbyMilestoneRewardClaim extends Command
{
	public int[] rewardId;
	
	public RequestGuildDerbyMilestoneRewardClaim (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    public void unpackData ()
    {
    	rewardId = readIntArray(KEY_SLOT_ID);
    }
}
