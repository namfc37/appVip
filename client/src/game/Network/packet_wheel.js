var network = network || {};
network.wheel = {};

// SPIN

network.wheel.SpinRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.LUCKY_SPIN);
    },
    pack: function (priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.wheel.SpinResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.wheel = payload[KEY_LUCKY_SPIN];
            this.wheelWinSlot = payload[KEY_SLOT_ID];
        }
    }
});

// CLAIM

network.wheel.ClaimRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.LUCKY_SPIN_GET_REWARD);
    },
    pack: function () {
        addPacketHeader(this);
        
        addPacketFooter(this);
    }
});

network.wheel.ClaimResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.wheel = payload[KEY_LUCKY_SPIN];
            this.wheelWinSlot = payload[KEY_SLOT_ID];
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.LUCKY_SPIN] = network.wheel.SpinResponse;
network.packetMap[gv.CMD.LUCKY_SPIN_GET_REWARD] = network.wheel.ClaimResponse;