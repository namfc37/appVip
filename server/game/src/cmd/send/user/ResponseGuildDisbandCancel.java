package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildInfo;

public class ResponseGuildDisbandCancel extends Message
{
    public ResponseGuildDisbandCancel (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (int memberId, GuildInfo info)
    {
    	put(KEY_USER_ID, memberId);
    	put(KEY_GUILD, info);
        return toBaseMessage();
    }
}
