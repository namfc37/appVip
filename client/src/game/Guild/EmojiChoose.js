var EmojiChoose = 
{  
    init: function ()
    {
		var cx = cc.winSize.width * 0.5;
		var cy = cc.winSize.height * 0.5;
		this.fx_in = {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cx, cy - 300), toPos:cc.p(cx, cy)};
		this.fx_out = {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(cx, cy), toPos:cc.p(cx, cy - 300)};

        this.itemDef = {
            emoji: {type:UITYPE_IMAGE, value: "", field:"FILE", onTouchEnded:this.onItemSelected.bind(this), scale: 0.75},
        };

		this.uiDefine = {
            panel: { onTouchEnded:this.hide.bind(this) },
            container: {type:UITYPE_2D_LIST, items:g_GUILD.EMOJI, itemUI:UI_EMOJI_CHOOSE_ITEM, itemDef:this.itemDef, itemSize:cc.size(130, 130), singleLine:true, itemsAlign:"center"},
		};

		this.widget = FWPool.getNode(UI_EMOJI_CHOOSE, false);
		this.widget.setLocalZOrder(Z_UI_COMMON + 2);
    },
    
	show: function (callback)
	{
        cc.log ("EmojiChoose", "show");
        this.callback = callback;

        if (!this.widget)
            this.init ();
        
		FWUI.fillData(this.widget, null, this.uiDefine);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), this.fx_in, true);
		AudioManager.effect (EFFECT_POPUP_SHOW);
		
		if(!this.hideFunc)
            this.hideFunc = function() {this.hide()}.bind(this);
        
		Game.gameScene.registerBackKey(this.hideFunc);
    },

	hide: function ()
	{
		cc.log("EmojiChoose", "hide");

		FWUI.hideWidget(this.widget, this.fx_out);

        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

	onItemSelected: function (sender)
	{
        cc.log("EmojiChoose", "onItemSelected", "itemId", JSON.stringify(sender.uiData));
        if (this.callback && sender && sender.uiData && sender.uiData.FILE)
            this.callback (sender.uiData.FILE);
    },
};