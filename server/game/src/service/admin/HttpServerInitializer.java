package service.admin;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpContentCompressor;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.timeout.IdleStateHandler;


public class HttpServerInitializer extends ChannelInitializer<SocketChannel>
{
    final static int IDLE_TIME_READER = 5; //second
    final static int IDLE_TIME_WRITER = 60; //second
    final static int IDLE_TIME_ALL    = 0; //second

    public HttpServerInitializer () throws Exception
    {
    }

    @Override
    public void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        // Support idle
        p.addLast(new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));
        p.addLast(new HttpServerCodec());
        p.addLast(new HttpObjectAggregator(1048576));
        p.addLast(new HttpContentCompressor());
        p.addLast(new HttpServerHandler());
    }
}
