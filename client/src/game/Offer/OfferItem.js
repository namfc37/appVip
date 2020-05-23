var OfferItem = cc.Node.extend({
	LOGTAG: "[OfferItem]",

	ctor: function (onClick)
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_OFFER_ITEM, true, true);
		this.container = FWUtils.getChildByName(this.widget, "container");
		this.timeProgress = FWUtils.getChildByName(this.widget, "progress_time");
		this.timeLabel = FWUtils.getChildByName(this.widget, "lb_time");
		this.addChild (this.widget);

		this.callback = onClick;
		this.isTimeout = false;
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		// jira#5632
		var items = this.container.getChildren();
		for(var i=0; i<items.length; i++)
			items[i].item.uninit(); // uninit FWObject to return spine to pool
		this.container.removeAllChildren();
		FWPool.returnNode(this.widget);
		
		this._super();
	},
	
	load: function (data)
	{
		this.data = data;

		var uiDefine = {
			lb_title: { type: UITYPE_TEXT, value: data.title, style: TEXT_STYLE_TITLE_2 },
			lb_subtitle: { type: UITYPE_TEXT, value: data.subTitle, style: TEXT_STYLE_TEXT_NORMAL_GREEN },
			lb_time: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_TIME },
			btn_buy: { onTouchEnded: this.onClick.bind(this) },//web
			lb_buy: { type: UITYPE_TEXT, id: "TXT_BUY_NOW", style: TEXT_STYLE_TEXT_BUTTON },
			lb_price: { type: UITYPE_TEXT, id: data.priceDisplay, style: TEXT_STYLE_TEXT_BUTTON },
		};

		FWUI.fillData(this.widget, null, uiDefine);
		
		// set countdown
		this.startTimeSeconds = data.rule.start;// Game.getGameTimeInSeconds();
		this.endTimeSeconds = data.rule.finish;// Game.getGameTimeInSeconds() + 360;
		this.durationSeconds = this.endTimeSeconds - this.startTimeSeconds;
		this.update (Game.getGameTimeInSeconds());
		
		// add grid items
		this.fillData_items (data);
	},

	unload: function ()
	{
		FWUI.unfillData(this.widget);
		FWPool.returnNode(this.widget);
	},

	onClick: function (sender)//web
	{
		if (this.isTimeout)
			return;
		
		var id = this.data.id;
		cc.log ("OfferItem", "onBuy", id);
		
		if (this.callback)
			this.callback (this.data);
	},

	fillData_items: function (data)
	{
		var ids = [];
		for (var i in data.items)
		{
			var gfx = Game.getItemGfxByDefine(i);
			var layer = new cc.Layer();
			
			layer.item = new FWObject();
			if (gfx.spine)
			{
				layer.item.initWithSpine (gfx.spine);
				layer.item.setSkin(gfx.skin);
				layer.item.setAnimation(gfx.anim, true);
				layer.item.setPosition(0, 0);
			}
			else if (gfx.sprite)
			{
				layer.item.initWithSprite ("#" + gfx.sprite);
			}
			
			// jira#5632
			//if (gfx.scale)
			//	layer.item.setScale (gfx.scale);
			layer.item.setScale (gfx.scale || 1);

			layer.item.setParent (layer);
			
			// use k
			var text = "x" + data.items[i];
			if(text.endsWith("000"))
				text = text.substring(0, text.length - 3) + "K";

			layer.label = FWUtils.createUIText(text, cc.p(40, -40), cc.size(0, 0), cc.color.WHITE, FONT_SIZE_DEFAULT, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER, FONT_ITALIC);
			layer.label.setAnchorPoint (1, 0);
			FWUI.applyTextStyle(layer.label, TEXT_STYLE_NUMBER);
			layer.addChild (layer.label);
			
			// jira#5632
			layer.item.node.setLocalZOrder(0);
			layer.label.setLocalZOrder(1);

			ids.push (layer);
		}
		
		var rows = ids.length < 7 ? 1 : 2
		var columns = Math.ceil (ids.length / rows);
		var itemWidth = 100;
		var itemHeight = 90;
		var itemOffsetX = 0;
		var itemOffsetY = 0;

		var scale = Math.min (itemWidth / 100, itemHeight / 100);
		scale = Math.floor (scale * 100) / 100;

		for (var r = 0; r < rows; r++)
		{
			var y = itemOffsetY + ((rows - 1) * 0.5 - r) * itemHeight;

			var tempC = ids.length - r * columns;
			if (tempC >= columns)
				tempC = columns
			
			for (var c = 0; c < tempC; c++)
			{
				var x = itemOffsetX + ((tempC - 1) * 0.5 - c) * itemWidth;

				var layer = ids [r * columns + c];

				layer.setPosition (cc.p (x, y));
				layer.item.setScale (layer.item.getScale () * scale);

				this.container.addChild (layer);
			}
		}
	},
	
	update:function(currentTimeSeconds)
	{
		if (currentTimeSeconds < this.startTimeSeconds)
			return;

		var remainTime = this.endTimeSeconds - currentTimeSeconds;
		if (remainTime < 0)
			remainTime = 0;

		var temp = remainTime;
		var days = Math.floor(temp / SECONDS_IN_DAY);
		temp -= days * SECONDS_IN_DAY;

		var hours = Math.floor(temp / SECONDS_IN_HOUR);
		temp -= hours * SECONDS_IN_HOUR;

		var mins = Math.floor(temp / SECONDS_IN_MINUTE);
		temp -= mins * SECONDS_IN_MINUTE;

		var seconds = Math.floor(temp);

		var percent = Math.round (remainTime * 100 / this.durationSeconds);
		var time = "";

		if (days > 9)
			time = days + "d";
		else if (days > 0)
			time = days + "d " + (hours > 9 ? hours : ("0" + hours)) + ":" + (mins > 9 ? mins : ("0" + mins));
		else
			time = (hours > 9 ? hours : ("0" + hours)) + ":" + (mins > 9 ? mins : ("0" + mins)) + ":" + (seconds > 9 ? seconds : ("0" + seconds));

		this.timeProgress.setPercent(percent);
		this.timeLabel.setString(time);
		this.isTimeout = remainTime === 0;
	},
});