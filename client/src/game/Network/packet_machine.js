var network = network || {};
network.machine = {};

// UNLOCK

 network.machine.UnlockRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_UNLOCK);
    },
    pack: function (floorId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        
        addPacketFooter(this);
    }
});

network.machine.UnlockResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.gold = payload[KEY_GOLD];
        }
    }
});

// UNLOCK FINISH

network.machine.UnlockFinishRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_FINISH_UNLOCK);
    },
    pack: function (floorId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        
        addPacketFooter(this);
    }
});

network.machine.UnlockFinishResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
        }
    }
});

// REPAIR

network.machine.RepairRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_REPAIR);
    },
    pack: function (floorId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        
        addPacketFooter(this);
    }
});

network.machine.RepairResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.gold = payload[KEY_GOLD];
        }
    }
});

// PRODUCE

network.machine.ProduceRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_PRODUCE);
    },
    pack: function (floorId, productId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putString(this, KEY_PRODUCT, productId);
        
        addPacketFooter(this);
    }
});

network.machine.ProduceResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.productId = payload[KEY_PRODUCT];
            this.machine = payload[KEY_MACHINE];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
        }
    }
});

// HARVEST

network.machine.HarvestRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_HARVEST);
    },
    pack: function (floorId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        
        addPacketFooter(this);
    }
});

network.machine.HarvestResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.level = payload[KEY_LEVEL];
            this.exp = payload[KEY_EXP];
            this.eventItem = payload[KEY_MACHINE_EVENT_ITEM];
        }
    }
});

// UPGRADE

network.machine.UpgradeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_UPGRADE);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.machine.UpgradeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.gold = payload[KEY_GOLD];
            this.coin = payload[KEY_COIN];
        }
    }
});

// BUY SLOT

network.machine.BuySlotRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_BUY_SLOT);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.machine.BuySlotResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.coin = payload[KEY_COIN];
        }
    }
});

// BUY WORKING TIME

network.machine.BuyWorkingTimeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_BUY_WORKING_TIME);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.machine.BuyWorkingTimeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.coin = payload[KEY_COIN];
        }
    }
});

// SKIP TIME UNLOCK

network.machine.SkipTimeUnlockRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_SKIP_TIME_UNLOCK);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.machine.SkipTimeUnlockResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.coin = payload[KEY_COIN];
        }
    }
});

// SKIP TIME PRODUCE

network.machine.SkipTimeProduceRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_SKIP_TIME_PRODUCE);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_FLOOR, floorId);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.machine.SkipTimeProduceResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
            this.coin = payload[KEY_COIN];
        }
    }
});

// GET

network.machine.GetRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.MACHINE_GET);
    },
    pack: function (floorId, priceCoin) {
        addPacketHeader(this);

        PacketHelper.putByte(this, KEY_FLOOR, floorId);        

        
        addPacketFooter(this);
    }
});

network.machine.GetResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();        
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.floorId = payload[KEY_FLOOR];
            this.machine = payload[KEY_MACHINE];
        }
    }
});


// MAPPING

network.packetMap[gv.CMD.MACHINE_UNLOCK] = network.machine.UnlockResponse;
network.packetMap[gv.CMD.MACHINE_FINISH_UNLOCK] = network.machine.UnlockFinishResponse;

network.packetMap[gv.CMD.MACHINE_REPAIR] = network.machine.RepairResponse;
network.packetMap[gv.CMD.MACHINE_PRODUCE] = network.machine.ProduceResponse;
network.packetMap[gv.CMD.MACHINE_HARVEST] = network.machine.HarvestResponse;
network.packetMap[gv.CMD.MACHINE_UPGRADE] = network.machine.UpgradeResponse;

network.packetMap[gv.CMD.MACHINE_BUY_SLOT] = network.machine.BuySlotResponse;
network.packetMap[gv.CMD.MACHINE_BUY_WORKING_TIME] = network.machine.BuyWorkingTimeResponse;

network.packetMap[gv.CMD.MACHINE_SKIP_TIME_UNLOCK] = network.machine.SkipTimeUnlockResponse;
network.packetMap[gv.CMD.MACHINE_SKIP_TIME_PRODUCE] = network.machine.SkipTimeProduceResponse;

network.packetMap[gv.CMD.MACHINE_GET] = network.machine.GetResponse;