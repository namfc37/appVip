package util.io.socket;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.timeout.IdleStateHandler;

/**
 * Created by thuanvt on 10/14/2014.
 */
public class SocketServerInitializer extends ChannelInitializer<SocketChannel>
{
    final static String PIPELINE_IDLE = "idle";

    final static int IDLE_TIME_READER = 5; //second
    final static int IDLE_TIME_WRITER = 60; //second
    final static int IDLE_TIME_ALL    = 0; //second

    @Override
    protected void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        p.addLast(PIPELINE_IDLE, new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));
        p.addLast(new SocketServerDecoder());
        p.addLast(new SocketServerHandler());
    }
}
