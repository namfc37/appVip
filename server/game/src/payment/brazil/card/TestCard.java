package payment.brazil.card;

import data.CmdDefine;
import data.MiscDefine;
import data.PaymentInfo;
import util.Time;

public class TestCard
{
    public int    typeCard;

    public String cardNumber;
    public String cardName;
    public String cardDueDate;
    public String cardCvv;

    public String urlGetToken;
    public String key;
    public String urlSetCvv;

    public String typeCode;
    public String token;
    public String maskedCardNumber;

    public String      country     = MiscDefine.COUNTRY_BRAZIL;
    public PaymentInfo paymentInfo = PaymentInfo.get(country);

    public String           username = "thuanvt_01";
    public int              userId   = 1;
    public int              level    = 100;
    public short            cmd      = CmdDefine.PAYMENT_BRAZIL_GET_TRANSACTION;
    public String           appTrans = "appTrans_" + Time.getTimeMillis();
    public String           item     = "card.coin.br.199";
    public PaymentInfo.Item itemInfo = paymentInfo.getItem(item);
    public String           offer    = "";
    public String           userIP   = "";

    public String name = "VO TOAN THUAN";
    public String email = "thuanvt@vng.com.vn";
    public String phoneNumber = "(85) 2284-7035";
    public String document = "853.513.468-93";
    public String deviceId = "";
    public String accountDate = "2019-11-14";

    public static void testVisa () throws Exception
    {
        TestCard o = new TestCard();
        o.typeCard = MiscDefine.BR_CREDIT_VISA;
        o.cardNumber = "4111111111111111";
        //o.cardNumber = "4716909774636285";
        o.cardName = "SANTA ANNA";
        o.cardDueDate = "12/2020";
        o.cardCvv = "123";

        seanRequest(o);
    }

    public static void testDiscover () throws Exception
    {
        TestCard o = new TestCard();
        o.typeCard = MiscDefine.BR_CREDIT_DISCOVER;
        o.cardNumber = "6011111111111117";
        o.cardName = "SANTA ANNA";
        o.cardDueDate = "12/2020";
        o.cardCvv = "123";

        seanRequest(o);
    }

    public static void seanRequest (TestCard o) throws Exception
    {
        PaymentBrazilGetFlow.sendRequest(o.typeCard);
        Thread.sleep(3000);

        PaymentBrazilGetFlow.CacheInfo flowInfo = waitGetFlowInfo(o.typeCard);
        String[] flowData = flowInfo.getData();
        o.urlGetToken = flowData[0];
        o.key = flowData[1];
        o.urlSetCvv = flowData[2];

        GetToken.sendRequest(o);
    }

    private static PaymentBrazilGetFlow.CacheInfo waitGetFlowInfo (int typeCard) throws Exception
    {
        PaymentBrazilGetFlow.CacheInfo info;
        while ((info = PaymentBrazilGetFlow.getInfo(typeCard)) == null)
            Thread.sleep(1000);

        return info;
    }
}

