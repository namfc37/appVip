
// server:
// - helped count

const GUILD_TAB_GUILD = 0;
const GUILD_TAB_INBOX = 1;
const GUILD_TAB_SEARCH = 2;

const GUILD_STATE_NONE = -1;
const GUILD_STATE_CREATE = 0;
const GUILD_STATE_AVATAR = 1;
const GUILD_STATE_EDIT = 2;
const GUILD_STATE_INFO = 3;
const GUILD_STATE_PRIVILEGE = 4;
const GUILD_STATE_MESSAGE = 7;
const GUILD_STATE_INBOX = 9;
const GUILD_STATE_SEARCH = 10;

const GUILD_ACTION_SEND_MESSAGE = 1;
const GUILD_ACTION_EDIT = 2;
const GUILD_ACTION_VISIT = 4;
const GUILD_ACTION_SET_PRIVILEGE = 8;
const GUILD_ACTION_KICK = 16;
const GUILD_ACTION_ADD_REMOVE_MEMBERS = 32;
const GUILD_ACTION_INVITE = 64;
const GUILD_ACTION_EDIT_TASK = 128;

const GUILD_TYPE_TEXTS = ["Error", "TXT_GUILD_TYPE_OPEN", "TXT_GUILD_TYPE_CLOSED", "TXT_GUILD_TYPE_REQUEST"];
const GUILD_ROLE_TEXTS = ["Error", "TXT_GUILD_ROLE_PRESIDENT", "TXT_GUILD_ROLE_DEPUTY", "TXT_GUILD_ROLE_MEMBER", "TXT_GUILD_ROLE_GUEST", "TXT_GUILD_ROLE_STRANGER"];

const GUILD_AVATARS = [
	 "guild/hud_badge_01.png",
	 "guild/hud_badge_02.png",
	 "guild/hud_badge_03.png",
	 "guild/hud_badge_04.png",
	 "guild/hud_badge_05.png",
	 "guild/hud_badge_06.png",
	 "guild/hud_badge_07.png",
	 "guild/hud_badge_08.png",
];

// replaced with getGuildRequireLevelMin & getGuildRequireLevelMax
//const GUILD_REQUIRE_LEVEL_MIN = g_MISCINFO.GUILD_USER_LEVEL;
//const GUILD_REQUIRE_LEVEL_MAX = 9999;

const MAIL_GUILD_MEMBER_REQUEST = 9999;

var Guild =
{
	currentTab: GUILD_TAB_GUILD,
	currentState: GUILD_STATE_CREATE,
	stateStack: [],
	
	playerGuildData: null, // brief guild data of player
	data: null, // data of player's guild
	currentData: null, // data of currently viewing guild (can be another guild)
	
	mailList: [],
	mailGuildDisband: null,

	// sync with guild data
	guildName: "",
	guildDesc: "",
	guildType: GUILD_TYPE_OPEN,
	guildRequireLevel: g_MISCINFO.GUILD_USER_LEVEL,
	guildAvatar: GUILD_AVATARS[0],
	selectedAvatar: GUILD_AVATARS[0],
	
	init:function()
	{

	},
	
	uninit:function()
	{
		
	},
	
	load:function(guildId, callback)
	{
		this.loadCallback = callback;
		var pk = network.connector.client.getOutPacket(this.RequestGuildGet);
		pk.pack(guildId);
		network.connector.client.sendPacket(pk);
	},
	
	resourcesLoaded: false,
	loadGuildResources:function(callback)
	{
		showLoadingProgress();
		var spineFiles = SPINE_NPC_PUSS.split("|");
		cc.loader.load([
						// jira#7419
						//GUILD_DUMMY_PLIST,
						//GUILD_DUMMY_PLIST.replace(".plist", ".png"),
						UI_GUILD,
						UI_GUILD_AVATAR_SELECTION,
						UI_GUILD_AVATAR_ITEM,
						UI_GUILD_MEMBER_LIST_ITEM,
						UI_GUILD_CONTEXT_MENU,
						UI_GUILD_PRIVILEGE,
						UI_GUILD_SEND_MESSAGE,
						UI_GUILD_INBOX_ITEM,
						UI_GUILD_SEARCH_ITEM,
						spineFiles[0],
						spineFiles[1],
						spineFiles[0].replace(".json", ".png")], 
			function()
			{
				//cc.spriteFrameCache.addSpriteFrames(GUILD_DUMMY_PLIST);
				this.resourcesLoaded = true;
				callback();
				showLoadingProgress(false);
			}.bind(this));				
	},
	
	show:function()
	{
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			this.loadGuildResources(this.show.bind(this));
			return;
		}
		
		// fix: disband issue
		if(this.mailGuildDisband)
		{
			if(this.isPlayerInGuild() && this.getGuildId() === this.mailGuildDisband[MAIL_SENDER])
			{
				this.setData(null);
				this.setPlayerGuildData(null);
				return;
			}
			else
				this.mailGuildDisband = null;
		}
		
		if(this.isPlayerInGuild() && !this.data)
		{
			// not loaded
			this.load(this.playerGuildData[GUILD_USER_ID], function(data) {Guild.setData(data); Guild.show();});
			return;
		}
		
		this.showTab(GUILD_TAB_GUILD);
	},
	
	showMainUi:function()
	{
		var viewOnly = Game.isFriendGarden();
		
		if(this.hasInfo === undefined)
			this.hasInfo = (FWLocalization.text("TXT_GUILD_INFO_TITLE") !== "TXT_GUILD_INFO_TITLE" && FWLocalization.text("TXT_GUILD_INFO_CONTENT") !== "TXT_GUILD_INFO_CONTENT");
		
		var uiDef =
		{
			createGuild:{visible:false},
			guildInfo:{visible:false},
			guildSearch:{visible:false},
			inbox:{visible:false},
			tabGuildOn:{visible:this.currentTab === GUILD_TAB_GUILD || viewOnly},
			tabInboxOn:{visible:this.currentTab === GUILD_TAB_INBOX && !viewOnly},
			tabSearchOn:{visible:this.currentTab === GUILD_TAB_SEARCH && !viewOnly},
			tabGuildOff:{visible:this.currentTab !== GUILD_TAB_GUILD && !viewOnly, onTouchEnded:this.showTab.bind(this, GUILD_TAB_GUILD)},
			tabInboxOff:{visible:this.currentTab !== GUILD_TAB_INBOX && !viewOnly, onTouchEnded:this.showTab.bind(this, GUILD_TAB_INBOX)},
			tabSearchOff:{visible:this.currentTab !== GUILD_TAB_SEARCH && !viewOnly, onTouchEnded:function() {Guild.hasPerformedSearch = false; Guild.searchResult = []; Guild.showTab(GUILD_TAB_SEARCH);}},
			textGuildOn:{type:UITYPE_TEXT, value:this.isPlayerInGuild() || viewOnly ? "TXT_GUILD_TAB_GUILD" : "TXT_GUILD_GUILD", style:TEXT_STYLE_TEXT_NORMAL},
			textGuildOff:{type:UITYPE_TEXT, value:this.isPlayerInGuild() ? "TXT_GUILD_TAB_GUILD" : "TXT_GUILD_GUILD", style:TEXT_STYLE_TEXT_NORMAL},
			textInboxOn:{type:UITYPE_TEXT, value:"TXT_GUILD_INBOX", style:TEXT_STYLE_TEXT_NORMAL},
			textInboxOff:{type:UITYPE_TEXT, value:"TXT_GUILD_INBOX", style:TEXT_STYLE_TEXT_NORMAL},
			textSearchOn:{type:UITYPE_TEXT, value:"TXT_GUILD_SEARCH", style:TEXT_STYLE_TEXT_NORMAL},
			textSearchOff:{type:UITYPE_TEXT, value:"TXT_GUILD_SEARCH", style:TEXT_STYLE_TEXT_NORMAL},
			closeButton:{onTouchEnded:this.popAllStates.bind(this)},
			backButton:{onTouchEnded:this.handleBackKey.bind(this), visible:this.stateStack.length > 1},
			npcMarker:{visible:false},
			infoButton:{onTouchEnded:this.showInfo.bind(this), visible:this.hasInfo},
		};
		
		if(this.currentState === GUILD_STATE_CREATE)
			this.showGuildEdit(uiDef, true);
		else if(this.currentState === GUILD_STATE_EDIT)
			this.showGuildEdit(uiDef);
		else if(this.currentState === GUILD_STATE_INFO)
			this.showGuildInfo(uiDef);
		else if(this.currentState === GUILD_STATE_INBOX)
			this.showInbox(uiDef);
		else if(this.currentState === GUILD_STATE_SEARCH)
		{
			if(this.hasPerformedSearch)
			{
				// show search result
				this.showSearch(uiDef);
			}
			else if(Game.getGameTimeInSeconds() - this.lastSuggestionTime >= g_MISCINFO.GUILD_SUGGEST_COOLDOWN)
			{
				// show empty or previous suggestion
				this.showSearch(uiDef);
				
				// load suggestion
				this.lastSuggestionTime = Game.getGameTimeInSeconds();
				var pk = network.connector.client.getOutPacket(this.RequestGuildSuggest);
				pk.pack();
				network.connector.client.sendPacket(pk);
			}
			else
			{
				// show loaded suggestion
				this.searchResult = this.suggestionResult;
				this.showSearch(uiDef);
			}
		}
		
		// show
		var widget = FWPool.getNode(UI_GUILD, false);
		if(FWUI.isWidgetShowing(widget))
		{
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			//FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgGuild");
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.handleBackKeyFunc)
				this.handleBackKeyFunc = this.handleBackKey.bind(this);
			Game.gameScene.registerBackKey(this.handleBackKeyFunc);
		}

		if(this.currentState === GUILD_STATE_CREATE){
			var cgPanelStatus = FWUI.getChildByName(widget,"cgPanelStatus");
			var cgPanelLevel = FWUI.getChildByName(widget,"cgPanelLevel");
			var cgPanelValue = FWUI.getChildByName(widget,"cgPanelValue");

			if(g_MISCINFO.GUILD_CREATE_REQUIRE_APPRAISAL == 0){
				if(cgPanelLevel && cgPanelStatus && cgPanelValue){
					cgPanelLevel.setPositionX(cgPanelValue.getPositionX()-100);
					cgPanelStatus.setPositionX(cgPanelValue.getPositionX()-400);
				}
			}

		}
	},
	
	hide:function()
	{
		//FWUtils.hideDarkBg(null, "darkBgGuild");
		FWUI.hide(UI_GUILD, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.handleBackKeyFunc);
		
		this.saveData();
		this.hasGuildSuggestionReceived = false;
	},
	
	onQuit:function()
	{
		this.popAllStates();
		this.setData(null);
		this.setPlayerGuildData(null);
		
		// jira#6667
		this.loadPlayerGuildData();
	},
	
	setData:function(data)
	{
		cc.log("Guild::setData: " + JSON.stringify(data));
			
		// save member list if server does not return
		var memberList;
		if(this.data && this.data[GUILD_MEMBER])
			memberList = this.data[GUILD_MEMBER];
			
		this.data = data;
		if(!data)
		{
			// reset to default
			this.guildName = "";
			this.guildDesc = "";
			this.guildType = GUILD_TYPE_OPEN;
			this.guildRequireLevel = Guild.getGuildRequireLevelMin();
			this.guildAvatar = this.selectedAvatar = GUILD_AVATARS[0];
			return;
		}
		
		// restore member list if server does not return
		if(this.data && !this.data[GUILD_MEMBER] && memberList)
			this.data[GUILD_MEMBER] = memberList;
		
		// cache variables to edit
		this.guildName = data[GUILD_NAME];
		this.guildDesc = data[GUILD_DESC];
		this.guildType = data[GUILD_TYPE];
		this.guildRequireLevel = data[GUILD_REQUIRE_MEMBER_LV_MIN];
		this.guildAvatar = this.selectedAvatar = data[GUILD_AVATAR];

		Donate.updateData (data[GUILD_DONATES]);
	},
	
	loadPlayerGuildData:function(callback)
	{
		this.loadPlayerGuildDataCallback = function(data)
		{
			Guild.setPlayerGuildData(data);
			if(data && data[GUILD_USER_ID] >= 0)
				Guild.load(data[GUILD_USER_ID], function(data2) {Guild.setData(data2); if (callback) callback (); });
			else
				Guild.setData(null);
		};
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildGetUserInfo);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	setPlayerGuildData:function(data)
	{
		if(!data)
		{
			data = {};
			data[GUILD_USER_ID] = -1;
			data[GUILD_USER_ROLE] = -1;
			data[GUILD_USER_PENATY] = 0;
			data[GUILD_USER_DONATE_REMAIN] = 0;
			data[GUILD_USER_DONATE_ITEM_REMAIN] = 0;
			data[GUILD_USER_DONATE_NEXT_TIME] = 0;
		}
		cc.log("Guild::setPlayerGuildData: " + JSON.stringify(data));
		this.playerGuildData = data;
	},

	isLoaded:function ()
	{
		return (this.data && this.data [GUILD_PRESIDENT]) ? true : false;
	},
	
	isPlayerInGuild:function(guildData)
	{
		// stranger
		if(this.playerGuildData && this.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_STRANGER)
			return false;
		
		// in specified guild?
		if(guildData)
			return (this.playerGuildData && this.playerGuildData[GUILD_USER_ID] === guildData[GUILD_ID]);

		// in any guild?
		return (this.playerGuildData && this.playerGuildData[GUILD_USER_ID] > 0);
	},

	getGuildId:function()
	{
		if (Guild.playerGuildData)
			return Guild.playerGuildData[GUILD_USER_ID];

		return -1;
	},

	getGuildName:function()
	{
		return Guild.guildName;
	},

	getGuildAvatar:function()
	{
		return Guild.guildAvatar;
	},

	getMember:function (memberId)
	{
		var index = this.getMemberIdx (memberId);
		cc.log ("Guild", "getMember", memberId, index);

		if (index < 0)
			return null;
		
		return this.data[GUILD_MEMBER][index];
	},

	getMemberRole:function (memberId)
	{
		if (this.isUserGuildPresident(memberId, this.data))
			return GUILD_ROLE_PRESIDENT;
		
		if (this.isUserGuildDeputy(memberId, this.data))
			return GUILD_ROLE_DEPUTY;
	
		var index = this.getMemberIdx (memberId);
		return index < 0 ? GUILD_ROLE_STRANGER : GUILD_ROLE_MEMBER;
	},

	canPlayerTakeAction:function(action, guildData, guildTargetMember)
	{
		if(!guildData)
			guildData = this.data;
		
		if(guildTargetMember && gv.mainUserData.userId === guildTargetMember[FRIEND_ID])
			return false; // cannot take action on self
		
		if(action === GUILD_ACTION_VISIT && guildTargetMember)
			return (gv.mainUserData.userId !== guildTargetMember[FRIEND_ID]); // can visit anyone but self
		
		if(!this.isPlayerInGuild(guildData))
			return false; // not in specified guild
		
		var playerRole = this.playerGuildData[GUILD_USER_ROLE];

		if(playerRole === GUILD_ROLE_PRESIDENT)
			return true;
		
		if(playerRole === GUILD_ROLE_DEPUTY
			&& (action === GUILD_ACTION_SEND_MESSAGE
			|| (action == GUILD_ACTION_KICK && guildTargetMember && guildTargetMember.role === GUILD_ROLE_MEMBER)
			|| action === GUILD_ACTION_INVITE
			|| action === GUILD_ACTION_ADD_REMOVE_MEMBERS
			|| action === GUILD_ACTION_EDIT_TASK
		))
			return true;
		
		return false;
	},
	
	handleBackKey:function()
	{
		if(FWUI.isContextMenuShowing())
			FWUI.hideContextMenu();
		else
			this.popState();
	},
	
	getGuildLevelInfo:function(level)
	{
		var key;
		var info;
		for(key in g_GUILD.LEVELS)
		{
			if(key > level)
				break;
			info = g_GUILD.LEVELS[key];
		}
		return info;
	},
	
	isUserGuildPresident:function(userId, guildData)
	{
		return (guildData[GUILD_PRESIDENT] === userId);
	},
	
	isUserGuildDeputy:function(userId, guildData)
	{
		var guildDeputyList = guildData[GUILD_DEPUTY];
		if(!guildDeputyList)
			return false;
		
		for(var i=0; i<guildDeputyList.length; i++)
		{
			if(guildDeputyList[i] === userId)
				return true;
		}
		
		return false;
	},
	
	saveData:function()
	{
		if(this.approvedUserList.length > 0)
		{
			var pk = network.connector.client.getOutPacket(this.RequestGuildMemberAccept);
			pk.pack(this.approvedUserList);
			network.connector.client.sendPacket(pk);
			
			this.approvedUserList = [];
		}
		
		if(this.deniedUserList.length > 0)
		{
			var pk = network.connector.client.getOutPacket(this.RequestGuildMemberReject);
			pk.pack(this.deniedUserList);
			network.connector.client.sendPacket(pk);
			
			this.deniedUserList = [];
		}
	},
	
	getMemberIdx:function(userId)
	{
		if(!this.data || !this.data[GUILD_MEMBER])
			return -1;
		
		var guildMembers = this.data[GUILD_MEMBER];
		for(var i=0; i<guildMembers.length; i++)
		{
			if(guildMembers[i][FRIEND_ID] === userId)
				return i;
		}
		return -1;
	},
	
	removeMemberById:function(userId)
	{
		var idx = this.getMemberIdx(userId);
		if(idx >= 0)
		{
			this.data[GUILD_MEMBER].splice(idx, 1);
			
			// jira#6680
			this.data[GUILD_MEMBER_NUMBER] = this.data[GUILD_MEMBER].length;
			
			// update deputy list
			var deputyIdx = this.data[GUILD_DEPUTY].indexOf(userId);
			if(deputyIdx >= 0)
				this.data[GUILD_DEPUTY].splice(deputyIdx, 1);
		}
	},
	
	getMembersCount:function(guildData)
	{
		if(!guildData)
		{
			if(!this.data)
				return 0;
			guildData = this.data;
		}
			
		if(guildData[GUILD_MEMBER_NUMBER])
			return guildData[GUILD_MEMBER_NUMBER];
		else if(guildData[GUILD_MEMBER])
			return guildData[GUILD_MEMBER].length;
		return 0;
	},
	getTimeCreateGuild:function(guildData) {
		if (!this.data) return -1;
		if(this.data[GUILD_TIME_CREATE]) return this.data[GUILD_TIME_CREATE];
		return -1;
	},
	
	getMembersLimit:function(guildData)
	{
		if(!guildData)
			guildData = this.data;
		
		return this.getGuildLevelInfo(guildData[GUILD_LEVEL]).MEMBERS;
	},
	
	onRemoteUpdate:function()
	{
		if(this.currentTab === GUILD_TAB_GUILD && this.currentState === GUILD_STATE_INFO)
			this.showTab(GUILD_TAB_GUILD);
	},
	
	getGuildRequireLevelMin:function()
	{
		return (g_MISCINFO.GUILD_USER_LEVEL + g_MISCINFO.GUILD_CREATE_LEVEL_MIN);
	},
	
	getGuildRequireLevelMax:function()
	{
		return (gv.mainUserData.getLevel() + g_MISCINFO.GUILD_CREATE_LEVEL_MAX);
	},	
	
	isInvitedToJoinGuild:function(guildId)
	{
		if(!this.mailList)
			return false;
		
		for(var i=0; i<this.mailList.length; i++)
		{
			if(this.mailList[i][MAIL_TYPE] === MAIL_GUILD_INVITE && this.mailList[i][MAIL_SENDER] === guildId)
				return true;
		}
		
		return false;
	},
	
	showInfo:function()
	{
		Game.showCommonHint("TXT_GUILD_INFO_TITLE", "TXT_GUILD_INFO_CONTENT");
	},

///////////////////////////////////////////////////////////////////////////////////////
// guild edit /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showGuildEdit:function(uiDef, isCreateNew)//web showGuildEdit:function(uiDef, isCreateNew = false)
	{
		if(isCreateNew === undefined)
			isCreateNew = false;
		
		var uiDef2 = 
		{
			createGuild:{visible:true},
			cgAvatar:{type:UITYPE_IMAGE, value:this.guildAvatar, onTouchEnded:this.pushState.bind(this, GUILD_STATE_AVATAR), scale:0.85},
			cgAvatarButton:{onTouchEnded:this.pushState.bind(this, GUILD_STATE_AVATAR)},
			cgGuildNameTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_NAME", style:TEXT_STYLE_TEXT_NORMAL2_ORANGE},
			cgGuildNameInvalid:{visible:false},//cgGuildNameInvalid:{type:UITYPE_TEXT, value:"TXT_GUILD_NAME_HINT", style:TEXT_STYLE_TEXT_DIALOG, visible:isCreateNew},// jira#6598 cgGuildNameInvalid:{visible:false},//jira#6598 cgGuildNameInvalid:{type:UITYPE_TEXT, value:"TXT_GUILD_ERROR_INVALID_NAME", style:TEXT_STYLE_TEXT_DIALOG, visible:this.guildName.length > 0 && !this.validateGuildName(this.guildName)},
			cgGuildNameLockIcon:{visible:!isCreateNew},
			cgGuildDescTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_DESC", style:TEXT_STYLE_TEXT_NORMAL2_ORANGE},
			cgGuildDescInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:cc.formatStr(FWLocalization.text("TXT_GUILD_DESC_PLACEHOLDER"), g_MISCINFO.GUILD_INTRO_LENGHT), placeHolderColor:cc.color.GREY, value:this.guildDesc, listener:[this.cgGuildDescInputListener,this], lengthLimit:g_MISCINFO.GUILD_INTRO_LENGHT},
			cgGuildStatusTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_TYPE", style:TEXT_STYLE_TEXT_NORMAL2_ORANGE},
			cgGuildLevelTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_REQUIRED_LEVEL", style:TEXT_STYLE_TEXT_NORMAL2_ORANGE},
			cgGuildValueTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_REQUIRED_VALUE", style:TEXT_STYLE_TEXT_NORMAL2_ORANGE},
			cgStatusDec:{onTouchEnded:this.onGuildTypeChanging.bind(this)},
			cgStatusInc:{onTouchEnded:this.onGuildTypeChanging.bind(this)},
			cgLevelDec:{onTouchBegan:this.onGuildRequiredLevelChanging.bind(this), onTouchHold:this.onGuildRequiredLevelChanging.bind(this)},
			cgLevelInc:{onTouchBegan:this.onGuildRequiredLevelChanging.bind(this), onTouchHold:this.onGuildRequiredLevelChanging.bind(this)},
			cgGuildStatus:{type:UITYPE_TEXT, value:GUILD_TYPE_TEXTS[this.guildType], style:TEXT_STYLE_TEXT_NORMAL},
			cgGuildLevel:{type:UITYPE_TEXT, value:cc.formatStr(FWLocalization.text("TXT_LV"), this.guildRequireLevel), style:TEXT_STYLE_TEXT_NORMAL},
			cgGuildValue:{type:UITYPE_TEXT, value:g_MISCINFO.GUILD_CREATE_REQUIRE_APPRAISAL, style:TEXT_STYLE_TEXT_NORMAL},
			cgPanelValue:{visible:g_MISCINFO.GUILD_CREATE_REQUIRE_APPRAISAL != 0},
			cgItemsTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_REQUIRED_ITEMS", style:TEXT_STYLE_TEXT_DIALOG, visible:isCreateNew},
			cgNPCHint:{type:UITYPE_TEXT, value:"TXT_GUILD_EDIT_HINT", style:TEXT_STYLE_TEXT_DIALOG, visible:!isCreateNew},
			npcMarker:{type:UITYPE_SPINE, value:SPINE_NPC_PUSS, anim:"talk", scale:0.375, visible:true},
		};
		
		var uiDef3;
		if(!isCreateNew)
		{
			uiDef3 = 
			{
				cgGuildNameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, enabled:false, value:this.guildName},
				cgCreateButton:{visible:false},
				cgSaveButton:{visible:true, onTouchEnded:this.createGuild.bind(this)},
				cgSaveButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_SAVE", style:TEXT_STYLE_TEXT_BUTTON},
				cgItemsList:{visible:false},
			};
		}
		else
		{
			uiDef3 = 
			{
				cgGuildNameInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:cc.formatStr(FWLocalization.text("TXT_GUILD_NAME_HINT"), g_MISCINFO.GUILD_NAME_LENGHT), placeHolderColor:cc.color.GREY, listener:[this.cgGuildNameInputListener,this], enabled:true, value:this.guildName, lengthLimit:g_MISCINFO.GUILD_NAME_LENGHT},
				cgCreateButton:{visible:true, onTouchEnded:this.createGuild.bind(this)},
				cgCreateButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_CREATE", style:TEXT_STYLE_TEXT_BUTTON},
				cgCreateButtonPrice:{type:UITYPE_TEXT, value:g_MISCINFO.GUILD_CREATE_REQUIRE_COIN, style:TEXT_STYLE_TEXT_BUTTON, useK:true},
				cgSaveButton:{visible:false},
			};
			FWUtils.buildRequiredItemsListDef(uiDef3, "cgItemsList", g_MISCINFO.GUILD_CREATE_REQUIRE_ITEMS);
		}
		
		_.extend(uiDef, uiDef2, uiDef3);
	},

	onGuildTypeChanging:function(sender)
	{
		this.guildType += (sender.getName().endsWith("Inc") ? 1 : -1);
		this.guildType = FWUtils.clamp(this.guildType, GUILD_TYPE_OPEN, GUILD_TYPE_REQUEST);
		this.showMainUi();
	},
	
	onGuildRequiredLevelChanging:function(sender)
	{
		this.guildRequireLevel += (sender.getName().endsWith("Inc") ? 1 : -1);
		this.guildRequireLevel = FWUtils.clamp(this.guildRequireLevel, Guild.getGuildRequireLevelMin(), Guild.getGuildRequireLevelMax());
		this.showMainUi();
	},
	
	createGuild:function(sender)
	{
		var pos = FWUtils.getWorldPosition(sender);
		
		// validate
		var widget = FWPool.getNode(UI_GUILD, false);
		if(this.guildName)
			this.guildName = this.guildName.trim();
		if(!this.guildName || this.guildName.length <= 0 || !this.validateGuildName(this.guildName))
		{
			// feedback
			//Game.showPopup({title:"", content:(!this.guildName || this.guildName.length <= 0 ? "TXT_GUILD_ERROR_EMPTY_NAME" : "TXT_GUILD_ERROR_INVALID_NAME")}, true);
			FWUtils.showWarningText(FWLocalization.text(!this.guildName || this.guildName.length <= 0 ? "TXT_GUILD_ERROR_EMPTY_NAME" : "TXT_GUILD_ERROR_INVALID_NAME"), pos);
			return;
		}

		// validate
		var cgGuildDescInput = FWUtils.getChildByName(widget, "cgGuildDescInput");
		var guildDesc = cgGuildDescInput.getString();
		if(!guildDesc || guildDesc.length <= 0)
		{
			// feedback
			//Game.showPopup({title:"", content:"TXT_GUILD_ERROR_EMPTY_DESC"}, true);
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_EMPTY_DESC"), pos);
			return;
		}

        // check level
		var cgGuildLevel = FWUtils.getChildByName(widget, "cgGuildLevel");
		var levelStr = cgGuildLevel.getString();
		var levels = [-1, -1];
		if(levelStr && levelStr.length > 0)
		{
			var num = levelStr.replace (cc.formatStr(FWLocalization.text("TXT_LV"), ""), "").trim();
			var levelMin = _.isNaN(num) ? -1 : Number (num);
			levels [0] = levelMin;
		}
		else
			levels[0] = this.getGuildRequireLevelMin();
		levels[1] = -1;// feedback: don't send max level to server this.getGuildRequireLevelMax();
		
		if(this.currentState === GUILD_STATE_EDIT)
		{
			// save
			// feedback: only send changed fields
			var avatar = (this.guildAvatar === Guild.data[GUILD_AVATAR] ? null : this.guildAvatar);
			var guildType = (this.guildType === Guild.data[GUILD_TYPE] ? null : this.guildType);
			if(guildDesc === Guild.data[GUILD_DESC])
				guildDesc = null;
			
			// must always send levels otherwise required level will become -1
			//if(levels[0] === Guild.data[GUILD_REQUIRE_MEMBER_LV_MIN] && levels[1] === Guild.data[GUILD_REQUIRE_MEMBER_LV_MAX])
			//	levels = null;

			if(avatar !== null || guildType !== null || guildDesc !== null || levels !== null)
			{
				var pk = network.connector.client.getOutPacket(this.RequestGuildSetSetting);
				pk.pack(avatar, guildDesc, guildType, levels);
				network.connector.client.sendPacket(pk);
			}
			else
				Guild.showTab(GUILD_TAB_GUILD);
			return;
		}

		// check appraisal
		if(Game.getGardenValue() < g_MISCINFO.GUILD_CREATE_REQUIRE_APPRAISAL)
		{
			// feedback
			//Game.showPopup({title:"", content:"TXT_GUILD_ERROR_APPRAISAL"}, true);
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_APPRAISAL"), pos);
			return;
		}
		
		// require items
		// gold must be processed separately
		var requireItems = _.clone(g_MISCINFO.GUILD_CREATE_REQUIRE_ITEMS);
		var requireGold = (requireItems[ID_GOLD] || 0);
		delete requireItems[ID_GOLD];
		
		// check gold && coin
		if(!Game.checkEnoughGold(requireGold) || !Game.checkEnoughDiamond(g_MISCINFO.GUILD_CREATE_REQUIRE_COIN))
			return;
		
		// check items
		requireItems = FWUtils.getItemsArray(requireItems);
		if(!Game.consumeItems(requireItems, pos))
		{
			Game.showQuickBuy(requireItems, function() {this.showMainUi();}.bind(this));
			return;
		}
		
		// consume
		pos.y -= 50;
		Game.consumeDiamond(g_MISCINFO.GUILD_CREATE_REQUIRE_COIN, pos);
		if(requireGold > 0)
		{
			pos.y -= 50;
			Game.consumeGold(requireGold, pos);
		}

		// server
		var pk = network.connector.client.getOutPacket(this.RequestGuildCreate);
		// feedback: don't sent max level to server
		//pk.pack(this.guildName, this.guildAvatar, guildDesc, this.guildType, [this.guildRequireLevel, this.getGuildRequireLevelMax()]);
		pk.pack(this.guildName, this.guildAvatar, guildDesc, this.guildType, [this.guildRequireLevel, -1]);
		network.connector.client.sendPacket(pk);
	},
	
	cgGuildNameInputListener:function(sender)
	{
		// jira#6598
		/*if(!this.cgGuildNameInvalid)
		{
			var widget = FWPool.getNode(UI_GUILD, false);
			this.cgGuildNameInvalid = FWUtils.getChildByName(widget, "cgGuildNameInvalid");
		}
		
		this.guildName = sender.getString();
		
		if(this.guildName.length <= 0 || this.validateGuildName(this.guildName))
			this.cgGuildNameInvalid.setVisible(false);
		else
		{
			this.cgGuildNameInvalid.setVisible(true);
			this.cgGuildNameInvalid.setString(FWLocalization.text("TXT_GUILD_ERROR_INVALID_NAME"));
		}*/
		
		// jira#6657
		//this.guildName = sender.getString();
		this.guildName = Chatbox.filter(Chatbox.tree, sender.getString());
		sender.setString(this.guildName);
	},
	
	validateGuildName:function(name)
	{
		if(name.length < 3)
			return false;
		else
		{
			name = FWUtils.clearAccent(name);
			
			// jira#6723
			//var match = name.match('[a-zA-Z]+[a-zA-Z0-9\ ]+[a-zA-Z0-9\]');
			var match = name.match('[a-zA-Z0-9\ ]+[a-zA-Z0-9\]');
			
			cc.log("Guild::validateGuildName: name=" + name + " match=" + (match ? match[0] : null));
			
			if(!match || name !== match[0])
				return false;
		}
		return true;
	},
	
	cgGuildDescInputListener:function(sender)
	{
		// jira#6657
		//this.guildDesc = sender.getString();
		this.guildDesc = Chatbox.filter(Chatbox.tree, sender.getString());
		sender.setString(this.guildDesc);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// avatar /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showAvatarSelection:function(sender)
	{
		var itemList = [];
		for(var i=0; i<GUILD_AVATARS.length; i++)
		{
			var item = {avatar:GUILD_AVATARS[i], isCurrent:GUILD_AVATARS[i] === this.guildAvatar, isSelected:GUILD_AVATARS[i] === this.selectedAvatar};
			itemList.push(item);
		}
		
		var itemDef = 
		{
			bg:{visible:"data.isSelected"},
			icon:{type:UITYPE_IMAGE, field:"avatar", scale:0.48},
			check:{visible:"data.isCurrent"},
			avatarItem:{onTouchEnded:this.selectAvatar.bind(this)}
		};
		
		var uiDef = 
		{
			closeButton:{onTouchEnded:this.popState.bind(this)},
			selectButton:{onTouchEnded:this.confirmAvatarSelection.bind(this)},
			title:{type:UITYPE_TEXT, value:"TXT_GUILD_SELECT_AVATAR", style:TEXT_STYLE_TITLE_1},
			selectButtonText:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
			itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_GUILD_AVATAR_ITEM, itemDef:itemDef, itemSize:cc.size(75, 75)},
		};
		
		var widget;
		if(FWUI.isShowing(UI_GUILD_AVATAR_SELECTION))
		{
			// refresh
			widget = FWPool.getNode(UI_GUILD_AVATAR_SELECTION, false);
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			widget = FWUI.showWithData(UI_GUILD_AVATAR_SELECTION, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON + 10);
			AudioManager.effect(EFFECT_POPUP_SHOW);
		}
	},
	
	hideAvatarSelection:function(sender)
	{
		this.selectedAvatar = this.guildAvatar;
		FWUI.hide(UI_GUILD_AVATAR_SELECTION, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
	},
	
	selectAvatar:function(sender)
	{
		this.selectedAvatar = sender.uiData.avatar;
		this.showAvatarSelection();
	},
	
	confirmAvatarSelection:function(sender)
	{
		this.guildAvatar = this.selectedAvatar;
		this.popState();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// message ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showMessageInput:function(sender)
	{
		var uiDef = 
		{
			closeButton:{onTouchEnded:this.popState.bind(this)},
			sendButton:{onTouchEnded:this.sendMessage.bind(this)},
			sendButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_SEND_MESSAGE", style:TEXT_STYLE_TEXT_BUTTON},
			title:{type:UITYPE_TEXT, value:"TXT_GUILD_SEND_MESSAGE_TITLE", style:TEXT_STYLE_TITLE_1},
			message:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor:cc.color(192, 192, 192, 255), value:"", listener:[this.cgGuildMessageInputListener,this], lengthLimit:g_MISCINFO.GUILD_DASHBOARD_LENGHT},
		};
		
		var widget = FWUI.showWithData(UI_GUILD_SEND_MESSAGE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON + 10);
		AudioManager.effect(EFFECT_POPUP_SHOW);
	},
	
	hideMessageInput:function(sender)
	{
		FWUI.hide(UI_GUILD_SEND_MESSAGE, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
	},
	
	cgGuildMessageInputListener:function(sender)
	{
		// jira#6657
		sender.setString(Chatbox.filter(Chatbox.tree, sender.getString()));
	},
	
	sendMessage:function(sender)
	{
		var widget = FWPool.getNode(UI_GUILD_SEND_MESSAGE, false);
		var messageInput = FWUtils.getChildByName(widget, "message");
		
		// jira#6657
		//var message = messageInput.getString();
		var message = Chatbox.filter(Chatbox.tree, messageInput.getString());
		
		if(!message || !message.length)
		{
			// feedback
			//Game.showPopup({title:"", content:"TXT_GUILD_ERROR_EMPTY_MESSAGE", avatar:"npc/npc_06.png"}, true);
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_EMPTY_MESSAGE"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		this.popState();

		var pk = network.connector.client.getOutPacket(this.RequestGuildSendMail);
		pk.pack(message);
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// guild info /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	showGuildInfo:function(uiDef)
	{
		var guildData = this.currentData;
		
		// members
		var memberList = guildData[GUILD_MEMBER] || [];
		//var playerIdx = -1;
		for(var i=0; i<memberList.length; i++)
		{
			var member = memberList[i];
			if(member[FRIEND_ID] === gv.mainUserData.userId)
			{
				member.bgSprite = "hud/ip_shop_bar_menu.png";
				//playerIdx = i;
			}
			else
				member.bgSprite = "hud/ip_shop_bar_menu_01.png";
			
			if(this.isUserGuildPresident(member[FRIEND_ID], guildData))
				member.role = GUILD_ROLE_PRESIDENT;
			else if(this.isUserGuildDeputy(member[FRIEND_ID], guildData))
				member.role = GUILD_ROLE_DEPUTY;
			else
				member.role = GUILD_ROLE_MEMBER;
			member.roleText = GUILD_ROLE_TEXTS[member.role];
			
			member.name = (member[FRIEND_NAME] && member[FRIEND_NAME].length > 0 ? member[FRIEND_NAME] : member[FRIEND_ID]);
			
			// feedback: sort
			if(member[FRIEND_ID] === gv.mainUserData.userId)
				member.sortIndex = 0;
			else 
				member.sortIndex = (member.role * 10000) + (999 - member[FRIEND_LEVEL]);
		}
		
		// player first
		// if(playerIdx > 0)
		// {
			// var member0 = memberList[0];
			// memberList[0] = memberList[playerIdx];
			// memberList[playerIdx] = member0;
		// }
		memberList = _.sortBy(memberList, function(val) {return val.sortIndex;});
		
		var memberUiDef =
		{
			bg:{type:UITYPE_IMAGE, field:"bgSprite", onTouchEnded:this.onMemberSelected.bind(this)},
			exp:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, field:FRIEND_LEVEL},
			avatar:{type:UITYPE_IMAGE, field:FRIEND_AVATAR, size:64},
			name:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, field:"name"},
			statusText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, field:"roleText"},
			helped:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_GUILD_HELPED"},
			helpedCount:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, field:FRIEND_GUILD_DONATE},
		};
		
		var uiDef2 = 
		{
			guildInfo:{visible:true},
			giAvatar:{type:UITYPE_IMAGE, value:guildData[GUILD_AVATAR], onTouchEnded:this.pushState.bind(this, GUILD_STATE_AVATAR), scale:0.85},
			giName:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, value:guildData[GUILD_NAME]},
			giDesc:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL, value:guildData[GUILD_DESC], maxWordLength:27},
			giLevel:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL_ORANGE, value:"TXT_GUILD_REQUIRED_LEVEL"},
			giMembers:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL_ORANGE, value:"TXT_GUILD_MEMBERS"},
			giType:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL_ORANGE, value:"TXT_GUILD_TYPE"},
			giTag:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL_ORANGE, value:"TXT_GUILD_TAG"},
			giLevelValue:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL, value:guildData[GUILD_REQUIRE_MEMBER_LV_MIN]},
			giMembersValue:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL, value:this.getMembersCount(guildData) + "/" + this.getMembersLimit(guildData)},
			giTypeValue:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL, value:GUILD_TYPE_TEXTS[guildData[GUILD_TYPE]]},
			giTagValue:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL2_SMALL, value:guildData[GUILD_ID], splitNumber:false},
			giMessageButton:{visible:false},
			giEditButton:{visible:false},
			giExitButton:{visible:false},
			//giExitButton2:{visible:false},
			giJoinButton:{visible:false},
			giJoinButtonText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_GUILD_JOIN"},
			giMemberList:{type:UITYPE_2D_LIST, items:memberList, itemUI:UI_GUILD_MEMBER_LIST_ITEM, itemDef:memberUiDef, itemSize:cc.size(780, 100)},
		};
		
		if(this.isPlayerInGuild(guildData))
		{
			if(!Game.isFriendGarden())
			{
				// available actions
				var actionsCount = 0;
				if(this.canPlayerTakeAction(GUILD_ACTION_SEND_MESSAGE, guildData))
				{
					uiDef2.giMessageButton = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
					actionsCount++;
				}
				
				if(this.canPlayerTakeAction(GUILD_ACTION_EDIT, guildData))
				{
					uiDef2.giEditButton = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
					actionsCount++;
				}
				
				//if(actionsCount > 0)
				//	uiDef2.giExitButton = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
				//else
				//	uiDef2.giExitButton2 = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
				var uiGuild = FWPool.getNode(UI_GUILD, false);
				var giExitButton = FWUtils.getChildByName(uiGuild, "giExitButton");
				giExitButton.setPosition(-235 + actionsCount * 70, 102);
				uiDef2.giExitButton = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
			}
		}
		else
			uiDef2.giJoinButton = {visible:true, onTouchEnded:this.onGuildInfoButton.bind(this)};
		
		_.extend(uiDef, uiDef2);
	},
	
	onGuildInfoButton:function(sender)
	{
		var name = sender.getName();
		if(name === "giEditButton")
			this.pushState(GUILD_STATE_EDIT);
		else if(name === "giMessageButton")
			this.pushState(GUILD_STATE_MESSAGE);
		else if(name === "giExitButton")// || name === "giExitButton2")
		{
			var membersCount = this.getMembersCount(this.currentData);
			if(membersCount > 1 && this.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_PRESIDENT)
				FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_TRANSFER"), FWUtils.getWorldPosition(sender));
			else if(Guild2.hasDerbyStarted() && Guild2.hasPlayerJoinedDerby())
				Game.showPopup({title:"TXT_GUILD_EXIT_TITLE", content:"TXT_GUILD_EXIT_DERBY", closeButton:true, actionButtonSprite:"hud/btn_normal_red.png", avatar:"npc/npc_06.png"}, function() {Guild.confirmGuildExit();});
			else
				Game.showPopup({title:"TXT_GUILD_EXIT_TITLE", content:(membersCount <= 1 ? "TXT_GUILD_EXIT_CONTENT_LAST_MEMBER" : "TXT_GUILD_EXIT_CONTENT"), closeButton:true, actionButtonSprite:"hud/btn_normal_red.png", avatar:"npc/npc_06.png"}, function() {Guild.confirmGuildExit();});
		}
		else if(name === "giJoinButton")
			this.joinGuild(this.currentData, sender);
	},
	
	confirmGuildExit:function()
	{
		// server
		var pk;
		if(this.getMembersCount(this.currentData) <= 1)
			pk = network.connector.client.getOutPacket(this.RequestGuildDisband);
		else
			pk = network.connector.client.getOutPacket(this.RequestGuildMemberLeave);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onMemberSelected:function(sender)
	{
		if(Game.isFriendGarden())
			return;
		
		var buttons = [];
		var targetMember = sender.uiData;
		
		if(this.canPlayerTakeAction(GUILD_ACTION_VISIT, this.currentData, targetMember))
			buttons.push({sprite:"hud/btn_blue.png", text:"TXT_GUILD_VISIT", callback:this.onMemberContextMenuButton.bind(this), id:"visit", member:targetMember});
		
		if(this.canPlayerTakeAction(GUILD_ACTION_SET_PRIVILEGE, this.currentData, targetMember))
			buttons.push({sprite:"hud/btn_normal_green.png", text:"TXT_GUILD_SET_PRIVILEGE", callback:this.onMemberContextMenuButton.bind(this), id:"privilege", member:targetMember});
		
		if(this.canPlayerTakeAction(GUILD_ACTION_KICK, this.currentData, targetMember))
			buttons.push({sprite:"hud/btn_normal_red.png", text:"TXT_GUILD_KICK", callback:this.onMemberContextMenuButton.bind(this), id:"kick", member:targetMember});
	
		if(buttons.length > 0)
			FWUI.showContextMenu(sender.getParent(), cc.p(355, 0), buttons);
	},
	
	onMemberContextMenuButton:function(srcData)
	{
		var id = srcData.id;
		var member = srcData.member;
		
		if(id === "visit")
			GardenManager.changeGarden(member[FRIEND_ID], member[FRIEND_NAME], member[FRIEND_AVATAR]);
		else if(id === "privilege")
		{
			this.targetMember = member;
			this.pushState(GUILD_STATE_PRIVILEGE);
		}
		else if(id === "kick")
			this.showKickPopup(member);
	},
	
	joinGuildButton: null,
	joinGuildData: null,
	joinGuildIsInvited: false,
	joinGuild:function(guildData, sender)
	{
		if(this.isInvitedToJoinGuild(guildData[GUILD_ID]))
		{
			this.joinGuildByInvitation(guildData[GUILD_ID], sender);
			return;
		}

		this.joinGuildIsInvited = false;
		this.joinGuildData = guildData;
		this.joinGuildButton = sender;
		
		var errorMessage;
		if(guildData[GUILD_TYPE] === GUILD_TYPE_CLOSE)
			errorMessage = FWLocalization.text("TXT_GUILD_JOIN_CLOSED_GUILD");
		else if(this.isPlayerInGuild())
			errorMessage = FWLocalization.text("TXT_GUILD_JOIN_LEAVE_FIRST");
		else if(Game.getGameTimeInSeconds() < this.playerGuildData[GUILD_USER_PENATY])
		{
			//errorMessage = FWLocalization.text("TXT_GUILD_JOIN_WAIT");
			//var s = (this.playerGuildData[GUILD_USER_PENATY] - Game.getGameTimeInSeconds());
			//var m = Math.round (s / 60);
			//errorMessage += "\n" + m + "m";
			var s = (this.playerGuildData[GUILD_USER_PENATY] - Game.getGameTimeInSeconds());
			errorMessage = cc.formatStr(FWLocalization.text("TXT_GUILD_JOIN_WAIT"), FWUtils.secondsToTimeString(s));
		}
		else if(gv.mainUserData.getLevel() < guildData[GUILD_REQUIRE_MEMBER_LV_MIN])
			errorMessage = cc.formatStr(FWLocalization.text("TXT_GUILD_JOIN_LEVEL"), guildData[GUILD_REQUIRE_MEMBER_LV_MIN]);
		else if( g_MISCINFO.GUILD_JOIN_CHECK_APPRAISAL && Game.getGardenValue() < guildData[GUILD_REQUIRE_MEMBER_APPRAISAL])
			errorMessage = FWLocalization.text("TXT_GUILD_JOIN_APPRAISAL");//errorMessage = cc.formatStr(FWLocalization.text("TXT_GUILD_JOIN_APPRAISAL"), guildData[GUILD_REQUIRE_MEMBER_APPRAISAL]);
		
		if(errorMessage)
		{
			FWUtils.showWarningText(errorMessage, FWUtils.getWorldPosition(sender));
			return;
		}
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildMemberJoin);
		pk.pack(guildData[GUILD_ID]);
		network.connector.client.sendPacket(pk);
	},
	
	joinGuildByInvitation:function(guildId, sender)
	{
		// invited: don't need to check for level, status...
		this.joinGuildIsInvited = true;
		this.joinGuildData = guildId;
		this.joinGuildButton = sender;
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildMemberJoin);
		pk.pack(guildId);
		network.connector.client.sendPacket(pk);
	},

	// if player has joined a guild, delete all invitation mails from that guild
	deleteOldInvitationMails:function()
	{
		if(!this.mailList)
			return;
		
		var guildId = this.getGuildId();
		if(guildId < 0)
			return;
		
		var uidsToDelete = [];
		for(var i=0; i<this.mailList.length; i++)
		{
			if(this.mailList[i][MAIL_TYPE] === MAIL_GUILD_INVITE && this.mailList[i][MAIL_SENDER] === guildId)
			{
				uidsToDelete.push(this.mailList[i][MAIL_UID]);
				this.mailList.splice(i, 1);
				i--;
			}
		}
		
		if(uidsToDelete.length > 0)
		{
			var pk = network.connector.client.getOutPacket(MailBox.RequestMailDelete);
			pk.pack(uidsToDelete);
			network.connector.client.sendPacket(pk);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// privilege //////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showPrivilegePopup:function()
	{
		var uiDef = 
		{
			title:{type:UITYPE_TEXT, value:"TXT_GUILD_SET_PRIVILEGE", style:TEXT_STYLE_TITLE_1},
			exp:{type:UITYPE_TEXT, value:this.targetMember[FRIEND_LEVEL], style:TEXT_STYLE_NUMBER},
			name:{type:UITYPE_TEXT, value:this.targetMember.name, style:TEXT_STYLE_TEXT_NORMAL},
			status:{type:UITYPE_TEXT, value:this.targetMember.roleText, style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			leadTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_ROLE_PRESIDENT", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			subleadTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_ROLE_DEPUTY", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			memberTitle:{type:UITYPE_TEXT, value:"TXT_GUILD_ROLE_MEMBER", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			leadContent:{type:UITYPE_TEXT, value:"TXT_GUILD_DESC_PRESIDENT", style:TEXT_STYLE_TEXT_NORMAL_ORANGE},
			subleadContent:{type:UITYPE_TEXT, value:"TXT_GUILD_DESC_DEPUTY", style:TEXT_STYLE_TEXT_NORMAL_ORANGE},
			memberContent:{type:UITYPE_TEXT, value:"TXT_GUILD_DESC_MEMBER", style:TEXT_STYLE_TEXT_NORMAL_ORANGE},
			saveButton:{onTouchEnded:this.savePrivilege.bind(this)},
			saveButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_SAVE", style:TEXT_STYLE_TEXT_BUTTON},
			closeButton:{onTouchEnded:this.popState.bind(this)},
			kickButton:{onTouchEnded:this.showKickPopup.bind(this, this.targetMember)},
			kickButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_KICK", style:TEXT_STYLE_TEXT_BUTTON},
		};
		
		var widget = FWUI.showWithData(UI_GUILD_PRIVILEGE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON + 10);
		AudioManager.effect(EFFECT_POPUP_SHOW);
		
		FWUI.addCheckboxGroup({id:"cbgPrivilege", widget:widget, checkboxes:["cbLead", "cbSublead", "cbMember"], checkboxIds:[GUILD_ROLE_PRESIDENT, GUILD_ROLE_DEPUTY, GUILD_ROLE_MEMBER]});
		FWUI.selectCheckboxById("cbgPrivilege", this.targetMember.role);
	},
	
	hidePrivilegePopup:function()
	{
		FWUI.removeCheckboxGroup("cbgPrivilege");
		FWUI.hide(UI_GUILD_PRIVILEGE, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
	},
	
	savePrivilege:function(sender, confirmed)//web savePrivilege:function(sender, confirmed = false)
	{
		if(confirmed === undefined)
			confirmed = false;
		
		var role = FWUI.getSelectedCheckboxById("cbgPrivilege");
		if(role === GUILD_ROLE_PRESIDENT && !confirmed)
		{
			Game.showPopup({title:"TXT_GUILD_SET_PRIVILEGE", content:cc.formatStr(FWLocalization.text("TXT_GUILD_SET_PRIVILEGE_PRESIDENT_CONFIRM"), this.targetMember.name, FWLocalization.text(GUILD_ROLE_TEXTS[role]), FWLocalization.text(GUILD_ROLE_TEXTS[GUILD_ROLE_MEMBER])), actionText:"TXT_TUTO_OK", closeButton:true, avatar:"npc/npc_06.png"}, function() {Guild.savePrivilege(null, true);});//web
			return;
		}
		
		// check deputy limit
		if(role === GUILD_ROLE_DEPUTY)
		{
			var deputyLimit = this.getGuildLevelInfo(this.currentData[GUILD_LEVEL]).DEPUTY;
			if(this.currentData[GUILD_DEPUTY].length >= deputyLimit
				&& this.currentData[GUILD_DEPUTY].indexOf(this.targetMember[FRIEND_ID]) < 0)
			{
				FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_GUILD_ERROR_DEPUTY_LIMIT"), deputyLimit), FWUtils.getWorldPosition(sender));
				return;
			}
		}
		
		cc.log("Guild::savePrivilege: member=" + this.targetMember[FRIEND_ID] + " role=" + role);
		
		if(role === GUILD_ROLE_PRESIDENT)
		{
			var pk = network.connector.client.getOutPacket(this.RequestGuildSetPresident);
			pk.pack(this.targetMember[FRIEND_ID]);
			network.connector.client.sendPacket(pk);
		}
		else
		{
			var pk = network.connector.client.getOutPacket(this.RequestGuildSetDeputy);
			pk.pack(this.targetMember[FRIEND_ID], role);
			network.connector.client.sendPacket(pk);
		}
		
		this.popState();
	},
	
	
///////////////////////////////////////////////////////////////////////////////////////
// kick ///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showKickPopup:function(targetMember)
	{
		this.targetMember = targetMember;
		Game.showPopup({title:"TXT_GUILD_KICK_TITLE", content:cc.formatStr(FWLocalization.text("TXT_GUILD_KICK_CONTENT"), targetMember.name), actionText:"TXT_GUILD_KICK", actionButtonSprite:"hud/btn_normal_red.png", closeButton:true, avatar:"npc/npc_06.png"}, this.confirmKick.bind(this));
	},
	
	confirmKick:function()
	{
		if(this.currentState === GUILD_STATE_PRIVILEGE)
			this.popState();
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildMemberKick);
		pk.pack([this.targetMember[FRIEND_ID]]);
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// guild states ///////////////////////////////////////////////////////////////////////
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
		this.onStateChanged(this.currentState, this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : GUILD_STATE_NONE);
	},
	
	popAllStates:function()
	{
		while(this.stateStack.length > 0)
			this.popState();
	},
	
	onStateChanged:function(oldState, newState)
	{
		cc.log("Guild::onStateChanged: oldState=" + oldState + " newState=" + newState);
		
		// hide old state
		if(oldState === GUILD_STATE_AVATAR)
			this.hideAvatarSelection();
		else if(oldState === GUILD_STATE_MESSAGE)
			this.hideMessageInput();
		else if(oldState === GUILD_STATE_PRIVILEGE)
			this.hidePrivilegePopup();
		else if(oldState === GUILD_STATE_EDIT)
		{
			// discard changes
			this.setData(this.data);
		}
	
		// show new state
		this.currentState = newState;
		if(newState === GUILD_STATE_AVATAR)
			this.showAvatarSelection();
		else if(newState === GUILD_STATE_MESSAGE)
			this.showMessageInput();
		else if(newState === GUILD_STATE_PRIVILEGE)
			this.showPrivilegePopup();
		else if(newState !== GUILD_STATE_NONE)
			this.showMainUi();
		else
			this.hide();
	},
	
	showTab:function(tab)
	{
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			this.loadGuildResources(function() {Guild.showTab(tab);});
			return;
		}
		
		this.currentTab = tab;
		if(tab === GUILD_TAB_GUILD)
		{
			if(this.isPlayerInGuild())
			{
				this.currentData = this.data;
				this.setState(GUILD_STATE_INFO);
			}
			else
				this.setState(GUILD_STATE_CREATE);
		}
		else if(tab === GUILD_TAB_INBOX)
			this.setState(GUILD_STATE_INBOX);
		else if(tab === GUILD_TAB_SEARCH)
			this.setState(GUILD_STATE_SEARCH);
		
		this.saveData();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// inbox //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	approvedUserList: [],
	deniedUserList: [],

	showInbox:function(uiDef)
	{
		Guild.deleteOldInvitationMails();
		
		// additional data to display
		for(var i=0; i<this.mailList.length; i++)
		{
			var mail = this.mailList[i];
			mail.icon = (mail[MAIL_AVATAR] || "guild/hud_badge_01.png");
			mail.subtitle = (mail[MAIL_SUBTITLE] || "");
			MailBox.updateMailTimeText(mail);
		}
		var displayMailList = this.mailList;
		
		if(this.isPlayerInGuild()
			&& this.canPlayerTakeAction(GUILD_ACTION_ADD_REMOVE_MEMBERS, this.data)
			&& this.data[GUILD_WAITING] && this.data[GUILD_WAITING].length > 0)
		{
			// member requests
			var waitingList = this.data[GUILD_WAITING];
			var waitingMails = [];
			for(var i=0; i<waitingList.length; i++)
			{
				var waitingUser = waitingList[i];
				if(this.approvedUserList.indexOf(waitingUser[FRIEND_ID]) >= 0 || this.deniedUserList.indexOf(waitingUser[FRIEND_ID]) >= 0)
					continue;
				
				var waitingMail = {};

				waitingMail[MAIL_TITLE] = "TXT_GUILD_MEMBER_REQUEST_MAIL_TITLE";
				waitingMail[MAIL_SUBTITLE] = "TXT_GUILD_MEMBER_REQUEST_MAIL_SUBTITLE";
				waitingMail[MAIL_CONTENT] = cc.formatStr(FWLocalization.text("TXT_GUILD_MEMBER_REQUEST_MAIL_CONTENT"), waitingUser[FRIEND_NAME]);
				waitingMail[MAIL_AVATAR] = waitingUser[FRIEND_AVATAR];//this.data[GUILD_AVATAR];
				waitingMail[MAIL_TIME_CREATE] = Number.MAX_SAFE_INTEGER;
				waitingMail[MAIL_TYPE] = MAIL_GUILD_MEMBER_REQUEST;
				waitingMail[MAIL_SENDER] = waitingUser[FRIEND_ID];
				waitingMail[MAIL_UID] = waitingUser[FRIEND_ID];
				
				waitingMail.icon = waitingMail[MAIL_AVATAR];
				waitingMail.subtitle = waitingMail[MAIL_SUBTITLE];
				waitingMail.timeText = "";
				waitingMails.push(waitingMail);
			}
			
			if(waitingMails.length > 0)
				displayMailList = displayMailList.concat(waitingMails);
			// jira#6670
			//else
			//	this.saveData(); // finished accepting/denying
		}
		
		displayMailList = _.sortByDecent(displayMailList, function(val) {return val[MAIL_TIME_CREATE];});//web displayMailList = _.sortByDecent(displayMailList, val => val[MAIL_TIME_CREATE]);
		
		var itemUiDef = 
		{
			icon:{type:UITYPE_IMAGE, field:"icon", scale:0.4, visible:"data[MAIL_TYPE] !== MAIL_GUILD_MEMBER_REQUEST"},
			title:{type:UITYPE_TEXT, field:MAIL_TITLE, style:TEXT_STYLE_TEXT_DIALOG_TITLE_GUILD},
			subtitle:{type:UITYPE_TEXT, field:"subtitle", style:TEXT_STYLE_TEXT_DIALOG_SMALL, maxWordLength:45},
			status1:{type:UITYPE_TEXT, field:"timeText", style:TEXT_STYLE_TEXT_DIALOG},
			status2:{visible:false},
			content:{type:UITYPE_TEXT, field:MAIL_CONTENT, style:TEXT_STYLE_TEXT_DIALOG_BLACK},
			joinButton:{visible:"data[MAIL_TYPE] === MAIL_GUILD_INVITE", onTouchEnded:this.onMailButton.bind(this)},
			joinButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_JOIN", style:TEXT_STYLE_TEXT_BUTTON},
			viewButton:{visible:"data[MAIL_TYPE] === MAIL_GUILD_INVITE", onTouchEnded:this.onMailButton.bind(this)},
			viewButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_VIEW", style:TEXT_STYLE_TEXT_BUTTON},
			deleteButton:{visible:"data[MAIL_TYPE] === MAIL_GUILD_INVITE", onTouchEnded:this.onMailButton.bind(this)},
			deleteButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_DELETE_MAIL", style:TEXT_STYLE_TEXT_BUTTON},
			approveButton:{visible:"data[MAIL_TYPE] === MAIL_GUILD_MEMBER_REQUEST", onTouchEnded:this.onMailButton.bind(this)},
			approveButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_MEMBER_REQUEST_ACCEPT", style:TEXT_STYLE_TEXT_BUTTON},
			denyButton:{visible:"data[MAIL_TYPE] === MAIL_GUILD_MEMBER_REQUEST", onTouchEnded:this.onMailButton.bind(this)},
			denyButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_MEMBER_REQUEST_DENY", style:TEXT_STYLE_TEXT_BUTTON},
			avatar:{type:UITYPE_IMAGE, field:MAIL_AVATAR, size:52, visible:"data[MAIL_TYPE] === MAIL_GUILD_MEMBER_REQUEST"},
		};
		
		var uiDef2 =
		{
			inbox:{visible:true},
			ibItemList:{type:UITYPE_2D_LIST, items:displayMailList, itemUI:UI_GUILD_INBOX_ITEM, itemDef:itemUiDef, itemSize:cc.size(800, 190)},	
		};
		
		_.extend(uiDef, uiDef2);
	},
	
	onMailButton:function(sender)
	{
		var name = sender.getName();
		if(name === "joinButton")
			this.joinGuildByInvitation(sender.uiData[MAIL_SENDER], sender);
		else if(name === "viewButton" && sender.uiData[MAIL_SENDER])
			this.load(sender.uiData[MAIL_SENDER], function(data) {Guild.currentData = data; Guild.pushState(GUILD_STATE_INFO);});
		else if(name === "deleteButton")
		{
			for(var i=0; i<this.mailList.length; i++)
			{
				if(this.mailList[i][MAIL_UID] === sender.uiData[MAIL_UID])
				{
					this.mailList.splice(i, 1);
					break;
				}
			}
			
			var pk = network.connector.client.getOutPacket(MailBox.RequestMailDelete);
			pk.pack([sender.uiData[MAIL_UID]]);
			network.connector.client.sendPacket(pk);
			
			this.showTab(GUILD_TAB_INBOX);
		}
		else if(name === "approveButton")
		{
			cc.log("Guild::onMailButton: approve " + sender.uiData[MAIL_SENDER]);
			if(this.getMembersCount() + this.approvedUserList.length >= this.getMembersLimit())
				FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_FULL_MEMBER"), FWUtils.getWorldPosition(sender));
			else
			{
				this.approvedUserList.push(sender.uiData[MAIL_SENDER]);
				this.showMainUi();
				
				// jira#6670
				cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveData);
				cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveData, 0, 0, 2, false);
			}
		}
		else if(name === "denyButton")
		{
			cc.log("Guild::onMailButton: deny " + sender.uiData[MAIL_SENDER]);
			this.deniedUserList.push(sender.uiData[MAIL_SENDER]);
			this.showMainUi();
			
			// jira#6670
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.saveData);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.saveData, 0, 0, 2, false);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// search /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	searchResult: [],
	hasPerformedSearch: false,
	suggestionResult: [],
	lastSuggestionTime: 0,

	showSearch:function(uiDef)
	{
		// additional display data for search result
		for(var i=0; i<this.searchResult.length; i++)
		{
			var item = this.searchResult[i];
			item.members = this.getMembersCount(item) + "/" + this.getGuildLevelInfo(item[GUILD_LEVEL]).MEMBERS;
		}
		
		var itemDef =
		{
			bg:{onTouchEnded:this.onSearchItemSelected.bind(this)},
			icon:{type:UITYPE_IMAGE, field:GUILD_AVATAR, scale:0.5},
			name:{type:UITYPE_TEXT, field:GUILD_NAME, style:TEXT_STYLE_TEXT_NORMAL},
			desc:{type:UITYPE_TEXT, field:GUILD_DESC, style:TEXT_STYLE_TEXT_DIALOG, maxWordLength:40},
			membersCount:{type:UITYPE_TEXT, field:"members", style:TEXT_STYLE_TEXT_NORMAL},
		};
		
		var uiDef2 =
		{
			guildSearch:{visible:true},
			gsInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_GUILD_SEARCH_PLACEHOLDER", placeHolderColor:cc.color.GREY},
			gsSearchButton:{onTouchEnded:this.onSearch.bind(this)},
			gsSearchButtonText:{type:UITYPE_TEXT, value:"TXT_SEARCH", style:TEXT_STYLE_TEXT_BUTTON},
			gsResultList:{type:UITYPE_2D_LIST, items:this.searchResult, itemUI:UI_GUILD_SEARCH_ITEM, itemDef:itemDef, itemSize:cc.size(780, 100)},
			gsNoResult:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_GUILD_SEARCH_NO_RESULT", visible:this.hasPerformedSearch && this.searchResult.length <= 0},
			gsUpdateTimeText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_GUILD_SUGGESTION_NEXT_TIME"},
			gsUpdateTime:{type:UITYPE_TIME_BAR, startTime:this.lastSuggestionTime, endTime:this.lastSuggestionTime + g_MISCINFO.GUILD_SUGGEST_COOLDOWN, countdown:true, onFinished:this.showTab.bind(this, GUILD_TAB_SEARCH), useExisting:true},
			gsUpdateTimePanel:{type:UITYPE_PANEL, alignChild:true},
		};
		
		if(!this.hasPerformedSearch)
		{
			var widget = FWPool.getNode(UI_GUILD, false);
			var gsInput = FWUtils.getChildByName(widget, "gsInput");
			gsInput.setString("");
		}
		
		_.extend(uiDef, uiDef2);
	},
	
	onSearch:function(sender)
	{
		var widget = FWPool.getNode(UI_GUILD, false);
		var gsInput = FWUtils.getChildByName(widget, "gsInput");
		var searchString = gsInput.getString();
		
		if(!searchString || searchString.length <= 0)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_ERROR_EMPTY_SEARCH_STRING"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildSearch);
		pk.pack(searchString);
		network.connector.client.sendPacket(pk);
	},
	
	onSearchItemSelected:function(sender)
	{
		this.load(sender.uiData[GUILD_ID], function(data) {this.currentData = data; this.pushState(GUILD_STATE_INFO);});
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// invitation /////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showInvitation:function(sender)
	{
		var uiDef = 
		{
			closeButton:{onTouchEnded:this.hideInvitation.bind(this)},
			sendButton:{onTouchEnded:this.sendInvitation.bind(this)},
			sendButtonText:{type:UITYPE_TEXT, value:"TXT_GUILD_SEND_MESSAGE", style:TEXT_STYLE_TEXT_BUTTON},
			title:{type:UITYPE_TEXT, value:"TXT_GUILD_SEND_INVITATION_TITLE", style:TEXT_STYLE_TITLE_1},
			message:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor:cc.color.BLACK, value:"TXT_GUILD_SEND_INVITATION_CONTENT"},
		};
		
		var widget = FWUI.showWithData(UI_GUILD_SEND_MESSAGE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_COMMON);
		AudioManager.effect(EFFECT_POPUP_SHOW);
		
		if(!this.hideFuncInvitation)
			this.hideFuncInvitation = function() {this.hideInvitation();}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncInvitation);
	},
	
	hideInvitation:function(sender)
	{
		FWUI.hide(UI_GUILD_SEND_MESSAGE, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFuncInvitation);
	},
	
	sendInvitation:function(sender)
	{
		var widget = FWPool.getNode(UI_GUILD_SEND_MESSAGE, false);
		var messageInput = FWUtils.getChildByName(widget, "message");
		var message = messageInput.getString();
		
		if(!message || !message.length)
		{
			Game.showPopup({title:"", content:"TXT_GUILD_ERROR_EMPTY_MESSAGE", avatar:"npc/npc_06.png"}, true);
			return;
		}
		
		this.hideInvitation(sender);

		var pk = network.connector.client.getOutPacket(this.RequestGuildMemberInvite);
		pk.pack(gv.userData.userId);
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestGuildCreate:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(1024); this.setCmdId(gv.CMD.GUILD_CREATE);},
		pack:function(name, avatar, desc, type, requireLevels)
		{
			cc.log("Guild::RequestGuildCreate: name=" + name + " avatar=" + avatar + " desc=" + desc + " type=" + type + " requireLevels=" + JSON.stringify(requireLevels));
			
			FWUtils.disableAllTouches();
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_NAME, name);
			PacketHelper.putString(this, KEY_AVATAR, avatar);
			PacketHelper.putString(this, KEY_TXT, desc);
			PacketHelper.putByte(this, KEY_TYPE, type);
			PacketHelper.putIntArray(this, KEY_LEVEL, requireLevels);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildCreate:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildCreate: error=" + this.getError());
			else
			{
				// fake
				var playerGuildData = {};
				playerGuildData[GUILD_USER_ID] = object[KEY_GUILD][GUILD_ID];
				playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_PRESIDENT;
				playerGuildData[GUILD_USER_PENATY] = 0;
				playerGuildData[GUILD_USER_DONATE_REMAIN] = g_MISCINFO.GUILD_DONATE_TURN_LIMIT;
				playerGuildData[GUILD_USER_DONATE_ITEM_REMAIN] = g_MISCINFO.GUILD_DONATE_ITEM_LIMIT;
				playerGuildData[GUILD_USER_DONATE_NEXT_TIME] = 0;
				Guild.setPlayerGuildData(playerGuildData);
				
				Game.updateUserDataFromServer(object);
				Guild.setData(object[KEY_GUILD]);
				Guild.showTab(GUILD_TAB_GUILD);
			}
		}
	}),	

	RequestGuildGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_GET);},
		pack:function(id)
		{
			FWUtils.disableAllTouches();
	
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_GUILD, id);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Guild::ResponseGuildGet: error=" + this.getError());
				
				Guild.setPlayerGuildData(null);
				if(Guild.loadCallback)
					Guild.loadCallback(null);
			}
			else if(Guild.loadCallback)
				Guild.loadCallback(object[KEY_GUILD]);
		}
	}),	
	
	RequestGuildMemberLeave:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_LEAVE);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberLeave:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildMemberLeave: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildMemberLeave: error=" + this.getError());
			else if(!object[KEY_USER_ID] || object[KEY_USER_ID] === gv.mainUserData.userId)
			{
				// left player
				// fake
				Guild.onQuit();
				Guild.playerGuildData[GUILD_USER_PENATY] = g_MISCINFO.GUILD_LEAVE_PENALTY;

				// reload
				Guild.loadPlayerGuildData();

				Chatbox.leave();
			}
			else if(object[KEY_USER_ID])
			{
				// other players in guild
				Guild.removeMemberById(object[KEY_USER_ID]);
				Guild.onRemoteUpdate();
			}
		}
	}),		
	
	RequestGuildMemberKick:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_KICK);},
		pack:function(ids)
		{
			FWUtils.disableAllTouches();
			cc.log("Guild::RequestGuildMemberKick: ids=" + JSON.stringify(ids));
			
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_USER_ID, ids);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberKick:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildMemberKick: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildMemberKick: error=" + this.getError());
			else
			{
				var kickedPlayers = object[KEY_DATA];
				
				if(kickedPlayers.indexOf(gv.mainUserData.userId) >= 0)
				{
					// kicked
					// fake
					Guild.onQuit();
					Guild.playerGuildData[GUILD_USER_PENATY] = g_MISCINFO.GUILD_KICK_PENALTY;
					Game.showPopup({title:"", content:"TXT_GUILD_KICK_MAIL_DESC"}, true);
					
					// reload
					Guild.loadPlayerGuildData();

					Chatbox.leave();
				}
				else
				{
					// another player is kicked
					for(var i=0; i<kickedPlayers.length; i++)
						Guild.removeMemberById(kickedPlayers[i]);
					
					Guild.onRemoteUpdate();
				}
				
				if(object[KEY_USER_ID] && object[KEY_USER_ID] === gv.mainUserData.userId)
				{
					// kicker
					Guild.showTab(GUILD_TAB_GUILD);
				}
			}
		}
	}),			
	
	RequestGuildSetDeputy:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_SET_DEPUTY);},
		pack:function(targetId, role)
		{
			FWUtils.disableAllTouches();
			Guild.hasSetDeputy = true;
			
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_USER_ID, targetId);
			PacketHelper.putInt(this, KEY_STATUS, role);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildSetDeputy:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSetDeputy: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildSetDeputy: error=" + this.getError());
			else
			{
				var userId = object[KEY_USER_ID];
				var role = object[KEY_STATUS];
				
				// removed, use set president instead
				/*if(role === GUILD_ROLE_PRESIDENT)
				{
					// set as president
					Guild.data[GUILD_PRESIDENT] = userId; 
					
					// promote
					if(userId === gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] !== GUILD_ROLE_PRESIDENT)
						Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_PRESIDENT;
					
					// demote
					if(userId !== gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_PRESIDENT)
						Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_MEMBER;
				}
				else*/
				if(role === GUILD_ROLE_DEPUTY)
				{
					// promote
					if(userId === gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] !== GUILD_ROLE_DEPUTY)
						Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_DEPUTY;
					
					// add to deputy list
					if(Guild.data[GUILD_DEPUTY] && Guild.data[GUILD_DEPUTY].indexOf(userId) < 0)
						Guild.data[GUILD_DEPUTY].push(userId);
				}
				else if(role === GUILD_ROLE_MEMBER)
				{
					// demote
					if(userId === gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] !== GUILD_ROLE_MEMBER)
						Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_MEMBER;
					
					// remove from deputy list
					if(Guild.data[GUILD_DEPUTY])
					{
						var idx = Guild.data[GUILD_DEPUTY].indexOf(userId);
						if(idx >= 0)
							Guild.data[GUILD_DEPUTY].splice(idx, 1);
					}
				}
				
				if(Guild.hasSetDeputy)
				{
					// not a broadcast message
					Guild.hasSetDeputy = false;
					Guild.showTab(GUILD_TAB_GUILD);
				}
				else
					Guild.onRemoteUpdate();
			}
		}
	}),				
	
	RequestGuildMemberJoin:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_JOIN);},
		pack:function(guildId)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_GUILD, guildId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberJoin:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			var pos = FWUtils.getWorldPosition(Guild.joinGuildButton);
			cc.log("Guild::ResponseGuildMemberJoin: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
			{
				cc.log("Guild::ResponseGuildMemberJoin: error=" + this.getError());
				
				if(Guild.joinGuildButton)
					FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_JOIN_ERROR"), pos);
			}
			else
			{
				if(!object[KEY_USER_ID] || object[KEY_USER_ID] === gv.mainUserData.userId)
				{
					// joiner
					if((!Guild.joinGuildIsInvited && Guild.joinGuildData[GUILD_TYPE] === GUILD_TYPE_REQUEST) || Game.isFriendGarden())
					{
						FWUtils.showWarningText(FWLocalization.text("TXT_GUILD_JOIN_REQUEST_SENT"), pos);
						
						if(Game.isFriendGarden())
						{
							var widget = FWPool.getNode(UI_GUILD, false);
							var giJoinButton = FWUtils.getChildByName(widget, "giJoinButton")
							giJoinButton.setVisible(false);
						}
					}
					else if(Guild.joinGuildIsInvited || Guild.joinGuildData[GUILD_TYPE] === GUILD_TYPE_OPEN) // ? || object[KEY_USER_ID] === gv.mainUserData.userId)
					{
						// guild data should be returned by server instead of loading
						// playerGuildData should be returned by server in stead of faking
						// var playerGuildData = {};
						// playerGuildData[GUILD_USER_ID] = Guild.joinGuildData[GUILD_ID];
						// playerGuildData[GUILD_USER_ROLE] = object[KEY_STATUS];
						// playerGuildData[GUILD_USER_PENATY] = 0;
						// playerGuildData[GUILD_USER_DONATE_REMAIN] = g_MISCINFO.GUILD_DONATE_TURN_LIMIT;
						// Guild.setPlayerGuildData(playerGuildData);
						// Guild.load(Guild.joinGuildData[GUILD_ID], function(data) {Guild.setData(data); if(FWUI.isShowing(UI_GUILD)) Guild.showTab(GUILD_TAB_GUILD);});
						
						Guild.loadPlayerGuildData(function () { if(FWUI.isShowing(UI_GUILD)) Guild.showTab(GUILD_TAB_GUILD);});//web
					}
				}
				else if(object[KEY_USER_ID] && object[KEY_DATA] && Guild.data && Guild.data[GUILD_MEMBER])
				{
					// other members
					if(Guild.getMemberIdx(object[KEY_USER_ID]) < 0)
					{
						if(object[KEY_STATUS] === GUILD_ROLE_MEMBER)
						{
							Guild.data[GUILD_MEMBER].push(object[KEY_DATA]);
							Guild.onRemoteUpdate();
						}
						else if(object[KEY_STATUS] === GUILD_ROLE_STRANGER)
							Guild.load(Guild.playerGuildData[GUILD_USER_ID], function(data) {Guild.setData(data); Guild.onRemoteUpdate();});
					}
				}
				Guild2.loadDerby();
			}				
		}
	}),
	
	RequestGuildSearch:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_SEARCH);},
		pack:function(searchString)
		{
			addPacketHeader(this);

			if(isNaN(searchString))
			{
				// search by name
				cc.log("Guild::RequestGuildSearch: search by name=" + searchString);
				PacketHelper.putString(this, KEY_NAME, searchString);	
			}
			else
			{
				// search by guild id if user enters and id
				cc.log("Guild::RequestGuildSearch: search by id=" + searchString);
				PacketHelper.putInt(this, KEY_GUILD, searchString);
			}
			
			
			addPacketFooter(this);
			
			FWUtils.disableAllTouches();
		},
	}),

	ResponseGuildSearch:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSearch: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
			{
				cc.log("Guild::ResponseGuildSearch: error=" + this.getError());
				Guild.searchResult = [];
			}
			else
			{
				//cc.log("Guild::ResponseGuildSearch: result=" + JSON.stringify(object));
				Guild.searchResult = [object[KEY_GUILD]];
			}				
			Guild.hasPerformedSearch = true;
			Guild.showTab(GUILD_TAB_SEARCH);
		}
	}),
	
	RequestGuildSetSetting:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(1024); this.setCmdId(gv.CMD.GUILD_SET_SETTING);},
		pack:function(avatar, desc, type, requireLevels)
		{
			FWUtils.disableAllTouches();
			addPacketHeader(this);
			
			if(avatar !== null)
				PacketHelper.putString(this, KEY_AVATAR, avatar);
			if(desc !== null)
				PacketHelper.putString(this, KEY_TXT, desc);
			if(type !== null)
				PacketHelper.putByte(this, KEY_TYPE, type);
			if(requireLevels !== null)
				PacketHelper.putIntArray(this, KEY_LEVEL, requireLevels);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildSetSetting:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSetSetting: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildSetSetting: error=" + this.getError());
			else
			{
				Guild.setData(object[KEY_GUILD]);
				if(object[KEY_USER_ID] === gv.mainUserData.userId)
					Guild.showTab(GUILD_TAB_GUILD);
				else
					Guild.onRemoteUpdate();
			}
		}
	}),	

	RequestGuildSendMail:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_SEND_MAIL);},
		pack:function(mail)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_TXT, mail);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildSendMail:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSendMail: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildSendMail: error=" + this.getError());
		}
	}),	
	
	RequestGuildMemberAccept:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_ACCEPT);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_USER_ID, ids);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberAccept:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildMemberAccept: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildMemberAccept: error=" + this.getError());
			else
			{
				var newData = object[KEY_GUILD];
				if (newData)
				{
					cc.log ("ResponseGuildMemberAccept", "new data");
					Guild.setData(newData);
					if(object[KEY_USER_ID] === gv.mainUserData.userId && Guild.currentTab === GUILD_TAB_GUILD && FWUI.isShowing(UI_GUILD, true))
						Guild.showTab(GUILD_TAB_GUILD);
				}
				else
				{
					cc.log ("ResponseGuildMemberAccept", "load data", Guild.playerGuildData[GUILD_USER_ID]);
					Guild.load (Guild.playerGuildData[GUILD_USER_ID],
						function(data) {//web
							Guild.setData(data);
							Guild.onRemoteUpdate();
						}
					);
				}
			}
		}
	}),		

	RequestGuildMemberReject:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_REJECT);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_USER_ID, ids);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberReject:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildMemberReject: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildMemberReject: error=" + this.getError());
			
			if(object[KEY_DATA] && Guild.data && Guild.data[GUILD_WAITING])
			{
				// fake: remove from waiting list
				var rejectIds = object[KEY_DATA];
				for(var i=0; i<rejectIds.length; i++)
				{
					for(var j=0; j<Guild.data[GUILD_WAITING].length; j++)
					{
						if(rejectIds[i] === Guild.data[GUILD_WAITING][j][FRIEND_ID])
						{
							Guild.data[GUILD_WAITING].splice(j, 1);
							break;
						}
					}
				}
				
				// refresh
				if(Guild.isPlayerInGuild()
					&& Guild.canPlayerTakeAction(GUILD_ACTION_ADD_REMOVE_MEMBERS, Guild.data)
					&& FWUI.isShowing(UI_GUILD, true)
					&& Guild.currentTab === GUILD_TAB_INBOX)
				{
					Guild.showTab(GUILD_TAB_INBOX);
				}
			}
		}
	}),		
	
	RequestGuildDisband:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_DISBAND);},
		pack:function(ids)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildDisband:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildDisband: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildDisband: error=" + this.getError());
			else
			{
				Guild.onQuit();
				Game.showPopup({title:"", content:"TXT_GUILD_DISBAND_MAIL_DESC"}, true);
			}
		}
	}),		
	
	RequestGuildSetPresident:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_SET_PRESIDENT);},
		pack:function(userId)
		{
			FWUtils.disableAllTouches();
			Guild.hasSetDeputy = true;
			
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_USER_ID, userId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildSetPresident:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSetPresident: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildSetPresident: error=" + this.getError());
			else
			{
				var userId = object[KEY_USER_ID];
				var newPresidentId = object[KEY_VIP];

				// set president
				Guild.data[GUILD_PRESIDENT] = newPresidentId;
				
				// promote
				if(newPresidentId === gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] !== GUILD_ROLE_PRESIDENT)
					Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_PRESIDENT;
				
				// demote
				if(newPresidentId !== gv.mainUserData.userId && Guild.playerGuildData[GUILD_USER_ROLE] === GUILD_ROLE_PRESIDENT)
					Guild.playerGuildData[GUILD_USER_ROLE] = GUILD_ROLE_MEMBER;
				
				// remove from deputy list
				if(Guild.data[GUILD_DEPUTY])
				{
					var idx = Guild.data[GUILD_DEPUTY].indexOf(newPresidentId);
					if(idx >= 0)
						Guild.data[GUILD_DEPUTY].splice(idx, 1);
				}
				
				if(Guild.hasSetDeputy)
				{
					// not a broadcast message
					Guild.hasSetDeputy = false;
					Guild.showTab(GUILD_TAB_GUILD);
				}
				else
					Guild.onRemoteUpdate();
			}
		}
	}),				

	RequestGuildMemberInvite:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_INVITE);},
		pack:function(userId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_USER_ID, userId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildMemberInvite:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildMemberInvite: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildMemberInvite: error=" + this.getError());
		}
	}),
	
	RequestGuildSuggest:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_GET_SUGGEST);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildSuggest:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("Guild::ResponseGuildSuggest: data=" + JSON.stringify(object));
			
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildSuggest: error=" + this.getError());
			else if(Guild.currentTab === GUILD_TAB_SEARCH && (!Guild.searchResult || Guild.searchResult.length <= 0))
			{
				Guild.suggestionResult = object[KEY_DATA];
				Guild.showTab(GUILD_TAB_SEARCH);
			}
		}
	}),
	
	RequestGuildGetUserInfo:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_GET_USER_INFO);},
		pack:function()
		{
			FWUtils.disableAllTouches();
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildGetUserInfo:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
				cc.log("Guild::ResponseGuildGetUserInfo: error=" + this.getError());
			else if(Guild.loadPlayerGuildDataCallback)
				Guild.loadPlayerGuildDataCallback(object[KEY_GUILD]);
		}
	}),	
	
	ResponseGuildSystemDisband:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			Guild.onQuit();
			Game.showPopup({title:"", content:"TXT_GUILD_DISBAND_MAIL_DESC"}, true);
		}
	}),	

	ResponseGuildRemoveMemberOffline:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Guild.setData(object[KEY_GUILD]);
			Guild.onRemoteUpdate();
		}
	}),	
};

network.packetMap[gv.CMD.GUILD_CREATE] = Guild.ResponseGuildCreate;
network.packetMap[gv.CMD.GUILD_GET] = Guild.ResponseGuildGet;
network.packetMap[gv.CMD.GUILD_GET_USER_INFO] = Guild.ResponseGuildGetUserInfo;
network.packetMap[gv.CMD.GUILD_MEMBER_LEAVE] = Guild.ResponseGuildMemberLeave;
network.packetMap[gv.CMD.GUILD_MEMBER_KICK] = Guild.ResponseGuildMemberKick;
network.packetMap[gv.CMD.GUILD_SET_DEPUTY] = Guild.ResponseGuildSetDeputy;
network.packetMap[gv.CMD.GUILD_SET_PRESIDENT] = Guild.ResponseGuildSetPresident;
network.packetMap[gv.CMD.GUILD_MEMBER_JOIN] = Guild.ResponseGuildMemberJoin;
network.packetMap[gv.CMD.GUILD_SEARCH] = Guild.ResponseGuildSearch;
network.packetMap[gv.CMD.GUILD_GET_SUGGEST] = Guild.ResponseGuildSuggest;
network.packetMap[gv.CMD.GUILD_SET_SETTING] = Guild.ResponseGuildSetSetting;
network.packetMap[gv.CMD.GUILD_SEND_MAIL] = Guild.ResponseGuildSendMail;
network.packetMap[gv.CMD.GUILD_MEMBER_ACCEPT] = Guild.ResponseGuildMemberAccept;
network.packetMap[gv.CMD.GUILD_MEMBER_REJECT] = Guild.ResponseGuildMemberReject;
network.packetMap[gv.CMD.GUILD_DISBAND] = Guild.ResponseGuildDisband;
network.packetMap[gv.CMD.GUILD_MEMBER_INVITE] = Guild.ResponseGuildMemberInvite;
network.packetMap[gv.CMD.GUILD_SYSTEM_DISBAND] = Guild.ResponseGuildSystemDisband;
network.packetMap[gv.CMD.GUILD_SYSTEM_MEMBER_OFFLINE] = Guild.ResponseGuildRemoveMemberOffline;

network.chatMap[gv.CMD.GUILD_MEMBER_LEAVE] = Guild.ResponseGuildMemberLeave;
network.chatMap[gv.CMD.GUILD_MEMBER_KICK] = Guild.ResponseGuildMemberKick;
network.chatMap[gv.CMD.GUILD_SET_DEPUTY] = Guild.ResponseGuildSetDeputy;
network.chatMap[gv.CMD.GUILD_SET_PRESIDENT] = Guild.ResponseGuildSetPresident;
network.chatMap[gv.CMD.GUILD_MEMBER_JOIN] = Guild.ResponseGuildMemberJoin;
network.chatMap[gv.CMD.GUILD_SET_SETTING] = Guild.ResponseGuildSetSetting;
network.chatMap[gv.CMD.GUILD_SEND_MAIL] = Guild.ResponseGuildSendMail;
network.chatMap[gv.CMD.GUILD_MEMBER_ACCEPT] = Guild.ResponseGuildMemberAccept;
network.chatMap[gv.CMD.GUILD_MEMBER_REJECT] = Guild.ResponseGuildMemberReject;
network.chatMap[gv.CMD.GUILD_DISBAND] = Guild.ResponseGuildDisband;
network.chatMap[gv.CMD.GUILD_SYSTEM_DISBAND] = Guild.ResponseGuildSystemDisband;
network.chatMap[gv.CMD.GUILD_SYSTEM_MEMBER_OFFLINE] = Guild.ResponseGuildRemoveMemberOffline;