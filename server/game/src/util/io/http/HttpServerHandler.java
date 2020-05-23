package util.io.http;

import bitzero.util.common.business.Debug;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.util.CharsetUtil;
import util.metric.MetricLog;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.LongAdder;

import static io.netty.handler.codec.http.HttpHeaderNames.*;
import static io.netty.handler.codec.http.HttpHeaderValues.NO_CACHE;
import static io.netty.handler.codec.http.HttpResponseStatus.OK;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * Created by thuanvt on 10/17/2014.
 */
public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject>
{
    private final static LongAdder curConnection = new LongAdder();

    private       ChannelHandlerContext ctx;
    private final StringBuilder         buf = new StringBuilder();

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
    public void channelRead0 (ChannelHandlerContext ctx, HttpObject msg)
    {
        if (msg instanceof HttpRequest)
        {
            HttpRequest request = (HttpRequest) msg;

            buf.setLength(0);
            buf.append("===================================\r\n");

            buf.append("VERSION: ").append(request.protocolVersion()).append("\r\n");
            buf.append("HOSTNAME: ").append(request.headers().get(HttpHeaderNames.HOST)).append("\r\n");
            buf.append("REQUEST_URI: ").append(request.uri()).append("\r\n\r\n");

            HttpHeaders headers = request.headers();
            if (!headers.isEmpty())
            {
                for (Map.Entry<String, String> h : headers)
                {
                    String key = h.getKey();
                    String value = h.getValue();
                    buf.append("HEADER: ").append(key).append(" = ").append(value).append("\r\n");
                }
                buf.append("\r\n");
            }

            QueryStringDecoder queryStringDecoder = new QueryStringDecoder(request.uri());
            Map<String, List<String>> params = queryStringDecoder.parameters();
            if (!params.isEmpty())
            {
                for (Map.Entry<String, List<String>> p : params.entrySet())
                {
                    String key = p.getKey();
                    List<String> vals = p.getValue();
                    for (String val : vals)
                    {
                        buf.append("PARAM: ").append(key).append(" = ").append(val).append("\r\n");
                    }
                }
                buf.append("\r\n");
            }
        }

        if (msg instanceof HttpContent)
        {
            HttpContent httpContent = (HttpContent) msg;

            ByteBuf content = httpContent.content();
            if (content.isReadable())
            {
                buf.append("CONTENT: ");
                buf.append(content.toString(CharsetUtil.UTF_8));
                buf.append("\r\n");
            }

            if (msg instanceof LastHttpContent)
            {
                buf.append("END OF CONTENT\r\n");

                LastHttpContent trailer = (LastHttpContent) msg;
                if (!trailer.trailingHeaders().isEmpty())
                {
                    buf.append("\r\n");
                    for (String name : trailer.trailingHeaders().names())
                    {
                        for (String value : trailer.trailingHeaders().getAll(name))
                        {
                            buf.append("TRAILING HEADER: ");
                            buf.append(name).append(" = ").append(value).append("\r\n");
                        }
                    }
                    buf.append("\r\n");
                }

                writeTextAndClose(buf);
            }
        }
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

    public void close ()
    {
        ctx.close();
    }

    public static int getCurConnection ()
    {
        return curConnection.intValue();
    }

    public void writeTextAndClose (CharSequence cs)
    {
        writeHttpResponseAndClose(Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8), "text/plain; charset=UTF-8");
    }

    public void writeHtmlAndClose (CharSequence cs)
    {
        writeHttpResponseAndClose(Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8), "text/html; charset=UTF-8");
    }

    public void writeBinAndClose (byte[] bin)
    {
        writeHttpResponseAndClose(Unpooled.wrappedBuffer(bin), "application/octet-stream");
    }

    public void writeBinAndClose (ByteBuf buf)
    {
        writeHttpResponseAndClose(buf, "application/octet-stream");
    }

    public void writeHttpResponseAndClose (ByteBuf buf, String contentType)
    {
        DefaultFullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK, buf);
        HttpHeaders headers = response.headers();
        headers.set(CONTENT_TYPE, contentType);
        headers.set(CACHE_CONTROL, NO_CACHE);
        headers.set(CONTENT_LENGTH, buf.readableBytes());

        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
}
