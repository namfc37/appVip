package util;

import bitzero.util.common.business.Debug;
import util.metric.MetricLog;

import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class Ip2Country
{
    private final static String URL_LITE_DATABASE  = "http://download.ip2location.com/lite/IP2LOCATION-LITE-DB1.CSV.ZIP";
    private final static String PATH_LITE_DATABASE = "./data/IP2LOCATION-LITE-DB1.gzip";

    private static TreeMap<Integer, String> mapCountry = new TreeMap<>();

    //download () and decompress
    public static void load () throws Exception
    {
        load(PATH_LITE_DATABASE);
    }

    private static void load (String path) throws Exception
    {
        Debug.info("Ip2Country", "load", path);
        long time = System.currentTimeMillis();

        GZIPInputStream gis = new GZIPInputStream(new BufferedInputStream(Files.newInputStream(Paths.get(path))));
        DataInputStream dis = new DataInputStream(new BufferedInputStream(gis));

        TreeMap<Integer, String> mapCountry = new TreeMap<>();

        int count, ip;
        String name;

        count = dis.readInt();
        for (int i = count; i > 0; i--)
        {
            ip = dis.readInt();
            name = dis.readUTF();
            mapCountry.put(ip, name);
        }

        Ip2Country.mapCountry = mapCountry;

        Debug.info("Ip2Country", "size", count, "time", System.currentTimeMillis() - time);
    }

    public static String toCountry (String address)
    {
        try
        {
            return toCountry(InetAddress.getByName(address));
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
        return "-";
    }

    public static String toCountry (SocketAddress remoteAddress)
    {
        return (remoteAddress instanceof InetSocketAddress) ? toCountry(((InetSocketAddress) remoteAddress).getAddress()) : "-";
    }

    public static String toCountry (InetAddress inetAddress)
    {
        if (inetAddress instanceof Inet4Address)
        {
            byte[] addr = inetAddress.getAddress();
            long address = addr[3] & 0xFFL;
            address |= ((addr[2] << 8) & 0xFF00L);
            address |= ((addr[1] << 16) & 0xFF0000L);
            address |= ((addr[0] << 24) & 0xFF000000L);
            return unsignIntToCountry(address);
        }

        return "-";
    }

    public static String unsignIntToCountry (long value)
    {
        int address = (int) (value - Integer.MAX_VALUE);
        return signIntToCountry(address);
    }

    public static String signIntToCountry (int value)
    {
        if (mapCountry == null)
            return "-";

        Map.Entry<Integer, String> e = mapCountry.floorEntry(value);
        return (e == null) ? "-" : e.getValue();
    }

    public static void main (String[] args) throws Exception
    {
        downloadLiteDatabase();
    }

    private static void downloadLiteDatabase () throws Exception
    {
        try (ZipInputStream in = new ZipInputStream(new BufferedInputStream(new URL(URL_LITE_DATABASE).openStream())))
        {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();

            ZipEntry ze;
            int size = 0;
            byte[] buffer;
            while ((ze = in.getNextEntry()) != null)
            {
                if (!ze.getName().equalsIgnoreCase("IP2LOCATION-LITE-DB1.CSV"))
                    continue;
                buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) != -1)
                {
                    size += read;
                    bos.write(buffer, 0, read);
                    Debug.info(size);
                }
            }
            Debug.info("Download done", size);

            Scanner scanner = new Scanner(new ByteArrayInputStream(bos.toByteArray()));
            bos = new ByteArrayOutputStream();
            DataOutputStream dos = new DataOutputStream(new BufferedOutputStream(bos));
            String line, name;
            int e1, e2, e3, e4, count = 0, ip;
            while (scanner.hasNextLine())
            {
                line = scanner.nextLine();
                if (line == null || line.isEmpty())
                    break;
                e1 = line.indexOf("\",\"");
                e2 = line.indexOf("\",\"", e1 + 3);
                e3 = line.indexOf("\",\"", e2 + 3);
                e4 = line.length() - 1;

                ip = (int) (Long.parseLong(line.substring(1, e1)) - Integer.MAX_VALUE);
                name = line.substring(e3 + 3, e4);

                dos.writeInt(ip);
                dos.writeUTF(name);
                count++;
            }
            dos.flush();
            buffer = bos.toByteArray();

            bos = new ByteArrayOutputStream();
            GZIPOutputStream gos = new GZIPOutputStream(bos);
            gos.write((count >>> 24) & 0xFF);
            gos.write((count >>> 16) & 0xFF);
            gos.write((count >>> 8) & 0xFF);
            gos.write((count >>> 0) & 0xFF);
            gos.write(buffer);
            gos.close();

            byte[] data = bos.toByteArray();
            Debug.info("Count", count, "Size", data.length);
            Files.write(Paths.get(PATH_LITE_DATABASE), bos.toByteArray());
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }
}
