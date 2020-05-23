import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import util.Address;
import util.Json;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.Socket;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class InfoDatabase
{
    long timeConnectPool, timeRaw8091, timeRaw11210;

    String ip;

    public InfoDatabase (String ip)
    {
        this.ip = ip;
    }

    public void test ()
    {
        //Log.trace("Test database", ip);
        try
        {
            Socket socket = new Socket();
            timeRaw8091 = System.currentTimeMillis();
            socket.connect(Address.getInetSocketAddress(ip, 8091), TestConnect.TIME_OUT);
            timeRaw8091 = System.currentTimeMillis() - timeRaw8091;
            socket.close();

            timeConnectPool = System.currentTimeMillis();
            URL url = new URL("http://" + ip + ":8091/pools/default/buckets");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setConnectTimeout(TestConnect.TIME_OUT);
            con.setReadTimeout(TestConnect.TIME_OUT);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer content = new StringBuffer();
            while ((inputLine = in.readLine()) != null)
                content.append(inputLine);
            timeConnectPool = System.currentTimeMillis() - timeConnectPool;

            JsonArray a = Json.parse(content.toString()).getAsJsonArray();
            for (JsonElement e : a)
            {
                JsonObject o = e.getAsJsonObject();
                String name = o.get("name").getAsString();
                int proxyPort = o.get("proxyPort").getAsInt();

                TestConnect.buckets.put(ip + ":" + proxyPort, new InfoBucket(name, ip, proxyPort));
            }

            in.close();

            socket = new Socket();
            timeRaw11210 = System.currentTimeMillis();
            socket.connect(Address.getInetSocketAddress(ip, 11210), TestConnect.TIME_OUT);
            timeRaw11210 = System.currentTimeMillis() - timeRaw11210;
            socket.close();
        }
        catch (Exception e)
        {

        }
        TestConnect.latch.countDown();
    }
}
