package payment.brazil.card;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonObject;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;

public class SetCvv extends HttpClientAbstractHandler
{
    private TestCard testCard;

    public SetCvv (TestCard testCard)
    {
        this.testCard = testCard;
    }

    @Override
    public void connectFail ()
    {
        Debug.info("SetCvv.connectFail");
    }

    @Override
    public void idle ()
    {
        Debug.info("SetCvv.idle");
    }

    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, HttpObject msg) throws Exception
    {
        if (msg instanceof HttpContent)
        {
            HttpContent content = (HttpContent) msg;
            String rawResponse = content.content().toString(CharsetUtil.UTF_8);

            Debug.info("SetCvv.channelRead0", rawResponse);
            ctx.close();

            PaymentBrazilGetTransaction.exec(testCard.username,
                                             testCard.userId,
                                             testCard.level,
                                             testCard.cmd,
                                             testCard.appTrans,
                                             testCard.itemInfo,
                                             testCard.typeCard,
                                             testCard.offer,
                                             testCard.userIP,
                                             testCard.country,
                                             testCard.cardName,
                                             testCard.email,
                                             testCard.phoneNumber,
                                             testCard.document,
                                             testCard.deviceId,
                                             testCard.accountDate,
                                             testCard.token,
                                             testCard.maskedCardNumber,
                                             testCard.typeCode,
                                             "",
                                             -1
                                            );
        }
    }

    //{"public_integration_key":"test_pk_TyVqi8gjtrYLbdo-lDxJYQ","token":"87061110870bde63120d5683733e1730050297ec32e008c4f7021febf5da8132b7808ea9c6de669c8c96321d29add65bb419a1e839950adc4b1d94d3ac3eb918","card_cvv":"123"}
    //{"status":"SUCCESS","token":"87061110870bde63120d5683733e1730050297ec32e008c4f7021febf5da8132b7808ea9c6de669c8c96321d29add65bb419a1e839950adc4b1d94d3ac3eb918","masked_card_number":"411111xxxxxx1111"}

    public static void sendRequest (TestCard o) throws Exception
    {
        EnvConfig.Brazil config = EnvConfig.getPaymentBrazil();
        JsonObject body = new JsonObject();

        body.addProperty("public_integration_key", o.key);
        body.addProperty("token", o.token);
        body.addProperty("card_cvv", o.cardCvv);

        String rawBody = body.toString();
        Debug.info("SetCvv.requestBody", rawBody);
        HttpClient.sendHttpPostText(o.urlSetCvv, rawBody, new SetCvv(o), config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);
    }
}
