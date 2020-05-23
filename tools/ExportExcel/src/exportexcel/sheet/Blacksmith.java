package exportexcel.sheet;

import java.util.ArrayList;
import java.util.HashMap;

import data.BlacksmithInfo;
import data.ComboInfo;
import exportexcel.Const;
import exportexcel.Util;

public class Blacksmith extends ParseWorkbook
{
	public BlacksmithInfo info;
	
	public Blacksmith (String inputName) throws Exception
	{
		super(inputName);
		this.info = new BlacksmithInfo();
	}

	@Override
	public void handle () throws Exception
	{
		Define.parseMiscInfo(parseSheetRow("MiscInfo"));
		
		parseRecipe(parseSheetRow("BLACKSMITH_POT"));
		parseMaterialPot(parseSheetRow("MATERIAL_POT_RATE"));
		parseVioletGrass(parseSheetRow("VIOLET_GRASS_RATE"));
		parseGloves(parseSheetRow("GLOVES_RATE"));

		addConstInfo(this.info, null);
	}
	
	private void parseRecipe (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			BlacksmithInfo.Recipe info = new BlacksmithInfo.Recipe();
			if (ps.isEmptyCell(row, "SPECIAL_SET"))
				break;
			
			info.SPECIAL_SET = ps.getInt(row, "SPECIAL_SET");
			info.POT = ps.getItemId(row, "POT");

			HashMap<String, Integer> GEM = ps.getMapItemNum(row, "GEM_COMBINE");
			HashMap<String, Integer> INGOT = ps.getMapItemNum(row, "MATERIAL_INGOT_COMBINE");
			int GOLD = ps.getInt(row, "GOLD_COMBINE");
			
			info.MATERIALS.put(Util.toItemId(Const.ITEM_GOLD), GOLD);
			info.MATERIALS.putAll(GEM);
			info.MATERIALS.putAll(INGOT);
			
			String[] as = ps.getString(row, "SET_POT_COMBINE").split(":");
			if (as.length < 2)
			{
				throwRuntimeException(row, "pot set format must be POT_SET_NAME:RATE");
			   	return;
			}
			
			for (int i = 0; i < as.length; i += 2)
			{
				String key = as[i];
				ComboInfo comboInfo = Combo.getByName(key);
				if (comboInfo == null)
				{
					throwRuntimeException(row, "combo: \"" + key + "\" not exists!");
					return;
				}
				
				int value = Integer.parseInt(as[i + 1]);
				info.SET_POT_COMBINE.put(comboInfo.ID, value);
			}
			
			this.info.RECIPES.put(info.POT, info);

			if (!this.info.SPECIAL_SETS.containsKey(info.SPECIAL_SET))
				this.info.SPECIAL_SETS.put(info.SPECIAL_SET, new ArrayList<String>());

			this.info.SPECIAL_SETS.get(info.SPECIAL_SET).add(info.POT);
		}
	}
	
	private void parseMaterialPot (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		int numberSet = 2;
		
		for (int row = 1; row < maxRow; row++)
		{
			String materialPot = ps.getItemId(row, "POT");
			
			ArrayList<Integer> rates = new ArrayList<Integer> ();
			for (int i = 0; i < numberSet; i++)
			{
				int rate = ps.getInt(row, "SPECIAL_SET_RATE_" + i);
				rates.add(rate);
			}
			
			this.info.MATERIAL_POT_RATE.put (materialPot, rates);
		}
	}
	
	private void parseVioletGrass (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			String name = ps.getItemId(row, "ITEM");
			int rate = ps.getInt(row, "RATE");
			
			this.info.BONUS_RATE_VIOLET_GRASS.put (name, rate);
		}
	}
	
	private void parseGloves (ParseSheetRow ps)
	{
		int maxRow = ps.sheet.getLastRowNum() + 1;
		for (int row = 1; row < maxRow; row++)
		{
			String name = ps.getItemId(row, "ITEM");
			int rate = ps.getInt(row, "RATE");
			
			this.info.GLOVES_RATE.put (name, rate);
		}
	}
}