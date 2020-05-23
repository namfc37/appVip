var network = network || {};
network.ibshop = {};

network.ibshop.BuyIBShopRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.BUY_IBSHOP);
    },
    pack: function (itemId, itemAmount, priceType, priceCoin) {
        addPacketHeader(this);
        PacketHelper.putString(this, KEY_ITEM_ID, itemId);
        PacketHelper.putInt(this, KEY_ITEM_NUM, itemAmount);
        PacketHelper.putString(this, KEY_PRICE_TYPE, priceType);
        PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin);
        PacketHelper.putClientCoin(this);
        
        addPacketFooter(this);
    }
});

network.ibshop.BuyIBShopResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);
        if (payload) {
            this.gold = payload[KEY_GOLD];
            this.coin = payload[KEY_COIN];
            this.reputation = payload[KEY_REPUTATION];
            this.updateItems = payload[KEY_UPDATE_ITEMS];
            this.ibshopCount = payload[KEY_IBSHOP_COUNT];
        }
    }
});

network.packetMap[gv.CMD.BUY_IBSHOP] = network.ibshop.BuyIBShopResponse;
