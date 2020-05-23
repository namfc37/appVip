package exportexcel.sheet;

import java.util.*;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;

import data.PaymentAccumulateInfo;
import data.PaymentAccumulateInfo.Reward;
import exportexcel.Util;
import data.PaymentAccumulateInfo.OpenTime;
import data.PaymentAccumulateInfo.Package;

public class PaymentAccumulate extends ParseWorkbook
{
	public PaymentAccumulateInfo info = new PaymentAccumulateInfo ();
	
    public PaymentAccumulate (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("Misc Info"));
        info.TOKEN_ID = Define.miscJson.get("ACCUMULATE_TOKEN_ID").getAsString();
        info.UNIX_TIME_START = Util.toUnixTime(Define.miscJson.get("ACCUMULATE_TIME_START").getAsString());
        info.UNIX_TIME_END = Util.toUnixTime(Define.miscJson.get("ACCUMULATE_TIME_END").getAsString());
        
        parseMilestones ("Milestones");
        parseShop ("Shop");
        
		addConstInfo(info, null);
    }

	private void parseMilestones (String idSheet)
	{
		HashMap<Integer, Boolean> checkIds = new HashMap<Integer, Boolean> ();
		info.MILESTONES = new HashMap<Integer, NavigableMap<Integer, Reward>> ();
		
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
			else
				checkIds.put(id, true);
			
			int checkpoint = parseSheet.getInt(r, "COINS");
			int groupLv = parseSheet.getInt(r, "GROUP_LV");
			if (groupLv < 0)
				groupLv = Integer.MAX_VALUE;

			Reward reward = new Reward ();
			reward.ID = id;
			reward.ITEMS = new HashMap<String, Integer> ();
			
			for (int i = 0; i < 6; i++)
			{
				if (parseSheet.isEmptyCell(r, "REWARD_" + i))
					continue;
				
				HashMap<String, Integer> items = parseSheet.getMapItemNum(r, "REWARD_" + i);
				reward.ITEMS.putAll(items);
			}
			
			if (!info.MILESTONES.containsKey(checkpoint))
				info.MILESTONES.put (checkpoint, new TreeMap<Integer, Reward>());
			
			info.MILESTONES.get(checkpoint).put(groupLv, reward);
		}
	}

	private void parseShop (String idSheet)
	{
		info.SHOP = new HashMap<String, Package> ();
		
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

			String id = parseSheet.getString(r, "REWARD_ID");
			if (info.SHOP.containsKey(id))
			{
				throwRuntimeException(r, 0, "Double REWARD_ID: " + id);
				break;
			}
			
			int lvMin = parseSheet.getInt(r, "LV_MIN");
			int lvMax = parseSheet.getInt(r, "LV_MAX");
			if (lvMax < 0)
				lvMax = Integer.MAX_VALUE;
			
			Package pack = new Package ();
			pack.ID = id;
			pack.PRICE = parseSheet.getInt(r, "TOKENS");
			pack.LEVELS = new int [] {lvMin, lvMax};
			pack.ITEM = parseSheet.getItemId(r, "ITEM");
			pack.NUM = parseSheet.getInt(r, "NUM");
			pack.BONUS = parseSheet.getMapItemNum(r, "BONUS");
			pack.LIMIT = parseSheet.getInt(r, "SERVER_LIMIT");
			pack.LIMIT_PER_DAY = parseSheet.getInt(r, "DAILY_LIMIT");
			pack.LIMIT_PER_USER = parseSheet.getInt(r, "USER_LIMIT");
			pack.OPEN_TIMES = new ArrayList<OpenTime> ();
			pack.TITLE = parseSheet.getString(r, "TITLE");
			pack.DESC = parseSheet.getString(r, "DESC");
			pack.IS_VIETNAM_ONLY = parseSheet.getBoolean(r, "IS_VIETNAM_ONLY");
			
			String times_str = parseSheet.getString(r, "DAILY_OPEN");
			if (times_str != null && !times_str.isEmpty())
			{
				String[] times = times_str.split(",");
				for (String time : times)
				{
					String[] param = time.split(":");
					int hour = Integer.valueOf(param [0]);
					int minute = Integer.valueOf(param [1]);
					
					pack.OPEN_TIMES.add(new OpenTime(hour, minute));
				}
			}
			
			if (pack.LIMIT_PER_DAY > 0 && pack.OPEN_TIMES.size() == 0)
                throwRuntimeException("Invaild Open Time at " + pack.ID);
			
			info.SHOP.put (pack.ID, pack);
		}
	}
}