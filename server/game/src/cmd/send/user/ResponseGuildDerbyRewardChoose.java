package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.guild.DerbyMilestoneReward;

public class ResponseGuildDerbyRewardChoose extends Message
{
    public ResponseGuildDerbyRewardChoose (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public BaseMessage packData(DerbyMilestoneReward rewards)
	{
    	put (KEY_DATA, rewards);
		return toBaseMessage();
	}
}
