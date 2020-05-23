package payment.direct;

import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentCardSubmit;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import data.CmdDefine;
import data.MiscDefine;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import user.UserControl;
import util.AES256;
import util.Json;
import util.Time;
import util.io.UrlEncoder;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class CardSubmit extends HttpClientAbstractHandler
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
    public int    channel;
    public String serial;
    public String code;
    public String offer;
    public String url;
    public String rawResponse;
    public String country;
    public String socialType;
    public int platformID;

    public static void exec (String country,
                             String username,
                             int userId,
                             int level,
                             short cmd,
                             String transactionId,
                             String item,
                             int channel,
                             String serial,
                             String code,
                             String offer,
                             String userIP,
                             String socialType,
                             int platformID) throws Exception
    {
        CardSubmit o = new CardSubmit();
        o.username = username;
        o.userId = userId;
        o.level = level;
        o.cmd = cmd;
        o.transactionId = transactionId;
        o.item = item;
        o.channel = channel;
        o.serial = serial;
        o.code = code;
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
        String cardSerialEncrypt = AES256.encrypt(info.getKey1(), serial);
        String cardCodeEncrypt = AES256.encrypt(info.getKey1(), code);

        //cheat chọn số tiền bằng pẩm code. Dùng cho test fake payment
        if (EnvConfig.environment() != EnvConfig.Environment.SERVER_LIVE && info.getUrlSubmitCard().indexOf("mobile.pay.zing.vn/") < 0)
            cardCodeEncrypt = code;

        UrlEncoder encoder = new UrlEncoder(info.getUrlSubmitCard());
        encoder.addParam("appID", info.getId());
        encoder.addParam("appUser", username);
        encoder.addParam("appTime", time);
        encoder.addParam("amount", 10000);
        encoder.addParam("appTransID", o.transactionId);
        encoder.addParam("embedData", embedData);
        encoder.addParam("items", "[]");
        encoder.addParam("description", "");
        encoder.addParam("mac", mac);
        encoder.addParam("platform", "web");
        encoder.addParam("cardSerialEncrypt", cardSerialEncrypt);
        encoder.addParam("cardCodeEncrypt", cardCodeEncrypt);
        encoder.addParam("pmcID", channel);
        encoder.addParam("clientID", "2");
        encoder.addParam("userIP", userIP);
        o.url = encoder.toString();

        HttpClient.sendHttpGetRequest(o.url, o, info.getConnectTimeout() * 1000, info.getIdleTime() * 1000);
    }

    private void finish (byte result)
    {
        finish(result, 0, "", "", 0);
    }

    private void finish (byte result, int returnCode, String returnMessage, String zmpTransID, long ppValue)
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
            serial,
            code,
            offer,
            isOnline,
            returnCode,
            returnMessage,
            zmpTransID,
            ppValue,
            isSuccess ? "" : url,
            isSuccess ? "" : rawResponse,
            username,
            socialType,
            platformID
           );


        if (isOnline)
        {
            Message msg = new ResponsePaymentCardSubmit(cmd, result).packData(channel, item);
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
                            int channel,
                            String serial,
                            String code,
                            String offer,
                            String username,
                            String socialType,
                            int platformID)
    {
        log(country, cmd, userId, level, transactionId, result,
            item, channel, serial, code, offer, true, 0, "", "", 0, "", "", username, socialType, platformID);
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String transactionId,
                            byte result,
                            String item,
                            int channel,
                            String serial,
                            String code,
                            String offer,
                            boolean isOnline,
                            int returnCode,
                            String returnMessage,
                            String zmpTransID,
                            long ppValue,
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
                             serial,
                             code,
                             offer,
                             isOnline,
                             returnCode,
                             returnMessage,
                             zmpTransID,
                             ppValue,
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

            if (returnCode == 1)
            {
                long ppValue = obj.get("ppValue").getAsLong();
                finish(ErrorConst.SUCCESS, returnCode, returnMessage, zmpTransID, ppValue);
            }
            else if (returnCode > 1)
                finish(ErrorConst.PROCESSING, returnCode, returnMessage, zmpTransID, 0);
            else
                finish(ErrorConst.FAIL, returnCode, returnMessage, zmpTransID, 0);
        }
    }

    public static void test () throws Exception
    {
        String username = "gg.votoanthuan";
        int userId = 244469637;
        String country = MiscDefine.COUNTRY_VIETNAM;
        String item = "card.coin.zing";
        String serial = "2B0078966516";
        String code = "J74DN24BY";
        String offer = "";
        CardSubmit.exec(country, username, userId, 10, CmdDefine.PAYMENT_CARD_SUBMIT, UserControl.transactionId(userId), item, MiscDefine.VN_CARD_ZING, serial, code, offer, "", "", -1);
    }
}
