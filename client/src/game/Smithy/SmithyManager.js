var SmithyManager = cc.Class.extend({
    LOGTAG: "[SmithyManager]",

    ctor: function () {
    },

    // ui

    showPopup: function () {
        if (!this.popupMain)
            this.popupMain = new SmithyPopup();
        this.popupMain.show();
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "smith");
    },

    // command

    requestForge: function (potId, potMaterials) {
        cc.log(this.LOGTAG, "requestForge", "potId:", potId, "potMaterials: %j", potMaterials);
        network.connector.sendRequestSmithyForge(potId, potMaterials);
    },

    // callbacks

    onForgeResponse: function (packet) {
        cc.log(this.LOGTAG, "onForgeResponse: %j", packet);
        if (packet.error === 0) {
            gv.userData.setGold(packet.gold);
            gv.userStorages.updateItems(packet.updateItems);
			
			Achievement.onAction(g_ACTIONS.ACTION_MAKE_POT.VALUE, null, 1);
        }
        if (this.popupMain)
            this.popupMain.onForgeResponse(packet);
    }
});

SmithyManager._instance = null;
SmithyManager.getInstance = function () {
    if (!SmithyManager._instance)
        SmithyManager._instance = new SmithyManager();
    return SmithyManager._instance;
};

//web var gv = gv || {};
gv.smithy = SmithyManager.getInstance();