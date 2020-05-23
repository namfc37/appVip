const TOMKID_ANIM_IDLE = "kid_idle";

const TOMKID_ANIM_IDLE_SAD = "kid_idle_sad";
const TOMKID_ANIM_IDLE_HAPPY = "kid_idle_happy";

const TOMKID_ANIM_IDLE_GOODS = "kid_idle_goods";
const TOMKID_ANIM_IDLE_TIRED = "kid_idle_tired";

const TOMKID_ANIM_IDLE_SLEEPY = "kid_idle_sleepy";
const TOMKID_ANIM_IDLE_SLEEPING = "kid_idle_sleep";

const TOMKID_ANIM_RUN = "kid_run";
const TOMKID_ANIM_RUN_BACK = "kid_run_back";
const TOMKID_ANIM_RUN_BACK_TIRED = "kid_run_back_tired";

const TOMKID_ANIM_SCALE_SMALL = 0.08;
const TOMKID_ANIM_SCALE_MEDIUM = 0.3;
const TOMKID_ANIM_SCALE_POPUP = 0.5;

const TOMKID_ANIM_RUNNING_SPEED = 200;
const TOMKID_ANIM_RUNNING_TIME_SCALE = 2.0;
const TOMKID_ANIM_IDLE_TIME_SCALE = 1.0;

var TomManager = cc.Class.extend({
    LOGTAG: "[TomManager]",

    ctor: function () {
    },

    // ui

    showPopup: function () {
        if (this.isUnlocked()) {
            var data = gv.userData.getTomkid();
            cc.log(this.LOGTAG, "showPopup", "data: %j", data);
            switch (data[TOM_STATUS]) {
                case TOM_STATUS_IDLE:
                    this.showPopupHire();
                    break;
                case TOM_STATUS_WAIT:
                    this.showPopupSearch();
                    break;
                case TOM_STATUS_SHORT_REST:
                case TOM_STATUS_LONG_REST:
                    this.showPopupSleeping();
                    break;
                case TOM_STATUS_FOUND:
                    this.showPopupSearchDone();
                    break;
            }
        }
        else {
            this.showPopupUnlock();
        }
    },

    showPopupUnlock: function () {
        if (!this.popupUnlock)
            this.popupUnlock = new TomPopupUnlock();
        this.popupUnlock.show();
    },

    showPopupHire: function () {
        if (!this.popupHire)
            this.popupHire = new TomPopupHire();
        this.popupHire.show();
    },

    showPopupSearch: function () {
        if (!this.popupSearch)
            this.popupSearch = new TomPopupSearch();
        this.popupSearch.show();
    },

    showPopupSearchDone: function () {
        if (!this.popupSearchDone)
            this.popupSearchDone = new TomPopupSearchDone();
        this.popupSearchDone.show();
    },

    showPopupSleeping: function () {
        if (!this.popupSleeping)
            this.popupSleeping = new TomPopupSleeping();
        this.popupSleeping.show();
    },

    // command

    requestUnlock: function () {
        cc.log(this.LOGTAG, "requestUnlock");
        if (this.isUnlocked()) {
            cc.log(this.LOGTAG, "requestUnlock:", "Tom is already unlocked");
        }
        else {
            network.connector.sendRequestTomkidHire(0, g_MISCINFO.TOM_HIRE_PRICE[0]);
        }
    },

    requestHire: function (type) {
        cc.log(this.LOGTAG, "requestHire", "type:", type);
        if (this.isUnlocked()) {
            network.connector.sendRequestTomkidHire(type, g_MISCINFO.TOM_HIRE_PRICE[type]);
        }
        else {
            cc.log(this.LOGTAG, "requestHire:", "Tom must be unlocked before actions");
        }
    },

    requestFind: function (findItemId, buffItemId) {
        cc.log(this.LOGTAG, "requestHire", "findItemId:", findItemId, "buffItemId:", buffItemId);
        if (this.isUnlocked()) {
            if (this.getHireTimeLeft() > 0) {
                network.connector.sendRequestTomkidFind(findItemId, buffItemId || "");
            }
            else {
                cc.log(this.LOGTAG, "requestFind:", "Tom hiring time is expired");
            }
        }
        else {
            cc.log(this.LOGTAG, "requestFind:", "Tom must be hired before actions");
        }
    },

    requestBuy: function (slotId) {
        cc.log(this.LOGTAG, "requestBuy", "slotId:", slotId);
        if (this.isUnlocked()) {
            if (this.getHireTimeLeft() > 0) {
                network.connector.sendRequestTomkidBuy(slotId);
            }
            else {
                cc.log(this.LOGTAG, "requestBuy:", "Tom hiring time is expired");
            }
        }
        else {
            cc.log(this.LOGTAG, "requestBuy:", "Tom must be hired before actions");
        }
    },

    requestCancel: function () {
        cc.log(this.LOGTAG, "requestCancel");
        if (this.isUnlocked()) {
            if (this.getHireTimeLeft() > 0) {
                network.connector.sendRequestTomkidCancel();
            }
            else {
                cc.log(this.LOGTAG, "reuestCancel:", "Tom hiring time is expired");
            }
        }
        else {
            cc.log(this.LOGTAG, "reuestCancel:", "Tom must be hired before actions");
        }
    },

    requestReduceTime: function (itemId, itemAmount) {
        cc.log(this.LOGTAG, "requestReduceTime", "itemId:", itemId, "itemAmount:", itemAmount);
        if (this.isUnlocked()) {
            if (this.getRestTimeLeft() > 0) {
                network.connector.sendRequestTomkidReduceTime(itemId, itemAmount);
            }
            else {
                cc.log(this.LOGTAG, "requestReduceTime:", "Tom resting is over");
            }
        }
        else {
            cc.log(this.LOGTAG, "requestReduceTime:", "Tom must be hired before actions");
        }
    },

    // callbacks

    onHireResponse: function (packet) {
        cc.log(this.LOGTAG, "onHireResponse: %j", packet);
        var isUnlocked = this.isUnlocked();
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setTomkid(packet.tomkid);
        }
        if (isUnlocked)
            this.popupHire && this.popupHire.onHireResponse(packet);
        else
            this.popupUnlock && this.popupUnlock.onUnlockResponse(packet);
		
		this.refreshNotification();
    },

    onFindResponse: function (packet) {
        cc.log(this.LOGTAG, "onFindResponse: %j", packet);
        if (packet.error === 0) {
            gv.userData.setTomkid(packet.tomkid);
            gv.userStorages.updateItems(packet.updateItems);
			
			Achievement.onAction(g_ACTIONS.ACTION_TOM_FIND.VALUE, null, 1);
        }
        if (this.popupSearch)
            this.popupSearch.onFindResponse(packet);
    },

    onBuyResponse: function (packet) {
        cc.log(this.LOGTAG, "onBuyResponse: %j", packet);
        if (packet.error === 0) {
            cc.log(this.LOGTAG, "onBuyResponse: updateItems: %j", packet.updateItems);
            gv.userData.setGold(packet.gold);
            gv.userData.setTomkid(packet.tomkid);
            gv.userStorages.updateItems(packet.updateItems);
            gv.gameBuildingStorageInterface.updateStorageUIInfo();
			
			Achievement.onAction(g_ACTIONS.ACTION_TOM_BUY.VALUE, null, 1);
        }
        if (this.popupSearchDone)
            this.popupSearchDone.onBuyResponse(packet);
		
		this.refreshNotification();
    },

    onCancelResponse: function (packet) {
        cc.log(this.LOGTAG, "onCancelResponse: %j", packet);
        if (packet.error === 0) {
            gv.userData.setTomkid(packet.tomkid);
        }
        if (this.popupSearchDone)
            this.popupSearchDone.onCancelResponse(packet);
		
		this.refreshNotification();
    },

    onReduceTimeResponse: function (packet) {
        cc.log(this.LOGTAG, "onReduceTimeResponse: %j", packet);
        if (packet.error === 0) {
            gv.userData.setTomkid(packet.tomkid);
            gv.userStorages.updateItems(packet.updateItems);
        }
        if (this.popupSleeping)
            this.popupSleeping.onReduceTimeResponse(packet);
    },

    // utilities

    isUnlocked: function () {
        if (gv.userData.isEnoughLevel(g_MISCINFO.TOM_USER_LEVEL)) {
            var data = gv.userData.getTomkid();
            return (data && data[TOM_STATUS] !== TOM_STATUS_LOCK);
        }
        return false;
    },

    isIdle: function () {
        var data = gv.userData.getTomkid();
        return (data && data[TOM_STATUS] === TOM_STATUS_IDLE);
    },

    isHiring: function () {
        var data = gv.userData.getTomkid();
        return (data && data[TOM_STATUS] === TOM_STATUS_WAIT);
    },

    isResting: function () {
        var data = gv.userData.getTomkid();
        return (data && (data[TOM_STATUS] === TOM_STATUS_SHORT_REST || data[TOM_STATUS] === TOM_STATUS_LONG_REST));
    },

    isRestingShort: function () {
        var data = gv.userData.getTomkid();
        return (data && data[TOM_STATUS] === TOM_STATUS_SHORT_REST);
    },

    isRestingLong: function () {
        var data = gv.userData.getTomkid();
        return (data && data[TOM_STATUS] === TOM_STATUS_LONG_REST);
    },

    isWaitBuying: function () {
        var data = gv.userData.getTomkid();
        return (data && data[TOM_STATUS] === TOM_STATUS_FOUND);
    },

    isFindItemValid: function (itemId) {
        if (itemId === "")
            return false;
        return g_MISCINFO.TOM_ITEMS.findIndex(function (value) { return value === itemId }) !== -1;
    },

    getStatus: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_STATUS] : TOM_STATUS_LOCK;
    },

    getStatusAnimation: function () {

		//jira#5627
        //var name = TOMKID_ANIM_IDLE;
        var name = (gv.userData.isEnoughLevel(g_MISCINFO.TOM_USER_LEVEL) ? TOMKID_ANIM_IDLE : TOMKID_ANIM_IDLE_SLEEPING);
		
        var timeScale = TOMKID_ANIM_IDLE_TIME_SCALE;

        var status = this.getStatus();
        switch (status) {
            case TOM_STATUS_FOUND:
                name = TOMKID_ANIM_IDLE_GOODS;
                break;
            case TOM_STATUS_SHORT_REST:
            case TOM_STATUS_LONG_REST:
                name = TOMKID_ANIM_IDLE_SLEEPING;
                break;
        }

        return {
            name: name,
            timeScale: timeScale
        };
    },

    updateStatus: function () {

        if (this.isUnlocked()) {
            var data = gv.userData.getTomkid();
            if (data) {
                var hireTimeLeft = this.getHireTimeLeft();
                var restTimeLeft = this.getRestTimeLeft();

                if (hireTimeLeft > 0) {
                    if (restTimeLeft <= 0) {
                        if (data[TOM_PACKS].length > 0) {
                            data[TOM_STATUS] = TOM_STATUS_FOUND;
                        }
                        else {
                            data[TOM_STATUS] = TOM_STATUS_WAIT;
                        }
                    }
                }
                else {
                    data[TOM_STATUS] = TOM_STATUS_IDLE;
                }

                gv.userData.setTomkid(data);

				// jira#5048
				if(!Game.isFriendGarden())
				{
                    var background = Game.gameScene.background;		
                    if (background)
					    background.tomHireBoard.setVisible(this.getStatus() === TOM_STATUS_IDLE || this.getStatus() === TOM_STATUS_LOCK);
				}
            }
        }
    },

    getHireType: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_TYPE_HIRE] : 0;
    },

    getHireTime: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_TIME_HIRE] : 0;
    },

    getHireTimeLeft: function () {
        var hireType = this.getHireType();
        var hireTimeStart = this.getHireTime();
        var hireTimeLeft = 0;
        if (hireTimeStart > 0)
            hireTimeLeft = Math.max((hireTimeStart + g_MISCINFO.TOM_HIRE_DAY[hireType] * 24 * 3600) - Game.getGameTimeInSeconds(), 0);
        return hireTimeLeft;
    },

    getRestTime: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_TIME_REST] : 0;
    },

    getRestDuration: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_TIME_REST_DURATION] : 0;
    },

    getRestDurationFull: function () {
        var data = gv.userData.getTomkid();
        if (data && this.isResting()) {
            return (this.isRestingLong()) ? g_MISCINFO.TOM_LONG_REST_DURATION : g_MISCINFO.TOM_SHORT_REST_DURATION;
        }
        return 0;
    },

    getRestTimeLeft: function () {
        var restTimeStart = this.getRestTime();
        var restTimeLeft = 0;
        if (restTimeStart > 0)
            restTimeLeft = Math.max((restTimeStart + this.getRestDuration()) - Game.getGameTimeInSeconds(), 0);
        return restTimeLeft;
    },

    getFindItem: function () {
        var data = gv.userData.getTomkid();
        return (data) ? data[TOM_ITEM] : "";
    },

    getFindPackages: function () {
        var data = gv.userData.getTomkid();
        if (data) {
            var items = [];
            for (var i = 0; i < data[TOM_PACKS].length; i++) {
                items.push({
                    amount: data[TOM_PACKS][i][TOM_PACK_NUM],
                    price: data[TOM_PACKS][i][TOM_PACK_PRICE]
                });
            }
            return items;
        }
        return [];
    },

	// jira#5046	
	refreshNotification:function()
	{
		var background = Game.gameScene.background;
		background.tomHireBoard.setVisible(this.getStatus() === TOM_STATUS_IDLE || this.getStatus() === TOM_STATUS_LOCK);
		
		if(this.getStatus() === TOM_STATUS_FOUND && !background.animNPCTom.isBusy)
		{
			var itemId = this.getFindItem();
			if(itemId !== "")
			{
				var gfx = Game.getItemGfxByDefine(itemId);
				if(gfx.sprite)
				{
					background.notifyTom.setVisible(true);
					background.iconTomItem.loadTexture(gfx.sprite, ccui.Widget.PLIST_TEXTURE);
					background.iconTomItem.setScale(0.35);
					return;
				}
			}
		}
		
		background.notifyTom.setVisible(false);
	},
});

TomManager._instance = null;
TomManager.getInstance = function () {
    if (!TomManager._instance)
        TomManager._instance = new TomManager();
    return TomManager._instance;
};

//web var gv = gv || {};
gv.tomkid = TomManager.getInstance();