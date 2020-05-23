
var googleIap = {
    iapProductList:[ "1A", "2A", "2B", "5A"],
    init:function () {
		this.isLoadedProductInfo = false;
        this._isProcessingPurchase = false;
        if (plugin.PluginManager != undefined) {
            var pluginManager = plugin.PluginManager.getInstance();
            if (pluginManager != null) {
                this.plugin = pluginManager.loadPlugin("IAPGooglePlay");
                if (this.plugin) {
                    this.plugin.setListener(this);
					
					var listProductId = [];
					for(var i = 0; i < iapProductList.length; i++){
						listProductId.push(fr.PaymentInfo.getProductID(iapProductList[i]));
					}
					
					this.plugin.configDeveloperInfo({
						listProductId: listProductId.join("|"),
						GooglePlayAppKey: fr.PaymentInfo.getLicenseKey()
					});

                }
            }
        }
    },
	_setStateProcessingPurchase:function()
    {
        this._isProcessingPurchase = true;

    },
    _setStateFinishProcessPurchase:function()
    {
        this._isProcessingPurchase = false;

    },
    requestPayProduct: function(productKey){
		var productId = fr.PaymentInfo.getProductID(productKey)
        if(this.plugin && !this._isProcessingPurchase){
            this._setStateProcessingPurchase();

            var paramMap = {};
            paramMap["IAPId"] = productId;
            paramMap["IAPSecKey"] = fr.PaymentInfo.getLicenseKey();
            this.plugin.payForProduct(paramMap);
			return true;
        }
		return false;
    },

    onPayResult: function (ret, msg) {

        if(ret == -1){
            this._setStateFinishProcessPurchase();
            return;
        }

        if(ret == plugin.ProtocolIAP.PayResultCode.PaySuccess){

            if(msg && msg.length > 0){
                var data = JSON.parse(msg);
				//Send receipt data to server
                //gv.gameClient.sendValidateGoogleReceipt(JSON.stringify(data.purchaseData), data.signature);
            }
            else{
               
            }
        }
        else{
            this._setStateFinishProcessPurchase();
            if(ret == plugin.ProtocolIAP.PayResultCode.PayFail){

            }
            else if(ret == plugin.ProtocolIAP.PayResultCode.PayCancel){

            }
            else if(ret == plugin.ProtocolIAP.PayResultCode.PayTimeOut){

            }
        }
    },

    finishTransactions:function(purchaseData, signature)
    {
        cc.log("finishTransactions: " + JSON.stringify(purchaseData));
        if(purchaseData){
            if(purchaseData.productId === undefined) {
                cc.log("iap android consumePurchase: productId is undefined");
                return;
            }
            // send to finish purchase
            var data = {
                purchaseData: purchaseData,
                signature: signature
            };
            if(this.plugin){
                this.plugin.callFuncWithParam("consumePurchase",
                    plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
            }
        }
    }
};
