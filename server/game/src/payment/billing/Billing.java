package payment.billing;

import bitzero.util.config.bean.ConstantMercury;
import bitzero.util.socialcontroller.bean.UserInfo;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import model.CoinFramework;
import model.UserBrief;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import util.Json;
import util.io.UrlEncoder;
import util.metric.MetricLog;

public class Billing
{

    public static long inquiryBalanceDB (int userId)
    {
        return CoinFramework.get(userId);
    }

    public static long inquiryBalance (UserBrief brief)
    {
        return inquiryBalance(Integer.toString(brief.getUserId()), brief.getUsername());
    }

    public static long inquiryBalance (UserInfo userInfo)
    {
        return inquiryBalance(userInfo.getUserId(), userInfo.getUsername());
    }

    public static long inquiryBalance (String userId, String username)
    {
        long startTime = System.currentTimeMillis();
        int error;
        String request = null;
        String rawResponse = null;
        long cashRemain = -1;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            try
            {
                UrlEncoder encoder = new UrlEncoder(ConstantMercury.URL_REQUEST_BILLING);
                encoder.addParam("serviceName", "balance");
                encoder.addParam("uId", userId);
                encoder.addParam("userName", username);

                request = encoder.toString();
                rawResponse = sendRequest(request);

                if (rawResponse == null)
                {
                    error = 1;
                }
                else
                {
                    JsonElement response = Json.parse(rawResponse);
                    JsonArray aRes = response.getAsJsonArray();
                    JsonElement result = aRes.get(0); //int
                    if (result.getAsInt() == 1)
                    {
                        JsonObject packet = aRes.get(1).getAsJsonObject();//BalancePacketReceive.class
                        JsonElement retCode = packet.get("RetCode");
                        if (retCode.getAsInt() == 1)
                        {
                            error = 0;
                            cashRemain = packet.get("CashRemain").getAsInt();
                        }
                        else
                            error = 2;
                    }
                    else
                    {
                        error = 3;
                    }
                }

            }
            catch (Exception e)
            {
                error = 4;
                MetricLog.exception(e, request, rawResponse);
            }
        }
        else
        {
            error = 5;
        }

        if (error != 0)
        {
            MetricLog.billing(userId,
                              error,
                              cashRemain,
                              System.currentTimeMillis() - startTime,
                              request,
                              rawResponse
                             );
        }

        return cashRemain;
    }

    public static long purchase (UserBrief brief, long price, PurchaseInfo info, String transactionId, String description, String socialType, int platformID)
    {
        return purchase(Integer.toString(brief.getUserId()), brief.getUsername(), price, info, transactionId, description, brief.level, socialType, platformID);
    }

    public static long purchase (UserInfo userInfo, long price, PurchaseInfo info, String transactionId, String description, int level, String socialType, int platformID)
    {
        return purchase(userInfo.getUserId(), userInfo.getUsername(), price, info, transactionId, description, level, socialType, platformID);
    }

    private static long purchase (String userId, String username, long price, PurchaseInfo info, String transactionId, String description, int level, String socialType, int platformID)
    {
        long startTime = System.currentTimeMillis();
        long cashRemain = -1;
        int error;
        String request = null;
        String rawResponse = null;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            try
            {
                UrlEncoder encoder = new UrlEncoder(ConstantMercury.URL_REQUEST_BILLING);
                encoder.addParam("serviceName", "purchase");
                encoder.addParam("uId", userId);
                encoder.addParam("userName", username);
                encoder.addParam("money", price);
                encoder.addParam("itemInfo", info);

                encoder.addParam("transactionId", transactionId);
                encoder.addParam("action", info.action);
                encoder.addParam("description", description);
                encoder.addParam("level", level);
                encoder.addParam("socialType", socialType);
                encoder.addParam("platformID", platformID);

                request = encoder.toString();
                rawResponse = sendRequest(request);

                if (rawResponse == null)
                {
                    error = 1;
                }
                else
                {
                    JsonElement response = Json.parse(rawResponse);
                    JsonArray aRes = response.getAsJsonArray();
                    JsonElement result = aRes.get(0); //int
                    if (result.getAsInt() == 1)
                    {
                        JsonObject packet = aRes.get(1).getAsJsonObject();//BalancePacketReceive.class
                        JsonElement retCode = packet.get("RetCode");
                        if (retCode.getAsInt() == 1)
                        {
                            error = 0;
                            cashRemain = packet.get("CashRemain").getAsInt();
                        }
                        else
                            error = 2;
                    }
                    else
                    {
                        error = 3;
                    }
                }
            }
            catch (Exception e)
            {
                error = 4;
                MetricLog.exception(e, request, rawResponse);
            }
        }
        else
        {
            error = 5;
        }

        if (error != 0)
        {
            MetricLog.billing(userId,
                              error,
                              cashRemain,
                              System.currentTimeMillis() - startTime,
                              request,
                              rawResponse
                             );
        }

        return cashRemain;
    }

    public static long promoInGame (UserInfo userInfo, int promo, String transactionId, Object type, String description, int level, String socialType, int platformID)
    {
        return promo(userInfo.getUserId(), userInfo.getUsername(), promo, transactionId, "", 101, type, description, level, socialType, platformID);
    }

    public static long promoPayment (UserInfo userInfo, int promo, String appTrans, String payTrans, Object type, String description, int level, String socialType, int platformID)
    {
        return promo(userInfo.getUserId(), userInfo.getUsername(), promo, appTrans, payTrans, 102, type, description, level, socialType, platformID);
    }

    public static long promoConvertData (UserInfo userInfo, int promo, String transactionId, Object type, String description, int level, String socialType, int platformID)
    {
        return promo(userInfo.getUserId(), userInfo.getUsername(), promo, transactionId, "", 105, type, description, level, socialType, platformID);
    }

    public static long promoCompensation (UserBrief brief, int promo, String transactionId, Object type, String description, String socialType, int platformID)
    {
        return promo(Integer.toString(brief.getUserId()), brief.getUsername(), promo, transactionId, "", 104, type, description, brief.level, socialType, platformID);
    }

    private static long promo (String userId, String username, int promo, String appTrans, String payTrans, int campaign, Object type, String description, int level, String socialType, int platformID)
    {
        long startTime = System.currentTimeMillis();
        int error;
        String request = null;
        String rawResponse = null;
        long cashRemain = -1;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            try
            {
                UrlEncoder encoder = new UrlEncoder(ConstantMercury.URL_REQUEST_BILLING);
                encoder.addParam("serviceName", "promo");
                encoder.addParam("uId", userId);
                encoder.addParam("userName", username);
                encoder.addParam("money", promo);

                encoder.addParam("campaign", campaign);
                encoder.addParam("type", type);
                encoder.addParam("description", description);
                encoder.addParam("appTrans", appTrans);
                encoder.addParam("payTrans", payTrans);
                encoder.addParam("level", level);
                encoder.addParam("socialType", socialType);
                encoder.addParam("platformID", platformID);

                request = encoder.toString();
                rawResponse = sendRequest(request);

                if (rawResponse == null)
                {
                    error = 1;
                }
                else
                {
                    JsonElement response = Json.parse(rawResponse);
                    JsonArray aRes = response.getAsJsonArray();
                    JsonElement result = aRes.get(0); //int
                    if (result.getAsInt() == 1)
                    {
                        JsonObject packet = aRes.get(1).getAsJsonObject();//BalancePacketReceive.class
                        JsonElement retCode = packet.get("RetCode");
                        if (retCode.getAsInt() == 1)
                        {
                            error = 0;
                            cashRemain = packet.get("CashRemain").getAsInt();
                        }
                        else
                            error = 2;
                    }
                    else
                    {
                        error = 3;
                    }
                }
            }
            catch (Exception e)
            {
                error = 4;
                MetricLog.exception(e, request, rawResponse);
            }
        }
        else
        {
            error = 5;
        }


        if (error != 0)
        {
            MetricLog.billing(userId,
                              error,
                              cashRemain,
                              System.currentTimeMillis() - startTime,
                              request,
                              rawResponse
                             );
        }

        return cashRemain;
    }

    public static long addCashIAP (Card card)
    {
        long startTime = System.currentTimeMillis();
        int error;
        long cashRemain = -1;
        String request = null;
        String rawResponse = null;

        if (ConstantMercury.ENABLE_PAYMENT)
        {
            try
            {
                UrlEncoder encoder = new UrlEncoder(ConstantMercury.URL_REQUEST_BILLING);
                encoder.addParam("serviceName", "addCashIAP");
                encoder.addParam("uId", card.userId);
                encoder.addParam("userName", card.username);
                encoder.addParam("money", card.coinConvert);
                encoder.addParam("gConvert", card.convertCash);
                encoder.addParam("type", card.type);
                encoder.addParam("gross", card.gross);
                encoder.addParam("net", card.net);
                encoder.addParam("transactionId", card.payTrans);

                encoder.addParam("appTrans", card.appTrans);
                encoder.addParam("item", card.item);
                encoder.addParam("level", card.level);
                encoder.addParam("offer", card.offer);
                encoder.addParam("socialType", card.socialType);
                encoder.addParam("platformID", card.platformID);

                request = encoder.toString();
                rawResponse = sendRequest(request);

                if (rawResponse == null)
                {
                    error = 1;
                }
                else
                {
                    JsonElement response = Json.parse(rawResponse);
                    JsonArray aRes = response.getAsJsonArray();
                    JsonElement result = aRes.get(0); //int
                    if (result.getAsInt() == 1)
                    {
                        JsonObject packet = aRes.get(1).getAsJsonObject();//BalancePacketReceive.class
                        JsonElement retCode = packet.get("RetCode");
                        if (retCode.getAsInt() == 1)
                        {
                            error = 0;
                            cashRemain = packet.get("CashRemain").getAsInt();
                        }
                        else
                            error = 2;
                    }
                    else
                    {
                        error = 3;
                    }
                }
            }
            catch (Exception e)
            {
                error = 5;
                MetricLog.exception(e, request, rawResponse);
            }
        }
        else
        {
            error = -5;
        }

        if (error != 0)
        {
            MetricLog.billing(card.userId,
                              error,
                              cashRemain,
                              System.currentTimeMillis() - startTime,
                              request,
                              rawResponse
                             );
        }

        return cashRemain;
    }

    private static String sendRequest (String url)
    {
        String result = null;

        try
        {
            RequestConfig config = RequestConfig.custom()
                                                .setConnectTimeout(ConstantMercury.TIMEOUT_HTTP)
                                                .setConnectionRequestTimeout(ConstantMercury.TIMEOUT_HTTP)
                                                .setSocketTimeout(ConstantMercury.TIMEOUT_HTTP)
                                                .build();

            CloseableHttpClient http = HttpClientBuilder.create().setDefaultRequestConfig(config).build();
            HttpGet request = new HttpGet(url);
            CloseableHttpResponse response = null;
            try
            {
                response = http.execute(request);
                HttpEntity entity = response.getEntity();
                result = EntityUtils.toString(entity, "UTF-8");
                EntityUtils.consume(entity);
            }
            catch (Exception e)
            {
                MetricLog.exception(e, url);
            }
            finally
            {
                if (response != null)
                    response.close();
            }
        }
        catch (Exception e)
        {
            MetricLog.exception(e, url);
        }

        return result;
    }
}
