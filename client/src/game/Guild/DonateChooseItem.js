var DonateChooseItem = 
{
	show: function (items, onChooseCallback)
	{
		cc.log ("DonateChooseItem", "show", JSON.stringify (items));
		this.chooseItemId = null;
		this.chooseItemNum = 0;

		var uiDefine = {
			// panel: { onTouchEnded:this.hide.bind(this) },
			itemIcon: { type: UITYPE_IMAGE, scale: 0.7, visible: false },
            itemSpine: { type: UITYPE_IMAGE, scale: 0.7, visible: false },
			itemName: { type: UITYPE_TEXT, field: "", visible: false, style: TEXT_STYLE_TEXT_NORMAL },
			itemAmount: { type: UITYPE_TEXT, value: "", style: TEXT_STYLE_NUMBER },
			lb_npc: { type: UITYPE_TEXT, value: "TXT_DONATE_ITEM_CHOOSE_DESC", style: TEXT_STYLE_TEXT_DIALOG },
			btn_close: { onTouchEnded: this.hide.bind(this) },//web btn_close: { onTouchEnded: (sender) => this.hide () },
			btn_start: { enabled:false, onTouchEnded: function(sender) {this.choose (onChooseCallback);}.bind(this) },//web btn_start: { enabled:false, onTouchEnded: (sender) => this.choose (onChooseCallback) },
			lb_start: { type: UITYPE_TEXT, value: "TXT_DONATE_START", style: TEXT_STYLE_TEXT_BUTTON },
			npcMarker: { type:UITYPE_SPINE, value:SPINE_NPC_PUSS, anim:"talk", scale:0.375, visible:true },
		};

		this.widget = FWPool.getNode(UI_DONATE_START, false);
		this.widget.setLocalZOrder(Z_UI_COMMON + 2);

		FWUI.fillData(this.widget, null, uiDefine);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
		FWUtils.showDarkBg(null, Z_UI_COMMON + 1, "donateChooseItem");

		var storageFilterTypes = [STORAGE_TYPE_FARM_PRODUCT, STORAGE_TYPE_PRODUCT];
		gv.gameBuildingStorageInterface.showStorageUI (true, true, this.onItemSelected.bind(this), Z_UI_COMMON + 2, storageFilterTypes, items, true);//web gv.gameBuildingStorageInterface.showStorageUI (true, true, (sender) => this.onItemSelected (sender), Z_UI_COMMON + 2, storageFilterTypes, items, true);
		gv.gameBuildingStorageInterface.changeStorageType(gv.gameBuildingStorageInterface.buttonFarmProduct, STORAGE_TYPE_FARM_PRODUCT);

		AudioManager.effect (EFFECT_POPUP_SHOW);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
	},

	hide: function (sender)
	{
		cc.log("DonateChooseItem", "hide");

        FWUI.hideWidget(this.widget, { fx: UIFX_NONE });
        gv.gameBuildingStorageInterface.showStorageUI(false);
		FWUtils.hideDarkBg(null, "donateChooseItem");

        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},

	choose: function (callback)
	{
		cc.log("DonateChooseItem", "choose", "itemId", this.chooseItemId + ":" + this.chooseItemNum);
		
		var checkPack = [{itemId: this.chooseItemId, amount: 0}];
		var check = Game.canReceiveGift (checkPack, false);
		var action = function()//web
		{			
			this.hide ();

			if (callback && this.chooseItemId)
				callback (this.chooseItemId);
		}.bind(this);

		cc.log("DonateChooseItem", "check", check);
		if (check)
			action ();
		else
			Game.showPopup({ title: "TXT_WARNING", content: "TXT_DONATE_WARNING_OUT_OF_STOCK_DESC"}, action, function() {});//web
	},

	onItemSelected: function (sender)
	{
        cc.log("DonateChooseItem", "onItemSelected", "itemId", sender.uiData.itemId);
		if (!sender)
			return;

		var donate = g_GUILD.DONATE_ITEMS [sender.uiData.itemId];	
		if (!donate)
			return;

		this.chooseItemId = sender.uiData.itemId;
		this.chooseItemNum = donate.QUANTITY;
		var itemName = Game.getItemName(this.chooseItemId);
		var itemIcon = Game.getItemGfxByDefine(this.chooseItemId);

		var iconSprite = FWUI.getChildByName(this.widget, "itemIcon");
		var iconSpine = FWUI.getChildByName(this.widget, "itemSpine");
		var lb_itemName = FWUI.getChildByName(this.widget, "itemName");
		var lb_itemAmount = FWUI.getChildByName(this.widget, "itemAmount");
		var btn_start = FWUI.getChildByName(this.widget, "btn_start");
		
		lb_itemName.setString(itemName);
		lb_itemAmount.setString(this.chooseItemNum);

		if (iconSprite)
			iconSprite.setVisible(itemIcon.sprite !== undefined);

		if (iconSpine)
			iconSpine.setVisible(itemIcon.spine !== undefined);

		if (itemIcon.sprite)
			FWUI.fillData_image2(iconSprite, itemIcon.sprite, 0.7);
		else if (itemIcon.spine)
			FWUI.fillData_spine2(iconSpine, itemIcon.spine, itemIcon.skin || "", itemIcon.anim || "", itemIcon.scale || 1.0);

		btn_start.setEnabled(true);
    },
};