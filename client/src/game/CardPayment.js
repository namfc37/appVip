
const CARDPAYMENT_FLOW_NONE = -1;
const CARDPAYMENT_FLOW_INAPP = 6;
const CARDPAYMENT_FLOW_WEB = 7;

const CARDPAYMENT_DATA_TOKEN_URL = 0;
const CARDPAYMENT_DATA_PUB_INT_KEY = 1;
const CARDPAYMENT_DATA_CVV_URL = 2;

const CARDPAYMENT_STEP_NONE = -1;
const CARDPAYMENT_STEP_CHOOSE_CARD = 0;
const CARDPAYMENT_STEP_CARD_INFO = 1;
const CARDPAYMENT_STEP_BILLING_INFO = 2;
const CARDPAYMENT_STEP_CVV = 3;
const CARDPAYMENT_STEP_INPUT = 4; // above this step: user interaction, below this step: server interation
const CARDPAYMENT_STEP_GET_FLOW = 5;
const CARDPAYMENT_STEP_GET_TOKEN = 6;
const CARDPAYMENT_STEP_SET_CVV = 7;
const CARDPAYMENT_STEP_GET_TRANSACTION = 8;
const CARDPAYMENT_STEP_WEBVIEW = 9;

const CARDPAYMENT_SAVED_DATA_KEY = "cpsdk"

const CARDPAYMENT_ERROR_NONE = 0;
const CARDPAYMENT_ERROR_SERVER = 1; // our server returned an error
const CARDPAYMENT_ERROR_NOT_SUPPORTED_FLOW = 2;
const CARDPAYMENT_ERROR_GET_TOKEN = 3;
const CARDPAYMENT_ERROR_GET_TOKEN_FAIL = 4;
const CARDPAYMENT_ERROR_SET_CVV = 5;
const CARDPAYMENT_ERROR_SET_CVV_FAIL = 6;

const CARDPAYMENT_CARD_LIST =
[
	{id:BR_CREDIT_VISA, name:"Visa", logo:"card_payment/logo_bank_visa.png"},
	{id:BR_CREDIT_MASTER, name:"Master", logo:"card_payment/logo_bank_mastercard.png"},
	{id:BR_CREDIT_AE, name:"AE", logo:"card_payment/logo_bank_AmericanExpress.png"},
	{id:BR_CREDIT_DINNER, name:"Diners", logo:"card_payment/logo_bank_diners.png"},
	{id:BR_CREDIT_ELO, name:"Elo", logo:"card_payment/logo_bank_elo.png"},
	{id:BR_CREDIT_HIPER, name:"Hiper", logo:"card_payment/logo_bank_hipercard.png"},
	{id:BR_CREDIT_DISCOVER, name:"Discover", logo:"card_payment/logo_bank_discover.png"},
];

var CardPayment =
{
	flow: CARDPAYMENT_FLOW_NONE,
	type: -1,
	data: null,
	
	step: CARDPAYMENT_STEP_NONE,
	steps: null,
	stepIdx: -1,
	
	selectedCardId: null,
	
	init:function()
	{
		if(!this.localData)
			this.loadLocalData();
	},
	
	uninit:function()
	{
		this.localData = null;
	},
	
	show:function()
	{
		if(this.hasSavedCard())
		{
			this.selectedCardId = this.localData.cardId;
			this.steps = [CARDPAYMENT_STEP_GET_FLOW];
		}
		else
		{
			this.selectedCardId = null;
			this.steps = [CARDPAYMENT_STEP_CHOOSE_CARD, CARDPAYMENT_STEP_GET_FLOW];
		}
		this.cardName = "";
		this.cardNo = "";
		this.cardExpM = "";
		this.cardExpY = "";
		this.cardCVV = "";
		this.stepIdx = -1;
		this.nextStep();
	},
	
	show2:function()
	{
		var uiDef =
		{
			closeButton:{onTouchEnded:this.hide.bind(this)},
			continueButton:{onTouchEnded:this.validateStep.bind(this)},
			continueText:{type:UITYPE_TEXT, value:"TXT_CONTINUE", style:TEXT_STYLE_TEXT_BUTTON},
			step01:{visible:false},
			step02:{visible:false},
			step03:{visible:false},
			step04:{visible:false},
		};
		
		if(this.step === CARDPAYMENT_STEP_CHOOSE_CARD)
			this.showStep_chooseCard(uiDef);
		else if(this.step === CARDPAYMENT_STEP_CARD_INFO)
			this.showStep_cardInfo(uiDef);
		else if(this.step === CARDPAYMENT_STEP_BILLING_INFO)
			this.showStep_billingInfo(uiDef);
		else if(this.step === CARDPAYMENT_STEP_CVV)
			this.showStep_cvv(uiDef);
		
		var widget = FWPool.getNode(UI_CARD_PAYMENT, false);
		if(FWUI.isWidgetShowing(widget))
		{
			// refresh
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_POPUP);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			Game.gameScene.registerBackKey(this.handleBackKey.bind(this));
		}
	},
	
	hide:function()
	{
		if(!FWUI.isShowing(UI_CARD_PAYMENT))
			return;
		
		FWUI.hide(UI_CARD_PAYMENT, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.handleBackKey);
	},
	
	handleBackKey:function()
	{
		this.prevStep();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// flow ///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	nextStep:function()
	{
		if(this.stepIdx >= this.steps.length - 1)
		{
			// finished
			this.hide();
			FWUtils.showProcessingUi(false);
			return; 
		}
		
		this.stepIdx++;
		this.step = this.steps[this.stepIdx];
		
		cc.log("CardPayment::nextStep: step=" + this.step + " stepIdx=" + this.stepIdx + " steps=" + JSON.stringify(this.steps));
		
		if(this.step < CARDPAYMENT_STEP_INPUT)
			FWUtils.showProcessingUi(false);
		else // if(this.step > CARDPAYMENT_STEP_INPUT)
		{
			this.hide();
			FWUtils.showProcessingUi();
		}
		
		var func = null;
		if(this.step === CARDPAYMENT_STEP_GET_FLOW)
			func = this.getFlow;
		else if(this.step === CARDPAYMENT_STEP_GET_TOKEN)
			func = this.getToken;
		else if(this.step === CARDPAYMENT_STEP_SET_CVV)
			func = this.setCVV;
		else if(this.step === CARDPAYMENT_STEP_GET_TRANSACTION)
			func = this.getTransaction;
		else if(this.step === CARDPAYMENT_STEP_WEBVIEW)
			func = this.showWebview;
		
		if(func)
			cc.director.getScheduler().scheduleCallbackForTarget(this, func, 0, 0, 0.5, false);
		else
			this.show2();
	},
	
	prevStep:function()
	{
		// TODO
		cc.log("CardPayment::prevStep: step=" + this.step + " stepIdx=" + this.stepIdx + " steps=" + JSON.stringify(this.steps));
	},
	
	validateStep:function(sender)
	{
		var errorMsg = null;
		
		if(this.step === CARDPAYMENT_STEP_CHOOSE_CARD)
		{
			if(this.selectedCardId === null)
				errorMsg = "TXT_CARDPAYMENT_CHOOSE_CARD";
			else
			{
				if(this.localData.cardId !== this.selectedCardId)
				{
					this.localData = {cardId:this.selectedCardId};
					this.saveLocalData();
				}
			}
		}
		else if(this.step === CARDPAYMENT_STEP_CARD_INFO)
		{
			var widget = FWPool.getNode(UI_CARD_PAYMENT, false);
			var s02NameInput = FWUtils.getChildByName(widget, "s02NameInput");
			var s02NoInput = FWUtils.getChildByName(widget, "s02NoInput");
			var s02ExpMInput = FWUtils.getChildByName(widget, "s02ExpMInput");
			var s02ExpYInput = FWUtils.getChildByName(widget, "s02ExpYInput");
			var s02CVVInput = FWUtils.getChildByName(widget, "s02CVVInput");
			this.cardName = s02NameInput.getString();
			this.cardNo = s02NoInput.getString();
			this.cardExpM = s02ExpMInput.getString();
			this.cardExpY = s02ExpYInput.getString();
			this.cardCVV = s02CVVInput.getString();
			if(this.cardName.length <= 0 || this.cardNo.length <= 0 || this.cardExpM.length <= 0 || this.cardExpY.length <= 0 || this.cardCVV.length <= 0)
				errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO";
			else
			{
				this.cardExpM = Number(this.cardExpM);
				this.cardExpY = Number(this.cardExpY);
				this.cardCVV = Number(this.cardCVV);
				if(isNaN(this.cardNo) || isNaN(this.cardExpM) || this.cardExpM < 1 || this.cardExpM > 12 || isNaN(this.cardExpY) || isNaN(this.cardCVV) || this.cardCVV < 100 || this.cardCVV > 999 || this.cardNo.length < 16)
					errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO_INVALID";
				else
				{
					var currentDate = new Date();
					currentDate.setTime(Game.getGameTime());
					currentDate.setFullYear(this.cardExpY, this.cardExpM - 1);
					if(currentDate.getTime() / 1000 <= Game.getGameTimeInSeconds())
						errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO_INVALID";
				}
			}
		}
		else if(this.step === CARDPAYMENT_STEP_BILLING_INFO)
		{
			var widget = FWPool.getNode(UI_CARD_PAYMENT, false);
			var s03NameInput = FWUtils.getChildByName(widget, "s03NameInput");
			var s03EmailInput = FWUtils.getChildByName(widget, "s03EmailInput");
			var s03PhoneInput = FWUtils.getChildByName(widget, "s03PhoneInput");
			var s03RGInput = FWUtils.getChildByName(widget, "s03RGInput");
			var biName = s03NameInput.getString();
			var biEmail = s03EmailInput.getString();
			var biPhone = s03PhoneInput.getString();
			var biRG = s03RGInput.getString();
			var biPhoneMatch = biPhone.match('^[0-9]+$');
			var biRGMatch = biRG.match('^[0-9]+$');
			if(biName.length <= 0 || biEmail.length <= 0 || biPhone.length <= 0 || biRG.length <= 0)
				errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO";
			else if(!biPhoneMatch || biPhoneMatch[0] !== biPhone || !biRGMatch || biRGMatch[0] !== biRG || !FWUtils.validateEmail(biEmail))
				errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO_INVALID";
			else
			{
				this.localData.biName = biName;
				this.localData.biEmail = biEmail;
				this.localData.biPhone = biPhone;
				this.localData.biRG = biRG;
				this.saveLocalData();
			}
		}
		else if(this.step === CARDPAYMENT_STEP_CVV)
		{
			var widget = FWPool.getNode(UI_CARD_PAYMENT, false);
			var s04CVVInput = FWUtils.getChildByName(widget, "s04CVVInput");
			this.cardCVV = s04CVVInput.getString();
			if(this.cardCVV.length <= 0)
				errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO";
			else
			{
				this.cardCVV = Number(this.cardCVV);
				if(isNaN(this.cardCVV) || this.cardCVV < 100 || this.cardCVV > 999)
					errorMsg = "TXT_CARDPAYMENT_FILL_CARD_INFO_INVALID";
			}
		}
		
		if(errorMsg)
		{
			FWUtils.showWarningText(FWLocalization.text(errorMsg), FWUtils.getWorldPosition(sender));
			return;
		}
		
		this.nextStep();
	},
	
	onError:function(errorId, errorParam)//web onError:function(errorId, errorParam = 0)
	{
		if(errorParam === undefined)
			errorParam = 0;
		
		cc.log("CardPayment::onError: errorId=" + errorId + " errorParam=" + errorParam);
		
		this.hide();
		FWUtils.showProcessingUi(false);
		
		Game.showPopup({title:"", content:cc.formatStr(FWLocalization.text("TXT_CARDPAYMENT_ERROR"), errorId, errorParam), closeButton:true});
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// step ///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	getFlow:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestPaymentBrazilGetFlow);
		pk.pack(this.localData.cardId);
		network.connector.client.sendPacket(pk);
	},

	onGetFlowResult:function(error, result)
	{
		cc.log("CardPayment::onGetFlowResult: error=" + error + " result=" + JSON.stringify(result));
		if(error)
		{
			// server returned an error
			this.onError(CARDPAYMENT_ERROR_SERVER, error);
			return;
		}
		
		this.type = result[KEY_TYPE];
		this.flow = result[KEY_STATUS];
		this.data = result[KEY_DATA];
		
		if(this.flow === CARDPAYMENT_FLOW_INAPP)
		{
			// update flow
			if(this.hasSavedCard())
				this.steps = [CARDPAYMENT_STEP_CVV, CARDPAYMENT_STEP_BILLING_INFO, CARDPAYMENT_STEP_SET_CVV, CARDPAYMENT_STEP_GET_TRANSACTION];
			else
				this.steps = [CARDPAYMENT_STEP_CARD_INFO, CARDPAYMENT_STEP_BILLING_INFO, CARDPAYMENT_STEP_GET_TOKEN, CARDPAYMENT_STEP_SET_CVV, CARDPAYMENT_STEP_GET_TRANSACTION];
			this.stepIdx = -1;
			this.nextStep();
		}
		else if(this.flow === CARDPAYMENT_FLOW_WEB)
		{
			// update flow
			this.steps = [CARDPAYMENT_STEP_BILLING_INFO, CARDPAYMENT_STEP_GET_TRANSACTION, CARDPAYMENT_STEP_WEBVIEW];
			this.stepIdx = -1;
			this.nextStep();
		}
		else
		{
			// flow is not supported
			this.onError(CARDPAYMENT_ERROR_NOT_SUPPORTED_FLOW);
			return;
		}
	},
	
	getToken:function()
	{
		sendPaymentBrazilGetToken(this.onGetTokenResult.bind(this), this.data[CARDPAYMENT_DATA_TOKEN_URL], this.data[CARDPAYMENT_DATA_PUB_INT_KEY], this.data[CARDPAYMENT_DATA_CVV_URL], this.cardNo, this.cardName, cc.formatStr("%s/%s", this.cardExpM, this.cardExpY), this.cardCVV);
	},
	
	onGetTokenResult:function(error, paymentTypeCode, token, maskedCardNum)
	{
		cc.log("CardPayment::onGetTokenResult: error=" + error + " paymentTypeCode=" + paymentTypeCode + " token=" + token + " maskedCardNum=" + maskedCardNum);
		
		if(error !== CARDPAYMENT_ERROR_NONE)
		{
			this.onError(error);
			return;
		}
		
		this.localData.paymentTypeCode = paymentTypeCode;
		this.localData.token = token;
		this.localData.maskedCardNum = maskedCardNum;
		this.saveLocalData();
		
		this.nextStep();
	},
	
	setCVV:function()
	{
		sendPaymentBrazilSetCvv(this.onSetCVVResult.bind(this), this.data[CARDPAYMENT_DATA_PUB_INT_KEY], this.data[CARDPAYMENT_DATA_CVV_URL], this.cardCVV, this.localData.paymentTypeCode, this.localData.token, this.localData.maskedCardNum);
	},
	
	onSetCVVResult:function(error)
	{
		cc.log("CardPayment::onSetCVVResult: error=" + error);
		
		if(error !== CARDPAYMENT_ERROR_NONE)
		{
			this.onError(error);
			return;
		}
		
		this.nextStep();
	},

	getTransaction:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestPaymentBrazilGetTransaction);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onGetTransactionResult:function(error, result)
	{
		cc.log("CardPayment::onGetTransactionResult: error=" + error + " result=" + JSON.stringify(result));
		
		if(error)
		{
			// server returned an error
			this.onError(CARDPAYMENT_ERROR_SERVER, error);
			return;
		}
		
		this.webviewUrl = result[KEY_DATA];
		this.nextStep();
	},
	
	showWebview:function()
	{
		//WebView.show(this.webviewUrl, FWLocalization.text("TXT_PAYMENT_CREDIT"));		
		cc.sys.openURL(this.webviewUrl);
		
		/*
		var webview = new ccui.WebView();
		webview.setAnchorPoint(0.5, 0.5);
		webview.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
		webview.setContentSize(cc.winSize.width, cc.winSize.height);
		webview.setLocalZOrder(Z_TOUCH_EATER);
		webview.setScalesPageToFit(true);
		webview.loadURL(this.webviewUrl);
		FWUtils.getCurrentScene().addChild(webview);
		*/
		
		this.nextStep();
	},
	
	showStep_chooseCard:function(uiDef)
	{
		var itemList = [];
		for(var i=0; i<g_PAYMENT_BR.ACTIVE_CREDIT.length; i++)
		{
			var info = this.getCardInfoById(g_PAYMENT_BR.ACTIVE_CREDIT[i]);
			if(info)
				itemList.push(info);
			else
				cc.log("CardPayment::showStep_chooseCard: no info for id " + g_PAYMENT_BR.ACTIVE_CREDIT[i]);
		}
		
		var itemDef =
		{
			logo:{type:UITYPE_IMAGE, field:"logo", onTouchEnded:this.selectCard.bind(this)},
			highlight:{visible:"data.id === CardPayment.selectedCardId"},
		};
		
		var uiDef2 =
		{
			step01:{visible:true},
			s01Title:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CHOOSE_CARD_TITLE", style:TEXT_STYLE_TEXT_NORMAL},
			s01Items:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_CARD_PAYMENT_ITEM, itemDef:itemDef, itemSize:cc.size(150, 120)},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	showStep_cardInfo:function(uiDef)
	{
		var uiDef2 =
		{
			step02:{visible:true},
			s02Logo:{type:UITYPE_IMAGE, value:this.getCardInfoById(this.selectedCardId).logo, scale:0.75},
			s02Title:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_FILL_CARD_INFO_TITLE", style:TEXT_STYLE_TEXT_NORMAL},
			s02Name:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CARD_NAME", style:TEXT_STYLE_TEXT_NORMAL},
			s02NameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.cardName || ""},
			s02No:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CARD_NO", style:TEXT_STYLE_TEXT_NORMAL},
			s02NoInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.cardNo || ""},
			s02Exp:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CARD_EXP", style:TEXT_STYLE_TEXT_NORMAL},
			s02ExpMInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_CARDPAYMENT_CARD_EXP_MONTH_PLACEHOLDER", value:this.cardExpM || ""},
			s02ExpYInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_CARDPAYMENT_CARD_EXP_YEAR_PLACEHOLDER", value:this.cardExpY || ""},
			s02CVV:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CARD_CVV", style:TEXT_STYLE_TEXT_NORMAL},
			s02CVVInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_CARDPAYMENT_CARD_CVV_PLACEHOLDER", value:this.cardCVV || ""},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	showStep_billingInfo:function(uiDef)
	{
		var uiDef2 =
		{
			step03:{visible:true},
			s03Title:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_BILLINFO", style:TEXT_STYLE_TEXT_NORMAL},
			s03Name:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_BILLINFO_NAME", style:TEXT_STYLE_TEXT_NORMAL},
			s03NameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.localData.biName || ""},
			s03Email:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_BILLINFO_EMAIL", style:TEXT_STYLE_TEXT_NORMAL},
			s03EmailInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.localData.biEmail || ""},
			s03Phone:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_BILLINFO_PHONE", style:TEXT_STYLE_TEXT_NORMAL},
			s03PhoneInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.localData.biPhone || ""},
			s03RG:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_BILLINFO_RG", style:TEXT_STYLE_TEXT_NORMAL},
			s03RGInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", value:this.localData.biRG || ""},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	showStep_cvv:function(uiDef)
	{
		var uiDef2 =
		{
			step04:{visible:true},
			s04Title:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_REENTER_CVV_TITLE", style:TEXT_STYLE_TEXT_NORMAL},
			s04Logo:{type:UITYPE_IMAGE, value:this.getCardInfoById(this.selectedCardId).logo},
			s04CardNo:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_CARD_NO", style:TEXT_STYLE_TEXT_NORMAL},
			s04CardNoInput:{type:UITYPE_TEXT, value:this.localData.maskedCardNum, style:TEXT_STYLE_TEXT_NORMAL},
			s04CVVInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_CARDPAYMENT_CARD_CVV_PLACEHOLDER", value:""},
			s04ChangeCardButton:{onTouchEnded:this.changeCard.bind(this)},
			s04ChangeCardText:{type:UITYPE_TEXT, value:"TXT_CARDPAYMENT_REENTER_CVV_REMOVE_CARD", style:TEXT_STYLE_TEXT_BUTTON},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	selectCard:function(sender)
	{
		this.selectedCardId = sender.uiData.id;
		this.show2();
	},
	
	getCardInfoById:function(id)
	{		
		for(var i=0; i<CARDPAYMENT_CARD_LIST.length; i++)
		{			
			if(CARDPAYMENT_CARD_LIST[i].id == id) //dùng dấu == để so sánh số và chuỗi. Ví dụ: so sánh BR_CREDIT_VISA là 4001 == '4001'
				return CARDPAYMENT_CARD_LIST[i];
		}
		return null;
	},
	
	changeCard:function(id)
	{
		delete this.localData.paymentTypeCode;
		delete this.localData.token;
		delete this.localData.maskedCardNum;
		delete this.localData.cardId;
		this.saveLocalData();
		this.show();
	},
	
	hasSavedCard:function()
	{
		return (this.localData.maskedCardNum !== undefined);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// save/load //////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	localData: null,
	
	loadLocalData:function()
	{
		this.localData = cc.sys.localStorage.getItem(CARDPAYMENT_SAVED_DATA_KEY + gv.mainUserData.userId);
		if(this.localData)
			this.localData = JSON.parse(this.localData);
		else
			this.localData = {};
	},
	
	saveLocalData:function()
	{
		if(!this.localData)
			return;
		cc.sys.localStorage.setItem(CARDPAYMENT_SAVED_DATA_KEY + gv.mainUserData.userId, JSON.stringify(this.localData));
	},

///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestPaymentBrazilGetFlow:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_BRAZIL_GET_FLOW);},
		pack:function(type)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_CHANNEL, type);
			
			addPacketFooter(this);
		},
	}),

	ResponsePaymentBrazilGetFlow:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			CardPayment.onGetFlowResult(this.getError(), PacketHelper.parseObject(this));
		}
	}),	
	
	RequestPaymentBrazilGetTransaction:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_BRAZIL_GET_TRANSACTION);},
		pack:function()
		{
			addPacketHeader(this);

			PacketHelper.putInt(this, KEY_CHANNEL, CardPayment.selectedCardId);
			PacketHelper.putString(this, KEY_ITEM_ID, Payment.selectedItem.ID);
			PacketHelper.putString(this, KEY_OFFER, Payment.offerId);
			
			PacketHelper.putString(this, KEY_NAME, CardPayment.localData.biName);
			PacketHelper.putString(this, KEY_MAIL_BOX, CardPayment.localData.biEmail);
			PacketHelper.putString(this, KEY_PHONE, CardPayment.localData.biPhone);
			PacketHelper.putString(this, KEY_USER_ID, CardPayment.localData.biRG);
			
			if(CardPayment.flow === CARDPAYMENT_FLOW_INAPP)
			{
				PacketHelper.putString(this, KEY_SIGN, CardPayment.localData.token);
				PacketHelper.putString(this, KEY_CARD_SERIAL, CardPayment.localData.maskedCardNum);
				PacketHelper.putString(this, KEY_CARD_CODE, CardPayment.localData.paymentTypeCode);
			}
			else
			{
				PacketHelper.putString(this, KEY_SIGN, "");
				PacketHelper.putString(this, KEY_CARD_SERIAL, "");
				PacketHelper.putString(this, KEY_CARD_CODE, "");
			}
			
			
			addPacketFooter(this);
		},
	}),

	ResponsePaymentBrazilGetTransaction:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			CardPayment.onGetTransactionResult(this.getError(), PacketHelper.parseObject(this));
		}
	}),	
	

};

network.packetMap[gv.CMD.PAYMENT_BRAZIL_GET_FLOW] = CardPayment.ResponsePaymentBrazilGetFlow;
network.packetMap[gv.CMD.PAYMENT_BRAZIL_GET_TRANSACTION] = CardPayment.ResponsePaymentBrazilGetTransaction;