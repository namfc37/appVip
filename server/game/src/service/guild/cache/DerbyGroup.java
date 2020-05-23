package service.guild.cache;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import data.MiscDefine;
import data.MiscInfo;
import model.key.InfoKeyGuild;
import redis.clients.jedis.Tuple;
import service.guild.GuildDerby;
import service.guild.GuildDerbyGroup;
import service.guild.GuildInfo;
import service.guild.GuildManager;
import service.guild.GuildDerby.Member;
import util.Database;
import util.Time;
import util.collection.MapItem;
import util.metric.MetricLog;

public class DerbyGroup
{
    public static InfoKeyGuild KEY = InfoKeyGuild.DERBY_GROUP_RANKING;

    public static String getId (int startTime, String league, int id)
    {
        return startTime + "_" + league + "_" + id;
    }
    
    public static Set<Tuple> getPoints (String groupId)
    {
    	return Database.ranking().zrevrangeWithScores (groupId, 0, -1);
    }
    
	public static GuildDerbyGroup get(String groupId)
	{
        String league = null;
        for (String leagueId : ConstInfo.getGuildDerbyData().getLeagueOrder())
        	if (groupId.indexOf(leagueId) != -1)
        		league = leagueId;
        
        if (league == null)
        	return null;
        
        GuildDerbyGroup group = GuildDerbyGroup.create(league, groupId);
        
        Map<Integer, Integer> points = getRaw (groupId);
        for (Entry<Integer, Integer> entry : points.entrySet())
        {
            int guildId = entry.getKey();
        	GuildInfo info = GuildManager.getGuildInfo(guildId);
        	if (info == null)
        		continue;
        	
        	group.add (info);
            group.update (guildId, entry.getValue());
        }
        
    	group.setExpired(Time.getUnixTime() + Time.SECOND_IN_MINUTE * 5);
    	group.setTime(new GuildDerbyTime ());
    	return group;
	}
    
	public static Map<Integer, Integer> getRaw (String groupId)
	{
        Map<Integer, Integer> points = new HashMap<Integer, Integer> ();
        Set<Tuple> dbTop = getPoints (groupId);
        for (Tuple tuple : dbTop)
        {
            int guildId = Integer.parseInt(tuple.getElement());
        	if (!GuildManager.exists (guildId))
        		continue;
        	
            int point = (int) tuple.getScore();
            points.put(guildId, point);
        }
        
        return points;
	}

	public static Set<Integer> getGuildIds (String idGroup)
	{
		Set<Integer> ids = new HashSet<Integer> ();
		Set<String> temp = Database.ranking().hkeys(idGroup);
		
		for (String key : temp)
			try { ids.add(Integer.valueOf(key)); }
			catch (Exception e) {}
		
		return ids;
	}
	
	public static void end (int startTime, String league, String groupId)
    {
        try
        {
         	GuildDerbyGroup group = DerbyGroup.get(groupId);
        	Debug.info("end", startTime, league, groupId);
        	
        	boolean a = group == null;
        	boolean b = a && group.TIME_START() != startTime;
        	boolean c = a && group.LEAGUE() != league; 
        	if (a || b || c)
        		return;

        	List<GuildDerby> finalList = new ArrayList<GuildDerby> ();
        	List<GuildInfo> guildInfos = new ArrayList<GuildInfo> ();

            Set<Tuple> dbTop = getPoints (KEY.keyName(groupId));
            for (Tuple tuple : dbTop)
            {
                int guildId = Integer.parseInt(tuple.getElement());
    			GuildInfo info = GuildManager.getGuildInfo (guildId);
    			GuildDerby derby = GuildManager.getGuildDerbyInfo (guildId);

    			if (info == null || derby == null)
    				continue;
    			
    			derby.loadMembers();
    			derby.loadTasks(false, true, true);
    			derby.updateMilestonte ();

    			guildInfos.add(info);
    			finalList.add(derby);
            }
            
            finalList.sort((a1, b1) -> b1.getPoint() - a1.getPoint());
            
            int order = 1;
            int minPoint = ConstInfo.getGuildDerbyData().getFisrtMilestone ();
            int minOrder = Math.max (3, finalList.size() - 3);
            String nextLeague = ConstInfo.getGuildDerbyData().getLeagueUp (league);
            String backLeague = ConstInfo.getGuildDerbyData().getLeagueDown (league);
            
            for (GuildDerby derby : finalList)
            {
            	String newLeague = league;
            	if (derby.getPoint() < minPoint || order > minOrder)
            		newLeague = backLeague;
            	else if (order < 4)
            		newLeague = nextLeague;
            	
            	derby.end(order, newLeague);
				derby.save ();
            	
				GuildInfo info = guildInfos.get(order - 1);
				MapItem reward = derby.getGroupReward();
				
				if (reward != null && reward.size() > 0)
				for (int memberId : derby.getMemberIds ())
				{
					Member member = derby.getMember(memberId);
					if (member.POINT () > 0)
						info.sendMailTo(MiscDefine.MAIL_GUILD_DERBY_REWARD, memberId, MiscInfo.DERBY_MEMBER_REWARD_MAIL_DESC(), reward);
				}
				
            	order += 1;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }
}
