var network = network || {};
network.smithy = {};

network.smithy.ForgeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.BLACKSMITH_MAKE_POT);
    },
    pack: function (potId, potMaterials) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_POT, potId);
        PacketHelper.putMapItem(this, KEY_ITEMS, potMaterials);
        
        addPacketFooter(this);
    }
});

network.smithy.ForgeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.success = payload[KEY_BLACKSMITH_SUCCESS];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.gold = payload[KEY_GOLD];
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.BLACKSMITH_MAKE_POT] = network.smithy.ForgeResponse;