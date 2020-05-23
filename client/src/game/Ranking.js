
const RANKING_TAB_LEVEL = 0;
const RANKING_TAB_VALUE = 1;
const RANKING_TAB_CONTEST = 2;
const RANKING_TAB_EVENT = 3;
const RANKING_TABS_COUNT = 4;

const RANKING_FILTER_WORLD = 0;
const RANKING_FILTER_FRIENDS = 1;

const RANKING_NAME_MAX_LENGTH = 13;

const RANKING_REFRESH_TIME = 300;

// delay several seconds, then load & show result
const RANKING_RESULT_DELAY = 60;

const RANKING_FAKE_DATA = false;

var Ranking =
{
	currentTab: RANKING_TAB_LEVEL,
	filter: RANKING_FILTER_WORLD,
	tabsData: null,
	svrData: null,
	friendlistUpdated: true,
	isWeeklyTargetRewardsShown: false,
	refreshAll: false,
	lastRefreshTime: 0,
	showRefreshTime: false,
	noDataText: null,
	hasResultLoaded: false,
	
	init:function()
	{
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE)
			return;
		
		this.initConstants();
		this.lastRefreshTime = Game.getGameTimeInSeconds();
		this.getTop();
	},
	
	initConstants:function()
	{
		g_RANKING.tabConstants = [
			g_RANKING.TOP_LEVEL,
			g_RANKING.TOP_APPRAISAL,
			g_RANKING.TOP_ACTIONS[this.getUserRankData(RANKING_TAB_CONTEST, RANK_ID)],
			g_RANKING.TOP_EVENTS[this.getUserRankData(RANKING_TAB_EVENT, RANK_ID)],//g_RANKING.TOP_EVENTS[g_MISCINFO.TOP_EVENT + "_" + g_COMMON_ITEM.E1ID.ID]
		];
	},
	
	uninit:function()
	{
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE)
			return;
	},
	
	show:function(refresh)//web show:function(refresh = false)
	{
		if(refresh === undefined)
			refresh = false;
		
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE || !this.tabsData)
			return;
		
		if(this.friendlistUpdated)
		{
			this.updateTabsDisplayData_friends();
			this.friendlistUpdated = false;
		}
		
		var tabData = this.tabsData[this.currentTab];
		
		var hasData = true;
		if((this.currentTab === RANKING_TAB_CONTEST && !g_RANKING.tabConstants[RANKING_TAB_CONTEST]) // no data
			|| (this.currentTab === RANKING_TAB_EVENT && !g_RANKING.tabConstants[RANKING_TAB_EVENT]) // no data
			|| ((this.currentTab === RANKING_TAB_CONTEST || this.currentTab === RANKING_TAB_EVENT) && g_RANKING.tabConstants[this.currentTab].UNIX_START_TIME > Game.getGameTimeInSeconds())) // not started
			hasData = false;
			
		if(this.filter === RANKING_FILTER_WORLD && hasData && (!tabData.items[RANKING_FILTER_WORLD] || tabData.items[RANKING_FILTER_WORLD].length <= 0))
			this.showRefreshTime = true;
		else
			this.showRefreshTime = false;
			
		// jira#6193, 6194
		var title = null;
		if(this.currentTab === RANKING_TAB_EVENT)
		{
			title = FWLocalization.text(tabData.isFinished ? "TXT_RANKING_TITLE_3_FINISHED" : "TXT_RANKING_TITLE_3");
			if(GameEventTemplate2.getActiveEvent())
			{
				title = cc.formatStr(title, FWLocalization.text("TXT_EVENT2_NAME"));
			}
			else if(GameEventTemplate3.getActiveEvent())
			{
				title = cc.formatStr(title, FWLocalization.text("TXT_EVENT3_NAME"));
			}
			else
			{
				title = cc.formatStr(title, FWLocalization.text("TXT_EVENT_NAME"));
			}

		}
		else
			title = "TXT_RANKING_TITLE_" + this.currentTab;
			
		var uiDef =
		{
			closeButton:{onTouchEnded:this.hide.bind(this)},
			title:{type:UITYPE_TEXT, value:title, style:TEXT_STYLE_TITLE_1},
			timerMarker:{type:UITYPE_TIME_BAR, visible:tabData.endTime > Game.getGameTimeInSeconds(), startTime:tabData.startTime, endTime:tabData.endTime, countdown:true, onFinished:this.onRankingTimeFinished.bind(this)},
			tabLevelOff:{visible:g_MISCINFO.TOP_LEVEL_ACTIVE && this.currentTab !== RANKING_TAB_LEVEL, onTouchEnded:function(sender) {Ranking.changeTab(RANKING_TAB_LEVEL);}},//web
			tabValueOff:{visible:g_MISCINFO.TOP_APPRAISAL_ACTIVE && this.currentTab !== RANKING_TAB_VALUE, onTouchEnded:function(sender) {Ranking.changeTab(RANKING_TAB_VALUE);}},//web
			tabContestOff:{visible:g_MISCINFO.TOP_ACTION_ACTIVE && this.currentTab !== RANKING_TAB_CONTEST, onTouchEnded:function(sender) {Ranking.changeTab(RANKING_TAB_CONTEST);}},//web
			tabEventOff:{visible:g_MISCINFO.TOP_EVENT_ACTIVE && this.currentTab !== RANKING_TAB_EVENT, onTouchEnded:function(sender) {Ranking.changeTab(RANKING_TAB_EVENT);}},//web
			tabLevelOn:{visible:g_MISCINFO.TOP_LEVEL_ACTIVE && this.currentTab === RANKING_TAB_LEVEL},
			tabValueOn:{visible:g_MISCINFO.TOP_APPRAISAL_ACTIVE && this.currentTab === RANKING_TAB_VALUE},
			tabContestOn:{visible:g_MISCINFO.TOP_ACTION_ACTIVE && this.currentTab === RANKING_TAB_CONTEST},
			tabEventOn:{visible:g_MISCINFO.TOP_EVENT_ACTIVE && this.currentTab === RANKING_TAB_EVENT},
			rankingReward:{visible:false},
			filter:{visible:hasData, onTouchEnded:function(sender) {Ranking.onFilterButton();}},//web
			worldButton:{visible:this.filter === RANKING_FILTER_WORLD},
			friendListButton:{visible:this.filter === RANKING_FILTER_FRIENDS},
			worldText:{type:UITYPE_TEXT, value:"TXT_RANKING_FILTER_WORLD", style:TEXT_STYLE_TEXT_BUTTON},
			friendListText:{type:UITYPE_TEXT, value:"TXT_RANKING_FILTER_FRIENDS", style:TEXT_STYLE_TEXT_BUTTON},
			infoButton: {onTouchEnded:this.showInfo.bind(this)},
			groupIcon:{visible:hasData},
			groupText:{visible:hasData, type:UITYPE_TEXT, value:tabData.levelGroupText, style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			rankingPanel:{visible:hasData},
			resultPanel:{visible:hasData},
			weeklyTargetGiftMarker:{visible:hasData},
			noDataText:{visible:!hasData, type:UITYPE_TEXT, value:"TXT_RANKING_NO_DATA", style:TEXT_STYLE_TEXT_NORMAL},
			resultFx2:{visible:false},
		};

		var timeEndTab = -1;
		if(hasData)
		{
			cc.log("Ranking tabData:" + JSON.stringify(tabData));
			timeEndTab = tabData.endTimeEvent ? tabData.endTimeEvent + g_MISCINFO.RANKING_TIME_SHOW_BOARD : tabData.endTime + g_MISCINFO.RANKING_TIME_SHOW_BOARD;
			cc.log("timeEndTab: "+ timeEndTab +  "gameTime: "+ Game.getGameTimeInSeconds());
			if(tabData.isFinished )
			{
				if(Game.getGameTimeInSeconds() < tabData.endTime + RANKING_RESULT_DELAY)
				{
					this.showRankingItems(uiDef);
					this.lastRefreshTime = tabData.endTime + RANKING_RESULT_DELAY - RANKING_REFRESH_TIME;
				}
				else if(!this.hasResultLoaded)
				{
					this.hasResultLoaded = true;
					this.getTop();
				}
				else if (Game.getGameTimeInSeconds() >= timeEndTab)
					this.showRankingResult(uiDef);
				else
					this.showRankingItems(uiDef);
			}
			else
				this.showRankingItems(uiDef);
		}
		
		var widget = FWPool.getNode(UI_RANKING, false);
		if(!this.itemList)
			this.itemList = FWUtils.getChildByName(widget, "itemList");
		
		// resize items list
		if(this.currentTab === RANKING_TAB_CONTEST )
			this.itemList.setContentSize(600, 240);
		else
			this.itemList.setContentSize(600, 360);



		if((timeEndTab >0 && timeEndTab > Game.getGameTimeInSeconds()) && ((this.currentTab === RANKING_TAB_CONTEST && tabData.endTime < Game.getGameTimeInSeconds())
			|| (this.currentTab === RANKING_TAB_EVENT && tabData.endTimeEvent < Game.getGameTimeInSeconds())))
		{
			this.itemList.setContentSize(600, 300);
		}

		// show
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
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgRanking");
			
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			
			this.noDataText = FWUtils.getChildByName(widget, "noDataText");
			FWUI.applyTextStyle(this.noDataText, TEXT_STYLE_TEXT_NORMAL);
			
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 1, false);
			this.lastRefreshTime = 0;
			this.update();
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		
		// jira#5472
		if(!refresh)
			this.itemList.scrollToPercentVertical(0, 0.01, false);
	},
	
	hide:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		FWUtils.hideDarkBg(null, "darkBgRanking");
		FWUI.hide(UI_RANKING, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		this.isWeeklyTargetRewardsShown = false;
		//Game.gameScene.showFocusPointer("ranking", false); auto hide after 3s
	},
	
	update:function(dt)
	{
		var currentTime = Game.getGameTimeInSeconds();
		
		for(var key in g_RANKING.TOP_ACTIONS)
		{
			var action = g_RANKING.TOP_ACTIONS[key];
			if(g_RANKING.tabConstants[RANKING_TAB_CONTEST] && action.ID !== g_RANKING.tabConstants[RANKING_TAB_CONTEST].ID && action.UNIX_START_TIME <= currentTime && action.UNIX_START_TIME > this.lastRefreshTime)
			{
				cc.log("Ranking::update: new action: " + action.ID);
				this.refreshAll = true;
				break;
			}
		}
		
		if(currentTime - this.lastRefreshTime >= RANKING_REFRESH_TIME)
			this.refreshAll = true;
		
		if(this.showRefreshTime)
		{
			var remainTime = -1;
			var refreshTime = new Date(currentTime * 1000);
			var updateHours = g_MISCINFO.RANKING_UPDATE_HOURS.concat([24]);
			for(var i=0; i<updateHours.length; i++)
			{
				var refreshTime2 = refreshTime.setHours(updateHours[i], 0, 5, 0) / 1000;
				if(refreshTime2 > currentTime)
				{
					remainTime = refreshTime2 - currentTime;
					break;
				}
			}
			
			if(remainTime >= 0)
			{
				this.noDataText.setVisible(true);
				this.noDataText.setString(FWLocalization.text("TXT_FRIEND_REFRESH") + ": " + FWUtils.secondsToTimeString(remainTime));
				
				if(remainTime <= 1)
				{
					this.refreshAll = true;
					this.showRefreshTime = false;
				}
			}
			else
				this.noDataText.setVisible(false);
		}
		
		if(this.refreshAll)
		{
			this.lastRefreshTime = currentTime;
			this.refreshAll = false;
			this.getPR();
		}
	},
	
	updateTabDisplayData:function(tabData)
	{
		if(RANKING_FAKE_DATA)
		{
			var tab = tabData.tab;
			var tabIcon = this.getTabIcon(tab);
			var levelGroupInfo = this.getLevelGroupInfo(tab, gv.mainUserData.getLevel());
			var tabConstant = g_RANKING.tabConstants[tab];
			
			tabData.levelGroupText = levelGroupInfo.text;
			tabData.startTime = 0;
			tabData.endTime = 0;
			tabData.isFinished = false;
			tabData.targetIcon = tabIcon.icon;
			tabData.targetIconScale = tabIcon.scale;
			if(tab === RANKING_TAB_CONTEST)
			{
				tabData.targetCurrent = 999;
				tabData.targetRequire = tabConstant.DEFAULT_REQUIRE;
				tabData.targetIsFinished = (tabData.targetCurrent >= tabData.targetRequire);
				tabData.targetIsRewardsReceived = false;
				tabData.targetRewards = FWUtils.getItemsArray(tabConstant.DEFAULT_REWARDS);
				tabData.targetTitle = tabConstant.SLOGAN_TEXT_ID;
				tabData.targetContent = cc.formatStr(FWLocalization.text(tabConstant.DESC_TEXT_ID), tabData.targetRequire);
			}
			
			tabData.items = {};
			tabData.playerItems = {};
			tabData.items[RANKING_FILTER_FRIENDS] = [];
			tabData.items[RANKING_FILTER_WORLD] = [];
			for(var i=0; i<10; i++)
			{
				var item = {ranking:i + 1};
				this.updateItemDisplayData(item);
				
				tabData.items[RANKING_FILTER_WORLD].push(item);
				if(i < 5)
					tabData.items[RANKING_FILTER_FRIENDS].push(item);
				
				if(item.uid === gv.mainUserData.mainUserId)
				{
					tabData.playerItems[RANKING_FILTER_FRIENDS] = item;
					tabData.playerItems[RANKING_FILTER_WORLD] = item;
				}
			}
		}
		else
		{
			var tab = tabData.tab;
			var tabConstant = g_RANKING.tabConstants[tab];
			if(tabConstant)
			{
				var tabIcon = this.getTabIcon(tab);
				var levelGroupInfo = this.getLevelGroupInfo(tab, this.getUserRankData(tab, RANK_GROUP_LEVEL));
				
				tabData.levelGroupText = levelGroupInfo.text;

				tabData.startTime = 0;
				tabData.endTime = 0;
				tabData.targetIcon = tabIcon.icon;
				tabData.targetIconScale = tabIcon.scale;
				if(tab === RANKING_TAB_CONTEST)
				{
					tabData.targetCurrent = this.getUserRankData(tab, RANK_POINT);
					tabData.targetRequire = tabConstant.DEFAULT_REQUIRE;
					tabData.targetIsFinished = (tabData.targetCurrent >= tabData.targetRequire);
					tabData.targetIsRewardsReceived = this.getUserRankData(tab, RANK_CLAIM_REWARD);
					tabData.targetRewards = FWUtils.getItemsArray(tabConstant.DEFAULT_REWARDS);
					tabData.targetTitle = tabConstant.SLOGAN_TEXT_ID;
					tabData.targetContent = cc.formatStr(FWLocalization.text(tabConstant.DESC_TEXT_ID), tabData.targetRequire);
					tabData.startTime = tabConstant.UNIX_START_TIME;
					tabData.endTime = tabConstant.UNIX_END_TIME;
				}
				else if(tab === RANKING_TAB_EVENT)
				{
					var event = GameEvent.getEventById(tabConstant.EVENT_ID);
					if (tabConstant.EVENT_ID === "E1ID")
						tabData.endTimeEvent = event.UNIX_END_TIME;
					else if (tabConstant.EVENT_ID === "E2ID")
						tabData.endTimeEvent = g_EVENT_02.E02_UNIX_END_TIME;
					else if (tabConstant.EVENT_ID === "E3ID")
						tabData.endTimeEvent = g_EVENT_03.E03_UNIX_END_TIME;
					if(event)
					{
						tabData.startTime = event.UNIX_START_TIME;
						tabData.endTime = event.UNIX_END_TIME;
					}
					if(!event && GameEventTemplate2.getActiveEvent()) {
						tabData.startTime = g_EVENT_02.E02_UNIX_START_TIME;
						tabData.endTime = g_EVENT_02.E02_UNIX_END_TIME;
					}

					if(!event && GameEventTemplate3.getActiveEvent()) {
						tabData.startTime = g_EVENT_03.E03_UNIX_START_TIME;
						tabData.endTime = g_EVENT_03.E03_UNIX_END_TIME;
					}
				}
				tabData.items = {};
				tabData.playerItems = {};
				tabData.isFinished = (tabData.endTime > 0 && tabData.endTime <= Game.getGameTimeInSeconds());
				
				// fill from svrData
				tabData.items[RANKING_FILTER_WORLD] = [];
				tabData.playerItems[RANKING_FILTER_WORLD] = null;
				if(this.svrData)
				{
					// status
					if(this.svrData[KEY_ITEMS] && this.svrData[KEY_ITEMS][tab] && this.svrData[KEY_ITEMS][tab][RANK_STATUS] !== undefined)
						tabData.isFinished = tabData.isFinished || (this.svrData[KEY_ITEMS][tab][RANK_STATUS] === g_MISCINFO.RANKING_BOARD_STATUS_CLOSE);
					
					// items
					var svrItems = this.svrData[KEY_ITEMS][tab][RANK_LIST];
					if(svrItems)
					{
						var items = [];
						var playerRank = null;
						
						for(var i=0; i<svrItems.length; i++)
						{
							var svrItem = svrItems[i];
							if(svrItem[RANK_USER_ID] === gv.mainUserData.mainUserId)
								playerRank = svrItem[RANK_ORDER];
							
							var item = {};
							item.ranking = svrItem[RANK_ORDER];// i + 1;
							item.rankingText = (item.ranking <= 3 ? "" : item.ranking);
							item.uid = svrItem[RANK_USER_ID];
							item.name = FWUtils.cutLongString(svrItem[RANK_USER_NAME], RANKING_NAME_MAX_LENGTH);
							item.avatar = svrItem[RANK_USER_AVATAR];
							item.level = cc.formatStr(FWLocalization.text("TXT_LV"), svrItem[RANK_USER_LV]);
							item.score = svrItem[RANK_POINT];

							item.score = this.getScoreEvent3(item.score,tab);
							item.hasGift = false;
							item.bg = (item.uid === gv.mainUserData.mainUserId ? "hud/hud_ranking_board_menu_00.png" : "hud/hud_ranking_board_menu_01.png");
							item.badge = (item.ranking > 0 && item.ranking < 4 ? "hud/icon_top" + item.ranking + "_evt.png" : "hud/icon_top4_evt.png");
							items.push(item);
						}
						
						playerRank = playerRank || this.getUserRankData(tab, RANK_ORDER);

						var scorePlayer =this.getUserRankData(tab, RANK_POINT);

						scorePlayer = this.getScoreEvent3(scorePlayer,tab);

						var playerItem =
						{
							ranking:playerRank,
							rankingText:(playerRank <= 3 ? "" : playerRank),
							uid:gv.mainUserData.mainUserId,
							name:FWUtils.cutLongString(gv.mainUserData.userName, RANKING_NAME_MAX_LENGTH),
							avatar:gv.mainUserData.getAvatar(),
							level:cc.formatStr(FWLocalization.text("TXT_LV"), gv.mainUserData.getLevel()),
							score:scorePlayer,
							hasGift:false,
							bg:"hud/hud_ranking_board_menu_00.png",
							badge:(playerRank > 0 && playerRank < 4 ?  "hud/icon_top" + playerRank + "_evt.png" : "hud/icon_top4_evt.png"),
						};
						tabData.playerItems[RANKING_FILTER_WORLD] = playerItem;

						/*if(svrItems.length > 0 && playerItem.ranking <= svrItems.length)
						{
							// player is in top list
							// insert player's realtime score and re-sort list
							items.push(playerItem);
							items = _.sortByDecent(items, function (val) {return val.score;});
							
							// change display icons according to order
							for(var j=0; j<items.length; j++)
							{
								var item = items[j];
								item.ranking = j + 1;
								item.rankingText = (item.ranking <= 3 ? "" : item.ranking);
								item.badge = (item.ranking < 4 ? "hud/icon_rank_no" + item.ranking + ".png" : "hud/icon_rank_no4.png");
							}
						}*/

						// assign
						tabData.items[RANKING_FILTER_WORLD] = items;
					}
				}
				
				// will fill on friendlist updates
				tabData.items[RANKING_FILTER_FRIENDS] = [];
				tabData.playerItems[RANKING_FILTER_FRIENDS] = null;
			}
		}
	},
	
	updateTabsDisplayData_friends:function()
	{
		for(var i=0; i<RANKING_TABS_COUNT; i++)
		{
			if(!g_RANKING.tabConstants[i])
				continue;
			
			var tabData = this.tabsData[i];
			var items = [];
			
			var lbItems = tabData.items[RANKING_FILTER_WORLD] || [];
			var lbItemsLen = lbItems.length;
			var k;
			
			// items
			var friendlist = FriendList.friendsList;
			for(var j=0; j<friendlist.length; j++)
			{
				var friend = friendlist[j];
				if(friend[FRIEND_ID] === USER_ID_JACK)
					continue;
				
				var item = {uid:friend[FRIEND_ID], name:FWUtils.cutLongString(friend[FRIEND_NAME], RANKING_NAME_MAX_LENGTH), avatar:friend[FRIEND_AVATAR], level:cc.formatStr(FWLocalization.text("TXT_LV"), friend[FRIEND_LEVEL]), bg:"hud/hud_ranking_board_menu_01.png"};

				// prefer using ranking point from leaderboard
				item.score = -1;
				for(k=0; k<lbItemsLen; k++)
				{
					if(lbItems[k].uid === item.uid)
					{
						item.score = lbItems[k].score;
						item.score = this.getScoreEvent3(item.score, i);
						break;
					}
				}
				if(item.score < 0)
				{
					// not in leaderboard, use ranking point from server
					//if(friend[FRIEND_RANKING_PR] && friend[FRIEND_RANKING_PR][KEY_ITEMS] && friend[FRIEND_RANKING_PR][KEY_ITEMS][i] && friend[FRIEND_RANKING_PR][KEY_ITEMS][i][RANK_POINT])
					//	item.score = friend[FRIEND_RANKING_PR][KEY_ITEMS][i][RANK_POINT];
					if(friend[FRIEND_RANKING_PR] && friend[FRIEND_RANKING_PR][i])
					{
						item.score = friend[FRIEND_RANKING_PR][i];
						item.score = this.getScoreEvent3(item.score, i);
					}
					else
						item.score = 0;
				}
				
				items.push(item);
			}
			
			// player in list
			var playerItem = null;
			for(k=0; k<lbItemsLen; k++)
			{
				if(lbItems[k].uid === gv.mainUserData.mainUserId)
				{
					var scoreK = lbItems[k].score;
					scoreK = this.getScoreEvent3(scoreK, i);
					playerItem = {uid:gv.mainUserData.mainUserId, name:FWUtils.cutLongString(gv.mainUserData.userName, RANKING_NAME_MAX_LENGTH), avatar:gv.mainUserData.getAvatar(), level:cc.formatStr(FWLocalization.text("TXT_LV"), gv.mainUserData.getLevel()), score:scoreK, bg:"hud/hud_ranking_board_menu_00.png"};
					break;
				}
			}
			
			// player in cloud
			var playerItem2 = null;
			if(playerItem)
				items.push(playerItem);
			else
			{
				var scoreK = this.getUserRankData(i, RANK_POINT);
					scoreK = this.getScoreEvent3(scoreK, i);
				playerItem = playerItem2 = {uid:gv.mainUserData.mainUserId, name:FWUtils.cutLongString(gv.mainUserData.userName, RANKING_NAME_MAX_LENGTH), avatar:gv.mainUserData.getAvatar(), level:cc.formatStr(FWLocalization.text("TXT_LV"), gv.mainUserData.getLevel()), score:scoreK, bg:"hud/hud_ranking_board_menu_00.png"};

				items.push(playerItem);				
				tabData.playerItems[RANKING_FILTER_FRIENDS] = playerItem;
			}
			
			// sort
			items = _.sortByDecent(items, function (val) {return val.score;});
			
			// additional display data
			for(var j=0; j<items.length; j++)
			{
				var item = items[j];
				item.ranking = j + 1;
				item.rankingText = (item.ranking <= 3 ? "" : item.ranking);
				item.hasGift = false;
				item.badge = (item.ranking > 0 && item.ranking < 4 ? "hud/icon_top" + item.ranking + "_evt.png" : "hud/icon_top4_evt.png");
			}
			
			// player in cloud (if not set)
			if(!playerItem2)
			{
				playerItem2 = _.clone(playerItem);

				var scoreK = this.getUserRankData(i, RANK_POINT);
				scoreK = this.getScoreEvent3(scoreK, i);
				playerItem2.score = scoreK;
				tabData.playerItems[RANKING_FILTER_FRIENDS] = playerItem2;
			}
			
			// assign
			tabData.items[RANKING_FILTER_FRIENDS] = items;
		}
	},
	
	updateItemDisplayData:function(item) // unused
	{
		if(RANKING_FAKE_DATA)
		{
			item.rankingText = (item.ranking <= 3 ? "" : item.ranking);
			item.uid = "1545106133";
			item.name = "TXT_NPC_0" + item.ranking;
			item.avatar = "hud/hud_avatar_wolf.png";
			item.level = cc.formatStr(FWLocalization.text("TXT_LV"), 99);
			item.score = 999;
			item.hasGift = true;
			item.bg = (item.uid === gv.mainUserData.mainUserId ? "hud/hud_ranking_board_menu_00.png" : "hud/hud_ranking_board_menu_01.png");
			item.badge = (item.ranking < 4 ? "hud/icon_rank_no" + item.ranking + ".png" : "hud/icon_rank_no4.png");
		}
	},

	onRankingTimeFinished:function(sender)
	{
		this.refreshAll = true;
	},
	
	changeTab:function(tab)
	{
		this.currentTab = tab;
		this.show();
	},
	
	lastFilterTime: 0, // fix: game crashes if pressing filter button continuously
	onFilterButton:function()
	{
		if(Game.getGameTimeInSeconds() - this.lastFilterTime < 1.5)
			return;
		
		this.lastFilterTime = Game.getGameTimeInSeconds();
		this.filter = (this.filter === RANKING_FILTER_WORLD ? RANKING_FILTER_FRIENDS : RANKING_FILTER_WORLD);
		this.show();
	},
	
	showRankingResult:function(uiDef)
	{
		var tabData = this.tabsData[this.currentTab];
		var items = tabData.items[this.filter];
		
		uiDef.rankingPanel = {visible:false};
		uiDef.resultPanel = {visible:true};
		uiDef.rankingReward = {visible:false}; 
		uiDef.weeklyTargetGiftMarker = {visible:false};
		
		var itemsCount = items.length;
		for(var i=0; i<3; i++)
		{
			if(i < itemsCount)
			{
				uiDef["avatar" + i] = {type:UITYPE_IMAGE, value:items[i].avatar, visible:true, size:64};
				uiDef["name" + i] = {type:UITYPE_TEXT, value:items[i].name, style:TEXT_STYLE_TITLE_3, visible:true};
				uiDef["avatarFrame" + i] = {visible:true};
			}
			else
			{
				uiDef["avatar" + i] = {visible:false};
				uiDef["name" + i] = {visible:false};
				uiDef["avatarFrame" + i] = {visible:false};
			}
		}
		
		uiDef.resultFx = {type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:2.5};
		uiDef.resultFx2 = {visible:true};
		uiDef.resultContent = {visible:false, type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_HINT_BROWN};
		
		var widget = FWPool.getNode(UI_RANKING, false);
		var resultFx2 = FWUtils.getChildByName(widget, "resultFx2");
		Game.showFireworks(resultFx2, {x:0, y:0, width:cc.winSize.width, height:cc.winSize.height});
	},
	
	showRankingItems:function(uiDef)
	{
		var tabData = this.tabsData[this.currentTab];
		
		var itemDef =
		{
			bg:{type:UITYPE_IMAGE, field:"bg"},
			badge:{type:UITYPE_IMAGE, field:"badge",scale:0.9},
			avatar:{type:UITYPE_IMAGE, field:"avatar", size:64},
			name:{type:UITYPE_TEXT, field:"name", style:TEXT_STYLE_TITLE_3},
			level:{type:UITYPE_TEXT, field:"level", style:TEXT_STYLE_TEXT_DIALOG},
			icon:{type:UITYPE_IMAGE, value:tabData.targetIcon, scale:tabData.targetIconScale, visible:this.currentTab !== RANKING_TAB_LEVEL},
			count:{type:UITYPE_TEXT, field:"score", style:TEXT_STYLE_TEXT_NORMAL, visible:this.currentTab !== RANKING_TAB_LEVEL},
			gift:{visible:"data.hasGift"},
			rankNo:{type:UITYPE_TEXT, field:"rankingText", style:TEXT_STYLE_TEXT_NORMAL},
			avatarBg:{onTouchEnded:this.visitGarden.bind(this)},
		};
		
		uiDef.rankingPanel = {visible:true};
		uiDef.resultPanel = {visible:false};
		uiDef.itemList = {type:UITYPE_2D_LIST, items:tabData.items[this.filter], itemUI:UI_RANKING_ITEM, itemDef:itemDef, itemSize:cc.size(560, 100), vertical:true, visible:true};
		uiDef.itemList2 = {type:UITYPE_2D_LIST, items:tabData.playerItems[this.filter] !== null ? [tabData.playerItems[this.filter]] : [], itemUI:UI_RANKING_ITEM, itemDef:itemDef, itemSize:cc.size(560, 100), vertical:true};
		
		if(this.currentTab === RANKING_TAB_CONTEST && tabData.endTime > Game.getGameTimeInSeconds())
		{
			var highlightGift = (tabData.targetIsFinished && !tabData.targetIsRewardsReceived);
			uiDef.weeklyTargetBg = {visible:true, onTouchEnded:this.showWeeklyTargetRewards.bind(this)};	
			uiDef.weeklyTargetTitle = {type:UITYPE_TEXT, value:tabData.targetTitle, style:TEXT_STYLE_TEXT_NORMAL_GREEN};
			uiDef.weeklyTargetContent = {type:UITYPE_TEXT, value:tabData.targetContent, style:TEXT_STYLE_TEXT_HINT_BROWN};
			uiDef.weeklyTargetIcon = {type:UITYPE_IMAGE, value:tabData.targetIcon, scale:0.55};
			uiDef.weeklyTargetGiftMarker = {visible:true, type:UITYPE_SPINE, id:SPINE_GIFT_BOX_EVENT, anim:highlightGift ? "gift_box_random_active" : "gift_box_random_idle", color: highlightGift ? cc.WHITE : cc.color(128, 128, 128, 255), scale:0.6};
			uiDef.weeklyTargetReceivedIcon = {visible:tabData.targetIsRewardsReceived};
		}
		else
		{
			uiDef.weeklyTargetBg = {visible:false};
			uiDef.weeklyTargetGiftMarker = {visible:false};
		}
		if((this.currentTab === RANKING_TAB_CONTEST && tabData.endTime < Game.getGameTimeInSeconds() ) || (this.currentTab === RANKING_TAB_EVENT && tabData.endTimeEvent < Game.getGameTimeInSeconds()))
		{
			uiDef.timeOutRanking = {visible:true,type:UITYPE_TEXT, value:"TXT_RANKING_TIME_OUT_TITLE", style:TEXT_STYLE_TEXT_NORMAL_GREEN};
		}
		else
		{
			uiDef.timeOutRanking = {visible:false};
		}
		
		if(this.isWeeklyTargetRewardsShown)
		{
			uiDef.rankingReward = {visible:true};
			var rewardItemDef =
			{
				gfx:{type:UITYPE_ITEM, field:"itemId"},
				amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
			};
			uiDef.rankingRewardText = {type:UITYPE_TEXT, value:"TXT_RANKING_POSSIBLE_REWARDS", style:TEXT_STYLE_TEXT_DIALOG};	
			uiDef.rankingRewardList = {type:UITYPE_2D_LIST, items:tabData.targetRewards, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
			uiDef.leftArrow = {visible:tabData.targetRewards.length > 5};
			uiDef.rightArrow = {visible:tabData.targetRewards.length > 5};
			uiDef.darkBg = {onTouchEnded:this.hideWeeklyTargetRewards.bind(this)};
		}
		else
			uiDef.rankingReward = {visible:false};
	},
	
	visitGarden:function(sender)
	{
		var data = sender.uiData;
		if(data.uid === gv.mainUserData.mainUserId)
			return;
		
		GardenManager.changeGarden(data.uid, data.name, data.avatar);
	},
	
	showWeeklyTargetRewards:function(sender)
	{
		var tabData = this.tabsData[this.currentTab];
		if(tabData.targetIsRewardsReceived)
			return;
		
		if(tabData.targetIsFinished)
		{
			if(Game.canReceiveGift(tabData.targetRewards))
			{
				Ranking.receiveRewardPos = sender.getTouchEndPosition();
				
				// receive
				var pk = network.connector.client.getOutPacket(this.RequestRankingClaimRewardDefault);
				pk.pack(g_RANKING.tabConstants[this.currentTab].ID);
				network.connector.client.sendPacket(pk);
			}
		}
		else
		{
			// show rewards info
			this.isWeeklyTargetRewardsShown = true;
			this.show(true);
		}
	},
	
	hideWeeklyTargetRewards:function(sender)
	{
		this.isWeeklyTargetRewardsShown = false;
		this.show(true);
	},
	
	onLevelUp:function(level, prevLevel)
	{
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE || Game.isFriendGarden())
			return;
		
		if(prevLevel < g_MISCINFO.RANKING_BOARD_LEVEL && level >= g_MISCINFO.RANKING_BOARD_LEVEL)
		{
			// jira#6432
			if(gv.background && gv.background.floorIndex >= 0)
				gv.background.snapGround();
				
			// fix: pointer does not move with background
			//var pos = gv.background.animLeabderboard.getWorldPosition();
			//pos.y += 40;
			//Game.gameScene.showFocusPointer("ranking", pos.x, pos.y, true, Z_UI_COMMON - 1, 3);
			var pos = gv.background.animLeabderboard.getPosition();
			pos.y += 40;
			Game.gameScene.showFocusPointer("ranking", pos.x, pos.y, true, Z_FX, 3, gv.background.animLeabderboard.getParent());
		}
	},
	
	refreshNotification:function()
	{
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE || !this.tabsData)
		{
			gv.background.notifyLeaderboard.setVisible(false);
			return;
		}
		
		var icon = null;
		var checkTabs = [RANKING_TAB_CONTEST, RANKING_TAB_EVENT];
		for(var i=0; i<checkTabs && !icon; i++)
		{
			var tabData = this.tabsData[checkTabs[i]];
			if(tabData && tabData.startTime < Game.getGameTimerInSeconds())
			{
				if(tabData.isFinished)
					icon = "hud/icon_tab_gift_event.png"
				else
					icon = "hud/icon_newspaper.png"
			}
		}
		if(icon)
		{
			gv.background.notifyLeaderboard.setVisible(true);
			gv.background.notifyLeaderboardIcon.loadTexture(icon, ccui.Widget.PLIST_TEXTURE);
		}
		else
			gv.background.notifyLeaderboard.setVisible(false);
	},
	
	getTop:function()
	{
		if(RANKING_FAKE_DATA)
			this.onGetTopResult(null);
		else
		{
			var pk = network.connector.client.getOutPacket(this.RequestRankingGetTop);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
	},
	
	onGetTopResult:function(data)
	{
		// log
		//cc.log("Ranking::onGetTopResult: data=" + JSON.stringify(data));
		cc.log("Ranking::onGetTopResult:");
		if(data && data[KEY_ITEMS])
		{
			for(var i=0; i<data[KEY_ITEMS].length; i++)
				cc.log(i + ": " + JSON.stringify(data[KEY_ITEMS][i]));
		}
		else
			cc.log("no data");
		
		cc.log("GAME_RANKING_PR=" + JSON.stringify(gv.mainUserData.game[GAME_RANKING_PR]));
		this.svrData = data;
		
		// fix: item list not scrolling up
		var isRefresh = true;
		
		// use data from constant if server returns incorrect data
		var currentTime = Game.getGameTimeInSeconds();
		for(var key in g_RANKING.TOP_ACTIONS)
		{
			var action = g_RANKING.TOP_ACTIONS[key];
			if(action.UNIX_START_TIME < currentTime && action.UNIX_END_TIME > currentTime && action.ID !== g_RANKING.tabConstants[RANKING_TAB_CONTEST].ID)
			{
				cc.log("Ranking::onGetTopResult: replace server action " + g_RANKING.tabConstants[RANKING_TAB_CONTEST].ID + " with constant action " + action.ID);
				
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_ID, action.ID);
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_GROUP_LEVEL, gv.mainUserData.getLevel());
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_START_TIME, action.UNIX_START_TIME);
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_POINT, 0);
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_ORDER, -1);
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_STATUS, g_MISCINFO.RANKING_BOARD_STATUS_OPEN);
				this.setUserRankData(RANKING_TAB_CONTEST, RANK_CLAIM_REWARD, false);
				this.initConstants();
				
				if(this.svrData && this.svrData[KEY_ITEMS] && this.svrData[KEY_ITEMS][RANKING_TAB_CONTEST])
					this.svrData[KEY_ITEMS][RANKING_TAB_CONTEST][RANK_LIST] = [];
				
				isRefresh = false;
				
				break;
			}
		}
		
		this.tabsData = {};
		this.friendlistUpdated = true;
		for(var i=0; i<RANKING_TABS_COUNT; i++)
		{
			var tabData = {tab:i};
			this.updateTabDisplayData(tabData);
			this.tabsData[i] = tabData;
		}
		
		this.friendlistUpdated = true;
		
		if(FWUI.isShowing(UI_RANKING))
			this.show(isRefresh);
	},
	
	getPR:function()
	{
		var pk = network.connector.client.getOutPacket(this.RequestRankingGetPR);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onGetPRResult:function(data)
	{
		cc.log("Ranking::onGetPRResult: data=" + JSON.stringify(data));
		
		if(!data)
			return;
		
		gv.mainUserData.game[GAME_RANKING_PR] = data;
		this.initConstants();
		
		if(FWUI.isShowing(UI_POPUP_USER_INFO))
			gv.miniPopup.popupUserInfo.fillUserData();
		else
			this.getTop();
	},
	
	getLevelGroupInfo:function(tab, level)
	{
		var levels = g_RANKING.tabConstants[tab].LEVELS;
		var res = {};
		for(var i=0; i<levels.length - 1; i++)
		{
			if(level <= levels[i])
			{
				res.index = i;
				res.startLevel = (i <= 0 ? 1 : levels[i - 1] + 1);
				res.endLevel = levels[i];
				res.text = cc.formatStr(FWLocalization.text("TXT_RANKING_GROUP_LEVEL"), res.startLevel, res.endLevel);
				return res;
			}
		}
		
		res.index = levels.length;
		res.startLevel = levels[levels.length - 2] + 1;
		res.endLevel = levels[levels.length - 1];
		res.text = cc.formatStr(FWLocalization.text("TXT_RANKING_GROUP_LEVEL2"), res.startLevel);
		
		return res;
	},
	
	getTabIcon:function(tab)
	{
		if(tab === RANKING_TAB_LEVEL)
			return {icon:"hud/icon_exp.png", scale:0.5};
		else if(tab === RANKING_TAB_VALUE)
			return {icon:"hud/icon_tab_rank_richer.png", scale:0.5};//return {icon:"hud/icon_gold.png", scale:0.5};
		else if(tab === RANKING_TAB_EVENT)
		{
			// fix: null icon when event ends
			//if(GameEvent.currentEvent)
			//	return {icon:"items/item_event.png", scale:0.4};
			//else if(GameEventTemplate2.getActiveEvent())
			//	return {icon:"items/item_event02_token05.png", scale:0.4};
			if(this.svrData && this.svrData[KEY_ITEMS] && this.svrData[KEY_ITEMS][RANKING_TAB_EVENT])
			{
				var id = this.svrData[KEY_ITEMS][RANKING_TAB_EVENT][RANK_ID];
				if(id === "TOP_EVENT_E1ID")
					return {icon:"items/" + g_EVENT_ITEMS[g_EVENT_01.E01_POINT].GFX, scale:0.4};
				else if(id === "TOP_EVENT_E2ID")
					return {icon:"items/" + g_EVENT_ITEMS[g_EVENT_02.E02_POINT].GFX, scale:0.4};
                    else if(id === "TOP_EVENT_E3ID")
					return {icon:"items/" + g_EVENT_ITEMS[g_EVENT_03.E03_POINT].GFX, scale:0.4};
			}
			return {icon:"hud/icon_tab_rank_richer.png", scale:0.5};
		}
		else if(tab === RANKING_TAB_CONTEST)
			return {icon:g_RANKING.tabConstants[tab].ICON, scale:0.35};
		return null;
	},
	
	getUserRankData:function(tab, key)
	{
		if(!gv.mainUserData.game[GAME_RANKING_PR]
			|| !gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS]
			|| !gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS][tab])
			return 0;

		return (gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS][tab][key] || 0);
	},
	
	setUserRankData:function(tab, key, value)
	{
		if(gv.mainUserData.game[GAME_RANKING_PR] && gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS] && gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS][tab])
		{
			gv.mainUserData.game[GAME_RANKING_PR][KEY_ITEMS][tab][key] = value;
			return true;
		}
		return false;
	},
	
	showInfo:function(sender)
	{
		gv.miniPopup.showLeaderboardInfo();
	},

	getScoreEvent3: function(score,tab)
	{
		if(tab == RANKING_TAB_EVENT &&  GameEventTemplate3.getActiveEvent())
		{
			return Math.floor(score/100);
		}
		return score;
	},
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestRankingGetTop:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.RANKING_GET_TOP);},
		pack:function()
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseRankingGetTop:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
			{
				cc.log("Ranking::ResponseRankingGetTop: error=" + this.getError());
				Ranking.onGetTopResult(null);
			}
			else
				Ranking.onGetTopResult(object);
		}
	}),	
	
	RequestRankingGetPR:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.RANKING_GET_PR);},
		pack:function()
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseRankingGetPR:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
			{
				cc.log("Ranking::ResponseRankingGetPR: error=" + this.getError());
				Ranking.onGetPRResult(null);
			}
			else
				Ranking.onGetPRResult(object[KEY_ITEMS]);
		}
	}),	
	
	RequestRankingClaimRewardDefault:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.RANKING_CLAIM_REWARD_DEFAULT);},
		pack:function(rankingId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_UID, rankingId);
			
			addPacketFooter(this);
		},
	}),

	ResponseRankingClaimRewardDefault:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
				cc.log("Ranking::ResponseRankingClaimRewardDefault: error=" + this.getError());
			else
			{
				// fx
				FWUtils.showFlyingItemIcons(Ranking.tabsData[Ranking.currentTab].targetRewards, Ranking.receiveRewardPos);
				Ranking.tabsData[Ranking.currentTab].targetIsRewardsReceived = true;
				Ranking.setUserRankData(Ranking.currentTab, RANK_CLAIM_REWARD, true);
				
				Game.updateUserDataFromServer(object);
				
				// jira#6183
				Ranking.getPR();
			}
		}
	}),	
};

network.packetMap[gv.CMD.RANKING_GET_TOP] = Ranking.ResponseRankingGetTop;
network.packetMap[gv.CMD.RANKING_GET_PR] = Ranking.ResponseRankingGetPR;
network.packetMap[gv.CMD.RANKING_CLAIM_REWARD_DEFAULT] = Ranking.ResponseRankingClaimRewardDefault;



