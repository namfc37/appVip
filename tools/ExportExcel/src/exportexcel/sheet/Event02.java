package exportexcel.sheet;

import data.*;
import data.IBShopInfo.Item;
import exportexcel.Log;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

public class Event02 extends ParseWorkbook
{
	public Event02Info info;

	public Event02(String inputName) throws Exception
	{
		super(inputName);
	}

	@Override
	public void handle ()
	{
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
		parseInfo ();
		parseFeatureDrop("Feature Drop");
		parsePlantDrop("Event Plant Drop");
		parseDropItem("Action Drop");
		parseRewards("Rewards");
		parseRewardsPack("Rewards Pack");

		addConstInfo(info, null);
	}
	
	private void parseInfo ()
	{
		this.info = 					new Event02Info();
		this.info.E02_TYPE =			Define.miscJson.get("EV02_TYPE").getAsString();
		this.info.E02_ID =				Define.miscJson.get("EV02_ID").getAsString();
		this.info.E02_POINT =			Define.miscJson.get("EV02_POINT").getAsString();
		this.info.E02_PLANT =			Define.miscJson.get("EV02_PLANT").getAsString();
		this.info.E02_DROPITEM =		Define.miscJson.get("EV02_DROP_ITEM").getAsString();
		this.info.E02_START_TIME =		Define.miscJson.get("EV02_TIME_START").getAsString();
		this.info.E02_END_TIME =		Define.miscJson.get("EV02_TIME_END").getAsString();

//		convert to itemId
		this.info.E02_ID =				Util.toItemId (this.info.E02_ID);
		this.info.E02_POINT =			Util.toItemId (this.info.E02_POINT);
		this.info.E02_PLANT =			Util.toItemId (this.info.E02_PLANT);
		this.info.E02_DROPITEM =		Util.toItemId (this.info.E02_DROPITEM);
		
//		override key
		Define.miscJson.addProperty("EV02_ID", this.info.E02_ID);
		Define.miscJson.addProperty("EV02_POINT", this.info.E02_POINT);
		Define.miscJson.addProperty("EV02_PLANT", this.info.E02_PLANT);
		Define.miscJson.addProperty("EV02_DROP_ITEM", this.info.E02_DROPITEM);
		
//		convert time
		this.info.E02_UNIX_START_TIME =	Util.toUnixTime(this.info.E02_START_TIME);
		this.info.E02_UNIX_END_TIME =	Util.toUnixTime(this.info.E02_END_TIME);
		EventInfo.setEventDuration(this.info.E02_ID, this.info.E02_UNIX_START_TIME, this.info.E02_UNIX_END_TIME);
		
		this.info.E02_PLANT_DROP_LIST = new PlantDropItemInfo ();
		this.info.E02_FEATURE_DROP_LIST = new FeatureDropItemInfo (this.info.E02_DROPITEM);
		this.info.E02_PUZZLE = new PuzzleInfo();
		this.info.E02_HARVEST_DROP_LIST = new HarvestDropItemInfo();
		
		this.info.E02_SHOP = new IBShopInfo();
		this.info.E02_SHOP.TAB = "event";
		this.info.E02_SHOP.NAME = "event";
		this.info.E02_SHOP.GFX = "";
		this.info.E02_SHOP.ITEMS = new ArrayList<Item> ();

		this.info.E02_REWARDS_PACK = new TreeMap<>();
		this.info.E02_REWARDS = new TreeMap<Integer, TreeMap<Integer, Event02Reward>> ();
	}

	private void parseFeatureDrop (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++)
		{
			Row row = parseSheet.sheet.getRow(r);
			if (row == null)
				break;
			
			String featureActionId = parseSheet.isEmptyCell(r, "ACTION") ? "" : parseSheet.getString(r, "ACTION");
			String option = parseSheet.isEmptyCell(r, "OPTION") ? "" : parseSheet.getString(r, "OPTION");
			float rate = parseSheet.isEmptyCell(r, "RATE") ? 1 : parseSheet.getFloat(r, "RATE");
			int quantity = parseSheet.isEmptyCell(r, "QUANTITY") ? -1 : parseSheet.getInt(r, "QUANTITY");
			int dailyLimit = parseSheet.isEmptyCell(r, "DAILY LIMIT") ? -1 : parseSheet.getInt(r, "DAILY LIMIT");
			
			if (featureActionId.isEmpty())
				continue;

			String temp = tryParseString (option);
			if (temp != null)
				option = temp;
			
			this.info.E02_FEATURE_DROP_LIST.add(featureActionId, option, rate, quantity, dailyLimit);
		}
	}

	private String tryParseString (String input)
	{
		if (input == "null" || input == null || input.isEmpty())
			return input;
		
        String itemId = ParseWorkbook.mapIdName.inverse().get(input.toLowerCase());
		if (itemId != null)
			return itemId;

		//String defineNum = Define.defineToString(input);
		String defineNum = ActionInfo.getActionStringValue(input);
		if (defineNum != null)
			return defineNum;
		
		return null;
	}

	private void parsePlantDrop (String idSheet)
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
			
			String item = parseSheet.getItemId(r, "ITEM");
			float rate = parseSheet.getFloat(r, "RATE");
			int min = parseSheet.getInt(r, "MIN");
			int max = parseSheet.getInt(r, "MAX");
			int userLimit = parseSheet.getInt(r, "USER LIMIT");
			int serverLimit = parseSheet.getInt(r, "SERVER LIMIT");
			boolean isVietNamOnly = parseSheet.getBoolean(r, "IS_VIETNAM_ONLY");
			this.info.E02_PLANT_DROP_LIST.add(item, rate, min, max, userLimit, serverLimit, isVietNamOnly);
		}
	}

	private void parseDropItem(String idSheet)
	{
		ParseSheetRow ps = parseSheetRow(idSheet);
		int numRow = ps.sheet.getLastRowNum()+1;
		String currentAction="";

		HashMap<String,Integer> dailyLimit = new HashMap<>();
	//	Log.debug("num row= ",numRow);
		for (int row=1; row< numRow; row++)
		{
			if (ps.isEmptyCell(row,"ACTION"))
			{
			//	Log.debug("cell empty");
				int timeRange = ps.getInt(row, "TIME_RANGE");
				String item = ps.getItemId(row, "ITEM");
				float rate = ps.getFloat(row,"RATE");
				int min = ps.getInt(row,"MIN");
				int max = ps.getInt(row,"MAX");
				int dailyLimitNum =  ps.getInt(row,"USER_DAILY_LIMIT");
				if (!dailyLimit.containsKey(item) && dailyLimitNum > 0 ) dailyLimit.put(item, dailyLimitNum);

				int userDailyLimit = dailyLimit.get(item) ;

				info.E02_HARVEST_DROP_LIST.addRule(currentAction,timeRange,item,rate,min,max,userDailyLimit);
			}
			else
			{
			//	Log.debug("cell: ",ps.getString(row, "ACTION"));
				currentAction = ps.getString(row, "ACTION");
				dailyLimit.clear();
			}
		}
	}

	private void parseRewards (String idSheet)
	{
		HashMap<Integer, Event02Reward> checkIds = new HashMap<Integer, Event02Reward> ();

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

			int id = parseSheet.getInt(r, "REWARD_ID");
			if (checkIds.containsKey(id))
			{
				throwRuntimeException(r, 0, "Double REWARD_ID: " + id);
				break;
			}

			int checkpoint = parseSheet.getInt(r, "EVENT POINTS");
			int groupLv = parseSheet.getInt(r, "GROUP_LV");
			if (groupLv < 0)
				groupLv = Integer.MAX_VALUE;

			int total = -1;

			if (!parseSheet.isEmptyCell(r, "REWARD_NUM"))
				total = parseSheet.getInt(r, "REWARD_NUM");

			Event02Reward reward = new Event02Reward (total);
			reward.id = id;

			for (int i = 0; i < 6; i++)
			{
				if (parseSheet.isEmptyCell(r, "REWARD_" + i))
					continue;

				HashMap<String, Integer> items = parseSheet.getMapItemNum(r, "REWARD_" + i);
				int rate = -1;

				if (!parseSheet.isEmptyCell(r, "RATE_" + i))
					rate = parseSheet.getInt(r, "RATE_" + i);

				reward.add (items, rate);
			}

			checkIds.put(id, reward);

			if (reward.check())
			{
				TreeMap<Integer, Event02Reward> checkpoint_rewards = this.info.E02_REWARDS.get(checkpoint);
				if (checkpoint_rewards == null)
				{
					checkpoint_rewards = new TreeMap<Integer, Event02Reward> ();
					this.info.E02_REWARDS.put(checkpoint, checkpoint_rewards);
				}

				checkpoint_rewards.put(groupLv, reward);
			}
			else
				throwRuntimeException(r, "checkpoint " + checkpoint + " parse fail");
		}
	}
	
	private void parseRewardsPack (String idSheet)
	{

		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++) {

			int group = parseSheet.getInt(r,"GROUP");

			Event02RewardPack reward= new Event02RewardPack();
			reward.REWARD_ID= parseSheet.getInt(r,"REWARD_ID");
			reward.GROUP_LV = parseSheet.getInt(r,"GROUP_LV");
			reward.GROUP = group;
			reward.REWARD_PACK = parseSheet.getMapItemNum(r,"REWARD_PACK");
			reward.REQUIRE_PACK = parseSheet.getMapItemNum(r,"REQUIRE_PACK");
			if (reward.GROUP_LV < 0)
				reward.GROUP_LV = Integer.MAX_VALUE;
			reward.BONUS = parseSheet.getMapItemNum(r,"BONUS");
			reward.EXCHANGE_LIMIT = parseSheet.getInt(r,"EXCHANGE_LIMIT");

			if (this.info.E02_REWARDS_PACK.get(group)== null)
				this.info.E02_REWARDS_PACK.put(group, new TreeMap<>());
			this.info.E02_REWARDS_PACK.get(group).put(reward.GROUP_LV, reward);

		}
	}

	private void parsePuzzle (String idSheet)
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

			String id = parseSheet.getString(r, "ID");
			HashMap<String, Integer> require = parseSheet.getMapItemNum(r, "REQUIRE");
			HashMap<String, Integer> rewards = parseSheet.getMapItemNum(r, "REWARDS");
			int displayOrder = parseSheet.getInt(r, "DISPLAY_ORDER");
			boolean isVietNamOnly = parseSheet.getBoolean(r, "IS_VIETNAM_ONLY");

			this.info.E02_PUZZLE.add(id, require, rewards, displayOrder, isVietNamOnly);
		}
	}
}