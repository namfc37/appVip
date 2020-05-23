package exportexcel.sheet;

import data.AchievementInfo;
import data.ActionInfo;
import data.ComboInfo;
import exportexcel.Util;

import java.util.ArrayList;
import java.util.TreeMap;

public class Achievement extends ParseWorkbook
{
    public Achievement (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        AchievementInfo info = new AchievementInfo();

        ParseSheetRow ps = parseSheetRow("Achievement");
        info.tasks = new ArrayList<>();
        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            AchievementInfo.Task task = new AchievementInfo.Task();
            info.tasks.add(task);

            task.ID = row - 1;
            task.GROUP = ps.getInt(row, "GROUP");
            //task.ACTION = Define.defineToByte(ps.getString(row, "ACTION"));
            task.ACTION = ActionInfo.getActionIntValue(ps.getString(row, "ACTION"));
            String id = ps.getString(row, "TARGET_ID");
            if (id != null)
            {
                ComboInfo comboInfo = Combo.getByName(id);
                if (comboInfo != null)
                    task.TARGET_ID = comboInfo.ID;
                else
                    task.TARGET_ID = Util.toItemId(id);
            }

            final int MAX_START = 3;
            task.TARGETS = new AchievementInfo.Target[MAX_START];
            for (int i = 0; i < MAX_START; i++)
            {
                AchievementInfo.Target target = new AchievementInfo.Target();
                task.TARGETS[i] = target;

                int star = i + 1;
                target.POINT = ps.getInt(row, "TARGET_" + star);
                target.REWARDS = ps.getMapItemNum(row, "REWARD_" + star);
                target.TROPHY = ps.getInt(row, "TROPHY_" + star);
            }
        }

        ps = parseSheetRow("Trophy");
        info.trophyRewards = new TreeMap<>();
        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            int point = ps.getInt(row, "POINT");
            info.trophyRewards.put(point, ps.getMapItemNum(row, "REWARD"));
        }

        addConstInfo(info, null);
    }
}
