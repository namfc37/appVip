package extension;

import bitzero.util.common.business.Debug;
import data.ConstInfo;
import data.ranking.RankingManager;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import payment.sea.GetPhone;
import service.MonitorSystem;
import service.UdpHandler;
import service.admin.HttpServerInitializer;
import service.balance.BalanceClient;
import service.balance.BalanceServer;
import service.friend.FriendServer;
import service.newsboard.NewsBoardServer;
import util.Address;
import util.Database;
import util.Json;
import util.Time;
import util.io.BootstrapInfo;
import util.io.http.HttpServer;
import util.io.udp.Udp;
import util.memcached.BucketManager;
import util.metric.MetricLog;
import util.redis.RedisManager;
import util.server.ServerConstant;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.jar.Attributes;
import java.util.jar.JarInputStream;
import java.util.jar.Manifest;

public class EnvConfig
{
    private static EnvConfig  instance;
    public static  Udp        udpAdmin;
    public static  HttpServer httpAdmin;
    private static boolean    isRunning;
    private static int        timeStart;
    private static String     builtVersion;

    private String                    zone;
    private Environment               environment;
    private Service                   service;
    private int                       group;
    private String                    extendMemcached;
    private String                    extendRedis;
    private User                      user;
    private UdpInfo                   udp;
    private AdminInfo                 admin;
    private NewsBoardInfo             newsBoard;
    private FriendInfo                friend;
    private BalanceInfo               balance;
    private Payment                   payment;
    private HashMap<String, HostInfo> mapIP;
    private boolean                   logAddNewLine;
    private int                       minClientCode;
    private ChatInfo                  chat;

    private String wsKeyStoreFile;
    private String wsKeyStorePass;

    public static void readConfig () throws Exception
    {
        instance = Json.fromFile("./conf/" + ServerConstant.ENV_CONFIG, EnvConfig.class);
    }

    public static synchronized void start () throws Exception
    {
        if (instance != null)
            return;
        timeStart = Time.getUnixTime();
        readConfig();

        if (instance.environment == Environment.SERVER_LIVE)
        {
            if (!ServerConstant.IS_METRICLOG)
                throw new RuntimeException("IS_METRICLOG is false in server environment");
            if (!ServerConstant.ENABLE_PAYMENT)
                throw new RuntimeException("ENABLE_PAYMENT is false in server environment");
        }
        else
        {
            // if (Address.PRIVATE_HOST != null && Address.PRIVATE_HOST.startsWith("10.199.23") == false)
            // throw new RuntimeException("Run local environment on server: " + instance.environment);
        }

        instance.service = Service.valueOf(ServerConstant.ENV_SERVICE);
        instance.group = (int) ServerConstant.ENV_GROUP;

        if (instance.group < 0 || instance.group > 99)
            throw new RuntimeException("Invalid group " + instance.group);
        switch (instance.service)
        {
            case ADMIN:
                if (isServer() && instance.group != instance.admin.group)
                    throw new RuntimeException("Service ADMIN must run in group " + instance.admin.group);
                break;
            case BALANCE:
                if (isServer() && instance.group != instance.balance.group)
                    throw new RuntimeException("Service BALANCE must run in group " + instance.balance.group);
                break;
            case NEWSBOARD:
                if (isServer() && instance.group != instance.newsBoard.group)
                    throw new RuntimeException("Service BALANCE must run in group " + instance.newsBoard.group);
                break;
            case FRIEND:
                if (isServer() && instance.group != instance.friend.group)
                    throw new RuntimeException("Service FRIEND must run in group " + instance.friend.group);
                break;
            case GAME:
                if (isServer() && instance.user.groups.contains(instance.group) == false)
                    throw new RuntimeException("Service BALANCE must run in group " + instance.user.groups);
                break;
            case CHAT:
                if (isServer() && instance.group != instance.chat.group)
                    throw new RuntimeException("Service CHAT must run in group " + instance.chat.group);
                break;
        }
        checkFrameworkPort();
        if (instance.mapIP != null)
        {
            HostInfo hostInfo = instance.mapIP.get(Address.PRIVATE_HOST);
            if (instance.environment == Environment.LOCAL)
                hostInfo = instance.mapIP.get("");
            if (hostInfo != null)
                Address.setPublicHost(hostInfo.getIp(), hostInfo.getDomain());
        }

        markStarting();
        connectDatabase(true);

        NewsBoardServer.address = Address.getInetSocketAddress(instance.newsBoard.getHost(), instance.udp.getPort(instance.newsBoard.group));
        BalanceServer.address = Address.getInetSocketAddress(instance.balance.getHost(), instance.udp.getPort(instance.balance.group));
        FriendServer.address = Address.getInetSocketAddress(instance.friend.getHost(), instance.udp.getPort(instance.friend.group));
        ChatExtension.address = Address.getInetSocketAddress(instance.chat.getHost(), instance.udp.getPort(instance.chat.group));
        Debug.info("CHAT", instance.chat.getHost(), instance.udp.getPort(instance.chat.group));

        BootstrapInfo udpBootstrap;
        UdpInfo udpInfo = instance.udp;
        if (isLocal())
            udpBootstrap = new BootstrapInfo(null, udpInfo.getPort(), udpInfo.getSndBuf(), udpInfo.getRcvBuf());
        else
            udpBootstrap = new BootstrapInfo(Address.PRIVATE_HOST, udpInfo.getPort(), udpInfo.getSndBuf(), udpInfo.getRcvBuf());
        udpAdmin = new Udp("udpAdmin", udpBootstrap);
        udpAdmin.start(new UdpHandler());

        BootstrapInfo httpBootStrap;
        AdminInfo httpInfo = instance.admin;
        if (isLocal())
            httpBootStrap = new BootstrapInfo(null, httpInfo.getPort());
        else
            httpBootStrap = new BootstrapInfo(Address.PRIVATE_HOST, httpInfo.getPort());
        httpAdmin = new HttpServer("httpAdmin", httpBootStrap);
        httpAdmin.start(new HttpServerInitializer());

        loadManifest();
        ConstInfo.load();
        RankingManager.start();
        MonitorSystem.start();
        if (instance.service != Service.BALANCE)
            BalanceClient.start();

        if (instance.payment.sea != null)
            GetPhone.start();
    }

    public static void connectDatabase (boolean userInitKey) throws Exception
    {
        BucketManager.start(instance.extendMemcached);
        RedisManager.start(instance.extendRedis);
        Database.init(userInitKey);
    }

    public static void disconnectDatabase ()
    {
        BucketManager.stop();
        RedisManager.stop();
    }

    private static void loadManifest ()
    {
        try
        {
            JarInputStream in = new JarInputStream(Files.newInputStream(Paths.get("./kvtm.jar")));
            Manifest mf = in.getManifest();
            Attributes at = mf.getMainAttributes();

            builtVersion = at.getValue("Built-Version");
        }
        catch (Exception e)
        {
            //MetricLog.exception(e);
        }
    }

    public static void markStarting ()
    {
        isRunning = false;
        MetricLog.monitorService("STARTING");
    }

    public static void markRunning ()
    {
        isRunning = true;
        MetricLog.monitorService("RUNNING");
        MetricLog.console("MARK_SERVICE_STARTED");//báo cho script service.sh start thành công
    }

    public static void markStopping ()
    {
        isRunning = false;
        MetricLog.monitorService("STOPPING");
    }

    public static void markTerminated ()
    {
        isRunning = false;
        MetricLog.monitorService("TERMINATED");
    }

    public static synchronized void stop ()
    {
        if (udpAdmin != null)
        {
            udpAdmin.stop();
            udpAdmin = null;
        }
        if (httpAdmin != null)
        {
            httpAdmin.stop();
            httpAdmin = null;
        }
        RankingManager.stop();
        MonitorSystem.stop();
        BalanceClient.stop();
        disconnectDatabase();
        GetPhone.stop();

        markTerminated();
    }

    public enum Environment
    {
        SERVER_LIVE,
        SERVER_TEST,
        SERVER_DEV,
        LOCAL
    }

    public enum Service
    {
        GAME,
        NEWSBOARD,
        BALANCE,
        ADMIN,
        FRIEND,
        CHAT
    }

    public class AdminInfo
    {
        private int portRange;
        private int group;

        public int getPortRange ()
        {
            return portRange;
        }

        public int getPort ()
        {
            return portRange + instance.group;
        }

        public int getGroup ()
        {
            return group;
        }
    }

    public class BalanceInfo
    {
        private String host;
        private int    group;
        private int    period;
        private int    timeout;

        public String getHost ()
        {
            return host;
        }

        public int getGroup ()
        {
            return group;
        }

        public int getPeriod ()
        {
            return period;
        }

        public int getTimeout ()
        {
            return timeout;
        }
    }

    public class Payment
    {
        private boolean      useServiceCheckLocalPayment;
        private DirectMobile directMobile;
        private IAP          iap;
        private Brazil       brazil;
        private Sea          sea;
    }

    public class DirectMobile
    {
        private int    id;
        private String key1;
        private String urlSubmitCard;
        private String urlRegSms;
        private String urlRegAtm;
        private String urlRedirect;
        private int    connectTimeout;
        private int    idleTime;

        public int getId ()
        {
            return id;
        }

        public String getKey1 ()
        {
            return key1;
        }

        public String getUrlSubmitCard ()
        {
            return urlSubmitCard;
        }

        public String getUrlRegSms ()
        {
            return urlRegSms;
        }

        public String getUrlRegAtm ()
        {
            return urlRegAtm;
        }

        public String getUrlRedirect ()
        {
            return urlRedirect;
        }

        public int getConnectTimeout ()
        {
            return connectTimeout;
        }

        public int getIdleTime ()
        {
            return idleTime;
        }
    }

    public class IAP
    {
        private String urlValidate;
        private String serviceName;
        private int    expireDay;
        private int    connectTimeout;
        private int    idleTime;

        public String getUrlValidate ()
        {
            return urlValidate;
        }

        public String getServiceName ()
        {
            return serviceName;
        }

        public int getExpireDay ()
        {
            return expireDay;
        }

        public int getExpireTime ()
        {
            return expireDay * Time.SECOND_IN_DAY;
        }

        public int getConnectTimeout ()
        {
            return connectTimeout;
        }

        public int getIdleTime ()
        {
            return idleTime;
        }
    }

    public class Brazil
    {
        private int    productId;
        private String key;
        private String urlCreate;
        private String urlProcess;
        private String urlGetPaymentFlow;
        private String urlGetTransaction;
        private int    connectTimeout;
        private int    idleTime;
        private int    percentNetGross;

        public int getProductId ()
        {
            return productId;
        }

        public String getKey ()
        {
            return key;
        }

        public String getUrlCreate ()
        {
            return urlCreate;
        }

        public String getUrlProcess ()
        {
            return urlProcess;
        }

        public String getUrlGetPaymentFlow ()
        {
            return urlGetPaymentFlow;
        }

        public String getUrlGetTransaction ()
        {
            return urlGetTransaction;
        }

        public int getConnectTimeout ()
        {
            return connectTimeout;
        }

        public int getIdleTime ()
        {
            return idleTime;
        }

        public int getPercentNetGross ()
        {
            return percentNetGross;
        }
    }

    public class Sea
    {
        private int    productId;
        private String key;
        private String urlGetPhone;
        private String urlCreate;
        private String urlProcess;
        private int    connectTimeout;
        private int    idleTime;
        private int    percentNetGross;

        public int getProductId ()
        {
            return productId;
        }

        public String getKey ()
        {
            return key;
        }

        public String getUrlGetPhone ()
        {
            return urlGetPhone;
        }

        public String getUrlCreate ()
        {
            return urlCreate;
        }

        public String getUrlProcess ()
        {
            return urlProcess;
        }

        public int getConnectTimeout ()
        {
            return connectTimeout;
        }

        public int getIdleTime ()
        {
            return idleTime;
        }

        public int getPercentNetGross ()
        {
            return percentNetGross;
        }
    }

    public class User
    {
        private int              portRange;
        private int              portWebSocketRange;
        private int              portAdminRange;
        private boolean          useLoginPortal;
        private boolean          useJsonPretty;
        private int              periodSave;
        private HashSet<Integer> groups;

        public boolean useLoginPortal ()
        {
            return useLoginPortal;
        }

        public boolean useJsonPretty ()
        {
            return useJsonPretty;
        }

        public int getPeriodSave ()
        {
            return periodSave;
        }

        public int getPort ()
        {
            return getPort(instance.group);
        }

        public int getPort (int group)
        {
            return portRange + group;
        }

        public int getPortWebSocket ()
        {
            return getPortWebSocket(instance.group);
        }

        public int getPortWebSocket (int group)
        {
            return portWebSocketRange + group;
        }

        public int getPortRange ()
        {
            return portRange;
        }
    }

    public class ChatInfo
    {
        private String  host;
        private int     group;
        private boolean useLoginPortal;
        private int     periodSave;

        public String getHost ()
        {
            return host;
        }

        public int getGroup ()
        {
            return group;
        }

        public boolean useLoginPortal ()
        {
            return useLoginPortal;
        }

        public int getPeriodSave ()
        {
            return periodSave;
        }
    }

    public class UdpInfo
    {
        private int portRange;
        private int sndBuf;
        private int rcvBuf;

        public int getPortRange ()
        {
            return portRange;
        }

        public int getPort ()
        {
            return portRange + instance.group;
        }

        public int getPort (int group)
        {
            return portRange + group;
        }

        public int getSndBuf ()
        {
            return sndBuf;
        }

        public int getRcvBuf ()
        {
            return rcvBuf;
        }
    }

    public class NewsBoardInfo
    {
        private String host;
        private int    group;
        private int    periodSave;
        private int    itemPerKey;

        public String getHost ()
        {
            return host;
        }

        public int getGroup ()
        {
            return group;
        }

        public int getPeriodSave ()
        {
            return periodSave;
        }

        public int getItemPerKey ()
        {
            return itemPerKey;
        }
    }

    public class FriendInfo
    {
        private String host;
        private int    group;
        private int    periodSave;
        private int    itemPerKey;
        private int    itemPerLevel;

        public String getHost ()
        {
            return host;
        }

        public int getGroup ()
        {
            return group;
        }

        public int getPeriodSave ()
        {
            return periodSave;
        }

        public int getItemPerKey ()
        {
            return itemPerKey;
        }

        public int getItemPerLevel ()
        {
            return itemPerLevel;
        }
    }

    public class GiftCodeInfo
    {
        private int               group;
        private ArrayList<String> activeSingle;

        public int getGroup ()
        {
            return group;
        }

        public ArrayList<String> getActiveSingle ()
        {
            return activeSingle;
        }
    }

    public static class HostInfo
    {
        private String ip;
        private String domain;

        public String getIp ()
        {
            return ip;
        }

        public String getDomain ()
        {
            return domain;
        }
    }

    public static String zone ()
    {
        return instance.zone;
    }

    public static Environment environment ()
    {
        return instance.environment;
    }

    public static String getExtendMemcached ()
    {
        return instance.extendMemcached;
    }

    public static User getUser ()
    {
        return instance.user;
    }

    public static UdpInfo getUdp ()
    {
        return instance.udp;
    }

    public static AdminInfo getAdmin ()
    {
        return instance.admin;
    }

    public static NewsBoardInfo getNewsBoard ()
    {
        return instance.newsBoard;
    }

    public static FriendInfo getFriend ()
    {
        return instance.friend;
    }

    public static ChatInfo getChat ()
    {
        return instance.chat;
    }

    public static Service service ()
    {
        return instance.service;
    }

    public static int group ()
    {
        return instance.group;
    }

    public static boolean isLocal ()
    {
        return instance.environment == Environment.LOCAL;
    }

    public static boolean isServer ()
    {
        return instance.environment != Environment.LOCAL;
    }

    public static BalanceInfo getBalance ()
    {
        return instance.balance;
    }

    public static DirectMobile getDirectMobile ()
    {
        return instance.payment.directMobile;
    }

    public static IAP getIap ()
    {
        return instance.payment.iap;
    }

    private static void checkFrameworkPort () throws Exception
    {
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        Document doc = dBuilder.parse("./config/server.xml");
        doc.getDocumentElement().normalize();

        int gamePort = instance.user.portRange + instance.group;
        int webSocketPort = instance.user.portWebSocketRange + instance.group;
        int adminPort = instance.user.portAdminRange + instance.group;

        Node nodeSockets = doc.getElementsByTagName("socketAddresses").item(0);
        NodeList listSocket = nodeSockets.getChildNodes();
        for (int i = 1; i < listSocket.getLength(); i += 2)
        {
            Element e = (Element) listSocket.item(i);
            if (!e.getAttribute("address").equals("0.0.0.0"))
                throw new RuntimeException("Config address in server.xml must be 0.0.0.0");
            if (!e.getAttribute("type").equals("TCP"))
                throw new RuntimeException("Config type in server.xml  must be TCP");
            int configPort = Integer.parseInt(e.getAttribute("port"));
            if (configPort != gamePort && configPort != adminPort)
                throw new RuntimeException("Config port in server.xml is not match with group " + instance.group + " : " + configPort);
        }

        nodeSockets = doc.getElementsByTagName("webSocket").item(0);
        listSocket = nodeSockets.getChildNodes();
        LOOP_WEB_SOCKET:
        for (int i = 1; i < listSocket.getLength(); i += 2)
        {
            Element e = (Element) listSocket.item(i);
            String content = e.getTextContent();
            switch (e.getTagName())
            {
                case "isActive":
                    if (!content.equalsIgnoreCase("true"))
                        break LOOP_WEB_SOCKET;
                    break;
                case "bindAddress":
                    if (!content.equalsIgnoreCase("0.0.0.0"))
                        throw new RuntimeException("Config bindAddress (webSocket) in server.xml must be 0.0.0.0");
                    break;
                case "tcpPort":
                case "sslPort":
                    int configPort = Integer.parseInt(content);
                    if (configPort != webSocketPort && configPort != webSocketPort)
                        throw new RuntimeException("Config port (webSocket) in server.xml is not match with group " + instance.group + " : " + configPort);
                    break;
                case "keyStoreFile":
                    instance.wsKeyStoreFile = content;
                    break;
                case "keyStorePassword":
                    instance.wsKeyStorePass = content;
                    break;
            }
        }
    }

    public static boolean isRunning ()
    {
        return isRunning;
    }

    public static String getBuiltVersion ()
    {
        return builtVersion;
    }

    public static int getUpTime ()
    {
        return Time.getUnixTime() - timeStart;
    }

    public static boolean useServiceCheckLocalPayment ()
    {
        return instance.payment.useServiceCheckLocalPayment;
    }

    public static boolean isZone (String country)
    {
        return instance.zone.equalsIgnoreCase(country);
    }

    public static Brazil getPaymentBrazil ()
    {
        return instance.payment.brazil;
    }

    public static Sea getPaymentSea ()
    {
        return instance.payment.sea;
    }

    public static boolean logAddNewLine ()
    {
        return instance.logAddNewLine;
    }

    public static int minClientCode ()
    {
        return instance.minClientCode;
    }

    public static String getKeyStoreFile ()
    {
        return instance.wsKeyStoreFile;
    }

    public static String getKeyStorePass ()
    {
        return instance.wsKeyStorePass;
    }
}