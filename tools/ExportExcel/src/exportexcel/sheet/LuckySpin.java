package exportexcel.sheet;

import data.LuckySpinInfo;
import exportexcel.Const;
import exportexcel.ExportExcel;

import java.util.TreeMap;

public class LuckySpin extends ParseWorkbook
{
    public LuckySpin (String inputName) throws Exception
    {
        super(inputName);
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        LuckySpinInfo info = new LuckySpinInfo();

        if (ExportExcel.isServer)
        {
            ParseSheetRow ps = parseSheetRow("Rate");
            
            final int numGroup = 3;
            final String[] idSpin = {"FREE_1", "PAID_1", "PAID_2", "PAID_3", "PAID_4","PAID_5","PAID_6","PAID_7", "FREE_2"};
            final int numSpin = idSpin.length;
            info.RATE_PLANT = new int[numGroup][numSpin];
            info.RATE_PRODUCT = new int[numGroup][numSpin];
            info.RATE_MATERIAL = new int[numGroup][numSpin];
            info.RATE_DECOR = new int[numGroup][numSpin];
            info.RATE_POT = new int[numGroup][numSpin];
            info.RATE_GOLD = new int[numGroup][numSpin];
            info.RATE_COIN = new int[numGroup][numSpin];
            info.RATE_X2 = new int[numGroup][numSpin];

            int[][] rate = null;

            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                String type = ps.getString(row, "TYPE");
                switch (type)
                {
                    case "PLANT":
                        rate = info.RATE_PLANT;
                        break;
                    case "PRODUCT":
                        rate = info.RATE_PRODUCT;
                        break;
                    case "MATERIAL":
                        rate = info.RATE_MATERIAL;
                        break;
                    case "DECOR":
                        rate = info.RATE_DECOR;
                        break;
                    case "POT":
                        rate = info.RATE_POT;
                        break;
                    case Const.ITEM_GOLD:
                        rate = info.RATE_GOLD;
                        break;
                    case Const.ITEM_COIN:
                        rate = info.RATE_COIN;
                        break;
                    case "X2":
                        rate = info.RATE_X2;
                        break;
                    default:
                        throwRuntimeException("Not support type: " + type);
                }

                int group = ps.getInt(row, "GROUP");
                for (int i = 0; i < numSpin; i++)
                    rate[group][i] = ps.getInt(row, idSpin[i]);
            }

            ps = parseSheetRow("Level");
            info.TREE_PLANT = new TreeMap<>();
            info.TREE_PRODUCT = new TreeMap<>();
            info.TREE_MATERIAL = new TreeMap<>();
            info.TREE_DECOR = new TreeMap<>();
            info.TREE_POT = new TreeMap<>();
            info.TREE_GOLD = new TreeMap<>();

            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                int level = ps.getInt(row, "LEVEL");
                info.TREE_PLANT.put(level, ps.toArrayItemId(row, "PLANT"));
                info.TREE_PRODUCT.put(level, ps.toArrayItemId(row, "PRODUCT"));
                info.TREE_MATERIAL.put(level, ps.toArrayItemId(row, "MATERIAL"));
                info.TREE_DECOR.put(level, ps.toArrayItemId(row, "DECOR"));
                info.TREE_POT.put(level, ps.toArrayItemId(row, "POT"));
                info.TREE_GOLD.put(level, ps.getInt(row, "GOLD"));
            }
        }

        addConstInfo(info, null);
    }
}
