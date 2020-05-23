/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo;

import payment.demo.util.CommonUtils;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.ArrayList;
import java.util.List;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

/**
 *
 * @author chieuvh
 */
public class RegSms extends BasePayment {

    private static final Logger logger = Logger.getLogger(RegSms.class);

    public static void main(String[] args) throws Exception {
        RegSms regSms = new RegSms();
        PaymentInfo pir = PaymentInfo.getDemo(Config.appID, Config.key1, Config.pmcIDSms);
        regSms.submit(pir);
    }

    private void submit(PaymentInfo pir) throws Exception, InterruptedException {

        List<NameValuePair> nameValuePairList = new ArrayList();
        //set pay info

        setPaymentInfo(nameValuePairList, pir);
        //thong tin cua kenh thanh toan

        nameValuePairList.add(new BasicNameValuePair("mNetworkOperator", "45201"));

        //submit to payment
        String url = Config.domain + "/zmpapi/regsms";
        String response = CommonUtils.sendPost(nameValuePairList, url, Config.timeout);
        logger.info(response);
        JsonParser jsonParser = new JsonParser();
        JsonObject jsonObject = jsonParser.parse(response).getAsJsonObject();
        int returnCode = jsonObject.get("returnCode").getAsInt();
        String returnMessage = jsonObject.get("returnMessage").getAsString();

        if (returnCode == 1) {//lay cu phap sms thanh cong
            jsonObject = jsonObject.get("smsServicePhones").getAsJsonObject();
            String servicePhone = jsonObject.get("servicePhone").getAsString();
            String smsSyntax = jsonObject.get("smsSyntax").getAsString();
            logger.info(returnMessage);
            logger.info(servicePhone);
            logger.info(smsSyntax);
            return;
        }
        if (returnCode < 1) {//lay cu phap sms that bai
            logger.info(returnMessage);
            return;
        }

    }

}
