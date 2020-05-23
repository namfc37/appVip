package cmd.receive.user;

import cmd.Command;
import util.serialize.Decoder;

public class RequestAccumulateMilestoneReward extends Command
{
	public int checkpoint;

    public RequestAccumulateMilestoneReward (Decoder dataCmd)
    {
        super(dataCmd);
    }

    @Override
    protected void unpackData ()
    {
    	checkpoint = readInt(KEY_SLOT_ID);
    }
}
