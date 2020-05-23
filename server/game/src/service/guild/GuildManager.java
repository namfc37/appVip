package service.guild;

import data.ConstInfo;
import model.key.InfoKeyGuild;
import service.guild.cache.CacheGuildClient;
import service.guild.cache.GuildDerbyTime;
import util.Database;

public class GuildManager
{
	private static final int START_ID = 100_000;
	
    public static int nextId ()
    {
        Long v = Database.ranking().incr(InfoKeyGuild.IDS.keyName());
        return v == null ? -1 : countToId(v.intValue());
    }

    public static boolean exists (int id)
    {
        return Database.ranking().exists(InfoKeyGuild.INFO.keyName(id)) == true;
    }

    public static GuildInfo create (int id, String name, String avatar, String desc, int status, int userId, GuildMemberInfo userInfo)
    {
        if (exists(id))
            return null;

        GuildInfo info = GuildInfo.create(id, name, avatar, desc, status, userId, userInfo);
        info.save();

        CacheGuildClient.updateGuildInfo(info);
        return info;
    }

    public static GuildInfo getGuildInfo (int guildId)
    {
        return GuildInfo.load(guildId);
    }

	public static GuildDerby getGuildDerbyInfo (int guildId)
	{
		GuildDerby derby = GuildDerby.load(guildId);

//		if (derby == null)
//		{
//			GuildInfo info = GuildInfo.load(guildId);
//			if (info != null)
//			{
//				info.loadMembers();
//				
//				GuildDerbyTime time = new GuildDerbyTime ();
//				derby = GuildDerby.create(info, ConstInfo.getGuildDerbyData().getLeagueDefault().ID(), "L1_1", time.getStartTime(), time.getEndTime(), time.getRewardTime());
//				derby.save();
//			}
//		}
		
		return derby;
	}

    public static int numRegister()
    {
        String raw = Database.ranking().get(InfoKeyGuild.IDS.keyName());
        if (raw == null)
            return 0;
        return Integer.parseInt(raw);
    }

    public static int countToId (int count)
    {
        return START_ID + count;
    }
}
