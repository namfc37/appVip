var PopupGameUpgrade = cc.Node.extend({
	LOGTAG: "[PopupGameUpgrade]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_POPUP_GAME_UPGRADE, false);
        var uiDefine = {
			lb_title: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG_TITLE, value: "TXT_NEW_VERSION_TITLE", visible:true },
			lb_content: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value: "TXT_NEW_VERSION_CONTENT" },
			lb_upgrade: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value: "TXT_NEW_VERSION_BTN" },
			stars: {visible:false},
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

	show: function ()
	{
        cc.log(this.LOGTAG, "show");

        var uiDefine = {
			btn_upgrade: { onTouchEnded: this.onUpgrade.bind(this) },//web
			btn_close: { onTouchEnded: this.hide.bind(this) }//web
        };

		FWUI.fillData(this.widget, null, uiDefine);

		if (FWUI.isShowing(UI_POPUP_GAME_UPGRADE))
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

	hide: function (sender)//web
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
        FWUtils.hideDarkBg(null, "darkBgArcade");
	},
	
	onUpgrade: function(sender)
	{
		cc.log(this.LOGTAG, "onUpgrade", "TODO: need complete function");
		this.hide ();
	},
});