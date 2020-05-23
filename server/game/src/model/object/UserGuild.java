package model.object;

import java.util.Map;

import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import extension.EnvConfig;
import model.guild.DerbyMilestoneReward;
import model.key.InfoKeyUser;
import net.spy.memcached.CASValue;
import service.guild.GuildDerby;
import service.guild.GuildInfo;
import service.guild.GuildManager;
import util.Json;
import util.Time;
import util.memcached.AbstractDbKeyValue;
import util.memcached.CasValue;
import util.metric.MetricLog;
import util.serialize.Encoder;

public class UserGuild extends Encoder.IObject implements KeyDefine
{	
    private transient int userId;
    
	private int id;
	private int role;
	private int time_join;
	private int time_penaty;

	private int donateTotal;
	private int donateRemain;
	private int donateItemRemain;
	
	private boolean hasDonate;
	
//	time to next donate request
	private int nextDonate;
	
//	cache reward	
	private DerbyMilestoneReward milestoneRewards;
	
	private UserGuild () {}
	
	public static UserGuild create (int userId)
	{
		UserGuild guild = new UserGuild ();
		guild.userId = userId;
		guild.id = -1;
		guild.role = MiscDefine.GUILD_ROLE_STRANGER;
		guild.time_join = 0;
		guild.time_penaty = 0;
		guild.hasDonate = false;
		guild.donateTotal = 0;
		guild.donateRemain = MiscInfo.GUILD_DONATE_TURN_LIMIT();
		guild.donateItemRemain = 0;
		guild.nextDonate = Time.getUnixTime();
//		guild.update ();
		
		return guild;
	}

	public static UserGuild create(int userId, GuildInfo guildInfo)
	{
		UserGuild guild = new UserGuild ();
		guild.userId = userId;
		guild.id = guildInfo.getId();
		guild.role = guildInfo.member_role(userId);
		guild.time_join = 0;
		guild.time_penaty = 0;
		guild.hasDonate = false;
		guild.donateTotal = 0;
		guild.donateRemain = MiscInfo.GUILD_DONATE_TURN_LIMIT();
		guild.donateItemRemain = 0;
		guild.nextDonate = Time.getUnixTime();
		
		return guild;
	}

	public void set(GuildInfo guildInfo)
	{
		this.id = guildInfo.getId();
		this.role = guildInfo.member_role(userId);
		this.hasDonate = false;
		this.nextDonate = Time.getUnixTime();
	}
	
	private void reset ()
	{
		this.id = -1;
		this.role = MiscDefine.GUILD_ROLE_STRANGER;
		this.time_join = 0;
		this.setPenaty(0);
		this.hasDonate = false;
		this.nextDonate = Time.getUnixTime();
	}
	
	public boolean update()
	{
		if (id == -1)
			return false;
		
		boolean exists = GuildManager.exists(id);
		if (exists)
			return false;
		
		reset ();
		return true;
	}

	public void resetDaily()
	{
		donateRemain = MiscInfo.GUILD_DONATE_TURN_LIMIT();
		donateItemRemain = 0;
	}
	
	public void setRole (int role)
	{
		this.role = role;
	}
	
	public boolean setPenaty (int time)
	{
		if (this.time_penaty > time)
			return false;
		
		this.time_penaty = time;
		return true;
	}
	
	public int getPenaty ()
	{
		return this.time_penaty;
	}
	
	public boolean isGuildJoinPenaty ()
	{
		if (this.time_penaty < 1)
			return false;
		
		return this.time_penaty > Time.getUnixTime(); 
	}

	public int getId()
	{
		return this.id;
	}

	public boolean isMember()
	{
		return this.id != -1 && this.role != MiscDefine.GUILD_ROLE_STRANGER;
	}

	public int donateRemain()
	{
		return donateRemain;
	}
	
	public int donateItemRemain()
	{
		return MiscInfo.GUILD_DONATE_ITEM_LIMIT() - donateItemRemain;
	}
	
	public int donateItemTotal()
	{
		return donateItemRemain;
	}
	
	public int donateNextTime ()
	{
		return this.nextDonate;
	}
	
	public void setDonateActive(boolean isActive)
	{
		this.hasDonate = isActive;
		if (isActive)
			this.nextDonate = Time.getUnixTime() + MiscInfo.GUILD_DONATE_COOLDOWN ();
	}

	public GuildInfo getInfo()
	{
		if (this.id == -1)
			return null;
		
		return GuildManager.getGuildInfo(this.id);
	}

	public GuildDerby getDerbyInfo()
	{
		if (this.id == -1)
			return null;
		
		return GuildManager.getGuildDerbyInfo(this.id);
	}
	
	public void addDonateCount (int addValue)
	{
		this.donateItemRemain += addValue;
		this.donateTotal += addValue;
	}
	
	public void consumeDonateRemain ()
	{
		donateRemain -= 1;
	}
	
	public DerbyMilestoneReward getMileStoneReward()
	{
		return this.milestoneRewards;
	}
	
	public DerbyMilestoneReward initMileStoneReward (int timeEnd, int milestone)
	{
		DerbyMilestoneReward temp = DerbyMilestoneReward.create(timeEnd, milestone);
		
		if (temp != null)
			this.milestoneRewards = temp;
		
		return this.milestoneRewards;
	}

	public DerbyMilestoneReward initMilestoneRewardByLeagueID (int timeEnd, String leagueID)
	{
		DerbyMilestoneReward temp = DerbyMilestoneReward.createByLeagueID(timeEnd, leagueID);

		if (temp != null)
			this.milestoneRewards = temp;

		return this.milestoneRewards;
	}
	
	public boolean join(int guildId) 
	{
//		if (this.isGuildJoinPenaty())
//			return false;
		
		if (this.id > 0)
			return false;

		this.id = guildId;
		this.role = MiscDefine.GUILD_ROLE_MEMBER;
		this.time_join = Time.getUnixTime();
		this.time_penaty = 0;
		this.hasDonate = false;
		return true;
	}
	
	public boolean kick(int guildId, int timePenalty)
	{
		if (guildId != this.id)
			return false;
		
		this.id = -1;
		this.role = MiscDefine.GUILD_ROLE_STRANGER;
		this.time_join = 0;
		this.setPenaty(Time.getUnixTime() + timePenalty);
		this.hasDonate = false;
		return true;
	}
	
	public boolean leave(int guildId)
	{
		if (guildId != this.id)
			return false;
		
		this.id = -1;
		this.role = MiscDefine.GUILD_ROLE_STRANGER;
		this.time_join = 0;
		this.setPenaty(Time.getUnixTime() + MiscInfo.GUILD_LEAVE_PENALTY());
		this.hasDonate = false;
		return true;
	}
	
    @Override
    public void putData (Encoder msg)
    {
    	msg.put(GUILD_USER_ID, this.id);
    	msg.put(GUILD_USER_ROLE, this.role);
    	msg.put(GUILD_USER_JOIN_AT, this.time_join);
    	msg.put(GUILD_USER_PENATY, this.time_penaty);
    	msg.put(GUILD_USER_DONATE, this.hasDonate);
    	msg.put(GUILD_USER_DONATE_REMAIN, this.donateRemain);
    	msg.put(GUILD_USER_DONATE_ITEM_REMAIN, this.donateItemRemain);
    	msg.put(GUILD_USER_DONATE_NEXT_TIME, this.nextDonate);
    }
    
//-----------------------------------------------------------------------------------------------
    
    private final static InfoKeyUser INFO_KEY = InfoKeyUser.GUILD;

    private static AbstractDbKeyValue db (String bucketId)
    {
        return INFO_KEY.db(bucketId);
    }

    private static String keyName (int userId)
    {
        return INFO_KEY.keyName(userId);
    }

    private static int expire ()
    {
        return INFO_KEY.expire();
    }

    public String encode ()
    {
        return EnvConfig.getUser().useJsonPretty() ? Json.toJsonPretty(this) : Json.toJson(this);
    }

    public static UserGuild decode (int userId, Object raw)
    {
        try
        {
            if (raw != null)
            {
            	UserGuild obj = Json.fromJson((String) raw, UserGuild.class);
                obj.userId = userId;
                return obj;
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, userId);
        }
        return null;
    }

    public static Object getRaw (String bucketId, int userId)
    {
        return db(bucketId).get(keyName(userId));
    }

    public static boolean set (String bucketId, int userId, UserGuild guild)
    {
        return db(bucketId).set(keyName(userId), guild.encode(), expire());
    }

    public static UserGuild get (String bucketId, int userId)
    {
        return decode(userId, getRaw(bucketId, userId));
    }

    public static UserGuild get (int userId, Map<String, Object> mapData)
    {
        return decode(userId, mapData.get(keyName(userId)));
    }

    public static CasValue<UserGuild> gets (String bucketId, int userId)
    {
        CASValue<Object> raw = db(bucketId).gets(keyName(userId));
        if (raw == null)
            return null;

        return new CasValue<>(raw.getCas(), raw, decode(userId, raw.getValue()));
    }

    public static boolean cas (String bucketId, int userId, long cas, UserGuild object)
    {
        return db(bucketId).cas(keyName(userId), cas, object.encode(), expire());
    }
}