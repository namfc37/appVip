package service.guild;

import data.KeyDefine;
import data.MiscDefine;
import model.UserGame;
import util.Time;
import util.serialize.Encoder;

public class GuildMemberInfo extends Encoder.IObject implements KeyDefine
{
    private int    id;
    private String name;
    private String avatar;
    private int    level;
    
    private int    time;

    private String vipType;
    private int    vipExpire;
    
    private int donateTotal;
    
    private transient Integer offlineDays;

    public GuildMemberInfo (int id, String name, String avatar, int level, String vip, int vipExpire)
    {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.level = level;
        
        this.time = Time.getUnixTime();
        this.vipType = vip;
        this.vipExpire = vipExpire;

        this.donateTotal = 0;
    }
    
    public void update (int curTime)
    {
        if (vipExpire > 0 && curTime >= vipExpire)
            resetVip();
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

    public int getLevel ()
    {
        return level;
    }

    public int getTime ()
    {
        return time;
    }

    public String getVip ()
    {
        return vipType;
    }

    private void resetVip ()
    {
        vipType = MiscDefine.VIP_INACTIVE;
        vipExpire = 0;
    }

    
    public int getDonateCount ()
    {
    	return donateTotal;
    }

    public int addDonateCount (int value)
    {
    	this.donateTotal += value;
    	return this.donateTotal;
    }
    
    @Override
    public void putData (Encoder msg)
    {
        msg.put(FRIEND_ID, id);
        msg.put(FRIEND_NAME, name);
        msg.put(FRIEND_AVATAR, avatar);
        msg.put(FRIEND_LEVEL, level);
        msg.put(FRIEND_VIP, vipType);
        msg.put(FRIEND_GUILD_DONATE, donateTotal);
    }

    public boolean mergeFrom (GuildMemberInfo newInfo)
    {
        if (newInfo == null || id != newInfo.id)
            return false;
        
        if (this.time > newInfo.time)
            return false;
        
        name = newInfo.name;
        avatar = newInfo.avatar;
        level = newInfo.level;
        time = newInfo.time;
        donateTotal = Math.max(donateTotal, newInfo.donateTotal);

        if (newInfo.vipType == null || newInfo.vipType.isEmpty())
        {
            resetVip();
        }
        else
        {
            vipType = newInfo.vipType;
            vipExpire = newInfo.vipExpire;
        }
        
        return true;
    }

	public int getOfflineDay()
	{
		if (offlineDays == null)
		{
			int offlineSeconds = this.getOfflineSeconds();
			int days = offlineSeconds / Time.SECOND_IN_7_DAY;
			
			offlineDays = days < 0 ? 0 : days;	
		}
		
		return offlineDays.intValue();
	}

	public int getOfflineSeconds()
	{
		return Time.getUnixTime() - this.time;
	}
}
