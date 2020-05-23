package payment.billing;

import data.ItemSubType;
import data.MiscDefine;
import payment.GoogleSubmit;

//WARNING: Tên biến trong file này phải giống trong Card.php của billing
public class Card
{
    public int    userId;
    public String username;
    public long   appTime;
    public String appTrans;
    public String payTrans;
    //public String bilTrans;
    public double gross;
    public double net;
    //public int    coinRemain;     //tiền tồn trong hệ thống billing
    //public int    coinCash;       //cash trong key IFRS
    //public int    coinPromo;      //promo trong key IFRS
    public int    coinConvert;    //tổng số coin sẽ convert
    public int    convertCash;    //số cash sẽ convert
    public int    convertPromo;   //số promo sẽ convert
    //public int    addCash  = 0;    //số cash thực tế đã thêm vào hệ thống billing
    //public int    addPromo = 0;   //số promo thực tế đã thêm vào hệ thống billing
    //public String gateway;
    public String type;
    public String subType;
    public String item;
    public String description;
    public String offer;
    public int    level;
    public String socialType;
    public int platformID;

    public String noteProcessing;


    public static Card createGoogle (int userId,
                                     String username,
                                     long appTime,
                                     String appTrans,
                                     String payTrans,
                                     int gross,
                                     int coinConvert,
                                     String item,
                                     String offer,
                                     int level,
                                     String country,
                                     String socialType,
                                     int platformID)
    {
        Card card = new Card();
        card.userId = userId;
        card.username = username;
        card.appTime = appTime;
        card.appTrans = appTrans;
        card.payTrans = payTrans;
        card.gross = gross;
        card.net = card.gross * GoogleSubmit.PERCENT_NET_GROSS / 100;
        card.coinConvert = coinConvert;
        card.convertCash = card.coinConvert * GoogleSubmit.PERCENT_NET_GROSS / 100;
        card.convertPromo = card.coinConvert - card.convertCash;
        card.subType = ItemSubType.NAME[ItemSubType.IAP];
        card.item = item;
        card.offer = offer;
        card.level = level;
        card.type = getType(country);
        card.socialType = socialType;
        card.platformID = platformID;

        return card;
    }

    public static String getType (String country)
    {
        switch (country)
        {
            case MiscDefine.COUNTRY_VIETNAM:
                return "GGVn";
            case MiscDefine.COUNTRY_BRAZIL:
                return "GGBr";
            case MiscDefine.COUNTRY_THAILAND:
                return "GGTh";
            case MiscDefine.COUNTRY_MYANMAR:
                return "GGMm";
            case MiscDefine.COUNTRY_PHILIPPINE:
                return "GGPh";
        }
        return "GGWallet";
    }

    public static Card createTestCard (int userId,
                                       String username,
                                       String appTrans,
                                       int gross,
                                       int coin,
                                       String item,
                                       String type,
                                       String subType,
                                       String offer,
                                       int level)
    {
        int rate = 70;

        Card card = new Card();
        card.userId = userId;
        card.username = username;
        card.appTime = System.currentTimeMillis();
        card.appTrans = appTrans;
        card.payTrans = "TEST_" + appTrans;
        card.gross = gross;
        card.net = card.gross * rate / 100;
        card.coinConvert = coin;
        card.convertCash = card.coinConvert * rate / 100;
        card.convertPromo = card.coinConvert - card.convertCash;
        card.type = type;
        card.subType = subType;
        card.item = item;
        card.offer = offer;
        card.level = level;
        return card;
    }
}
