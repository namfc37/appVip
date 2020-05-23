package exportexcel.sheet;

import data.MineInfo;
import exportexcel.ExportExcel;

public class Mine extends ParseWorkbook
{
	public MineInfo info;
	
	public Mine (String inputName) throws Exception
	{
		super(inputName);
		this.info = new MineInfo();
	}

	@Override
	public void handle () throws Exception
	{
		Define.parseMiscInfo(parseSheetRow("MiscInfo"));
		
		parseRequireItems(parseSheetRow("Require"));
		parseProductItems(parseSheetRow("Product"));

		if (ExportExcel.isServer)
			addConstInfo(this.info, null);
	}
	
	private void parseRequireItems (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			if (ps.isEmptyCell(row, "USER_LEVEL"))
				continue;
			
			MineInfo.MineRequireInfo mineInfo = new MineInfo.MineRequireInfo();
			mineInfo.USER_LEVEL = ps.getInt(row, "USER_LEVEL");
			mineInfo.MIN_ITEM_TYPE = ps.getInt(row, "MIN_ITEM_TYPE");
			mineInfo.MAX_ITEM_TYPE = ps.getInt(row, "MAX_ITEM_TYPE");
			mineInfo.MIN_NUM_REQUIRE_ITEM_EASY = ps.getInt(row, "MIN_NUM_REQUIRE_ITEM_EASY");
			mineInfo.MAX_NUM_REQUIRE_ITEM_EASY = ps.getInt(row, "MAX_NUM_REQUIRE_ITEM_EASY");
			mineInfo.MIN_NUM_REQUIRE_ITEM_MEDIUM = ps.getInt(row, "MIN_NUM_REQUIRE_ITEM_MEDIUM");
			mineInfo.MAX_NUM_REQUIRE_ITEM_MEDIUM = ps.getInt(row, "MAX_NUM_REQUIRE_ITEM_MEDIUM");
			mineInfo.MIN_NUM_REQUIRE_ITEM_HARD = ps.getInt(row, "MIN_NUM_REQUIRE_ITEM_HARD");
			mineInfo.MAX_NUM_REQUIRE_ITEM_HARD = ps.getInt(row, "MAX_NUM_REQUIRE_ITEM_HARD");

			mineInfo.EASY_REQUIRE = ps.getMapItemNum(row, "EASY_REQUEST");
			mineInfo.MEDIUM_REQUIRE = ps.getMapItemNum(row, "MEDIUM_REQUEST");
			mineInfo.HARD_REQUIRE = ps.getMapItemNum(row, "HARD_REQUEST");
			
			this.info.REQUIRE_ITEMS.put(mineInfo.USER_LEVEL, mineInfo);
		}
	}
	
	private void parseProductItems (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			if (ps.isEmptyCell(row, "ITEM_NAME"))
				continue;
			
			MineInfo.MineProductInfo info = new MineInfo.MineProductInfo();
			info.ITEM_NAME = ps.getItemId(row, "ITEM_NAME");
			info.RATE = ps.getInt(row, "RATE");
			
//			min require is 1, so remove index zero
			info.NUMBER_TYPES_TO_REWARDS.add (-1);
			for (int i = 1; i < 7; i++)
				info.NUMBER_TYPES_TO_REWARDS.add(ps.getInt(row, "REQUIRE_" + i));
			
			this.info.PRODUCT_ITEMS.put(info.ITEM_NAME, info);
		}
	}
}
