package util;

import java.net.*;
import java.util.*;

public class Address
{
    public final static List<InterfaceAddress> PUBLIC, PRIVATE;
    public final static String PRIVATE_HOST, BROADCAST_HOST, PUBLIC_HOST;
    public final static Set<String> SET_PRIVATE_VLAN;

    private String host;
    private int    port;

    static
    {
        ArrayList<InterfaceAddress> publicAddress = new ArrayList<>();
        ArrayList<InterfaceAddress> privateAddress = new ArrayList<>();
        HashSet<String> setPrivateVlan = new HashSet<>();
        setPrivateVlan.add("127.0.0.");

        String privateHost = null;
        String broadcastHost = null;
        String publicHost = null;
        String host;
        try
        {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements())
            {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isLoopback() || networkInterface.isUp() == false)
                    continue;
                for (InterfaceAddress interfaceAddress : networkInterface.getInterfaceAddresses())
                {
                    InetAddress address = interfaceAddress.getAddress();
                    InetAddress broadcast = interfaceAddress.getBroadcast();
                    if (address instanceof Inet4Address)
                    {
                        byte[] bytes = address.getAddress();
                        int byte0 = bytes[0] & 0xff;
                        int byte1 = bytes[1] & 0xff;
                        if ((byte0 == 192 && byte1 == 168) || (byte0 == 172 && (byte1 >= 16 || byte1 <= 31)))
                        {
                            privateAddress.add(interfaceAddress);
                        }
                        else if (byte0 == 10)
                        {
                            privateAddress.add(interfaceAddress);
                            host = address.getHostAddress();
                            setPrivateVlan.add(host.substring(0, host.lastIndexOf('.') + 1));

                            if (broadcast != null && privateHost == null)
                            {
                                privateHost = host;
                                broadcastHost = broadcast.getHostAddress();
                            }
                        }
                        else
                        {
                            if (publicHost == null)
                                publicHost = address.getHostAddress();
                            publicAddress.add(interfaceAddress);
                        }
                    }
                }
            }
        }
        catch (Exception e)
        {
            Log.exception(e);
        }

        PRIVATE = Collections.unmodifiableList(privateAddress);
        PUBLIC = Collections.unmodifiableList(publicAddress);
        PRIVATE_HOST = privateHost;
        BROADCAST_HOST = broadcastHost;
        PUBLIC_HOST = publicHost;
        SET_PRIVATE_VLAN = Collections.unmodifiableSet(setPrivateVlan);
        //Log.info("PRIVATE_HOST", PRIVATE_HOST, "BROADCAST_HOST", BROADCAST_HOST, "PUBLIC_HOST", PUBLIC_HOST);
    }

    public static boolean isPrivateVlan (InetAddress ia)
    {
        return isPrivateVlan(ia.getHostAddress());
    }

    public static boolean isPrivateVlan (String host)
    {
        return SET_PRIVATE_VLAN.contains(host.substring(0, host.lastIndexOf('.') + 1));
    }

    public static InetSocketAddress getInetSocketAddress (String host, int port)
    {
        return (host == null || host.isEmpty() || host.length() <= 1)
                ? new InetSocketAddress(port)
                : new InetSocketAddress(host, port);
    }
}
