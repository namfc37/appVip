/**
 * Created by tungdt2 on 3/14/2019.
 */
var pm = {};
/**************************************************************/

pm.ERROR_CODE = {
    SUCCESS:                    10000,
    NEED_PHONE_NUMBER:          10001,
    NEED_CARD_NO:               10002,
    FAIL:                       10003,
};

pm.payment = {
    
    processVerifyOTP:function(paymentType, transId, refId, otp, sendPkgFunc, callback){
        
    },
    
    processSMSCharge:function(paymentType, phoneNumber, countryId, amount, extraData, sendPkgFunc, callback ){
        
    },

    
    processCardCharge:function(paymentType, cardNo, countryId, amount, extraData, sendPkgFunc, callback){
        
    },

    setProductId:function(productId){
    },

    setUILib:function(){
       
    },
    
};