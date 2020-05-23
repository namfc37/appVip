
const ENABLE_QUEST_BOOK = g_MISCINFO.QUEST_BOOK_ACTIVE;

var QuestBook =
{
	displayData: null,
	currentQuestData: null,//currentQuestWidget: null,
	currentHintWidget: null,
	checkStockQuests: [], // quests that requires stock checking
	questsToSave: [],
	
	init:function()
	{
		if(!ENABLE_QUEST_BOOK)
			return;
		
		/*// fake data
		this.displayData = [];
		for(var i=0; i<10; i++)
		{
			var quest = {};
			quest.ID = i;
			quest.title = "Quest title " + i;
			quest.desc = "Quest description " + i;
			quest.hint = "Quest hint " + i;
			quest.action = ACTION_ORDER_DELIVERY;
			quest.item = null;
			quest.completed = 50;
			quest.require = i * 10;
			quest.price = 100 + (i * 10);
			quest.rewards = FWUtils.getItemsArray({"T1":1, "B2":2, "P3":3, "M4":4, "T2":5, "B3":6});
			quest.startTime = Game.getGameTimeInSeconds() - 86400 / 2;
			quest.endTime = Game.getGameTimeInSeconds() + 86400 / 2;
			
			quest.icon = (quest.item ? quest.item : ("ACTION_" + quest.action));
			quest.isCompleted = (quest.completed >= quest.require);
			quest.isRewardsReceived = ((i % 2) === 0);
			quest.progress = quest.completed + "/" + quest.require;
			
			this.displayData.push(quest);
		}

		// init quests
		var quests = this.displayData;
		for(var i=0; i<quests.length; i++)
		{
			var quest = quests[i];
			this.updateQuestDisplayData(quest);
			
			if(!quest.isCompleted && (quest.ACTION === ACTION_CHECK_COMBO_POT || quest.ACTION === ACTION_CHECK_DECOR))
				this.checkStockQuests.push(quest);
		}*/
		
		this.updateQuestsDisplayData();
		this.updateStockQuests();
	},
	
	updateQuestsDisplayData:function()
	{
		this.displayData = gv.userData.game[GAME_QUEST_BOOK][KEY_QUEST_BOOK];
		
		// fix: remove empty quests
		for(var i=0; i<this.displayData.length; i++)
		{
			if(this.displayData[i][QUEST_ID] === undefined)
			{
				this.displayData.splice(i, 1);
				i--;
			}
		}
		
		this.checkStockQuests = [];
		
		var len = this.displayData.length;
		this.hasCompletedQuest = false;
		for(var i=0; i<len; i++)
		{
			var quest = this.displayData[i];
			this.updateQuestDisplayData(quest);
			
			if(!quest.isCompleted && (quest.ACTION === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE || quest.ACTION === g_ACTIONS.ACTION_CHECK_DECOR.VALUE))
				this.checkStockQuests.push(quest);
			
			if(quest.isCompleted)
				this.hasCompletedQuest = true;
		}
		
		// jira#6038
		this.displayData = _.sortBy(this.displayData, function(val) {return (val.completed ? 0 : val.ID);});
		gv.userData.game[GAME_QUEST_BOOK][KEY_QUEST_BOOK] = this.displayData;
		
		cc.log("QuestBook::data=" + JSON.stringify(this.displayData));
	},
	
	updateQuestDisplayData:function(quest)
	{
		var action = Game.getActionById(quest[QUEST_ACTION]);
		quest.title = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_TITLE_" + quest[QUEST_ACTION]);
		//quest.desc = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_" + quest[QUEST_ACTION]).replace("%count", quest[QUEST_REQUIRE]).replace("%item", FWLocalization.text("TXT_" + quest[QUEST_TARGET]));
		quest.desc = FWLocalization.text(action.DESC).replace("%count", quest[QUEST_REQUIRE]).replace("%item", FWLocalization.text("TXT_" + quest[QUEST_TARGET]));;
		//quest.hint = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_HINT_" + quest[QUEST_ACTION]);
		quest.hint = FWLocalization.text(action.HINT);

		quest.ID = quest[QUEST_ID];
		quest.action = quest[QUEST_ACTION];
		quest.item = quest[QUEST_TARGET];
		quest.completed = quest[QUEST_CURRENT];
		quest.require = quest[QUEST_REQUIRE];
		quest.price = quest[QUEST_SKIP_PRICE_NUM];
		quest.rewards = FWUtils.getItemsArray(quest[QUEST_REWARD]);
		quest.spRewards = FWUtils.getItemsArray(quest[QUEST_SPECIAL_REWARD]);
		quest.startTime = quest[QUEST_START_TIME] - g_MISCINFO.QUEST_BOOK_WAIT_TO_REFRESH;
		quest.endTime = quest[QUEST_START_TIME];
		
		quest.icon = (quest.item ? quest.item : ("ACTION_" + quest.action));
		quest.basket = (quest.action === g_ACTIONS.ACTION_PLANT_HARVEST.VALUE || quest.action === g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE);
		quest.isCompleted = (quest.completed >= quest.require);
		quest.isRewardsReceived = (!quest[QUEST_START_TIME] || quest[QUEST_START_TIME] > Game.getGameTimeInSeconds());
		quest.progress = quest.completed + "/" + quest.require;
		quest.skipPriceIcon = (quest[QUEST_SKIP_PRICE_TYPE] === ID_GOLD ? "hud/icon_gold.png" : (quest[QUEST_SKIP_PRICE_TYPE] === ID_COIN ? "hud/icon_gem.png" : "hud/icon_heart.png"));
	},
	
	uninit:function()
	{
		if(!ENABLE_QUEST_BOOK)
			return;
	},
	
	show:function()
	{
		if(!this.currentQuestData && this.displayData && this.displayData.length > 0)
			this.currentQuestData = this.displayData[0];
			
		this.itemDef =
		{
			// jira#6391
			//task:{onTouchEnded:this.showQuestInfo.bind(this)},
			//hintTouch:{onTouchBegan:this.showQuestHint.bind(this), onTouchEnded:this.hideQuestHint.bind(this), forceTouchEnd:true},
			task:{onTouchBegan:(function(sender) {this.showQuestInfo(sender);this.showQuestHint(sender);}).bind(this), onTouchEnded:this.hideQuestHint.bind(this), forceTouchEnd:true},//web
			
			icon:{type:UITYPE_ITEM, field:"icon", scale:1.05},
			title:{type:UITYPE_TEXT, field:"title", style:TEXT_STYLE_QUESTBOOK_ITEM_TITLE, visible:"!data.isRewardsReceived"},
			content:{type:UITYPE_TEXT, field:"desc", style:TEXT_STYLE_QUESTBOOK_ITEM_CONTENT, visible:"!data.isRewardsReceived"},
			progress:{type:UITYPE_TEXT, field:"progress", style:TEXT_STYLE_TEXT_NORMAL, color:"data.isCompleted ? cc.GREEN : cc.WHITE", visible:"!data.isRewardsReceived && !data.isCompleted"},
			skipButton:{onTouchEnded:this.skipQuest.bind(this), visible:"data.price > 0 && !data.isRewardsReceived && !data.isCompleted", useK:true},
			gem:{type:UITYPE_IMAGE, field:"skipPriceIcon", scale:0.55},
			price:{type:UITYPE_TEXT, field:"price", style:TEXT_STYLE_TEXT_BUTTON},
			check:{visible:false},//check:{visible:"!data.isRewardsReceived && data.isCompleted"},
			nextQuest:{type:UITYPE_TEXT, value:"TXT_QUESTBOOK_NEXT", style:TEXT_STYLE_TEXT_NORMAL, visible:"data.isRewardsReceived", color:cc.GREEN},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:"startTime", endTime:"endTime", countdown:true, onFinished:this.resetQuest.bind(this), visible:"data.isRewardsReceived"},
			hili:{visible:"QuestBook.currentQuestData !== null && QuestBook.currentQuestData.ID === data.ID"},//hili:{visible:"QuestBook.currentQuestWidget !== null && QuestBook.currentQuestWidget.uiData.ID === data.ID"},
			receiveButton:{onTouchEnded:this.receiveRewards.bind(this), visible:"!data.isRewardsReceived && data.isCompleted"},
			receiveText:{type:UITYPE_TEXT, value:"TXT_QUESTBOOK_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
			basket:{visible:"data.basket === true"},
			spgift:{visible:"data.spRewards && data.spRewards.length > 0"},

		};
		
		var isDialogVisible = true;//(this.currentQuestWidget === null || this.currentQuestWidget.uiData.isRewardsReceived === true);
		var isRewardVisible = (this.currentQuestData && !this.currentQuestData.isRewardsReceived);//(this.currentQuestWidget && !this.currentQuestWidget.uiData.isRewardsReceived);
		var isSpReward = (isRewardVisible && this.currentQuestData.spRewards.length > 0);
		var uiDef =
		{
			closeButton:{onTouchEnded:this.hide.bind(this)},
			bookTitle:{type:UITYPE_TEXT, value:"TXT_QUESTBOOK_TITLE", style:TEXT_STYLE_TEXT_DIALOG_TITLE},
			dialogText:{type:UITYPE_TEXT, value:"TXT_QUESTBOOK_INTRO", style:TEXT_STYLE_TEXT_DIALOG, visible:isDialogVisible && !isSpReward},//dialogText:{type:UITYPE_TEXT, value:this.currentQuestWidget ? "TXT_QUESTBOOK_CONGRATS" : "TXT_QUESTBOOK_INTRO", style:TEXT_STYLE_TEXT_DIALOG, visible:isDialogVisible},
			dialog:{visible:isDialogVisible},
			npc:{type:UITYPE_SPINE, value:SPINE_NPC_QUEST, anim:"animation", scale:0.25},
			questList:{type:UITYPE_2D_LIST, items:this.displayData, itemUI:UI_QUEST_BOOK_ITEM, itemDef:this.itemDef, itemSize:cc.size(480, 150)},
			//currentQuestInfo:{visible:this.currentQuestWidget !== null, onTouchEnded:this.hideQuestInfo.bind(this)},
			reward:{visible:isRewardVisible},//reward:{visible:!isDialogVisible},
			rewardBg:{visible:isRewardVisible},
			hint:{visible:false},
			spRewardList:{visible:isSpReward},
			spRewardRibbon:{visible:isSpReward},
			bg2:{type:UITYPE_IMAGE, value:"common/images/hud_questbook_bg000.png", isLocalTexture:true, discard:true},
		};
		if(isRewardVisible)
		{
			var rewardItemDef =
			{
				gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.65},
				amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
			};

			uiDef.rewardTitle = {type:UITYPE_TEXT, value:"TXT_QUESTBOOK_REWARD", style:TEXT_STYLE_TEXT_DIALOG};
			uiDef.rightArrow = {visible:this.currentQuestData.rewards.length > 5};//uiDef.rightArrow = {visible:this.currentQuestWidget.uiData.rewards.length > 5};
			uiDef.leftArrow = {visible:this.currentQuestData.rewards.length > 5};//{visible:this.currentQuestWidget.uiData.rewards.length > 5};
			uiDef.rewardList = {type:UITYPE_2D_LIST, items:this.currentQuestData.rewards, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(125, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75};//uiDef.rewardList = {type:UITYPE_2D_LIST, items:this.currentQuestWidget.uiData.rewards, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
			//uiDef.receiveButton = {onTouchEnded:this.receiveRewards.bind(this), visible:this.currentQuestData.isCompleted},//{onTouchEnded:this.receiveRewards.bind(this), visible:this.currentQuestWidget.uiData.isCompleted},
			//uiDef.receiveText = {type:UITYPE_TEXT, value:"TXT_LEVEL_UP_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON, visible:this.currentQuestData.isCompleted};//{type:UITYPE_TEXT, value:"TXT_LEVEL_UP_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON, visible:this.currentQuestWidget.uiData.isCompleted};
			
			if(isSpReward)
				uiDef.spRewardList = {visible:true, type:UITYPE_2D_LIST, items:this.currentQuestData.spRewards, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(125, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75};
		}
		
		// show
		var widget = FWPool.getNode(UI_QUEST_BOOK, false);
		if(FWUI.isWidgetShowing(widget))
		{
			if(cc.sys.isNative)
				FWUI.fillData(widget, null, uiDef);
			else
			{
				// jira#7295: keep pos
				var questList = FWUtils.getChildByName(widget, "questList");
				var pos = questList.getInnerContainer().getPosition();
				FWUI.fillData(widget, null, uiDef);
				questList.getInnerContainer().setPosition(pos);
			}
		}
		else
		{
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgQuestBook");
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			this.scrollView = FWUtils.getChildByName(widget, "questList");
			if(this.savedScrollPos && !this.hasCompletedQuest)
				this.scrollView.getInnerContainer().setPosition(this.savedScrollPos);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);
		}
		
		this.prevSkipButton = null;
	},
	
	hide:function()
	{
		this.savedScrollPos = this.scrollView.getInnerContainer().getPosition();
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		FWUtils.hideDarkBg(null, "darkBgQuestBook");
		FWUI.hide(UI_QUEST_BOOK, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		this.currentQuestData = null;//this.currentQuestWidget = null;
		this.refreshHomeIcon();
	},
	
	check:function()
	{
		return (gv.userData.getLevel() >= g_MISCINFO.QUEST_BOOK_USER_LEVEL && Tutorial.isMainTutorialFinished());
	},
	
	refresh:function()
	{
		FWUtils.disableAllTouches();
		var pk = network.connector.client.getOutPacket(this.RequestQuestBookGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	refreshHomeIcon:function()
	{
		var quests = this.displayData;
		var hasCompletedQuest = false;
		for(var i=0; i<quests.length; i++)
		{
			if(quests[i].isCompleted && !quests[i].isRewardsReceived)
			{
				hasCompletedQuest = true;
				break;
			}
		}
		
		if (Game.gameScene)
		{
			var button = Game.gameScene.setDynamicButtonFxEnabled("questBook", hasCompletedQuest);
			if(button)
			{
				button = button.getChildByName("sprite");
				if(hasCompletedQuest)
				{
					button.loadTextureNormal("hud/icon_questbook_1.png", ccui.Widget.PLIST_TEXTURE);
					button.loadTexturePressed("hud/icon_questbook_1.png", ccui.Widget.PLIST_TEXTURE);
				}
				else
				{
					button.loadTextureNormal("hud/icon_questbook.png", ccui.Widget.PLIST_TEXTURE);	
					button.loadTexturePressed("hud/icon_questbook.png", ccui.Widget.PLIST_TEXTURE);	
				}
			}
		}
	},
	
	showQuestInfo:function(sender)
	{
		this.currentQuestData = sender.uiData;
		this.show();
		
		// old ui
		/*(if(this.currentQuestWidget)
			return;
		
		var widget = FWPool.getNode(UI_QUEST_BOOK, false);
		var mask = FWUtils.getChildByName(widget, "mask");
		if(mask.getChildren().length > 0)
			this.currentQuestWidget = mask.getChildren()[0];
		else
		{
			this.currentQuestWidget = FWPool.getNode(UI_QUEST_BOOK_ITEM);
			mask.addChild(this.currentQuestWidget);
		}
		FWUI.fillData(this.currentQuestWidget, sender.uiData, this.itemDef);
		this.currentQuestWidget.originalWidget = sender;
		this.show();
		
		if(!this.questListContainer)
			this.questListContainer = FWUtils.getChildByName(widget, "questList").getInnerContainer();
		
		this.update(); // to update position of this.currentQuestWidget*/
	},
	
	// old ui
	/*hideQuestInfo:function(sender)
	{
		this.currentQuestData = null;//this.currentQuestWidget = null;
		this.show();
	},*/
	
	update:function(dt)
	{
		// old ui
		/*if(this.currentQuestWidget)
		{
			var pos = this.currentQuestWidget.originalWidget.getPosition();
			var pos2 = this.questListContainer.getPosition();
			pos.x += pos2.x - 230;
			pos.y += pos2.y - 75;
			this.currentQuestWidget.setPosition(pos);
		}*/
		
		if(this.currentHintWidget)
		{
			var pos = FWUtils.getWorldPosition(this.currentHintWidget.sender);
			
			// jira#6391
			//pos.x += 48;
			//pos.y += 96;
			pos.x -= 175;
			pos.y += 20;
			
			this.currentHintWidget.setPosition(pos);
		}
	},
	
	prevSkipButton:null,// jira#6308
	skipQuest:function(sender)
	{
		// jira#6308
		var data = sender.uiData;
		if(data[QUEST_SKIP_PRICE_TYPE] === ID_COIN && gv.userData.getCoin() < data.price)
		{
			Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function() {Game.openShop(ID_COIN);}, true, "TXT_BUY_DIAMOND");	
			return;
		}
		
		if(data[QUEST_SKIP_PRICE_TYPE] === ID_COIN)
		{
			if(this.prevSkipButton !== sender)
			{
				this.prevSkipButton = sender;
				FWUtils.showWarningText(FWLocalization.text("TXT_TAP_CONFIRM"), FWUtils.getWorldPosition(sender), cc.WHITE);
				return;
			}
		}
		
		this.prevSkipButton = null;
		this.currentQuestData = data;
		
		var fxPos = FWUtils.getWorldPosition(sender);
		if((data[QUEST_SKIP_PRICE_TYPE] === ID_COIN && !Game.consumeDiamond(data.price, fxPos))
			|| (data[QUEST_SKIP_PRICE_TYPE] === ID_GOLD && !Game.consumeGold(data.price, fxPos))
			|| (data[QUEST_SKIP_PRICE_TYPE] === ID_REPU && !Game.consumeReputation(data.price, fxPos)))
			return;
		
		// fake
		data.isCompleted = true;
		this.show();
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestQuestBookSkip);
		pk.pack(data[QUEST_ID], data[QUEST_SKIP_PRICE_TYPE], data[QUEST_SKIP_PRICE_NUM]);
		network.connector.client.sendPacket(pk);
	},
	
	resetQuest:function(sender)
	{
		var quest = sender.uiData;
		this.updateQuestDisplayData(quest);
		this.show();
		
		// no need to hit server
		// server
		//this.refresh();
	},
	
	receiveRewards:function(sender)
	{
		this.currentQuestData = sender.uiData;
		if(this.currentQuestData.isRewardsReceived)
			return;
		
		this.show(); // to display correct reward info
		Game.showGiftPopup(sender.uiData.rewards.concat(sender.uiData.spRewards), "", this.receiveRewardsCallback.bind(this));
	},
	
	receiveRewardsCallback:function()
	{
		// fake
		this.currentQuestData.isRewardsReceived = true;
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestQuestBookClaimReward);
		pk.pack(this.currentQuestData[QUEST_ID]);//pk.pack(this.currentQuestWidget.uiData[QUEST_ID]);
		network.connector.client.sendPacket(pk);
		
		//this.hideQuestInfo();
	},
	
	showQuestHint:function(sender)
	{
		if(!this.currentHintWidget)
		{
			var widget = FWPool.getNode(UI_QUEST_BOOK, false);
			this.currentHintWidget = widget.getChildByName("hint");
		}
		
		var hintText = this.currentHintWidget.getChildByName("hintText");
		hintText.setString(sender.uiData.hint);
		
		// jira#6430
		FWUI.applyTextStyle(hintText, TEXT_STYLE_TEXT_DIALOG);
		
		this.currentHintWidget.sender = sender;
		this.currentHintWidget.setVisible(true);
		
		this.update(); // to update position of this.currentHintWidget
	},
	
	hideQuestHint:function(sender)
	{
		if (this.currentHintWidget)
			this.currentHintWidget.setVisible(false);
	},
	
	onAction:function(action, item, count)
	{
		cc.log("QuestBook::onAction: action=" + action + " item=" + item + " count=" + count);
		
		var quests = this.displayData;
		var len = quests.length;
		for(var i=0; i<len; i++)
		{
			var quest = quests[i];
			
			if(quest.isRewardsReceived)
				continue; // quest not started
			
			if(quest.action === action && (!quest.item || quest.item === item))
				this.updateQuestStatus(quest, quest.completed + count);
		}
	},
	
	updateQuestStatus:function(quest, completed)
	{
		cc.log("QuestBook::updateQuestStatus: quest.ID=" + quest.ID + " completed=" + completed);
		
		quest[QUEST_CURRENT] = completed;
		this.updateQuestDisplayData(quest);
		
		if(this.questsToSave.indexOf(quest) < 0)
			this.questsToSave.push(quest);
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveQuests);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveQuests, 0, 0, 1.5, false);
	},
	
	saveQuests:function()
	{
		// save
		for(var i=0; i<this.questsToSave.length; i++)
		{
			var pk = network.connector.client.getOutPacket(this.RequestQuestBookSave);
			pk.pack(this.questsToSave[i][QUEST_ID], this.questsToSave[i][QUEST_CURRENT]);
			network.connector.client.sendPacket(pk);
		}
		
		// finished saving
		this.questsToSave = [];
		this.refreshHomeIcon();
	},

	updateStockQuests:function()
	{
		for(var i=0; i<this.checkStockQuests.length; i++)
		{
			var quest = this.checkStockQuests[i];
			if(quest.ACTION === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE)
			{
				var count = Game.getComboPotsCount(quest.TARGET_ID);
				if(count > quest.completed)
					this.updateQuestStatus(quest, count);
			}
			else if(quest.ACTION === g_ACTIONS.ACTION_CHECK_DECOR.VALUE)
			{
				var totalDecorsCount = Game.getAllDecorsCount();
				if(totalDecorsCount > quest.completed)
					this.updateQuestStatus(quest, totalDecorsCount);
			}
		}
	},

	getQuestById:function(id)
	{
		var len = this.displayData.length;
		for(var i=0; i<len; i++)
		{
			if(this.displayData[i].ID === id)
				return this.displayData[i];
		}
		return null;
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestQuestBookSave:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_BOOK_SAVE_PROGRESS);},
		pack:function(uid, point)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, uid);
			PacketHelper.putInt(this, KEY_SLOT_OBJECT, point);
			
			addPacketFooter(this);
		},
	}),

	ResponseQuestBookSave:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
			{
				cc.log("QuestBook::ResponseQuestBookSave: error=" + this.getError());

				// revert
				var object = PacketHelper.parseObject(this);
				var quest = QuestBook.getQuestById(object[KEY_SLOT_ID]);
				if(quest)
				{
					quest[QUEST_CURRENT] = object[KEY_SLOT_OBJECT];
					QuestBook.updateQuestDisplayData(quest);
				}
					
				if(FWUI.isShowing(UI_QUEST_BOOK))
					QuestBook.show();
				else
					QuestBook.refreshHomeIcon();
			}
		}
	}),
	
	RequestQuestBookSkip:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_BOOK_SKIP);},
		pack:function(uid, priceType, priceNum)
		{
			cc.log("QuestBook::RequestQuestBookSkip: uid=" + uid + " priceType=" + priceType + " priceNum=" + priceNum);
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, uid);
			PacketHelper.putString(this, KEY_TYPE, priceType);
			PacketHelper.putInt(this, KEY_NUM, priceNum);
			PacketHelper.putClientCoin(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseQuestBookSkip:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			
			if(this.getError() !== 0)
				cc.log("QuestBook::ResponseQuestBookSkip: error=" + this.getError());

			var quest = QuestBook.getQuestById(object[KEY_SLOT_ID]);
			if(quest)
			{
				quest[QUEST_CURRENT] = object[KEY_SLOT_OBJECT];
				QuestBook.updateQuestDisplayData(quest);
			}
				
			if(FWUI.isShowing(UI_QUEST_BOOK))
				QuestBook.show();
			else
				QuestBook.refreshHomeIcon();
		}
	}),
	
	RequestQuestBookClaimReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_BOOK_CLAIM_REWARD);},
		pack:function(uid)
		{
			cc.log("QuestBook::RequestQuestBookClaimReward: uid=" + uid);
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, uid);
			
			addPacketFooter(this);
		},
	}),

	ResponseQuestBookClaimReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			gv.userData.game[GAME_QUEST_BOOK] = object[KEY_QUEST_BOOK];
			QuestBook.updateQuestsDisplayData();
			Game.updateUserDataFromServer(object);
			
			if(this.getError() !== 0)
				cc.log("QuestBook::ResponseQuestBookClaimReward: error=" + this.getError());

			if(FWUI.isShowing(UI_QUEST_BOOK))
				QuestBook.show();
			else
				QuestBook.refreshHomeIcon();
		}
	}),	
	
	RequestQuestBookGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_BOOK_GET);},
		pack:function(uid)
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseQuestBookGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			gv.userData.game[GAME_QUEST_BOOK] = object[KEY_QUEST_BOOK];
			QuestBook.updateQuestsDisplayData();
			
			if(this.getError() !== 0)
				cc.log("QuestBook::ResponseQuestBookGet: error=" + this.getError());
			
			if(FWUI.isShowing(UI_QUEST_BOOK))
				QuestBook.show();
			else
				QuestBook.refreshHomeIcon();
		}
	}),		
};

network.packetMap[gv.CMD.QUEST_BOOK_SAVE_PROGRESS] = QuestBook.ResponseQuestBookSave;
network.packetMap[gv.CMD.QUEST_BOOK_SKIP] = QuestBook.ResponseQuestBookSkip;
network.packetMap[gv.CMD.QUEST_BOOK_CLAIM_REWARD] = QuestBook.ResponseQuestBookClaimReward;
network.packetMap[gv.CMD.QUEST_BOOK_GET] = QuestBook.ResponseQuestBookGet;
