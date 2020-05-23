package service.admin;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.util.CharsetUtil;
import util.metric.MetricLog;

import java.util.concurrent.atomic.LongAdder;

import static io.netty.handler.codec.http.HttpHeaderNames.*;
import static io.netty.handler.codec.http.HttpHeaderValues.NO_CACHE;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * Created by thuanvt on 10/17/2014.
 */
public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject>
{
    private final static LongAdder curConnection = new LongAdder();

    ChannelHandlerContext ctx;
    String                path;
    String                content;
    String                remoteAddress;

    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        curConnection.increment();
        this.ctx = ctx;
    }

    @Override
    public void channelInactive (ChannelHandlerContext ctx) throws Exception
    {
        curConnection.decrement();
    }

    @Override
    public void channelRead0 (ChannelHandlerContext ctx, HttpObject msg)
    {
        if (msg instanceof HttpRequest)
        {
            HttpRequest request = (HttpRequest) msg;
            QueryStringDecoder query = new QueryStringDecoder(request.uri());
            path = query.path();

            if (path.equals("/alive"))
            {
                writeTextAndClose("yes");
                return;
            }
        }

        if (msg instanceof HttpContent)
        {
            HttpContent httpContent = (HttpContent) msg;
            ByteBuf bufContent = httpContent.content();
            if (bufContent.isReadable())
            {
                content = bufContent.toString(CharsetUtil.UTF_8);
            }

            if (msg instanceof LastHttpContent)
            {
                remoteAddress = ctx.channel().remoteAddress().toString();
                remoteAddress = remoteAddress.substring(1, remoteAddress.indexOf(':'));

                AdminHandler.handle(this);
            }
        }
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        ctx.close();
        if (cause instanceof java.io.IOException)
        {
            String msg = cause.getMessage();
            if ((msg == null)
                    || msg.equals("An existing connection was forcibly closed by the remote host")
                    || msg.equals("Connection reset by peer")
                    || msg.equals("Connection timed out")
                    || msg.equals("No route to host")
            )
                return;
        }
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

    public void close ()
    {
        ctx.close();
    }

    public static int getCurConnection ()
    {
        return curConnection.intValue();
    }

    public void writeHttpResponseAndClose (HttpResponseStatus status)
    {
        DefaultFullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, status);

        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    public void writeTextAndClose (CharSequence cs)
    {
        writeHttpResponseAndClose(HttpResponseStatus.OK, Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8), "text/plain; charset=UTF-8");
    }

    public void writeHttpResponseAndClose (HttpResponseStatus status, ByteBuf buf, String contentType)
    {
        DefaultFullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, status, buf);
        HttpHeaders headers = response.headers();
        headers.set(CONTENT_TYPE, contentType);
        headers.set(CACHE_CONTROL, NO_CACHE);
        headers.set(CONTENT_LENGTH, buf.readableBytes());
        headers.set(ACCESS_CONTROL_ALLOW_ORIGIN, "*");

        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
}
