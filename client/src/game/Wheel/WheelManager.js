var WheelManager = cc.Class.extend({
    LOGTAG: "[WheelManager]",

    ctor: function () {
    },

    // ui

    showPopup: function () {
        if (!this.popupMain)
            this.popupMain = new WheelPopup();
        this.popupMain.show();
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "wheel");
    },

    // command

    requestWheelSpin: function (price) {
        network.connector.sendRequestWheelSpin(price);
    },

    requestWheelClaim: function () {
        network.connector.sendRequestWheelClaim();
    },

    // utilities

    getSlots: function () {
        var data = gv.userData.getWheel();
        return (data) ? data[SPIN_SLOTS] : [];
    },

    getWaitSlotIndex: function () {
        var data = gv.userData.getWheel();
        return (data) ? data[SPIN_INCOMPLETE] : -1;
    },

    getWaitSlot: function () {
        var slots = this.getSlots();
        var index = this.getWaitSlotIndex();
        if (slots && index >= 0)
            return slots[index];
        return null;
    },

    getWinSlot: function () {
        return gv.userData.getWheelWinSlot();
    },

    getSpinPrice: function () {
        var count = this.getSpinCount();
        if (count < 0 || count >= g_MISCINFO.SPIN_PRICE_TURN.length)
            return -1;
        return g_MISCINFO.SPIN_PRICE_TURN[count];
    },

    getSpinCount: function () {
        var data = gv.userData.getWheel();
        return (data) ? data[SPIN_NUM_SPIN] : 0;
    },

    isUnlocked: function () {
        var data = gv.userData.getWheel();
        return (data) ? (data[SPIN_SLOTS].length > 0) : false;
    },

    isDouble: function () {
        var data = gv.userData.getWheel();
        return (data) ? data[SPIN_X2] : false;
    },

    haveReward: function () {
        return this.getWinSlot() >= 0;
    },

    haveNext: function () {
        return this.getSpinCount() < g_MISCINFO.SPIN_PRICE_TURN.length;
    },

    // callbacks

    onWheelSpinResponse: function (packet) {
        cc.log(this.LOGTAG, "onWheelSpinResponse: %j", packet);
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setWheel(packet.wheel);
            gv.userData.setWheelWinSlot(packet.wheelWinSlot);
            gv.userStorages.updateItems(packet.updateItems);
			
			Achievement.onAction(g_ACTIONS.ACTION_LUCKY_SPIN.VALUE, null, 1);
        }
        if (this.popupMain)
            this.popupMain.onSpinResponse(packet);
    },

    onWheelClaimResponse: function (packet) {
        cc.log(this.LOGTAG, "onWheelClaimResponse: %j", packet);
        if (packet.error === 0) {
			// jira#5793
			var eventItems = gv.userData.getWheel()[SPIN_EVENT_ITEMS];
			gv.wheel.tokenCount = 0;
            gv.wheel.tokenId = null;
			for(var key in eventItems)
			{
				gv.userStorages.addItem(key, eventItems[key]);
				
				// jira#5849
				//if(key === EVENT_TOKEN_ITEM_ID)
                gv.wheel.tokenId = key;
                gv.wheel.tokenCount = eventItems[key];
			}
			
            gv.userData.setCoin(packet.coin);
            gv.userData.setWheel(packet.wheel);
            gv.userData.setWheelWinSlot(-1);
            gv.userStorages.updateItems(packet.updateItems);
        }
        if (this.popupMain)
            this.popupMain.onClaimResponse(packet);
    }
});

WheelManager._instance = null;
WheelManager.getInstance = function () {
    if (!WheelManager._instance)
        WheelManager._instance = new WheelManager();
    return WheelManager._instance;
};

//web var gv = gv || {};
gv.wheel = WheelManager.getInstance();