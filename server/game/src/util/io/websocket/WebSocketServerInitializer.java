package util.io.websocket;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.timeout.IdleStateHandler;


public class WebSocketServerInitializer extends ChannelInitializer<SocketChannel>
{
    final static String PIPELINE_IDLE = "idle";

    final static int IDLE_TIME_READER = 5; //second
    final static int IDLE_TIME_WRITER = 60; //second
    final static int IDLE_TIME_ALL    = 0; //second

    // Uncomment the following line if you support https
//    final SslContext sslCtx;

    public WebSocketServerInitializer () throws Exception
    {
        // Uncomment the following line if you support https
//        SelfSignedCertificate ssc = new SelfSignedCertificate();
//        sslCtx = SslContext.newServerContext(ssc.certificate(), ssc.privateKey());
    }

    @Override
    public void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        // Support idle
        p.addLast(PIPELINE_IDLE, new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));

        // Uncomment the following line if you support https
//        p.addLast(sslCtx.newHandler(ch.alloc()));

        p.addLast(new HttpServerCodec(4096, 8192, 8192, false));

        // Uncomment the following line if you don't want to handle HttpChunks.
        p.addLast(new HttpObjectAggregator(1048576));

        // Uncomment the following line if you don't want automatic content compression.
//        p.addLast(new HttpContentCompressor());

        p.addLast(new WebSocketServerHandler());
    }
}
