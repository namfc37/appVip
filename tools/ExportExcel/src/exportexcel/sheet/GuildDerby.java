package exportexcel.sheet;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

import data.ActionInfo;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.GuildDerbyInfo;
import data.GuildDerbyInfo.TaskDetail;
import data.GuildDerbyInfo.TaskInfo;

public class GuildDerby extends ParseWorkbook
{
	private GuildDerbyInfo info;
	
	public GuildDerby(String inputName) throws Exception
	{
		super(inputName);
	}

    @Override
    public void handle () throws Exception
    {
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
		this.info = new GuildDerbyInfo();

		parseLeague ("League");
		parseLeagueRewards ("League_Reward");
		parseMilestone ("Milestone");
		parseTaskList ("Task_Rate");
		parseTaskDetail ("Task_Detail");
		parseMemberBonus ("Member_Bonus");
		parseRankBonus ("Rank_Bonus");
        addConstInfo(info, null);
    }
    
    private void parseLeague (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		this.info.LEAGUES = new HashMap<String, GuildDerbyInfo.LeagueInfo> ();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;

			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			String id = parseSheet.getString(r, "ID");
			if (id == null || id.isEmpty())
				continue;

			GuildDerbyInfo.LeagueInfo league = new GuildDerbyInfo.LeagueInfo (id);
			league.NAME = parseSheet.getString(r, "NAME");
			league.ORDER = parseSheet.getInt(r, "ORDER");
			league.MEMBER_TASK_LIMIT = parseSheet.getInt(r, "MEMBER_TASK_LIMIT");
			league.REWARDS_MILESTONE = parseSheet.getInt(r, "REWARDS_MILESTONE");
			league.REWARDS_RANK = new TreeMap <Integer, Map<String, Integer>> ();
			
			this.info.LEAGUES.put (league.ID, league);
        }
    }
    
    private void parseLeagueRewards (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;
			
			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			int rank = parseSheet.getInt(r, "RANK");
			for (String league : this.info.LEAGUES.keySet())
			{
				Map<String, Integer> reward = parseSheet.getMapItemNum(r, league);
				if (reward == null || reward.isEmpty())
					continue;

				this.info.LEAGUES.get(league).REWARDS_RANK.put(rank, reward);
			}
        }
    }
    
    private void parseMilestone (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		NavigableMap<Integer, GuildDerbyInfo.MilestoneInfo> temp = new TreeMap<Integer, GuildDerbyInfo.MilestoneInfo> ();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;

			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			int id = parseSheet.getInt(r, "DERBY_MILESTONE");

			GuildDerbyInfo.MilestoneRewardInfo reward = new GuildDerbyInfo.MilestoneRewardInfo ();
			reward.ID = parseSheet.getInt(r, "REWARD_ID");
			reward.RATE = parseSheet.getInt(r, "RATE");
			reward.REWARDS = parseSheet.getMapItemNum(r, "REWARDS");
			reward.DEFAULT_RATE = parseSheet.getInt(r, "DEFAULT_RATE");

			GuildDerbyInfo.MilestoneInfo milestone = temp.computeIfAbsent(id, (i) -> new GuildDerbyInfo.MilestoneInfo (i));
			milestone.REWARDS.add(reward);
        }
		
		int milestoneId = 0;
		this.info.MILESTONE = new TreeMap<Integer, GuildDerbyInfo.MilestoneInfo> ();
		for (GuildDerbyInfo.MilestoneInfo info : temp.values())
		{
			info.ID = milestoneId; 
			this.info.MILESTONE.put(info.POINT, info);
			milestoneId += 1;
		}
    }
    
    private void parseTaskList (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		this.info.TASKS = new HashMap<>();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;

			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			GuildDerbyInfo.TaskLevel taskLevel = new GuildDerbyInfo.TaskLevel();

			taskLevel.LV = parseSheet.getInt(r, "LV");
			if (taskLevel.LV < 1)
				taskLevel.LV = Integer.MAX_VALUE;
			
			taskLevel.MIN = parseSheet.getInt(r, "MIN");
			taskLevel.MAX = parseSheet.getInt(r, "MAX");
			taskLevel.RATE = parseSheet.getInt(r, "RATE");
			String action = parseSheet.getString(r, "ACTION");
			GuildDerbyInfo.TaskInfo actionInfo = this.info.TASKS.computeIfAbsent(action, (act) ->
			{
				GuildDerbyInfo.TaskInfo info = new GuildDerbyInfo.TaskInfo ();
				info.ACTION = act;
				
				try
				{
					//info.ACTION_ID = Define.defineToByte(info.ACTION);
					info.ACTION_ID = ActionInfo.getActionIntValue(info.ACTION);
				}
				catch (Exception e)
				{
//					throwRuntimeException("GuildDerby::parseTaskList cannot found define of " + action.ACTION);
					return null;
				}
				info.MIN_LEVEL_REQUIRE = Integer.MAX_VALUE;
				info.LV = new TreeMap<>();
				
				return info;
			});
			
			if (actionInfo != null)
				actionInfo.LV.put (taskLevel.LV, taskLevel);
        }
    }
    
    private void parseTaskDetail (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		this.info.TASK_DETAIL = new HashMap<String, List<TaskDetail>> ();
		for (int r = 1; r <= maxRow; r++)
		{
			String temp = parseSheet.getString(r, "ACTIONS");
			String[] actions = temp.split(",");
			
			for (int i = 0; i < actions.length; i++)
			{
				String action = actions [i];

				if (!this.info.TASKS.containsKey(action))
					throwRuntimeException(r, 0, "Sheet Task_Rate not contains Action: " + action);

				GuildDerbyInfo.TaskDetail item = new TaskDetail ();
				item.TARGET = parseSheet.getString(r, "TARGET");
				if (item.TARGET != null && !item.TARGET.isEmpty())
				{
			        String itemId = ParseWorkbook.mapIdName.inverse().get(item.TARGET.toLowerCase());
			        if (itemId != null);
			        	item.TARGET = itemId;
				}
				
				item.LEVEL = parseSheet.getInt(r, "LEVEL");
				if (item.LEVEL < this.info.TASKS.get(action).MIN_LEVEL_REQUIRE)
					this.info.TASKS.get(action).MIN_LEVEL_REQUIRE = item.LEVEL;

				item.RATE = parseSheet.getInt(r, "RATE");
				item.REQUIRE_MIN = parseSheet.getInt(r, "REQ_NUM_MIN");
				item.REQUIRE_MAX = parseSheet.getInt(r, "REQ_NUM_MAX");

				if (item.REQUIRE_MIN > item.REQUIRE_MAX)
					throwRuntimeException(r, 0, "REQ_NUM_MIN > REQ_NUM_MAX in Action: " + action + " row: " + r);

				item.DURATION = parseSheet.getInt(r, "DURATION");
				item.DERBY_POINT = parseSheet.getInt(r, "DERBY_POINT");
				//if (item.DERBY_POINT % 5 != 0)
				//System.out.println("ACTION: " + action + " row: " + r + " DERBY_POINT: " + parseSheet.getString(r, "DERBY_POINT"));
				this.info.TASK_DETAIL.computeIfAbsent(action, (actionName) -> new ArrayList<TaskDetail> ()).add(item);
			}
        }	
    }
    
    private void parseMemberBonus (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		this.info.MEMBER_BONUS = new TreeMap<Integer, Integer> ();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;

			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			int member = parseSheet.getInt(r, "MEMBER");
			int bonus = parseSheet.getInt(r, "BONUS");
			
			this.info.MEMBER_BONUS.put (member, bonus);
        }
    }
    
    private void parseRankBonus (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		
		this.info.RANK_BONUS = new TreeMap<Integer, Integer> ();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;

			Cell cell = row.getCell(0);
			if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
				continue;
			
			int position = parseSheet.getInt(r, "POSITION");
			int bonus = parseSheet.getInt(r, "BONUS");
			
			this.info.RANK_BONUS.put (position, bonus);
        }
    }
}