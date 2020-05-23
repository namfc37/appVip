package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildInfo;
import util.Time;

public class ResponseGuildSearch extends Message
{
    public ResponseGuildSearch (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (GuildInfo info)
    {
    	put (KEY_GUILD, info);
        return toBaseMessage();
    }
}
