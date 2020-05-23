package payment;

import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentGoogleSubmit;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.CmdDefine;
import data.ItemType;
import data.MiscDefine;
import data.PaymentInfo;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import model.BillingProcessing;
import model.GoogleTransaction;
import payment.billing.Card;
import user.UserControl;
import util.Common;
import util.Json;
import util.Time;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;
import util.server.ServerConstant;

import java.nio.charset.StandardCharsets;

public class GoogleSubmit extends HttpClientAbstractHandler
{
    private final static EnvConfig.IAP info              = EnvConfig.getIap();
    public final static  int           PERCENT_NET_GROSS = 70;

    private final static HashFunction HASH = Hashing.md5();

    public String username;
    public int    userId;
    public int    level;
    public short  cmd;
    public String transactionId;
    public String packageName;
    public String data;
    public String sign;
    public String url;
    public String rawResponse;
    public String offer;
    public String country;
    public String socialType;
    public int platformID;

    public static void exec (String username,
                             int userId,
                             int level,
                             short cmd,
                             String transactionId,
                             String packageName,
                             String data,
                             String sign,
                             String offer,
                             String country,
                             String socialType,
                             int platformID) throws Exception
    {
        GoogleSubmit o = new GoogleSubmit();
        o.username = username;
        o.userId = userId;
        o.level = level;
        o.cmd = cmd;
        o.transactionId = transactionId;
        o.packageName = packageName;
        o.data = data;
        o.sign = sign;
        o.offer = offer;
        o.country = country;
        o.url = info.getUrlValidate();
        o.socialType = socialType;
        o.platformID = platformID;

        String b64Data = Common.encodeBase64(data);
        String b64Sign = Common.encodeBase64(o.sign);
        String os = "google";

        if (EnvConfig.isZone(MiscDefine.COUNTRY_BRAZIL))
        {
            String mac = HASH.newHasher()
                             .putString(os, StandardCharsets.UTF_8)
                             .putString(packageName, StandardCharsets.UTF_8)
                             .putString(b64Data, StandardCharsets.UTF_8)
                             .putString(ServerConstant.GAME_ID, StandardCharsets.UTF_8)
                             .putString(ServerConstant.KEY_1, StandardCharsets.UTF_8)
                             .hash().toString();

            JsonObject params = new JsonObject();
            params.addProperty("service_name", info.getServiceName());
            params.addProperty("gameId", ServerConstant.GAME_ID);
            params.addProperty("package_name", packageName);
            params.addProperty("os", os);
            params.addProperty("receipt_data", b64Data);
            params.addProperty("sign", b64Sign);
            params.addProperty("mac", mac);

            HttpClient.sendHttpPostUrlEncoded(o.url, params, o, info.getConnectTimeout() * 1000, info.getIdleTime() * 1000);
        }
        else
        {
            JsonObject params = new JsonObject();
            params.addProperty("service_name", info.getServiceName());
            params.addProperty("environment", "live");
            params.addProperty("os", os);
            params.addProperty("package_name", packageName);
            params.addProperty("receipt_data", b64Data);
            params.addProperty("sign", b64Sign);

            HttpClient.sendHttpGetRequest(o.url, params, o, info.getConnectTimeout() * 1000, info.getIdleTime() * 1000);
        }
    }

    private void finish (byte result, boolean isFinish, int error)
    {
        finish(result, isFinish, error, "", "", "", 0, "");
    }

    private void finish (byte result, boolean isFinish, int error, String code, String orderId, String productId, long purchaseTime, String requestOffer)
    {
        UserControl userControl = UserControl.get(userId);
        boolean isOnline = userControl != null;
        boolean isSuccess = result == ErrorConst.SUCCESS;

        log(country,
            cmd,
            userId,
            level,
            transactionId,
            result,
            packageName,
            data,
            sign,
            offer,
            isFinish,
            error,
            code,
            orderId,
            productId,
            purchaseTime,
            isSuccess ? "" : url,
            isSuccess ? "" : rawResponse,
            requestOffer,
            username,
            socialType,
            platformID
           );

        if (isOnline)
        {
            Message msg = new ResponsePaymentGoogleSubmit(cmd, result).packData(isFinish);
            userControl.send(msg);
        }
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String transactionId,
                            byte result,
                            String packageName,
                            String data,
                            String sign,
                            String offer,
                            boolean isFinish,
                            String orderId,
                            String productId,
                            long purchaseTime,
                            String username,
                            String socialType,
                            int platformID)
    {
        log(country, cmd, userId, level, transactionId, result,
            packageName, data, sign, offer, isFinish, -1, "", orderId, productId, purchaseTime, "", "", "", username, socialType, platformID);
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String transactionId,
                            byte result,
                            String packageName,
                            String data,
                            String sign,
                            String offer,
                            boolean isFinish,
                            int error,
                            String code,
                            String orderId,
                            String productId,
                            long purchaseTime,
                            String url,
                            String rawResponse,
                            String requestOffer,
                            String username,
                            String socialType,
                            int platformID
                           )
    {
        if (data != null)
            data = data.replaceAll("\\|", "-");

        MetricLog.actionUser(country,
                             cmd,
                             platformID,
                             userId,
                             username,
                             socialType,
                             (short) level,
                             transactionId,
                             null,
                             null,
                             result,
                             0,
                             0,
                             0,
                             0,
                             packageName,
                             data,
                             sign,
                             offer,
                             isFinish,
                             error,
                             code,
                             orderId,
                             productId,
                             purchaseTime,
                             url,
                             rawResponse,
                             requestOffer
                            );
    }

    @Override
    public void connectFail ()
    {
        finish(ErrorConst.TIMEOUT, false, 0);
    }

    @Override
    public void idle ()
    {
        finish(ErrorConst.IDLE, false, 0);
    }

    @Override
    public void exceptionCaught (ChannelHandlerContext ctx, Throwable cause) throws Exception
    {
        super.exceptionCaught(ctx, cause);
        finish(ErrorConst.EXCEPTION, false, 0);
    }

    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, HttpObject msg) throws Exception
    {
        if (msg instanceof HttpContent)
        {
            HttpContent content = (HttpContent) msg;
            rawResponse = content.content().toString(CharsetUtil.UTF_8);
            ctx.close();

            JsonElement element = Json.parse(rawResponse);
            JsonObject obj = element.getAsJsonObject();

            int error = obj.get("error").getAsInt();

            if (error != 0)
                finish(ErrorConst.FAIL, true, error);
            else
            {
                String code = obj.get("code").getAsString();
                String orderId = obj.get("orderId").getAsString();
                String productId = obj.get("productId").getAsString();
                long purchaseTime = obj.get("purchaseTime").getAsLong();

                UserControl userControl = UserControl.get(userId);
                PaymentInfo paymentInfo = PaymentInfo.get(userControl.game.getCountry());
                PaymentInfo.Item itemInfo = paymentInfo.getItem(code);

                int curTime = Time.getUnixTime();
                if ((purchaseTime / 1000) + info.getExpireTime() < curTime)
                    finish(ErrorConst.TIMEOUT, true, error, code, orderId, productId, purchaseTime, "");
                else if (userControl == null)
                    finish(ErrorConst.OFFLINE, false, error, code, orderId, productId, purchaseTime, "");
                else if (itemInfo == null)
                    finish(ErrorConst.NULL_ITEM_INFO, true, error, code, orderId, productId, purchaseTime, "");
                else if (!GoogleTransaction.lock(orderId, transactionId))
                    finish(ErrorConst.INVALID_ACTION, true, error, code, orderId, productId, purchaseTime, "");
                else
                {
                    String requestOffer = offer;
                    //Lấy cache offer khi request offer rỗng
                    if (itemInfo.TYPE() == ItemType.TAB_OFFER && (requestOffer == null || requestOffer.isEmpty()))
                        offer = userControl.game.getCheckOffer(code);

                    Card card = Card.createGoogle(userId,
                                                  username,
                                                  purchaseTime,
                                                  transactionId,
                                                  orderId.substring(4),
                                                  itemInfo.PRICE_VND(),
                                                  itemInfo.COIN(),
                                                  code,
                                                  offer,
                                                  level,
                                                  country,
                                                  socialType,
                                                  userControl.platformID);

                    if (userControl.addCashIAP(card) == ErrorConst.SUCCESS)
                    {
                        if (BillingProcessing.process(userControl, card))
                            userControl.handleSystemCommand(CmdDefine.UPDATE_COIN);
                        else
                            BillingProcessing.appendItem(userId, card);
                        finish(ErrorConst.SUCCESS, true, error, code, orderId, productId, purchaseTime, requestOffer);
                    }
                    else
                    {
                        GoogleTransaction.unlock(orderId);
                        finish(ErrorConst.ADD_COIN_FAIL, false, error, code, orderId, productId, purchaseTime, requestOffer);
                    }
                }
            }
        }
    }

    public static void test () throws Exception
    {
        String username = "gg.votoanthuan";
        int userId = 244469637;
        String packageName = "gsn.zingplay.cotuong";
        String data = "eyJvcmRlcklkIjoiR1BBLjMzNDktNzY0Mi02NDM4LTk5MzcxIiwicGFja2FnZU5hbWUiOiJnc24uemluZ3BsYXkuY290dW9uZyIsInByb2R1Y3RJZCI6InBhY2tfMTEiLCJwdXJjaGFzZVRpbWUiOjE1Mjc1ODQ5OTc4MzgsInB1cmNoYXNlU3RhdGUiOjAsInB1cmNoYXNlVG9rZW4iOiJocG5obGNib2ZrcGZhYm5qZW5ubXBlYmMuQU8tSjFPeUdFRXQ4elB2LTNGMUxxenVOYWVld05SZEZoeHFmaG9WZzhRZ1Q1bEltRVZTVkJWRENBbmdHWUVGVWtHM2JrX2Nib051UTFkNUh5RUNJTzBBdlNSTHlmSDZReGowclA1TzZONmoxMDJNM2pDeVVrOFUifQ==";
        String sign = "TzA1c1c1bEc5dm5xSENDd1B0SWwrN2lPZjdodThKTmVkQ2JJUTJoZGozSG4zZnVYMTNBYk52ZlNjMnhMUzVVaklNc3EybzFkN0pYUTZYcWNybVhpNGlucWlNdEN3My9TYjBZVCtIak9RNWora1pWRTJtVisyWThxRWhnaTRWV1ljTC9sSktaZTF0dnoxVkI1MGVScDlhdW56bjhPaVh3Zlg3VnZ2N3EwN0p6ZEVhd0xtdzZNNzdSdXBjazFTUjRjMWttSDQvajhuNDBnK3BWQWluRlgvWlVuQjBBZWh5alFzYmlQL21zdFVOUWVNWkQvamxuMTFhdWdzK2VjbkllbnYwYlE4U2lvVVhSaTJ6bXBHL1piWVd5SGFIamxRQmxPSXhFb3JzOVJTckJwRXNVc1RESkpaZ2JVQndZaGo3WS94L3JRL3pxWHFmYW5mSWtLS2VKL0p3PT0=";
        String offer = "";

        GoogleSubmit.exec(username,
                          userId,
                          10,
                          CmdDefine.PAYMENT_GOOGLE_SUBMIT,
                          UserControl.transactionId(userId),
                          packageName,
                          data,
                          sign,
                          offer,
                          MiscDefine.COUNTRY_VIETNAM,
                          "",
                          -1);
    }
}
