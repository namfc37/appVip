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
public class AtmCreateOrder extends BasePayment {

    private static final Logger logger = Logger.getLogger(AtmCreateOrder.class);

    public static void main(String[] args) throws Exception {
        AtmCreateOrder atmCreateOrder = new AtmCreateOrder();
        PaymentInfo pir = PaymentInfo.getDemo(Config.appID, Config.key1, Config.pmcIDAtm);
        atmCreateOrder.submit(pir);
    }

    private void submit(PaymentInfo pir) throws Exception, InterruptedException {

        List<NameValuePair> nameValuePairList = new ArrayList();
        //set pay info

        setPaymentInfo(nameValuePairList, pir);
        //thong tin cua kenh thanh toan

        nameValuePairList.add(new BasicNameValuePair("bankCode", "123PVTB"));

        //submit to payment
        String url = Config.domain + "/zmpapi/atmcreateorder";
        String response = CommonUtils.sendPost(nameValuePairList, url, Config.timeout);
        logger.info(response);
        JsonParser jsonParser = new JsonParser();
        JsonObject jsonObject = jsonParser.parse(response).getAsJsonObject();
        int returnCode = jsonObject.get("returnCode").getAsInt();
        String returnMessage = jsonObject.get("returnMessage").getAsString();

        if (returnCode == 1) {//tao order thanh cong
            String redirectUrl = jsonObject.get("redirectUrl").getAsString();
            logger.info(returnMessage);
            logger.info(redirectUrl);
            //redirect den "redirectUrl" de nhap thong tin thanh toan
            return;
        }
        if (returnCode < 1) {//tao order that bai
            logger.info(returnMessage);
            return;
        }

    }

}
