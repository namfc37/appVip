var TomPopupHire = cc.Node.extend({
    LOGTAG: "[TomPopupHire]",

    ctor: function () {
        this._super();

        var saleOffPercent = 0;
        for (var i = 0; i < g_MISCINFO.TOM_SALE_DURATION.length; i++) {
            var saleOffTime = g_MISCINFO.TOM_SALE_DURATION[i];
            if (Game.getGameTimeInSeconds() >= saleOffTime[0] && Game.getGameTimeInSeconds() <= saleOffTime[1]) {
                saleOffPercent = g_MISCINFO.TOM_SALE_OFF_PERCENT;
                break;
            }
        }

        this.data = {
            saleOffPercent: saleOffPercent,
            packages: []
        };

        for (var i = 1; i < g_MISCINFO.TOM_HIRE_DAY.length; i++) {
            this.data.packages.push({
                index: i,
                duration: g_MISCINFO.TOM_HIRE_DAY[i],
                price: g_MISCINFO.TOM_HIRE_PRICE[i]
            });
        }

        this.data.packages = _.sortByDecent(this.data.packages, "duration");
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function () {

        this.widget = FWPool.getNode(UI_TOM_HIRE, false);
        if (this.widget) {

            var panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
            if (!this.npcTom) {
                this.npcTom = new FWObject();
                this.npcTom.initWithSpine(SPINE_NPC_TOMKID);
                this.npcTom.setAnimation(TOMKID_ANIM_IDLE, true);
                this.npcTom.setScale(-TOMKID_ANIM_SCALE_POPUP, TOMKID_ANIM_SCALE_POPUP);
                this.npcTom.setParent(panelNPC);
            }

            var panelItems = FWUI.getChildByName(this.widget, "panelItems");
            if (!this.listItems) {

                this.listItems = new ccui.ListView();
                this.listItems.setClippingEnabled(false);

                panelItems.addChild(this.listItems);
                //panelItems.setClippingEnabled(false);

                this.listItems.setContentSize(panelItems.getContentSize());
                this.listItems.setDirection(ccui.ScrollView.DIR_VERTICAL);
                this.listItems.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
                this.listItems.setTouchEnabled(false);
                this.listItems.setScrollBarAutoHideEnabled(true);
                this.listItems.setInertiaScrollEnabled(true);
                this.listItems.setBounceEnabled(false);
                this.listItems.setItemsMargin(5);
                this.listItems.removeAllItems();

                var itemTop = new ccui.Layout();
                itemTop.setContentSize(cc.size(this.listItems.width, 25));
                itemTop.setTouchEnabled(false);

                var itemDesc = FWPool.getNode(UI_TOM_HINT);
                itemDesc.setContentSize(FWUI.getChildByName(itemDesc, "panel").getContentSize());

                FWUI.fillData(itemDesc, null, {
                    textHint: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_HINT_HIRE"), style:TEXT_STYLE_TEXT_DIALOG },
                    buttonInfo: { onTouchEnded: this.onButtonInfoTouched.bind(this), visible:false },
                    arrow: { visible: false }
                });

                var itemMid = new ccui.Layout();
                itemMid.setContentSize(cc.size(this.listItems.width, 15));
                itemMid.setTouchEnabled(false);

                this.listItems.pushBackCustomItem(itemTop);
                this.listItems.pushBackCustomItem(itemDesc);
                this.listItems.pushBackCustomItem(itemMid);

                var haveSaleOff = this.data.saleOffPercent > 0;

                var packages = this.data.packages;
                if (packages) {
                    for (var i = 0; i < packages.length; i++) {

                        var oldPrice = packages[i].price;
                        var newPrice = Math.max(1, Math.floor(packages[i].price * (100 - this.data.saleOffPercent) / 100));

                        var priceTextColor = (gv.userData.isEnoughCoin(newPrice)) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND;
                        var priceTextShadow = (gv.userData.isEnoughCoin(newPrice)) ? SHADOW_DEFAULT : SHADOW_RED_THICK;

                        var item = FWPool.getNode(UI_TOM_HIRE_PACKAGE);
                        item.setContentSize(FWUI.getChildByName(item, "panel").getContentSize());
						
						// jira#5847
						var tokenCount = 0;
						var rule = null;
                        var iconId = GameEvent.getCurrentEventDropItemIcon();
						if(GameEvent.currentEvent)
							rule = g_EVENT_01.E01_FEATURE_DROP_LIST.rules["TOM_HIRE_" + oldPrice];
						else if(GameEventTemplate2.getActiveEvent())
							rule = g_EVENT_02.E02_FEATURE_DROP_LIST.rules["TOM_HIRE_" + oldPrice];
                        else if(GameEventTemplate3.getActiveEvent())
                        {
                            rule = g_EVENT_03.E03_FEATURE_DROP_LIST.rules["TOM_HIRE_" + oldPrice];
                            var id = rule.dropItemID;
                            iconId = Game.getItemGfxByDefine(id).sprite;
                        }

						if(rule)
							tokenCount = rule.quantity;
						
                        var uiDefine = {
                            itemBack: { type: UITYPE_IMAGE, id: cc.formatStr("npc/npc_kid_0%d.png", i + 1), scale: 0.8 },
                            textName: { type: UITYPE_TEXT, id: cc.formatStr(FWLocalization.text("TXT_TOM_HIDE_DURATION"), packages[i].duration), style: TEXT_STYLE_TEXT_HINT },
                            textDesc: { type: UITYPE_TEXT, id: cc.formatStr(FWLocalization.text(cc.formatStr("TXT_TOM_HINT_HIRE_PACK_%d", packages[i].duration)), packages[i].duration) },
                            textBuyPrice: { type: UITYPE_TEXT, value: FWUtils.formatNumberWithCommas(newPrice), style: TEXT_STYLE_TEXT_NORMAL, color: priceTextColor },
                            panelReward: { visible: false },
                            panelRewardBack: { visible: false },
                            panelDiscount: { visible: haveSaleOff > 0 },
                            discountAmount: { type: UITYPE_TEXT, value: FWUtils.formatNumberWithCommas(oldPrice), style: TEXT_STYLE_TEXT_NORMAL },
                            itemSaleOff: { visible: haveSaleOff },
                            textSaleOffValue: { type: UITYPE_TEXT, value: cc.formatStr("%d%", this.data.saleOffPercent), shadow: SHADOW_RED },
                            buttonBuy: { onTouchEnded: this.onButtonBuyTouched.bind(this) },
							panelEvent: {visible:tokenCount > 0},
							tokenAmount: {visible:tokenCount > 0, type:UITYPE_TEXT, value:tokenCount, style:TEXT_STYLE_TEXT_NORMAL},
							tokenIcon: {visible:tokenCount > 0, type:UITYPE_IMAGE, value:iconId, scale:0.3},
                        };

                        FWUI.fillData(item, null, uiDefine);
                        this.listItems.pushBackCustomItem(item);

                        var buttonBuy = FWUI.getChildByName(item, "buttonBuy");
                        buttonBuy.oldPrice = oldPrice;
                        buttonBuy.newPrice = newPrice;
                        buttonBuy.index = i;

                        var panelDiscount = FWUI.getChildByName(item, "panelDiscount");
                        if (panelDiscount.isVisible()) {

                            var discountAmount = FWUI.getChildByName(item, "discountAmount");
                            var discountIcon = FWUI.getChildByName(item, "discountIcon");
                            discountIcon.setPositionX(cc.rectGetMaxX(discountAmount.getBoundingBox()) + discountIcon.getBoundingBox().width * 0.5 - 5);

                            panelDiscount.setContentSize(cc.size(discountAmount.getBoundingBox().width + discountIcon.getBoundingBox().width - 10, panelDiscount.height));
                            panelDiscount.setPositionX(buttonBuy.x - panelDiscount.width * 0.5);

                            var discountLine = FWUI.getChildByName(item, "discountLine");
                            if (!discountLine) {
                                discountLine = new cc.DrawNode();
                                panelDiscount.addChild(discountLine, 1);
                            }

                            if (discountLine) {

                                var box = panelDiscount.getBoundingBox();
                                var startPoint = cc.p(-4, box.height - 8);
                                var endPoint = cc.p(box.width, 4);

                                discountLine.clear();
                                discountLine.drawLine(startPoint, endPoint, cc.color.RED);
                            }
                        }
                    }
                }
            }

            FWUI.fillData(this.widget, null, {
                container: { onTouchEnded: this.hide.bind(this) }
            });
        }

        if (!FWUI.isShowing(UI_TOM_HIRE)) {

            FWUtils.showDarkBg(FWUtils.getCurrentScene());

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

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
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    onButtonInfoTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonInfoTouched");
        FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
    },

    onButtonBuyTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - packageIndex:", sender.index);
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - packagePriceOld:", sender.oldPrice);
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - packagePriceNew:", sender.newPrice);
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - package: %j", this.data.packages[sender.index]);
        var hirePack = this.data.packages[sender.index];
        if (hirePack.index >= 1 && hirePack.index < g_MISCINFO.TOM_HIRE_DAY.length) {
			// jira#5457
            //if (gv.userData.isEnoughCoin(sender.newPrice)) {
			if(Game.consumeDiamond(sender.newPrice, FWUtils.getWorldPosition(sender)))
			{
				gv.tomkid.requestHire(hirePack.index);
				gv.tomkid.lastButton = sender;
			}
            //}
            //else {
            //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
            //}
        }
        else {
            cc.log(this.LOGTAG, "onButtonBuyTouched", " - Invalid package:", sender.index);
        }
    },

    onHireResponse: function (packet) {
        cc.log(this.LOGTAG, "onHireResponse: %j", packet);
        if (packet.error === 0) {
            this.hide(function () {
                gv.tomkid.showPopupSearch();
            });
        }
    }
});