package exportexcel.sheet;

import data.IBShopInfo;
import exportexcel.Util;

import java.util.ArrayList;
import java.util.HashSet;

public class IBShop extends ParseWorkbook
{
    public IBShop (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow ps = parseSheetRow("INFO");
        ArrayList<IBShopInfo> tabs = new ArrayList<>();
        IBShopInfo tab;

        for (int r = 1, maxRow = ps.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            tab = new IBShopInfo();
            tabs.add(tab);

            tab.TAB = ps.getString(r, "TAB");
            tab.NAME = ps.getString(r, "NAME");
            tab.GFX = ps.getString(r, "GFX");
            tab.ITEMS = new ArrayList<>();

            parseTab(tab);
        }

        addConstInfo(tabs, null);
    }

    private HashSet<String> setId = new HashSet<>();

    private void parseTab (IBShopInfo tab)
    {
        ParseSheetRow ps = parseSheetRow(tab.TAB);

        for (int r = 1, maxRow = ps.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            IBShopInfo.Item item = new IBShopInfo.Item();

            String itemName = ps.getString(r, "ITEM_NAME");
            if (itemName == null || itemName.isEmpty())
                continue;

            tab.ITEMS.add(item);
            item.ITEM_NAME = Util.toItemId(itemName);
            item.ITEM_QUANTITY = ps.getInt(r, "ITEM_QUANTITY");
            item.UNLOCK_LEVEL = ps.getInt(r, "UNLOCK_LEVEL");
            item.SALE_OFF_PERCENT = ps.getInt(r, "SALE_OFF_PERCENT");
            item.IS_NEW = ps.getInt(r, "IS_NEW");
            item.LIMIT_DAY = ps.getInt(r, "LIMIT_DAY");

            item.PRICE_NUM = ps.getInt(r, "PRICE_NUM");
            if (item.PRICE_NUM <= 0)
                item.PRICE_TYPE = "";
            else
            {
                item.PRICE_TYPE = ps.getString(r, "PRICE_TYPE");
                if (item.PRICE_TYPE == null || item.PRICE_TYPE.isEmpty())
                    throwRuntimeException(r, -1, "Invalid price, sheet: " + ps.sheet.getSheetName() + ", PRICE_NUM: " + item.PRICE_NUM);
            }

            item.GIFT_WHEN_BUY = ps.getMapItemNum(r, "GIFT_WHEN_BUY");
            item.SALE_DURATION = Util.toPeriods(ps.sheet.getSheetName(), r, ps.getString(r, "SALE_DURATION"));
            
            item.USE_IN = ps.getString(r, "USE_IN");
            if (item.USE_IN != null && !item.USE_IN.isEmpty())
            	item.USE_IN = Util.toItemId(item.USE_IN);
            else
            	item.USE_IN = null;
            
            String checkId = item.ITEM_NAME + "_" + item.ITEM_QUANTITY + "_" + item.PRICE_TYPE;
            if (!setId.add(checkId))
                throwRuntimeException(r, -1, "Duplicate item, sheet: " + ps.sheet.getSheetName() + ", itemName: " + itemName + ", checkId: " + checkId);
        }
    }
}
