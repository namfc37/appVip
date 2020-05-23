package exportexcel.sheet;

import data.FloorInfo;
import exportexcel.Const;

import java.util.ArrayList;

public class Floor extends ParseWorkbook
{
    public static ArrayList<FloorInfo> listInfo = new ArrayList<>();

    public Floor (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Sheet1");

        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            FloorInfo info = new FloorInfo();

            info.ID = parseSheet.getInt(r, "ID");
            if (info.ID != r - 1)
                throwRuntimeException(r, -1, "Level not match " + info.ID + " != " + r);

            Integer iValue = UserLevel.GetFloorLevelUnlock(info.ID);
            if (iValue == null)
            {
                info.USER_LEVEL = parseSheet.getInt(r, "USER_LEVEL");
            }
            else
            {
                info.USER_LEVEL = iValue;
            }

            info.REQUIRE_ITEM = parseSheet.getMapItemNum(r, "REQUIRE_ITEM");

            int num = parseSheet.getInt(r, Const.ITEM_GOLD);
            if (num > 0)
                addItem(info.REQUIRE_ITEM, Const.ITEM_GOLD, num);

            num = parseSheet.getInt(r, "REPUTATION");
            if (num > 0)
                addItem(info.REQUIRE_ITEM, Const.ITEM_REPUTATION, num);

            info.APPRAISAL = parseSheet.getInt(r, "APPRAISAL");

            listInfo.add(info);
        }

        addConstInfo(listInfo, null);
    }
}