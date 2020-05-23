package util;

import com.google.gson.*;
import util.collection.MapItem;
import util.collection.TypeAdapterMapItem;
import util.collection.UnmodifiableMapItem;
import util.metric.MetricLog;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Json
{
    public final static Gson minify = new GsonBuilder()
            .registerTypeAdapter(MapItem.class, new TypeAdapterMapItem(false))
            .registerTypeAdapter(UnmodifiableMapItem.class, new TypeAdapterMapItem(true))
            .create();

    public final static Gson pretty = new GsonBuilder()
            .registerTypeAdapter(MapItem.class, new TypeAdapterMapItem(false))
            .registerTypeAdapter(UnmodifiableMapItem.class, new TypeAdapterMapItem(true))
            .setPrettyPrinting()
            .create();


    public static <T> T fromJson (String json, Class<T> classOfT)
    {
        return minify.fromJson(json, classOfT);
    }

    public static <T> T fromJson (String json, Type type)
    {
        return minify.fromJson(json, type);
    }

    public static <T> T fromJson (JsonElement json, Class<T> classOfT)
    {
        return minify.fromJson(json, classOfT);
    }

    public static <T> T fromJson (JsonElement json, Type type)
    {
        return minify.fromJson(json, type);
    }

    public static <T> T fromFile (String filePath, Class<T> classOfT) throws Exception
    {
        return fromFile(Paths.get(filePath), classOfT);
    }

    public static <T> T fromFile (Path path, Class<T> classOfT) throws Exception
    {
        return minify.fromJson(Files.newBufferedReader(path, StandardCharsets.UTF_8), classOfT);
    }

    public static <T> T fromFile (String filePath, Type type) throws Exception
    {
        return minify.fromJson(Files.newBufferedReader(Paths.get(filePath), StandardCharsets.UTF_8), type);
    }

    public static String toJson (Object src)
    {
        return minify.toJson(src);
    }

    public static String toJsonPretty (Object src)
    {
        return pretty.toJson(src);
    }

    public static JsonElement toJsonTree (Object src)
    {
        return minify.toJsonTree(src);
    }

    public static JsonElement parseSafe (String raw)
    {
        if (raw == null || raw.isEmpty())
            return null;
        raw = raw.trim();
        if (raw.isEmpty())
            return null;
        char firstChar = raw.charAt(0);
        char lastChar = raw.charAt(raw.length() - 1);
        if ((firstChar == '{' && lastChar == '}') || (firstChar == '[' && lastChar == ']'))
        {
            try
            {
                return JsonParser.parseString(raw);
            }
            catch (Exception e)
            {
            }
        }
        return null;
    }

    public static JsonElement parse (String raw)
    {
        try
        {
            return JsonParser.parseString(raw);
        }
        catch (Exception e)
        {
            MetricLog.info("Parse json fail", raw);
            throw e;
        }
    }

    public static JsonElement parseFromFile (String filePath) throws Exception
    {
        return parseFromFile(Paths.get(filePath));
    }

    public static JsonElement parseFromFile (Path path) throws Exception
    {
        return JsonParser.parseReader(Files.newBufferedReader(path, StandardCharsets.UTF_8));
    }

    public static String getString (JsonObject o, String key, String defaultValue)
    {
        JsonElement e = o.get(key);
        if (e == null)
            return defaultValue;

        return e.getAsString();
    }

    public static int getInt (JsonObject o, String key, int defaultValue)
    {
        JsonElement e = o.get(key);
        if (e == null || e.isJsonPrimitive())
            return defaultValue;
        return e.getAsJsonPrimitive().getAsInt();
    }

    public static StringBuilder unescape (String st)
    {
        StringBuilder sb = new StringBuilder(st.length());

        for (int i = 0; i < st.length(); i++)
        {
            char ch = st.charAt(i);
            if (ch == '\\')
            {
                char nextChar = (i == st.length() - 1) ? '\\' : st.charAt(i + 1);
                // Octal escape?
                if (nextChar >= '0' && nextChar <= '7')
                {
                    String code = "" + nextChar;
                    i++;
                    if ((i < st.length() - 1) && st.charAt(i + 1) >= '0' && st.charAt(i + 1) <= '7')
                    {
                        code += st.charAt(i + 1);
                        i++;
                        if ((i < st.length() - 1) && st.charAt(i + 1) >= '0' && st.charAt(i + 1) <= '7')
                        {
                            code += st.charAt(i + 1);
                            i++;
                        }
                    }
                    sb.append((char) Integer.parseInt(code, 8));
                    continue;
                }
                switch (nextChar)
                {
                    case '\\':
                        ch = '\\';
                        break;
                    case 'b':
                        ch = '\b';
                        break;
                    case 'f':
                        ch = '\f';
                        break;
                    case 'n':
                        ch = '\n';
                        break;
                    case 'r':
                        ch = '\r';
                        break;
                    case 't':
                        ch = '\t';
                        break;
                    case '\"':
                        ch = '\"';
                        break;
                    case '\'':
                        ch = '\'';
                        break;
                    // Hex Unicode: u????
                    case 'u':
                        if (i >= st.length() - 5)
                        {
                            ch = 'u';
                            break;
                        }
                        int code = Integer.parseInt("" + st.charAt(i + 2) + st.charAt(i + 3) + st.charAt(i + 4) + st.charAt(i + 5), 16);
                        sb.append(Character.toChars(code));
                        i += 5;
                        continue;
                }
                i++;
            }
            sb.append(ch);
        }
        return sb;
    }
}
