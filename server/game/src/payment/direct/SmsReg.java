package payment.direct;

import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentSmsReg;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
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
import user.UserControl;
import util.Json;
import util.Time;
import util.io.UrlEncoder;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class SmsReg extends HttpClientAbstractHandler
{
    private final static char                   SEPARATOR = '|';
    private final static EnvConfig.DirectMobile info      = EnvConfig.getDirectMobile();
    private final static HashFunction           HASH      = Hashing.hmacSha256(new SecretKeySpec(info.getKey1().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

    public String username;
    public int    userId;
    public int    level;
    public short  cmd;
    public String transactionId;
    public String item;
    public String channel;
    public int    amount;
    public String offer;
    public String url;
    public String rawResponse;
    public String country;
    public String socialType;
    public int    platformID;

    public static void exec (String country,
                             String username,
                             int userId,
                             int level,
                             short cmd,
                             String transactionId,
                             String item,
                             String channel,
                             int amount,
                             String offer,
                             String userIP,
                             String socialType,
                             int platformID) throws Exception
    {
        SmsReg o = new SmsReg();
        o.username = username;
        o.userId = userId;
        o.level = level;
        o.cmd = cmd;
        o.transactionId = transactionId;
        o.item = item;
        o.channel = channel;
        o.amount = amount;
        o.offer = offer;
        o.country = country;
        o.socialType = socialType;
        o.platformID = platformID;

        String embedData = new EmbedData(item, channel, offer, level, socialType, platformID).toString();

        long time = Time.getTimeMillis();
        StringBuilder sbMac = new StringBuilder()
                .append(info.getId()).append(SEPARATOR)
                .append(transactionId).append(SEPARATOR)
                .append(username).append(SEPARATOR)
                .append(time).append(SEPARATOR)
                .append(SEPARATOR) //buildItemMac
                .append(embedData);

        String mac = HASH.newHasher().putString(sbMac, StandardCharsets.UTF_8).hash().toString();

        UrlEncoder encoder = new UrlEncoder(info.getUrlRegSms());
        encoder.addParam("appID", info.getId());
        encoder.addParam("appUser", username);
        encoder.addParam("appTime", time);
        encoder.addParam("amount", amount);
        encoder.addParam("appTransID", o.transactionId);
        encoder.addParam("embedData", embedData);
        encoder.addParam("items", "[]");
        encoder.addParam("description", "");
        encoder.addParam("mac", mac);
        encoder.addParam("platform", "web");
        encoder.addParam("mNetworkOperator", channel);
        encoder.addParam("pmcID", getPmcId(channel));
        encoder.addParam("clientID", "2");
        encoder.addParam("userIP", userIP);
        o.url = encoder.toString();

        HttpClient.sendHttpGetRequest(o.url, o, info.getConnectTimeout() * 1000, info.getIdleTime() * 1000);
    }

    private static String getPmcId (String channel)
    {
        if (channel.equals(MiscDefine.VN_SMS_MOBI))
            return "58";
        if (channel.equals(MiscDefine.VN_SMS_VINA))
            return "59";
        return "5";
    }

    private void finish (byte result)
    {
        finish(result, 0, "", "", "", "");
    }

    private void finish (byte result, int returnCode, String returnMessage, String zmpTransID, String phone, String syntax)
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
            item,
            channel,
            amount,
            offer,
            isOnline,
            returnCode,
            returnMessage,
            zmpTransID,
            phone,
            syntax,
            isSuccess ? "" : url,
            isSuccess ? "" : rawResponse,
            username,
            socialType,
            platformID
           );

        if (isOnline)
        {
            Message msg = new ResponsePaymentSmsReg(cmd, result).packData(channel, item, phone, syntax);
            userControl.send(msg);
        }
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String transactionId,
                            byte result,
                            String item,
                            String channel,
                            int amount,
                            String offer,
                            String username,
                            String socialType,
                            int platformID)
    {
        log(country, cmd, userId, level, transactionId, result, item, channel, amount, offer, true, -1, "", "", "", "", "", "", username, socialType, platformID);
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String transactionId,
                            byte result,
                            String item,
                            String channel,
                            int amount,
                            String offer,
                            boolean isOnline,
                            int returnCode,
                            String returnMessage,
                            String zmpTransID,
                            String phone,
                            String syntax,
                            String url,
                            String rawResponse,
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
                             transactionId,
                             null,
                             null,
                             result,
                             0,
                             0,
                             0,
                             0,
                             item,
                             channel,
                             amount,
                             offer,
                             isOnline,
                             returnCode,
                             returnMessage,
                             zmpTransID,
                             phone,
                             syntax,
                             url,
                             rawResponse
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
            rawResponse = content.content().toString(CharsetUtil.UTF_8);
            ctx.close();

            JsonElement element = Json.parse(rawResponse);
            JsonObject obj = element.getAsJsonObject();
            int returnCode = obj.get("returnCode").getAsInt();
            String returnMessage = obj.get("returnMessage").getAsString();
            String zmpTransID = obj.get("zmpTransID").getAsString();

            if (returnCode != 1)
                finish(ErrorConst.FAIL, returnCode, returnMessage, zmpTransID, "", "");
            else
            {
                JsonObject data = obj.get("smsServicePhones").getAsJsonObject();
                String phone = data.get("servicePhone").getAsString();
                String syntax = data.get("smsSyntax").getAsString();

                finish(ErrorConst.SUCCESS, returnCode, returnMessage, zmpTransID, phone, syntax);
            }
        }
    }

    public static void test () throws Exception
    {
        String username = "gg.votoanthuan";
        int userId = 244469637;
        String country = MiscDefine.COUNTRY_VIETNAM;
        String channel = MiscDefine.VN_SMS_MOBI;
        String item = "sms.coin.10k";
        PaymentInfo paymentInfo = PaymentInfo.get(country);
        PaymentInfo.Item info = paymentInfo.getItem(item);
        String offer = "";
        SmsReg.exec(country, username, userId, 10, CmdDefine.PAYMENT_SMS_REG, UserControl.transactionId(userId), item, channel, info.PRICE_VND(), offer, "", "", -1);
    }
}
