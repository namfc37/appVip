function sendPaymentBrazilGetToken (callback, urlGetToken, public_integration_key, urlCvv, card_number, card_name, card_due_date, card_cvv)
{  
    var params = {
        public_integration_key: public_integration_key,
        country: COUNTRY_BRAZIL,   
        payment_type_code: "creditcard",
        creditcard: {
            card_number: card_number,
            card_name: card_name,
            card_due_date: card_due_date,
            card_cvv: card_cvv
        }   
    };

    if (fr.platformWrapper.getOsName() === "Win32")
    {
        callback(CARDPAYMENT_ERROR_NONE, 'payment_type_code', 'token', 'card_number');
    }
    else
    {
        sendHttpPostJson(urlGetToken, function(result, response)
        {            
            cc.log("sendPaymentBrazilGetToken", result, JSON.stringify(response));
            if (result) {                
                if (response.status == 'SUCCESS') {
                    //sendPaymentBrazilSetCvv(callback, public_integration_key, urlCvv, card_cvv, response.payment_type_code, response.token, response.masked_card_number);
					callback(CARDPAYMENT_ERROR_NONE, response.payment_type_code, response.token, response.masked_card_number);
                } else {
                    //callback(false, "sendPaymentBrazilGetToken has error");
					callback(CARDPAYMENT_ERROR_GET_TOKEN);
                }
            } else {                
                //callback(false, "sendPaymentBrazilGetToken fail");
				callback(CARDPAYMENT_ERROR_GET_TOKEN_FAIL);
            }
        }, params, true);
    }    
}

function sendPaymentBrazilSetCvv (callback, public_integration_key, urlCvv, card_cvv, payment_type_code, token, masked_card_number)
{  
    var params = {
        public_integration_key: public_integration_key,
        token: token,   
        card_cvv: card_cvv
    };

    if (fr.platformWrapper.getOsName() === "Win32")
    {
        callback(CARDPAYMENT_ERROR_NONE);
    }
    else
    {
        sendHttpPostJson(urlCvv, function(result, response)
            {            
                cc.log("sendPaymentBrazilSetCvv", result, JSON.stringify(response));
                if (result) {                
                    if (response.status == 'SUCCESS') {
                        //callback(true, "success", payment_type_code, token, masked_card_number);
                        callback(CARDPAYMENT_ERROR_NONE);
                    } else {
                        //callback(false, "sendPaymentBrazilSetCvv has error");
                        callback(CARDPAYMENT_ERROR_SET_CVV);
                    }
                } else {                
                    //callback(false, "sendPaymentBrazilSetCvv fail");
                    callback(CARDPAYMENT_ERROR_SET_CVV_FAIL);
                }
            }, params, true);
    }
}

function testPaymentBrazil () {
    var urlGetToken = 'https://sandbox.ebanxpay.com/ws/token';
    var public_integration_key = 'test_pk_TyVqi8gjtrYLbdo-lDxJYQ';
    var urlCvv = 'https://sandbox.ebanxpay.com/ws/token/setcvv';

    var card_number = '4111111111111111';
    var card_name = 'SANTA ANNA';
    var card_due_date = '12/2020';
    var card_cvv = '123';

    sendPaymentBrazilGetToken(testPaymentBrazilCallback, urlGetToken, public_integration_key, urlCvv, card_number, card_name, card_due_date, card_cvv);
}

function testPaymentBrazilCallback (result, message, payment_type_code, token, masked_card_number) {//web function testPaymentBrazilCallback (result, message, payment_type_code = null, token = null, masked_card_number = null) {

	if(payment_type_code === undefined)
		payment_type_code = null;
	if(token === undefined)
		token = null;
	if(masked_card_number === undefined)
		masked_card_number = null;
	
    cc.log("testPaymentBrazilCallback");
    cc.log("result", result);
    cc.log("message", message);
    cc.log("payment_type_code", payment_type_code);
    cc.log("token", token);
    cc.log("masked_card_number", masked_card_number);

}
