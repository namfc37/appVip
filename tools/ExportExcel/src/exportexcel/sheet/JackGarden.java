package exportexcel.sheet;

import data.JackGardenInfo;
import exportexcel.ExportExcel;

import java.util.TreeMap;

public class JackGarden extends ParseWorkbook
{
    public static JackGardenInfo info = new JackGardenInfo();

    public JackGarden (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        int level, numSlot;
        ParseSheetRow ps;

        if (ExportExcel.isServer)
        {
            ps = parseSheetRow("Private Shop");
            info.SHOPS = new TreeMap<>();
            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                level = ps.getInt(row, "LEVEL");
                JackGardenInfo.Shop shop = new JackGardenInfo.Shop();
                info.SHOPS.put(level, shop);

                numSlot = ps.getInt(row, "PS_SLOT");
                shop.PLANT_SLOT = ps.getInt(row, "PLANT_SLOT");
                shop.BUG_SLOT = numSlot - shop.PLANT_SLOT;

                shop.QUANTITY = ps.getInt(row, "QUANTITY");
                if (shop.QUANTITY <= 0)
                    throwRuntimeException("Invalid QUANTITY " + shop.QUANTITY);
            }
        }

        ps = parseSheetRow("Machine");
        info.MACHINES = new TreeMap<>();
        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            level = ps.getInt(row, "LEVEL");
            JackGardenInfo.Machine machine = new JackGardenInfo.Machine();
            info.MACHINES.put(level, machine);

            machine.DURABILITY_MIN = ps.getInt(row, "DURABILITY_MIN");
            if (machine.DURABILITY_MIN < 0)
                throwRuntimeException("Invalid DURABILITY_MIN " + machine.DURABILITY_MIN);
            machine.DURABILITY_MAX = ps.getInt(row, "DURABILITY_MAX");
            if (machine.DURABILITY_MAX < machine.DURABILITY_MIN)
                throwRuntimeException("Invalid DURABILITY_MAX " + machine.DURABILITY_MAX);
        }

        addConstInfo(info, null);
    }
}
