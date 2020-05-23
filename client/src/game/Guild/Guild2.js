
// gd:
// - skip time & buy more tasks: no confirmation popup?
// change, claim => send ids + unschedule save

const GUILD2_TAB_TASKS = 0;
const GUILD2_TAB_DERBY = 1;
const GUILD2_TAB_REWARDS = 2;
const GUILD2_TAB_RANKING = 3;
const GUILD2_TAB_LEAGUE = 4;

const GUILD2_STATE_NONE = -1;
const GUILD2_STATE_TASK_NOT_STARTED = 0;
const GUILD2_STATE_TASK_STARTED = 1;
const GUILD2_STATE_TASK_STARTED_LATE = 2;
const GUILD2_STATE_DERBY = 4;
const GUILD2_STATE_REWARDS = 5;
const GUILD2_STATE_RANKING = 6;
const GUILD2_STATE_LEAGUE = 7;

const GUILD2_DERBY_MILESTONES_X = 200;
const GUILD2_DERBY_MILESTONES_Y = 25;
const GUILD2_DERBY_MILESTONES_SPACE = 120;
const GUILD2_DERBY_MILESTONES_STEPS_COUNT = 3;
const GUILD2_DERBY_TRACK_HEIGHT = 110;
const GUILD2_DERBY_FROG_Y = 45;
const GUILD2_DERBY_RANK_X = 10;
const GUILD2_DERBY_RANK_Y = 55;

const GUILD2_DERBY_NUM_MILESTONE_SHOW = 4;

var Guild2 =
{
	currentTab: GUILD2_TAB_TASKS,
	currentState: GUILD_STATE_CREATE,
	currentSubTab: GUILD2_TAB_LEAGUE,
	stateStack: [],
	selectedTaskId: null,
	svrData: null,
	lastCmd: null, // to distinguish normal cmd vs broadcasted cmd
	
	init:function()
	{
		this.loadDerby();
	},
	
	uninit:function()
	{
		
	},

	resourcesLoaded: false,	
	show:function()
	{
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			cc.loader.load([GUILD_DUMMY_PLIST,
							GUILD_DUMMY_PLIST.replace(".plist", ".png"),
							GUILD2_DUMMY_PLIST,
							GUILD2_DUMMY_PLIST.replace(".plist", ".png"),
							UI_GUILD2,
							UI_GUILD2_TASK_ITEM,
							UI_GUILD2_PICKED_TASK_ITEM,
							UI_GUILD2_STATISTICS,
							UI_GUILD2_STATISTICS_ITEM,
							UI_GUILD2_CONFIRM,
							UI_GUILD2_DERBY,
							UI_GUILD2_DERBY_MILESTONE,
							UI_GUILD2_DERBY_MILESTONE_FROG,
							UI_GUILD2_RANKING_ITEM,
							UI_GUILD2_LEAGUE,
							UI_GUILD2_LEAGUE_ITEM,
							UI_GUILD2_REWARD_ITEM,
							UI_GUILD2_REWARD_SUBITEM],
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(GUILD_DUMMY_PLIST);
					cc.spriteFrameCache.addSpriteFrames(GUILD2_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}
		
		if(!this.svrData || Object.keys(this.svrData).length <= 0)
		{
			cc.log("Guild2::show: no data");
			var errorMsg = FWLocalization.text("TXT_GUILD2_WAIT_NEXT_DERBY");

			if(Game.gameScene.background.animGuild2.node)
				FWUtils.showWarningText(errorMsg, FWUtils.getWorldPosition(Game.gameScene.background.animGuild2.node));
			return;
		}
		
		this.showTab(GUILD2_TAB_TASKS);
		this.update();
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.updatePos, 0, cc.REPEAT_FOREVER, 0, false);
	},
	
	showMainUi:function()
	{
		var uiDef =
		{
			timeLeft:{type:UITYPE_TIME_BAR, startTime:this.getDerbyStartTime(), endTime:this.getDerbyEndTime(), countdown:true, useExisting:true, timeTextStyle:TEXT_STYLE_NUMBER, visible:this.getDerbyEndTime()>Game.getGameTimeInSeconds(),onFinished:function() {if (this.currentTab == GUILD2_TAB_REWARDS)this.setState(GUILD2_STATE_REWARDS); else this.setState(GUILD2_STATE_TASK_NOT_STARTED);}.bind(this)},//jira#6969 timeLeft:{visible:false},
			mainScoreBg:{visible:true},//mainScoreBg:{visible:false},
			mainScore:{type:UITYPE_TEXT, value:this.getDerbyDisplayScore(this.getGuildScore()), style:TEXT_STYLE_NUMBER},
			mainGuildIcon:{type:UITYPE_IMAGE, value:Guild.guildAvatar, scale:0.4, onTouchBegan:this.showScoreHint.bind(this), onTouchEnded:this.hideScoreHint.bind(this), forceTouchEnd:true},
			mainScoreIcon:{onTouchBegan:this.showScoreHint.bind(this), onTouchEnded:this.hideScoreHint.bind(this), forceTouchEnd:true},
			mainScoreBg:{onTouchBegan:this.showScoreHint.bind(this), onTouchEnded:this.hideScoreHint.bind(this), forceTouchEnd:true},
			panelTaskWaitNext:{visible:false},
			panelTaskWaitStart:{visible:false},
			panelTaskCurrent:{visible:false},
			panelDerby:{visible:false},
			panelLeague:{visible:false},
			panelRanking:{visible:false},
			panelReward:{visible:false},
			tcInfo:{visible:false},
			tcCooldown:{visible:false},
			tcBuy:{visible:false},
			tcTasksLeftBg:{visible:false},
			curtain_open:{visible:true},
			curtain_close:{visible:false},
			
			closeButton:{onTouchEnded:this.popAllStates.bind(this)},
			infoButton:{onTouchEnded:this.showInfo.bind(this)},//jira#6971 infoButton:{onTouchEnded:GameEvent.showInfo.bind(GameEvent)},
			title:{type:UITYPE_TEXT, value:"TXT_GUILD2_TITLE", style:TEXT_STYLE_TITLE_1},
			tabTaskOff:{visible:this.currentTab !== GUILD2_TAB_TASKS, onTouchEnded:this.showTab.bind(this, GUILD2_TAB_TASKS)},
			tabDerbyOff:{visible:this.currentTab !== GUILD2_TAB_DERBY, onTouchEnded:this.showTab.bind(this, GUILD2_TAB_DERBY)},
			tabRewardsOff:{visible:this.currentTab !== GUILD2_TAB_REWARDS, onTouchEnded:this.showTab.bind(this, GUILD2_TAB_REWARDS)},
			tabRankingOff:{visible:false}, //tabRankingOff:{visible:this.currentTab !== GUILD2_TAB_RANKING && this.currentTab !== GUILD2_TAB_LEAGUE && this.currentSubTab === GUILD2_TAB_RANKING, onTouchEnded:this.showTab.bind(this, this.currentSubTab)},
			tabLeagueOff:{visible:false}, //tabLeagueOff:{visible:this.currentTab !== GUILD2_TAB_RANKING && this.currentTab !== GUILD2_TAB_LEAGUE && this.currentSubTab === GUILD2_TAB_LEAGUE, onTouchEnded:this.showTab.bind(this, this.currentSubTab)},
			tabTasksOn:{visible:this.currentTab === GUILD2_TAB_TASKS},
			tabDerbyOn:{visible:this.currentTab === GUILD2_TAB_DERBY},
			tabRewardsOn:{visible:this.currentTab === GUILD2_TAB_REWARDS},
			tabRankingOn:{visible:false}, //tabRankingOn:{visible:this.currentTab === GUILD2_TAB_RANKING, onTouchEnded:this.showTab.bind(this, GUILD2_TAB_LEAGUE)},
			tabLeagueOn:{visible:false}, //tabLeagueOn:{visible:this.currentTab === GUILD2_TAB_LEAGUE, onTouchEnded:this.showTab.bind(this, GUILD2_TAB_RANKING)},
		};

		if(this.currentState === GUILD2_STATE_TASK_NOT_STARTED)
			this.showTaskNotStarted(uiDef);
		else if(this.currentState === GUILD2_STATE_TASK_STARTED)
			this.showTaskStarted(uiDef);
		else if(this.currentState === GUILD2_STATE_TASK_STARTED_LATE)
			this.showTaskStartedLate(uiDef);
		else if(this.currentState === GUILD2_STATE_LEAGUE)
			this.showLeague(uiDef);
		else if(this.currentState === GUILD2_STATE_RANKING)
			this.showRanking(uiDef);
		else if(this.currentState === GUILD2_STATE_REWARDS)
			this.showRewards(uiDef);
		
		if(this.currentState === GUILD2_STATE_DERBY)
			this.showDerby(uiDef);
		else
			this.cleanupDerby();
		
		// show
		var widget = FWPool.getNode(UI_GUILD2, false);
		if(FWUI.isWidgetShowing(widget))
		{
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.handleBackKeyFunc)
				this.handleBackKeyFunc = this.handleBackKey.bind(this);
			Game.gameScene.registerBackKey(this.handleBackKeyFunc);
		}
		
		// feedback
		if(this.currentState === GUILD2_STATE_TASK_STARTED)
		{
			var tciButtonList = FWUtils.getChildByName(widget, "tciButtonList");
			FWUI.alignPanelItemsHorizontally(tciButtonList);
		}

		if(!this.derbyPointHint)
		{
			this.derbyPointHint = FWUI.getChildByName(widget,"hint");
		}

		if(this.getDerbyEndTime()<Game.getGameTimeInSeconds()){
			var titleMain = FWUI.getChildByName(widget,"title");
			var cloud = FWUI.getChildByName(widget,"cloud");
			titleMain.setPosition(cc.p(cloud.getPositionX()-50 , cloud.getPositionY()+5));
		}

	},
	
	hide:function()
	{
		FWUI.hide(UI_GUILD2, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.handleBackKeyFunc);
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updatePos);
		this.cleanupDerby();
		this.selectedTaskId = null;
	},
	
	handleBackKey:function()
	{
		if(FWUI.isShowing(UI_GUILD2_STATISTICS))
		{
			this.hideStatistics();
			return;
		}
		else if(FWUI.isShowing(UI_GUILD2_CONFIRM))
		{
			this.hideConfirm();
			return;
		}
		
		this.popState();
	},
	
	update:function(dt)
	{
		// check for cooldown or timed-out tasks
		var refresh = false;
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			var task = this.guildTaskList[i];
			if(task.status === GUILD_DERBY_TASK_COOLDOWN && task.startTime < Game.getGameTimeInSeconds())
			{
				task.status = GUILD_DERBY_TASK_WAIT;
				refresh = true;
			}
			else if(task.status === GUILD_DERBY_TASK_PROCESS && task.duration > 0 && task.startTime + task.duration < Game.getGameTimeInSeconds())
			{
				if(task.id === this.selectedTaskId)
					this.selectedTaskId = null; // deselect timed-out task

				task.status = GUILD_DERBY_TASK_TIMEOUT;
				refresh = true;
			}
		}

		if(refresh)
			this.showMainUi();
	},
	
	updatePos:function()
	{
		// scroll linking
		if(this.crtDerbyScrollView)
		{
			if(this.crtDerbyScrollView === this.derbyScrollView)
			{
				var innerContainer = this.derbyScrollView2.getInnerContainer();
				innerContainer.setPosition(this.derbyScrollView.getInnerContainer().getPositionX(), innerContainer.getPositionY());
			}
			else if(this.crtDerbyScrollView === this.derbyScrollView2)
			{
				var innerContainer = this.derbyScrollView.getInnerContainer();
				innerContainer.setPosition(this.derbyScrollView2.getInnerContainer().getPositionX(), innerContainer.getPositionY());
			}
		}
		
		// derby item position
		if(this.currentTab === GUILD2_TAB_DERBY)
		{
			for(var i=0; i<this.derbyRanks.length; i++)
			{
				var rankUi = this.derbyRanks[i];
				var score = this.derbyScoreBg[i];
				var frog = this.derbyFrog[i];
				var trackUi = rankUi.getParent();
				rankUi.setPosition(GUILD2_DERBY_RANK_X - trackUi.scrollView.getInnerContainer().getPositionX(), rankUi.getPositionY());
				//cc.log("aaaa",i,score.getPositionX(),trackUi.scrollView.getInnerContainer().getPositionX());

				var posX= frog.getPositionX() + 30;
				var posY=  frog.getPositionY()+10;
				if(frog.getPositionX() + trackUi.scrollView.getInnerContainer().getPositionX() <= 100)
				{
					posX = GUILD2_DERBY_RANK_X - trackUi.scrollView.getInnerContainer().getPositionX() + 120;
					posY  = rankUi.getPositionY();
				}

				score.setPosition(posX,posY);

			}
		}
	},
	
	getDerbyDisplayScore:function(score)
	{
		return Math.floor(score / g_MISCINFO.DERBY_POINT_RATIO);
	},
	
	showScoreHint:function(sender)
	{
		if(this.derbyPointHint)
		{
			this.derbyPointHint.setVisible(true);

			var hintText = this.derbyPointHint.getChildByName("hintText");
			hintText.setString(FWLocalization.text("TXT_DERBY_POINT_HINT"));

			// jira#6430
			FWUI.applyTextStyle(hintText, TEXT_STYLE_TEXT_DIALOG);
		}
		//var pos = FWUtils.getWorldPosition(sender);
		//if(pos.y > cc.winSize.height / 2)
		//	pos.y -= 50;
		//gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_TEXT, ["TXT_DERBY_POINT_HINT_TITLE", "TXT_DERBY_POINT_HINT"], pos);
	},
	
	hideScoreHint:function(sender)
	{
		if(this.derbyPointHint)
		{
			this.derbyPointHint.setVisible(false);
		}
		//gv.hintManagerNew.hideHint(HINT_TYPE_TEXT);
	},

	showScoreHintStatistics:function(sender)
	{
		cc.log("showScoreHintStatistics");
		if(this.hintGuildStatistics)
		{
			cc.log("showScoreHintStatistics 2");
			this.hintGuildStatistics.setVisible(true);

			var hintText = this.hintGuildStatistics.getChildByName("hintText");

			var center = sender.getParent();
			var name = sender.getName();
			cc.log("showScoreHintStatistics",name);
			var layerPos = null;
			var text = "";
			if(name == "scoreBg" ||name == "scoreIcon"||name == "guildIcon"){
				layerPos = FWUI.getChildByName(center,"totalScore");
				text = "TXT_DERBY_POINT_HINT";
			}
			else
			{
				layerPos = FWUI.getChildByName(center,"totalDeleted");
				text = "TXT_DERBY_DELETE_HINT";
			}

			this.hintGuildStatistics.setPosition(layerPos.getPosition());
			hintText.setString(FWLocalization.text(text));

			// jira#6430
			FWUI.applyTextStyle(hintText, TEXT_STYLE_TEXT_DIALOG);
		}
		//var pos = FWUtils.getWorldPosition(sender);
		//if(pos.y > cc.winSize.height / 2)
		//	pos.y -= 50;
		//gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_TEXT, ["TXT_DERBY_POINT_HINT_TITLE", "TXT_DERBY_POINT_HINT"], pos);
	},
	hideScoreHintStatistics:function(sender){
		cc.log("hideScoreHintStatistics");
		if(this.hintGuildStatistics)
		{
			this.hintGuildStatistics.setVisible(false);
		}
	},
	showDeleteHint:function(sender)
	{
		var pos = FWUtils.getWorldPosition(sender);
		if(pos.y > cc.winSize.height / 2)
			pos.y -= 50;
		gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_TEXT, ["TXT_DERBY_DELETE_HINT_TITLE", "TXT_DERBY_DELETE_HINT"], pos);
	},
	
	hideDeleteHint:function(sender)
	{
		gv.hintManagerNew.hideHint(HINT_TYPE_TEXT);
	},
	
	showInfo:function()
	{
		Game.showCommonHint("TXT_GUILD2_INFO_TITLE", "TXT_GUILD2_INFO_CONTENT");
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// confirm ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	showConfirm:function(npcText, icon, buttonNames, buttonTexts, callback,displayAmount)
	{
		if(displayAmount === undefined)
			displayAmount = null;
		
		var test = displayAmount;
		cc.log("showConfirm",displayAmount);
		var uiDef =
		{
			npcName:{type:UITYPE_TEXT, value:"TXT_NPC_03", style:TEXT_STYLE_TEXT_NORMAL},
			npcText:{type:UITYPE_TEXT, value:npcText, style:TEXT_STYLE_TEXT_DIALOG},
			taskIcon:{type:UITYPE_IMAGE, value:icon},
			taskAmount:{type:UITYPE_TEXT, value:displayAmount,visible:displayAmount ? true:false,style:TEXT_STYLE_NUMBER},
			receiveButton:{visible:false},
			deleteButton:{visible:false},
			cancelButton:{visible:false},
			buyButton:{visible:false},
			noCancelButton:{visible:false},
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:1.25},
			tapToClose:{onTouchEnded:this.hideConfirm.bind(this)},
		};
		
		for(var i=0; i<buttonNames.length; i++)
		{
			uiDef[buttonNames[i]] = {visible:true, onTouchEnded:this.onGuildConfirmButton.bind(this)};
			uiDef[buttonNames[i] + "Text"] = {type:UITYPE_TEXT, value:buttonTexts[i], style:TEXT_STYLE_TEXT_BUTTON};
		}
		
		this.confirmCallback = callback;
		
		var widget = FWPool.getNode(UI_GUILD2_CONFIRM, false);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		AudioManager.effect(EFFECT_POPUP_SHOW);
	},
	
	hideConfirm:function()
	{
		FWUI.hide(UI_GUILD2_CONFIRM, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		this.confirmCallback = null;
	},
	
	onGuildConfirmButton:function(sender)
	{
		var res = this.confirmCallback(sender);
		if(res !== false)
			this.hideConfirm();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// guild2 states //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	setState:function(state)
	{
		this.stateStack = [state];
		this.onStateChanged(this.currentState, state);
	},
	
	pushState:function(state)
	{
		this.stateStack.push(state);
		this.onStateChanged(this.currentState, state);
	},
	
	popState:function()
	{
		this.stateStack.pop();
		this.onStateChanged(this.currentState, this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : GUILD2_STATE_NONE);
	},
	
	popAllStates:function()
	{
		while(this.stateStack.length > 0)
			this.popState();
	},
	
	onStateChanged:function(oldState, newState)
	{
		cc.log("Guild2::onStateChanged: oldState=" + oldState + " newState=" + newState);
		
		// hide old state
	
		// show new state
		this.currentState = newState;
		if(newState !== GUILD2_STATE_NONE)
			this.showMainUi();
		else
			this.hide();
	},
	
	showTab:function(tab)
	{
		this.currentTab = tab;
		cc.log("showTab",tab);
		if(tab === GUILD2_TAB_TASKS)
		{
			if(!this.hasDerbyStarted() || this.hasDerbyFinished())
				this.setState(GUILD2_STATE_TASK_NOT_STARTED);
			else if(!this.hasPlayerJoinedDerby())
				this.setState(GUILD2_STATE_TASK_STARTED_LATE);
			else
				this.setState(GUILD2_STATE_TASK_STARTED);
		}
		else if(tab === GUILD2_TAB_DERBY)
		{
			this.setState(GUILD2_STATE_DERBY);
		}
		else if(tab === GUILD2_TAB_RANKING || tab === GUILD2_TAB_LEAGUE)
		{
			this.currentSubTab = tab;
			this.setState(tab === GUILD2_TAB_RANKING ? GUILD2_STATE_RANKING : GUILD2_STATE_LEAGUE);
		}
		else if(tab === GUILD2_TAB_REWARDS)
		{
			// load rewards before showing
			var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyRewardGet);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// tasks //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showTaskNotStarted:function(uiDef)
	{
		var uiDef2 =
		{
			panelTaskWaitStart:{visible:true},
			twsTimeMarker:{type:UITYPE_TIME_BAR, startTime:this.getDerbyStartTime(), endTime:this.getNextDerbyStartTime()+5, countdown:true,onFinished:function() {if (this.currentTab == GUILD2_TAB_TASKS) this.loadDerby(); this.resetDerbyNotStated = true;}.bind(this)},
			npcFrog:{visible:true, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:true, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_GUILD2_NEXT_DERBY_COUNTDOWN"},			
			curtain_open:{visible:false},
			curtain_close:{visible:true},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	showTaskStartedLate:function(uiDef)
	{
		var uiDef2 =
		{
			panelTaskWaitNext:{visible:true},
			twnText:{type:UITYPE_TEXT, value:"TXT_GUILD2_WAIT_NEXT_DERBY2", style:TEXT_STYLE_TEXT_NORMAL},
			npcFrog:{visible:true, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:true, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_GUILD2_WAIT_NEXT_DERBY"},			
			curtain_open:{visible:false},
			curtain_close:{visible:true},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	showTaskStarted:function(uiDef)
	{
		// split to lists
		var taskList = this.guildTaskList;
		taskList = _.sortBy(taskList, function(val) {return val.displayIdx;});
		
		var availableList = [];
		var pickedList = [];
		var historyList = [];
		var selectedTask = null;
		for(var i=0; i<taskList.length; i++)
		{
			var task = taskList[i];
			this.updateTaskDisplayData(task);

			if(task.status === GUILD_DERBY_TASK_COOLDOWN || task.status === GUILD_DERBY_TASK_WAIT)
				availableList.push(task);
			else if(task.status === GUILD_DERBY_TASK_PROCESS)
			{
				if(task.pickedUserLevel >0)
					pickedList.push(task);
				if(task.pickedUserId === gv.mainUserData.userId && this.selectedTaskId == null)
					this.selectedTaskId = task.id;
			}

			
			if(task.pickedUserId === gv.mainUserData.userId)
				historyList.push(task);
			
			if(task.id === this.selectedTaskId)
				selectedTask = task;
			

		}
		historyList = _.sortByDecent(historyList, function(val) {return val.startTime;});
		this.selectedTask = selectedTask;
		if(!selectedTask && pickedList.length>0) this.selectedTask = pickedList[0];
		
		var availableDef =
		{
			taskInfo:{visible:"data.status !== GUILD_DERBY_TASK_COOLDOWN && (data.pickedUserId === '' || data.pickedUserId === gv.mainUserData.userId)"},
			taskIcon:{type:UITYPE_IMAGE, field:"actionIcon", scale:"data.actionIconScale"},
			scoreText:{type:UITYPE_TEXT, field:"displayScore", style:TEXT_STYLE_TEXT_NORMAL},
			timeText:{type:UITYPE_TEXT, field:"durationText", style:TEXT_STYLE_TEXT_NORMAL},
			countdown:{visible:"data.status === GUILD_DERBY_TASK_COOLDOWN"},
			basket:{visible:"data.basket === true"},
			userInfo:{visible:"data.status !== GUILD_DERBY_TASK_COOLDOWN && data.pickedUserId !== '' && data.pickedUserId !== gv.mainUserData.userId"},
			avatar:{type:UITYPE_IMAGE, field:"pickedUserAvatar", size:64},
			name:{type:UITYPE_TEXT, field:"pickedUserName", style:TEXT_STYLE_TEXT_NORMAL},
			level:{type:UITYPE_TEXT, field:"pickedUserLevel", style:TEXT_STYLE_TEXT_NORMAL},
			bg:{visible:"data.status !== GUILD_DERBY_TASK_COOLDOWN", type:UITYPE_IMAGE, field:"bg"},
			selectedBg:{visible:"data.status !== GUILD_DERBY_TASK_COOLDOWN && data.id === Guild2.selectedTaskId"},
			item:{onTouchEnded:this.selectTask.bind(this)},
			levelLimit:{visible:"data.status === GUILD_DERBY_TASK_WAIT && data.level > gv.mainUserData.getLevel()"}
		};
		
		var historyDef =
		{
			bg:{visible:"data.status === GUILD_DERBY_TASK_PROCESS"},
			bgFinished:{visible:"data.status !== GUILD_DERBY_TASK_PROCESS"},
			taskIcon:{type:UITYPE_IMAGE, field:"actionIcon", scale:"data.actionIconScale * 0.8"},
			taskDesc:{type:UITYPE_TEXT, field:"desc", style:TEXT_STYLE_TEXT_HINT_BROWN},
			score:{type:UITYPE_TEXT, field:"displayScore", style:TEXT_STYLE_TEXT_NORMAL},
			deleteIcon:{visible:"data.status === GUILD_DERBY_TASK_CANCEL"},
			check:{visible:"data.status === GUILD_DERBY_TASK_DONE"},
			pickedIcon:{visible:"data.status === GUILD_DERBY_TASK_PROCESS"},
			timeOutIcon:{visible:"data.status === GUILD_DERBY_TASK_TIMEOUT"},
		};
		
		// npc text
		// consider make it a function
		var npcText = null;
		if(this.selectedTaskId === null)
		{
			if(this.getUserTasksLeft() <= 0 && this.getUserBoughtTasksCount() < g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_NUMBER && this.getUserPickedTask() === null)
				npcText = "TXT_GUILD2_NPC_BUY_MORE_TASK";
			else
				npcText = "TXT_GUILD2_NPC_SELECT_TASK";
		}
		
		var uiDef2 =
		{
			//jira#6969 timeLeft:{type:UITYPE_TIME_BAR, startTime:this.getDerbyStartTime(), endTime:this.getDerbyEndTime(), countdown:true, onFinished:this.showTab.bind(this, GUILD2_TAB_REWARDS), useExisting:true, timeTextStyle:TEXT_STYLE_NUMBER, visible:true},
			panelTaskCurrent:{visible:true},
			tcAvailableTaskList:{type:UITYPE_2D_LIST, items:availableList, itemUI:UI_GUILD2_TASK_ITEM, itemDef:availableDef, itemSize:cc.size(190, 210)},
			tcPickedTaskList:{type:UITYPE_2D_LIST, items:pickedList, itemUI:UI_GUILD2_TASK_ITEM, itemDef:availableDef, itemSize:cc.size(190, 210)},
			tcHistoryTaskList:{type:UITYPE_2D_LIST, items:historyList, itemUI:UI_GUILD2_PICKED_TASK_ITEM, itemDef:historyDef, itemSize:cc.size(570, 100)},
			tcTasksLeftBg:{visible:true},
			tcTasksLeft:{type:UITYPE_TEXT, value:cc.formatStr(FWLocalization.text("TXT_GUILD2_TASKS_LEFT"), this.getUserTasksLeft(), this.getUserTotalTasks()), style:TEXT_STYLE_TEXT_NORMAL},
			tcHistoryTitle:{type:UITYPE_TEXT, value:"TXT_GUILD2_TASK_JOURNAL", style:TEXT_STYLE_TEXT_BUTTON}, //jira#6985 TEXT_STYLE_TEXT_NORMAL => TEXT_STYLE_TEXT_BUTTON
			statisticsButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD2_STATISTICS", style:TEXT_STYLE_TEXT_BUTTON},
			statisticsButton:{onTouchEnded:this.showStatistics.bind(this)},
			tcInfo:{visible:false},
			tcCooldown:{visible:false},
			tcBuy:{visible:false},
			npcFrog:{visible:npcText !== null, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:npcText !== null, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:npcText},
			tcAllLists:{onTouchEnded:this.selectTask.bind(this)},
			Panel_17:{onTouchEnded:this.selectTask.bind(this)},
		};
		
		// manually set child-list sizes
		var widget = FWPool.getNode(UI_GUILD2, false);
		var tcAvailableTaskList = FWUtils.getChildByName(widget, "tcAvailableTaskList");
		tcAvailableTaskList.setContentSize(590, Math.ceil(availableList.length / 3) * 210 + 5); // +5: jira#6985
		var tcPickedTaskList = FWUtils.getChildByName(widget, "tcPickedTaskList");
		tcPickedTaskList.setContentSize(590, Math.ceil(pickedList.length / 3) * 210);
		var tcHistoryTaskList = FWUtils.getChildByName(widget, "tcHistoryTaskList");
		tcHistoryTaskList.setContentSize(590, historyList.length * 100);
		var tcHistoryHeader = FWUtils.getChildByName(widget, "tcHistoryHeader");
		tcHistoryHeader.setContentSize(590, pickedList.length > 0 ? 60 : 70);
		var tcLine1n = FWUtils.getChildByName(widget, "tcLine1n");
		var tcLine2n = FWUtils.getChildByName(widget, "tcLine2n");
		tcLine1n.setScale(1.1, -1);
		tcLine2n.setScale(1.1, -1);
		tcLine1n.setVisible(pickedList.length > 0);
		tcPickedTaskList.setVisible(pickedList.length > 0);
		var tcSpace = FWUtils.getChildByName(widget, "tcSpace");
		tcSpace.setContentSize(590, 65);
		var tcAllLists = FWUtils.getChildByName(widget, "tcAllLists");
		tcAllLists.setScrollBarOpacity(0);
		tcAllLists.refreshView();
		
		// selected task info
		var uiDef3 = {};
		if(selectedTask)
		{
			if(selectedTask.status === GUILD_DERBY_TASK_COOLDOWN)
			{
				uiDef3 =
				{
					tcCooldown:{visible:true},
					tccTitle:{type:UITYPE_TEXT, value:"TXT_GUILD2_NEXT_TASK_COUNTDOWN", style:TEXT_STYLE_TEXT_HINT_BROWN, endTime:selectedTask.availableTime},
					tccSkipTimeText:{type:UITYPE_TEXT, value:"TXT_GUILD2_NEXT_TASK_SKIP_TIME", style:TEXT_STYLE_TEXT_NORMAL},
					tccSkipTimeButton:{onTouchEnded:this.skipTimeTask.bind(this)},
					tccSkipTimePrice:{type:UITYPE_TEXT, value:selectedTask.skipTimePrice, style:TEXT_STYLE_NUMBER},
					tccTimeleft:{type:UITYPE_TIME_BAR, startTime:selectedTask.availableTime - selectedTask.cooldownDuration, endTime:selectedTask.availableTime, countdown:true, useExisting:true, timeTextStyle:TEXT_STYLE_TEXT_NORMAL, onTick:this.updateTaskSkipTimePrice.bind(this)},
				};
			}
			else
			{
				var bg = "guild_v2/slot_task_01_big.png";
				if(selectedTask.status === GUILD_DERBY_TASK_PROCESS)
					bg = (selectedTask.pickedUserId === gv.mainUserData.userId ? "guild_v2/slot_task_02_big.png" : "guild_v2/slot_task_03_big.png");
				
				uiDef3 = 
				{
					tcInfo:{visible:true},
					tciBg:{type:UITYPE_IMAGE, value:bg},
					tciTitle:{type:UITYPE_TEXT, value:selectedTask.title, style:TEXT_STYLE_TEXT_TASK_TITLE_GUILD},
					tciDesc:{type:UITYPE_TEXT, value:selectedTask.desc, style:TEXT_STYLE_TEXT_HINT_BROWN},
					tciIcon:{type:UITYPE_IMAGE, value:selectedTask.actionIcon, scale:selectedTask.actionIconScale},
					tciBasket:{visible:selectedTask.basket === true},
					tciLevelLimit:{visible:selectedTask.status === GUILD_DERBY_TASK_WAIT && selectedTask.level > gv.mainUserData.getLevel()},
					tciPickButton:{onTouchEnded:this.confirmPickTask.bind(this), visible:selectedTask.status === GUILD_DERBY_TASK_WAIT && this.getUserPickedTask() === null && this.getUserTasksLeft() > 0},
					tciPickButtonText:{type:UITYPE_TEXT, value:"TXT_MINER_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
					tciDeleteButton:{onTouchEnded:this.confirmDeleteTask.bind(this), visible:(selectedTask.status === GUILD_DERBY_TASK_PROCESS && selectedTask.pickedUserId === gv.mainUserData.userId) || (selectedTask.status === GUILD_DERBY_TASK_WAIT && Guild.canPlayerTakeAction(GUILD_ACTION_EDIT_TASK))},
					tciAmount:{type:UITYPE_TEXT, value:(selectedTask.status === GUILD_DERBY_TASK_PROCESS ? (selectedTask.completedAmount + "/" + selectedTask.amount) : "x" + selectedTask.amount), style:TEXT_STYLE_NUMBER},
					tciScore:{type:UITYPE_TEXT, value:this.getDerbyDisplayScore(selectedTask.score), style:TEXT_STYLE_TEXT_NORMAL},
					tciDuration:{visible:selectedTask.status !== GUILD_DERBY_TASK_PROCESS && selectedTask.duration > 0},
					tcidText:{type:UITYPE_TEXT, value:FWUtils.secondsToTimeString(selectedTask.duration), style:TEXT_STYLE_TEXT_NORMAL},
					tciTimeleft:{type:UITYPE_TIME_BAR, startTime:selectedTask.startTime, endTime:selectedTask.startTime + selectedTask.duration, countdown:true, visible:selectedTask.status === GUILD_DERBY_TASK_PROCESS && selectedTask.duration > 0, useExisting:true, timeTextStyle:TEXT_STYLE_TEXT_NORMAL},
					tciBuyButtonText:{type:UITYPE_TEXT, value:g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_PRICE, style:TEXT_STYLE_TEXT_NORMAL},
					tciBuyButton:{onTouchEnded:this.confirmBuyMoreTasks.bind(this), visible:selectedTask.status === GUILD_DERBY_TASK_WAIT && this.getUserPickedTask() === null && this.getUserTasksLeft() <= 0 && this.getUserBoughtTasksCount() < g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_NUMBER}
				};
			}
		}
		/*else if(this.getUserTasksLeft() <= 0 && this.getUserPickedTask() === null)
		{
			if(this.getUserBoughtTasksCount() < g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_NUMBER)
			{
				uiDef3 =
				{
					tcBuy:{visible:true},
					tcbBuyText:{type:UITYPE_TEXT, value:"TXT_GUILD2_NO_MORE_TASKS", style:TEXT_STYLE_TEXT_NORMAL},
					tcbBuyButtonText:{type:UITYPE_TEXT, value:g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_PRICE, style:TEXT_STYLE_TEXT_NORMAL},//tcbBuyButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD2_BUY_MORE_TASK", style:TEXT_STYLE_TEXT_NORMAL},
					tcbBuyButton:{onTouchEnded:this.confirmBuyMoreTasks.bind(this)}
				};
			}
		}*/
		
		_.extend(uiDef, uiDef2, uiDef3);
	},
	
	selectTask:function(sender)
	{
		// allow selecting tasks to view/delete when there are no tasks left
		//if(this.getUserTasksLeft() <= 0 && this.getUserPickedTask() === null)
		//	return;
	
		if(sender.uiData && sender.uiData.status === GUILD_DERBY_TASK_WAIT && sender.uiData.level > gv.mainUserData.getLevel())
			FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_GUILD2_PICK_TASK_LEVEL"), sender.uiData.level), FWUtils.getWorldPosition(sender));
		
		var prevSelectedTaskId = this.selectedTaskId;
		this.selectedTaskId = (sender.uiData && sender.uiData.id !== null ? sender.uiData.id : null);
		if(prevSelectedTaskId !== this.selectedTaskId)
			this.showMainUi();

		//Game.gameScene.background.notifyTaskDerby.setVisible(true);
	},
	
	skipTimeTask:function(sender)
	{
		var task = this.getGuildTaskById(this.selectedTaskId);
		
		// server
		var price = Game.getSkipTimeDiamond("DERBYTASK", task.startTime - task.cooldownDuration, task.cooldownDuration).diamond;
		if(!Game.consumeDiamond(price, FWUtils.getWorldPosition(sender))){
			return;
		}

		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskSkipCooldown);
		pk.pack(task, price);
		network.connector.client.sendPacket(pk);
	},
	
	confirmPickTask:function(sender)
	{
		var task = this.getGuildTaskById(this.selectedTaskId);
		
		if(task.level > gv.mainUserData.getLevel())
		{
			FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_GUILD2_PICK_TASK_LEVEL"), task.level), FWUtils.getWorldPosition(sender));
			return;
		}

		Guild2.pickTask(task.id);
		//Game.showPopup({title:"TXT_GUILD2_PICK_TASK_CONFIRM", content:task.desc, icon:task.actionIcon, iconScale:task.actionIconScale, closeButton:true}, this.pickTask.bind(this, task.id));
		//this.showConfirm("TXT_GUILD2_PICK_TASK_CONFIRM", task.actionIcon, ["receiveButton"], ["TXT_MINER_RECEIVE"], function(sender) {Guild2.pickTask(task.id);});
	},
	
	pickTask:function(id)
	{
		var task = this.getGuildTaskById(id);
		if(task.status !== GUILD_DERBY_TASK_WAIT)
			return;
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskAccept);
		pk.pack(task);
		network.connector.client.sendPacket(pk);
	},
	
	confirmDeleteTask:function(sender)
	{
		var task = this.getGuildTaskById(this.selectedTaskId);

		var displayAmount = task.status === GUILD_DERBY_TASK_PROCESS ?task.completedAmount + "/" + task.amount : "x"+task.amount;
		//Game.showPopup({title:"TXT_GUILD2_DELETE_TASK_CONFIRM", content:task.desc, icon:task.actionIcon, iconScale:task.actionIconScale, closeButton:true}, this.deleteTask.bind(this, task.id));
		this.showConfirm(task.status === GUILD_DERBY_TASK_PROCESS ? "TXT_GUILD2_DELETE_TASK_CONFIRM" : "TXT_GUILD2_DELETE_TASK_CONFIRM_PRESIDENT", task.actionIcon, ["cancelButton", "noCancelButton"], [task.status === GUILD_DERBY_TASK_PROCESS ? "TXT_GUILD2_DELETE_TASK_RECEIVED_BUTTON" : "TXT_GUILD2_DELETE_TASK_BUTTON", "TXT_GUILD2_DONT_DELETE_TASK_BUTTON"], function(sender) {if(sender.getName() === "cancelButton") Guild2.deleteTask(task.id);},displayAmount);
	},
	
	deleteTask:function(id)
	{
		var task = this.getGuildTaskById(id);
		this.selectedTaskId = null;
		//Game.gameScene.background.notifyTaskDerby.setVisible(false);
		// server
		if(task.status === GUILD_DERBY_TASK_PROCESS)
		{
			// cancel
			var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskCancel);
			pk.pack(task);
			network.connector.client.sendPacket(pk);
		}
		else if(task.status === GUILD_DERBY_TASK_WAIT)
		{
			// remove
			var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskRemove);
			pk.pack(task);
			network.connector.client.sendPacket(pk);
		}
	},
	
	confirmBuyMoreTasks:function(sender)
	{
		var task = this.getGuildTaskById(this.selectedTaskId);
		if(task.level > gv.mainUserData.getLevel())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_PICK_TASK_LEVEL"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		this.showConfirm("TXT_GUILD2_BUY_TASK_CONFIRM", task.actionIcon, ["buyButton"], [g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_PRICE], this.buyMoreTasks.bind(this),"x"+task.amount);
	},
	
	buyMoreTasks:function(sender)
	{
		if(!Game.consumeDiamond(g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_PRICE, FWUtils.getWorldPosition(sender)))
			return;

		var task = this.getGuildTaskById(this.selectedTaskId);		

		// server
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskAccept);
		pk.pack(task, g_MISCINFO.DERBY_MEMBER_TASK_EXTRA_PRICE);
		network.connector.client.sendPacket(pk);
	},
	
	showStatistics:function()
	{
		var items = {};
		var itemList = [];
		var totalScore = 0;
		var totalDeleted = 0;
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			var task = this.guildTaskList[i];
			if (task.pickedUserLevel <=0) continue;
			if(task.pickedUserId)
			{
				var item = items[task.pickedUserId];
				if(!item)
				{
					item = {userId:task.pickedUserId, userName:task.pickedUserName, userLevel:task.pickedUserLevel, picked:0, score:0, deleted:0};
					items[task.pickedUserId] = item;
					itemList.push(item);
				}
				item.picked++;
				if(task.status === GUILD_DERBY_TASK_DONE)
				{
					item.score += task.score;
					totalScore += task.score;
				}
				else if(task.status === GUILD_DERBY_TASK_CANCEL)
				{
					item.deleted++;
					totalDeleted++;
				}
				item.displayScore = this.getDerbyDisplayScore(item.score);
				item.isMainUser = false;
				if(item.userId === gv.userData.userId){
					item.isMainUser = true;
				}

			}
		}

		itemList.sort(function (a, b) { // sort decrease by score
			return b.score - a.score;
		});

		var itemDef =
		{
			name:{type:UITYPE_TEXT, field:"userName", style:TEXT_STYLE_TEXT_NORMAL},
			level:{type:UITYPE_TEXT, field:"userLevel", style:TEXT_STYLE_NUMBER},
			picked:{type:UITYPE_TEXT, field:"picked", style:TEXT_STYLE_NUMBER},
			finished:{type:UITYPE_TEXT, field:"displayScore", style:TEXT_STYLE_NUMBER},
			deleted:{type:UITYPE_TEXT, field:"deleted", style:TEXT_STYLE_NUMBER},
			bg:{visible:"!data.isMainUser"},
			bg_me:{visible:"data.isMainUser"},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_GUILD2_STATISTICS", style:TEXT_STYLE_TITLE_1},
			closeButton:{onTouchEnded:this.hideStatistics.bind(this)},
			totalScore:{type:UITYPE_TEXT, value:this.getDerbyDisplayScore(totalScore), style:TEXT_STYLE_NUMBER},
			totalDeleted:{type:UITYPE_TEXT, value:totalDeleted, style:TEXT_STYLE_NUMBER},
			itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_GUILD2_STATISTICS_ITEM, itemDef:itemDef, itemSize:cc.size(660, 100)},
			scoreIcon:{onTouchBegan:this.showScoreHintStatistics.bind(this), onTouchEnded:this.hideScoreHintStatistics.bind(this), forceTouchEnd:true},
			scoreBg:{onTouchBegan:this.showScoreHintStatistics.bind(this), onTouchEnded:this.hideScoreHintStatistics.bind(this), forceTouchEnd:true},
			guildIcon:{type:UITYPE_IMAGE, value:Guild.guildAvatar, scale:0.3, onTouchBegan:this.showScoreHintStatistics.bind(this), onTouchEnded:this.hideScoreHintStatistics.bind(this), forceTouchEnd:true},
			sDeletedIcon:{onTouchBegan:this.showScoreHintStatistics.bind(this), onTouchEnded:this.hideScoreHintStatistics.bind(this), forceTouchEnd:true},
			sDeletedBg:{onTouchBegan:this.showScoreHintStatistics.bind(this), onTouchEnded:this.hideScoreHintStatistics.bind(this), forceTouchEnd:true},
		};
		
		var widget = FWPool.getNode(UI_GUILD2_STATISTICS, false);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		AudioManager.effect(EFFECT_POPUP_SHOW);

		if(!this.hintGuildStatistics)
		{
			this.hintGuildStatistics = FWUI.getChildByName(widget,"hintGuildStatistics");
		}
	},
	
	hideStatistics:function()
	{
		FWUI.hide(UI_GUILD2_STATISTICS, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
	},
	
	updateTaskSkipTimePrice:function(widget, remainTime)
	{
		if(!this.tccSkipTimePrice)
		{
			var uiGuild2 = FWPool.getNode(UI_GUILD2, false);
			this.tccSkipTimePrice = FWUI.getChildByName(uiGuild2, "tccSkipTimePrice");
		}
		
		if(!this.selectedTask)
			return;

		var price = Game.getSkipTimeDiamond("DERBYTASK", this.selectedTask.startTime - this.selectedTask.cooldownDuration, this.selectedTask.cooldownDuration).diamond;
		this.tccSkipTimePrice.setString(price);
	},
	getTaskDoing:function(){
		if(!Guild.isPlayerInGuild()) return null;
		if(this.getDerbyEndTime() < Game.getGameTimeInSeconds()) return null;
		if(!this.guildTaskList)	 return null;
		else{
			var taskDoing =[];
			for(var i=0;i<this.guildTaskList.length;i++){
				var task = this.guildTaskList[i];
				if(task.status === GUILD_DERBY_TASK_PROCESS && task.pickedUserId === gv.mainUserData.userId && task.startTime + task.duration > Game.getGameTimeInSeconds())
					taskDoing.push(task);
			}
			return taskDoing;
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// task checking //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	onAction:function(action, item, count)
	{
		cc.log("Guild2::onAction: action=" + action + " item=" + item + " count=" + count);
		
		var task = this.getUserPickedTask();
		if(!task)
			return;
		
		if(task.action === action && (!task.item || task.item === item))
			this.updateTaskStatus(task, task.completedAmount + count);
	},
	
	updateTaskStatus:function(task, completed)
	{
		cc.log("Guild2::updateTaskStatus: task.id=" + task.id + " completed=" + completed);
		
		task.completedAmount = completed;
		if(task.completedAmount >= task.amount)
			task.status = GUILD_DERBY_TASK_DONE;

		this.taskToSave = task;
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveTask);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveTask, 0, 0, 1.5, false);
	},
	
	saveTask:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskUpdateProcess);
		pk.pack(this.taskToSave.id, this.taskToSave.completedAmount);
		network.connector.client.sendPacket(pk);
	},
	
	updateStockTasks:function()
	{
		var task = this.getUserPickedTask();
		if(!task)
			return;
		
		if(task.action === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE)
		{
			var count = Game.getComboPotsCount(task.item);
			if(count > task.completedAmount)
				this.updateTaskStatus(task, count);
		}
		else if(task.action === g_ACTIONS.ACTION_CHECK_DECOR.VALUE)
		{
			var totalDecorsCount = Game.getAllDecorsCount();
			if(totalDecorsCount > task.completedAmount)
				this.updateTaskStatus(task, totalDecorsCount);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// derby //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	derbyNodes: [],
	derbyRanks: [],
	derbyScoreBg: [],
	derbyFrog: [],
	derbyMilestones: [],
	uiDerby: null,
	showDerby:function(uiDef)
	{
		// npc text
		uiDef.panelDerby = {visible:true};
		uiDef.npcFrog = {visible:true};
		uiDef.npcText = {visible:true, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_GUILD2_DERBY_INTRO"};
		
		uiDef.curtain_open = {visible:true};
		uiDef.curtain_close = {visible:false};
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyGetGroup);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},

	showDerby2:function(svrData)
	{
		this.cleanupDerby();
		
		this.uiDerby = FWPool.getNode(UI_GUILD2_DERBY, false);
		var uiGuild2 = FWPool.getNode(UI_GUILD2, false);
		var panelDerby = FWUtils.getChildByName(uiGuild2, "panelDerby");
		var scrollView = FWUtils.getChildByName(this.uiDerby, "scrollView");
		var scrollView2 = FWUtils.getChildByName(this.uiDerby, "scrollView2");
		this.derbyScrollView = scrollView;
		this.derbyScrollView2 = scrollView2;
		panelDerby.addChild(this.uiDerby);
		
		// derby ranking data
		var groupItems = svrData[GUILD_DERBY_GROUP_ITEMS];
		var derbyData = [];
		if(groupItems.length > 0)
		{
			for(var i=0; i<groupItems.length; i++)
			{
				var item = groupItems[i];
				derbyData.push({guildId:item[GUILD_DERBY_RECORD_ID], score:(item[GUILD_DERBY_RECORD_ID] === Guild.getGuildId() ? Guild2.getGuildScore() : item[GUILD_DERBY_RECORD_POINT]), icon:item[GUILD_DERBY_RECORD_AVATAR]});
			}
		}
		else
		{
			derbyData.push({guildId:Guild.getGuildId(), score:Guild2.getGuildScore(), icon:Guild.getGuildAvatar()});
		}
		//// fake derby ranking data
		//var derbyData =
		//[
		//	{guildId:1, score:700, icon:GUILD_AVATARS[0]},
		//	{guildId:2, score:120000, icon:GUILD_AVATARS[1]},
		//	{guildId:3, score:1200, icon:GUILD_AVATARS[2]},
		//	{guildId:4, score:1500, icon:GUILD_AVATARS[3]},
		//	{guildId:5, score:2000, icon:GUILD_AVATARS[4]},
		//	{guildId:6, score:4000, icon:GUILD_AVATARS[5]},
		//];
		//derbyData.push({guildId:Guild.getGuildId(), score:Guild2.getGuildScore(), icon:Guild.getGuildAvatar()});
		//// end fake derby ranking data

		derbyData = _.sortByDecent(derbyData, function (val)
		{
			return val.score;
		});
		
		// milestones
		var addMilestone = function(parent, value, x, submilestoneIdx)
		{
			if(submilestoneIdx === undefined)
				submilestoneIdx = -1;
			
			var milestoneUiDef =
			{
				leaf:{visible:submilestoneIdx >= 0, type:UITYPE_SPINE, id:SPINE_NPC_FROG_DERBY, anim:"anim_beo", scale:(submilestoneIdx === 0 ? 0.225 : cc.p(-0.175, 0.175))},
				stone:{visible:submilestoneIdx < 0},
				score:{visible:submilestoneIdx < 0, type:UITYPE_TEXT, value:value, style:TEXT_STYLE_NUMBER},
			}
			var uiGuild2DerbyMilestone = FWPool.getNode(UI_GUILD2_DERBY_MILESTONE);
			parent.addChild(uiGuild2DerbyMilestone);
			FWUI.fillData(uiGuild2DerbyMilestone, null, milestoneUiDef);
			uiGuild2DerbyMilestone.setPosition(x, GUILD2_DERBY_MILESTONES_Y);
			uiGuild2DerbyMilestone.milestone = value;
			uiGuild2DerbyMilestone.submilestoneIdx = submilestoneIdx;
			Guild2.derbyMilestones.push(uiGuild2DerbyMilestone);
		};
		
		var x = GUILD2_DERBY_MILESTONES_X;
		addMilestone(scrollView, 0, x, 0);

		var maxScore = -1;
		for(var j=0; j<derbyData.length; j++){
			if(derbyData[j].score >maxScore) maxScore = derbyData[j].score;
		}
		maxScore /= g_MISCINFO.DERBY_POINT_RATIO;
		var numMileStone = 0;
		var prev = 0;
		for(var key in g_GUILD_DERBY.MILESTONE)
		{
			var crt = Number(this.getDerbyDisplayScore(key));
			for(var i=0; i<GUILD2_DERBY_MILESTONES_STEPS_COUNT; i++)
			{
				x += GUILD2_DERBY_MILESTONES_SPACE;
				addMilestone(scrollView, Math.floor(prev + (i + 1) * (crt - prev) / GUILD2_DERBY_MILESTONES_STEPS_COUNT), x, i === GUILD2_DERBY_MILESTONES_STEPS_COUNT - 1 ? -1 : i);
			}
			prev = crt;
			numMileStone++;
			if(maxScore < crt && numMileStone >= GUILD2_DERBY_NUM_MILESTONE_SHOW) break;
		}
		
		x += 225;
		scrollView.setInnerContainerSize(cc.size(x, scrollView.getContentSize().height));
		scrollView2.setInnerContainerSize(cc.size(x, (derbyData.length - 1) * GUILD2_DERBY_TRACK_HEIGHT));
		scrollView.setScrollBarEnabled(false);
		scrollView2.setScrollBarEnabled(false);
		
		// tracks
		var posY = (derbyData.length - 2) * GUILD2_DERBY_TRACK_HEIGHT;
		for(var i=0; i<derbyData.length; i++)
		{
			var data = derbyData[i];
			data.score = this.getDerbyDisplayScore(data.score);
			var isPlayerGuild = (data.guildId === Guild.getGuildId());
			
			// track
			var trackUi = FWPool.getNode(UI_GUILD2_DERBY_MILESTONE_FROG);
			this.derbyNodes.push(trackUi);
			if(isPlayerGuild)
			{
				trackUi.setPosition(0, 0);
				scrollView.addChild(trackUi);
				trackUi.scrollView = scrollView;
			}
			else
			{
				trackUi.setPosition(0, posY);
				scrollView2.addChild(trackUi);
				trackUi.scrollView = scrollView2;
				posY -= GUILD2_DERBY_TRACK_HEIGHT;
			}
			var trackDef =
			{
				light:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:1, visible:isPlayerGuild},
				frog:{type:UITYPE_SPINE, id:SPINE_NPC_FROG_DERBY, anim:(isPlayerGuild ? "jump" : "normal"), scale:cc.p(-0.225, 0.225), loop:!isPlayerGuild},
				gScore:{type:UITYPE_TEXT, value:data.score, style:TEXT_STYLE_TEXT_NORMAL_GREEN},
				gRankIcon:{type:UITYPE_IMAGE, value:data.icon, scale:0.5},
				gRank:{type:UITYPE_TEXT, value:(i + 1), style:TEXT_STYLE_NUMBER},
				track:{visible:!isPlayerGuild},
				bg1:{visible:(i % 2) === 0},
				bg2:{visible:(i % 2) !== 0},
				fg1:{visible:(i % 2) === 0},
				fg2:{visible:(i % 2) !== 0},
			};
			FWUI.fillData(trackUi, null, trackDef);
			
			// frog
			var frog = FWUtils.getChildByName(trackUi, "frog");
			var frogPosX = 0;
			var frogPosY = GUILD2_DERBY_FROG_Y;
			for(var j=0; j<this.derbyMilestones.length - 1; j++)
			{
				var node = this.derbyMilestones[j];
				var nextNode = this.derbyMilestones[j + 1];
				if(data.score > nextNode.milestone)
				{
					if(j == this.derbyMilestones.length -2){
						frogPosX = nextNode.getPositionX();
						if(isPlayerGuild)
						{
							frogPosY = nextNode.getPositionY() + (nextNode.submilestoneIdx < 0 ? 45 : 0);
						}
					}
					else
					{
						continue;
					}
				}
				else{
					if(isPlayerGuild)
					{
						// player guild's frog
						if(data.score >= node.milestone)
						{
							frogPosX = node.getPositionX();
							frogPosY = node.getPositionY() + (node.submilestoneIdx < 0 ? 45 : 0);
						}
						else
							break;
					}
					else
					{
						// other guild's frog
						if(data.score === node.milestone)
							frogPosX = node.getPositionX();
						else if(data.score === nextNode.milestone)
							frogPosX = nextNode.getPositionX();
						else
							frogPosX = cc.lerp(node.getPositionX(), nextNode.getPositionX(), (data.score - node.milestone) / (nextNode.milestone - node.milestone));
						break;
					}
				}
			}
			frog.setPosition(frogPosX, frogPosY);
			
			// rank
			var rank = FWUtils.getChildByName(trackUi, "rank");
			this.derbyRanks.push(rank);
			this.derbyFrog.push(frog);
			var gScoreBg = FWUtils.getChildByName(trackUi, "gScoreBg");
			this.derbyScoreBg.push(gScoreBg);
		}
		
		// scroll linking
		var uiDerbyDef =
		{
			scrollView:{onTouchBegan:this.onDerbyScrollViewTouched.bind(this)},
			scrollView2:{onTouchBegan:this.onDerbyScrollViewTouched.bind(this)},
		}
		FWUI.fillData(this.uiDerby, null, uiDerbyDef);
	},
	
	cleanupDerby:function()
	{
		if(!this.uiDerby)
			return;
		
		for(var i=0; i<this.derbyMilestones.length; i++)
		{
			var node = this.derbyMilestones[i];
			FWUI.unfillData(node)
			FWPool.returnNode(node);
		}
		
		for(var i=0; i<this.derbyNodes.length; i++)
		{
			var node = this.derbyNodes[i];
			if(node.isWidget)
				FWUI.unfillData(node)
			FWPool.returnNode(node);
		}
		
		FWUI.unfillData(this.uiDerby);
		FWPool.returnNode(this.uiDerby);
		this.uiDerby = null;
		this.derbyNodes = [];
		this.derbyMilestones = [];
		this.derbyRanks = [];
		this.derbyScoreBg = [];
		this.derbyFrog = [];
	},
	
	onDerbyScrollViewTouched:function(sender)
	{
		this.crtDerbyScrollView = sender;
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// league /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showLeague:function(uiDef)
	{
		var leagueInfo = this.getGuildLeagueInfo();
		var uiDef2 =
		{
			panelLeague:{visible:true},
			curtain_open:{visible:false},
			curtain_close:{visible:true},
			npcFrog:{visible:true, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:true, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:cc.formatStr(FWLocalization.text("TXT_GUILD2_LEAGUE_NPC"), leagueInfo.name)},
			
			lLight:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon"},
			lBoard:{onTouchEnded:this.showLeagueInfo.bind(this)},
			lBoard2:{onTouchEnded:this.showLeagueInfo.bind(this)},
			lFlag:{type:UITYPE_IMAGE, value:leagueInfo.flag},
			lTitle:{type:UITYPE_TEXT, value:leagueInfo.name, style:TEXT_STYLE_TEXT_NORMAL},
			lFrog:{type:UITYPE_SPINE, id:SPINE_NPC_FROG_RANK_LEVEL, anim:leagueInfo.frogAnim, scale:cc.p(-0.25, 0.25)},
		};
		
		var widget = FWPool.getNode(UI_GUILD2, false);
		var lFrog = FWUtils.getChildByName(widget, "lFrog");
		var lFlag = FWUtils.getChildByName(widget, "lFlag" + leagueInfo.id);
		lFrog.setPosition(lFlag.getPosition());
		
		_.extend(uiDef, uiDef2);
	},
	
	showLeagueInfo:function()
	{
		var data = [];
		for(var key in g_GUILD_DERBY.LEAGUES)
		{
			var info = g_GUILD_DERBY.LEAGUES[key];
			var info2 = this.getGuildLeagueInfo(key);
			var item = {medal:info2.medal, name:info2.name, tasksCount:cc.formatStr(FWLocalization.text("TXT_GUILD2_LEAGUE_INFO_TASKS_COUNT"), info.MEMBER_TASK_LIMIT), rewardsCount:cc.formatStr(FWLocalization.text("TXT_GUILD2_LEAGUE_INFO_REWARDS_COUNT"), info.REWARDS_MILESTONE)};
			data.push(item);
		}
		var itemDef =
		{
			icon:{type:UITYPE_IMAGE, field:"medal"},
			name:{type:UITYPE_TEXT, field:"name", style:TEXT_STYLE_TEXT_NORMAL},
			desc1:{type:UITYPE_TEXT, field:"tasksCount", style:TEXT_STYLE_TEXT_HINT_BROWN},
			desc2:{type:UITYPE_TEXT, field:"rewardsCount", style:TEXT_STYLE_TEXT_HINT_BROWN},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_GUILD2_LEAGUE_INFO_TITLE", style:TEXT_STYLE_TITLE_1},
			closeButton:{onTouchEnded:this.hideLeagueInfo.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:data, itemUI:UI_GUILD2_LEAGUE_ITEM, itemDef:itemDef, itemSize:cc.size(760, 95)},
		};
		
		var widget = FWUI.showWithData(UI_GUILD2_LEAGUE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		AudioManager.effect(EFFECT_POPUP_SHOW);
		
		if(!this.handleBackKeyFuncLeagueInfo)
			this.handleBackKeyFuncLeagueInfo = function() {Guild2.hideLeagueInfo();};
		Game.gameScene.registerBackKey(this.handleBackKeyFuncLeagueInfo);
	},
	
	hideLeagueInfo:function()
	{
		FWUI.hide(UI_GUILD2_LEAGUE, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.handleBackKeyFuncLeagueInfo);
	},
	
	getGuildLeagueInfo:function(leagueId)
	{
		if(!leagueId)
			leagueId = this.leagueId;
		var id = leagueId.substr(1);
		var res =
		{
			id:id,
			flag:"guild_v2/hud_flag_derby_board_" + id + ".png",
			medal:"guild_v2/icon_medal_guild_0" + id + ".png",
			hudMedal:"guild_v2/hud_medal_" + id + ".png",
			name:FWLocalization.text("TXT_GUILD_LEAGUE_L" + id + "_NAME"),
			frogAnim:"normal_lv_0" + id,
		};
		return res;
	},
	
	isEnoughLeagueLevel:function(guildLeague, testLeague)
	{
		return (guildLeague >= testLeague);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// ranking ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showRanking:function(uiDef)
	{
		var playerGuildId = Guild.getGuildId();
		var items =
		[
			{rank:1, icon:GUILD_AVATARS[0], name:"Guild 1", score:3000, id:1},
			{rank:2, icon:GUILD_AVATARS[1], name:"Guild 2", score:2900, id:2},
			{rank:3, icon:GUILD_AVATARS[2], name:"Guild 3", score:2800, id:3},
			{rank:4, icon:GUILD_AVATARS[3], name:"Guild 4", score:2700, id:4},
			{rank:5, icon:GUILD_AVATARS[4], name:"Guild 5", score:2600, id:5},
			{rank:6, icon:GUILD_AVATARS[5], name:"Guild 6", score:2500, id:6},
			{rank:7, icon:GUILD_AVATARS[6], name:"Guild 7", score:2400, id:7},
			{rank:8, icon:GUILD_AVATARS[7], name:"Guild 8", score:2300, id:playerGuildId},
			{rank:9, icon:GUILD_AVATARS[0], name:"Guild 9", score:2200, id:9},
			{rank:10, icon:GUILD_AVATARS[1], name:"Guild 10", score:2100, id:10},
			{rank:11, icon:GUILD_AVATARS[2], name:"Guild 11", score:2000, id:11},
			{rank:12, icon:GUILD_AVATARS[3], name:"Guild 12", score:1900, id:12},
		];
		var playerItem = null;
		for(var i=0; i<items.length; i++)
		{
			if(items[i].id === playerGuildId)
			{
				playerItem = items[i];
				playerItem.isSelected = true;
			}
		}
		
		var itemDef =
		{
			bg:{visible:"data.isSelected !== true"},
			bg_selected:{visible:"data.isSelected === true"},
			rank:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, field:"rank"},
			name:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, field:"name"},
			icon:{type:UITYPE_IMAGE, field:"icon", scale:0.45},
			score:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, field:"score"},
		};
		
		var uiDef2 =
		{
			panelRanking:{visible:true},
			curtain_open:{visible:false},
			curtain_close:{visible:true},
			npcFrog:{visible:true, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:true, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_GUILD2_RANKING_NPC"},
			rItems:{type:UITYPE_2D_LIST, items:items, itemUI:UI_GUILD2_RANKING_ITEM, itemDef:itemDef, itemSize:cc.size(710, 90)},
			rUserItem:{type:UITYPE_2D_LIST, items:[playerItem], itemUI:UI_GUILD2_RANKING_ITEM, itemDef:itemDef, itemSize:cc.size(710, 90)},
		};
		
		_.extend(uiDef, uiDef2);
	},

///////////////////////////////////////////////////////////////////////////////////////
// rewards ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	selectedRewardIds: [],
	generatedRewards: null, // serverside generated rewards
	rewardEndTime: 0,
	hasRewardClaimed: false,
	
	getMilestoneReward:function(milestone)
	{
		if(!this.generatedRewards)
			return null;

		milestone = g_GUILD_DERBY.MILESTONE[milestone].ID;
		for(var i=0; i<this.generatedRewards.length; i++)
		{
			if(this.generatedRewards[i][DERBY_REWARD_MILESTONE_ID] === milestone)
				return this.generatedRewards[i];
		}
		
		return null;
	},
	
	loadRewards:function(svrData)
	{
		if(!svrData)
		{
			this.generatedRewards = null;
			this.rewardEndTime = 0;
			this.hasRewardClaimed = false;
			this.selectedRewardIds = [];
			return;
		}
		
		this.generatedRewards = svrData[DERBY_REWARD_ITEMS];
		this.rewardEndTime = svrData[DERBY_REWARD_TIME_END];
		this.hasRewardClaimed = svrData[DERBY_REWARD_CLAIM];
		
		this.selectedRewardIds = [];
		for(var i=0; i<this.generatedRewards.length; i++)
		{
			if(this.generatedRewards[i][DERBY_REWARD_MILESTONE_CHOOSE] >= 0)
				this.selectedRewardIds.push(this.generatedRewards[i][DERBY_REWARD_MILESTONE_CHOOSE]);
		}
	},

	showRewards:function(uiDef)
	{
		var guildScore = this.getGuildScore();
		var hasPlayerFinishedATask = (this.getUserFinishedTasksCount() > 0);
		var hasDerbyFinished = this.hasDerbyFinished();
		var rewardMilestonesCount = 0;
		// reward milestones
		var milestones = [];
		for(var key in g_GUILD_DERBY.MILESTONE)
		{
			var srcData = g_GUILD_DERBY.MILESTONE[key];
			var ms = {milestone:key, displayScore: this.getDerbyDisplayScore(key)};

			// league level
			ms.league = null;
			for(var key2 in g_GUILD_DERBY.LEAGUES)
			{
				if(srcData.ID < g_GUILD_DERBY.LEAGUES[key2].REWARDS_MILESTONE)
				{
					ms.league = key2;
					break;
				}
			}
			var leagueInfo = this.getGuildLeagueInfo(ms.league);
			ms.isEnoughLeagueLevel = this.isEnoughLeagueLevel(this.leagueId, ms.league);
			ms.leagueFlag = leagueInfo.hudMedal;
			ms.leagueName = leagueInfo.name;
			
			// rewards
			var milestoneReward = this.getMilestoneReward(key);
			if(milestoneReward !== null && guildScore >= key)
			{
				ms.isUnlocked = true;
				if(ms.isEnoughLeagueLevel)
					rewardMilestonesCount++;
			}
			else
				ms.isUnlocked = false;

			ms.rewards = [];
			for(var i=0; i<3; i++)
			{
				var reward = FWUtils.getItemsArray(milestoneReward ? milestoneReward[DERBY_REWARD_MILESTONE_SLOT_ITEM][i] : srcData.REWARDS[i].REWARDS)[0];
				reward.ID = (milestoneReward ? milestoneReward[DERBY_REWARD_MILESTONE_SLOT_ID][i] : srcData.REWARDS[i].ID);
				reward.isUnlocked = ms.isUnlocked;
				reward.isSelected = (this.selectedRewardIds.indexOf(reward.ID) >= 0);
				reward.hasPlayerFinishedATask = hasPlayerFinishedATask;
				reward.milestone = key;
				ms.rewards.push(reward);
			}
			milestones.push(ms);
		}

		// npc text
		var npcText = null;
		if(hasDerbyFinished)
		{
			if(rewardMilestonesCount > 0)
			{
				if(hasPlayerFinishedATask)
					npcText = cc.formatStr(FWLocalization.text("TXT_GUILD2_REWARD_RECEIVE_NPC"), rewardMilestonesCount);
				else
					npcText = "TXT_GUILD2_REWARD_NO_TASK";	
			}
			else
				npcText = "TXT_GUILD2_REWARD_NO_REWARD";
		}
		else
		{
			var missingScore = 0;
			for(var key in g_GUILD_DERBY.MILESTONE)
			{
				missingScore = key - guildScore;
				break;
			}
			if(missingScore > 0)
				npcText = cc.formatStr(FWLocalization.text("TXT_GUILD2_REWARD_NO_MILESTONE"), this.getDerbyDisplayScore(missingScore));
			else
				npcText = "TXT_GUILD2_REWARD_NO_TASK";
		}
		this.rewardMilestonesCount = rewardMilestonesCount;
		cc.log("Guild2::showRewards: canReceiveRewards: rewardMilestonesCount=" + rewardMilestonesCount + " hasDerbyFinished=" + hasDerbyFinished + " hasPlayerFinishedATask=" + hasPlayerFinishedATask + " hasRewardClaimed=" + this.hasRewardClaimed + " rewardEndTime=" + this.rewardEndTime + " gameTime=" + Game.getGameTimeInSeconds());
		var canReceiveRewards = (rewardMilestonesCount > 0 && hasDerbyFinished && hasPlayerFinishedATask && !this.hasRewardClaimed && this.rewardEndTime > Game.getGameTimeInSeconds());
		var subItemDef =
		{
			bgDisabled:{visible:"!data.isUnlocked"},
			bgNormal:{visible:"data.isUnlocked && !data.isSelected"},
			bgHili:{visible:"data.isUnlocked && data.isSelected"},
			gfx:{visible:"data.isUnlocked", type:UITYPE_ITEM, field:"itemId"},
			amount:{visible:"data.isUnlocked", type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, useK:true},
			msReward:{onTouchEnded:this.selectReward.bind(this)},
		};
		
		var itemDef =
		{
			score:{type:UITYPE_TEXT, field:"displayScore", style:TEXT_STYLE_NUMBER},
			bgDisabled:{visible:"!data.isUnlocked && data.isEnoughLeagueLevel"},//bgDisabled:{visible:"!data.isUnlocked"},
			bgEnabled:{visible:"data.isUnlocked && data.isEnoughLeagueLevel"},//bgEnabled:{visible:"data.isUnlocked && data.isEnoughLeagueLevel"},
			bgRequire:{visible:"!data.isEnoughLeagueLevel"},//bgRequire:{visible:"data.isUnlocked && !data.isEnoughLeagueLevel"},
			rqFlag:{type:UITYPE_IMAGE, field:"leagueFlag", scale:0.85},
			rqText:{type:UITYPE_TEXT, value:"TXT_GUILD2_REWARD_LEAGUE_REQUIRE", style:TEXT_STYLE_TEXT_NORMAL},
			rqName:{type:UITYPE_TEXT, field:"leagueName", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			items:{visible:"data.isEnoughLeagueLevel", type:UITYPE_2D_LIST, field:"rewards", itemUI:UI_GUILD2_REWARD_SUBITEM, itemDef:subItemDef, itemSize:cc.size(105, 105)},//items:{visible:"data.isEnoughLeagueLevel || !data.isUnlocked", type:UITYPE_2D_LIST, field:"rewards", itemUI:UI_GUILD2_REWARD_SUBITEM, itemDef:subItemDef, itemSize:cc.size(105, 105)},
			msScoreBg:{visible:"data.isEnoughLeagueLevel"},
			msScoreBg2:{visible:"!data.isEnoughLeagueLevel"},
		};
		
		var uiDef2 =
		{
			panelReward:{visible:true},
			curtain_open:{visible:true},
			curtain_close:{visible:false},
			npcFrog:{visible:npcText !== null, type:UITYPE_SPINE, value:SPINE_NPC_FROG_GUILD, anim:"animation", scale:cc.p(-0.25, 0.25)},
			npcText:{visible:npcText !== null, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:npcText},
			rwReceiveText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_GUILD2_REWARD_RECEIVE"},
			rwRefreshText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_GUILD2_REWARD_REFRESH", visible:canReceiveRewards},
			rwRefreshPrice:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:g_MISCINFO.DERBY_MEMBER_REWARD_CHANGE_PRICE},
			rwRefreshButton:{onTouchEnded:this.refreshRewards.bind(this), visible:canReceiveRewards},
			rwReceiveButton:{onTouchEnded:this.receiveRewards.bind(this), visible:canReceiveRewards},
			rwItems:{type:UITYPE_2D_LIST, items:milestones, itemUI:UI_GUILD2_REWARD_ITEM, itemDef:itemDef, itemSize:cc.size(160, 445), singleLine:true,innerContainerWAdd:130},
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	refreshRewards:function(sender)
	{
		var pos = FWUtils.getWorldPosition(sender);
		if(!this.hasDerbyFinished())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_WAIT_END_DERBY"), pos);
			return;
		}
		
		if(this.rewardEndTime !== null && this.rewardEndTime <= Game.getGameTimeInSeconds())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_END_TIME"), pos);
			return;
		}
		
		// server
		if(!Game.consumeDiamond(g_MISCINFO.DERBY_MEMBER_REWARD_CHANGE_PRICE, FWUtils.getWorldPosition(sender)))
			return;
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyRewardChange);
		pk.pack(this.selectedRewardIds);
		network.connector.client.sendPacket(pk);
	},
	
	receiveRewards:function(sender)
	{
		var pos = FWUtils.getWorldPosition(sender);
		if(!this.hasDerbyFinished())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_WAIT_END_DERBY"), pos);
			return;
		}
		
		if(this.rewardEndTime !== null && this.rewardEndTime <= Game.getGameTimeInSeconds())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_END_TIME"), pos);
			return;
		}

		if(this.rewardMilestonesCount && this.rewardMilestonesCount > this.selectedRewardIds.length)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_RECEIVE_NOT_ENOUGH"), pos);
			return;
		}
		// server
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyRewardClaim);
		pk.pack(this.selectedRewardIds);
		network.connector.client.sendPacket(pk);
	},
	
	onRewardClaimSuccess:function(data)
	{
		// fx: fly to mailbox
		var uiGuild2 = FWPool.getNode(UI_GUILD2, false);
		var rwItems = FWUtils.getChildByName(uiGuild2, "rwItems");
		var children = rwItems.getChildren();
		var delay = 0;
		for(var i=0; i<children.length; i++)
		{
			var children2 = FWUtils.getChildByName(children[i], "items").getChildren();
			for(var j=0; j<children2.length; j++)
			{
				var uiData = children2[j].uiData;
				if(uiData.isSelected)
				{
					var reward = {};
					reward[uiData.itemId] = uiData.amount;
					reward = FWUtils.getItemsArray(reward)[0];
					FWUtils.showFlyingItemIcon(reward.itemId, reward.amount, FWUtils.getWorldPosition(children2[j]), Game.gameScene.uiMainBtnMail, delay, false);
					delay += 0.15;
				}
			}
		}

		if(data)
			Game.updateUserDataFromServer(data);
		Guild2.hasRewardClaimed = true;//Guild2.loadRewards(object[KEY_DATA]);
		Guild2.setState(GUILD2_STATE_REWARDS);				
	},
	
	selectReward:function(sender)
	{
		var data = sender.uiData;
		
		if(!data.isUnlocked || !data.hasPlayerFinishedATask)
			return;
		
		if(!this.hasDerbyFinished())
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD2_REWARD_WAIT_END_DERBY"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		var idx = this.selectedRewardIds.indexOf(data.ID);
		if(idx >= 0)
		{
			// deselect current reward 
			//this.selectedRewardIds.splice(idx, 1);
		}
		else
		{
			// deselect other rewards of the same milestone
			var groupRewards = g_GUILD_DERBY.MILESTONE[data.milestone].REWARDS;
			for(var i=0; i<groupRewards.length; i++)
			{
				idx = this.selectedRewardIds.indexOf(groupRewards[i].ID);
				if(idx >= 0)
					this.selectedRewardIds.splice(idx, 1);
			}
			this.selectedRewardIds.push(data.ID);
		}
		
		this.selectedRewardIds.sort(function(a, b) {return a - b});
		this.showMainUi();
		
		// server
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveRewardSelection);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveRewardSelection, 0, 0, 1.5, false);
	},
	
	saveRewardSelection:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyRewardChoose);
		pk.pack(this.selectedRewardIds);
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server wrapper /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	getDerbyStartTime:function()
	{
		//cc.log("Guild2::getDerbyStartTime: GUILD_DERBY_TIME_START=" + this.svrData[GUILD_DERBY_TIME_START] + " currentTime=" + Game.getGameTimeInSeconds());
		return this.svrData[GUILD_DERBY_TIME_START];
	},
	
	getDerbyEndTime:function()
	{
		//cc.log("Guild2::getDerbyEndTime: GUILD_DERBY_TIME_END=" + this.svrData[GUILD_DERBY_TIME_END] + " currentTime=" + Game.getGameTimeInSeconds());
		if (this.svrData)
			return this.svrData[GUILD_DERBY_TIME_END];
		return 0;
	},
	
	getNextDerbyStartTime:function()
	{


		if(this.nextDerbyStartTime)
		{
			cc.log("Guild2::getNextDerbyStartTime: nextDerbyStartTime=" + this.nextDerbyStartTime + " currentTime=" + Game.getGameTimeInSeconds());
			return this.nextDerbyStartTime;
		}
		else
		{
			var nextDerbyStartTime = this.getDerbyStartTime();
			while(nextDerbyStartTime < Game.getGameTimeInSeconds())
				nextDerbyStartTime += (7 * 86400); // next week
			cc.log("Guild2::getNextDerbyStartTime 2: nextDerbyStartTime=" + nextDerbyStartTime + " currentTime=" + Game.getGameTimeInSeconds());
			return nextDerbyStartTime;
		}

	},
	setNextTimeDerby:function(time)
	{
		this.nextDerbyStartTime = time;
	},
	hasDerbyStarted:function()
	{
		var res = (Game.getGameTimeInSeconds() >= this.getDerbyStartTime());
		cc.log("Guild2::hasDerbyStarted: " + res);
		return res;
	},
	
	hasDerbyFinished:function()
	{
		var res = (Game.getGameTimeInSeconds() >= this.getDerbyEndTime());
		cc.log("Guild2::hasDerbyFinished: " + res);
		return res;
	},
	
	hasPlayerJoinedDerby:function()
	{
		if(!this.svrData)
			return false;
		
		var derbyMembers = this.svrData[GUILD_DERBY_MEMBER];
		if(!derbyMembers)
			return false;
		
		for(var i=0; i<derbyMembers.length; i++)
		{
			if(derbyMembers[i][GUILD_DERBY_MEMBER_ID] === gv.mainUserData.userId)
				return true;
		}
		
		return false;
	},
	
	getGuildScore:function()
	{
		var score = 0;
		if(this.hasDerbyFinished())
		{
			if(this.svrData[GUILD_DERBY_POINT]) score = this.svrData[GUILD_DERBY_POINT];
			return score;
		}

		for (var i = 0; i < this.guildTaskList.length; i++) {
			var task = this.guildTaskList[i];
			if (task.status === GUILD_DERBY_TASK_DONE) {
				if (Guild.getMember(task.pickedUserId) !== null)
					score += task.score;
			}
		}

		return score;
	},
	
	getGuildTaskById:function(id)
	{
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			if(this.guildTaskList[i].id === id)
				return this.guildTaskList[i];
		}
		return null;
	},
	
	getGuildMemberTaskLimit:function()
	{
		return g_GUILD_DERBY.LEAGUES[this.svrData[GUILD_DERBY_LEAGUE_ID]].MEMBER_TASK_LIMIT;
	},
	
	getUserPickedTask:function(userId)
	{
		if(!this.guildTaskList)
			return null;
		
		if(!userId)
			userId = gv.mainUserData.userId;
		
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			if(this.guildTaskList[i].status === GUILD_DERBY_TASK_PROCESS && this.guildTaskList[i].pickedUserId === userId)
				return this.guildTaskList[i];
		}
		return null;
	},
	
	getUserPickedTasksCount:function()
	{
		var pickedTasksCount = 0;
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			if(this.guildTaskList[i].pickedUserId === gv.mainUserData.userId)
				pickedTasksCount++;
		}
		return pickedTasksCount;
	},
	
	getUserFinishedTasksCount:function()
	{
		var finishedTasksCount = 0;
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			if(this.guildTaskList[i].pickedUserId === gv.mainUserData.userId && this.guildTaskList[i].status === GUILD_DERBY_TASK_DONE)
				finishedTasksCount++;
		}
		return finishedTasksCount;
	},
	
	getUserTotalTasks:function()
	{
		var limit = this.getGuildMemberTaskLimit();
		var pickedTasksCount = this.getUserPickedTasksCount();
		return (pickedTasksCount < limit ? limit : pickedTasksCount);
	},

	getUserTasksLeft:function()
	{
		var limit = this.getGuildMemberTaskLimit();
		var pickedTasksCount = this.getUserPickedTasksCount();
		if(pickedTasksCount <= limit)
			return (limit - pickedTasksCount);
		else
			return 0;
	},
	
	getUserBoughtTasksCount:function()
	{
		var boughtTasksCount = this.getUserPickedTasksCount() - this.getGuildMemberTaskLimit();
		return (boughtTasksCount > 0 ? boughtTasksCount : 0);
	},
	
	updateTaskDisplayData:function(task)
	{
		task.bg = (task.status === GUILD_DERBY_TASK_PROCESS ? (task.pickedUserId === gv.mainUserData.userId ? "guild_v2/slot_task_02.png" : "guild_v2/slot_task_03.png") : "guild_v2/slot_task_01.png");
		
		var pickedUser = Guild.getMember(task.pickedUserId);
		if(pickedUser)
		{
			task.pickedUserName = pickedUser[FRIEND_NAME].length <=10? pickedUser[FRIEND_NAME]: pickedUser[FRIEND_NAME].substring(0,10);// FWUtils.cutLongString(list[i][FRIEND_NAME], 13);
			task.pickedUserLevel = pickedUser[FRIEND_LEVEL];
			task.pickedUserAvatar = pickedUser[FRIEND_AVATAR];
		}
		else
		{
			task.pickedUserName = "";
			task.pickedUserLevel = 0;
			task.pickedUserAvatar = "";
		}
	
		var actionIcon = Game.getActionIcon(Game.getActionById(task.action), null, task.item);

		if(task.action === g_ACTIONS.ACTION_MACHINE_PRODUCE.VALUE || task.action === g_ACTIONS.ACTION_PLANT.VALUE){
			actionIcon = Game.getItemGfxByDefine(task.item);
		}
		var action = Game.getActionById(task.action);
		task.title = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_TITLE_" + task.action);
		//task.desc = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_" + task.action).replace("%count", task.amount).replace("%item", FWLocalization.text("TXT_" + task.item));
		task.desc = FWLocalization.text(action.DESC).replace("%count", task.amount).replace("%item", FWLocalization.text("TXT_" + task.item));

		task.actionIcon = actionIcon.sprite;
		task.actionIconScale = actionIcon.scale;
		task.basket = (task.action === g_ACTIONS.ACTION_PLANT_HARVEST.VALUE || task.action === g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE);
		task.durationText = FWUtils.secondsToTimeString(task.duration);
		task.displayScore = Guild2.getDerbyDisplayScore(task.score);

		if(task.action === g_ACTIONS.ACTION_POT_UPGRADE.VALUE && task.item){
			task.desc = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_32_DETAIL").replace("%count", task.amount).replace("%item", FWLocalization.text("TXT_" + task.item));
		}
	},
	
	loadDerby:function()
	{
		FWLoader.continueLoading = false; // must complete loading derby to continue
		this.resetDerbyNotStated = false;
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onDerbyLoaded:function(data)
	{
		this.svrData = data;
		this.onDerbyTasksLoaded(data);
		
		FWLoader.continueLoading = true;
	},
	
	updateCommonData:function(data)
	{
		if(data[GUILD_DERBY_LEAGUE_ID] !== undefined)
			this.leagueId = data[GUILD_DERBY_LEAGUE_ID];
		if(data[GUILD_DERBY_GROUP_ID] !== undefined)
			this.groupId = data[GUILD_DERBY_GROUP_ID];
		if(data[GUILD_DERBY_TIME_REWARD] !== undefined)
			this.rewardEndTime = data[GUILD_DERBY_TIME_REWARD];
	},
	
	loadTasks:function()
	{
		FWUtils.disableAllTouches();
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildDerbyTaskGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onDerbyTasksLoaded:function(data)
	{
		var tasks = data[GUILD_DERBY_TASKS];
		var tasksDoing = data[GUILD_DERBY_TASKS_DOING];
		var tasksOld = data[GUILD_DERBY_TASKS_OLD];
		
		var taskList = [];
		if(tasks)
		{
			for(var i=0; i<tasks.length; i++)
				taskList.push(this.convServerTask2ClientTask(tasks[i]));
		}
		if(tasksDoing)
		{
			for(var i=0; i<tasksDoing.length; i++)
				taskList.push(this.convServerTask2ClientTask(tasksDoing[i]));
		}
		if(tasksOld)
		{
			for(var i=0; i<tasksOld.length; i++)
				taskList.push(this.convServerTask2ClientTask(tasksOld[i]));
		}

		this.guildTaskList = taskList;
		FWUtils.disableAllTouches(false);
	},

	convServerTask2ClientTask:function(data)
	{
		var task = {};
		task.id = data[GUILD_DERBY_TASK_ID];
		task.action = data[GUILD_DERBY_TASK_ACTION];
		task.amount = data[GUILD_DERBY_TASK_REQUIRE];
		task.item = data[GUILD_DERBY_TASK_TARGET];
		task.score = data[GUILD_DERBY_TASK_REWARD];
		task.status = data[GUILD_DERBY_TASK_STATUS];
		task.availableTime = data[GUILD_DERBY_TASK_START];
		task.startTime = data[GUILD_DERBY_TASK_START];
		task.duration = data[GUILD_DERBY_TASK_TIME_DOING];//data[GUILD_DERBY_TASK_END] - data[GUILD_DERBY_TASK_START];
		task.cooldownDuration = data[GUILD_DERBY_TASK_TIME_WAIT];
		task.pickedUserId = (data[GUILD_DERBY_TASK_MEMBER] < 0 ? "" : data[GUILD_DERBY_TASK_MEMBER]);
		task.completedAmount = data[GUILD_DERBY_TASK_CURRENT];
		task.skipTimePrice = Game.getSkipTimeDiamond("DERBYTASK", Game.getGameTimeInSeconds() - task.cooldownDuration, task.cooldownDuration).diamond;
		task.level = data[GUILD_DERBY_TASK_LEVEL];
		task.displayIdx = task.id
		
		//jira#7065
		if(task.duration <= 0)
		{
			if(task.availableTime > 0)
				task.duration = Guild2.getDerbyEndTime() - task.availableTime;
			else
				task.duration = Guild2.getDerbyEndTime() - Game.getGameTimeInSeconds();
		}
		
		this.updateTaskDisplayData(task);
		return task;
	},
	
	onTaskUpdated:function(task)
	{
		for(var i=0; i<this.guildTaskList.length; i++)
		{
			if(this.guildTaskList[i].id === task.id)
			{
				// update existing task
				this.guildTaskList[i] = task;
				cc.log("Guild2::onTaskUpdated: update existing task: " + JSON.stringify(task));
				return;
			}
		}
		
		// insert new task
		this.guildTaskList.push(task);
		cc.log("Guild2::onTaskUpdated: insert new task: " + JSON.stringify(task));
	},
	
	onMemberUpdated:function(member)
	{
		var members = this.svrData[GUILD_DERBY_MEMBER];
		for(var i=0; i<members.length; i++)
		{
			if(members[i][GUILD_DERBY_MEMBER_ID] === member[GUILD_DERBY_MEMBER_ID])
			{
				members[i] = member;
				cc.log("Guild2::onMemberUpdated: update existing member: " + JSON.stringify(member));
				return;
			}
		}
		
		cc.log("Guild2::onMemberUpdated: member not found: " + JSON.stringify(member));
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestGuildDerbyGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_GET);},
		pack:function()
		{
			this.packHeader();
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyGet: error=" + this.getError());
			
			cc.log("Guild2::ResponseGuildDerbyGet: " + JSON.stringify(object[KEY_GUILD_DERBY]));
			Guild2.updateCommonData(object[KEY_GUILD_DERBY]);
			Guild2.onDerbyLoaded(object[KEY_GUILD_DERBY]);
			if(object[KEY_DERBY_NEXT_TIME_START]) Guild2.setNextTimeDerby(object[KEY_DERBY_NEXT_TIME_START]);
			if(Guild2.resetDerbyNotStated) Guild2.setState(GUILD2_STATE_TASK_STARTED);

		}
	}),

	RequestGuildDerbyGetGroup:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_GET_GROUP);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			
			this.packHeader();
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyGetGroup:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyGetGroup: error=" + this.getError());
			
			cc.log("Guild2::ResponseGuildDerbyGetGroup: " + JSON.stringify(object[KEY_GUILD_DERBY]));
			Guild2.updateCommonData(object[KEY_GUILD_DERBY]);
			Guild2.showDerby2(object[KEY_GUILD_DERBY]);
		}
	}),
	
	RequestGuildDerbyTaskGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_GET);},
		pack:function()
		{
			this.packHeader();
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskGet: error=" + this.getError());
			
			cc.log("Guild2::ResponseGuildDerbyTaskGet: " + JSON.stringify(object[KEY_GUILD_DERBY]));
			Guild2.updateCommonData(object[KEY_GUILD_DERBY]);
			Guild2.onDerbyTasksLoaded(object[KEY_GUILD_DERBY]);
			
			if(FWUI.isShowing(UI_GUILD2) && Guild2.currentTab === GUILD2_TAB_TASKS)
				Guild2.showMainUi();
		}
	}),
	
	RequestGuildDerbyTaskAccept:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_ACCEPT);},
		pack:function(task, price)
		{
			if(price === undefined)
				price = 0;
			
			FWUtils.disableAllTouches();
			Guild2.lastCmd = gv.CMD.GUILD_DERBY_TASK_ACCEPT;
			
			this.packHeader();
			PacketHelper.putInt(this, KEY_SLOT_ID, task.id);
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskAccept:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var isBroadcast = (Guild2.lastCmd !== gv.CMD.GUILD_DERBY_TASK_ACCEPT);
			if(!isBroadcast)
			{
				Guild2.lastCmd = null;
				FWUtils.disableAllTouches(false);
			}
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskAccept: error=" + this.getError());
			else
			{
				cc.log("Guild2::ResponseGuildDerbyTaskAccept: " + JSON.stringify(object));	
				
				Guild2.onTaskUpdated(Guild2.convServerTask2ClientTask(object[KEY_SLOT_OBJECT]));
				Guild2.onMemberUpdated(object[KEY_DATA]);
				
				if(!isBroadcast)
				{
					Game.updateUserDataFromServer(object);
					Guild2.showMainUi();
				}
				
				// refresh to show new cooldown tasks
				Guild2.loadTasks();
			}
		}
	}),	
	
	RequestGuildDerbyTaskCancel:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_CANCEL);},
		pack:function(task)
		{
			FWUtils.disableAllTouches();
			Guild2.lastCmd = gv.CMD.GUILD_DERBY_TASK_CANCEL;
			
			this.packHeader();
			PacketHelper.putInt(this, KEY_SLOT_ID, task.id);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskCancel:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var isBroadcast = (Guild2.lastCmd !== gv.CMD.GUILD_DERBY_TASK_CANCEL);
			if(!isBroadcast)
			{
				Guild2.lastCmd = null;
				FWUtils.disableAllTouches(false);
			}
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskCancel: error=" + this.getError());
			else
			{
				cc.log("Guild2::ResponseGuildDerbyTaskCancel: " + JSON.stringify(object));
				Guild2.onTaskUpdated(Guild2.convServerTask2ClientTask(object[KEY_SLOT_OBJECT]));
				if(!isBroadcast || (FWUI.isShowing(UI_GUILD2) && Guild2.currentTab === GUILD2_TAB_TASKS))
					Guild2.showMainUi();				
			}
		}
	}),
	
	RequestGuildDerbyTaskRemove:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_REMOVE);},
		pack:function(task)
		{
			FWUtils.disableAllTouches();
			Guild2.lastCmd = gv.CMD.GUILD_DERBY_TASK_REMOVE;
			
			this.packHeader();
			PacketHelper.putInt(this, KEY_SLOT_ID, task.id);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskRemove:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var isBroadcast = (Guild2.lastCmd !== gv.CMD.GUILD_DERBY_TASK_REMOVE);
			if(!isBroadcast)
			{
				Guild2.lastCmd = null;
				FWUtils.disableAllTouches(false);
			}
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskRemove: error=" + this.getError());
			else
			{
				cc.log("Guild2::ResponseGuildDerbyTaskRemove: " + JSON.stringify(object));	
				Guild2.onTaskUpdated(Guild2.convServerTask2ClientTask(object[KEY_SLOT_OBJECT]));
				if(!isBroadcast || (FWUI.isShowing(UI_GUILD2) && Guild2.currentTab === GUILD2_TAB_TASKS))
					Guild2.showMainUi();
				
				// refresh to show new cooldown tasks
				Guild2.loadTasks();
			}
		}
	}),			
	
	RequestGuildDerbyTaskSkipCooldown:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_SKIP_COOLDOWN);},
		pack:function(task, price)
		{
			FWUtils.disableAllTouches();
			Guild2.lastCmd = gv.CMD.GUILD_DERBY_TASK_SKIP_COOLDOWN;
			
			this.packHeader();
			PacketHelper.putInt(this, KEY_SLOT_ID, task.id);
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskSkipCooldown:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var isBroadcast = (Guild2.lastCmd !== gv.CMD.GUILD_DERBY_TASK_SKIP_COOLDOWN);
			if(!isBroadcast)
			{
				Guild2.lastCmd = null;
				FWUtils.disableAllTouches(false);
			}
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskSkipCooldown: error=" + this.getError());
			else
			{
				cc.log("Guild2::ResponseGuildDerbyTaskSkipCooldown: " + JSON.stringify(object));
				
				if(!isBroadcast)
					Game.updateUserDataFromServer(object);
				
				Guild2.onTaskUpdated(Guild2.convServerTask2ClientTask(object[KEY_SLOT_OBJECT]));
				
				if(!isBroadcast || (FWUI.isShowing(UI_GUILD2) && Guild2.currentTab === GUILD2_TAB_TASKS))
					Guild2.showMainUi();				
			}
		}
	}),	
	
	RequestGuildDerbyTaskUpdateProcess:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_TASK_UPDATE_PROCESS);},
		pack:function(taskId, current)
		{
			this.packHeader();
			PacketHelper.putInt(this, KEY_SLOT_ID, taskId);
			PacketHelper.putInt(this, KEY_SLOT_OBJECT, current);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyTaskUpdateProcess:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyTaskUpdateProcess: error=" + this.getError());

			cc.log("Guild2::ResponseGuildDerbyTaskUpdateProcess: " + JSON.stringify(object));	
			Guild2.onTaskUpdated(Guild2.convServerTask2ClientTask(object[KEY_SLOT_OBJECT]));
		}
	}),
	
	RequestGuildDerbyRewardClaim:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_REWARD_CLAIM);},
		pack:function(slotIds)
		{
			FWUtils.disableAllTouches();
			
			this.packHeader();
			PacketHelper.putIntArray(this, KEY_SLOT_ID, slotIds);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyRewardClaim:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyRewardClaim: error=" + this.getError());
			else
			{
				cc.log("Guild2::ResponseGuildDerbyRewardClaim: " + JSON.stringify(object));
				Guild2.onRewardClaimSuccess(object);
			}
		}
	}),	
	
	RequestGuildDerbyRewardChange:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_REWARD_CHANGE);},
		pack:function(ids)
		{
			FWUtils.disableAllTouches();
			
			this.packHeader();
			PacketHelper.putIntArray(this, KEY_SLOT_ID, ids);
			PacketHelper.putInt(this, KEY_PRICE_COIN, g_MISCINFO.DERBY_MEMBER_REWARD_CHANGE_PRICE);
			PacketHelper.putClientCoin(this);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyRewardChange:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild2::ResponseGuildDerbyRewardChange: error=" + this.getError());

			cc.log("Guild2::ResponseGuildDerbyRewardChange: " + JSON.stringify(object));
			Game.updateUserDataFromServer(object);
			Guild2.loadRewards(object[KEY_DATA]);
			Guild2.setState(GUILD2_STATE_REWARDS);
		}
	}),		
	
	RequestGuildDerbyRewardGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_REWARD_GET);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			
			this.packHeader();
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyRewardGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Guild2::ResponseGuildDerbyRewardGet: error=" + this.getError());
				Guild2.loadRewards(null);
			}
			else
			{
				cc.log("Guild2::ResponseGuildDerbyRewardGet: " + JSON.stringify(object));
				Guild2.loadRewards(object[KEY_GUILD_DERBY]);
			}
			
			Guild2.setState(GUILD2_STATE_REWARDS);
		}
	}),
	
	RequestGuildDerbyRewardChoose:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DERBY_REWARD_CHOOSE);},
		pack:function(ids)
		{
			this.packHeader();
			PacketHelper.putIntArray(this, KEY_SLOT_ID, ids);
			PacketHelper.markEndObject(this);
			this.updateSize();
		},
	}),

	ResponseGuildDerbyRewardChoose:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Guild2::ResponseGuildDerbyRewardChoose: error=" + this.getError() + " new data=" + JSON.stringify(object));
				Guild2.loadRewards(object[KEY_DATA]);
			}
		}
	}),	
};

network.packetMap[gv.CMD.GUILD_DERBY_GET] = Guild2.ResponseGuildDerbyGet;
network.packetMap[gv.CMD.GUILD_DERBY_GET_GROUP] = Guild2.ResponseGuildDerbyGetGroup;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_GET] = Guild2.ResponseGuildDerbyTaskGet;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_ACCEPT] = Guild2.ResponseGuildDerbyTaskAccept;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_CANCEL] = Guild2.ResponseGuildDerbyTaskCancel;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_REMOVE] = Guild2.ResponseGuildDerbyTaskRemove;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_SKIP_COOLDOWN] = Guild2.ResponseGuildDerbyTaskSkipCooldown;
network.packetMap[gv.CMD.GUILD_DERBY_TASK_UPDATE_PROCESS] = Guild2.ResponseGuildDerbyTaskUpdateProcess;
network.packetMap[gv.CMD.GUILD_DERBY_REWARD_CLAIM] = Guild2.ResponseGuildDerbyRewardClaim;
network.packetMap[gv.CMD.GUILD_DERBY_REWARD_CHANGE] = Guild2.ResponseGuildDerbyRewardChange;
network.packetMap[gv.CMD.GUILD_DERBY_REWARD_GET] = Guild2.ResponseGuildDerbyRewardGet;
network.packetMap[gv.CMD.GUILD_DERBY_REWARD_CHOOSE] = Guild2.ResponseGuildDerbyRewardChoose;

// broadcast
network.chatMap[gv.CMD.GUILD_DERBY_TASK_ACCEPT] = Guild2.ResponseGuildDerbyTaskAccept;
network.chatMap[gv.CMD.GUILD_DERBY_TASK_CANCEL] = Guild2.ResponseGuildDerbyTaskCancel;
network.chatMap[gv.CMD.GUILD_DERBY_TASK_REMOVE] = Guild2.ResponseGuildDerbyTaskRemove;
network.chatMap[gv.CMD.GUILD_DERBY_TASK_SKIP_COOLDOWN] = Guild2.ResponseGuildDerbyTaskSkipCooldown;
network.chatMap[gv.CMD.GUILD_DERBY_TASK_UPDATE_PROCESS] = Guild2.ResponseGuildDerbyTaskUpdateProcess;

