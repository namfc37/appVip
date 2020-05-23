var PopupWaiting = cc.Node.extend({
	LOGTAG: "[PopupWaiting]",

	ctor: function ()
	{
		this._super();
		
        this.widget = FWPool.getNode(UI_POPUP_WAITING, false);
        this.loading = FWUtils.getChildByName(this.widget, "loading");
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

		if (FWUI.isShowing(UI_POPUP_WAITING))
			return;

        this.loading.runAction (cc.repeatForever(cc.sequence (cc.rotateTo(1, 180), cc.rotateTo(1, 360))));
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
	},

	hide: function ()
	{
		this.loading.stopAllActions ();
        FWUI.hideWidget(this.widget, UIFX_NONE);
    }
});