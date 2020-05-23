/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo;

import payment.demo.util.AES256;
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
public class SubmitCard extends BasePayment {

    private static final Logger logger = Logger.getLogger(SubmitCard.class);

    public static void main(String[] args) throws Exception {
        SubmitCard submitCard = new SubmitCard();
        submitCard.submit();
    }

    private void submit() throws Exception, InterruptedException {
        List<NameValuePair> nameValuePairList = new ArrayList();
        //set pay info
        PaymentInfo pir = PaymentInfo.getDemo(Config.appID, Config.key1, Config.pmcIDZingCard);
        setPaymentInfo(nameValuePairList, pir);
        //thong tin cua kenh thanh toan
        AES256 aes256 = new AES256();
        String cardSerialEncrypt = aes256.encrypt(Config.key1, "KB0053628823");
        String cardCodeEncrypt = aes256.encrypt(Config.key1, "JYTM8W43D");
        nameValuePairList.add(new BasicNameValuePair("cardSerialEncrypt", cardSerialEncrypt));
        nameValuePairList.add(new BasicNameValuePair("cardCodeEncrypt", cardCodeEncrypt));

        //submit to payment
        String url = Config.domain + "/zmpapi/submitcard";
        String response = CommonUtils.sendPost(nameValuePairList, url, Config.timeout);
        logger.info(response);
        JsonParser jsonParser = new JsonParser();
        JsonObject jsonObject = jsonParser.parse(response).getAsJsonObject();
        int returnCode = jsonObject.get("returnCode").getAsInt();
        String returnMessage = jsonObject.get("returnMessage").getAsString();

        if (returnCode == 1) {//gach the thanh cong
            long ppValue = jsonObject.get("ppValue").getAsLong();
            logger.info(ppValue);
            logger.info(returnMessage);
            return;
        }
        if (returnCode < 1) {//gach the that bai
            logger.info(returnMessage);
            return;
        }
        //returnCode > 1 => giao dich dang xu ly => goi getstatus de lay trang thai cuoi cung
        String transid = jsonObject.get("zmpTransID").getAsString();
        url = Config.domain + "/zmpapi/getstatus";
        nameValuePairList = new ArrayList();
        nameValuePairList.add(new BasicNameValuePair("zmpTransID", transid));
        while (true) {
            response = CommonUtils.sendPost(nameValuePairList, url, Config.timeout);
            System.out.println(response);
            jsonObject = jsonParser.parse(response).getAsJsonObject();
            if (jsonObject.get("isProcessing").getAsBoolean() == false) {
                returnMessage = jsonObject.get("returnMessage").getAsString();
                logger.info(returnMessage);
                break;
            }

        }

    }

}
