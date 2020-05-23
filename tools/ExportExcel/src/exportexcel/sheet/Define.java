package exportexcel.sheet;

import com.google.common.collect.HashBiMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import exportexcel.Util;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Define extends ParseWorkbook
{
    public enum Type {
        STRING("String"),
        BOOLEAN("boolean"),
        BYTE("byte"),
        SHORT("short"),
        INT("int"),
        LONG("long"),
        FLOAT("float"),
        DOUBLE("double"),
        SET_STRING("Set<String>"),
        INTS("int[]"),
        MAP_ITEM("MapItem"),
        DURATIONS("int[][]"),
        ITEM("String"),
        MAP_RATE("TreeMap<Integer,String>"),
        DATETIME("int"),
        ;

        private final String object;

        Type (String object)
        {
            this.object = object;
        }

        public String getObject ()
        {
            return object;
        }
    }

    public static Type toType (String type)
    {
        return Type.valueOf(type.toUpperCase());
    }

    public static JsonObject        miscJson   = new JsonObject();
    public static Map<String, Info> miscInfo   = new LinkedHashMap<>();
    public static Map<String, Info> miscDefine = new LinkedHashMap<>();
    public static Map<String, Info> cmdDefine  = new LinkedHashMap<>();
    public static Map<String, Info> keyDefine  = new LinkedHashMap<>();

    public static HashBiMap<String, Integer> mapType    = HashBiMap.create();
    public static HashBiMap<String, Integer> mapSubType = HashBiMap.create();

    public static int toTypeInt (String define)
    {
        Integer type = mapType.get(define);
        if (type == null)
            throwRuntimeException("Unknown type: " + define);
        return type;
    }

    public static int toSubTypeInt (String define)
    {
        if (define == null || define.isEmpty())
            return 0;        
        return mapSubType.get(define);
    }

    public Define (String inputName) throws Exception
    {
        super(inputName);
    }

    public static class Info
    {
        public String key;
        public String type;
        public String value;
        public String note;

        public Info (String key, String type, String value, String note)
        {
            this.key = key;
            this.type = type;
            this.value = value;
            if (note != null)
                this.note = note.replaceAll("\n", " .");
        }
    }

    @Override
    public void handle () throws Exception
    {
        ParseSheetRow parseSheet = parseSheetRow("Type");
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            String define = parseSheet.getString(r, "DEFINE");
            if (define == null || define.isEmpty())
                continue;
            int value = parseSheet.getInt(r, "VALUE");

            mapType.put(define, value);
        }

        parseSheet = parseSheetRow("SubType");
        for (int r = 1, maxRow = parseSheet.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            String define = parseSheet.getString(r, "DEFINE");
            int value = parseSheet.getInt(r, "VALUE");

            mapSubType.put(define, value);
        }

        parseMiscDefine(parseSheetRow("MiscDefine"));
        parseMiscDefine(parseSheetRow("Country"));
        parseMiscInfo(parseSheetRow("CmdDefine"), cmdDefine, null);
        parseMiscInfo(parseSheetRow("KeyDefine"), keyDefine, null);

        outputName = "MiscInfo";
        parseMiscInfo(parseSheetRow("MiscInfo"));
        addConstInfo(miscJson, null);
    }

    public static void parseMiscInfo (ParseSheetRow ps)
    {
        parseMiscInfo(ps, miscInfo, miscJson);
    }

    public static void parseMiscDefine (ParseSheetRow ps)
    {
        parseMiscInfo(ps, miscDefine, null);
    }

    public static void parseMiscInfo (ParseSheetRow ps, Map<String, Info> mapInfo, JsonObject jsonObject)
    {
        for (int r = 1, maxRow = ps.sheet.getLastRowNum(); r <= maxRow; r++)
        {
            String key = ps.getString(r, "DEFINE");
            if (key == null || key.isEmpty())
                continue;
            String type = ps.getString(r, "TYPE");
            if (type == null || type.isEmpty())
                continue;
            String value = null;
            String comment = ps.getString(r, "NOTE");

            switch (toType(type))
            {
                case STRING:
                    value = ps.getString(r, "VALUE");
                    if (jsonObject != null)
                        jsonObject.addProperty(key, value);
                    break;
                case ITEM:
                    value = ps.getItemId(r, "VALUE");
                    if (jsonObject != null)
                        jsonObject.addProperty(key, value);
                    break;
                case BOOLEAN:
                    boolean boolValue = ps.getBoolean(r, "VALUE");
                    value = Boolean.toString(boolValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, boolValue);
                    break;
                case BYTE:
                    byte byteValue = ps.getByte(r, "VALUE");
                    value = Byte.toString(byteValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, byteValue);
                    break;
                case SHORT:
                    short shortValue = ps.getShort(r, "VALUE");
                    value = Short.toString(shortValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, shortValue);
                    break;
                case INT:
                    int intValue = ps.getInt(r, "VALUE");
                    value = Integer.toString(intValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, intValue);
                    break;
                case LONG:
                    long longValue = ps.getLong(r, "VALUE");
                    value = Long.toString(longValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, longValue);
                    break;
                case FLOAT:
                    float floatValue = ps.getFloat(r, "VALUE");
                    value = Float.toString(floatValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, floatValue);
                    break;
                case DOUBLE:
                    double doubleValue = ps.getDouble(r, "VALUE");
                    value = Double.toString(doubleValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, doubleValue);
                    break;
                case SET_STRING:
                    value = ps.getString(r, "VALUE");
                    JsonArray strings = new JsonArray();
                    if (value != null)
                    {
                        for (String v : value.split(","))
                            strings.add(v.trim());
                    }
                    if (jsonObject != null)
                        jsonObject.add(key, strings);
                    value = Util.toJson(strings);
                    break;
                case INTS:
                    value = ps.getString(r, "VALUE");
                    JsonArray ints = new JsonArray();
                    if (value != null)
                    {
                        for (String v : value.split(","))
                            ints.add(Integer.parseInt(v.trim()));
                    }
                    if (jsonObject != null)
                        jsonObject.add(key, ints);
                    value = Util.toJson(ints);
                    break;
                case MAP_ITEM:
                    value = ps.getString(r, "VALUE");
                    JsonObject oValue = new JsonObject();
                    if (value != null)
                    {
                        String itemId;
                        int num;
                        String[] as = value.split(":");
                        for (int i = 0; i < as.length; i += 2)
                        {
                            itemId = Util.toItemId(as[i]);
                            num = Integer.parseInt(as[i + 1]);
                            if (num > 0)
                                oValue.addProperty(itemId, num);
                        }
                    }
                    if (jsonObject != null)
                        jsonObject.add(key, oValue);
                    value = Util.toJson(oValue);
                    break;
                case MAP_RATE:
                    value = ps.getString(r, "VALUE");
                    JsonObject rValue = new JsonObject();
                    if (value != null)
                    {
                        String id;
                        int totalRate = 0;
                        int rate;
                        String[] as = value.split(":");
                        for (int i = 0; i < as.length; i += 2)
                        {
                            id = as[i];
                            rate = Integer.parseInt(as[i + 1]);
                            if (rate > 0)
                            {
                                rValue.addProperty(Integer.toString(totalRate), id);
                                totalRate += rate;
                            }
                        }
                        if (totalRate != 100)
                            throwRuntimeException(r, -1, key + " has totalRate != 100");
                    }
                    if (jsonObject != null)
                        jsonObject.add(key, rValue);
                    value = Util.toJson(rValue);
                    break;
                case DURATIONS:
                    value = ps.getString(r, "VALUE");
                    JsonArray periods = new JsonArray();
                    if (value != null)
                    {
                        int[][] aai = Util.toPeriods(ps.sheet.getSheetName(), -1, value);
                        for (int[] ai : aai)
                        {
                            JsonArray a = new JsonArray();
                            for (int i : ai)
                                a.add(i);
                            periods.add(a);
                        }
                    }
                    if (jsonObject != null)
                        jsonObject.add(key, periods);
                    value = Util.toJson(periods);
                    break;
                case DATETIME:
                    int intDateValue =  Util.toUnixTime( ps.getString(r, "VALUE"));
                    value = Integer.toString(intDateValue);
                    if (jsonObject != null)
                        jsonObject.addProperty(key, intDateValue);
                    break;
                default:
                    throwRuntimeException(r, -1, "[" + ps.sheet.getSheetName() + "] Not support type: " + type);
            }

            if (mapInfo.putIfAbsent(key, new Info(key, type, value, comment)) != null)
                throwRuntimeException(r, -1, "Duplicate key: " + key + " (" + comment + ")");
        }

    }

    public static void addMiscInfoString (String key, List<String> values, String comment)
    {
        JsonArray strings = new JsonArray();
        if (values != null)
        {
            for (String v : values)
                strings.add(v.trim());
        }
        if (miscJson != null)
            miscJson.add(key, strings);
        String value = Util.toJson(strings);

        if (miscInfo.putIfAbsent(key, new Info(key, Type.SET_STRING.name(), value, comment)) != null)
            throwRuntimeException(-1, -1, "Duplicate key: " + key + " (" + comment + ")");
    }

    public static int getMiscInfoInt (String key)
    {
        return Integer.parseInt(miscInfo.get(key).value);
    }

    public static byte defineToByte (String define)
    {
        Define.Info info = miscDefine.get(define);
        return Byte.parseByte(info.value);
    }

    public static String defineToString (String define)
    {
        Define.Info info = miscDefine.get(define);
        return info == null ? null : info.value;
    }

    public static boolean containDefine (String define)
    {
        return miscDefine.containsKey(define);
    }

    public static void addDefineString (String define, String value, String comment)
    {
        Info info = miscDefine.get(define);
        if (info == null)
            miscDefine.put(define, new Info(define, Type.STRING.object, value, comment));
        else if (!info.value.equals(value))
            throwRuntimeException("Duplicate define: " + define + " with different value");
    }
}
