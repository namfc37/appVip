package payment.sea;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.send.user.ResponsePaymentLibCreate;
import cmd.send.user.ResponsePaymentSeaCreate;
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
import payment.brazil.EmbedData;
import user.UserControl;
import util.Address;
import util.Json;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;


public class SeaGetTransaction extends HttpClientAbstractHandler
{
    public final static EnvConfig.Sea config = EnvConfig.getPaymentSea();

    public Info info;

    public SeaGetTransaction ()
    {
        info = new Info();
    }

    public static class Info
    {
        public boolean isPaymentLib;

        public String username;
        public int    userId;
        public int    level;
        public short  cmd;
        public String appTrans;
        public String item;
        public String channel;
        public int    amount;
        public String offer;
        public String userPhone;
        public String cardCode;
        public String country;
        public String socialType;
        public int    platformID;

        public String urlRequest;
        public String rawResponse;

        public String payTrans;
        public String partnerTrans;
        public int    flow;
        public String shortCode;
        public String message;
        public String instruction;
        public String url;
    }

    public static SeaGetTransaction exec (boolean isPaymentLib,
                                          String username,
                                          int userId,
                                          int level,
                                          short cmd,
                                          String appTrans,
                                          PaymentInfo.Item itemInfo,
                                          String channel,
                                          String offer,
                                          String userIP,
                                          String userPhone,
                                          String cardCode,
                                          String country,
                                          String socialType,
                                          int platformID) throws Exception
    {
        SeaGetTransaction handler = new SeaGetTransaction();
        Info info = handler.info;

        info.isPaymentLib = isPaymentLib;
        info.username = username;
        info.userId = userId;
        info.level = level;
        info.cmd = cmd;
        info.appTrans = appTrans;
        info.item = itemInfo.ID();
        info.channel = channel;
        info.amount = itemInfo.PRICE_LOCAL();
        info.offer = offer;
        info.userPhone = userPhone;
        info.cardCode = cardCode;
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
                                         platformID
        ).toString();
        info.urlRequest = config.getUrlCreate();


        TreeParam mapParam = new TreeParam();
        mapParam.put("accountname", username);
        mapParam.put("accountid", userId);
        mapParam.put("amount", info.amount);
        mapParam.put("productid", config.getProductId());
        mapParam.put("paymenttype", Integer.parseInt(channel));
        mapParam.put("countryid", country);
        mapParam.put("extradata", embedData);
        mapParam.put("cardno", (cardCode == null || cardCode.isEmpty()) ? userPhone : cardCode);
        mapParam.put("userip", userIP);
        mapParam.put("clientip", Address.PRIVATE_HOST);
        mapParam.put("hash", mapParam.hash(config.getKey()));


        Debug.info("SeaGetTransaction.exec");
        Debug.info("url", info.urlRequest);
        Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

        HttpClient.sendHttpPostJson(info.urlRequest, mapParam.getJson().toString(), handler, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);

        return handler;
    }

    private void finish (byte result)
    {
        finish(result, 0);
    }

    private void finish (byte result, int returnCode)
    {
        UserControl userControl = UserControl.get(info.userId);
        boolean isOnline = userControl != null;
        log(info.cmd,
            info.userId,
            info.level,
            info.appTrans,
            result,
            returnCode,
            info.channel,
            info.item,
            info.offer,
            info.userPhone,
            info.cardCode,
            info.country,
            isOnline,
            info.isPaymentLib,
            result == ErrorConst.SUCCESS ? "" : info.urlRequest,
            result == ErrorConst.SUCCESS ? "" : info.rawResponse,
            info.payTrans,
            info.flow,
            info.partnerTrans,
            info.url,
            info.shortCode,
            info.message,
            info.instruction,
            info.amount,
            info.username,
            info.socialType,
            info.platformID
           );

        if (isOnline)
        {
            String phone = null;
            String data = null;

            switch (info.flow)
            {
                case MiscDefine.SEA_PAYMENT_FLOW_SMS:
                    phone = info.shortCode;
                    data = info.message;
                    break;
                case MiscDefine.SEA_PAYMENT_FLOW_WEBVIEW:
                    data = info.url;
                    break;
                case MiscDefine.SEA_PAYMENT_FLOW_INSTRUCTION:
                    data = info.instruction;
                    break;
            }

            if (info.isPaymentLib)
                userControl.send(new ResponsePaymentLibCreate(info.cmd, result).packData(info.rawResponse));
            else
                userControl.send(new ResponsePaymentSeaCreate(info.cmd, result).packData(info.channel, info.item, info.flow, phone, data));
        }
    }

    public static void log (short cmd,
                            int userId,
                            int level,
                            String appTrans,
                            byte result,
                            String channel,
                            String item,
                            String offer,
                            String userPhone,
                            String card,
                            String country,
                            boolean isOnline,
                            boolean isPaymentLib,
                            String username,
                            String socialType,
                            int platformID
                           )
    {
        log(cmd,
            userId,
            level,
            appTrans,
            result,
            0,
            channel,
            item,
            offer,
            userPhone,
            card,
            country,
            isOnline,
            isPaymentLib,
            "",
            "",
            "",
            0,
            "",
            "",
            "",
            "",
            "",
            -1,
            username,
            socialType,
            platformID);
    }

    private static void log (short cmd,
                             int userId,
                             int level,
                             String appTrans,
                             byte result,
                             int returnCode,
                             String channel,
                             String item,
                             String offer,
                             String userPhone,
                             String card,
                             String country,
                             boolean isOnline,
                             boolean isPaymentLib,
                             String urlRequest,
                             String rawResponse,
                             String payTrans,
                             int flow,
                             String partnerTrans,
                             String url,
                             String shortCode,
                             String message,
                             String instruction,
                             float amount,
                             String username,
                             String socialType,
                             int platformID
                            )
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
                             returnCode,
                             channel,
                             item,
                             offer,
                             userPhone,
                             card,
                             country,
                             isOnline,
                             isPaymentLib,
                             urlRequest,
                             rawResponse,
                             payTrans,
                             flow,
                             partnerTrans,
                             url,
                             shortCode,
                             message,
                             instruction,
                             amount
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

            Debug.info("rawResponse", info.rawResponse);
            ctx.close();

            JsonElement element = Json.parse(info.rawResponse);
            JsonObject obj = element.getAsJsonObject();
            int returnCode = obj.get("status").getAsInt();

            if (returnCode != 1)
                finish(ErrorConst.FAIL, returnCode);
            else
            {
                info.flow = obj.get("paymentflow").getAsInt();
                info.payTrans = obj.get("transid").getAsString();
                info.partnerTrans = obj.get("refid").getAsString();

                info.shortCode = Json.getString(obj, "shortcode", "");
                info.message = Json.getString(obj, "message", "");
                info.instruction = Json.getString(obj, "instruction", "");
                info.url = Json.getString(obj, "url", "");

                finish(ErrorConst.SUCCESS, returnCode);
            }
        }
    }

    //[2005, 2003, 2002, 1010, 1009]
    public static void test () throws Exception
    {
        String username = "fb.10208639566962513";
        int userId = 403427675;

        //String country = MiscDefine.COUNTRY_MYANMAR;
        //String item = "card.coin.mm";

//        String channel = MiscDefine.MM_SMS_MPT;
//        String phone = ""; //17012321 - 777
//        String channel = MiscDefine.MM_SMS_TELENOR;
//        String phone = "8512345678";
//        String channel = MiscDefine.MM_SMS_OOREDOO;
//        String phone = "9961350000";
//        String channel = MiscDefine.MM_WALLET_WAVE_MONEY;
//        String phone = "";
//        String channel = MiscDefine.MM_CARD_EASYPOINT;
//        String phone = "123456";
//        String channel = MiscDefine.MM_SMS_MYTEL;
//        String phone = "";

//        String country = MiscDefine.COUNTRY_PHILIPPINE;
        //String item = "sms.coin.ph.10";
        //String channel = MiscDefine.PH_SMS_GLOBE;
        //String phone = ""; //9952469342 - 777777
        //String channel = MiscDefine.PH_SMS_SMART;
        //String phone = ""; //9080000000 - 777777

//        String item = "wallet.coin.ph.20";
//        String channel = MiscDefine.PH_WALLET_GCASH;
//        String phone = "";

        String country = MiscDefine.COUNTRY_THAILAND;
        String item = "sms.coin.th.10";
        String channel = MiscDefine.TH_SMS_POSTPAID_AIS;
        String phone = "";

        PaymentInfo paymentInfo = PaymentInfo.get(country);
        PaymentInfo.Item info = paymentInfo.getItem(item);
        String offer = "";

        SeaGetTransaction.exec(false,
                               username,
                               userId,
                               10,
                               CmdDefine.PAYMENT_SEA_CREATE,
                               UserControl.transactionId(userId),
                               info,
                               channel,
                               offer,
                               "",
                               phone,
                               phone,
                               country,
                               "",
                               -1);
    }
}

/*
{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 100,
  "productid": 50020,
  "paymenttype": 2001,
  "countryid": "mm",
  "extradata": "{\"item\":\"sms.offer.100\",\"channel\":\"2001\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1565936426778\",\"gross\":1500,\"net\":1050,\"time\":1565936426779}",
  "cardno": "17012321",
  "userip": "",
  "clientip": "10.199.231.90",
  "hash": "bc71f8d5581139e55831d049bdee40ee"
}
{
    "paymentflow": 2,
    "transid": "TTEST2019081600012727",
    "status": 1,
    "refid": "",
    "url": "https://sandbox.codapayments.com/airtime/begin?type=3&txn_id=5659362778238285090",
    "shortcode": "",
    "message": "",
    "instruction": "",
    "amount": "",
    "extra": ""
}

{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 100,
  "productid": 50020,
  "paymenttype": 2002,
  "countryid": "mm",
  "extradata": "{\"item\":\"sms.offer.100\",\"channel\":\"2002\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1565936477661\",\"gross\":1500,\"net\":1050,\"time\":1565936477662}",
  "cardno": "8512345678",
  "userip": "",
  "clientip": "10.199.231.90",
  "hash": "2e28d666b185fabc78147dfb9d202c8e"
}
{
    "paymentflow": 4,
    "transid": "TTEST2019081600012728",
    "status": 1,
    "refid": "khoand2cheat1565936332",
    "url": "",
    "shortcode": "",
    "message": "",
    "instruction": "",
    "amount": "",
    "extra": "",
    "referid": "khoand2cheat1565936332",
    "paymenttype": 66
}

{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 100,
  "productid": 50020,
  "paymenttype": 2003,
  "countryid": "mm",
  "extradata": "{\"item\":\"sms.offer.100\",\"channel\":\"2003\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1565936516733\",\"gross\":1500,\"net\":1050,\"time\":1565936516734}",
  "cardno": "9961350000",
  "userip": "",
  "clientip": "10.199.231.90",
  "hash": "a6353f25ba4a7dbddd2d94ad2fb51707"
}
{
    "paymentflow": 3,
    "transid": "TTEST2019081600012729",
    "status": 1,
    "refid": "",
    "url": "",
    "shortcode": "",
    "message": "",
    "instruction": "We just sent an SMS to 9961350000. To complete the transaction, send three digit code from the SMS to 7026",
    "amount": "",
    "extra": ""
}

{
  "accountname": "gg.110501544231808095077",
  "accountid": 10004235,
  "amount": 100,
  "productid": 50020,
  "paymenttype": 2004,
  "countryid": "mm",
  "extradata": "{\"item\":\"sms.offer.100\",\"channel\":\"2004\",\"offer\":\"\",\"level\":10,\"appTrans\":\"10004235_1565936658801\",\"gross\":1500,\"net\":1050,\"time\":1565936658802}",
  "cardno": "",
  "userip": "",
  "clientip": "10.199.231.90",
  "hash": "6b94952b38c96e5c6967bd33ab78e9b6"
}
{
    "paymentflow": 2,
    "transid": "TTEST2019081600012730",
    "status": 1,
    "refid": "",
    "url": "https://sandbox.codapayments.com/airtime/begin?type=3&txn_id=5659365070176242939",
    "shortcode": "",
    "message": "",
    "instruction": "",
    "amount": "",
    "extra": ""
}
 */


