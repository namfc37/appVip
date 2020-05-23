/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo;

import java.util.List;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

/**
 *
 * @author chieuvh
 */
public class BasePayment {
    protected void setPaymentInfo(List<NameValuePair> nameValuePairList, PaymentInfo pir) {
        nameValuePairList.add(new BasicNameValuePair("appID", pir.appID));
        nameValuePairList.add(new BasicNameValuePair("appUser", pir.appUser));
        nameValuePairList.add(new BasicNameValuePair("appTransID", pir.appTransID));
        nameValuePairList.add(new BasicNameValuePair("appTime", pir.appTime));
        nameValuePairList.add(new BasicNameValuePair("items", pir.items));
        nameValuePairList.add(new BasicNameValuePair("embedData", pir.embedData));
        nameValuePairList.add(new BasicNameValuePair("amount", pir.amount));
        nameValuePairList.add(new BasicNameValuePair("pmcID", pir.pmcID));
        nameValuePairList.add(new BasicNameValuePair("mac", pir.mac));
        nameValuePairList.add(new BasicNameValuePair("platform", pir.platform));
        nameValuePairList.add(new BasicNameValuePair("deviceModel", pir.deviceModel));
        nameValuePairList.add(new BasicNameValuePair("description", pir.description));
        nameValuePairList.add(new BasicNameValuePair("connType", pir.connType));
        nameValuePairList.add(new BasicNameValuePair("clientID", pir.clientID));
        nameValuePairList.add(new BasicNameValuePair("appVer", pir.appVer));
        nameValuePairList.add(new BasicNameValuePair("osVer", pir.osVer));
        nameValuePairList.add(new BasicNameValuePair("userIP", pir.userIP));
    }
}
