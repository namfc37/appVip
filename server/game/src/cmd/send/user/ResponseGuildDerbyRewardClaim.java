package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby.Member;
import service.guild.GuildDerby.Task;

public class ResponseGuildDerbyRewardClaim extends Message
{
    public ResponseGuildDerbyRewardClaim (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData ()
    {
        return toBaseMessage();
    }
}
