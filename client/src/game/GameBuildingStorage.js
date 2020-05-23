const STORAGE_UI_SCROLL_TIME = 0.3;//0.15;
const STORAGE_UI_SUB_TAB_SCROLL_GAP = 95;
const STORAGE_TAG_SEQUENCE = 1;

const STORAGE_STATUS_LOW = 0;
const STORAGE_STATUS_HIGH = 1;
const STORAGE_STATUS_FULL = 2;
const STORAGE_ALMOST_FULL_NUM = 50;

const STORAGE_TYPE_FARM_PRODUCT = 0;
const STORAGE_TYPE_PRODUCT = 1;
const STORAGE_TYPE_ITEMS = 2;
const STORAGE_TYPE_EVENTS = 3;
const STORAGE_TYPE_MINERALS = 4;

const STORAGE_SUB_TYPE_ALL_ITEMS = 0;
const STORAGE_SUB_TYPE_POT = 1;
const STORAGE_SUB_TYPE_DECOR = 2;
const STORAGE_SUB_TYPE_UPGRADE = 3;
const STORAGE_SUB_TYPE_OTHERS = 4;

var ClassGameBuildingStorage = cc.Layer.extend({

	// add code to select item to sell in private shop
	selectItemToSell: false,
	selectItemCallback: null,
	
	onEnter: function () {
		this._super();
		this.setLocalZOrder(Z_UI_STORAGE);
		this.uiStorage = FWPool.getNode(UI_STORAGE, false);//this.uiStorage = FWLoader.loadWidget(UI_STORAGE);
		//FWLoader.loadWidgetToPool(UI_ITEM, 30);
		FWUI.showWidget(this.uiStorage, this);

		FWUI.registerEvents(this.uiStorage);

		this.scrollX = this.uiStorage.width * 2 / 3;
		this.baseX = this.uiStorage.x - this.scrollX;
		this.uiStorage.x = this.baseX;
		this.isShow = false;

		this.storageCapacityInfo = FWUI.getChildByName(this.uiStorage, "CapacityInfo");
		this.storageName = FWUI.getChildByName(this.uiStorage, "StorageName");
		FWUI.applyTextStyle(this.storageName, TEXT_STYLE_TITLE_2);
		FWUI.applyTextStyle(this.storageCapacityInfo, TEXT_STYLE_NUMBER_GREEN);

		this.upgradePanel = FWUI.getChildByName(this.uiStorage, "UpgradePanel");
		this.upgradeBG = FWUI.getChildByName(this.uiStorage, "UpgradeBG");
		this.upgradeBG.setScale9Enabled(true);

		this.slider = FWUI.getChildByName(this.uiStorage, "CapacitySlider");

		this.buttonFarmProduct = FWUI.getChildByName(this.uiStorage, "TabFarmProduct");
		this.iconFarmProduct = FWUI.getChildByName(this.uiStorage, "ImageFarmProduct");
		this.buttonFarmProduct.addTouchEventListener(this.touchEvent, this);
		this.buttonFarmProduct.setBright(false);
		this.buttonFarmProduct.setLocalZOrder(2);
		this.iconFarmProduct.setScale(0.75);
		this.storageCurrentType = STORAGE_TYPE_FARM_PRODUCT;

		this.buttonProduct = FWUI.getChildByName(this.uiStorage, "TabProduct");
		this.iconProduct = FWUI.getChildByName(this.uiStorage, "ImageProduct");
		this.buttonProduct.addTouchEventListener(this.touchEvent, this);

		this.buttonItems = FWUI.getChildByName(this.uiStorage, "TabItems");
		this.iconItem = FWUI.getChildByName(this.uiStorage, "ImageItems");
		this.buttonItems.addTouchEventListener(this.touchEvent, this);

		this.buttonMinerals = FWUI.getChildByName(this.uiStorage, "TabMinerals");
		this.iconMinerals = FWUI.getChildByName(this.uiStorage, "ImageMinerals");
		this.buttonMinerals.addTouchEventListener(this.touchEvent, this);
		this.buttonMinerals.setVisible(false);

		this.buttonEvents = FWUI.getChildByName(this.uiStorage, "TabEvents");
		this.iconEvents = FWUI.getChildByName(this.uiStorage, "ImageEvents");
		this.buttonEvents.addTouchEventListener(this.touchEvent, this);
		this.buttonEvents.setVisible(false);

		this.buttonCloseUI = FWUI.getChildByName(this.uiStorage, "ButtonCloseUI");
		this.buttonCloseUI.addTouchEventListener(this.touchEvent, this);

		this.subTabPanel = FWUI.getChildByName(this.uiStorage, "SubTabsPanel");
		this.isSubTabPanelShow = false;

		this.storageCurrentSubType = STORAGE_SUB_TYPE_ALL_ITEMS;

		this.buttonSubTabPot = FWUI.getChildByName(this.uiStorage, "ButtonPot");
		this.buttonSubTabPot.addTouchEventListener(this.touchEvent, this);

		this.buttonSubTabDecor = FWUI.getChildByName(this.uiStorage, "ButtonDecor");
		this.buttonSubTabDecor.addTouchEventListener(this.touchEvent, this);

		this.buttonSubTabUpgrade = FWUI.getChildByName(this.uiStorage, "ButtonUpgrade");
		this.buttonSubTabUpgrade.addTouchEventListener(this.touchEvent, this);

		this.buttonSubTabOthers = FWUI.getChildByName(this.uiStorage, "ButtonOthers");
		this.buttonSubTabOthers.addTouchEventListener(this.touchEvent, this);

		this.currentTabButton = this.buttonFarmProduct;
		this.currentSubTabButton = this.buttonSubTabPot;

		this.itemsScrollView = FWUI.getChildByName(this.uiStorage, "ContainerItems");
		
        this.mapStorageButton = {};
        this.mapStorageButton[STORAGE_TYPE_FARM_PRODUCT] = this.buttonFarmProduct;
        this.mapStorageButton[STORAGE_TYPE_PRODUCT] = this.buttonProduct;
        this.mapStorageButton[STORAGE_TYPE_ITEMS] = this.buttonItems;
        this.mapStorageButton[STORAGE_TYPE_MINERALS] = this.buttonMinerals;

		// fix: show upgrade items
		/*this.upgradeRequireItem = [];
		this.upgradeRequireItem[0] = FWUI.getChildByName(this.uiStorage, "RequireItem1");
		this.upgradeRequireItem[1] = FWUI.getChildByName(this.uiStorage, "RequireItem2");
		this.upgradeRequireItem[2] = FWUI.getChildByName(this.uiStorage, "RequireItem3");*/

		// Hard code set special item to upgrade type
		this.upgradeItemList = {};
		this.upgradeItemList[g_MATERIAL.M0.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M1.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M2.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M3.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M4.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M5.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M6.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M7.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M8.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M9.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M10.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M11.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M14.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M15.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M16.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M17.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M18.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M19.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M24.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M25.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M26.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M27.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M28.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M29.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M30.ID] = 1;
		this.upgradeItemList[g_MATERIAL.M31.ID] = 1;

		this.buyAllMissingItemPrice = FWUI.getChildByName(this.uiStorage, "Price");
		this.buyAllMissingCoinAmount = 0;
		this.upgradeToText = FWUI.getChildByName(this.uiStorage, "UpgradeToText");

		this.uiStorage.setVisible(false);
		this.isInited = true;
		this.refreshNotification();
	},

	showSubTabPanel: function (show) {
		if (this.isSubTabPanelShow !== show) {
			if (show) {
				this.updateSubStorageUIInfo();
			}
			var move = cc.moveBy(STORAGE_UI_SCROLL_TIME, cc.p(0, show ? STORAGE_UI_SUB_TAB_SCROLL_GAP : -STORAGE_UI_SUB_TAB_SCROLL_GAP)).easing(cc.easeOut(2.0));
			var scrollSequence = cc.sequence(move);
			this.subTabPanel.runAction(scrollSequence);
			this.isSubTabPanelShow = show;
		}
	},
	showStorageUI: function (show, selectItemToSell, selectItemCallback, zOrder, filterTypes, filterItems, isTom) {//web showStorageUI: function (show, selectItemToSell = false, selectItemCallback = null, zOrder = Z_UI_STORAGE, filterTypes = null, filterItems = null, isTom = false) {
		
		if(selectItemToSell === undefined)
			selectItemToSell = false;
		if(selectItemCallback === undefined)
			selectItemCallback = null;
		if(zOrder === undefined)
			zOrder = Z_UI_STORAGE;
		if(filterTypes === undefined)
			filterTypes = null;
		if(filterItems === undefined)
			filterItems = null;
		if(isTom === undefined)
			isTom = false;
		
		this.isTom = isTom;
		this.filterItems = filterItems;
		this.selectItemToSell = selectItemToSell;
		this.selectItemCallback = selectItemCallback;
		this.setLocalZOrder(zOrder);
		this.buttonCloseUI.setTouchEnabled(selectItemToSell === false);
		if (this.isShow !== show) {
			if (show) {
				this.uiStorage.setVisible(true);
				this.updateStorageUIInfo();
			}
			
			// feedback
			//var move = cc.moveBy(STORAGE_UI_SCROLL_TIME, cc.p(show ? this.scrollX : -this.scrollX, 0)).easing(cc.easeOut(2.0));
			var move = cc.moveBy(STORAGE_UI_SCROLL_TIME, cc.p(show ? this.scrollX : -this.scrollX, 0));
			if(show)
				move = move.easing(cc.easeOut(6.0));
			else
				move = move.easing(cc.easeSineIn());
			
			var scrollSequence;
			if (show) {
				scrollSequence = cc.sequence(move);
			} else {
				var callFunction =  cc.callFunc(function () {
					this.uiStorage.setVisible(false);
				}.bind(this));
				scrollSequence = cc.sequence(move, callFunction);
			}
			scrollSequence.setTag(STORAGE_TAG_SEQUENCE);
			this.uiStorage.stopAllActions();
			this.uiStorage.setPositionX(show ? this.baseX : this.baseX + this.scrollX);
			this.uiStorage.runAction(scrollSequence);
			this.isShow = show;
		}

        var listTypes = [
            {
            	button: this.buttonFarmProduct,
				icon: this.iconFarmProduct
			},
            {
                button: this.buttonProduct,
                icon: this.iconProduct
            },
            {
                button: this.buttonItems,
                icon: this.iconItem
            },
            {
               button: this.buttonEvents,
               icon: this.iconEvents
            },
            {
                button: this.buttonMinerals,
                icon: this.iconMinerals
            }
		];
		
        listTypes.forEach(function(item) {//web
            item.button.setVisible(false);
            item.icon.setVisible(false);
		});
		
        //var showTypes = (filterTypes && filterTypes.length > 0) ? filterTypes : [STORAGE_TYPE_FARM_PRODUCT, STORAGE_TYPE_PRODUCT, STORAGE_TYPE_ITEMS, STORAGE_TYPE_MINERALS];
		//var event = GameEvent.getActiveEvent();
		//if(event)
		//	showTypes.push(STORAGE_TYPE_EVENTS);
		var showTypes;
		if(filterTypes && filterTypes.length > 0)
			showTypes = filterTypes;
		else
		{
			showTypes = [STORAGE_TYPE_FARM_PRODUCT, STORAGE_TYPE_PRODUCT, STORAGE_TYPE_ITEMS, STORAGE_TYPE_MINERALS];
			var event = GameEvent.getActiveEvent();
			var event2 = GameEventTemplate2.getActiveEvent();
			var event3 = GameEventTemplate3.getActiveEvent();
			if(event && !selectItemToSell || event2 || event3 || g_MISCINFO.FISHING_ACTIVE)
				showTypes.push(STORAGE_TYPE_EVENTS);


			//if(event2 )
			//	showTypes.push(STORAGE_TYPE_EVENTS);
		}
		
        showTypes.forEach(function(type) {//web
            listTypes[type].button.setVisible(true);
            listTypes[type].icon.setVisible(true);
		});

        var storageButton = this.mapStorageButton[this.storageCurrentType];
        if (storageButton) {
            this.touchEvent(storageButton, ccui.Widget.TOUCH_ENDED);
		}
		
		if (show)
			AudioManager.effect (EFFECT_POPUP_SHOW);
		else
			AudioManager.effect (EFFECT_POPUP_CLOSE);
		
		// fix: sub tab is not refreshed when reopening stock
		if(this.storageCurrentType === STORAGE_TYPE_ITEMS)
			this.updateSubStorageUIInfo();
		
		if(!selectItemToSell && !isTom)
		{
			if(!this.hideFunc)
				this.hideFunc = function() {this.showStorageUI(false);}.bind(this);
			if(show)
				Game.gameScene.registerBackKey(this.hideFunc);
			else
				Game.gameScene.unregisterBackKey(this.hideFunc);
		}
		
		if(show)
		{
			if(!this.listTypes)
				this.listTypes = listTypes;
			this.highlightTabButtons();
		}
		
		// feedback
		if(!selectItemToSell)
		{
			if(show)
				FWUtils.showDarkBg(null, zOrder - 1, "darkBgStorage");
			else
				FWUtils.hideDarkBg(null, "darkBgStorage");
		}
	},
	
	showStorageUIWithType:function(show, type, upgrade, zOrder)//web showStorageUIWithType:function(show, type, upgrade = false, zOrder = Z_UI_STORAGE)
	{
		if(upgrade === undefined)
			upgrade = false;
		if(zOrder === undefined)
			zOrder = Z_UI_STORAGE;
		
		// fix: incorrect tab button highlighted
		//this.storageCurrentType = type;
		//this.showStorageUI(show);
		
		this.showStorageUI(show, false, null, zOrder);
		this.changeStorageType(this.mapStorageButton[type], type);
	},

	onCompleteEaseOut: function () {

	},

	updateStorageUIInfo: function () {
		if (this.isInited) {
			this.storageName.string = FWLocalization.text("TXT_STORAGE_NAME_" + this.storageCurrentType);
            
			var storage = gv.userStorages.getStorage(this.storageCurrentType);
			cc.log("updateStorageUIInfo", "storageCurrentType:", this.storageCurrentType, "storage", storage);
			if (storage) {				
				var storageStatus = storage.getStorageStatus();
				// jira#5553
				//if (storageStatus === STORAGE_STATUS_LOW)
				//	this.storageCapacityInfo.color = cc.GREEN;
				//else if (storageStatus === STORAGE_STATUS_HIGH)
				//	this.storageCapacityInfo.color = cc.YELLOW;
				//else
				//	this.storageCapacityInfo.color = cc.RED;
				this.storageCapacityInfo.color = cc.GREEN;

				if(this.storageCurrentType === STORAGE_TYPE_EVENTS)
				{
					this.slider.setVisible(false);
					this.storageCapacityInfo.setVisible(false);
				}
				else
				{
					this.storageCapacityInfo.setVisible(true);
					this.storageCapacityInfo.string = storage.capacityCurrent + "/" + storage.capacityMax;
					
					this.slider.setVisible(true);
					var progress = 100 * storage.capacityCurrent / storage.capacityMax;
					this.slider.setPercent(progress);
				}
				if (storage.nextLevelStock && this.selectItemToSell === false) {
					var list = _.pairs(storage.getUpgradeRequireItems());
					var totalMissingDiamond = 0;

					// fix: show upgrade items
					/*for (var i = 0, size = list.length; i < size; i++) {
						var pair = list[i];
						var key = pair[0];
						var val = pair[1];
						var itemConst = defineMap[key];
						if (itemConst) {
							var itemDef = {
								//ItemImage: {type: UITYPE_SPINE, id: Game.getPlantSpineByDefine("T0"), scale:0.18, anim:"plant_mature"},
								//ItemImage: {type: UITYPE_IMAGE, field: "image"},
								gfx:{type:UITYPE_ITEM, field:"itemId"},
								Have: {type: UITYPE_TEXT, field: "have", color: "data.colorHave"},
								Require: {type: UITYPE_TEXT, field: "require", color: "data.colorRequire"}
							};

							var amount = gv.userStorages.getItemAmount(key);
							var require = val;
							var missing = require - amount;
							if (missing > 0) {
								var itemBuyPrice = itemConst.DIAMOND_BUY;
								totalMissingDiamond += itemBuyPrice * missing;
							}

							var data = {
								itemId:key,
								have: amount,
								require: "/" + require,
								image: itemConst.GFX,
								colorHave: amount >= require ? cc.GREEN : cc.RED,
								colorRequire: amount >= require ? cc.GREEN : cc.WHITE
							};

							FWUI.fillData(this.upgradeRequireItem[i], data, itemDef);
						}
					}
					this.upgradeToText.string = FWLocalization.text("UP TO <num> ").replace("<num>", storage.getNextLevelCapacity());
					this.buyAllMissingCoinAmount = totalMissingDiamond;
					this.buyAllMissingItemPrice.string = totalMissingDiamond;
					*/

					this.upgradePanel.setVisible(true);
					this.itemsScrollView._setHeight(400);
					this.itemsScrollView._setInnerHeight(400);

					var requireItems = [];
					for (var i = 0; i < list.length; i++)
					{
						var pair = list[i];
						var itemId = pair[0];
						var require = pair[1];
						var currentAmount = gv.userStorages.getItemAmount(itemId);
						requireItems.push({itemId:itemId, currentAmount:currentAmount, requireAmount:require, displayAmount:"/" + require, isEnough:currentAmount >= require});
					}
					var missingItems = Game.getMissingItemsAndPrices(requireItems);
					var requireItemDef = 
					{
						check:{visible:"data.isEnough === true"},
						requireAmount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, color:"cc.GREEN", visible:true},
						stockAmount:{type:UITYPE_TEXT, field:"currentAmount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED", visible:true},
						gfx:{type:UITYPE_ITEM, field:"itemId"},
						buyButton:{visible:"false"},
						bg:{onTouchBegan:this.showUpgradeItemHint.bind(this), onTouchEnded:this.hideUpgradeItemHint.bind(this)}, // jira#5312
						amount:{visible:false},
					};
					var uiDef =
					{
						RequireItems:{type:UITYPE_2D_LIST, items:requireItems, itemUI:UI_MINING_REQUIRE_ITEM, itemDef:requireItemDef, itemSize:cc.size(90, 90)},
						UpgradeToText:{type:UITYPE_TEXT, value:storage.getNextLevelCapacity(), format:"TXT_STORAGE_UPGRADE_CAPACITY", style:TEXT_STYLE_TEXT_DIALOG},
						upgradeText:{type:UITYPE_TEXT, value:"TXT_UPGRADE", style:TEXT_STYLE_TEXT_BUTTON, visible:missingItems.missingItems.length <= 0},
						Price:{type:UITYPE_TEXT, value:missingItems.totalPrice, style:TEXT_STYLE_TEXT_BUTTON, visible:missingItems.missingItems.length > 0, color:missingItems.totalPrice > gv.userData.getCoin() ? COLOR_NOT_ENOUGH_DIAMOND : cc.WHITE},
						PriceType:{visible:missingItems.missingItems.length > 0},
					};
					FWUI.fillData(this.upgradePanel, null, uiDef);
					this.buyAllMissingCoinAmount = missingItems.totalPrice;
				} else {					
					this.upgradePanel.setVisible(false);
					this.itemsScrollView._setHeight(500);
					this.itemsScrollView._setInnerHeight(500);
				}
				this.updateStorageShowItemsByTypeList(storage.stockItemTypes, this.filterItems, this.isTom);
			}
		}
	},

	showItemList: function (list) {
		var itemDef = {
			//ItemImage: {type: UITYPE_SPINE, id: Game.getPlantSpineByDefine("T0"), scale:0.18, anim:"plant_mature"},
			//ItemImage: {type: UITYPE_IMAGE, field: "itemGFX"},
			gfx:{type:UITYPE_ITEM, field: "itemId"},
			Amount: {type: UITYPE_TEXT, field: "itemAmount", format: "x%s"},
			//Have: {type: UITYPE_TEXT, field: "itemAmount", visible: "false"},
			//Require: {type: UITYPE_TEXT, field: "itemAmount", visible: "false"},
			UIItem: {onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},//UIItemContainer: {forceTouchEnd:true},
		};
		cc.log("showItemList1",JSON.stringify(list));
		var list2 = _.clone(list);
		var indexItemEvent3 = list2.findIndex(function(item) {return item.itemId === g_EVENT_03.E03_POINT;});
		if(indexItemEvent3>-1)
		{
			var item = _.clone(list[indexItemEvent3]);
			item.itemAmount = Math.floor(item.itemAmount / 100);
			list2[indexItemEvent3] = item;
		}
		cc.log("showItemList2",JSON.stringify(list2),indexItemEvent3);

		var uiDef =
		{
			ContainerItems: {
				type: UITYPE_2D_LIST,
				items: list2,
				itemUI: UI_ITEM,
				itemDef: itemDef,
				itemSize: cc.size(125, 115),
			},
		};
		
		// ?
		//var itemInfoList = [];
		//for (var i = 0, size = list.length; i < size; i++) {
		//	var item = list[i];
		//	itemInfoList[i] = item.itemId;
		//}

		FWUI.fillData(this.itemsScrollView, null, uiDef);
	},
	showItemHint:function(sender)
	{
		if(!this.isTom && !this.selectItemToSell)
		{
			var position = null;

			position = FWUtils.getWorldPosition(sender);
			//if(FWUI.touchedWidget){
			//	//cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
			//	position = FWUI.touchedWidget.getTouchBeganPosition();
			//}
			var itemInfo = defineMap[sender.uiData.itemId];
			var isPOSM = itemInfo.SUB_TYPE === defineTypes.SUB_TYPE_POSM;

			if(isPOSM){
				AccumulateStore.request_InfoUser_show(itemInfo);
				return;
			}
			gv.hintManagerNew.show(this, null, sender.uiData.itemId,position);
		}


	},
	hideItemHint:function(sender)
	{
		if(!this.isTom && !this.selectItemToSell)
		{
			var itemInfo = defineMap[sender.uiData.itemId];
			var isPOSM = itemInfo.SUB_TYPE === defineTypes.SUB_TYPE_POSM;

			if(isPOSM){
				return;
			}
			gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
		}
		else
		{
			gv.gameBuildingStorageInterface.selectItemCallback(sender);
		}
	},
	sortListItemAmountDecent: function (list) {
		var sortedList = [];
		sortedList = _.sortByDecent(list, 'itemAmount');
		return sortedList;
	},

	sortListItemAmount: function (list) {
		var sortedList = [];
		sortedList = _.sortBy(list, 'itemAmount');
		return sortedList;
	},

	isUpgradeItem: function (item) {
		var itemConst = defineMap[item.itemId];
		if (itemConst) {
			return gv.gameBuildingStorageInterface.upgradeItemList[itemConst.ID] === 1;
		} else {
			return false;
		}
	},

	isOtherItem: function (item) {
		var itemConst = defineMap[item.itemId];
		if (itemConst) {
			return gv.gameBuildingStorageInterface.upgradeItemList[itemConst.ID] !== 1;
		} else {
			return false;
		}
	},

	updateStorageOthers: function (isUpgradeItemOnly) {
		var list = gv.userStorages.getAllItemOfTypes([defineTypes.TYPE_MATERIAL, defineTypes.TYPE_SKIN,defineTypes.TYPE_HOOK]);
		var filterList = _.filter(list, isUpgradeItemOnly ? this.isUpgradeItem : this.isOtherItem);
		var listReturnItems = this.sortListItemAmountDecent(filterList);
		this.showItemList(listReturnItems);
	},

	updateStorageShowItemsByTypeList: function (itemTypes, filterItems, isTom) {//web updateStorageShowItemsByTypeList: function (itemTypes, filterItems = null, isTom = false) {
		
		if(filterItems === undefined)
			filterItems = null;
		if(isTom === undefined)
			isTom = false;
		
		var list = gv.userStorages.getAllItemOfTypes(itemTypes, filterItems, isTom);
		var listReturnItems = list;

		if(this.storageCurrentType !== STORAGE_TYPE_EVENTS){
			listReturnItems = isTom ? this.sortListItemAmount(list) : this.sortListItemAmountDecent(list);
		}
		// jira#5807
		if(this.selectItemToSell && itemTypes.length === 1 && itemTypes[0] === defineTypes.TYPE_PLANT && (GameEvent.getActiveEvent() !== null || GameEventTemplate2.getActiveEvent() !==  null))
		{
			FWUtils.removeArrayElementByKeyValue(listReturnItems, "itemId", g_MISCINFO.EV01_PLANT);
			FWUtils.removeArrayElementByKeyValue(listReturnItems, "itemId", g_MISCINFO.EV02_PLANT);
		}


		
		this.showItemList(listReturnItems);
	},

	updateStorageShowItemsByItemList: function (itemsList) {
		var listReturnItems = this.sortListItemAmountDecent(gv.userStorages.getAllItemFromItemList(itemsList));
		this.showItemList(listReturnItems);
	},

	updateStorageShowItemsSpecial: function () {
	},

	updateSubStorageUIInfo: function () {
		if (this.storageCurrentSubType === STORAGE_SUB_TYPE_POT) {
			this.updateStorageShowItemsByTypeList([defineTypes.TYPE_POT]);
		}
		else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_DECOR) {
			this.updateStorageShowItemsByTypeList([defineTypes.TYPE_DECOR]);
		}
		else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_UPGRADE) {
			this.updateStorageOthers(true);
		}
		else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_OTHERS) {
			this.updateStorageOthers(false);
		} else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_ALL_ITEMS) {
			this.updateStorageShowItemsByTypeList([defineTypes.TYPE_POT, defineTypes.TYPE_DECOR, defineTypes.TYPE_MATERIAL, defineTypes.TYPE_SKIN, defineTypes.TYPE_HOOK]);
		}
		this.itemsScrollView.jumpToTop();
	},

	onClickChangeSubTab: function (sender) {
		if (sender !== this.currentSubTabButton) {
			sender.setBright(false);
			if (this.currentSubTabButton) {
				this.currentSubTabButton.setBright(true);
			}
			this.currentSubTabButton = sender;
		} else {
			sender.setBright(!sender.isBright());
		}

		this.updateSubStorageUIInfo();
		AudioManager.effect (EFFECT_POPUP_SHOW);
	},

	onClickChangeTab: function (sender, showSubTab) {
		sender.setBright(false);
		if (this.currentTabButton) {
			this.currentTabButton.setBright(true);
		}
		this.currentTabButton = sender;
		this.updateStorageUIInfo();
		this.showSubTabPanel(showSubTab);
		this.itemsScrollView.scrollToTop(0.1, false);//this.itemsScrollView.jumpToTop();
		AudioManager.effect (EFFECT_POPUP_SHOW);
		this.highlightTabButtons();
	},

	changeStorageType: function (sender, nextType) {
		var normalScale = 0.65;
		var selectedScale = 0.75;
		if (this.storageCurrentType !== nextType && sender.isBright()) {
			this.storageCurrentType = gv.storageCurrentType = nextType;
			this.onClickChangeTab(sender, this.storageCurrentType === STORAGE_TYPE_ITEMS);

			if (this.storageCurrentType == STORAGE_TYPE_FARM_PRODUCT) {
				this.iconFarmProduct.scale = selectedScale;
				this.iconProduct.scale = normalScale;
				this.iconEvents.scale = normalScale;
				this.iconMinerals.scale = normalScale;
				this.iconItem.scale = normalScale;
				this.buttonFarmProduct.setLocalZOrder(2);
				this.buttonProduct.setLocalZOrder(1);
				this.buttonItems.setLocalZOrder(1);
				this.buttonMinerals.setLocalZOrder(1);
				this.buttonEvents.setLocalZOrder(1);
			} else if (this.storageCurrentType == STORAGE_TYPE_PRODUCT) {
				this.iconFarmProduct.scale = normalScale;
				this.iconProduct.scale = selectedScale;
				this.iconEvents.scale = normalScale;
				this.iconMinerals.scale = normalScale;
				this.iconItem.scale = normalScale;
				this.buttonFarmProduct.setLocalZOrder(1);
				this.buttonProduct.setLocalZOrder(2);
				this.buttonItems.setLocalZOrder(1);
				this.buttonMinerals.setLocalZOrder(1);
				this.buttonEvents.setLocalZOrder(1);
			} else if (this.storageCurrentType == STORAGE_TYPE_EVENTS) {
				this.iconFarmProduct.scale = normalScale;
				this.iconProduct.scale = normalScale;
				this.iconEvents.scale = selectedScale;
				this.iconMinerals.scale = normalScale;
				this.iconItem.scale = normalScale;
				this.buttonFarmProduct.setLocalZOrder(1);
				this.buttonProduct.setLocalZOrder(1);
				this.buttonItems.setLocalZOrder(1);
				this.buttonMinerals.setLocalZOrder(1);
				this.buttonEvents.setLocalZOrder(2);
			} else if (this.storageCurrentType == STORAGE_TYPE_MINERALS) {
				this.iconFarmProduct.scale = normalScale;
				this.iconProduct.scale = normalScale;
				this.iconEvents.scale = normalScale;
				this.iconMinerals.scale = selectedScale;
				this.iconItem.scale = normalScale;
				this.buttonFarmProduct.setLocalZOrder(1);
				this.buttonProduct.setLocalZOrder(1);
				this.buttonItems.setLocalZOrder(1);
				this.buttonMinerals.setLocalZOrder(2);
				this.buttonEvents.setLocalZOrder(1);
			} else {
				this.iconFarmProduct.scale = normalScale;
				this.iconProduct.scale = normalScale;
				this.iconEvents.scale = normalScale;
				this.iconMinerals.scale = normalScale;
				this.iconItem.scale = selectedScale;
				this.buttonFarmProduct.setLocalZOrder(1);
				this.buttonProduct.setLocalZOrder(1);
				this.buttonItems.setLocalZOrder(2);
				this.buttonMinerals.setLocalZOrder(1);
				this.buttonEvents.setLocalZOrder(1);
			}
		}
	},

	touchEvent: function (sender, type) {
		cc.log("type:" + type + " name:" + sender.name);
		switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
				break;

			case ccui.Widget.TOUCH_MOVED:
				break;

			case ccui.Widget.TOUCH_ENDED:
				switch (sender.name) {
					case "TabFarmProduct":
						this.changeStorageType(sender, STORAGE_TYPE_FARM_PRODUCT);
						break;
					case "TabProduct":
						this.changeStorageType(sender, STORAGE_TYPE_PRODUCT);
						break;
					case "TabItems":
						this.changeStorageType(sender, STORAGE_TYPE_ITEMS);
						break;
					case "TabEvents":
						this.changeStorageType(sender, STORAGE_TYPE_EVENTS);
						break;
					case "TabMinerals":
						this.changeStorageType(sender, STORAGE_TYPE_MINERALS);
						break;
					case "ButtonPot":
						if (this.storageCurrentSubType !== STORAGE_SUB_TYPE_POT) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_POT;
							this.onClickChangeSubTab(sender);
						} else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_POT) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_ALL_ITEMS;
							this.onClickChangeSubTab(sender);
						}
						break;
					case "ButtonDecor":
						if (this.storageCurrentSubType !== STORAGE_SUB_TYPE_DECOR && sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_DECOR;
							this.onClickChangeSubTab(sender);
						} else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_DECOR && !sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_ALL_ITEMS;
							this.onClickChangeSubTab(sender);
						}
						break;
					case "ButtonUpgrade":
						if (this.storageCurrentSubType !== STORAGE_SUB_TYPE_UPGRADE && sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_UPGRADE;
							this.onClickChangeSubTab(sender);
						} else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_UPGRADE && !sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_ALL_ITEMS;
							this.onClickChangeSubTab(sender);
						}
						break;
					case "ButtonOthers":
						if (this.storageCurrentSubType !== STORAGE_SUB_TYPE_OTHERS && sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_OTHERS;
							this.onClickChangeSubTab(sender);
						} else if (this.storageCurrentSubType === STORAGE_SUB_TYPE_OTHERS && !sender.isBright()) {
							this.storageCurrentSubType = STORAGE_SUB_TYPE_ALL_ITEMS;
							this.onClickChangeSubTab(sender);
						}
						break;
					case "ButtonCloseUI":
						this.showStorageUI(false);
						gv.hintManagerNew.hideAllHint();
						break;
				}
				break;

			case ccui.Widget.TOUCH_CANCELED:
				break;

			default:
				break;
		}
	},
	
	upgradeableTab: null,
	refreshNotification:function()
	{
		if(Game.isFriendGarden() || !Game.gameScene || !Game.gameScene.background.notifyStorage)
			return;
		
		var upgradeableTabs = [STORAGE_TYPE_FARM_PRODUCT, STORAGE_TYPE_PRODUCT, STORAGE_TYPE_ITEMS, STORAGE_TYPE_MINERALS];
		this.upgradeableTab = null;
		
		for(var i=0; i<upgradeableTabs.length; i++)
		{
			var storage = gv.userStorages.getStorage(upgradeableTabs[i]);	
			var upgradeItems = FWUtils.getItemsArray(storage.getUpgradeRequireItems());
			if(upgradeItems.length <= 0)
				continue; // jira#5579
			var missingItems = Game.getMissingItemsAndPrices(upgradeItems);
			if(missingItems.missingItems.length <= 0)
			{
				this.upgradeableTab = upgradeableTabs[i];
				break;
			}
		}

		Game.gameScene.background.notifyStorage.setVisible(this.upgradeableTab !== null);
	},
	
	showUpgradeItemHint:function(sender)
	{
		//gv.hint.show(null, null, sender.uiData.itemId, { posX: cc.winSize.width * 0.75 });
		var position = null;
		if(FWUI.touchedWidget){
			//cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
			position = FWUI.touchedWidget.getTouchBeganPosition();
		}

		gv.hintManagerNew.show(this, null, sender.uiData.itemId,position);
	},
	
	hideUpgradeItemHint:function(sender)
	{
		//gv.hint.hide();
		gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
	},
	
	highlightTabButtons:function()
	{
		for(var i=0; i<this.listTypes.length; i++)
		{
			var button = this.listTypes[i].button;
			var icon = this.listTypes[i].icon;
			icon.setColor(button.isBright() ? cc.color(185, 94, 7, 255) : cc.WHITE);
		}
	},
});
