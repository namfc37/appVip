var UtilPanelManager = cc.Class.extend({
    LOGTAG: "[UtilPanelManager]",

    ctor: function () {
    },

	resourcesLoaded: false,
    show: function (tab, subtab)//web show: function (tab = UTIL_SETTING, subtab = null)
    {
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			cc.loader.load([UI_UTIL_CONTAINER,
							UI_UTIL_SETTING,
							UI_UTIL_LIBRARY,
							UI_UTIL_LIBRARY_POT,
							UI_UTIL_LIBRARY_INFO,
							UI_UTIL_LIBRARY_DECOR,
							UI_UTIL_LIBRARY_MACHINE,
							UI_UTIL_COMMUNITY],
				function()
				{
					this.resourcesLoaded = true;
					this.show(tab, subtab);
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}
		
		if(tab === undefined)
			tab = UTIL_SETTING;
		if(subtab === undefined)
			subtab = null;
		
        if (!this.popupMain)
            this.popupMain = new UtilPanelContainer();
        
        this.popupMain.show(tab, subtab);
    }
});

UtilPanelManager._instance = null;
UtilPanelManager.getInstance = function () {
    if (!UtilPanelManager._instance)
        UtilPanelManager._instance = new UtilPanelManager();
    return UtilPanelManager._instance;
};

//web var gv = gv || {};
gv.utilPanel = UtilPanelManager.getInstance();