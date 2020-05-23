package exportexcel.sheet;

import java.util.HashMap;
import java.util.TreeMap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.FlippingCardsInfo;
import exportexcel.Util;

public class FlippingCards extends ParseWorkbook
{
	public FlippingCardsInfo info;
	
	public FlippingCards (String inputName) throws Exception
	{
		super(inputName);
	}

	@Override
	public void handle ()
	{	
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
		info = new FlippingCardsInfo();
		info.CHECKPOINTS = new TreeMap<Integer, HashMap<String, Integer>> ();
		info.TIME_RATIO = new TreeMap<Integer, Float> ();
		info.TICKET_ID = Define.miscJson.get("FLIPPINGCARDS_TICKET").getAsString();
		info.ITEM1_ID = Define.miscJson.get("FLIPPINGCARDS_BOARD_ITEM1_ID").getAsString();
		info.ITEM2_ID = Define.miscJson.get("FLIPPINGCARDS_BOARD_ITEM2_ID").getAsString();
		info.ITEM3_ID = Define.miscJson.get("FLIPPINGCARDS_BOARD_ITEM3_ID").getAsString();
		
//		convert to itemId
		info.TICKET_ID =	Util.toItemId (info.TICKET_ID);
		info.ITEM1_ID =		Util.toItemId (info.ITEM1_ID);
		info.ITEM2_ID =		Util.toItemId (info.ITEM2_ID);
		info.ITEM3_ID =		Util.toItemId (info.ITEM3_ID);

//		override key
		Define.miscJson.addProperty("FLIPPINGCARDS_TICKET", info.TICKET_ID);
		Define.miscJson.addProperty("FLIPPINGCARDS_BOARD_ITEM1_ID", info.ITEM1_ID);
		Define.miscJson.addProperty("FLIPPINGCARDS_BOARD_ITEM2_ID", info.ITEM2_ID);
		Define.miscJson.addProperty("FLIPPINGCARDS_BOARD_ITEM3_ID", info.ITEM3_ID);
		
		parseTimeRatio ("Time_Ratio");
		parseRewards ("Rewards");
		addConstInfo(info, null);
	}

	private void parseTimeRatio (String idSheet)
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
			
			int playtime = parseSheet.getInt(r, "PLAY_TIME");
			float ratio = parseSheet.getFloat(r, "RATIO");

			info.TIME_RATIO.put(playtime, ratio);
		}
	}

	private void parseRewards (String idSheet)
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
			
			int checkpoint = parseSheet.getInt(r, "VICTORY_POINTS");
			HashMap<String, Integer> rewards = parseSheet.getMapItemNum (r, "REWARDS");

			info.CHECKPOINTS.put(checkpoint, rewards);
		}
	}
}
