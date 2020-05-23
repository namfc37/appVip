var ChestManager = cc.Class.extend({
    LOGTAG: "[ChestManager]",

    ctor: function () {
    },

    // ui

    showPopup: function () {
        if (!this.popupMain)
            this.popupMain = new ChestPopup();
        this.popupMain.show();
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "chest");
    },

    // command

    requestChestOpen: function (chestId, chestPrice) {
        network.connector.sendRequestOpenChest(chestId, chestPrice);
    },
    requestChestGetReward: function (chestId) {
        network.connector.sendRequestGetRewardChest(chestId);
    },

    // utilities

    getChestAll: function () {
        return gv.userData.getGachaChests();
    },

    getChest: function (chestId) {
        return gv.userData.getGachaChest(chestId);
    },

    // callbacks

    onOpenResponse: function (packet) {
        cc.log(this.LOGTAG, "onOpenResponse: %j", packet);
        if (packet.error === 0) {

            gv.userData.setCoin(packet.coin);
            gv.userData.setGold(packet.gold);
            gv.userData.setReputation(packet.reputation);

            gv.userStorages.updateItems(packet.updateItems);

            gv.userData.setGachaChest(packet.chest);
			
			Achievement.onAction(g_ACTIONS.ACTION_GACHA_OPEN.VALUE, null, 1);
        }
        if (this.popupMain)
            this.popupMain.onChestOpenResponse(packet);
    },
    onGetRewardResponse: function (packet) {
        cc.log(this.LOGTAG, "onGetRewardResponse: %j", packet);
        if (packet.error === 0) {

            gv.userData.setCoin(packet.coin);
            gv.userData.setGold(packet.gold);
            gv.userData.setReputation(packet.reputation);

            gv.userStorages.updateItems(packet.updateItems);

            gv.userData.setGachaChest(packet.chest);
        }
        if (this.popupMain)
            this.popupMain.onChestGetRewardResponse(packet);
    },
	
	refreshNotification:function()
	{
		if(Game.isFriendGarden())
			return;
		
		// jira#5924
		/*var showNotification = false;
		var chests = this.getChestAll();
		for(var i=0; i<chests.length; i++)
		{
			var chest = chests[i];
			if((chest[CHEST_STATUS] === CHEST_STATUS_ACTIVE || chest[CHEST_STATUS] === CHEST_STATUS_OPEN)
				&& chest[CHEST_TIME_FINISH] > 0 && chest[CHEST_TIME_FINISH] < Game.getGameTimeInSeconds() && chest[CHEST_TIME_FINISH] !== chest[CHEST_TIME_START])
			{
				showNotification = true;
				break;
			}
		}
		
		Game.gameScene.background.notifyChest.setVisible(showNotification);*/
		
		Game.gameScene.background.notifyChest.setVisible(true);
		var chests = this.getChestAll();
		for(var i=0; i<chests.length; i++)
		{
			var chest = chests[i];
			if(chest[CHEST_ID] !== "C1")
				continue;
			if((chest[CHEST_STATUS] === CHEST_STATUS_ACTIVE || chest[CHEST_STATUS] === CHEST_STATUS_OPEN)
				&& chest[CHEST_TIME_FINISH] > 0 && chest[CHEST_TIME_FINISH] < Game.getGameTimeInSeconds() && chest[CHEST_TIME_FINISH] !== chest[CHEST_TIME_START])
				Game.gameScene.background.showRadialProgress("chest", false);
			else
				Game.gameScene.background.showRadialProgress("chest", chest[CHEST_TIME_START], chest[CHEST_TIME_FINISH]);
			break;
		}
	},


    //////////// SERVER /////////////
    RequestGachaponSpin:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GACHAPON_SPIN);},
        pack:function(turn)
        {
            addPacketHeader(this);
            PacketHelper.putInt(this, KEY_GACHAPON_NUM_TURN, turn);
            
            addPacketFooter(this);
        },
    }),

    ResponseGachaponSpin:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            var object = PacketHelper.parseObject(this);
            cc.log("ResponseGachaponSpin",JSON.stringify(object));
            if(this.getError() !== 0){
                cc.log("ResponseGachaponSpin","Error",this.getError());
                return;
            }
            gv.chest.popupMain.showRewardFromServer(object[GAME_GACHAPON],object[KEY_GACHAPON_COLOR]);

            var updateItems = object[KEY_UPDATE_ITEMS];
            if (updateItems)
                gv.userStorages.updateItems(updateItems);
        }
    }),

    RequestGachaponReceiveReward:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GACHAPON_RECEIVE_REWARD);},
        pack:function()
        {
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),

    ResponseGachaponReceiveReward:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            var object = PacketHelper.parseObject(this);
            cc.log("ResponseGachaponReceiveReward",JSON.stringify(object));
            if(this.getError() !== 0){
                cc.log("ResponseGachaponReceiveReward","Error",this.getError());
                return;
            }
            gv.chest.popupMain.setDataGachaponFromServer(object);
        }
    }),

});

ChestManager._instance = null;
ChestManager.getInstance = function () {
    if (!ChestManager._instance)
        ChestManager._instance = new ChestManager();
    return ChestManager._instance;
};

//web var gv = gv || {};
gv.chest = ChestManager.getInstance();


network.packetMap[gv.CMD.GACHAPON_SPIN] = gv.chest.ResponseGachaponSpin;
network.packetMap[gv.CMD.GACHAPON_RECEIVE_REWARD] = gv.chest.ResponseGachaponReceiveReward;