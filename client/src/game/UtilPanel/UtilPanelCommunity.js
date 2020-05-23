var UtilPanelCommunity = cc.Node.extend({
	LOGTAG: "[UtilPanelCommunity]",

	ctor: function ()
	{
		this._super();
		
        this.widget = FWPool.getNode(UI_UTIL_COMMUNITY, false);
        
		var uiDefine = {
            panel_fb: { onTouchEnded: function(sender) {this.onFB();}.bind(this) },
			title_fb: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_GOTO_FB"), style: TEXT_STYLE_TEXT_DIALOG },
            panel_home: { onTouchEnded: function(sender) {this.onHomePage();}.bind(this), visible:true },
			title_home: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_UTIL_GOTO_HOME"), style: TEXT_STYLE_TEXT_DIALOG },
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
		
		if (FWUI.isShowing(UI_UTIL_COMMUNITY))
			return;
		
		this.myParent = parent;
		FWUI.showWidget(this.widget, parent.container, UIFX_POP, true);
	},

	hide: function ()
	{
	},

	onFB: function ()
	{
		cc.log(this.LOGTAG, "onCommunity", FWLocalization.text("TXT_FACEBOOK_PAGE_LINK").replace(/\|/g, "/"));
		cc.sys.openURL(FWLocalization.text("TXT_FACEBOOK_PAGE_LINK").replace(/\|/g, "/"));
	},

	onHomePage: function ()
	{
		cc.log(this.LOGTAG, "onCommunity", FWLocalization.text("TXT_HOME_PAGE_LINK").replace(/\|/g, "/"));
		cc.sys.openURL(FWLocalization.text("TXT_HOME_PAGE_LINK").replace(/\|/g, "/"));
	}
});