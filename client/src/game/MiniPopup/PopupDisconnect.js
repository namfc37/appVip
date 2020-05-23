var PopupDisconnect = cc.Node.extend({
	LOGTAG: "[PopupDisconnect]",

	ctor: function ()
	{
		this._super();
		this.init ();
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	init: function ()
	{
		this.widget = FWPool.getNode(UI_POPUP_WAITING, false);
		if (!this.widget)
			return;

        var loading = FWUtils.getChildByName(this.widget, "loading");
        loading.setVisible (false);
		
		var wifi = new FWObject ();
        wifi.initWithSpine(SPINE_WIFI);
        wifi.setAnimation("icon_wifi_lost", true);
		wifi.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.925));
		wifi.setScale(0.8);
        wifi.setParent(this.widget);
		this.wifi = wifi;
	},

	show: function ()
	{
        cc.log(this.LOGTAG, "show");
		
		if (!this.widget)
		{
			this.init ();
			if (!this.widget)
				return;
		}

		if (FWUI.isShowing(UI_POPUP_WAITING))
            return;
        
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder (Z_TOUCH_EATER);
	},

	hide: function ()
	{
		if (this.wifi)
		{
			this.wifi.uninit();
			this.wifi = null;
		}
		
        FWUI.hideWidget(this.widget, UIFX_NONE);
    }
});