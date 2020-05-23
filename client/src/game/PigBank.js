
const TAB_NONE = -1;
const TAB_PIGBANK_MAIN = 0;
const TAB_PIGBANK_PAYMENT = 1;
const TAB_VIP_SYSTEM_MAIN =2;
const TAB_VIP_PAYMENT = 3;


const SUBTAB_PIGBANK_VIP_NONE = -1;
const SUBTAB_PIGBANK_VIP_IAP = 0;
const SUBTAB_PIGBANK_VIP_COIN2GOLD = 1;
const SUBTAB_PIGBANK_VIP_SMS = 2;
const SUBTAB_PIGBANK_VIP_CARD = 3;
const SUBTAB_PIGBANK_VIP_ATM = 4;
const SUBTAB_PIGBANK_VIP_WALLET = 5;
const SUBTAB_PIGBANK_VIP_BANKING = 6;
const SUBTAB_PIGBANK_VIP_CREDIT = 7;
const SUBTABS_PIGBANK_VIP_COUNT = 8;
const SUBTAB_PIGBANK_VIP_BANK = 9;



const PIGBANK_MILESTONE_W = 320;
//const EVENT_POINTER_Y = 23;
const PIGBANK_POINTER_OFFX = 0;


var eventPigBank = {};
eventPigBank.mileStoneDiamond = [g_MISCINFO.PIG_MILESTONE_MIN,g_MISCINFO.PIG_MILESTONE_MAX];
eventPigBank.money = g_MISCINFO.PIG_PRICE;
eventPigBank.START_TIME = g_MISCINFO.PIG_TIME_START;
eventPigBank.END_TIME = g_MISCINFO.PIG_TIME_END;
eventPigBank.UNIX_START_TIME = g_MISCINFO.PIG_TIME_START;
eventPigBank.UNIX_END_TIME = g_MISCINFO.PIG_TIME_END;
var currentDiamond = -1;

var positionTabInUI = {};
positionTabInUI.positionTabVip=cc.p(221,586);

positionTabInUI.positionMain =cc.p(270,585);
//positionTabInUI.position1 = { tabOn:cc.p(405,586),tabOff:cc.p(405,591)};
//positionTabInUI.position2 = { tabOn:cc.p(545,586),tabOff:cc.p(537,591)};
//
//positionTabInUI.positionTabOfferOn = cc.p(270,585);
//positionTabInUI.positionTabOfferOff = cc.p(270,591);
//positionTabInUI.positionTabPigBankOn = cc.p(405,586);
//positionTabInUI.positionTabPigBankOff = cc.p(405,591);
//positionTabInUI.positionTabVipOn = cc.p(545,586);
//positionTabInUI.positionTabVipOff = cc.p(537,591);

var positionTab=[];
positionTab[0] = { tabOn:cc.p(270,585),tabOff:cc.p(270,591)};
positionTab[1] = { tabOn:cc.p(405,586),tabOff:cc.p(405,591)};
positionTab[2] = { tabOn:cc.p(545,586),tabOff:cc.p(537,591)};


var imgIconVip = {};
imgIconVip.OFFER_VIP_0 = "hud/hud_vip_systems_icon_bean1.png";
imgIconVip.OFFER_VIP_1 = "hud/hud_vip_systems_icon_bean2.png";
imgIconVip.OFFER_VIP_2 = "hud/hud_vip_systems_icon_bean3.png";
imgIconVip.OFFER_VIP_3 = "hud/hud_vip_systems_icon_bean1.png";
imgIconVip.OFFER_VIP_4 = "hud/hud_vip_systems_icon_bean2.png";
imgIconVip.OFFER_VIP_5 = "hud/hud_vip_systems_icon_bean3.png";

var imgIconBuffVip ={};
imgIconBuffVip.OFFER_VIP_0 = "hud/icon_buff_vip1.png";
imgIconBuffVip.OFFER_VIP_1 = "hud/icon_buff_vip2.png";
imgIconBuffVip.OFFER_VIP_2 = "hud/icon_buff_vip3.png";
imgIconBuffVip.OFFER_VIP_3 = "hud/icon_buff_vip1.png";
imgIconBuffVip.OFFER_VIP_4 = "hud/icon_buff_vip2.png";
imgIconBuffVip.OFFER_VIP_5 = "hud/icon_buff_vip3.png";

var imgFrameVip ={};
imgFrameVip.OFFER_VIP_0 = "hud/icon_vip_03.png";
imgFrameVip.OFFER_VIP_1 = "hud/icon_vip_02.png";
imgFrameVip.OFFER_VIP_2 = "hud/icon_vip_01.png";
imgFrameVip.OFFER_VIP_3 = "hud/icon_vip_03.png";
imgFrameVip.OFFER_VIP_4 = "hud/icon_vip_02.png";
imgFrameVip.OFFER_VIP_5 = "hud/icon_vip_01.png";

var priceVip = {};
priceVip.OFFER_VIP_0 = 50000;
priceVip.OFFER_VIP_1 = 200000;
priceVip.OFFER_VIP_2 = 400000;



var PigBank={

    currentTab: TAB_NONE,
    currentSubTab: SUBTAB_PIGBANK_VIP_NONE,
    data: null,
    hasLocalPayment: false,
    enoughDiamond: false,
    isTabPigBank :false,
    isSubTabPayMent :false,
    hasValueSmSInTabVip: true,
    isChargeATM :false, // jira 6277
    beforeTab:null,
    priceVip: null,
    pricePig:null,
    showingPayment:false,
    ctor:function()
    {
        this.currentSubTab = SUBTAB_PIGBANK_VIP_NONE;
    },

	resourcesLoaded: false,
    show:function(){
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
		
        if(!this.priceVip)
        {
            var itemList = [];

            for(var key in g_VIP.VIP_ITEMS)
            {
                if(key=== VIP_INACTIVE) continue;
                itemList.push({key:key});
            }

            this.priceVip={};
            for (var key in g_PAYMENT_DATA.OFFERS) {
                for (var i = 0; i < itemList.length; i++) {
                    if (g_PAYMENT_DATA.OFFERS[key].ID === itemList[i].key) {
                        this.priceVip[itemList[i].key] = g_PAYMENT_DATA.OFFERS[key].PRICE_LOCAL;
                    }
                }
            }
        }
        if(!this.pricePig)
        {
            this.pricePig= 0;
            for (var key in g_PAYMENT_DATA.OFFERS) {
                if (g_PAYMENT_DATA.OFFERS[key].ID === OFFER_PIG_BANK) {
                    this.pricePig = g_PAYMENT_DATA.OFFERS[key].PRICE_LOCAL;
                }
            }
        }
        cc.log("[PIGBANK] price pigbank :",this.pricePig);
        cc.log("[Vip] price vip :",JSON.stringify(this.priceVip));
        currentDiamond = gv.userData.currentDiamond;
        this.enoughDiamond = currentDiamond>= g_MISCINFO.PIG_MILESTONE_MIN;

        var widget = FWPool.getNode(UI_PIGBANK, false);
        cc.log("PigBank_VIP : show "+ FWUI.isWidgetShowing(widget));

        this.hasValueSmSInTab = true;
        this.hasValueAppStore = true;
        this.hasValueATM = true;
        this.hasValueWallet = true;
        this.hasValueBanking = true;
        this.hasValueCredit = true;

        if(!this.isTabPigBank)
        {
            if(this.dataVip)
            {
                if(this.dataVip[SUBTAB_PIGBANK_VIP_SMS].length === 0) this.hasValueSmSInTab = false;
                if(this.dataVip[SUBTAB_PIGBANK_VIP_IAP].length === 0)  this.hasValueAppStore = false;
                if(this.dataVip[SUBTAB_PIGBANK_VIP_ATM].length === 0)  this.hasValueATM = false;
                if(this.dataVip[SUBTAB_PIGBANK_VIP_WALLET].length === 0)  this.hasValueWallet = false;
                if(this.dataVip[SUBTAB_PIGBANK_VIP_BANKING].length === 0)  this.hasValueBanking = false;
                if(this.dataVip[SUBTAB_PIGBANK_VIP_CREDIT].length === 0)  this.hasValueCredit = false;
            }
        }
        else
        {
            if(this.dataPig)
            {
                if(this.dataPig[SUBTAB_PIGBANK_VIP_SMS].length === 0) this.hasValueSmSInTab = false;
                if(this.dataPig[SUBTAB_PIGBANK_VIP_IAP].length === 0)  this.hasValueAppStore = false;
                if(this.dataPig[SUBTAB_PIGBANK_VIP_ATM].length === 0)  this.hasValueATM = false;
                if(this.dataPig[SUBTAB_PIGBANK_VIP_WALLET].length === 0)  this.hasValueWallet = false;
                if(this.dataPig[SUBTAB_PIGBANK_VIP_BANKING].length === 0)  this.hasValueBanking = false;
                if(this.dataPig[SUBTAB_PIGBANK_VIP_CREDIT].length === 0)  this.hasValueCredit = false;
            }
        }

        //tabs
        var hasSMS = (g_PAYMENT_DATA.ACTIVE_SMS.length > 0);//g_PAYMENT_DATA.ACTIVE_SMS_MOBI || g_PAYMENT_DATA.ACTIVE_SMS_VINA || g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL;
        var hasZingCard =  g_PAYMENT_DATA.ACTIVE_CARD_ZING || g_PAYMENT_DATA.ACTIVE_CARD.length > 0;
        var hasATM = g_PAYMENT_DATA.ACTIVE_ATM;
        var hasWallet = g_PAYMENT_DATA.ACTIVE_WALLET.length > 0;
        var hasBanking = g_PAYMENT_DATA.ACTIVE_BANKING.length > 0;
        var hasCredit = (g_PAYMENT_DATA.ACTIVE_CREDIT && g_PAYMENT_DATA.ACTIVE_CREDIT.length > 0);

        var butttonListFile = [
            {NAME:"btnAppStore",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_IAP,VISIBLE:Payment.hasIAP&& this.hasValueAppStore ,SUBTAB:PAYMENT_SUBTAB_IAP},
            {NAME:"btnSMS",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_SMS,VISIBLE: hasSMS && Payment.hasLocalPayment && this.hasValueSmSInTab,SUBTAB:PAYMENT_SUBTAB_SMS},
            {NAME:"btnZingCard",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_CARD,VISIBLE:hasZingCard && Payment.hasLocalPayment,SUBTAB:PAYMENT_SUBTAB_CARD},
            {NAME:"btnATM",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_ATM,VISIBLE:hasATM && Payment.hasLocalPayment&& this.hasValueATM && COUNTRY === COUNTRY_VIETNAM,SUBTAB:PAYMENT_SUBTAB_ATM},
            {NAME:"btnWallet",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_WALLET,VISIBLE:hasWallet && Payment.hasLocalPayment&& this.hasValueWallet,SUBTAB:PAYMENT_SUBTAB_WALLET},
            {NAME:"btnBanking",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_BANKING,VISIBLE:hasBanking && Payment.hasLocalPayment&& this.hasValueBanking,SUBTAB:PAYMENT_SUBTAB_BANKING},
            {NAME:"btnCredit",DISPLAY:g_PAYMENT_DATA.DISPLAY_TAB_CREDIT,VISIBLE:hasCredit && Payment.hasLocalPayment&& this.hasValueCredit,SUBTAB:PAYMENT_SUBTAB_CREDIT},
        ];
        butttonListFile.sort(function (a, b) {
            return a.DISPLAY - b.DISPLAY;
        });
        var y = 440;
        var offY = -75;
        for(var i=0; i<butttonListFile.length; i++)
        {
            var name = butttonListFile[i].NAME;
            var visibleCondition = butttonListFile[i].VISIBLE;
            var subTab = butttonListFile[i].SUBTAB;


            var onButton = FWUtils.getChildByName(widget, name + "On");
            var offButton = FWUtils.getChildByName(widget, name + "Off");
            var isVisible = visibleCondition ;

            if(this.currentSubTab == SUBTAB_PIGBANK_VIP_NONE && isVisible) this.currentSubTab = subTab;
            var isOn = (this.currentSubTab === subTab );
            if(isOn)
            {
                if(!isVisible) {
                    this.currentSubTab = SUBTAB_PIGBANK_VIP_NONE;
                    this.show();
                    return;
                }
            }
            cc.log("PigBank currentSubTab",this.currentSubTab,subTab,isVisible);
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

        // main ui

        this.isTabPigBank = this.currentTab === TAB_PIGBANK_MAIN;

        var uiDef =
        {
            backButton:{onTouchEnded:this.backScreen.bind(this), visible:!this.isSubTabPayMent},
            backButton2:{onTouchEnded:this.backScreen.bind(this), visible:this.isSubTabPayMent},

            tabOfferOn:{position :offerPosition.tabOn , visible: false },
            tabOfferOff:{position :offerPosition.tabOff , visible: this.isSubTabPayMent&&offerPosition.isActive,onTouchEnded:this.changeTab.bind(this)},
            tabPigBankOn:{position :this.isTabPigBank&&!this.isSubTabPayMent? positionTabInUI.positionMain: pigPosition.tabOn , visible: this.isTabPigBank&&pigPosition.isActive},
            tabPigBankOff:{ visible: !this.isTabPigBank&&this.isSubTabPayMent&&pigPosition.isActive,position:pigPosition.tabOff,onTouchEnded:this.changeTab.bind(this)},
            tabVipOn:{position :!this.isTabPigBank&&!this.isSubTabPayMent? positionTabInUI.positionTabVip: vipPosition.tabOn , visible: !this.isTabPigBank&&vipPosition.isActive},
            tabVipOff:{visible: this.isTabPigBank&&this.isSubTabPayMent&&vipPosition.isActive,position:vipPosition.tabOff,onTouchEnded:this.changeTab.bind(this)},

            lblTabOfferOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_OFFER", style:TEXT_STYLE_TEXT_NORMAL},
            lblTabOfferOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_OFFER", style:TEXT_STYLE_TEXT_NORMAL},
            lblTabPigBankOn:{type:UITYPE_TEXT, value:"TXT_PIGBANK", style:TEXT_STYLE_TEXT_NORMAL},
            lblTabPigBankOff:{type:UITYPE_TEXT, value:"TXT_PIGBANK", style:TEXT_STYLE_TEXT_NORMAL},

            lblTabVipOn:{type:UITYPE_TEXT, value:"TXT_VIP", style:TEXT_STYLE_TEXT_NORMAL},
            lblTabVipOff:{type:UITYPE_TEXT, value:"TXT_VIP", style:TEXT_STYLE_TEXT_NORMAL},

            //type:UITYPE_TEXT, field:"points", style:TEXT_STYLE_TEXT_NORMAL
            panelVipSystem:{visible: !this.isTabPigBank&&!this.isSubTabPayMent},
            panelMainPigBank:{visible: this.isTabPigBank&&!this.isSubTabPayMent},
            panelPaymentPigBank:{visible: this.isSubTabPayMent},
            btnBuy:{onTouchEnded:this.buy.bind(this),enabled:this.enoughDiamond},
            btnAppStoreOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnSMSOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnZingCardOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnATMOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnWalletOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnBankingOff:{onTouchEnded:this.changeSubTab.bind(this)},
            btnCreditOff:{onTouchEnded:this.changeSubTab.bind(this)},

            imgNoteCurrentDiamond:{visible:this.isTabPigBank,position: this.isTabPigBank&&!this.isSubTabPayMent? cc.p(563,436):cc.p(568,479) ,scale:this.isTabPigBank&&!this.isSubTabPayMent ? cc.p(1.8,1.6):cc.p(1.56,1.23)},
            lblCurrentDiamond:{type:UITYPE_TEXT, value:currentDiamond.toString(), style:TEXT_STYLE_TEXT_NORMAL},
            lblMoney:{type:UITYPE_TEXT, value:this.formatPriceWithCoutry(this.pricePig), style:TEXT_STYLE_TEXT_BUTTON},
            lblBuy:{type:UITYPE_TEXT, value:this.formatPriceWithCoutry(this.pricePig), style:TEXT_STYLE_TEXT_BUTTON},

            infoButton:{onTouchEnded:this.showInfo.bind(this)},

            lblAppStoreOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_APP_STORE", style:TEXT_STYLE_TEXT_NORMAL},
            lblAppStoreOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_APP_STORE", style:TEXT_STYLE_TEXT_NORMAL},
            lblSMSOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_SMS", style:TEXT_STYLE_TEXT_NORMAL},
            lblSMSOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_SMS", style:TEXT_STYLE_TEXT_NORMAL},
            lblZingCardOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ZING_CARD", style:TEXT_STYLE_TEXT_NORMAL},
            lblZingCardOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ZING_CARD", style:TEXT_STYLE_TEXT_NORMAL},
            lblATMOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ATM", style:TEXT_STYLE_TEXT_NORMAL},
            lblATMOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_ATM", style:TEXT_STYLE_TEXT_NORMAL},

            lbWalletOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_WALLET", style:TEXT_STYLE_TEXT_SMALL},
            lbWalletOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_WALLET", style:TEXT_STYLE_TEXT_SMALL},
            lbBankingOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_BANKING", style:TEXT_STYLE_TEXT_SMALL},
            lbBankingOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_BANKING", style:TEXT_STYLE_TEXT_SMALL},
            lblCreditOn:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CREDIT", style:TEXT_STYLE_TEXT_SMALL},
            lblCreditOff:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CREDIT", style:TEXT_STYLE_TEXT_SMALL},

            lblNotifyMain:{type:UITYPE_TEXT, value:this.enoughDiamond ? "TXT_PIGBANK_NOTIFY":"TXT_PIGBANK_NOTIFY_NOTENOUGH", style:TEXT_STYLE_TEXT_NORMAL},
            lblNotifyPayment:{type:UITYPE_TEXT,visible:true, value:this.isTabPigBank? cc.formatStr(FWLocalization.text("TXT_PIGBANK_NOTIFY_PAYMENT"),this.formatPriceWithCoutry(this.pricePig)):cc.formatStr(FWLocalization.text("TXT_VIP_NOTIFY_PAYMENT"), this.formatPriceWithCoutry(this.priceVip[this.channelVip])), style:TEXT_STYLE_TEXT_NORMAL},
            //lblNotifyPayment:{type:UITYPE_TEXT, value:this.isTabPigBank? "TXT_PIGBANK_NOTIFY":"TXT_PIGBANK_NOTIFY", style:TEXT_STYLE_TEXT_NORMAL},
            timePigBank:{visible: this.isTabPigBank,type:UITYPE_TIME_BAR, startTime:gv.pigBankPanel.getTimeEvent().start, endTime:gv.pigBankPanel.getTimeEvent().end, countdown:true,onFinished: this.checkEndEventPigBank.bind(this)},

            imgPigBankBgOffer:{visible: this.isTabPigBank&&this.isSubTabPayMent, type:UITYPE_IMAGE, value:"common/images/hud_piggy_bank_bg_offers.png", isLocalTexture:true, discard:true},
            imgPigBankBg:{type:UITYPE_IMAGE, value:"common/images/hud_piggy_bank_bg.png", isLocalTexture:true, discard:true},

            //// VIP

            lblTitleVip:{type:UITYPE_TEXT, value:"TXT_VIP_TITLE_SYSTEM", style:TEXT_STYLE_TEXT_NORMAL },
            lblGold:{type:UITYPE_TEXT, value:"TXT_VIP_DONATE_GOLD", style:TEXT_STYLE_TEXT_NORMAL},
            lblGoldConvert:{type:UITYPE_TEXT, value:"TXT_VIP_GOLD_CONVERT", style:TEXT_STYLE_TEXT_NORMAL},
            lblGoldSupport:{type:UITYPE_TEXT, value:"TXT_VIP_GOLD_SUPPORT_DAILY", style:TEXT_STYLE_TEXT_NORMAL},
            lblUpdatePot:{type:UITYPE_TEXT, value:"TXT_VIP_UPDATE_POT_RATE", style:TEXT_STYLE_TEXT_NORMAL},
            lblHammer:{type:UITYPE_TEXT, value:"TXT_VIP_BLACK_SMITH_RATE", style:TEXT_STYLE_TEXT_NORMAL},
            lblAirShip:{type:UITYPE_TEXT, value:"TXT_VIP_AIRSHIP_GOLD_BONUS", style:TEXT_STYLE_TEXT_NORMAL},
            lblBug:{type:UITYPE_TEXT, value:"TXT_VIP_BUG_RATE", style:TEXT_STYLE_TEXT_NORMAL},

            panelGold:{onTouchBegan: function(sender) {this.showHint (widget, "goldHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "goldHint");}.bind(this), forceTouchEnd: true},//web
            panelGoldConvert:{onTouchBegan: function(sender) {this.showHint (widget, "goldConvertHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "goldConvertHint");}.bind(this), forceTouchEnd: true},//web
            panelGoldSupport:{onTouchBegan: function(sender) {this.showHint (widget, "goldSupportHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "goldSupportHint");}.bind(this), forceTouchEnd: true},//web
            panelUpdatePot:{onTouchBegan: function(sender) {this.showHint (widget, "updatePotHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "updatePotHint");}.bind(this), forceTouchEnd: true},//web
            panelHammer:{onTouchBegan: function(sender) {this.showHint (widget, "hammerHint").bind(this);}, onTouchEnded: function(sender) {this.hideHint (widget, "hammerHint");}.bind(this), forceTouchEnd: true},//web
            panelAirShip:{onTouchBegan: function(sender) {this.showHint (widget, "airShipHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "airShipHint");}.bind(this), forceTouchEnd: true},//web
            panelBug:{onTouchBegan: function(sender) {this.showHint (widget, "bugHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "bugHint");}.bind(this), forceTouchEnd: true},//web


            goldHintText:{type:UITYPE_TEXT, value:"TXT_VIP_DONATE_GOLD_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            goldConvertHintText:{type:UITYPE_TEXT, value:"TXT_VIP_GOLD_CONVERT_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            goldSupportHintText:{type:UITYPE_TEXT, value:"TXT_VIP_GOLD_SUPPORT_DAILY_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            updatePotHintText:{type:UITYPE_TEXT, value:"TXT_VIP_UPDATE_POT_RATE_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            hammerHintText:{type:UITYPE_TEXT, value:"TXT_VIP_BLACK_SMITH_RATE_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            airShipHintText:{type:UITYPE_TEXT, value:"TXT_VIP_AIRSHIP_GOLD_BONUS_HINT", style:TEXT_STYLE_TEXT_DIALOG},
            bugHintText:{type:UITYPE_TEXT, value:"TXT_VIP_BUG_RATE_HINT", style:TEXT_STYLE_TEXT_DIALOG},

            panelVipOffer:{visible:!this.isTabPigBank&&this.isSubTabPayMent},
            lblNotifyVip:{type:UITYPE_TEXT, value:"TXT_VIP_CONTENT_PAYMENT", style:TEXT_STYLE_TEXT_NORMAL},
            infoButtonVip:{onTouchEnded:this.showInfoVip.bind(this)},

            lblNotifyVipNote:{type:UITYPE_TEXT, value:"TXT_VIP_PAYMENT_NOTE", style:TEXT_STYLE_TEXT_NORMAL},
            imgBarMenuVip:{visible:!this.isTabPigBank&&this.isSubTabPayMent},
            //// END VIP
        };




        //// TEST LIST VIP
        if(!this.isTabPigBank&&!this.isSubTabPayMent)
        {
            this.showVipOptionList(uiDef);
        }

        //// END TEST VIP


        if(!this.isTabPigBank&&this.isSubTabPayMent)
        {
            this.showVipPayMent(uiDef);
        }


        if(!this.itemListATM)
        {
            this.itemListATM = FWUtils.getChildByName(widget, "itemListATM");
            //this.zingCard = FWUtils.getChildByName(widget, "zingCard");
            //this.firstChargeBg = FWUtils.getChildByName(widget, "firstChargeBg");

            this.itemListATM.setClippingEnabled(true);
        }

        if(this.isSubTabPayMent)
        {
            this.showingPayment = true;
        }
        else
        {
            this.showingPayment = false;
        }
        if(!this.showingPayment && hasSMS && Payment.hasLocalPayment )
        {
            this.currentSubTab = SUBTAB_PIGBANK_VIP_SMS;
        }
        //// TEST CONTROLBAR

        if(this.isTabPigBank) {
            cc.log("PigBank : show GiftList ");
            this.showGiftList(uiDef);
            FWUI.getChildByName(widget, "giftList").setScale(0.8, 0.8);


            //// END TEST CONTROLBAR

            ////FWUI.getChildByName(widget, "lblBuy").setString(FWUI.getChildByName(widget, "lblBuy").getString()+" VND");
            //FWUI.getChildByName(widget, "btnBuy").setEnabled(this.enoughDiamond);
            //
            //FWUI.getChildByName(widget, "lblNotifyMain").setString(this.enoughDiamond ? "TXT_PIGBANK_NOTIFY":"TXT_PIGBANK_NOTIFY_NOTENOUGH");
            //
            //cc.log("lblNotify :  " + FWUI.getChildByName(widget, "lblNotifyMain").getString());


            ////  ANIM NPC PIG
            if (!this.animPig) {
                this.animPig = new FWObject();
            }
            this.animPig.initWithSpine(SPINE_PIGBANK);
            this.animPig.setSkin("default");
            this.animPig.setAnimation(this.enoughDiamond ? "piggy_bank_funny" : "piggy_bank_sad", true);
            var npcPig = FWUI.getChildByName(widget, "npcPig");
            this.animPig.setParent(npcPig, 1);
            this.animPig.setPosition(npcPig.getContentSize().width / 2, npcPig.getContentSize().height / 2);
            this.animPig.setVisible(this.isTabPigBank);

            //// END ANIM

        }

        //// SHOW SUB TAB
        if(this.isSubTabPayMent)
        {
            if(this.currentSubTab === SUBTAB_PIGBANK_VIP_IAP)
                this.showSubTabAnother(uiDef);
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_SMS)
                this.showSubTabAnother(uiDef);
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_CARD)
                this.showCardInput(uiDef);
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_ATM)
                this.showSubTabATM(uiDef);
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_WALLET){
                this.showSubTabAnother(uiDef);
            }
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_BANKING){
                this.showSubTabAnother(uiDef);
            }
            else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_CREDIT ){
                this.showSubTabAnother(uiDef);
            }
        }


            //this.showItems(uiDef);
        //// END SHOW SUB TAB


        // show
        if(FWUI.isWidgetShowing(widget))
            FWUI.fillData(widget, null, uiDef);
        else
        {
            FWUtils.showDarkBg(null, Z_UI_PAYMENT - 1, "darkBgPigBank");
            FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
            widget.setLocalZOrder(Z_UI_PAYMENT);

            AudioManager.effect (EFFECT_POPUP_SHOW);

            if(!this.hideFunc)
                this.hideFunc = function() {this.hide()}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc);
        }
        this.itemListATM.scrollToPercentVertical(0, 0.01, false);

    },
    showHint:function(widget, name, show)//web showHint:function(widget, name, show = true)
    {
		if(show === undefined)
			show = true;
		
        var hint = FWUtils.getChildByName(widget, name);
        //if(name === "lblTitleVip"){ cc.log("NAM TESTT~~~ ");}
        if(show)
        {
            hint.setVisible(true);

        }
        else
        {
            hint.setVisible(false);
        }
    },

    hideHint:function(widget, name)
    {
        this.showHint(widget, name, false);
    },
    showVipPayMent:function(uiDef)
    {
        //var firstChargeItems = {GOLD:2000000,M13:5,M12:5,M15:6,M11:6,M18:6};

        //var data = null;
        //for (var i in g_PAYMENT_DATA.OFFERS)
        //{
        //    if (g_PAYMENT_DATA.OFFERS [i].ID === this.channelVip)
        //    {
        //        data = g_PAYMENT_DATA.OFFERS [i];
        //        break;
        //    }
        //}
        //
        //if (!data)
        //    return null;

        //var price = data.PRICE_VND;
        var items = this.data[this.channelVip].REWARDS;

        var totalRewards =_.clone(items);
        var duration=  g_VIP.VIP_ITEMS[this.channelVip].DURATION;
        var itemsRewardDaily = g_VIP.VIP_ITEMS[this.channelVip].DAILY_LOGIN_REWARD;

        for(var key in itemsRewardDaily)
        {
            if(items[key]!= null)
            {
                totalRewards[key]= items[key]+ itemsRewardDaily[key]*duration;
            }
            else
            {
                totalRewards[key]=itemsRewardDaily[key]*duration;
            }
        }

        var firstChargeItems = FWUtils.getItemsArray(totalRewards);
        var firstChargeItemDef =
        {
            gfx:{type:UITYPE_ITEM, field:"itemId"},
            amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, useK:true, visible:true},
        };


        uiDef.firstChargeItems={visible:true, type:UITYPE_2D_LIST, items:firstChargeItems, itemUI:UI_ITEM_NO_BG2, itemDef:firstChargeItemDef, itemSize:cc.size(100, 100), itemsAlign:"center", singleLine:true};
    },
    backScreen:function()
    {
        //if(this.beforeTab)
        //{
        //    this.currentTab = this.beforeTab;
        //    this.currentSubTab= this.beforeSubTab;
        //    this.show();
        //}
        //else
        //{
        //    if(!this.isSubTabPayMent)
        //    {
        //        this.hide();
        //    }
        //    else {
        //        this.isSubTabPayMent= false;
        //        this.show();
        //    }
        //}

        if(!this.isSubTabPayMent)
        {
            this.hide();
            if(this.isTabPigBank)
            {
                gv.background.animNPCPigBank.isShowPanel = false;
                gv.background.animNPCPigBank.isBack = true;
            }

        }
        else {
            this.isSubTabPayMent= false;
            this.currentSubTab = SUBTAB_PIGBANK_VIP_NONE;
            this.show();
        }

    },
    hide:function(){
        FWUtils.hideDarkBg(null, "darkBgPigBank");
        FWUI.hide(UI_PIGBANK, UIFX_POP);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc);

        currentDiamond+=100;
        this.currentTab = TAB_NONE;
        this.currentSubTab= SUBTAB_PIGBANK_VIP_NONE;
        this.isSubTabPayMent= false;
        this.isChargeATM = false;
        this.hideAtmChannelSelection();
        this.hideSmsChannelSelection();

        //Game.refreshUIMain(RF_UIMAIN_PIGBANK);



        //this.offerId = "";
        //this.offerPrice = 0;
        ////cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateOffer);
        //
        //if (this.onHide)
        //    this.onHide ();
        //
        //delete this.onHide;
    },
    buy:function(){
        this.isTabMain =false;
        //this.currentTab = TAB_PIGBANK_PAYMENT;

        var dataPayment = Payment.data[PAYMENT_TAB_OFFER];
        if(!dataPayment) return;

        this.dataPig =[];
        for(var i=0; i<SUBTABS_PIGBANK_VIP_COUNT; i++)
            this.dataPig[i] = [];


        var convert = {};

        convert [defineTypes.SUB_TYPE_IAP] = SUBTAB_PIGBANK_VIP_IAP;
        convert [defineTypes.SUB_TYPE_SMS] = SUBTAB_PIGBANK_VIP_SMS;
        convert [defineTypes.SUB_TYPE_ZING] = SUBTAB_PIGBANK_VIP_CARD;
        convert [defineTypes.SUB_TYPE_CARD] = SUBTAB_PIGBANK_VIP_CARD;
        convert [defineTypes.SUB_TYPE_ATM] = SUBTAB_PIGBANK_VIP_ATM;
        convert [defineTypes.SUB_TYPE_WALLET] = SUBTAB_PIGBANK_VIP_WALLET;
        convert [defineTypes.SUB_TYPE_BANKING] = SUBTAB_PIGBANK_VIP_BANKING;
        convert [defineTypes.SUB_TYPE_CREDIT] = SUBTAB_PIGBANK_VIP_CREDIT;

        for(var key in dataPayment)
        {
            if(key > PAYMENT_SUBTABS_COUNT) continue;
            var item = dataPayment[key];
            for(var key2 in item)
            {
                var item2 = item[key2];
                var subType = item2.SUB_TYPE;
                subType = convert[subType];
                //if(subType === SUBTAB_PIGBANK_VIP_CARD)
                //{
                //    this.dataPig[subType].push(item2);
                //}
                //else if(item2.PRICE_LOCAL === this.pricePig)
                //{
                //
                //}
                this.dataPig[subType].push(item2);
            }

        }

        this.isSubTabPayMent= true;
        this.show();
    },
    changeSubTab:function(sender)
    {

        var name = sender.getName();
        var subTab = null;
        if(name === "btnAppStoreOff")
            subTab = SUBTAB_PIGBANK_VIP_IAP;
        else if(name === "btnSMSOff")
            subTab = SUBTAB_PIGBANK_VIP_SMS;
        else if(name === "btnZingCardOff")
            subTab = SUBTAB_PIGBANK_VIP_CARD;
        else if(name === "btnATMOff")
            subTab = SUBTAB_PIGBANK_VIP_ATM;
        else if(name === "btnWalletOff")
            subTab = SUBTAB_PIGBANK_VIP_WALLET;
        else if(name === "btnBankingOff")
            subTab = SUBTAB_PIGBANK_VIP_BANKING;
        else if(name === "btnCreditOff")
            subTab = SUBTAB_PIGBANK_VIP_CREDIT;
        this.showSubTab(subTab);
    },
    showSubTab:function(subTab)
    {
        this.currentSubTab = subTab;
        this.show();
    },
    showGiftList:function(uiDef)
    {



        //------- ITEM LIST------ //
        //itemList =[item1,item2,...]

        // item ={};
        //item.points // Diamond
        //item.pointerPosX // position pointer
        //item.eligible // co du dieu kien nhan hay khong
        //item.isLastMilestone // co o cuoi duong hay k
        //item.index // vi tri trong day
        //item.barW  // chieu dai thanh bar the hien so luong
        //item.showBars // co show nen bar hay khong
        //item.showPointer // co show pointer hay khong
        //item.bgScale  // bgDiamond

        //-------END ITEM LIST------ //

        var itemList = []; // list item diamond
        this.pointerPos =0;

        var indexItemMaxDiamond =-1;
        itemList.push({points:0});

        for(var key in eventPigBank.mileStoneDiamond)
        {
            itemList.push({points:eventPigBank.mileStoneDiamond[key]});
        }
        var i;
        for(i=0;i<itemList.length;i++)
        {
            var item = itemList[i];
            item.pointerPosX = PIGBANK_POINTER_OFFX;
            item.barW =0;
            item.eligible = (item.points <= currentDiamond);
            item.index = i;
            item.bgScale=0.75;
            if(i === itemList.length -1)
            {
                item.showPointer = currentDiamond >= item.points;
                item.showBars = false;
                item.isLastMilestone =true;
            }
            else
            {
                if(currentDiamond <item.points)
                {
                    item.showPointer =false;
                    item.showBars = false;

                }
                else if(currentDiamond < itemList[i+1].points)
                {
                    item.showBars = true;
                    item.barW = (currentDiamond -item.points)*  PIGBANK_MILESTONE_W / (itemList[i + 1].points - item.points) + 10;
                    item.showPointer = true;
                    item.pointerPosX += item.barW -10;
                    this.pointerPos += item.pointerPosX;
                }
                else
                {
                    item.showBars = true;
                    item.barW = PIGBANK_MILESTONE_W;
                    item.showPointer = false;
                    this.pointerPos += PIGBANK_MILESTONE_W;
                }
            }



            if(item.eligible)
            {
                indexItemMaxDiamond = i;
            }
        }

        if(itemList[indexItemMaxDiamond]!= undefined)
        {
            itemList[indexItemMaxDiamond].bgScale=1;
        }


        if(i < itemList.length)
            itemList = itemList.slice(0, i);



        //------- ITEM DEF------ //
        var itemDef =
        {
            barBg:{visible:"!data.isLastMilestone"},
            bar:{visible:"data.showBars", width:"data.barW"},
            pointer:{visible:"data.showPointer", posX:"data.pointerPosX"},
            pointText:{type:UITYPE_TEXT, field:"points", style:TEXT_STYLE_NUMBER_BIG, visible:"data.points > 0"},
            pointBg:{visible:"data.points > 0"},
            bg:{type:UITYPE_IMAGE, id:"hud/hud_event_pos_ice.png", scale:"data.bgScale", visible:"data.index > 0"},
            iconDiamondInMileStone:{visible:"data.points > 0",color:"data.eligible ? cc.color(255, 255, 255, 255) : cc.color(128, 128, 128, 255)"},

        };
        //-------END ITEM DEF------ //
        uiDef.giftList = {type:UITYPE_2D_LIST, items:itemList, itemUI:UI_MILESTONE_PIGBANK, itemDef:itemDef, itemSize:cc.size(PIGBANK_MILESTONE_W, 200), singleLine:true};
        //uiDef.giftList = {type:UITYPE_2D_LIST, items:itemList, itemUI:UI_MILESTONE_PIGBANK, itemDef:itemDef, itemSize:cc.size(300, 200), singleLine:true};


        // Hide Scroll Bar

        //FWUI.getChildByName(widget, "giftList").setScrollBarOpacity(0);
        //FWUI.getChildByName(widget, "giftList").setScrollBarAutoHideEnabled(true);
        //FWUI.getChildByName(widget, "giftList").setScrollBarWidth(15);
        //FWUI.getChildByName(widget, "giftList").setScrollBarAutoHideTime(0.1);
        // End Hide Scroll Bar

        //if(itemList[1].eligible)
        //{
        //    this.enoughDiamond = true;
        //}
        //else
        //{
        //    this.enoughDiamond = false;
        //}
    },

    showVipOptionList: function(uiDef)
    {


        var itemList = [];

        for(var key in g_VIP.VIP_ITEMS)
        {
            if(key=== VIP_INACTIVE) continue;
            if(g_VIP.VIP_ITEMS[key].IS_ACTIVE)
            {
                itemList.push({key:key});
            }
        }

        if(!this.data)
        {
            this.data={};
            for (var key in g_PAYMENT_DATA.OFFERS)
            {
                for(var i = 0; i<itemList.length ;i++)
                {
                    if(g_PAYMENT_DATA.OFFERS[key].ID === itemList[i].key)
                    {
                        this.data[itemList[i].key]=g_PAYMENT_DATA.OFFERS[key];
                    }
                }
            }
        }



        for(var i =0; i<itemList.length ;i++)
        {
            var item = itemList[i];
            //var key2= item.key;
            item.duration = g_VIP.VIP_ITEMS[item.key].DURATION;
            item.goldRewards =  this.data[item.key].REWARDS.GOLD;
            item.convertGoldBonus = "+"+ g_VIP.VIP_ITEMS[item.key].CONVERT_GOLD_BONUS.toString() +"%";
            item.dailyLoginReward = g_VIP.VIP_ITEMS[item.key].DAILY_LOGIN_REWARD.GOLD.toString();
            item.upgradePotRate ="+"+ g_VIP.VIP_ITEMS[item.key].UPGRADE_POT_RATE.toString()+"%";
            item.blackSmithRate ="+"+ g_VIP.VIP_ITEMS[item.key].BLACKSMITH_RATE.toString()+"%";
            item.airshipGoldBonus ="+"+ g_VIP.VIP_ITEMS[item.key].AIRSHIP_GOLD_BONUS.toString()+"%";
            item.bugRate ="+"+ g_VIP.VIP_ITEMS[item.key].BUG_RATE.toString()+"%";
            item.icon= imgIconVip[item.key];
            item.price = this.formatPriceWithCoutry(this.priceVip[item.key]);
            item.isBought = gv.vipManager.checkKeyVip(item.key);
        }
        //------- ITEM DEF------ //
        var itemDef =
        {
            //type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, useK:true, visible:true
            lblNumTimeVip : {type:UITYPE_TEXT, field:"duration", style:TEXT_STYLE_TEXT_NORMAL_GREEN,visible:"!data.isBought"},
            lblValueItemGold : {type:UITYPE_TEXT, field:"goldRewards", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemGoldConvert : {type:UITYPE_TEXT, field:"convertGoldBonus", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemGoldSupport : {type:UITYPE_TEXT, field:"dailyLoginReward", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemUpdatePot : {type:UITYPE_TEXT, field:"upgradePotRate", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemHammer : {type:UITYPE_TEXT, field:"blackSmithRate", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemAirShip : {type:UITYPE_TEXT, field:"airshipGoldBonus", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblValueItemBug : {type:UITYPE_TEXT, field:"bugRate", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            imgVipSystemIcon:{type:UITYPE_IMAGE, field:"icon", visible:true,opacity: "data.isBought? 150:255"},
            lblMoney:{type:UITYPE_TEXT, field:"price", style:TEXT_STYLE_TEXT_BUTTON},
            lblNameTime: {type:UITYPE_TEXT, value:"TXT_VIP_UNIT_TIME", style:TEXT_STYLE_TEXT_NORMAL,visible:"!data.isBought"},
            btnBuy:{onTouchEnded:this.buyVip.bind(this),field:"key"},
            timeVip:{visible:"data.isBought",type:UITYPE_TIME_BAR, startTime:gv.vipManager.timeBought, endTime:gv.vipManager.timeEndValid, countdown:true,isVisibleTimeBg:false,isVisibleTimeBarBar: false,scaleTime : 0.9,onFinished: this.checkEndVip.bind(this)},
            receivedVip:{visible:"data.isBought"},
        };
        //-------END ITEM DEF------ //

        uiDef.vipOptionList = {type:UITYPE_2D_LIST, items:itemList, itemUI:UI_VIP_ITEM, itemDef:itemDef, itemSize:cc.size(156, 590), singleLine:true};



    },
    checkEndVip:function()
    {
        FWUtils.showWarningText(FWLocalization.text("TXT_VIP_END_TITLE"),cc.p(600,500), cc.WHITE);
        cc.log("VIP SYSTEM : END");
        Game.refreshUIMain(RF_UIMAIN_VIP);
        var widget = FWPool.getNode(UI_PIGBANK, false);
        if(FWUI.isWidgetShowing(widget))
        {
            this.show();
        }
    },
    buyVip:function(sender)
    {
        cc.log(sender.uiData.key);
        this.channelVip = sender.uiData.key;
        this.isSubTabPayMent= true;

        var dataPaymentVip = Payment.data[PAYMENT_TAB_OFFER];
        if(!dataPaymentVip) return;

        this.dataVip =[];
        for(var i=0; i<SUBTABS_PIGBANK_VIP_COUNT; i++)
            this.dataVip[i] = [];


        var convert = {};

        convert [defineTypes.SUB_TYPE_IAP] = SUBTAB_PIGBANK_VIP_IAP;
        convert [defineTypes.SUB_TYPE_SMS] = SUBTAB_PIGBANK_VIP_SMS;
        convert [defineTypes.SUB_TYPE_ZING] = SUBTAB_PIGBANK_VIP_CARD;
        convert [defineTypes.SUB_TYPE_CARD] = SUBTAB_PIGBANK_VIP_CARD;
        convert [defineTypes.SUB_TYPE_ATM] = SUBTAB_PIGBANK_VIP_ATM;
        convert [defineTypes.SUB_TYPE_WALLET] = SUBTAB_PIGBANK_VIP_WALLET;
        convert [defineTypes.SUB_TYPE_BANKING] = SUBTAB_PIGBANK_VIP_BANKING;
        convert [defineTypes.SUB_TYPE_CREDIT] = SUBTAB_PIGBANK_VIP_CREDIT;

        for(var key in dataPaymentVip)
        {
            if(key > PAYMENT_SUBTABS_COUNT) continue;
            var item = dataPaymentVip[key];
            for(var key2 in item)
            {
                var item2 = item[key2];
                var subType = item2.SUB_TYPE;
                cc.log("subType1",subType,"key2",key2,"key",key);
                subType = convert[subType];
                cc.log("subType2",subType);
                //if(subType === SUBTAB_PIGBANK_VIP_CARD)
                //{
                //    this.dataVip[subType].push(item2);
                //}
                //else if(item2.PRICE_LOCAL == this.priceVip[this.channelVip])
                //{
                //    cc.log("item2.PRICE_LOCAL ",item2.PRICE_LOCAL);
                //    cc.log("this.channelVip ",this.channelVip);
                //    cc.log("this.priceVip[this.channelVip] ",this.priceVip[this.channelVip]);
                //    cc.log("subType ",subType);
                //
                //
                //}
                this.dataVip[subType].push(item2);
            }

        }

        this.show();
    },
    showSubTabAnother: function(uiDef)
    {
        this.isChargeATM = false;
        this.itemListATM.setContentSize(640, 225);
        //uiDef.itemListATM = {visible: this.isChargeATM};
        //uiDef.btnCharge = {visible: !this.isChargeATM,onTouchEnded:this.chargeCard.bind(this),position:cc.p(566,121)};
        uiDef.zingCard = {visible:false};
        uiDef.seaCard = {visible:false};
        uiDef.btnCharge = {visible:false};
        uiDef.lblCharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};

        this.fillDataListItem(uiDef);




    },
    fillDataListItem:function(uiDef){
        var displayItems = [];
        var items= null;
        if(this.isTabPigBank){
            items = this.dataPig[this.currentSubTab];
            if (!items)
            {
                cc.log ("dataPig", "showSubTabAnother", "items is null", this.currentSubTab);
                return;
            }
        }
        else
        {
            items = this.dataVip[this.currentSubTab];
            if (!items)
            {
                cc.log ("dataVip", "showSubTabAnother", "items is null", this.currentSubTab);
                return;
            }
        }

        var iconIdx = 1; // fix: missing icon for some items
        for(var i=0; i<items.length; i++) {
            var item = items[i];
            if(this.isTabPigBank){
                if ( item.PRICE_LOCAL < this.pricePig) {
                    cc.log("pricePig", i, item.ID, item.PRICE_LOCAL, this.pricePig);
                    continue;
                }
            }
            else{
                if ( item.PRICE_LOCAL < this.priceVip[this.channelVip]) {
                    cc.log("priceVip", i, item.ID, item.PRICE_LOCAL, this.channelVip,this.priceVip[this.channelVip]);
                    continue;
                }
            }


            item.iapIcon = cc.formatStr("items/item_package_offer0%s.png", iconIdx);
            iconIdx++;
            if(iconIdx > 5)
                iconIdx = 1;

            item.iapPrice = item.PRICE_LOCAL;//item.PRICE_VND;
            if(g_PAYMENT_DATA.USE_PRICE_CENT)
                item.iapPrice = (item.iapPrice / 100).toFixed(2);

            item.iapAmount = "";
            item.iapOldAmount = "";
            item.iapDiscount = 0;
            item.iapDiscountText = "";

            if(this.isTabPigBank) {
                item.highlight = (item.PRICE_LOCAL === this.pricePig);
            }
            else
            {
                item.highlight = (item.PRICE_LOCAL === this.priceVip[this.channelVip]);
            }

            displayItems.push(item);
        }
        var itemDef =
        {
            Panel_119:{enabled:true},
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
        cc.log("showSubTabAnother",displayItems.length);
        uiDef.itemListATM = {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_PAYMENT_ITEM, itemDef:itemDef, itemSize:cc.size(640, 125), visible:true};


        // auto select: vn + thailand
        //if (COUNTRY === COUNTRY_VIETNAM || COUNTRY === COUNTRY_THAILAND || COUNTRY === COUNTRY_MYANMAR)
        //{
        if (this.currentSubTab === SUBTAB_PIGBANK_VIP_SMS) {
            //cc.log ("Payment", "autoSelect", this.offerId);
            //let offer = this.isTabPigBank ? OFFER_PIG_BANK:
            //if (!this.offerId || this.offerId === "")
            //    return;

            if (displayItems.length === 0)
                return;

            var price = displayItems [0].iapPrice;
            if (price > 50000)
                return;

            this.selectedItem = displayItems [0];
            this.showSmsChannelSelection();
        }
        //}
    },
    showSubTabATM: function(uiDef)
    {
        this.itemListATM.setContentSize(640, 225);

        uiDef.btnCharge = {visible:false};
        uiDef.itemListATM = {visible: this.isChargeATM};
        uiDef.panelVipOffer = {visible: !this.isChargeATM &&!this.isTabPigBank&&this.isSubTabPayMent};
        uiDef.imgPigBankBgOffer = {visible: !this.isChargeATM &&this.isTabPigBank&&this.isSubTabPayMent};
        uiDef.imgNoteCurrentDiamond = {visible: !this.isChargeATM &&this.isTabPigBank&&this.isSubTabPayMent};
        //uiDef.btnCharge = {visible: !this.isChargeATM,onTouchEnded:this.chargeCard.bind(this),position:cc.p(566,121)};
        //uiDef.lblNotifyPayment = {visible: !this.isChargeATM};


        uiDef.serialNumBg = {visible:false};
        uiDef.cardNumBg = {visible:false};

        uiDef.lblCharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};
        this.fillDataListItem(uiDef);
        if(this.isChargeATM)
        {
            this.itemListATM.setContentSize(640, 530);
            this.showATMChannelSelection(uiDef);
        }
    },
    onItemSelected:function(sender) {
        this.selectedItem = sender.uiData;
        if (this.currentSubTab === SUBTAB_PIGBANK_VIP_SMS)
            this.showSmsChannelSelection();
        else if (this.currentSubTab === SUBTAB_PIGBANK_VIP_ATM)
        {
            this.isChargeATM = true;
            this.refresh();
        }
        else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_IAP)
        {
            if(this.isTabPigBank)
            {
                Payment.selectedItem = this.selectedItem;
                Payment.offerId = OFFER_PIG_BANK;
                Payment.checkIAPItem();
            }
            else
            {
                Payment.selectedItem = this.selectedItem;
                Payment.offerId = this.channelVip;
                Payment.checkIAPItem();
            }
        }

        else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_WALLET)
        {
            switch (COUNTRY)
            {
                case COUNTRY_MYANMAR:
                case COUNTRY_THAILAND:
                case COUNTRY_PHILIPPINE:
                    this.chargeSEAWallet ();
                    break;
            }
        }
        else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_BANKING)
        {
            switch (COUNTRY)
            {
                case COUNTRY_MYANMAR:
                case COUNTRY_THAILAND:
                case COUNTRY_PHILIPPINE:
                    this.chargeSEABanking ();
                    break;
            }
        }
        else if(this.currentSubTab === SUBTAB_PIGBANK_VIP_CREDIT)
        {
            if(this.isTabPigBank)
            {
                Payment.selectedItem = this.selectedItem;
                Payment.offerId = OFFER_PIG_BANK;
            }
            else
            {
                Payment.selectedItem = this.selectedItem;
                Payment.offerId = this.channelVip;
            }

            CardPayment.show();
        }
    },
    showCardInput : function(uiDef)
    {
        this.isChargeATM = false;
        uiDef.itemListATM = {visible: this.isChargeATM};
        uiDef.lblCharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};
        uiDef.btnCharge = {visible: true,onTouchEnded:this.chargeCard.bind(this),position:cc.p(761,96)};
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
        uiDef.zingCard = {visible:true};
        uiDef.seaCard = {visible:false};
        uiDef.serialNumBg = {visible:true};
        uiDef.cardNumBg = {visible:true};
        uiDef.lblCardNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_NUM", style:TEXT_STYLE_TEXT_NORMAL};
        uiDef.inputCardNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK};
        uiDef.lblSerialNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_SERIAL", style:TEXT_STYLE_TEXT_NORMAL};
        uiDef.inputSerialNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK};

    },
    showSEACardInput:function(uiDef){
        var dataCard = this.isTabPigBank?this.dataPig[SUBTAB_PIGBANK_VIP_CARD][0]:this.dataVip[SUBTAB_PIGBANK_VIP_CARD][0];
        cc.log("dataCard",JSON.stringify(dataCard));
        if (!this.currentSEAChannel)
            this.currentSEAChannel = dataCard.CHANNEL [0];

        var icon = Payment.channelToIcon (this.currentSEAChannel);
        var onChannel = function(sender1) {this.showSEAChannel (function(sender2) {this.onSEACardChange(sender2);}.bind(this),dataCard);}.bind(this);

        uiDef.zingCard = {visible:false};
        uiDef.seaCard = {visible:true};
        uiDef.lblSEACardChannelChoose = {type:UITYPE_TEXT, value:"TXT_PAYMENT_SEA_CARD_CHOOSE", style:TEXT_STYLE_TEXT_NORMAL};
        uiDef.logoSEACardChannel = {type:UITYPE_IMAGE, value:icon,scale: 0.6, onTouchEnded: onChannel};
        uiDef.btnSEACardChange = {visible:true, onTouchEnded: onChannel};
        uiDef.lblSEACardNum = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CARD_NUM", style:TEXT_STYLE_TEXT_NORMAL};
        uiDef.inputSEACardNum = {type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_GIFTCODE_HINT", placeHolderColor: cc.color.BLACK};
        uiDef.lblSEACharge = {type:UITYPE_TEXT, value:"TXT_PAYMENT_CHARGE", style:TEXT_STYLE_TEXT_BUTTON};
        uiDef.btnSEACharge = {onTouchEnded:this.chargeSEACard.bind(this)};
    },

    chargeSEAWallet:function()
    {
        var dataWallet = this.selectedItem;
        if (!dataWallet) {
            cc.log("PigBank","chargeSEAWallet","NotData");
            return;
        }
        cc.log("chargeSEAWallet",JSON.stringify(dataWallet));
        this.showSEAChannel (function(sender) {//web
            var channelNo = sender.uiData.channel;
			switch (COUNTRY)
			{
				case COUNTRY_MYANMAR:
				case COUNTRY_THAILAND:
				case COUNTRY_PHILIPPINE:
				{
					var phoneNo = "";
					var priceLocal = dataWallet.PRICE_LOCAL;
					var priceVnd = dataWallet.PRICE_VND;
					var itemId = dataWallet.ID;
					var offerId = this.isTabPigBank ? OFFER_PIG_BANK : this.channelVip;

					cc.log ("PigBank", "chargeSEAWallet", "callWallet", channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
					PaymentLibHandle.callWallet (channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
				}
				return;

				default:
					cc.log ("PigBank", "chargeSEAWallet", "invalid", COUNTRY);
            }
        }.bind(this),dataWallet);
    },

    chargeSEABanking:function()
    {
        var dataBanking = this.selectedItem;
        if (!dataBanking) {
            cc.log("PigBank","chargeSEABanking","NotData");
            return;
        }
        this.showSEAChannel (function(sender) {//web
            var channelNo = sender.uiData.channel;
            var packagePrice = dataBanking.PRICE_LOCAL;
            var packageData ;
            if(this.isTabPigBank)
            {
                packageData= JSON.stringify({item:dataBanking.ID,offer:OFFER_PIG_BANK});
            }
            else
            {
                packageData= JSON.stringify({item:dataBanking.ID,offer:this.channelVip});
            }
            cc.log ("PigBank", "chargeSEABanking", channelNo, packagePrice, packageData);
        }.bind(this),dataBanking);
    },
    showSEAChannel:function(onSelected,dataChannel){

        cc.log ("PigBank", "showSEACardChange", JSON.stringify (dataChannel));
        if (!dataChannel){
            cc.log("PigBank","showSEACardChange","NotData");
            return;
        }


        var channelItems = [];
        var list = Payment.getSEAChannels (dataChannel.SUB_TYPE);
        if (!list)
            return;

        for(var i in dataChannel.CHANNEL)
        {
            var channel = dataChannel.CHANNEL[i];
            if (list.indexOf [channel] !== -1)
                channelItems.push({
                    channel: channel,
                    type: dataChannel.SUB_TYPE,
                    icon: Payment.channelToIcon(channel),
                });
        }

        var onTouchItem = function(sender) {//web
            if (onSelected)
                onSelected (sender);

            Payment.hideSEACardChange (sender);
        };

        var channelItemDef =
        {
            item:{onTouchEnded:onTouchItem},
            sprite:{type:UITYPE_IMAGE, field:"icon", visible:true},
            amount:{visible:false},
        };

        var uiDef =
        {
            title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_CHANNEL", style:TEXT_STYLE_TITLE_2},
            closeButton:{onTouchEnded:Payment.hideSEACardChange.bind (this)},
            itemList:{type:UITYPE_2D_LIST, items:channelItems, itemUI:UI_ITEM_NO_BG2, itemDef:channelItemDef, itemSize:cc.size(150, 100), itemsAlign:"center", singleLine:true},
        };

        var widget = FWUI.showWithData(UI_PAYMENT_CHOOSE_CHANNEL, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        widget.setLocalZOrder(Z_POPUP);
    },
    onSEACardChange:function(sender)
    {
        cc.log ("PigBank", "onSEACardChange", JSON.stringify (sender.uiData));

        var widget = FWPool.getNode(UI_PIGBANK, false);
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
    chargeSEACard:function(){
        var dataCard = this.isTabPigBank?this.dataPig[SUBTAB_PIGBANK_VIP_CARD][0]:this.dataVip[SUBTAB_PIGBANK_VIP_CARD][0];
        var uiPayment = FWPool.getNode(UI_PIGBANK, false);
        var inputCardNum = FWUtils.getChildByName(uiPayment, "inputSEACardNum");
        var cardNum = inputCardNum.getString();
        var itemId = dataCard.ID;
        var offerId = this.isTabPigBank ? OFFER_PIG_BANK : this.channelVip;

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

				cc.log ("PigBank", "chargeSEACard", "callCard", channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, offerId);
				PaymentLibHandle.callCard (channelNo, cardNo, cardPin, priceLocal, priceVnd, itemId, offerId);
			}
			return;

			default:
				cc.log ("PigBank", "chargeSEACard", "invalid", COUNTRY);
        }
    },
    chargeCard:function(uiDef)
    {
        cc.log("chargeCard", "currentSubTab", this.currentSubTab, "COUNTRY", COUNTRY);
        switch (this.currentSubTab) {
            case  SUBTAB_PIGBANK_VIP_CARD :
            {
                switch (COUNTRY)
                {
                    case COUNTRY_VIETNAM:
                        var uiPayment = FWPool.getNode(UI_PIGBANK, false);
                        var inputCardNum = FWUtils.getChildByName(uiPayment, "inputCardNum");
                        var inputSerialNum = FWUtils.getChildByName(uiPayment, "inputSerialNum");
                        var cardNum = inputCardNum.getString();
                        var serialNum = inputSerialNum.getString();
                        if(!cardNum || !serialNum)
                        {
                            Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_MISSING_INFO"}, function() {});
                            return;
                        }

                        // popup
                        this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});

                        // server
                        if(this.isTabPigBank)
                        {
                            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentCardSubmit);
                            cc.log ("PIGBANK CARD :", VN_CARD_ZING, serialNum, cardNum, this.currentSubTab, OFFER_PIG_BANK);
                            pk.pack(VN_CARD_ZING, serialNum, cardNum,this.dataPig[this.currentSubTab][0].ID,OFFER_PIG_BANK);
                            network.connector.client.sendPacket(pk);
                            break;
                        }
                        else
                        {
                            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentCardSubmit);
                            cc.log ("Vip CARD :", VN_CARD_ZING, serialNum, cardNum, this.dataVip[this.currentSubTab][0].ID, OFFER_PIG_BANK);
                            pk.pack(VN_CARD_ZING, serialNum, cardNum,this.dataVip[this.currentSubTab][0].ID,this.channelVip);
                            network.connector.client.sendPacket(pk);
                            break;
                        }
                        return;

                    case COUNTRY_MYANMAR:
                    case COUNTRY_THAILAND:
                    case COUNTRY_PHILIPPINE:
                        this.chargeSEACard();
                        //this.showSEACardInput (uiDef);
                        return;
                }
                break;


                //chargeSEACard

            }
        }

        this.refresh();
    },

    hideProgressPopup:function()
    {
        if(this.progressPopup && FWUI.isWidgetShowing(this.progressPopup))
        {
            FWUI.hideWidget(this.progressPopup, UIFX_POP);
            this.progressPopup = null;
        }
    },
    refresh: function ()
    {
        var subTab = this.currentSubTab;
        this.showSubTab (subTab);
    },
    showInfo:function(sender)
    {
        this.hide();
        GameEvent.showInfo();
    },
    showInfoVip:function(sender)
    {
        if (FWUI.isShowing(UI_VIP_INFO))
            return;

        var uiDef =
        {
            title:{type:UITYPE_TEXT, value: "TXT_VIP_TITLE_SYSTEM"},
            //npc:{type:UITYPE_IMAGE, id: data.npc, scale: 1.1},
            content:{type:UITYPE_TEXT, value: "TXT_VIP_INFO"},

			// jira#6464
            // jira#5956
            //closeButton:{onTouchEnded:function() {FWUI.hide(UI_FEATURE_PRESENT, UIFX_POP);}},
            //closeButton:{onTouchEnded:this.hideInfoVip.bind(this)},
            closeButton:{visible:false},
			uiVipInfo:{onTouchEnded:this.hideInfoVip.bind(this)},
        };

        FWUtils.showDarkBg(null, Z_UI_PAYMENT+1, "darkBgInfoVip");
        var widget = FWUI.showWithData(UI_VIP_INFO, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        widget.setLocalZOrder(Z_UI_PAYMENT+2);

        AudioManager.effect (EFFECT_POPUP_SHOW);
        // FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgFeature", null, true);

        if(!this.hideFunc3)
            this.hideFunc3 = function() {this.hideInfoVip()}.bind(this);
        Game.gameScene.registerBackKey(this.hideFunc3);
    },
    hideInfoVip: function ()
    {
        FWUtils.hideDarkBg(null, "darkBgInfoVip");
        var widget = FWPool.getNode(UI_VIP_INFO, false);
        FWUI.hideWidget(widget, UIFX_POP);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc3);

        // FWUtils.hideDarkBg(null, "darkBgFeature");
    },

    hideInfo:function()
    {
        var widget = FWPool.getNode(UI_EVENT_NEWS, false);
        FWUI.hideWidget(widget, UIFX_POP);
        Game.gameScene.unregisterBackKey(this.hideFunc2);
    },
    hideProgressPopup:function()
    {
        if(this.progressPopup && FWUI.isWidgetShowing(this.progressPopup))
        {
            FWUI.hideWidget(this.progressPopup, UIFX_POP);
            this.progressPopup = null;
        }
    },
    onPlayButtonTouched:function()
    {
        this.hideInfo();
    },
    showDetailInfo:function(sender)
    {
        var widget = FWPool.getNode(UI_EVENT_NEWS, false);
        var itemList = FWUtils.getChildByName(widget, "itemList");
        var children = itemList.getChildren();
        for(var i=0; i<children.length; i++)
        {
            var child = children[i];
            if(child === sender && child.getContentSize().width === 255)
                this.setDetailInfoSize(child,cc.size(740, 440));
            else
                this.setDetailInfoSize(child, cc.size(255, 440));
        }
        itemList.refreshView();
    },
    setDetailInfoSize:function(widget, size)
    {
        widget.setContentSize(size);

        var center = FWUtils.getChildByName(widget, "center");
        center.setContentSize(cc.size(size.width - 20, size.height - 30));

        var expandCollapseBg = FWUtils.getChildByName(widget, "expandCollapseBg");
        var expand = FWUtils.getChildByName(widget, "expand");
        var collapse = FWUtils.getChildByName(widget, "collapse");
        expandCollapseBg.setPosition(size.width - 38, expandCollapseBg.getPositionY());
        expand.setVisible(size.width === EVENT_INFO_SIZE.width);
        collapse.setVisible(size.width === EVENT_INFO_SIZE_EXPAND.width);
    },
    showSmsChannelSelection:function()
    {
		///////////////////////////////////////////////////////////////////////////////
		// obsolete code, use Payment::showSmsChannelSelection instead ////////////////
		///////////////////////////////////////////////////////////////////////////////
		if(this.isTabPigBank)
		{
			Payment.selectedItem = this.selectedItem;
			Payment.offerId = OFFER_PIG_BANK;
		}
		else
		{
			Payment.selectedItem = this.selectedItem;
			Payment.offerId = this.channelVip;
		}
		Payment.showSmsChannelSelection();
		return;
		///////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////

    },
    onSmsChannelSelected: function(sender)
    {
        var channel = sender.uiData.channel;
        if (!channel)
            return;

        cc.log("PigBank ::onSmsChannelSelected: channel=" + channel );
        this.hideSmsChannelSelection(sender);

        if (COUNTRY == COUNTRY_VIETNAM)
        {
            // server
            this.requestPaymentSmsReg(channel);
        }
        if (COUNTRY == COUNTRY_BRAZIL)
        {
            Payment.selectedSMSChannel = channel;
            Payment.brSmsStep = 0;
            Payment.brDefaultPhoneNo = cc.sys.localStorage.getItem("brDefaultPhoneNo");
            if(!Payment.brDefaultPhoneNo)
                Payment.brDefaultPhoneNo = "";
            Payment.showBRSms();
        }
        if(COUNTRY == COUNTRY_MYANMAR)
        {
            var channelNo = channel;
            var phoneNo = "";
            var priceLocal ;
            var priceVnd;
            var itemId ;
            var offerId;
            if(this.isTabPigBank)
            {
                priceLocal=this.dataPig[this.currentSubTab][0].PRICE_LOCAL;
                priceVnd= this.dataPig[this.currentSubTab][0].PRICE_VND;
                itemId =this.dataPig[this.currentSubTab][0].ID;
                offerId= OFFER_PIG_BANK;
            }
            else
            {
                priceLocal=this.dataVip[this.currentSubTab][0].PRICE_LOCAL;
                priceVnd= this.dataVip[this.currentSubTab][0].PRICE_VND;
                itemId =this.dataVip[this.currentSubTab][0].ID;
                offerId= this.channelVip;
            }
            PaymentLibHandle.callSMS (channelNo, phoneNo, priceLocal, priceVnd, itemId, offerId);
        }

    },
    hideSmsChannelSelection:function(sender)
    {
        Payment.hideSmsChannelSelection();
    },
    requestPaymentSmsReg:function(channel) {
        if(this.isTabPigBank)
        {
            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentSmsReg);
            cc.log("PigBank : Payment SMS : ", channel,this.dataPig[this.currentSubTab][0].ID,OFFER_PIG_BANK);
            pk.pack(channel, this.dataPig[this.currentSubTab][0].ID, OFFER_PIG_BANK);
            network.connector.client.sendPacket(pk);
        }
        else
        {
            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentSmsReg);
            cc.log("VIP : Payment SMS : ", channel,this.dataVip[this.currentSubTab][0].ID,this.channelVip);
            pk.pack(channel, this.dataVip[this.currentSubTab][0].ID, this.channelVip);
            network.connector.client.sendPacket(pk);
        }

    },

    showATMChannelSelection:function(uiDef){

        var displayItems = [];
        for(var key in Payment.bankIconsMapping)
        {
            if(key === "123PCC")
                continue; // skip cc
            displayItems.push({id:key, icon:"logo banks/logo_bank_" + Payment.bankIconsMapping[key] + ".png"});
        }

        var itemDef =
        {
            sprite:{type:UITYPE_IMAGE, field:"icon", visible:true},
            amount:{visible:false},
            item:{onTouchEnded:this.onBankSelected.bind(this)},
        };

        uiDef.itemListATM= {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(150, 88), visible:true};
        uiDef.imgBarMenuVip = {visible : false};
        uiDef.lblNotifyPayment = {visible : false};
        //FWPool.getNode(UI_PIGBANK, false).itemList = {type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(150, 88), visible:true};
        //this.show();
        //var uiDef =
        //{
        //    title:{type:UITYPE_TEXT, value:"TXT_PAYMENT_CHOOSE_BANK", style:TEXT_STYLE_TITLE_2},
        //    closeButton:{onTouchEnded:this.hideAtmChannelSelection.bind(this)},
        //    itemList:{type:UITYPE_2D_LIST, items:displayItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(150, 88), visible:true},
        //};
        //
        //var widget = FWUI.showWithData(UI_PAYMENT_ITEM_ATM, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        //widget.setLocalZOrder(Z_POPUP);
        //
        //FWUtils.showDarkBg(null, Z_UI_PAYMENT + 1, "darkBgAtm");
        //
        //if(!this.hideFuncAtmChannel)
        //    this.hideFuncAtmChannel = function() {this.hideAtmChannelSelection()}.bind(this);
        //Game.gameScene.registerBackKey(this.hideFuncAtmChannel);


    },
    onBankSelected:function(sender)
    {
        var data = sender.uiData;
        //cc.log("PigBank::onBankSelected: bank=" + data.id + " item=" +this.dataPig[this.currentSubTab][0].ID);

        // popup
        //this.progressPopup = Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_PAYMENT_PROCESSING"}, function() {});

        // server
        if(this.isTabPigBank)
        {
            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentAtmReg);
            cc.log("PIGBANK : Bank payment ",data.id,this.dataPig[this.currentSubTab][0].ID,OFFER_PIG_BANK);
            pk.pack(data.id, this.dataPig[this.currentSubTab][0].ID, OFFER_PIG_BANK);
            network.connector.client.sendPacket(pk);
        }
        else
        {
            var pk = network.connector.client.getOutPacket(Payment.RequestPaymentAtmReg);
            cc.log("VIP : Bank payment ",data.id,this.dataVip[this.currentSubTab][0].ID, this.channelVip);
            pk.pack(data.id,this.dataVip[this.currentSubTab][0].ID, this.channelVip);
            network.connector.client.sendPacket(pk);
        }


        this.refresh ();
    },
    hideAtmChannelSelection:function()
    {
        FWUtils.hideDarkBg(null, "darkBgAtm");
        Game.gameScene.unregisterBackKey(this.hideFuncAtmChannel);
        FWUI.hide(UI_PAYMENT_ITEM_ATM, UIFX_POP);
    },
    showTabPayment:function()
    {
        this.currentTab = PIGBANK_TAB_PAYMENT;
        this.show();
        Payment.hide();
    },
    changeTab:function(sender)
    {
        var name = sender.getName();
        this.beforeTab = null;
        this.beforeSubTab= null;
        this.beforeTab = this.currentTab;
        this.beforeSubTab = this.currentSubTab;
        this.currentSubTab=SUBTAB_PIGBANK_VIP_NONE;
        switch (name)
        {
            case "tabOfferOff": Payment.showTab(PAYMENT_TAB_OFFER); this.hide(); break;
            case "tabVipOff": this.currentTab=TAB_VIP_SYSTEM_MAIN; this.isSubTabPayMent= false; this.show(); break;
            case "tabPigBankOff": this.currentTab=TAB_PIGBANK_MAIN; this.isSubTabPayMent= false; this.show(); break;
        }
    },
    checkEndEventPigBank: function()
    {
        FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_END_TITLE"),cc.p(600,500), cc.WHITE);
        this.hide();
        Game.refreshUIMain(RF_UIMAIN_PIGBANK);
    },
    formatPriceWithCoutry:function(priceLocal)
    {
        if(!priceLocal) return "";
        var priceDisplay = "";

        if (g_PAYMENT_DATA.USE_PRICE_CENT)
            priceDisplay = (priceLocal / 100).toFixed(2) + " " + FWLocalization.text("TXT_CURRENCY");
        else
            priceDisplay = FWUtils.formatNumberWithCommas(priceLocal) + " " + FWLocalization.text("TXT_CURRENCY");

        return priceDisplay;
    }
};
