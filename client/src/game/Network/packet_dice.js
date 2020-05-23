//web var network = network || {};
network.dice = {};

// SPIN

network.dice.SpinRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.DICE_SPIN);
    },
    pack: function (priceCoin) {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.dice.SpinResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.dice = payload[KEY_DICE];
            this.diceWinSlot = payload[KEY_SLOT_ID];
        }
    }
});

// CLAIM

network.dice.ClaimRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.DICE_GET_REWARD);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.dice.ClaimResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.coin = payload[KEY_COIN];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.dice = payload[KEY_DICE];
            this.diceWinSlot = payload[KEY_SLOT_ID];
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.DICE_SPIN] = network.dice.SpinResponse;
network.packetMap[gv.CMD.DICE_GET_REWARD] = network.dice.ClaimResponse;