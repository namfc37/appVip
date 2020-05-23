package exportexcel.sheet;

import java.util.LinkedHashMap;

public class ItemDropRate extends ParseWorkbook
{
    public ItemDropRate (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle ()
    {
        LinkedHashMap<String, float[][]> map = new LinkedHashMap<>();
        map.put("PLANT", parse("Plant_Collect", "RATE_A", "RATE_B", "RATE_C"));
        map.put("PRODUCT", parse("Product_Collect", "RATE_A", "RATE_B", "RATE_C"));
        map.put("MACHINE", parse("Friend_Machine_Repair", "RATE_A", "RATE_B"));

        addConstInfo(map, null);

    }

    private float[][] parse (String name, String... cols)
    {
        ParseSheetRow parseSheet = parseSheetRow(name);

        float[][] data = new float[UserLevel.maxLevel][cols.length];

        int level;
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            level = r - 1;

            for (int c = 0; c < cols.length; c++)
                data[level][c] = parseSheet.getFloat(r, cols[c]);
        }

        return data;
    }
}
