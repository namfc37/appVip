package util.io;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by CPU01736-local on 3/10/2015.
 */
public class BootstrapInfo
{
    private final Map<String, Integer> mapAddress;

    private int highWaterMark;
    private int lowWaterMark;
    private int sndBuf;
    private int rcvBuf;
    private int backlog;
    private int numBossThread;
    private int numWorkerThread;

    public BootstrapInfo (String host, int port)
    {
        mapAddress = new LinkedHashMap<>();
        mapAddress.put(host, port);
        numBossThread = -1;
        numWorkerThread = -1;
    }

    public BootstrapInfo (String host, int port, int sndBuf, int rcvBuf)
    {
        this(host, port);
        this.sndBuf = sndBuf;
        this.rcvBuf = rcvBuf;
    }

    public int getHighWaterMark ()
    {
        return highWaterMark;
    }

    public BootstrapInfo setHighWaterMark (int highWaterMark)
    {
        this.highWaterMark = highWaterMark;
        return this;
    }

    public int getLowWaterMark ()
    {
        return lowWaterMark;
    }

    public BootstrapInfo setLowWaterMark (int lowWaterMark)
    {
        this.lowWaterMark = lowWaterMark;
        return this;
    }

    public int getSndBuf ()
    {
        return sndBuf;
    }

    public BootstrapInfo setSndBuf (int sndBuf)
    {
        this.sndBuf = sndBuf;
        return this;
    }

    public int getRcvBuf ()
    {
        return rcvBuf;
    }

    public BootstrapInfo setRcvBuf (int rcvBuf)
    {
        this.rcvBuf = rcvBuf;
        return this;
    }

    public int getBacklog ()
    {
        return backlog;
    }

    public BootstrapInfo setBacklog (int backlog)
    {
        this.backlog = backlog;
        return this;
    }

    public int getNumBossThread ()
    {
        return numBossThread;
    }

    public BootstrapInfo setNumBossThread (int numBossThread)
    {
        this.numBossThread = numBossThread;
        return this;
    }

    public int getNumWorkerThread ()
    {
        return numWorkerThread;
    }

    public BootstrapInfo setNumWorkerThread (int numWorkerThread)
    {
        this.numWorkerThread = numWorkerThread;
        return this;
    }

    public Map<String, Integer> getMapAddress ()
    {
        return mapAddress;
    }

    public BootstrapInfo addAddress (String host, int port)
    {
        mapAddress.put(host, port);
        return this;
    }
}
