var TomPopupSearchDone = cc.Node.extend({
    LOGTAG: "[TomPopupSearchDone]",

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function () {

        var itemId = gv.tomkid.getFindItem();
        var itemPackages = [];

        var packages = gv.tomkid.getFindPackages();
        for (var i = 0; i < packages.length; i++) {
            itemPackages.push({
                itemId: itemId,
                itemName: itemId,
                itemIndex: i,
                itemAmount: packages[i].amount,
                itemPrice: packages[i].price,
                itemAmountText: cc.formatStr("x%d", packages[i].amount),
                itemPriceText: FWUtils.formatNumberWithCommas(packages[i].price),
            });
        }

        this.widget = FWPool.getNode(UI_TOM_SEARCH_DONE, false);
        if (this.widget) {

            var panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
            if (!this.npcTom) {
                this.npcTom = new FWObject();
                this.npcTom.initWithSpine(SPINE_NPC_TOMKID);
                this.npcTom.setAnimation(TOMKID_ANIM_IDLE_GOODS, true);
                this.npcTom.setScale(-TOMKID_ANIM_SCALE_POPUP, TOMKID_ANIM_SCALE_POPUP);
                this.npcTom.setParent(panelNPC);
            }

            var panelHint = FWUI.getChildByName(this.widget, "panelHint");
            if (panelHint) {
                var panelContent = FWUI.getChildByName(this.widget, "panelContent");
                if (!panelContent) {
                    panelContent = FWPool.getNode(UI_TOM_HINT, true);
                    panelHint.addChild(panelContent, 0, "panelContent");
                }
            }

            var itemPositions = itemPackages.map(function (value, index) { return [index, 0] });
            var itemDefine = {
                itemName: { type: UITYPE_TEXT, field: "itemName", visible: false, style: TEXT_STYLE_TEXT_NORMAL },
                itemAmount: { type: UITYPE_TEXT, field: "itemAmountText", style: TEXT_STYLE_NUMBER },
                textGold: { type: UITYPE_TEXT, field: "itemPriceText", style: TEXT_STYLE_NUMBER },
                container: { onTouchEnded: this.onButtonItemTouched.bind(this) }
            };

            var panelItems = FWUI.getChildByName(this.widget, "panelItems");
            var itemSize = cc.size(panelItems.width / itemPackages.length, 199);

            var uiDefine = {
                textHint: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_HINT_SEARCH_DONE"), style: TEXT_STYLE_TEXT_DIALOG },
                textDeny: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_BUTTON_SEARCH_DENY"), style: TEXT_STYLE_TEXT_NORMAL },
                textTime: { type: UITYPE_TEXT, id: "0", style: TEXT_STYLE_TEXT_TIME },
                buttonInfo: { onTouchEnded: this.onButtonInfoTouched.bind(this), visible:false },
                buttonDeny: { onTouchEnded: this.onButtonDenyTouched.bind(this) },
                panelItems: {
                    type: UITYPE_2D_LIST,
                    items: itemPackages,
                    itemUI: UI_TOM_ITEM_SLOT_PRICE,
                    itemDef: itemDefine,
                    itemSize: itemSize,
                    itemsPosition: itemPositions
                },
                container: { onTouchEnded: this.hide.bind(this) }
            };

            FWUI.fillData(this.widget, null, uiDefine);

            // TEMP: Should define in uiDefine
            var items = panelItems.getChildren();
            for (var i = 0; i < items.length; i++) {

                var itemGfx = Game.getItemGfxByDefine(itemPackages[i].itemId);

                var iconSprite = FWUI.getChildByName(items[i], "itemIcon");
                var iconSpine = FWUI.getChildByName(items[i], "itemSpine");

                iconSprite && iconSprite.setVisible(itemGfx.sprite !== undefined);
                iconSpine && iconSpine.setVisible(itemGfx.spine !== undefined);

                if (itemGfx.sprite) {
                    FWUI.fillData_image2(iconSprite, itemGfx.sprite, 0.7);
                }
                else if (itemGfx.spine) {
                    FWUI.fillData_spine2(iconSpine, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", itemGfx.scale || 1.0);
                }
            }

            var itemWidthOffset = itemSize.width - 144;
            panelItems.setContentSize(cc.size(panelItems.width - itemWidthOffset, panelItems.height));
            panelItems.setPositionX(panelHint.x + (panelHint.width - panelItems.width) * 0.5);

            this.textTime = FWUI.getChildByName(this.widget, "textTime");
            this.barTime = FWUI.getChildByName(this.widget, "barTime");
        }

        if (!FWUI.isShowing(UI_TOM_SEARCH_DONE)) {

            FWUtils.showDarkBg(FWUtils.getCurrentScene());

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

            this.updateTime();
            cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateTime, 0.5, cc.REPEAT_FOREVER, 0, false);
    
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }
    },

    hide: function (callback) {//web hide: function (callback = null) {
		
		if(callback === undefined)
			callback = null;

        FWUtils.hideDarkBg(FWUtils.getCurrentScene());
        FWUI.hideWidget(this.widget, { fx: UIFX_NONE, callback: callback });

        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateTime);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    updateTime: function (dt) {

        var hireTimeLeft = gv.tomkid.getHireTimeLeft();
        this.textTime.setString(FWUtils.secondsToTimeString(hireTimeLeft));

        this.textTime && this.textTime.setVisible(hireTimeLeft > 0);
        this.barTime && this.barTime.setVisible(hireTimeLeft > 0);
    },

    onButtonInfoTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonInfoTouched");
        FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
    },

    onButtonDenyTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonDenyTouched");
        gv.tomkid.requestCancel();
    },

    onButtonItemTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonItemTouched", " - uiBaseData: %j", sender.uiBaseData);
        if (sender.uiBaseData) {

            if (Game.canReceiveGift([{ itemId: sender.uiBaseData.itemId, amount: sender.uiBaseData.itemAmount }])) {
                if (gv.userData.isEnoughGold(sender.uiBaseData.itemPrice)) {
                    gv.tomkid.requestBuy(sender.uiBaseData.itemIndex);
					
					// jira#5078
					// fx
					var itemId = sender.uiBaseData.itemId;
					FWUtils.showFlyingItemIcon(itemId, sender.uiBaseData.itemAmount, FWUtils.getWorldPosition(sender), Game.getFlyingDestinationForItem(itemId), 0);
                }
                else {
                    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
                }
            }

            // if (gv.userStorages.getStorageForItemId(sender.uiBaseData.itemId).canAddItem(sender.uiBaseData.itemAmount)) {
            //     if (gv.userData.isEnoughGold(sender.uiBaseData.itemPrice)) {
            //         gv.tomkid.requestBuy(sender.uiBaseData.itemIndex);
            //     }
            //     else {
            //         Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
            //     }
            // }
            // else {
            //     Game.showEmtpyStockWarning([{ itemId: sender.uiBaseData.itemId }], () => {
            //         gv.tomkid.requestBuy(sender.uiBaseData.itemIndex);
            //     });
            // }
        }
    },

    onBuyResponse: function (packet) {
        cc.log(this.LOGTAG, "onBuyResponse: %j", packet);
        if (packet.error === 0) {
            this.hide();
        }
    },

    onCancelResponse: function (packet) {
        cc.log(this.LOGTAG, "onCancelResponse: %j", packet);
        if (packet.error === 0) {
            this.hide();
        }
        else {
            cc.log(this.LOGTAG, "Buy item failed:", packet.error);
            // gv.hint.showHintToast(null, cc.formatStr(FWLocalization.text("TXT_TOM_MSG_BUY_DENY_FAILED"), packet.error));
        }
    }
});