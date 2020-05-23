package modules.seapayment ;

import bitzero.server.entities.User ;
import bitzero.server.extensions.BaseClientRequestHandler ;

import bitzero.server.extensions.data.DataCmd ;

import bitzero.util.common.business.Debug ;

import extension.BiaCardExtension ;

import general.cmd.CmdDefine ;

import general.config.GameConfig ;

import java.io.IOException ;
import java.io.UnsupportedEncodingException ;

import java.security.NoSuchAlgorithmException ;

import java.util.HashMap ;
import java.util.Iterator ;
import java.util.Map ;
import java.util.TreeMap ;


import modules.user.model.PlayerInfo ;

import org.apache.commons.lang.exception.ExceptionUtils ;

import org.apache.http.HttpEntity ;
import org.apache.http.HttpResponse ;
import org.apache.http.client.ClientProtocolException ;
import org.apache.http.client.methods.HttpPost ;
import org.apache.http.entity.StringEntity ;
import org.apache.http.impl.client.CloseableHttpClient ;
import org.apache.http.protocol.HTTP ;
import org.apache.http.util.EntityUtils ;

import org.json.JSONException ;
import org.json.JSONObject ;

import org.slf4j.Logger ;
import org.slf4j.LoggerFactory ;

import util.ErrorDefine ;
import util.GameUtil ;

import util.connection.HttpUtil ;

import util.database.DatabaseHandler ;

public class SeaPaymentHandler extends BaseClientRequestHandler
{   
    private final Logger logger = LoggerFactory.getLogger("SeaPaymentHandler");
    private static final String HASH_KEY = "GsnPokerSea&$1";
    
    public SeaPaymentHandler ()
    {
        super () ;
    }
    
    public void handleClientRequest(User user, DataCmd cmd) {
        try {
            switch (cmd.getId()) {
                case 32003:
                    processRequestPayment(user, cmd);
                    break;
                case 32004:
                    processRequestVerifyOTP(user, cmd);
                    break;
            }
        } catch (Exception e) {
            logger.warn("EXCEPTION " + e.getMessage());
            logger.warn(ExceptionUtils.getStackTrace(e));
        }
    }
    
    public void processRequestVerifyOTP(User user, DataCmd cmd) throws Exception {
        RequestVerifyOTP req = new RequestVerifyOTP(cmd);
        ResponseVerifyOTP res = new ResponseVerifyOTP();
        int uId = user.getId();
        PlayerInfo pInf = PlayerInfo.getPlayerInfo(uId);
        if (pInf == null) {
            res.Error = 1;
            GameUtil.response(res, user);
            return;
        }
        String otp = req.otp;
        int paymenttype = req.paymenttype;
        String transId = req.transId;
        String partnertransId = req.refId;
        int productID = req.productId;
        
        if (otp.equals("") || transId.equals("") || partnertransId.equals("")) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }

        JSONObject result = null;
        try {
            result = verifyOtpTransaction(otp, paymenttype, transId, partnertransId, productID);
        } catch (Exception e) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }
        if (result == null) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }

        if (result.getInt("status") != 1) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }
        res.Error = 0;
        GameUtil.response(res, user);
    }
    
    public static JSONObject verifyOtpTransaction(String otp, int paymenttype, String transId,
                                                  String partnertransId, int productId) throws Exception {
        String strResponse = null;
        CloseableHttpClient httpclient = HttpUtil.getNewHttpClient(GameConfig.HTTP_TIMEOUT);
        try {
            HttpPost httpPost = new HttpPost(GameConfig.URL_VERIFY_OTP_TRANSACTION);
            HashMap<String, Object> data = new HashMap<String, Object>();

            data.put("transid", transId);
            data.put("partnertransid", partnertransId);
            data.put("otp", otp);
            data.put("paymenttype", paymenttype); // int
            data.put("productid", productId); // int
            Map<String, Object> afterData = new TreeMap<String, Object>(data);
            String strData = "";
            Iterator it = afterData.keySet().iterator();
            while (it.hasNext()) {
                String key = it.next().toString();
                strData += afterData.get(key);
            }
            String hash = GameUtil.toMD5(strData + HASH_KEY);
            afterData.put("hash", hash);
            String afterStr = DatabaseHandler.gson.toJson(afterData);
            StringEntity entity = new StringEntity(afterStr, HTTP.UTF_8);
            entity.setContentType("application/json");
            httpPost.setEntity(entity);
            HttpResponse response = httpclient.execute(httpPost);
            HttpEntity resEntity = response.getEntity();

            if (resEntity != null) {
                strResponse = EntityUtils.toString(resEntity);
            }
            if (strResponse == null)
                return null;

        } catch (Exception e) {
            Debug.warn("verifyOtpTransaction: Exception:" + e.getMessage());
            return null;
        } finally {
            httpclient.close();
        }

        JSONObject resJSON = new JSONObject(strResponse);
        Debug.info("verifyOtpTransaction:" + resJSON);
        return resJSON;
    }
    
    public void processRequestPayment(User user, DataCmd cmd) throws Exception {
        RequestPayment req = new RequestPayment(cmd);
        ResponsePayment res = new ResponsePayment();
        PlayerInfo pInf = PlayerInfo.getPlayerInfo(user);
        if (pInf == null) {
            res.Error = 1;
            send(res, user);
            return;
        }
        JSONObject result = null;
        try {
            result = createTransaction(pInf.getUserId (), req.productID, req.paymentType, req.countryID, req.amount, req.cardno, req.extradata);
        } catch (Exception e) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }
        if (result == null) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }
        
        if (result.getInt("status") != 1) {
            res.Error = 2;
            GameUtil.response(res, user);
            return;
        }
        
        res.Error = 0;
        res.result = result.toString ();
        GameUtil.response(res, user);
    }

    public static JSONObject createTransaction(int uId, int productID, int paymentType, String countryID,
                                                int amount, String cardno, String extradata) throws JSONException,
                                                                                                    NoSuchAlgorithmException,
                                                                                                    UnsupportedEncodingException,
                                                                                                    IOException,
                                                                                                    ClientProtocolException,
                                                                                                    Exception {

        PlayerInfo pInf = PlayerInfo.getPlayerInfo(uId);
        if (pInf == null) {
            return null;
        }

        String strResponse = null;
        CloseableHttpClient httpclient = HttpUtil.getNewHttpClient(GameConfig.HTTP_TIMEOUT);
        try {
            HttpPost httpPost = new HttpPost("http://118.102.3.28:10099/payment/getTransaction/");
            HashMap<String, Object> data = new HashMap<String, Object>();

            data.put("accountname", pInf.accName);
            data.put("accountid", pInf.getUserId()); //int
            data.put("productid", productID); //int
            data.put("paymenttype", paymentType); // int
            data.put("countryid", countryID); //string
            data.put("amount", amount); //int
            data.put("cardno", cardno);
            data.put("extradata", extradata);
            data.put("timestamp", System.currentTimeMillis()/1000);
            //sort by key alphabet
            Map<String, Object> afterData = new TreeMap<String, Object>(data);
            String strData = "";
            Iterator it = afterData.keySet().iterator();
            while (it.hasNext()) {
                String key = it.next().toString();
                strData += afterData.get(key);
            }
            //gen hash key
            String hash = GameUtil.toMD5(strData + HASH_KEY);
            //send http req
            String afterStr = DatabaseHandler.gson.toJson(afterData);
            StringEntity entity = new StringEntity(afterStr, HTTP.UTF_8);
            entity.setContentType("application/json");
            httpPost.setEntity(entity);

            HttpResponse response = httpclient.execute(httpPost);
            HttpEntity resEntity = response.getEntity();

            if (resEntity != null) {
                strResponse = EntityUtils.toString(resEntity);
            }

            if (strResponse == null)
                return null;


        } catch (Exception e) {
            Debug.warn("createTransaction: Exception:" + e.getMessage());
            return null;
        } finally {
            httpclient.close();
        }

        JSONObject resJSON = new JSONObject(strResponse);
        Debug.info("createTransaction:" + resJSON);
        return resJSON;
    }
}
