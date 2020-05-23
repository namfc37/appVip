/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import javax.servlet.http.HttpServletRequest;
import org.apache.log4j.Logger;
import payment.demo.util.HMACUtil;

/**
 *
 * @author chieuvh
 */
public class CallbackHandler {

    private static final Logger logger = Logger.getLogger(CallbackHandler.class);

    public static void main(String[] args) throws IOException {
        HttpServletRequest httpReq = null;//httpReq from servlet context
        String dataFromReq = getDataFromReq(httpReq);
        logger.info("getDataFromReq " + dataFromReq);
        JsonParser jsonParser = new JsonParser();
        JsonObject dataFromPaymentJson = jsonParser.parse(dataFromReq).getAsJsonObject();
        String dataField = dataFromPaymentJson.get("data").getAsString();
        String macField = dataFromPaymentJson.get("mac").getAsString();
        String mac = HMACUtil.HMacHexStringEncode("HmacSHA256", Config.key2, dataField);
        logger.info("comparemac " + mac.equals(macField));
        if(mac.equals(macField)==false){
            logger.error("invalid mac");
            return;
        }
        JsonObject dataJson = jsonParser.parse(dataField).getAsJsonObject();
        String appTransID = dataJson.get("appTranxId").getAsString();
        logger.info("appTranxId " + appTransID);
        String appUser = dataJson.get("appUser").getAsString();
        logger.info("appUser " + appUser);
        long netAmount = dataJson.get("netAmount").getAsLong();
        logger.info("netAmount " + netAmount);
        //todo : add gold

    }

    public static String getDataFromReq(HttpServletRequest httpReq) throws IOException {
//        try (InputStreamReader inputStreamReader
//                = new InputStreamReader(httpReq.getInputStream())) {
//            try (BufferedReader br = new BufferedReader(inputStreamReader)) {
//                String json = "";
//                StringBuilder stringBuilder = new StringBuilder();
//
//                while (json != null) {
//                    json = br.readLine();
//                    if (json != null) {
//                        stringBuilder.append(json);
//                    }
//                }
//                return stringBuilder.toString();
//            }
//        }

        return "{\"data\":\"{\\\"appId\\\":7,\\\"appTranxId\\\":\\\"Android_1473151456374\\\",\\\"appTime\\\":1473151456374,\\\"appUser\\\":\\\"pmqc\\\",\\\"items\\\":\\\"[{\\\\\\\"itemId\\\\\\\":\\\\\\\"it002\\\\\\\",\\\\\\\"itemName\\\\\\\":\\\\\\\"Color 50K\\\\\\\",\\\\\\\"itemQuantity\\\\\\\":1,\\\\\\\"itemPrice\\\\\\\":50000}]\\\",\\\"amount\\\":10000,\\\"netAmount\\\":10000,\\\"orgAmount\\\":0.0,\\\"currencyUnit\\\":\\\"\\\",\\\"embedData\\\":\\\"hGDzoaHutx6mUjy3UMps_A\\\",\\\"zacTranxId\\\":\\\"160906000003009\\\",\\\"zacServerTime\\\":1473151457481,\\\"channel\\\":1}\",\"mac\":\"2bc7934e80fa3127d0a2554f28fce2bd905b367c00767c7db2141fccfc0d02fb\"}";
    }
}
