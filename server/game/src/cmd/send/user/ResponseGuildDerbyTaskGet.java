package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyTaskGet extends Message
{
    public ResponseGuildDerbyTaskGet (short cmd, byte error)
    {
        super(cmd, error);
    }
    
	public BaseMessage packData(GuildDerby derby)
	{
    	put (KEY_GUILD_DERBY, derby);
        return toBaseMessage();
	}
}
