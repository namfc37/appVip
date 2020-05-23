package cmd.send.user;

import cmd.BaseMessage;
import cmd.Message;
import service.guild.GuildDerby;
import service.guild.GuildInfo;
import util.collection.MapItem;

public class ResponseGuildDerbyGet extends Message
{
    public ResponseGuildDerbyGet (short cmd, byte error)
    {
        super(cmd, error);
    }

    public BaseMessage packData (GuildDerby derby, int nextTimeStart)
    {
    	put (KEY_GUILD_DERBY, derby);
        put (KEY_DERBY_NEXT_TIME_START, nextTimeStart);
        return toBaseMessage();
    }
}
