
const ENABLE_ACHIEVEMENT = g_MISCINFO.ACHIEVEMENT_ACTIVE;

const ACHIEVEMENT_TAB_TROPHY = 0;
const ACHIEVEMENT_TAB_HARVEST = 1;
const ACHIEVEMENT_TAB_TRADE = 2;
const ACHIEVEMENT_TAB_COLLECTION = 3;
const ACHIEVEMENT_TAB_SOCIAL = 4;
const ACHIEVEMENT_TAB_SPECIAL = 5;

const ACHIEVEMENT_ITEMFG_HEIGHT = 80;//70;
const ACHIEVEMENT_TROPHY_PROGRESS_HEIGHT = 390;

defineTypes.TYPE_ACHIEVEMENT = -1;

var Achievement =
{
	currentTab: ACHIEVEMENT_TAB_TROPHY,
	displayData: null,
	data: null,
	checkStockTasks: null, // tasks that requires stock checking
	tasksToSave: [],
	
	init:function()
	{
		// convert milestones to array
		if(!g_ACHIEVEMENT.trophyMilestones)
		{
			g_ACHIEVEMENT.trophyMilestones = [];
			for(var key in g_ACHIEVEMENT.trophyRewards)
			{
				var rewards = FWUtils.getItemsArray(g_ACHIEVEMENT.trophyRewards[key]);
				for(var i=0; i<rewards.length; i++)
					rewards[i].displayAmount = "x" + rewards[i].amount;
				g_ACHIEVEMENT.trophyMilestones.push({point:Number(key), rewards:rewards});
			}
		}
		
		var tasks = g_ACHIEVEMENT.tasks;
		this.data = {};
		this.displayData = [[], [], [], [], [], []]; // 6 tabs
		this.checkStockTasks = [];
		
		// load saved data
		cc.log("Achievement::init: GAME_ACHIEVEMENT=" + JSON.stringify(gv.userData.game[GAME_ACHIEVEMENT]));
		var savedData = gv.userData.game[GAME_ACHIEVEMENT];
		this.data.trophyPoint = savedData[ACHIEVEMENT_TROPHY];
		if(savedData[ACHIEVEMENT_REWARD] === 0)
			this.data.trophyMilestone = 0;
		else
		{
			var point = savedData[ACHIEVEMENT_REWARD];
			for(var i=0; i<g_ACHIEVEMENT.trophyMilestones.length; i++)
			{
				if(g_ACHIEVEMENT.trophyMilestones[i].point === point)
				{
					this.data.trophyMilestone = i + 1;
					break;
				}
			}
		}
		for(var i=0; i<tasks.length; i++)
			this.data[tasks[i].ID] = {completed:0, starsCount: 0};
		var savedTasks = savedData[ACHIEVEMENT_TASKS];
		for(var i=0; i<savedTasks.length; i++)
		{
			var savedTask = savedTasks[i];
			var task = this.data[savedTask[ACHIEVEMENT_TASK_ID]];
			task.completed = savedTask[ACHIEVEMENT_TASK_POINT];
			task.starsCount = savedTask[ACHIEVEMENT_TASK_LEVEL];
		}
		
		// tasks
		for(var i=0; i<tasks.length; i++)
		{
			var task = tasks[i];
			
			// jira#5977
			//if(this.data[task.ID].starsCount > 3)
			//	continue; // finished => hide
			
			this.updateTaskDisplayData(task);
			this.displayData[task.GROUP].push(task);
			
			if(task.ACTION === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE || task.ACTION === g_ACTIONS.ACTION_CHECK_DECOR.VALUE)
				this.checkStockTasks.push(task);
		}
		this.updateStockTasks();
		
		// trophy
		this.updateTrophyDisplayData();
		this.trophyShowRewards = false;
	},
	
	uninit:function()
	{
		
	},
	
	show:function(tab, refresh)
	{
		if(tab !== undefined)
			this.currentTab = tab;
		this.sortTasks(this.currentTab);
		
		// main ui
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_ACHIEVEMENT_TITLE", style:TEXT_STYLE_TITLE_1},
			closeButton:{onTouchEnded:this.hide.bind(this)},
			
			//web
			//tabTrophyOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_TROPHY, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_TROPHY)},
			//tabHarvestOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_HARVEST, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_HARVEST)},
			//tabTradeOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_TRADE, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_TRADE)},
			//tabCollectionOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_COLLECTION, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_COLLECTION)},
			//tabSocialOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_SOCIAL, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_SOCIAL)},
			//tabSpecialOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_SPECIAL, onTouchEnded:(sender) => this.changeTab(ACHIEVEMENT_TAB_SPECIAL)},
			tabTrophyOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_TROPHY, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_TROPHY);}},
			tabHarvestOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_HARVEST, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_HARVEST);}},
			tabTradeOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_TRADE, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_TRADE);}},
			tabCollectionOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_COLLECTION, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_COLLECTION);}},
			tabSocialOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_SOCIAL, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_SOCIAL);}},
			tabSpecialOff:{visible:this.currentTab !== ACHIEVEMENT_TAB_SPECIAL, onTouchEnded:function(sender) {Achievement.changeTab(ACHIEVEMENT_TAB_SPECIAL);}},
			
			tabTrophyOn:{visible:this.currentTab === ACHIEVEMENT_TAB_TROPHY},
			tabHarvestOn:{visible:this.currentTab === ACHIEVEMENT_TAB_HARVEST},
			tabTradeOn:{visible:this.currentTab === ACHIEVEMENT_TAB_TRADE},
			tabCollectionOn:{visible:this.currentTab === ACHIEVEMENT_TAB_COLLECTION},
			tabSocialOn:{visible:this.currentTab === ACHIEVEMENT_TAB_SOCIAL},
			tabSpecialOn:{visible:this.currentTab === ACHIEVEMENT_TAB_SPECIAL},
			trophyInfo:{visible:false},
		};
		
		// trophy
		// TODO: do not show if all rewards are received
		if(this.currentTab === ACHIEVEMENT_TAB_TROPHY && this.data.trophyMilestone < g_ACHIEVEMENT.trophyMilestones.length)
		{
			uiDef.trophyInfo = {visible:true};
			//web
			//uiDef.darkBg = {visible:this.trophyShowRewards, onTouchEnded:(sender) => {this.showTrophyRewards(false);}};
			uiDef.darkBg = {visible:this.trophyShowRewards, onTouchEnded:function(sender) {this.showTrophyRewards(false);}.bind(this)};
			uiDef.trophyProgress = {type:UITYPE_MASK, value:ACHIEVEMENT_TROPHY_PROGRESS_HEIGHT * this.data.trophyPoint / this.trophyRequirePoint};
			uiDef.fx = {type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9, visible:this.data.trophyPoint >= this.trophyRequirePoint};
			//web
			//uiDef.trophyIcon = {color:this.trophyIsCompleted ? cc.WHITE : cc.color(128, 128, 128, 255), onTouchEnded:(sender) => {this.showTrophyRewards(true);}};
			uiDef.trophyIcon = {color:this.trophyIsCompleted ? cc.WHITE : cc.color(128, 128, 128, 255), onTouchEnded:function(sender) {this.showTrophyRewards(true);}.bind(this)};
			uiDef.trophyProgressText = {type:UITYPE_TEXT, value:this.data.trophyPoint + "/" + this.trophyRequirePoint, style:TEXT_STYLE_TEXT_NORMAL};
			uiDef.trophyRewards = {visible:this.trophyShowRewards};
			if(this.trophyShowRewards)
			{
				var trophyRewardItemDef =
				{
					gfx:{type:UITYPE_ITEM, field:"itemId"},
					amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
				};
				uiDef.trophyRewardText = {type:UITYPE_TEXT, value:this.trophyRequirePoint, format:"TXT_ACHIEVEMENT_TROPHY_REWARD", style:TEXT_STYLE_TEXT_DIALOG};	
				uiDef.trophyRewardList = {type:UITYPE_2D_LIST, items:this.trophyRewards, itemUI:UI_ITEM_NO_BG2, itemDef:trophyRewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
				uiDef.leftArrow = {visible:this.trophyRewards.length > 5};
				uiDef.rightArrow = {visible:this.trophyRewards.length > 5};
			}
			uiDef.receiveButton = {visible:this.trophyIsCompleted, onTouchEnded:this.receiveTrophyReward.bind(this)};
			uiDef.receiveText = {visible:this.trophyIsCompleted, type:UITYPE_TEXT, value:"TXT_LEVEL_UP_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON};
		}

		// items
		this.showTabItems(uiDef);

		// show
		var widget = FWPool.getNode(UI_ACHIEVEMENT, false);
		if(FWUI.isWidgetShowing(widget))
		{
			if(refresh)
			{
				var scrollPos = this.itemList.getInnerContainer().getPosition();
				FWUI.fillData(widget, null, uiDef);
				this.itemList.getInnerContainer().setPosition(scrollPos);
			}
			else
				FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgAchievement");
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		
		// uncomment to enable vertical scrolling while touching on itemList
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var items = itemList.getChildren();
		for(var i=0; i<items.length; i++)
		{
			var itemList2 = items[i].getChildByName("itemList");
			itemList2.setEnabled(itemList2.getChildren().length > 4);
		}
		this.itemList = itemList;
		
		// jira#5472
		if(!refresh)
			itemList.scrollToPercentVertical(0, 0.01, false);
	},
	
	hide:function()
	{
		FWUtils.hideDarkBg(null, "darkBgAchievement");
		FWUI.hide(UI_ACHIEVEMENT, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		this.trophyShowRewards = false;
		this.refreshHomeBuilding();
	},
	
	changeTab:function(tab)
	{
		this.show(tab, false);
	},
	
	showTabItems:function(uiDef)
	{
		var rewardItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.65},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_TITLE_3, visible:true, useK:true},
		};
		
		var itemDef = 
		{
			bg:{color:"data.isCompletedAll ? cc.color(192, 192, 192, 255) : cc.WHITE",onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this), forceTouchEnd:true},
			itemBg:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this), forceTouchEnd:true},
			item:{type:UITYPE_ITEM, field:"requireItem", scale:0.85, opacity:"data.iconOpacity"},
			itemFg:{type:UITYPE_MASK, field:"itemFgHeight"},
			star1:{type:UITYPE_IMAGE, field:"starSprite1", scale:0.4},
			star2:{type:UITYPE_IMAGE, field:"starSprite2", scale:0.4},
			star3:{type:UITYPE_IMAGE, field:"starSprite3", scale:0.4},
			title:{type:UITYPE_TEXT, field:"title", style:TEXT_STYLE_TITLE_3},
			current:{visible:false},
			require:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_TEXT_NORMAL, color:"data.isCompleted ? cc.GREEN : cc.WHITE", visible:"!data.isCompletedAll"},//require:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_TEXT_NORMAL, color:"data.isCompleted ? cc.GREEN : cc.RED"},
			itemList:{type:UITYPE_2D_LIST, field:"rewards", itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 80), singleLine:true},
			arrow:{visible:"data.rewards.length > 4"},
			itemReceiveButton:{visible:"data.isCompleted === true && !data.isCompletedAll", onTouchEnded:this.receiveReward.bind(this)},
			itemReceiveText:{type:UITYPE_TEXT, value:"TXT_LEVEL_UP_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
		};
		
		uiDef.itemList = {type:UITYPE_2D_LIST, items:this.displayData[this.currentTab], itemUI:UI_ACHIEVEMENT_ITEM, itemDef:itemDef, itemSize:cc.size(600, 210), vertical:true};
		uiDef.emptyText = {type:UITYPE_TEXT, value:"TXT_ACHIEVEMENT_FINISHED_ALL", style:TEXT_STYLE_TEXT_NORMAL, visible:this.displayData[this.currentTab].length <= 0};
	},
	
	showItemHint:function(sender)
	{
		var widget = FWPool.getNode(UI_ACHIEVEMENT, false);
		var position =null;
		if(FWUI.touchedWidget){
			//cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
			position = FWUI.touchedWidget.getTouchBeganPosition();
		}
		this.currentAchievement = sender.uiData;
		gv.hintManagerNew.show(widget, HINT_TYPE_ACHIEVEMENT, sender.uiData.requireItem,position);
	},
	
	hideItemHint:function(sender)
	{
		gv.hintManagerNew.hideHint(HINT_TYPE_ACHIEVEMENT);
	},
	
	receiveRewardPos: null,
	receiveReward:function(sender)
	{
		if(!Game.canReceiveGift(sender.uiData.rewards))
			return;
		
		this.currentAchievement = sender.uiData;
		this.receiveRewardPos = FWUtils.getWorldPosition(sender);
		
		var pk = network.connector.client.getOutPacket(this.RequestAchievementFinish);
		pk.pack(this.currentAchievement.ID);
		network.connector.client.sendPacket(pk);
	},
	
	onRewardReceived:function()
	{
		// fx
		FWUtils.showFlyingItemIcons(this.currentAchievement.rewards, this.receiveRewardPos);
		
		// inc trophy points
		this.data.trophyPoint += this.currentAchievement.TARGETS[this.currentAchievement.starsCount].TROPHY;
		
		// inc stars
		this.data[this.currentAchievement.ID].starsCount++;
		
		// jira#5977
		//if(this.data[this.currentAchievement.ID].starsCount > 3)
		//	FWUtils.removeArrayElement(this.displayData[this.currentAchievement.GROUP], this.currentAchievement);
		//else
			this.updateTaskDisplayData(this.currentAchievement);

		this.updateTrophyDisplayData();
		this.show(this.currentTab, true);
		
		// jira#5987
		this.itemList.scrollToPercentVertical(0, 0.01, false);
	},
	
	receiveTrophyReward:function(sender)
	{
		if(!Game.canReceiveGift(g_ACHIEVEMENT.trophyMilestones[this.data.trophyMilestone].rewards))
			return;
		
		this.trophyShowRewards = false;
		this.receiveRewardPos = FWUtils.getWorldPosition(sender);
		
		var pk = network.connector.client.getOutPacket(this.RequestAchievementTrophyReward);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onTrophyRewardReceived:function()
	{
		// fx
		FWUtils.showFlyingItemIcons(g_ACHIEVEMENT.trophyMilestones[this.data.trophyMilestone].rewards, this.receiveRewardPos);
		
		// inc trophy milestone
		this.data.trophyMilestone++;

		this.updateTrophyDisplayData();
		this.show(this.currentTab, true);
	},
	
	showTrophyRewards:function(show)
	{
		if(this.trophyShowRewards !== show)
		{
			this.trophyShowRewards = show;
			this.show(this.currentTab, true);
		}
	},
	
	updateTaskDisplayData:function(task)
	{
		var action = Game.getActionById(task.ACTION);
		var completedAmount = this.data[task.ID].completed;
		task.title = FWLocalization.text("TXT_ACHIEVEMENT_" + task.ID);
		task.starsCount = this.data[task.ID].starsCount;
		task.isCompletedAll = (task.starsCount >= 3);
		
		var displStarsCount = task.starsCount;
		if(displStarsCount > 2)
			displStarsCount = 2;

		task.requireItem = task.TARGET_ID;
		task.requireAmount = task.TARGETS[displStarsCount].POINT;
		//task.desc = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_" + task.ACTION).replace("%count", task.requireAmount).replace("%item", FWLocalization.text("TXT_" + task.TARGET_ID));
		task.desc = FWLocalization.text(action.DESC).replace("%count", task.requireAmount).replace("%item", FWLocalization.text("TXT_" + task.TARGET_ID));

		task.displayAmount = completedAmount + "/" + task.requireAmount;
		task.isCompleted = (completedAmount >= task.requireAmount);
		task.itemFgHeight = Math.min(ACHIEVEMENT_ITEMFG_HEIGHT * completedAmount / task.requireAmount, ACHIEVEMENT_ITEMFG_HEIGHT);
		task.rewards = FWUtils.getItemsArray(task.TARGETS[displStarsCount].REWARDS);
		task.rewards.push({itemId:"TROPHY", amount:task.TARGETS[displStarsCount].TROPHY, displayAmount:"x" + task.TARGETS[displStarsCount].TROPHY});
		task.starSprite1 = (task.starsCount >= 1 ? "hud/icon_star_achieve.png" : "hud/icon_star_achieve_empty.png");
		task.starSprite2 = (task.starsCount >= 2 ? "hud/icon_star_achieve.png" : "hud/icon_star_achieve_empty.png");
		task.starSprite3 = (task.starsCount >= 3 ? "hud/icon_star_achieve.png" : "hud/icon_star_achieve_empty.png");
		task.iconOpacity = (task.isCompleted ? 255 : 128);
		
		// modified in FWUtils.getItemsArray
		//for(var i=0; i<task.rewards.length; i++)
		//	task.rewards[i].displayAmount = "x" + task.rewards[i].amount;
		
		if(!task.requireItem || task.ACTION === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE)
			task.requireItem = "ACHIEVEMENT_" + task.ID;
	},
	
	updateTrophyDisplayData:function()
	{
		if(this.data.trophyMilestone >= g_ACHIEVEMENT.trophyMilestones.length)
			return;
		
		this.trophyRequirePoint = g_ACHIEVEMENT.trophyMilestones[this.data.trophyMilestone].point;
		this.trophyRewards = g_ACHIEVEMENT.trophyMilestones[this.data.trophyMilestone].rewards;
		this.trophyIsCompleted = (this.data.trophyPoint >= this.trophyRequirePoint);
	},
	
	onAction:function(action, item, count)
	{
		if(!ENABLE_ACHIEVEMENT)
			return;
		
		cc.log("Achievement::onAction: action=" + action + " item=" + item + " count=" + count);
		
		var tasks = g_ACHIEVEMENT.tasks;
		var len = tasks.length;
		for(var i=0; i<len; i++)
		{
			var task = tasks[i];
			if(task.ACTION === action && (!task.TARGET_ID || task.TARGET_ID === item) && this.data[task.ID].starsCount < 3)
				this.updateTaskStatus(task, this.data[task.ID].completed + count);
		}
		
		if(ENABLE_QUEST_BOOK)
			QuestBook.onAction(action, item, count);

		if (ENABLE_QUEST_MISSION)
			QuestMission.onAction(action, item, count);
		
		if(g_MISCINFO.GUILD_ACTIVE && g_MISCINFO.DERBY_ACTIVE)
			Guild2.onAction(action, item, count);
	},
	
	updateTaskStatus:function(task, completed)
	{
		cc.log("Achievement::updateTaskStatus: task.ID=" + task.ID + " completed=" + completed);
		
		var wasCompleted = task.isCompleted;
		this.data[task.ID].completed = completed;
		this.updateTaskDisplayData(task);
		
		if(!wasCompleted && task.isCompleted && FWUtils.getCurrentScene() === Game.gameScene)
		{
			this.refreshHomeBuilding(true);
			
			// jira#5933
			Marquee.newText();
			
			var gfx = Game.getItemGfxByDefine(task.requireItem);
			if(gfx.sprite)
				Marquee.addSprite(gfx.sprite, (gfx.scale ? gfx.scale : 1) * 0.75);
			else
				Marquee.addSpine(gfx.spine, gfx.skin, gfx.anim, 50, (gfx.scale ? gfx.scale : 1) * 0.75, 25);
			
			var text = cc.formatStr(FWLocalization.text("TXT_ACHIEVEMENT_COMPLETE"), task.title);
			var text1 = text.substring(0, text.indexOf("["));
			var text2 = text.substring(text.indexOf("[") + 1, text.indexOf("]"));
			var text3 = text.substring(text.indexOf("]") + 1);
			Marquee.addText(text1);
			var label2 = Marquee.addText(text2);
			label2.setColor(cc.color.GREEN);
			Marquee.addText(text3);
			// end: jira#5933
		}
		
		if(this.tasksToSave.indexOf(task.ID) < 0)
			this.tasksToSave.push(task.ID);
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveTasks);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveTasks, 0, 0, 1.5, false);
	},
	
	saveTasks:function()
	{
		var uids = this.tasksToSave;
		var points = [];
		for(var i=0; i<uids.length; i++)
			points.push(this.data[uids[i]].completed);
		
		var pk = network.connector.client.getOutPacket(this.RequestAchievementSave);
		pk.pack(uids, points);
		network.connector.client.sendPacket(pk);
		
		this.tasksToSave = [];
	},
	
	onItemsUpdated:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateStockTasks);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateStockTasks, 0, 0, 1, false);
	},
	
	updateStockTasks:function()
	{
		if(Game.isFriendGarden() || !this.checkStockTasks)
			return;
		
		for(var i=0; i<this.checkStockTasks.length; i++)
		{
			var task = this.checkStockTasks[i];
			if(task.ACTION === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE)
			{
				var count = Game.getComboPotsCount(task.TARGET_ID);
				if(count > this.data[task.ID].completed)
					this.updateTaskStatus(task, count);
			}
			else if(task.ACTION === g_ACTIONS.ACTION_CHECK_DECOR.VALUE)
			{
				var totalDecorsCount = Game.getAllDecorsCount();
				if(totalDecorsCount > this.data[task.ID].completed)
					this.updateTaskStatus(task, totalDecorsCount);
			}
		}
		
		if(ENABLE_QUEST_BOOK)
			QuestBook.updateStockQuests();
		
		if(ENABLE_QUEST_MISSION)
			QuestMission.updateStockMission();
		
		if(g_MISCINFO.GUILD_ACTIVE && g_MISCINFO.DERBY_ACTIVE)
			Guild2.updateStockTasks();
	},
	
	sortTasks:function(tab)
	{
		if(tab === ACHIEVEMENT_TAB_TROPHY)
		{
			this.displayData[ACHIEVEMENT_TAB_TROPHY] = [];
			for(var i=ACHIEVEMENT_TAB_HARVEST; i<=ACHIEVEMENT_TAB_SPECIAL; i++)
			{
				this.displayData[i] = _.sortByDecent(this.displayData[i], function(val) {return (val.isCompletedAll ? 0 : val.itemFgHeight * 1000000 + val.requireAmount);});
				
				var count = 0;
				for(var j=0; j<this.displayData[i].length && count<4; j++, count++)
				{
					if(this.displayData[i][j].isCompletedAll)
						continue;
					this.displayData[ACHIEVEMENT_TAB_TROPHY].push(this.displayData[i][j]);
				}
			}
			this.displayData[ACHIEVEMENT_TAB_TROPHY] = _.sortByDecent(this.displayData[ACHIEVEMENT_TAB_TROPHY], function(val) {return (val.isCompletedAll ? 0 : val.itemFgHeight * 1000000 + val.requireAmount);});
		}
		else
			this.displayData[tab] = _.sortByDecent(this.displayData[tab], function(val) {return (val.isCompletedAll ? 0 : val.itemFgHeight * 1000000 + val.requireAmount);});
	},
	
	// jira#5975
	refreshHomeBuilding:function(hasReward)
	{
		if(!gv.background)
			return;
		
		if(Game.isFriendGarden())
			hasReward = false;
		else if(hasReward === undefined)
		{
			hasReward = this.trophyIsCompleted;
			if(!hasReward)
			{
				var tasks = g_ACHIEVEMENT.tasks;
				for(var i=0; i<tasks.length; i++)
				{
					if(this.data[tasks[i].ID].starsCount < 3 && tasks[i].isCompleted)
					{
						hasReward = true;
						break;
					}
				}
			}
		}
		
		gv.background.animAchievement.setAnimation(hasReward ? "building_normal2" : BG_BUILDING_ANIM_NORMAL, true);
		gv.background.notifyAchievement.setVisible(hasReward);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestAchievementSave:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACHIEVEMENT_SAVE);},
		pack:function(uids, points)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, uids);
			PacketHelper.putIntArray(this, KEY_NUM, points);
			
			addPacketFooter(this);
		},
	}),

	ResponseAchievementSave:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
			{
				cc.log("Achievement::ResponseAchievementSave: error=" + this.getError());
				
				// refresh
				var object = PacketHelper.parseObject(this);
				var uids = object[KEY_UID];
				var points = object[KEY_NUM];
				for(var i=0; i<uids.length; i++)
				{
					Achievement.data[uids[i]].completed = points[i];
					Achievement.updateTaskDisplayData(g_ACHIEVEMENT.tasks[uids[i]]);
				}
				if(FWUI.isShowing(UI_ACHIEVEMENT))
					Achievement.show(Achievement.currentTab, true);
			}
		}
	}),
	
	RequestAchievementFinish:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACHIEVEMENT_FINISH);},
		pack:function(uid)
		{
			FWUtils.disableAllTouches();
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_UID, uid);
			
			addPacketFooter(this);
		},
	}),

	ResponseAchievementFinish:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			
			if(this.getError() !== 0)
				cc.log("Achievement::ResponseAchievementFinish: error=" + this.getError());
			else
				Achievement.onRewardReceived(object[KEY_UID]);
		}
	}),
	
	RequestAchievementTrophyReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.ACHIEVEMENT_TROPHY_REWARD);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseAchievementTrophyReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			
			if(this.getError() !== 0)
				cc.log("Achievement::ResponseAchievementTrophyReward: error=" + this.getError());
			else
				Achievement.onTrophyRewardReceived(object[KEY_UID]);
		}
	}),	
	
};

network.packetMap[gv.CMD.ACHIEVEMENT_SAVE] = Achievement.ResponseAchievementSave;
network.packetMap[gv.CMD.ACHIEVEMENT_FINISH] = Achievement.ResponseAchievementFinish;
network.packetMap[gv.CMD.ACHIEVEMENT_TROPHY_REWARD] = Achievement.ResponseAchievementTrophyReward;
