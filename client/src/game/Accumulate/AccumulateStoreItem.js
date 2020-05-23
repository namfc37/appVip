var ACCUMULATE_STORE_ITEM_SOLD_OUT				= 10;
var ACCUMULATE_STORE_ITEM_WAITING				= 11;
var ACCUMULATE_STORE_ITEM_RECEIVED				= 12;
var ACCUMULATE_STORE_ITEM_TOKEN_NOT_ENOUGHT		= 13;
var ACCUMULATE_STORE_ITEM_CAN_BUY				= 14;
var ACCUMULATE_STORE_ITEM_UNLIMITED				= 15;
var ACCUMULATE_STORE_ITEM_LIMITED				= 16;
	
var AccumulateStoreItem = cc.Class.extend(
{
	ctor: function (storeData, total_buy, onClick)
	{
		var data = this.parseData (storeData, total_buy);
		cc.log ("AccumulateStoreItem", "ctor");
		
		var widgetId = UI_ACCUMULATE_STORE_ITEM;
		
		this.widget = FWPool.getNode(widgetId, true, true);
		this.widget.setScale(0.9);
		this.widget.dontReturnToPool = true;
		this.callback = onClick;
		
		this.uiDef = {
			bg: {onTouchEnded: this.onClick.bind(this)},//web
			
			limit: {visible: false },
			lb_limit: {type:UITYPE_TEXT, value:0, style:TEXT_STYLE_NUMBER, useK:true},

			title:{type:UITYPE_TEXT, value:data.name, style:TEXT_STYLE_TEXT_NAME_PACK},
			item:{type:UITYPE_ITEM, value:data.icon, options:{isPackGold:true,isPackExp: true}},
			//item:{type:UITYPE_ITEM, value:data.icon,loop:true,},

			timer: {visible: false },
			lb_time: {type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_SMALL},

			price: {visible: false},
			lb_price: {type:UITYPE_TEXT, value:data.price, style:TEXT_STYLE_TEXT_SMALL},

			received: {visible: false},
			soldout: {visible: false},
		};

		var enough =  AccumulateStore.token_remain >= data.price;
		if(data.icon === "PACK") this.uiDef.item = {type:UITYPE_ITEM, value:data.icon,anim:enough?"gift_box_normal_active":"gift_box_normal_idle",loop:true};
		var bg = FWUtils.getChildByName(this.widget, "bg");
		this.light = new FWObject();
		this.light.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.light.setParent(bg);
		this.light.setAnimation("effect_light_icon", true);
		this.light.setPosition(163 * 0.5, 205 * 0.5);
		this.light.setScale(0.6, 0.6);

		FWUI.fillData(this.widget, null, this.uiDef);
		this.setData (data);

		cc.log ("AccumulateStoreItem", data.id, data.sold + "/" + data.total + "/" + data.limit, data.buy + "/" + data.buyLimit,data.icon);
	},

	hide: function ()
	{
		this.widget.dontReturnToPool = false;
		FWUI.unfillData(this.widget);
		FWPool.returnNode(this.widget);
		this.light.uninit();
		this.light = null;
		this.callback = null;
	},

	parseData: function (storeData, total_buy)
	{
		if (!total_buy)
			total_buy = 0;
		
		var id = storeData [ACCUMULATE_STORE_ITEM_ID];
		var packageReward = g_PAYMENT_ACCUMULATE.SHOP[id];
		var isPack = false;
		var name = FWLocalization.text(packageReward.TITLE);
		if (!name || name == "")
			name = Game.getItemName(packageReward.ITEM);
		else
			isPack = true;

		cc.log("package BONUS",id,JSON.stringify(packageReward.BONUS));
		var data = {
			id: packageReward.ID,
			icon: isPack?"PACK":packageReward.ITEM,
			num: packageReward.NUM,
			name: name,
			items: { },
			price: packageReward.PRICE,
			limit: packageReward.LIMIT,
			total: storeData [ACCUMULATE_STORE_ITEM_TOTAL],
			sold: storeData [ACCUMULATE_STORE_ITEM_SOLD],
			buy: total_buy,
			buyLimit: packageReward.LIMIT_PER_USER,
			received: packageReward.LIMIT_PER_USER > 0 && packageReward.LIMIT_PER_USER <= total_buy
		};
		
		data.items [packageReward.ITEM] = packageReward.NUM;
		for (var key in packageReward.BONUS)
			data.items [key] = packageReward.BONUS [key];

		if (packageReward.OPEN_TIMES.length > 0)
		{
			var dayStart = new Date (g_PAYMENT_ACCUMULATE.UNIX_TIME_START * 1000);
			dayStart.setHours (0, 0, 0, 0);

			var dayEnd = new Date (g_PAYMENT_ACCUMULATE.UNIX_TIME_END * 1000);
			dayEnd.setHours (0, 0, 0, 0);

			var serverTime = Game.getGameTimeInSeconds();
			
			data.open_times = [];
			for (var dayCurrent = new Date (dayStart); dayCurrent.getTime() <= dayEnd.getTime(); dayCurrent.setDate(dayCurrent.getDate() + 1))
			{
				for (var d in packageReward.OPEN_TIMES)
				{
					var check = new Date (dayCurrent);
					var hm = packageReward.OPEN_TIMES [d];
					check.setHours (hm.HOUR, hm.MINUTE, 0, 0);

					if (check.getTime() / 1000 >= serverTime && check.getTime() / 1000 < g_PAYMENT_ACCUMULATE.UNIX_TIME_END) {
						data.open_times.push(check);
					}
				}
			}

			if (data.open_times.length == 0)
				data.open_times = null;
		}

		data.status = this.status (data);

		return data;
	},

	setData: function (data)
	{
		this.data = data;
		var bg = FWUtils.getChildByName(this.widget, "bg");
		var limit = FWUtils.getChildByName(this.widget, "limit");
		var lb_limit = FWUtils.getChildByName(this.widget, "lb_limit");
		var timer = FWUtils.getChildByName(this.widget, "timer");
		var lb_time = FWUtils.getChildByName(this.widget, "lb_time");
		var price = FWUtils.getChildByName(this.widget, "price");
		var soldout = FWUtils.getChildByName(this.widget, "soldout");
		var received = FWUtils.getChildByName(this.widget, "received");
		var tintColor = cc.color(200, 200, 200, 255);
		var canBuy = AccumulateStore.token_remain >= data.price;
		switch (data.status)
		{
			case ACCUMULATE_STORE_ITEM_SOLD_OUT:
			{
				bg.setColor(tintColor);

				limit.setVisible (false);
				price.setVisible (true);
				timer.setVisible (false);
				soldout.setVisible (true);
				received.setVisible (false);
				this.light.setVisible (false);
				break;
			}
			case ACCUMULATE_STORE_ITEM_WAITING:
			{
				limit.setVisible (false);
				price.setVisible (false);
				timer.setVisible (true);
				soldout.setVisible (false);
				received.setVisible (false);
				this.light.setVisible (false);
				break;
			}
			case ACCUMULATE_STORE_ITEM_RECEIVED:
			{
				bg.setColor(tintColor);

				limit.setVisible (false);
				price.setVisible (true);
				timer.setVisible (false);
				soldout.setVisible (false);
				received.setVisible (true);
				this.light.setVisible (false);
				break;
			}
			case ACCUMULATE_STORE_ITEM_LIMITED:
			{
				limit.setVisible (true);
				price.setVisible (true);
				timer.setVisible (false);
				soldout.setVisible (false);
				received.setVisible (false);
				this.light.setVisible (canBuy);

				var remain = data.total - data.sold;
				if (remain > 99)
					remain = 99;
				
				lb_limit.setString (remain);
				break;
			}
			case ACCUMULATE_STORE_ITEM_UNLIMITED:
			{
				limit.setVisible (false);
				price.setVisible (true);
				timer.setVisible (false);
				soldout.setVisible (false);
				received.setVisible (false);
				this.light.setVisible (canBuy);
				break;
			}
		}
	},

	status:function (data)
	{
		if (data.buyLimit > 0 && data.buy >= data.buyLimit)
			return ACCUMULATE_STORE_ITEM_RECEIVED;

		if (data.limit == 0)
			return ACCUMULATE_STORE_ITEM_UNLIMITED;
			
		if (data.limit <= data.sold)
			return ACCUMULATE_STORE_ITEM_SOLD_OUT;

		if (data.total <= data.sold)
			return ACCUMULATE_STORE_ITEM_WAITING;

		return ACCUMULATE_STORE_ITEM_LIMITED;
	},

	update:function (curent)
	{
		if (!this.data.open_times || this.data.open_times.length == 0)
			return 1;

		var timeImport = this.data.open_times [0];
		var nextUpdate = timeImport.getTime () / 1000;

		var remainTime = nextUpdate - curent;
		if (remainTime < 0)
			return 2;

		var lb_time = FWUtils.getChildByName(this.widget, "lb_time");
		lb_time.setString (FWUtils.secondsToTimeString(remainTime));

		return 3;
	},
	
	getId:function ()
	{
		return this.data [KEY_UID];
	},
	
	getTime:function ()
	{
		return this.data ? this.data [KEY_TIME] : -1;
	},
	
	nextTime:function ()
	{
	},

	onClick: function (sender)
	{
		if (this.callback)
			this.callback (this);
	}
});