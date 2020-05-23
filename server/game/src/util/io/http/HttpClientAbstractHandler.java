package util.io.http;

import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.timeout.IdleStateEvent;
import util.metric.MetricLog;


/**
 * Created by thuanvt on 11/11/2014.
 */
public abstract class HttpClientAbstractHandler extends SimpleChannelInboundHandler<HttpObject> implements ChannelFutureListener
{
    public HttpRequest request;

    public abstract void connectFail ();

    public abstract void idle ();

    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        ctx.writeAndFlush(request);
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        ctx.close();
        MetricLog.exception(cause);
    }

    @Override
    public void userEventTriggered (ChannelHandlerContext ctx, Object evt) throws Exception
    {
        if (evt instanceof IdleStateEvent)
        {
            ctx.close();
        }
    }

    @Override
    public void operationComplete (ChannelFuture future) throws Exception
    {
        if (future.isDone() == false || future.isSuccess() == false)
            connectFail();
    }
}
