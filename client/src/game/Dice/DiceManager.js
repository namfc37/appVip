var DiceManager = cc.Class.extend({
	LOGTAG: "[DiceManager]",

	ctor: function () {
	},

	// ui

	showPopup: function () {
		if (!this.popupMain)
			this.popupMain = new DicePopup();
		this.popupMain.show();
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "dice");
	},

	// command

	requestDiceSpin: function () {
		network.connector.sendRequestDiceSpin();
	},

	requestDiceClaim: function () {
		network.connector.sendRequestDiceClaim();
	},

	// utilities

	getSlots: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_SLOTS] : [];
	},

	getActiveSlot: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_POS] : -1;
	},

	getWaitSlot: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_INCOMPLETE] : -1;
	},

	getWinSlot: function () {
		return gv.userData.getDiceWinSlot();
	},

	getSpentCoin: function () {
		var total = this.getSpentCoinTotal();
		var spent = this.getSpentCoinCurrent();

		if (total.next === total.previous)
			return {
				current: total.next,
				require: total.next
			};
		
		return {
			current: spent,
			require: total.next
		};
	},

	getSpentCoinCurrent: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_SPENT_COIN] : 0;
	},

	getSpentCoinTotal: function () {
		var data = gv.userData.getDice();
		if (!data)
			return {
				previous: 0,
				next: 0
			};

		var prices = (data[DICE_IS_EVENT]) ? g_MISCINFO.DICE_EVENT_PRICE : g_MISCINFO.DICE_DAILY_PRICE;
		var index = 0;
		while (index < prices.length && prices[index] <= data[DICE_SPENT_COIN])
			index++;
		
		if (index >= prices.length)
			return {
				previous: prices[prices.length - 1],
				next: prices[prices.length - 1]
			};
		
		if (index > 0)
			return {
				previous: prices[index - 1],
				next: prices[index]
			};

		return {
			previous: 0,
			next: 0
		};
	},
	
	getTicket: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_NUM_TICKET] : 0;
	},

	getTime: function () {
		var data = gv.userData.getDice();
		return {
			timeDuration: (data) ? (data[DICE_TIME_END] - data[DICE_TIME_START]) : 0,
			timeEnd: (data) ? data[DICE_TIME_END] : 0
		}
	},

	isDouble: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_IS_X2] : false;
	},

	isEvent: function () {
		var data = gv.userData.getDice();
		return (data) ? data[DICE_IS_EVENT] : false;
	},

	haveReward: function () {
		return this.getWinSlot() >= 0;
	},

	getFestivalReward: function ()
	{
		var data = gv.userData.getDice();
		var items = (!data || !data[DICE_EVENT_ITEMS]) ? {} : data[DICE_EVENT_ITEMS];
		return items;
	},

	getReward: function ()
	{
		var items = this.getFestivalReward();
		var slotId = this.getWaitSlot();
		
		if (slotId !== -1)
		{
			var slot = this.getSlots()[slotId];
			var itemId = slot[DICE_SLOT_ITEM];
			var itemQuantity = slot[DICE_SLOT_NUM];

			if (itemId === "X2")
				items [itemId] = 0;
			else
				items [itemId] = itemQuantity * (this.isDouble() ? 2 : 1);
		}

		cc.log(this.LOGTAG, "getReward", slotId, JSON.stringify(items));
		return items;
	},

	// server callbacks

	onDiceSpinResponse: function (packet) {
		cc.log(this.LOGTAG, "onDiceSpinResponse: %j", packet);
		if (packet.error === 0) {
			gv.userData.setCoin(packet.coin);
			gv.userData.setDice(packet.dice);
			gv.userData.setDiceWinSlot(packet.diceWinSlot);
			gv.userStorages.updateItems(packet.updateItems);
			
			Achievement.onAction(g_ACTIONS.ACTION_DICE_SPIN.VALUE, null, 1);
		}
		if (this.popupMain)
			this.popupMain.onSpinResponse(packet);
	},

	onDiceClaimResponse: function (packet) {
		cc.log(this.LOGTAG, "onDiceClaimResponse: %j", packet);
		if (packet.error === 0) {
			gv.userData.setCoin(packet.coin);
			gv.userData.setDice(packet.dice);
			gv.userData.setDiceWinSlot(packet.diceWinSlot);
			gv.userStorages.updateItems(packet.updateItems);
		}
		if (this.popupMain)
			this.popupMain.onClaimResponse(packet);
	},

	// local callbacks

	onCoinAdded: function (value)
	{
		cc.log(this.LOGTAG, "onCoinAdded", "value:", value);
		if (value > -1)
			return;
		
		var data = gv.userData.getDice();
		if (!data)
			return;

		var spentCoin = data[DICE_SPENT_COIN];
		var newSpentCoin = data[DICE_SPENT_COIN] + Math.abs(value);

		var prices = (data[DICE_IS_EVENT]) ? g_MISCINFO.DICE_EVENT_PRICE : g_MISCINFO.DICE_DAILY_PRICE;
		var ticketList = (data[DICE_IS_EVENT]) ? g_MISCINFO.DICE_EVENT_ADD : g_MISCINFO.DICE_DAILY_ADD;

		var lastPriceIndex = 0;
		while (lastPriceIndex < prices.length && spentCoin >= prices[lastPriceIndex])
			lastPriceIndex++;

		var nextPriceIndex = prices.length - 1;
		while (nextPriceIndex >= 0 && newSpentCoin < prices[nextPriceIndex])
			nextPriceIndex--;

		lastPriceIndex--;

		var ticketGained = 0;
		for (var i = lastPriceIndex + 1; i <= nextPriceIndex; i++)
			ticketGained += ticketList[nextPriceIndex];

		gv.userData.addSpentCoin(Math.abs(value));
		gv.userData.addTicket(ticketGained);

		if (this.popupMain)
			this.popupMain.onSpentCoinChanged(newSpentCoin, this.getTicket());
		
		// jira#5223
		if(ticketGained > 0)
			gv.arcade.refreshNotification();
	},
	
	cleanup:function()
	{
		if(!this.popupMain)
			return;
		
		for(var i=0; i<this.popupMain.fireflies.length; i++)
			this.popupMain.fireflies[i].removeFromParent();
	},
});

DiceManager._instance = null;
DiceManager.getInstance = function () {
	if (!DiceManager._instance)
		DiceManager._instance = new DiceManager();
	return DiceManager._instance;
};

// web var gv = gv || {};
gv.dice = DiceManager.getInstance();