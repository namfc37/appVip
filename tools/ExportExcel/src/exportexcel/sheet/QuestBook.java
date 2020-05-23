package exportexcel.sheet;

import java.util.ArrayList;

import data.ActionInfo;
import data.QuestBookInfo;
import data.QuestBookInfo.*;

public class QuestBook extends ParseWorkbook
{
	public static QuestBookInfo info = new QuestBookInfo();
	
	public QuestBook(String inputName) throws Exception
	{
		super(inputName);
	}

    @Override
    public void handle () throws Exception
    {
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
    	parseActions("Action");
    	parseTargets("Target");
    	parseLevelRatio("Level Ratio");
    	parseRewards("Daily Reward");
        
        addConstInfo(info, null);
    }

    private void parseActions (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++)
		{
			QuestAction action = new QuestAction();
			action.ACTION = parseSheet.getString(r, "ACTION");
			
			try
			{
				//action.ACTION_ID = Define.defineToByte(action.ACTION);
				action.ACTION_ID  = ActionInfo.getActionIntValue(action.ACTION);
			}
			catch (Exception e)
			{
				throwRuntimeException("QuestBook cannot found define of " + action.ACTION);
			}
			
			action.MIN = parseSheet.getInt(r, "MIN");
			action.MAX = parseSheet.getInt(r, "MAX");
			action.RATE = parseSheet.getInt(r, "RATE");
			action.RATIO = parseSheet.getFloat(r, "TYPE_RATIO");
			action.QUEST_ITEMS = new ArrayList<>();
			
			info.QUESTS.put (action.ACTION, action);
        }
    }

    private void parseTargets (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++)
		{
			String temp = parseSheet.getString(r, "ACTIONS");
			String[] actions = temp.split(",");
			for (int i = 0; i < actions.length; i++)
			{
				QuestAction action = info.QUESTS.get (actions [i]);
				if (action == null)
					continue;
				
				QuestItem item = new QuestItem ();
				item.TARGET = parseSheet.getString(r, "TARGET");
				if (item.TARGET != null && !item.TARGET.isEmpty())
				{
			        String itemId = ParseWorkbook.mapIdName.inverse().get(item.TARGET.toLowerCase());
			        if (itemId != null);
			        	item.TARGET = itemId;
				}
				
				item.LEVEL = parseSheet.getInt(r, "LEVEL_UNLOCK");
				item.RATE = parseSheet.getInt(r, "RATE");
				item.REQUIRE_MIN = parseSheet.getInt(r, "REQ_NUM_MIN");
				item.REQUIRE_MAX = parseSheet.getInt(r, "REQ_NUM_MAX");
				item.SKIP_PRICE_TYPE = parseSheet.getItemId(r, "SKIP_TYPE");
				item.SKIP_PRICE_NUM = parseSheet.getInt(r, "SKIP_PRICE");
				item.REWARD = parseSheet.getMapItemNum(r, "REWARDS");
				
				action.QUEST_ITEMS.add(item);
			}
        }	
    }

    private void parseLevelRatio (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++)
		{
			if (parseSheet.isEmptyCell(r, "GROUP_LEVEL"))
				continue;
			
			int level = parseSheet.getInt(r, "GROUP_LEVEL");
			if (level < 1)
				level = Integer.MAX_VALUE;
			
			LevelRatio ratio = new LevelRatio ();
			ratio.EXP = parseSheet.getFloat(r, "EXP_RATIO");
			ratio.GOLD = parseSheet.getFloat(r, "GOLD_RATIO");
			
			info.LEVEL_RATIO.put(level, ratio);
        }
    }
    
    private void parseRewards (String idSheet)
	{
		ParseSheetRow parseSheet = parseSheetRow(idSheet);
		int maxRow = parseSheet.sheet.getLastRowNum();
		for (int r = 1; r <= maxRow; r++)
		{
			SpecialReward specialReward = new SpecialReward();
			specialReward.RATE = parseSheet.getInt(r, "RATE");
			specialReward.REWARD = parseSheet.getMapItemNum(r, "REWARDS");
			
			info.SPECIAL_REWARDS.add(specialReward);
        }
    }
}
