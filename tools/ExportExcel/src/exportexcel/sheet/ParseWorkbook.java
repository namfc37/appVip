package exportexcel.sheet;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import data.ItemInfo;
import exportexcel.Const;
import exportexcel.ExportExcel;
import exportexcel.Log;
import exportexcel.Util;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public abstract class ParseWorkbook
{
    public static final BiMap<String, String> mapIdName   = HashBiMap.create(); //itemId,name
    public static final Map<String, ItemInfo> mapItemInfo = new LinkedHashMap<>();
    public static final Map<Object, String>   mapExport   = new LinkedHashMap<>();

    public static final HashSet<String> setOutputId   = new HashSet<>();
    public static final HashSet<String> setOutputName = new HashSet<>();

    public static boolean       isFirstFile = false;
    public static StringBuilder defineMap;

    protected Workbook         workbook;
    protected FormulaEvaluator evaluator;

    protected String outputId;
    protected String outputName;

    public ParseWorkbook (String inputName, String... sheetParseItemId) throws Exception
    {
        int startPos = inputName.indexOf(' ');
        int endPos = inputName.indexOf(".xls");
        String id = inputName.substring(startPos, endPos).trim().replaceAll(" ", "_").replaceAll("'", "").toUpperCase();

        init(inputName, id, id, sheetParseItemId);
    }

    private void init (String inputName, String outputId, String outputName, String... sheetParseItemId) throws Exception
    {
        Log.debug("ParseWorkbook", inputName, outputId, outputName);

        if (!setOutputId.add(outputId))
            throw new RuntimeException("DUPLICATE OUTPUT ID: " + outputId);
        this.outputId = outputId;

        if (!setOutputName.add(outputName))
            throw new RuntimeException("DUPLICATE OUTPUT NAME: " + outputName);
        this.outputName = outputName.toLowerCase();

        if (inputName.endsWith(".xlsx"))
            workbook = new XSSFWorkbook(Files.newInputStream(Paths.get(ExportExcel.inputData + "\\" + inputName)));
        else
            workbook = new HSSFWorkbook(Files.newInputStream(Paths.get(ExportExcel.inputData + "\\" + inputName)));

        evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        buildMapId(sheetParseItemId);
    }

    protected ParseSheetRow parseSheetRow (String name)
    {
        return new ParseSheetRow(evaluator, workbook.getSheet(name));
    }

    protected ParseSheetCol parseSheetCol (String name)
    {
        return new ParseSheetCol(evaluator, workbook.getSheet(name));
    }

    public void handle () throws Exception
    {
    }

    public static void throwRuntimeException (Sheet sheet, Row row, Cell cell, String msg)
    {
        throwRuntimeException(sheet.getSheetName(),
                              row == null ? -1 : row.getRowNum(),
                              cell == null ? -1 : cell.getColumnIndex(),
                              msg);
    }

    public static void throwRuntimeException (String msg)
    {
        throwRuntimeException("", -1, -1, msg);
    }

    public static void throwRuntimeException (int idRow, String msg)
    {
        throwRuntimeException("", idRow, -1, msg);
    }

    public static void throwRuntimeException (int idRow, int idCol, String msg)
    {
        throwRuntimeException("", idRow, idCol, msg);
    }

    public static void throwRuntimeException (String sheetName, int idRow, int idCol, String msg)
    {
        StringBuilder info = new StringBuilder()
                .append('[').append(sheetName).append("] (")
                .append(idRow).append(',')
                .append(idCol)
                .append(") ").append(msg);

        throw new RuntimeException(info.toString());
    }

    public void buildMapId (String... sheetParseItemId)
    {
        for (String idSheet : sheetParseItemId)
        {
            ParseSheet ps = parseSheetRow(idSheet);
            Sheet sheet = ps.getSheet();
            int colId = ps.getIdCol(Const.COL_ID);
            int colName = ps.getIdCol(Const.COL_NAME);

            Row row;
            Cell cell;
            for (int r = 1, maxRow = sheet.getLastRowNum(); r <= maxRow; r++)
            {
                row = sheet.getRow(r);
                if (row == null)
                    continue;

                cell = row.getCell(colId);
                if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                    continue;
                if (cell.getCellTypeEnum() != CellType.STRING)
                    break;
                String itemId = cell.getStringCellValue().trim();
                if (itemId.isEmpty())
                    throwRuntimeException(sheet, row, cell, "ItemId: EMPTY");
                if (mapIdName.containsKey(itemId))
                    throwRuntimeException(sheet, row, cell, "ItemId: DUPLICATE " + itemId);

                cell = row.getCell(colName);
                if (cell == null || cell.getCellTypeEnum() == CellType.BLANK)
                    throwRuntimeException(sheet, row, cell, "Name: BLANK");
                if (cell.getCellTypeEnum() != CellType.STRING)
                    throwRuntimeException(sheet, row, cell, "Name: WRONG TYPE");

                String name = cell.getStringCellValue().trim().toLowerCase();
                if (name.isEmpty())
                    throwRuntimeException(sheet, row, cell, "Name: EMPTY");
                if (mapIdName.containsValue(name))
                    throwRuntimeException(sheet, row, cell, "Name: DUPLICATE " + name);

                mapIdName.put(itemId, name);
            }
        }
    }

    static final HashSet<Integer> uidSet = new HashSet<>();


    public void parseItemInfo (ParseSheetRow ps, ItemInfo info, int idRow)
    {
        info.ID = ps.getString(idRow, Const.COL_ID);
        if (info.ID == null)
            return;
        info.ID = info.ID.trim();
        if (info.ID.isEmpty())
        {
            info.ID = null;
            return;
        }

        //WARNING: DO NOT EDIT UID
        if (info.ID.length() > 5)
            throwRuntimeException("Invalid item id len: " + info.ID);
        if (!info.ID.matches("^[A-Z][A-Z0-9]+$"))
            throwRuntimeException("Invalid item id format: " + info.ID);
        info.UID = Integer.parseInt(info.ID, 36);
        if (!uidSet.add(info.UID))
            throwRuntimeException("Duplicate uid: " + info.UID);

        info.NAME = ps.getString(idRow, Const.COL_NAME).trim();


        if (ps.containsName(Const.COL_GOLD_DEFAULT))
        {
            info.GOLD_DEFAULT = ps.getInt(idRow, Const.COL_GOLD_DEFAULT);
            if (info.GOLD_DEFAULT > 0)
            {
                info.GOLD_MIN = ps.getInt(idRow, Const.COL_GOLD_MIN);
                info.GOLD_MAX = ps.getInt(idRow, Const.COL_GOLD_MAX);

                if (ps.containsName(Const.COL_SELL_FEE))
                    info.SELL_FEE = Math.max(0, ps.getInt(idRow, Const.COL_SELL_FEE));

                if (info.GOLD_MIN <= 0)
                    throwRuntimeException("[" + info.ID + " info.GOLD_MIN <= 0");
                if (info.GOLD_MIN > info.GOLD_MAX)
                    throwRuntimeException("[" + info.ID + " GOLD_MIN > GOLD_MAX");
                if (info.GOLD_DEFAULT < info.GOLD_MIN)
                    throwRuntimeException("[" + info.ID + " info.GOLD_DEFAULT < info.GOLD_MIN");
                if (info.GOLD_DEFAULT > info.GOLD_MAX)
                    throwRuntimeException("[" + info.ID + " info.GOLD_DEFAULT > info.GOLD_MAX");
            }
            else
            {
                info.GOLD_DEFAULT = 0;
            }
        }

        if (ps.containsName(Const.COL_GOLD_JACK))
            info.GOLD_JACK = ps.getInt(idRow, Const.COL_GOLD_JACK);
        else
            info.GOLD_JACK = -1;

        if (info.GOLD_JACK == 0 && info.GOLD_DEFAULT <= 0)
            throwRuntimeException("[" + info.ID + " GOLD_JACK > 0 && GOLD_DEFAULT <= 0");

        if (ps.containsName(Const.COL_TYPE))
        {
            info.TYPE = toIntType(ps.getString(idRow, Const.COL_TYPE));

            Integer stock = Stock.typeToStock.get(info.TYPE);
            if (stock != null)
                info.STOCK = stock;
        }
    }

    public void addConstInfo (Object obj, Map<String, ? extends ItemInfo> mapInfo)
    {
        if (mapInfo != null)
        {
            for (ItemInfo info : mapInfo.values())
                if (info.NAME == null)
                    throwRuntimeException("Null item");
        }

        if (mapInfo != null)
            mapItemInfo.putAll(mapInfo);

        mapExport.put(obj, outputName);
    }

    public static void exportAllConstInfo ()
    {
        for (Map.Entry<Object, String> e : mapExport.entrySet())
            exportConstInfo(e.getKey(), e.getValue());
    }

    public static void exportConstInfo (Object obj, String outputName)
    {
        try
        {
            String filename = outputName + ".json";
            byte[] data = null;

            if (ExportExcel.isServer)
            {
                data = Util.toJsonPretty(obj).getBytes(StandardCharsets.UTF_8);
            }
            else
            {
                if (outputName.equals("user_level"))
                {
                    data = ((obj instanceof JsonElement) ? obj.toString() : Util.toJson(obj)).getBytes(StandardCharsets.UTF_8);
                    ExportHelper(obj, outputName);
                }
                else
                {
                    filename = outputName + ".js";
                    data = toJavascriptSeparate(outputName.toUpperCase(), obj).getBytes(StandardCharsets.UTF_8);
                }
            }
            if (data != null)
                Files.write(Paths.get(ExportExcel.outputData + "\\" + filename), data);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public static void ExportHelper (Object obj, String outputName)
    {
        JsonElement jsonElement = Util.toJsonTree(obj);
        String helperFileName = outputName + ".js";
        String jsonFileName = outputName + ".json";

        StringBuilder helperScript = new StringBuilder();
        if (!isFirstFile)
        {
            helperScript.append("var ").append("jsonConstPath").append(" = \"").append("res").append("\";\n");//helperScript.append("var ").append("jsonConstPath").append(" = \"").append("src/constants").append("\";\n");
            isFirstFile = false;
        }

        helperScript.append("var ").append("json_").append(outputName).append(" = {").append("};\n");
        helperScript.append("cc.loader.loadJson(jsonConstPath + \"/").append(jsonFileName).append("\", function(error, data) {\n");
        helperScript.append("   ").append("json_").append(outputName).append(" = data;\n");
        helperScript.append("});\n");

        if (jsonElement.isJsonObject())
        {
            JsonObject o = jsonElement.getAsJsonObject();
            for (Map.Entry<String, JsonElement> entry : o.entrySet())
            {
                String key = entry.getKey();
                helperScript.append("json_")
                            .append(outputName)
                            .append(".")
                            .append(key)
                            .append(" = ")
                            .append("json_")
                            .append(outputName)
                            .append("[\"")
                            .append(key)
                            .append("\"];\n");
            }
        }

        byte[] strBuilderData = helperScript.toString().getBytes(StandardCharsets.UTF_8);
        try
        {
            Files.write(Paths.get(ExportExcel.outputData + "\\" + helperFileName), strBuilderData);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public String toJavascript (String name, Object obj)
    {
        StringBuilder sb = new StringBuilder();
        sb.append("var g_").append(name).append(" = ");
        toJavascript(Util.toJsonTree(obj), sb);
        sb.append(";");
        return sb.toString();
    }

    public static String toJavascriptSeparate (String name, Object obj)
    {
        StringBuilder sb = new StringBuilder();
        if (defineMap == null)
        {
            defineMap = new StringBuilder();
            defineMap.append("var defineMap = {};\n");
        }
        JsonElement e = (obj instanceof JsonElement) ? (JsonElement) obj : Util.toJsonTree(obj);

        if (e.isJsonArray())
        {
            JsonArray a = e.getAsJsonArray();
            sb.append("var g_").append(name).append(" = [];\n");
            for (int i = 0, size = a.size(); i < size; i++)
            {
                sb.append("g_").append(name).append("[").append(i).append("]").append(" = ");
                toJavascript(a.get(i), sb);
                sb.append(";\n");
            }
        }
        else if (e.isJsonObject())
        {
            JsonObject o = e.getAsJsonObject();
            sb.append("var g_").append(name).append(" = {};\n");

            for (Map.Entry<String, JsonElement> entry : o.entrySet())
            {
                defineMap.append("defineMap.").append(entry.getKey()).append(" = g_").append(name).append(".").append(entry.getKey()).append(";\n");
                sb.append("g_").append(name).append(".").append(entry.getKey()).append(" = ");
                toJavascript(entry.getValue(), sb);
                sb.append(";\n");
            }
        }
        else
        {
            sb.append("var g_").append(name).append(" = ");
            toJavascript(e, sb);
            sb.append(";");
        }

        return sb.toString();
    }

    public static void toJavascript (JsonElement e, StringBuilder sb)
    {
        if (e.isJsonObject())
        {
            JsonObject o = e.getAsJsonObject();

            o.remove("NAME");

            sb.append('{');
            int size = o.size();
            int current = 0;
            for (Map.Entry<String, JsonElement> entry : o.entrySet())
            {
                sb.append(entry.getKey()).append(':');
                toJavascript(entry.getValue(), sb);
                current++;
                if (current < size)
                    sb.append(',');
            }
            sb.append('}');
        }

        if (e.isJsonPrimitive())
        {
            JsonPrimitive in = e.getAsJsonPrimitive();
            if (in.isString())
                sb.append("'").append(in.getAsString()).append("'");
            else
                sb.append(in.getAsString());
        }

        if (e.isJsonArray())
        {
            sb.append('[');
            JsonArray a = e.getAsJsonArray();
            for (int i = 0, size = a.size(); i < size; i++)
            {
                toJavascript(a.get(i), sb);
                if (i < size - 1)
                    sb.append(',');
            }
            sb.append(']');
        }
    }

    public HashSet<Integer> toSetType (String data)
    {
        String[] types = data.split(":");
        HashSet<Integer> set = new HashSet<>();
        for (String type : types)
            set.add(toIntType(type));
        return set;
    }

    public int[] getArrayInt (String data)
    {
        return getArrayIntDelimiter(data, ":");
    }

    public int[] convertArrayInt (ArrayList<Integer> integers)
    {
        int[] ret = new int[integers.size()];
        Iterator<Integer> iterator = integers.iterator();
        for (int i = 0; i < ret.length; i++)
        {
            ret[i] = iterator.next();
        }
        return ret;
    }

    public String[] convertArrayString (ArrayList<String> strings)
    {
        String[] ret = new String[strings.size()];
        Iterator<String> iterator = strings.iterator();
        for (int i = 0; i < ret.length; i++)
        {
            ret[i] = iterator.next();
        }
        return ret;
    }

    public int[] convertValuePercent (HashMap<String, Integer> mapData)
    {
        int[] r = convertValueInts(mapData);
        int sum = sumArrayInt(r);
        for (int i = 0; i < r.length; i++)
            r[i] = Math.round((float) r[i] * 100 / sum);

        return r;
    }

    public int[] convertValueInts (HashMap<String, Integer> mapData)
    {
        int[] ret = new int[mapData.size()];
        int arrayIdx = 0;
        for (Map.Entry<String, Integer> entry : mapData.entrySet())
        {
            ret[arrayIdx] = entry.getValue();
            arrayIdx++;
        }
        return ret;
    }

    public String[] convertKeyStrings (HashMap<String, Integer> mapData)
    {
        String[] ret = new String[mapData.size()];
        int arrayIdx = 0;
        for (Map.Entry<String, Integer> entry : mapData.entrySet())
        {
            ret[arrayIdx] = entry.getKey();
            arrayIdx++;
        }
        return ret;
    }

    public int[] getArrayIntDelimiter (String data, String delim)
    {
        String[] as = data.split(delim);
        int[] list = new int[as.length];
        for (int i = 0; i < as.length; i++)
        {
            list[i] = Integer.parseInt(as[i]);
        }
        return list;
    }

    public int toIntType (String type)
    {
        return Define.toTypeInt(type);
    }

    public static void addItem (Map<String, Integer> mapItem, String itemId, int num)
    {
        if (num <= 0)
            return;
        if (mapItem.containsKey(itemId))
            mapItem.put(itemId, num + mapItem.get(itemId));
        else
            mapItem.put(itemId, num);
    }

    public int sumArrayInt (int[] a)
    {
        int sum = 0;
        for (int i : a)
            sum += i;
        return sum;
    }

    public String idToName (String id)
    {
        return ParseWorkbook.mapIdName.get(id);
    }
}

