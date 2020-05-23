package payment.sea;

import bitzero.util.common.business.Debug;
import cmd.ErrorConst;
import cmd.Message;
import cmd.send.user.ResponsePaymentLibVerify;
import cmd.send.user.ResponsePaymentSeaVerify;
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
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;
import util.metric.MetricLog;

public class SeaVerifyOtp extends HttpClientAbstractHandler
{
    public final static EnvConfig.Sea config = EnvConfig.getPaymentSea();

    public SeaGetTransaction.Info info;
    public short                  cmd;
    public String                 otp;

    public String url;
    public String rawResponse;

    public static void exec (SeaGetTransaction.Info info, short cmd, String otp) throws Exception
    {
        SeaVerifyOtp o = new SeaVerifyOtp();
        o.info = info;
        o.cmd = cmd;
        o.otp = otp;

        o.url = config.getUrlProcess();

        TreeParam mapParam = new TreeParam();
        mapParam.put("transid", info.payTrans);
        mapParam.put("partnertransid", info.partnerTrans);
        mapParam.put("otp", o.otp);
        mapParam.put("paymenttype", Integer.parseInt(info.channel));
        mapParam.put("productid", config.getProductId());
        mapParam.put("hash", mapParam.hash(config.getKey()));

        Debug.info("ProcessTransaction.exe");
        Debug.info("url", o.url);
        Debug.info("data", Json.toJsonPretty(mapParam.getJson()));

        HttpClient.sendHttpPostJson(o.url, mapParam.getJson().toString(), o, config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);

    }

    private void finish (byte result)
    {
        finish(result, 0);
    }

    private void finish (byte result, int returnCode)
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
            info.isPaymentLib,
            returnCode,
            info.channel,
            info.item,
            info.offer,
            info.payTrans,
            info.partnerTrans,
            otp
           );

        if (isOnline)
        {
            if (info.isPaymentLib)
                userControl.send(new ResponsePaymentLibVerify(cmd, result).packData());
            else
                userControl.send(new ResponsePaymentSeaVerify(cmd, result).packData());

            if (isSuccess)
                userControl.game.seaTransaction = null;
        }
    }

    public static void log (String country,
                            short cmd,
                            int userId,
                            int level,
                            String appTrans,
                            byte result,
                            String otp,
                            boolean isPaymentLib
                           )
    {
        log(country, cmd, userId, level, appTrans, result, isPaymentLib, 0, "", "", "", "", "", otp);
    }

    private static void log (String country,
                             short cmd,
                             int userId,
                             int level,
                             String appTrans,
                             byte result,
                             boolean isPaymentLib,
                             int returnCode,
                             String channel,
                             String item,
                             String offer,
                             String payTrans,
                             String partnerTrans,
                             String otp
                            )
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
                             isPaymentLib,
                             returnCode,
                             channel,
                             item,
                             offer,
                             payTrans,
                             partnerTrans,
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
                finish(ErrorConst.FAIL, returnCode);
            else
                finish(ErrorConst.SUCCESS, returnCode);
        }
    }

    /*
{
  "transid": "TTEST2019081600012728",
  "partnertransid": "",
  "otp": "777",
  "paymenttype": 2002,
  "productid": 50020,
  "hash": "057e34e1a172f3cf0ae6001d00b66832"
}
{"status":1}
    */

    public static void test () throws Exception
    {
        String otp = "777";
        SeaGetTransaction.Info p = new SeaGetTransaction.Info();
        p.channel = MiscDefine.MM_SMS_OOREDOO;
        p.payTrans = "TTEST2019081900012757";
        p.partnerTrans = "";

        SeaVerifyOtp.exec(p, CmdDefine.PAYMENT_SEA_VERIFY, otp);
    }
}
