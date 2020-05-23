package util.io.socket;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.PooledByteBufAllocator;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.WriteBufferWaterMark;
import io.netty.channel.socket.nio.NioSocketChannel;
import util.io.ShareLoopGroup;

import java.net.InetSocketAddress;

/**
 * Created by thuanvt on 12/10/2014.
 */
public class SocketClient
{
    private static int highWaterMark = 32 * 1024;
    private static int lowWaterMark  = 8 * 1024;
    private static int sndBuf, rcvBuf;

    public synchronized static void setWaterMark (int highWaterMark, int lowWaterMark)
    {
        SocketClient.highWaterMark = highWaterMark;
        SocketClient.lowWaterMark = lowWaterMark;
    }

    public synchronized static void setBuf (int sndBuf, int rcvBuf)
    {
        SocketClient.sndBuf = sndBuf;
        SocketClient.rcvBuf = rcvBuf;
    }

    public static void connect (EventLoopGroup eventLoopGroup,
                                String inetHost,
                                int inetPort,
                                int connectTimeout,
                                SocketClientAbstractInitializer initializer) throws Exception
    {
        Bootstrap bootstrap = new Bootstrap()
                .channel(NioSocketChannel.class)
                .option(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT)
                .option(ChannelOption.SO_KEEPALIVE, true)
                .option(ChannelOption.TCP_NODELAY, true)
                .group((eventLoopGroup == null) ? ShareLoopGroup.worker() : eventLoopGroup);

        if (highWaterMark > 0 && lowWaterMark > 0)
            bootstrap.option(ChannelOption.WRITE_BUFFER_WATER_MARK, new WriteBufferWaterMark(lowWaterMark, highWaterMark));
        if (sndBuf > 0)
            bootstrap.option(ChannelOption.SO_SNDBUF, sndBuf);
        if (rcvBuf > 0)
            bootstrap.option(ChannelOption.SO_RCVBUF, rcvBuf);

        bootstrap.handler(initializer)
                 .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeout)
                 .connect(new InetSocketAddress(inetHost, inetPort))
                 .addListener(initializer);
    }
}
