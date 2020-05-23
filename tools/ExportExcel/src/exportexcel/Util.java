package exportexcel;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import exportexcel.sheet.ParseWorkbook;
import org.apache.commons.codec.binary.Hex;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.GZIPOutputStream;

public class Util
{
    public static final Gson              gsonMin    = new GsonBuilder().create();
    public static final Gson              gsonPretty = new GsonBuilder().setPrettyPrinting().create();
    public final static DateTimeFormatter FORMATTER  = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public static String toJson (Object o)
    {
        return gsonMin.toJson(o);
    }

    public static String toJsonPretty (Object o)
    {
        return gsonPretty.toJson(o);
    }

    public static JsonElement toJsonTree (Object o)
    {
        return gsonMin.toJsonTree(o);
    }


    public static StringBuilder toStringBuilder (Object... ao)
    {
        StringBuilder sb = new StringBuilder(256);
        for (Object o : ao)
        {
            if (o != null)
                sb.append(o);
        }
        return sb;
    }

    public static String toString (Object... ao)
    {
        return toStringBuilder(ao).toString();
    }

    public static byte[] toByteArray (Charset charset, Object... ao)
    {
        if (charset == null)
            return toString(ao).getBytes(StandardCharsets.UTF_8);
        else
            return toString(ao).getBytes(charset);
    }

    //algorithm: MD5, SHA-1, SHA-256
    public static String hash (String algorithm, Object... ao) throws Exception
    {
        return hash(algorithm, toByteArray(null, ao));
    }

    public static String hash (String algorithm, byte[] data) throws Exception
    {
        MessageDigest messageDigest = MessageDigest.getInstance(algorithm);
        return Hex.encodeHexString(messageDigest.digest(data));
    }

    public static byte[] gzipCompress (byte[] in)
    {
        if (in != null && in.length > 0)
        {
            try (ByteArrayOutputStream bos = new ByteArrayOutputStream(in.length >> 1);
                 GZIPOutputStream dos = new GZIPOutputStream(bos))
            {
                dos.write(in);
                dos.close();
                return bos.toByteArray();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }
        return null;
    }

    public static int toUnixTime (String input)
    {
        return (int) LocalDateTime.parse(input.trim(), FORMATTER).toEpochSecond(ZoneOffset.ofHours(7));
    }

    public static int[][] toPeriods (String sheet, int row, String data)
    {
        if (data == null)
            return null;

        String[] durations = data.split("\n");
        int[][] result = new int[durations.length][];
        int lastTime = 0;
        int from, to;

        for (int i = 0; i < durations.length; i++)
        {
            String duration = durations[i];
            String[] times = durations[i].split("=>");
            if (times == null || times.length != 2)
                ParseWorkbook.throwRuntimeException(sheet, row, -1, "Invalid duration: " + duration);
            from = toUnixTime(times[0]);
            to = toUnixTime(times[1]);
            if (lastTime >= from || from >= to)
                ParseWorkbook.throwRuntimeException(sheet, row, -1, "Invalid time, lastTime: " + lastTime + ", from: " + from + ", to: " + to);

            result[i] = new int[2];
            result[i][0] = from;
            result[i][1] = to;
            lastTime = to;
        }

        return result;
    }

    public static String[] getArrayString (String data)
    {
        if (data == null || data.isEmpty())
            return null;
        return data.split("\\s*[:,\\n]\\s*");
    }

    public static Collection<String> getCollectionString (String data)
    {
        String[] as = getArrayString(data);
        if (data == null)
            return null;
        List<String> list = new ArrayList<>();
        Set<String> set = new HashSet<>();
        for (String s : as)
        {
            if (s == null || s.isEmpty())
                continue;
            if (set.add(s))
                list.add(s);
        }
        return list;
    }

    public static int[] getArrayInt (String data)
    {
        String[] as = getArrayString(data);
        if (data == null)
            return null;

        int[] ints = new int[as.length];
        for (int i = 0; i < as.length; i++)
            ints[i] = Integer.parseInt(as[i]);
        return ints;
    }

    public static String[] toArrayItemId (String data)
    {
        String[] as = getArrayString(data);
        if (data == null)
            return null;
        String[] list = new String[as.length];
        for (int i = 0; i < as.length; i++)
        {
            list[i] = toItemId(as[i]);
        }
        return list;
    }

    public static HashMap<String, Integer> getMapItemNum (int idRow, int idCol, String data)
    {
        HashMap<String, Integer> map = new HashMap<>();
        String[] as = data.split(":");
        if (as.length > 1)
        {
            for (int i = 0; i < as.length; i += 2)
            {
                String key = as[i];
                String value = as[i + 1];

                String itemId = toItemId(idRow, idCol, key);
                int num = Integer.parseInt(value);

                map.put(itemId, num);
            }
        }
        return map;
    }

    public static String toItemId (String data)
    {
        return toItemId(-1, -1, data);
    }

    public static String toItemId (int idRow, int idCol, String data)
    {
        if (data == null)
            return null;
        if (ParseWorkbook.mapIdName.containsKey(data))
            return data;

        String itemId = ParseWorkbook.mapIdName.inverse().get(data.toLowerCase());
        if (itemId == null)
            ParseWorkbook.throwRuntimeException(idRow, idCol, "UNDEFINED ITEM: " + data);
        return itemId;
    }

    public static TreeMap<Integer,String> toMapRate (String data)
    {
        String[] as = getArrayString(data);
        if (data == null)
            return null;
        TreeMap<Integer,String> r = new TreeMap<>();
        int rate, totalRate = 0;
        for (int i = 0; i < as.length; i++)
        {
            String id = as[i];
            rate = Integer.parseInt(as[++i]);
            if (rate > 0)
            {
                r.put(totalRate, id);
                totalRate += rate;
            }
        }
        if (totalRate != 100)
            throw new RuntimeException("totalRate != 100 : " + data);
        return r;
    }
}
