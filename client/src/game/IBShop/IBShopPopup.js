const ICON_TAB_ACTIVE_SCALE = 0.75;
const ICON_TAB_INACTIVE_SCALE = 0.65;

const ICON_TAB_ACTIVE_COLOR = cc.color.WHITE;
const ICON_TAB_INACTIVE_COLOR = cc.color(185, 94, 7, 255);

const ICON_TAB_ACTIVE_OPACITY = 255;
const ICON_TAB_INACTIVE_OPACITY = 192;

const SHADOW_BLUE = [cc.color(15, 110, 175, 255), cc.size(0, -1.5), cc.color(15, 110, 175, 255), 1];
const SHADOW_RED = [cc.color(135, 0, 0, 255), cc.size(0, -1.5), cc.color(135, 0, 0, 255), 0];
const SHADOW_RED_THICK = [cc.color(135, 0, 0, 255), cc.size(0, -1.5), cc.color(135, 0, 0, 255), 1];

const IB_SHOP_BUY_CONFIRM_MIN_PRICE = 101;//200;
const IB_SHOP_BUY_CONFIRM_TIME = 5.0;

const IB_SHOP_USE_SHARED_LIST = false;

const IB_SHOP_SCROLLVIEW_HEIGHT = 600;

var IBShopPopup = cc.Node.extend({
    LOGTAG: "[IBShopPopup]",

    ctor: function () {
        this._super();

        this.mapTabName = {};
        this.mapTabIndex = {};

        this.mapTabData = {
            PLANT: {
                icon: "hud/icon_tab_plants.png",
                name: FWLocalization.text("TXT_IB_SHOP_TAB_PLANT")
            },
            POT: {
                icon: "hud/icon_tab_pots.png",
                name: FWLocalization.text("TXT_IB_SHOP_TAB_POT")
            },
            DECOR: {
                icon: "hud/icon_tab_decors.png",
                name: FWLocalization.text("TXT_IB_SHOP_TAB_DECOR")
            },
            UPGRADE: {
                icon: "hud/icon_tab_upgrade.png",
                name: FWLocalization.text("TXT_IB_SHOP_TAB_UPGRADE")
            },
            MISC: {
                icon: "hud/icon_tab_items.png",
                name: FWLocalization.text("TXT_IB_SHOP_TAB_MISC")
            }
        };
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    updateItem: function (item, data, type) {

        var isLocked = data.isLocked;
        var canBuyItem = gv.userData.canBuyIBShopItemU(data.ITEM_NAME, data.PRICE_TYPE, data.PRICE_NUM);

        var isPotStats = (type === IB_SHOP_TYPE_POT && data.ITEM_NAME !== "P0");
        var isPlantStats = (type === IB_SHOP_TYPE_PLANT);
        var haveStats = isPotStats || isPlantStats;

        var haveReward = Object.keys(data.GIFT_WHEN_BUY).length > 0;
        var haveSaleOff = !isLocked && data.saleOffPercent > 0;

        var oldPrice = data.PRICE_NUM;
        var newPrice = Math.max(1, Math.floor(data.PRICE_NUM * (100 - data.saleOffPercent) / 100));
		
		// jira#5925
		if(data.ITEM_NAME === "P0" && Tutorial.isRunning())
			newPrice = 0;

        var isValidPrice = g_MISCINFO.IBSHOP_ALLOW_PRICE_TYPE.findIndex(function (value) { return value === data.PRICE_TYPE; }) !== -1;
        var priceType = (isValidPrice) ? FWUtils.getPriceTypeIcon(data.PRICE_TYPE) : "";

        var priceTextColor = (gv.userData.isEnoughForPrice(data.PRICE_TYPE, newPrice)) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND;
        priceTextColor = (canBuyItem) ? priceTextColor : cc.color.WHITE;

        //web
		//var priceTextShadow = SHADOW_DEFAULT; // jira#5512 (gv.userData.isEnoughForPrice(data.PRICE_TYPE, newPrice)) ? SHADOW_DEFAULT : SHADOW_RED_THICK;
        //priceTextShadow = (canBuyItem) ? priceTextShadow : SHADOW_DEFAULT;


        var formatNumber = FWUtils.formatNumberWithCommas(newPrice);
        if(newPrice >=1000 && newPrice%1000 ==0 ) formatNumber = newPrice;
        var priceTextValue = (canBuyItem) ? (newPrice > 0 ? formatNumber : "TXT_FREE") : FWLocalization.text("TXT_IB_SHOP_OUT_LIMIT_TITLE");

        var uiDefine = {
            itemLock: { visible: isLocked },
            itemUnlock: { visible: isLocked },
            textUnlock: { type: UITYPE_TEXT, value: data.UNLOCK_LEVEL, style:TEXT_STYLE_TEXT_NORMAL },//web textUnlock: { type: UITYPE_TEXT, value: data.UNLOCK_LEVEL, shadow: SHADOW_BLUE },
            textName: { type: UITYPE_TEXT, value: Game.getItemName(data.ITEM_NAME), style:TEXT_STYLE_TEXT_NORMAL },//web textName: { type: UITYPE_TEXT, value: Game.getItemName(data.ITEM_NAME), shadow: SHADOW_GREY_THIN },
            textDesc: { type: UITYPE_TEXT, value: Game.getItemDesc(data.ITEM_NAME), visible: !haveStats },
            textCount: { type: UITYPE_TEXT, value: cc.formatStr("x%d", data.ITEM_QUANTITY), style:TEXT_STYLE_TEXT_NORMAL_GREEN },//web textCount: { type: UITYPE_TEXT, value: cc.formatStr("x%d", data.ITEM_QUANTITY), shadow: SHADOW_GREEN },
            textBuyPrice: { type: UITYPE_TEXT, value: priceTextValue, style:TEXT_STYLE_TEXT_NORMAL, color: priceTextColor ,useK:true},//web textBuyPrice: { type: UITYPE_TEXT, value: priceTextValue, shadow: priceTextShadow, color: priceTextColor ,useK:true},
            iconPrice: { type: UITYPE_IMAGE, value: priceType, scale: 0.45, visible: canBuyItem }, // scale 0.5 => 0.45
            buttonBuy: { onTouchEnded: this.onButtonBuyTouched.bind(this), visible:isValidPrice && (type !== IB_SHOP_TYPE_POT || data.ITEM_NAME === "P0" || !Tutorial.isIBShopStep()) },
            panelStats: { visible: isPotStats },
            plantStats: { visible: isPlantStats },
            panelReward: { visible: haveReward },
            panelRewardBack: { visible: haveReward },
            panelDiscount: { visible: isValidPrice && haveSaleOff },
            discountAmount: { type: UITYPE_TEXT, value: FWUtils.formatNumberWithCommas(oldPrice), style:TEXT_STYLE_TEXT_NORMAL },//web discountAmount: { type: UITYPE_TEXT, value: FWUtils.formatNumberWithCommas(oldPrice), shadow: SHADOW_DEFAULT },
            discountIcon: { type: UITYPE_IMAGE, value: priceType, scale: 0.4 },
            itemSaleOff: { visible: isValidPrice && haveSaleOff },
            textSaleOffValue: { type: UITYPE_TEXT, value: cc.formatStr("%d%", data.saleOffPercent), style:TEXT_STYLE_TEXT_NORMAL_RED }//web textSaleOffValue: { type: UITYPE_TEXT, value: cc.formatStr("%d%", data.saleOffPercent), shadow: SHADOW_RED }
        };

        FWUI.fillData(item, null, uiDefine);

        // layout button buy

        var panel = FWUI.getChildByName(item, "panel");
        var buttonBuy = FWUI.getChildByName(item, "buttonBuy");
        if (!buttonBuy.originalPosition)
            buttonBuy.originalPosition = buttonBuy.getPosition();
        buttonBuy.setPositionY((isValidPrice && haveSaleOff) ? buttonBuy.originalPosition.y : panel.height * 0.5);

        buttonBuy.itemId = data.ITEM_NAME;
        buttonBuy.itemAmount = data.ITEM_QUANTITY;
        buttonBuy.itemLimitDay = data.LIMIT_DAY;
        buttonBuy.itemPriceType = data.PRICE_TYPE;
        buttonBuy.giftWhenBuy = data.GIFT_WHEN_BUY;
        buttonBuy.itemPrice = newPrice;
        buttonBuy.itemLocked = isLocked;
        buttonBuy.useIn = data.USE_IN;

        var textBuy = FWUI.getChildByName(item, "textBuyPrice");
        if (!canBuyItem)
            textBuy.setPositionX(buttonBuy.width * 0.5);

        // layout discount panel

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

        // layout item image

        var itemBack = FWUI.getChildByName(item, "itemBack");
        var itemIcon = FWUI.getChildByName(item, "itemIcon");
        itemIcon && itemIcon.removeFromParent();
		
		// fix: duplicate item images
		var children = itemBack.getChildren();
		if(children.length > 0 && children[0].getName() === "itemSpine")
		{
			var itemSpine = children[0];
			itemSpine.removeFromParent();
			itemSpine.fwObject.uninit();
		}
		else
			itemBack.removeAllChildren(); 

        var itemPosition = cc.p(itemBack.width * 0.5, itemBack.height * 0.5);

        var itemGfx = (defineMap[data.ITEM_NAME] !== undefined) ? Game.getItemGfxByDefine(defineMap[data.ITEM_NAME]) : "";
        if (itemGfx.sprite) {

            if (cc.spriteFrameCache.getSpriteFrame(itemGfx.sprite)) {

                //var itemSprite = itemBack.getChildByName("itemSprite");
                //if (itemSprite)
                //    itemSprite.removeFromParent();

                var itemSprite = new cc.Sprite("#" + itemGfx.sprite);
                itemSprite.setPosition(itemPosition);
				itemSprite.setName("itemSprite");
                itemBack.addChild(itemSprite);

                if (itemGfx.scale)
                    itemSprite.setScale(itemGfx.scale);

                if (isLocked)
                    FWUtils.applyGreyscaleNode(itemSprite);
            }
            else {
                cc.log(this.LOGTAG, "updateItem", "Cannot find item sprite:", itemGfx.sprite);
            }
        }
        else if (itemGfx.spine) {

            //var itemSpine = (itemBack.getChildByName("itemSpine") !== null) ? itemBack.getChildByName("itemSpine").fwObject : null;
            //if (!itemSpine)
            //    itemSpine = new FWObject();
			var itemSpine = new FWObject();

            itemSpine.initWithSpine(itemGfx.spine);
            itemSpine.setPosition(itemPosition);
            itemSpine.setParent(itemBack);
			itemSpine.skipVisibilityCheck = true;

            if (itemSpine.node)
                itemSpine.node.setName("itemSpine");

            itemSpine.setScale(itemGfx.scale || 1.0);
            itemSpine.setAnimation(itemGfx.anim || "");
            itemSpine.setSkin(itemGfx.skin || "");
        }

        // layout rewards

        if (haveReward) {

            var rewardAmount = FWUI.getChildByName(item, "rewardAmount");
            var rewardIcon = FWUI.getChildByName(item, "rewardIcon");

            var rewardType = Object.keys(data.GIFT_WHEN_BUY)[0];
            rewardAmount.setString(cc.formatStr("+%s", FWUtils.formatNumberWithCommas(data.GIFT_WHEN_BUY[rewardType])));

            var lastScale = rewardIcon.getScale();
            rewardIcon.loadTexture(FWUtils.getPriceTypeIcon(rewardType), ccui.Widget.PLIST_TEXTURE);
            rewardIcon.setScale(lastScale);
        }

        // layout stats (for special items)

        if (isPotStats)
            this.fillPotStats (item, g_POT[data.ITEM_NAME]);
        
        if (isPlantStats)
            this.fillPlantStats (item, g_PLANT[data.ITEM_NAME]);
		
		// jira#5121
		item.data = data;
    },
    
    fillPotStats: function (item, itemInfo)
    {
        var textDesc = FWUI.getChildByName(item, "textDesc");
        var panelStats = FWUI.getChildByName(item, "panelStats");

        if (!itemInfo)
        {
            textDesc.setVisible(true);
            panelStats.setVisible(false);
            return;
        }

        var itemKeys = ["BUG_APPEAR_RATIO", "EXP_INCREASE", "GOLD_INCREASE", "TIME_DECREASE_DEFAULT"];
        var showStats = false;
        for (var key in itemKeys) {
            if (itemInfo[itemKeys[key]] > 0) {
                showStats = true;
                break;
            }
        }

        textDesc.setVisible(!showStats);
        panelStats.setVisible(showStats);

        if (!showStats)
            return;
        
        FWUI.fillData(panelStats, null, {
            textBug: { type:UITYPE_TEXT, id: cc.formatStr("+%d%", itemInfo.BUG_APPEAR_RATIO), visibie: itemInfo.BUG_APPEAR_RATIO > 0},
            textExp: { type:UITYPE_TEXT, id: cc.formatStr("+%d", itemInfo.EXP_INCREASE), visibie: itemInfo.EXP_INCREASE > 0},
            textTime: { type:UITYPE_TEXT, id: cc.formatStr("-%ds", itemInfo.TIME_DECREASE_DEFAULT), visibie: itemInfo.TIME_DECREASE_DEFAULT > 0},
            iconBug: { visibie: itemInfo.BUG_APPEAR_RATIO > 0},
            iconExp: { visibie: itemInfo.EXP_INCREASE > 0},
            iconTime: { visibie: itemInfo.TIME_DECREASE_DEFAULT > 0},
			
			// jira#5676
            //iconGold: { visibie: itemInfo.GOLD_INCREASE > 0},
            //textGold: { type:UITYPE_TEXT, id: cc.formatStr("+%d", itemInfo.GOLD_INCREASE), visibie: itemInfo.GOLD_INCREASE > 0},
            iconGold: {visible: false},
            textGold: {visible: false},
        });
    },
    
    fillPlantStats: function (item, itemInfo)
    {
        var textDesc = FWUI.getChildByName(item, "textDesc");
        var panelStats = FWUI.getChildByName(item, "plantStats");

        if (!itemInfo)
        {
            textDesc.setVisible(true);
            panelStats.setVisible(false);
            return;
        }

        var itemKeys = ["GROW_TIME", "HARVEST_EXP", "BUG_ID"];
        var showStats = false;
        for (var key in itemKeys) {
            if (itemInfo[itemKeys[key]] > 0) {
                showStats = true;
                break;
            }
        }

        textDesc.setVisible(!showStats);
        panelStats.setVisible(showStats);

        if (!showStats)
            return;
        
        var bug = (itemInfo.BUG_ID ? Game.getItemGfxByDefine(itemInfo.BUG_ID) : undefined);
        var dropBug = (itemInfo.BUG_APPEAR_RATIO > 0 && bug !== undefined);

        FWUI.fillData(panelStats, null, {
            //textTime: { type:UITYPE_TEXT, id: cc.formatStr("%ds", itemInfo.GROW_TIME), visible: itemInfo.GROW_TIME > 0 },
            textTime: { type:UITYPE_TEXT, value: FWUtils.secondsToTimeString(itemInfo.GROW_TIME), visible: itemInfo.GROW_TIME > 0 },
            textExp: { type:UITYPE_TEXT, id: cc.formatStr("%d", itemInfo.HARVEST_EXP), visible: itemInfo.HARVEST_EXP > 0 },
            textBug: { type:UITYPE_TEXT, value: "TXT_IB_SHOP_TAB_PLANT_BUG", visible:dropBug },

            iconTime: { visible: itemInfo.GROW_TIME > 0 },
            iconExp: { visible: itemInfo.HARVEST_EXP > 0 },

            bug: { visible: dropBug },
        });

        if (dropBug)
            FWUI.fillData(panelStats, null, {
                //iconBug: { type: UITYPE_SPINE, value: bug.spine, skin: bug.skin, anim: bug.anim, scale: bug.scale }
                iconBug: { type: UITYPE_IMAGE, value: bug.sprite, scale: 0.35 }
            });
			
		// fix: blinking scrollbar
		var bugListView = FWUI.getChildByName(item, "bug");
		bugListView.setDirection(ccui.ScrollView.DIR_NONE);
    },
	
	// jira#5482
	forceRefreshAll:function()
	{
		for(var key in this.mapTabIndex)
			this.refresh(key, true);
	},

    refresh: function (tabIndex, force) {//web refresh: function (tabIndex, force = false) {
		
		if(force === undefined)
			force = false;

        if (tabIndex < 0 || (!force && this.mapTabIndex[tabIndex].isUpdated))
            return;
		
        var listItems = this.mapTabIndex[tabIndex].tabList;
        if (listItems) {

            // bring sale-off items to top list

            var topIndex = 0;
            var items = [], data = null;
            for (var i = 0; i < g_IBSHOP[tabIndex].ITEMS.length; i++) {

                data = g_IBSHOP[tabIndex].ITEMS[i];
				
				// feedback: remove event items when event is expired
                if(data.USE_IN && (!GameEvent.currentEvent || data.USE_IN !== GameEvent.currentEvent.ID)
                    && (!GameEventTemplate2.getActiveEvent() || g_EVENT_02.E02_ID !== data.USE_IN)
                    && (!GameEventTemplate3.getActiveEvent() || g_EVENT_03.E03_ID !== data.USE_IN))
                    continue;
				
                var isLocked = !gv.userData.isEnoughLevel(data.UNLOCK_LEVEL);

                var currentTime = Game.getGameTimeInSeconds();
                var saleOffPercent = 0;
                if (data.SALE_DURATION) {
                    for (var j = 0; j < data.SALE_DURATION.length; j++) {
                        if (currentTime >= data.SALE_DURATION[j][0] && currentTime <= data.SALE_DURATION[j][1]) {
                            saleOffPercent = data.SALE_OFF_PERCENT;
                            break;
                        }
                    }
                }

                data.saleOffPercent = saleOffPercent;
                data.isLocked = isLocked;

                if (data.saleOffPercent > 0 && !isLocked) {
                    items.splice(topIndex, 0, data);
                    topIndex++;
                }
                else {
                    items.push(data);
                }
            }

            // NOTE: The first item is used for padding, pre-initialized, always exists

            var listItemCollection = listItems.getItems();
            var listItemWidget = null;
            for (var i = 0; i < items.length; i++) {

                if (i + 1 >= listItemCollection.length) {
                    listItemWidget = FWPool.getNode(UI_IB_SHOP_ITEM);
					listItemWidget.setContentSize(cc.size(580, 115));
                    listItems.pushBackCustomItem(listItemWidget);
                }
                else {
                    listItemWidget = listItemCollection[i + 1];
                }

                if (listItemWidget)
                    this.updateItem(listItemWidget, items[i], g_IBSHOP[tabIndex].TAB);
            }

            var listItemCount = listItems.getItems().length;
            while (listItemCount - 1 > items.length) {
                listItems.removeLastItem();
                listItemCount--;
            }
			if(cc.sys.isNative)
			{
				listItems.refreshView();
				//listItems.scrollToTop(0.2, true); // jira#5013
			}
			else
			{
				// jira#7296
				var pos = listItems.getInnerContainer().getPosition();
				listItems.refreshView();
				listItems.getInnerContainer().setPosition(pos);
			}
			
			listItems.setTouchEnabled(!Tutorial.isIBShopStep());
        }

        this.mapTabIndex[tabIndex].isUpdated = true;
    },

    receiveItems: function (items) {
        //BUG HERE: g_IBSHOP don't contains this.activeTab
        if (!g_IBSHOP[this.activeTab])
            return;

        var listItems = g_IBSHOP[this.activeTab].ITEMS;
        var listRefresh = false;
        if (items) {
            var index = 0;
            for (var itemId in items) {

                var itemInfo = gv.ibshop.getItem(itemId);
                if (itemInfo) {

					// jira#5111
                    /*var itemIcon = FWUtils.getItemIcon(itemId, itemInfo.ITEM_QUANTITY, this.buyItemPosition);
                    if (itemIcon) {

                        this.iconStore.setVisible(true);
                        this.iconStore.setOpacity(255);
                        //this.iconStore.setScale(0.2);

                        for (var giftId in itemInfo.GIFT_WHEN_BUY) {
                            var giftAmount = itemInfo.GIFT_WHEN_BUY[giftId];
                            FWUtils.performFlyEffect(FWUtils.getItemIcon(giftId, giftAmount, this.buyItemPosition),
                                this.widget, this.buyItemPosition, Game.getFlyingDestinationPositionForItem(giftId), 0.3, 0.8, index * 0.35);
                        }

                        FWUtils.performFlyEffect(itemIcon, this.widget, this.buyItemPosition, this.iconStore.getPosition(), 0.3, 0.8, index * 0.35, function () {
                            FWUtils.performSpringEffect(this.iconStore, 1, 1.25, 0.2, 0);//FWUtils.performSpringEffect(this.iconStore, 0.2, 0.25, 0.2, 0);
                        }.bind(this));
                    }*/
					
					// jira#5594
					/*var itemList = [{itemId:itemId, amount:itemInfo.ITEM_QUANTITY}];
					for (var giftId in itemInfo.GIFT_WHEN_BUY)
						itemList.push({itemId:giftId, amount:itemInfo.GIFT_WHEN_BUY[giftId]});
					FWUtils.showFlyingItemIcons(itemList, this.buyItemPosition);*/
                }

                if (!listRefresh && listItems.findIndex(function (value) { return value.ITEM_NAME === itemId }) !== -1)
                    listRefresh = true;

                index++;
            }
        }

        if (listRefresh)
            this.refresh(this.activeTab, true);
    },

    show: function (stats, tab, onHide) {//web show: function (stats, tab = -1, onHide = null) {
		
		if(tab === undefined)
			tab = -1;
		if(onHide === undefined)
			onHide = null;
		
		// jira#5013
		if(tab < 0)
		{
			tab = (this.activeTab || 0);
			this.activeTab = -1;
			
			if(tab < 0)
				tab = 0;
		}

        if (!FWUI.isShowing(UI_IB_SHOP_MAIN)) {

            this.widget = FWPool.getNode(UI_IB_SHOP_MAIN, false);
            if (this.widget) {

                this.panelTab = FWUI.getChildByName(this.widget, "panelTab");
                this.panelItem = FWUI.getChildByName(this.widget, "panelItem");

                this.iconStore = FWUI.getChildByName(this.widget, "iconStore");
                this.iconStore.setVisible(false);

                this.textTitle = FWUI.getChildByName(this.widget, "textTitle");

                if (!this.isInitialized) {

					var tabDefines = g_IBSHOP.filter(function(item) {return (item.TAB !== ID_GOLD);});//web var tabDefines = g_IBSHOP.filter(item => item.TAB !== ID_GOLD);
                    for (var i = 0; i < tabDefines.length; i++) {

                        var tabButton = FWPool.getNode(UI_IB_SHOP_TAB, true);
                        this.panelTab.addChild(tabButton);

                        var tabList = (IB_SHOP_USE_SHARED_LIST) ? this.tabList : null;
                        if (tabList === null) {

                            tabList = new ccui.ListView();
                            this.widget.addChild(tabList);

                            tabList.setDirection(ccui.ScrollView.DIR_VERTICAL);
                            tabList.setGravity(ccui.ListView.GRAVITY_LEFT);
                            tabList.setClippingEnabled(true);
							if(tabList.setScrollBarEnabled) //web
								tabList.setScrollBarEnabled(true);
                            tabList.setInertiaScrollEnabled(true);
                            tabList.setBounceEnabled(true);
                            tabList.setItemsMargin(15);

                            tabList.setContentSize(this.panelItem.getContentSize());
                            tabList.setPosition(this.panelItem.getPosition());

                            var itemTop = new ccui.Layout();
                            itemTop.setContentSize(cc.size(tabList.width, 40));
                            itemTop.setTouchEnabled(false);

                            tabList.pushBackCustomItem(itemTop);

                            if (IB_SHOP_USE_SHARED_LIST)
                                this.tabList = tabList;
                        }

                        var tabActive = tabButton.getChildByName("tabActive");
                        var tabInactive = tabButton.getChildByName("tabInactive");
						tabButton.setTouchEnabled(false); // fix: cannot touch on tabs (?)

                        tabActive.setTag(i);
                        tabInactive.setTag(i);

                        this.posTabIconActive = tabButton.getChildByName("markerIconActive").getPosition();
                        this.posTabIconInactive = tabButton.getChildByName("markerIconInactive").getPosition();
                        this.posTabNotifyActive = tabButton.getChildByName("markerNotifyActive").getPosition();
                        this.posTabNotifyInactive = tabButton.getChildByName("markerNotifyInactive").getPosition();

                        FWUI.fillData(tabButton, null, {
                            tabActive: { onTouchEnded: this.onTabButtonTouched.bind(this) },
                            tabInactive: { onTouchEnded: this.onTabButtonTouched.bind(this) },
                            tabIcon: { type: UITYPE_IMAGE, id: this.mapTabData[tabDefines[i].TAB].icon, scale: 0.5 }
                        });

                        var tabNode = {
                            isUpdated: false,
                            tabButton: tabButton,
                            tabList: tabList
                        };

                        this.mapTabIndex[i] = tabNode;
                        this.mapTabName[tabDefines[i].TAB] = tabNode;
                    }

                    this.isInitialized = true;
                }

                FWUI.fillData(this.widget, null, {
                    textTitle: { type: UITYPE_TEXT, style:TEXT_STYLE_TITLE_1, id: "" },//web textTitle: { type: UITYPE_TEXT, shadow: SHADOW_TITLE_BIG, id: "" },
                    container: { onTouchEnded: this.hide.bind(this) }
                });
            }

            var fxParams = {
                fx: UIFX_SLIDE_SMOOTH,
                fromPos: cc.p(cc.winSize.width * 1.5, this.widget.y),
                toPos: cc.p(cc.winSize.width * 0.5, this.widget.y),
                ignoreY: true,
                time: 0.3,
            };

            FWUtils.showDarkBg(null, Z_UI_IBSHOP - 1, "darkBgShop");
			
			// jira#4755
			this.widget.setLocalZOrder(Z_UI_IBSHOP);
			
			// web opt
			if(this.widget.hasShownOnce)
			{
				this.widget.setVisible(true);
				this.widget.setPosition(fxParams.fromPos);
				this.widget.runAction(cc.sequence(cc.moveTo(fxParams.time, fxParams.toPos).easing(cc.easeOut(6.0)), cc.callFunc(function() {this.showStats();}.bind(this))));
			}
			else
			{
				FWUI.setWidgetCascadeOpacity(this.widget, true);
				/*FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), fxParams, true, function () {
					if (stats && !this.stats) {
						this.stats = stats;
						this.stats.lastParent = this.stats.getParent();
						this.stats.lastPosition = this.stats.getPosition();
						this.stats.retain();
						this.stats.removeFromParent(false);
						this.widget.addChild(this.stats);
						this.stats.release();
					}
				}.bind(this));*/
				FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), fxParams, true, this.showStats.bind(this));
				this.widget.hasShownOnce = true;
			}
			
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);

            if (!this.isPreloaded) {
                for (var index in this.mapTabIndex)
				{
					this.refresh(index, true);
					if(!cc.sys.isNative)
						this.mapTabIndex[index].tabList.refreshView(); // scroll to top
				}
                this.isPreloaded = true;
            }

            this.selectTab(tab);
        }

        this.onHide = onHide;
    },

    hide: function () {

		//web opt
        /*if (this.stats) {
            this.stats.retain();
            this.stats.setPosition(this.stats.lastPosition);
            this.stats.removeFromParent(false);
            this.stats.lastParent.addChild(this.stats);
            this.stats.release();
            this.stats = null;
        }*/
		this.hideStats();

        var fxParams = {
            fx: UIFX_SLIDE_SMOOTH,
            fromPos: cc.p(cc.winSize.width * 0.5, this.widget.y),
            toPos: cc.p(cc.winSize.width * 1.5, this.widget.y),
            ignoreY: true,
            time: 0.3
        };

        FWUtils.hideDarkBg(null, "darkBgShop");
		
		//web opt FWUI.hideWidget(this.widget, fxParams);
		this.widget.setPosition(fxParams.fromPos);
		this.widget.runAction(cc.sequence(cc.moveTo(fxParams.time, fxParams.toPos).easing(cc.easeSineIn()), cc.hide()));
		
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);

        if (this.onHide)
            this.onHide ();
        
        this.onHide = null;
    },

	// web opt
	showStats:function()
	{
		if (gv.ibshop.stats && !this.stats) {
			this.stats = gv.ibshop.stats;
			this.stats.lastParent = this.stats.getParent();
			this.stats.lastPosition = this.stats.getPosition();
			this.stats.retain();
			this.stats.removeFromParent(false);
			this.widget.addChild(this.stats);
			this.stats.release();
		}
	},
	
	// web opt
	hideStats:function()
	{
        if (this.stats) {
            this.stats.retain();
            this.stats.setPosition(this.stats.lastPosition);
            this.stats.removeFromParent(false);
            this.stats.lastParent.addChild(this.stats);
            this.stats.release();
            this.stats = null;
        }		
	},

    selectTab: function (tabIndex) {
         cc.log(this.LOGTAG, "selectTab", " - tabIndex:", tabIndex);
		 
		 this.textTitle.setString(this.mapTabData[g_IBSHOP[tabIndex].TAB].name || ""); // jira#7200

        if (this.activeTab === tabIndex)
            return;

        this.activeTab = tabIndex;
        // jira#7200 this.textTitle.setString(this.mapTabData[g_IBSHOP[this.activeTab].TAB].name || "");

        var position = cc.p(this.panelTab.width, this.panelTab.height);
        for (var index in this.mapTabIndex) {
            if (this.mapTabIndex[index]) {

                var isActive = index == this.activeTab;

                var tabButton = this.mapTabIndex[index].tabButton;
                var tabList = this.mapTabIndex[index].tabList;

                var tabActive = tabButton.getChildByName("tabActive");
                var tabInactive = tabButton.getChildByName("tabInactive");

                tabList.setVisible(isActive);

                tabActive.setVisible(isActive);
                tabInactive.setVisible(!isActive);

                var tabIcon = tabButton.getChildByName("tabIcon");
                var tabNotify = tabButton.getChildByName("tabNotify");

                tabIcon.setPosition((isActive) ? this.posTabIconActive : this.posTabIconInactive);
                tabIcon.setOpacity((isActive) ? ICON_TAB_ACTIVE_OPACITY : ICON_TAB_INACTIVE_OPACITY);
                tabIcon.setColor((isActive) ? ICON_TAB_ACTIVE_COLOR : ICON_TAB_INACTIVE_COLOR);
                tabIcon.setScale((isActive) ? ICON_TAB_ACTIVE_SCALE : ICON_TAB_INACTIVE_SCALE);

                tabNotify.setPosition((isActive) ? this.posTabNotifyActive : this.posTabNotifyInactive);
                tabNotify.setVisible(false);

                var tabCurrent = (isActive) ? tabActive : tabInactive;
                position.y -= tabCurrent.height * tabCurrent.getScaleY() - 7;

                tabButton.setLocalZOrder((isActive) ? 2 : 0);
                tabButton.setPosition(cc.p(position.x - tabCurrent.width, position.y));
            }
        }
    },

    onTabButtonTouched: function (sender) {
        cc.log(this.LOGTAG, "onTabButtonTouched");
        this.selectTab(sender.getTag());
    },

    onButtonBuyTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - itemId:", sender.itemId, ", itemAmount:", sender.itemAmount, ", itemLimitDay:", sender.itemLimitDay, ", itemPriceType:", sender.itemPriceType, ", itemPrice:", sender.itemPrice);
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - userCoin:", gv.userData.getCoin(), ", userGold:", gv.userData.getGold(), ", userReputation:", gv.userData.getReputation());
        cc.log(this.LOGTAG, "onButtonBuyTouched", " - ibshopCount: %j", gv.userData.getIBShop());
		
		// feedback: remove event items when event is expired
		if(sender.useIn && (!GameEvent.currentEvent || sender.useIn !== GameEvent.currentEvent.ID)&& (!GameEventTemplate2.getActiveEvent() || sender.useIn !== g_EVENT_02.E02_ID)&& (!GameEventTemplate3.getActiveEvent() || sender.useIn !== g_EVENT_03.E03_ID))
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_END_TITLE"), FWUtils.getWorldPosition(sender));
			return;
		}
		
        if (sender.itemLocked) {
            FWUtils.showWarningText(FWLocalization.text("TXT_IB_SHOP_LEVEL_LOCKED"), FWUtils.getWorldPosition(sender));
        }
        else {
            if (gv.userData.canBuyIBShopItemU(sender.itemId, sender.itemPriceType, sender.itemPrice)) {
                if (gv.userData.isEnoughForPrice(sender.itemPriceType, sender.itemPrice)) {

                    var waitToBuy = false;
                    if (sender.itemPriceType === ID_COIN && sender.itemPrice >= IB_SHOP_BUY_CONFIRM_MIN_PRICE) {

                        this.buyConfirmStartTime = this.buyConfirmStartTime || 0;
                        this.buyConfirmItemId = this.buyConfirmItemId || 0;

                        if (this.buyConfirmItemId !== sender.itemId) {
                            this.buyConfirmItemId = sender.itemId;
                            this.buyConfirmStartTime = 0;
                        }

                        if (Game.getGameTimeInSeconds() >= this.buyConfirmStartTime + IB_SHOP_BUY_CONFIRM_TIME) {

   							// jira#5191
							var worldPosition = FWUtils.getWorldPosition(sender);
                            //var fxParams = {
                            //    position: cc.p(worldPosition.x, worldPosition.y + sender.height * 0.5 + 10),
                            //    hideAfter: IB_SHOP_BUY_CONFIRM_TIME
                            //};
                            //gv.hint.showHintToast(null, FWLocalization.text("TXT_IB_SHOP_BUY_CONFIRM"), fxParams, Z_UI_IBSHOP + 1);
							worldPosition.x -= 50;
							FWUtils.showWarningText(FWLocalization.text("TXT_IB_SHOP_BUY_CONFIRM"), worldPosition);

                            this.buyConfirmStartTime = Game.getGameTimeInSeconds();
                            waitToBuy = true;
                        }
                        else {
                            this.buyConfirmStartTime = 0;
                        }
                    }

                    if (!waitToBuy) {

                        this.buyConfirmStartTime = 0;
                        this.buyItemPosition = FWUtils.getWorldPosition(sender);

                        var success = false;
                        if (sender.itemPriceType === ID_COIN)
                            success = Game.consumeDiamond(sender.itemPrice, this.buyItemPosition);
                        else if (sender.itemPriceType === ID_GOLD)
                            success = Game.consumeGold(sender.itemPrice, this.buyItemPosition);
                        else if (sender.itemPriceType === ID_REPU)
                            success = Game.consumeReputation(sender.itemPrice, this.buyItemPosition);

                        if (success)
						{
							gv.ibshop.buyItem(sender.itemId, sender.itemAmount, sender.itemPriceType, sender.itemPrice);
							
							// jira#5594
							var itemList = [{itemId:sender.itemId, amount:sender.itemAmount}];
							for (var giftId in sender.giftWhenBuy)
								itemList.push({itemId:giftId, amount:sender.giftWhenBuy[giftId]});
							FWUtils.showFlyingItemIcons(itemList, this.buyItemPosition);
						}
                    }
                }
                else {
                    if (sender.itemPriceType === ID_REPU) {
                        FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_REPU_CONTENT"), FWUtils.getWorldPosition(sender));
                    }
                    else if(sender.itemPriceType === ID_GOLD)
                    {
                        Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
                    }
                    else {
                        Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                    }
                }
            }
            else {
                FWUtils.showWarningText(FWLocalization.text("TXT_IB_SHOP_OUT_LIMIT"), FWUtils.getWorldPosition(sender));
            }
        }
    },
	
	// jira#5121
	scrollToItem:function(itemId)
	{
		var list = this.mapTabIndex[this.activeTab].tabList;
		var items = list.getItems();
		var h = 124 + 15; // item height + margin
		var posY = null;
		for(var i=0, y=0; i<items.length; i++)
		{
			var item = items[i];
			if(!item.data)
				continue;
			
			if(item.data.ITEM_NAME === itemId)
			{
				posY = (i - (items.length - 4)) * h;
				break;
			}
		}
		
		// jira#7276
		// scroll to item with the same type if itemId is not found
		if(posY === null)
		{
			var checkItem = defineMap[itemId];
			for(var i=0, y=0; i<items.length; i++)
			{
				var item = items[i];
				if(!item.data)
					continue;
				
				item = defineMap[item.data.ITEM_NAME];
				if(item.TYPE === checkItem.TYPE && item.SUB_TYPE === checkItem.SUB_TYPE)
				{
					posY = (i - (items.length - 4)) * h;
					break;
				}
			}
		}
		
		if(posY !== null)
		{
			if(posY > 0)
				posY = 0;
			if(cc.sys.isNative)
			{
				list.getInnerContainer().setPosition(cc.p(0, posY));
				list.refreshView(); // jira#7195
			}
			else
			{
				var minY = IB_SHOP_SCROLLVIEW_HEIGHT - list.getInnerContainer().getContentSize().height; 
				if(posY < minY)
					posY = minY;
				
				list.refreshView();
				list.getInnerContainer().setPosition(cc.p(0, posY));
			}
		}
	},
});