package util.io.socket;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;

import java.util.List;

/**
 * Created by thuanvt on 10/14/2014.
 */
public class SocketServerDecoder extends ByteToMessageDecoder
{
    private boolean isClosed = false;

    final static int    HEADER_LEN              = 4;
    final static int    MAX_CLIENT_PACKAGE_SIZE = 65000;
    final static byte[] CROSS_DOMAIN            = "<cross-domain-policy><allow-access-from domain=\"*\" to-ports=\"*\" /></cross-domain-policy>".getBytes();

    @Override
    protected void decode (ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception
    {
        if (isClosed)
        {
            skipBytes(in);
            return;
        }
        if (in.readableBytes() <= HEADER_LEN) //4 byte len, x byte data
            return;
        in.markReaderIndex();
        int bodyLen = in.readInt();

        //Dùng đoạn code sau khi chạy với flash. 1014001516 là 4 ký tự đầu của chuỗi <policy-file-request/>
        if (bodyLen == 1014001516)
        {
            ctx.writeAndFlush(Unpooled.wrappedBuffer(CROSS_DOMAIN));
            close(ctx, in);
        }
        else if (bodyLen <= 0 || bodyLen > MAX_CLIENT_PACKAGE_SIZE)
        {
            close(ctx, in);
        }
        else if (bodyLen > in.readableBytes())
        {
            in.resetReaderIndex();
        }
        else
        {
            out.add(in.readBytes(bodyLen));
        }
    }

    private void skipBytes (ByteBuf in)
    {
        int len = in.readableBytes();
        if (len > 0)
            in.skipBytes(len);
    }

    private void close (ChannelHandlerContext ctx, ByteBuf in)
    {
        isClosed = true;
        skipBytes(in);
        ctx.close();
    }
}
