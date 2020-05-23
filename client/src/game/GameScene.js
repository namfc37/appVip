
const NEWS_POPUP_LEVEL = 11;

const UIMAIN_IMG_STOCK_SCALE = 0.6;
var isShowTransition = false;

// jira#6034
var startGamePopups = ["daily_reward", "offer", "event"];
var startGamePopupIdx = -1;

var showPopupByName = function(name)
{
	if(startGamePopupIdx === -2)
	{
		startGamePopupIdx = -1;
		startGamePopups = [name];
	}
	else
		startGamePopups.push(name);
};

var GameScene = cc.Scene.extend
({
	background: null,
	draggingPot: null, // opt
	
	// jira#6051
	lastActionTime: 0, 
	// feedback: no popup
	//isIdleDisconnected: false,
	willDisconnect: false,

	onEnter: function () {
		this._super();

        // transition effect
		if (!isShowTransition)
			this.showTransition ();
		
		// fix scene changing bugs
		gv.arcade = ArcadeManager.getInstance();
		gv.chest = ChestManager.getInstance();
		gv.userMachine = MachineManager.getInstance();
		gv.ibshop = IBShopManager.getInstance();
		gv.wheel = WheelManager.getInstance();
		gv.tomkid = TomManager.getInstance();
		gv.smithy = SmithyManager.getInstance();
		gv.dice = DiceManager.getInstance();
		gv.chest = ChestManager.getInstance();
		
		// fix: crash in private shop when changing garden
		FWLoader.loadWidgetToPool(UI_PRIVATE_SHOP, 1);
		// jira#5452
		FWLoader.loadWidgetToPool(UI_STORAGE, 1);
		// fix: empty smithy screen after visiting friend
		FWLoader.loadWidgetToPool(UI_SMITHY_FORGE, 1);
		FWLoader.loadWidgetToPool(UI_SMITHY_MAIN, 1);

		//GameEvent.init();
		this.background = new Background();
		gv.background = this.background;
		this.addChild(this.background);

		gv.gameBuildingStorageInterface = new ClassGameBuildingStorage();
		this.addChild(gv.gameBuildingStorageInterface);

		CloudFloors.init();
		CloudFloors.show();
		
		Orders.init();
		PrivateShop.init();
		Airship.init();
		MailBox.init();
		Mining.init();
		Mining.load();
		FriendList.init();
		CloudSkin.init();
		Minigame.init();
		//Ranking.init();
		Truck.init();
		NewsBoard.refreshNewsboardAnim();
		Tutorial.initInGameScene();		
		FWObjectManager.updateVisibility(-1);

		this.initFocusPointer();
		this.showUIMain();
		this.scheduleUpdate();
		Marquee.init();
		Tutorial.initTutorialProgress();

		// jira#4676
        var keyboardListener = cc.EventListener.create
		({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event)
			{
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.escape)
                    this.handleBackKey();//gv.miniPopup.showGameQuit();
				else if(keyCode === cc.KEY.c)
					this.countObjects();
				else if(keyCode === cc.KEY.p)
					this.countPool();
				else if(keyCode === cc.KEY.t)
				{
					if(cc.sys.isNative)
						cc.log(cc.textureCache.getCachedTextureInfo());
					else
						cc.log(cc.textureCache.dumpCachedTextureInfo());
				}
				else if(keyCode === cc.KEY.enter)
					this.handleEnterKey();
                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardListener, this);
		
		//cc.director.getScheduler().scheduleCallbackForTarget(network, network.sendRequestPing, 30, cc.REPEAT_FOREVER, 0, false); // moved to Game.js
		cc.director.getScheduler().scheduleCallbackForTarget(Tutorial, function() {Tutorial.init2(); Tutorial.onGameEvent(EVT_START_GAME);}, 0, 0, 1, false);
		
		// jira#5585
		if(!gv.gameClient.isConnected)
			gv.gameClient.popupReconect = gv.miniPopup.showDisconnect();

		// initialization of left right buttons
		this.updateDynamicButton();
		if(ENABLE_QUEST_BOOK)
			QuestBook.refreshHomeIcon();
		if(ENABLE_QUEST_MISSION)
			QuestMission.refreshHomeIcon();
		if (g_MISCINFO.GUILD_ACTIVE && this.uiMainBtnChat)
			this.uiMainBtnChat.setVisible (Chatbox.check());
		this.lastActionTime = Game.getGameTimeInSeconds();
		
		// (?) cocos keeps instance of backKeyStack of previous game scene
		this.backKeyStack = [];
    },

	onExit: function () {
		Airship.uninit();
		Orders.uninit();
		//Tutorial.uninit(); moved to Game.js
		PrivateShop.uninit();
		Mining.uninit();
		FriendList.uninit();
		CloudSkin.uninit();
		//Ranking.uninit();
		Truck.uninit();
		Marquee.uninit();
		Minigame.uninit();
		QuestMission.uninit();
		Tutorial.uninitTutorialProgress();
		this.uninitFocusPointer();
		this._super();
		this.unscheduleUpdate();
		gv.background = this.background = null;
		//cc.director.getScheduler().unscheduleCallbackForTarget(network, network.sendRequestPing); // moved to Game.js
		cc.director.getScheduler().unscheduleCallbackForTarget(Game, Game.onSkipTimeUpdate);
		
		// fix scene changing bugs
		if(this.uiMainImgStock)
		{
			this.uiMainImgStock.retain();
			this.uiMainImgStock.removeFromParent();
			this.uiMainImgStock.originalParent.addChild(this.uiMainImgStock);
			this.uiMainImgStock.setScale(this.uiMainImgStock.originalScale);
			this.uiMainImgStock.release();
		}
		
		// fix: private shop crashes when changing garden
		FWPool.removeNodes(UI_PRIVATE_SHOP);
		// jira#5452
		FWPool.removeNodes(UI_STORAGE);
		// fix: empty smithy screen after visiting friend
		FWPool.removeNodes(UI_SMITHY_FORGE);
		FWPool.removeNodes(UI_SMITHY_MAIN);
		
		// web opt
		var uiIBShop = FWPool.getNode(UI_IB_SHOP_MAIN, false);
		uiIBShop.hasShownOnce = false;
		FWPool.returnNode(uiIBShop);
		
		CloudFloors.uninit();
		gv.arcade = ArcadeManager._instance = null;
		gv.chest = ChestManager._instance = null;
		gv.userMachine = MachineManager._instance = null;
		gv.ibshop = IBShopManager._instance = null;
		gv.gameBuildingStorageInterface = null;
		gv.wheel = WheelManager._instance = null;
		gv.tomkid = TomManager._instance = null;
		gv.smithy = SmithyManager._instance = null;
		gv.dice.cleanup();
		gv.dice = DiceManager._instance = null;
		gv.chest = ChestManager._instance = null;

		FWObjectManager.cleanup();
		FWPool.returnNodes();
		FWUtils.onSceneExit();
		Game.gameScene = null;
		
		//fix: games building wont change animation
		FWPool.removeNodes(SPINE_BUILDING_GAMES);
	},
	
	update: function (dt) {
		if (DEBUG_BOUNDING_BOXES_ZORDER > 0)
			FWUtils.resetBoundingBoxes();

		// refresh ui main
		if(Game.uiMainRefreshFlags !== RF_NONE)
		{
			this.refreshUIMain(Game.uiMainRefreshFlags);
			Game.uiMainRefreshFlags = RF_NONE;
		}
		
		if(this.uiMainImgStockTimer > 0)
		{
			this.uiMainImgStockTimer -= dt;
			if(this.uiMainImgStockTimer <= 0)
				this.showStockImage(false);
		}
		
		if(this.draggingPot)
		{
			// also move pot menu while dragging pot
			var widget = FWPool.getNode(UI_POT_MENU, false);
			if(FWUI.isWidgetShowing(widget) === true)
				widget.setPosition(this.draggingPot.getPosition());
		}

		this.updateDynamicButton ();
		
		var lockedFloorWidget = CloudFloors.lockedFloorWidget;
		if(lockedFloorWidget
			&& gv.userData.getLevel() >= g_FLOOR[lockedFloorWidget.getTag()].USER_LEVEL
			&& CloudFloors.lockedFloorWidget.getParent()
			&& Tutorial.isMainTutorialFinished()
			&& !Game.isFriendGarden())
		{
			this.uiMainBtnUnlockFloor.setVisible(true);
			var pos = FWUtils.getWorldPosition(CloudFloors.lockedFloorWidget);
			pos.y += 150 + Math.sin(Game.totalTime * 5) * 10;
			this.uiMainBtnUnlockFloor.setPosition(pos);
		}
		else
			this.uiMainBtnUnlockFloor.setVisible(false);
		
		if(!cc.sys.isNative && !AudioManager.isMusicPlaying())
			AudioManager.music (MUSIC_BACKGROUND, true);
		
		Game.framesCount++;
		Game.totalTime += dt;
		
		// feedback: no popup
		//if(this.lastActionTime > 0 && Game.getGameTimeInSeconds() - this.lastActionTime > 600 && !this.isIdleDisconnected)
		//{
		//	this.isIdleDisconnected = true;
		//	var displayInfo = {content:"TXT_IDLE_CONTENT"};
		//	var popup = Game.showPopup(displayInfo, this.onReloadGame.bind(this));
		//	popup.setLocalZOrder(Z_TOUCH_EATER);
		//	this.onReloadGame();
		//}
		if(this.lastActionTime > 0)
		{
			if(Game.getGameTimeInSeconds() - this.lastActionTime > 600)
				this.willDisconnect = true;
			else if(this.willDisconnect)
			{
				this.willDisconnect = false;
				this.onReloadGame();
			}
		}
		
		// jira#6034
		if(startGamePopupIdx >= -1 && Tutorial.isMainTutorialFinished())
		{
			if(!Game.isAnyPopupShowing() && Game.getGameTimeInSeconds() - this.lastActionTime > 0.25 && FWUtils.getCurrentScene() === this)
			{
				startGamePopupIdx++;
				if(startGamePopupIdx >= startGamePopups.length)
				{
					// done
					startGamePopupIdx = -2;
				}
				else
				{
					var popupName = startGamePopups[startGamePopupIdx];
					if(popupName === "daily_reward")
						gv.dailygift.showDailyGift(0);
					else if(popupName === "offer")
					{
						if (gv.offerPanel.check())
							gv.offerPanel.show();
					}
					else if(popupName === "event"
						&& gv.userData.getLevel() >= NEWS_POPUP_LEVEL && gv.userData.game[GAME_IS_RESET_DAILY]) // jira#6380
						GameEvent.showInfo();
					else if(popupName === "MGMatch")
						MGMatch.showIntro();
				}
			}
		}
	},
	
	onReloadGame:function()
	{
		// jira#7288
		if(!cc.sys.isNative)
			return;
		
		// feedback: no popup
		//this.isIdleDisconnected = false;
		
		try
		{
			if (gv.gameClient.tcpClient)
				gv.gameClient.tcpClient.disconnect();			
		}
		catch(e) {}		
		
		try
		{
			if (gv.chatClient)
				gv.chatClient.disconnect();
		}
		catch(e) {}		
	},

	updateDynamicButton: function ()
	{
		if (this.updateDynamicButtonNextTime > Game.totalTime)
			return;

		// cc.log ("updateDynamicButton", this.updateDynamicButtonNextTime);

		this.updateDynamicButtonNextTime = Game.totalTime + 5;
		var change = false;

		for (var i in this.leftButton)
		{
			var btn = this.leftButton [i];
			if (btn.check () != btn.isShow)
			{
				change = true;
				break;
			}
		}

		if (!change)
		for (var i in this.rightButton)
		{
			var btn = this.rightButton [i];
			if (btn.check () != btn.isShow)
			{
				change = true;
				break;
			}
		}
		
		if (change)
			this.showDynamicButton ();
		
		if(ENABLE_CLOUD_SKIN)
			CloudSkin.checkSkinExpiration();

		if (g_MISCINFO.GUILD_ACTIVE && this.uiMainBtnChat)
		{
			var check = Chatbox.check();
			var haveNew = check ? Chatbox.haveNew() : false;

			this.uiMainBtnChat.setVisible (check);
			this.uiMainChatNotify.setVisible (haveNew);
		}
	},
	
	uiMainImgStockTimer: 0,
	showStockImage:function(isShow, duration)//web showStockImage:function(isShow = true, duration = 3)
	{
		if(isShow === undefined)
			isShow = true;
		if(duration === undefined)
			duration = 3;
		
		if(isShow)
		{
			this.uiMainImgStockTimer = duration;
			if(!this.uiMainImgStock.isVisible())
			{
				this.uiMainImgStock.setVisible(true);
				this.uiMainImgStock.setScale(0);
				this.uiMainImgStock.runAction(cc.scaleTo(0.15, UIMAIN_IMG_STOCK_SCALE));
			}
		}
		else
		{
			if(this.uiMainImgStock.isVisible())
			{
				this.uiMainImgStock.stopAllActions();
				this.uiMainImgStock.setScale(UIMAIN_IMG_STOCK_SCALE);
				this.uiMainImgStock.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(function() {this.uiMainImgStock.setVisible(false);}.bind(this))));
			}
		}
	},

	showTransition: function ()
	{
		isShowTransition = true;

		//var uiDef = 
		//{
		//	logo:{visible:true},
		//	logo2:{visible:false}
		//};
		var fakeLoading = FWPool.getNode(UI_ZLOADING, false);
if(!cc.sys.isNative)
		fakeLoading.removeFromParent(); //web
		//FWUI.fillData(fakeLoading, null, uiDef);
		
		fakeLoading.setOpacity (255);
		fakeLoading.setLocalZOrder(Z_TOUCH_EATER);
		this.addChild (fakeLoading);

		var cloud = new FWObject();
		cloud.initWithSpine(SPINE_LOADING_GAME);
		cloud.setPosition(cc.p (cc.winSize.width * 0.5, cc.winSize.height * 0.5));
		cloud.setParent(this);
		cloud.setLocalZOrder(Z_TOUCH_EATER);
		cloud.setAnimation("close", false, function() {//web
			this.removeChild (fakeLoading);
			FWPool.returnNode(fakeLoading);
			cloud.setAnimation("open", false, function() {cloud.node.removeFromParent();});
			FWLoader.discardTexture(LOADING_BACKGROUND_IMAGE);
		}.bind(this));

		// jira#6034
		//if (gv.offerPanel.check())
		//	gv.offerPanel.show(() => gv.dailygift.showDailyGift(100));
		//else
		//	gv.dailygift.showDailyGift();
	},

	// jira#5178
	backKeyStack:[],
	registerBackKey:function(func)
	{
		if(this.backKeyStack.indexOf(func) >= 0)
			return;
		this.backKeyStack.push(func);
	},
	
	unregisterBackKey:function(func)
	{
		FWUtils.removeArrayElement(this.backKeyStack, func);
	},
	
	handleBackKey:function()
	{
		if(!Tutorial.isMainTutorialFinished()&& Tutorial.isRunning())
			return;
		
		if(this.backKeyStack.length > 0)
		{
			var func = this.backKeyStack[this.backKeyStack.length - 1];
			func();
		}
		else
			gv.miniPopup.showGameQuit();
	},
	
	onEnterKey:null,
	registerEnterKey:function(callback)
	{
		this.onEnterKey = callback;
	},
	
	unregisterEnterKey:function()
	{
		this.onEnterKey = null;
	},
	
	handleEnterKey:function()
	{
		if(!Tutorial.isMainTutorialFinished())
			return;
		
		if (this.onEnterKey)
			this.onEnterKey ();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// ui main //////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	uiMainPrgExp: null,
	uiMainLblLevel: null,
	uiMainLblExp: null,
	uiMainLblGold: null,
	uiMainLblCoin: null,
	uiMainLblHeart: null,
	uiMainImgExp: null,
	uiMainImgGold: null,
	uiMainImgCoin: null,
	uiMainImgHeart: null,
	uiMainImgStock: null,
	uiMainBtnOrder: null,
	uiMainMailNotify: null,
	uiMainBtnMail: null,
	uiMainChatNotify: null,
	uiMainBtnChat: null,
	uiMainBtnScrollDown: null,
	uiMainBtnUnlockFloor: null,
	pnlLeftButtons: null,
	pnlRightButtons: null,

	showDynamicButton: function (force)
	{
		// jira#6078
		// tmp: showing UI_HOME causes exception in tutorial
		//if(!force && !Tutorial.isMainTutorialFinished())
		//	return;
		
		if(!this.pnlLeftButtons)
		{
			var widget = FWPool.getNode(UI_HOME, false);
			this.pnlLeftButtons = FWUtils.getChildByName(widget, "pnlLeftButtons");
			this.pnlRightButtons = FWUtils.getChildByName(widget, "pnlRightButtons");
		}

		if (Game.isFriendGarden())
		{
			// fix: showing UI_HOME causes flicker
			// var uiDef =
			// {
				// pnlLeftButtons:{visible:false},
				// pnlRightButtons:{visible:false},
			// };
			// FWUI.showWithData(UI_HOME, null, uiDef, this);
			// return;
			this.pnlLeftButtons.setVisible(false);
			this.pnlRightButtons.setVisible(false);
			return;
		}
		
		if (!this.leftButton)
		{
			this.leftButton = [];
			
			this.leftButton.push ({
				define: {id:"dailyGift", sprite:"hud/icon_daily_gift.png"},
				//position: [0, 0],
				isShowing: false,
				// jira#6372
				//check: () => {return (gv.userData.getLevel() >= g_MISCINFO.DAILY_GIFT_USER_LEVEL && gv.dailygift.getMilestoneIndex() >= 0 && Tutorial.isMainTutorialFinished());}
				check: function() {return ((gv.userData.getLevel() >= g_MISCINFO.DAILY_GIFT_USER_LEVEL + 1 || !(!gv.dailygift.popupMain)) && gv.dailygift.getMilestoneIndex() >= 0 && Tutorial.isMainTutorialFinished());}
			});
			
			this.leftButton.push ({
				define: {id:"eventNews", sprite:"hud/icon_news.png"},
				//position: [0, 1],
				isShowing: false,
				//check: () => {return (GameEvent.getActiveEvent() !== null && gv.userData.getLevel() >= g_MISCINFO.EV01_USER_LEVEL && Tutorial.isMainTutorialFinished());}
				check: function() {return (Tutorial.isMainTutorialFinished());}
			});
			
			if(ENABLE_QUEST_BOOK)
			{
				this.leftButton.push ({
					define: {id:"questBook", sprite:"hud/icon_questbook.png"},
					//position: [0, 2],
					isShowing: false,
					check: function() {return QuestBook.check();}
				});
			}

			if(ENABLE_QUEST_MISSION)
			{
				this.leftButton.push ({
					define: {id:"questMission", sprite:"hud/icon_mission.png"},
					isShowing: false,
					check: function() {return QuestMission.check();}
				});
			}
		}

		if (!this.rightButton)
		{
			this.rightButton = [];
			
			this.rightButton.push ({
				define: {id:"offer", spine:SPINE_GIFT_OFFERS, anim:"gift_offer_active3", scale: 0.5},
				isShowing: false,
				check: function() {return gv.offerPanel.check();}
			});
			
			this.rightButton.push ({
				define: {id:"panelVip", spine:SPINE_ICON_VIP, anim:gv.vipManager.check()?"icon_vip":"icon_vip_active"},
				isShowing: false,
				check: function() {return (gv.vipManager.checkActive() && !Game.isFriendGarden());}
			});

			this.rightButton.push ({
				define: {id:"consume", spine:SPINE_CONSUME, anim:"icon_archery_active" },
				isShowing: false,
				check: function() {return gv.consumEventMgr.check();}
			});
		}
		
		var leftButtonList = [];
		//var leftButtonPosition = [];
		var leftItemDef =
		{
			//button:{type:UITYPE_IMAGE, field:"sprite", onTouchEnded:this.onUIMainButton.bind(this), isLRButton:true},
			//fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", visible:"data.hasFx", scale:0.75},
			homeButton:{onTouchEnded:this.onUIMainButton.bind(this)},
			sprite:{type:UITYPE_IMAGE, field:"sprite", onTouchEnded:this.onUIMainButton.bind(this), visible:"data.sprite !== undefined"},
			spine:{type:UITYPE_SPINE, field:"spine", animField:"anim", visible:"data.spine !== undefined", scale:"data.scale"}
		};

		for (var i in this.leftButton)
		{
			var btn = this.leftButton [i];
			if (btn.check ())
			{
				leftButtonList.push (btn.define);
				//leftButtonPosition.push (btn.position);
				btn.isShow = true;
			}
			else
				btn.isShow = false;
		}

		var rightButtonList = [];
		//var rightButtonPosition = [];
		//var rightItemDef =
		//{
		//	button:{type:UITYPE_IMAGE, field:"sprite", onTouchEnded:this.onUIMainButton.bind(this), isLRButton:true},
		//	fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", visible:"data.hasFx", scale:0.75},
		//};

		for (var i in this.rightButton)
		{
			var btn = this.rightButton [i];
			if (btn.check ())
			{
				rightButtonList.push (btn.define);
				//rightButtonPosition.push (btn.position);
				btn.isShow = true;
			}
			else
			{
				if(btn.isShow && btn.define.id === "offer") // jira#5737
				{
					var pk = network.connector.client.getOutPacket(network.RequestPaymentGet);
					pk.pack();
					network.connector.client.sendPacket(pk);
				}
				btn.isShow = false;
			}
		}

		// fix: showing UI_HOME causes flicker
		// var uiDef =
		// {
			// pnlLeftButtons:{type:UITYPE_2D_LIST, visible:true, items:leftButtonList, itemUI:UI_HOME_BUTTON, itemDef:leftItemDef, itemSize:cc.size(75, 75), itemsPosition: leftButtonPosition},
			// pnlRightButtons:{type:UITYPE_2D_LIST, visible:true, items:rightButtonList, itemUI:UI_HOME_BUTTON, itemDef:rightItemDef, itemSize:cc.size(75, 75), itemsPosition: rightButtonPosition},
		// };
		// FWUI.showWithData(UI_HOME, null, uiDef, this);
		
		//var uiDefLeft = {pnlLeftButtons:{type:UITYPE_2D_LIST, visible:true, items:leftButtonList, itemUI:UI_HOME_BUTTON, itemDef:leftItemDef, itemSize:cc.size(75, 75), itemsPosition: leftButtonPosition}};
		//var uiDefRight = {pnlRightButtons:{type:UITYPE_2D_LIST, visible:true, items:rightButtonList, itemUI:UI_HOME_BUTTON, itemDef:rightItemDef, itemSize:cc.size(75, 75), itemsPosition: rightButtonPosition}};
		
		var uiDefLeft = {pnlLeftButtons:{type:UITYPE_2D_LIST, visible:true, items:leftButtonList, itemUI:UI_HOME_BUTTON, itemDef:leftItemDef, itemSize:cc.size(75, 75)}};
		var uiDefRight = {pnlRightButtons:{type:UITYPE_2D_LIST, visible:true, items:rightButtonList, itemUI:UI_HOME_BUTTON, itemDef:leftItemDef, itemSize:cc.size(75, 75)}};
		
		FWUI.fillData(this.pnlLeftButtons, null, uiDefLeft);
		FWUI.fillData(this.pnlRightButtons, null, uiDefRight);

		// jira#5947
		// jira#5788
		//this.setDynamicButtonFxEnabled("offer", true);


		QuestMission.refreshHomeIcon();
	},
	
	getDynamicButtonById:function(id, leftButtonList, rightButtonList)//web getDynamicButtonById:function(id, leftButtonList = true, rightButtonList = true)
	{
		if(leftButtonList === undefined)
			leftButtonList = true;
		if(rightButtonList === undefined)
			rightButtonList = true;
		
		if(leftButtonList && this.pnlLeftButtons)
		{
			var children = this.pnlLeftButtons.getChildren();
			for(var i=0; i<children.length; i++)
			{
				if(children[i].uiBaseData.id === id)
					return children[i];//return children[i].getChildByName("button");
				//if(children[i].getChildByName("button").uiData.id === id)
				//	return children[i];
			}
		}
		
		if(rightButtonList && this.pnlRightButtons)
		{
			var children = this.pnlRightButtons.getChildren();
			for(var i=0; i<children.length; i++)
			{
				if(children[i].uiBaseData.id === id)
					return children[i];//return children[i].getChildByName("button");
				//if(children[i].getChildByName("button").uiData.id === id)
				//	return children[i];
			}
		}
		
		return null;
	},
	
	setDynamicButtonFxEnabled:function(name, enabled)
	{
		var button = this.getDynamicButtonById(name);
		//if(button)
		//{
		//	button.stopAllActions();
		//	button.setScale(1);
		//	button.loadTextureNormal(button.uiData.sprite, ccui.Widget.PLIST_TEXTURE);
		//	button.loadTexturePressed(button.uiData.sprite, ccui.Widget.PLIST_TEXTURE);
		//	if(enabled)
		//		button.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1.25), cc.scaleTo(1, 1))));
		//}
		return button;
	},
	
	showUIMain:function()
	{
		var isFriendGarden = Game.isFriendGarden();
		var canInviteToGuild = (isFriendGarden && gv.userData.userId !== USER_ID_JACK && Guild.isPlayerInGuild() && Guild.data && gv.userData.guildId !== Guild.getGuildId());
		
		var uiDef =
		{
			prgExp:{type:UITYPE_PROGRESS_BAR, maxValue:json_user_level.EXP[gv.mainUserData.getLevel()], value:gv.mainUserData.getExp()},
			lblLevel:{type:UITYPE_TEXT, value:gv.mainUserData.getLevel(), style:TEXT_STYLE_TEXT_HINT},
			
			// jira#7431
			lblExp:{type:UITYPE_TEXT, id:"", style:TEXT_STYLE_TEXT_HINT}, // value:gv.userData.getExp()
			imgExpBg:{onTouchEnded:function() {if(!Game.isFriendGarden()) gv.miniPopup.showUserInfo();}},
			
			//jira#7074
			lblGold:{type:UITYPE_TEXT, value:gv.userData.getGold(), style:TEXT_STYLE_TEXT_HINT},// lblGold:{type:UITYPE_TEXT, value:gv.userData.getGold(), style:TEXT_STYLE_TEXT_HINT, onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_GOLD);}},
			lblCoin:{type:UITYPE_TEXT, value:gv.userData.getCoin(), style:TEXT_STYLE_TEXT_HINT},// lblCoin:{type:UITYPE_TEXT, value:gv.userData.getCoin(), style:TEXT_STYLE_TEXT_HINT, onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_COIN);}},
			touchAddGold:{onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_GOLD);}},
			touchAddCoin:{onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_COIN);}},
			
			lblHeart:{type:UITYPE_TEXT, value:gv.userData.getReputation(), style:TEXT_STYLE_TEXT_HINT},
			btnBuyGold:{visible:true, onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_GOLD);}},//btnBuyGold:{onTouchEnded:function() {Game.openShop(ID_GOLD);}},
			btnBuyCoin:{visible:true, onTouchEnded:function() {Payment.showTab(PAYMENT_TAB_COIN);}},//btnBuyCoin:{onTouchEnded:function() {Game.openShop(ID_COIN);}},
			btnOrder:{onTouchEnded:this.onUIMainButton.bind(this), visible:!isFriendGarden},
            btnHome:{onTouchEnded:this.onUIMainButton.bind(this), visible:isFriendGarden},
            btnShop:{onTouchEnded:this.onUIMainButton.bind(this), visible:!isFriendGarden},
            btnChat:{onTouchEnded:this.onUIMainButton.bind(this), visible:false},
            btnMail:{onTouchEnded:this.onUIMainButton.bind(this), visible:!isFriendGarden},
            btnScrollDown:{onTouchEnded:this.onUIMainButton.bind(this)},
			lblScrollDown:{type:UITYPE_TEXT, value:"TXT_FLOOR_SCROLL_DOWN", shadow:SHADOW_CLOUD_TEXT},
            btnUnlockFloor:{onTouchEnded:this.onUIMainButton.bind(this)},
			lblUnlockFloor:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_BUTTON", shadow:SHADOW_CLOUD_TEXT},
            btnProfile:{onTouchEnded:this.onUIMainButton.bind(this), visible:!isFriendGarden},
            btnFriendlist:{visible:true, onTouchEnded:this.onUIMainButton.bind(this)},
            btnFriendGuild:{visible:canInviteToGuild, onTouchEnded:this.onUIMainButton.bind(this)},
            friendGuildIcon:{visible:canInviteToGuild, type:UITYPE_IMAGE, value:Guild.data ? Guild.data[GUILD_AVATAR] : GUILD_AVATARS[0], scale:0.4},
			mailNotify:{anim:UIANIM_BLINK},
			chatNotify:{anim:UIANIM_BLINK},
			//userIdText:{visible:false},//userIdText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_HINT, value:"id:" + gv.userData.userId},
			imgFriendAvatarFrame:{visible:isFriendGarden, onTouchEnded:this.onAddFriendFromGarden.bind(this)},
			panelFriend:{visible:isFriendGarden},
			friendAddButton:{visible:this.canAddFriendFromGarden(), onTouchEnded:this.onAddFriendFromGarden.bind(this)},
			imgFriendAvatar:{visible:isFriendGarden},
			imgFriendAvatarMarker:{visible:isFriendGarden},
			friendExpText:{visible:isFriendGarden, type:UITYPE_TEXT, value:gv.userData.getLevel(), style:TEXT_STYLE_TEXT_HINT},
			panelPigBank:{visible:false,onTouchEnded:this.onUIMainButton.bind(this)},
			
			// moved to dynamic button
			//panelVip:{visible:!isFriendGarden,onTouchEnded:this.onUIMainButton.bind(this)},
			panelVip:{visible:false},

			imgHeartBg:{onTouchBegan:function(){ this.hintRepu.setVisible(true);}.bind(this),
						onTouchEnded:function(){ this.hintRepu.setVisible(false);}.bind(this),forceTouchEnd:true},

			hintRepu:{visible:false},
			hintText:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_DESC_REPU"),style:TEXT_STYLE_HINT_NOTE},
		};

		this.uiMain = FWUI.showWithData(UI_HOME, null, uiDef, this);
		this.showDynamicButton ();
		
		this.uiMainPrgExp = FWUI.getChildByName(this.uiMain, "prgExp");
		this.uiMainLblExp = FWUI.getChildByName(this.uiMain, "lblExp");
		this.uiMainLblLevel = FWUI.getChildByName(this.uiMain, "lblLevel");
		this.uiMainLblCoin = FWUI.getChildByName(this.uiMain, "lblCoin");
		this.uiMainLblGold = FWUI.getChildByName(this.uiMain, "lblGold");
		this.uiMainLblHeart = FWUI.getChildByName(this.uiMain, "lblHeart");
		this.uiMainImgExp = FWUI.getChildByName(this.uiMain, "imgExp");
		this.uiMainImgGold = FWUI.getChildByName(this.uiMain, "imgGold");
		this.uiMainImgCoin = FWUI.getChildByName(this.uiMain, "imgCoin");
		this.uiMainImgHeart = FWUI.getChildByName(this.uiMain, "imgHeart");
		this.uiMainImgStock = FWUI.getChildByName(this.uiMain, "imgStock");
		this.uiMainBtnOrder = FWUI.getChildByName(this.uiMain, "btnOrder");
		this.uiMainMailNotify = FWUI.getChildByName(this.uiMain, "mailNotify");
		this.uiMainBtnMail = FWUI.getChildByName(this.uiMain, "btnMail");
		this.uiMainChatNotify = FWUI.getChildByName(this.uiMain, "chatNotify");
		this.uiMainBtnChat = FWUI.getChildByName(this.uiMain, "btnChat");
		this.uiMainImgFriendAvatar = FWUI.getChildByName(this.uiMain, "imgFriendAvatar");
		this.imgFriendAvatarFrame = FWUI.getChildByName(this.uiMain, "imgFriendAvatarFrame");
		this.uiMainFriendVip = FWUI.getChildByName(this.uiMain,"friendVip");
		this.uiMainBtnScrollDown = FWUI.getChildByName(this.uiMain, "btnScrollDown");
		this.uiMainBtnScrollDown.setVisible(false);
		this.uiMainBtnScrollDown.setPosition(cc.p(cc.winSize.width / 2, 0));
		this.uiMainBtnUnlockFloor = FWUI.getChildByName(this.uiMain, "btnUnlockFloor");
		this.hintRepu = FWUI.getChildByName(this.uiMain,"hintRepu");
		
		// moved to dynamic button
		//this.uiMainPanelVip = FWUI.getChildByName(this.uiMain,"panelVip");
		
		this.uiMainImgExp.originalScale = this.uiMainImgExp.getScaleY(); // getScale => getScaleY to fix assertion error
		this.uiMainImgGold.originalScale = this.uiMainImgGold.getScale();
		this.uiMainImgCoin.originalScale = this.uiMainImgCoin.getScale();
		this.uiMainImgHeart.originalScale = this.uiMainImgHeart.getScale();
		
		// jira#5429
		// call updateUIMainButtons() before refreshOrderButton()
		Tutorial.updateUIMainButtons();
		
		//Game.refreshUIMain(RF_UIMAIN_ORDER | RF_UIMAIN_AIRSHIP | RF_UIMAIN_MAIL);
		Game.refreshUIMain(RF_UIMAIN_AIRSHIP | RF_UIMAIN_MAIL | RF_UIMAIN_TRUCK);
		this.refreshOrderButton();
		
		// jira#5078
		this.uiMainImgStock.originalParent = this.uiMainImgStock.getParent();
		this.uiMainImgStock.retain();
		this.uiMainImgStock.removeFromParent();
		Game.gameScene.addChild(this.uiMainImgStock);
		this.uiMainImgStock.setLocalZOrder(Z_FLYING_ITEM - 1);
		this.uiMainImgStock.release();

		this.uiMainImgStock.originalScale = this.uiMainImgStock.getScale();
		this.showStockImage(false);

		// friend avatar
		if(isFriendGarden)
		{
			FWUI.fillData_image2(this.uiMainImgFriendAvatar, gv.userData.userId === USER_ID_JACK ? "hud/hud_avatar_jack.png" : gv.userData.getAvatar(), undefined, undefined, undefined, 64);
			if(gv.userData.checkFriendVip())
			{
				this.uiMainFriendVip.setVisible(true);
				this.imgFriendAvatarFrame.setVisible(false);
				//FWUI.fillData_image2(this.uiMainFriendVip, gv.userData.getIconVip(), undefined, undefined, undefined, cc.size(60,90));
				if(gv.userData.getIconVip())
				{
					this.uiMainFriendVip.loadTexture(gv.userData.getIconVip(), ccui.Widget.PLIST_TEXTURE);
				}
				else
				{
					this.uiMainFriendVip.setVisible(false);
				}

			}
			else
			{
				this.uiMainFriendVip.setVisible(false);
				this.imgFriendAvatarFrame.setVisible(true);
			}

		}

	},
	
	refreshUIMain:function(flags)
	{
		if((flags & RF_UIMAIN_EXP) !== 0)
		{
			var maxExp = json_user_level.EXP[gv.mainUserData.getLevel()];
			if (maxExp > 0)
				this.uiMainPrgExp.setPercent(gv.mainUserData.getExp() * 100 / json_user_level.EXP[gv.mainUserData.getLevel()]);
			else 
				this.uiMainPrgExp.setPercent(0);
			//var exp = gv.mainUserData.getExp() - FWUtils.flyingAmount[ID_EXP];
			// FWUI.setLabelString(this.uiMainLblExp, exp < 0 ? 0 : exp);//this.uiMainLblExp.setString(gv.userData.getExp());
		}
		if((flags & RF_UIMAIN_LEVEL) !== 0)
			this.uiMainLblLevel.setString(gv.mainUserData.getLevel());
		if((flags & RF_UIMAIN_COIN) !== 0)
		{
			FWUI.setLabelString(this.uiMainLblCoin, gv.userData.getCoin() - FWUtils.flyingAmount[ID_COIN]);//this.uiMainLblCoin.setString(gv.userData.getCoin());
			if(FWUI.isShowing(UI_PAYMENT))
			{
				var widget = FWPool.getNode(UI_PAYMENT, false);
				var label = FWUtils.getChildByName(widget, "lblCoin");
				FWUI.setLabelString(label, gv.userData.getCoin() - FWUtils.flyingAmount[ID_COIN]);
			}
		}
		if((flags & RF_UIMAIN_GOLD) !== 0)
		{
			FWUI.setLabelString(this.uiMainLblGold, gv.userData.getGold() - FWUtils.flyingAmount[ID_GOLD]);//this.uiMainLblGold.setString(gv.userData.getGold());
			if(FWUI.isShowing(UI_PAYMENT))
			{
				var widget = FWPool.getNode(UI_PAYMENT, false);
				var label = FWUtils.getChildByName(widget, "lblGold");
				FWUI.setLabelString(label, gv.userData.getGold() - FWUtils.flyingAmount[ID_GOLD]);
			}
		}
		if((flags & RF_UIMAIN_REPU) !== 0)
			FWUI.setLabelString(this.uiMainLblHeart, gv.userData.getReputation() - FWUtils.flyingAmount[ID_REPU]);//this.uiMainLblHeart.setString(gv.userData.getReputation());
		
		if((flags & RF_UIMAIN_ORDER) !== 0)
		{
			// delay 1s to avoid
			// - continuous refreshing
			// - lagging
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.refreshOrderButton);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.refreshOrderButton, 0, 0, 1, false);
		}
		
		if((flags & RF_UIMAIN_AIRSHIP) !== 0)
			Airship.refreshUIMain();

		if((flags & RF_UIMAIN_TRUCK) !== 0)
			Truck.refreshUIMain();

		if((flags & RF_UIMAIN_MAIL) !== 0)
		{
			var mailList = gv.userData.getMailList();
			var hasUnreadMail = false;
			for(var i=0; i<mailList.length; i++)
				if(mailList[i][MAIL_IS_READ] === false || mailList[i].isHot)
				{
					hasUnreadMail = true;
					break;
				}
			this.uiMainMailNotify.setVisible(hasUnreadMail);
		}
		
		if((flags & RF_UIMAIN_NPC) !== 0)
		{
			gv.background.updateNPCFisherman();
			gv.background.updateNPCSmithy();
		}

		if((flags & RF_UIMAIN_PIGBANK) !== 0)
		{

			if(gv.pigBankPanel.check() && !Game.isFriendGarden())
			{
				gv.background.updateNPCPigBank();
				gv.background.updateNPCPigBankStatus(true);
				//this.uiMainPanelPigBank.setVisible(true);
				//gv.background.updateNPCPigBank(true);
			}
			else
			{
				gv.background.updateNPCPigBankStatus(false);
				//this.uiMainPanelPigBank.setVisible(false);
				////gv.background.updateNPCPigBank(false);
				PigBank.hide();
				//return;
			}
		}

		if((flags & RF_UIMAIN_VIP) !== 0)
		{
			var button = this.getDynamicButtonById("panelVip", false, true);
			if(button)
			{
				var spine = button.getChildByName("spine").getChildren()[0];
				spine.setAnimation(0, gv.vipManager.check() ? "icon_vip" : "icon_vip_active", true);
			}
		}
		
		if((flags & RF_UIMAIN_DRAGON) !== 0)
		{
			gv.background.updateNPCDragon();
		}
	},
	
	refreshOrderButton:function()
	{
		// jira#6087
		gv.arcade.refreshMineNotification();
		
		var orderList = Orders.updateOrderList();
		var hasDeliverableOrder = false;
		if(orderList)
		{
			var hasDailyOrder = false;
			for(var i=0; i<orderList.length; i++)
			{
				if(orderList[i] && orderList[i].isDaily)
				{
					hasDailyOrder = true;
					break;
				}
			}

			// jira#4796
			// var iconIdx;
			// if(hasDailyOrder)
				// iconIdx = [4, 0, 1, 2, 3, 5, 6, 7, 8];
			// else
				// iconIdx = [0, 1, 2, 3, 5, 6, 7, 8, 4];
			var iconIdx = [4, 0, 1, 2, 3, 5, 6, 7, 8];
			
			var order, icon, checkedIcon, i, color;
			for(i=0; i<9; i++)
			{
				order = (i < orderList.length ? orderList[i] : null);
				icon = FWUtils.getChildByName(this.uiMainBtnOrder, "order" + iconIdx[i]);
				checkedIcon = FWUtils.getChildByName(this.uiMainBtnOrder, "orderCheck" + iconIdx[i]);
				if(order === null)
				{
					icon.setVisible(false);
					checkedIcon.setVisible(false);
				}
				else
				{
					icon.setVisible(true);
					if(order.isEnough)
					{
						checkedIcon.setVisible(true);
						hasDeliverableOrder = true;
					}
					else
						checkedIcon.setVisible(false);
					
					
					color = cc.WHITE;
					if(order.isDaily)
						color = cc.color(238, 130, 238);
					else if(order.showData)
						color = (order[ORDER_SUB_TYPE] === defineTypes.SUB_TYPE_ORDER_NORMAL_BUG ? cc.color(255, 182, 193) : cc.WHITE);
					else
						color = cc.color(128, 128, 128);
					icon.setColor(color);
				}
			}
		}

		// jira#6068
		/*// jira#5435
		var level = gv.userData.getLevel();
		if(hasDeliverableOrder && level >= 4 && level <= 6 && !Tutorial.currentStep && !Game.isFriendGarden())
		{
			var pos = FWUtils.getWorldPosition(this.uiMainBtnOrder);
			pos.x -= 45;
			pos.y += 10;
			this.showFocusPointer("order", pos.x, pos.y, true, Z_UI_ORDER - 1);
		}
		else
			this.showFocusPointer("order", false);*/
	},
	
	onUIMainButton:function(sender)
	{
		var btnName = sender.getName();
		if(btnName === "homeButton")//if(btnName === "button")
			btnName = sender.uiData.id; // button list
		cc.log("GameScene::onUIMainButton: " + btnName);
		
		if (btnName === "btnOrder")
			Orders.show();
        else if (btnName === "btnShop")
		{
			if(cc.sys.isNative)
				gv.ibshop.showPopup();//(FWUI.getChildByName(this.uiMain, "panelStats"));
			else
			{
				showLoadingProgress();
				cc.director.getScheduler().scheduleCallbackForTarget(this, function()
				{
					gv.ibshop.showPopup();
					showLoadingProgress(false);
				}, 0, 0, 0, false);
			}
		}
        else if (btnName === "btnChat") {
			Chatbox.loadAndShow();
		}
		else if (btnName === "offer") {
			if (gv.offerPanel.check())
		    	gv.offerPanel.show();
		}
		else if (btnName === "pigbank"|| btnName=== "panelPigBank") {

			//var pk = network.connector.client.getOutPacket(Payment.RequestPaymentAtmReg);
			//pk.pack("VPB", g_PAYMENT[43].ID, OFFER_VIP_2);
			//network.connector.client.sendPacket(pk);


			gv.pigBankPanel.show();
			////TODO  something: check show ....
		}
		else if (btnName === "pigbank"|| btnName=== "panelVip") {

			gv.vipManager.show();
			//TODO  something: check show ....
		}
		else if (btnName === "consume") {

			//cc.log("show Game");
			if(gv.consumEventMgr.check()) {
				//Truck.endMove();
				gv.consumEventMgr.show();
			}

		}
		else if (btnName === "questBook") {
			if (QuestBook.check())
			{
				QuestBook.updateQuestsDisplayData();
				QuestBook.show();
			}
		}
		else if (btnName === "questMission") {
			if (QuestMission.check())
			{
				QuestMission.show();
			}
		}
		else if (btnName === "eventNews") {
			GameEvent.showInfo();
		}
		else if (btnName === "dailyGift") {
			gv.dailygift.showDailyGift(0, true);
		}
		else if (btnName === "btnMail")
			MailBox.show();
		else if(btnName === "btnFriendlist")
		{
			Game.gameScene.showFocusPointer("guild", false);
			FriendList.show(); //newfl gv.friendPanel.show ();
		}
		else if(btnName === "btnProfile")
			gv.utilPanel.show ();
		else if(btnName === "btnScrollDown")
		{
			FWObjectManager.updateVisibility_showAll();
			gv.background.snapFloor(-1, BG_FLOOR_BASE_INDEX);
		}
		else if(btnName === "btnHome")
			GardenManager.changeGarden(gv.mainUserData.mainUserId);
		else if(btnName === "btnUnlockFloor")
			CloudFloors.showUnlockFloorMenu();
		else if(btnName === "btnFriendGuild")
		{
			var pos = FWUtils.getWorldPosition(sender);
			if(Guild.isPlayerInGuild())
			{
				if(Guild.canPlayerTakeAction(GUILD_ACTION_INVITE))
				{
					if(gv.userData.getLevel() < g_MISCINFO.GUILD_USER_LEVEL)
						FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_INVITE_LEVEL"), pos);
					else if(Guild.getMembersCount() >= Guild.getMembersLimit())
						FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_FULL_MEMBER"), pos);
					else
						Guild.showInvitation();
				}
				else
					FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_INVITE_PRIVILEGE"), pos);
			}
		}
	},
	
	showScrollDownButton:function(show)
	{
        //BUG HERE: this.uiMainBtnScrollDown can be null, why?
		if (!this.uiMainBtnScrollDown)
			return;
		
		var pos3 = cc.p(cc.winSize.width / 2, -50);
		if(!show)
		{
			this.uiMainBtnScrollDown.runAction(cc.sequence(
				cc.moveTo(0.35, pos3),
				cc.hide()
			));
			return;
		}
		
		this.uiMainBtnScrollDown.setVisible(true);
		this.uiMainBtnScrollDown.stopAllActions();
		var pos1 = cc.p(cc.winSize.width / 2, 25);
		var pos2 = cc.p(cc.winSize.width / 2, 35);
		this.uiMainBtnScrollDown.runAction(cc.sequence(
			cc.moveTo(0.35, pos2),
			cc.moveTo(0.5, pos1),
			cc.moveTo(0.5, pos2),
			cc.moveTo(0.5, pos1),
			cc.moveTo(0.5, pos2),
			cc.moveTo(0.5, pos1),
			cc.moveTo(0.35, pos3),
			cc.hide()
		));
	},
	
	countObjects:function(root)
	{
		var showResult = (root === undefined);
		if(root === undefined)
			root = FWUtils.getCurrentScene();
		
		var count = 0;
		var children = root.getChildren();
		for(var i=0; i<children.length; i++)
		{
			count += this.countObjects(children[i]);
			count++;
		}
		
		if(showResult)
			cc.log("GameScene::countObjects: " + count);
		
		return count;
	},
	
	countPool:function()
	{
		var count = 0
		for(var key in FWPool.poolObjects)
		{
			cc.log("GameScene::countPool: key=" + key + " count=" + FWPool.poolObjects[key].length);
			count += FWPool.poolObjects[key].length;
		}
		cc.log("GameScene::countPool: total=" + count);
	},
	
	onAddFriendFromGarden:function(sender)
	{
		if(!this.canAddFriendFromGarden())
			return;
		
		var friendAddButton = FWUI.getChildByName(this.uiMain, "friendAddButton");
		if (friendAddButton)
			friendAddButton.setVisible(false);
		
		FriendList.sendRequestId = gv.userData.userId;
		var pk = network.connector.client.getOutPacket(FriendList.RequestFriendSendRequest);
		pk.pack([FriendList.sendRequestId]);
		network.connector.client.sendPacket(pk);		
	},
	
	canAddFriendFromGarden:function()
	{
		/*var id = gv.userData.userId;
		var friendsList = FriendList.friendsList;
		for(var i=0; i<friendsList.length; i++)
		{
			if(friendsList[i][FRIEND_ID] === id)
				return false; // already friends
		}
		return true;*/
		return FriendList.canAddFriend(gv.userData.userId);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// focus pointer //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	focusPointer: null,
	
	initFocusPointer:function()
	{
		if(!this.focusPointer)
		{
			this.focusPointer = FWPool.getNode(SPINE_HAND_TUTORIAL);
			this.focusPointer.setAnimation(0, "hand_order", true);
			this.addChild(this.focusPointer);
		}
		this.focusPointer.setVisible(false);
	},
	
	showFocusPointer:function(name, x, y, flip, z, duration, parent)
	{
		if(x === false)
		{
			if(this.focusPointer.name === name)
				this.focusPointer.setVisible(false);
		}
		else if(!this.focusPointer.isVisible() || this.focusPointer.name !== name)
		{
			if(flip === undefined)
				flip = (x > cc.winSize.width * 2 / 3);
			
			if(!parent)
				parent = this;
			if(this.focusPointer.getParent() !== parent)
			{
				this.focusPointer.removeFromParent();
				parent.addChild(this.focusPointer);
			}
			
			this.focusPointer.stopAllActions();
			this.focusPointer.setVisible(true);
			this.focusPointer.setPosition(x, y);
			this.focusPointer.setScale(flip ? -0.8 : 0.8, 0.8);
			this.focusPointer.setLocalZOrder(z || Z_FX);
			this.focusPointer.setAnimation(0, "hand_order", true);
			this.focusPointer.name = name;
			
			if(duration && duration > 0)
				cc.director.getScheduler().scheduleCallbackForTarget(this, function() {this.showFocusPointer(name, false);}, 0, 0, duration, false);
		}
	},
	
	showFocusPointer2:function(name, x, y, x2, y2, flip, z)
	{
		if(x === false)
		{
			if(this.focusPointer.name === name)
				this.focusPointer.setVisible(false);
		}
		else if(!this.focusPointer.isVisible() || this.focusPointer.name !== name)
		{
			if(this.focusPointer.getParent() !== this)
			{
				this.focusPointer.removeFromParent();
				this.addChild(this.focusPointer);
			}
			
			this.focusPointer.stopAllActions();
			this.focusPointer.setVisible(true);
			this.focusPointer.setScale(flip ? -0.8 : 0.8, 0.8);
			this.focusPointer.setLocalZOrder(z || Z_FX);
			this.focusPointer.clearTracks();
			this.focusPointer.name = name;
			
			this.focusPointer.runAction(cc.repeatForever(cc.sequence(
				cc.callFunc(function() {this.focusPointer.setPosition(x, y);}.bind(this)),
				cc.delayTime(0.35),
				cc.moveTo(1, x2, y2).easing(cc.easeSineInOut()),
				cc.delayTime(0.35)
			)));
		}
	},
	
	uninitFocusPointer:function()
	{
		if(this.focusPointer)
		{
			FWPool.returnNode(this.focusPointer);
			this.focusPointer = null;
		}
	},

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
});