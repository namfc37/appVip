package exportexcel.sheet;

import data.ActionInfo;
import data.BlacksmithInfo;
import data.ComboInfo;
import exportexcel.Const;
import exportexcel.Util;

import java.util.ArrayList;
import java.util.HashMap;

public class Action extends ParseWorkbook
{

	public Action(String inputName) throws Exception
	{
		super(inputName);
	}

	@Override
	public void handle () throws Exception
	{
		parseAction(parseSheetRow("Actions"));

		addConstInfo(ActionInfo.actions, null);
	}

	
	private void parseAction (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			ActionInfo.Action action = new ActionInfo.Action();
			action.NAME = ps.getString(row, "ACTION_NAME");
			action.VALUE = ps.getInt(row, "VALUE");
			action.GFX = ps.getString(row, "GFX");
			action.SCALE = ps.getFloat(row, "SCALE");

			action.DESC = ps.getString(row, "DESC");
			action.HINT = ps.getString(row, "HINT");
			ActionInfo.actions.put(action.NAME, action);
		}
	}
}