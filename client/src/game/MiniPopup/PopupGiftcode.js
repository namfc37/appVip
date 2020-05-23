var PopupGiftcode = cc.Node.extend({
	LOGTAG: "[PopupGiftcode]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_POPUP_GIFTCODE, false);
        var uiDefine = {
			lb_title: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value: "TXT_GIFTCODE_TITLE" },
			lb_submit: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value: "TXT_GIFTCODE_BTN" },
        };

		FWUI.fillData(this.widget, null, uiDefine);

		// jira#5735
		if(!this.codeInput)
		{
			this.codeInput = FWUtils.getChildByName(this.widget, "tf_giftcode");
			//web
			if(cc.sys.isNative)
				this.codeInput.addEventListener(this.onCodeChanged, this);
			else
				this.codeInput.setDelegate(this);
		}
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	show: function (code)
	{
        cc.log(this.LOGTAG, "show");

        var uiDefine = {
			tf_giftcode: {type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"", placeHolder:"TXT_GIFTCODE_HINT", placeHolderColor: cc.color.BLACK},
			btn_submit: { onTouchEnded: this.onSubmit.bind(this) },//web
			btn_close: { onTouchEnded: this.hide.bind(this) }//web
        };

		FWUI.fillData(this.widget, null, uiDefine);
		if (FWUI.isShowing(UI_POPUP_GIFTCODE))
			return;
			
		FWUI.setWidgetCascadeOpacity(this.widget, true);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder(Z_UI_COMMON - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgArcade", null, true);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
		
		// jira#7028
		if(code !== undefined)
		{
			var tf_giftcode = FWUtils.getChildByName(this.widget, "tf_giftcode");
			tf_giftcode.setString(code);
		}
	},

	hide: function (sender)//web
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
        FWUtils.hideDarkBg(null, "darkBgArcade");
    },
	
	onSubmit: function(sender)
	{
		//cc.log(this.LOGTAG, "onSubmit", "TODO: need complete function");
		
		var textField = FWUtils.getChildByName(this.widget, "tf_giftcode");
		var code = textField.getString();
		if(!code)
		{
			Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_GIFTCODE_ERROR_INPUT"}, function() {});			
			return;
		}
		
		cc.log("PopupGiftcode::onSubmit: code=" + code);
				
		var pk = network.connector.client.getOutPacket(network.RequestGiftCodeGetReward);
		pk.pack(code);
		network.connector.client.sendPacket(pk);
	},
	
	// jira#5735
	onCodeChanged:function(sender, type)
	{
		var inputString = this.codeInput.getString();
		this.codeInput.setString(inputString.toUpperCase());
	},
	
	//web
    editBoxTextChanged: function (editBox, text) {
		this.onCodeChanged(editBox);
    },
	
});