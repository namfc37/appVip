const FRIEND_TAB_INBOX = "mail";
const FRIEND_TAB_LIST = "friends";
const FRIEND_TAB_NEW = "new";
const FRIEND_ITEM_WIDTH = 155;
const FRIEND_ITEM_HEIGHT = 230;

var FriendPanel = cc.Node.extend({
	LOGTAG: "[FriendPanel]",

	ctor: function ()
	{
		this._super();

		var cx = cc.winSize.width * 0.5;
		var cy = cc.winSize.height * 0.5;
		this.fx_in = {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cx, cy - 300), toPos:cc.p(cx, cy)};
		this.fx_out = {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cx, cy), toPos:cc.p(cx, cy - 300)};
		
		this.widget = FWPool.getNode(UI_FRIEND_PANEL, false);
		this.container = FWUI.getChildByName(this.widget, "container");

		this.tabs = {};
		this.tabs [FRIEND_TAB_INBOX] = {
			on: FWUI.getChildByName(this.widget, "tab_mail_on"),
			off: FWUI.getChildByName(this.widget, "tab_mail_off"),
			alert_on: FWUI.getChildByName(this.widget, "icon_new_on"),
			alert_off: FWUI.getChildByName(this.widget, "icon_new_off"),
			position: cc.p (0, 0),
			panel: () => this.showInbox ()
		};

		this.tabs [FRIEND_TAB_LIST] = {
			on: FWUI.getChildByName(this.widget, "tab_friends_on"),
			off: FWUI.getChildByName(this.widget, "tab_friends_off"),
			position: cc.p (0, -15),
			panel: () => this.showFriendList ()
		};

		this.tabs [FRIEND_TAB_NEW] = {
			on: FWUI.getChildByName(this.widget, "tab_new_on"),
			off: FWUI.getChildByName(this.widget, "tab_new_off"),
			position: cc.p (0, 0),
			panel: () => this.showSuggestFriend ()
		};
		
		var uiDefine = {
			lb_friend_on: { type: UITYPE_TEXT, value: "TXT_FRIEND_LIST", style: TEXT_STYLE_FRIEND_TAB_ON },
			lb_friend_off: { type: UITYPE_TEXT, value: "TXT_FRIEND_LIST", style: TEXT_STYLE_FRIEND_TAB_OFF },
			lb_new_on: { type: UITYPE_TEXT, value: "TXT_FRIEND_NEW", style: TEXT_STYLE_FRIEND_TAB_ON },
			lb_new_off: { type: UITYPE_TEXT, value: "TXT_FRIEND_NEW", style: TEXT_STYLE_FRIEND_TAB_OFF },
			tab_mail_on: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_INBOX) },
			tab_mail_off: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_INBOX) },
			tab_friends_on: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_LIST) },
			tab_friends_off: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_LIST) },
			tab_new_on: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_NEW) },
			tab_new_off: { onTouchEnded: (sender) => this.onTab (sender, FRIEND_TAB_NEW) },
			cover: { onTouchEnded: (sender) => this.hide () }
		};

		FWUI.fillData(this.widget, null, uiDefine);
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	show: function (tab)
	{
		cc.log(this.LOGTAG, "show");

		this.currentTab = null;
		this.onTab (null, tab);

		if (FWUI.isShowing(UI_FRIEND_PANEL))
			return;
			
		FWUI.setWidgetCascadeOpacity(this.widget, true);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), this.fx_in, true);
		this.widget.setLocalZOrder(Z_UI_COMMON - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
	},

	hide: function ()
	{
		FWUI.hideWidget(this.widget, this.fx_out);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		
		this.container.removeAllChildren();
		if (this.currentPanel)
			this.currentPanel.hide();
		
		this.currentTab = null;
	},

	onTab: function (sender, tab)
	{
		cc.log(this.LOGTAG, "onTab", tab);
		if (this.currentTab === tab)
			return;

		var current = this.tabs [tab];
		if (current.panel === null)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
			return;
		}

		for (var i in this.tabs)
		{
			var tab = this.tabs [i];
			tab.on.setVisible (false);
			tab.off.setVisible (true);
		}

		current.on.setVisible (true);
		current.off.setVisible (false);

		this.container.removeAllChildren();
		// this.container.runAction (cc.moveTo (0.5, current.position));
		var list = current.panel ();
		for (var i in list)
			this.container.addChild (list [i]);

		cc.log (this.LOGTAG, list.length, FRIEND_ITEM_WIDTH * list.length);
		this.container.setInnerContainerSize(cc.size(FRIEND_ITEM_WIDTH * list.length, FRIEND_ITEM_HEIGHT));

		// var data = current.panel ();
		// for (var i in data.list)
		// {
		// 	var item = data.list [i];
		// 	var panel = FWPool.getNode(UI_FRIEND_ITEM, true, true);
		// 	panel.setPosition (cc.p (FRIEND_ITEM_WIDTH * i, 0));
		// 	FWUI.fillData(panel, item, data.def);
		// }

		// container: {type:UITYPE_2D_LIST, items:data.list, itemUI:UI_FRIEND_ITEM, itemDef:data.def, itemSize:cc.size(FRIEND_ITEM_WIDTH, FRIEND_ITEM_HEIGHT), singleLine:true },
		// this.container.setInnerContainerSize(cc.size(FRIEND_ITEM_WIDTH * data.list.length, FRIEND_ITEM_HEIGHT));
		
		var uiDefine = {
			cover: { onTouchEnded: (sender) => this.hide () },
		};

		FWUI.fillData(this.widget, null, uiDefine);
		this.currentTab = tab;
	},

	showInbox: function ()
	{
		var friends = [];
		// for (var i = 0; i < 20; i++)
		// {
		// 	friends.push ({
		// 		avatar: "hud/hud_avatar_default.png",
		// 		id: "friend_" + i,
		// 		level: Math.round (Math.random () * 200),
		// 	});
		// }
		
		var list = [];
		for (var i in friends)
		{
			var friend = friends [i];
			var def = {
				icon_avatar: { type:UITYPE_IMAGE, value: friend.avatar },
				lb_name: { type: UITYPE_TEXT, id: friend.id, style: TEXT_STYLE_FRIEND_NAME, position: cc.p (90, 80) },
				lb_lv: { type: UITYPE_TEXT, id: friend.level, style: TEXT_STYLE_FRIEND_LV },
				
				btn_cancel: { onTouchEnded: (sender) => this.onCancelFriend (friend.id) },
				btn_accept: { onTouchEnded: (sender) => this.onAcceptFriend (friend.id) },
				lb_accept: { type: UITYPE_TEXT, value: "TXT_OK", style: TEXT_STYLE_TEXT_BUTTON },
			};

			var panel = FWPool.getNode(UI_FRIEND_ITEM, true, true);
			panel.setPosition (cc.p (FRIEND_ITEM_WIDTH * i, 0));
			FWUI.fillData(panel, null, def);

			list.push (panel);
		}

		return list;
	},

	onAcceptFriend: function (friendId)
	{
		cc.log (this.LOGTAG, "onAcceptFriend", friendId);
	},
	
	onCancelFriend: function (friendId)
	{
		cc.log (this.LOGTAG, "onCancelFriend", friendId);
	},
	
	showFriendList: function ()
	{
		var friends = [];
		friends.push ({
			avatar: "hud/hud_avatar_jack.png",
			id: "JACK",
			level: 150,//this is hard code
		});
		// for (var i = 0; i < 20; i++)
		// {
		// 	friends.push ({
		// 		avatar: "hud/hud_avatar_default.png",
		// 		id: "friend_" + i,
		// 		level: Math.round (Math.random () * 200),
		// 	});
		// }

		var list = [];
		for (var i in friends)
		{
			var friend = friends [i];
			var def = {
				icon_avatar: { type:UITYPE_IMAGE, value: friend.avatar, onTouchEnded: (sender) => this.onFriend (friend.id) },
				lb_name: { type: UITYPE_TEXT, id: friend.id, style: TEXT_STYLE_FRIEND_NAME, position: cc.p (90, 60) },
				lb_lv: { type: UITYPE_TEXT, id: friend.level, style: TEXT_STYLE_FRIEND_LV },

				btn_cancel: { visible: false },
				btn_accept: { visible: false },
				lb_accept: { visible: false }
			};

			var panel = FWPool.getNode(UI_FRIEND_ITEM, true, true);
			panel.setPosition (cc.p (FRIEND_ITEM_WIDTH * i, 0));
			FWUI.fillData(panel, null, def);

			list.push (panel);
		}

		return list;
	},
	
	onFriend: function (friendId)
	{
		cc.log (this.LOGTAG, "onFriend", friendId);
		if (friendId === "JACK")
			GardenManager.changeGarden(USER_ID_JACK);
		else
		{
			
		}
	},
	
	showSuggestFriend: function ()
	{
		var friends = [];
		// for (var i = 0; i < 20; i++)
		// {
		// 	friends.push ({
		// 		avatar: "hud/hud_avatar_default.png",
		// 		id: "friend_" + i,
		// 		level: Math.round (Math.random () * 200),
		// 	});
		// }
		
		var list = [];
		for (var i in friends)
		{
			var friend = friends [i];
			var def = {
				icon_avatar: { type:UITYPE_IMAGE, value: friend.avatar },
				lb_name: { type: UITYPE_TEXT, id: friend.id, style: TEXT_STYLE_FRIEND_NAME, position: cc.p (90, 80) },
				lb_lv: { type: UITYPE_TEXT, id: friend.level, style: TEXT_STYLE_FRIEND_LV },
	
				btn_cancel: { visible: false },
				btn_accept: { onTouchEnded: (sender) => this.onSuggestFriend (friend.id) },
				lb_accept: { type: UITYPE_TEXT, value: "TXT_FRIEND_NEW_BTN", style: TEXT_STYLE_TEXT_BUTTON }
			};

			var panel = FWPool.getNode(UI_FRIEND_ITEM, true, true);
			panel.setPosition (cc.p (FRIEND_ITEM_WIDTH * i, 0));
			FWUI.fillData(panel, null, def);

			list.push (panel);
		}

		return list;
	},

	onSuggestFriend: function (friendId)
	{
		cc.log (this.LOGTAG, "onSuggestFriend", friendId);
	},
});