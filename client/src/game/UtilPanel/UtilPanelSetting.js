var UtilPanelSetting = cc.Node.extend({
	LOGTAG: "[UtilPanelContainer]",

	ctor: function ()
	{
		this._super();

		this.widget = FWPool.getNode(UI_UTIL_SETTING, false);
        this.btn_support = FWUI.getChildByName(this.widget, "btn_support");
        this.btn_giftcode = FWUI.getChildByName(this.widget, "btn_giftcode");
        this.btn_logout = FWUI.getChildByName(this.widget, "btn_logout");
        this.btn_language = FWUI.getChildByName(this.widget, "btn_language");
        this.btn_rating = FWUI.getChildByName(this.widget, "btn_rating");
        
        this.lb_support = FWUI.getChildByName(this.btn_support, "lb_support");
        this.lb_giftcode = FWUI.getChildByName(this.btn_support, "lb_giftcode");
        this.lb_logout = FWUI.getChildByName(this.btn_support, "lb_logout");
        this.lb_language = FWUI.getChildByName(this.btn_support, "lb_language");
        this.lb_rating = FWUI.getChildByName(this.btn_support, "lb_rating");

		var panelUser = FWUI.getChildByName(this.widget, "panel_user");

        this.lb_userName = FWUI.getChildByName(panelUser, "lb_username");
        this.lb_userId = FWUI.getChildByName(panelUser, "lb_userid");
        this.lb_userLevel = FWUI.getChildByName(panelUser, "lb_level");
        this.btn_music_on = FWUI.getChildByName(panelUser, "btn_music_on");
        this.btn_music_off = FWUI.getChildByName(panelUser, "btn_music_off");
        this.btn_sound_on = FWUI.getChildByName(panelUser, "btn_sound_on");
        this.btn_sound_off = FWUI.getChildByName(panelUser, "btn_sound_off");

		this.btn_music = {
            on: this.btn_music_on,
            off: this.btn_music_off
        };

		this.btn_sound = {
            on: this.tab_setting_on,
            off: this.tab_setting_off
		};
		
		var version = fr.platformWrapper.getClientVersion() + "b" + FWClientConfig.scriptVersion;
		if (!FWClientConfig.isBuildLive())
			version += "(" + FWClientConfig.environment.build + ")";
		
		var uiDefine = {
			btn_support: { onTouchEnded: function(sender) {this.onSupport (sender);}.bind(this) },
			btn_giftcode: { onTouchEnded: function(sender) {this.onGiftcode (sender);}.bind(this), enabled:g_MISCINFO.GIFTCODE_ACTIVE},
			btn_logout: { onTouchEnded: function(sender) {this.onLogout (sender);}.bind(this), visible:!ZPLogin.usePortal },
			btn_language: { onTouchEnded: function(sender) {this.onLanguage (sender);}.bind(this), visible:false },
			btn_rating: { onTouchEnded: function(sender) {Game.onRating(sender);}.bind(this), visible:Game.canRate() },
			btn_music_on: { visible: AudioManager.setting.isMusicOn (), onTouchEnded: function(sender) {this.onMusic (sender);}.bind(this) },
			btn_music_off: { visible: !AudioManager.setting.isMusicOn (), onTouchEnded: function(sender) {this.onMusic (sender);}.bind(this) },
			btn_sound_on: { visible: AudioManager.setting.isEffectOn (), onTouchEnded: function(sender) {this.onEffect (sender);}.bind(this) },
            btn_sound_off: { visible: !AudioManager.setting.isEffectOn (), onTouchEnded: function(sender) {this.onEffect (sender);}.bind(this) },
            
			lb_username: { type: UITYPE_TEXT, id: gv.userData.getDisplayName(), style: TEXT_STYLE_TEXT_NORMAL },
			lb_userid: { type: UITYPE_TEXT, id: "" + gv.userData.userId, style: TEXT_STYLE_TEXT_NORMAL },
			lb_level: { type: UITYPE_TEXT, id: gv.userData.getLevel(), style: TEXT_STYLE_NUMBER },
			lb_support: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_SETTING_SUPPORT"), style: TEXT_STYLE_TEXT_NORMAL },
			lb_giftcode: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_SETTING_GIFTCODE"), style: TEXT_STYLE_TEXT_NORMAL },
			lb_logout: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_SETTING_LOGOUT"), style: TEXT_STYLE_TEXT_NORMAL },
			lb_language: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_SETTING_LANGUAGE"), style: TEXT_STYLE_TEXT_NORMAL },
			lb_rating: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_RATING_BUTTON"), style: TEXT_STYLE_TEXT_NORMAL },
			lb_cloud: { type: UITYPE_TEXT, id: FWLocalization.text(version), style: {
				size: 24,
				color: cc.color(90, 90, 90, 255)
			}},
			
			defaultavatar: {type:UITYPE_IMAGE, value:gv.userData.getAvatar(), size:77},
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

	show: function (parent)
	{
		cc.log(this.LOGTAG, "show");

		if (FWUI.isShowing(UI_UTIL_SETTING))
			return;
		
		this.myParent = parent;
		FWUI.showWidget(this.widget, parent.container, UIFX_POP, true);
	},

	hide: function ()
	{
		// FWUI.hideWidget(this.widget, UIFX_POP);
	},

	onMusic: function (sender)
	{
		var on = AudioManager.setting.musicSwitch ();
		this.btn_music_on.setVisible (on);
		this.btn_music_off.setVisible (!on);
	},

	onEffect: function (sender)
	{
		var on = AudioManager.setting.effectSwitch ();
		this.btn_sound_on.setVisible (on);
		this.btn_sound_off.setVisible (!on);
	},

	onSupport: function (sender)
	{
		cc.log(this.LOGTAG, "onSupport", FWLocalization.text("TXT_FACEBOOK_HELP_LINK").replace(/\|/g, "/"));
		cc.sys.openURL(FWLocalization.text("TXT_FACEBOOK_HELP_LINK").replace(/\|/g, "/"));
	},

	onGiftcode: function (sender)
	{
		this.myParent.hide ();
		gv.miniPopup.showGiftcode ();
	},

	onLogout: function (sender)
	{
		this.myParent.hide ();
		GardenManager.logout();
	},

	onLanguage: function (sender)
	{
		cc.log(this.LOGTAG, "onLanguage", "TODO: need complete function");
	},
});