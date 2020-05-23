package payment.sea;

import cmd.ErrorConst;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import payment.TreeParam;
import util.Json;
import util.Time;
import util.io.ShareLoopGroup;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;


public class GetPhone extends HttpClientAbstractHandler
{
    public final static EnvConfig.Sea config = EnvConfig.getPaymentSea();
    private static      boolean       isRunning;

    private static String      url;
    private static String      rawResponse;
    private static Set<String> requirePhone = new HashSet<>(Arrays.asList(new String[]{"2005", "2003", "2002", "1010", "1009"})); //init test data

    public GetPhone ()
    {

    }

    public static synchronized void start ()
    {
        if (isRunning)
            return;

        ShareLoopGroup.scheduleWithFixedDelay(() -> exec(), 5, Time.SECOND_IN_MINUTE, TimeUnit.SECONDS, true);
        isRunning = true;
    }

    public static synchronized void stop ()
    {
        if (!isRunning)
            return;
        isRunning = false;
    }

    private static void exec ()
    {
        try
        {
            GetPhone handler = new GetPhone();
            url = config.getUrlGetPhone();

            TreeParam mapParam = new TreeParam();
            mapParam.put("productid", config.getProductId());
            mapParam.put("timestamp", Time.getUnixTime());
            mapParam.put("hash", mapParam.hash(config.getKey()));

//            Debug.info("GetPhone.exe");
//            Debug.info("url", url);
//            Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

            HttpClient.sendHttpPostJson(url, mapParam.getJson().toString(), handler, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);
        }
        catch (Exception e)
        {
            MetricLog.exception(e);
        }
    }

    private void finish (byte result)
    {
        //Debug.info("GetPhone.finish", result);
        //Debug.info("requirePhone", requirePhone);
    }


    @Override
    public void connectFail ()
    {
        finish(ErrorConst.TIMEOUT);
    }

    @Override
    public void idle ()
    {
        finish(ErrorConst.IDLE);
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        super.exceptionCaught(ctx, cause);
        finish(ErrorConst.EXCEPTION);
    }

    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, HttpObject msg) throws Exception
    {
        if (msg instanceof HttpContent)
        {
            HttpContent content = (HttpContent) msg;
            rawResponse = content.content().toString(CharsetUtil.UTF_8);
            //Debug.info(rawResponse);
            ctx.close();

            Set<String> set = new HashSet<>();
            JsonElement element = Json.parse(rawResponse);
            JsonObject obj = element.getAsJsonObject();
            for (Map.Entry<String, JsonElement> e : obj.entrySet())
            {
                String type = e.getKey();
                if (e.getValue().getAsInt() == 1)
                    set.add(type);
            }
            requirePhone = set;

            finish(ErrorConst.SUCCESS);
        }
    }

    public static Set<String> requirePhone ()
    {
        return requirePhone;
    }

    public static void test () throws Exception
    {
        GetPhone.exec();
    }

    //[2005, 2003, 2002, 1010, 1009]
}

