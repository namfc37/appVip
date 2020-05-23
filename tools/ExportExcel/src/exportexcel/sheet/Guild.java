package exportexcel.sheet;

import java.util.HashMap;
import java.util.TreeMap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.GuildInfo;
import data.GuildInfo.Avatar;
import data.GuildInfo.Donate;
import data.GuildInfo.Emoji;
import data.GuildInfo.Level;

public class Guild extends ParseWorkbook
{
	private GuildInfo info;
	
	public Guild(String inputName) throws Exception
	{
		super(inputName);
	}

    @Override
    public void handle () throws Exception
    {
		Define.parseMiscInfo(parseSheetRow("Misc Info"));
		
		this.info = new GuildInfo();
		this.info.LEVELS = new TreeMap<Integer, Level> ();
		this.info.DONATE_ITEMS = new HashMap<String, Donate> ();
		this.info.AVATAR = new HashMap<Integer, Avatar> ();
		this.info.EMOJI = new HashMap<Integer, Emoji> ();

		parseLevel ("Level");
		parseDonateItems ("Donate_Items");
		parseAvatar ("Avatar");
		parseEmoji ("Emoji");
        
        addConstInfo(info, null);
    }
    
    private void parseLevel (String idSheet)
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
			
			Level level = new Level ();
			level.ID = parseSheet.getInt(r, "LEVEL"); 
			level.MEMBERS = parseSheet.getInt(r, "MEMBER");
			level.DEPUTY = parseSheet.getInt(r, "DEPUTY");
			
			this.info.LEVELS.put (level.ID, level);
        }
    }
    
    private void parseDonateItems (String idSheet)
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
			
			Donate donateInfo = new Donate ();
			donateInfo.ITEM_ID = parseSheet.getItemId(r, "ITEM_NAME");
			donateInfo.QUANTITY = parseSheet.getInt(r, "QUANTITY");
			donateInfo.DONATE_LIMIT = parseSheet.getInt(r, "DONATE_LIMIT");	

			this.info.DONATE_ITEMS.put (donateInfo.ITEM_ID, donateInfo);
        }
    }
    
    private void parseAvatar (String idSheet)
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
			
			Avatar avatar = new Avatar ();
			avatar.ID = parseSheet.getInt(r, "ID");
			avatar.FILE = parseSheet.getString(r, "FILE");
			avatar.PRICE = parseSheet.getInt(r, "PRICE");	

			this.info.AVATAR.put (avatar.ID, avatar);
        }
    }
    
    private void parseEmoji (String idSheet)
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

			Emoji emoji = new Emoji ();
			emoji.ID = parseSheet.getInt(r, "ID");
			emoji.FILE = parseSheet.getString(r, "FILE");

			this.info.EMOJI.put (emoji.ID, emoji);
        }
    }
}
