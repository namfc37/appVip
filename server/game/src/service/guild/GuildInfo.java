package service.guild;

import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.send.chat.ResponseChatGuild;
import data.CmdDefine;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import model.UserBrief;
import model.UserOnline;
import model.key.InfoKeyGuild;
import model.mail.MailBox;
import model.mail.MailBox.Mail;
import model.object.UserGuild;
import service.UdpHandler;
import util.Database;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.memcached.CasValue;
import util.serialize.Encoder;

public class GuildInfo extends Encoder.IObject implements KeyDefine
{
	private static String LEVEL = "LEVEL";
	private static String NAME = "NAME";
	private static String AVATAR = "AVATAR";
	private static String DESCRIPTION = "DESCRIPTION";
	private static String STATUS = "STATUS";
	
	private static String TIME_CREATE = "TIME_CREATE";
	private static String TIME_EXPIRE = "TIME_EXPIRE";
	private static String TIME_LAST_ACTIVE = "TIME_LAST_ACTIVE";
	private static String TIME_UPDATE = "TIME_UPDATE";
	private static String TIME_UPDATE_GUEST = "TIME_UPDATE_GUEST";
	
	private static String MEMBER_LEVEL_MIN = "MEMBER_LEVEL_MIN";
	private static String MEMBER_LEVEL_MAX = "MEMBER_LEVEL_MAX";
	private static String MEMBER_APPRAISAL = "MEMBER_APPRAISAL";
	
	private static String TYPE = "TYPE";
	private static String PRESIDENT_ID = "PRESIDENT_ID";
	private static String DEPUTY_IDS = "DEPUTY_IDS";
	
	private int ID;
	private Fields FIELDS;
	
//	all guild's members, include president and deputy 
	private transient Map<Integer, GuildMemberInfo> MEMBERS;
	private transient Integer MEMBER_NUMBER;
	
//	they are waiting to joins
	private transient Map<Integer, GuildMemberInfo> WAITING;
	private transient Integer WAITING_NUMBER;
	
//	list of userIds and donate keys
	private transient Map<Integer, GuildDonate> DONATES;
	
//	who were invited by president or deputies
	private transient Map<Integer, Integer> GUESTS;

	private GuildInfo () {}

	public static GuildInfo load (int guildId, String ... fields)
	{
		String key = InfoKeyGuild.INFO.keyName(guildId);
		if (Database.ranking().exists(key) != true)
			return null;
				
		GuildInfo info = new GuildInfo ();
		info.ID = guildId;
		info.FIELDS = Fields.create (key, false, fields);
		info.MEMBER_NUMBER = info.getMemberNumber();

		return info;
	}
	
	public static GuildInfo create (int guildId, String guildName, String guildAvatar, String guildDesc, int guildType, int persidentId, GuildMemberInfo persidentInfo)
	{
		GuildInfo info = new GuildInfo ();
		info.ID = guildId;
		
		String key = InfoKeyGuild.INFO.keyName(guildId);
		info.FIELDS = Fields.create (key, false);
		info.FIELDS.put(NAME, guildName);
		info.FIELDS.put(AVATAR, guildAvatar);
		info.FIELDS.put(DESCRIPTION, guildDesc);
		info.FIELDS.put(LEVEL, 1);
        info.FIELDS.put(TYPE, guildType);
		info.FIELDS.put(PRESIDENT_ID, persidentId);
        info.FIELDS.put(DEPUTY_IDS, "");
		info.FIELDS.put(TIME_CREATE, Time.getUnixTime());
        info.FIELDS.put(TIME_LAST_ACTIVE, Time.getUnixTime());
        info.FIELDS.put(TIME_UPDATE, Time.getUnixTime());
        info.FIELDS.put(TIME_UPDATE_GUEST, Time.getUnixTime());
        info.FIELDS.put(MEMBER_LEVEL_MIN, -1);
        info.FIELDS.put(MEMBER_LEVEL_MAX, -1);
        info.FIELDS.put(MEMBER_APPRAISAL, MiscInfo.GUILD_CREATE_REQUIRE_APPRAISAL());
        
		info.MEMBERS = new HashMap<Integer, GuildMemberInfo> ();
		info.MEMBERS.put(persidentId, persidentInfo);
		info.MEMBER_NUMBER = 1;
		
		info.changeStatus (MiscDefine.GUILD_STATUS_WARNING);
		return info;
	}

	public static byte createCheck(String guildName, String guildAvatar, String guildDesc, int guildType)
	{
		if (guildName == null || guildAvatar == null || guildDesc == null)
			return ErrorConst.NULL_OBJECT;
		
		if (guildName.isEmpty() || guildName.length() > MiscInfo.GUILD_NAME_LENGHT() || guildDesc.isEmpty() || guildDesc.length() > MiscInfo.GUILD_DASHBOARD_LENGHT())
			return ErrorConst.INVALID_LENGTH;

		if (guildType != MiscDefine.GUILD_TYPE_CLOSE && guildType != MiscDefine.GUILD_TYPE_OPEN && guildType != MiscDefine.GUILD_TYPE_REQUEST)
			return ErrorConst.INVALID_TYPE;
		
		return ErrorConst.SUCCESS;
	}

	public int getId() { return ID; }
	
	public Integer getLevel () { return FIELDS.getInt(LEVEL); }
	
	public Integer getType() { return FIELDS.getInt(TYPE); }
	
	private void setType(int type) { FIELDS.put(TYPE, type); }

	public Integer getStatus() { return FIELDS.getInt(STATUS); }
	
	private void setStatus(int status) { FIELDS.put(STATUS, status); }

	public Integer getTime() { return FIELDS.getInt(TIME_LAST_ACTIVE); }

	public void setTime(int value) { FIELDS.put(TIME_LAST_ACTIVE, value); }

	public Integer getTimeUpdate() { return FIELDS.getInt(TIME_UPDATE); }

	public void setTimeUpdate(int value) { FIELDS.put(TIME_UPDATE, value); }

	private Integer getTimeUpdateGuest()
	{
		Integer v = FIELDS.getInt(TIME_UPDATE_GUEST);
		return v == null ? 0 : v.intValue();
	}

	private void setTimeUpdateGuest(int value) { FIELDS.put(TIME_UPDATE_GUEST, value); }
	
	public String getAvatar() { return FIELDS.get(AVATAR); }

	private void setAvatar(String avatar) { FIELDS.put(AVATAR, avatar); }

	public static String getDESCRIPTION ()
	{
		return DESCRIPTION;
	}

	public String getName () { return FIELDS.get(NAME); }

	public String getShortDesc() { return FIELDS.get(DESCRIPTION); }

	private void setDesc(String desc) { FIELDS.put(DESCRIPTION, desc); }
	
	public Integer getTimeExpire() { return FIELDS.getInt(TIME_EXPIRE); }
	
	private void setTimeExpire (int time) { FIELDS.put(TIME_EXPIRE, time); }

	public Integer getTimeCreate() { return FIELDS.getInt(TIME_CREATE); }

	private void setTimeCreate (int time) { FIELDS.put(TIME_CREATE, time); }
	
	public Integer getPresidentId() { return FIELDS.getInt(PRESIDENT_ID); }
	
	private void setPresident (int memberId) { FIELDS.put(PRESIDENT_ID, memberId); }
	
	public List<Integer> getDeputyIds() { return FIELDS.getListInt(DEPUTY_IDS); }
	
	public void setMemberLevelMin (int value) { FIELDS.put(MEMBER_LEVEL_MIN, value); }
	
	public Integer getMemberLevelMin()
	{ 
		Integer x = FIELDS.getInt(MEMBER_LEVEL_MIN); 
		return x == null ? -1 : x.intValue();
	}

	public String getMemberDisplayName(int memberId)
	{
		GuildMemberInfo member = this.getMember(memberId);
		if (member == null)
			return null;
		
		String name = member.getName();
		if (name == null || name.isEmpty())
			name = String.valueOf(memberId);
		
		return name;
	}
	
	public void setMemberLevelMax (int value) { FIELDS.put(MEMBER_LEVEL_MAX, value); }
	
	public int getMemberLevelAvg ()
	{
		if (MEMBERS == null || MEMBERS.size() != MEMBER_NUMBER)
			this.loadMembers();
		
		int lv = 0;
		for (GuildMemberInfo mem : MEMBERS.values())
		{
			lv += mem.getLevel();
		}
		
		lv = lv / MEMBERS.size ();
		return lv;
	}

	public int getLevelMax ()	// trả về lv member cao nhất
	{
		if (MEMBERS == null || MEMBERS.size() != MEMBER_NUMBER)
			this.loadMembers();

		int maxLv = 0;
		for (GuildMemberInfo mem : MEMBERS.values())
		{
			if (mem.getLevel() > maxLv)
				maxLv = mem.getLevel();
		}

		return maxLv;
	}
	
	public Integer getMemberLevelMax()
	{ 
		Integer x = FIELDS.getInt(MEMBER_LEVEL_MAX); 
		return x == null ? -1 : x.intValue();
	}
	
	private void setMemberAppraisal (int value) { FIELDS.put(MEMBER_APPRAISAL, value); }
	
	public Integer getMemberAppraisal()
	{ 
		Integer x = FIELDS.getInt(MEMBER_APPRAISAL); 
		return x == null ? 0 : x.intValue();
	}
	
	public int getMemberNumber()
	{
		if (MEMBER_NUMBER == null)
		{
			Long size = Database.ranking().hlen(InfoKeyGuild.MEMBER.keyName(this.ID));
			MEMBER_NUMBER = size == null ? 1 : size.intValue();
		}
		
		return MEMBER_NUMBER;
	}

	public int getRemainMembers()
	{
		Integer lv = this.getLevel();
		if (lv == null)
			return 0;
		
		return ConstInfo.getGuildData().getMemberLimit (lv) - getMemberNumber();
	}
	
	public int getRemainDeputy()
	{
		Integer lv = this.getLevel();
		if (lv == null)
			return 0;
		
		int size = ConstInfo.getGuildData().getDeputyLimit (lv);
		List<Integer> deputies = this.getDeputyIds();
		if (deputies == null)
			return size;
		
		return size - deputies.size ();
	}
	
	public int member_role (int userId)
	{
		if (this.isPresident(userId))
			return MiscDefine.GUILD_ROLE_PRESIDENT;
		
		if (this.isDeputy(userId))
			return MiscDefine.GUILD_ROLE_DEPUTY;
		
		if (this.isMember (userId))
			return MiscDefine.GUILD_ROLE_MEMBER;
		
		if (this.isGuest (userId))
			return MiscDefine.GUILD_ROLE_GUEST;
		
		return MiscDefine.GUILD_ROLE_STRANGER;
	}

	private void changeStatus (int status)
	{
		switch (status)
		{
			case MiscDefine.GUILD_STATUS_ACTIVE:
				this.setStatus(MiscDefine.GUILD_STATUS_ACTIVE);
				this.setTimeExpire(Time.getUnixTime() + MiscInfo.GUILD_OFFLINE_TIME());
			break;
			
			case MiscDefine.GUILD_STATUS_WARNING:
				this.setStatus(MiscDefine.GUILD_STATUS_WARNING);
				this.setTimeExpire(Time.getUnixTime() + MiscInfo.GUILD_WARNING_TIME());
			break;
	
			case MiscDefine.GUILD_STATUS_DISBAND:
				this.setStatus(MiscDefine.GUILD_STATUS_DISBAND);
				this.setTimeExpire(Time.getUnixTime() + MiscInfo.GUILD_DISBAND_DELAY());
			break;
		}
	}
	
	public boolean isActive()
	{
		Integer status = this.getStatus();
		return status != null && status == MiscDefine.GUILD_STATUS_ACTIVE;
	}

	public boolean isWarning()
	{
		Integer status = this.getStatus();
		return status != null && status == MiscDefine.GUILD_STATUS_WARNING;
	}

	public boolean isDisband()
	{
		Integer status = this.getStatus();
		return status != null && status == MiscDefine.GUILD_STATUS_DISBAND;
	}
	
	public boolean isPresident (int userId)
	{
		Integer id = this.getPresidentId();
		return id != null && id == userId;
	}

	public boolean isDeputy (int userId)
	{
		List<Integer> deputies = this.getDeputyIds();
		if (deputies == null)
		{
			this.FIELDS.load (DEPUTY_IDS);
			deputies = this.FIELDS.getListInt(DEPUTY_IDS);
			if (deputies == null)
				return false;
		}
		
		return deputies.contains(userId);
	}
	
	public boolean isMember (int userId)
	{
		if (this.MEMBERS != null)
			return this.MEMBERS.containsKey(userId);
		
		return Database.ranking().hexists(InfoKeyGuild.MEMBER.keyName(this.ID), "" + userId) == true;
	}
	
	public boolean isGuest (int userId)
	{
		if (this.GUESTS != null)
			return this.GUESTS.containsKey(userId);
		
		return Database.ranking().hexists(InfoKeyGuild.GUESTS.keyName(this.ID), "" + userId) == true;
	}
	
	public boolean isWaiting (int userId)
	{
		Boolean result = Database.ranking().hexists(InfoKeyGuild.WAITING.keyName(this.ID), "" + userId);
		return result == null ? false : result.booleanValue();
	}

	private void addDeputy (int userId)
	{
		List<Integer> deputies = this.getDeputyIds();
		if (deputies == null)
		{
			this.FIELDS.load (DEPUTY_IDS);
			deputies = this.FIELDS.getListInt(DEPUTY_IDS);
			if (deputies == null)
				deputies = new ArrayList<Integer>();
		}
		
		deputies.add (userId);
		this.FIELDS.put (DEPUTY_IDS, deputies);
	}
	
	private void removeDeputy (Integer userId)
	{
		List<Integer> deputies = this.getDeputyIds();
		if (deputies == null)
			return;
		
		deputies.remove (userId);
		this.FIELDS.put (DEPUTY_IDS, deputies);
	}
	
	private void addMember (int userId, GuildMemberInfo userInfo)
	{
		if (MEMBERS == null)
			MEMBERS = new HashMap<Integer, GuildMemberInfo> ();
		
		MEMBERS.put(userId, userInfo);
		MEMBER_NUMBER += 1;
		Database.ranking().hset(InfoKeyGuild.MEMBER.keyName(this.ID), "" + userId, Json.toJson(userInfo));
	}
	
	private void removeMember (int userId)
	{
		if (MEMBERS != null)
			MEMBERS.remove (userId);

		this.MEMBER_NUMBER -= 1;
		Database.ranking().hdel(InfoKeyGuild.MEMBER.keyName(this.ID), "" + userId);
	}

	public List<GuildMemberInfo> getMembers ()
	{
		if (this.MEMBERS == null)
			this.loadMembers();
		
		if (this.MEMBERS == null)
			return null;
		
		return this.MEMBERS.values().stream().collect(Collectors.toCollection(ArrayList::new));
	}
	
	public GuildMemberInfo getMember (int memberId)
	{
		GuildMemberInfo info = null;
		if (this.MEMBERS != null && this.MEMBERS.containsKey(memberId))
		{
			info = this.MEMBERS.get(memberId);
			return info;
		}

		String j = Database.ranking().hget(InfoKeyGuild.MEMBER.keyName(this.ID), "" + memberId);
		if (j != null && !j.isEmpty())
			try { info = Json.fromJson(j, GuildMemberInfo.class); }
			catch (Exception e) {}
		
//		if (this.MEMBERS != null && info != null)
//			this.MEMBERS.put(memberId, info);
		
		return info;
	}
	
	public void saveMember (GuildMemberInfo info)
	{
		if (info == null)
			return;
		
		if (!this.isMember(info.getId()))
			return;
		
		if (MEMBERS != null)
			MEMBERS.put(info.getId(), info);
		
		Database.ranking().hset(InfoKeyGuild.MEMBER.keyName(this.ID), "" + info.getId(), Json.toJson(info));
	}
	
	private void addWaiting (int userId, GuildMemberInfo userInfo)
	{
		if (WAITING == null)
			WAITING = new HashMap<Integer, GuildMemberInfo> ();

		WAITING.put(userId, userInfo);
		Database.ranking().hset(InfoKeyGuild.WAITING.keyName(this.ID), "" + userId, Json.toJson(userInfo));	
	}
	
	private void removeWaiting (int userId)
	{
		if (WAITING != null)
			WAITING.remove (userId);
		
		Database.ranking().hdel(InfoKeyGuild.WAITING.keyName(this.ID), "" + userId);
	}
	
	public GuildMemberInfo getWaiting (int userId)
	{
		GuildMemberInfo info = null;
		
		String j = Database.ranking().hget(InfoKeyGuild.WAITING.keyName(this.ID), "" + userId);
		if (j != null && !j.isEmpty())
			try { info = Json.fromJson(j, GuildMemberInfo.class); }
			catch (Exception e) {}
		
		return info;
	}
	
	public Integer getGuest (int userId)
	{
		int time = 0;
		if (this.GUESTS != null && this.GUESTS.containsKey(userId))
		{
			time = this.GUESTS.get(userId);
			return time;
		}

		String j = Database.ranking().hget(InfoKeyGuild.GUESTS.keyName(this.ID), "" + userId);
		if (j != null && !j.isEmpty())
			try { time = Integer.valueOf(j); }
			catch (Exception e) {}
		
//		if (this.GUESTS != null && time > 0)
//			this.GUESTS.put(userId, time);
		
		return time;
	}
	
	private void addGuest (int userId)
	{
		if (GUESTS == null)
			GUESTS = new HashMap<Integer, Integer> ();

		int time = Time.getUnixTime();
		GUESTS.put(userId, time);
		Database.ranking().hset(InfoKeyGuild.GUESTS.keyName(this.ID), "" + userId, "" + time);	
	}
	
	private void removeGuest (int userId)
	{
		if (GUESTS != null)
			GUESTS.remove (userId);
		
		Database.ranking().hdel(InfoKeyGuild.GUESTS.keyName(this.ID), "" + userId);
	}
	
	private void addDonate (GuildDonate info)
	{
		if (DONATES != null)
		{
			DONATES.put (info.getOwner(), info);
			return;
		}

		Database.ranking().hset(InfoKeyGuild.DONATES.keyName(this.ID), "" + info.getOwner(), Json.toJson(info));
	}
	
	public GuildDonate getDonate (int userId)
	{
		if (DONATES != null && DONATES.containsKey(userId))
			return DONATES.get (userId);

		String j = Database.ranking().hget(InfoKeyGuild.DONATES.keyName(this.ID), "" + userId);
		if (j == null || j.isEmpty())
			return null;
		
		GuildDonate info = Json.fromJson(j, GuildDonate.class);
		if (DONATES == null)
			DONATES = new HashMap <>();
		
		DONATES.put(userId, info);
		return info;
	}
	
	public boolean saveDonate(int userId)
	{
		if (DONATES == null || DONATES.size() == 0)
			return false;
		
		GuildDonate donate = DONATES.get(userId);
		if (donate == null)
			return false;
		
		String j = Json.toJson(donate);
		Database.ranking().hset(InfoKeyGuild.DONATES.keyName(this.ID), "" + userId, j);
		
		return true;
	}
	
	public void removeDonate (int userId)
	{
		if (DONATES != null)
			DONATES.remove (userId);
		
		Database.ranking().hdel(InfoKeyGuild.DONATES.keyName(this.ID), "" + userId);
	}
	
    @Override
    public void putData (Encoder msg)
    {
    	msg.put(GUILD_ID, this.ID);
    	msg.put(GUILD_LEVEL, this.getLevel());
    	msg.put(GUILD_NAME, this.getName());
    	msg.put(GUILD_AVATAR, this.getAvatar());
    	msg.put(GUILD_DESC, this.getShortDesc());
    	msg.put(GUILD_TYPE, this.getType());
    	msg.put(GUILD_STATUS, this.getStatus());
    	msg.put(GUILD_EXPIRE, this.getTimeExpire());
    	msg.put(GUILD_PRESIDENT, this.getPresidentId());
    	msg.putInts(GUILD_DEPUTY, this.getDeputyIds());
    	msg.put(GUILD_REQUIRE_MEMBER_LV_MIN, this.getMemberLevelMin());
    	msg.put(GUILD_REQUIRE_MEMBER_LV_MAX, this.getMemberLevelMax());
    	msg.put(GUILD_REQUIRE_MEMBER_APPRAISAL, this.getMemberAppraisal());
		msg.put(GUILD_TIME_CREATE, this.getTimeCreate());

    	if (this.MEMBERS != null)
    		msg.put(GUILD_MEMBER, this.MEMBERS.values());
    	else
    		msg.put(GUILD_MEMBER_NUMBER, this.MEMBER_NUMBER);
    	
    	if (this.WAITING != null)
    		msg.put(GUILD_WAITING, this.WAITING.values());
    	
    	if (this.DONATES != null)
    		msg.put(GUILD_DONATES, this.DONATES.values());
    }
	
	public void save()
	{
		FIELDS.save();
		saveMembers ();
		saveWaiting ();
		saveDonates ();
		saveGuests ();
	}
	
	public void load (String ... fields)
	{
		this.FIELDS.load(fields);
	}
	
	private boolean saveMembers ()
	{
		if (MEMBERS == null || MEMBERS.size() == 0)
			return false;
		
		Map<String, String> data = new HashMap<String, String>();
		for (int memId : MEMBERS.keySet())
		{
			String j = Json.toJson(MEMBERS.get(memId));
			data.put("" + memId, j);
		}

		Database.ranking().hmset(InfoKeyGuild.MEMBER.keyName(this.ID), data);
		return true;
	}
	
	public boolean loadMembers ()
	{
		Map<String, String> data = Database.ranking().hgetAll(InfoKeyGuild.MEMBER.keyName(this.ID));
		if (data == null || data.isEmpty())
			return false;
		
		Map<Integer, GuildMemberInfo> temp = new HashMap<Integer, GuildMemberInfo> ();
		for (String memId : data.keySet())
		{
			try
			{
				String j = data.get(memId);
				GuildMemberInfo info = Json.fromJson(j, GuildMemberInfo.class);
				temp.put(Integer.valueOf(memId), info);
			}
			catch (Exception e)
			{
				continue;
			}
		}

		if (temp.size() > 0)
			MEMBERS = temp;

		MEMBER_NUMBER = MEMBERS.size();
		return true;
	}

    private boolean saveWaiting ()
    {
        if (WAITING == null || WAITING.size() == 0)
            return false;

        Map<String, String> data = new HashMap<>(WAITING.size());
        for (GuildMemberInfo info : WAITING.values())
            data.put(Integer.toString(info.getId()), Json.toJson(info));

        Database.ranking().hmset(InfoKeyGuild.WAITING.keyName(this.ID), data);
        return true;
    }

    public boolean loadWaiting ()
    {
        String key = InfoKeyGuild.WAITING.keyName(this.ID);
        Map<String, String> data = Database.ranking().hgetAll(key);
        if (data == null || data.isEmpty())
            return false;

        int curTime = Time.getUnixTime();
        List<GuildMemberInfo> allInfo = new ArrayList<>();
        List<String> listRemove = new ArrayList<>();
        for (Map.Entry<String, String> entry : data.entrySet())
        {
            String value = entry.getValue();
            try
            {
                GuildMemberInfo info = Json.fromJson(value, GuildMemberInfo.class);
                if (info.getTime() + MiscInfo.GUILD_WAITING_TIME_EXPIRE() < curTime)
                {
                    listRemove.add(entry.getKey());
                    continue;
                }
                allInfo.add(info);
            }
            catch (Exception e)
            {
                continue;
            }
        }

        if (allInfo.size() > MiscInfo.GUILD_WAITING_LIMIT_SIZE())
            Collections.sort(allInfo, Comparator.comparingInt(GuildMemberInfo::getTime).reversed());

        Map<Integer, GuildMemberInfo> mapInfo = new HashMap<>();
        for (GuildMemberInfo info : allInfo)
        {
            if (mapInfo.size() < MiscInfo.GUILD_WAITING_LIMIT_SIZE())
                mapInfo.put(info.getId(), info);
            else
                listRemove.add(Integer.toString(info.getId()));
        }

        if (listRemove.size() > 0)
            Database.ranking().hdel(key, listRemove.toArray(new String[listRemove.size()]));

        WAITING = mapInfo;
        return true;
    }
	
	private boolean saveDonates ()
	{
		if (DONATES == null || DONATES.size() == 0)
			return false;
		
		Map<String, String> data = new HashMap<String, String>();
		for (int memId : DONATES.keySet())
		{
			String j = Json.toJson(DONATES.get(memId));
			data.put("" + memId, j);
		}

		Database.ranking().hmset(InfoKeyGuild.DONATES.keyName(this.ID), data);
		return true;
	}
	
	public boolean loadDonates ()
	{
		Map<String, String> data = Database.ranking().hgetAll(InfoKeyGuild.DONATES.keyName(this.ID));
		if (data == null || data.isEmpty())
			return false;
		
		Map<Integer, GuildDonate> temp = new HashMap<Integer, GuildDonate> ();
		for (String memId : data.keySet())
		{
			try
			{
				String j = data.get(memId);
				GuildDonate info = Json.fromJson(j, GuildDonate.class);
				temp.put(Integer.valueOf(memId), info);
			}
			catch (Exception e)
			{
				continue;
			}
		}

		if (temp.size() > 0)
			DONATES = temp; 
		
		return true;
	}

    private boolean saveGuests ()
    {
        if (GUESTS == null || GUESTS.size() == 0)
            return false;

        Map<String, String> data = new HashMap<>(GUESTS.size());
        for (Map.Entry<Integer, Integer> entry : GUESTS.entrySet())
            data.put(entry.getKey().toString(), entry.getValue().toString());

        Database.ranking().hmset(InfoKeyGuild.GUESTS.keyName(this.ID), data);
        return true;
    }
	
	public boolean updateGuests ()
	{
		int currentTime = Time.getUnixTime();
        if (getTimeUpdateGuest() > currentTime)
        	return false;
        
        setTimeUpdateGuest (currentTime + Time.SECOND_IN_DAY);
		
		String key = InfoKeyGuild.GUESTS.keyName(this.ID);
		Map<String, String> data = Database.ranking().hgetAll(key);
		if (data == null || data.isEmpty())
			return false;
		
		Map<Integer, Integer> temp = new HashMap<Integer, Integer> ();
		List<String> removeIds = new ArrayList<String> ();
		for (Entry<String, String> entry : data.entrySet())
		{
			try
			{
				int userId = Integer.valueOf(entry.getKey());
				int time = Integer.valueOf(entry.getValue());
				
				if (time + MiscInfo.MAIL_EXPIRE_DAY() * Time.SECOND_IN_DAY > currentTime)
				{
					removeIds.add(entry.getKey());
					continue;
				}
				
				temp.put(userId, time);
			}
			catch (Exception e)
			{
				continue;
			}
		}
		
        if (removeIds.size() > 0)
            Database.ranking().hdel(key, removeIds.toArray(new String[removeIds.size()]));

		if (temp.size() > 0)
			GUESTS = temp;
		
		return true;
	}

	private boolean saveDonate ()
	{
		if (DONATES == null || DONATES.size() == 0)
			return false;
		
		Map<String, String> data = new HashMap<String, String>();
		for (int memId : DONATES.keySet())
		{
			String j = Json.toJson(DONATES.get(memId));
			data.put("" + memId, j);
		}

		Database.ranking().hmset(InfoKeyGuild.DONATES.keyName(this.ID), data);
		return true;
	}
	
	private boolean loadDonate ()
	{
		Map<String, String> data = Database.ranking().hgetAll(InfoKeyGuild.DONATES.keyName(this.ID));
		if (data == null || data.isEmpty())
			return false;
		
		Map<Integer, GuildDonate> temp = new HashMap<Integer, GuildDonate> ();
		for (String memId : data.keySet())
		{
			try
			{
				String j = data.get(memId);
				GuildDonate info = Json.fromJson(j, GuildDonate.class);
				temp.put(Integer.valueOf(memId), info);
			}
			catch (Exception e)
			{
				continue;
			}
		}

		if (temp.size() > 0)
			DONATES = temp;

		return true;
	}
	
	public void update()
	{
		Integer status = this.getStatus();
		if (status != null) switch (status)
		{
			case MiscDefine.GUILD_STATUS_ACTIVE:
				if (this.getMemberNumber() == 0)
					this.changeStatus(MiscDefine.GUILD_STATUS_DISBAND);
				else if (this.getMemberNumber() < MiscInfo.GUILD_WARNING_MEMBER())
					this.changeStatus(MiscDefine.GUILD_STATUS_WARNING);
				else
					this.setTimeExpire(Time.getUnixTime() + MiscInfo.GUILD_OFFLINE_TIME());
			break;
	
			case MiscDefine.GUILD_STATUS_WARNING:
				if (this.getMemberNumber() >= MiscInfo.GUILD_WARNING_MEMBER())
					this.changeStatus(MiscDefine.GUILD_STATUS_ACTIVE);
				else if (canDisband())
					this.changeStatus(MiscDefine.GUILD_STATUS_DISBAND);
			break;
	
			case MiscDefine.GUILD_STATUS_DISBAND:
			break;
		}
	}
	
	public boolean lockToUpdate()
	{
		Integer time = this.getTimeUpdate();
		if (time != null && time.intValue() > Time.getUnixTime())
			return false;
		
		Long result = Database.ranking().setnx(InfoKeyGuild.INFO_LOCK.keyName(this.ID), "lock");
		return result != null && result.intValue() == 1;
	}
	
	public void unlockUpdate()
	{
		Database.ranking().del(InfoKeyGuild.INFO_LOCK.keyName(this.ID));
	}
	
	public boolean isLock()
	{
		String result = Database.ranking().get(InfoKeyGuild.INFO_LOCK.keyName(this.ID));
		return result == null ? false : result.equalsIgnoreCase("lock");
	}
	
	public Set<Integer> member_removeOffline ()
	{
		if (this.MEMBERS == null)
			return null;
		
		Set<Integer> memberIds = this.MEMBERS.keySet();
		Set<Integer> removeIds = new HashSet<Integer> ();
		for (int memberId : memberIds)
		{
			GuildMemberInfo info = this.MEMBERS.get(memberId);
			if (info == null)
			{
				removeIds.add(memberId);
				continue;
			}
			
			int offline = info.getOfflineSeconds ();
			int role = this.member_role(memberId);
			switch (role)
			{
				case MiscDefine.GUILD_ROLE_PRESIDENT:
				{
					if (offline >= MiscInfo.GUILD_PRESIDENT_OFF_DAY())
						removeIds.add(memberId);
				}
				break;

				default:
				{
					if (offline >= MiscInfo.GUILD_MEMBER_OFF_DAY())
						removeIds.add(memberId);
				}
				break;
			}
		}
		
		return removeIds;
	}
	
	public boolean canDisband ()
	{
		if (this.isDisband())
			return true;
		
		if (this.isWarning())
		{
			int curTime = Time.getUnixTime();
			Integer expire = this.getTimeExpire();
			
			return curTime > expire;
		}
		
		return false;
	}
	
	public byte destroy (byte disbandType, int timePenalty)
	{
		if (!this.isDisband())
        	return ErrorConst.INVALID_STATUS;
		
		this.loadMembers();
		if (this.MEMBERS != null && this.MEMBERS.size() > 0)
		{
			ArrayList<Integer> memberIds = this.MEMBERS.keySet().stream().collect(Collectors.toCollection(ArrayList::new));
			for (int memberId : memberIds)
				this.member_kickAuto(memberId, disbandType, timePenalty);
		}
		
		Long result = Database.ranking().del(
			InfoKeyGuild.MEMBER.keyName(this.ID),
			InfoKeyGuild.INFO.keyName(this.ID),
			InfoKeyGuild.INFO_LOCK.keyName(this.ID),
			InfoKeyGuild.MEMBER.keyName(this.ID),
			InfoKeyGuild.WAITING.keyName(this.ID),
			InfoKeyGuild.DONATES.keyName(this.ID),
			InfoKeyGuild.GUESTS.keyName(this.ID)
		);
		
		return ErrorConst.SUCCESS;
	}
	
	public byte disband (int requestMemberId)
	{
		if (!this.isPresident (requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		if (this.getMemberNumber() > 1)
     		return ErrorConst.INVALID_LENGTH;
		
		if (this.isDisband())
        	return ErrorConst.INVALID_STATUS;
		
		this.setType(MiscDefine.GUILD_TYPE_CLOSE);
		this.changeStatus(MiscDefine.GUILD_STATUS_DISBAND);
		return ErrorConst.SUCCESS;
	}

	public byte disbandCancel (int requestMemberId)
	{
		if (!this.isPresident (requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		if (!this.isDisband())
        	return ErrorConst.INVALID_STATUS;
		
		this.changeStatus(this.getMemberNumber() < MiscInfo.GUILD_WARNING_MEMBER() ? MiscDefine.GUILD_STATUS_WARNING : MiscDefine.GUILD_STATUS_ACTIVE);
		return ErrorConst.SUCCESS;
	}
	
	public byte transfer (int requestMemberId, int newPresidentId)
	{
		if (!this.isPresident (requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		if (!this.isMember(newPresidentId))
			return ErrorConst.GUILD_MEMBER;
		
		if (this.isDeputy(newPresidentId))
			this.removeDeputy(newPresidentId);
		
		this.setPresident (newPresidentId);
		this.changeRole (newPresidentId, MiscDefine.GUILD_ROLE_PRESIDENT);
		this.changeRole (requestMemberId, MiscDefine.GUILD_ROLE_MEMBER);
		return ErrorConst.SUCCESS;
	}

	public byte transferAuto ()
	{
		if (this.MEMBERS == null)
			return ErrorConst.NULL_OBJECT;
		
		if (this.MEMBERS.size() == 0)
			return ErrorConst.EMPTY;
		
		GuildMemberInfo theChooseOne = this.MEMBERS.values()
			.stream()
			.sorted((a, b) -> {
				if (a.getOfflineSeconds() < b.getOfflineSeconds()) return 1;
				if (a.getOfflineSeconds() > b.getOfflineSeconds()) return -1;
				if (a.getLevel() > b.getLevel()) return 1;
				if (a.getLevel() < b.getLevel()) return -1;
				return 0;
				
			})
			.findFirst()
			.get();
		
		if (theChooseOne == null)
			return ErrorConst.NULL_ITEM_INFO;
		
		int newPresidentId = theChooseOne.getId();
		
		if (this.isDeputy(newPresidentId))
			this.removeDeputy(newPresidentId);
		
		this.setPresident(newPresidentId);
		this.changeRole (newPresidentId, MiscDefine.GUILD_ROLE_PRESIDENT);
		return ErrorConst.SUCCESS;
	}
	
	public byte changeSetting (int requestMemberId, String desc, String avatar, int type, int levelMin, int levelMax, int appraisal)
	{
		if (this.isDisband())
			return ErrorConst.INVALID_STATUS;
		
		if (!this.isPresident (requestMemberId) && !this.isDeputy(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		boolean isChanged = false;
		
		if (desc != null && !desc.isEmpty())
		{
			if (desc.length() > 200)
				return ErrorConst.INVALID_LENGTH;
			
			this.setDesc (desc);
			isChanged = true;
		}
		
		if (avatar != null && !avatar.isEmpty() && ConstInfo.getGuildData().checkAvatar (avatar))
		{
			this.setAvatar (avatar);
			isChanged = true;
		}
		
		if (type == MiscDefine.GUILD_TYPE_CLOSE || type == MiscDefine.GUILD_TYPE_OPEN || type == MiscDefine.GUILD_TYPE_REQUEST)
		{
			this.setType (type);
			isChanged = true;
		}
		
		if (levelMin > 0)
		{
			this.setMemberLevelMin(levelMin);
			isChanged = true;
		}
		
		if (levelMax > 0)
		{
			this.setMemberLevelMax(levelMax);
			isChanged = true;
		}
		
		if (appraisal > 0)
		{
			this.setMemberAppraisal(appraisal);
			isChanged = true;
		}
		
		return isChanged ? ErrorConst.SUCCESS : ErrorConst.FAIL;		
	}

	public byte sendMail(int requestMemberId, String mailContent)
	{
		if (!this.isPresident(requestMemberId) && !this.isDeputy(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;

		if (!this.isMember(requestMemberId))
			return ErrorConst.GUILD_MEMBER;
		
		if (this.MEMBERS == null)
			return ErrorConst.NULL_OBJECT;
		
		for (Integer memberId : this.MEMBERS.keySet())
			this.sendMailTo (MiscDefine.MAIL_GUILD_NOTIFY, memberId, mailContent);

		return ErrorConst.SUCCESS;
	}
	
	public byte member_checkJoin (int level, int appraisal)
	{
		if (this.getRemainMembers() < 1)
			return ErrorConst.FULL_SLOT;
		
		if (this.getMemberLevelMin() > 0 && this.getMemberLevelMin() > level)// || (this.getMemberLevelMax() > 0 && level > this.getMemberLevelMax ()))
			return ErrorConst.LIMIT_LEVEL;
		
		if (MiscInfo.GUILD_JOIN_CHECK_APPRAISAL() && this.getMemberAppraisal() > appraisal)
			return ErrorConst.NOT_ENOUGH_APPRAISAL;
		
		return ErrorConst.SUCCESS;
	}
	
	public byte member_requestJoin (int newMemberId, GuildMemberInfo info)
	{
		if (this.isMember(newMemberId))
			return ErrorConst.GUILD_MEMBER;

		if (this.getRemainMembers() < 1)
			return ErrorConst.FULL_SLOT;
		
		if (this.isGuest(newMemberId))
		{
			this.removeGuest (newMemberId);
			this.addMember (newMemberId, info);
			return ErrorConst.SUCCESS;
		}
		
		Integer type = this.getType();
		if (type != null) switch (type)
		{
			case MiscDefine.GUILD_TYPE_CLOSE:
				return ErrorConst.INVALID_STATUS;
				
			case MiscDefine.GUILD_TYPE_OPEN:
			{
				this.addMember (newMemberId, info);
				return ErrorConst.SUCCESS;
			}
				
			case MiscDefine.GUILD_TYPE_REQUEST:
			{				
				this.addWaiting (newMemberId, info);
				return ErrorConst.SUCCESS;
			}
		}
		
		return ErrorConst.FAIL;
	}
	
	public byte member_rejectJoin (int requestMemberId, int newMemberId)
	{
		if (!this.isPresident (requestMemberId) && !this.isDeputy(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;

		if (!this.isWaiting (newMemberId))
			return ErrorConst.INVALID_ID;
		
		this.removeWaiting(newMemberId);
		return ErrorConst.SUCCESS;
	}
	
	public byte member_acceptJoin (int requestMemberId, int newMemberId)
	{
		if (!this.isPresident (requestMemberId) && !this.isDeputy(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		if (this.getRemainMembers() < 1)
			return ErrorConst.FULL_SLOT;
		
		GuildMemberInfo info = this.getWaiting(newMemberId);
		if (info == null)
			return ErrorConst.INVALID_ID;
		
		byte result = this.join(newMemberId);
		if (result != ErrorConst.SUCCESS)
			return result;
		
		this.addMember(newMemberId, info);
		this.removeWaiting(newMemberId);
		this.sendMailTo(MiscDefine.MAIL_GUILD_ACCEPT_JOIN, newMemberId, MiscInfo.GUILD_ACCEPT_JOIN_MAIL_CONTENT());
		return ErrorConst.SUCCESS;
	}
	
	public int[] member_sendInvite (int requestMemberId, int userId)
	{
		if (!this.isMember(requestMemberId))
			return new int [] {ErrorConst.GUILD_MEMBER, -1};
		
		if (this.isMember(userId))
			return new int [] {ErrorConst.INVALID_ID, -1};
		
		int mailId = this.getGuest(userId); 
		int[] sendMail = null;
		
		if (mailId > 0)
			sendMail = this.checkAndSendMailTo (MiscDefine.MAIL_GUILD_INVITE, mailId, userId, null, MiscInfo.GUILD_INVITE_MAIL_CONTENT(), null);
		else
			sendMail = this.sendMailTo (MiscDefine.MAIL_GUILD_INVITE, userId, MiscInfo.GUILD_INVITE_MAIL_CONTENT());
		
		if (sendMail[0] == ErrorConst.SUCCESS)
			addGuest (userId);
		
		return sendMail;
	}
	
	public byte member_setPermission (int requestMemberId, int memberId, int type)
	{
		if (!this.isPresident(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;
		
		if (!this.isMember (memberId))
			return ErrorConst.GUILD_MEMBER;
		
		switch (type)
		{
			case MiscDefine.GUILD_ROLE_DEPUTY:
			{
				if (this.getRemainDeputy() < 1)
					return ErrorConst.FULL_SLOT;
					
				if (this.isDeputy(memberId))
					return ErrorConst.INVALID_ID;

				this.addDeputy(memberId);
				this.changeRole (memberId, MiscDefine.GUILD_ROLE_DEPUTY);
				return ErrorConst.SUCCESS;
			}
			
			case MiscDefine.GUILD_ROLE_MEMBER:
			{
				if (!this.isDeputy(memberId))
					return ErrorConst.INVALID_ID;
				
				this.removeDeputy(memberId);
				this.changeRole (memberId, MiscDefine.GUILD_ROLE_MEMBER);
				return ErrorConst.SUCCESS;
			}
		}
		
		return ErrorConst.FAIL;
	}

	public byte member_kick (int requestMemberId, int memberId)
	{
		if (requestMemberId == memberId)
			return ErrorConst.INVALID_ACTION;
		
		if (!this.isPresident(requestMemberId) && !this.isDeputy(requestMemberId))
			return ErrorConst.GUILD_PERMISSION;

		if (!this.isMember(memberId))
			return ErrorConst.INVALID_ID;
		
		if (this.isDeputy(requestMemberId))
			if (this.isPresident(memberId) || this.isDeputy(memberId))
				return ErrorConst.GUILD_PERMISSION;
		
		byte result = this.kick(memberId, MiscInfo.GUILD_KICK_PENALTY());
		if (result != ErrorConst.SUCCESS)
			return result;
		
		if (this.isDeputy(memberId))
			this.removeDeputy(memberId);
		
		this.sendMailTo (MiscDefine.MAIL_GUILD_KICK, memberId, MiscInfo.GUILD_KICK_MAIL_CONTENT());
		this.removeMember(memberId);
		return ErrorConst.SUCCESS;
	}

	public byte member_kickAuto (int memberId, byte disbandType, int timePenalty)
	{
		if (!this.isMember(memberId))
			return ErrorConst.INVALID_ID;
		
		byte result = this.kick(memberId, timePenalty);
		if (result != ErrorConst.SUCCESS)
			return result;
		
		if (this.isPresident(memberId))
			this.setPresident (-1);
		else if (this.isDeputy(memberId))
			this.removeDeputy(memberId);
		
		switch (disbandType)
		{
			case MiscDefine.GUILD_DISBAND_NONE:
				this.sendMailTo (MiscDefine.MAIL_GUILD_KICK, memberId, MiscInfo.GUILD_KICK_MAIL_CONTENT());
			break;
			
			case MiscDefine.GUILD_DISBAND_BY_PRESIDENT:
				this.sendMailTo (MiscDefine.MAIL_GUILD_DISBAND, memberId, MiscInfo.GUILD_DISBAND_MAIL_CONTENT());
			break;

			case MiscDefine.GUILD_DISBAND_BY_NOT_ENOUGHT_MEMBER:
				this.sendMailTo (MiscDefine.MAIL_GUILD_DISBAND, memberId, MiscInfo.GUILD_DISBAND_MAIL_NOT_ENOUGHT_MEMBER());
			break;

			case MiscDefine.GUILD_DISBAND_BY_DONT_ACTIVE:
				this.sendMailTo (MiscDefine.MAIL_GUILD_DISBAND, memberId, MiscInfo.GUILD_DISBAND_MAIL_DONT_ACTIVE());
			break;
		}

		this.removeMember(memberId);
		return ErrorConst.SUCCESS;
	}
	
	public byte member_leave (int memberId)
	{
		if (!this.isMember(memberId))
			return ErrorConst.GUILD_MEMBER;
		
		if (this.isPresident(memberId))
			return ErrorConst.INVALID_ACTION;
		
		if (this.isDeputy(memberId))
			this.removeDeputy(memberId);
		
		this.removeMember(memberId);
		return ErrorConst.SUCCESS;
	}

	public byte member_donateStart (int memberId, String itemId)
	{
		if (!this.isMember(memberId))
			return ErrorConst.GUILD_MEMBER;
		
		GuildDonate info = this.getDonate(memberId);
		if (info != null)
			return ErrorConst.INVALID_ACTION;
				
		info = GuildDonate.create (memberId, itemId);
		if (info == null)
			return ErrorConst.INVALID_ITEM;
		
		this.addDonate (info);
		return ErrorConst.SUCCESS;
	}
	
	public byte member_checkDonate (int memberSender, int memberReciver)
	{
		if (!this.isMember(memberSender))
			return ErrorConst.GUILD_MEMBER;

		if (!this.isMember(memberReciver))
			return ErrorConst.INVALID_ID;
		
		GuildDonate donate = this.getDonate(memberReciver);
		if (donate == null || donate.isExpire())
			return ErrorConst.EXPIRED;
		
		if (donate.getRemain() < 1)
			return ErrorConst.FULL_SLOT;
		
		if (donate.getDonatorRemain(memberSender) < 1)
			return ErrorConst.LIMIT;
		
		return ErrorConst.SUCCESS;
	}
	
	public void member_donate(int memberSender, int memberReciver)
	{
		GuildDonate donate = this.getDonate (memberReciver);
		if (donate == null)
			return;
		
		GuildMemberInfo sender = this.getMember(memberSender);
		if (sender == null)
			return;
		
		donate.addDonator (memberSender);
		this.saveDonate (memberReciver);
		
		sender.addDonateCount(1);
		this.saveMember(sender);
	}
	
	public byte member_donateEnd (int memberId)
	{
		if (!this.isMember(memberId))
			return ErrorConst.GUILD_MEMBER;
		
		GuildDonate info = this.getDonate(memberId);
		if (info == null)
			return ErrorConst.NULL_OBJECT;
		
		if (info.getStart() + MiscInfo.GUILD_DONATE_COOLDOWN() > Time.getUnixTime())
			return ErrorConst.INVALID_ACTION;
		
		return ErrorConst.SUCCESS;
	}
	
	public byte member_donateEndAuto (int memberId, boolean isOffline)
	{
		GuildDonate info = this.getDonate(memberId);
		if (info == null)
			return ErrorConst.NULL_OBJECT;
		
		return ErrorConst.SUCCESS;
	}
	
	public byte member_chat (int memberId, String message)
	{
		if (!this.isMember(memberId))
			return ErrorConst.GUILD_MEMBER;
		
		return ErrorConst.SUCCESS;
	}

	public void chatGuild (int sender, String content, int ... memberIds)
	{
		BaseMessage chat = new ResponseChatGuild(CmdDefine.CHAT_SEND_GUILD, ErrorConst.SUCCESS).packData(sender, MiscDefine.GUILD_CHAT_TYPE_CHAT, content, Time.getTimeMillis());
		this.sendMessage (chat, memberIds);
	}
	
	public void notifyGuild (int sender, String content, int ... memberIds)
	{
		BaseMessage chat = new ResponseChatGuild(CmdDefine.CHAT_SEND_GUILD, ErrorConst.SUCCESS).packData(sender, MiscDefine.GUILD_CHAT_TYPE_NOTIFY, content, Time.getTimeMillis());
		this.sendMessage (chat, memberIds);
	}
	
	public void sendMessage (BaseMessage msg)
	{
		if (msg == null)
			return;
	
		UdpHandler.sendChatGuild (this.getId(), msg, null);
	}

	public void sendMessage (BaseMessage msg, int ... memberIds)
	{
		if (msg == null)
			return;
	
		Set<Integer> blacklist = new HashSet<Integer> ();
		
		for (int i = 0; i < memberIds.length; i++)
			blacklist.add(memberIds [i]);
		
		UdpHandler.sendChatGuild (this.getId(), msg, blacklist);
	}

	public void sendMessage (BaseMessage msg, Set<Integer> blacklist)
	{
		if (msg == null)
			return;
		
		UdpHandler.sendChatGuild (this.getId(), msg, blacklist);
	}

	public int[] checkAndSendMailTo (int mailType, int mailId, int userId, String title, String content, MapItem items)
	{
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return new int[] {ErrorConst.NULL_USER, -1};
			
			CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return new int[] {ErrorConst.GETS_FAIL, -1};
			
			MailBox mailBox = cas.object;
			if (mailBox.containsMail (mailId))
				return new int[] {ErrorConst.DUPLICATE, -1};

			Mail mail = mailBox.addMailGuild(mailType,
			                     this.getId(),
			                     this.getAvatar(),
			                     title == null ? this.getName() : title,
			                     title == null ? this.getShortDesc() : "",
			                     content,
			                     items);
			
			if (!MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
				return new int[] {ErrorConst.CAS_FAIL, -1};
			
			UserOnline online = UserOnline.get(userId);
			if (online != null)
				UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);
			
			if (mail != null)
				mailId = mail.getUid();
        }
        catch (Exception e)
        {
        	return new int[] {ErrorConst.EXCEPTION, -1};
        }
		
		return new int[] {ErrorConst.SUCCESS, mailId};
	}
	
	public int[] sendMailTo (int mailType, int userId, String title, String content, MapItem items)
	{
		int mailId = -1;
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return new int[] {ErrorConst.NULL_USER, -1};
			
			CasValue<MailBox> cas = MailBox.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return new int[] {ErrorConst.GETS_FAIL, -1};
			
			MailBox mailBox = cas.object;
			Mail mail = mailBox.addMailGuild(mailType,
			                     this.getId(),
			                     this.getAvatar(),
			                     title == null ? this.getName() : title,
			                     title == null ? this.getShortDesc() : "",
			                     content,
			                     items);
			
			if (!MailBox.cas(userBrief.getBucketId(), userId, cas.cas, mailBox))
				return new int[] {ErrorConst.CAS_FAIL, -1};
			
			UserOnline online = UserOnline.get(userId);
			if (online != null)
				UdpHandler.notifyMail(online.getPrivateHost(), online.getPortUdp(), userId);
			
			if (mail != null)
				mailId = mail.getUid();
        }
        catch (Exception e)
        {
        	return new int[] {ErrorConst.EXCEPTION, -1};
        }
		
		return new int[] {ErrorConst.SUCCESS, mailId};
	}
	
	public int[] sendMailTo (int mailType, int userId, String content, MapItem items)
	{
		return sendMailTo (mailType, userId, null, content, null);
	}
	
	public int[] sendMailTo (int mailType, int userId, String content)
	{
		return sendMailTo (mailType, userId, content, null);
	}

	private byte kick (int userId, int timePenalty)
	{
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return ErrorConst.NULL_USER;
			
			CasValue<UserGuild> cas = UserGuild.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return ErrorConst.GETS_FAIL;

			UserGuild guild = cas.object;
			if (!guild.kick(this.getId(), timePenalty))
				return ErrorConst.INVALID_ID;
			
			if (!UserGuild.cas(userBrief.getBucketId(), userId, cas.cas, guild))
				return ErrorConst.CAS_FAIL;
        }
        catch (Exception e)
        {
        	return ErrorConst.EXCEPTION;
        }
		
		return ErrorConst.SUCCESS;
	}

	private byte join (int userId)
	{
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return ErrorConst.NULL_USER;
			
			CasValue<UserGuild> cas = UserGuild.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return ErrorConst.GETS_FAIL;

			UserGuild guild = cas.object;
			if (!guild.join(this.getId()))
				return ErrorConst.INVALID_ACTION;
			
			if (!UserGuild.cas(userBrief.getBucketId(), userId, cas.cas, guild))
				return ErrorConst.CAS_FAIL;
        }
        catch (Exception e)
        {
        	return ErrorConst.EXCEPTION;
        }
		
		return ErrorConst.SUCCESS;
	}
	
	private byte changeRole (int userId, int role)
	{
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return ErrorConst.NULL_USER;
			
			CasValue<UserGuild> cas = UserGuild.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return ErrorConst.GETS_FAIL;

			UserGuild guild = cas.object;
			guild.setRole(role);
			
			if (!UserGuild.cas(userBrief.getBucketId(), userId, cas.cas, guild))
				return ErrorConst.CAS_FAIL;
        }
        catch (Exception e)
        {
        	return ErrorConst.EXCEPTION;
        }
		
		return ErrorConst.SUCCESS;
	}

	public byte changeDonate (int userId, boolean isDonate)
	{
		try
        {
			UserBrief userBrief = UserBrief.get(userId);
			if (userBrief == null)
				return ErrorConst.NULL_USER;
			
			CasValue<UserGuild> cas = UserGuild.gets(userBrief.getBucketId(), userId);
			if (cas == null)
				return ErrorConst.GETS_FAIL;

			UserGuild guild = cas.object;
			if (guild != null)
				guild.setDonateActive(isDonate);
			
			if (!UserGuild.cas(userBrief.getBucketId(), userId, cas.cas, guild))
				return ErrorConst.CAS_FAIL;
        }
        catch (Exception e)
        {
        	return ErrorConst.EXCEPTION;
        }
		
		return ErrorConst.SUCCESS;
	}
}