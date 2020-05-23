package payment.brazil.card;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentBrazilGetFlow;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.CmdDefine;
import data.MiscDefine;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import payment.TreeParam;
import user.UserControl;
import util.Json;
import util.Time;
import util.io.ShareLoopGroup;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

public class PaymentBrazilGetFlow extends HttpClientAbstractHandler
{
    private final static int TIME_CACHE = 10;

    private final static short                                 CMD     = CmdDefine.PAYMENT_BRAZIL_GET_FLOW;
    private final static EnvConfig.Brazil                      config  = EnvConfig.getPaymentBrazil();
    private final static ConcurrentHashMap<Integer, CacheInfo> mapInfo = new ConcurrentHashMap<>(); //type, info

    public Info info;

    private static class Info
    {
        private int userId;
        private int type;

        private String requestUrl;
        private String requestData;
        private String responseData;

        private int      flow;
        private String[] data;
    }

    private PaymentBrazilGetFlow ()
    {
        info = new Info();
    }

    public static void exec (int userId, int type) throws Exception
    {
        CacheInfo cacheInfo = mapInfo.get(type);
        if (cacheInfo == null)
        {
            sendRequest(userId, type);
        }
        else
        {
            responseToUser(ErrorConst.SUCCESS, type, userId, cacheInfo.flow, cacheInfo.data);

            if (cacheInfo.isExpire())
                sendRequest(0, type);
        }
    }

    public static void sendRequest (int type) throws Exception
    {
        sendRequest(0, type);
    }

    private static void sendRequest (int userId, int type) throws Exception
    {
        PaymentBrazilGetFlow handler = new PaymentBrazilGetFlow();
        Info info = handler.info;

        TreeParam mapParam = new TreeParam();
        mapParam.put("productid", config.getProductId());
        mapParam.put("timestamp", Time.getUnixTime());
        mapParam.put("paymenttype", type);
        mapParam.put("hash", mapParam.hash(config.getKey()));

        info.userId = userId;
        info.type = type;
        info.requestUrl = config.getUrlGetPaymentFlow();
        info.requestData = mapParam.getJson().toString();

        Debug.info("PaymentBrazilGetFlow.exe");
        Debug.info("url", info.requestUrl);
        Debug.info("data", info.requestData);

        HttpClient.sendHttpPostJson(info.requestUrl, info.requestData, handler, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);
    }

    public static class CacheInfo
    {
        private int      type;
        private int      time;
        private int      flow;
        private String[] data;

        public CacheInfo (int type, int flow, String[] data)
        {
            time = Time.getUnixTime();
            this.type = type;
            this.flow = flow;
            this.data = data;
        }

        private boolean isExpire ()
        {
            return time + TIME_CACHE < Time.getUnixTime();
        }

        public int getFlow ()
        {
            return flow;
        }

        public String[] getData ()
        {
            return data;
        }
    }

    private void finish (byte result)
    {
        if (result == ErrorConst.SUCCESS)
        {
            CacheInfo previous = mapInfo.put(info.type, new CacheInfo(info.type, info.flow, info.data));
            if (previous == null)
            {
                ShareLoopGroup.scheduleWithFixedDelay(() -> {
                    try
                    {
                        exec(0, info.type);
                    }
                    catch (Exception e)
                    {
                        MetricLog.exception(e);
                    }
                }, 0, TIME_CACHE, TimeUnit.SECONDS, true);
            }

            if (previous == null || previous.flow != info.flow)
                log(result);
        }
        else
        {
            log(result);
        }

        responseToUser(result, info.type, info.userId, info.flow, info.data);
    }

    private void log (byte result)
    {
        MetricLog.actionUser(MiscDefine.COUNTRY_BRAZIL,
                             CMD,
                             (short) -1,
                             info.userId,
                             "",
                             "",
                             (short) -1,
                             "",
                             null,
                             null,
                             result,
                             0,
                             0,
                             0,
                             0,
                             result == ErrorConst.SUCCESS ? "" : info.requestUrl,
                             result == ErrorConst.SUCCESS ? "" : info.requestData,
                             result == ErrorConst.SUCCESS ? "" : info.responseData,
                             info.type,
                             info.flow,
                             info.data != null && info.data.length > 0 ? info.data[0] : null,
                             info.data != null && info.data.length > 1 ? info.data[1] : null,
                             info.data != null && info.data.length > 2 ? info.data[2] : null
                            );
    }

    public static void responseToUser (byte result, int type, int userId, int flow, String[] data)
    {
        if (userId <= 0)
            return;

        UserControl userControl = UserControl.get(userId);
        if (userControl == null)
            return;

        Message msg = new ResponsePaymentBrazilGetFlow(CMD, result).packData(type, flow, data);
        userControl.send(msg);
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
            info.responseData = content.content().toString(CharsetUtil.UTF_8);

            Debug.info(info.responseData);
            ctx.close();

            JsonObject obj = parseResponse(info.responseData);
            JsonElement eFlow = obj.get("flow");
            if (eFlow != null && eFlow.isJsonPrimitive())
            {
                info.flow = eFlow.getAsInt();
                JsonElement eExtra = obj.get("extra");
                if (eExtra.isJsonArray())
                {
                    JsonArray aExtra = eExtra.getAsJsonArray();
                    info.data = new String[aExtra.size()];
                    for (int i = 0; i < aExtra.size(); i++)
                        info.data[i] = aExtra.get(i).getAsString();
                }
                finish(ErrorConst.SUCCESS);
            }
            else
            {
                finish(ErrorConst.FAIL);
            }
        }
    }

    public static void test () throws Exception
    {
        int type = MiscDefine.BR_CREDIT_DISCOVER;
//        for (int i = 0; i < 60; i++)
//        {
//            exec(0, type);
//            Thread.sleep(1000);
//        }

        exec(0, type);
    }

    public static JsonObject parseResponse (String raw)
    {
        /*if (raw.startsWith("\""))
        {
            StringBuilder unescape = Json.unescape(raw);
            if (unescape.charAt(0) == '"')
            {
                unescape.deleteCharAt(0);
                unescape.deleteCharAt(unescape.length() - 1);
            }
            raw = unescape.toString();
        }*/
        return Json.parse(raw).getAsJsonObject();
    }

    public static CacheInfo getInfo (int type)
    {
        return mapInfo.get(type);
    }
}
