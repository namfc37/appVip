//web var network = network || {};
network.dailygift = {};

network.dailygift.DailyGiftRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.DAILY_GIFT_GET_REWARD);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.dailygift.DailyGiftResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        if (this.error) {
            cc.log(this.LOGTAG, "DailyGiftResponse:", "error:", this.error);
        }
        else {
            var payload = PacketHelper.parseObject(this);
            if (payload) {
                this.dailygift = payload[KEY_DAILY_GIFT];
				this.updateItems = payload[KEY_UPDATE_ITEMS];
				
				// fix: gold, coin... is not updated
				Game.updateUserDataFromServer(payload);
            }
        }
    }
});




network.dailygift.RequestDailyGiftGet=fr.OutPacket.extend
({
    ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.DAILY_GIFT_GET);},
    pack:function()
    {
        addPacketHeader(this);
        addPacketFooter(this);
    },
});
network.dailygift.ResponseDailyGiftGet=fr.InPacket.extend
({
    ctor:function() {this._super();},
    readData:function()
    {
        if(this.getError() !== 0)
            cc.log("ResponseDailyGiftGet:"," error=" + this.getError());
        else
        {
            var payload = PacketHelper.parseObject(this);
            cc.log("ResponseDailyGiftGet:",JSON.stringify(payload));
            if (payload) {
                this.dailygift = payload[KEY_DAILY_GIFT];
                gv.userData.setDailyGift(this.dailygift);
                // fix: gold, coin... is not updated
                //Game.updateUserDataFromServer(payload);
            }
        }
    }
});



// MAPPING

network.packetMap[gv.CMD.DAILY_GIFT_GET_REWARD] = network.dailygift.DailyGiftResponse;
network.packetMap[gv.CMD.DAILY_GIFT_GET] = network.dailygift.ResponseDailyGiftGet;