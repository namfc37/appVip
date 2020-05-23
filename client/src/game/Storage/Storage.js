var Storage = cc.Class.extend({

	ctor: function (type, level) {

		this.type = type;
		this.capacityCurrent = 0;

		this.stockDefine = g_STOCK[type];
		this.stockItemTypes = this.stockDefine.CONTAIN_TYPES;

		this.items = {};
		this.filterItemsByType = {};

        this.updateLevel(level);
	},

	updateLevel: function (level) {

		this.level = level;

		this.stockDefine = g_STOCK[this.type];
		this.stockLevels = this.stockDefine.LEVELS;

		if (this.stockLevels && level < this.stockLevels.length) {
			this.nextLevelStock = this.stockLevels[level];
			this.requireItems = this.nextLevelStock.REQUIRE_ITEM;
		}
		else {
			this.nextLevelStock = null;
			this.requireItems = {};
		}

		if (this.stockDefine.CAPACITY_INIT >= 0)
			this.capacityMax = this.stockDefine.CAPACITY_INIT + level * this.stockDefine.CAPACITY_ADD;
		else 
			this.capacityMax = Math.pow(2, 31);
		this.capacityAlmostFull = STORAGE_ALMOST_FULL_NUM * this.capacityMax / 100;
	},

	getNextLevelCapacity: function () {
		return this.capacityMax + this.stockDefine.CAPACITY_ADD;//return this.capacityMax + (this.level + 1) * this.stockDefine.CAPACITY_ADD;
	},

	getUpgradeRequireItems: function () {
		return this.requireItems;
	},

	getAllStorageItems: function () {
		return this.items;
	},

	getAllItemOfType: function (itemType, filterItems, isTom) {//web getAllItemOfType: function (itemType, filterItems = null, isTom = false) {
		
		if(filterItems === undefined)
			filterItems = null;
		if(isTom === undefined)
			isTom = false;
		
		var returnList = [];
		var itemMap = this.getAllItemsOfType(itemType);
		if (itemMap) {
			var keys = _.keys(itemMap);
			if (filterItems !== null && filterItems.length > 0) {
				keys = keys.filter(function(itemId) {//web
                    return filterItems.findIndex(function(item) {return item === itemId;}) !== -1;
                });
			}
			for (var i = 0, length = keys.length; i < length; i++) {								
				var item = itemMap[keys[i]];
				var amount = item.itemAmount;
				if (isTom) {
					var info = defineMap[item.itemId];
					if (info.LEVEL_UNLOCK) {
						if (gv.mainUserData.getLevel() >= info.LEVEL_UNLOCK) // change userData to mainUserData, i want get list item i can use
							returnList.push(item);//returnList[i] = item;
					} else {
						returnList.push(item);//returnList[i] = item;
					}
				} else {
					if (amount > 0) {
						returnList.push(item);//returnList[i] = item;
					}
				}
			}
		}
		return returnList;
	},

	getAllItemOfTypes: function (itemTypes) {
		var returnList = [];
		var idx = 0;
		for (var i = 0, size = itemTypes.length; i < size; i++) {
			var itemType = itemTypes[i];
			var list = this.getAllItemOfType(itemType);
			for (var j = 0, sizej = list.length; j < sizej; j++) {
				returnList[idx++] = list[j];
			}
		}
		return returnList;
	},

	getAllItemsOfType: function (itemType) {
		return this.filterItemsByType[itemType];
	},

    populateItemForType: function (itemType) {

		var mapItemConst = {};
		mapItemConst[defineTypes.TYPE_PRODUCT] = g_PRODUCT;
        mapItemConst[defineTypes.TYPE_PLANT] = g_PLANT;
        mapItemConst[defineTypes.TYPE_PEST] = g_PEST;

        var listItems = mapItemConst[itemType];
        if (listItems) {
            for (var itemId in listItems)
                this.addItem(itemId, 0);
		}
	},

	removeItem: function (itemId, itemAmount) {
		var item = this.items[itemId];
		if (item) {
			var nextAmount = item.itemAmount - itemAmount;
			if (nextAmount <= 0) {
				if(this.isCountToCapacity(itemId))
					this.capacityCurrent -= item.itemAmount;
				item.itemAmount = 0;
				var itemConst = defineMap[itemId];
				// var itemType = itemConst.TYPE;
				// if (this.filterItemsByType[itemType]) {
				// 	delete this.filterItemsByType[itemType][item.itemId];
				// }
			} else {
				item.itemAmount = nextAmount;
				if(this.isCountToCapacity(itemId))
					this.capacityCurrent -= itemAmount;
			}
			return true;
		}
		return false;

	},

	getItemAmount: function (itemId) {
		var item = this.items[itemId];
		if (item) {
			return item.itemAmount;
		} else {
			return 0;
		}
	},

	updateItem: function (itemId, itemAmount) {
		var item = this.items[itemId];
		if (item) {
			var diff = itemAmount - item.itemAmount;
			item.itemAmount = itemAmount;
			if(this.isCountToCapacity(itemId))
				this.capacityCurrent += diff;
		} else {
			item = new StorageItem(itemId, itemAmount);
			this.items[itemId] = item;
			if(this.isCountToCapacity(itemId))
				this.capacityCurrent += itemAmount;

			this.updateFilterList(itemId);
		}
	},

	getItem: function (itemId) {
		var item = this.items[itemId];
		return (item === undefined ? null : item);
	},

	updateFilterList: function (itemId) {
		var itemConst = defineMap[itemId];
		var itemType = itemConst.TYPE;
		var item = this.items[itemId];
		var filterList = this.filterItemsByType[itemType];
		if (!filterList) {
			this.filterItemsByType[itemType] = {};
			filterList = this.filterItemsByType[itemType];
		}
		if (!filterList[item.itemId])
			filterList[item.itemId] = item;
	},

	addItem: function (itemId, itemAmount, isCheckStock) {//web addItem: function (itemId, itemAmount, isCheckStock = true) {
		
		if(isCheckStock === undefined)
			isCheckStock = true;
		
		if (isCheckStock && this.capacityMax > 0 && this.capacityCurrent + itemAmount > this.capacityMax && this.isCountToCapacity(itemId)) {
			return false;
		}

		var itemDefine = defineMap[itemId];
		var itemType = itemDefine.TYPE;

		var item = this.items[itemId];
		if (item) {
			item.itemAmount += itemAmount;
		} else {
			item = new StorageItem(itemId, itemAmount);
			this.items[itemId] = item;
		}

		this.updateFilterList(itemId);
		if(this.isCountToCapacity(itemId))
			this.capacityCurrent += itemAmount;

		return true;
	},

	getStorageStatus: function () {
		if (this.capacityCurrent < this.capacityAlmostFull) {
			return STORAGE_STATUS_LOW;
		} else if (this.capacityCurrent < this.capacityMax) {
			return STORAGE_STATUS_HIGH;
		} else {
			return STORAGE_STATUS_FULL;
		}
	},

	isFull: function () {
		return this.getStorageStatus() === STORAGE_STATUS_FULL;
	},

	canAddItem: function (amount, itemId) {
		if(!this.isCountToCapacity(itemId))
			return true;
        return (this.capacityMax < 0 || this.capacityCurrent + amount <= this.capacityMax);
	},
	
	isCountToCapacity:function(itemId)
	{
		var info = defineMap[itemId];
		if (info.TYPE == defineTypes.TYPE_PLANT)
		{
			return  (!info.EVENT_ID) ;
		}
		return true;

		//return (itemId !== g_MISCINFO.EV01_PLANT && itemId !== g_MISCINFO.EV02_PLANT);
	},
});
