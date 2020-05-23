var PaymentLibHandle =
{
	PRODUCT_ID: 50020,

	SEND_PACKET: function(packet) {},//web
	ERROR: {},
	FLOW: {},
	defaultPhoneNo: null,

	init:function()
	{
		// cc.log ("PaymentLibHandler", "init", pm.payment.init);
		pm.payment.init (PaymentLibHandle.PRODUCT_ID, ZPLogin.getCurrentSessionKey(), false, FWClientConfig.isBuildLive());
		pm.payment.setSessionKey(ZPLogin.getCurrentSessionKey());

		//map send function
		PaymentLibHandle.SEND_PACKET = gv.gameClient.tcpClient.sendPacket
		
		//success
		PaymentLibHandle.ERROR [pm.ERROR_CODE.SUCCESS] = function(input_params) {return true;};//web

		//thiếu số phone
		PaymentLibHandle.ERROR [pm.ERROR_CODE.NEED_PHONE_NUMBER] = function(input_params) //web
		{
			if (PaymentLibHandle.defaultPhoneNo == null)
				PaymentLibHandle.defaultPhoneNo = cc.sys.localStorage.getItem(COUNTRY + "DefaultPhoneNo");
			
			PaymentLibHandle.showPaymentInput ("TXT_PAYMENT_INPUT_PHONE_TITLE", PaymentLibHandle.defaultPhoneNo, "TXT_PAYMENT_INPUT_HINT", function(phoneNumber) //web
			{
				if (phoneNumber) {		
					PaymentLibHandle.defaultPhoneNo = phoneNumber;
					cc.sys.localStorage.setItem(COUNTRY + "DefaultPhoneNo", phoneNumber);
				}

				var func = PaymentLibHandle [input_params.func];
				if (func)
					func (input_params.channelNo, phoneNumber, input_params.priceLocal, input_params.priceVnd, input_params.itemId, input_params.offerId);
			});

			return false;
		};

		//thiếu số thẻ
		PaymentLibHandle.ERROR [pm.ERROR_CODE.NEED_CARD_NO] = function(input_params) //web
		{
			PaymentLibHandle.showPaymentInput ("TXT_PAYMENT_INPUT_CARD_TITLE", "", "TXT_PAYMENT_INPUT_HINT", function(cardNo) //web
			{
				var func = PaymentLibHandle [input_params.func];
				if (func)
					func (input_params.channelNo, cardNo, input_params.cardPin, input_params.priceLocal, input_params.priceVnd, input_params.itemId, input_params.offerId);
			});

			return false;
		};

		//báo lỗi chung chung vì thiếu error code thật sự
		// PaymentLibHandle.ERROR [pm.ERROR_CODE.FAIL] = (input_params) =>
		// {
		// 	var errorCode = 1;
		// 	Payment.showErrorPopup(errorCode);

		// 	return false;
		// };
		
		//mở chỗ soạn tin nhắn
		PaymentLibHandle.FLOW [SEA_PAYMENT_FLOW_SMS] = function(input_params, response_data) //web
		{
			cc.log ("PaymentLibHandler", "SEA_PAYMENT_FLOW_SMS", JSON.stringify (response_data));

			var message = response_data.message;
			var phone = response_data.shortcode;
			fr.platformWrapper.sendSMS(message, phone);
		};
		
		//mở webview
		PaymentLibHandle.FLOW [SEA_PAYMENT_FLOW_WEBVIEW] = function(input_params, response_data) //web
		{
			cc.log ("PaymentLibHandler", "SEA_PAYMENT_FLOW_WEBVIEW", JSON.stringify (response_data));

			var url = response_data.url;
			cc.sys.openURL(url);
		};
		
		//mở hướng dẫn
		PaymentLibHandle.FLOW [SEA_PAYMENT_FLOW_INSTRUCTION] = function(input_params, response_data) //web
		{
			cc.log ("PaymentLibHandler", "SEA_PAYMENT_FLOW_INSTRUCTION", JSON.stringify (response_data));

			var desc = response_data.instruction;
			PaymentLibHandle.showPaymentGuide (desc);
		};
		
		//nhập OTP
		PaymentLibHandle.FLOW [SEA_PAYMENT_FLOW_OTP] = function(input_params, response_data) //web
		{
			cc.log ("PaymentLibHandler", "SEA_PAYMENT_FLOW_OTP", JSON.stringify (response_data));
			
			PaymentLibHandle.showPaymentInput ("TXT_PAYMENT_INPUT_OTP", "", "TXT_GIFTCODE_HINT", function(otp) //web
			{
				PaymentLibHandle.callOTP (input_params, response_data, otp);
			});
		};
	},

	packageData:function (channelNo, priceVnd, itemId, offerId)
	{
		var millis = Game.getGameTime();
		var data = {
			item: itemId,
			channel: channelNo,
			offer: offerId,
			level: gv.mainUserData.getLevel(),

			appTrans: gv.mainUserData.mainUserId + "_" + millis,
			gross: priceVnd,
			net: Math.floor(priceVnd * 70 / 100),
			time: millis
		};
		return JSON.stringify(data);
	},
	
	callCard:function (channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, offerId)
	{		
		var packageData = PaymentLibHandle.packageData(channelNo, priceVnd, itemId, offerId);
		var input_params = {func:"callCard", channelNo:channelNo, cardNo:cardNo, cardPin:cardPin, priceLocal:priceLocal, priceVnd:priceVnd, itemId:itemId, offerId:offerId};//web var input_params = {func:"callCard", channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, offerId};
		var callback = function(error_code, response_data) {PaymentLibHandle.onProcessCharge (input_params, error_code, response_data);};//web
		
		pm.payment.processCardCharge (channelNo, gv.mainUserData.realUserName, gv.mainUserData.userId, cardNo, cardPin, COUNTRY, priceLocal, packageData, callback);
	},

	callSMS:function (channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId)
	{
		var packageData = PaymentLibHandle.packageData(channelNo, priceVnd, itemId, offerId);
		var input_params = {func:"callSMS", channelNo:channelNo, phoneNumber:phoneNumber, priceLocal:priceLocal, priceVnd:priceVnd, itemId:itemId, offerId:offerId};//web var input_params = {func:"callSMS", channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId};
		var callback = function(error_code, response_data) {PaymentLibHandle.onProcessCharge (input_params, error_code, response_data);};//web
		
		pm.payment.processSMSCharge (channelNo, gv.mainUserData.realUserName, gv.mainUserData.userId, phoneNumber, COUNTRY, priceLocal, packageData, callback);
	},

	callWallet:function (channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId)
	{
		var packageData = PaymentLibHandle.packageData(channelNo, priceVnd, itemId, offerId);
		var input_params = {func:"callWallet", channelNo:channelNo, phoneNumber:phoneNumber, priceLocal:priceLocal, priceVnd:priceVnd, itemId:itemId, offerId:offerId};//web var input_params = {func:"callWallet", channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId};
		var callback = function(error_code, response_data) {PaymentLibHandle.onProcessCharge (input_params, error_code, response_data);};//web
		
		pm.payment.processWalletCharge (channelNo, gv.mainUserData.realUserName, gv.mainUserData.userId, phoneNumber, COUNTRY, priceLocal, packageData, callback);
	},

	callIBanking:function (channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId)
	{
		var packageData = PaymentLibHandle.packageData(channelNo, priceVnd, itemId, offerId);
		var input_params = {func:"callIBanking", channelNo:channelNo, phoneNumber:phoneNumber, priceLocal:priceLocal, priceVnd:priceVnd, itemId:itemId, offerId:offerId};//web var input_params = {func:"callIBanking", channelNo, phoneNumber, priceLocal, priceVnd, itemId, offerId};
		var callback = function(error_code, response_data) {PaymentLibHandle.onProcessCharge (input_params, error_code, response_data);};//web
		
		pm.payment.processBankCharge (channelNo, gv.mainUserData.realUserName, gv.mainUserData.userId, phoneNumber, COUNTRY, priceLocal, packageData, callback);
	},
	
	callOTP:function (input_params, response_data, otp)
	{
		var callback = function(error_code, response_data) {PaymentLibHandle.onProcessCharge (input_params, error_code, response_data);};//web
		
		cc.log ("PaymentLibHandler", "callOTP", input_params.channelNo, response_data.transid, response_data.refid, otp);
		pm.payment.processVerifyOTP (input_params.channelNo, response_data.transid, response_data.refid, otp, callback);
	},
	
	onProcessCharge:function (input_params, error_code, response_data)
	{
		cc.log ("PaymentLibHandler", "onProcessCharge", error_code, JSON.stringify(response_data));

		var error = PaymentLibHandle.ERROR [error_code];
		if (!error)
		{
			cc.log ("PaymentLibHandler", "onProcessCharge", "unknow error");
			Payment.showErrorPopup(error_code);
			return;
		}

		if (!error(input_params))
			return;

		if (response_data == null)
			return;
		
		var flow = PaymentLibHandle.FLOW [response_data.paymentflow];
		if (flow)
			flow (input_params, response_data);
	},

	showPaymentInput:function (title, input, hint, callback)
	{
		cc.log ("PaymentLibHandler", "showPaymentInput");
		var widget = FWPool.getNode(UI_PAYMENT_INPUT, true);
		var uiDef =
		{
			btn_close:{onTouchEnded: function() {PaymentLibHandle.hidePaymentInput (widget);} },//web
			lb_title:{type:UITYPE_TEXT, value:title, style:TEXT_STYLE_TEXT_NORMAL},
			lb_submit:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
			btn_submit: {onTouchEnded: function(sender) {PaymentLibHandle.onPaymentInput (widget, callback);} },//web
			input:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:input, placeHolder:hint, placeHolderColor: cc.color.BLACK},
		}

		FWUI.fillData(widget, null, uiDef);
		FWUI.setWidgetCascadeOpacity(widget, true);
		FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_POPUP);
		
		if(!widget.hideFunc)
			widget.hideFunc = function() {PaymentLibHandle.hidePaymentInput (widget);};//web
		
		Game.gameScene.registerBackKey(widget.hideFunc);
		AudioManager.effect (EFFECT_POPUP_SHOW);
	},

	hidePaymentInput:function (widget, callback)
	{
		if (!widget || !FWUI.isWidgetShowing(widget, true))
			return;
		
		cc.log ("PaymentLibHandler", "hidePaymentInput");
		FWUI.hideWidget(widget, UIFX_POP);

		Game.gameScene.unregisterBackKey(widget.hideFunc);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		
		if (callback)
			callback (null);
	},
	
	onPaymentInput:function (widget, callback)
	{
		if (!widget)
			return;
		
		var textField = FWUtils.getChildByName(widget, "input");
		var data = textField.getString();
		
		if (callback)
			callback (data);

		PaymentLibHandle.hidePaymentInput (widget);
	},

	showPaymentGuide:function (desc)
	{
		if (FWUI.isShowing(UI_PAYMENT_GUIDE))
			return;

		cc.log ("PaymentLibHandler", "showPaymentGuide");
		
		var widget = FWPool.getNode(UI_PAYMENT_GUIDE, true);
		var uiDef =
		{
			btn_close:{onTouchEnded: function() {PaymentLibHandle.hidePaymentGuide (widget);}},//web
			lb_title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_GUIDE_TITLE", style:TEXT_STYLE_TEXT_NORMAL},
			lb_desc:{type:UITYPE_TEXT, value:desc, style:TEXT_STYLE_TEXT_NORMAL}
		}

		FWUI.fillData(widget, null, uiDef);
		FWUI.setWidgetCascadeOpacity(widget, true);
		FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_POPUP);

		if(!widget.hideFunc)
			widget.hideFunc = function() {PaymentLibHandle.hidePaymentGuide (widget);};//web
		
		Game.gameScene.registerBackKey(widget.hideFunc);
		AudioManager.effect (EFFECT_POPUP_SHOW);
	},

	hidePaymentGuide:function (widget)
	{
		if (!FWUI.isShowing(UI_PAYMENT_GUIDE))
			return;
		
		FWUI.hideWidget(widget, UIFX_POP);
		Game.gameScene.unregisterBackKey(widget.hideFunc);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
	},

///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	
	
	RequestPaymentSEAAskPhone:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_SEA_ASK_PHONE);},
		pack:function()
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentSEAAskPhone:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError())
			{
				cc.log ("Payment", "ResponsePaymentSEAAskPhone", "error", this.getError());
				Payment.showErrorPopup(this.getError());
				return;
			}

			var object = PacketHelper.parseObject(this);
			var channels = object [KEY_CHANNEL];
			cc.log ("Payment", "ResponsePaymentSEAAskPhone", JSON.stringify(channels));
		}
	}),
	
	RequestPaymentSEACreate:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_SEA_CREATE);},
		pack:function(channel, itemId, offer, phone, card)
		{
			cc.log("Payment", "RequestPaymentSEACreate", channel, itemId, offer, phone, card);
			phone = Payment.modifyPhoneNumber(phone);
			cc.log("modifyPhoneNumber: " + phone);
			
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			PacketHelper.putString(this, KEY_OFFER, offer);
			PacketHelper.putString(this, KEY_PHONE, phone);
			PacketHelper.putString(this, KEY_CARD_CODE, card);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentSEACreate:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError())
			{
				cc.log ("Payment", "ResponsePaymentSEACreate", "error", this.getError());
				Payment.showErrorPopup(this.getError());
				return;
			}
		
			var object = PacketHelper.parseObject(this);
			var channel = object [KEY_CHANNEL];
			var item = object [KEY_ITEM_ID];
			var flow = object [KEY_TYPE];
			var phone = object [KEY_PHONE];
			var syntax = object [KEY_DATA];
			cc.log ("Payment", "ResponsePaymentSEACreate", channel, item, flow, phone, syntax);
		}
	}),
	
	RequestPaymentSEAVerify:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_SEA_VERIFY);},
		pack:function(otp)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_OTP, otp);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentSEAVerify:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError())
			{
				cc.log ("Payment", "ResponsePaymentSEAVerify", "error", this.getError());
				Payment.showErrorPopup(this.getError());
			}
		}
	}),
}

network.packetMap[gv.CMD.PAYMENT_SEA_ASK_PHONE] = PaymentLibHandle.ResponsePaymentSEAAskPhone;
network.packetMap[gv.CMD.PAYMENT_SEA_CREATE] = PaymentLibHandle.ResponsePaymentSEACreate;
network.packetMap[gv.CMD.PAYMENT_SEA_VERIFY] = PaymentLibHandle.ResponsePaymentSEAVerify;