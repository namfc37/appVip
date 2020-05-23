package exportexcel.sheet;

import data.ItemInfo;
import data.TomInfo;
import exportexcel.ExportExcel;

import java.util.ArrayList;
import java.util.List;

public class HireTom extends ParseWorkbook
{
    public HireTom (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        ParseSheetRow defaultSheet = parseSheetRow("MiscInfo");
        Define.parseMiscInfo(defaultSheet);

        List<String> tomItems = new ArrayList<>();

        ParseSheetRow ps = parseSheetRow("Item_Value");
        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            String name = ps.getString(row, "ITEM_NAME");
            if (name == null)
                continue;
            ItemInfo itemInfo = ps.nameToItemInfo(name);
            if (itemInfo == null)
                throwRuntimeException(row, -1, "Null ItemInfo: " + name);
            tomItems.add(itemInfo.ID);
            TomInfo tom = new TomInfo();
            if (ExportExcel.isServer)
                itemInfo.TOM = tom;

            tom.GOLD_BASIC = ps.getFloat(row, "TOMKID_GOLD_BASIC");
            tom.packs = new ArrayList<>();

            TomInfo.PackInfo pack;
            for (int i = 1; i <= 3; i++)
            {
                pack = new TomInfo.PackInfo();
                tom.packs.add(pack);
                pack.MIN_NUM = ps.getInt(row, "TOMKID_MIN_NUM_PACK_" + i);
                pack.MAX_NUM = ps.getInt(row, "TOMKID_MAX_NUM_PACK_" + i);
                pack.MIN_GOLD_RATIO = ps.getInt(row, "TOMKID_MIN_GOLD_RATIO_PACK_" + i);
                pack.MAX_GOLD_RATIO = ps.getInt(row, "TOMKID_MAX_GOLD_RATIO_PACK_" + i);
            }
        }
        Define.addMiscInfoString("TOM_ITEMS", tomItems, null);
    }
}
