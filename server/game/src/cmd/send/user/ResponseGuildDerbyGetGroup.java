package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerbyGroup;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyGetGroup extends Message
{
    public ResponseGuildDerbyGetGroup (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (GuildDerbyGroup group)
    {
    	put(KEY_GUILD_DERBY, group);
        return toBaseMessage();
    }
}
