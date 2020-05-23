package util.io.udp;


import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.socket.DatagramPacket;
import io.netty.util.CharsetUtil;
import util.metric.MetricLog;

import java.net.InetSocketAddress;


/**
 * Created by thuanvt on 11/18/2014.
 */
public class UdpHandler extends SimpleChannelInboundHandler<DatagramPacket>
{
    private ChannelHandlerContext ctx;

    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        this.ctx = ctx;
    }

    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, DatagramPacket msg) throws Exception
    {
        write(msg.sender(), msg.content().toString(CharsetUtil.UTF_8));
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        MetricLog.exception(cause);
    }

    private void write (InetSocketAddress address, CharSequence cs)
    {
        write(address, Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8));
    }

    public void write (InetSocketAddress address, byte[] data)
    {
        write(address, Unpooled.wrappedBuffer(data));
    }

    public void write (InetSocketAddress address, ByteBuf buf)
    {
        ctx.writeAndFlush(new DatagramPacket(buf, address));
    }
}
