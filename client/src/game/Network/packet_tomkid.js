var network = network || {};
network.tomkid = {};

// HIRE

network.tomkid.HireRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TOM_HIRE);
    },
    pack: function (type, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_TYPE, type);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.tomkid.HireResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.tomkid = payload[KEY_TOM];
            this.coin = payload[KEY_COIN];

			var bonusItemsArray = FWUtils.getItemsArray(payload[KEY_BONUS_ITEMS]);
			for(var i=0; i<bonusItemsArray.length; i++)
			{
				gv.userStorages.addItem(bonusItemsArray[i].itemId, bonusItemsArray[i].amount);
			}
			
			if(gv.tomkid.lastButton)
				FWUtils.showFlyingItemIcons(bonusItemsArray, FWUtils.getWorldPosition(gv.tomkid.lastButton));

            if (this.error === 0)
            {
                cc.log ("network.tomkid.HireResponse", "tomkid [TOM_TYPE_HIRE]", this.tomkid [TOM_TYPE_HIRE]);
                Achievement.onAction(g_ACTIONS.ACTION_TOM_HIRE.VALUE, this.tomkid [TOM_TYPE_HIRE], 1);
            }
        }
    }
});

// FIND

network.tomkid.FindRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TOM_FIND);
    },
    pack: function (findItemId, buffItemId) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_ITEM_ID, findItemId);
        PacketHelper.putString(this, KEY_ITEM_SUPPORT, buffItemId);
        
        addPacketFooter(this);
    }
});

network.tomkid.FindResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.tomkid = payload[KEY_TOM];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
        }
    }
});

// BUY

network.tomkid.BuyRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TOM_BUY);
    },
    pack: function (slotId) {
        addPacketHeader(this);
        PacketHelper.putByte(this, KEY_SLOT_ID, slotId);
        
        addPacketFooter(this);
    }
});

network.tomkid.BuyResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.gold = payload[KEY_GOLD];
            this.tomkid = payload[KEY_TOM];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
        }
    }
});

// BUY CANCEL

network.tomkid.CancelRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TOM_CANCEL);
    },
    pack: function (slotId) {
        addPacketHeader(this);
        
        addPacketFooter(this);
    }
});

network.tomkid.CancelResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.tomkid = payload[KEY_TOM];
        }
    }
});

// REDUCE TIME

network.tomkid.ReduceTimeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.TOM_REDUCE_TIME);
    },
    pack: function (itemId, itemAmount) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_ITEM_SUPPORT, itemId);
        PacketHelper.putInt(this, KEY_ITEM_NUM, itemAmount);
        
        addPacketFooter(this);
    }
});

network.tomkid.ReduceTimeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.tomkid = payload[KEY_TOM];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
        }
    }
});

// MAPPING

network.packetMap[gv.CMD.TOM_BUY] = network.tomkid.BuyResponse;
network.packetMap[gv.CMD.TOM_HIRE] = network.tomkid.HireResponse;
network.packetMap[gv.CMD.TOM_FIND] = network.tomkid.FindResponse;
network.packetMap[gv.CMD.TOM_CANCEL] = network.tomkid.CancelResponse;
network.packetMap[gv.CMD.TOM_REDUCE_TIME] = network.tomkid.ReduceTimeResponse;