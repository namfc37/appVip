
var Congrats =
{
	show:function(message)
	{
		var uiDef =
		{
			bg:{visible:false},
			bg2:{visible:false},
			btnReceive:{onTouchEnded:this.hide.bind(this)},
			txtReceive:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
			btnclose:{visible:false},
			txtcontent:{type:UITYPE_TEXT, value:message, style:TEXT_STYLE_TEXT_DIALOG},
		};
		
		this.widget = FWUI.showWithData(UI_SUCCESS_CHARGE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		this.widget.setLocalZOrder(Z_POPUP);
		
		FWUtils.showDarkBg(null, Z_POPUP - 1, null, null, true);
		Game.showFireworks(this.widget, {x: 0, y: 0, width: cc.winSize.width, height: cc.winSize.height});
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},
	
	hide:function()
	{
		//this.widget.hasFireworks = false;
		FWUI.hide(UI_SUCCESS_CHARGE, UIFX_POP);
		FWUtils.hideDarkBg();
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
};

