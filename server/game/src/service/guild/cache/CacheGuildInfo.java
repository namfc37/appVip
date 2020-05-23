package service.guild.cache;

import data.KeyDefine;
import data.MiscDefine;
import service.guild.GuildInfo;
import util.serialize.Encoder;

public class CacheGuildInfo extends Encoder.IObject implements KeyDefine
{
    private int    id;
    private String name;
    private String avatar;
    private String description;
    private int    level;
    private int    timeUpdate;
    private int    timeExpire;
    private int    numMember;
    private int    type;
    private String league;
    private int    status;

    private CacheGuildInfo ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public CacheGuildInfo (GuildInfo info)
    {
        id = info.getId();
        name = info.getName();
        avatar = info.getAvatar();
        description = info.getShortDesc();
        level = info.getLevel();
        timeUpdate = info.getTimeUpdate();
        timeExpire = info.getTimeExpire();
        numMember = info.getMemberNumber();
        type = info.getType();
        status = info.getStatus();
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(GUILD_ID, id);
        msg.put(GUILD_LEVEL, level);
        msg.put(GUILD_NAME, name);
        msg.put(GUILD_AVATAR, avatar);
        msg.put(GUILD_DESC, description);
        msg.put(GUILD_TYPE, type);
        msg.put(GUILD_MEMBER_NUMBER, numMember);
        //msg.put(GUILD_RANK, rank);
    }

    public int getId ()
    {
        return id;
    }

    public String getName ()
    {
        return name;
    }

    public String getAvatar ()
    {
        return avatar;
    }

    public String getDescription ()
    {
        return description;
    }

    public int getLevel ()
    {
        return level;
    }

    public int getTimeUpdate ()
    {
        return timeUpdate;
    }

    public int getNumMember ()
    {
        return numMember;
    }

    public int getType ()
    {
        return type;
    }

    public int getTimeExpire ()
    {
        return timeExpire;
    }

    public String getLeague ()
    {
        return league;
    }

    public void setLeague (String league)
    {
        this.league = league;
    }
    
	public boolean isDisband()
	{
		return status == MiscDefine.GUILD_STATUS_DISBAND;
	}
}
