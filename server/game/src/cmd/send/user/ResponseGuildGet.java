package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildInfo;
import util.Time;

public class ResponseGuildGet extends Message
{
    public ResponseGuildGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (GuildInfo guild)
    {
		put(KEY_GUILD, guild);
        return toBaseMessage();
    }
}
