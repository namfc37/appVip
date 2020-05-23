
///////////////////////////////////////////////////////////////////////////////////////
// minigame ///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

var Minigame =
{
	init:function()
	{
		MGMatch.init();
	},
	
	uninit:function()
	{
		MGMatch.uninit();
	},
	
	onLevelUp:function(level, prevLevel)
	{
		if(!MGMatch.isInitialized() && prevLevel < g_MISCINFO.FLIPPINGCARDS_USER_LEVEL && level >= g_MISCINFO.FLIPPINGCARDS_USER_LEVEL)
			MGMatch.load(); // jira#6417 MGMatch.init();
	},
};

///////////////////////////////////////////////////////////////////////////////////////
// minigame match /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

const MGM_CLOUD_Y = 500;
const MGM_CLOUD_W = 100;

var MGMatch =
{
	cloud: null,
	data: null,
	scene: null,
	cloudLastFlyTime: 0, // feedback
	
	init:function()
	{
		if(!g_MISCINFO.FLIPPINGCARDS_ACTIVE || Game.isFriendGarden() || gv.userData.getLevel() < g_MISCINFO.FLIPPINGCARDS_USER_LEVEL)
			return;
		
		this.cloud = new FWObject();
		this.cloud.initWithSpine(SPINE_CLOUD_MINIGAME);
		this.cloud.setAnimation("animation", true);
		this.cloud.setScale(0.04);
		this.cloud.setParent(gv.background.base);
		this.cloud.setLocalZOrder(9999);
		this.cloud.setEventListener(null, this.onCloudTouched.bind(this));
		this.cloud.setNotifyBlockedTouch(true);
		this.cloud.setPosition(-MGM_CLOUD_W, MGM_CLOUD_Y);
		
		
		// feedback: delay 5m if player goes back home from friend's garden
		var delay = 5;// * 60;
		var diff = Game.getGameTimeInSeconds() - MGMatch.cloudLastFlyTime;
		var sequence;
		if(diff >= delay)
		{
			sequence = cc.sequence
			(
				cc.callFunc(function() {MGMatch.cloud.setScale(0.05, 0.05); MGMatch.cloudLastFlyTime = Game.getGameTimeInSeconds();}),
				cc.moveTo(20, cc.p(cc.winSize.width + MGM_CLOUD_W, MGM_CLOUD_Y)),
				cc.delayTime(delay),
				cc.callFunc(function() {MGMatch.cloud.setScale(-0.05, 0.05); MGMatch.cloudLastFlyTime = Game.getGameTimeInSeconds();}),
				cc.moveTo(20, cc.p(-MGM_CLOUD_W, MGM_CLOUD_Y)),
				cc.delayTime(delay)
			);
		}
		else
		{
			sequence = cc.sequence
			(
				cc.delayTime(delay - diff),
				cc.callFunc(function() {MGMatch.cloud.setScale(0.05, 0.05); MGMatch.cloudLastFlyTime = Game.getGameTimeInSeconds();}),
				cc.moveTo(20, cc.p(cc.winSize.width + MGM_CLOUD_W, MGM_CLOUD_Y)),
				cc.delayTime(delay),
				cc.callFunc(function() {MGMatch.cloud.setScale(-0.05, 0.05); MGMatch.cloudLastFlyTime = Game.getGameTimeInSeconds();}),
				cc.moveTo(20, cc.p(-MGM_CLOUD_W, MGM_CLOUD_Y)),
				cc.delayTime(diff)
			);
		}
		this.cloud.node.runAction(cc.repeatForever(sequence));
		
		this.setData(gv.userData.game[GAME_FLIPPINGCARDS]);
		
		if(!MGM_TILE_ICONS)
		{
			MGM_TILE_ICONS = [];
			
			// plants
			var plantGfxMap = Game.getPlantGfxMap();
			for(var key in plantGfxMap)
			{
				if(!g_PLANT[key].EVENT_ID) // exclude event trees to avoid duplication
					MGM_TILE_ICONS.push(plantGfxMap[key]);
			}
			
			// products
			for(var key in g_PRODUCT)
				MGM_TILE_ICONS.push(cc.formatStr(SPRITE_PRODUCTS, g_PRODUCT[key].GFX));
		}
	},
	
	isInitialized:function()
	{
		return (this.cloud !== null);
	},
	
	uninit:function()
	{
		if(!this.isInitialized())
			return;
		
		this.cloud.uninit();
		this.cloud = null;
	},
	
	onCloudTouched:function(touch, object)
	{
		// jira#6384
		//gv.arcade.showPopup(ARCADE_ID_MGMATCH);
		MGMatch.showIntro();
	},
	
	setData:function(data)
	{
		this.data = gv.userData.game[GAME_FLIPPINGCARDS] = data;
		cc.log("MGMatch::data=" + JSON.stringify(this.data));
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// minigame intro /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	isShowingBuyCards:false,
	isShowingRewards:false,
	showAfterLoading:false,
	
	showIntro:function()
	{
		if(this.data[FLIPPINGCARDS_TICKETS] !== gv.userStorages.getItemAmount(g_MISCINFO.FLIPPINGCARDS_TICKET) && !this.showAfterLoading)
		{
			FWUtils.disableAllTouches();
			this.showAfterLoading = true;
			this.load();
			return;
		}
		this.showAfterLoading = false;

		var hasPlayingGame = this.hasPlayingGame();
		
		// def
		var uiDef =
		{
			closeButton:{onTouchEnded:this.hideIntro.bind(this)},
			title:{type:UITYPE_TEXT, value:"TXT_ARCADE_MGMATCH", style:TEXT_STYLE_TITLE_1},
			title2:{type:UITYPE_TEXT, value:"TXT_MGMATCH_TITLE_2", style:TEXT_STYLE_TEXT_NORMAL},
			title3:{type:UITYPE_TEXT, value:"TXT_MGMATCH_TITLE_3", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			playButton:{onTouchEnded:this.play.bind(this)},
			playText:{type:UITYPE_TEXT, value:"TXT_EVENT_PLAY_NOW", style:TEXT_STYLE_TEXT_BIG, visible:!hasPlayingGame},
			playPrice:{type:UITYPE_TEXT, value:g_MISCINFO.FLIPPINGCARDS_BOARD_REQUIRE_TICKET, style:TEXT_STYLE_TEXT_BIG, visible:!hasPlayingGame},
			playCardIcon:{visible:!hasPlayingGame},
			continueText:{type:UITYPE_TEXT, value:"TXT_MGMATCH_CONTINUE", style:TEXT_STYLE_TEXT_BIG, visible:hasPlayingGame},
			//progress:{type:UITYPE_PROGRESS_BAR, value:this.data[FLIPPINGCARDS_POINTS], maxValue:this.getCurrentCheckpoint()},
			textProgress:{type:UITYPE_TEXT,value: this.data[FLIPPINGCARDS_POINTS] +"/"+ this.getCurrentCheckpoint(),style:TEXT_STYLE_NUMBER},
			giftButton:{onTouchEnded:this.claimCheckpointRewards.bind(this)},
			cardsCount:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER},
			buyCardButton:{onTouchEnded:this.showBuyCards.bind(this)},
			timer:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER},
			buyCards:{visible:this.isShowingBuyCards},
			rewards:{visible:this.isShowingRewards},
			infoButton:{onTouchEnded:this.showHelp.bind(this)},
		};
		
		if(this.isShowingBuyCards)
		{
			uiDef.buyCardsBg = {onTouchEnded:this.hideBuyCards.bind(this)};
			uiDef.buyCardsText = {type:UITYPE_TEXT, value:"TXT_MGMATCH_BUY_CARDS", style:TEXT_STYLE_TEXT_DIALOG};
			uiDef.buyCardsAmount = {type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER};
			uiDef.buyCardsButton = {onTouchEnded:this.onBuyCards.bind(this)};
			uiDef.buyCardsPrice = {type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER};
		}
		
		if(this.isShowingRewards)
		{
			var rewardItems = FWUtils.getItemsArray(g_FLIPPING_CARDS.CHECKPOINTS[this.getCurrentCheckpoint()]);
			var rewardItemDef =
			{
				gfx:{type:UITYPE_ITEM, field:"itemId"},
				amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
			};
			uiDef.rewardsBg = {onTouchEnded:this.hideRewards.bind(this)};
			uiDef.rewardsText = {type:UITYPE_TEXT, value:"TXT_MINIGAME_REWARD_TITLE", style:TEXT_STYLE_TEXT_DIALOG};
			uiDef.rewardItemList = {type:UITYPE_2D_LIST, items:rewardItems, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75};
		}
		
		// show
		var widget = FWPool.getNode(UI_MGM_INTRO, false);
		if(FWUI.isWidgetShowing(widget))
		{
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgMGM");
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hideIntro();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			this.buyCardsAmount = FWUtils.getChildByName(widget, "buyCardsAmount");
			this.buyCardsPrice = FWUtils.getChildByName(widget, "buyCardsPrice");
			this.timerBg = FWUtils.getChildByName(widget, "timerBg");//this.timerIcon = FWUtils.getChildByName(widget, "timerIcon");
			this.timer = FWUtils.getChildByName(widget, "timer");
			this.cardsCount = FWUtils.getChildByName(widget, "cardsCount");
			this.buyCardButton = FWUtils.getChildByName(widget, "buyCardButton");
			
			//var progress = FWUtils.getChildByName(widget, "progress");
			//FWUI.applyTextStyle(progress.getChildByName("text"), TEXT_STYLE_NUMBER);
			
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateIntro, 1, cc.REPEAT_FOREVER, 0, false);
		}

		var progressPanel = FWUI.getChildByName(widget,"progressPanel");
		if(progressPanel){
			progressPanel.setContentSize(cc.size( 307*this.data[FLIPPINGCARDS_POINTS]/this.getCurrentCheckpoint(),27));
		}

		this.updateIntro();
	},
	
	hideIntro:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateIntro);
		FWUtils.hideDarkBg(null, "darkBgMGM");
		FWUI.hide(UI_MGM_INTRO, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	updateIntro:function(dt)
	{
		var currentCardsCount = this.getCurrentCardsCount();
		var isCardsFull = (currentCardsCount >= g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM);
		
		if(isCardsFull)
		{
			if(this.isShowingBuyCards)
			{
				this.hideBuyCards();
				return;
			}
			
			this.timerBg.setVisible(false);//this.timerIcon.setVisible(false);
			this.timer.setVisible(false);
			this.buyCardButton.setVisible(false);
		}
		else
		{
			if(this.isShowingBuyCards)
			{
				var amountToBuy = g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM - currentCardsCount;
				var diamondsPerCard = g_MATERIAL[g_FLIPPING_CARDS.TICKET_ID].DIAMOND_BUY;
				
				this.buyCardsAmount.setString(currentCardsCount + "/" + g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM);
				this.buyCardsPrice.setString(amountToBuy * diamondsPerCard);
			}
			
			this.timerBg.setVisible(false);//this.timerIcon.setVisible(true);
			this.timer.setVisible(true);
			if(this.data[FLIPPINGCARDS_TICKET_LAST_TIME] <= 0)
				this.timer.setString("00:00"); // error
			else
			{
				var recoverTime = (Game.getGameTimeInSeconds() - this.data[FLIPPINGCARDS_TICKET_LAST_TIME]) % g_MISCINFO.FLIPPINGCARDS_TICKET_COOLDOWN;
				this.timer.setString(cc.formatStr(FWLocalization.text("TXT_MINIGAME_TICKET_RECOVER"), FWUtils.secondsToTimeString(g_MISCINFO.FLIPPINGCARDS_TICKET_COOLDOWN - recoverTime)));
			}

			this.buyCardButton.setVisible(true);
		}
		
		this.cardsCount.setString(currentCardsCount + "/" + g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM);
	},
	
	getCurrentCardsCount:function()
	{
		var cardsCount = this.data[FLIPPINGCARDS_TICKETS];
		if(this.data[FLIPPINGCARDS_TICKET_LAST_TIME] > 0)
		{
			cardsCount += Math.floor((Game.getGameTimeInSeconds() - this.data[FLIPPINGCARDS_TICKET_LAST_TIME]) / g_MISCINFO.FLIPPINGCARDS_TICKET_COOLDOWN);
			if(cardsCount > g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM && this.data[FLIPPINGCARDS_TICKETS] < g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM)
				cardsCount = g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM;
		}
		
		return cardsCount;
	},
	
	getCurrentCheckpoint:function()
	{
		var checkpoint;
		for(key in g_FLIPPING_CARDS.CHECKPOINTS)
		{
			checkpoint = Number(key);
			if(!this.isCheckpointRewardsReceived(checkpoint))
				return checkpoint;
		}
		return checkpoint;
	},
	
	hasPlayingGame:function()
	{
		return (this.data[FLIPPINGCARDS_GAME_PLAYING] === true);
	},
	
	play:function(sender)
	{
		if(this.hasPlayingGame())
		{
			this.onPlayOk();
			return;
		}
		
		if(this.getCurrentCardsCount() < g_MISCINFO.FLIPPINGCARDS_BOARD_REQUIRE_TICKET)
		{
			this.showBuyCards();
			return;
		}
		
		var pk = network.connector.client.getOutPacket(this.RequestFlippingCardsGameStart);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onPlayOk:function()
	{
		this.scene = new MGMatchScene();
		FWUtils.setCurrentScene(this.scene, SCENE_TRANSITION_DURATION, true);
	},
	
	claimCheckpointRewards:function(sender)
	{
		var checkpoint = this.getCurrentCheckpoint();
		if(this.data[FLIPPINGCARDS_POINTS] < checkpoint)
		{
			this.showRewards(sender);
			return;
		}
		
		if(this.isCheckpointRewardsReceived(checkpoint))
			return;
		
		Game.showGiftPopup(g_FLIPPING_CARDS.CHECKPOINTS[checkpoint], "TXT_ARCADE_MGMATCH", this.claimCheckpointRewards2.bind(this), null, true);
	},
	
	claimCheckpointRewards2:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestFlippingCardsCheckpointReward);
		pk.pack(this.getCurrentCheckpoint());
		network.connector.client.sendPacket(pk);
	},
	
	isCheckpointRewardsReceived:function(checkpoint)
	{
		if(!this.data || !this.data[FLIPPINGCARDS_CHECKPOINTS] || this.data[FLIPPINGCARDS_CHECKPOINTS].length <= 0)
			return false;
		
		for(var i=0; i<this.data[FLIPPINGCARDS_CHECKPOINTS].length; i++)
		{
			if(this.data[FLIPPINGCARDS_CHECKPOINTS][i] === checkpoint)
				return true;
		}
		
		return false;
	},
	
	showBuyCards:function(sender)
	{
		this.isShowingBuyCards = true;
		this.showIntro();
	},
	
	hideBuyCards:function(sender)
	{
		this.isShowingBuyCards = false;
		this.showIntro();
	},
	
	onBuyCards:function(sender)
	{
		this.hideBuyCards();
		
		var currentCardsCount = this.getCurrentCardsCount();
		var amountToBuy = g_MISCINFO.FLIPPINGCARDS_TICKET_LIMIT_NUM - currentCardsCount;
		if(amountToBuy <= 0)
			return;
		
		var price = g_MATERIAL[g_FLIPPING_CARDS.TICKET_ID].DIAMOND_BUY * amountToBuy;
		var success = Game.quickBuy([g_FLIPPING_CARDS.TICKET_ID], [amountToBuy], 0, price, FWUtils.getWorldPosition(sender), function(error)
		{
			FWUtils.disableAllTouches(false);
			if(error === 0)
				MGMatch.load();
		});
		if(success)
			FWUtils.disableAllTouches();
	},
	
	showRewards:function(sender)
	{
		this.isShowingRewards = true;
		this.showIntro();
	},
	
	hideRewards:function(sender)
	{
		this.isShowingRewards = false;
		this.showIntro();
	},
	
	showHelp:function(sender)
	{
		if(MGMatch.scene && MGMatch.scene.isGameFinished())
			return;
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_MGMATCH_HELP_TITLE", style:TEXT_STYLE_TEXT_DIALOG_TITLE},
			content1:{type:UITYPE_TEXT, value:"TXT_MGMATCH_HELP_CONTENT1", style:TEXT_STYLE_TEXT_DIALOG},
			content2:{type:UITYPE_TEXT, value:"TXT_MGMATCH_HELP_CONTENT2", style:TEXT_STYLE_TEXT_DIALOG},
			content3:{type:UITYPE_TEXT, value:"TXT_MGMATCH_HELP_CONTENT3", style:TEXT_STYLE_TEXT_DIALOG},
			// jira#6382 okText:{type:UITYPE_TEXT, value:"TXT_TUTO_OK", style:TEXT_STYLE_TEXT_BUTTON},
			icon:{type:UITYPE_SPINE, id:SPINE_HAND_TUTORIAL, anim:"hand_order", scale:cc.p(-0.75, 0.75)},

			// jira#6464
			//okButton:{onTouchEnded:this.hideHelp.bind(this)},
			okButton:{visible:false},
			tapToClose:{onTouchEnded:this.hideHelp.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_MGM_HELP, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON);
		
		FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgMGMHelp");
		
		if(!MGMatch.scene)
		{
			if(!this.hideFuncHelp)
				this.hideFuncHelp = function() {this.hideHelp();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFuncHelp);
		}
	},
	
	hideHelp:function(sender)
	{
		if(FWUI.isShowing(UI_MGM_HELP))
		{
			FWUI.hide(UI_MGM_HELP, UIFX_POP);
			FWUtils.hideDarkBg(null, "darkBgMGMHelp");
		}
		
		if(!MGMatch.scene)
			Game.gameScene.unregisterBackKey(this.hideFuncHelp);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// minigame match server //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	load:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestFlippingCardsGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	endGame:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestFlippingCardsGameEnd);
		pk.pack(this.scene.startTime, this.scene.endTime, this.scene.matchedCount, this.scene.missedCount);
		network.connector.client.sendPacket(pk);
	},
	
	useItem:function(itemId)
	{
		var amount = gv.userStorages.getItemAmount(itemId);
		if(amount <= 0)
			return;
		
		var pk = network.connector.client.getOutPacket(this.RequestFlippingCardsUseItem);
		pk.pack(itemId, amount);
		network.connector.client.sendPacket(pk);
	},
	
	RequestFlippingCardsGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLIPPINGCARDS_GET);},
		pack:function()
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseFlippingCardsGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("MGMatch::ResponseFlippingCardsGet: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				if(!MGMatch.isInitialized())
				{
					gv.userData.game[GAME_FLIPPINGCARDS] = object[KEY_FLIPPINGCARDS];
					MGMatch.init();
				}
				else
				{
					FWUtils.disableAllTouches(false);
					MGMatch.setData(object[KEY_FLIPPINGCARDS]);
					
					if(FWUI.isShowing(UI_MGM_INTRO) || MGMatch.showAfterLoading)
						MGMatch.showIntro();
				}
			}
		}
	}),
	
	RequestFlippingCardsGameStart:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLIPPINGCARDS_GAME_START);},
		pack:function()
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseFlippingCardsGameStart:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("MGMatch::ResponseFlippingCardsGameStart: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				MGMatch.setData(object[KEY_FLIPPINGCARDS]);
				Game.updateUserDataFromServer(object);
				MGMatch.onPlayOk();
				//Truck.endMove();
				
				//Achievement.onAction(ACTION_MINIGAME, "MGMatch", 1);
			}
		}
	}),

	RequestFlippingCardsGameEnd:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLIPPINGCARDS_GAME_END);},
		pack:function(start, end, match, miss)
		{
			cc.log("MGMatch::RequestFlippingCardsGameEnd: " + JSON.stringify([start, end, match, miss]));
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_DATA, [start, end, match, miss]);
			
			addPacketFooter(this);
		},
	}),

	ResponseFlippingCardsGameEnd:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
			{
				cc.log("MGMatch::ResponseFlippingCardsGameEnd: error=" + this.getError());
				if(MGMatch.scene)
					MGMatch.scene.confirmQuit();
			}
			else
			{
				var object = PacketHelper.parseObject(this);
				MGMatch.setData(object[KEY_FLIPPINGCARDS]);
				Game.updateUserDataFromServer(object);
				
				// jira#6393
				//if(MGMatch.scene && MGMatch.scene.isGameFinished() && MGMatch.scene.isGameWin())
				//	MGMatch.scene.showWinPopup(object);
				if(MGMatch.scene)
				{
					// jira#6443
					//if(object[KEY_DATA][FLIPPINGCARDS_GAME_VICTORY] === true)
					//	MGMatch.scene.showWinPopup(object);
					//else if(MGMatch.scene.state === MGM_STATE_FINISH)
					//	MGMatch.scene.showLosePopup(object);
					if(object[KEY_DATA][FLIPPINGCARDS_GAME_VICTORY] === true || MGMatch.scene.state === MGM_STATE_FINISH)
						MGMatch.scene.showWinPopup(object);
				}
				cc.log("MGMatch::ResponseFlippingCardsGameEnd: " + JSON.stringify(object));
				Achievement.onAction(g_ACTIONS.ACTION_FLIPPING_CARD.VALUE, null, 1);
			}
		}
	}),
	
	RequestFlippingCardsUseItem:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLIPPINGCARDS_GAME_USE_ITEM);},
		pack:function(itemId, itemNum)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			PacketHelper.putInt(this, KEY_ITEM_NUM, itemNum);
			
			addPacketFooter(this);
		},
	}),

	ResponseFlippingCardsUseItem:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("MGMatch::ResponseFlippingCardsUseItem: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				MGMatch.scene.useItemId2(object[KEY_ITEMS]);
				MGMatch.scene.refreshItemButtons();
			}
		}
	}),
	
	RequestFlippingCardsCheckpointReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLIPPINGCARDS_CLAIM_CHECKPOINT);},
		pack:function(slotId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, slotId);
			
			addPacketFooter(this);
		},
	}),

	ResponseFlippingCardsCheckpointReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("MGMatch::ResponseFlippingCardsCheckpointReward: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				MGMatch.setData(object[KEY_FLIPPINGCARDS]);
				// no use put(MAIL_UID, mailId);
				if(FWUI.isShowing(UI_MGM_INTRO))
					MGMatch.showIntro();
			}
		}
	}),
};

///////////////////////////////////////////////////////////////////////////////////////
// minigame match scene ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

const MGM_STATE_INTRO = 0;
const MGM_STATE_PLAY = 1;
const MGM_STATE_FINISH = 2;

const MGM_TILE_W = 120;
const MGM_TILE_H = 90;
const MGM_TILE_OFF_X = 0;
const MGM_TILE_OFF_Y = -50;
const MGM_TILE_COLS_COUNT = 5;
const MGM_TILE_ICON_SCALE = 0.45;

const MGM_TILE_FLIP_DELAY = 0.05;

// const MGM_TILE_ICONS = [
	// "#items/item_plant_01_red_rose.png",
	// "#items/item_plant_02_apple.png",
	// "#items/item_plant_03_cotton.png",
	// "#items/item_plant_04_snowflakes.png",
	// "#items/item_plant_05_lavender.png",
	// "#items/item_plant_06_coconut.png",
	// "#items/item_plant_07_lemon.png",
	// "#items/item_plant_08_water_melon.png",
	// "#items/item_plant_09_tea.png",
	// "#items/item_plant_10_jackfruit.png",
	// "#items/item_plant_11_pineapple.png",
	// "#items/item_plant_12_mango.png",
	// "#items/item_plant_13_grapes.png",
	// "#items/item_plant_14_jasmine.png",
	// "#items/item_plant_15_chrysanthemum.png",
	// "#items/item_plant_16_baby.png",
	// "#items/item_plant_17_lotus.png",
	// "#items/item_plant_18_sunflower.png",
	// "#items/item_plant_19_blueberry.png",
	// "#items/item_plant_20_strawberry.png",
// ];
var MGM_TILE_ICONS = null;
	
var MGMatchScene = cc.Scene.extend	
({
	onEnter:function()
	{
		this._super();
		this.show();
	},
	
	show:function()
	{
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			var spineFiles = SPINE_HUD_MINIGAME_BG.split("|");
			cc.loader.load([UI_MGM_HELP,
							UI_MGM_MAIN,
							UI_MGM_EXIT,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png")], 
				function()
				{
					this.resourcesLoaded = true;
					this.show();
				}.bind(this));				
			return;
		}
		
		// ui
		var uiDef =
		{
			matchText:{type:UITYPE_TEXT, value:"TXT_MGMATCH_MATCH", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			matchCount:{type:UITYPE_TEXT, value:"0", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			missText:{type:UITYPE_TEXT, value:"TXT_MGMATCH_MISS", style:TEXT_STYLE_TEXT_NORMAL_RED_2},
			missCount:{type:UITYPE_TEXT, value:"0", style:TEXT_STYLE_TEXT_NORMAL_RED_2},
			backButton:{onTouchEnded:this.showConfirmQuit.bind(this)},
			helpButton:{onTouchEnded:MGMatch.showHelp.bind(MGMatch)},
			itemButton1:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.useItem.bind(this), forceTouchEnd:true},
			itemButton2:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.useItem.bind(this), forceTouchEnd:true},
			itemButton3:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.useItem.bind(this), forceTouchEnd:true},
			itemAmount1:{type:UITYPE_TEXT, value:"0", style:TEXT_STYLE_TEXT_NORMAL},
			itemAmount2:{type:UITYPE_TEXT, value:"0", style:TEXT_STYLE_TEXT_NORMAL},
			itemAmount3:{type:UITYPE_TEXT, value:"0", style:TEXT_STYLE_TEXT_NORMAL},
			buyButton1:{onTouchEnded:this.buyItem.bind(this)},
			buyButton2:{onTouchEnded:this.buyItem.bind(this)},
			buyButton3:{onTouchEnded:this.buyItem.bind(this)},
			price1:{type:UITYPE_TEXT, value:g_MATERIAL[g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM1_ID].DIAMOND_BUY, style:TEXT_STYLE_TEXT_BUTTON},
			price2:{type:UITYPE_TEXT, value:g_MATERIAL[g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM2_ID].DIAMOND_BUY, style:TEXT_STYLE_TEXT_BUTTON},
			price3:{type:UITYPE_TEXT, value:g_MATERIAL[g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM3_ID].DIAMOND_BUY, style:TEXT_STYLE_TEXT_BUTTON},
			hint:{visible:false},
			hintTitle:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_DIALOG},
			hintContent:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_DIALOG},
			bg:{type:UITYPE_SPINE, id:SPINE_HUD_MINIGAME_BG, anim:"bg"},
			wolfMarker:{type:UITYPE_SPINE, id:SPINE_HUD_MINIGAME_BG, anim:"wolf_swimming"},
			timerMarker:{type:UITYPE_SPINE, id:SPINE_HUD_MINIGAME_BG, anim:"clock"},
			timerText:{type:UITYPE_TEXT, value:"00:00", style:TEXT_STYLE_NUMBER},
		};
		
		this.widget = FWPool.getNode(UI_MGM_MAIN, false);
		FWUI.showWidgetWithData(this.widget, null, uiDef, this, UIFX_POP);

		this.matchCount = FWUtils.getChildByName(this.widget, "matchCount");
		this.missCount = FWUtils.getChildByName(this.widget, "missCount");
		this.itemButton1 = FWUtils.getChildByName(this.widget, "itemButton1");
		this.itemButton2 = FWUtils.getChildByName(this.widget, "itemButton2");
		this.itemButton3 = FWUtils.getChildByName(this.widget, "itemButton3");
		this.itemAmount1 = FWUtils.getChildByName(this.widget, "itemAmount1");
		this.itemAmount2 = FWUtils.getChildByName(this.widget, "itemAmount2");
		this.itemAmount3 = FWUtils.getChildByName(this.widget, "itemAmount3");
		this.buyButton1 = FWUtils.getChildByName(this.widget, "buyButton1");
		this.buyButton2 = FWUtils.getChildByName(this.widget, "buyButton2");
		this.buyButton3 = FWUtils.getChildByName(this.widget, "buyButton3");
		this.hint = FWUtils.getChildByName(this.widget, "hint");
		this.hintTitle = FWUtils.getChildByName(this.widget, "hintTitle");
		this.hintContent = FWUtils.getChildByName(this.widget, "hintContent");
		this.wolfSpine = FWUtils.getChildByName(this.widget, "wolfMarker").getChildByTag(UI_FILL_DATA_TAG);
		this.clockSpine = FWUtils.getChildByName(this.widget, "timerMarker").getChildByTag(UI_FILL_DATA_TAG);
		this.timerText = FWUtils.getChildByName(this.widget, "timerText");

		// back key
        var keyboardListener = cc.EventListener.create
		({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode, event)
			{
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.escape)
                    this.handleBackKey();
                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardListener, this);

		// init
		this.tilesCount = MGMatch.data[FLIPPINGCARDS_GAME_LEVEL] * 2;
		this.startTime = 0;
		this.endTime = 0;
		this.matchedCount = 0;
		this.missedCount = 0;
		this.selectedTile1 = null;
		this.selectedTile2 = null;
		this.autoSwapTimer = 0;
		this.itemTimer1 = 0;
		this.itemTimer2 = 0;
		cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
		
		// align tiles
		var cx = cc.winSize.width / 2 + MGM_TILE_OFF_X;
		var cy = cc.winSize.height / 2 + MGM_TILE_OFF_Y;
		var rowsCount = Math.ceil(this.tilesCount / MGM_TILE_COLS_COUNT);
		var sx = cx - MGM_TILE_W * MGM_TILE_COLS_COUNT / 2 + MGM_TILE_W / 2;
		var sy = cy + MGM_TILE_H * rowsCount / 2 - MGM_TILE_H / 2;
		
		// tile value
		var tileValues = [];
		for(var i=0; i<this.tilesCount / 2; i++)
		{
			// feedback: each icon is shown only once
			//var val = _.random(0, MGM_TILE_ICONS.length - 1);
			var val;
			do
			{
				val = _.random(0, MGM_TILE_ICONS.length - 1);
			}
			while(tileValues.indexOf(val) >= 0);
			tileValues.push(val);
			tileValues.push(val);
		}
		tileValues = _.shuffle(tileValues);
		
		// tiles
		var tiles = [];
		var x = sx, y = sy;
		for(var i=0; i<this.tilesCount; i++)
		{
			var tile = new FWObject(this);
			tile.initWithSpine(SPINE_HUD_MINIGAME_BG);
			tile.setAnimation("caps1_default", true);//jira#6411 tile.setAnimation("caps2_default", true);
			tile.setParent(this);
			tile.setPosition(x, y);
			tile.customBoundingBoxes = cc.rect(-MGM_TILE_W / 2, -MGM_TILE_H / 2, MGM_TILE_W, MGM_TILE_H);
			tile.setEventListener(null, this.onTileTouched.bind(this));
			tile.idx = i;
			tile.isFront = false;//jira#6411 tile.isFront = true;
			tile.val = tileValues[i];
			var sprite = new cc.Sprite("#" + MGM_TILE_ICONS[tile.val]);
			sprite.setScale(MGM_TILE_ICON_SCALE, 0);////jira#6411 sprite.setScale(MGM_TILE_ICON_SCALE);
			tile.node.addChild(sprite);
			
			tiles.push(tile);
			
			x += MGM_TILE_W;
			if((i + 1) % MGM_TILE_COLS_COUNT === 0)
			{
				y -= MGM_TILE_H;
				x = sx;
			}
		}
		this.tiles = tiles;

		// clock progress
		this.timerProgressMarker = FWUtils.getChildByName(this.widget, "timerProgressMarker");
		var radialProgress = new cc.ProgressTimer(new cc.Sprite("#hud/hud_minigame_clock_red.png"));
		radialProgress.setType(cc.ProgressTimer.TYPE_RADIAL);
		radialProgress.setPercentage(0);
		radialProgress.setRotation(-10);
		this.timerProgressMarker.addChild(radialProgress);
		this.clockProgress = radialProgress;
		
		this.refreshItemButtons();
		this.setState(MGM_STATE_INTRO);
	},
	
	onExit:function()
	{
		this._super();
		
		cc.director.getScheduler().unscheduleUpdateForTarget(this);
		
		if(this.tiles)
		{
			for(var i=0; i<this.tilesCount; i++)
				this.tiles[i].node.removeAllChildren();
		}
		
		if(this.timerProgressMarker)
			this.timerProgressMarker.removeAllChildren();

		FWUtils.changeParent(this.hint, this.widget);
		
		FWObjectManager.cleanup();
		FWPool.returnNodes();
		FWUtils.onSceneExit();
		
		FWPool.removeNodes(SPINE_HUD_MINIGAME_BG, true);
	},
	
	update:function(dt)
	{
		if(this.state === MGM_STATE_INTRO)
		{
			this.timer -= dt;
			if(this.timer <= 0)
			{
				this.timer = 0;
				this.setState(MGM_STATE_PLAY);
			}
			// jira#6411 //this.setClockTime(this.timer, g_MISCINFO.FLIPPINGCARDS_BOARD_REVIEW_DURATION);
		}
		else if(this.state === MGM_STATE_PLAY)
		{
			if(this.itemTimer1 > 0)
			{
				// using item 1
				this.itemTimer1 -= dt;
			}
			//else // uncomment to exclude item time from play time
			{
				this.timer -= dt;
				if(this.timer <= 0)
				{
					this.timer = 0;
					if(!this.isPairAnimating()) // do not change state while animating
						this.setState(MGM_STATE_FINISH);
				}
				this.setClockTime(this.timer, g_MISCINFO.FLIPPINGCARDS_BOARD_PLAY_DURATION);
				
				// auto swap
				if(this.itemTimer2 > 0)
				{
					// using item 2
					this.itemTimer2 -= dt;
				}
				else
				{
					if(!this.isPairAnimating())
					{
						this.autoSwapTimer -= dt;
						if(this.autoSwapTimer <= 0)
						{
							this.autoSwapTimer = g_MISCINFO.FLIPPINGCARDS_BOARD_MOVEMENT_COUNTDOWN;
							
							var idx1, idx2;
							do
							{
								idx1 = _.random(0, this.tilesCount - 1);
								idx2 = _.random(0, this.tilesCount - 1);
							}
							while(idx1 === idx2);
							
							var tile1 = this.tiles[idx1];
							var tile2 = this.tiles[idx2];
							var pos = tile1.getPosition();
							tile1.moveWithVelocity(tile2.getPosition(), 200, function() {tile1.forceUpdateBoundingBox();});
							tile2.moveWithVelocity(pos, 200, function() {tile2.forceUpdateBoundingBox();});
							
							this.tiles[idx1] = tile2;
							this.tiles[idx2] = tile1;
							tile2.idx = idx1;
							tile1.idx = idx2;
						}
					}
				}
			}
			
			// feedback: make tile icon stick to tile animation
			for(var i=0; i<this.tilesCount; i++)
			{
				var tile = this.tiles[i];
				if(tile.node.getCurrent() !== null)
				{
					var marker = tile.node.findSlot("marker").bone;
					var sprite = tile.node.getChildren()[0];
					sprite.setPosition(marker.worldX, marker.worldY);
				}
			}
		}
	},
	
	setState:function(state)
	{
		if(state === MGM_STATE_INTRO)
		{
			this.timer = g_MISCINFO.FLIPPINGCARDS_BOARD_REVIEW_DURATION + this.tilesCount * MGM_TILE_FLIP_DELAY + 1.35;
			this.setClockTime(g_MISCINFO.FLIPPINGCARDS_BOARD_PLAY_DURATION, g_MISCINFO.FLIPPINGCARDS_BOARD_PLAY_DURATION);
		
			// jira#6411
			for(var i=0; i<this.tilesCount; i++)
			{
				var x = i % MGM_TILE_COLS_COUNT;
				var y = Math.floor(i / MGM_TILE_COLS_COUNT);
				var tile = this.tiles[i];
				this.runAction(cc.sequence(
					cc.delayTime((x + y) * MGM_TILE_FLIP_DELAY + 1),
					cc.callFunc(function(tile) {this.flipTile(tile, true, 0)}.bind(this, tile)),
					cc.delayTime(g_MISCINFO.FLIPPINGCARDS_BOARD_REVIEW_DURATION + 0.35),
					cc.callFunc(function(tile) {this.flipTile(tile, false, 0)}.bind(this, tile))
				));
			}
		}
		else if(state === MGM_STATE_PLAY)
		{
			if(this.state === MGM_STATE_INTRO)
			{
				this.startTime = Math.floor(Game.getGameTimeInSeconds());
			
				// jira#6411
				//for(var i=0; i<this.tilesCount; i++)
				//	this.flipTile(this.tiles[i], false, i * MGM_TILE_FLIP_DELAY);
			}
			
			this.timer = g_MISCINFO.FLIPPINGCARDS_BOARD_PLAY_DURATION;
			this.autoSwapTimer = g_MISCINFO.FLIPPINGCARDS_BOARD_MOVEMENT_COUNTDOWN;
		}
		else if(state === MGM_STATE_FINISH)
		{
			this.endTime = Math.floor(Game.getGameTimeInSeconds());
			
			this.clockProgress.setVisible(false);
			this.clockSpine.setAnimation(0, "clock_over", false);
			this.clockSpine.addAnimation(0, "clock", true);
			if(this.getRemainTilesCount() > 0)
			{
				// lose
				this.wolfSpine.setAnimation(0, "wolf_swimming2", false);
				this.wolfSpine.addAnimation(0, "wolf_swimming_duck", true, 2);
				
				// jira#6408
				//this.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(function() {this.confirmQuit()}.bind(this))));
			}
			
			this.hideConfirmQuit();
			MGMatch.hideHelp();
			MGMatch.endGame();
		}
		
		this.state = state;
	},
	
	refreshItemButtons:function()
	{
		for(var i=1; i<=3; i++)
		{
			var button = this["itemButton" + i];
			var amountText = this["itemAmount" + i];
			var buyButton = this["buyButton" + i];
			
			var amount = gv.userStorages.getItemAmount(g_MISCINFO["FLIPPINGCARDS_BOARD_ITEM" + i + "_ID"]);
			amountText.setString("x" + amount);
			amountText.setVisible(amount > 0);//amountText.setVisible(amount > 1);
			buyButton.setVisible(amount <= 0);
			//FWUtils.applyGreyscaleNode(button, amount <= 0);
			//FWUtils.applyGreyscaleNode(buyButton, false);
		}
	},
	
	setClockTime:function(timeLeft, totalTime)
	{
		this.timerText.setString(FWUtils.secondsToTimeString(Math.ceil(timeLeft)));
		this.clockProgress.setPercentage(100 - timeLeft * 100 / totalTime);
	},
	
	isGameFinished:function()
	{
		return (this.state === MGM_STATE_FINISH);
	},
	
	isGameWin:function()
	{
		return (this.getRemainTilesCount() <= 0);
	},
	
	getRemainTilesCount:function()
	{
		return (this.tilesCount - this.matchedCount * 2);
	},
	
	isPairAnimating:function()
	{
		return (this.selectedTile1 && this.selectedTile2);
	},

	showConfirmQuit:function(sender)
	{
		if(this.isGameFinished())
			return;
		
		var uiDef =
		{
			title:{visible:false},
			content:{type:UITYPE_TEXT, value:"TXT_MGMATCH_EXIT_CONFIRM", style:TEXT_STYLE_TEXT_NORMAL},
			yesText:{type:UITYPE_TEXT, value:"TXT_EXIT_GAME_YES", style:TEXT_STYLE_TEXT_BUTTON},
			noText:{type:UITYPE_TEXT, value:"TXT_EXIT_GAME_NO", style:TEXT_STYLE_TEXT_BUTTON},
			yesButton:{onTouchEnded:this.confirmQuit.bind(this)},
			noButton:{onTouchEnded:this.hideConfirmQuit.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_MGM_EXIT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON);
		
		FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgMGMExit");
	},
	
	hideConfirmQuit:function(sender)
	{
		if(FWUI.isShowing(UI_MGM_EXIT))
		{
			FWUI.hide(UI_MGM_EXIT);
			FWUtils.hideDarkBg(null, "darkBgMGMExit");
		}
	},
	
	confirmQuit:function(sender)
	{
		if(this.state !== MGM_STATE_FINISH)
		{
			this.endTime = (this.state === MGM_STATE_PLAY ? Math.floor(Game.getGameTimeInSeconds()) : 0);
			MGMatch.endGame(); // send end game msg if not yet
		}

		MGMatch.scene = null;
		GardenManager.changeGarden(gv.mainUserData.mainUserId);
		
		// jira#6385
		showPopupByName("MGMatch");
	},
	
	showWinPopup:function(data)
	{
		cc.log("MGMatchScene::showWinPopup: data=" + JSON.stringify(data));
		
		var resultData = data[KEY_DATA];
		var rewardList = FWUtils.getItemsArray(resultData[FLIPPINGCARDS_GAME_REWARD]);
		var isWin = (resultData[FLIPPINGCARDS_GAME_VICTORY] === true);

		var rewardItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true},
		};
		
		var uiDef =
		{
			btnReceive:{onTouchEnded:this.receiveRewards.bind(this)},
			receiveText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:isWin ? "TXT_LEVEL_UP_RECEIVE" : "TXT_MGMATCH_CONTINUE"},
			rewardList:{type:UITYPE_2D_LIST, items:rewardList, itemUI:UI_LEVEL_UP_REWARD, itemDef:rewardItemDef, itemSize:cc.size(140, 170), itemsAlign:"center", singleLine:true, visible:isWin},
			lblBonus:{type:UITYPE_TEXT, style:TEXT_STYLE_TITLE_2, value:"TXT_MGMATCH_REWARD", visible:isWin},
			lblLevel:{type:UITYPE_TEXT, style:TEXT_STYLE_LVUP_2, value:isWin ? "TXT_MGMATCH_WIN2" : "TXT_MGMATCH_LOSE2"},
			lblLevelUp:{type:UITYPE_TEXT, style:TEXT_STYLE_LVUP_1, value:isWin ? "TXT_MGMATCH_WIN1" : ""},
			unlockedItems:{visible:false},
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:2.5, visible:isWin},
			NPC:{visible:false},
			MinigameCloud:{visible:isWin},
			MinigameCloud_lose:{visible:!isWin},
			minigameResult:{visible:true},
			scoreText:{type:UITYPE_TEXT, value:"TXT_MGMATCH_TOTAL_SCORE", style:TEXT_STYLE_TEXT_NORMAL},
			scoreValue:{type:UITYPE_TEXT, value:isWin ? resultData[FLIPPINGCARDS_GAME_POINTS] : 0, style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			timeText:{type:UITYPE_TEXT, value:"TXT_MGMATCH_TIME_SPENT", style:TEXT_STYLE_TEXT_NORMAL},
			timeValue:{type:UITYPE_TEXT, value:FWUtils.secondsToTimeString(this.endTime - this.startTime), style:TEXT_STYLE_TEXT_NORMAL_GREEN},
		};
		
		var widget = FWUI.showWithData(UI_LEVEL_UP, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON);

		FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgResult", null, false);
		
		if(isWin)
			Game.showFireworks(widget, {x: 0, y: 0, width: cc.winSize.width, height: cc.winSize.height});
		
		// fix: btnReceive's position
		var btnReceive = FWUtils.getChildByName(widget, "btnReceive");
		btnReceive.setPosition(cc.p(0, -280));
	},
	
	//showLosePopup:function()
	//{
	//	var displayInfo = {title:"TXT_MINIGAME_LOSE_TITLE", content:"TXT_MINIGAME_LOSE_CONTENT", avatar:NPC_AVATAR_CLOUD, avatarBg:true};
	//	Game.showPopup(displayInfo, this.confirmQuit.bind(this));
	//},
	
	receiveRewards:function(sender)
	{
		//FWPool.getNode(UI_LEVEL_UP, false).hasFireworks = false;
		this.confirmQuit();
	},
	
	useItem:function(sender)
	{
		if(this.isGameFinished())
			return;

		// hide hint first
		if(this.hint.isVisible())
		{
			this.hideItemHint();
			return;
		}
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.showItemHint2);		
		
		var name = sender.getName();
		var idx = Number(name.substring(name.length - 1));
		var itemId = g_MISCINFO["FLIPPINGCARDS_BOARD_ITEM" + idx + "_ID"];
		var amount = gv.userStorages.getItemAmount(itemId);
		if(amount <= 0)
		{
			//this.buyItemId(itemId, sender); // use buyButton instead
			return;
		}
		
		this.useItemId(itemId);
	},
	
	useItemId:function(itemId)
	{
		if(this.state !== MGM_STATE_PLAY)
			return; // not playing
		
		if(this.isPairAnimating())
			return; // animating
		
		if(itemId === g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM3_ID && this.itemTimer1 > 0)
			return; // cannot use these items at the same time
			
		MGMatch.useItem(itemId);
	},
	
	useItemId2:function(itemId)
	{		
		if(itemId === g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM1_ID)
		{
			// item1: show all
			var func = function(isFront)
			{
				for(var i=0, idx=0; i<this.tilesCount; i++)
				{
					if(this.tiles[i].val < 0)
						continue;
					
					this.flipTile(this.tiles[i], isFront, idx * MGM_TILE_FLIP_DELAY);
					idx++;
				}
			}.bind(this);
			this.runAction(cc.sequence(cc.callFunc(function() {func(true);}.bind(this)), cc.delayTime(g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM1_EFFECT), cc.callFunc(function() {func(false);}.bind(this))));
			this.itemTimer1 = g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM1_EFFECT + this.getRemainTilesCount() * MGM_TILE_FLIP_DELAY;
			this.selectedTile1 = this.selectedTile2 = null;
		}
		else if(itemId === g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM2_ID)
		{
			// item2: pause swapping
			this.itemTimer2 = g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM2_EFFECT;
		}
		else if(itemId === g_MISCINFO.FLIPPINGCARDS_BOARD_ITEM3_ID)
		{
			// item3: remove a pair
			// if a tile is selected, remove its matching
			var idx1, idx2;
			if(this.selectedTile1)
				idx1 = this.selectedTile1.idx;
			else
			{
				do
				{
					idx1 = _.random(0, this.tilesCount - 1);
				}
				while(this.tiles[idx1].val < 0);
			}
			
			var tile1 = this.tiles[idx1];
			for(var i=0; i<this.tilesCount; i++)
			{
				if(i === idx1 || this.tiles[i].val < 0)
					continue;
				
				if(this.tiles[i].val === tile1.val)
				{
					idx2 = i;
					break;
				}
			}
			
			if(tile1 !== this.selectedTile1)
				this.onTileTouched(null, tile1);
			this.onTileTouched(null, this.tiles[idx2]);
		}
	},
	
	buyItem:function(sender)
	{
		if(this.isGameFinished())
			return;
		
		var name = sender.getName();
		var idx = Number(name.substring(name.length - 1));
		var itemId = g_MISCINFO["FLIPPINGCARDS_BOARD_ITEM" + idx + "_ID"];
		this.buyItemId(itemId, sender);
	},
	
	buyItemId:function(itemId, sender)
	{
		var price = g_MATERIAL[itemId].DIAMOND_BUY;
		var fxPos = FWUtils.getWorldPosition(sender);
		if(gv.userData.getCoin() < price)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_DIAMOND_TITLE"), fxPos, cc.WHITE);
			return;
		}
		
		Game.quickBuy(itemId, 1, 0, price, fxPos, function() {this.refreshItemButtons();}.bind(this));
	},
	
	handleBackKey:function()
	{
		if(FWUI.isShowing(UI_MGM_EXIT))
		{
			// do nothing
			//this.hideConfirmQuit();
		}
		else if(FWUI.isShowing(UI_MGM_HELP))
			MGMatch.hideHelp();
		else
			this.showConfirmQuit();
	},
	
	onTileTouched:function(touch, object)
	{
		if(this.state !== MGM_STATE_PLAY // not playing
			|| this.isPairAnimating() // animating
			|| (this.selectedTile1 !== null && object === this.selectedTile1) // cannot select a tile twice
			|| object.val < 0 // tile is removed
			|| this.itemTimer1 > 0) // using items
			return;
			
		if(!this.selectedTile1)
		{
			this.selectedTile1 = object;
			this.flipTile(this.selectedTile1, true);
			return;
		}
		
		this.selectedTile2 = object;
		this.flipTile(this.selectedTile2, true);
		
		var func1 = null, func2 = null;
		if(this.selectedTile1.val !== this.selectedTile2.val)
		{
			func1 = cc.callFunc(function()
			{
				this.flipTile(this.selectedTile1, false);
				this.flipTile(this.selectedTile2, false);
			}.bind(this));
			func2 = cc.callFunc(function()
			{
				this.selectedTile1 = this.selectedTile2 = null;
				this.missedCount++;
				this.missCount.setString(this.missedCount);
			}.bind(this));			
		}
		else
		{
			func1 = cc.callFunc(function()
			{
				this.selectedTile1.val = this.selectedTile2.val = -1;
				this.hideMatchTile(this.selectedTile1);
				this.hideMatchTile(this.selectedTile2);
			}.bind(this));
			func2 = cc.callFunc(function()
			{
				this.selectedTile1 = this.selectedTile2 = null;
				this.matchedCount++;
				this.matchCount.setString(this.matchedCount);
				if(this.getRemainTilesCount() <= 0)
					this.setState(MGM_STATE_FINISH);
			}.bind(this));			
		}
		
		this.runAction(cc.sequence(
			cc.delayTime(0.5),
			func1,
			func2
		));
	},
	
	flipTile:function(tile, isFront, delay)//web flipTile:function(tile, isFront, delay = 0)
	{
		if(delay === undefined)
			delay = 0;
		
		tile.node.stopActionByTag(1);//tile.node.stopAllActions();
		
		var icon = tile.node.getChildren()[0];
		icon.stopActionByTag(1);//icon.stopAllActions();
		
		if(!delay)
		{
			this.flipTile2(tile, isFront);
			return;
		}
		
		//tile.node.runAction(cc.sequence(cc.delayTime(delay), cc.callFunc(function() {MGMatch.scene.flipTile2(tile, isFront);})));
		var seq = cc.sequence(cc.delayTime(delay), cc.callFunc(function() {if(MGMatch.scene) MGMatch.scene.flipTile2(tile, isFront);}));
		seq.tag = 1;
		tile.node.runAction(seq);
	},
	
	flipTile2:function(tile, isFront)
	{
		var icon = tile.node.getChildren()[0];
		var seq;
		
		if(isFront)
		{
			tile.node.setAnimation(0, "caps1_default", false);
			tile.node.addAnimation(0, "caps", false);
			tile.node.addAnimation(0, "caps2_default", false);
			
			icon.setScale(0, MGM_TILE_ICON_SCALE);
			//icon.runAction(cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, MGM_TILE_ICON_SCALE, MGM_TILE_ICON_SCALE)));
			seq = cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, MGM_TILE_ICON_SCALE, MGM_TILE_ICON_SCALE));
		}
		else
		{
			tile.node.setAnimation(0, "caps2_default", false);
			tile.node.addAnimation(0, "caps_miss", false);
			tile.node.addAnimation(0, "caps1_default", false);
			
			icon.setScale(MGM_TILE_ICON_SCALE, MGM_TILE_ICON_SCALE);
			//icon.runAction(cc.sequence(cc.delayTime(0.3), cc.scaleTo(0.25, 0, MGM_TILE_ICON_SCALE)));
			seq = cc.sequence(cc.delayTime(0.3), cc.scaleTo(0.25, 0, MGM_TILE_ICON_SCALE));
		}
		
		seq.tag = 1;
		icon.runAction(seq);
		
		tile.isFront = isFront;
	},
	
	hideMatchTile:function(tile)
	{
		tile.node.setAnimation(0, "caps_point", false);
		
		var icon = tile.node.getChildren()[0];
		icon.runAction(cc.fadeTo(0.5, 0));
		
		FWUtils.showSpine(SPINE_EFFECT_FIREWORK, null, "effect_boom", false, this, tile.getWorldPosition(), tile.node.getLocalZOrder() + 1);
	},
	
	hintItemNum: null,
	showItemHint:function(sender)
	{
		var name = sender.getName();
		this.hintItemNum = Number(name.substring(name.length - 1));
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.showItemHint2);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showItemHint2, 0, 0, 0.35, false);
	},
	
	showItemHint2:function()
	{
		this.hintTitle.setString(FWLocalization.text("TXT_MGMATCH_ITEM_TITLE_" + this.hintItemNum));
		this.hintContent.setString(FWLocalization.text("TXT_MGMATCH_ITEM_CONTENT_" + this.hintItemNum));
		this.hint.setVisible(true);
		FWUtils.changeParent(this.hint, MGMatch.scene);
		
		var pos = FWUtils.getWorldPosition(this["itemButton" + this.hintItemNum]);
		pos.y += 50;
		this.hint.setPosition(pos);
		
		this.hint.setScale(0);
		this.hint.stopAllActions();
		this.hint.runAction(cc.scaleTo(0.15, 1));
	},
	
	hideItemHint:function()
	{
		this.hint.stopAllActions();
		this.hint.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.hide()));
	},
});


network.packetMap[gv.CMD.FLIPPINGCARDS_GET] = MGMatch.ResponseFlippingCardsGet;
network.packetMap[gv.CMD.FLIPPINGCARDS_GAME_START] = MGMatch.ResponseFlippingCardsGameStart;
network.packetMap[gv.CMD.FLIPPINGCARDS_GAME_END] = MGMatch.ResponseFlippingCardsGameEnd;
network.packetMap[gv.CMD.FLIPPINGCARDS_GAME_USE_ITEM] = MGMatch.ResponseFlippingCardsUseItem;
network.packetMap[gv.CMD.FLIPPINGCARDS_CLAIM_CHECKPOINT] = MGMatch.ResponseFlippingCardsCheckpointReward;
