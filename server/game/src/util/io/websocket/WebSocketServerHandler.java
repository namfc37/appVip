package util.io.websocket;

import bitzero.util.common.business.Debug;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.handler.timeout.IdleStateHandler;
import util.Json;
import util.metric.MetricLog;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.LongAdder;

import static io.netty.handler.codec.http.HttpHeaderNames.HOST;

/**
 * Handles handshakes and messages
 */
public class WebSocketServerHandler extends ChannelInboundHandlerAdapter
{
    private final static LongAdder curConnection  = new LongAdder();
    private final static String    WEBSOCKET_PATH = "/websocket";

    private ChannelHandlerContext     ctx;
    private WebSocketServerHandshaker handshaker;

    private static String getWebSocketLocation (FullHttpRequest req)
    {
        String location = req.headers().get(HOST) + WEBSOCKET_PATH;
        return "ws://" + location;

        // Uncomment the following line if you support https
//            return "wss://" + location;
    }

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
    public void channelRead (ChannelHandlerContext ctx, Object msg)
    {
        if (msg instanceof FullHttpRequest)
        {
            handleHttpRequest(ctx, (FullHttpRequest) msg);
        }
        else if (msg instanceof WebSocketFrame)
        {
            handleWebSocketFrame(ctx, (WebSocketFrame) msg);
        }
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause)
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

    private void handleHttpRequest (ChannelHandlerContext ctx, FullHttpRequest req)
    {
        if (WEBSOCKET_PATH.equals(req.uri()))
        {
            if (handshaker == null)
            {
                WebSocketServerHandshakerFactory wsFactory = new WebSocketServerHandshakerFactory(getWebSocketLocation(req), null, true);
                handshaker = wsFactory.newHandshaker(req);
                if (handshaker == null)
                    WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
                else
                    handshaker.handshake(ctx.channel(), req);
            }
        }
        else
        {
            Debug.trace("Force close unknown uri");
            ctx.close();
        }
    }

    private void handleWebSocketFrame (ChannelHandlerContext ctx, WebSocketFrame frame)
    {
        if (frame instanceof CloseWebSocketFrame)
        {
            handshaker.close(ctx.channel(), (CloseWebSocketFrame) frame.retain());
            return;
        }
        if (frame instanceof PingWebSocketFrame)
        {
            ctx.channel().writeAndFlush(new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        if (frame instanceof TextWebSocketFrame)
        {
            String request = ((TextWebSocketFrame) frame).text();
            Debug.trace("Received text", ctx.channel(), request);
            ctx.channel().writeAndFlush(new TextWebSocketFrame(request.toUpperCase()));
            return;
        }
        if (frame instanceof BinaryWebSocketFrame)
        {
            ByteBuf content = frame.content();
            byte[] data = new byte[content.readableBytes()];
            content.readBytes(data);
            Debug.trace("Received binary", ctx.channel(), Json.toJson(data));
            ctx.channel().writeAndFlush(new BinaryWebSocketFrame(Unpooled.wrappedBuffer(data)));
            return;
        }
        throw new UnsupportedOperationException(frame.getClass().getName() + " frame types not supported");
    }

    public void removeIdleTime ()
    {
        ChannelPipeline pipeline = ctx.pipeline();
        if (pipeline.get(WebSocketServerInitializer.PIPELINE_IDLE) != null)
            pipeline.remove(WebSocketServerInitializer.PIPELINE_IDLE);
    }

    public void setIdleTime (int idleTimeReader, int idleTimeWriter, int idleTimeAll)
    {
        removeIdleTime();
        ctx.pipeline().addFirst(WebSocketServerInitializer.PIPELINE_IDLE, new IdleStateHandler(idleTimeReader, idleTimeWriter, idleTimeAll, TimeUnit.MILLISECONDS));
    }

    public static int getCurConnection ()
    {
        return curConnection.intValue();
    }
}
