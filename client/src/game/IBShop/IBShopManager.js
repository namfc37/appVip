const IB_SHOP_TYPE_PLANT = 'PLANT';
const IB_SHOP_TYPE_POT = 'POT';
const IB_SHOP_TYPE_DECOR = 'DECOR';
const IB_SHOP_TYPE_UPGRADE = 'UPGRADE';
const IB_SHOP_TYPE_MISC = 'MISC';

var IBShopManager = cc.Class.extend({
    LOGTAG: "[IBShopManager]",
	
	// ibshop must be refreshed once when event has finished
	// to remove event trees
	refreshedAfterEvent: false,

    ctor: function () {
    },

    // ui

    showPopup: function (stats, tab, onHide) {//web showPopup: function (stats, tab = -1, onHide = null) {
		
		if(tab === undefined)
			tab = -1;
		if(onHide === undefined)
			onHide = null;
		
        if (!this.popupMain)
            this.popupMain = new IBShopPopup();
		else
		{
			if(gv.background.animNPCEvent && !GameEvent.currentEvent && !this.refreshedAfterEvent && !GameEventTemplate2.getActiveEvent())
			{
				this.refreshedAfterEvent = true;
				this.popupMain.forceRefreshAll();
			}
		}
		
		this.stats = stats; //web opt
        this.popupMain.show(stats, tab, onHide);
    },

    hidePopup: function () {
        if (this.popupMain)
            this.popupMain.hide();
    },

    receiveItems: function (items) {
        if (this.popupMain)
            this.popupMain.receiveItems(items);
    },

    // command

    getItem: function (itemId) {
        for (var i = 0; i < g_IBSHOP.length; i++) {
            var item = g_IBSHOP[i].ITEMS.find(function (value) { return value.ITEM_NAME === itemId });
            if (item)
                return item;
        }
        return null;
    },
	
	getItemU:function(itemId, priceType, priceNum)
	{
		for(var i=0; i<g_IBSHOP.length; i++)
		{
			var items = g_IBSHOP[i].ITEMS;
			for(var j=0; j<items.length; j++)
			{
				var item = items[j];
				if(item.ITEM_NAME === itemId && item.PRICE_TYPE === priceType && item.PRICE_NUM === priceNum)
					return item;
			}
		}
		return null;
	},

    buyItem: function (itemId, itemAmount, priceType, priceValue) {
        network.connector.sendRequestBuyIBShopItem(itemId, itemAmount, priceType, priceValue);
    },

    // callbacks

    onBuyItemResponse: function (packet) {
        cc.log(this.LOGTAG, "onBuyItemResponse", " - packet: %j", packet);
        cc.log(this.LOGTAG, "onBuyItemResponse", " - ibshopCount: %j", gv.userData.getIBShop());
            gv.userData.setCoin(packet.coin);
            gv.userData.setGold(packet.gold);
            gv.userData.setReputation(packet.reputation);
        if (packet.error === 0) {
            gv.userData.setIBShop(packet.ibshopCount);
            gv.userStorages.updateItems(packet.updateItems);
            this.receiveItems(packet.updateItems);

            for (var itemId in packet.updateItems)
            {
                var value = packet.updateItems [itemId];

                if (value > 0)
			        Achievement.onAction(g_ACTIONS.ACTION_IBSHOP_BUY.VALUE, itemId, value);
            }
        }
    }
});

IBShopManager._instance = null;
IBShopManager.getInstance = function () {
    if (!IBShopManager._instance)
        IBShopManager._instance = new IBShopManager();
    return IBShopManager._instance;
};

//web var gv = gv || {};
gv.ibshop = IBShopManager.getInstance();