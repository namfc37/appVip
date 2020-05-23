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
import java.util.concurrent.atomic.LongAdder;

/**
 * Created by thuanvt on 10/14/2014.
 */
public class SocketServerHandler extends SimpleChannelInboundHandler<ByteBuf>
{
    private final static LongAdder curConnection = new LongAdder();

    private ChannelHandlerContext ctx;

    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        curConnection.increment();
        Debug.trace("[ACTIVE]", curConnection.sum());
        this.ctx = ctx;
    }

    @Override
    public void channelInactive (ChannelHandlerContext ctx) throws Exception
    {
        curConnection.decrement();
        Debug.trace("[INACTIVE]", curConnection.sum());
    }

    @Override
    public void channelRead0 (ChannelHandlerContext ctx, ByteBuf msg) throws Exception
    {
        writeAndFlush(msg);
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        if (cause instanceof java.io.IOException)
        {
            String msg = cause.getMessage();
            //Không log những exception disconnect của client
            if ((msg == null)
                    || msg.equals("An existing connection was forcibly closed by the remote host")
                    || msg.equals("Connection reset by peer")
                    || msg.equals("Connection timed out")
                    || msg.equals("No route to host")
                    || msg.equals("Connection refused")
                //|| msg.equals("Network is unreachable")
            )
            {
                close();
                return;
            }
        }
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

    public void removeIdleTime ()
    {
        ChannelPipeline pipeline = ctx.pipeline();
        if (pipeline.get(SocketServerInitializer.PIPELINE_IDLE) != null)
            pipeline.remove(SocketServerInitializer.PIPELINE_IDLE);
    }

    public void setIdleTime (int idleTimeReader, int idleTimeWriter, int idleTimeAll)
    {
        removeIdleTime();
        ctx.pipeline().addFirst(SocketServerInitializer.PIPELINE_IDLE, new IdleStateHandler(idleTimeReader, idleTimeWriter, idleTimeAll, TimeUnit.MILLISECONDS));
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
        ctx.close();
    }

    public static int getCurConnection ()
    {
        return curConnection.intValue();
    }

    public String getRemoteAddress ()
    {
        return ctx.channel().remoteAddress().toString();
    }
}
