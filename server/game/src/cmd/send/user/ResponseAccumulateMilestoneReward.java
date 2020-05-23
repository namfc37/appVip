package cmd.send.user;

import cmd.Message;
import model.object.UserAccumulate;
import util.collection.MapItem;

public class ResponseAccumulateMilestoneReward extends Message
{
    public ResponseAccumulateMilestoneReward (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public ResponseAccumulateMilestoneReward packData(UserAccumulate accumulate, int checkpoint, int rewardID)
	{
        put(KEY_DATA, accumulate);
        put(KEY_SLOT_ID, checkpoint);
        put(KEY_ITEM_ID, rewardID);
		
        return this;
	}
}
