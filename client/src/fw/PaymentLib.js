
var pm = {};

pm.ERROR_CODE = {
    SUCCESS:                    10000,
    NEED_PHONE_NUMBER:          10001,
    NEED_CARD_NO:               10002,
    FAIL:                       10003,
};

pm.payment = {

    init: function (productId, sessionKey, useUI, isLive) {
    },

    setSessionKey: function (sessionKey) {
    },

    /**
     * verify otp user nhap de hoan thanh transaction
     * @param paymentType
     * @param transId
     * @param refId
     * @param otp
     * @param sendPkgFunc
     * @param callback
     */
    processVerifyOTP:function(paymentType, transId, refId, otp, callback){
    },
	
    /**
     * Nap tin nhan
     * @param paymentType
     * @param accountName
     * @param accountId
     * @param phoneNumber
     * @param countryId
     * @param amount
     * @param extraData
     * @param callback
     * @returns {number}
     */
    processSMSCharge:function(paymentType, accountName, accountId, phoneNumber, countryId, amount, extraData, callback ){
    },

    /**
     * Nap Wallet
     * @param paymentType
     * @param accountName
     * @param accountId
     * @param phoneNumber
     * @param countryId
     * @param amount
     * @param extraData
     * @param callback
     * @returns {number}
     */
    processWalletCharge:function(paymentType, accountName, accountId, phoneNumber, countryId, amount, extraData, callback ){
    },

    /**
     * Nap Bank
     * @param paymentType
     * @param accountName
     * @param accountId
     * @param phoneNumber
     * @param countryId
     * @param amount
     * @param extraData
     * @param callback
     * @returns {number}
     */
    processBankCharge:function(paymentType, accountName, accountId, phoneNumber, countryId, amount, extraData, callback ){
    },

    /**
     * Nap the cao
     * @param paymentType
     * @param cardNo
     * @param accountName
     * @param accountId
     * @param countryId
     * @param amount
     * @param extraData
     * @param callback
     * @returns {number}
     */
    processCardCharge:function(paymentType, accountName, accountId, cardNo, pinCode, countryId, amount, extraData, callback){
    },
};