package exportexcel.sheet;

import data.SkinInfo;
import exportexcel.Log;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Row;

import java.util.LinkedHashMap;

public class Skin extends ParseWorkbook
{
    public Skin (String inputName) throws Exception
    {
        super(inputName, "Skin");
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("Skin");

        LinkedHashMap<String, SkinInfo> skins = new LinkedHashMap<>();

        for (int row = 1, maxRow = parseSheet.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            Row oRow = parseSheet.sheet.getRow(row);
            if (oRow == null)
                continue;

            SkinInfo info = new SkinInfo();
            parseItemInfo(parseSheet, info, row);
            if (info.ID == null)
                continue;

            skins.put(info.ID, info);
            info.SUB_TYPE = Define.toSubTypeInt(parseSheet.getString(row, "SUB_TYPE"));
            info.GFX = parseSheet.getString(row, "GFX");

            info.EFFECT_DURATION = parseSheet.getInt(row, "DURATION");
            info.APPRAISAL = parseSheet.getInt(row, "APPRAISAL");
            info.DISPLAY = parseSheet.getString(row, "DISPLAY");
        }

        addConstInfo(skins, skins);
    }
}