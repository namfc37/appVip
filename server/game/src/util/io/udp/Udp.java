package util.io.udp;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.PooledByteBufAllocator;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelOption;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.DatagramPacket;
import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.util.CharsetUtil;
import util.Address;
import util.io.BootstrapInfo;
import util.io.ShareLoopGroup;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.util.Map;

/**
 * Created by thuanvt on 11/18/2014.
 */
public class Udp
{
    private String            id;
    private String            host;
    private int               port;
    private Bootstrap         bootstrap;
    private NioEventLoopGroup workerGroup;
    private Channel           channel;

    private int sndBuf, rcvBuf;
    private int numBossThread;

    private Udp (String id)
    {
        this.id = id;
        bootstrap = new Bootstrap()
                .channel(NioDatagramChannel.class)
                .option(ChannelOption.SO_BROADCAST, true)
                .option(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT);
    }

    public Udp (String id, BootstrapInfo info)
    {
        this(id);

        for (Map.Entry<String, Integer> entry : info.getMapAddress().entrySet())
        {
            host = entry.getKey();
            port = entry.getValue();
            break;
        }
        sndBuf = info.getSndBuf();
        rcvBuf = info.getRcvBuf();
        numBossThread = info.getNumBossThread();
    }

    public Bootstrap getBootstrap ()
    {
        return bootstrap;
    }

    public synchronized boolean start (ChannelInboundHandlerAdapter handler) throws Exception
    {
        if (channel != null)
            return false;

        if (numBossThread <= 0)
            workerGroup = ShareLoopGroup.worker();
        else
            workerGroup = new NioEventLoopGroup(1);

        if (sndBuf > 0)
            bootstrap.option(ChannelOption.SO_SNDBUF, sndBuf);
        if (rcvBuf > 0)
            bootstrap.option(ChannelOption.SO_RCVBUF, rcvBuf);

        MetricLog.console("UDP", "STARTING", id, "host", host, "port", port,
                          "workerThread", workerGroup.executorCount(),
                          "sndBuf", sndBuf,
                          "rcvBuf", rcvBuf
                         );
        channel = bootstrap.group(workerGroup)
                           .handler(handler)
                           .bind(Address.getInetSocketAddress(host, port))
                           .sync()
                           .channel();
        InetSocketAddress address = (InetSocketAddress) channel.localAddress();
        host = address.getHostName();
        port = address.getPort();

        MetricLog.console("UDP", "RUNNING", id, "host", host, "port", port);

        return true;
    }

    public synchronized void stop ()
    {
        MetricLog.console("UDP", "STOPPING", id, host + ":" + port);
        channel.close();
        channel = null;
        if (!ShareLoopGroup.isShareLoopGroop(workerGroup))
            workerGroup.shutdownGracefully();
        workerGroup = null;
    }

    public void write (InetSocketAddress address, CharSequence cs)
    {
        write(address, Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8));
    }

    public void write (InetSocketAddress address, byte[] data)
    {
        write(address, Unpooled.wrappedBuffer(data));
    }

    public void write (InetSocketAddress address, ByteBuf buf)
    {
        channel.writeAndFlush(new DatagramPacket(buf, address));
    }

    public Udp setBuf (int sndBuf, int rcvBuf)
    {
        this.sndBuf = sndBuf;
        this.rcvBuf = rcvBuf;
        return this;
    }

    public String getHost ()
    {
        return host;
    }

    public int getPort ()
    {
        return port;
    }

    /*
    public static void send (InetSocketAddress address, String input, boolean isBroadcast) throws IOException
    {
        send(address, input.getBytes(StandardCharsets.UTF_8), isBroadcast);
    }

    public static void send (InetSocketAddress address, byte[] input, boolean isBroadcast) throws IOException
    {
        DatagramSocket socket = new DatagramSocket();
        try
        {
            java.net.DatagramPacket packet = new java.net.DatagramPacket(input, input.length, address);
            if (isBroadcast)
                socket.setBroadcast(true);
            socket.send(packet);
        }
        finally
        {
            socket.close();
        }
    }
    */
}
