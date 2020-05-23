package service.guild;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import cmd.ErrorConst;
import data.ConstInfo;
import data.KeyDefine;
import data.MiscDefine;
import data.MiscInfo;
import data.guild.GuildDerbyData;
import data.guild.GuildDerbyData.*;
import model.key.InfoKeyGuild;
import model.key.AbstractInfoKey.BUCKET;
import model.object.Achievement.Task;
import service.guild.cache.CacheGuildClient;
import service.guild.cache.GuildDerbyTime;
import util.Database;
import util.Json;
import util.Time;
import util.collection.MapItem;
import util.metric.MetricLog;
import util.serialize.Encoder;

public class GuildDerby extends Encoder.IObject implements KeyDefine
{
	public static final String LEAGUE       = "LEAGUE";
	public static final String GROUP        = "GROUP";
	public static final String LEVEL        = "LEVEL"; // level trung bình các thành viên trong guild
	public static final String TASK_ID      = "TASK_ID";
	public static final String TIME_START   = "TIME_START";
	public static final String TIME_END     = "TIME_END";
	public static final String TIME_REWARD  = "TIME_REWARD";
	public static final String TIME_UPDATE  = "TIME_UPDATE";
	public static final String POINT        = "POINT";
	public static final String MILESTONE    = "MILESTONE";
	public static final String GROUP_ORDER  = "GORDER"; // thứ hạng khi đã kết thúc
	public static final String GROUP_REWARD = "GREWARD"; // quà chung
	public static final String GLOBAL_POINT = "GLPOINT"; // điểm chung cuộc
	public static final String END          = "END"; // đánh dấu derby đã kết thúc
	public static final String LEVEL_MAX    = "LEVEL_MAX"; // level max các thành viên trong guild
	
	private int                        ID;
	private Fields                     FIELDS;
	private MapObject<Integer, Member> MEMBER;
	private MapObject<Integer, Task>   TASKS;
	private MapObject<Integer, Task>   TASKS_DOING;
	private MapObject<Integer, Task>   TASKS_OLD;
	
//	this is temp data, don't use it
	private transient Map<Integer, Task> TASKS_NEW;
	private transient Set<Integer> MEMBER_REMOVE;
	
	private GuildDerby () {}
	
	public static GuildDerby create (GuildInfo info, String leagueId, String groupId, int startTime, int endTime, int rewardTime)
	{
		LeagueInfo league = ConstInfo.getGuildDerbyData().getLeague (leagueId);
		if (league == null)
			return null;
		
		List<GuildMemberInfo> memberTemp = info.getMembers();
		if (memberTemp.size() < 1)//MiscInfo.DERBY_JOIN_MEMBER_REQUIRE())//TODO: cheat here
			return null;
			
		GuildDerby derby = new GuildDerby ();
		derby.ID = info.getId();
		derby.FIELDS = Fields.create (InfoKeyGuild.DERBY.keyName(derby.ID), false);
		derby.FIELDS.put(LEAGUE, league.ID ());
		derby.FIELDS.put(GROUP, groupId);
		derby.FIELDS.put(LEVEL, info.getMemberLevelAvg());
		derby.FIELDS.put(LEVEL_MAX, info.getLevelMax());
		derby.FIELDS.put(TASK_ID, 0);
		derby.FIELDS.put(TIME_START, startTime);
		derby.FIELDS.put(TIME_END, endTime);
		derby.FIELDS.put(TIME_REWARD, rewardTime);
		derby.FIELDS.put(TIME_UPDATE, Time.getUnixTime());
		derby.FIELDS.put(POINT, 0);
//		derby.FIELDS.put(MILESTONE, 0);
//		derby.FIELDS.put(GROUP_ORDER, -1);
//		derby.FIELDS.put(GROUP_REWARD, "");
//		derby.FIELDS.put(END, false);
		
		derby.MEMBER = new MapObject<Integer, Member> (
			InfoKeyGuild.DERBY_MEMBER.keyName(derby.ID),
			(json) -> Json.fromJson(json, Member.class),
			false
		);
		
		derby.TASKS = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);
		
		derby.TASKS_DOING = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK_DOING.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);
		
		derby.TASKS_OLD = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK_OLD.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);

		for (GuildMemberInfo memberInfo : memberTemp)
			derby.MEMBER.put(memberInfo.getId(), Member.create (memberInfo));
		
		derby.addTask(MiscInfo.DERBY_TASK_NUMBER (), 0);
		
		return derby;
	}
	
	public static GuildDerby load (int guildId)
	{
		String key = InfoKeyGuild.DERBY.keyName(guildId);
		if (Database.ranking().exists(key) != true)
			return null;

		GuildDerby derby = new GuildDerby ();
		derby.ID = guildId;
		derby.FIELDS = Fields.create(key, false);
		derby.FIELDS.loadAll();

		if (derby.getTimeStart() == GuildDerbyTime.BUG_200408_TIME_START && derby.getTimeReward() != GuildDerbyTime.BUG_200408_TIME_REWARD)
			derby.FIELDS.put(TIME_REWARD, GuildDerbyTime.BUG_200408_TIME_REWARD);

		derby.MEMBER = new MapObject<Integer, Member> (
			InfoKeyGuild.DERBY_MEMBER.keyName(derby.ID),
			(json) -> Json.fromJson(json, Member.class),
			false
		);
		
		derby.TASKS = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);
		
		derby.TASKS_DOING = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK_DOING.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);
		
		derby.TASKS_OLD = new MapObject<Integer, Task> (
			InfoKeyGuild.DERBY_TASK_OLD.keyName(derby.ID),
			(json) -> Json.fromJson(json, Task.class),
			false
		);
		
		return derby;
	}
	
	public boolean reset(GuildInfo info, String leagueId, String groupId, int startTime, int endTime, int rewardTime)
	{
		LeagueInfo league = ConstInfo.getGuildDerbyData().getLeague (leagueId);
		if (league == null)
			return false;

		if (this.getGuildId() != info.getId())
			return false;
		
		List<GuildMemberInfo> memberTemp = info.getMembers();
		if (memberTemp.size() < MiscInfo.DERBY_JOIN_MEMBER_REQUIRE())
			return false;
		
		if (this.getGroupId().equalsIgnoreCase(groupId))
			return false;

		this.FIELDS.put(LEAGUE, league.ID ());
		this.FIELDS.put(GROUP, groupId);
		this.FIELDS.put(LEVEL, info.getMemberLevelAvg());
		this.FIELDS.put(LEVEL_MAX, info.getLevelMax());
		this.FIELDS.put(TASK_ID, 0);
		this.FIELDS.put(TIME_START, startTime);
		this.FIELDS.put(TIME_END, endTime);
		this.FIELDS.put(TIME_REWARD, rewardTime);
		this.FIELDS.put(POINT, 0);
		
		this.FIELDS.remove(MILESTONE);
		this.FIELDS.remove(GROUP_ORDER);
		this.FIELDS.remove(GROUP_REWARD);
		this.FIELDS.remove(GLOBAL_POINT);
		this.FIELDS.remove(END);
		
		this.MEMBER.clear ();
		this.TASKS.clear ();
		this.TASKS_DOING.clear ();
		this.TASKS_OLD.clear ();
		
		for (GuildMemberInfo memberInfo : memberTemp)
			this.MEMBER.put(memberInfo.getId(), Member.create (memberInfo));
		
		this.addTask(MiscInfo.DERBY_TASK_NUMBER (), 0);
		return true;
	}
	
	public byte lock()
	{
		Long result = Database.ranking().setnx(InfoKeyGuild.DERBY_TASK_LOCK.keyName(this.ID), "lock");
		if (result != null && result.intValue() == 1)
			return ErrorConst.SUCCESS;
		
		return ErrorConst.BUSY;
	}
	
	public void unlock()
	{
		Database.ranking().del(InfoKeyGuild.DERBY_TASK_LOCK.keyName(this.ID));
	}
	
	public void save ()
	{
		this.FIELDS.save();
		this.MEMBER.save();
		this.TASKS.save();
		this.TASKS_DOING.save();
		this.TASKS_OLD.save();
	}
	
	public byte destroy ()
	{	
		Long result = Database.ranking().del(
			InfoKeyGuild.DERBY.keyName(this.ID),
			InfoKeyGuild.DERBY_TASK.keyName(this.ID),
			InfoKeyGuild.DERBY_TASK_LOCK.keyName(this.ID),
			InfoKeyGuild.DERBY_TASK_DOING.keyName(this.ID),
			InfoKeyGuild.DERBY_TASK_OLD.keyName(this.ID)
		);
		
		return ErrorConst.SUCCESS;
	}
	
	public int getGuildId() { return this.ID; }
	
	public String getGroupId() { return FIELDS.get(GROUP); }

	public Integer getLevel () { return FIELDS.getInt(LEVEL); }

	public  Integer getLevelMax ()
	{
		Integer v = FIELDS.getInt(LEVEL_MAX);
		return v == null ? getLevel() : v.intValue();
	}

	public void setLevel (int value) { FIELDS.put(LEVEL, value); }

	public void setLevelMax (int value) { FIELDS.put(LEVEL_MAX, value); }

	private int getTaskId() { return FIELDS.getInt(TASK_ID); }
	
	private void setTaskId(int value) { FIELDS.put(TASK_ID, value); }

	public String getLeague() { return FIELDS.get(LEAGUE); }
	
	private void setLeague (String value) { FIELDS.put(LEAGUE, value);}
	
	public int getTimeStart() { return FIELDS.getInt(TIME_START); }

	public int getTimeEnd() { return FIELDS.getInt(TIME_END); }

	public int getTimeReward()
	{
		Integer v = FIELDS.getInt(TIME_REWARD);
		return v == null ? 0 : v.intValue();
	}

	public Integer getPoint () { return FIELDS.getInt (POINT); }
	
	private void setPoint (int value) { FIELDS.put(POINT, value); }

	public Integer getMilestone ()
	{
		Integer v = FIELDS.getInt(MILESTONE);
		return v == null ? -1 : v.intValue();
	}
	
	public void setMilestone (int value) { FIELDS.put(MILESTONE, value); }

	public Integer getTimeUpdate ()
	{
		Integer v = FIELDS.getInt(TIME_UPDATE);  
		return v == null ? -1 : v.intValue();
	}
	
	public void setTimeUpdate (int value) { FIELDS.put(TIME_UPDATE, value); }

	public Integer getGroupOrder () { return FIELDS.getInt(GROUP_ORDER); }
	
	public void setGroupOrder (int value) { FIELDS.put(GROUP_ORDER, value); }

	public MapItem getGroupReward ()
	{
		String json = FIELDS.get(GROUP_REWARD);
		if (json == null || json.isEmpty())
			return null; 
		
		MapItem temp = null;
		try
		{
			temp = Json.fromJson(json, MapItem.class); 
		}
		catch (Exception e) {}
		
		return temp; 
	}
	
	private void setGroupReward (String value) { FIELDS.put(GROUP_REWARD, value); }
	
	private boolean getEnd ()
	{
		Boolean r = FIELDS.getBoolean(END);
		return r == null ? false : r;
	}
	
	private void setEnd () { FIELDS.put(END, true); }

	public Integer getGlobalPoint() { return FIELDS.getInt(GLOBAL_POINT); }
	
	private void setGlobalPoint (int value) { FIELDS.put(GLOBAL_POINT, value); }
	
	public boolean isActive()
	{
		Integer start = getTimeStart ();
		Integer end = getTimeEnd ();
		if (start == null || end == null)
			return false;
		
		int now = Time.getUnixTime();
		return start < now && now < end;
	}
	
	private boolean isReward()
	{
		Integer end = FIELDS.getInt(TIME_END);
		Integer reward = FIELDS.getInt(TIME_REWARD);
		if (end == null || reward == null)
			return false;
		
		int now = Time.getUnixTime();
		return end < now && now < reward;	
	}
	
	public boolean update (GuildInfo info)
	{
		int lastTime = this.getTimeUpdate();
		if (lastTime > Time.getUnixTime())
			return false;
		
		this.loadMembers();
    	this.loadTasks(false, true, true);
		this.setLevel (info.getMemberLevelAvg());
		this.setLevelMax(info.getLevelMax());
		Set<Integer> temp = new HashSet<Integer> ();
		for (Member member : this.MEMBER.values())
		{
			if (!info.isMember(member.ID))
				temp.add(member.ID);
			else
				member.update (info.getMember(member.ID));
		}
		
		this.MEMBER_REMOVE = new HashSet<Integer> ();
    	for (int memberId : temp)
    	{
    		byte r = this.memberRemove(memberId);
    		if (r == ErrorConst.SUCCESS)
    			this.MEMBER_REMOVE.add(memberId);
    	}
    	
    	this.setTimeUpdate(Time.getUnixTime() + Time.SECOND_IN_MINUTE);
    	return true;
	}
	
	public boolean updateTasks ()
	{
		int time = Time.getUnixTime();
		Set<Integer> removes = new HashSet<Integer> ();

		boolean isChanged = false;
		for (Task task : this.TASKS.values())
		{
			int oldStatus = task.STATUS;
			task.update();
			if (task.STATUS != oldStatus) isChanged = true;
		}

		for (Task task : this.TASKS_DOING.values())
		{
			if (task.END == 0 || task.END > time)
				continue;

			removes.add(task.TASK_ID);
		}
		for (Integer id : removes)
		{
			Task task = this.TASKS_DOING.get(id);
			
			this.TASKS_DOING.remove(task.TASK_ID);
			this.TASKS_OLD.put(task.TASK_ID, task);
			
			if (task.IS_DONE())
			{
				Member member = this.getMember(task.MEMBER_ID);
				if (member != null)
				{
					member.addPoint(task.DERBY());
					CacheGuildClient.increaseDerbyPoint (this.getGroupId(), this.getGuildId(), this.getLeague(), task.DERBY());
				}
			}
		}
		return removes.size() > 0 || isChanged;
	}

	public int updatePoint ()
	{
//		this.MEMBER.load();
//		this.TASKS_OLD.load();
		
		for (Member member : this.MEMBER.values())
			member.POINT = 0;
		
		int point = 0;
		for (Task task : this.TASKS_OLD.values())
		{
			if (task.STATUS != MiscDefine.GUILD_DERBY_TASK_DONE)
				continue;
			
			Member member = this.MEMBER.get (task.MEMBER_ID); 
			if (member == null)
				continue;
			
			member.POINT += task.DERBY();
			point += task.DERBY();
		}
		
		this.setPoint (point);
		return point;
	}

	public void updateMilestonte ()
	{
		this.updateTasks();
		this.updatePoint();
		
		MilestoneInfo milestone = ConstInfo.getGuildDerbyData().findMilestone (this.getLeague(), this.getPoint());
		this.setMilestone(milestone != null ? milestone.ID() : -1);
	}

	public int getMemberDoneTaskNum(int memberID)
	{
		int numTaskDone = 0;
		this.loadTasks(false, false, true);
		for (Task task: TASKS_OLD.values())
		{
			if (task.MEMBER_ID == memberID && task.STATUS == MiscDefine.GUILD_DERBY_TASK_DONE)
				numTaskDone += 1;
		}
		return numTaskDone;
	}

	public void addTask (int addTasks, int cooldown)
	{
		GuildDerbyData data = ConstInfo.getGuildDerbyData();
		Map<String, Integer> currentTask = new HashMap<String, Integer> ();
        HashMap<String, List<String>> newTasks = new HashMap<>();
		this.loadTasks(true, false, false);
		int guildMaxLvMember = this.getLevelMax();
		int maxLvTask = guildMaxLvMember + MiscInfo.DERBY_TASK_LEVEL_DIF();

		for (Task task : this.TASKS.values())
		{
            if (task.STATUS == MiscDefine.GUILD_DERBY_TASK_PROCESS)
				continue;
			
			String taskName = data.getTaskActionName(task.ACTION_ID);
			int count = currentTask.computeIfAbsent(taskName, (id) -> 0);
			count += 1;
			
			currentTask.put(taskName, count);
            newTasks.computeIfAbsent(taskName, key -> new ArrayList<>()).add(task.TARGET);
		}
		
		if (this.TASKS_NEW == null)
			this.TASKS_NEW = new HashMap <Integer, Task> ();
		
		List<String> taskIds = data.generateTask(this.getLevel(), currentTask, addTasks, maxLvTask);
		int taskId = this.getTaskId (); 
		for (String actionId : taskIds)
		{
            Task task = Task.create(taskId, actionId, cooldown, newTasks, maxLvTask);
            if (task == null)
            {
                MetricLog.info("GuilderDerby.addTask: task = null, taskId: " + taskId + ", actionId: " + actionId);
                continue;
            }
            newTasks.computeIfAbsent(actionId, key -> new ArrayList<>()).add(task.TARGET);
			this.TASKS.put(task.TASK_ID, task);
			this.TASKS_NEW.put(task.TASK_ID, task);
			taskId += 1;
		}
		
		this.setTaskId(taskId);
	}

	public boolean loadTasks (boolean needWaiting, boolean needDoing, boolean needOld)
	{
		boolean result = true;
		
		if (needWaiting)
			result &= TASKS.load();
		
		if (needDoing)
			result &= TASKS_DOING.load();
		
		if (needOld)
			result &= TASKS_OLD.load();
		
		return result;
	}

	public Task loadTask (int taskId)
	{
		if (!TASKS.load(taskId))
			return null;
		
		return TASKS.get(taskId);
	}
	
	public Task getTask (int taskId)
	{
		if (TASKS == null)
			return null;
		
		return TASKS.get (taskId);
	}
	
	public Collection<Task> getTaskNews ()
	{
		if (TASKS_NEW == null)
			return null;
		
		return TASKS_NEW.values();
	}

	public boolean saveTasks ()
	{
		return TASKS.save ();
	}

	public boolean saveTask (int taskId)
	{
		return TASKS.save (taskId);
	}

	public Task getTaskOld (int taskId)
	{
		if (TASKS_OLD == null)
			return null;
		
		return TASKS_OLD.get (taskId);
	}
	
	public Task getTaskDoing (int taskId)
	{
		if (TASKS_DOING == null)
			return null;
		
		return TASKS_DOING.get (taskId);
	}
	
	public Task loadTaskDoing (int taskId)
	{
		if (!TASKS_DOING.load(taskId))
			return null;
		
		return TASKS_DOING.get(taskId);
	}
	
	public boolean loadMembers ()
	{
		return this.MEMBER.load();
	}
	
	public Member loadMember(int userId)
	{
		if (!MEMBER.load(userId))
			return null;
		
		return MEMBER.get(userId);
	}

	public Member getMember(int userId)
	{
		return MEMBER.get(userId);
	}
	
	public Set<Integer> getMemberRemoved()
	{
		if (this.MEMBER_REMOVE == null || this.MEMBER_REMOVE.isEmpty())
			return null;
		
		return this.MEMBER_REMOVE;
	}
	
	public Set<Integer> getMemberIds()
	{
		Set<String> ids = this.MEMBER.keySet();
		if (ids == null)
			return null;
		
		Set<Integer> temp = new HashSet <Integer> ();
		for (String id : ids)
			if (id != null && !id.isEmpty ())
				temp.add(Integer.valueOf(id));
		
		return temp;
	}
	
	@Override
	public void putData(Encoder msg)
	{
		msg.put(GUILD_DERBY_ID, this.ID);
		msg.put(GUILD_DERBY_LEAGUE_ID, this.getLeague ());
		msg.put(GUILD_DERBY_GROUP_ID, this.getGroupId ());
		msg.put(GUILD_DERBY_TIME_START, this.getTimeStart ());
		msg.put(GUILD_DERBY_TIME_END, this.getTimeEnd ());
		msg.put(GUILD_DERBY_TIME_REWARD, this.getTimeReward ());
		msg.put(GUILD_DERBY_POINT, this.getPoint());

		if (this.MEMBER != null && !this.MEMBER.isEmpty())
			msg.put(GUILD_DERBY_MEMBER, this.MEMBER.values());

		if (this.TASKS != null && !this.TASKS.isEmpty())
			msg.put(GUILD_DERBY_TASKS, this.TASKS.values());

		if (this.TASKS_DOING != null && !this.TASKS_DOING.isEmpty())
			msg.put(GUILD_DERBY_TASKS_DOING, this.TASKS_DOING.values());

		if (this.TASKS_OLD != null && !this.TASKS_OLD.isEmpty())
			msg.put(GUILD_DERBY_TASKS_OLD, this.TASKS_OLD.values());
	}
	
	public byte taskAccept(int taskId, int memberId, int memberLv, boolean isCoin)
	{
		if (!this.isActive())
			return ErrorConst.NOT_ACTIVE;
		
		Member member = getMember (memberId);
		if (member == null)
			return ErrorConst.INVALID_ID;
		
		LeagueInfo league = ConstInfo.getGuildDerbyData().getLeague(this.getLeague());
		if (league == null)
			return ErrorConst.NULL_ITEM_INFO;
		
		if (isCoin)
		{
			if (member.DAILY_TASK_ACCEPT < league.MEMBER_TASK_LIMIT())
				return ErrorConst.INVALID_BUY;
			else if (member.DAILY_TASK_ACCEPT > league.MEMBER_TASK_LIMIT() + MiscInfo.DERBY_MEMBER_TASK_EXTRA_NUMBER())
				return ErrorConst.LIMIT_DAY;
		}
		else
		{
			if (member.DAILY_TASK_ACCEPT > league.MEMBER_TASK_LIMIT())
				return ErrorConst.LIMIT_DAY;
		}
		
		Task task = getTask (taskId);
		if (task == null)
			return ErrorConst.NULL_SLOT;
		
		task.update();
		byte result = task.start(memberId, memberLv);
		if (result == ErrorConst.SUCCESS)
		{
			member.addTask ();
//			this.MEMBER.save(member.ID);

			this.TASKS_DOING.put(task.TASK_ID, task);
//			this.TASKS_DOING.save(task.TASK_ID);
			
			this.TASKS.remove(task.TASK_ID);
			this.addTask(MiscInfo.DERBY_TASK_NUMBER() - this.TASKS.sizeInDatabase(), MiscInfo.DERBY_TASK_PICK_COOLDOWN());
//			this.TASKS.save();
		}
			
		return result; 
	}
	
	public byte taskUpdate(int taskId, int userId, int current)
	{
		if (!this.isActive())
			return ErrorConst.NOT_ACTIVE;
		
		Member member = getMember(userId);
		if (member == null)
			return ErrorConst.INVALID_ID;
		
		if (!this.TASKS_DOING.load (taskId))
			return ErrorConst.INVALID_SLOT_ID;
		
		Task task = this.TASKS_DOING.get(taskId);
		if (task == null)
			return ErrorConst.NULL_SLOT;
		
		task.update ();
		byte result = task.updateProcess(userId, current);
		if ((result == ErrorConst.SUCCESS && task.IS_DONE ()) || result == ErrorConst.TIMEOUT)
		{
			this.TASKS_OLD.put(task.TASK_ID, task);
//			this.TASKS_OLD.save(task.TASK_ID);
			
			this.TASKS_DOING.remove(task.TASK_ID);

			if (task.IS_DONE ())
			{
				CacheGuildClient.increaseDerbyPoint (this.getGroupId(), this.getGuildId(), this.getLeague(), task.DERBY());
				member.addPoint(task.DERBY());
			}
		}
		
		return result;
	}
	
	public byte taskCancel(int taskId, int memberId)
	{
		if (!this.isActive())
			return ErrorConst.NOT_ACTIVE;
		
		if (!this.TASKS_DOING.load (taskId))
			return ErrorConst.INVALID_SLOT_ID;
		
		Task task = this.TASKS_DOING.get(taskId);
		if (task == null)
			return ErrorConst.NULL_SLOT;
		
		byte result = task.cancel(memberId);
		if (result == ErrorConst.SUCCESS)
		{
			this.TASKS_OLD.put(task.TASK_ID, task);
			this.TASKS_OLD.save(task.TASK_ID);
			
			this.TASKS_DOING.remove(task.TASK_ID);
		}

		return result;
	}
	
	public byte taskRemove(int taskId)
	{
		if (!this.isActive())
			return ErrorConst.NOT_ACTIVE;
		
		if (!this.TASKS.load (taskId))
			return ErrorConst.INVALID_SLOT_ID;

		Task task = this.TASKS.get(taskId);
		if (task == null)
			return ErrorConst.NULL_SLOT;

		byte result = task.remove();
		if (result == ErrorConst.SUCCESS)
		{
			this.TASKS_OLD.put(task.TASK_ID, task);
//			this.TASKS_OLD.save(task.TASK_ID);
			
			this.TASKS.remove(task.TASK_ID);
			this.addTask(MiscInfo.DERBY_TASK_NUMBER() - this.TASKS.sizeInDatabase(), MiscInfo.DERBY_TASK_REMOVE_COOLDOWN());
//			this.TASKS.save();
		}
		
		return result;
	}
	
	public byte taskSkipCooldown(int taskId)
	{
		if (!this.isActive())
			return ErrorConst.NOT_ACTIVE;
		
		Task task = this.TASKS.get(taskId);
		if (task == null)
			return ErrorConst.NULL_SLOT;

		byte result = task.skipCooldown ();
		if (result == ErrorConst.SUCCESS)
			this.TASKS.save(taskId);
		
		return result;
	}
	
	public byte memberRemove (int memberId)
	{
		Member member = this.getMember(memberId);
		if (member == null)
			member = this.loadMember (memberId);

		if (this.getEnd() || Time.getUnixTime() > this.getTimeEnd()) return ErrorConst.INVALID_ACTION;

		if (member == null)
			return ErrorConst.INVALID_ID;
		this.loadTasks(false, true, true);
		List<Integer> removes = new ArrayList<Integer> ();
		for (Task task : this.TASKS_DOING.values())
			if (task.MEMBER_ID == memberId)
				removes.add (task.TASK_ID);
		
		for (int taskId : removes)
			this.TASKS_DOING.remove (taskId);

		int point = 0;
		removes.clear();
		for (Task task : this.TASKS_OLD.values())
		{
			if (task.MEMBER_ID != memberId)
				continue;
			
			if (task.IS_DONE())
				point += task.DERBY();
			
			removes.add (task.TASK_ID);
		}
		
		for (int taskId : removes)
			this.TASKS_OLD.remove (taskId);
		this.MEMBER.remove(memberId);
		
		CacheGuildClient.increaseDerbyPoint (this.getGroupId(), this.getGuildId(), this.getLeague(), -point);
		return ErrorConst.SUCCESS;
	}
	
	public int globalPoint (int order)
	{
		if (!this.MEMBER.load())
			return -1;
		
		if (!this.TASKS_OLD.load())
			return -1;
		
		int totalMember = this.MEMBER.size();
		int totalDerby = 0;
		int memberActive = 0;
		for (Member member : this.MEMBER.values())
		{
			totalDerby += member.POINT;
			if (member.POINT > 0)
				memberActive += 1;
		}
		
		int taskCancel = 0;
		for (Task task : this.TASKS_OLD.values())
			if (task.STATUS == MiscDefine.GUILD_DERBY_TASK_CANCEL)
				taskCancel += 1;
		
		int averageMemberScore = totalDerby / totalMember;
		int positionBonus = ConstInfo.getGuildDerbyData().getPositionBonus (order);
		int sizeBonus = ConstInfo.getGuildDerbyData().getSizeBonus (memberActive);
		int penalty = taskCancel / totalMember;
		
		int total = averageMemberScore + positionBonus + sizeBonus - penalty;
		this.setGlobalPoint(total);
		
		return total;
	}
	
	public byte end (int order, String newLeagueId)
	{
    	LeagueInfo league = ConstInfo.getGuildDerbyData().getLeague (this.getLeague());
    	if (league == null)
    		return ErrorConst.INVALID_FLOOR;
    	
    	LeagueInfo newLeague = ConstInfo.getGuildDerbyData().getLeague (newLeagueId);
    	if (newLeague == null)
    		return ErrorConst.INVALID_ID;
    	
    	MapItem reward = null;
    	if (league.ORDER() < newLeague.ORDER())  
    		reward = league.getRankingReward(order);

    	this.setGroupOrder(order);
    	this.setLeague(newLeagueId);
    	this.setGroupReward(MetricLog.toString(reward));
    	this.setEnd();
    	
    	return ErrorConst.SUCCESS;
	}
	
	public static class Task extends Encoder.IObject implements KeyDefine
	{
		private int    TASK_ID;
		private int    ACTION_ID;
		private int    MEMBER_ID;
		private int    STATUS;
    	private String TARGET;
    	private int    LEVEL;
    	private int    REQUIRE;
    	private int    CURRENT;
    	private int    START;
    	private int    END;
        private int    DERBY;
        
        private Integer COOLDOWN;
        private Integer DURATION;
        
        private Task () {}

        public static Task create (int id, String actionId, int cooldown, HashMap<String, List<String>> newTasks, int maxGuildMemberLv)
        {
            TaskDetail taskDetail = ConstInfo.getGuildDerbyData().generateTaskDetail(actionId, newTasks, maxGuildMemberLv);
        	if (taskDetail == null)
        		return null;
        	
        	Task task = new Task ();
        	task.TASK_ID = id;
        	task.ACTION_ID = ConstInfo.getGuildDerbyData().getTaskActionId(actionId);
        	task.MEMBER_ID = -1;
        	task.TARGET = taskDetail.TARGET ();
        	task.LEVEL = taskDetail.LEVEL ();
        	task.REQUIRE = taskDetail.REQUIRE ();
        	task.CURRENT = 0;
        	task.DERBY = taskDetail.DERBY () * task.REQUIRE;
            task.END = taskDetail.DURATION();
            task.DURATION = taskDetail.DURATION();
            
            if (cooldown > 0)
            {
            	task.STATUS = MiscDefine.GUILD_DERBY_TASK_COOLDOWN;
            	task.START = Time.getUnixTime() + cooldown;
            	task.COOLDOWN = cooldown;
            }
            else
            {
            	task.STATUS = MiscDefine.GUILD_DERBY_TASK_WAIT;
            	task.START = 0;
            }
        	
        	return task;
		}
		
        public int TASK_ID() { return TASK_ID; }
        
        public int ACTION_ID() { return ACTION_ID; }
        
        public String TARGET() { return TARGET; }
        
        public int REQUIRE() { return REQUIRE; }

		public int CURRENT() { return CURRENT; }
		
		public boolean IS_DONE() { return CURRENT >= REQUIRE; }
		
		public int START() { return START; }
		
		public int COOLDOWN() { return COOLDOWN == null ? 0 : COOLDOWN.intValue(); }
		
		public int DURATION() { return DURATION == null ? 0 : DURATION.intValue(); }

		public int DERBY() { return DERBY; }
		
        public byte start (int memberId, int memberLv)
        {
        	if (this.STATUS == MiscDefine.GUILD_DERBY_TASK_COOLDOWN)
        	{
        		if (this.START > Time.getUnixTime())
            		return ErrorConst.TIME_WAIT;
            	else
            		this.STATUS = MiscDefine.GUILD_DERBY_TASK_WAIT;
        	}
        		
        	if (this.STATUS != MiscDefine.GUILD_DERBY_TASK_WAIT)
        		return ErrorConst.INVALID_STATUS;
        				
        	if (this.MEMBER_ID != -1)
        		return ErrorConst.FULL_SLOT;
        	
        	if (this.LEVEL > memberLv)
        		return ErrorConst.LIMIT_LEVEL;

        	this.STATUS = MiscDefine.GUILD_DERBY_TASK_PROCESS;
        	this.MEMBER_ID = memberId;
        	this.START = Time.getUnixTime();
        	
        	if (this.END > 0)
        		this.END += this.START;
        	
        	return ErrorConst.SUCCESS;
        }
        
        public void update ()
        {
        	switch (this.STATUS)
        	{
        		case MiscDefine.GUILD_DERBY_TASK_COOLDOWN:
                	if (this.START < Time.getUnixTime())
                	{
                		this.START = 0;
                		this.COOLDOWN = null;
                		this.STATUS = MiscDefine.GUILD_DERBY_TASK_WAIT;
                	}
        		break;
        		
        		case MiscDefine.GUILD_DERBY_TASK_PROCESS:
                	if (this.END > 0 && this.END < Time.getUnixTime())
                		this.STATUS = MiscDefine.GUILD_DERBY_TASK_TIMEOUT;
                	else if (this.CURRENT >= this.REQUIRE)
                		this.STATUS = MiscDefine.GUILD_DERBY_TASK_DONE;
                break;
        	}
        }
        
        public byte updateProcess (int memberId, int value)
        {
        	if (this.MEMBER_ID != memberId)
        		return ErrorConst.INVALID_ID;
        	
        	if (this.STATUS != MiscDefine.GUILD_DERBY_TASK_PROCESS)
        		return ErrorConst.INVALID_STATUS;
        	
        	if (this.END > 0 && this.END < Time.getUnixTime())
        	{
        		this.STATUS = MiscDefine.GUILD_DERBY_TASK_TIMEOUT;
        		return ErrorConst.TIMEOUT;
        	}
        		
        	if (value < this.CURRENT)
        		return ErrorConst.INVALID_NUM;
        	
        	this.CURRENT = value;
        	if (this.CURRENT >= this.REQUIRE)
        	{
        		this.CURRENT = this.REQUIRE;
        		this.STATUS = MiscDefine.GUILD_DERBY_TASK_DONE;
        	}
        	return ErrorConst.SUCCESS;
        }
        
        public byte cancel (int memberId)
        {
        	if (this.STATUS != MiscDefine.GUILD_DERBY_TASK_PROCESS)
        		return ErrorConst.INVALID_STATUS;

        	if (this.MEMBER_ID != memberId)
        		return ErrorConst.INVALID_ID;

        	this.STATUS = MiscDefine.GUILD_DERBY_TASK_CANCEL;
        	return ErrorConst.SUCCESS;
        }
        
        public byte remove ()
        {
        	if (this.STATUS != MiscDefine.GUILD_DERBY_TASK_WAIT)
        		return ErrorConst.INVALID_STATUS;
        	
        	this.STATUS = MiscDefine.GUILD_DERBY_TASK_REMOVE;
        	return ErrorConst.SUCCESS;
        }
        
        public byte skipCooldown()
        {
        	if (this.STATUS != MiscDefine.GUILD_DERBY_TASK_COOLDOWN)
        		return ErrorConst.INVALID_STATUS;
        	
        	this.START = 0;
        	this.COOLDOWN = null;
    		this.STATUS = MiscDefine.GUILD_DERBY_TASK_WAIT;
        		
			return ErrorConst.SUCCESS;
		}
        
		@Override
		public void putData(Encoder msg)
		{
			msg.put(GUILD_DERBY_TASK_ID, this.TASK_ID);
			msg.put(GUILD_DERBY_TASK_ACTION, this.ACTION_ID);
			msg.put(GUILD_DERBY_TASK_TARGET, this.TARGET);
			msg.put(GUILD_DERBY_TASK_REQUIRE, this.REQUIRE);
			msg.put(GUILD_DERBY_TASK_LEVEL, this.LEVEL);
			msg.put(GUILD_DERBY_TASK_STATUS, this.STATUS);
			msg.put(GUILD_DERBY_TASK_START, this.START);
			msg.put(GUILD_DERBY_TASK_END, this.END);
			msg.put(GUILD_DERBY_TASK_REWARD, this.DERBY);
			
			msg.put(GUILD_DERBY_TASK_MEMBER, this.MEMBER_ID);
			msg.put(GUILD_DERBY_TASK_CURRENT, this.CURRENT);
			
			msg.put(GUILD_DERBY_TASK_TIME_WAIT, this.COOLDOWN());
			msg.put(GUILD_DERBY_TASK_TIME_DOING, this.DURATION());
		}
	}
	
	public static class Member extends Encoder.IObject implements KeyDefine
	{
		private int ID;
		private int POINT;
		private int DAILY_TASK_ACCEPT;
		
		private Member () {};
		
        public int DAILY_TASK_ACCEPT() { return DAILY_TASK_ACCEPT; }

		public int POINT() { return POINT; }
		
		public static Member create (GuildMemberInfo info)
		{
			Member member = new Member ();
			member.ID = info.getId();
			member.POINT = 0;
			member.DAILY_TASK_ACCEPT = 0;
			
			return member;
		}
		
		public void update (GuildMemberInfo info)
		{
			if (this.ID != info.getId())
				return;
		}
		
		public void resetDaily ()
		{
			this.DAILY_TASK_ACCEPT = 0;
		}

		public void addTask () { DAILY_TASK_ACCEPT += 1; }
		
		public void addPoint (int value) { POINT += value; }
		
		@Override
		public void putData(Encoder msg)
		{
			msg.put(GUILD_DERBY_MEMBER_ID, this.ID);
			msg.put(GUILD_DERBY_MEMBER_POINT, this.POINT);
			msg.put(GUILD_DERBY_MEMBER_TASK_DONE, this.DAILY_TASK_ACCEPT);
		}
	}
}