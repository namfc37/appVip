package service.udp;

import service.guild.cache.CacheGuildInfo;
import service.guild.cache.CacheGuildServer;

public class MsgUpdateGuildInfo extends AbstractMessage
{
    public CacheGuildInfo info;

    public MsgUpdateGuildInfo (CacheGuildInfo info)
    {
        super(CMD_UPDATE_GUILD_INFO);

        this.info = info;
    }

    @Override
    public void handle ()
    {
        CacheGuildServer.updateGuildInfo(info);
    }
}
