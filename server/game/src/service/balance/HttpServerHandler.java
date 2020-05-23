package service.balance;

import com.google.gson.JsonObject;
import extension.EnvConfig;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.util.CharsetUtil;
import model.system.BalanceInfo;
import service.udp.MsgWorkerInfo;
import util.io.http.HttpUtils;
import util.metric.MetricLog;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.LongAdder;

import static io.netty.handler.codec.http.HttpHeaderNames.*;
import static io.netty.handler.codec.http.HttpHeaderValues.NO_CACHE;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

/**
 * Created by thuanvt on 10/17/2014.
 */
public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject>
{
    private final static String    KEY_CHECK     = "kvtm@gsn.2019";
    private final static LongAdder curConnection = new LongAdder();

    private ChannelHandlerContext     ctx;
    private Map<String, List<String>> params;

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
            params = query.parameters();

            switch (query.path())
            {
                case "/alive":
                    writeTextAndClose("yes");
                    return;
                case "/getWorker":
                    getWorker();
                    return;
                //TODO: bỏ hàm getJsonStatus
                case "/getJsonStatus":
                    getJsonStatus();
                    return;
                case "/getTableStatus":
                    getTableStatus();
                    return;
                default:
                    writeHttpResponseAndClose(HttpResponseStatus.FORBIDDEN);
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

    public void writeHtmlAndClose (CharSequence cs)
    {
        writeHttpResponseAndClose(HttpResponseStatus.OK, Unpooled.copiedBuffer(cs, CharsetUtil.UTF_8), "text/html; charset=UTF-8");
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

    private void getWorker ()
    {
        JsonObject res = new JsonObject();
        BalanceInfo info = BalanceServer.getInfo();

        String service = HttpUtils.getFirstParam(params, "service", EnvConfig.Service.GAME.name());
        int group = HttpUtils.getFirstParam(params, "group", 0);
        int code = HttpUtils.getFirstParam(params, "code", 0);
        String env = HttpUtils.getFirstParam(params, "env", "");

        int error;
        StringBuilder msg = new StringBuilder();

        if (info.isMaintenance())
        {
            error = -1;
            msg.append(info.getMaintenanceMsg());
        }
//        else if (EnvConfig.isServer() && code < EnvConfig.minClientCode())
//        {
//            error = -3;
//            res.addProperty("forceUpdate", true);
//            msg.append("Force update");
//        }
        else
        {
            error = 0;
            msg.append(EnvConfig.environment().name()).append(',');
            msg.append(service).append(',');
            msg.append(group).append(',');
            msg.append(code).append(',');
            msg.append(env).append(',');

            MsgWorkerInfo m = BalanceServer.chooseWorker(service, group, code);
            if (m == null)
            {
                error = -2;
                msg.append("Empty worker");
            }
            else
            {
                EnvConfig.User user = EnvConfig.getUser();
                int portSocket = user.getPort(m.group);
                int portWebSocket = user.getPortWebSocket(m.group);
                addAddress(res, service, m.publicHost, portSocket, m.publicDomain, portWebSocket);
            }
        }

        res.addProperty("error", error);
        res.addProperty("msg", msg.toString());

        writeTextAndClose(res.toString());
    }

    private static void addAddress (JsonObject res, String service, String ip, int portSocket, String domain, int portWebSocket)
    {
        JsonObject data = new JsonObject();
        res.add(service, data);

        data.addProperty("ip", ip);
        data.addProperty("port", portSocket);
        data.addProperty("domain", domain);
        data.addProperty("portWebSocket", portWebSocket);
    }

    private void getJsonStatus ()
    {
        String key = HttpUtils.getFirstParam(params, "key", null);
        if (!KEY_CHECK.equals(key))
        {
            writeTextAndClose(":D");
            return;
        }

        writeTextAndClose(BalanceServer.toJson());
    }

    private void getTableStatus ()
    {
        String key = HttpUtils.getFirstParam(params, "key", null);
        if (!KEY_CHECK.equals(key))
        {
            writeTextAndClose(":D");
            return;
        }
        writeHtmlAndClose(BalanceServer.toTableStatus());
    }
}
