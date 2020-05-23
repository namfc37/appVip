package exportexcel.sheet;

import java.util.ArrayList;
import java.util.TreeMap;

import data.ActionInfo;
import org.apache.poi.ss.usermodel.*;

import data.QuestMissionInfo;
import data.QuestMissionInfo.Group;
import data.QuestMissionInfo.Mission;
import exportexcel.Log;

public class QuestMission extends ParseWorkbook
{
	public QuestMissionInfo info = new QuestMissionInfo();
	
	public QuestMission(String inputName) throws Exception
	{
		super(inputName);
	}

    @Override
    public void handle () throws Exception
    {
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
    	parseGroup("Group");
    	parseMission("Mission");
        
        addConstInfo(info, null);
    }

    private void parseGroup (String idSheet)
	{
    	this.info.GROUPS = new TreeMap<Integer, Group>();
    	
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
			
			Group group = new Group();
			group.MISSIONS = new ArrayList<Integer>();
			group.ID = parseSheet.getInt(r, "ID");
			group.LEVEL = parseSheet.getInt(r, "LEVEL_MIN");
			group.REWARDS = parseSheet.getMapItemNum(r, "REWARDS");
			group.TITLE = parseSheet.getString(r, "TITLE");
			group.DESC = parseSheet.getString(r, "DESC");
			
			this.info.GROUPS.put (group.ID, group);
        }
    }

    private void parseMission (String idSheet)
	{
    	this.info.MISSIONS = new TreeMap<Integer, Mission>();
    	
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
			
			String temp = parseSheet.getString(r, "ACTIONS");
			int action = -1;
			try
			{
				//action = Define.defineToByte(temp);
				action = ActionInfo.getActionIntValue(temp);
			}
			catch (Exception e)
			{
				Log.debug("QuestMission cannot found define of " + temp);
				continue;
			}

			temp = parseSheet.getString(r, "TARGET");
			Object target = null;
			try
			{
				if (temp == null || temp == "")
					target = null;
				else if (temp.matches("^(\\+|-)?\\d+$"))
					target = temp;
				else
					target = ParseWorkbook.mapIdName.inverse().get(temp.toLowerCase());
			}
			catch (Exception e)
			{
				throwRuntimeException("QuestMission cannot found target " + temp);
			}
			
			int groupId = parseSheet.getInt(r, "GROUP");
			if (!this.info.GROUPS.containsKey(groupId))
				throwRuntimeException("QuestMission Miss Define Group " + groupId);
			
			
			Mission mission = new Mission ();
			mission.ID = parseSheet.getInt(r, "ID");
			mission.GROUP = groupId;
			mission.ACTION_ID = action;
			mission.TARGET = target;
			mission.REQUIRE = parseSheet.getInt(r, "REQUIRE");
//			mission.HINT = parseSheet.getString(r, "HINT");

			this.info.MISSIONS.put(mission.ID, mission);

			Group group = this.info.GROUPS.get(groupId);
			group.MISSIONS.add(mission.ID);
        }	
    }
}
