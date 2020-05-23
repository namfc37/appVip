package util.io.http;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.util.CharsetUtil;

import java.util.List;
import java.util.Map;

import static io.netty.handler.codec.http.HttpHeaderNames.*;
import static io.netty.handler.codec.http.HttpHeaderValues.NO_CACHE;
import static io.netty.handler.codec.http.HttpResponseStatus.OK;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * Created by CPU10399-local on 6/23/2015.
 */
public class HttpUtils
{
    public static String getFirstParam (Map<String, List<String>> params, String key)
    {
        if (params != null)
        {
            List<String> values = params.get(key);
            if (values != null && values.isEmpty() == false)
                return values.get(0);
        }
        return null;
    }

    public static boolean getFirstParam (Map<String, List<String>> params, String key, boolean defaultValue)
    {
        String v = getFirstParam(params, key);
        return (v == null) ? defaultValue : Boolean.parseBoolean(v);
    }

    public static String getFirstParam (Map<String, List<String>> params, String key, String defaultValue)
    {
        String v = getFirstParam(params, key);
        return (v == null) ? defaultValue : v;
    }

    public static int getFirstParam (Map<String, List<String>> params, String key, int defaultValue)
    {
        String v = getFirstParam(params, key);
        try
        {
            return Integer.parseInt(v);
        }
        catch (Exception e)
        {
        }
        return defaultValue;
    }

    public static long getFirstParam (Map<String, List<String>> params, String key, long defaultValue)
    {
        String v = getFirstParam(params, key);
        try
        {
            return Long.parseLong(v);
        }
        catch (Exception e)
        {
        }
        return defaultValue;
    }

    public static void writeTextAndClose (ChannelHandlerContext ctx, CharSequence cs, HttpResponseStatus status)
    {
        writeHttpResponseAndClose(ctx, Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8), "text/plain; charset=UTF-8", status);
    }

    public static void writeTextAndClose (ChannelHandlerContext ctx, CharSequence cs)
    {
        writeTextAndClose(ctx, cs, OK);
    }

    public static void writeBinAndClose (ChannelHandlerContext ctx, byte[] bin)
    {
        writeHttpResponseAndClose(ctx, Unpooled.wrappedBuffer(bin), "application/octet-stream", OK);
    }

    public static void writeHttpResponseAndClose (ChannelHandlerContext ctx, ByteBuf buf, String contentType, HttpResponseStatus status)
    {
        DefaultFullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, status, buf);
        HttpHeaders headers = response.headers();
        headers.set(CONTENT_TYPE, contentType);
        headers.set(CACHE_CONTROL, NO_CACHE);
        headers.set(CONTENT_LENGTH, buf.readableBytes());
        headers.set(ACCESS_CONTROL_ALLOW_ORIGIN, "*"); //cross domain policy

        ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
}
