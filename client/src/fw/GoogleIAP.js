
var googleIap = {
    iapProductList:[], // will be filled in Payment::init()
	skuList:[],
    init:function () {
		cc.log("[Google IAP] <init>");
		this.isLoadedProductInfo = false;
        this._isProcessingPurchase = false;
        if (plugin.PluginManager != undefined) {
            var pluginManager = plugin.PluginManager.getInstance();
            if (pluginManager != null) {
                this.plugin = pluginManager.loadPlugin("IAPGooglePlay");
                if (this.plugin) {
                    this.plugin.setListener(this);
					
					var listProductId = [];
					for(var i = 0; i < this.iapProductList.length; i++){
						listProductId.push(fr.PaymentInfo.getProductID(this.iapProductList[i]));
					}
					
					this.plugin.configDeveloperInfo({
						listProductId: listProductId.join("|"),
						GooglePlayAppKey: fr.PaymentInfo.getLicenseKey()
					});
                }
            }
        }
		cc.log("[Google IAP] <init done>");
    },
	getListSKU:function(){ 
        cc.log("[Google IAP] <getListSKU>");
        if (!this.plugin) return;
        var str = this.plugin.callStringFuncWithParam("getListSKU");
        if(str == null) return;
        try {
            var jsonData = JSON.parse(str);
            cc.log("[Google IAP] jsondata = \n" + JSON.stringify(jsonData, null, 4));

            for (var obj in jsonData) {
                var sku = {};
                sku.productId = jsonData[obj].productId;
                sku.price = jsonData[obj].price
                this.skuList.push(sku);
            }
        }
        catch(e){
        }
        cc.log("[Google IAP] SKU = \n" + JSON.stringify(this.skuList, null, 4));
    },
    getPriceText: function (productId) {
        for (var i = 0; i < this.skuList.length; i++){
            var sku = this.skuList[i];
            if (sku && sku.productId === productId){
                return sku.price;
            }
        }
        return "";
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
        cc.log("[Google IAP] <requestPayProduct> productKey = " + productKey + ", productId = " + productId);
        if (FWClientConfig.environment.useTestVerifyGoogle)
        {
            var data = {};
            data.purchaseTime = Game.getGameTime();
            data.orderId = "Test." + productKey + "." + data.purchaseTime;
            data.packageName = "local.kvtm";
            data.productId = productId;
            data.purchaseState = 0;
            data.purchaseToken = "purchaseToken";

            Payment.iapPurchaseData = JSON.stringify(data);
            Payment.iapSignature = "signature";
            Payment.onIapSuccess(data.packageName, Payment.iapPurchaseData, Payment.iapSignature);
            return true;
        }
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
		cc.log("[Google IAP] <onPayResult> ret = " + ret + ", msg = " + msg);
        if(ret == -1){
            this._setStateFinishProcessPurchase();
            return;
        }

        if(ret == plugin.ProtocolIAP.PayResultCode.PaySuccess){

            if(msg && msg.length > 0){
                var data = JSON.parse(msg);
				//Send receipt data to server
				Payment.iapPurchaseData = data.purchaseData;
				Payment.iapSignature = data.signature;
				Payment.onIapSuccess(fr.platformWrapper.getPackageName(), JSON.stringify(data.purchaseData), data.signature);//gv.gameClient.sendValidateGoogleReceipt(JSON.stringify(data.purchaseData), data.signature);
            }
            else{
               Payment.showErrorPopup(-1);
			   this._setStateFinishProcessPurchase();
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
			Payment.showErrorPopup(ret);
        }
    },

    finishTransactions:function(purchaseData, signature)
    {
        cc.log("[Google IAP] <finishTransactions>: " + JSON.stringify(purchaseData));
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
