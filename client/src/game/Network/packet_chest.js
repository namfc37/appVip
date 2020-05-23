//web var network = network || {};
network.chest = {};

network.chest.OpenRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.GACHA_OPEN);
    },
    pack: function (chestId, chestPrice) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_ITEM_ID, chestId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, chestPrice);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.chest.OpenResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.gold = payload[KEY_GOLD];
            this.reputation = payload[KEY_REPUTATION];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.chest = payload[KEY_CHEST];            
        }
    }
});

network.chest.GetRewardRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.GACHA_GET_REWARD);
    },
    pack: function (chestId, chestPrice) {
        addPacketHeader(this);

        PacketHelper.putString(this, KEY_ITEM_ID, chestId);

        
        addPacketFooter(this);
    }
});

network.chest.GetRewardResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.gold = payload[KEY_GOLD];
            this.reputation = payload[KEY_REPUTATION];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.chest = payload[KEY_CHEST];            
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.GACHA_OPEN] = network.chest.OpenResponse;
network.packetMap[gv.CMD.GACHA_GET_REWARD] = network.chest.GetRewardResponse;