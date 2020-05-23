package payment.brazil.card;

import bitzero.util.common.business.Debug;
import com.google.gson.JsonObject;
import data.MiscDefine;
import extension.EnvConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.util.CharsetUtil;
import util.Json;
import util.io.http.HttpClient;
import util.io.http.HttpClientAbstractHandler;

public class GetToken extends HttpClientAbstractHandler
{
    private TestCard testCard;

    public GetToken (TestCard testCard)
    {
        this.testCard = testCard;
    }

    @Override
    public void connectFail ()
    {
        Debug.info("GetToken.connectFail");
    }

    @Override
    public void idle ()
    {
        Debug.info("GetToken.idle");
    }

    @Override
    protected void channelRead0 (ChannelHandlerContext ctx, HttpObject msg) throws Exception
    {
        if (msg instanceof HttpContent)
        {
            HttpContent content = (HttpContent) msg;
            String rawResponse = content.content().toString(CharsetUtil.UTF_8);

            Debug.info("GetToken.channelRead0", rawResponse);
            ctx.close();

            JsonObject res = Json.parse(rawResponse).getAsJsonObject();
            testCard.typeCode = res.get("payment_type_code").getAsString();
            testCard.token = res.get("token").getAsString();
            testCard.maskedCardNumber = res.get("masked_card_number").getAsString();

            SetCvv.sendRequest(testCard);
        }
    }

    //{"public_integration_key":"test_pk_TyVqi8gjtrYLbdo-lDxJYQ","country":"br","payment_type_coe":"creditcard","creditcard":{"card_number":"4111111111111111","card_name":"SANTA ANNA","card_due_date":"12/2020","card_cvv":"123"}}
    //{"status":"SUCCESS","payment_type_code":"visa","token":"87061110870bde63120d5683733e1730050297ec32e008c4f7021febf5da8132b7808ea9c6de669c8c96321d29add65bb419a1e839950adc4b1d94d3ac3eb918","masked_card_number":"411111xxxxxx1111"}

    public static void sendRequest (TestCard o) throws Exception
    {
        EnvConfig.Brazil config = EnvConfig.getPaymentBrazil();
        String country = MiscDefine.COUNTRY_BRAZIL;

        JsonObject body = new JsonObject();
        JsonObject info = new JsonObject();

        body.addProperty("public_integration_key", o.key);
        body.addProperty("country", country);
        body.addProperty("payment_type_code", "creditcard");
        body.add("creditcard", info);

        info.addProperty("card_number", o.cardNumber);
        info.addProperty("card_name", o.cardName);
        info.addProperty("card_due_date", o.cardDueDate);
        info.addProperty("card_cvv", o.cardCvv);

        String rawBody = body.toString();
        Debug.info("GetToken.urlGetToken", o.urlGetToken);
        Debug.info("GetToken.requestBody", rawBody);

        HttpClient.sendHttpPostText(o.urlGetToken, rawBody, new GetToken(o), config.getConnectTimeout() * 1000, config.getIdleTime() * 1000);
    }
}
