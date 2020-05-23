/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo;

import payment.demo.util.AES256;
import payment.demo.util.HMACUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import java.util.List;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

/**
 *
 * @author chieuvh
 */
public class PaymentInfo {

    private static final Logger logger = Logger.getLogger(PaymentInfo.class);
    public String appID = "";
    public String appTransID = "";
    public String appUser = "";
    public String appTime = "";
    public String items = "";
    public String description = "";
    public String embedData = "";
    public String amount = "";
    public String platform = "";
    public String mac = "";
    public String pmcID = "";
    public String deviceID = "";
    public String appVer = "";
    public String mNetworkOperator = "";
    public String osVer = "";
    public String deviceModel = "";
    public String connType = "";
    public String userIP = "";
    public String clientID = "2";

    public String getHMacString() {
        String HmacDelimiter = "|";
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder
                .append(appID).append(HmacDelimiter)
                .append(appTransID).append(HmacDelimiter)
                .append(appUser).append(HmacDelimiter)
                .append(appTime).append(HmacDelimiter)
                .append(buildItemMac(items)).append(HmacDelimiter)
                .append(embedData);
        logger.info("getHMacString " + stringBuilder.toString());
        return stringBuilder.toString();

    }

    public String buildItemMac(String itemsStr) {
        System.out.println("buildItemMac " + itemsStr);
        if (StringUtils.isEmpty(itemsStr)) {
            return "";
        }
        Gson gson = new GsonBuilder().create();
        List<PaymentItem> itemList = gson.fromJson(itemsStr, new TypeToken<List<PaymentItem>>() {
        }.getType());
        StringBuilder sb = new StringBuilder();
        for (PaymentItem zaloPaymentItem : itemList) {
            sb.append(zaloPaymentItem.itemID);
            sb.append(".");
            sb.append(zaloPaymentItem.itemName);
            sb.append(".");
            sb.append(zaloPaymentItem.itemPrice);
            sb.append(".");
            sb.append(zaloPaymentItem.itemQuantity);
        }
        System.out.println("buildItemMac " + sb.toString());
        return sb.toString();

    }

    public static PaymentInfo getDemo(String appID, String key1, String pmcID) throws Exception {
        AES256 aes256 = new AES256();
        PaymentInfo req = new PaymentInfo();
        req.appID = appID;
        req.appTransID = "Android_" + System.currentTimeMillis();
        req.appUser = "pmqc";
        req.appTime = System.currentTimeMillis() + "";
        req.items = "[{\"itemID\":\"it002\",\"itemName\":\"Color 50K\",\"itemQuantity\":1,\"itemPrice\":50000}]";
        req.description = "thanh toan cho game abc";
        req.embedData = aes256.encrypt("appprivatekey", "appprivatedata");
        if (Config.pmcIDSms.equals(pmcID)) {
            req.amount = "15000";
        } else {
            req.amount = "100000";
        }

        req.platform = "ios";
        req.pmcID = pmcID;

        req.appVer = "app1.1";
        req.mNetworkOperator = "45201";
        req.osVer = "osversion1001";
        req.deviceModel = "iphone4";
        req.connType = "wifi";
        req.userIP = "127.0.0.9";
        req.deviceID = "dv123456789";
        String hmacString = req.getHMacString();
        String mac = HMACUtil.HMacHexStringEncode("HmacSHA256", key1, hmacString);
        req.mac = mac;
        return req;
    }

}

class PaymentItem {
    public String itemID = "";
    public String itemName = "";
    public long itemPrice = 0;
    public long itemQuantity = 0;
}
