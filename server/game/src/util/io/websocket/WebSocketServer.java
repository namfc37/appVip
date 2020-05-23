package util.io.websocket;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.PooledByteBufAllocator;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import util.Address;
import util.io.BootstrapInfo;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class WebSocketServer
{
    private       String               id;
    private final Map<String, Integer> mapAddress;
    private       ServerBootstrap      bootstrap;
    private       NioEventLoopGroup    bossGroup, workerGroup;
    private List<Channel> channels;

    private int highWaterMark;
    private int lowWaterMark;
    private int sndBuf, rcvBuf;
    private int backlog;
    private int numBossThread, numWorkerThread;

    public WebSocketServer (String id)
    {
        this.id = id;
        mapAddress = new HashMap<>();
        channels = new ArrayList<>();
        bootstrap = new ServerBootstrap()
                .channel(NioServerSocketChannel.class)
                .childOption(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT)
                .childOption(ChannelOption.SO_KEEPALIVE, true)
                .childOption(ChannelOption.TCP_NODELAY, true);
    }

    public WebSocketServer (String id, BootstrapInfo info)
    {
        this(id);

        mapAddress.putAll(info.getMapAddress());
        highWaterMark = info.getHighWaterMark();
        lowWaterMark = info.getLowWaterMark();
        sndBuf = info.getSndBuf();
        rcvBuf = info.getRcvBuf();
        backlog = info.getBacklog();
        numBossThread = info.getNumBossThread();
        numWorkerThread = info.getNumWorkerThread();
    }

    public ServerBootstrap getBootstrap ()
    {
        return bootstrap;
    }

    public synchronized boolean start (ChannelInitializer<SocketChannel> initializer) throws Exception
    {
        if (bossGroup != null || workerGroup != null)
            return false;

        if (numBossThread < 0)
            bossGroup = ShareLoopGroup.boss();
        else if (numBossThread == 0)
            bossGroup = new NioEventLoopGroup();
        else
            bossGroup = new NioEventLoopGroup(numBossThread);

        if (numWorkerThread < 0)
            workerGroup = ShareLoopGroup.worker();
        else if (numWorkerThread == 0)
            workerGroup = new NioEventLoopGroup();
        else
            workerGroup = new NioEventLoopGroup(numWorkerThread);

        if (highWaterMark > 0 && lowWaterMark > 0)
            bootstrap.childOption(ChannelOption.WRITE_BUFFER_WATER_MARK, new WriteBufferWaterMark(lowWaterMark, highWaterMark));
        if (sndBuf > 0)
            bootstrap.childOption(ChannelOption.SO_SNDBUF, sndBuf);
        if (rcvBuf > 0)
            bootstrap.childOption(ChannelOption.SO_RCVBUF, rcvBuf);
        if (backlog > 0)
            bootstrap.option(ChannelOption.SO_BACKLOG, backlog);

        bootstrap.group(bossGroup, workerGroup).childHandler(initializer);

        List<ChannelFuture> futures = new ArrayList<>();
        for (Map.Entry<String, Integer> e : mapAddress.entrySet())
            futures.add(bootstrap.bind(Address.getInetSocketAddress(e.getKey(), e.getValue())));

        StringBuilder sb = new StringBuilder();
        for (ChannelFuture future : futures)
        {
            Channel channel = future.sync().channel();
            channels.add(channel);

            InetSocketAddress address = (InetSocketAddress) channel.localAddress();
            sb.append(address.getHostName()).append(':').append(address.getPort()).append(',');
        }

        MetricLog.info("WebSocketServer", "start", id, mapAddress);
        return true;
    }


    public synchronized boolean stop ()
    {
        if (bossGroup == null || workerGroup == null)
            return false;

        MetricLog.info("WebSocketServer", "stop", id);
        for (Channel channel : channels)
            channel.close();
        channels.clear();
        if (!ShareLoopGroup.isShareLoopGroop(bossGroup))
            bossGroup.shutdownGracefully();
        bossGroup = null;
        if (!ShareLoopGroup.isShareLoopGroop(workerGroup))
            workerGroup.shutdownGracefully();
        workerGroup = null;
        return true;
    }

    public WebSocketServer setWaterMark (int highWaterMark, int lowWaterMark)
    {
        this.highWaterMark = highWaterMark;
        this.lowWaterMark = lowWaterMark;
        return this;
    }

    public WebSocketServer setBuf (int sndBuf, int rcvBuf)
    {
        this.sndBuf = sndBuf;
        this.rcvBuf = rcvBuf;
        return this;
    }

    public WebSocketServer setBacklog (int backlog)
    {
        this.backlog = backlog;
        return this;
    }

    public WebSocketServer setNumThread (int numBossThread, int numWorkerThread)
    {
        this.numBossThread = numBossThread;
        this.numWorkerThread = numWorkerThread;
        return this;
    }
}
