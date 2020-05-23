var OfferManager = cc.Class.extend({
	LOGTAG: "[OfferManager]",

	ctor: function () {
	},

	load: function ()
	{
		var hasSMS = (g_PAYMENT_DATA.ACTIVE_SMS.length > 0);//g_PAYMENT_DATA.ACTIVE_SMS_MOBI || g_PAYMENT_DATA.ACTIVE_SMS_VINA || g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL;
		var numSim = fr.platformWrapper.getPhoneCount();
		var simOperator = fr.platformWrapper.getSimOperator();		
		if (numSim == 1 && simOperator && simOperator.length > 0)
		{
			// new data
			//hasSMS =
			//	(g_PAYMENT_DATA.ACTIVE_SMS_MOBI && simOperator == CHANNEL_MOBI)
			//&&	(g_PAYMENT_DATA.ACTIVE_SMS_VINA && simOperator == CHANNEL_VINA)
			//&&	(g_PAYMENT_DATA.ACTIVE_SMS_VIETTEL && simOperator == CHANNEL_VIETTEL);
			var channel = Payment.operatorToChannel(simOperator);
			if(!Payment.isSmsChannelActive(channel))
			{
				hasSMS = false;
			}
		}
		
		var vailds = {};
		vailds [defineTypes.SUB_TYPE_IAP] = Payment.hasIAP;
		vailds [defineTypes.SUB_TYPE_SMS] = Payment.hasLocalPayment && hasSMS; 
		vailds [defineTypes.SUB_TYPE_ATM] = Payment.hasLocalPayment && g_PAYMENT_DATA.ACTIVE_ATM; 
		vailds [defineTypes.SUB_TYPE_ZING] = Payment.hasLocalPayment && g_PAYMENT_DATA.ACTIVE_CARD_ZING; 
		vailds [defineTypes.SUB_TYPE_CARD] = Payment.hasLocalPayment;

		this.pack = {};
		for (var i in g_PAYMENT)
		{
			var payment = g_PAYMENT[i];
			if (payment.TYPE !== defineTypes.TYPE_TAB_OFFER)
				continue;

			var channel = payment.SUB_TYPE;
			if (!vailds [channel])
				continue;
			
			if (!this.pack [channel])
				this.pack [channel] = {};

			this.pack [channel][payment.ID] = payment.PRICE_VND;
		}
	},

	list: function ()
	{
		this.load ();
		
		// check next update
		if (gv.userData.game[GAME_PAYMENT][PAYMENT_TIME_OFFER] != 2147483647)
			this.nextTime = gv.userData.game[GAME_PAYMENT][PAYMENT_TIME_OFFER] + Game.deltaServerTime + 10;
		else
			this.nextTime = -1;

		var list = [];
		var repeat = gv.userData.game[GAME_PAYMENT][PAYMENT_REPEAT_OFFERS];
		var offers = gv.userData.game[GAME_PAYMENT][PAYMENT_OFFERS];
		for (var i in offers)
		{
			var offer = this.parseData (offers [i]);
			
			if (!offer)
				continue;
            
            if (repeat [offer.id])
    			offer.remain = repeat [offer.id];
            
    		list.push (offer);
		}
		
		// TODO: remove fake code
		// list.push ({
		// 	id: "001",
		// 	title: "ƯU ĐÃI CHỦ VƯỜN MỚI",
		// 	subTitle: "Duy nhất 1 lần trong ngày",
		// 	price: 50000,
		// 	priceDisplay: FWUtils.formatNumberWithCommas(50000) + " VNĐ",
		// 	items: {COIN: 3, M0: 10, P11: 1 },
		// 	order: [PAYMENT_SUBTAB_CARD],
		// 	rule: {
		// 		start: Game.getGameTimeInSeconds(),
		// 		finish: Game.getGameTimeInSeconds() + 30000,
		// 		levelMin: 10,
		// 		levelMax: 20,
		// 	}
		// });
		
		this.offers = list;
		return list;
	},

	updateCheckTime: function ()
	{
		if (!this.offers)
		{
			this.checkTime = null;
			return;
		}

		var start = -1;
		var end = -1;
		for (var i in this.offers)
		{
			var offer = this.offers [i];
			
			if ((start === -1) || (offer.rule.start < start && start < offer.rule.finish))
				start = offer.rule.start;

			if ((end === -1) || (offer.rule.start < end && end < offer.rule.finish))
				end = offer.rule.finish;
		}

		this.checkTime = {start:start, end:end};//web this.checkTime = {start, end};
	},

	check: function ()
	{
		// TODO: remove fake code
		//return true;
		if (!this.offers || !Tutorial.isMainTutorialFinished())
			return false;

		var current = Game.getGameTimeInSeconds();
		if (!this.checkTime)
			this.updateCheckTime ();

		if (this.nextTime !== -1 && this.nextTime < current)
		{
			this.nextTime = -1;
			var pk = network.connector.client.getOutPacket(network.RequestPaymentGet);
			pk.pack();
			network.connector.client.sendPacket(pk);
		}
        
		return this.checkTime.start < current && current < this.checkTime.end;
	},

	parseData: function (offerData)
	{
		var id = offerData [PAYMENT_OFFER_ID];
		var start = offerData [PAYMENT_OFFER_TIME_START];
		var finish = offerData [PAYMENT_OFFER_TIME_FINISH];

		// var status = "";
		// var current = Game.getGameTimeInSeconds();
		// if (current < start)
		// 	status = "incoming";
		// else if (finish < current)
		// 	status = "finish";
		// else
		// 	status = "remain	" + (finish - current);
		
		var data = null;
		for (var i in g_PAYMENT_DATA.OFFERS)
		{
			if (g_PAYMENT_DATA.OFFERS [i].ID === id)
			{
				data = g_PAYMENT_DATA.OFFERS [i];
				break;
			}
		}

		if (!data)
			return null;

		var price = data.PRICE_VND;
		var items = data.REWARDS;

		var channels = {};
		for (var c in this.pack)
		for (var i in this.pack [c])
		{
			if (this.pack [c][i] !== 0 && this.pack [c][i] < price)
				continue;
			
			if (channels [c])
			{
				if (channels [c].price > this.pack [c][i])
					channels [c] = {id: i, price: this.pack [c][i]};
			}
			else
				channels [c] = {id: i, price: this.pack [c][i]};
		}
		
		var order = [];
		if (channels [defineTypes.SUB_TYPE_SMS])	order.push (PAYMENT_SUBTAB_SMS);
		if (channels [defineTypes.SUB_TYPE_ZING]
		||	channels [defineTypes.SUB_TYPE_CARD])	order.push (PAYMENT_SUBTAB_CARD);
		if (channels [defineTypes.SUB_TYPE_IAP])	order.push (PAYMENT_SUBTAB_IAP);
		if (channels [defineTypes.SUB_TYPE_ATM])	order.push (PAYMENT_SUBTAB_ATM);

		cc.log ("OfferManager", "parseData", "item", i, id, start, finish, price, JSON.stringify (items), JSON.stringify (channels), JSON.stringify (order));
		
		// jira#5641
		//if(order.length <= 0)
		//{
		//	cc.log("OfferManager:parseData: error: order list is empty, id=" + id);
		//	return null;
		//}

        var priceLocal = data.PRICE_LOCAL;
		var priceDisplay = "";

		if (g_PAYMENT_DATA.USE_PRICE_CENT)
			priceDisplay = (priceLocal / 100).toFixed(2) + " " + FWLocalization.text("TXT_CURRENCY");
		else
			priceDisplay = FWUtils.formatNumberWithCommas(priceLocal) + " " + FWLocalization.text("TXT_CURRENCY");
		
		return {
			id: id,
			title: this.offerName (id),
			subTitle: this.offerDesc (id),
			price: price,
			priceDisplay: priceDisplay,
            remain: 1,
			order: order,
			items: items,
			rule: { start: start, finish: finish }
		};
	},

	show: function (onHide)//web show: function (onHide = null)
	{
		if(onHide === undefined)
			onHide = null;
		
	    Payment.showTab(PAYMENT_TAB_OFFER, onHide);
	},

	offerName: function (offerId)
	{
		return FWLocalization.text("TXT_" + offerId + "_NAME");
	},

	offerDesc: function (offerId)
	{
		return FWLocalization.text("TXT_" + offerId + "_DESC");
	}
});

OfferManager._instance = null;
OfferManager.getInstance = function () {
	if (!OfferManager._instance)
		OfferManager._instance = new OfferManager();
	return OfferManager._instance;
};

//web var gv = gv || {};
gv.offerPanel = OfferManager.getInstance();