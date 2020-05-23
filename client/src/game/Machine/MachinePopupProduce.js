
var MachinePopupProduce = cc.Node.extend({
    LOGTAG: "[MachinePopupProduce]",
    cacheProductPage: {},

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function (floorId, machineId) {
        cc.log(this.LOGTAG, "show", "floorId:", floorId, "machineId:", machineId);
		
        this.floorId = floorId;
        this.machineId = machineId;

        var machineDefine = g_MACHINE[machineId];
        var machineData = gv.userData.game[GAME_FLOORS][floorId][FLOOR_MACHINE];

        var machineProductList = machineDefine.PRODUCT_ID;
        var machineProductItems = _.map(machineProductList, function(item) {//web
            return { itemId: item };
        });

        machineProductItems = _.sortBy(machineProductItems, function(item) {//web
            var itemDefine = defineMap[item.itemId];
            item.itemLevel = itemDefine.LEVEL_UNLOCK;
            item.itemLevelText = cc.formatStr(FWLocalization.text("TXT_LV"), itemDefine.LEVEL_UNLOCK);
            return item.itemLevel;
        });

        var levelUnlockMin = 10000;
        for (var i = 0; i < machineProductItems.length; i++) {
            machineProductItems[i].itemLocked = false;
            if (!gv.userData.isEnoughLevel(machineProductItems[i].itemLevel)) {
                machineProductItems[i].itemLocked = true;
                if (machineProductItems[i].itemLevel < levelUnlockMin)
                    levelUnlockMin = machineProductItems[i].itemLevel;
            }
        }

        machineProductItems = machineProductItems.filter(function(item) {//web
            var itemDefine = defineMap[item.itemId];
            return itemDefine && (!itemDefine.LEVEL_UNLOCK || itemDefine.LEVEL_UNLOCK <= levelUnlockMin);
        });

        var machine = gv.userMachine.getMachineById(this.machineId);
        if (machine) {

            var machineLevelIndex = Math.max(machine.level - 1, 0);
            var machineLevelData = machineDefine.LEVELS[machineLevelIndex];

            // layout machine panel

            var nextLevelDefine = machineDefine.LEVELS[machine.level];
            var nextLevelWorkingTime = nextLevelDefine.ACTIVE_TIME;
            var nextLevelUpgradeGold = nextLevelDefine.GOLD_UNLOCK;

            var isUpgradableReady = false;
            this.isUpgradable = machine.level < machineDefine.LEVELS.length && nextLevelWorkingTime > 0 && nextLevelUpgradeGold > 0;
            if (this.isUpgradable) {
                var nextLevelUpgradeCoin = FWUtils.getCoinForGold(nextLevelUpgradeGold);
                var remainTime = nextLevelWorkingTime - machine.workingTime;
				// jira#6371
                //if (remainTime <= 0 && (gv.userData.isEnoughGold(nextLevelUpgradeGold) || gv.userData.isEnoughCoin(nextLevelUpgradeCoin))) {
                if (remainTime <= 0) {
                    isUpgradableReady = true;
                }
            }

            var durability = machineDefine.DURABILITY_INIT + machineLevelIndex * machineDefine.DURABILITY_ADD;
            var repairPrice = (durability - machineData[MACHINE_DURABILITY]) * machineLevelData.GOLD_MAINTAIN;

            // layout producing item

            var producingTime = machine.getProducingTime();
            var producingItem = machine.getProducingItem();

            var isProducing = producingItem !== null && producingTime.duration > 0;
            var isMachineStorageFull = machine.isFullStorage();

            var producingItemSprite = (producingItem) ? Game.getProductSpriteByDefine(producingItem) : "";

            // layout waiting items

            var waitProductItems = machine.producingItems;
            var waitProductSlots = [];

            var unlockList = machineDefine.UNLOCK_REQUIRES_DIAMOND;
            for (var i = 1; i <= machine.slotCount; i++) {

                var productSlot = {
                    itemId: "",
                    haveItem: false,
                    isUnlocked: true,
                    priceUnlock: "0",
                };

                if (i === machine.slotCount) {

                    productSlot.isUnlocked = false;
                    productSlot.priceUnlock = FWUtils.formatNumberWithCommas(unlockList[i]);

                    if (i >= unlockList.length)
                        productSlot.ended = true;
                }
                else if (i < waitProductItems.length) {
                    productSlot.itemId = waitProductItems[i];
                    productSlot.haveItem = true;
                }

                productSlot.haveStatus = productSlot.haveItem && (i === 1);

                if (!productSlot.ended)
                    waitProductSlots.push(productSlot);
            }

            // cc.log(this.LOGTAG, "isProducing:", isProducing);
            // cc.log(this.LOGTAG, "isFullStorage:", isMachineStorageFull);
            //
            // cc.log(this.LOGTAG, "storage: %j", machine.storage);
            // cc.log(this.LOGTAG, "storageLength:", machineDefine.INIT_STORE);
            //
            // cc.log(this.LOGTAG, "slotCount:", machine.slotCount);
            //
            // cc.log(this.LOGTAG, "producingItem:", producingItem);
            // cc.log(this.LOGTAG, "producingItemSprite:", producingItemSprite);
            // cc.log(this.LOGTAG, "producingTime: %j", producingTime);
            //
            // cc.log(this.LOGTAG, "waitProductItems: %j", waitProductItems);
            // cc.log(this.LOGTAG, "waitProductSlots: %j", waitProductSlots);

            var waitProductItemDefine = {
                frame: { visible: "data.isUnlocked === true", dropTag: DRAG_TAG_PRODUCTION_SLOT },
                frameLocked: { visible: "data.isUnlocked === false" },
                itemImage: {
                    type: UITYPE_IMAGE,
                    field: "itemId",
                    visible: "data.haveItem === true",
                    subType: defineTypes.TYPE_PRODUCT,
                    scale: MACHINE_PRODUCE_ITEM_WAIT_SCALE
                },
                textBuy: {
                    visible: "data.isUnlocked === false",
                    type: UITYPE_TEXT,
                    style: TEXT_STYLE_TEXT_NORMAL,
                    id: FWLocalization.text("TXT_BUY_MORE"),
                },
                textWaiting: { type: UITYPE_TEXT, visible: "data.haveStatus === true", id: FWLocalization.text("TXT_MACHINE_PRODUCE_WAIT"), style: TEXT_STYLE_TEXT_NORMAL },
                buttonBuy: {
                    scale9: true,
                    visible: "data.isUnlocked === false",
                    onTouchEnded: this.onButtonMachineBuySlotTouched.bind(this)
                },
                textBuyPrice: { type: UITYPE_TEXT, field: "priceUnlock", style: TEXT_STYLE_NUMBER }
            };

            var productItemDefine = {
                ItemSprite: { type: UITYPE_IMAGE, field: "itemId", subType: defineTypes.TYPE_PRODUCT, scale: MACHINE_PRODUCE_ITEM_SCALE, locked: "data.itemLocked === true", visible: true },
                ItemSpine: { visible: false },
                Amount: { type: UITYPE_TEXT, field: "itemLevelText", style: TEXT_STYLE_NUMBER, visible: "data.itemLocked === true", color: cc.color.GRAY },
                UIItem: {
                    dropOnMove: false,
                    dragTag: DRAG_TAG_PRODUCTION_SLOT,
                    dragCondition: "data.itemLocked === false",
                    onTouchBegan: this.onProductSelected.bind(this),//onHoldBegan: this.onProductSelected.bind(this),
                    onTouchEnded: this.onProductReleased.bind(this),//onHoldEnded: this.onProductReleased.bind(this),
					forceTouchEnd: true,
                    onDrop: this.onProductDropped.bind(this)
                }
            };

            var pagePositionSlotCol = 4;
            var pagePositionSlotRow = 2;
            var pagePositionSlot = [];
            for (var row = 0; row < pagePositionSlotRow; row++)
                for (var col = 0; col < pagePositionSlotCol; col++)
                    pagePositionSlot.push([col, row]);

            var uiDefine = {
                producingItem: { type: UITYPE_IMAGE, id: producingItemSprite, scale: MACHINE_PRODUCE_ITEM_SCALE, visible: isProducing && !isMachineStorageFull },
                panelProductItems: {
                    type: UITYPE_2D_LIST,
                    items: machineProductItems,
                    itemUI: UI_ITEM_NO_BG,
                    itemDef: productItemDefine,
                    itemSize: cc.size(85, 85),
                    itemsPerPage: 5,
                    itemBackground: "#hud/menu_list_slot.png",
                    itemBackgroundScale:0.85,
                    itemsPosition: [[0,0], [1,0], [2,0], [1,1], [2,1]],
                    cancelDragDuration: 0
                },
                panelProduceWaitSlot: {
                    type: UITYPE_2D_LIST,
                    items: waitProductSlots,
                    itemUI: UI_MACHINE_SLOT,
                    itemDef: waitProductItemDefine,
                    itemsPerPage: pagePositionSlotCol * pagePositionSlotRow,
                    itemsPosition: pagePositionSlot,
                    itemSize: cc.size(MACHINE_PRODUCE_SLOT_SIZE + 5, MACHINE_PRODUCE_SLOT_SIZE)
                },
                panelProduceSlot: { dropTag: DRAG_TAG_PRODUCTION_SLOT },
                iconRepairNotify: { visible: repairPrice > 0 },
                iconUpgradeNotify: { visible: isUpgradableReady },
                textProductPage: { type: UITYPE_TEXT, style: TEXT_STYLE_NUMBER, value: "0/0" },
                textSlotPage: { type: UITYPE_TEXT, style: TEXT_STYLE_NUMBER, value: "0/0" },
                textTimeLeft: { type: UITYPE_TEXT, style: TEXT_STYLE_TEXT_NORMAL, visible: isProducing || isMachineStorageFull, value: FWLocalization.text("TXT_MACHINE_STORAGE_FULL") },
                textSkipPrice: { type: UITYPE_TEXT, style: TEXT_STYLE_NUMBER, value: "0" },
                buttonInfo: { visible: true, onTouchEnded: this.onButtonMachineInfoTouched.bind(this) },
                buttonUpgrade: { onTouchEnded: this.onButtonMachineUpgradeTouched.bind(this) },
                buttonSkip: { visible: isProducing, onTouchEnded: this.onButtonMachineProduceSkipTouched.bind(this) },
                buttonProductPagePrev: { visible: true, onTouchEnded: this.onButtonProductPagePrevTouched.bind(this) },
                buttonProductPageNext: { visible: true, onTouchEnded: this.onButtonProductPageNextTouched.bind(this) },
                buttonSlotPage: { visible: true, onTouchEnded: this.onButtonSlotPageSwitchTouched.bind(this) },
                buttonSlotPagePrev: { visible: true, onTouchEnded: this.onButtonSlotPagePrevTouched.bind(this) },
                buttonSlotPageNext: { visible: true, onTouchEnded: this.onButtonSlotPageNextTouched.bind(this) },
				// jira#4833
                prevExtra:{onTouchEnded:this.onButtonProductPagePrevTouched.bind(this)},
                nextExtra:{onTouchEnded:this.onButtonProductPageNextTouched.bind(this)},
                popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            };

            if (!FWUI.isShowing(UI_MACHINE_PRODUCE)) {
                cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateProducing, 0.1, cc.REPEAT_FOREVER, 0, false);
            }

            this.widget = FWPool.getNode(UI_MACHINE_PRODUCE, false);
            if (this.widget) {

                if (!this.machineBody) {

                    // bring machine to this

                    this.machineBody = machine.borrowBody();
                    var worldPosition = this.machineBody.getWorldPosition();

                    var isPanelMachineUpper = worldPosition.y >= cc.winSize.height * 0.5;
                    var panelMachineMarker = FWUI.getChildByName(this.widget, (isPanelMachineUpper) ? "markerMachineUpper" : "markerMachineLower");
                    this.panelMachine = FWUI.getChildByName(this.widget, "panelMachine");
					this.panelMachine.disableOpacityCascade = true;
                    this.panelMachine.setPosition(panelMachineMarker.getPosition());

                    this.machineBody.setPosition(this.panelMachine.convertToNodeSpace(worldPosition));
                    this.machineBody.setParent(this.panelMachine);

                    // bring machine storage, stars to this

                    this.machineStorage = machine.borrowStorage();
                    if (this.machineStorage) {
                        this.machineStorage.setPosition(this.panelMachine.convertToNodeSpace(FWUtils.getWorldPosition(this.machineStorage)));
                        FWUtils.changeParent(this.machineStorage, this.panelMachine);
                    }

                    this.machineStar = machine.borrowStar();
                    if (this.machineStar) {
                        this.machineStar.setPosition(this.panelMachine.convertToNodeSpace(FWUtils.getWorldPosition(this.machineStar)));
                        FWUtils.changeParent(this.machineStar, this.panelMachine);
                    }
                }

                this.panelProduceSlot = FWUI.getChildByName(this.widget, "panelProduceSlot");
                this.panelProductItems = FWUI.getChildByName(this.widget, "panelProductItems");
                this.panelProduceWaitSlot = FWUI.getChildByName(this.widget, "panelProduceWaitSlot");

                this.producingItem = FWUI.getChildByName(this.widget, "producingItem");
                this.buttonSkip = FWUI.getChildByName(this.widget, "buttonSkip");

                this.buttonProductPage = FWUI.getChildByName(this.widget, "buttonProductPage");
                this.buttonProductPagePrev = FWUI.getChildByName(this.widget, "buttonProductPagePrev");
                this.buttonProductPageNext = FWUI.getChildByName(this.widget, "buttonProductPageNext");

                this.buttonSlotPage = FWUI.getChildByName(this.widget, "buttonSlotPage");
                this.buttonSlotPagePrev = FWUI.getChildByName(this.widget, "buttonSlotPagePrev");
                this.buttonSlotPageNext = FWUI.getChildByName(this.widget, "buttonSlotPageNext");

                this.textProductPage = FWUI.getChildByName(this.widget, "textProductPage");
                this.textSlotPage = FWUI.getChildByName(this.widget, "textSlotPage");

                this.textTimeLeft = FWUI.getChildByName(this.widget, "textTimeLeft");
                this.textSkipPrice = FWUI.getChildByName(this.widget, "textSkipPrice");

                this.buttonSlotPage.setZoomScale(0);

                if (!this.producingProgress) {
                    this.producingCover = FWUI.getChildByName(this.widget, "producingCover");
                    if (this.producingCover) {

                        var parent = this.producingCover.getParent();

                        this.producingProgress = new cc.ProgressTimer(new cc.Sprite("#hud/slot_menu_big_full.png"));
                        this.producingProgress.setType(cc.ProgressTimer.TYPE_RADIAL);
                        this.producingProgress.setPosition(this.producingCover.getPosition());
                        this.producingProgress.setVisible(isProducing);
                        this.producingProgress.setLocalZOrder(1);
                        this.producingProgress.setPercentage(0);
                        this.producingProgress.setOpacity(255);
                        this.producingProgress.setScale(-1, 1);

                        this.producingCover.setVisible(false);
                        parent.addChild(this.producingProgress);
                    }
                }

                //if (!this.cover) {
                //    this.cover = new cc.LayerColor(cc.BLACK);
                //    this.widget.addChild(this.cover, -1);
                //}
            }
            else {
                cc.log(this.LOGTAG, "Widget is null");
            }

            FWUI.unfillData(this.widget);
            FWUI.fillData(this.widget, null, uiDefine);
        }

        if (FWUI.isShowing(UI_MACHINE_PRODUCE)) {
			// jira#6472
            //this.updateProductPage();
			if(this.cacheProductPage[this.machineId] !== undefined)
				this.selectProductPage(this.cacheProductPage[this.machineId]);
			
            this.updateSlotPage();
        }
        else {
			// jira#5132
			//this.cover.setOpacity(0);
            //this.cover.runAction(cc.sequence(cc.show(), cc.fadeTo(0.1, 200)));
            //FWUI.setWidgetCascadeOpacity(this.widget, true);
			this.widget.setLocalZOrder(Z_UI_COMMON);
			
			//// jira#6281
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgMachinePopupProduce");
			
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_FADE, true);

            if (this.cacheProductPage[this.machineId] !== undefined)
                this.selectProductPage(this.cacheProductPage[this.machineId]);
            else
                this.selectProductPage(0);
            this.selectSlotPage(0);
            
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }

        this.updateProducing();
		
		this.showAirshipRequireItems();
    },

    hide: function () {

        //if (this.cover)
        //    this.cover.runAction(cc.sequence(cc.fadeOut(0.1), cc.hide()));
	
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateProducing);

        var machine = gv.userMachine.getMachineById(this.machineId);
        if (machine) {

            if (this.machineBody) {
                machine.returnBody(this.machineBody);
                this.machineBody = null;
            }

            if (this.machineStorage) {
                machine.returnNode(this.machineStorage);
                this.machineStorage = null;
            }

            if (this.machineStar) {
                machine.returnNode(this.machineStar);
                this.machineStar = null;
            }

            if (this.producingProgress) {
                this.producingProgress.removeFromParent();
                this.producingProgress = null;
            }
        }

        FWUI.hideWidget(this.widget, UIFX_FADE);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		// jira#6281
		//// jira#5132
		FWUtils.hideDarkBg(null, "darkBgMachinePopupProduce");
		
		this.hideAirshipRequireItems();
    },

    selectProductPage: function (page, offset) {//web selectProductPage: function (page, offset = 0) {

		if(offset === undefined)
			offset = 0;
		
        if (page !== null && page >= 0)
            this.panelProductItems.uiPageText = FWUI.set2dlistPage(this.panelProductItems, page);
        else if (offset !== 0)
            this.panelProductItems.uiPageText = FWUI.set2dlistPage(this.panelProductItems, offset, true);

        this.updateProductPage();
    },

    selectSlotPage: function (page, offset) {//web selectSlotPage: function (page, offset = 0) {
		
		if(offset === undefined)
			offset = 0;

        if (page !== null && page >= 0)
            this.panelProduceWaitSlot.uiPageText = FWUI.set2dlistPage(this.panelProduceWaitSlot, page);
        else if (offset !== 0)
            this.panelProduceWaitSlot.uiPageText = FWUI.set2dlistPage(this.panelProduceWaitSlot, offset, true);

        this.updateSlotPage();
    },

    updateProductPage: function () {

        var pageCount = this.panelProductItems.uiPagesCount;

        this.buttonProductPage.setVisible(pageCount > 1);
        this.buttonProductPagePrev.setVisible(pageCount > 1);
        this.buttonProductPageNext.setVisible(pageCount > 1);
		// jira#4833
        //this.buttonProductPagePrev.setEnabled(pageCount > 1 && this.panelProductItems.uiCurrentPage > 0);
        //this.buttonProductPageNext.setEnabled(pageCount > 1 && this.panelProductItems.uiCurrentPage < pageCount - 1);

        this.textProductPage.setString(this.panelProductItems.uiPageText);

        this.cacheProductPage[this.machineId] = this.panelProductItems.uiCurrentPage;        
    },

    updateSlotPage: function () {

		var pageCount = this.panelProduceWaitSlot.uiPagesCount;

        this.buttonSlotPage.setVisible(pageCount > 1);
        this.buttonSlotPagePrev.setVisible(pageCount > 1);
        this.buttonSlotPageNext.setVisible(pageCount > 1);

        this.buttonSlotPagePrev.setEnabled(pageCount > 1 && this.panelProduceWaitSlot.uiCurrentPage > 0);
        this.buttonSlotPageNext.setEnabled(pageCount > 1 && this.panelProduceWaitSlot.uiCurrentPage < pageCount - 1);

        this.textSlotPage.setString(this.panelProduceWaitSlot.uiPageText);
    },

    updateProducing: function (dt) {
		if(!gv.userMachine)
			return;
		
        var machine = gv.userMachine.getMachineById(this.machineId);
        if (machine) {

            var producingItem = machine.getProducingItem();
            var producingTime = machine.getProducingTime();

            var isProducing = producingItem && producingTime.duration > 0 && producingTime.timeLeft > 0;
            var isMachineStorageFull = machine.isFullStorage();

            if (this.producingItem)
                this.producingItem.setVisible(isProducing && !isMachineStorageFull);

            this.textTimeLeft.setVisible(isProducing || isMachineStorageFull);
            if (isProducing)
                this.textTimeLeft.setString(FWUtils.secondsToTimeString(producingTime.timeLeft));
            else if (isMachineStorageFull)
                this.textTimeLeft.setString(FWLocalization.text("TXT_MACHINE_STORAGE_FULL"));

            this.producingSkipCoin = (producingItem) ? Math.max(Game.getSkipTimeDiamond(producingItem, 0, 0, producingTime.timeEnd).diamond, 0) : 0;
			
			// jira#5925
			if(Tutorial.isRunning())
				this.producingSkipCoin = 0;

            this.textSkipPrice.setString(this.producingSkipCoin === 0 ? FWLocalization.text("TXT_FREE") : FWUtils.formatNumberWithCommas(this.producingSkipCoin));
            this.buttonSkip.setVisible(isProducing && this.producingSkipCoin >= 0);

            var percent = Math.min(Math.max(100 * producingTime.timeLeft / producingTime.duration, 0), 100);
            if (this.producingProgress) {
                this.producingProgress.setVisible(isProducing);
                if (isProducing)
                    this.producingProgress.setPercentage(percent);
            }
        }
    },

    startProduce: function (productId, productItems) {

        var machine = gv.userMachine.getMachineById(this.machineId);
        var position = machine.getWorldPosition();
        if (position)
            Game.consumeItems(productItems, position);

        gv.userMachine.requestProduce(this.machineId, productId);
    },

    onButtonMachineInfoTouched: function (sender) {
		this.hide();
        gv.userMachine.showPopupMachineInfo(this.floorId, this.machineId);
    },

    onButtonMachineUpgradeTouched: function (sender) {
        if (this.isUpgradable) {
			this.hide();
            gv.userMachine.showPopupMachineUpgrade(this.floorId, this.machineId);
        }
        else {
            var pos = FWUtils.getWorldPosition(sender);
            pos.x += 50;
            FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_MAX_LEVEL"), pos);
        }
    },

    onButtonMachineProduceSkipTouched: function (sender) {
        if (this.producingSkipCoin >= 0) {
			// jira#5456
			if(Game.consumeDiamond(this.producingSkipCoin, FWUtils.getWorldPosition(sender)))	{
            //if (gv.userData.isEnoughCoin(this.producingSkipCoin)) {
                gv.userMachine.requestSkipMachineProduceTime(this.machineId, this.producingSkipCoin);
                AudioManager.effect (EFFECT_GOLD_PAYING);
            }
            //else {
            //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
            //}
        }
    },

    onButtonMachineBuySlotTouched: function (sender) {
        var machine = gv.userMachine.getMachineById(this.machineId);
        if (machine) {
            var priceCoin = machine.getNextSlotUnlockPrice();
            if (priceCoin > 0) {
				// jira#5456
				if(Game.consumeDiamond(priceCoin, FWUtils.getWorldPosition(sender)))
                //if (gv.userData.isEnoughCoin(priceCoin)) {
                    gv.userMachine.requestBuyMachineProduceSlot(this.machineId, priceCoin);
                //}
                //else {
                //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                //}
            }
        }
    },



    onButtonProductPagePrevTouched: function (sender) {
        this.selectProductPage(null, -1);
    },

    onButtonProductPageNextTouched: function (sender) {
        this.selectProductPage(null, 1);
    },

    onButtonSlotPageSwitchTouched: function (sender) {
    },

    onButtonSlotPagePrevTouched: function (sender) {
        this.selectSlotPage(null, -1);
    },

    onButtonSlotPageNextTouched: function (sender) {
        this.selectSlotPage(null, 1);
    },

    onButtonCloseTouched: function (sender) {
        this.hide();
    },

    onProductSelected: function (sender) {
        cc.log(this.LOGTAG, "onProductSelected");
        //gv.hint.show(this.widget, HINT_TYPE_PRODUCT_MACHINE, sender.uiData.itemId, { posX: cc.winSize.width * 5.2 / 6, cover: false });
		this.hintItemId = sender.uiData.itemId;
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showHint.bind(this),DELAY_SHOW_HINT, 0, 0, false);
    },

    onProductReleased: function (sender) {
        cc.log(this.LOGTAG, "onProductReleased");
        gv.hintManagerNew.hideHint(HINT_TYPE_PRODUCT_MACHINE);
		this.hintItemId = null;
    },
	
	hintItemId: null,
	showHint:function(sender)
	{
        var position = null;
        if(FWUI.touchedWidget){
            //cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
            position = FWUI.touchedWidget.getTouchBeganPosition();
        }
        //var pos = sender;
        //cc.log("testSender",JSON.stringify(sender));
		if(this.hintItemId)
        {
            //gv.hint.show(this.widget, HINT_TYPE_PRODUCT_MACHINE, this.hintItemId, { posX: cc.winSize.width * 5.2 / 6, cover: false });
            gv.hintManagerNew.show(this.widget, HINT_TYPE_PRODUCT_MACHINE, this.hintItemId,position);
        }

	},

    onProductDropped: function (sender) {
        cc.log(this.LOGTAG, "onProductDropped", " - data: %j", sender.uiData);

        var data = sender.uiData;
        var productId = data.itemId;

        var product = g_PRODUCT[productId];
        var machine = gv.userMachine.getMachineById(this.machineId);
		
		// jira#7213
		if(machine.getProducingItem() !== null && Tutorial.isRunning())
			return false;
		
		var ok = false;

        if (machine && product && gv.userData.isEnoughLevel(product.LEVEL_UNLOCK)) {

            if (machine.durability > 0) {
                if (machine.isFullSlot()) {
                    FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_MSG_SLOT_FULL"), FWUtils.getWorldPosition(sender));
                } else if (machine.willFullStorage()) {
                    FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_MSG_STORAGE_FULL"), FWUtils.getWorldPosition(sender));
                } else {
                    var productItems = Object.keys(product.REQUIRE_ITEM).map(function(itemId) { return { itemId: itemId, amount: product.REQUIRE_ITEM[itemId], requireAmount: product.REQUIRE_ITEM[itemId] } });//web
                    if (gv.userStorages.isItemsAvailable(product.REQUIRE_ITEM)) {
                        var warningItems = {};
                        for (itemId in product.REQUIRE_ITEM) {
                            if (g_PLANT[itemId] !== undefined)
                                warningItems[itemId] = product.REQUIRE_ITEM[itemId];
                        }

                        if (gv.userStorages.willItemExhausted(warningItems)) {
                            var showItems = Object.keys(warningItems).map(function(itemId) { return { itemId: itemId, amount: warningItems[itemId], requireAmount: warningItems[itemId] } });//web
                            Game.showEmtpyStockWarning(showItems, function() {//web
                                this.startProduce(productId, productItems);
                            }.bind(this));
                        } else {
                            this.startProduce(productId, productItems);
							ok = true;
                        }
                    } else {
                        Game.showQuickBuy(productItems, function () {
                            this.startProduce(productId, productItems);
                        }.bind(this));
                    }
                }
            } else {
                FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_MSG_BROKEN"), FWUtils.getWorldPosition(sender));
            }
        }

        gv.hintManagerNew.hideHint(HINT_TYPE_PRODUCT_MACHINE);
		
		if(ok)
		{
			FWUI.hideDraggedWidget(sender);
			return true;
		}
		return false;
    },
	
///////////////////////////////////////////////////////////////////////////////////////
// jira#5536 //////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	airshipRequireItemIndex: 0,
	airshipRequireItemImage: null,
	airshipRequireItems: null,
	airshipNPC: null,
	showAirshipRequireItems:function()
	{
		if(!this.airshipRequireItemImage)
		{
			this.airshipRequireItemImage = FWUtils.getChildByName(this.widget, "airshipRequire");
			this.airshipNPC = FWUtils.getChildByName(this.widget, "airshipNpc");
		}
		
		var status = gv.userData.airship[AS_STATUS];
        var statusTruck = Truck.data[TRUCK_STATUS];
		if(status !== AIRSHIP_STATUS_ACTIVE && status !== AIRSHIP_STATUS_INACTIVE && statusTruck!== TRUCK_STATUS_ACTIVE&& statusTruck!== TRUCK_STATUS_INACTIVE)
		{
			this.airshipNPC.setVisible(false);
			return;
		}
		
		this.airshipRequireItems = [];
		var slots = gv.userData.airship[AS_SLOTS];
        var slotsTruck = Truck.data[TRUCK_BAGS];
        if(status === AIRSHIP_STATUS_ACTIVE || status === AIRSHIP_STATUS_INACTIVE)
        {
            for(var i=0; i<slots.length; i++)
            {
                var itemCheck = {"npcAvatar":NPC_AVATAR_PEOPEO,"item":slots[i][AS_SLOT_ITEM]};
                if(slots[i][AS_SLOT_IS_PACKED] === false && this.airshipRequireItems.indexOf(itemCheck) < 0) {
                    var itemData = {};
                    itemData.npcAvatar = NPC_AVATAR_PEOPEO;
                    itemData.item = slots[i][AS_SLOT_ITEM];
                    this.airshipRequireItems.push(itemData);
                }
            }
        }


        if(statusTruck === TRUCK_STATUS_ACTIVE || statusTruck === TRUCK_STATUS_INACTIVE)
        {
            for(var i=0; i<slotsTruck.length;i++)
            {
                var itemCheck = {"npcAvatar":NPC_AVATAR_FARMER,"item":slotsTruck[i][TRUCK_BAG_ITEM]};
                if(slotsTruck[i][TRUCK_BAG_IS_PACKED] === false && this.airshipRequireItems.indexOf(itemCheck) < 0) {
                    var itemData = {};
                    itemData.npcAvatar = NPC_AVATAR_FARMER;
                    itemData.item = slotsTruck[i][TRUCK_BAG_ITEM];
                    this.airshipRequireItems.push(itemData);
                }
            }
        }

		if(this.airshipRequireItems.length <= 0)
		{
			this.airshipNPC.setVisible(false);
			return;
		}
		
		this.airshipNPC.setVisible(true);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateAirshipRequireItems, 1.5, cc.REPEAT_FOREVER, 0, false);	
		this.updateAirshipRequireItems(0);
	},
	
	hideAirshipRequireItems:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateAirshipRequireItems);
	},
	
	updateAirshipRequireItems:function(dt)
	{
		this.airshipRequireItemIndex++;
		if(this.airshipRequireItemIndex >= this.airshipRequireItems.length)
            this.airshipRequireItemIndex = 0;
            
        var slot = this.airshipRequireItems[this.airshipRequireItemIndex];
        if (slot)
        {
            var sprite = Game.getItemGfxByDefine(slot.item).sprite;
            if(sprite)
                this.airshipRequireItemImage.loadTexture(sprite, ccui.Widget.PLIST_TEXTURE);

            var spriteNpc = slot.npcAvatar;
            if(spriteNpc)
            {
                this.airshipNPC.loadTexture(spriteNpc, ccui.Widget.PLIST_TEXTURE);
            }
        }
	},
	
});