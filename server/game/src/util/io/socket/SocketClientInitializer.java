package util.io.socket;

import bitzero.util.common.business.Debug;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.timeout.IdleStateHandler;

/**
 * Created by thuanvt on 12/11/2014.
 */
public class SocketClientInitializer extends SocketClientAbstractInitializer
{
    final static String PIPELINE_IDLE    = "idle";
    final static String PIPELINE_DECODER = "decoder";
    final static String PIPELINE_HANDLER = "handler";

    final static int IDLE_TIME_READER = 0; //second
    final static int IDLE_TIME_WRITER = 0; //second
    final static int IDLE_TIME_ALL    = 60; //second

    @Override
    protected void initChannel (SocketChannel ch) throws Exception
    {
        ChannelPipeline p = ch.pipeline();
        p.addLast(PIPELINE_IDLE, new IdleStateHandler(IDLE_TIME_READER, IDLE_TIME_WRITER, IDLE_TIME_ALL));
        p.addLast(PIPELINE_DECODER, new SocketServerDecoder());
        p.addLast(PIPELINE_HANDLER, new SocketServerHandler());
    }

    @Override
    public void connectFail ()
    {
        Debug.trace("connectFail");
    }
}
