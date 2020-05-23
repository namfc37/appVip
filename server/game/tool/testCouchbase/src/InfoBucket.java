import util.Address;
import util.Log;
import util.memcached.SpyMemcached;

import java.net.Socket;

public class InfoBucket
{
    String name, ip;
    int  port;
    long timeConnectRaw = -1, timeConnectSpy = -1, timeGet = -1, timeSet = -1, timeDelete = -1;

    public InfoBucket (String name, String ip, int port)
    {
        this.name = name;
        this.ip = ip;
        this.port = port;
    }

    public void test ()
    {
        //Log.trace("Test bucket", ip, port);
        try (Socket socket = new Socket())
        {
            timeConnectRaw = System.currentTimeMillis();
            socket.connect(Address.getInetSocketAddress(ip, port), TestConnect.TIME_OUT);
            timeConnectRaw = System.currentTimeMillis() - timeConnectRaw;
            socket.close();

            timeConnectSpy = System.currentTimeMillis();
            SpyMemcached m = new SpyMemcached(name, ip, port, 500, TestConnect.TIME_OUT, 6400);
            timeConnectSpy = System.currentTimeMillis() - timeConnectSpy;

            String key = "test_" + System.currentTimeMillis();
            String value = Long.toString(System.currentTimeMillis());

            timeSet = System.currentTimeMillis();
            if (!m.set(key, value))
            {
                timeSet = -1;
                return;
            }
            timeSet = System.currentTimeMillis() - timeSet;

            timeGet = System.currentTimeMillis();
            if (!value.equals(m.get(key)))
            {
                timeGet = -1;
                return;
            }
            timeGet = System.currentTimeMillis() - timeGet;

            timeDelete = System.currentTimeMillis();
            if (!m.delete(key))
            {
                timeDelete = -1;
                return;
            }
            timeDelete = System.currentTimeMillis() - timeDelete;
        }
        catch (Exception e)
        {
            timeConnectRaw = -2;
        }
        TestConnect.latch.countDown();
    }
}
