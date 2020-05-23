var PopupFeaturePresent = cc.Node.extend({
	LOGTAG: "[PopupFeaturePresent]",

	ctor: function (hasCloseButton)//web ctor: function (hasCloseButton = true)
	{
		if(hasCloseButton === undefined)
			hasCloseButton = true;
		
		this._super();
		this.hasCloseButton = hasCloseButton;
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	show: function (data)
	{
        cc.log(this.LOGTAG, "show");
        
		if (FWUI.isShowing(UI_FEATURE_PRESENT))
			return;
        
        var uiDef =
        {
            title:{type:UITYPE_TEXT, value: data.level, format: data.title},
            npc:{type:UITYPE_IMAGE, id: data.npc, scale: 1.1, isLocalTexture:true, discard:true},
            content:{type:UITYPE_TEXT, value: data.present},
			
			// jira#5956
            //closeButton:{onTouchEnded:function() {FWUI.hide(UI_FEATURE_PRESENT, UIFX_POP);}},
            closeButton:{onTouchEnded:this.hide.bind(this), visible:this.hasCloseButton},
			
			// jira#6464
			panel:{onTouchEnded:this.onBgTouched.bind(this)},
        };

        this.widget = FWUI.showWithData(UI_FEATURE_PRESENT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		this.widget.setLocalZOrder(Z_POPUP);//this.widget.setLocalZOrder(Z_UI_COMMON - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		// FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgFeature", null, true);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},

	hide: function ()
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
        // FWUtils.hideDarkBg(null, "darkBgFeature");
    },
	
	onBgTouched:function(sender)
	{
		if(!this.hasCloseButton)
			this.hide();
	},
});