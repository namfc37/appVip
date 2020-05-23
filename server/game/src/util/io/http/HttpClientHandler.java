package util.io.http;

import bitzero.util.common.business.Debug;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;

/**
 * Created by thuanvt on 11/11/2014.
 */
public class HttpClientHandler extends HttpClientAbstractHandler
{
    @Override
    public void channelActive (ChannelHandlerContext ctx) throws Exception
    {
        super.channelActive(ctx); //DO NOT REMOVE THIS LINE
        Debug.trace("channelActive");
    }

    @Override
    public void channelInactive (ChannelHandlerContext ctx) throws Exception
    {
        Debug.trace("channelInactive");
    }

    @Override
    public void channelRead0 (ChannelHandlerContext ctx, HttpObject msg) throws Exception
    {
        Debug.trace("channelRead");
        if (msg instanceof HttpMessage)
        {
            HttpMessage message = (HttpMessage) msg;
            if (HttpUtil.is100ContinueExpected(message) || HttpUtil.isTransferEncodingChunked(message))
            {
                ctx.close();
                return;
            }
            Debug.trace("!!!Header!!!", message.toString());
        }
        if (msg instanceof HttpContent)
        {
            HttpContent content = (HttpContent) msg;
            Debug.trace("!!!Content!!!", content.content().toString(CharsetUtil.UTF_8));

            if (content instanceof LastHttpContent)
            {
                ctx.close();
                Debug.trace("!!!Content!!! --- LAST ---");
            }
        }
    }

    @Override
    public void connectFail ()
    {
        Debug.trace("connectFail");
    }

    @Override
    public void idle ()
    {
        Debug.trace("IDLE");
    }
}
