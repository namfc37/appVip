package exportexcel.sheet;

import data.ItemInfo;

import java.util.LinkedHashMap;

public class CommonItem extends ParseWorkbook
{
    public CommonItem (String inputName) throws Exception
    {
        super(inputName, "Sheet1");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        LinkedHashMap<String, ItemInfo> mapInfo = new LinkedHashMap<>();
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            ItemInfo info = new ItemInfo();
            parseItemInfo(parseSheet, info, r);

            if (info.ID.isEmpty())
                break;

            Integer stock = Stock.typeToStock.get(info.TYPE);
            info.STOCK = stock == null ? -1 : stock;
            mapInfo.put(info.ID, info);
        }

        addConstInfo(mapInfo, mapInfo);
    }
}
