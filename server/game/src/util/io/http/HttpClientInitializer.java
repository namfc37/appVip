package util.io.http;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpContentDecompressor;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.timeout.IdleStateHandler;

import java.util.concurrent.TimeUnit;

/**
 * Created by thuanvt on 11/11/2014.
 */
public class HttpClientInitializer extends ChannelInitializer<SocketChannel>
{
    private final boolean                   isHttps;
    private final int                       idleTime;
    private final int                       maxContentLength;
    private final boolean                   useDecompress;
    private final String                    peerHost;
    private final int                       peerPort;
    private final HttpClientAbstractHandler handler;

    public HttpClientInitializer (boolean isHttps,
                                  int idleTime,
                                  int maxContentLength,
                                  boolean useDecompress,
                                  HttpClientAbstractHandler handler,
                                  String peerHost,
                                  int peerPort)
    {
        this.isHttps = isHttps;
        this.idleTime = idleTime;
        this.maxContentLength = maxContentLength;
        this.useDecompress = useDecompress;
        this.handler = handler;
        this.peerHost = peerHost;
        this.peerPort = peerPort;
    }

    @Override
    protected void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        if (idleTime != 0)
            p.addLast(new IdleStateHandler(0, 0, idleTime, TimeUnit.MILLISECONDS));
        if (isHttps)
        {
            if (peerHost == null)
                p.addLast(HttpClient.sslCtx.newHandler(ch.alloc()));
            else
                p.addLast(HttpClient.sslCtx.newHandler(ch.alloc(), peerHost, peerPort));
        }
        p.addLast(new HttpClientCodec());
        if (useDecompress)
            p.addLast(new HttpContentDecompressor());
        if (maxContentLength > 0)
            p.addLast(new HttpObjectAggregator(maxContentLength));
        p.addLast(handler);
    }
}
