package exportexcel.sheet;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.TreeMap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.Event01Reward;
import data.ItemInfo;
import data.RankingBoardInfo;
import data.TopAction;
import data.TopAppraisal;
import data.TopEvent;
import data.TopLevel;
import exportexcel.Util;

public class RankingBoard extends ParseWorkbook
{
	private RankingBoardInfo info;
	
	public RankingBoard (String inputName) throws Exception
	{
		super(inputName);
	}

	@Override
	public void handle ()
	{	
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
		boolean RANKING_BOARD_ACTIVE = Define.miscJson.get("RANKING_BOARD_ACTIVE").getAsBoolean();
		if (!RANKING_BOARD_ACTIVE)
		{
			Define.miscJson.addProperty("TOP_LEVEL_ACTIVE", false);
			Define.miscJson.addProperty("TOP_EVENT_ACTIVE", false);
			Define.miscJson.addProperty("TOP_APPRAISAL_ACTIVE", false);
			Define.miscJson.addProperty("TOP_ACTION_ACTIVE", false);
		}

		this.info = new RankingBoardInfo ();
		parseTopLevel ("Top Level");
		parseTopAppraisal ("Top Appraisal");
		parseTopActions ("Top Action");
		parseTopActionRewards ("Top Action Reward");
		parseTopEventReward ("Top Event Reward");
		
		addConstInfo(info, null);
	}
	
	private void parseTopLevel (String idSheet)
	{
		this.info.TOP_LEVEL = new TopLevel();
		this.info.TOP_LEVEL.LEVELS = new ArrayList<Integer> ();
		
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

			int level = parseSheet.getInt(r, "GROUP_LEVEL");
			if (level < 1)
				level = Integer.MAX_VALUE;
			
			this.info.TOP_LEVEL.LEVELS.add (level);
		}
	}
	
	private void parseTopAppraisal (String idSheet)
	{
		this.info.TOP_APPRAISAL = new TopAppraisal();
		this.info.TOP_APPRAISAL.LEVELS = new ArrayList<Integer> ();
		
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

			int level = parseSheet.getInt(r, "GROUP_LEVEL");
			if (level < 1)
				level = Integer.MAX_VALUE;
			
			this.info.TOP_APPRAISAL.LEVELS.add (level);
		}
	}
	
	private void parseTopActions (String idSheet)
	{
		this.info.TOP_ACTIONS = new HashMap<String, TopAction>();
		
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

			String ID = parseSheet.getString(r, "ID");
			if (ID == null || ID.isEmpty())
				continue;
			
			TopAction action = new TopAction ();
			action.ID = ID;
			action.LEVELS = new ArrayList<Integer> ();
		    action.REWARDS = new TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> ();

			action.ACTIONS = parseSheet.getString(r, "ACTIONS").split("\n");

			action.START_TIME = parseSheet.getString(r, "START_TIME");
			action.END_TIME = parseSheet.getString(r, "END_TIME");
			action.REWARD_TIME = parseSheet.getString(r, "REWARD_TIME");
			
			if (action.START_TIME == null || action.START_TIME.isEmpty()
			||	action.END_TIME == null || action.END_TIME.isEmpty()
			||	action.REWARD_TIME == null || action.REWARD_TIME.isEmpty())
			{
				action.UNIX_START_TIME = -1;
				action.UNIX_END_TIME = -1;
				action.UNIX_REWARD_TIME = -1;
			}
			else
			{
				action.UNIX_START_TIME = Util.toUnixTime(action.START_TIME);
				action.UNIX_END_TIME = Util.toUnixTime(action.END_TIME);
				action.UNIX_REWARD_TIME = Util.toUnixTime(action.REWARD_TIME);
				
				if (action.UNIX_START_TIME > action.UNIX_END_TIME)
	                throwRuntimeException("RankingBoard END_TIME is wrong, " + ID + ", " + action.START_TIME + ", " + action.END_TIME);
				
				if (action.UNIX_REWARD_TIME - action.UNIX_END_TIME < 30 * 60)
					throwRuntimeException("RankingBoard REWARD_TIME so close, " + ID + ", " + action.END_TIME + ", " + action.REWARD_TIME + ", " + (action.UNIX_REWARD_TIME - action.UNIX_END_TIME));
			}
			
			action.DEFAULT_REQUIRE = parseSheet.getInt(r, "DEFAULT_REQUIRE");
			action.DEFAULT_REWARDS = parseSheet.getMapItemNum (r, "DEFAULT_REWARDS");
		    
		    action.SLOGAN_TEXT_ID = parseSheet.getString(r, "SLOGAN");
		    action.DESC_TEXT_ID = parseSheet.getString(r, "DESC");
		    action.ICON = parseSheet.getString(r, "ICON");
			
		    this.info.TOP_ACTIONS.put(action.ID, action);
		}
	}
	
	private void parseTopActionRewards (String idSheet)
	{
		TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> defaultRewards = new TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> ();
		
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

			String ID = parseSheet.getString(r, "ID");
			if (ID == null || ID.isEmpty())
				continue;
			
			String actionId = parseSheet.getString(r, "ID");
			int groupLevel = parseSheet.getInt(r, "LEVEL");
			if (groupLevel < 1)
				groupLevel = Integer.MAX_VALUE;
			
			TreeMap<Integer, HashMap<String, Integer>> groupLevelRewards = new TreeMap<Integer, HashMap<String, Integer>> ();
			for (int i = 0; i < 10; i++)
			{
				String topId = "_" + (i < 10 ? "0" : "") + (i + 1);
				if (parseSheet.isEmptyCell(r, "TOP" + topId))
					break;
				
				int top = parseSheet.getInt(r, "TOP" + topId);
				HashMap<String, Integer> rewards = parseSheet.getMapItemNum (r, "REWARD" + topId);
				
				groupLevelRewards.put (top, rewards);
			}
			
			if (actionId.equalsIgnoreCase("*"))
			{
				defaultRewards.put(groupLevel, groupLevelRewards);
			}
			else if (this.info.TOP_ACTIONS.containsKey(actionId))
			{
				this.info.TOP_ACTIONS.get(actionId).REWARDS.put(groupLevel, groupLevelRewards);
			}
			else
			{
				//error
			}
		}
		
		for (String actionId : this.info.TOP_ACTIONS.keySet())
		{
			TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> groupLevelRewards = this.info.TOP_ACTIONS.get(actionId).REWARDS;
			if (groupLevelRewards.size() == 0)
			{
				groupLevelRewards = defaultRewards;
				this.info.TOP_ACTIONS.get(actionId).REWARDS = defaultRewards; 
			}
			
			for (Integer lv : groupLevelRewards.keySet())
				this.info.TOP_ACTIONS.get(actionId).LEVELS.add (lv);
		}
	}

	private void parseTopEventReward (String idSheet)
	{
		this.info.TOP_EVENTS = new HashMap<String, TopEvent>();

//		this.info.TOP_EVENT.START_TIME = parseSheet.getString(r, "START_TIME");
//		this.info.TOP_EVENT.END_TIME = parseSheet.getString(r, "END_TIME");
//		this.info.TOP_EVENT.UNIX_START_TIME = Util.toUnixTime(this.info.TOP_EVENT.START_TIME);
//		this.info.TOP_EVENT.UNIX_END_TIME = Util.toUnixTime(this.info.TOP_EVENT.END_TIME);
		
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
			
			String eventId = parseSheet.getItemId(r, "EVENT_ID");
			if (eventId == null || eventId.isEmpty())
				continue;
			
			TopEvent event = this.info.TOP_EVENTS.get("TOP_EVENT_" + eventId);
			if (event == null)
			{
				event = new TopEvent();
				event.EVENT_ID = eventId;
				event.LEVELS = new ArrayList<Integer> ();
				event.REWARDS = new TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> ();
				event.BONUS = new TreeMap<Integer, TreeMap<Integer, HashMap<String, Integer>>> ();
				this.info.TOP_EVENTS.put("TOP_EVENT_" + eventId, event);
			}

			int groupLevel = parseSheet.getInt(r, "LEVEL");
			if (groupLevel < 1)
				groupLevel = Integer.MAX_VALUE;
			
			TreeMap<Integer, HashMap<String, Integer>> groupLevelRewards = new TreeMap<Integer, HashMap<String, Integer>> ();
			TreeMap<Integer, HashMap<String, Integer>> groupLevelBonus = new TreeMap<Integer, HashMap<String, Integer>> ();
			for (int i = 0; i < 10; i++)
			{
				String topId = "_" + (i < 10 ? "0" : "") + (i + 1);
				if (parseSheet.isEmptyCell(r, "TOP" + topId))
					break;
				
				int top = parseSheet.getInt(r, "TOP" + topId);
				HashMap<String, Integer> rewards = parseSheet.getMapItemNum (r, "REWARD" + topId);
				HashMap<String, Integer> bonus = parseSheet.getMapItemNum (r, "BONUS" + topId);

				groupLevelRewards.put (top, rewards);
				groupLevelBonus.put(top, bonus);
			}

			event.REWARDS.put(groupLevel, groupLevelRewards);
			event.BONUS.put(groupLevel, groupLevelBonus);
		}
		
		for (TopEvent event : this.info.TOP_EVENTS.values()) {
			for (Integer lv : event.REWARDS.keySet())
				event.LEVELS.add(lv);
		}
	}
}
