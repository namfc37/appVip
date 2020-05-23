var ArcadeManager = cc.Class.extend({
    LOGTAG: "[ArcadeManager]",

    ctor: function () {
    },

    showPopup: function (selectedItem) {//web showPopup: function (selectedItem = -1) {
		
		if(selectedItem === undefined)
			selectedItem = -1;
		
        if (!this.popupMain)
            this.popupMain = new ArcadePopup();
		
		if(selectedItem >= 0)
			this.popupMain.selectedItem = selectedItem;
		
        this.popupMain.show();
    },

    isUnlocked: function () {
        return gv.userData.isEnoughLevel(g_MISCINFO.BUILDING_GAME_USER_LEVEL) && gv.userData.isArcadeUnlocked();
    },

    isNeedUnlock:function ()
    {
        return gv.userData.isEnoughLevel(g_MISCINFO.BUILDING_GAME_USER_LEVEL) && !gv.userData.isArcadeUnlocked();
    },

    isBlacksmithUnlocked: function () {
        return this.isUnlocked() && gv.userData.isEnoughLevel(g_MISCINFO.BLACKSMITH_USER_LEVEL);
    },

    isFishermanUnlocked: function () {
        return this.isUnlocked() && gv.userData.isEnoughLevel(g_MISCINFO.BLACKSMITH_USER_LEVEL);
    },

    isDiceUnlocked: function () {
        return this.isUnlocked() && gv.userData.isEnoughLevel(g_MISCINFO.DICE_USER_LEVEL);
    },

    requestUnlock: function () {
        network.connector.sendRequestUnlockArcade();
    },

    onUnlockResponse: function (packet) {
        cc.log(this.LOGTAG, "onUnlockResponse: %j", packet);
        gv.background.performArcadeUnlocked();
		this.refreshNotification();
		
        //gv.background.updateNPCFisherman();
        //gv.background.updateNPCSmithy();
		Game.refreshUIMain(RF_UIMAIN_NPC);
    },

	// jira#5046	
	refreshNotification:function()
	{
		if(Game.isFriendGarden())
			return;
		
        if (this.isNeedUnlock())
            gv.background.performArcadeUnlockNotify ();

		var background = Game.gameScene.background;
		background.notifySmithy.setVisible(false);//background.notifySmithy.setVisible(this.isBlacksmithUnlocked());
		background.notifyBee.setVisible(this.isDiceUnlocked() && gv.dice.getTicket());//background.notifyBee.setVisible(this.isDiceUnlocked());
		background.notifyWolf.setVisible(false);//background.notifyWolf.setVisible(this.isFishermanUnlocked());

		// jira#6087
		/*// jira#5082
		// jira#5947
		//var showMineIcon = (this.isUnlocked() && gv.userData.getLevel() >= g_MISCINFO.MINE_USER_LEVEL);
		//if(showMineIcon && (!gv.userData[GAME_MINE] || !gv.userData[GAME_MINE][MINE_FINISH] || gv.userData[GAME_MINE][MINE_FINISH] < 0 || gv.userData[GAME_MINE][MINE_FINISH] > Game.getGameTimeInSeconds()) && (!gv.userData[GAME_MINE] || gv.userData[GAME_MINE][MINE_STATUS] !== MINE_STATUS_FINISH))
		//	showMineIcon = false;
		//background.notifyMining.setVisible(showMineIcon);
		var showMineIcon = (this.isUnlocked() && gv.userData.getLevel() >= g_MISCINFO.MINE_USER_LEVEL && gv.userData[GAME_MINE] && gv.userData[GAME_MINE][MINE_STATUS] >= MINE_STATUS_WORKING);
		if(showMineIcon)
		{
			background.notifyMining.setVisible(true);
			// jira#6087
			//if(gv.userData[GAME_MINE][MINE_STATUS] === MINE_STATUS_FINISH)
			//	Game.gameScene.background.showRadialProgress("mine", false);
			//else
			//	Game.gameScene.background.showRadialProgress("mine", Mining.startTime, Mining.startTime + g_MISCINFO.MINE_DURATION_SECONDS);
		}
		else
			background.notifyMining.setVisible(false);*/
		this.refreshMineNotification();
	},
	
	// jira#6087
	refreshMineNotification:function()
	{
		var background = Game.gameScene.background;
		
		if(Game.isFriendGarden())
		{
			// hide in friend's garden
			background.notifyMining.setVisible(false);
			return;
		}
			
		if(!(this.isUnlocked() && gv.userData.getLevel() >= g_MISCINFO.MINE_USER_LEVEL && gv.userData[GAME_MINE]))
		{
			// n/a
			background.notifyMining.setVisible(false);
			return;
		}
		
		if((gv.userData[GAME_MINE][MINE_STATUS] === MINE_STATUS_REST && Game.getMissingItemsAndPrices(Mining.requireItems).missingItems.length <= 0)
			|| gv.userData[GAME_MINE][MINE_STATUS] === MINE_STATUS_FINISH
			|| (gv.userData[GAME_MINE][MINE_FINISH] >= 0 && gv.userData[GAME_MINE][MINE_FINISH] < Game.getGameTimeInSeconds()))
			background.notifyMining.setVisible(true);
		else
			background.notifyMining.setVisible(false);
	},
});

ArcadeManager._instance = null;
ArcadeManager.getInstance = function () {
    if (!ArcadeManager._instance)
        ArcadeManager._instance = new ArcadeManager();
    return ArcadeManager._instance;
};

//web var gv = gv || {};
gv.arcade = ArcadeManager.getInstance();