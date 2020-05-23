package exportexcel.sheet;

import data.GiftCodeInfo;
import exportexcel.ExportExcel;
import exportexcel.Util;

import java.util.HashMap;

public class GiftCode extends ParseWorkbook
{
    public static HashMap<String, GiftCodeInfo.Multiple> multiples = new HashMap<>();
    public static HashMap<String, GiftCodeInfo.Single>   singles   = new HashMap<>();

    public GiftCode (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        if (ExportExcel.isServer)
        {
            GiftCodeInfo info = new GiftCodeInfo();
            info.multiples = multiples;
            info.singles = singles;

            ParseSheetRow ps = parseSheetRow("Multiple");
            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                GiftCodeInfo.Multiple o = new GiftCodeInfo.Multiple();
                o.code = ps.getString(row, "CODE");

                o.duration = Util.toPeriods(ps.sheet.getSheetName(), row, ps.getString(row, "DURATION"));
                if (o.duration.length != 1)
                    throwRuntimeException("duration.length != 1");

                o.rewards = ps.getMapItemNum(row, "REWARD");
                if (o.rewards.isEmpty())
                    throwRuntimeException("rewards.size != 1");

                if (multiples.put(o.code, o) != null)
                    throwRuntimeException("Duplicate code: " + o.code);
                o.title = ps.getString(row, "MAIL_TITLE");
                o.content = ps.getString(row, "MAIL_CONTENT");
            }

            ps = parseSheetRow("Single");
            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                GiftCodeInfo.Single o = new GiftCodeInfo.Single();

                o.duration = Util.toPeriods(ps.sheet.getSheetName(), row, ps.getString(row, "DURATION"));
                if (o.duration.length != 1)
                    throwRuntimeException("duration.length != 1");

                o.rewards = ps.getMapItemNum(row, "REWARD");
                if (o.rewards.isEmpty())
                    throwRuntimeException("rewards.size != 1");

                o.limitPerUser = ps.getInt(row, "LIMIT PER USER");
                if (o.limitPerUser <= 0)
                    throwRuntimeException("limitPerUser <= 0");

                o.group = ps.getString(row, "GROUP");
                if (o.group.length() != 2)
                    throwRuntimeException("ID length != 2");
                o.group = o.group.toUpperCase();
                if (Integer.parseInt(o.group, 36) <= 0)
                    throwRuntimeException("Invalid group " + o.group);

                if (multiples.containsKey(o.group))
                    throwRuntimeException("Duplicate group and multiple key " + o.group);

                if (singles.put(o.group, o) != null)
                    throwRuntimeException("Duplicate group: " + o.group);
                o.title = ps.getString(row, "MAIL_TITLE");
                o.content = ps.getString(row, "MAIL_CONTENT");
            }

            addConstInfo(info, null);
        }
    }

}
