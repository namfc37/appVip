package service.udp;

import service.guild.cache.CacheGuildServer;

public class MsgUpdateGuildLeague extends AbstractMessage
{
    public int id;
    public String league;

    public MsgUpdateGuildLeague (int id, String rank)
    {
        super(CMD_UPDATE_GUILD_LEAGUE);

        this.id = id;
        this.league = rank;
    }

    @Override
    public void handle ()
    {
        CacheGuildServer.updateGuildRank(id, league);
    }
}
