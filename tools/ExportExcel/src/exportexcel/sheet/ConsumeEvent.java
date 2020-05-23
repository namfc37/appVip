package exportexcel.sheet;


import com.google.gson.JsonStreamParser;
import data.ChestInfo;
import data.ConsumeEventInfo;
import exportexcel.ExportExcel;
import exportexcel.Log;
import exportexcel.Util;
import jdk.nashorn.internal.runtime.Debug;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.util.*;

public class ConsumeEvent extends ParseWorkbook {

    ConsumeEventInfo consumeEventInfo = new ConsumeEventInfo();

    public ConsumeEvent(String inputName) throws Exception {
        super(inputName);
    }

    @Override
    public void handle() throws Exception {
        Define.parseMiscInfo(parseSheetRow("MiscInfo"));
        parseType(parseSheetRow("Type"));
        if (ExportExcel.isServer) {
            parseReward(parseSheetRow("Rewards"));
            parseRate(parseSheetRow("Rate"));
        }
        addConstInfo(consumeEventInfo, null);
    }

    private void parseType(ParseSheetRow ps)
    {
        int maxRow = ps.sheet.getLastRowNum() + 1;

        for (int row = 1; row < maxRow; row++) {
            ConsumeEventInfo.ConsumeEventTypeInfo consumeEventTypeInfo = new ConsumeEventInfo.ConsumeEventTypeInfo();
            String key = Util.toItemId(ps.getString(row,"TYPE"));
           // consumeEventTypeInfo.NAME = ps.getString(row,"TYPE");
            consumeEventTypeInfo.CONSUME_CONVERT = ps.getInt(row, "CONSUME_CONVERT");
            consumeEventTypeInfo.POINT_CONVERT = ps.getInt(row,"POINT_CONVERT");

            consumeEventInfo.types.put(key ,consumeEventTypeInfo);
        }
    }

    private void parseReward(ParseSheetRow ps) {
        int numColumn = ps.sheet.getRow(0).getLastCellNum();
        // Log.debug("numcolumn :"+numColumn);

        /*
        for (int i = 1; i < numColumn; i++) {
            Cell cell = ps.sheet.getRow(0).getCell(i);
            consumeEventInfo.types.put(cell.toString(), new ConsumeEventInfo.ConsumeEventTypeInfo());
        }
    */
        int maxRow = ps.sheet.getLastRowNum() + 1;
       // Log.debug("numRow= "+maxRow);
        for (int row = 1; row < maxRow; row++) {

            for (String key : consumeEventInfo.types.keySet()) {
                int g = ps.getInt(row, "GROUP");
                String raw = ps.getString(row, key);
                if (raw == null)
                    continue;
                HashMap<String,Integer> reward = ps.getMapItemNum(row,key);

              //  Log.debug(ps.getMapItemNum(row,key));
                consumeEventInfo.types.get(key).GROUPS.computeIfAbsent(g, keyy -> new ArrayList<HashMap<String, Integer>>()).add(reward);
               // Log.debug("size= "+consumeEventInfo.types.get(key).GROUPS.get(g));
            }
        }
    }

    private void parseRate(ParseSheetRow ps) {
        Sheet sheet = ps.sheet;
        String id = null;
        ConsumeEventInfo.ConsumeEventTypeInfo info = null;

        int lastRowNum = 0;

        for (int r = 0, maxRow = sheet.getLastRowNum(); r <= maxRow; r++) {
            Row row = sheet.getRow(r);
            Cell cell = row.getCell(0);

            if (consumeEventInfo.types.containsKey(cell.getStringCellValue())) {
                id = cell.getStringCellValue();
                info = consumeEventInfo.types.get(id);
                lastRowNum = r;

                for (int j = 0; j < row.getLastCellNum() / 2; j++)
                    info.RATES.put(ps.getInt(r, 1 + j * 2), new ConsumeEventInfo.Rate());

              //  Log.debug("id", id, "row", r);
                continue;
            }

            for (int t = 0; ; t++) {
                int group = ps.getInt(r, 1 + t * 2);
                if (!info.GROUPS.containsKey(group))
                    break;
                int rate = ps.getInt(r, 2 + t * 2);
                if (rate < 0)
                    throwRuntimeException("Invalid rate " + rate);

                ConsumeEventInfo.Rate table = info.RATES.get(ps.getInt(lastRowNum, 1 + t * 2));
                table.group.add(group);
                table.rate.add(rate);
            }
        }

        for (ConsumeEventInfo.ConsumeEventTypeInfo c : consumeEventInfo.types.values()) {
            /*
            for (List<ConsumeEventInfo.Item> items : c.GROUPS.values()) {
                if (items.isEmpty())
                    throwRuntimeException("Contains empty group in ");
            }*/
            c.RATES.remove(c.RATES.size() - 1);
            for (Integer key : c.RATES.keySet()) {
                if (c.RATES.get(key).group.size() != c.RATES.get(key).rate.size())
                    throwRuntimeException("Invalid num slot ");
            }
        }
    }

}
