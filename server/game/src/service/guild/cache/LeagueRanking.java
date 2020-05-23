package service.guild.cache;

import model.key.InfoKeyGuild;

public class LeagueRanking
{
    private final static InfoKeyGuild INFO_KEY = InfoKeyGuild.DERBY_LEAGUE_RANKING;

    public static String keyName (String league, int week)
    {
        return INFO_KEY.keyName(league + INFO_KEY.SEPARATOR + week);
    }

    public static int expire ()
    {
        return INFO_KEY.expire();
    }
}
