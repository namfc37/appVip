package util.io.socket;

import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;

/**
 * Created by CPU10399-local on 1/14/2016.
 */
public abstract class SocketClientAbstractInitializer extends ChannelInitializer<SocketChannel> implements ChannelFutureListener
{
    public abstract void connectFail ();

    @Override
    public void operationComplete (ChannelFuture future) throws Exception
    {
        if (future.isDone() == false || future.isSuccess() == false)
            connectFail();
    }
}
