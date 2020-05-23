package exportexcel.sheet;

import data.UserLevelInfo;
import exportexcel.ExportExcel;
import exportexcel.Util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class FriendBug extends ParseWorkbook
{
    public FriendBug (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        if (!ExportExcel.isServer)
            return;

        ParseSheetRow ps = parseSheetRow("Friend Bug");
        UserLevelInfo info = UserLevel.levelInfo;

        int level;
        info.BUG_TIME_RANGE = new ArrayList<>();
        info.BUG_NUM = new int[UserLevel.maxLevel][2];
        info.BUG_PERCENT_FAKE = new int[UserLevel.maxLevel];
        info.BUG_APPEAR = new ArrayList<>();

        for (int row = 1; row <= UserLevel.maxLevel; row++)
        {
            level = row - 1;

            TreeMap<Integer,Integer> timeRange = new TreeMap<>();
            info.BUG_TIME_RANGE.add(timeRange);
            int rate = 0;
            for (int i = 1; i <= 5; i++)
            {
                timeRange.put(rate, ps.getInt(row, "TIME_RANGE_" + i));
                rate += ps.getInt(row, "PERCENT_RANGE_" + i);

                if (rate > 100)
                    throwRuntimeException(row, "Total PERCENT_RANGE > 100");
            }

            info.BUG_NUM[level][0] = ps.getInt(row, "BUG_NUM_MIN");
            if (info.BUG_NUM[level][0] < 0)
                throwRuntimeException(row, "BUG_NUM_MIN < 0");

            info.BUG_NUM[level][1] = ps.getInt(row, "BUG_NUM_MAX");
            if (info.BUG_NUM[level][0] > info.BUG_NUM[level][1])
                throwRuntimeException(row, "BUG_NUM_MIN > BUG_NUM_MAX");

            info.BUG_PERCENT_FAKE[level] = ps.getInt(row, "PERCENT_FAKE_BUG");
            if (info.BUG_PERCENT_FAKE[level] < 0 || info.BUG_PERCENT_FAKE[level] > 100)
                throwRuntimeException(row, "Invalid PERCENT_FAKE_BUG");

            TreeMap<Integer,String> appear = new TreeMap<>();
            info.BUG_APPEAR.add(appear);
            rate = 0;
            String data = "";
            for (int i = 1; i <= 3; i++)
                data += ps.getString(row, "PERCENT_APPEAR_BUG_" + i) + ":";
            HashMap<String, Integer> mapItemNum = Util.getMapItemNum(row, -1, data);
            for (Map.Entry<String, Integer> entry : mapItemNum.entrySet())
            {
                appear.put(rate, entry.getKey());
                rate += entry.getValue();

                if (rate > 100)
                    throwRuntimeException(row, "Total PERCENT_APPEAR_BUG_ > 100");
            }
        }
    }
}
