var UtilPanelInfo = cc.Node.extend({
	LOGTAG: "[UtilPanelInfo]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_UTIL_LIBRARY_INFO, false);
		
		var uiDefine = {
			fx: { type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9 },

			timeBg: { onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this) },
			expBg: { onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this) },
			bugBg: { onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this) },
			btn_close: { onTouchEnded: this.hide.bind(this) },//web

			lb_item_time_hint: { type: UITYPE_TEXT, value: "TXT_POTINFO_HINT_TIME", style: TEXT_STYLE_TEXT_HINT_BROWN },
			lb_item_exp_hint: { type: UITYPE_TEXT, value: "TXT_POTINFO_HINT_EXP", style: TEXT_STYLE_TEXT_HINT_BROWN },
			lb_item_bug_hint: { type: UITYPE_TEXT, value: "TXT_POTINFO_HINT_BUG", style: TEXT_STYLE_TEXT_HINT_BROWN },
		};

		FWUI.fillData(this.widget, null, uiDefine);
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	show: function (itemId)
	{
		cc.log(this.LOGTAG, "show");
		
		this.onItem (itemId);
		if (FWUI.isShowing(UI_UTIL_LIBRARY_INFO))
			return;
			
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder(Z_UI_COMMON + 1);
	},

	hide: function (sender)
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
	},

	onItem: function (itemId)
	{
		var itemDefine = defineMap [itemId];
		if (!itemDefine || !itemDefine.COMBO_ID)
			return;

		var comboDefine = g_COMBO [itemDefine.COMBO_ID];
		if (!comboDefine)
			return;
		
		this.fillType (itemDefine.TYPE);
		this.fillItemData (itemId, itemDefine);
		this.fillComboData (itemId, itemDefine.COMBO_ID, comboDefine);
	},

	fillType: function (itemType)
	{
		this.item_type = itemType;
		switch (itemType)
		{
			case defineTypes.TYPE_POT:
				this.item_anim = "pot_icon_big";
				this.item_scale = 1;
				this.item_position = cc.p (0, 0);
			break;

			case defineTypes.TYPE_DECOR:
				this.item_anim = "normal";
				this.item_scale = 1.6;
				this.item_position = cc.p (0, 50);
			break;
		}
	},
	
	fillItemData: function (itemId, itemDefine)
	{
		var uiDefine = {
			lb_item_name: { type:UITYPE_TEXT, value:Game.getItemName(itemId), style:TEXT_STYLE_TITLE_1 },
			lb_item_time_buff: { type: UITYPE_TEXT, value: "-" + itemDefine.TIME_DECREASE_DEFAULT + "s", style: TEXT_STYLE_TEXT_NORMAL },
			lb_item_exp_buff: { type: UITYPE_TEXT, value: "+" + itemDefine.EXP_INCREASE, style: TEXT_STYLE_TEXT_NORMAL },
			lb_item_bug_buff: { type: UITYPE_TEXT, value: "+" + itemDefine.BUG_APPEAR_RATIO + "%", style: TEXT_STYLE_TEXT_NORMAL },
		};

		FWUI.fillData(this.widget, null, uiDefine);

		if (this.item_icon)
			this.item_icon.node.removeFromParent();

		var marker = FWUI.getChildByName (this.widget, "spine");
		marker.removeAllChildren ();

		var data = {};
		switch (this.item_type)
		{
			case defineTypes.TYPE_POT:
				data.spine = Game.getPotSpineByDefine(itemId);
				data.skin = Game.getPotSkinByDefine(itemId);
				break;
			
			case defineTypes.TYPE_DECOR:
				data.spine = Game.getDecorSpineByDefine(itemId);
				data.skin = Game.getDecorSkinByDefine(itemId);
				break;
		}

		var spine = new FWObject();
		spine.initWithSpine(data.spine, marker);
		spine.setSkin(data.skin);
		spine.setAnimation(this.item_anim, true);
		spine.setScale(this.item_scale);
		spine.setPosition(this.item_position);
		spine.setParent(marker);

		this.item_icon = spine;
	},

	fillComboData: function (itemId, comboId, comboDefine)
	{
		var comboList = [];
		for(var i in comboDefine.CHILDREN)
		{
			var id = comboDefine.CHILDREN[i];
			comboList.push({ itemId:id, isCurrent: id === itemId });
		}
		
		var comboItemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId" },
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.5, visible:"data.isCurrent"},
			item: { onTouchEnded:this.onTouch.bind(this) }
		};

		var uiDefine = {
			lb_combo_name: { type: UITYPE_TEXT, id: Game.getItemName(comboId), style: TEXT_STYLE_TEXT_NORMAL },
			item_list: { type:UITYPE_2D_LIST, items:comboList, itemUI:UI_POT_INFO_ITEM, itemDef:comboItemDef, itemSize:cc.size(100, 100), singleLine:true, itemsAlign:"center", visible:comboList.length > 0 }
		};

		FWUI.fillData(this.widget, null, uiDefine);
		
		for(var i = 0; i < 3; i++)
		{
			var buffWidget = FWUtils.getChildByName(this.widget, "buff_" + i);
			var buffInfo = comboDefine.BUFF_INFO[i];
			if (!buffInfo)
			{
				buffWidget.setVisible(false);
				continue;
			}
			else
				buffWidget.setVisible(true);

			var desc = "TXT_BUFF_" + buffInfo.type + (buffInfo.type < 3 || buffInfo.type === 5 ? "_" + buffInfo.area : "");
			var value =
				(buffInfo.type === BUFF_HARVEST_TIME || buffInfo.type === BUFF_PRODUCTION_TIME ? "-" : "+")
			+	(buffInfo.value + buffInfo.bonus * 5)
			+	(buffInfo.unit === PERC ? "%  " : "  ")
			;
			
			buffDefine = {
				buff_icon: { type:UITYPE_IMAGE, scale:0.5, value:Game.getBuffIconByType(buffInfo.type) },
				value: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, value: value },
				desc: { type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value: desc }
			};
			
			FWUI.fillData(buffWidget, null, buffDefine);
		}
	},

	showHint:function(sender, show)//web showHint:function(sender, show = true)
	{
		if(show === undefined)
			show = true;
		
		var name = sender.getName();
		name = name.replace (/Bg/, "Hint"); // e.g: timeBg => timeHint, expBg => expHint
		var hint = FWUtils.getChildByName(this.widget, name);
		
		if(show)
		{
			hint.setVisible(true);
			hint.stopAllActions();
			hint.setScale(0);
			hint.runAction(cc.scaleTo(0.15, 1));
		}
		else
		{
			hint.stopAllActions();
			hint.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(function() {hint.setVisible(false);})));
		}
	},
	
	hideHint:function(sender)
	{
		this.showHint(sender, false);
	},

	onTouch: function (sender)
	{
		var data = sender.uiData;
		cc.log ("onTouch", JSON.stringify (data));

		this.onItem (data.itemId);
	},
});