package exportexcel.sheet;

import com.google.gson.JsonArray;

public class DailyPaidOrder extends ParseWorkbook
{
    public DailyPaidOrder (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        ParseSheetRow parseSheet = parseSheetRow("19. Daily_paid_order");

        JsonArray o = Define.miscJson.getAsJsonArray("EXP_PER_DIAMOND");

        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            o.add(parseSheet.getInt(r, "EXP_PER_DIAMOND"));
        }
    }
}
