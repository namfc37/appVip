package exportexcel.sheet;

import data.ChestInfo;
import exportexcel.ExportExcel;
import exportexcel.Util;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.util.*;

public class Chest extends ParseWorkbook
{
    public Chest (String inputName) throws Exception
    {
        super(inputName, "ItemInfo");
    }

    @Override
    public void handle () throws Exception
    {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));

        ParseSheetRow ps = parseSheetRow("ItemInfo");
        Map<String, ChestInfo> map = new LinkedHashMap<>();

        for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
        {
            ChestInfo info = new ChestInfo();
            parseItemInfo(ps, info, row);
            if (info.ID == null)
                continue;
            map.put(info.ID, info);

            if (ExportExcel.isServer)
            {
                info.TIME_WAIT = Math.max(0, ps.getInt(row, "TIME_WAIT"));
                info.PRICE_TYPE = ps.getItemId(row, "PRICE_TYPE");
                if (info.PRICE_TYPE == null)
                {
                    if (info.TIME_WAIT < 300)
                        throwRuntimeException("Unlimited item: " + info.ID);
                }
                else
                {
                    info.PRICE_TURN = ps.getArrayInt(row, "PRICE_TURN");
                }
                info.DURATION = Util.toPeriods(ps.sheet.getSheetName(), row, ps.getString(row, "DURATION"));
                info.GROUPS = new TreeMap<>();
                info.RATES = new ArrayList<>();
            }
            else
            {
                info.DISPLAY_ORDER = ps.getInt(row, "DISPLAY_ORDER");
            }
        }

        if (ExportExcel.isServer)
        {
            ps = parseSheetRow("Rewards");
            for (int row = 1, maxRow = ps.sheet.getLastRowNum(); row <= maxRow; row++)
            {
                int g = ps.getInt(row, "GROUP");
                for (ChestInfo info : map.values())
                {
                    String raw = ps.getString(row, info.ID);
                    if (raw == null)
                        continue;
                    String[] data = raw.split(":");
                    String itemId = Util.toItemId(data[0]);
                    int num = Integer.parseInt(data[1]);
                    info.GROUPS.computeIfAbsent(g, key -> new ArrayList<>()).add(new ChestInfo.Item(itemId, num));
                }
            }

            ps = parseSheetRow("Rate");
            Sheet sheet = ps.sheet;
            String id = null;
            ChestInfo info = null;
            for (int r = 0, maxRow = sheet.getLastRowNum(); r <= maxRow; r++)
            {
                Row row = sheet.getRow(r);
                Cell cell = row.getCell(0);
                if (map.containsKey(cell.getStringCellValue()))
                {
                    id = cell.getStringCellValue();
                    info = map.get(id);
                    //Log.debug("id", id, "row", r);
                    continue;
                }

                for (int t = 0; ; t++)
                {
                    if (info.RATES.size() == t)
                        info.RATES.add(new ChestInfo.Rate());
                    int group = ps.getInt(r, 1 + t * 2);
                    if (!info.GROUPS.containsKey(group))
                        break;
                    int rate = ps.getInt(r, 2 + t * 2);
                    if (rate < 0)
                        throwRuntimeException("Invalid rate " + rate);
                    ChestInfo.Rate table = info.RATES.get(t);
                    table.group.add(group);
                    table.rate.add(rate);
                }
            }

            for (ChestInfo c : map.values())
            {
                for (List<ChestInfo.Item> items : c.GROUPS.values())
                {
                    if (items.isEmpty())
                        throwRuntimeException("Contains empty group in " + c.ID);
                }
                c.RATES.remove(c.RATES.size() - 1);
                for (ChestInfo.Rate r : c.RATES)
                {
                    if (r.group.size() != r.rate.size())
                        throwRuntimeException("Invalid num slot " + c.ID);
                }
            }
        }

        addConstInfo(map, map);
    }
}
