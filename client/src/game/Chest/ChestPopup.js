const UI_CHEST_ANIM_IDLE                    = "chest_normal";
const UI_CHEST_ANIM_OPEN                    = "chest_open";
const UI_CHEST_ANIM_OPEN_IDLE               = "chest_open_idle";
const UI_CHEST_ANIM_UNLOCK                  = "effect_unlock_chest";

const UI_CHEST_SCALE_SELECTED               = 0.45;
const UI_CHEST_SCALE_UNSELECTED             = 0.35;

const UI_CHEST_REWARD_ITEM_SIZE             = 100;
const UI_CHEST_HEAD_ITEM_WITH               = 17;

const UI_CHEST_REWARD_OPEN_ITEM_WIDTH       = 160;
const UI_CHEST_REWARD_OPEN_ITEM_HEIGHT      = 200;

const UI_CHEST_REWARD_ITEM_MARGIN           = 12;
const UI_CHEST_REWARD_ITEM_VIEWPORT         = 6;

const UI_CHEST_EXCLUDE_REWARD_TYPES = [
    // g_COMMON_ITEM.EXP.ID
];
const TAB_CHEST_CHESTPIRATE = 0;
const TAB_CHEST_GENIE = 1;
const ITEM_ID_TICKET = "G0";

const UI_CHEST_SKINS = {
    C1: "level_1",
    C2: "level_2",
    C3: "level_3",
    C4: "level_4",
    C5: "level_5"
};

var ChestPopup = cc.Node.extend({
	
	// fix: can scroll to open another chest
	canOpenChest:true,
	
    LOGTAG: "[ChestPopup]",

    ctor: function () {
        this._super();
        this.currentTab = TAB_CHEST_CHESTPIRATE;
        this.canTouch = true;
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

	resourcesLoaded:false,
    show: function () {
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			var spineFiles = SPINE_TREASURE_LAMP.split("|");
			cc.loader.load([GACHAPON_DUMMY_PLIST,
							GACHAPON_DUMMY_PLIST.replace(".plist", ".png"),
							UI_CHEST,
							UI_CHEST_ITEM,
							UI_CHEST_OPEN,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png")], 
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(GACHAPON_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}

        if(!this.widget) {
            this.widget = FWPool.getNode(UI_CHEST, false);
        }
        var activeGachaPon = true;
        if(!this.dataGachaPon)
        {
            this.initDataGachaPon();
        }
        if(this.currentTab === TAB_CHEST_GENIE){
            var isEnoughLevel = gv.userData.isEnoughLevel(this.dataGachaPon.userLevelEnough);
            cc.log(this.LOGTAG+ " CHECK ENOUGH LEVEL :" + isEnoughLevel);

            if(!isEnoughLevel)
            {
                activeGachaPon= false;
            }
            this.setNumTicket();
        }

            //this.isBusy = false;

        if (this.widget) {
            var uiDefine = {
                textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_CHEST_TITLE"), style: TEXT_STYLE_TITLE_1 },
                textDesc: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_CHEST_DESC"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
                textLimit: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_CHEST_OUT_LIMIT"), style: TEXT_STYLE_TEXT_NORMAL },
                textTime: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                textFree: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                textPriceCoin: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                textPriceGold: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                textPriceRepu: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                textNum: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
                buttonOpenFree: { onTouchEnded: this.onButtonOpenTouched.bind(this) },
                buttonOpenCoin: { onTouchEnded: this.onButtonOpenTouched.bind(this) },
                buttonOpenGold: { onTouchEnded: this.onButtonOpenTouched.bind(this) },
                buttonOpenRepu: { onTouchEnded: this.onButtonOpenTouched.bind(this) },
                buttonClose: { onTouchEnded: this.hide.bind(this) },
                tabChestOff: {onTouchEnded: this.changeTab.bind(this)},
                tabGenieOff: {onTouchEnded: this.changeTab.bind(this)},
                //tabChestOn: {visible: this.currentTab === TAB_CHEST_CHESTPIRATE},
                //tabGenieOn: {visible: this.currentTab === TAB_CHEST_GENIE},
                panelChestPirate:{visible:this.currentTab  === TAB_CHEST_CHESTPIRATE},
                panelGenie:{visible:this.currentTab  === TAB_CHEST_GENIE},
                textTitleGenie: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_GACHAPON_TITLE"), style: TEXT_STYLE_TITLE_1 },
                lblInfoBoard:{type: UITYPE_TEXT,id: FWLocalization.text("TXT_GACHAPON_INFO"),style:TEXT_STYLE_NOTE_GACHAPON},
                txtNote1:{type: UITYPE_TEXT,value: "",style:TEXT_STYLE_BTN_CHANGETICKET},
                txtNote2:{type: UITYPE_TEXT,value: "",style:TEXT_STYLE_BTN_CHANGETICKET},
                lblNumTicket:{type: UITYPE_TEXT,value: "",style:TEXT_STYLE_TEXT_NORMAL_GREEN},
                btnChange1:{onTouchEnded: this.changeTicket.bind(this)},
                btnChange2:{onTouchEnded: this.changeTicket.bind(this)},
                imgBgInfo:{onTouchBegan: this.showHintGacha.bind(this),onTouchEnded: this.hideHintGacha.bind(this),onDrop: this.hideHintGacha.bind(this),forceTouchEnd: true},
                imgIcon:{onTouchBegan: this.showHintGacha.bind(this),onTouchEnded: this.hideHintGacha.bind(this),onDrop: this.hideHintGacha.bind(this),forceTouchEnd: true},
                panelActiveEvent:{visible:activeGachaPon},
                lblInfoBoardUnActive:{visible:!activeGachaPon, type: UITYPE_TEXT,id: cc.formatStr(FWLocalization.text("TXT_GACHAPON_INFO_UNACTIVE"),this.dataGachaPon.userLevelEnough),style:TEXT_STYLE_NOTE_GACHAPON},
                panelItemInfo:{visible:activeGachaPon},
                hintGacha:{visible:false},
                hintText:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_HINT_G0"),style:TEXT_STYLE_HINT_NOTE},
                infoButton: {onTouchEnded:this.showInfo.bind(this)},
            };


            FWUI.fillData(this.widget, null, uiDefine);

            // init elements

            this.barTime = FWUI.getChildByName(this.widget, "barTime");
            this.textTime = FWUI.getChildByName(this.widget, "textTime");
            this.panelTime = FWUI.getChildByName(this.widget, "panelTime");
            this.panelNum = FWUI.getChildByName(this.widget, "panelNum");

            this.buttonOpenFree = FWUI.getChildByName(this.widget, "buttonOpenFree");
            this.buttonOpenCoin = FWUI.getChildByName(this.widget, "buttonOpenCoin");
            this.buttonOpenGold = FWUI.getChildByName(this.widget, "buttonOpenGold");
            this.buttonOpenRepu = FWUI.getChildByName(this.widget, "buttonOpenRepu");

            this.textFree = FWUI.getChildByName(this.widget, "textFree");
            this.textPriceCoin = FWUI.getChildByName(this.widget, "textPriceCoin");
            this.textPriceGold = FWUI.getChildByName(this.widget, "textPriceGold");
            this.textPriceRepu = FWUI.getChildByName(this.widget, "textPriceRepu");
            this.textNum = FWUI.getChildByName(this.widget, "textNum");

            this.textLimit = FWUI.getChildByName(this.widget, "textLimit");

            this.iconCoin = FWUI.getChildByName(this.widget, "iconCoin");
            this.iconGold = FWUI.getChildByName(this.widget, "iconGold");
            this.iconRepu = FWUI.getChildByName(this.widget, "iconRepu");

            this.textDesc = FWUI.getChildByName(this.widget, "textDesc");

            // this.buttonPrev = FWUI.getChildByName(this.widget, "buttonPrev");
            // this.buttonNext = FWUI.getChildByName(this.widget, "buttonNext");

            // init chests

            this.panelRewards = FWUI.getChildByName(this.widget, "panelRewards");
			if(this.panelRewards.setScrollBarEnabled) //web
				this.panelRewards.setScrollBarEnabled(false);
            this.panelRewards.setBounceEnabled(true);
            this.panelRewards.setItemsMargin(UI_CHEST_REWARD_ITEM_MARGIN);

            this.panelChests = FWUI.getChildByName(this.widget, "panelChests");
            this.panelChests.setUsingCustomScrollThreshold(true);
            this.panelChests.setCustomScrollThreshold(0.3);
            this.panelChests.addEventListener(this.onChestItemSelected.bind(this));

            if(this.currentTab === TAB_CHEST_CHESTPIRATE)
            {
                cc.log(this.LOGTAG, "show", "chests: %j", gv.userData.getGachaChests());
                var idChest = 0;
                var isOpening = false;

                if (!this.isInitialized) {

                    this.panelChests.removeAllPages();
                    this.chests = _.sortBy(gv.chest.getChestAll(), function(item) {return g_GACHA_CHEST[item[CHEST_ID]].DISPLAY_ORDER;});//web
                    var isActive;
                    for (var i = 0; i < this.chests.length; i++) {
                        switch (this.chests[i][CHEST_STATUS])
                        {
                            case CHEST_STATUS_OPEN:
                                isActive = true;
                                idChest = i;
                                isOpening = true;
                                break;
                            case CHEST_STATUS_ACTIVE:
                                isActive = true;
                                break;
                            default:
                                isActive = false;
                        }

                        var chestNum = gv.userStorages.getItemAmount(this.chests[i][CHEST_ID]);
                        if(!isActive && chestNum > 0)
                            isActive = true;

                        var chestItem = FWPool.getNode(UI_CHEST_ITEM);
                        this.panelChests.addPage(chestItem);

                        chestItem.light = FWUI.getChildByName(chestItem, "iconLight");
                        if (chestItem.light) {
                            // jira#5498
                            if (chestItem.light.spine)
                            {
                                chestItem.light.spine.uninit();
                                chestItem.light.spine = null;
                            }

                            if (!chestItem.light.spine) {
                                chestItem.light.spine = new FWObject();
                                chestItem.light.spine.initWithSpine(SPINE_EFFECT_POT_SLOT);
                                chestItem.light.spine.setAnimation("effect_light_icon", true);
                                chestItem.light.spine.setScale(1.5);
                                chestItem.light.spine.setParent(chestItem.light);
                                chestItem.light.spine.setPosition(cc.p(0, 0));
                            }
                        }

                        chestItem.iconSpine = FWUI.getChildByName(chestItem, "iconSpine");
                        if (chestItem.iconSpine) {
                            chestItem.spine = FWUI.fillData_spine2(chestItem.iconSpine, SPINE_CHEST, UI_CHEST_SKINS[this.chests[i][CHEST_ID]], "", 1.0);
                            chestItem.spine.setAnimation(0, UI_CHEST_ANIM_IDLE, isActive);
                            FWUtils.applyGreyscaleSpine(chestItem.spine, !isActive);
                        }

                        FWUI.fillData(chestItem, { index: i }, {
                            container: {onTouchBegan:this.onChestItemScroll.bind(this), onTouchEnded: this.onChestItemTouched.bind(this) }
                        });
                    }

                    //cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateTime, 0.5, cc.REPEAT_FOREVER, 0, false);
                    this.isInitialized = true;
                }
                else
                {
                    // jira#5983
                    for(var i = 0; i < this.chests.length; i++)
                        this.updateChest(i);
                }

                this.selectChest(idChest, true);

                // init open effect

                if (!this.panelEffect) {

                    this.panelEffect = FWPool.getNode(UI_CHEST_OPEN, false);
                    this.panelEffect.setVisible(false);
                    this.panelEffect.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
                    this.widget.addChild(this.panelEffect, 100);

                    FWUI.fillData(this.panelEffect, null, {
                        textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_CHEST_REWARD_DESC"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
                        textDesc: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_REWARD_HINT"), style: TEXT_STYLE_TEXT_NORMAL },
                        container: { onTouchEnded: function(sender) {
                            this.getReward();
                        }.bind(this)},
                        backButton:{onTouchEnded:this.hide.bind(this)},
                    });

                    this.panelEffectChest = FWUI.getChildByName(this.panelEffect, "chest");
                    this.panelEffectChestRewards = FWUI.getChildByName(this.panelEffect, "panelRewards");
                    this.panelEffectBackButton = FWUI.getChildByName(this.panelEffect, "backButton"); // jira#5100

                    if (!this.effectChest) {
                        this.effectChest = new FWObject();
                        this.effectChest.initWithSpine(SPINE_CHEST);
                        this.effectChest.setScale(0.45);
                        this.effectChest.setParent(this.panelEffectChest);
                    }

                    if (!this.effectUnlock) {
                        this.effectUnlock = new FWObject();
                        this.effectUnlock.initWithSpine(SPINE_EFFECT_UNLOCK);
                        this.effectUnlock.setPosition(this.panelEffectChest.getPosition());
                        this.effectUnlock.setParent(this.panelEffect);
                    }

                    if (!this.effectParticle) {
                        this.effectParticle = new cc.ParticleSystem("effects/particle_congrats.plist");
                        this.effectParticle.setDuration(-1);
                        this.effectParticle.setTotalParticles(15);
                        this.effectParticle.setPosVar(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.25));
                        this.effectParticle.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 1.25);
						this.effectParticle.retain();
                    }
					if(!this.effectParticle.getParent())
						this.panelEffect.addChild(this.effectParticle);

                }

                if (isOpening)
                    this.openChest(idChest);
            }
            else if(this.currentTab === TAB_CHEST_GENIE){
                if(!this.spineGenie) this.spineGenie = FWUI.getChildByName(this.widget,"spineGenie");

                if(!this.hintGacha) this.hintGacha = FWUI.getChildByName(this.widget,"hintGacha");

                if (!this.spineTreasureLamp || !this.spineTreasureLamp.spine) {
                    this.spineTreasureLamp = new FWObject();
                    ///////////
                    this.spineTreasureLamp.initWithSpine(SPINE_TREASURE_LAMP);
                    this.spineTreasureLamp.setAnimation("lamp_idle", true);
                    this.spineTreasureLamp.setSkin("default");
                    //this.spineTreasureLamp.setScale(-1,1);
                    this.spineTreasureLamp.setParent(this.spineGenie,10);
                    /////////
                }

                if(!this.effectGenieLamp)
                {
                    this.effectGenieLamp = new cc.ParticleSystem("effects/effect_light_lamp.plist");
                    this.effectGenieLamp.setDuration(-1);//maxLevelParticle.setDuration(-1);
                    this.effectGenieLamp.setLife(10);
                    this.effectGenieLamp.setPositionType(2);
                    this.effectGenieLamp.setPosition(0,-80);
                    this.effectGenieLamp.setScale(2);
                    //maxLevelParticle.setTotalParticles(15);
                    this.spineGenie.addChild(this.effectGenieLamp,9);
                }


                this.showPopupGift();
                this.fillDataTabGenie();
            }

        }

        if(!FWUI.isWidgetShowing(this.widget))
        {
            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
            this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755
            AudioManager.effect (EFFECT_POPUP_SHOW);
            if(!this.hideFunc)
                this.hideFunc = function() {return this.hide();}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc);

            cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateTime, 0.5, cc.REPEAT_FOREVER, 0, false);

        }

    },

    hide: function () {

        if (!this.canTouch)
            return true;
	
		if(this.isChestOpening)
			return true;
		
        FWUI.hideWidget(this.widget, UIFX_POP);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateTime);
		
		this.cleanupPanelRewards();
		//gv.background.refreshTreasureTimer();
		gv.chest.refreshNotification();
    },
	
    showHintGacha:function(sender){
        this.hintGacha.setVisible(true);
    },
    hideHintGacha:function(sender){
        this.hintGacha.setVisible(false);
    },
    changeTab:function(sender){
        var name = sender.getName();
        switch (name){
            case "tabChestOff": {cc.log("tab tabChestOff");this.currentTab = TAB_CHEST_CHESTPIRATE;  this.show(); break;}
            case "tabGenieOff": {cc.log("tab tabGenieOff");this.currentTab= TAB_CHEST_GENIE;  this.show();  break;}
        }
    },
    initDataGachaPon:function(){
        this.dataGachaPon ={};
        this.dataGachaPon.userLevelEnough = g_MISCINFO.GACHAPONPON_USER_LEVEL;
        this.dataGachaPon.ticketRequest= g_MISCINFO.GACHAPON_TICKET_REQ ;
        this.dataGachaPon.arrTurns = g_MISCINFO.GACHAPON_TICKET_OPEN_TURN ;
        this.dataGachaPon.itemId = ITEM_ID_TICKET;
        this.dataGachaPon.data = gv.userData.game[GAME_GACHAPON];
    },
    setNumTicket:function(){
        if(!this.dataGachaPon)  return;
        this.dataGachaPon.numTicket = gv.userStorages.getItemAmount(this.dataGachaPon.itemId);
    },

    fillDataTabGenie:function(){
        if(!this.widget || !this.dataGachaPon) return;
        cc.log("sss",JSON.stringify(this.dataGachaPon.data));
        var txtNote1 = FWUI.getChildByName(this.widget, "txtNote1");
        var txtNote2 = FWUI.getChildByName(this.widget, "txtNote2");
        var lblNumTicket = FWUI.getChildByName(this.widget, "lblNumTicket");

        var numTicket = this.dataGachaPon.numTicket;

        if(this.dataGachaPon.arrTurns[0] == 1)
        {
            txtNote1.setString(this.dataGachaPon.ticketRequest);
        }
        else
        {
            txtNote1.setString(cc.formatStr(FWLocalization.text("TXT_GACHAPON_CHANGE_TICKET"),this.dataGachaPon.arrTurns[0]));
        }

        //txtNote2.setString(cc.formatStr(FWLocalization.text("TXT_GACHAPON_CHANGE_TICKET"),this.dataGachaPon.arrTurns[1]));
        txtNote2.setString(this.dataGachaPon.ticketRequest * this.dataGachaPon.arrTurns[1]);
        lblNumTicket.setString(numTicket.toString());
    },
    changeTicket:function(sender){
        if (!this.canTouch) return ;
        if(!this.dataGachaPon) return;
        var name = sender.getName();
        this.turn = 1;
        switch (name){
            case "btnChange1": {
                this.turn= this.dataGachaPon.arrTurns[0];
                break;
            }
            case "btnChange2": {
                this.turn= this.dataGachaPon.arrTurns[1];
                break;
            }
        }

        if(this.dataGachaPon.numTicket < this.turn*this.dataGachaPon.ticketRequest)
        {
            var fullRequireItems = [];
            var item =  {};
            item.itemId = this.dataGachaPon.itemId;
            item.amount = this.turn*this.dataGachaPon.ticketRequest;
            fullRequireItems.push(item);

            var pos = FWUtils.getWorldPosition(sender);
            if(!Game.consumeItems(fullRequireItems, pos))
            {
                var displayInfo = {title:FWLocalization.text("TXT_GACHAPON_NOT_ENOUGH_TICKET"),content:FWLocalization.text("TXT_GACHAPON_NOT_ENOUGH_TICKET_CONTENT"), closeButton:true, okText:"TXT_BUY_NOW", avatar:NPC_AVATAR_ALADDIN};
                Game.showPopup(displayInfo, function () { Game.openShop(ITEM_ID_TICKET,function(){gv.chest.showPopup();}); });
            }

            return;
            //FWUtils.showWarningText(FWLocalization.text("TXT_GACHAPON_NOT_ENOUGH_TICKET"),FWUtils.getWorldPosition(sender));
            //return;
        }

        if(this.turn >1)
        {
            var displayInfo = {content:cc.formatStr(FWLocalization.text("TXT_GACHAPON_CONFIRMED"),this.turn), closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_ALADDIN,title:"TXT_GACHAPON_CHANGETICKETS"}; // feedback: remove title //var displayInfo = {title:"TXT_AS_CANCEL", content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO};
            Game.showPopup(displayInfo, this.showAnimGenie.bind(this));
        }
        else
        {
            this.showAnimGenie();
        }
    },
    showAnimGenie:function (){
        if(this.spineGenie)
        {
            if(this.spineTreasureLamp)
            {
                this.canTouch = false;
				//web
                this.spineGenie.runAction(cc.sequence(
				cc.callFunc(function()
				{
					this.spineTreasureLamp.setAnimation("lamp_active",false,function()
					{
						this.canTouch=true ;
						this.spineTreasureLamp.setAnimation("lamp_idle",true);
					}.bind(this))
				}.bind(this)),
				cc.delayTime(3),
				cc.callFunc(function()
				{
					this.onChangeConfirmed();
				}.bind(this))));
            }
        }
    },

    onChangeConfirmed:function(){
        if(!this.turn) return;
        this.dataGachaPon.numTicket -=  this.turn*this.dataGachaPon.ticketRequest;

        cc.log (this.LOGTAG,"RequestGachaponSpin ", this.turn, this.dataGachaPon.numTicket);
        var pk = network.connector.client.getOutPacket(gv.chest.RequestGachaponSpin);
        pk.pack(this.turn);
        network.connector.client.sendPacket(pk);

    },
    receiveRewardGacha:function(){
        var pk = network.connector.client.getOutPacket(gv.chest.RequestGachaponReceiveReward);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    notReceiveRewardGacha:function(){
        this.hide();
    },
    setDataGachaponFromServer: function(data){
        if(!this.dataGachaPon.data) return;
        this.dataGachaPon.data = data;

        this.fillDataTabGenie();
    },
    showRewardFromServer:function(data,color){//web showRewardFromServer:function(data,color = null){
		
		if(color === undefined)
			color = null;
		
        this.setDataGachaponFromServer(data);
        if(color) this.dataGachaPon.color = color;
        this.showPopupGift();
    },
    showPopupGift:function()
    {
        if(!this.dataGachaPon.data) return;
        if(this.dataGachaPon.data[GACHAPON_STATUS] == GACHAPON_STATUS_OPEN)
        {
            if(this.dataGachaPon.color)
            {
                cc.log(this.LOGTAG,"colorRewards",this.dataGachaPon.color);
            }
            //var mail = sender.uiData;
            var giftList = this.dataGachaPon.data[GACHAPON_REWARDS];
            var title = FWLocalization.text("TXT_GACHAPON_TITLE_RECEIVE_REWARDS") ;
            var receiveCallback = function() {gv.chest.popupMain.receiveRewardGacha();};//web
            var cancelCallback = function() {gv.chest.popupMain.notReceiveRewardGacha();};//web
            var needCheckStock = true;
            //var isPOSM = (giftList[EVENT_POSM_ITEM_ID] !== undefined && giftList[EVENT_POSM_ITEM_ID] > 0);
            Game.showGiftPopup(giftList, title, receiveCallback, cancelCallback, false, needCheckStock);
        }
    },
    showInfo:function(sender)
    {
        gv.miniPopup.showLeaderInfoGachaPon();
    },


	// fix: darken item bg when changing garden
	cleanupPanelRewards:function() {
		if(this.panelRewards)
		{
			var items = this.panelRewards.getItems();
			for(var i=0; i<items.length; i++)
			{
				items[i].removeChildByTag(999);
				FWPool.returnNode(items[i]);
			}
			this.panelRewards.removeAllItems();
		}
	},

    selectChest: function (index, instant) {//web selectChest: function (index, instant = false) {
		
		if(instant === undefined)
			instant = false;
		
        cc.log(this.LOGTAG, "selectChest:", index);

        var time = (instant) ? 0 : 0.15;
        var pages = this.panelChests.getPages();
        if (index >= 0 && index < pages.length) {

            this.activeChest = index;
if(cc.sys.isNative)
            this.panelChests.setCurPageIndex(this.activeChest);
else
            this.panelChests.scrollToPage(this.activeChest);//web this.panelChests.setCurPageIndex(this.activeChest);

            for (var i = 0; i < pages.length; i++) {

                var chestItem = this.panelChests.getPage(i);

                var targetScale = (i === index) ? UI_CHEST_SCALE_SELECTED : UI_CHEST_SCALE_UNSELECTED;

                var targetLightScale = (i === index) ? 1.0 : 0;
                var targetLightOpacity = (i === index) ? 255 : 0;

                if (chestItem.light && chestItem.light.getOpacity() !== targetLightOpacity) {
                    chestItem.light.stopAllActions();
                    chestItem.light.runAction(cc.spawn(cc.fadeTo(time, targetLightOpacity), new cc.EaseSineOut(cc.scaleTo(time, targetLightScale))));
                }

                if (chestItem.iconSpine && chestItem.iconSpine.getScale() !== targetScale) {
                    chestItem.iconSpine.stopAllActions();
                    if (i === index)
                        chestItem.iconSpine.runAction(cc.sequence(new cc.EaseSineOut(cc.scaleTo(time, targetScale + 0.05)), new cc.EaseSineOut(cc.scaleTo(time, targetScale))));
                    else
                        chestItem.iconSpine.runAction(new cc.EaseSineOut(cc.scaleTo(time, targetScale)));
                }
            }

            var chestData = this.chests[index];
            var chestRewards = chestData[CHEST_SLOTS];

            if (this.panelRewards) {
                //this.panelRewards.removeAllItems();
				this.cleanupPanelRewards();

                for (var i = 0; i < chestRewards.length; i++) {

                    if (UI_CHEST_EXCLUDE_REWARD_TYPES.findIndex(function(item) {return (chestRewards[i][CHEST_SLOT_ITEM] === item);}) !== -1)//web
                        continue;

                    var rewardItem = FWPool.getNode(UI_ITEM_NO_BG);
                    rewardItem.setContentSize(cc.size(UI_CHEST_REWARD_ITEM_SIZE, UI_CHEST_REWARD_ITEM_SIZE));

                    var background = new cc.Sprite("#hud/hud_barn_list_slot.png");
                    rewardItem.addChild(background, -1);

                    background.setAnchorPoint(cc.ANCHOR_CENTER());
                    background.setScale(110 / background.width);
                    background.setPosition(cc.p(rewardItem.width * 0.5, rewardItem.height * 0.5));
					background.setTag(999);

                    this.panelRewards.pushBackCustomItem(rewardItem);

                    var uiRewardDefine = {
                        Amount: { type: UITYPE_TEXT, id: cc.formatStr("x%d", chestRewards[i][CHEST_SLOT_NUM]), style: TEXT_STYLE_NUMBER, visible: false }
                    };

                    var rewardGfx = Game.getItemGfxByDefine(chestRewards[i][CHEST_SLOT_ITEM]);
                    if (rewardGfx.sprite) {
                        uiRewardDefine.ItemSprite = { visible:true, type: UITYPE_IMAGE, id: rewardGfx.sprite, scale: (rewardGfx.scale || 1.0) };
                        uiRewardDefine.ItemSpine = { visible: false };
                    }
                    else if (rewardGfx.spine) {
                        uiRewardDefine.ItemSprite = { visible: false };
                        uiRewardDefine.ItemSpine = { visible:true, type: UITYPE_SPINE, id: rewardGfx.spine, anim: rewardGfx.anim || "", skin: rewardGfx.skin || "", scale: (rewardGfx.scale || 1.0) };
                    }

                    FWUI.fillData(rewardItem, null, uiRewardDefine);
                }

                var chestCount = this.panelRewards.getItems().length;
                var isOverflow = chestCount > UI_CHEST_REWARD_ITEM_VIEWPORT;

                this.textDesc.setVisible(chestCount > 0);

                // this.buttonPrev.setVisible(isOverflow);
                // this.buttonNext.setVisible(isOverflow);
                this.panelRewards.setEnabled(isOverflow);

                var needWidth = 0;
                if (!isOverflow)
                    needWidth = (UI_CHEST_REWARD_ITEM_VIEWPORT - chestCount) * UI_CHEST_REWARD_ITEM_SIZE + (UI_CHEST_REWARD_ITEM_VIEWPORT - chestCount - 1) * UI_CHEST_REWARD_ITEM_MARGIN;

                var itemHead = new ccui.Layout();
                itemHead.setContentSize(cc.size(UI_CHEST_HEAD_ITEM_WITH + needWidth * 0.5, UI_CHEST_REWARD_ITEM_SIZE));
                this.panelRewards.insertCustomItem(itemHead, 0);

                var itemTail = new ccui.Layout();
                itemTail.setContentSize(cc.size(UI_CHEST_HEAD_ITEM_WITH + needWidth * 0.5, UI_CHEST_REWARD_ITEM_SIZE));
                this.panelRewards.pushBackCustomItem(itemTail);
            }

            this.updatePrice(chestData[CHEST_ID]);
            this.updateTime();

            AudioManager.effect (EFFECT_ITEM_TOUCH);
			
			// jira#5511
			this.textLimit.setString(FWLocalization.text(chestData[CHEST_ID] === "C5" ? "TXT_CHEST_OUT_LIMIT_2" : "TXT_CHEST_OUT_LIMIT"));
        }
    },

    updateTime: function (dt) {
        var index = this.panelChests.getCurPageIndex();
        if (index >= 0 && index < this.chests.length) {
            var chestId = this.chests[index][CHEST_ID];
            var chestNum = gv.userStorages.getItemAmount(chestId);
            if (chestNum <= 0)
            {
                var activeChest = this.chests[index];
                var activeChestDuration = Math.max(activeChest[CHEST_TIME_FINISH] - activeChest[CHEST_TIME_START], 0);
                var activeChestTimeLeft = Math.max(activeChest[CHEST_TIME_FINISH] - Game.getGameTimeInSeconds(), 0);

                this.barTime.setPercent((activeChestDuration > 0) ? activeChestTimeLeft * 100 / activeChestDuration : 0);
                this.textTime.setString(FWUtils.secondsToTimeString(activeChestTimeLeft));

                this.panelTime.setVisible(activeChest[CHEST_STATUS] == CHEST_STATUS_ACTIVE && activeChestDuration > 0 && activeChestTimeLeft > 0);
            } else {
                this.panelTime.setVisible(false);
            }

            this.updatePrice(chestId);//this.updatePrice(index);
        }
    },

    updateChest: function (index) {
        this.chests = _.sortBy(gv.chest.getChestAll(), function(item) {return g_GACHA_CHEST[item[CHEST_ID]].DISPLAY_ORDER;});//web
        if (index >= 0 && index < this.panelChests.getPages().length) {

            var chestId = this.chests[index][CHEST_ID];
			var chestNum = gv.userStorages.getItemAmount(chestId); 
            var chestActive = (this.chests[index][CHEST_STATUS] == CHEST_STATUS_ACTIVE || chestNum > 0);

            var chestItem = this.panelChests.getPage(index);
            chestItem.iconSpine = FWUI.getChildByName(chestItem, "iconSpine");
            if (chestItem.iconSpine) {
                chestItem.spine = FWUI.fillData_spine2(chestItem.iconSpine, SPINE_CHEST, UI_CHEST_SKINS[chestId], "", 1.0);
                chestItem.spine.setAnimation(0, UI_CHEST_ANIM_IDLE, chestActive);
                FWUtils.applyGreyscaleSpine(chestItem.spine, !chestActive);
            }

            if (this.textLimit)
                this.textLimit.setVisible(!chestActive);
        }
    },

    updatePrice: function (index) {

        var chest = gv.chest.getChest(index);
        if (!chest)
            return;
		
        var chestNum = gv.userStorages.getItemAmount(index);        
        var chestActive = chest[CHEST_STATUS] == CHEST_STATUS_ACTIVE;;
        var chestPriceType = chest[CHEST_PRICE_TYPE];
        var chestPriceValue = chest[CHEST_PRICE_TURN];

        var chestTimeLeft = Math.max(chest[CHEST_TIME_FINISH] - Game.getGameTimeInSeconds(), 0);
        var chestAvailable = chestActive && chestTimeLeft <= 0;

        if (chestNum > 0) {
            this.panelNum.setVisible(true);
            this.textNum.setString('x' + chestNum);

            this.buttonOpenFree.setVisible(true);
            this.buttonOpenCoin.setVisible(false);
            this.buttonOpenGold.setVisible(false);
            this.buttonOpenRepu.setVisible(false);
        } else {
            this.panelNum.setVisible(false);
            this.buttonOpenFree.setVisible(chestAvailable && chestPriceValue <= 0);
            this.buttonOpenCoin.setVisible(chestAvailable && chestPriceType === ID_COIN && chestPriceValue > 0);
            this.buttonOpenGold.setVisible(chestAvailable && chestPriceType === ID_GOLD && chestPriceValue > 0);
            this.buttonOpenRepu.setVisible(chestAvailable && chestPriceType === ID_REPU && chestPriceValue > 0);
        }

        if (this.buttonOpenFree.isVisible()) {
            FWUtils.setTextAutoExpand(FWLocalization.text("TXT_CHEST_OPEN_FREE"), this.buttonOpenFree, this.textFree);
        }

        if (this.buttonOpenCoin.isVisible()) {
            FWUtils.setTextAutoExpand(FWUtils.formatNumberWithCommas(chestPriceValue), this.buttonOpenCoin, this.textPriceCoin, this.iconCoin);
            this.textPriceCoin.setTextColor(gv.userData.isEnoughCoin(chestPriceValue) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
        }

        if (this.buttonOpenGold.isVisible()) {
            FWUtils.setTextAutoExpand(FWUtils.formatNumberWithCommas(chestPriceValue), this.buttonOpenGold, this.textPriceGold, this.iconGold);
            this.textPriceGold.setTextColor(gv.userData.isEnoughGold(chestPriceValue) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
        }

        if (this.buttonOpenRepu.isVisible()) {
            FWUtils.setTextAutoExpand(FWUtils.formatNumberWithCommas(chestPriceValue), this.buttonOpenRepu, this.textPriceRepu, this.iconRepu);
            this.textPriceRepu.setTextColor(gv.userData.isEnoughReputation(chestPriceValue) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
        }

        if (this.textLimit)
            this.textLimit.setVisible(!chestActive && chestNum <= 0);
    },
    
    openChest: function (chestIndex) {
        cc.log(this.LOGTAG, "openChest:", "chestIndex:", chestIndex);

        this.isChestOpening = this.isChestOpening || false;
        if (this.isChestOpening)
            return;
        
        var chest = this.chests[chestIndex];
        if (chest) {            
            this.openingChest = chestIndex;
			this.panelEffectBackButton.setVisible(false);

            var rewards = [];
            var winSlot = chest[CHEST_WIN_SLOT];
            if (winSlot >= 0) {
                var slot = chest[CHEST_SLOTS][winSlot];
                var info = {
                    itemId: slot[CHEST_SLOT_ITEM],
                    itemAmount: slot[CHEST_SLOT_NUM],
					itemDisplayAmount: slot[CHEST_SLOT_NUM] > 1 ? "x" + slot[CHEST_SLOT_NUM] : ""
                };
                rewards.push(info);
            }

            // fill reward items

            FWUI.fillData_2dlist(this.panelEffectChestRewards, null, {
                items: rewards,
                itemUI: UI_REWARD_ITEM,
                itemDef: {
                    textAmount: { type: UITYPE_TEXT, field: "itemDisplayAmount", style: TEXT_STYLE_TEXT_BIG }//textAmount: { type: UITYPE_TEXT, field: "itemAmount", format: "x%d", style: TEXT_STYLE_TEXT_BIG_GREEN }
                },
                itemSize: cc.size(UI_CHEST_REWARD_OPEN_ITEM_WIDTH, UI_CHEST_REWARD_OPEN_ITEM_HEIGHT)
            });

            // adjust rewards panel

            var newWidth = rewards.length * UI_CHEST_REWARD_OPEN_ITEM_WIDTH;
            this.panelEffectChestRewards.setContentSize(cc.size(newWidth, this.panelEffectChestRewards.height));
            this.panelEffectChestRewards.setPositionX((cc.winSize.width - newWidth) * 0.5);
            this.panelEffectChestRewards.setVisible(true);

            // show effect unlock chest

            var delayOpenChest = 0.5;//1.0; // jira#5577
            var openChest = cc.callFunc(function() {//web
                this.effectChest.setAnimation(UI_CHEST_ANIM_OPEN, false, function() {
                    this.effectChest.setAnimation(UI_CHEST_ANIM_OPEN_IDLE, true);
                }.bind(this));
                AudioManager.effect (EFFECT_UPGRADE_SUCCESS);
            }.bind(this));

            this.panelEffect.setVisible(true);
            this.panelEffect.setOpacity(255);
            this.panelEffect.runAction(cc.sequence(cc.delayTime(delayOpenChest), openChest));

            this.effectChest.resetAnimation();
            this.effectChest.setSkin(UI_CHEST_SKINS[chest[CHEST_ID]]);
            this.effectChest.setAnimation(UI_CHEST_ANIM_IDLE, true);
            this.effectChest.spine.setTimeScale(2); // jira#5577

            this.effectUnlock.spine.clearTrack();
            this.effectUnlock.setAnimation(UI_CHEST_ANIM_UNLOCK, false);
			this.effectUnlock.spine.setTimeScale(2); // jira#5577

            // show poping rewards from chest

            var startPosition = cc.PADD(FWUtils.getWorldPosition(this.panelEffectChest), cc.p(0, -100));
            startPosition = this.panelEffectChestRewards.convertToNodeSpace(startPosition);

            var listRewards = this.panelEffectChestRewards.getChildren();
            for (var i = 0; i < listRewards.length; i++) {

                // init reward light

                var itemLight = FWUI.getChildByName(listRewards[i], "light");
				
				// jira#5554
				if (itemLight.light)
				{
					itemLight.light.uninit();
					itemLight.light = null;
				}
				
                if (!itemLight.light) {
                    itemLight.light = new FWObject();
                    itemLight.light.initWithSpine(SPINE_EFFECT_POT_SLOT);
                    itemLight.light.setAnimation("effect_light_icon", true);
                    itemLight.light.setScale(1.5);//itemLight.light.setScale(0.6);
                    itemLight.light.setParent(itemLight);
                    itemLight.light.setPosition(0, 0);
                }

                // init reward image

                var itemGfx = Game.getItemGfxByDefine(rewards[i].itemId);
                if (itemGfx.sprite) {
                    FWUI.fillData(listRewards[i], null, {
                        sprite: { type: UITYPE_IMAGE, id: itemGfx.sprite, scale: 1.5, visible: true },
                        spine: { visible: false }
                    });
                }
                else if (itemGfx.spine) {
                    FWUI.fillData(listRewards[i], null, {
                        sprite: { visible: false },
                        spine: { type: UITYPE_SPINE, id: itemGfx.spine, skin: itemGfx.skin || "", anim: itemGfx.anim || "", scale: (itemGfx.scale || 1) * 1.5, visible: true }
                    });
                }

                // run reward actions

                var actionCallback = cc.callFunc(function(target) {

                    cc.log(this.LOGTAG, "openChestRewardEnded");

                    var textAmount = FWUI.getChildByName(target, "textAmount");
                    textAmount.setOpacity(0);
                    textAmount.runAction(cc.sequence(cc.show(), cc.fadeIn(0.2)));

                    this.isChestOpening = false;
					this.panelEffectBackButton.setVisible(true);

                }.bind(this), listRewards[i]);

                var textAmount = FWUI.getChildByName(listRewards[i], "textAmount");
                textAmount.setVisible(false);

                var scaleAction = cc.sequence(new cc.EaseSineOut(cc.scaleTo(0.3, 1.1)), new cc.EaseSineOut(cc.scaleTo(0.3, 1.0)));
                var moveAction = new cc.EaseSineOut(cc.moveTo(0.3, listRewards[i].getPosition()));

                listRewards[i].stopAllActions();
                listRewards[i].setScale(0);
                listRewards[i].setOpacity(0);
                listRewards[i].setPosition(startPosition);
                listRewards[i].runAction(cc.sequence(cc.delayTime(delayOpenChest + 1.0), cc.spawn(scaleAction, moveAction, cc.fadeIn(0.3)), actionCallback)); // jira#5577 2.0 => 1.0

                listRewards[i].uiBaseData = rewards[i];
                listRewards[i].addClickEventListener(function(sender) {
                    this.getReward();
                }.bind(this));
            }

            // reset particle

            this.effectParticle.resetSystem();
            this.isChestOpening = true;
			
			// jira#5561
			this.textLimit.setVisible(false);
        }
    },

    getReward: function () {   
        if (this.isChestOpening)
            return; 
            
        var openChestId = this.chests[this.openingChest][CHEST_ID];
        cc.log(this.LOGTAG, "getReward", "openingChest", this.openingChest, "openChestId", openChestId);

        var rewards = [];
        var listRewards = this.panelEffectChestRewards.getChildren();
        for (var i = 0; i < listRewards.length; i++) {            
            rewards.push({
                itemId: listRewards[i].uiBaseData.itemId,
                amount: listRewards[i].uiBaseData.itemAmount
            });
        }
		
        if (!Game.canReceiveGift(rewards, true)) 
            return;  
		
		// rating
		for(var i=0; i<rewards.length; i++)
		{
			var potInfo = g_POT[rewards[i].itemId];
			if(potInfo)
			{
				var comboId = potInfo.COMBO_ID;
				if(comboId === "CP7" || comboId === "CP8" || comboId === "CP9" || comboId === "CP10")
				{
					Game.shouldShowRatingPopup = true;
					break;
				}
			}
		}
		
        gv.chest.requestChestGetReward(openChestId);
    },

    hideReward: function () {
        this.isChestOpening = this.isChestOpening || false;
        if (this.isChestOpening)
            return;
        
        this.panelEffectChestRewards.setVisible(false);

        var rewards = [];
        var listRewards = this.panelEffectChestRewards.getChildren();
        for (var i = 0; i < listRewards.length; i++) {
            var sprite = FWUI.getChildByName(listRewards[i], "sprite");
            rewards.push({
                itemId: listRewards[i].uiBaseData.itemId,
                itemAmount: listRewards[i].uiBaseData.itemAmount,
                itemPosition: FWUtils.getWorldPosition(sprite),
            });
        }

        if (rewards.length > 0) {
            gv.popup.showFlyingReward(rewards, 0, function() {
                this.panelEffect.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.2), cc.hide()));
            }.bind(this));
        }
    },

    onChestItemSelected: function (sender, type) {
		//web
		if(sender.getCurPageIndex() === this.activeChest)
			return;
		
        cc.log(this.LOGTAG, "onChestItemSelected", "pageIndex:", sender.getCurPageIndex() + " eventType=" + type + " " + ccui.PageView.EVENT_TURNING);
        if (type === ccui.PageView.EVENT_TURNING || !cc.sys.isNative) {
			this.canOpenChest = true;
            this.selectChest(sender.getCurPageIndex());
        }
    },

    onChestItemTouched: function (sender) {
        cc.log(this.LOGTAG, "onChestItemTouched", "index:", sender.uiData.index);
        this.panelChests.scrollToPage(sender.uiData.index);
        if (sender.uiData.index === this.panelChests.getCurPageIndex()) {
        }
    },
	
	onChestItemScroll:function(sender) {
		this.canOpenChest = false;
	},

    onChestOpenResponse: function (packet) {
        cc.log(this.LOGTAG, "onChestOpenResponse", "packet: %j", packet);
        if (packet.error === 0) {
            cc.log(this.LOGTAG, "openingChest", this.openingChest);
            if (this.openingChest >= 0) {

                this.updateChest(this.openingChest);
                this.updatePrice(this.openingChest);

                this.selectChest(this.openingChest);
                this.openChest(this.openingChest);
            }
        }
    },

    onChestGetRewardResponse: function (packet) {
        cc.log(this.LOGTAG, "onChestGetRewardResponse", "packet: %j", packet);
        if (packet.error === 0) {
            cc.log(this.LOGTAG, "getRewardChest", this.openingChest);
            if (this.openingChest >= 0) {

                this.updateChest(this.openingChest);
                this.updatePrice(this.openingChest);

                this.selectChest(this.openingChest);

                this.hideReward();
            }
        }
    },

    onButtonOpenTouched: function (sender) {
		
		if(!this.canOpenChest || !sender.isVisible())
			return;
		
        cc.log(this.LOGTAG, "onButtonOpenTouched");
        var index = this.panelChests.getCurPageIndex();
        if (index >= 0 && index < this.chests.length) {
            var priceType = this.chests[index][CHEST_PRICE_TYPE];
            var priceValue = this.chests[index][CHEST_PRICE_TURN];
            if (priceType === "" || gv.userData.isEnoughForPrice(priceType, priceValue)
				|| gv.userStorages.getItemAmount(this.chests[index][CHEST_ID]) > 0) { // jira#5139
                this.openingChest = index;
                gv.chest.requestChestOpen(this.chests[index][CHEST_ID], priceValue);
            }
            else {
                if (priceType === ID_REPU) {
                    FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_REPU_CONTENT"), FWUtils.getWorldPosition(sender));
                }
                else if (priceType === ID_GOLD) {
                    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
                }
                else if (priceType === ID_COIN) {
                    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                }
            }
        }
    },
});