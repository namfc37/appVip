package util.io.http;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.PooledByteBufAllocator;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.*;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.netty.util.CharsetUtil;
import util.io.ShareLoopGroup;
import util.io.UrlEncoder;
import util.metric.MetricLog;

import java.net.InetSocketAddress;
import java.net.URL;
import java.util.Map;

import static io.netty.handler.codec.http.HttpHeaderNames.*;
import static io.netty.handler.codec.http.HttpHeaderValues.*;

/**
 * Created by thuanvt on 11/11/2014.
 */
public class HttpClient
{
    public static SslContext sslCtx;

    private static int sndBuf, rcvBuf;

    public synchronized static void setBuf (int sndBuf, int rcvBuf)
    {
        HttpClient.sndBuf = sndBuf;
        HttpClient.rcvBuf = rcvBuf;
    }

    static
    {
        try
        {
            sslCtx = SslContextBuilder.forClient().trustManager(InsecureTrustManagerFactory.INSTANCE).build();
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    public static void sendHttpGetRequest (String urlSpec,
                                           HttpClientAbstractHandler handler,
                                           int connectTimeout,
                                           int idleTime) throws Exception
    {
        Debug.info("sendHttpGetRequest", urlSpec);

        sendHttpRequest(null,
                        urlSpec,
                        HttpMethod.GET,
                        null,
                        null,
                        handler,
                        connectTimeout,
                        idleTime,
                        0,
                        false,
                        false
                       );
    }

    public static void sendHttpGetRequest (String urlSpec,
                                           JsonObject params,
                                           HttpClientAbstractHandler handler,
                                           int connectTimeout,
                                           int idleTime) throws Exception
    {
        UrlEncoder encoder = new UrlEncoder(urlSpec);
        for (Map.Entry<String, JsonElement> entry : params.entrySet())
            encoder.addParam(entry.getKey(), entry.getValue().getAsString());

        sendHttpGetRequest(encoder.toString(), handler, connectTimeout, idleTime);
    }

    public static void sendHttpPostUrlEncoded (String urlSpec,
                                         JsonObject params,
                                         HttpClientAbstractHandler handler,
                                         int connectTimeout,
                                         int idleTime) throws Exception
    {
        UrlEncoder encoder = new UrlEncoder("");
        for (Map.Entry<String, JsonElement> entry : params.entrySet())
            encoder.addParam(entry.getKey(), entry.getValue().getAsString());
        String content = encoder.toString().substring(1);

        sendHttpRequest(null,
                        urlSpec,
                        HttpMethod.POST,
                        Unpooled.copiedBuffer(content, CharsetUtil.UTF_8),
                        "application/x-www-form-urlencoded",
                        handler,
                        connectTimeout,
                        idleTime,
                        0,
                        false,
                        false
                       );
    }

    public static void sendHttpPostText (String urlSpec,
                                         String content,
                                         HttpClientAbstractHandler handler,
                                         int connectTimeout,
                                         int idleTime) throws Exception
    {
        sendHttpRequest(null,
                        urlSpec,
                        HttpMethod.POST,
                        Unpooled.copiedBuffer(content, CharsetUtil.UTF_8),
                        "text/plain; charset=UTF-8",
                        handler,
                        connectTimeout,
                        idleTime,
                        0,
                        false,
                        false
                       );
    }

    public static void sendHttpPostJson (String urlSpec,
                                         String content,
                                         HttpClientAbstractHandler handler,
                                         int connectTimeout,
                                         int idleTime) throws Exception
    {
        sendHttpRequest(null,
                        urlSpec,
                        HttpMethod.POST,
                        Unpooled.copiedBuffer(content, CharsetUtil.UTF_8),
                        "application/json; charset=UTF-8",
                        handler,
                        connectTimeout,
                        idleTime,
                        0,
                        false,
                        false
                       );
    }

    public static void sendHttpRequest (EventLoopGroup eventLoopGroup,
                                        String urlSpec,
                                        HttpClientAbstractHandler handler,
                                        int connectTimeout,
                                        int idleTime) throws Exception
    {
        sendHttpRequest(eventLoopGroup,
                        urlSpec,
                        HttpMethod.GET,
                        null,
                        null,
                        handler,
                        connectTimeout,
                        idleTime,
                        0,
                        false,
                        false
                       );
    }

    public static void sendHttpRequest (EventLoopGroup eventLoopGroup,
                                        String urlSpec,
                                        HttpMethod method,
                                        HttpClientAbstractHandler handler,
                                        int connectTimeout,
                                        int idleTime,
                                        int maxContentLength,
                                        boolean useDecompress) throws Exception
    {
        sendHttpRequest(eventLoopGroup,
                        urlSpec,
                        method,
                        null,
                        null,
                        handler,
                        connectTimeout,
                        idleTime,
                        maxContentLength,
                        useDecompress,
                        false
                       );
    }

    public static void sendHttpRequest (EventLoopGroup eventLoopGroup,
                                        String urlSpec,
                                        HttpMethod method,
                                        String content,
                                        HttpClientAbstractHandler handler,
                                        int connectTimeout,
                                        int idleTime,
                                        int maxContentLength,
                                        boolean useDecompress) throws Exception
    {
        sendHttpRequest(eventLoopGroup,
                        urlSpec,
                        method,
                        Unpooled.copiedBuffer(content, CharsetUtil.UTF_8),
                        "text/plain; charset=UTF-8",
                        handler,
                        connectTimeout,
                        idleTime,
                        maxContentLength,
                        useDecompress,
                        false
                       );
    }

    public static void sendHttpRequest (EventLoopGroup eventLoopGroup,
                                        String urlSpec,
                                        HttpMethod method,
                                        byte[] content,
                                        HttpClientAbstractHandler handler,
                                        int connectTimeout,
                                        int idleTime,
                                        int maxContentLength,
                                        boolean useDecompress) throws Exception
    {
        sendHttpRequest(eventLoopGroup,
                        urlSpec,
                        method,
                        Unpooled.wrappedBuffer(content),
                        "application/octet-stream",
                        handler,
                        connectTimeout,
                        idleTime,
                        maxContentLength,
                        useDecompress,
                        false
                       );
    }

    /**
     * @param eventLoopGroup   eventLoopGroup xử lý request này. Nếu muốn request này xử lý cùng thread với connection gọi nó thì truyền ctx.channel().eventLoop() vào
     * @param urlSpec
     * @param method
     * @param content
     * @param contentType
     * @param handler
     * @param connectTimeout
     * @param idleTime
     * @param maxContentLength >0 thì sẽ thêm HttpObjectAggregator(maxContentLength) vào pipeline
     * @param useDecompress    true thì thêm HttpContentDecompressor vào pipeline
     * @return
     * @throws Exception
     */
    public static void sendHttpRequest (EventLoopGroup eventLoopGroup,
                                        String urlSpec,
                                        HttpMethod method,
                                        ByteBuf content,
                                        String contentType,
                                        HttpClientAbstractHandler handler,
                                        int connectTimeout,
                                        int idleTime,
                                        int maxContentLength,
                                        boolean useDecompress,
                                        boolean usePeer) throws Exception
    {
        URL url = new URL(urlSpec);
        boolean isHttps = url.getProtocol().equalsIgnoreCase("https");
        String host = usePeer ? url.getHost() : null;
        int port = (url.getPort() < 0) ? url.getDefaultPort() : url.getPort();

        HttpRequest request;
        HttpHeaders headers;
        if (content == null)
        {
            request = new DefaultHttpRequest(HttpVersion.HTTP_1_1, method, urlSpec);
            headers = request.headers();
            headers.set(CONTENT_LENGTH, 0);
        }
        else
        {
            request = new DefaultFullHttpRequest(HttpVersion.HTTP_1_1, method, urlSpec, content);
            headers = request.headers();
            headers.set(CONTENT_LENGTH, content.readableBytes());
            headers.set(CONTENT_TYPE, contentType);
        }
        headers.set(HOST, url.getHost());
        headers.set(CONNECTION, CLOSE);
        headers.set(CACHE_CONTROL, NO_CACHE);
        if (useDecompress)
            headers.set(ACCEPT_ENCODING, GZIP);
        handler.request = request;

        Bootstrap bootstrap = new Bootstrap()
                .channel(NioSocketChannel.class)
                .option(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeout)
                .group((eventLoopGroup == null) ? ShareLoopGroup.worker() : eventLoopGroup)
                .handler(new HttpClientInitializer(isHttps, idleTime, Math.max(maxContentLength, 32000), useDecompress, handler, host, port));

        if (sndBuf > 0)
            bootstrap.option(ChannelOption.SO_SNDBUF, sndBuf);
        if (rcvBuf > 0)
            bootstrap.option(ChannelOption.SO_RCVBUF, rcvBuf);

        bootstrap.connect(new InetSocketAddress(url.getHost(), port))
                 .addListener(handler);
    }
}
