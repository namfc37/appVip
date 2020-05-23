package payment.brazil;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentBrazilCreate;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.CmdDefine;
import data.MiscDefine;
import data.PaymentInfo;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import payment.TreeParam;
import user.UserControl;
import util.Address;
import util.Json;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;


public class CreateTransaction extends HttpClientAbstractHandler
{
    public final static EnvConfig.Brazil config = EnvConfig.getPaymentBrazil();

    public Info info;

    public CreateTransaction ()
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
        public String channel;
        public float  amount;
        public String offer;
        public String userPhone;
        public String country;

        public String url;
        public String rawResponse;

        public String payTrans;
        public String partnerTrans;
        public String token;
        public String flow;
        public String shortCode;
        public String message;
        public String socialType;
        public int platformID;
    }

    public static CreateTransaction exec (String username,
                                          int userId,
                                          int level,
                                          short cmd,
                                          String appTrans,
                                          PaymentInfo.Item itemInfo,
                                          String channel,
                                          String offer,
                                          String userIP,
                                          String userPhone,
                                          String country,
                                          String socialType,
                                          int platformID) throws Exception
    {
        CreateTransaction handler = new CreateTransaction();
        CreateTransaction.Info info = handler.info;

        info.username = username;
        info.userId = userId;
        info.level = level;
        info.cmd = cmd;
        info.appTrans = appTrans;
        info.item = itemInfo.ID();
        info.channel = channel;
        info.amount = (float) itemInfo.PRICE_LOCAL() / 100;
        info.offer = offer;
        info.userPhone = userPhone;
        info.country = country;
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
        info.url = config.getUrlCreate();


        TreeParam mapParam = new TreeParam();
        mapParam.put("accountname", username);
        mapParam.put("accountid", userId);
        mapParam.put("amount", info.amount);
        mapParam.put("productid", config.getProductId());
        mapParam.put("paymenttype", Integer.parseInt(channel));
        mapParam.put("countryid", country);
        mapParam.put("extradata", embedData);
        mapParam.put("cardno", userPhone);
        mapParam.put("userip", userIP);
        mapParam.put("clientip", Address.PRIVATE_HOST);
        mapParam.put("hash", mapParam.hash(config.getKey()));

        Debug.info("CreateTransaction.exe");
        Debug.info("url", info.url);
        Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

        if (EnvConfig.environment() != EnvConfig.Environment.SERVER_LIVE)
        {
            info.shortCode = "1234";
            info.message = "TEST";
            handler.finish(ErrorConst.SUCCESS);
        }
        else
        {
            HttpClient.sendHttpPostJson(info.url, mapParam.getJson().toString(), handler, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);
        }

        return handler;
    }

    private void finish (byte result)
    {
        finish(result, 0, "");
    }

    private void finish (byte result, int returnCode, String returnMessage)
    {
        UserControl userControl = UserControl.get(info.userId);
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
            result == ErrorConst.SUCCESS ? "" : info.url,
            result == ErrorConst.SUCCESS ? "" : info.rawResponse,
            returnCode,
            returnMessage,
            info.payTrans,
            info.partnerTrans,
            info.shortCode,
            info.message,
            info.userPhone,
            info.username,
            info.socialType,
            info.platformID
           );

        if (isOnline)
        {
            Message msg = new ResponsePaymentBrazilCreate(info.cmd, result).packData(info.channel, info.item, info.shortCode, info.message);
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
                                 String channel,
                                 String offer,
                                 String phone,
                                 String username,
                                 String socialType,
                                 int platformID
                                )
    {
        log(country, cmd, userId, level, appTrans, result, item, channel, offer, true, 0, "", "", -1, "", "", "", "", "", phone, username, socialType, platformID);
    }

    private static void log (String country,
                             short cmd,
                             int userId,
                             int level,
                             String appTrans,
                             byte result,
                             String item,
                             String channel,
                             String offer,
                             boolean isOnline,
                             float amount,
                             String url,
                             String rawResponse,
                             int returnCode,
                             String returnMessage,
                             String payTrans,
                             String partnerTrans,
                             String shortCode,
                             String message,
                             String phone,
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
                             url,
                             rawResponse,
                             returnCode,
                             returnMessage,
                             payTrans,
                             partnerTrans,
                             shortCode,
                             message,
                             phone
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

            Debug.info(info.rawResponse);
            ctx.close();

            JsonElement element = Json.parse(info.rawResponse);
            JsonObject obj = element.getAsJsonObject();
            int returnCode = obj.get("status").getAsInt();

            if (returnCode != 1)
                finish(ErrorConst.FAIL, returnCode, "");
            else
            {
                info.flow = obj.get("flow").getAsString();
                info.payTrans = obj.get("transid").getAsString();
                info.token = obj.get("token").getAsString();
                info.partnerTrans = obj.get("refid").getAsString();
                info.shortCode = Json.getString(obj, "shortcode", "");
                info.message = Json.getString(obj, "message", "");

                finish(ErrorConst.SUCCESS, returnCode, info.message);
            }
        }
    }


    /*
{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 4.0,
  "productid": 50048,
  "paymenttype": 111,
  "countryid": "br",
  "extradata": "{\"item\":\"sms.coin.499\",\"channel\":\"111\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1560331466157\",\"gross\":32000,\"net\":22400,\"time\":1560331466}",
  "cardno": "5511996947378",
  "userip": "",
  "clientip": "10.199.231.43",
  "hash": "070b12cc9b34428b026f65f3e96d3951"
}
{
    "status": 1,
    "flow": "code",
    "transid": "GSN2019061200000125",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NjAzMzEzODYsImp0aSI6IlZcL0N6ZVZZVWlPZ3ZUaGhJWXh2N3JYeGRVWVlhMWwzR1NuOFlpb25KSGNNPSIsImV4cCI6MTU2MDQxNzc4NiwiZGF0YSI6eyJtZXJjaGFudElkIjoiMiIsInRpbWVzdGFtcCI6IjE1NjAzMzEzODUiLCJwcm9qZWN0X2lkIjoiMzMzMjg4In19.tu0w6moyv4_nzxPxZwq-irsp4ZNzda5w3nUZ-UnJySA",
    "refid": "w190647841",
    "shortcode": null,
    "message": null
}

{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 4.0,
  "productid": 50048,
  "paymenttype": 113,
  "countryid": "br",
  "extradata": "{\"item\":\"sms.coin.499\",\"channel\":\"113\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1560331525793\",\"gross\":32000,\"net\":22400,\"time\":1560331525}",
  "cardno": "5511996947378",
  "userip": "",
  "clientip": "10.199.231.43",
  "hash": "e5e8b59908b818cb81f65a210b58cc9c"
}
{
    "status": 1,
    "flow": "code",
    "transid": "GSN2019061200000126",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NjAzMzE0MzcsImp0aSI6IkJZTXRtNWRNOU9oaUdMQm5YaElCa2VhV1wvZExKYk5oS2pUQTZnbkJkWTdZPSIsImV4cCI6MTU2MDQxNzgzNywiZGF0YSI6eyJtZXJjaGFudElkIjoiMiIsInRpbWVzdGFtcCI6IjE1NjAzMzE0MzQiLCJwcm9qZWN0X2lkIjoiMzMzMjg4In19.y7vqt06OkMMtg4YCzQqttHpRkztF9irCpk5C8YWoX5s",
    "refid": "w190647899",
    "shortcode": null,
    "message": null
}

{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 4.0,
  "productid": 50048,
  "paymenttype": 112,
  "countryid": "br",
  "extradata": "{\"item\":\"sms.coin.499\",\"channel\":\"112\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1560331585702\",\"gross\":32000,\"net\":22400,\"time\":1560331585}",
  "cardno": "5511996947378",
  "userip": "",
  "clientip": "10.199.231.43",
  "hash": "7fdd123f0aa5c7130e3a7c467db006f6"
}
{
    "status": 1,
    "flow": "code",
    "transid": "GSN2019061200000127",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NjAzMzE0OTgsImp0aSI6IkdJVEJFTGhubWV6b3NORXdpamtNTUkwbU5jeEE5RnNjcmRIbEVjTFwvOTBVPSIsImV4cCI6MTU2MDQxNzg5OCwiZGF0YSI6eyJtZXJjaGFudElkIjoiMiIsInRpbWVzdGFtcCI6IjE1NjAzMzE0OTciLCJwcm9qZWN0X2lkIjoiMzMzMjg4In19.Sy4Sd7EvFnF0sZylXmWpQNTYXFC7zjGYvs5YuezuEfc",
    "refid": "w190647988",
    "shortcode": "49159",
    "message": "MOB4"
}

    */

    public static void test () throws Exception
    {
        String username = "gg.110501544231808095077";
        int userId = 10004235;
        String channel = MiscDefine.BR_SMS_OI;
        String item = "sms.coin.499";
        String country = MiscDefine.COUNTRY_BRAZIL;
        PaymentInfo paymentInfo = PaymentInfo.get(country);
        PaymentInfo.Item info = paymentInfo.getItem(item);
        String offer = "";
        String phone = "5511996947378";
        CreateTransaction.exec(username, userId, 10, CmdDefine.PAYMENT_BRAZIL_CREATE, UserControl.transactionId(userId), info, channel, offer, "", phone, country, "", -1);
    }
}

