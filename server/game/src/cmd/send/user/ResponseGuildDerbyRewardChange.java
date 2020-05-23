package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.guild.DerbyMilestoneReward;
import service.guild.GuildDerby.Member;
import service.guild.GuildDerby.Task;

public class ResponseGuildDerbyRewardChange extends Message
{
    public ResponseGuildDerbyRewardChange (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public BaseMessage packData(DerbyMilestoneReward rewards, long coinRemain)
	{
    	put (KEY_DATA, rewards);
    	put (KEY_COIN, coinRemain);
        return toBaseMessage();
	}
}
