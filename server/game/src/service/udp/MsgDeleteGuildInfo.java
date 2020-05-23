package service.udp;

import service.guild.cache.CacheGuildInfo;
import service.guild.cache.CacheGuildServer;

public class MsgDeleteGuildInfo extends AbstractMessage
{
    public int guildId;

    public MsgDeleteGuildInfo (int guildId)
    {
        super(CMD_DELETE_GUILD_INFO);

        this.guildId = guildId;
    }

	@Override
    public void handle ()
    {
        CacheGuildServer.deleteGuildInfo(guildId);
    }
}
