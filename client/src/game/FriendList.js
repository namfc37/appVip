
// refresh suggestion

const ENABLE_FRIEND_LIST = g_MISCINFO.FRIEND_ACTIVE;
const FL_FAKE_DATA = false;

const FL_TAB_REQUESTS = 1;
const FL_TAB_FRIENDS = 2;
const FL_TAB_SUGGESTION = 3;
const FL_HEIGHT = 350;
const FL_OFFSET = 5;//20;

// jira#5819
var fl_scrollPos = null;

var FriendList =
{
	currentTab: FL_TAB_FRIENDS,
	container: null,
	friendsCount: 0,
	suggestionCount: 0,
	requestsCount: 0,
	friendsList: [],
	suggestionList: [],
	requestsList: [],
	tempRequestList: [], // list of temporarily sent requests to prevent sending request again
	isLoading: false,
	suggestionListRefreshTime: 0,
	
	init:function()
	{
		if(FL_FAKE_DATA)
		{
			// fake data
			var p1 = {4:1545106064, 5:"Jack", 6:"npc/nhc_red_bg.png", 7:30,9:"OFFER_VIP_0"};//var p1 = {4:1545106064, 5:"Jack", 6:"hud/hud_avatar_jack.png", 7:10};
			var p2 = {4:1545106133, 5:"Red long name", 6:"hud/hud_avatar_red.png", 7:10,9:"OFFER_VIP_2"};
			var p3 = {4:1545106626, 5:"Wolf very long name", 6:"hud/hud_avatar_wolf.png", 7:20,9:"OFFER_VIP_1"};
			var p4 = {4:104, 5:"Tom", 6:"npc/npc_kid_02.png", 7:40,9:"OFFER_VIP_2"};
			var p5 = {4:105, 5:"Meo di bui", 6:"npc/npc_06.png", 7:50,9:"OFFER_VIP_0"};
			var p6 = {4:106, 5:"Ech mat deu", 6:"npc/npc_03.png", 7:60,9:"OFFER_VIP_1"};
			var p7 = {4:107, 5:"Medusa", 6:"npc/npc_07.png", 7:70,9:"OFFER_VIP_0"};
			var jack =
			{
				4:USER_ID_JACK,
				5:"TXT_NPC_JACK",
				6:"hud/hud_avatar_jack.png",
				7:150,
				9:"OFFER_VIP_2"
			};
			this.friendsCount = 80;
			//this.friendsList = [jack, p1, p2, p3];
			this.friendsList = [jack, p1, p2, p3, p4, p5, p6, p7, jack, p1, p2, p3, p4, p5, p6, p7];
			this.suggestionCount = this.requestsCount = 7;
			this.suggestionList = this.requestsList = [p4, p5, p6, p7];
			// this.friendsCount = 4;
			// this.friendsList = [jack, p1, p2, p3];
			// this.suggestionCount = this.requestsCount = 0;
			// this.suggestionList = this.requestsList = [];
			this.updateDisplayName(this.requestsList);
			this.updateDisplayName(this.friendsList);
			this.updateDisplayName(this.suggestionList);
			
			this.sortList(this.requestsList);
			this.sortList(this.friendsList);
			this.sortList(this.suggestionList);
		}

		for(var key in this.friendsList)
		{
			var item = this.friendsList[key];
			item.iconVip = imgFrameVip[item[FRIEND_VIP]];
		}

		this.isLoading = false;
	},
	
	uninit:function()
	{
		
	},
	
	show:function(tab, refresh)//web show:function(tab = null, refresh = false)
	{
		if(tab === undefined)
			tab = null;
		if(refresh === undefined)
			refresh = false;
		
		if(tab)
			this.currentTab = tab;
		
		var itemList;
		if(this.currentTab === FL_TAB_FRIENDS)
			itemList = this.friendsList;
		else if(this.currentTab === FL_TAB_SUGGESTION)
			itemList = this.suggestionList;
		else if(this.currentTab === FL_TAB_REQUESTS)
			itemList = this.requestsList;



		for(var key in itemList)
		{
			var item = itemList[key];

			if(imgFrameVip[item[FRIEND_VIP]])
			{
				item.iconVip = imgFrameVip[item[FRIEND_VIP]];
				item.hasVip = true;
			}
			else
			{
				item.iconVip = imgFrameVip[OFFER_VIP_0];
				item.hasVip = false;
			}
		}
		var itemDef =
		{
			icon_avatar:{type:UITYPE_IMAGE, field:FRIEND_AVATAR, size:128, onTouchEnded:this.onFriendAvatarTouched.bind(this)},
			btn_cancel:{onTouchEnded:this.onDeleteFriend.bind(this), visible:"FriendList.currentTab !== FL_TAB_SUGGESTION && data[FRIEND_ID] !== USER_ID_JACK"},//jira#5917 btn_cancel:{onTouchEnded:this.onDeleteFriend.bind(this), visible:this.currentTab !== FL_TAB_SUGGESTION},//feedback btn_cancel:{onTouchEnded:this.onDeleteFriend.bind(this), visible:"data[FRIEND_ID] !== USER_ID_JACK"},// jira#5661 btn_cancel:{onTouchEnded:this.onDeleteFriend.bind(this), visible:this.currentTab === FL_TAB_REQUESTS},
			lb_name:{type:UITYPE_TEXT, field:"displayName", style:TEXT_STYLE_FRIEND_NAME},//lb_name:{type:UITYPE_TEXT, field:FRIEND_NAME, style:TEXT_STYLE_FRIEND_NAME},
			lb_lv:{type:UITYPE_TEXT, field:FRIEND_LEVEL, style:TEXT_STYLE_FRIEND_LV},
			btn_accept:{onTouchEnded:this.onAddFriend.bind(this), visible:this.currentTab !== FL_TAB_FRIENDS},
			lb_accept:{type:UITYPE_TEXT, value:this.currentTab === FL_TAB_SUGGESTION ? "TXT_FRIEND_NEW_BTN_SYSTEM" : "TXT_FRIEND_NEW_BTN", style:TEXT_STYLE_TEXT_BUTTON },
			icon_vip_friend:{type:UITYPE_IMAGE, field:"iconVip",size:133,visible:"data.hasVip"},
		};
		
		var uiDef = 
		{
			tap2Close:{onTouchEnded:this.hide.bind(this)},
			tab_mail_off:{visible:this.currentTab !== FL_TAB_REQUESTS, onTouchEnded:this.changeTab.bind(this)},
			tab_mail_on:{visible:this.currentTab === FL_TAB_REQUESTS},
			tab_friends_off:{visible:this.currentTab !== FL_TAB_FRIENDS, onTouchEnded:this.changeTab.bind(this)},
			tab_friends_on:{visible:this.currentTab === FL_TAB_FRIENDS},
			tab_new_off:{visible:this.currentTab !== FL_TAB_SUGGESTION, onTouchEnded:this.changeTab.bind(this)},
			tab_new_on:{visible:this.currentTab === FL_TAB_SUGGESTION},
			icon_new_off:{visible:this.hasNewRequests()},
			icon_new_on:{visible:this.hasNewRequests()},
			lb_friend_off:{type:UITYPE_TEXT, value:"TXT_FRIEND_LIST", style:TEXT_STYLE_FRIEND_TAB_OFF},
			lb_friend_on:{type:UITYPE_TEXT, value:"TXT_FRIEND_LIST", style:TEXT_STYLE_FRIEND_TAB_ON},
			lb_new_on:{type:UITYPE_TEXT, value:"TXT_FRIEND_NEW", style:TEXT_STYLE_FRIEND_TAB_ON},
			lb_new_off:{type:UITYPE_TEXT, value:"TXT_FRIEND_NEW", style:TEXT_STYLE_FRIEND_TAB_OFF},
			container:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_FRIEND_ITEM, itemDef:itemDef, itemSize:cc.size(170, 230), singleLine:true},
			btnInvite:{visible:this.currentTab === FL_TAB_FRIENDS && ENABLE_FRIEND_LIST === true, onTouchEnded:this.onInviteFriends.bind(this)},
			lblInvite:{visible:this.currentTab === FL_TAB_FRIENDS && ENABLE_FRIEND_LIST === true, type:UITYPE_TEXT, value:"TXT_PS_INVITE", style:TEXT_STYLE_TEXT_BUTTON},
			/*btnInvite:{visible:false, onTouchEnded:this.onInviteFriends.bind(this)},
			lblInvite:{visible:false, type:UITYPE_TEXT, value:"TXT_PS_INVITE", style:TEXT_STYLE_TEXT_BUTTON},*/

			// jira#6076
			//lblUpdate:{visible:false, type:UITYPE_TEXT, value:"TXT_FRIEND_REFRESH", style:TEXT_STYLE_TEXT_NO_EFFECT_GRAY_DARK},
			//timerMarker:{visible:false, type:UITYPE_TIME_BAR, startTime:Game.getGameTimeInSeconds(), endTime:Game.getGameTimeInSeconds() + 60, countdown:true, onFinished:this.onRefreshSuggestionList.bind(this)}, // TODO: refresh time*/
			lblUpdate:{visible:this.currentTab === FL_TAB_SUGGESTION, type:UITYPE_TEXT, value:"TXT_FRIEND_REFRESH", style:TEXT_STYLE_TEXT_NO_EFFECT_GRAY_DARK},
			timerMarker:{visible:this.currentTab === FL_TAB_SUGGESTION, type:UITYPE_TIME_BAR, startTime:this.suggestionListRefreshTime, endTime:this.suggestionListRefreshTime + g_MISCINFO.FRIEND_SUGGEST_TIME_WAIT, countdown:true, onFinished:this.onRefreshSuggestionList.bind(this)},
		};
		
		var widget = FWPool.getNode(UI_FRIEND_PANEL, false);
		var pos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - FL_OFFSET);
		
		if(refresh)
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), refresh ? UIFX_NONE : {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(pos.x, pos.y - FL_HEIGHT), toPos:pos});
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgFriendList");
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);

			if(!this.container)
			{
				this.container = FWUtils.getChildByName(widget, "container");
				this.container.addEventListener(this.onScrollEvent, this);
			}
		}
		
		if(fl_scrollPos && this.currentTab === FL_TAB_FRIENDS)
		{
			this.container.getInnerContainer().setPosition(fl_scrollPos);
			fl_scrollPos = null;
		}
	},
	
	hide:function()
	{
		if(!FWUI.isShowing(UI_FRIEND_PANEL))
			return;
		
		if(this.currentTab === FL_TAB_FRIENDS)
			fl_scrollPos = this.container.getInnerContainer().getPosition();
		
		this.sendData2Server();
		var pos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - FL_OFFSET);
		FWUI.hide(UI_FRIEND_PANEL, {fx:UIFX_SLIDE_SMOOTH, fromPos:pos, toPos:cc.p(pos.x, pos.y - FL_HEIGHT)});
		FWUtils.hideDarkBg(null, "darkBgFriendList");
	},
	
	hasNewRequests:function()
	{
		// TODO
		return false;
	},
	
	changeTab:function(sender)
	{
		var name = sender.getName();
		if(name === "tab_mail_off")
			this.show(FL_TAB_REQUESTS, true);
		else if(name === "tab_friends_off")
			this.show(FL_TAB_FRIENDS, true);
		else if(name === "tab_new_off")
			this.show(FL_TAB_SUGGESTION, true);
		
		this.container.scrollToPercentHorizontal(0, 0.01, false); // jira#5472
		
		this.sendData2Server();
	},
	
	sendData2Server:function()
	{
		if(this.addFriendIds && this.addFriendIds.length > 0)
		{
			var pk = network.connector.client.getOutPacket(this.RequestFriendAdd);
			pk.pack(this.addFriendIds);
			network.connector.client.sendPacket(pk);
		}
		if(this.denyFriendIds && this.denyFriendIds.length > 0)
		{
			var pk = network.connector.client.getOutPacket(this.RequestFriendDenyRequest);
			pk.pack(this.denyFriendIds);
			network.connector.client.sendPacket(pk);
		}		
		if(this.removeFriendIds && this.removeFriendIds.length > 0)
		{
			var pk = network.connector.client.getOutPacket(this.RequestFriendRemove);
			pk.pack(this.removeFriendIds);
			network.connector.client.sendPacket(pk);
		}
		if(this.requestFriendIds && this.requestFriendIds.length > 0)
		{
			FriendList.sendRequestId = null; // multiple friends
			var pk = network.connector.client.getOutPacket(this.RequestFriendSendRequest);
			pk.pack(this.requestFriendIds);
			network.connector.client.sendPacket(pk);
			this.requestFriendIds = [];
		}
	},
	
	onFriendAvatarTouched:function(sender)
	{
		var data = sender.uiData;
		if(this.currentTab === FL_TAB_FRIENDS || this.currentTab === FL_TAB_REQUESTS)
		{
			fl_scrollPos = this.container.getInnerContainer().getPosition();
			cc.log("ICONVIP +  ",data[FRIEND_VIP] );
			GardenManager.changeGarden(data[FRIEND_ID], data[FRIEND_NAME], data[FRIEND_AVATAR],data[FRIEND_VIP]);
		}
	},
	
	onDeleteFriend:function(sender)
	{
		var data = sender.uiData;
		cc.log("FriendList: onDeleteFriend id=" + data[FRIEND_ID]);
		
		if(this.currentTab === FL_TAB_FRIENDS)
		{
			// jira#5661 confirm
			var uiDef =
			{
				lb_content:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:data[FRIEND_NAME], format:"TXT_FRIEND_REMOVE_CONFIRM"},
				lb_quit:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_FRIEND_REMOVE_YES"},
				lb_continue:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_FRIEND_REMOVE_NO"},
				btn_quit:{onTouchEnded:function(sender) {this.onFriendDeletingConfirmed(data);}.bind(this)},//web
				btn_continue:{onTouchEnded:function(sender) {this.hideFriendDeletingConfirm(sender);}.bind(this)}//web
			};
			var widget = FWUI.showWithData(UI_POPUP_GAME_QUIT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
			widget.setLocalZOrder(Z_POPUP);
			FWUtils.showDarkBg(null, Z_POPUP - 1, "confirmDeletingFriend");
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFriendDeletingConfirmFunc)
				this.hideFriendDeletingConfirmFunc = function() {this.hideFriendDeletingConfirm()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFriendDeletingConfirmFunc);
			
			return;
		}
		
		if(!this.denyFriendIds)
			this.denyFriendIds = [data[FRIEND_ID]];
		else
			this.denyFriendIds.push(data[FRIEND_ID]);
		
		// fake
		FWUtils.removeArrayElementByKeyValue(this.requestsList, FRIEND_ID, data[FRIEND_ID]);
		this.show(this.currentTab, true);
		
		// feedback: flying text
		FWUtils.showWarningText(FWLocalization.text("TXT_FRIEND_DENY_OK"), FWUtils.getWorldPosition(sender), cc.GREEN);
	},
	
	onFriendDeletingConfirmed:function(data)
	{
		if(!this.removeFriendIds)
			this.removeFriendIds = [data[FRIEND_ID]];
		else
			this.removeFriendIds.push(data[FRIEND_ID]);
		
		// fake
		FWUtils.removeArrayElementByKeyValue(this.friendsList, FRIEND_ID, data[FRIEND_ID]);
		this.show(this.currentTab, true);
		this.hideFriendDeletingConfirm();
	},
	
	hideFriendDeletingConfirm:function(sender)
	{
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		FWUI.hide(UI_POPUP_GAME_QUIT, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFriendDeletingConfirmFunc);
		FWUtils.hideDarkBg(null, "confirmDeletingFriend");
	},
	
	onAddFriend:function(sender)
	{
		if(this.friendsCount >= g_MISCINFO.FRIEND_LIMIT)
		{
			FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_FRIEND_ADD_LIMIT"), g_MISCINFO.FRIEND_LIMIT), FWUtils.getWorldPosition(sender), cc.GREEN);
			return;
		}
		
		// jira
		if(this.currentTab === FL_TAB_SUGGESTION)
		{
			this.onRequestFriend(sender);
			return;
		}
		
		var data = sender.uiData;
		cc.log("FriendList: onAddFriend id=" + data[FRIEND_ID]);
		if(!this.addFriendIds)
			this.addFriendIds = [data[FRIEND_ID]];
		else
			this.addFriendIds.push(data[FRIEND_ID]);
		
		// fake
		this.friendsList.push(data);
		this.sortList(this.friendsList);
		FWUtils.removeArrayElementByKeyValue(this.requestsList, FRIEND_ID, data[FRIEND_ID]);
		this.show(this.currentTab, true);
		
		// feedback: flying text
		FWUtils.showWarningText(FWLocalization.text("TXT_FRIEND_ADD_OK"), FWUtils.getWorldPosition(sender), cc.GREEN);
	},
	
	onRequestFriend:function(sender)
	{
		var data = sender.uiData;
		cc.log("FriendList: onRequestFriend id=" + data[FRIEND_ID]);
		if(!this.requestFriendIds)
			this.requestFriendIds = [data[FRIEND_ID]];
		else
			this.requestFriendIds.push(data[FRIEND_ID]);
		
		// fake
		FWUtils.removeArrayElementByKeyValue(this.suggestionList, FRIEND_ID, data[FRIEND_ID]);
		this.show(this.currentTab, true);
		
		// feedback: flying text
		FWUtils.showWarningText(FWLocalization.text("TXT_FRIEND_REQUEST_OK"), FWUtils.getWorldPosition(sender), cc.GREEN);
	},
	
	onInviteFriends:function(sender)
	{
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_FRIEND_INVITE_TITLE", style:TEXT_STYLE_TITLE_1},
			content1:{type:UITYPE_TEXT, value:"TXT_FRIEND_INVITE_TEXT1", style:TEXT_STYLE_TEXT_NORMAL},
			content2:{type:UITYPE_TEXT, value:"" + gv.mainUserData.mainUserId, style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			content3:{type:UITYPE_TEXT, value:"TXT_FRIEND_INVITE_TEXT2", style:TEXT_STYLE_TEXT_NORMAL},
			content4:{type:UITYPE_TEXT, value:"TXT_FRIEND_INVITE_TEXT3", style:TEXT_STYLE_TEXT_NORMAL},
			codeInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK, listener:[this.onCodeChanged, this] },//web codeInput:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},//codeInput:{type:UITYPE_TEXT, style:TEXT_STYLE_LOADING_INPUT, value:"", placeHolder:"TXT_LOADING_INPUT_PLACEHOLDER", placeHolderColor: cc.color.BLACK},
			inputText:{type:UITYPE_TEXT, value:"TXT_FRIEND_INVITE_BUTTON", style:TEXT_STYLE_TEXT_BUTTON},
			inputButton:{onTouchEnded:this.onCodeInput.bind(this)},
			closeButton:{onTouchEnded:this.onCloseInviteFriends.bind(this)},
		};
		
		var widget = FWUI.showWithData(UI_FRIEND_INVITE, null, uiDef, FWUtils.getCurrentScene(), UIFX_NONE);
		widget.setLocalZOrder(Z_POPUP - 1);
		AudioManager.effect(EFFECT_POPUP_SHOW);

		if(!this.codeInput)
		{
			this.codeInput = FWUtils.getChildByName(widget, "codeInput");
			this.codeInputButton = FWUtils.getChildByName(widget, "inputButton");
			//web this.codeInput.addEventListener(this.onCodeChanged, this);
			this.codeInput.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
		}
		this.codeInput.setString("");
		this.codeInputButton.setEnabled(false);
	},
	
	onCodeChanged:function(sender, type)
	{
		var inputString = this.codeInput.getString();
		if(inputString === "")
		{
			this.codeInputButton.setEnabled(false);
			return;
		}
		
		var inputNum = Number(inputString);
		this.codeInputButton.setEnabled(!isNaN(inputNum) && inputNum !== gv.mainUserData.mainUserId);
	},
	
	onCodeInput:function(sender)
	{
		// jira#5751
		var id = this.codeInput.getString();
		this.onCloseInviteFriends();
		
		for(var i=0; i<this.friendsList.length; i++)
		{
			if(this.friendsList[i][FRIEND_ID] == id)
			{
				Game.showPopup({title:"TXT_POPUP_TITLE", content:cc.formatStr(FWLocalization.text("TXT_FRIEND_CANNOT_SEND_REQUEST_EXIST"), id)}, function() {});
				return;
			}
		}
		for(var i=0; i<this.requestsList.length; i++)
		{
			if(this.requestsList[i][FRIEND_ID] == id)
			{
				Game.showPopup({title:"TXT_POPUP_TITLE", content:cc.formatStr(FWLocalization.text("TXT_FRIEND_CANNOT_SEND_REQUEST_INVITING"), id)}, function() {});
				return;
			}
		}
		for(var i=0; i<this.suggestionList.length; i++)
		{
			if(this.suggestionList[i][FRIEND_ID] == id)
			{
				Game.showPopup({title:"TXT_POPUP_TITLE", content:cc.formatStr(FWLocalization.text("TXT_FRIEND_CANNOT_SEND_REQUEST_INVITING"), id)}, function() {});
				return;
			}
		}

		FriendList.sendRequestId = id; // 1 friend
		var pk = network.connector.client.getOutPacket(this.RequestFriendSendRequest);
		pk.pack([id]);
		network.connector.client.sendPacket(pk);
	},
	
	onCloseInviteFriends:function(sender)
	{
		FWUI.hide(UI_FRIEND_INVITE, UIFX_NONE);
	},
	
	onRefreshSuggestionList:function(sender)
	{
		// jira#6076
		//this.suggestionListRefreshTime = Game.getGameTimeInSeconds(); // jira#6423 moved to onFriendListLoaded
		this.load(true);
	},
	
	onScrollEvent:function(sender, type)
	{
		if(this.currentTab !== FL_TAB_FRIENDS || this.isLoading || this.friendsList.length >= this.friendsCount)
			return;
		
		if(type === ccui.ScrollView.EVENT_SCROLLING && this.container.innerWidth + this.container.getInnerContainer().getPosition().x < cc.winSize.width)
		{
			if(FL_FAKE_DATA)
			{
				// fake
				this.isLoading = true;
				cc.director.getScheduler().scheduleCallbackForTarget(this, this.loadNextPage, 0, 0, 1, false);
			}
			else
			{
				// TODO: load next page
			}
		}
	},
	
	// fake
	loadNextPage:function()
	{
		for(var i=0; i<10; i++)
		{
			var p = {4:100, 5:"Friend", 6:"hud/hud_avatar_default.png", 7:0};
			this.friendsList.push(p);
			if(this.friendsList.length >= this.friendsCount)
				break;
		}
		
		this.isLoading = false;
		if(FWUI.isShowing(UI_FRIEND_PANEL) && this.currentTab === FL_TAB_FRIENDS)
			this.show(this.currentTab, true);
	},
	
	sortList:function(list)
	{
		// make sure result is the same as server's
		list.sort(function(a, b)
		{
			if(a[FRIEND_ID] === USER_ID_JACK)
				return -1;
			else if(b[FRIEND_ID] === USER_ID_JACK)
				return 1;
			else if(a[FRIEND_LEVEL] === b[FRIEND_LEVEL])
				return (a[FRIEND_ID] < b[FRIEND_ID] ? -1 : 1);
			else
				return (a[FRIEND_LEVEL] > b[FRIEND_LEVEL] ? -1 : 1);
		});
	},
	
	canAddFriend:function(id)
	{
		for(var i=0; i<this.friendsList.length; i++)
		{
			if(this.friendsList[i][FRIEND_ID] == id)
				return false;
		}
		for(var i=0; i<this.requestsList.length; i++)
		{
			if(this.requestsList[i][FRIEND_ID] == id)
				return false;
		}
		for(var i=0; i<this.suggestionList.length; i++)
		{
			if(this.suggestionList[i][FRIEND_ID] == id)
				return false;
		}
		if(this.tempRequestList.indexOf(id) >= 0)
			return false;
		return true;
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	data: null,
	showAfterLoading: false,
	load:function(showAfterLoading)//web load:function(showAfterLoading = false)
	{
		if(showAfterLoading === undefined)
			showAfterLoading = false;
		
		this.showAfterLoading = showAfterLoading;
		
		var pk = network.connector.client.getOutPacket(this.RequestFriendGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onFriendListLoaded:function(data)
	{
		this.data = data;
		this.requestsList = data[FRIEND_REQUESTS];
		this.friendsList = data[FRIEND_FRIENDS];
		this.suggestionList = data[FRIEND_SUGGESTS];
		this.requestsCount = this.requestsList.length;
		this.suggestionCount = this.suggestionList.length;
		
		var jack = {};
		jack[FRIEND_ID] = USER_ID_JACK;
		jack[FRIEND_NAME] = FWLocalization.text("TXT_NPC_JACK");
		jack[FRIEND_AVATAR] = "hud/hud_avatar_jack.png";
		jack[FRIEND_LEVEL] = 150;
		jack[FRIEND_VIP] = OFFER_VIP_2;
		this.friendsList.splice(0, 0, jack);
		this.friendsCount = this.friendsList.length;
		
		this.updateDisplayName(this.requestsList);
		this.updateDisplayName(this.friendsList);
		this.updateDisplayName(this.suggestionList);
		
		this.sortList(this.requestsList);
		this.sortList(this.friendsList);
		this.sortList(this.suggestionList);
		
		if(this.showAfterLoading)
		{
			FWUtils.disableAllTouches(false);
			this.show(this.currentTab, FWUI.isShowing(UI_FRIEND_PANEL));
		}
		
		Ranking.friendlistUpdated = true;
		
		// jira#6423
		this.suggestionListRefreshTime = Game.getGameTimeInSeconds();
	},
	
	updateDisplayName:function(list)
	{
		var len = list.length;
		for(var i=0; i<len; i++)
			list[i].displayName = FWUtils.cutLongString(list[i][FRIEND_NAME], 13);
	},
	
	RequestFriendGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_GET);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseFriendGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			FriendList.onFriendListLoaded(object[KEY_FRIEND_LIST]);
			if(this.getError() !== 0)
				cc.log("FriendList.ResponseFriendGet: error=" + this.getError());
		}
	}),
	
	addFriendIds: null,
	RequestFriendAdd:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_ADD);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, ids);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseFriendAdd:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var successList = object[KEY_UID];
			if(FriendList.addFriendIds && FriendList.addFriendIds.length > successList.length)
			{
				// failed to add some friends => refresh
				FWUtils.disableAllTouches();
				FriendList.load(true);
			}
			FriendList.addFriendIds = null;
			
			Achievement.onAction(g_ACTIONS.ACTION_FRIEND_ACCEPTED_REQUEST.VALUE, null, successList.length);
				
			if(this.getError() !== 0)
				cc.log("FriendList.ResponseFriendAdd: error=" + this.getError());
		}
	}),

	denyFriendIds: null,
	RequestFriendDenyRequest:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_DENY_REQUEST);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, ids);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseFriendDenyRequest:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FriendList.denyFriendIds = null;
			if(this.getError() !== 0)
				cc.log("FriendList.ResponseFriendDenyRequest: error=" + this.getError());
		}
	}),	
	
	removeFriendIds: null,
	RequestFriendRemove:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_REMOVE);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, ids);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseFriendRemove:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FriendList.removeFriendIds = null;
			if(this.getError() !== 0)
				cc.log("FriendList.ResponseFriendRemove: error=" + this.getError());
		}
	}),		
	
	sendRequestId: null,
	RequestFriendSendRequest:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_SEND_REQUEST);},
		pack:function(ids)
		{
			addPacketHeader(this);
			PacketHelper.putIntArray(this, KEY_UID, ids);
			
			addPacketFooter(this);
			
			for(var i=0; i<ids.length; i++)
			{
				if(FriendList.tempRequestList.indexOf(ids[i]) < 0)
					FriendList.tempRequestList.push(ids[i]);
			}
		},
	}),
	
	ResponseFriendRequest:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var successList = object[KEY_UID];
			if(successList.length <= 0)
			{
				// failed
				if(FriendList.sendRequestId) // only show result if suggestion is sent via suggestion dialog
					Game.showPopup({title:"TXT_POPUP_TITLE", content:cc.formatStr(FWLocalization.text("TXT_FRIEND_CANNOT_SEND_REQUEST"), FriendList.sendRequestId)}, function() {});
			}
			else
			{
				// succeed
				if(FriendList.sendRequestId) // only show result if suggestion is sent via suggestion dialog
					Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_FRIEND_REQUEST_SENT"}, function() {});
				Achievement.onAction(g_ACTIONS.ACTION_FRIEND_SEND_REQUEST.VALUE, null, successList.length);
			}

			if(this.getError() !== 0)
				cc.log("FriendList.ResponseFriendRequest: error=" + this.getError());
		}
	}),		
	
	ResponseFriendNotify:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			FriendList.showAfterLoading = (FWUI.isShowing(UI_FRIEND_PANEL));
			FriendList.onFriendListLoaded(object[KEY_FRIEND_LIST]);
		}
	}),			
};

network.packetMap[gv.CMD.FRIEND_GET] = FriendList.ResponseFriendGet;
network.packetMap[gv.CMD.FRIEND_ADD] = FriendList.ResponseFriendAdd;
network.packetMap[gv.CMD.FRIEND_DENY_REQUEST] = FriendList.ResponseFriendDenyRequest;
network.packetMap[gv.CMD.FRIEND_SEND_REQUEST] = FriendList.ResponseFriendRequest;
network.packetMap[gv.CMD.FRIEND_NOTIFY_ADD] = FriendList.ResponseFriendNotify;
network.packetMap[gv.CMD.FRIEND_NOTIFY_REMOVE] = FriendList.ResponseFriendNotify;
network.packetMap[gv.CMD.FRIEND_NOTIFY_REQUEST] = FriendList.ResponseFriendNotify;
network.packetMap[gv.CMD.FRIEND_REMOVE] = FriendList.ResponseFriendRemove;

