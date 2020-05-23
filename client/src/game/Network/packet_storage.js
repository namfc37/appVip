var network = network || {};
network.storage = {};

network.storage.UpgradeStorageRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.STOCK_UPGRADE);
    },
    pack: function (stockId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_SLOT_ID, stockId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.storage.UpgradeStorageResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        if (this.error === 0) {
            var object = PacketHelper.parseObject(this);
            this.stockId = object[KEY_STOCK_ID];
            this.stockLevel = object[KEY_STOCK_LEVEL];
            this.clientCoin = object[KEY_COIN];
            this.updateItems = object[KEY_UPDATE_ITEMS];
			
			Achievement.onAction(g_ACTIONS.ACTION_STOCK_UPGRADE.VALUE, null, 1);
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.STOCK_UPGRADE] = network.storage.UpgradeStorageResponse;