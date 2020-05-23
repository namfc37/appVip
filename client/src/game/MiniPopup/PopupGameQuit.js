var PopupGameQuit = cc.Node.extend({
	LOGTAG: "[PopupGameQuit]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_POPUP_GAME_QUIT, false);
		
        var uiDefine = {
			lb_content: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value: "TXT_EXIT_GAME_CONFIRM" },
			lb_quit: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value: "TXT_EXIT_GAME_YES" },
			lb_continue: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value: "TXT_EXIT_GAME_NO" }
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
			btn_quit: { onTouchEnded: this.onQuit.bind(this) },//web
			btn_continue: { onTouchEnded: this.hide.bind(this) }//web
        };

		FWUI.fillData(this.widget, null, uiDefine);

		if (FWUI.isShowing(UI_POPUP_GAME_QUIT))
			return;
			
		FWUI.setWidgetCascadeOpacity(this.widget, true);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder(Z_UI_QUIT_GAME - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		FWUtils.showDarkBg(null, Z_UI_QUIT_GAME - 2, "darkBgArcade", null, true);

		// jira#5541
		//if(!this.hideFunc)
		//	this.hideFunc = function() {this.hide()}.bind(this);
		//Game.gameScene.registerBackKey(this.hideFunc);
	},

	hide: function (sender)//web
	{
		cc.log(this.LOGTAG, "hide");
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		//Game.gameScene.unregisterBackKey(this.hideFunc);
		
        FWUtils.hideDarkBg(null, "darkBgArcade");
	},
	
	onQuit:function(sender)
	{
		Game.endGameScene();//Game.endGame();
	},
});