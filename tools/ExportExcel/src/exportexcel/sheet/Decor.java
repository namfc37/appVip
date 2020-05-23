package exportexcel.sheet;

import data.DecorInfo;
import exportexcel.Util;

import java.util.LinkedHashMap;

public class Decor extends ParseWorkbook
{
    public Decor (String inputName) throws Exception
    {
        super(inputName, "Decor_info");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Decor_info");

        LinkedHashMap<String, DecorInfo> decors = new LinkedHashMap<>();

        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            DecorInfo info = new DecorInfo();
            parseItemInfo(parseSheet, info, r);
            decors.put(info.ID, info);

            info.LEVEL_UNLOCK = parseSheet.getInt(r, "LEVEL_UNLOCK");
            info.USE_DURATION = Util.toPeriods(null, r, parseSheet.getString(r, "USE_DURATION"));

            info.APPRAISAL = parseSheet.getInt(r, "APPRAISAL");
            info.DECOR_LIBRARY_ORDER = parseSheet.getInt(r, "DECOR_LIBRARY_ORDER");

            info.GFX = parseSheet.getString(r, "GFX");
            info.SKIN = parseSheet.getString(r, "SKIN");

            info.EXP_INCREASE = parseSheet.getInt(r, "EXP_INCREASE");
            if (info.EXP_INCREASE < 0)
                throwRuntimeException("info.EXP_INCREASE (" + info.EXP_INCREASE + ") < 0");
            info.GOLD_INCREASE = parseSheet.getInt(r, "GOLD_INCREASE");
            if (info.GOLD_INCREASE < 0)
                throwRuntimeException("info.GOLD_INCREASE (" + info.GOLD_INCREASE + ") < 0");
            info.TIME_DECREASE_DEFAULT = parseSheet.getInt(r, "TIME_DECREASE_DEFAULT");
            if (info.TIME_DECREASE_DEFAULT < 0)
                throwRuntimeException("info.TIME_DECREASE_DEFAULT (" + info.TIME_DECREASE_DEFAULT + ") < 0");
            info.BUG_APPEAR_RATIO = parseSheet.getInt(r, "BUG_APPEAR_RATIO");
            if (info.BUG_APPEAR_RATIO < 0)
                throwRuntimeException("info.BUG_APPEAR_RATIO (" + info.BUG_APPEAR_RATIO + ") < 0");
        }
        addConstInfo(decors, decors);
    }
}