package util.io.socket;

import bitzero.util.common.business.Debug;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.handler.timeout.IdleStateHandler;
import util.metric.MetricLog;

import java.util.concurrent.TimeUnit;

/**
 * Created by thuanvt on 12/10/2014.
 */
public class SocketClientHandler extends SimpleChannelInboundHandler<ByteBuf>
{
    private ChannelHandlerContext ctx;

    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        Debug.trace("[ACTIVE]");
        this.ctx = ctx;
    }

    @Override
    public void channelInactive (ChannelHandlerContext ctx) throws Exception
    {
        Debug.trace("[INACTIVE]");
    }

    @Override
    public void channelRead0 (ChannelHandlerContext ctx, ByteBuf msg) throws Exception
    {
        writeAndFlush(msg);
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
            Debug.trace("[IDLE]");
            ctx.close();
        }
    }

    public void writeAndFlush (byte[] data)
    {
        int len = data.length;
        ctx.writeAndFlush(ctx.alloc().buffer(len + SocketServerDecoder.HEADER_LEN)
                             .writeInt(len)
                             .writeBytes(data));
    }

    public void writeAndFlush (ByteBuf data)
    {
        int len = data.readableBytes();
        ctx.writeAndFlush(ctx.alloc().buffer(len + SocketServerDecoder.HEADER_LEN)
                             .writeInt(len)
                             .writeBytes(data));
    }

    public void close ()
    {
        if (ctx != null)
            ctx.close();
    }

    public void removeIdleTime ()
    {
        ChannelPipeline pipeline = ctx.pipeline();
        if (pipeline.get(SocketClientInitializer.PIPELINE_IDLE) != null)
            pipeline.remove(SocketClientInitializer.PIPELINE_IDLE);
    }

    public void setIdleTime (int idleTimeReader, int idleTimeWriter, int idleTimeAll)
    {
        removeIdleTime();
        ctx.pipeline().addFirst(SocketClientInitializer.PIPELINE_IDLE, new IdleStateHandler(idleTimeReader, idleTimeWriter, idleTimeAll, TimeUnit.MILLISECONDS));
    }
}
