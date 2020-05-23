package service.udp;

import bitzero.server.BitZeroServer;
import bitzero.server.entities.managers.ConnectionStats;
import extension.EnvConfig;
import service.MonitorSystem;
import service.balance.BalanceServer;
import service.friend.FriendServer;
import service.guild.cache.CacheGuildServer;
import service.newsboard.NewsBoardServer;
import util.Address;
import util.metric.MetricLog;

import java.util.Objects;

/**
 * Created by CPU10399-local on 6/10/2016.
 */
public class MsgWorkerInfo extends AbstractMessage
{
    public String  service;
    public int     group;
    public String  privateHost;
    public String  publicHost;
    public String  publicDomain;
    public int     numCore;
    public int     cpuProcess; //percent
    public int     cpuSystem; //percent
    public long    memFree;
    public long    memProcess;
    public int     numException;
    public int     connection;
    public int     conSocket, conWebSocket;
    public int     ccu;
    public int     privateShop;
    public int     airship;
    public int     friend;
    public boolean isRunning;
    public int     upTime;
    public String  builtVersion;
    public int     minClientCode;
    public int     cacheGuild;

    public transient double weight;
    public transient double point;

    private MsgWorkerInfo ()
    {
        super(CMD_WORKER_INFO);
    }

    public static MsgWorkerInfo create ()
    {
        MsgWorkerInfo m = new MsgWorkerInfo();
        m.service = EnvConfig.service().name();
        m.group = EnvConfig.group();
        m.privateHost = Address.PRIVATE_HOST;
        m.publicHost = Address.getPublicHost();
        m.publicDomain = Address.getPublicDomain();
        m.numCore = MonitorSystem.numProcessors();
        m.cpuProcess = MonitorSystem.cpuProcess();
        m.cpuSystem = MonitorSystem.cpuSystem();
        m.memFree = MonitorSystem.memSystemFree();
        m.memProcess = MonitorSystem.memProcessUsed();
        m.numException = (int) MetricLog.getNumException();
        m.isRunning = EnvConfig.isRunning();
        m.upTime = EnvConfig.getUpTime();
        m.builtVersion = EnvConfig.getBuiltVersion();
        m.minClientCode = EnvConfig.minClientCode();

        if (EnvConfig.service() == EnvConfig.Service.GAME || EnvConfig.service() == EnvConfig.Service.CHAT)
        {
            BitZeroServer bz = BitZeroServer.getInstance();
            if (bz != null && bz.isStarted())
            {
                ConnectionStats connStats = bz.getStatsManager().getUserStats();
                m.conSocket = connStats.getSocketCount();
                m.conWebSocket = connStats.getWebsocketSessionCount();
                m.connection = m.conSocket + m.conWebSocket;
                m.ccu = bz.getUserManager().getUserCount();
            }
        }

        if (NewsBoardServer.privateShop != null)
            m.privateShop = NewsBoardServer.privateShop.size();
        if (NewsBoardServer.airship != null)
            m.airship = NewsBoardServer.airship.size();
        m.friend = FriendServer.numCache();
        m.cacheGuild = CacheGuildServer.numCacheGuild();

        return m;
    }

    @Override
    int hash ()
    {
        return Objects.hash(HASH_KEY, time, cmd,
                            service,
                            group,
                            privateHost,
                            publicHost,
                            numCore,
                            cpuSystem,
                            connection,
                            ccu
                           );
    }

    @Override
    public void handle ()
    {
        BalanceServer.addWorker(this);
    }

    public void increaseConnection ()
    {
        connection++;
        point = connection / weight;
    }
}
