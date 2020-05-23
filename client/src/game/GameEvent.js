
const EVENT_TAB_GIFT = 0;
const EVENT_TAB_PUZZLE = 1;

const EVENT_MILESTONE_W = 300;
const EVENT_POINTER_Y = 23;
const EVENT_POINTER_OFFX = 0;

const EVENT_INFO_SIZE = cc.size(247, 441);// feedback: show part of next item const EVENT_INFO_SIZE = cc.size(257, 441);
const EVENT_INFO_SIZE_EXPAND = cc.size(745, 441);
const EVENT_INFO_EXPAND_DURATION = 0.25;

const EVENT_POSM_ITEM_ID = "E21";
const EVENT_TOKEN_ITEM_ID = g_EVENT_01.E01_POINT;

var GameEvent =
{
	currentEvent: null,
	currentTab: null,
	pointerPos: 0,
	penguin: null,
	pickedGift: null,
	snowParticle: null,
	currentMilestone: null,
	showMilestoneRewards: false,
	pointer: null, // jira#5033
	isReceivingReward: false, // jira5878
	
	// show arrows when receivable gifts are out of view
	leftArrow: null,
	rightArrow: null,
	firstGift: null,
	lastGift: null,
	
	init:function()
	{
		// unify event keys
		this.events = [null, g_EVENT_01];
		for(var i=0; i<this.events.length; i++)
		{
			var event = this.events[i];
			for(var key in event)
			{
				var key2 = key.substr(4);
				event[key2] = event[key];
			}
		}
		
		this.currentEvent = this.getActiveEvent();
		this.currentTab = EVENT_TAB_GIFT;
		
		// fx
		this.snowParticle = new cc.ParticleSystem("effects/effect_color_paper.plist");
		this.snowParticle.retain();
		this.snowParticle.setTotalParticles(15);
	},
	
	getActiveEvent:function()
	{
		var time = Game.getGameTimeInSeconds();
		for(var i=0; i<this.events.length; i++)
		{
			var event = this.events[i];
			if(!event)
				continue;
			
			if(time >= event.UNIX_START_TIME && time < event.UNIX_END_TIME)
				return event;
		}
		return null;
	},
	
	getEventById:function(id)
	{
		for(var i=0; i<this.events.length; i++)
		{
			if(this.events[i] && this.events[i].ID === id)
				return this.events[i];
		}
		return null;
	},
	
	getCurrentEventDropItemIcon:function()
	{
		// WARNING: modify Ranking::getTabIcon::if(tab === RANKING_TAB_EVENT) too!
		if(GameEvent.currentEvent)
			return "items/" + g_EVENT_ITEMS[g_EVENT_01.E01_DROPITEM].GFX;
		else if(GameEventTemplate2.getActiveEvent())
			return Game.getItemGfxByDefine(g_EVENT_02.E02_DROPITEM).sprite;
		else if(GameEventTemplate3.getActiveEvent())
		{
			return Game.getItemGfxByDefine(g_EVENT_03.E03_DROPITEM).sprite;
		}

		return null; // no event
	},
	
	resourcesLoaded: false,
	eventItemsLoaded: false,
	show:function()
	{
		if(!this.checkEndEvent())
			return;
		
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			var spineFiles = SPINE_HUD_EVENT_BACKGROUND.split("|");
			var spineFiles2 = SPINE_NPC_EVENT.split("|");
			cc.loader.load([UI_EVENT,
							UI_EVENT_MILESTONE,
							UI_EVENT_MILESTONE_GIFT,
							UI_EVENT_PUZZLE,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png"), 
							spineFiles2[0],
							spineFiles2[1],
							spineFiles2[0].replace(".json", ".png")], 
				function()
				{
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}
		
		var uiDef =
		{
			scrollBgMarker:{type:UITYPE_SPINE, value:SPINE_HUD_EVENT_BACKGROUND, anim:"moving", scale: 1},//scrollBgMarker:{type:UITYPE_SPINE, value:SPINE_HUD_EVENT_BACKGROUND, anim:this.currentTab === EVENT_TAB_GIFT ? "moving" : "stop", scale: 1},
			tabGift:{visible:this.currentTab === EVENT_TAB_GIFT},
			//npcMarker:{type:UITYPE_SPINE, value:SPINE_NPC_EVENT, anim:"moving", scale:0.15},
			leftArrow:{visible:false},
			rightArrow:{visible:false},
			tabPuzzle:{visible:this.currentTab === EVENT_TAB_PUZZLE},
			puzzleHint:{type:UITYPE_TEXT, value:"TXT_EVENT_PUZZLE_HINT", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			tabGiftOn:{visible:this.currentTab === EVENT_TAB_GIFT},
			tabGiftOff:{visible:this.currentTab !== EVENT_TAB_GIFT, onTouchEnded:function() {GameEvent.showTab(EVENT_TAB_GIFT);}},
			tabPuzzleOn:{visible:this.currentTab === EVENT_TAB_PUZZLE},
			tabPuzzleOff:{visible:this.currentTab !== EVENT_TAB_PUZZLE, onTouchEnded:function() {GameEvent.showTab(EVENT_TAB_PUZZLE);}},
			closeButton:{onTouchEnded:this.hide.bind(this)},
			infoButton:{onTouchEnded:this.showInfo.bind(this)},
			tabGiftInfo:{visible:this.currentTab === EVENT_TAB_GIFT},
			giftTitle:{type:UITYPE_TEXT, value:"TXT_EVENT_NAME", style:TEXT_STYLE_TITLE_1},
			itemCount:{type:UITYPE_TEXT, value:gv.userStorages.getItemAmount(this.currentEvent.POINT)},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:this.currentEvent.UNIX_START_TIME, endTime:this.currentEvent.UNIX_END_TIME, countdown:true, onFinished:this.checkEndEvent.bind(this)},
			tabPuzzleInfo:{visible:this.currentTab === EVENT_TAB_PUZZLE},
			puzzleTitle:{type:UITYPE_TEXT, value:"TXT_EVENT_PUZZLE_TITLE", style:TEXT_STYLE_TITLE_1},
			npc:{type:UITYPE_SPINE, visible:this.currentTab === EVENT_TAB_PUZZLE, value:SPINE_NPC_EVENT, anim:"waiting", scale:cc.p(0.4, 0.4)},
		};
		
		if(this.currentTab === EVENT_TAB_GIFT)
			this.showGiftList(uiDef);
		else if(this.currentTab === EVENT_TAB_PUZZLE)
			this.showPuzzleList(uiDef);
		
		var widget = FWPool.getNode(UI_EVENT, false);
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_EVENT);
			AudioManager.effect (EFFECT_POPUP_SHOW);
			cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			// show arrows when receivable gifts are out of view
			this.leftArrow = FWUtils.getChildByName(widget, "leftArrow");
			this.rightArrow = FWUtils.getChildByName(widget, "rightArrow");
			this.leftArrow.runAction(cc.repeatForever(cc.sequence(
				cc.moveTo(0.5, cc.p(25, 175)),
				cc.moveTo(0.5, cc.p(35, 175))
			)));
			this.rightArrow.runAction(cc.repeatForever(cc.sequence(
				cc.moveTo(0.5, cc.p(775, 175)),
				cc.moveTo(0.5, cc.p(765, 175))
			)));
			
			// fx
			if(!this.snowParticle.getParent())
			{
				var center = FWUtils.getChildByName(widget, "scrollBgMarker");
				center.addChild(this.snowParticle);
				this.snowParticle.setPosition(cc.p(0, cc.winSize.height));
				this.snowParticle.setLocalZOrder(1);
			}
			
			// penguin
			var npcMarker = FWUtils.getChildByName(widget, "npcMarker");
			this.penguin = new FWObject();
			this.penguin.initWithSpine(SPINE_NPC_EVENT);
			this.penguin.setScale(-0.25, 0.25);//this.penguin.setScale(-0.15, 0.15);
			this.penguin.setParent(Game.gameScene, Z_UI_EVENT + 1);
			this.penguin.setPosition(FWUtils.getWorldPosition(npcMarker));
		}
		
		// feedback
		var scrollBg = FWUtils.getChildByName(widget, "scrollBgMarker").getChildByTag(UI_FILL_DATA_TAG);
		scrollBg.setTimeScale(0.5);
		
		if(this.currentTab === EVENT_TAB_GIFT)
		{
			// scroll to pointer pos
			var giftList = FWUtils.getChildByName(widget, "giftList");
			var size = giftList.getContentSize();
			var container = giftList.getInnerContainer();
			var containerSize = container.getContentSize();
			var posX = -this.pointerPos + 300;
			var min = -containerSize.width + size.width;
			if(posX < min)
				posX = min;
			if(posX > 0)
				posX = 0;
			container.setPosition(posX, 0);
			
			// flip the penguin
			//this.penguin = FWUtils.getChildByName(widget, "npcMarker").getChildByTag(UI_FILL_DATA_TAG);
			//this.penguin.setScale(-0.15, 0.15);
			
			// show arrows when receivable gifts are out of view
			// penguin flies to pointer position
			this.firstGift = this.lastGift = null;
			this.pointer = null;
			var children = giftList.getChildren();
			for(var i=0; i<children.length; i++)
			{
				if(children[i].uiBaseData.canReceiveRewards && !this.firstGift)
					this.firstGift = FWUtils.getChildByName(children[i], "giftButton");
				if(children[children.length - i - 1].uiBaseData.canReceiveRewards && !this.lastGift)
					this.lastGift = FWUtils.getChildByName(children[children.length - i - 1], "giftButton");
				if(children[i].uiBaseData.showPointer)
					this.pointer = FWUtils.getChildByName(children[i], "pointer");
				if(this.firstGift && this.lastGift && this.pointer)
					break;
			}
			
			// penguin
			this.penguin.setVisible(true);
			this.penguin.setAnimation("moving", true);
		}
		else
			this.penguin.setVisible(false);
		
		this.pickedGift = null;
	},
	
	hide:function()
	{
		if(this.isReceivingReward)
			return;
		
		if(FWUI.isShowing(UI_EVENT))
		{
			FWUI.hide(UI_EVENT, {fx:UIFX_POP, callback:function() {FWPool.removeNodes(SPINE_HUD_EVENT_BACKGROUND, true);}});
			AudioManager.effect (EFFECT_POPUP_CLOSE);
			Game.gameScene.unregisterBackKey(this.hideFunc);
			cc.director.getScheduler().unscheduleUpdateForTarget(this);
		}
		this.pickedGift = null;
		this.currentMilestone = null;
		this.showMilestoneRewards = false;
		this.isReceivingReward = false;
		
		if(this.penguin)
		{
			this.penguin.uninit();
			this.penguin = null;
		}
	},
	
	update:function(dt)
	{
		if(this.currentTab === EVENT_TAB_GIFT)
		{
			if(this.firstGift && this.lastGift)
			{
				var leftArrowPos = FWUtils.getWorldPosition(this.leftArrow).x;
				var rightArrowPos = FWUtils.getWorldPosition(this.rightArrow).x;
				var firstGiftPos = FWUtils.getWorldPosition(this.firstGift).x;
				var lastGiftPos = FWUtils.getWorldPosition(this.lastGift).x;
				this.leftArrow.setVisible(firstGiftPos < leftArrowPos);
				this.rightArrow.setVisible(lastGiftPos > rightArrowPos);
			}
			
			// jira#5033
			if(this.pointer
				&& FWPool.getNode(UI_EVENT, false).getScaleX() === 1) // only fly to pointer when finished showing
			{
				var pointerPos = FWUtils.getWorldPosition(this.pointer);
				var penguinPos = this.penguin.getWorldPosition();
				var dstPos = cc.p(pointerPos.x, penguinPos.y);
				dstPos.x = FWUtils.clamp(dstPos.x, cc.winSize.width / 2 - 280, cc.winSize.width / 2 + 280);
				if(penguinPos.x !== dstPos.x && this.penguin.node != null && this.penguin.node.getNumberOfRunningActions() <= 0)
					this.penguin.node.runAction(cc.moveTo(1, dstPos).easing(cc.easeSineInOut()));
			}
		}
		
		if(this.showMilestoneRewards)
		{
			var rewards = GameEvent.currentEvent.REWARDS[GameEvent.currentMilestone].actualItems;
			if(rewards)
			{
				rewards = FWUtils.getItemsArray(rewards);
				var srcRewards = this.getMilestoneRewardInfo(GameEvent.currentMilestone).items;// update: rewards by level group GameEvent.currentEvent.REWARDS[GameEvent.currentMilestone].items;
				var isRandomMilestone = false;
				for(var j=0; j<rewards.length; j++)
				{
					var reward = rewards[j];
					reward.hasSmokeFx = false;
					
					for(var i=0; i<srcRewards.length; i++)
					{
						if(srcRewards[i].id === reward.itemId)
						{
							if(srcRewards[i].rate !== -1)
							{
								reward.hasSmokeFx = true;
								isRandomMilestone = true;
							}
							break;
						}
					}
				}
				
				// jira#6643
				//Game.showGiftPopup(rewards, "TXT_EVENT_NAME", (function() {this.show();}).bind(this), null, true);
				var pos = this.penguin.getPosition();
				pos.y -= 50;
				var spine = FWUtils.showSpine(SPINE_GIFT_BOX_EVENT, null, isRandomMilestone ? "gift_box_random_idle" : "gift_box_normal_idle", true, this.penguin.getParent(), pos, this.penguin.node.getLocalZOrder() + 1, false);
				spine.runAction(cc.sequence(
						cc.jumpTo(1, FWUtils.getWorldPosition(Game.gameScene.uiMainBtnMail), 200, 1.5).easing(cc.easeExponentialIn()),
						cc.removeSelf()
					));
				
				this.showMilestoneRewards = false;
				this.currentMilestone = null;
				this.isReceivingReward = false;
			}
		}
	},
	
	showTab:function(tab)
	{
		if(this.isReceivingReward)
			return;
		
		this.currentTab = tab;
		this.show();
	},
	
	showInfo:function(sender)
	{
		if(this.isReceivingReward)
			return;
		
		// cheat to test event milestones
		// TODO: remove
		//gv.userStorages.addItem(this.currentEvent.POINT, 500);
		//this.show();
		//return;
		
		// jira#6037
		var requiredLevel = g_MISCINFO.EV01_USER_LEVEL;
		var isEnoughLevel = gv.userData.isEnoughLevel(requiredLevel);
		
		var currentTime = Game.getGameTimeInSeconds();
		var itemList = [];
		for(var i=0; i<this.events.length; i++)
		{
			var event = this.events[i];
			if(!event)
				continue;
			if(currentTime < event.UNIX_START_TIME || currentTime >= event.UNIX_END_TIME)
				continue;
			
			var item = {};
			item.content = "common/images/hud_event_news_bg.png";
			item.startTime = event.UNIX_START_TIME;
			item.endTime = event.UNIX_END_TIME;
			item.title = "TXT_EVENT_NAME";
			item.isEnoughLevel = isEnoughLevel;
			item.nameItem = "gameEvent";
			item.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),requiredLevel);
			item.infoEvent1= "TXT_EVENT_NEWS_INFO1";
			item.infoEvent2= "TXT_EVENT_NEWS_INFO2";
			item.infoEvent3= "TXT_EVENT_NEWS_INFO3";
			item.infoEvent4= "";
			itemList.push(item);
		}
		
		// feedback: permanent events
		if(gv.pigBankPanel.checkActive())
		{
			var timeEventPigBank = gv.pigBankPanel.getTimeEvent();
			var itemPig = {};
			itemPig.content = "common/images/hud_piggybank_news.png";
			itemPig.startTime = timeEventPigBank.start;
			itemPig.endTime=timeEventPigBank.end;
			itemPig.title = "TXT_PIGBANK_BOARD_NEWS";
			itemPig.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.PIG_UNLOCK_LEVEL);
			itemPig.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.PIG_UNLOCK_LEVEL);
			itemPig.nameItem = "pigBank";
			itemPig.infoEvent1= "TXT_PIGBANK_NEWS_INFO1";
			itemPig.infoEvent2= "TXT_PIGBANK_NEWS_INFO2";
			itemPig.infoEvent3= "TXT_PIGBANK_NEWS_INFO3";
			itemPig.infoEvent4= "";
			//itemList.push({content:"common/images/hud_piggybank_news.png", startTime:timeEventPigBank.start, endTime:timeEventPigBank.end, title:"TXT_PIGBANK_BOARD_NEWS",requiredLevel:cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.PIG_UNLOCK_LEVEL), isEnoughLevel:gv.userData.isEnoughLevel(g_MISCINFO.PIG_UNLOCK_LEVEL),isPig:true});
			itemList.push(itemPig);
		}
		if(gv.consumEventMgr.checkActive())
		{
			var timeConsume =  gv.consumEventMgr.getTimeEvent();
			var itemConsume = {};
			itemConsume.content = "common/images/hud_consumeevent_news_bg.png";
			itemConsume.startTime = timeConsume.start;
			itemConsume.endTime=timeConsume.end;
			itemConsume.title = "TXT_CONSUME_BOARD_NEWS";
			itemConsume.nameItem = "consume";
			itemConsume.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.CONSUME_USER_LEVEL);
			itemConsume.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.CONSUME_USER_LEVEL);
			itemConsume.infoEvent1= "TXT_CONSUME_NEWS_INFO1";
			itemConsume.infoEvent2= "TXT_CONSUME_NEWS_INFO2";
			itemConsume.infoEvent3= "TXT_CONSUME_NEWS_INFO3";
			itemConsume.infoEvent4= "";
			itemList.push(itemConsume);
		}

        if(GameEventTemplate2.getActiveEvent())
		{
			//var timeEventPigBank = gv.pigBankPanel.getTimeEvent();
			var itemGame = {};
			itemGame.content = "common/images/hud_event_news_bg_1.png";
			itemGame.startTime = g_EVENT_02.E02_UNIX_START_TIME;
			itemGame.endTime=g_EVENT_02.E02_UNIX_END_TIME;
			itemGame.title = "TXT_EVENT2_NAME";
			itemGame.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.EV02_USER_LEVEL);
			itemGame.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.EV02_USER_LEVEL);
			itemGame.nameItem = "gameEvent2";
			itemGame.infoEvent1= "TXT_EVENT2_INFO1";
			itemGame.infoEvent2= "TXT_EVENT2_INFO2";
			itemGame.infoEvent3= "TXT_EVENT2_INFO3";
			itemGame.infoEvent4= "";
			itemList.push(itemGame);
		}

		if(GameEventTemplate3.getActiveEvent())
		{
			//var timeEventPigBank = gv.pigBankPanel.getTimeEvent();
			var itemGame = {};
			itemGame.content = "common/images/hud_event_news_bg_fishing.png";
			itemGame.startTime = g_EVENT_03.E03_UNIX_START_TIME;
			itemGame.endTime=g_EVENT_03.E03_UNIX_END_TIME;
			itemGame.title = "TXT_EVENT3_NAME";
			itemGame.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.EV03_USER_LEVEL);
			itemGame.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.EV03_USER_LEVEL);
			itemGame.nameItem = "gameEvent3";
			itemGame.infoEvent1= "TXT_EVENT3_INFO1";
			itemGame.infoEvent2= "TXT_EVENT3_INFO2";
			itemGame.infoEvent3= "TXT_EVENT3_INFO3";
			itemGame.infoEvent4= "";
			itemList.push(itemGame);
		}
		//if(AccumulateStore.isActive ())
		//{
		//	//var timeEventPigBank = gv.pigBankPanel.getTimeEvent();
		//	var itemGame = {};
		//	itemGame.content = "common/images/hud_event_news_bg_fishing.png";
		//	itemGame.startTime =  g_PAYMENT_ACCUMULATE.UNIX_TIME_START;
		//	itemGame.endTime=g_PAYMENT_ACCUMULATE.UNIX_TIME_END
		//	itemGame.title = "TXT_EVENT_ACCUMULATE_NAME";
		//	itemGame.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.ACCUMULATE_USER_LEVEL);
		//	itemGame.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.ACCUMULATE_USER_LEVEL);
		//	itemGame.nameItem = "gameEventAccumulate";
		//	itemGame.infoEvent1= "TXT_EVENT_ACCUMULATE_INFO1";
		//	itemGame.infoEvent2= "TXT_EVENT_ACCUMULATE_INFO2";
		//	itemGame.infoEvent3= "TXT_EVENT_ACCUMULATE_INFO3";
		//	itemGame.infoEvent4= "";
		//	itemList.push(itemGame);
		//}

		if(g_MISCINFO.FANPAGE_EVENT_TIME_END && Game.getGameTimeInSeconds() < g_MISCINFO.FANPAGE_EVENT_TIME_END && COUNTRY === COUNTRY_VIETNAM)
		{
			//itemList.push({content:"common/images/hud_event_news_bg_fanpage_01.png",infoEvent1:"",infoEvent2:"",infoEvent3:"",infoEvent4:"", startTime:0, endTime:0, title:"TXT_EVENT_FANPAGE", isEnoughLevel:true, hasPlayButton:true, nameItem:"evtFanpage", playButtonSprite:"hud/btn_blue.png"});
			//itemList.push({content:"common/images/hud_event_news_bg_fanpage_02.png",infoEvent1:"",infoEvent2:"",infoEvent3:"",infoEvent4:"", startTime:0, endTime:0, title:"TXT_EVENT_FANPAGE2", isEnoughLevel:true, hasPlayButton:true, nameItem:"evtFanpage", playButtonSprite:"hud/btn_blue.png"});
			itemList.push({content:"common/images/hud_event_news_bg_fanpage_03.png",infoEvent1:"",infoEvent2:"",infoEvent3:"",infoEvent4:"", startTime:0, endTime:0, title:"TXT_EVENT_FANPAGE3", isEnoughLevel:true, hasPlayButton:true, nameItem:"evtFanpage", playButtonSprite:"hud/btn_blue.png"});
		}
		
		// feedback
		if(COUNTRY === COUNTRY_THAILAND && g_MISCINFO.FANPAGE_EVENT_TIME_END_TH && Game.getGameTimeInSeconds() < g_MISCINFO.FANPAGE_EVENT_TIME_END_TH)
			itemList.push({content:"common/images/hud_event_news_bg_fanpage_th.png",infoEvent1:"",infoEvent2:"",infoEvent3:"",infoEvent4:"", startTime:0, endTime:0, title:"TXT_EVENT_FANPAGE3", isEnoughLevel:true, hasPlayButton:true, nameItem:"evtFanpage", playButtonSprite:"hud/btn_blue.png"});
		
		itemList.push({content:"common/images/hud_ranking_news_bg.png",infoEvent1:"TXT_RANKING_NEWS_INFO1",infoEvent2:"TXT_RANKING_NEWS_INFO2",infoEvent3:"TXT_RANKING_NEWS_INFO3",infoEvent4:"", startTime:0, endTime:0, title:"TXT_LEADER_BOARD_NEWS_TITLE", isEnoughLevel:true, hasPlayButton:gv.userData.isEnoughLevel(g_MISCINFO.RANKING_BOARD_LEVEL), isRanking:true});
		itemList.push({content:"common/images/hud_event_news_bg_levelup.png",infoEvent1:"",infoEvent2:"",infoEvent3:"",infoEvent4:"", startTime:0, endTime:0, title:"TXT_EVENT_NAME_LEVEL_UP", isEnoughLevel:true});
		
		if(itemList.length <= 0)
			return;
		
		for(var i=0; i<itemList.length; i++)
		{
			if(!itemList[i].playButtonSprite)
				itemList[i].playButtonSprite = "hud/btn_green.png";
		}
		
		var itemDef =
		{
			panel:{onTouchEnded:this.showDetailInfo.bind(this)},
			center:{onTouchEnded:this.showDetailInfo.bind(this)},//web
			timerMarker:{type:UITYPE_TIME_BAR, startTime:"data.startTime", endTime:"data.endTime", countdown:true, onFinished:this.showInfo.bind(this), visible:"data.startTime > 0"},
			playButton:{onTouchEnded:this.onPlayButtonTouched.bind(this), visible:"(data.isEnoughLevel && data.startTime > 0) || data.hasPlayButton", type:UITYPE_IMAGE, field:"playButtonSprite", size:cc.size(180, 64)},
			playText:{type:UITYPE_TEXT, value:"TXT_EVENT_PLAY_NOW", style:TEXT_STYLE_TEXT_BIG, visible:"(data.isEnoughLevel && data.startTime > 0) || data.hasPlayButton"},
			unlockText:{type:UITYPE_TEXT, field:"requiredLevel", style:TEXT_STYLE_TEXT_BUTTON, visible:"!data.isEnoughLevel"},
			expand:{visible:true},
			collapse:{visible:false},
			content:{type:UITYPE_IMAGE, field:"content", isLocalTexture:true, discard:true},
			title:{type:UITYPE_TEXT, field:"title", style:TEXT_STYLE_TEXT_DIALOG},
			infoEvent1:{type:UITYPE_TEXT, field:"infoEvent1", style:TEXT_STYLE_NEWS},
			infoEvent2:{type:UITYPE_TEXT, field:"infoEvent2", style:TEXT_STYLE_NEWS},
			infoEvent3:{type:UITYPE_TEXT, field:"infoEvent3", style:TEXT_STYLE_NEWS},
			infoEvent4:{type:UITYPE_TEXT, field:"infoEvent4", style:TEXT_STYLE_TEXT_DIALOG},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_EVENT_NEWS"},
			closeButton:{onTouchEnded:this.hideInfo.bind(this)},
			itemList:{type:UITYPE_LIST, items:itemList, itemUI:UI_EVENT_NEWS_ITEM, itemDef:itemDef, itemSize:EVENT_INFO_SIZE},
		};
		
		var widget = FWPool.getNode(UI_EVENT_NEWS, false);
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_EVENT_NEWS);
			
			if(!this.hideFunc2)
				this.hideFunc2 = function() {this.hideInfo()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc2);
		}
		
		if(itemList.length === 1)
			this.showDetailInfo(FWUtils.getChildByName(widget, "itemList").getChildren()[0]);
		else
			this.showDetailInfo(null);
		
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateInfo, 0, cc.REPEAT_FOREVER, 0, false);
	},
	
	// expand fx
	expandIndex: -1,
	expandTimer: 0,
	infoItemList: null,
	updateInfo:function(dt)
	{
		if(this.expandTimer < EVENT_INFO_EXPAND_DURATION)
		{
			var isFinished = false;
			this.expandTimer += dt;
			if(this.expandTimer > EVENT_INFO_EXPAND_DURATION)
			{
				this.expandTimer = EVENT_INFO_EXPAND_DURATION;
				isFinished = true;
			}
				
			var children = this.infoItemList.getChildren();
			var t = cc.clampf(this.expandTimer / EVENT_INFO_EXPAND_DURATION, 0, 1);
			
			// update size
			for(var i=0; i<children.length; i++)
			{
				var child = children[i];
				if(i === this.expandIndex)
					this.setDetailInfoSize(child, cc.size(cc.lerp(child.currentWidth, EVENT_INFO_SIZE_EXPAND.width, t), EVENT_INFO_SIZE_EXPAND.height));
				else
					this.setDetailInfoSize(child, cc.size(cc.lerp(child.currentWidth, EVENT_INFO_SIZE.width, t), EVENT_INFO_SIZE.height));
			}
			
			// update scroll pos
			// force scrolling to destiation pos if finished
			if(this.expandIndex >= 0)
			{
				var w = EVENT_INFO_SIZE.width * (children.length - 1) + EVENT_INFO_SIZE_EXPAND.width - this.infoItemList.getContentSize().width;
				var x = EVENT_INFO_SIZE.width * this.expandIndex + EVENT_INFO_SIZE_EXPAND.width / 2 - this.infoItemList.getContentSize().width / 2;
				if(x < 0)
					x = 0;
				if(isFinished)
					this.infoItemList.scrollToPercentHorizontal(x * 100 / w, 0.01, false);
				else
					this.infoItemList.getInnerContainer().setPosition(cc.lerp(this.infoItemList.currentPos.x, -x, t), this.infoItemList.currentPos.y);
			}
			else
			{
				if(isFinished)
					this.infoItemList.scrollToPercentHorizontal(0, 0.01, false);
				else
					this.infoItemList.getInnerContainer().setPosition(cc.lerp(this.infoItemList.currentPos.x, 0, t), this.infoItemList.currentPos.y);
			}
			
			this.infoItemList.refreshView();
		}
	},
	
	showDetailInfo:function(sender)
	{
		//web
		if(sender && sender.getName() === "center")
			sender = FWUtils.getParentByName(sender, "panel");
		
		var widget = FWPool.getNode(UI_EVENT_NEWS, false);
		var itemList = this.infoItemList = FWUtils.getChildByName(widget, "itemList");
		var children = itemList.getChildren();
		this.infoItemList.currentPos = this.infoItemList.getInnerContainer().getPosition();
		this.expandIndex = -1;
		this.expandTimer = 0;
		
		for(var i=0; i<children.length; i++)
		{
			var child = children[i];
			if(child === sender && child.getContentSize().width === EVENT_INFO_SIZE.width)
				this.expandIndex = i;
			child.currentWidth = child.getContentSize().width;

			if(child.uiData)
			{
				if(child.uiData.nameItem === "gameEvent3"){
					var info3 = FWUI.getChildByName(child,"infoEvent3");
					info3.setPosition(cc.p(346,72));
					//child.uiBaseDef.infoEvent3.position = cc.p(346,50);
				}
			}
		}
	},
	
	setDetailInfoSize:function(widget, size)
	{
		widget.setContentSize(size);
		
		var center = FWUtils.getChildByName(widget, "center");
		center.setContentSize(cc.size(size.width - 10, size.height - 30));//center.setContentSize(cc.size(size.width - 20, size.height - 30));
		
		var expandCollapseBg = FWUtils.getChildByName(widget, "expandCollapseBg");
		var expand = FWUtils.getChildByName(widget, "expand");
		var collapse = FWUtils.getChildByName(widget, "collapse");
		expandCollapseBg.setPosition(size.width - 27, expandCollapseBg.getPositionY());//expandCollapseBg.setPosition(size.width - 35, expandCollapseBg.getPositionY());
		expand.setVisible(size.width === EVENT_INFO_SIZE.width);
		collapse.setVisible(size.width === EVENT_INFO_SIZE_EXPAND.width);
		
		var frame = FWUtils.getChildByName(widget, "frame");
		frame.setContentSize(cc.size(size.width - 7, size.height - 28));
	},
	
	hideInfo:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateInfo);
		var widget = FWPool.getNode(UI_EVENT_NEWS, false);
		FWUI.hideWidget(widget, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc2);
	},
	
	// update: rewards by level group
	getMilestoneRewardInfo:function(milestone)
	{
		var allRewards = this.currentEvent.REWARDS[milestone];
		var level = gv.userData.getLevel();
		
		for(var key in allRewards)
		{
			if(level <= key)
				return allRewards[key];
		}
		
		return null;
	},
	
	showGiftList:function(uiDef)
	{
		// items
		var rewards = this.currentEvent.REWARDS;
		var itemList = [];
		var eventPoints = gv.userStorages.getItemAmount(this.currentEvent.POINT);
		var limitMilestones = 3;
		var receivedRewards = gv.userData.game[GAME_FESTIVAL][EVENT_01_RECEIVED_REWARDS];
		
		this.pointerPos = 0;
		itemList.push({points:0, rewards:{}, id:0});
		
		var i;
		for(var milestone in rewards)
		{
			// update: rewards by level group
			//itemList.push({points:key, rewards:rewards[key].items});//itemList.push({points:key, rewards:rewards[key]});
			
			var item = {points:milestone, isRewardsReceived:false};
			
			var milestoneRewards = rewards[milestone];
			for(var level in milestoneRewards)
			{
				var milestoneRewardsByLevel = milestoneRewards[level];
				if (receivedRewards)
				{
					for(var i=0; i<receivedRewards.length; i++)
					{
						if(receivedRewards[i] === milestoneRewardsByLevel.id)
						{
							item.isRewardsReceived = true;
							item.rewards = milestoneRewardsByLevel.items;
							item.id = milestoneRewardsByLevel.id;
							break;
						}
					}
				}
				if(item.isRewardsReceived)
					break;
			}
			
			if(!item.isRewardsReceived)
			{
				var info = this.getMilestoneRewardInfo(milestone);
				item.id = info.id;
				item.rewards = info.items;
			}

			itemList.push(item);
		}
			
		for(i=0; i<itemList.length && limitMilestones >= 0; i++)
		{
			var item = itemList[i];
			item.pointerPosX = EVENT_POINTER_OFFX;
			item.barW = 0;
			item.hasRewards = (item.points > 0);
			
			// update: rewards by level group
			//item.isRewardsReceived = false;
			//for(var j=0; j<receivedRewards.length; j++)
			//{
			//	if(Number(receivedRewards[j]) === Number(item.points))
			//	{
			//		item.isRewardsReceived = true;
			//		break;
			//	}
			//}
			
			item.canReceiveRewards = (item.hasRewards && eventPoints >= item.points && !item.isRewardsReceived);
			item.isLastMilestone = (limitMilestones <= 0);
			item.isRandomMilestone = false;
			item.index = i;
			
			if(i === itemList.length - 1)
			{
				item.showPointer = (eventPoints >= item.points);
				item.showBars = false;
				item.isLastMilestone = true;
			}
			else
			{
				if(eventPoints < item.points)
				{
					item.showPointer = false;
					item.showBars = false;
					limitMilestones--;
				}
				else if(eventPoints < itemList[i + 1].points)
				{
					item.showBars = true;
					item.barW = (eventPoints - item.points) *  EVENT_MILESTONE_W / (itemList[i + 1].points - item.points) + 10;
					item.showPointer = true;
					item.pointerPosX += item.barW - 10;
					this.pointerPos += item.pointerPosX;
				}
				else
				{
					item.showBars = true;
					item.barW = EVENT_MILESTONE_W;
					item.showPointer = false;
					this.pointerPos += EVENT_MILESTONE_W;
				}
			}
			
			for(var j=0; j<item.rewards.length; j++)
			{
				item.rewards[j].displayQuantity = "x" + item.rewards[j].quantity;
				if(item.rewards[j].rate !== -1)
				{
					item.isRandomMilestone = true;
					//break;
				}
			}
			if(item.isRandomMilestone)
			{
				item.gfx = (item.canReceiveRewards ? "gift_box_random_active" : "gift_box_random_idle");
				item.bgScale = 1;
			}
			else
			{
				item.gfx = (item.canReceiveRewards ? "gift_box_normal_active" : "gift_box_normal_idle");
				item.bgScale = 0.85;
			}
		}
		if(i < itemList.length)
			itemList = itemList.slice(0, i);
		
		var itemDef = 
		{
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9, visible:"data.canReceiveRewards"},
			// feedback: bigger gift
			giftButton2:{onTouchEnded:this.showRewards.bind(this), visible:"data.hasRewards", type:UITYPE_SPINE, id:SPINE_GIFT_BOX_EVENT, animField:"gfx", scale:0.75, color:"data.isRewardsReceived || (data.isLastMilestone && !data.canReceiveRewards) ? cc.color(128, 128, 128, 255) : cc.color(255, 255, 255, 255)"},
			//giftButton2:{onTouchEnded:this.showRewards.bind(this), visible:"data.hasRewards", type:UITYPE_SPINE, id:SPINE_GIFT_BOX_EVENT, animField:"gfx", scale:1.1, color:"data.isRewardsReceived || (data.isLastMilestone && !data.canReceiveRewards) ? cc.color(128, 128, 128, 255) : cc.color(255, 255, 255, 255)"},
			pointText:{type:UITYPE_TEXT, field:"points", style:TEXT_STYLE_TEXT_NORMAL, visible:"data.points > 0"},
			barBg:{visible:"!data.isLastMilestone"},
			bar:{visible:"data.showBars", width:"data.barW"},
			pointer:{visible:"data.showPointer", posX:"data.pointerPosX"},
			pointBg:{visible:"data.points > 0"},
			icon:{visible:"data.points > 0"},
			bg:{type:UITYPE_IMAGE, id:"hud/hud_event_pos_ice.png", scale:"data.bgScale", visible:"data.index <= 0"},
			lock:{visible:"data.isLastMilestone && !data.canReceiveRewards"},
		};
		
		uiDef.giftList = {type:UITYPE_2D_LIST, items:itemList, itemUI:UI_EVENT_MILESTONE, itemDef:itemDef, itemSize:cc.size(300, 200), singleLine:true};
	},
	
	showPuzzleList:function(uiDef)
	{
		// items
		var puzzles = this.currentEvent.PUZZLE.PUZZLES;
		var itemList = [];
		for(var key in puzzles)
		{
			var puzzle = puzzles[key];
			if(puzzle.IS_VIETNAM_ONLY && COUNTRY !== COUNTRY_VIETNAM) continue;
			var item = {id:key, receiveAmount:Number.MAX_SAFE_INTEGER, name:Game.getItemName(key), rewards:puzzle.rewards, bg:"hud/hud_event_puzzle_slot_" + Number(key.substring(5)) + ".png",display:puzzle.DISPLAY_ORDER};
			
			// jira#5802: sort
			//var i = 1;
			//for(var key2 in puzzle.require)
			var puzzleRequires = FWUtils.getItemsArray(puzzle.require);
			puzzleRequires.sort(function(a, b) {return Number(a.itemId.substring(1)) > Number(b.itemId.substring(1)) ? 1 : -1;});//web puzzleRequires.sort((a, b) => Number(a.itemId.substring(1)) > Number(b.itemId.substring(1)) ? 1 : -1);
			for(var i=1; i<=puzzleRequires.length; i++)
			{
				var  key2 = puzzleRequires[i - 1].itemId;
				
				item["requireItem" + i] = key2;
				item["requireAmount" + i] = puzzle.require[key2];
				item["gfx" + i] = Game.getItemGfxByDefine(key2).sprite;
				
				var currentAmount = gv.userStorages.getItemAmount(key2);
				item["currentAmount" + i] = currentAmount;
				if(item.receiveAmount > currentAmount)
					item.receiveAmount = currentAmount;
				
				//i++;
			}
			itemList.push(item);
		}
		
		// jira#5802: sort
		itemList.sort(function(a, b) {return a.display > b.display ? 1 : -1;});//web
		
		// item def
		var itemDef =
		{
			patternBg:{type:UITYPE_IMAGE, field:"bg"},
			pattern01:{type:UITYPE_IMAGE, field:"gfx1", visible:"data.currentAmount1 > 0"},
			pattern02:{type:UITYPE_IMAGE, field:"gfx2", visible:"data.currentAmount2 > 0"},
			pattern03:{type:UITYPE_IMAGE, field:"gfx3", visible:"data.currentAmount3 > 0"},
			pattern04:{type:UITYPE_IMAGE, field:"gfx4", visible:"data.currentAmount4 > 0"},
			count01:{visible:"data.currentAmount1 > 0"},
			count02:{visible:"data.currentAmount2 > 0"},
			count03:{visible:"data.currentAmount3 > 0"},
			count04:{visible:"data.currentAmount4 > 0"},
			countText01:{type:UITYPE_TEXT, field:"currentAmount1", style:TEXT_STYLE_TEXT_NORMAL},
			countText02:{type:UITYPE_TEXT, field:"currentAmount2", style:TEXT_STYLE_TEXT_NORMAL},
			countText03:{type:UITYPE_TEXT, field:"currentAmount3", style:TEXT_STYLE_TEXT_NORMAL},
			countText04:{type:UITYPE_TEXT, field:"currentAmount4", style:TEXT_STYLE_TEXT_NORMAL},
			name:{type:UITYPE_TEXT, field:"name", style:TEXT_STYLE_TEXT_NORMAL},
			receiveButton:{onTouchEnded:this.receivePuzzleReward.bind(this), visible:"data.receiveAmount > 0"},
			receiveText:{type:UITYPE_TEXT, value:"TXT_EVENT_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
		};
		
		uiDef.puzzleList = {type:UITYPE_2D_LIST, items:itemList, itemUI:UI_EVENT_PUZZLE, itemDef:itemDef, itemSize:cc.size(360, 460), singleLine:true};
	},
	
	checkEndEvent:function()
	{
		this.currentEvent = this.getActiveEvent();
		if(!this.currentEvent)
		{
			// feedback
			//Game.showPopup({title:"TXT_EVENT_END_TITLE", content:"TXT_EVENT_END_CONTENT", okText:"TXT_OK", closeButton:true});
			var markerNPCEvent = FWUI.getChildByName(FWPool.getNode(UI_BACKGROUND, false), "markerNPCEvent");
			var pos = FWUtils.getWorldPosition(markerNPCEvent);
			pos.y += 80;
			FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_END_TITLE"), pos, cc.WHITE);
			
			GameEvent.hide();
			return false;
		}
		return true;
	},
	
	showRewards:function(sender)
	{
		if(this.isReceivingReward)
			return;
		
		var data = sender.uiData;
		
		// jira#5852
		//if(data.isRewardsReceived)
		//	return;
		
		var itemList = data.rewards;//var itemList = FWUtils.getItemsArray(data.rewards);
		
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"id"},//gfx:{type:UITYPE_ITEM, field:"itemId"},
			
			// jira#5809
			//amount:{visible:false},
			amount:{type:UITYPE_TEXT, field:"displayQuantity", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
			item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:data.isRandomMilestone ? "TXT_EVT_POSSIBLE_GIFT" : "TXT_EVT_DEFINITE_GIFT", style:TEXT_STYLE_TEXT_DIALOG},
			receiveButton:{onTouchEnded:(function() {this.hideRewards(); this.receiveRewards(sender);}).bind(this), enabled:data.canReceiveRewards, visible:!data.isRewardsReceived},
			receiveText:{type:UITYPE_TEXT, value:"TXT_EVENT_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
			itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(90, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75, singleLine:true},
			tapToClose:{onTouchEnded:this.hideRewards.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_EVENT_MILESTONE_GIFT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		widget.setPosition(FWUtils.getWorldPosition(sender));
		widget.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
		
		if(itemList.length <= 5)
		{
			// hide annoying scrollbars 
			var itemListWidget = FWUtils.getChildByName(widget, "itemList");
			itemListWidget.setDirection(ccui.ScrollView.DIR_NONE);
		}
		
		// jira#6408
		if(!this.hideFuncRewards)
			this.hideFuncRewards = function() {this.hideRewards()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncRewards);
	},
	
	hideRewards:function(sender)
	{
		FWUI.hide(UI_EVENT_MILESTONE_GIFT, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFuncRewards);
	},
	
	receiveRewards:function(sender)
	{
		if(this.currentMilestone)
			return;
		
		var data = sender.uiData;
		if(data.canReceiveRewards)
		{
			// fake
			// update: rewards by level group
			//gv.userData.game[GAME_FESTIVAL][EVENT_01_RECEIVED_REWARDS].push(data.points);
			gv.userData.game[GAME_FESTIVAL][EVENT_01_RECEIVED_REWARDS].push(data.id);
			
			// server
			this.currentMilestone = data.points;
			if(!this.currentEvent.REWARDS[data.points].actualItems)
			{
				var pk = network.connector.client.getOutPacket(this.RequestEvent01ReceiveRewards);
				pk.pack(data.points);
				network.connector.client.sendPacket(pk);
			}
			
			// receive gifts
			if(this.pickedGift)
				this.pickedGift.setVisible(true);
			
			this.pickedGift = sender;
			
			// move
			//var npcMarker = this.penguin.getParent();
			//var originalLocalPos = this.penguin.getPosition();
			var originalWorldPos = this.penguin.getWorldPosition();//var originalWorldPos = FWUtils.getWorldPosition(this.penguin);
			//this.penguin.removeFromParent();
			//FWUtils.getCurrentScene().addChild(this.penguin);
			//this.penguin.setPosition(originalWorldPos);
			//this.penguin.setLocalZOrder(Z_UI_EVENT + 1);
			var giftWorldPos = FWUtils.getWorldPosition(this.pickedGift);
			
			// jira#5033: disable feedback
			// feedback: penguin must move out of screen
			//giftWorldPos.y = -50;
			
			this.isReceivingReward = true;
			this.penguin.node.runAction(cc.sequence//this.penguin.runAction(cc.sequence
			(
				cc.moveTo(1, giftWorldPos).easing(cc.easeSineInOut()),
				cc.moveTo(1, originalWorldPos).easing(cc.easeSineInOut()),
				cc.callFunc((function()
				{
					//this.penguin.removeFromParent();
					//npcMarker.addChild(this.penguin);
					//this.penguin.setPosition(originalLocalPos);
					this.showMilestoneRewards = true;
				}).bind(this))
			));
			this.penguin.node.runAction(cc.sequence//this.penguin.runAction(cc.sequence
			(
				cc.delayTime(0.5),
				cc.callFunc((function()
				{
					this.penguin.setAnimation("moving_gift", true);//this.penguin.setAnimation(0, "moving_gift", true);
					this.pickedGift.getChildren()[0].setColor(cc.color(128, 128, 128, 255));//this.pickedGift.setVisible(false);
					this.pickedGift.uiData.canReceiveRewards = false;
				}).bind(this))
			));
		}
	},
	
	receivePuzzleReward:function(sender)
	{
		var data = sender.uiData;
		
		// jira#6234
		//Game.showGiftPopup(data.rewards, "TXT_EVENT_NAME", (function() {this.onPuzzleRewardsReceived(sender);}).bind(this), null, true);
		var itemId;
		for(itemId in data.rewards)
			break;
		Game.showGiftPopup(data.rewards, "TXT_" + itemId, (function() {this.onPuzzleRewardsReceived(sender);}).bind(this), null, true);
	},
	
	onPuzzleRewardsReceived:function(sender)
	{
		var data = sender.uiData;
		
		// subtract pieces
		for(var i=1; i<=4; i++)
		{
			var requireItem = data["requireItem" + i];
			var requireAmount = data["requireAmount" + i];
			gv.userStorages.addItem(requireItem, -requireAmount);
		}
		
		// refresh
		this.show();
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestEventMergePuzzle);
		pk.pack(this.currentEvent.ID, data.id);
		network.connector.client.sendPacket(pk);
	},
	
	onPlayButtonTouched:function(sender)
	{
		var item = sender.uiData;
		if(item.nameItem == "pigBank")
		{
			this.hideInfo();
			this.hide();
			gv.pigBankPanel.show();
		}
		else if(item.nameItem == "consume")
		{
			this.hideInfo();
			this.hide();
			if(gv.consumEventMgr.check()) gv.consumEventMgr.show();
		}
        else if(item.nameItem == "gameEvent2")
		{
			this.hideInfo();
			this.hide();
			GameEventTemplate2.show();
		}
		else if(item.nameItem == "gameEvent3")
		{
			this.hideInfo();
			this.hide();
			GameEventTemplate3.show();
			GameEventTemplate3.changeTab(FISHING_TAB_EVENT);
		}
		else if(item.nameItem == "gameEventAccumulate")
		{
			this.hideInfo();
			this.hide();
			AccumulateStore.loadAndShow();
		}
		else if(item.nameItem == "evtFanpage")
		{
			this.hideInfo();
			this.hide();
			cc.sys.openURL(FWLocalization.text("TXT_EVENT_FANPAGE_LINK").replace(/\|/g, "/"));
		}
		else if(item.isRanking)
		{
			this.hideInfo();
			this.hide();
			Ranking.changeTab(RANKING_TAB_CONTEST);
		}		
		else
		{
			this.hideInfo();
			this.showTab(EVENT_TAB_PUZZLE);
		}
	},

	showItemHint:function(sender)
	{
		cc.log("showItemHint",JSON.stringify(sender));
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		gv.hintManagerNew.show(null, null, sender.uiData.id, position);
	},
	hideItemHint:function(sender)
	{
		cc.log("hideItemHint",JSON.stringify(sender));
		gv.hintManagerNew.hideHint( null, sender.uiData.id);
	},

///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestEventMergePuzzle:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.EVENT_MERGE_PUZZLE);},
		pack:function(eventId, itemId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_EVENT_ID, eventId);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			
			addPacketFooter(this);
		},
	}),

	ResponseMergePuzzle:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("GameEvent.ResponseMergePuzzle: error=" + this.getError());
		}
	}),
	
	RequestEvent01ReceiveRewards:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.EVENT_01_RECEIVE_REWARDS);},
		pack:function(checkpoint)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_EVENT_REWARD_ID, checkpoint);
			
			addPacketFooter(this);
		},
	}),

	ResponseEvent01ReceiveRewards:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("GameEvent.ResponseEvent01ReceiveRewards: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				GameEvent.currentEvent.REWARDS[GameEvent.currentMilestone].actualItems = object[KEY_REWARD_ITEMS];
			}
		}
	}),	
};

network.packetMap[gv.CMD.EVENT_MERGE_PUZZLE] = GameEvent.ResponseMergePuzzle;
network.packetMap[gv.CMD.EVENT_01_RECEIVE_REWARDS] = GameEvent.ResponseEvent01ReceiveRewards;
