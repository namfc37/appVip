package service.balance;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.cors.CorsConfigBuilder;
import io.netty.handler.codec.http.cors.CorsHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.timeout.IdleStateHandler;


public class HttpServerInitializer extends ChannelInitializer<SocketChannel>
{
    final static int IDLE_TIME_READER = 0; //second
    final static int IDLE_TIME_WRITER = 0; //second
    final static int IDLE_TIME_ALL    = 3; //second

    final SslContext sslCtx;

    public HttpServerInitializer () throws Exception
    {
        sslCtx = null;
    }

    public HttpServerInitializer (SslContext sslCtx) throws Exception
    {
        this.sslCtx = sslCtx;
    }

    @Override
    public void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        // Support idle
        p.addLast(new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));

        if (sslCtx != null)
            p.addLast(sslCtx.newHandler(ch.alloc()));

        p.addLast(new HttpServerCodec());
        //p.addLast(new CorsHandler(CorsConfigBuilder.forAnyOrigin().build()));
        p.addLast(new HttpServerHandler());
    }
}
