const UTIL_SETTING = "setting";
const UTIL_LIBRARY = "library";
const UTIL_COMMUNITY = "community";
const UTIL_GAMES = "games";

var UtilPanelContainer = cc.Node.extend({
	LOGTAG: "[UtilPanelContainer]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_UTIL_CONTAINER, false);
		this.container = FWUI.getChildByName(this.widget, "container"); 
		this.lb_title = FWUI.getChildByName(this.widget, "lb_title");
		this.tab_setting_on = FWUI.getChildByName(this.widget, "tab_setting_on");
		this.tab_setting_off = FWUI.getChildByName(this.widget, "tab_setting_off");
		this.tab_library_on = FWUI.getChildByName(this.widget, "tab_library_on");
		this.tab_library_off = FWUI.getChildByName(this.widget, "tab_library_off");
		this.tab_com_on = FWUI.getChildByName(this.widget, "tab_com_on");
		this.tab_com_off = FWUI.getChildByName(this.widget, "tab_com_off");
		this.tab_game_on = FWUI.getChildByName(this.widget, "tab_game_on");
		this.tab_game_off = FWUI.getChildByName(this.widget, "tab_game_off");

		this.tabs = {};
		this.tabs [UTIL_SETTING] = {
			on: this.tab_setting_on,
			off: this.tab_setting_off,
			title: FWLocalization.text("TXT_UTIL_SETTING_TITLE"),
			panel: function() {return new UtilPanelSetting ();}//web
		};

		this.tabs [UTIL_LIBRARY] = {
			on: this.tab_library_on,
			off: this.tab_library_off,
			title: FWLocalization.text("TXT_UTIL_LIBRARY_TITLE"),
			panel: function() {return new UtilPanelLibrary ();}//web
		};

		this.tabs [UTIL_COMMUNITY] = {
			on: this.tab_com_on,
			off: this.tab_com_off,
			title: FWLocalization.text("TXT_UTIL_COMMUNITY_TITLE"),
			panel: function() {return new UtilPanelCommunity ();}//web
		};

		// this.tabs [UTIL_GAMES] = {
		// 	on: this.tab_game_on,
		// 	off: this.tab_game_off,
		// 	title: FWLocalization.text("TXT_UTIL_GAMES_TITLE"),
		// 	panel: null
		// };
		
		var uiDefine = {
			lb_title: { type: UITYPE_TEXT, id: FWLocalization.text(""), style: TEXT_STYLE_TITLE_1 },
			// tab_setting_on: {  },
			tab_setting_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_SETTING);}.bind(this) },
			// tab_library_on: {  },
			tab_library_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_LIBRARY);}.bind(this) },
			// tab_com_on: {  },
			tab_com_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_COMMUNITY);}.bind(this) },
			// tab_game_on: {  },
			// tab_game_off: { onTouchEnded: function(sender) {this.onTab (sender, UTIL_GAMES, false) },
			btn_close: { onTouchEnded: function(sender) {this.hide ();}.bind(this) }
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

	show: function (tab, subtab)//web show: function (tab, subtab = null)
	{
		if(subtab === undefined)
			subtab = null;
		
		cc.log(this.LOGTAG, "show");

		this.currentTab = null;
		this.onTab (null, tab, subtab);

		if (FWUI.isShowing(UI_UTIL_CONTAINER))
			return;
			
		FWUI.setWidgetCascadeOpacity(this.widget, true);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder(Z_UI_COMMON - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgArcade", null, true);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},

	hide: function ()
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		FWUtils.hideDarkBg(null, "darkBgArcade");
		
		this.container.removeAllChildren();
		if (this.currentPanel)
			this.currentPanel.hide();
		
		this.currentTab = null;
	},

	onTab: function (sender, tab, subtab)//web onTab: function (sender, tab, subtab = null)
	{
		if(subtab === undefined)
			subtab = null;
		
		cc.log(this.LOGTAG, "onTab", tab, subtab);
		if (this.currentTab === tab)
			return;

		var current = this.tabs [tab];
		if (current.panel === null)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
			return;
		}

		this.lb_title.setString(current.title);

		for (var i in this.tabs)
		{
			var tab = this.tabs [i];
			tab.on.setVisible (false);
			tab.off.setVisible (true);
		}

		current.on.setVisible (true);
		current.off.setVisible (false);

		this.container.removeAllChildren();
		if (this.currentPanel)
			this.currentPanel.hide();

		this.currentPanel = current.panel ();
		this.currentPanel.show (this, subtab);
		
		var uiDefine = {
			btn_close: { onTouchEnded: function(sender) {this.hide ();}.bind(this) }
		};

		FWUI.fillData(this.widget, null, uiDefine);
		this.currentTab = tab;
	}
});