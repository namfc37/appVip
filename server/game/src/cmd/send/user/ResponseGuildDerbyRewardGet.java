package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import model.guild.DerbyMilestoneReward;
import service.guild.GuildDerby.Member;
import service.guild.GuildDerby.Task;

public class ResponseGuildDerbyRewardGet extends Message
{
    public ResponseGuildDerbyRewardGet (short cmd, byte error)
    {
        super(cmd, error);
    }

	public BaseMessage packData(DerbyMilestoneReward rewards)
	{
		put (KEY_GUILD_DERBY, rewards);
        return toBaseMessage();
	}
}
