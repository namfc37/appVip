package util;

import org.apache.commons.codec.binary.Base64;
import util.collection.MapItem;

import java.nio.charset.StandardCharsets;
import java.util.TreeMap;
import java.util.concurrent.ThreadLocalRandom;

public class Common
{
    public static long stringToLong (Object o)
    {
        return stringToLong(o, 0);
    }

    public static long stringToLong (Object o, long defaultValue)
    {
        try
        {
            if (o != null)
            {
                String s = ((String) o).trim();
                return Long.parseLong(s);
            }
        }
        catch (Exception e)
        {
        }
        return defaultValue;
    }

    public static int stringToInt (Object o)
    {
        return stringToInt(o, 0);
    }

    public static int stringToInt (Object o, int defaultValue)
    {
        try
        {
            if (o != null)
            {
                String s = ((String) o).trim();
                return Integer.parseInt(s);
            }
        }
        catch (Exception e)
        {
        }
        return defaultValue;
    }

    public static MapItem merge (MapItem... maps)
    {
        return merge(false, maps);
    }

    public static MapItem merge (boolean autoTrim, MapItem... maps)
    {
        MapItem sum = new MapItem(autoTrim);
        for (MapItem m : maps)
            sum.increase(m);
        return sum;
    }

    public static MapItem toMap (String id, int num)
    {
        MapItem m = new MapItem(1);
        m.put(id, num);
        return m;
    }

    public static int priceSaleOff (int price, int saleOffPercent)
    {
        return Math.max(1, (int) Math.floor(price * saleOffPercent / 100));
    }

    public static String randomInTree (TreeMap<Integer, String> tree, int max)
    {
        return tree.floorEntry(ThreadLocalRandom.current().nextInt(max)).getValue();
    }

    public static String encodeBase64 (String v)
    {
        return encodeBase64(v.getBytes(StandardCharsets.UTF_8));
    }

    public static String encodeBase64 (byte[] data)
    {
        return Base64.encodeBase64URLSafeString(data);
    }

    public static byte[] decodeBase64 (String base64)
    {
        if (base64 == null || base64.isEmpty())
            return null;
        return Base64.decodeBase64(base64);
    }


}
