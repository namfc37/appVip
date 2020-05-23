package payment.brazil;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentBrazilProcess;
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
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

public class ProcessTransaction extends HttpClientAbstractHandler
{
    public final static EnvConfig.Brazil config = EnvConfig.getPaymentBrazil();

    public CreateTransaction.Info info;
    public short                  cmd;
    public String                 otp;

    public String url;
    public String rawResponse;

    public static void exec (CreateTransaction.Info info, short cmd, String otp) throws Exception
    {
        ProcessTransaction o = new ProcessTransaction();
        o.info = info;
        o.cmd = cmd;
        o.otp = otp;

        o.url = config.getUrlProcess();

        TreeParam mapParam = new TreeParam();
        mapParam.put("paymenttype", info.channel);
        mapParam.put("productid", config.getProductId());
        mapParam.put("timestamp", Time.getUnixTime());
        mapParam.put("accountid", info.userId);
        mapParam.put("partnertransid", info.partnerTrans);
        mapParam.put("token", info.token);
        mapParam.put("flow", info.flow);
        mapParam.put("transid", info.payTrans);
        mapParam.put("otp", otp);

        mapParam.put("hash", mapParam.hash(config.getKey()));

        Debug.info("ProcessTransaction.exe");
        Debug.info("url", o.url);
        Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

        HttpClient.sendHttpPostJson(o.url, mapParam.getJson().toString(), o, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);

    }

    private void finish (byte result)
    {
        finish(result, 0, "");
    }

    private void finish (byte result, int returnCode, String returnMessage)
    {
        UserControl userControl = UserControl.get(info.userId);
        boolean isOnline = userControl != null;
        boolean isSuccess = result == ErrorConst.SUCCESS;

        log(info.country,
            cmd,
            info.userId,
            info.level,
            info.appTrans,
            result,
            info.item,
            info.channel,
            info.offer,
            isOnline,
            info.amount,
            isSuccess ? "" : url,
            isSuccess ? "" : rawResponse,
            returnCode,
            returnMessage,
            info.payTrans,
            info.partnerTrans,
            info.shortCode,
            info.message,
            otp
           );

        if (isOnline)
        {
            Message msg = new ResponsePaymentBrazilProcess(cmd, result).packData();
            userControl.send(msg);

            if (isSuccess)
                userControl.game.brCreateTransaction = null;
        }
    }

    public static void logError (String country,
                                 short cmd,
                                 int userId,
                                 int level,
                                 String appTrans,
                                 byte result,
                                 String otp
                                )
    {
        log(country, cmd, userId, level, appTrans, result, "", "", "", true, 0, "", "", -1, "", "", "", "", "", otp);
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
                             String otp)
    {
        MetricLog.actionUser(country,
                             cmd,
                             -1,
                             userId,
                             "",
                             "",
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
                             otp
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

            Debug.info(rawResponse);
            ctx.close();

            JsonElement element = Json.parse(rawResponse);
            JsonObject obj = element.getAsJsonObject();
            int returnCode = obj.get("status").getAsInt();

            if (returnCode != 1)
                finish(ErrorConst.FAIL, returnCode, "");
            else
                finish(ErrorConst.SUCCESS, returnCode, "");
        }
    }

    /*
    {
      "paymenttype": 111,
      "productid": 50048,
      "timestamp": 1560250777,
      "accountid": 10004235,
      "partnertransid": "w190564443",
      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NjAyNDg0NDgsImp0aSI6IjZ2TVU3dlU4cUxwOFwvekZCTjQyR212RFFJanpcL0xaZ29WeWJFc0d0TmlmYz0iLCJleHAiOjE1NjAzMzQ4NDgsImRhdGEiOnsibWVyY2hhbnRJZCI6IjIiLCJ0aW1lc3RhbXAiOiIxNTYwMjQ4NDQ2IiwicHJvamVjdF9pZCI6IjMzMzI4OCJ9fQ.p2nty71KjknR2nw29RjZglcmTrkvJqY-9cqVzzvaeuU",
      "flow": "code",
      "transid": "GSN2019061100000102",
      "otp": "123456789",
      "hash": "e828a9aba265f945bcabd0690cb98e95"
    }
    {
        "status": 1
    }
    */

    public static void test () throws Exception
    {
        String otp = "123456789";
        CreateTransaction.Info p = new CreateTransaction.Info();
        p.channel = MiscDefine.BR_SMS_TIM;
        p.userId = 10004235;
        p.partnerTrans = "w190619103";
        p.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NjAzMDUyMDcsImp0aSI6IjhvVkhDTXN5U2dDc2phVFcrNXFLd2lSYmlVbWFZekl2UVVxZkpxR2VFY0k9IiwiZXhwIjoxNTYwMzkxNjA3LCJkYXRhIjp7Im1lcmNoYW50SWQiOiIyIiwidGltZXN0YW1wIjoiMTU2MDMwNTIwNiIsInByb2plY3RfaWQiOiIzMzMyODgifX0.hBT2c1A55dlKmVOZsBcxaQCoDqZLk9ovaBZ3rvJxvqY";
        p.flow = "code";
        p.payTrans = "GSN2019061200000115";

        ProcessTransaction.exec(p, CmdDefine.PAYMENT_BRAZIL_PROCESS, otp);
    }
}
