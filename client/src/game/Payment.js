
// TODO:
// lower case (?)
//// - br: sms list => channel: only show available channel
// - br: input: disable buttons

const PAYMENT_TAB_NONE = -1;
const PAYMENT_TAB_GOLD = 0;
const PAYMENT_TAB_COIN = 1;
const PAYMENT_TAB_OFFER = 2;
const PAYMENT_TAB_VIP = 3;
const PAYMENT_TABS_COUNT = 4;

const PAYMENT_SUBTAB_NONE = -1;
const PAYMENT_SUBTAB_IAP = 0;
const PAYMENT_SUBTAB_COIN2GOLD = 1;
const PAYMENT_SUBTAB_SMS = 2;
const PAYMENT_SUBTAB_CARD = 3;
const PAYMENT_SUBTAB_ATM = 4;
const PAYMENT_SUBTAB_WALLET = 5;
const PAYMENT_SUBTAB_BANKING = 6;
const PAYMENT_SUBTAB_CREDIT = 7;
const PAYMENT_SUBTABS_COUNT = 8;

const PAYMENT_SUBTAB_BANK = 8;
const PAYMENT_SUBTAB_OFFERS = 9;

var Payment =
{
	currentTab: PAYMENT_TAB_NONE,
	currentSubTab: PAYMENT_SUBTAB_NONE,
	data: null,
	hasLocalPayment: false,
	hasIAP: false,
	selectedItem: null,
	progressPopup: null,
	bankIconsMapping: {},
	originalIAPList: null,
	originalIAPList_offer: null,
	isInitialized: false, // fix: game crashes if setLocalPaymentEnabled() is called before init();
	offerId: "",

	// unused
    // vaildChannels: function ()
    // {   
		// var hasSMS = g_PAYMENT_DATA.ACTIVE_SMS_MOBI || g_PAYMENT_DATA.ACTIVE_SMS_VINA || g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL;
		// var numSim = fr.platformWrapper.getPhoneCount();
		// var simOperator = fr.platformWrapper.getSimOperator();
		// if (numSim == 1)
		// {
			// hasSMS =
				// (g_PAYMENT_DATA.ACTIVE_SMS_MOBI && simOperator == CHANNEL_MOBI)
			// &&	(g_PAYMENT_DATA.ACTIVE_SMS_VINA && simOperator == CHANNEL_VINA)
			// &&	(g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL && simOperator == CHANNEL_VIETTEL);
		// }
		
		// var vailds = {};
		// vailds [defineTypes.SUB_TYPE_IAP] = Payment.hasIAP;
		// vailds [defineTypes.SUB_TYPE_SMS] = Payment.hasLocalPayment && hasSMS; 
		// vailds [defineTypes.SUB_TYPE_ATM] = Payment.hasLocalPayment && g_PAYMENT_DATA.ACTIVE_ATM; 
		// vailds [defineTypes.SUB_TYPE_ZING] = Payment.hasLocalPayment && g_PAYMENT_DATA.ACTIVE_CARD_ZING; 
        // vailds [defineTypes.SUB_TYPE_CARD] = Payment.hasLocalPayment;

        // return vailds;
	// },
	
	init0:function()
	{
		switch (COUNTRY)	
		{
			case COUNTRY_VIETNAM:
				g_PAYMENT_DATA = g_PAYMENT_VN;								
				break;
			case COUNTRY_BRAZIL:
				g_PAYMENT_DATA = g_PAYMENT_BR;
				break;
			case COUNTRY_THAILAND:
				g_PAYMENT_DATA = g_PAYMENT_TH;
				break;
			case COUNTRY_MYANMAR:		
				g_PAYMENT_DATA = g_PAYMENT_MM;
				break;
			case COUNTRY_PHILIPPINE:
				g_PAYMENT_DATA = g_PAYMENT_PH;
				break;
			case COUNTRY_GLOBAL:
			default:
				g_PAYMENT_DATA = g_PAYMENT_GO;
		}
		g_PAYMENT = g_PAYMENT_DATA.ITEMS;
	},
	
	init:function()
	{
		if(this.isInitialized)
			return;
		
		// unused
		//this.vailds = this.vaildChannels ();

		var convertType = {};
		convertType [defineTypes.TYPE_TAB_COIN] = PAYMENT_TAB_COIN;
		convertType [defineTypes.TYPE_TAB_GOLD] = PAYMENT_TAB_GOLD;
		convertType [defineTypes.TYPE_TAB_OFFER] = PAYMENT_TAB_OFFER;
		convertType [defineTypes.TYPE_TAB_VIP] = PAYMENT_TAB_VIP;
		
		var convertChannel = {};
		convertChannel [defineTypes.SUB_TYPE_IAP] = PAYMENT_SUBTAB_IAP;
		convertChannel [defineTypes.SUB_TYPE_SMS] = PAYMENT_SUBTAB_SMS;
		convertChannel [defineTypes.SUB_TYPE_ZING] = PAYMENT_SUBTAB_CARD;
		convertChannel [defineTypes.SUB_TYPE_CARD] = PAYMENT_SUBTAB_CARD;
		convertChannel [defineTypes.SUB_TYPE_ATM] = PAYMENT_SUBTAB_ATM;
		convertChannel [defineTypes.SUB_TYPE_WALLET] = PAYMENT_SUBTAB_WALLET;
		convertChannel [defineTypes.SUB_TYPE_BANKING] = PAYMENT_SUBTAB_BANKING;
		convertChannel [defineTypes.SUB_TYPE_CREDIT] = PAYMENT_SUBTAB_CREDIT;
        
		this.data = [];
		for(var i=0; i<PAYMENT_TABS_COUNT; i++)
		{
			this.data[i] = [];
			for(var j=0; j<PAYMENT_SUBTABS_COUNT; j++)
				this.data[i][j] = [];
		}

		googleIap.iapProductList = [];
		this.originalIAPList = [];
		this.originalIAPList_offer = [];

		for (var i in g_PAYMENT)
		{
            var payment = g_PAYMENT[i];
            var type = payment.TYPE;
            var channel = payment.SUB_TYPE;

            type = convertType [type];
			channel = convertChannel [channel];
			
			this.data [type][channel].push (payment);
			
			if(payment.SUB_TYPE === defineTypes.SUB_TYPE_IAP && payment.TYPE === defineTypes.TYPE_TAB_COIN)
			{
				subTab = PAYMENT_SUBTAB_IAP;
				googleIap.iapProductList.push(payment.ID);
				this.originalIAPList.push(payment);
			}

			if(payment.SUB_TYPE === defineTypes.SUB_TYPE_IAP && payment.TYPE === defineTypes.TYPE_TAB_OFFER)
			{
				subTab = PAYMENT_SUBTAB_IAP;
				googleIap.iapProductList.push(payment.ID);
				this.originalIAPList_offer.push(payment);
			}
		}
		
		this.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_OFFERS] = gv.offerPanel.list ();
		
		// merge with ibshop
		for(var i=0; i<g_IBSHOP.length; i++)
		{
			if(g_IBSHOP[i].TAB === "GOLD")
			{
				this.data[PAYMENT_TAB_GOLD][PAYMENT_SUBTAB_COIN2GOLD] = g_IBSHOP[i].ITEMS;
				break;
			}
		}
		
		// bank icons
		//https://sandbox.mobile.pay.zing.vn/zmpapi/banklistall?pmcID=51
		this.bankIconsMapping["123PCC"] = "mastercard";
		this.bankIconsMapping["TPB"] = "tpbank"; //Ngân hàng Tiền Phong (Tien Phong Bank)
		this.bankIconsMapping["OCB"] = "ocb"; //Ngân hàng TMCP Phương Đông (OCB)
		this.bankIconsMapping["PGB"] = "pgbank"; //Ngân hàng Dầu Khí (PG Bank)
		this.bankIconsMapping["SGB"] = "saigonbank"; //"Ngân hàng TMCP Sài Gòn Công Thương (SaigonBank)"
		this.bankIconsMapping["NAB"] = "nama"; //"Ngân hàng TMCP Nam Á (Nam A Bank)"
		this.bankIconsMapping["GPB"] = "gpbank"; //"Ngân Hàng Dầu Khí Toàn Cầu (GPBank)"
		this.bankIconsMapping["ABB"] = "abbank"; //"Ngân hàng TMCP An Bình (ABB)"
		this.bankIconsMapping["NVB"] = "navibank"; //"Ngân hàng TMCP Nam Việt (NaviBank)
		this.bankIconsMapping["VAB"] = "vietabank"; //"Ngân hàng TMCP Việt Á"
		this.bankIconsMapping["HDB"] = "hdbank"; //"Ngân Hàng TMCP Phát Triển TPHCM (HDBank)"
		this.bankIconsMapping["OCEB"] = "oceanbank"; //"Ngân hàng TMCP Đại Dương (OceanBank)"
		this.bankIconsMapping["VPB"] = "vpbank"; //Ngân hàng Việt Nam Thịnh Vượng (VPBank)
		this.bankIconsMapping["MB"] = "mb"; //Ngân hàng quân đội (MB)
		this.bankIconsMapping["VIB"] = "vib"; //Ngân hàng quốc tế (VIB)
		this.bankIconsMapping["MRTB"] = "maritimebank"; //Ngân hàng TMCP Hàng Hải (Maritime Bank)
		this.bankIconsMapping["SCB"] = "sacombank"; //Ngân hàng Sài Gòn Thương Tín (Sacombank)
		this.bankIconsMapping["ACB"] = "acb"; //Ngân hàng Á Châu (ACB)
		this.bankIconsMapping["EIB"] = "eximbank"; //Ngân hàng Xuất Nhập Khẩu Việt Nam (Eximbank)
		this.bankIconsMapping["BIDV"] = "bidv"; //Ngân hàng đầu tư và phát triển Việt Nam (BIDV)
		this.bankIconsMapping["AGB"] = "agribank"; //Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)
		this.bankIconsMapping["TCB"] = "techcombank"; //Ngân hàng Kỹ Thương Việt Nam (Techcombank)
		this.bankIconsMapping["VTB"] = "vietinbank"; //Ngân hàng Công Thương Việt Nam (Vietinbank)
		this.bankIconsMapping["DAB"] = "dongabank"; //Ngân hàng Đông Á bank (DAB)
		this.bankIconsMapping["VCB"] = "vietcombank"; //Ngân hàng Ngoại Thương Việt Nam (Vietcombank)
		
		// iap
		fr.PaymentInfo.loadInfo(fr.platformWrapper.getPackageName());
		
		this.isInitialized = true;
	},
	
	init2:function()
	{
		// iap2
		googleIap.getListSKU();
		
		// exclude unavailable iap items
		var items = this.originalIAPList;//this.data[PAYMENT_TAB_COIN][PAYMENT_SUBTAB_IAP];
		var items2 = [];
		for(var i=0; i<items.length; i++)
		{
			var productId = fr.PaymentInfo.getProductID(items[i].ID);
			cc.log("Payment::init2: IAP id=" + items[i].ID + " productId=" + productId);
			if(productId)
			{
				// this product is available
				items2.push(items[i]);
			}
		}
		this.data[PAYMENT_TAB_COIN][PAYMENT_SUBTAB_IAP] = items2;
	},

	init3:function ()
	{
		googleIap.getListSKU();

		var items = this.originalIAPList_offer;
		var items2 = [];
		for(var i in items)
		{
			var productId = fr.PaymentInfo.getProductID(items[i].ID);
			cc.log("Payment::init3: IAP id=" + items[i].ID + " productId=" + productId);
			if(productId)
				items2.push(items[i]);
		}
		this.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_IAP] = items2;
	},
	
	showTab:function(tab, onHide)//web showTab:function(tab, onHide = null)
	{
		if(onHide === undefined)
			onHide = null;
		
		this.currentTab = tab;
		this.currentSubTab = tab === PAYMENT_TAB_OFFER ? PAYMENT_SUBTAB_OFFERS : PAYMENT_SUBTAB_NONE;
		this.onHide = onHide;
		this.show();
		//if(tab === PAYMENT_TAB_OFFER)
		//{
		//	PigBank.hide();
		//}
	},
	
	showSubTab:function(subTab)
	{
		this.currentSubTab = subTab;
		this.show();
	},
	
	resourcesLoaded: false,
	show:function()
	{
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			Game.pendingPopup = this;
			cc.loader.load([UI_CARD_PAYMENT_DUMMY_PLIST,
							UI_CARD_PAYMENT_DUMMY_PLIST.replace(".plist", ".png")],
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(UI_CARD_PAYMENT_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.show();
					Game.pendingPopup = null;
				}.bind(this));				
			return;
		}

		if (!this.resourcesLoaded && cc.sys.isNative)
		{
			cc.spriteFrameCache.addSpriteFrames(UI_CARD_PAYMENT_DUMMY_PLIST);
			this.resourcesLoaded = true;
		}

		var widget = FWPool.getNode(UI_PAYMENT, false);
		if(!this.itemList)
		{
			this.itemList = FWUtils.getChildByName(widget, "itemList");
			this.zingCard = FWUtils.getChildByName(widget, "zingCard");
			this.firstChargeBg = FWUtils.getChildByName(widget, "firstChargeBg");
		}
		
		// tabs
		var hasSMS = (g_PAYMENT_DATA.ACTIVE_SMS.length > 0);//g_PAYMENT_DATA.ACTIVE_SMS_MOBI || g_PAYMENT_DATA.ACTIVE_SMS_VINA || g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL;
		var hasCard = g_PAYMENT_DATA.ACTIVE_CARD_ZING || g_PAYMENT_DATA.ACTIVE_CARD.length > 0;
		var hasATM = g_PAYMENT_DATA.ACTIVE_ATM;
		var hasWallet = g_PAYMENT_DATA.ACTIVE_WALLET.length > 0;
		var hasBanking = g_PAYMENT_DATA.ACTIVE_BANKING.length > 0;
		var hasCredit = (g_PAYMENT_DATA.ACTIVE_CREDIT && g_PAYMENT_DATA.ACTIVE_CREDIT.length > 0);
		var hasCoin2Gold = true;

		//check disable SMS
		var numSim = fr.platformWrapper.getPhoneCount();
		var simOperator = fr.platformWrapper.getSimOperator();	
		cc.log("numSim", numSim);
		cc.log("simOperator", simOperator);
		if (numSim == 1 && simOperator && simOperator.length > 0)
		{
			// new data
			//if ((!g_PAYMENT_DATA.ACTIVE_SMS_MOBI && simOperator == CHANNEL_MOBI) 
			// || (!g_PAYMENT_DATA.ACTIVE_SMS_VINA && simOperator == CHANNEL_VINA)
			// || (!g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL && simOperator == CHANNEL_VIETTEL)
			//)
			var channel = this.operatorToChannel(simOperator);
			cc.log("channel", channel);
			if(!this.isSmsChannelActive(channel))
			{
				hasSMS = false;
			}
			cc.log("hasSMS", hasSMS);
		}
		
		// tmp fix: iap not shown
		if(this.hasIAP)
		{
			if (this.currentTab === PAYMENT_TAB_COIN && this.data[PAYMENT_TAB_COIN][PAYMENT_SUBTAB_IAP].length <= 0)
				this.init2();
			
			if (this.currentTab === PAYMENT_TAB_OFFER && this.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_IAP].length <= 0)
				this.init3();
		}
		
		var buttonList =
		[
			// button order must match PAYMENT_SUBTAB_XXX order
			{NAME: "btnOffer", VISIBLE: this.currentTab === PAYMENT_TAB_OFFER, SUBTAB: PAYMENT_SUBTAB_OFFERS, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_OFFER},
			{NAME: "btnAppStore", VISIBLE: this.hasIAP && this.currentTab !== PAYMENT_TAB_GOLD, SUBTAB: PAYMENT_SUBTAB_IAP, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_IAP},
			{NAME: "btnCoin2Gold", VISIBLE: hasCoin2Gold && this.currentTab === PAYMENT_TAB_GOLD, SUBTAB: PAYMENT_SUBTAB_COIN2GOLD, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_COIN2GOLD},
			{NAME: "btnSMS", VISIBLE: hasSMS && Payment.hasLocalPayment, SUBTAB: PAYMENT_SUBTAB_SMS, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_SMS},
			{NAME: "btnZingCard", VISIBLE: hasCard && Payment.hasLocalPayment, SUBTAB: PAYMENT_SUBTAB_CARD, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_CARD},
			{NAME: "btnATM", VISIBLE: hasATM && Payment.hasLocalPayment && COUNTRY === COUNTRY_VIETNAM, SUBTAB: PAYMENT_SUBTAB_ATM, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_ATM},
			{NAME: "btnWallet", VISIBLE: hasWallet && Payment.hasLocalPayment, SUBTAB: PAYMENT_SUBTAB_WALLET, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_WALLET},
			{NAME: "btnBanking", VISIBLE: hasBanking && Payment.hasLocalPayment, SUBTAB: PAYMENT_SUBTAB_BANKING, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_BANKING},
			{NAME: "btnCredit", VISIBLE: hasCredit && Payment.hasLocalPayment && this.currentTab !== PAYMENT_TAB_GOLD && (this.currentTab !== PAYMENT_TAB_OFFER || this.currentSubTab !== PAYMENT_SUBTAB_OFFERS), SUBTAB: PAYMENT_SUBTAB_CREDIT, DISPLAY: g_PAYMENT_DATA.DISPLAY_TAB_CREDIT}
		];
		buttonList.sort(function (a, b) {
			return a.DISPLAY - b.DISPLAY;
		});
		var y = 120;
		var offY = -75;
		for(var i=0; i<buttonList.length; i+=1)
		{
			var name = buttonList[i].NAME;
			var visibleCondition = buttonList[i].VISIBLE;
			var subTab = buttonList[i].SUBTAB;
			var length = -1;

			if (this.data[this.currentTab][subTab])
			{
				if (this.currentTab === PAYMENT_TAB_OFFER && subTab !== PAYMENT_SUBTAB_OFFERS && subTab !== PAYMENT_SUBTAB_CARD)
				{
					length = 0;
					for (var id in this.data[this.currentTab][subTab])
						if (this.data[this.currentTab][subTab][id].PRICE_VND >= this.offerPrice)
							length += 1;
				}
				else
				{
					length = this.data[this.currentTab][subTab].length;
				}
			}
			
			var onButton = FWUtils.getChildByName(widget, name + "On");
			var offButton = FWUtils.getChildByName(widget, name + "Off");
			var isVisible = visibleCondition && length > 0;

			if(this.currentSubTab === PAYMENT_SUBTAB_NONE && isVisible)
				this.currentSubTab = subTab;
			
			var isOn = (this.currentSubTab === subTab || (this.currentSubTab === PAYMENT_SUBTAB_BANK && subTab === PAYMENT_SUBTAB_ATM));
			
			if(isVisible)
			{
				onButton.setVisible(isOn);
				offButton.setVisible(!isOn);
				onButton.setPosition(onButton.getPositionX(), y);
				offButton.setPosition(offButton.getPositionX(), y);
				y += offY;
			}
			else
			{
				onButton.setVisible(false);
				offButton.setVisible(false);
			}
		}
		
		// first charge
		var channel = defineTypes.SUB_TYPE_NONE;
		var firstChargeItems = null;
		if(this.currentSubTab === PAYMENT_SUBTAB_IAP)
		{
			channel = defineTypes.SUB_TYPE_IAP;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_IAP;
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_SMS)
		{
			channel = defineTypes.SUB_TYPE_SMS;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_SMS;
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_CARD)
		{
			switch (COUNTRY)
			{
				case COUNTRY_VIETNAM:
				{
					channel = defineTypes.SUB_TYPE_ZING;
					firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_ZING;
				}
				break;
				case COUNTRY_MYANMAR:
				case COUNTRY_THAILAND:
				case COUNTRY_PHILIPPINE:
				{
					channel = defineTypes.SUB_TYPE_CARD;
					firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_CARD;
				}
				break;
			}
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_ATM)
		{
			channel = defineTypes.SUB_TYPE_ATM;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_ATM;
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_WALLET)
		{
			channel = defineTypes.SUB_TYPE_WALLET;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_WALLET;
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_BANKING)
		{
			channel = defineTypes.SUB_TYPE_BANKING;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_BANKING;
		}
		else if(this.currentSubTab === PAYMENT_SUBTAB_CREDIT)
		{
			channel = defineTypes.SUB_TYPE_CREDIT;
			firstChargeItems = g_PAYMENT_DATA.FIRST_CHARGE_ITEM_CREDIT;
		}

		cc.log("gv.userData.game[GAME_PAYMENT][PAYMENT_FIRST_CHARGE_ITEM]=" + JSON.stringify(gv.userData.game[GAME_PAYMENT][PAYMENT_FIRST_CHARGE_ITEM]));
		var hasFirstChargeItems = this.currentSubTab !== PAYMENT_SUBTAB_OFFERS && (this.currentTab === PAYMENT_TAB_OFFER || (g_PAYMENT_DATA.FIRST_CHARGE_ITEM_ACTIVE && channel !== defineTypes.SUB_TYPE_NONE && gv.userData.game[GAME_PAYMENT][PAYMENT_FIRST_CHARGE_ITEM] && gv.userData.game[GAME_PAYMENT][PAYMENT_FIRST_CHARGE_ITEM].indexOf(channel) < 0));
		var firstChargeItemDef = null;
		if(hasFirstChargeItems)
		{
			// fake data to test
			//firstChargeItems = FWUtils.getItemsArray({P0:1, T1:2, M23:3, M24:4, D0:5, B0:6, P1:7, T2:8});
			if(this.currentTab === PAYMENT_TAB_OFFER)
				firstChargeItems = FWUtils.getItemsArray(this.offerItems);
			else
				firstChargeItems = FWUtils.getItemsArray(firstChargeItems);
			firstChargeItemDef =
			{
				gfx:{type:UITYPE_ITEM, field:"itemId"},
				amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, useK:true, visible:true},
			};
			
			this.firstChargeBg.setVisible(true);
			//this.itemList.setPosition(-318, -480);
			this.itemList.setContentSize(640, 370);
			this.itemList.setClippingEnabled(true);
			this.zingCard.setPosition(0, this.currentTab === PAYMENT_TAB_OFFER ? 0 : -120);
		}
		else
		{
			this.firstChargeBg.setVisible(false);
			//this.itemList.setPosition(-318, -320);
			this.itemList.setContentSize(640, 530);
			this.itemList.setClippingEnabled(false);
			this.zingCard.setPosition(0, 0);
		}
		// end: first charge

		// main ui
		var isOffer = this.currentTab === PAYMENT_TAB_OFFER;

		/// Main Tab position
		var numTabActive = 0;
		var offerPosition ={};
		var pigPosition ={};
		var vipPosition ={};

		if(gv.offerPanel.check())
		{
			offerPosition=positionTab[numTabActive];
			numTabActive++;
			offerPosition.isActive = true;
		}else
		{
			offerPosition.isActive = false;
		}

		if(gv.pigBankPanel.check())
		{
			pigPosition=positionTab[numTabActive];
			numTabActive++;
			pigPosition.isActive = true;
		}
		else
		{
			pigPosition.isActive = false;
		}
		if(gv.vipManager.checkActive())
		{
			vipPosition =positionTab[numTabActive];
			numTabActive++;
			vipPosition.isActive = true;
		}
		else
		{
			vipPosition.isActive = false;
		}

		cc.log("SCREEN NUM TAB (VIP,PIGBANK,OFFER) ACTIVE = ",numTabActive);


		var uiDef =
		{
			btnBack:{onTouchEnded:this.hide.bind(this)},
			goldBg: {visible:!isOffer},
			coinBg: {visible:!isOffer},
			lblGold:{type:UITYPE_TEXT, value:gv.userData.getGold(), style:TEXT_STYLE_NUMBER},
			lblCoin:{type:UITYPE_TEXT, value:gv.userData.getCoin(), style:TEXT_STYLE_NUMBER},
			tabGoldOn:{visible:!isOffer && this.currentTab === PAYMENT_TAB_GOLD},
			tabGoldOff:{visible:!isOffer && this.currentTab !== PAYMENT_TAB_GOLD, onTouchEnded:this.changeTab.bind(this)},
			tabCoinOn:{visible:!isOffer && this.currentTab === PAYMENT_TAB_COIN},
			tabCoinOff:{visible:!isOffer && this.currentTab !== PAYMENT_TAB_COIN, onTouchEnded:this.changeTab.bind(this)},
			tabOfferOn:{visible:isOffer},
			tabOfferOff:{visible:false},
			tabPigBankOn:{visible:false},
			tabPigBankOff:{visible:isOffer && this.currentSubTab!== PAYMENT_SUBTAB_OFFERS&&pigPosition.isActive,position:pigPosition.tabOff ,onTouchEnded:this.changeTab.bind(this)},
			tabVipOff:{position:vipPosition.tabOff,visible:isOffer && this.currentSubTab!== PAYMENT_SUBTAB_OFFERS&&vipPosition.isActive ,onTouchEnded:this.changeTab.bind(this)},
			lblTabGoldOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_GOLD", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabGoldOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_GOLD", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabCoinOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_COIN", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabCoinOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_COIN", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabOfferOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_OFFER", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabOfferOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_OFFER", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabPigBankOn:{type:UITYPE_TEXT, value:"TXT_PIGBANK", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabPigBankOff:{type:UITYPE_TEXT, value:"TXT_PIGBANK", style:TEXT_STYLE_TEXT_NORMAL},
			lblTabVipOff:{type:UITYPE_TEXT, value:"TXT_VIP", style:TEXT_STYLE_TEXT_NORMAL},
			btnOfferOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnAppStoreOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnSMSOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnZingCardOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnATMOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnCoin2GoldOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnWalletOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnBankingOff:{onTouchEnded:this.changeSubTab.bind(this)},
			btnCreditOff:{onTouchEnded:this.changeSubTab.bind(this)},
			lblOfferOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_OFFER_BTN_OFF", style:TEXT_STYLE_TEXT_NORMAL},
			lblAppStoreOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_APP_STORE", style:TEXT_STYLE_TEXT_NORMAL},
			lblAppStoreOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_APP_STORE", style:TEXT_STYLE_TEXT_NORMAL},
			lblSMSOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_SMS", style:TEXT_STYLE_TEXT_NORMAL},
			lblSMSOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_SMS", style:TEXT_STYLE_TEXT_NORMAL},
			lblZingCardOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ZING_CARD", style:TEXT_STYLE_TEXT_NORMAL},
			lblZingCardOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ZING_CARD", style:TEXT_STYLE_TEXT_NORMAL},
			lblATMOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ATM", style:TEXT_STYLE_TEXT_NORMAL},
			lblATMOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ATM", style:TEXT_STYLE_TEXT_NORMAL},
			lblCoin2GoldOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_COIN_2_GOLD", style:TEXT_STYLE_TEXT_SMALL},
			lblCoin2GoldOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_COIN_2_GOLD", style:TEXT_STYLE_TEXT_SMALL},
			lbWalletOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_WALLET", style:TEXT_STYLE_TEXT_SMALL},
			lbWalletOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_WALLET", style:TEXT_STYLE_TEXT_SMALL},
			lbBankingOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_BANKING", style:TEXT_STYLE_TEXT_SMALL},
			lbBankingOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_BANKING", style:TEXT_STYLE_TEXT_SMALL},
			lblCreditOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CREDIT", style:TEXT_STYLE_TEXT_SMALL},
			lblCreditOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CREDIT", style:TEXT_STYLE_TEXT_SMALL},
			itemList:{visible:false},
			zingCard:{visible:false},
			seaCard:{visible:false},

			//vip
			imgIconVipConvertGold:{type:UITYPE_IMAGE,visible:!isOffer&&gv.vipManager.check(),value:gv.vipManager.iconBuffVip,size:60},
			imgIconVipConvertGoldOff:{type:UITYPE_IMAGE,visible:!isOffer&&gv.vipManager.check(),value:gv.vipManager.iconBuffVip,size:54},

			// first charge
			firstChargeBg:{visible:hasFirstChargeItems},
			firstChargeText:{visible:hasFirstChargeItems, type:UITYPE_TEXT, value:isOffer ? this.offerTitle : "TXT_PAYMENT_FIRST_CHARGE_ITEMS", style:TEXT_STYLE_TEXT_NORMAL},
			firstChargeItems:{visible:hasFirstChargeItems, type:UITYPE_2D_LIST, items:firstChargeItems, itemUI:UI_ITEM_NO_BG2, itemDef:firstChargeItemDef, itemSize:cc.size(100, 100), itemsAlign:"center", singleLine:true},
		};
		
		// items
		//this.itemList.removeAllChildren(); jira#5632 leak
		if(this.currentSubTab === PAYMENT_SUBTAB_OFFERS)
			this.showOfferItems(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_COIN2GOLD)
			this.showCoin2GoldItems(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_CARD)
				this.showCardInput(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_BANK)
			this.showBankMenu(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_WALLET)
			this.showItems(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_BANKING)
			this.showItems(uiDef);
		else if(this.currentSubTab === PAYMENT_SUBTAB_CREDIT)
			this.showItems(uiDef);
		else
			this.showItems(uiDef);
		
		// show
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_PAYMENT);
		
		    AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}

		if (this.currentTab === PAYMENT_TAB_OFFER && this.currentSubTab === PAYMENT_SUBTAB_OFFERS)
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateOffer, 1, cc.REPEAT_FOREVER, 0.01, false);
		
		// jira#5472
		this.itemList.scrollToPercentVertical(0, 0.01, false);
	},
	
	showItems:function(uiDef)
	{
		cc.log ("Payment", "showItems");

		var items = this.data[this.currentTab][this.currentSubTab];
		if (!items)
		{
			cc.log ("Payment", "Offer phase 2", "items is null", this.currentTab, this.currentSubTab);
			return;
		}

		var displayItems = [];
		var iconIdx = 1; // fix: missing icon for some items
		for(var i=0; i<items.length; i++)
		{
			var item = items[i];
			if (this.currentTab === PAYMENT_TAB_OFFER && item.PRICE_VND < this.offerPrice)
			{
				cc.log ("Payment", "Offer phase 2", i, item.ID, item.PRICE_VND, this.offerPrice);
				continue;
			}
			
			var currentInfo = this.getCurrentPaymentInfoById(item.ID);
			
			if(currentInfo)
			{
				cc.log("Payment", "showItems", "id", item.ID, "info", JSON.stringify(currentInfo));
				if(currentInfo[PAYMENT_INFO_TIME_FINISH] > 0 && Game.getGameTimeInSeconds() < currentInfo[PAYMENT_INFO_TIME_FINISH])
				{
					cc.log("Payment", "skipped: out of time range");
					continue;
				}
				if(item.LIMIT_DAY > 0 && item.LIMIT_DAY <= currentInfo[PAYMENT_INFO_DAILY])
				{
					cc.log("Payment", "skipped: limit day");
					continue;
				}
			}
			else
				cc.log("Payment", "showItems", "id", item.ID, "no info");
			
			var isFirstCharge = (currentInfo === null || currentInfo[PAYMENT_INFO_TOTAL] <= 0);
			var bonusPercent = ((isFirstCharge ? item.FIRST_CHARGE_PERCENT : 0) + item.PROMOTION_PERCENT);
			var actualAmount = item.QUANTITY + FWUtils.fastFloor((item.QUANTITY * bonusPercent) / 100) + item.BONUS_QUANTITY;
			
			item.iapIcon = item.GFX;
			if (this.currentTab === PAYMENT_TAB_OFFER)
			{
				item.iapIcon = cc.formatStr("items/item_package_offer0%s.png", iconIdx);
				iconIdx++;
				if(iconIdx > 5)
					iconIdx = 1;
			}
			else if (this.currentTab === PAYMENT_TAB_GOLD){
				if(i > 6)
				{
					item.iapIcon = "items/item_gold_07.png";
				}
				else item.iapIcon = cc.formatStr("items/item_gold_0%s.png", i + 1);
			}

			else{
				if(i > 6)
				{
					item.iapIcon = "items/item_diamond_07.png";
				}
				else item.iapIcon = cc.formatStr("items/item_diamond_0%s.png", i + 1);
			}

				
			item.iapName = "TXT_PAYMENT_" + item.ID;
			//item.iapAmount = actualAmount;
			item.iapAmount = gv.vipManager.check()&& this.currentTab === PAYMENT_TAB_GOLD?actualAmount+item.QUANTITY*(gv.vipManager.convertGoldBonus)/100:actualAmount;
			item.iapOldAmount = item.QUANTITY;
			item.iapPrice = item.PRICE_LOCAL;//item.PRICE_VND;
			if(g_PAYMENT_DATA.USE_PRICE_CENT)
				item.iapPrice = (item.iapPrice / 100).toFixed(2);

			// jira#5024
			//item.iapDiscount = FWUtils.fastFloor((item.iapAmount - item.iapOldAmount) * 100 / item.iapOldAmount);
			//item.iapDiscountText = item.iapDiscount + "%\nOFF";
			item.iapDiscount = bonusPercent;// feedback FWUtils.fastFloor((item.iapAmount - item.iapOldAmount) * 100 / item.iapOldAmount);
			item.iapDiscountText = cc.formatStr("+%s%", item.iapDiscount);

			if (this.currentTab === PAYMENT_TAB_OFFER)
			{
				item.iapAmount = "";
				item.iapOldAmount = "";
				item.iapDiscount = 0;
				item.iapDiscountText = "";
			}
			
			// jira#5947
			item.highlight = (i === 0 && this.currentTab === PAYMENT_TAB_OFFER);
			
			displayItems.push(item);
		}
		
		var itemDef =
		{
			sprite:{type:UITYPE_IMAGE, field:"iapIcon", scale:0.9},
			name:{type:UITYPE_TEXT, field:"iapName", style:TEXT_STYLE_TEXT_HINT_BROWN, visible:false},
			price:{type:UITYPE_TEXT, field:"iapAmount", style:TEXT_STYLE_TITLE_1},
			oldPrice:{type:UITYPE_TEXT, field:"iapOldAmount", style:TEXT_STYLE_TEXT_SMALL, visible:"data.iapOldAmount !== data.iapAmount"},
			btnBuy:{visible:true, onTouchEnded:this.onItemSelected.bind(this)},
			lblPrice:{type:UITYPE_TEXT, field:"iapPrice", style:TEXT_STYLE_TEXT_BUTTON},
			btnBuyDiamond:{visible:false},
			discount:{visible:"data.iapDiscount > 0"},
			discountText:{type:UITYPE_TEXT, field:"iapDiscountText"},
			highlight:{visible:"data.highlight", type:UITYPE_SPINE, value:SPINE_MENU_OFFER_HIGHLIGHT, anim:"animation"},
		};
		
		uiDef.itemList = {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_PAYMENT_ITEM, itemDef:itemDef, itemSize:cc.size(640, 125), visible:true};

		// auto select: vn + thailand
		if (COUNTRY === COUNTRY_VIETNAM || COUNTRY === COUNTRY_THAILAND || COUNTRY === COUNTRY_MYANMAR)
		{
			if (this.currentTab === PAYMENT_TAB_OFFER && this.currentSubTab === PAYMENT_SUBTAB_SMS)
			{
				cc.log ("Payment", "autoSelect", this.offerId);
				if (!this.offerId || this.offerId === "")
					return;

				if (displayItems.length === 0)
					return;

				var price = displayItems [0].iapPrice;
				if (price > 50000)
					return;
				
				this.selectedItem = displayItems [0];
				this.showSmsChannelSelection();
			}
		}
	},

	showOfferItems: function (uiDef)
	{
		var temps = this.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_OFFERS];

		var widget = FWPool.getNode(UI_PAYMENT, false);
		var itemList = FWUtils.getChildByName(widget, "itemList");
		FWUI.unfillData_list(itemList);//jira#5684 itemList.removeAllChildren ();

		var currentTimeSeconds = Game.getGameTimeInSeconds();
		
		var showItems = [];
		for (var i = 0; i < temps.length; i++)
		{
			var data = temps [i];
			if (data.rule.start > currentTimeSeconds || currentTimeSeconds > data.rule.finish)
				continue;

			var item = new OfferItem (function(offerData) {this.onOfferItem (offerData);}.bind(this));
			item.load (data);

			showItems.push (item);
		}
		
		var offer = showItems.length > 1 ? 30 : 130;
		for (var i in showItems)
		{
			var item = showItems [i];
			item.setPosition (cc.p (0, 420 * i + offer));
			itemList.addChild (item);			
			item.setTag(UI_FILL_DATA_TAG); //jira#5684
		}

		itemList.setInnerContainerSize(cc.size(610, showItems.length * 420 + 10));

		uiDef.itemList = {visible: true};
		uiDef.zingCard = {visible: false};
		uiDef.seaCard = {visible: false};

		this.offerId = "";
		this.offerPrice = 0;

		// hide all tabs
		var buttonList = [ "btnOffer", "btnAppStore", "btnCoin2Gold", "btnSMS", "btnZingCard", "btnATM", "btnWallet", "btnBanking" ];
		for(var i in buttonList)
		{
			var name = buttonList [i];
			var onButton = FWUtils.getChildByName(widget, name + "On");
			onButton.setVisible (false);

			var offButton = FWUtils.getChildByName(widget, name + "Off");
			offButton.setVisible (false);
		}
	},
	
	showCoin2GoldItems:function(uiDef)
	{
		var items = this.data[this.currentTab][this.currentSubTab];
		var displayItems = [];
		for(var i=0; i<items.length; i++)
		{
			var item = items[i];
			
			item.iapIcon = item.GFX || cc.formatStr("items/item_gold_0%s.png", i + 1);
			item.iapName = "";
			//item.iapAmount = gv.vipManager.check()? item.ITEM_QUANTITY+item.ITEM_QUANTITY*(gv.vipManager.convertGoldBonus)/100:item.ITEM_QUANTITY;
			item.iapAmount = gv.vipManager.check()? item.ITEM_QUANTITY*(100+gv.vipManager.convertGoldBonus)/100:item.ITEM_QUANTITY;
			item.iapOldAmount = item.ITEM_QUANTITY;
			item.iapDiscount = item.SALE_OFF_PERCENT;
			item.iapDiscountText = item.iapDiscount + "%";
			item.iapPrice = item.PRICE_NUM;
			item.isEnoughCoin = (gv.userData.getCoin() >= item.PRICE_NUM);
			
			displayItems.push(item);
		}
		
		var itemDef =
		{
			sprite:{type:UITYPE_IMAGE, field:"iapIcon", scale:0.9},
			name:{type:UITYPE_TEXT, field:"iapName", style:TEXT_STYLE_TEXT_HINT_BROWN, visible:false},
			price:{type:UITYPE_TEXT, field:"iapAmount", style:TEXT_STYLE_TITLE_1},
			oldPrice:{type:UITYPE_TEXT, field:"iapOldAmount", style:TEXT_STYLE_TEXT_SMALL, visible:"data.iapOldAmount !== data.iapAmount"},
			btnBuyDiamond:{visible:true, onTouchEnded:this.onItemSelected.bind(this)},
			lblPriceDiamond:{type:UITYPE_TEXT, field:"iapPrice", style:TEXT_STYLE_TEXT_BUTTON, color:"data.isEnoughCoin ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND"},
			btnBuy:{visible:false},
			discount:{visible:"data.iapDiscount > 0"},
			discountText:{type:UITYPE_TEXT, field:"iapDiscountText"},
			highlight:{visible:false},
		};
		
		uiDef.itemList = {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_PAYMENT_ITEM, itemDef:itemDef, itemSize:cc.size(640, 125), visible:true};
	},
	
	showCardInput:function(uiDef)
	{
		this.selectedItem = this.data[this.currentTab][this.currentSubTab][0];
		cc.log ("Payment", "showCardInput", JSON.stringify (this.selectedItem));

		switch (COUNTRY)
		{
			case COUNTRY_VIETNAM:
				this.showZingCardInput (uiDef);
			return;

			case COUNTRY_MYANMAR:
			case COUNTRY_THAILAND:
			case COUNTRY_PHILIPPINE:
				this.showSEACardInput (uiDef);
			return;
		}
	},

	showZingCardInput:function(uiDef)
	{
		// discount
		var discount = 0;
		var item = this.data[this.currentTab][this.currentSubTab][0];
		if(item.FIRST_CHARGE_PERCENT > 0)
		{
			var currentInfo = this.getCurrentPaymentInfoById(item.ID);
			var isFirstCharge = (currentInfo === null || currentInfo[PAYMENT_INFO_TOTAL] <= 0);
			if(isFirstCharge)
				discount = item.FIRST_CHARGE_PERCENT;
		}
		if(discount <= 0)
			discount = item.PROMOTION_PERCENT;
		
		// rate
		var rateText;
		if(this.currentTab === PAYMENT_TAB_COIN)
			rateText = cc.formatStr(FWLocalization.text("TXT_PAYMENT_EXCHANGE"), g_PAYMENT_DATA.RATE_VND_TO_COIN, 1);
		else
			rateText = cc.formatStr(FWLocalization.text("TXT_PAYMENT_EXCHANGE"), g_PAYMENT_DATA.RATE_VND_TO_COIN, g_PAYMENT_DATA.RATE_COIN_TO_GOLD);
		
		uiDef.zingCard = {visible:true};
		uiDef.seaCard = {visible:false};
		uiDef.exchangeBg = {visible:this.currentTab !== PAYMENT_TAB_OFFER};
		uiDef.exchangeText = {type:UITYPE_TEXT, value:rateText, style:TEXT_STYLE_TITLE_2};
		uiDef.excDiscountBg = {visible:discount > 0};
		uiDef.excDiscountText = {type:UITYPE_TEXT, value:cc.formatStr("+%s%", discount), visible:discount > 0};
		uiDef.excGoldIcon = {visible:this.currentTab === PAYMENT_TAB_GOLD};
		uiDef.excCoinIcon = {visible:this.currentTab === PAYMENT_TAB_COIN};
		uiDef.lblCardNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_NUM", style:TEXT_STYLE_TEXT_NORMAL};
		uiDef.inputCardNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK};
		uiDef.lblSerialNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_SERIAL", style:TEXT_STYLE_TEXT_NORMAL};
		uiDef.inputSerialNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK};
		uiDef.lblCharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};
		uiDef.btnCharge = {onTouchEnded:this.chargeCard.bind(this)};
		uiDef.excDiscountHint = {type:UITYPE_TEXT, visible:discount > 0, value:discount, format:"TXT_PAYMENT_CARD_DISCOUNT_HINT", style:TEXT_STYLE_TEXT_NORMAL};
	},
	
	showBankMenu:function(uiDef)
	{
		// TODO: get available banks from this link: https://sandbox.mobile.pay.zing.vn/zmpapi/banklistall
		var displayItems = [];
		for(var key in this.bankIconsMapping)
		{
			if(key === "123PCC")
				continue; // skip cc
			displayItems.push({id:key, icon:"logo banks/logo_bank_" + this.bankIconsMapping[key] + ".png"});
		}

		var itemDef =
		{
			sprite:{type:UITYPE_IMAGE, field:"icon", visible:true},
			amount:{visible:false},
			item:{onTouchEnded:this.onBankSelected.bind(this)},
		};
		
		uiDef.itemList = {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(150, 88), visible:true};
	},
	
	showErrorPopup:function(errorCode)
	{
		this.hideProgressPopup();
		Game.showPopup({title:"TXT_POPUP_TITLE", content:cc.formatStr(FWLocalization.text("TXT_PAYMENT_FAIL"), errorCode), avatar:"npc/npc_jack_02.png", avatarBg:true}, function() {});
	},
	
	updateOffer: function (widget, dt)//web updateOffer: function (widget, dt = 0)
	{
		if(dt === undefined)
			dt = 0;
		
		if (this.currentTab !== PAYMENT_TAB_OFFER || this.currentSubTab !== PAYMENT_SUBTAB_OFFERS)
		{
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateOffer);
			return;
		}
        
		var currentTimeSeconds = Game.getGameTimeInSeconds();
		
		widget = FWPool.getNode(UI_PAYMENT, false);//web var widget = FWPool.getNode(UI_PAYMENT, false);
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var childrens = itemList.getChildren().slice();
		
		if (childrens.length === 0)
		{
			this.hide();
			return;
		}
        
		var remove = [];
		var keep = [];
		for(var i in childrens)
		{
			var item = childrens [i];
			item.update (currentTimeSeconds);
			
			if (item.isTimeout)
				remove.push (item);
			else
				keep.push (item);
		}

		if (remove.length === 0)
			return;
		
		for (var i in remove)
		{
			var item = remove [i];
			item.runAction (cc.sequence (cc.moveTo (0.2, cc.p (item.x * 2, item.y)), cc.callFunc (function() {item.removeFromParent();})));
		}
		
		var height = 420 * keep.length + 10;
		var offer = keep.length > 1 ? 30 : 130;
		for(var i in keep)
		{
			var item = keep [i];
			item.runAction (cc.sequence (cc.delayTime (0.1), cc.moveTo (0.15, cc.p (item.x, 420 * i + offer))));
		}

		itemList.runAction (cc.sequence (cc.delayTime (0.25), cc.callFunc (function() {itemList.setInnerContainerSize(cc.size(610, height));})));
	},
	
	refresh: function ()
	{
		var subTab = this.currentSubTab;
		if (this.currentTab === PAYMENT_TAB_OFFER)
		{
			if (!gv.offerPanel.check())
			{
				this.hide();
				return;
			}
            
			subTab = PAYMENT_SUBTAB_OFFERS;
		}
		else
		{
			if (this.currentSubTab === PAYMENT_SUBTAB_BANK)
				subTab = PAYMENT_SUBTAB_ATM;
		}
		
		this.showSubTab (subTab);
	},

	hide:function()
	{
		// jira#5632 leak
		if (this.currentTab === PAYMENT_TAB_OFFER && cc.sys.isObjectValid(this.itemList))
			this.itemList.removeAllChildren();
		
		FWUI.hide(UI_PAYMENT, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);

		this.offerId = "";
		this.offerPrice = 0;
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateOffer);

		if (this.onHide)
			this.onHide ();

		delete this.onHide;
	},
	
	hideProgressPopup:function()
	{
		if(this.progressPopup && FWUI.isWidgetShowing(this.progressPopup))
		{
			FWUI.hideWidget(this.progressPopup, UIFX_POP);
			this.progressPopup = null;
		}
		PigBank.hideProgressPopup();
	},
	
	changeTab:function(sender)
	{
		var name = sender.getName();
		switch (name)
		{
			case "tabGoldOff": this.showTab(PAYMENT_TAB_GOLD); break;
			case "tabCoinOff": this.showTab(PAYMENT_TAB_COIN); break;
			case "tabOfferOff": this.showTab(PAYMENT_TAB_OFFER); break;
			case "tabPigBankOff" :  gv.pigBankPanel.show(); this.hide(); break;
			case "tabVipOff" :  gv.vipManager.show(); this.hide(); break;
		}
	},
	
	changeSubTab:function(sender)
	{
		if (this.currentTab === PAYMENT_TAB_OFFER && !this.offerId)
			return;

		var name = sender.getName();
		var subTab = null;
		if(name === "btnOfferOff")
			subTab = PAYMENT_SUBTAB_OFFERS;
		else if(name === "btnCoin2GoldOff")
			subTab = PAYMENT_SUBTAB_COIN2GOLD;
		else if(name === "btnAppStoreOff")
			subTab = PAYMENT_SUBTAB_IAP;
		else if(name === "btnSMSOff")
			subTab = PAYMENT_SUBTAB_SMS;
		else if(name === "btnZingCardOff")
			subTab = PAYMENT_SUBTAB_CARD;
		else if(name === "btnATMOff")
			subTab = PAYMENT_SUBTAB_ATM;
		else if(name === "btnWalletOff")
			subTab = PAYMENT_SUBTAB_WALLET;
		else if(name === "btnBankingOff")
			subTab = PAYMENT_SUBTAB_BANKING;
		else if(name === "btnCreditOff")
			subTab = PAYMENT_SUBTAB_CREDIT;
		this.showSubTab(subTab);
	},
	
	getCurrentPaymentInfoById:function(id)
	{
		var itemList = gv.userData.game[GAME_PAYMENT][PAYMENT_INFOS];
		for(var i=0; i<itemList.length; i++)
		{
			if(itemList[i][PAYMENT_INFO_ID] === id)
				return itemList[i];
		}
		return null;
	},
	
	// jira#5451
	lastItemId: null,
	clickCount: 0,
	
	onItemSelected:function(sender)
	{
		if(this.currentSubTab === PAYMENT_SUBTAB_COIN2GOLD)
		{
			var itemData = sender.uiData;
			
			if(this.lastItemId !== itemData.PRICE_NUM)
			{
				this.lastItemId = itemData.PRICE_NUM;
				this.clickCount = 0;
			}
			this.clickCount++;
			
			if(itemData.PRICE_NUM > 100 && this.clickCount < 2)
				FWUtils.showWarningText(FWLocalization.text("TXT_IB_SHOP_BUY_CONFIRM"), FWUtils.getWorldPosition(sender));
			else if(Game.consumeDiamond(itemData.PRICE_NUM, FWUtils.getWorldPosition(sender)))
			{
				//// fake
				if(gv.vipManager.check())
				{
					Game.addItems([{itemId:ID_GOLD, amount:itemData.ITEM_QUANTITY*Math.floor(1+gv.vipManager.convertGoldBonus/100)}], FWUtils.getWorldPosition(sender));
					Game.refreshUIMain(RF_UIMAIN_COIN);
				}
				else
				{
					Game.addItems([{itemId:ID_GOLD, amount:itemData.ITEM_QUANTITY}], FWUtils.getWorldPosition(sender));
					Game.refreshUIMain(RF_UIMAIN_COIN);
				}
				//Game.addItems([{itemId:ID_GOLD, amount:itemData.ITEM_QUANTITY}], FWUtils.getWorldPosition(sender));
				//Game.refreshUIMain(RF_UIMAIN_COIN);

				// server
				var pk = network.connector.client.getOutPacket(network.ibshop.BuyIBShopRequest);
				pk.pack(ID_GOLD, itemData.ITEM_QUANTITY, itemData.PRICE_TYPE, itemData.PRICE_NUM);
				network.connector.client.sendPacket(pk);
			}
			return;
		}
		
		this.selectedItem = sender.uiData;
		if(this.currentSubTab === PAYMENT_SUBTAB_SMS)
			this.showSmsChannelSelection();
		else if(this.currentSubTab === PAYMENT_SUBTAB_ATM)
			this.showSubTab(PAYMENT_SUBTAB_BANK);
		else if(this.currentSubTab === PAYMENT_SUBTAB_IAP)
			this.checkIAPItem();
		else if(this.currentSubTab === PAYMENT_SUBTAB_WALLET)
			this.chargeWallet();
		else if(this.currentSubTab === PAYMENT_SUBTAB_BANKING)
			this.chargeBanking();
		else if(this.currentSubTab === PAYMENT_SUBTAB_CREDIT)
			CardPayment.show();
	},

	onOfferItem:function (offerData)
	{
		this.offerId = offerData.id;
		this.offerPrice = offerData.price;
		this.offerItems = offerData.items;
		this.offerTitle = offerData.title;

		var subTab = offerData.order [0];
		this.showSubTab(subTab);

		cc.log ("onOfferItem", this.offerId, subTab, this.offerPrice);
	},
	
	chargeCard:function(sender)
	{
		var uiPayment = FWPool.getNode(UI_PAYMENT, false);
		var inputCardNum = FWUtils.getChildByName(uiPayment, "inputCardNum");
		var inputSerialNum = FWUtils.getChildByName(uiPayment, "inputSerialNum");
		var cardNum = inputCardNum.getString();
		var serialNum = inputSerialNum.getString();
		if(!cardNum || !serialNum)
		{
			Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_MISSING_INFO"}, function() {});
			return;
		}
		
		switch (COUNTRY)
		{
			case COUNTRY_VIETNAM:
			{
				// popup
				this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});
				
				// server
				var pk = network.connector.client.getOutPacket(Payment.RequestPaymentCardSubmit);
				cc.log ("RequestPaymentCardSubmit", VN_CARD_ZING, serialNum, cardNum, this.currentTab, this.currentSubTab, this.data[this.currentTab][this.currentSubTab][0].ID, this.offerId);
				pk.pack(VN_CARD_ZING, serialNum, cardNum, this.data[this.currentTab][this.currentSubTab][0].ID, this.offerId);
				network.connector.client.sendPacket(pk);
		
				this.refresh();
			}
			return;
		}
	},
	
	chargeWallet:function ()
	{
		cc.log ("Payment", "chargeWallet", JSON.stringify (this.selectedItem));
		switch (COUNTRY)
		{
			case COUNTRY_MYANMAR:
			case COUNTRY_THAILAND:
            case COUNTRY_PHILIPPINE:
				this.chargeSEAWallet ();
			break;
		}
	},

	chargeBanking:function ()
	{
		cc.log ("Payment", "chargeBanking", JSON.stringify (this.selectedItem));

		switch (COUNTRY)
		{
			case COUNTRY_MYANMAR:
			case COUNTRY_THAILAND:
            case COUNTRY_PHILIPPINE:
				this.chargeSEABanking ();
			break;
		}
	},
	
	onBankSelected:function(sender)
	{
		var data = sender.uiData;
		cc.log("Payment::onBankSelected: bank=" + data.id + " item=" + this.selectedItem.ID);
		
		// popup
		//this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});
		
		// server
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentAtmReg);
		pk.pack(data.id, this.selectedItem.ID, this.offerId);
		network.connector.client.sendPacket(pk);

		this.refresh ();
	},

	modifyPhoneNumber:function(number) {
		number = number.replace(/[\s-]/gi, '');
		if (COUNTRY == COUNTRY_BRAZIL)
			number = number.replace(/^0/gi, '55');
		return number;
	},

	operatorToChannel:function(operator, isPrepaid){//web operatorToChannel:function(operator, isPrepaid = true){
		
		if(isPrepaid === undefined)
			isPrepaid = true;
		
		switch (operator) {
			case '45201': 
				return VN_SMS_MOBI;
			case '45202': 
				return VN_SMS_VINA;
			case '45204': 
			case '45206': 
			case '45208': 
				return VN_SMS_VIETTEL;
			case '72402': 
			case '72403': 
			case '72404': 
			case '72408': 
				return BR_SMS_TIM;
			case '72430': 
			case '72431': 
				return BR_SMS_OI;
			case '72401': 
			case '72406': 
			case '72410': 
			case '72411': 
			case '72419': 
			case '72423': 
				return BR_SMS_VIVO;
			case '41400':
			case '41401':
			case '41402':
			case '41404':
				return MM_SMS_MPT;
			case '41405':
				return MM_SMS_OOREDOO;
			case '41406':
				return MM_SMS_TELENOR;
			case '41409':
				return MM_SMS_MYTEL;
				
			case '51502':
				return PH_SMS_GLOBE;
			case '51503':
				return PH_SMS_SMART;
				
			case '52001':
			case '52003':
				return isPrepaid ? TH_SMS_PREPAID_AIS : TH_SMS_POSTPAID_AIS;
			case '52005':
			case '52018':
				return isPrepaid ? TH_SMS_PREPAID_DTAC : TH_SMS_POSTPAID_DTAC;
			case '52004':
			case '52099':
				return TH_SMS_PREPAID_TRUE;
			case '52000':
			case '52002':
				return TH_SMS_PREPAID_CAT;
		}
		return '';
	},

	channelToIcon:function(channel){
		switch (channel) {
			case VN_SMS_MOBI: 		return "logo banks/logo_mobifone.png";
			case VN_SMS_VINA: 		return "logo banks/logo_vinaphone.png";
			case VN_SMS_VIETTEL:	return "logo banks/logo_viettel.png";

			case BR_SMS_OI:			return "logo banks/logo_bank_oi.png";
			case BR_SMS_VIVO:		return "logo banks/logo_bank_vivo.png";
			case BR_SMS_TIM:		return "logo banks/logo_bank_tim.png";
	
			case MM_SMS_MPT:			return "logo banks/pm_mm_mpt.png";
			case MM_SMS_TELENOR:		return "logo banks/pm_mm_telenor.png";
			case MM_SMS_OOREDOO:		return "logo banks/pm_mm_ooredo.png";
			case MM_SMS_MYTEL:			return "logo banks/pm_mm_mytel.png";
			case MM_WALLET_WAVE_MONEY:	return "logo banks/pm_mm_wave_money.png";
			case MM_CARD_EASYPOINT:		return "logo banks/pm_mm_easy_points.png";

			case PH_SMS_GLOBE:			return "logo banks/pm_ph_globe.png";
			case PH_SMS_SMART:			return "logo banks/pm_ph_smartsun.png";
			case PH_WALLET_GCASH:		return "logo banks/pm_ph_gcash.png";

			case TH_SMS_PREPAID_AIS:	return "logo banks/pm_th_dcb_ais.png";
			case TH_SMS_POSTPAID_AIS:	return "logo banks/pm_th_dcb_ais.png";
			case TH_SMS_PREPAID_DTAC:	return "logo banks/pm_th_dcb_dtac.png";
			case TH_SMS_POSTPAID_DTAC:	return "logo banks/pm_th_dcb_dtac.png";
			case TH_SMS_PREPAID_TRUE:	return "logo banks/pm_th_dcb_true.png";
			case TH_SMS_PREPAID_CAT:	return "logo banks/pm_th_dcb_cat.png";
			case TH_CARD_AIS:			return "logo banks/pm_th_dcb_ais.png";
			case TH_CARD_TRUE:			return "logo banks/pm_th_dcb_true.png";
			case TH_WALLET_TRUE:		return "logo banks/pm_th_wallet_true.png";
			case TH_WALLET_LINE:		return "logo banks/pm_th_wallet_line.png";
			case TH_WALLET_MPAY:		return "logo banks/pm_th_wallet_mpay.png";
			case TH_BANKING_BOAP:		return "logo banks/pm_th_bank_krungsi.png";
			case TH_BANKING_BBP:		return "logo banks/pm_th_bank_bangkok.png";
			case TH_BANKING_KTBP:		return "logo banks/pm_th_bank_krung.png";
			case TH_BANKING_TSCBP:		return "logo banks/pm_th_bank_scb.png";
			
			default: return "logo banks/logo_mobifone.png";
		}		
	},
	
	isSmsChannelActive:function(channel)
	{		
		return (g_PAYMENT_DATA.ACTIVE_SMS.indexOf(channel) >= 0);
	},
	
	showSmsChannelSelection:function()
	{	
		var numSim = fr.platformWrapper.getPhoneCount();
		var simOperator = fr.platformWrapper.getSimOperator();		
		cc.log("numSim", numSim);
		cc.log("simOperator", simOperator);

		if (numSim == 1 && simOperator && simOperator.length > 0)
		{
			// new data
			//if ((g_PAYMENT_DATA.ACTIVE_SMS_MOBI && simOperator == CHANNEL_MOBI) 
			// || (g_PAYMENT_DATA.ACTIVE_SMS_VINA && simOperator == CHANNEL_VINA)
			// || (g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL && simOperator == CHANNEL_VIETTEL)
			//)
			var channel = this.operatorToChannel(simOperator);
			if(this.isSmsChannelActive(channel))
			{
				switch (COUNTRY)
				{
					case COUNTRY_VIETNAM:
					{
						this.requestPaymentSmsReg(channel);
					}
					return;
				
					case COUNTRY_BRAZIL:
					{
						this.selectedSMSChannel = channel;
						this.brSmsStep = 0;
						this.brDefaultPhoneNo = cc.sys.localStorage.getItem("brDefaultPhoneNo");
						if(!this.brDefaultPhoneNo)
							this.brDefaultPhoneNo = "";
						this.showBRSms();
					}
					return;
				}
			}
		}		

		// new data
		// var uiDef =
		// {
			// title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_CHANNEL", style:TEXT_STYLE_TITLE_2},
			// lblMtnMobi:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHANNEL_MAINTENANCE", style:TEXT_STYLE_TEXT_SMALL, visible:!this.isSmsChannelActive(VN_SMS_MOBI)},//lblMtnMobi:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHANNEL_MAINTENANCE", style:TEXT_STYLE_TEXT_SMALL, visible:g_PAYMENT_DATA.ACTIVE_SMS_MOBI === false},
			// lblMtnVina:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHANNEL_MAINTENANCE", style:TEXT_STYLE_TEXT_SMALL, visible:!this.isSmsChannelActive(VN_SMS_VINA)},
			// lblMtnViettel:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHANNEL_MAINTENANCE", style:TEXT_STYLE_TEXT_SMALL, visible:!this.isSmsChannelActive(VN_SMS_VIETTEL)},
			// imgMobi:{onTouchEnded:this.onSmsChannelSelected.bind(this)},
			// imgVina:{onTouchEnded:this.onSmsChannelSelected.bind(this)},
			// imgViettel:{onTouchEnded:this.onSmsChannelSelected.bind(this)},
			// closeButton:{onTouchEnded:this.hideSmsChannelSelection.bind(this)}
		// };
		var channelItems = [];
		for(var i in this.selectedItem.CHANNEL)
		{
			var channel = this.selectedItem.CHANNEL[i];
			if(this.isSmsChannelActive(channel))
			{
				var data = {
					channel: channel,
					icon: this.channelToIcon(channel)
				};
				channelItems.push(data);
			}
		}

		var prepaidChannels = [];
		if (this.selectedItem.CHANNEL_PREPAID)
		for (var i in this.selectedItem.CHANNEL_PREPAID)
		{
			var channel = this.selectedItem.CHANNEL_PREPAID[i];
			if(this.isSmsChannelActive(channel))
			{
				var data = {
					channel: channel,
					icon: this.channelToIcon(channel)
				};
				prepaidChannels.push(data);
			}
		}

		var postpaidChannels = [];
		if (this.selectedItem.CHANNEL_POSTPAID)
		for (var i in this.selectedItem.CHANNEL_POSTPAID)
		{
			var channel = this.selectedItem.CHANNEL_POSTPAID[i];
			if(this.isSmsChannelActive(channel))
			{
				var data = {
					channel: channel,
					icon: this.channelToIcon(channel)
				};
				postpaidChannels.push(data);
			}
		}
		
		var channelItemDef =
		{
			item:{onTouchEnded:this.onSmsChannelSelected.bind(this)},
			sprite:{type:UITYPE_IMAGE, field:"icon", visible:true},
			amount:{visible:false},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_CHANNEL", style:TEXT_STYLE_TITLE_2},
			closeButton:{onTouchEnded:this.hideSmsChannelSelection.bind(this)},
		};

		var panelId = UI_PAYMENT_CHOOSE_CHANNEL;
		if (prepaidChannels.length > 0 || postpaidChannels.length > 0)
		{
			panelId = UI_PAYMENT_CHOOSE_CHANNEL_SEA;
			uiDef.lb_prepaid = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_PREPAID_CHANNEL", style:TEXT_STYLE_TEXT_SMALL},
			uiDef.prepaidList = {type:UITYPE_2D_LIST, items:prepaidChannels, itemUI:UI_ITEM_NO_BG2, itemDef:channelItemDef, itemSize:cc.size(150, 100), itemsAlign:"center", singleLine:true};
			uiDef.lb_postPaid = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_POSTPAID_CHANNEL", style:TEXT_STYLE_TEXT_SMALL},
			uiDef.postpaidList = {type:UITYPE_2D_LIST, items:postpaidChannels, itemUI:UI_ITEM_NO_BG2, itemDef:channelItemDef, itemSize:cc.size(150, 100), itemsAlign:"center", singleLine:true};
		}
		else
		{
			uiDef.itemList = {type:UITYPE_2D_LIST, items:channelItems, itemUI:UI_ITEM_NO_BG2, itemDef:channelItemDef, itemSize:cc.size(150, 100), itemsAlign:"center", singleLine:true};
		}
		
		var widget = FWUI.showWithData(panelId, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		
		if(!this.hideFuncSmsChannel)
			this.hideFuncSmsChannel = function() {this.hideSmsChannelSelection()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncSmsChannel);
	},
	
	hideSmsChannelSelection:function(sender)
	{
		Game.gameScene.unregisterBackKey(this.hideFuncSmsChannel);
		FWUI.hide(UI_PAYMENT_CHOOSE_CHANNEL, UIFX_POP);
		FWUI.hide(UI_PAYMENT_CHOOSE_CHANNEL_SEA, UIFX_POP);
	},
	
	onSmsChannelSelected:function(sender)
	{
		// new data
		// var channel = null;
		// var name = sender.getName();
		// if (g_PAYMENT_DATA.ACTIVE_SMS_MOBI && name === "imgMobi")
			// channel = CHANNEL_MOBI;
		// else if (g_PAYMENT_DATA.ACTIVE_SMS_VINA && name === "imgVina")
			// channel = CHANNEL_VINA;
		// else if (g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL && name === "imgViettel")
			// channel = CHANNEL_VIETTEL;
		var channel = sender.uiData.channel;
		cc.log("Payment", "onSmsChannelSelected", "uiData", JSON.stringify (sender.uiData));
		if (!channel)
		{
			//FWUtils.showWarningText(FWLocalization.text("TXT_PAYMENT_CHANNEL_MAINTENANCE"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		cc.log("Payment", "onSmsChannelSelected", "channel", channel, "item", JSON.stringify (this.selectedItem));
		cc.log("Payment", "onSmsChannelSelected", "offer", this.offerId);
		
		this.hideSmsChannelSelection(sender);
		//this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});

		switch (COUNTRY)
		{
			case COUNTRY_VIETNAM:
			{
				this.requestPaymentSmsReg(channel);
			}
			return;
		
			case COUNTRY_BRAZIL:
			{
				this.selectedSMSChannel = channel;
				this.brSmsStep = 0;
				this.brDefaultPhoneNo = cc.sys.localStorage.getItem("brDefaultPhoneNo");
				if(!this.brDefaultPhoneNo)
					this.brDefaultPhoneNo = "";
				this.showBRSms();
			}
			return;

			case COUNTRY_MYANMAR:
			case COUNTRY_THAILAND:
			case COUNTRY_PHILIPPINE:
			{
				var channelNo = channel;
				var phoneNo = "";
				var priceLocal = this.selectedItem.PRICE_LOCAL;
				var priceVnd = this.selectedItem.PRICE_VND;
				var itemId = this.selectedItem.ID;
				var offerId = this.offerId;
				PaymentLibHandle.callSMS (channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
			}
			return;
		}
	},
	
	requestPaymentSmsReg:function(channel) {
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentSmsReg);
		pk.pack(channel, this.selectedItem.ID, this.offerId);
		network.connector.client.sendPacket(pk);
	},
	
	checkIAPItem:function()
	{
		cc.log("Payment::checkIAPItem: id=" + this.selectedItem.ID);
		
		// popup
		//this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});

		// server
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentGoogleCheck);
		pk.pack(this.selectedItem.ID, this.offerId);
		network.connector.client.sendPacket(pk);
	},
	
	onIapCheckOk:function()
	{
		cc.log("Payment::onIapCheckOk: id=" + this.selectedItem.ID);
		if(!googleIap.requestPayProduct(this.selectedItem.ID))
			Payment.showErrorPopup(-2);
	},
	
	iapPurchaseData: null,
	iapSignature: null,
	onIapSuccess:function(packageName, purchaseData, signature)
	{
		cc.log("Payment::onIapSuccess: packageName=" + packageName);
		cc.log("Payment::onIapSuccess: purchaseData=" + purchaseData);
		cc.log("Payment::onIapSuccess: signature=" + signature);
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentGoogleSubmit);
		pk.pack(packageName, purchaseData, signature, this.offerId);
		network.connector.client.sendPacket(pk);
	},
	
	getFirstChargeMailTitle:function(channel)
	{
		var text = null;
		if(channel === defineTypes.SUB_TYPE_IAP)
			text = "TXT_PAYMENT_FIRST_CHARGE_IAP";
		else if(channel === defineTypes.SUB_TYPE_SMS)
			text = "TXT_PAYMENT_FIRST_CHARGE_SMS";
		else if(channel === defineTypes.SUB_TYPE_ATM)
			text = "TXT_PAYMENT_FIRST_CHARGE_ATM";
		else if(channel === defineTypes.SUB_TYPE_ZING)
			text = "TXT_PAYMENT_FIRST_CHARGE_ZING";
		else if(channel === defineTypes.SUB_TYPE_CARD)
			text = "TXT_PAYMENT_FIRST_CHARGE_CARD";
		else if(channel === defineTypes.SUB_TYPE_WALLET)
			text = "TXT_PAYMENT_FIRST_CHARGE_WALLET";
		else if(channel === defineTypes.SUB_TYPE_BANKING)
			text = "TXT_PAYMENT_FIRST_CHARGE_BANKING";
		else if(channel === defineTypes.SUB_TYPE_CREDIT)
			text = "TXT_PAYMENT_FIRST_CHARGE_CREDIT";
		return FWLocalization.text(text);
	},
	
	isLocalPaymentEnabled: null,
	setLocalPaymentEnabled:function(enabled)
	{
		// fix: exception 
		if(!gv.userData)
		{
			this.isLocalPaymentEnabled = enabled;
			return;
		}
		this.isLocalPaymentEnabled = null;
		
		if(!this.isInitialized)
			this.init();
		
		if(this.hasLocalPayment === enabled)
			return;
		
		this.hasLocalPayment = enabled;
		
		Payment.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_OFFERS] = gv.offerPanel.list();
		gv.offerPanel.updateCheckTime();
		
		if(FWUI.isShowing(UI_PAYMENT))
			this.hide();
	},
	
	updatePaymentDataFromServer:function(data)
	{
		if(data)
		{
			gv.userData.game[GAME_PAYMENT] = data;
			if(data[PAYMENT_REPEAT_OFFERS] || data[PAYMENT_OFFERS])
			{
				Payment.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_OFFERS] = gv.offerPanel.list();
				gv.offerPanel.updateCheckTime();
			}
		}
	},
	
	showWebATMConfirm:function(url)
	{
		this.progressPopup = Game.showPopup({title:"", content:"TXT_ATM_PAYMENT_WEB", okText:"TXT_OK"}, function() {});
		
		var btn = document.createElement("BUTTON");
		btn.innerHTML = "";
		btn.setAttribute("style","z-index:100;background-color:#00000000;position:absolute;top:0;left:0;width:100%;height:100%;padding:0;border:0;margin:0;");
		btn.addEventListener ("click", function() {
			window.open(url, "_blank");
			document.body.removeChild(btn);
			Payment.hideProgressPopup();
		});		
		document.body.appendChild(btn);
	},
	
	showWebSMSConfirm:function(data, phone)
	{
		this.progressPopup = Game.showPopup({title:"", content:"TXT_SMS_PAYMENT_WEB", okText:"TXT_OK"}, function() {});
		
		var btn = document.createElement("BUTTON");
		btn.innerHTML = "";
		btn.setAttribute("style","z-index:100;background-color:#00000000;position:absolute;top:0;left:0;width:100%;height:100%;padding:0;border:0;margin:0;");
		btn.addEventListener ("click", function() {
			fr.platformWrapper.sendSMS(data, phone);
			document.body.removeChild(btn);
			Payment.hideProgressPopup();
		});		
		document.body.appendChild(btn);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// br /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	showBRSms:function()
	{
		var uiDef =
		{
			btnClose:{onTouchEnded:this.hideBRSms.bind(this)},
			bgStep0:{visible:this.brSmsStep === 0},
			bgStep1:{visible:this.brSmsStep === 1},
			
			phoneNoTitle:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_BR_SMS_PHONE_NO", visible:this.selectedSMSChannel !== BR_SMS_TIM},
			phoneNoInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:this.brDefaultPhoneNo, placeHolder:"TXT_GIFTCODE_HINT", placeHolderColor:cc.color.BLACK, visible:this.selectedSMSChannel !== BR_SMS_TIM, enabled:this.brSmsStep === 0, listener:[this.onTextFieldTextChanged, this]},//web
			btnPhoneNoSubmit:{onTouchEnded:this.onBrSubmitPhoneNo.bind(this), visible:this.selectedSMSChannel !== BR_SMS_TIM, enabled:this.brSmsStep === 0},
			lblPhoneNoSubmit:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_BR_SMS_SUMBMIT_PHONE_NO", visible:this.selectedSMSChannel !== BR_SMS_TIM},
			phoneNoBg:{visible:this.selectedSMSChannel !== BR_SMS_TIM},
			
			sendSMSTitle:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_BR_SMS_SEND_TITLE", visible:this.selectedSMSChannel === BR_SMS_TIM},
			btnSendSMS:{onTouchEnded:this.onBrSendSms.bind(this), visible:this.selectedSMSChannel === BR_SMS_TIM, enabled:this.brSmsStep === 0},
			lblSendSMS:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_BR_SMS_SEND_BUTTON", visible:this.selectedSMSChannel === BR_SMS_TIM},
			
			otpTitle:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_BR_SMS_OTP"},
			otpInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"", placeHolder:"TXT_GIFTCODE_HINT", placeHolderColor:cc.color.BLACK, enabled:this.brSmsStep === 1, listener:[this.onTextFieldTextChanged, this]},//web
			btnOtpSubmit:{onTouchEnded:this.onBrSubmitOtp.bind(this), enabled:this.brSmsStep === 1},
			lblOtpSubmit:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_BR_SMS_SUMBMIT_OTP"},
		};
		
		var widget = FWUI.showWithData(UI_PAYMENT_BR_SMS, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		
		if(!this.hideFuncBrSms)
			this.hideFuncBrSms = function() {this.hideBRSms()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncBrSms);
		
		if(!this.phoneNoInput)
		{
			this.phoneNoInput = FWUtils.getChildByName(widget, "phoneNoInput");
			//web this.phoneNoInput.addEventListener(this.onTextFieldTextChanged, this);
			this.btnPhoneNoSubmit = FWUtils.getChildByName(widget, "btnPhoneNoSubmit");
			this.otpInput = FWUtils.getChildByName(widget, "otpInput");
			//web this.otpInput.addEventListener(this.onTextFieldTextChanged, this);
			this.btnOtpSubmit = FWUtils.getChildByName(widget, "btnOtpSubmit");
			this.btnSendSMS = FWUtils.getChildByName(widget, "btnSendSMS");
		}
	},
	
	hideBRSms:function()
	{
		Game.gameScene.unregisterBackKey(this.hideFuncBrSms);
		FWUI.hide(UI_PAYMENT_BR_SMS);
	},
	
	onBrSubmitPhoneNo:function(sender)
	{
		this.brDefaultPhoneNo = this.phoneNoInput.getString();
		cc.sys.localStorage.setItem("brDefaultPhoneNo", this.brDefaultPhoneNo);
		this.btnPhoneNoSubmit.setEnabled(false);
		this.brUsePhoneNo = true;
		
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentBrazilCreate);
		pk.pack(this.selectedSMSChannel, this.selectedItem.ID, this.offerId, this.brDefaultPhoneNo);
		network.connector.client.sendPacket(pk);
	},
	
	onBrSubmitPhoneNoResult:function(error, channel, item, phone, syntax)
	{
		if(!error)
		{
			this.brSmsStep = 1;
			this.showBRSms();
			this.btnOtpSubmit.setEnabled(false);
		}
		else
		{
			Payment.showErrorPopup(error);
			this.btnPhoneNoSubmit.setEnabled(true);
		}
	},
	
	onBrSubmitOtp:function(sender)
	{
		// feedback
		this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});
		
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentBrazilProcess);
		pk.pack(this.otpInput.getString());
		network.connector.client.sendPacket(pk);
		
		this.brSmsStep = 2;
		this.hideBRSms();
	},
	
	onBrSendSms:function(sender)
	{
		this.btnSendSMS.setEnabled(false);
		this.brUsePhoneNo = false;
		
		var pk = network.connector.client.getOutPacket(Payment.RequestPaymentBrazilCreate);
		pk.pack(this.selectedSMSChannel, this.selectedItem.ID, this.offerId, "");
		network.connector.client.sendPacket(pk);
	},
	
	onBrSendSmsResult:function(error, channel, item, phone, syntax)
	{
		if(!error)
		{
			this.brSmsStep = 1;
			this.showBRSms();
			this.btnOtpSubmit.setEnabled(false);
			fr.platformWrapper.sendSMS(syntax, phone);
		}
		else
		{
			Payment.showErrorPopup(error);
			this.btnSendSMS.setEnabled(true);
		}
	},
	
	onTextFieldTextChanged:function(sender, type)
	{
		var name = sender.getName();
		var button = null;
		if(name === "phoneNoInput")
			button = this.btnPhoneNoSubmit;
		else if(name === "otpInput")
			button = this.btnOtpSubmit;
		
		var inputString = sender.getString();
		if(inputString === "")
			button.setEnabled(false);
		else
			button.setEnabled(true);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// SEA ////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	getSEAChannels: function (paymentType)
	{
		var list = null;
		switch (paymentType)
		{
			case defineTypes.SUB_TYPE_SMS: list = g_PAYMENT_MM.ACTIVE_SMS; break;
			case defineTypes.SUB_TYPE_CARD: list = g_PAYMENT_MM.ACTIVE_CARD; break;
			case defineTypes.SUB_TYPE_WALLET: list = g_PAYMENT_MM.ACTIVE_WALLET; break;
			case defineTypes.SUB_TYPE_BANKING: list = g_PAYMENT_MM.ACTIVE_BANKING; break;
		}

		return list;
	},

	showSEASms:function(sender, type)
	{
	},

	showSEACardInput:function(uiDef)
	{
		cc.log ("Payment", "showSEACardInput");

		if (!this.currentSEAChannel)
			this.currentSEAChannel = this.selectedItem.CHANNEL [0];

		var icon = this.channelToIcon (this.currentSEAChannel);
		var onChannel = function(sender1) {this.showSEAChannel (function(sender2) {this.onSEACardChange(sender2);}.bind(this));}.bind(this);

		uiDef.zingCard = {visible:false};
		uiDef.seaCard = {visible:true};
		uiDef.lblSEACardChannelChoose = {type:UITYPE_TEXT, value:"TXT_PAYMENT_SEA_CARD_CHOOSE", style:TEXT_STYLE_TEXT_NORMAL};
		uiDef.logoSEACardChannel = {type:UITYPE_IMAGE, value:icon, scale: 0.6, onTouchEnded: onChannel};
		uiDef.btnSEACardChange = {visible:true, onTouchEnded: onChannel};
		uiDef.lblSEACardNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_NUM", style:TEXT_STYLE_TEXT_NORMAL};
		uiDef.inputSEACardNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_GIFTCODE_HINT", placeHolderColor: cc.color.BLACK};
		uiDef.lblSEACharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};
		uiDef.cardChannelBg = {onTouchEnded: onChannel};
		uiDef.btnSEACharge = {onTouchEnded:this.chargeSEACard.bind(this)};
	},

	showSEAChannel:function(onSelected)
	{
		cc.log ("Payment", "showSEACardChange", JSON.stringify (this.selectedItem));
		if (!this.selectedItem)
			return;

		var channelItems = [];
		var list = this.getSEAChannels (this.selectedItem.SUB_TYPE);
		if (!list)
			return;

		for(var i in this.selectedItem.CHANNEL)
		{
			var channel = this.selectedItem.CHANNEL[i];
			if (list.indexOf [channel] !== -1)
				channelItems.push({
					channel: channel,
					type: this.selectedItem.SUB_TYPE,
					icon: this.channelToIcon(channel),
				});
		}

		var onTouchItem = function(sender) {
			if (onSelected)
				onSelected (sender);

			this.hideSEACardChange (sender);
		}.bind(this);

		var channelItemDef =
		{
			item:{onTouchEnded:onTouchItem},
			sprite:{type:UITYPE_IMAGE, field:"icon", visible:true},
			amount:{visible:false},
		};

		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_CHANNEL", style:TEXT_STYLE_TITLE_2},
			closeButton:{onTouchEnded:this.hideSEACardChange.bind (this)},
			itemList:{type:UITYPE_2D_LIST, items:channelItems, itemUI:UI_ITEM_NO_BG2, itemDef:channelItemDef, itemSize:cc.size(150, 100), itemsAlign:"center", singleLine:true},
		};
		
		var widget = FWUI.showWithData(UI_PAYMENT_CHOOSE_CHANNEL, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
	},
	
	hideSEACardChange:function(sender)
	{
		FWUI.hide(UI_PAYMENT_CHOOSE_CHANNEL, UIFX_POP);
	},
	
	onSEACardChange:function(sender)
	{
		cc.log ("Payment", "onSEACardChange", JSON.stringify (sender.uiData));

		var widget = FWPool.getNode(UI_PAYMENT, false);
		if(widget && FWUI.isWidgetShowing(widget))
		{
			this.currentSEAChannel = sender.uiData.channel;
			var icon = sender.uiData.icon;
			
			var uiDef = {
				logoSEACardChannel: {type:UITYPE_IMAGE, value:icon, scale: 0.6}
			};

			FWUI.fillData(widget, null, uiDef);
		}
	},

	chargeSEACard:function(sender)
	{
		var uiPayment = FWPool.getNode(UI_PAYMENT, false);
		var inputCardNum = FWUtils.getChildByName(uiPayment, "inputSEACardNum");
		var cardNum = inputCardNum.getString();
		var itemId = this.data[this.currentTab][this.currentSubTab][0].ID;

		switch (COUNTRY)
		{
			case COUNTRY_MYANMAR:
			case COUNTRY_THAILAND:
			case COUNTRY_PHILIPPINE:
			{
				var channelNo = this.currentSEAChannel;
				var cardNo = cardNum;
				var cardPin = "";
				var priceLocal = 0;
				var priceVnd = 0;

				cc.log ("Payment", "chargeSEACard", "callCard", channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, this.offerId);
				PaymentLibHandle.callCard (channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, this.offerId);
			}
			return;

			default:
				cc.log ("Payment", "chargeSEACard", "invalid", COUNTRY);
		}
	},

	chargeSEAWallet:function()
	{
		if (!this.selectedItem)
			return;

		this.showSEAChannel (function(sender) {
			var channelNo = sender.uiData.channel;
			switch (COUNTRY)
			{
				case COUNTRY_MYANMAR:
				case COUNTRY_THAILAND:
				case COUNTRY_PHILIPPINE:
				{
					var phoneNo = "";
					var priceLocal = this.selectedItem.PRICE_LOCAL;
					var priceVnd = this.selectedItem.PRICE_VND;
					var itemId = this.selectedItem.ID;
					var offerId = this.offerId;

					cc.log ("Payment", "chargeSEAWallet", "callWallet", channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
					PaymentLibHandle.callWallet (channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
				}
				return;

				default:
					cc.log ("Payment", "chargeSEAWallet", "invalid", COUNTRY);
			}
		}.bind(this));
	},

	chargeSEABanking:function()
	{
		if (!this.selectedItem)
			return;

		this.showSEAChannel (function(sender) {
			var channelNo = sender.uiData.channel;
			switch (COUNTRY)
			{
				case COUNTRY_MYANMAR:
				case COUNTRY_THAILAND:
				case COUNTRY_PHILIPPINE:
				{
					var phoneNo = "";
					var priceLocal = this.selectedItem.PRICE_LOCAL;
					var priceVnd = this.selectedItem.PRICE_VND;
					var itemId = this.selectedItem.ID;
					var offerId = this.offerId;
					
					cc.log ("Payment", "chargeSEABanking", "callIBanking", channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
					PaymentLibHandle.callIBanking (channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
				}
				return;
				
				default:
					cc.log ("Payment", "chargeSEABanking", "invalid", COUNTRY);
			}
		}.bind(this));
	},

///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	ResponseUpdateCoin:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				Payment.showErrorPopup(this.getError());
			else if(FWUtils.getCurrentScene() === Game.gameScene)
			{
				// popup
				Payment.hideProgressPopup();
				Congrats.show("TXT_PAYMENT_SUCCESS");// jira#5163 //Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_SUCCESS"}, function() {});
				
				var object = PacketHelper.parseObject(this);
				var incGold = object[KEY_GOLD] - gv.userData.getGold();
				var incCoin = object[KEY_COIN] - gv.userData.getCoin();
				var pos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
				if(incGold > 0)
					Game.addItems([{itemId:ID_GOLD, amount:incGold}], pos);
				if(incCoin > 0)
					Game.addItems([{itemId:ID_COIN, amount:incCoin}], pos);
				
				Game.updateUserDataFromServer(object);
				Payment.updatePaymentDataFromServer(object[KEY_PAYMENT]);//gv.userData.game[GAME_PAYMENT] = object[KEY_PAYMENT];
				MailBox.updateMailBoxDataFromServer(gv.userData, object[KEY_MAIL_BOX]);//gv.userData.mailBox = object[KEY_MAIL_BOX];
				if(FWUI.isShowing(UI_MAILBOX))
					MailBox.show();
				else
					Game.refreshUIMain(RF_UIMAIN_MAIL);

				// moved to Payment.updatePaymentDataFromServer
				// update offer
				//if (object[KEY_PAYMENT] [PAYMENT_REPEAT_OFFERS] || object[KEY_PAYMENT] [PAYMENT_OFFERS])
				//{
				//	Payment.data[PAYMENT_TAB_OFFER][PAYMENT_SUBTAB_OFFERS] = gv.offerPanel.list ();
				//	gv.offerPanel.updateCheckTime ();
				//}

				// refresh
				if(FWUI.isShowing(UI_PAYMENT))
					Payment.refresh ();
			}
			else
				Game.updateUserDataFromServer(object);
		}
	}),	

	RequestPaymentCardSubmit:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_CARD_SUBMIT);},
		pack:function(channel, serial, code, itemId, offerId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_CARD_SERIAL, serial);
			PacketHelper.putString(this, KEY_CARD_CODE, code);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			if (offerId)
				PacketHelper.putString(this, KEY_OFFER, offerId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentCardSubmit:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0 && this.getError() !== ERROR_PROCESSING)
				Payment.showErrorPopup(this.getError());
		}
	}),
	
	RequestPaymentSmsReg:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_SMS_REG);},
		pack:function(channel, itemId, offerId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			if (offerId)
				PacketHelper.putString(this, KEY_OFFER, offerId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentSmsReg:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			cc.log("Payment::ResponsePaymentSmsReg: error=" + this.getError());
			if(this.getError() !== 0)
				Payment.showErrorPopup(this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				cc.log("Payment::ResponsePaymentSmsReg: KEY_PHONE=" + object[KEY_PHONE] + " KEY_DATA=" + object[KEY_DATA]);
				if(cc.sys.isNative)
					fr.platformWrapper.sendSMS(object[KEY_DATA], object[KEY_PHONE]);
				else
					Payment.showWebSMSConfirm(object[KEY_DATA], object[KEY_PHONE]);
				
			}
		}
	}),
	
	RequestPaymentAtmReg:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_ATM_REG);},
		pack:function(channel, itemId, offerId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			if (offerId)
				PacketHelper.putString(this, KEY_OFFER, offerId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentAtmReg:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				Payment.showErrorPopup(this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				if(cc.sys.isNative)
					cc.sys.openURL(object[KEY_DATA]);
				else
					Payment.showWebATMConfirm(object[KEY_DATA]);
			}
		}
	}),	
	
	RequestPaymentGoogleCheck:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_GOOGLE_CHECK);},
		pack:function(itemId, offerId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			if (offerId)
				PacketHelper.putString(this, KEY_OFFER, offerId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentGoogleCheck:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				Payment.showErrorPopup(this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				gv.userData.game[GAME_PAYMENT] = object[KEY_PAYMENT];
				Payment.onIapCheckOk();
			}
		}
	}),		
	
	RequestPaymentGoogleSubmit:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(512); this.setCmdId(gv.CMD.PAYMENT_GOOGLE_SUBMIT);},
		pack:function(channel, data, sign, offerId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_DATA, data);
			PacketHelper.putString(this, KEY_SIGN, sign);
			if (offerId)
				PacketHelper.putString(this, KEY_OFFER, offerId);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentGoogleSubmit:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			if(object[KEY_FINISH] === true)
				googleIap.finishTransactions(Payment.iapPurchaseData, Payment.iapSignature);
			
			if(this.getError() !== 0)
				Payment.showErrorPopup(this.getError());
			
			googleIap._setStateFinishProcessPurchase();
		}
	}),			
	
	RequestPaymentBrazilCreate:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_BRAZIL_CREATE);},
		pack:function(channel, itemId, offer, phone)
		{
			cc.log("Payment::RequestPaymentBrazilCreate: channel=" + channel + " itemId=" + itemId + " offer=" + offer + " phone=" + phone);
			phone = Payment.modifyPhoneNumber(phone);
			cc.log("modifyPhoneNumber: " + phone);
			
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_CHANNEL, channel);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			PacketHelper.putString(this, KEY_OFFER, offer);
			PacketHelper.putString(this, KEY_PHONE, phone);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentBrazilCreate:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Payment::ResponsePaymentBrazilCreate: error=" + this.getError() + " data=" + JSON.stringify(object));
			
			if(Payment.brUsePhoneNo)
				Payment.onBrSubmitPhoneNoResult(this.getError(), object[KEY_CHANNEL], object[KEY_ITEM_ID], object[KEY_PHONE], object[KEY_DATA]);
			else
				Payment.onBrSendSmsResult(this.getError(), object[KEY_CHANNEL], object[KEY_ITEM_ID], object[KEY_PHONE], object[KEY_DATA]);
		}
	}),			
	
	RequestPaymentBrazilProcess:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PAYMENT_BRAZIL_PROCESS);},
		pack:function(otp)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_OTP, otp);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePaymentBrazilProcess:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError())
				Payment.showErrorPopup(this.getError());
		}
	}),	
};

network.packetMap[gv.CMD.UPDATE_COIN] = Payment.ResponseUpdateCoin;
network.packetMap[gv.CMD.PAYMENT_CARD_SUBMIT] = Payment.ResponsePaymentCardSubmit;
network.packetMap[gv.CMD.PAYMENT_SMS_REG] = Payment.ResponsePaymentSmsReg;
network.packetMap[gv.CMD.PAYMENT_ATM_REG] = Payment.ResponsePaymentAtmReg;
network.packetMap[gv.CMD.PAYMENT_GOOGLE_CHECK] = Payment.ResponsePaymentGoogleCheck;
network.packetMap[gv.CMD.PAYMENT_GOOGLE_SUBMIT] = Payment.ResponsePaymentGoogleSubmit;
network.packetMap[gv.CMD.PAYMENT_BRAZIL_CREATE] = Payment.ResponsePaymentBrazilCreate;
network.packetMap[gv.CMD.PAYMENT_BRAZIL_PROCESS] = Payment.ResponsePaymentBrazilProcess;


