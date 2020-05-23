package payment.brazil.card;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentBrazilGetTransaction;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.PaymentInfo;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import payment.TreeParam;
import payment.brazil.EmbedData;
import user.UserControl;
import util.Address;
import util.Json;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;


public class PaymentBrazilGetTransaction extends HttpClientAbstractHandler
{
    private final static EnvConfig.Brazil config = EnvConfig.getPaymentBrazil();

    public Info info;

    public PaymentBrazilGetTransaction ()
    {
        info = new Info();
    }

    public static class Info
    {
        public String username;
        public int    userId;
        public int    level;
        public short  cmd;
        public String appTrans;
        public String item;
        public int    channel;
        public float  amount;
        public String offer;
        public String country;
        public String code;
        public String socialType;
        public int platformID;

        public String urlRequest;
        public String rawResponse;

        public int    flow;
        public String url;
    }

    public static PaymentBrazilGetTransaction exec (String username,
                                                    int userId,
                                                    int level,
                                                    short cmd,
                                                    String appTrans,
                                                    PaymentInfo.Item itemInfo,
                                                    int channel,
                                                    String offer,
                                                    String userIP,
                                                    String country,
                                                    String name,
                                                    String email,
                                                    String phoneNumber,
                                                    String document,
                                                    String deviceId,
                                                    String accountDate,
                                                    String token,
                                                    String maskedCardNumber,
                                                    String paymentTypeCode,
                                                    String socialType,
                                                    int platformID) throws Exception
    {
        PaymentBrazilGetTransaction handler = new PaymentBrazilGetTransaction();
        Info info = handler.info;

        info.username = username;
        info.userId = userId;
        info.level = level;
        info.cmd = cmd;
        info.appTrans = appTrans;
        info.item = itemInfo.ID();
        info.channel = channel;
        info.amount = (float) itemInfo.PRICE_LOCAL() / 100;
        info.offer = offer;
        info.country = country;
        info.code = paymentTypeCode;
        info.socialType = socialType;
        info.platformID = platformID;

        String embedData = new EmbedData(info.item,
                                         channel,
                                         offer,
                                         level,
                                         appTrans,
                                         itemInfo.PRICE_VND(),
                                         itemInfo.PRICE_VND() * config.getPercentNetGross() / 100,
                                         socialType,
                                         platformID).toString();
        info.urlRequest = config.getUrlGetTransaction();

        JsonObject userInfo = new JsonObject();
        userInfo.addProperty("name", name);
        userInfo.addProperty("email", email);
        userInfo.addProperty("phone_number", phoneNumber);
        userInfo.addProperty("document", document);
        userInfo.addProperty("deviceid", deviceId);
        userInfo.addProperty("accountdate", accountDate);

        JsonObject cardNo = new JsonObject();
        cardNo.addProperty("token", token);
        cardNo.addProperty("masked_card_number", maskedCardNumber);
        cardNo.addProperty("payment_typeCode", paymentTypeCode);

        TreeParam mapParam = new TreeParam();
        mapParam.put("accountname", username);
        mapParam.put("accountid", userId);
        mapParam.put("productid", config.getProductId());
        mapParam.put("paymenttype", channel);
        mapParam.put("countryid", country);
        mapParam.put("amount", info.amount);
        mapParam.put("extradata", embedData);
        mapParam.put("userip", userIP);
        mapParam.put("clientip", Address.PRIVATE_HOST);
        mapParam.put("userinfo", userInfo.toString());
        mapParam.put("cardno", cardNo.toString());
        mapParam.put("hash", mapParam.hash(config.getKey()));

        Debug.info("BrazilGetTransaction.exec");
        Debug.info("url", info.urlRequest);
        Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

        HttpClient.sendHttpPostJson(info.urlRequest, mapParam.getJson().toString(), handler, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);

        return handler;
    }

    private void finish (byte result)
    {
        finish(result, "", 0, "");
    }

    private void finish (byte result, String payTrans, int returnCode, String message)
    {
        UserControl userControl = info.userId > 0 ? UserControl.get(info.userId) : null;
        boolean isOnline = userControl != null;

        log(info.country,
            info.cmd,
            info.userId,
            info.level,
            info.appTrans,
            result,
            info.item,
            info.channel,
            info.offer,
            isOnline,
            info.amount,
            result == ErrorConst.SUCCESS ? "" : info.urlRequest,
            result == ErrorConst.SUCCESS ? "" : info.rawResponse,
            returnCode,
            message,
            payTrans,
            info.code,
            info.flow,
            info.url,
            info.username,
            info.socialType,
            info.platformID
           );

        if (isOnline)
        {
            Message msg = new ResponsePaymentBrazilGetTransaction(info.cmd, result).packData(info.channel, info.flow, info.url);
            userControl.send(msg);
        }
    }

    public static void logError (String country,
                                 short cmd,
                                 int userId,
                                 int level,
                                 String appTrans,
                                 byte result,
                                 String item,
                                 int channel,
                                 String offer,
                                 String message,
                                 String username,
                                 String socialType,
                                 int platformID)
    {
        log(country, cmd, userId, level, appTrans, result, item, channel, offer, true, 0, "", "", 0, message, "", "", 0, "", username, socialType, platformID);
    }

    private static void log (String country,
                             short cmd,
                             int userId,
                             int level,
                             String appTrans,
                             byte result,
                             String item,
                             int channel,
                             String offer,
                             boolean isOnline,
                             float amount,
                             String urlRequest,
                             String rawResponse,
                             int returnCode,
                             String message,
                             String payTrans,
                             String code,
                             int flow,
                             String url,
                             String username,
                             String socialType,
                             int platformID)
    {
        MetricLog.actionUser(country,
                             cmd,
                             platformID,
                             userId,
                             username,
                             socialType,
                             (short) level,
                             appTrans,
                             null,
                             null,
                             result,
                             0,
                             0,
                             0,
                             0,
                             item,
                             channel,
                             offer,
                             isOnline,
                             amount,
                             urlRequest,
                             rawResponse,
                             returnCode,
                             message,
                             payTrans,
                             code,
                             flow,
                             url
                            );
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
            info.rawResponse = content.content().toString(CharsetUtil.UTF_8);

            Debug.info("PaymentBrazilGetTransaction.rawResponse", info.rawResponse);
            ctx.close();

            JsonElement element = Json.parse(info.rawResponse);
            JsonObject obj = element.getAsJsonObject();
            int returnCode = obj.get("status").getAsInt();
            String message = Json.getString(obj, "message", null);
            String payTrans = Json.getString(obj, "transid", null);

            if (returnCode == 1)
            {
                info.flow = obj.get("paymentflow").getAsInt();
                info.url = obj.get("url").getAsString();

                finish(ErrorConst.SUCCESS, payTrans, returnCode, message);
            }
            else
            {
                finish(ErrorConst.FAIL, payTrans, returnCode, message);
            }
        }
    }
}

//{"paymentflow":6,"transid":"TTEST2019110600014932","status":1,"refid":"","url":"","shortcode":"","message":"","instruction":"","amount":0,"extra":""}
//{"status":-10,"transid":"TTEST2019110600014933","message":"99:Sandbox - Test credit card, transaction declined reason insufficientFunds"}
