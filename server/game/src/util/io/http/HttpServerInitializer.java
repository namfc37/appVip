package util.io.http;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.timeout.IdleStateHandler;


public class HttpServerInitializer extends ChannelInitializer<SocketChannel>
{
    final static int IDLE_TIME_READER = 5; //second
    final static int IDLE_TIME_WRITER = 60; //second
    final static int IDLE_TIME_ALL    = 0; //second

    // Uncomment the following line if you support https
//    final SslContext sslCtx;

    public HttpServerInitializer () throws Exception
    {
        // Uncomment the following line if you support https
//        SelfSignedCertificate ssc = new SelfSignedCertificate();
//        SelfSignedCertificate ssc = new SelfSignedCertificate("domain.com");

        // Uncomment one line in the following line if you support https
//        sslCtx = SslContext.newServerContext(ssc.certificate(), ssc.privateKey()); //old netty, not using key file
//        sslCtx = SslContext.newServerContext(new File("./config/domain.crt"), new File("./config/domain.key")); //old netty, using key file
//        sslCtx = SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey()).build(); //new netty, not using key file
//        sslCtx = SslContextBuilder.forServer(new File("./config/domain.crt"), new File("./config/domain.key")).build(); //new netty, using key file
    }

    @Override
    public void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        // Support idle
        p.addLast(new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));

        // Uncomment the following line if you support https
//        p.addLast(sslCtx.newHandler(ch.alloc()));

        p.addLast(new HttpServerCodec(4096, 8192, 8192, false));

        // Uncomment the following line if you don't want to handle HttpChunks.
//        p.addLast(new HttpObjectAggregator(1048576));

        // Uncomment the following line if you don't want automatic content compression.
//        p.addLast(new HttpContentCompressor());

        p.addLast(new HttpServerHandler());
    }
}
