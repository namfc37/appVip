var UserStorage = cc.Class.extend({

    ctor: function () {
        this.storages = [];
        this.mapItemTypeStorage = {};
    },

    load: function (type, mapUserStock) {
        //var mapUserStock = gv.userData.game[GAME_STOCK_LEVEL];
        var aStorage = new Storage(type, mapUserStock[type]);
        for (var i = 0, len = aStorage.stockItemTypes.length; i < len; i++) {
            var itemType = aStorage.stockItemTypes[i];
            aStorage.populateItemForType(itemType);
            this.mapItemTypeStorage[itemType] = type;
        }
        this.storages[type] = aStorage;
    },

    getAllItemOfTypes: function (itemTypes, filterItems, isTom) {//web getAllItemOfTypes: function (itemTypes, filterItems = null, isTom = false) {
		
		if(filterItems === undefined)
			filterItems = null;
		if(isTom === undefined)
			isTom = false;
		
        var returnList = [];
        for (var i = 0, size = itemTypes.length; i < size; i++) {
            var itemType = itemTypes[i];
            var storage = this.getStorageForItemType(itemType);
            if (storage) {
                var list = storage.getAllItemOfType(itemType, filterItems, isTom);
                for (var j = 0, len = list.length; j < len; j++) {
                    returnList[returnList.length] = list[j];
                }
            } else {
                cc.log("NOT FOUND STORAGE FOR " + itemType);
            }
        }
        return returnList;
    },

    getAllItemOfType: function (itemType, filterItems, isTom) {
		
		if(filterItems === undefined)
			filterItems = null;
		if(isTom === undefined)
			isTom = false;
		
        var returnList = [];
        var storage = this.getStorageForItemType(itemType);
        if (storage) {
            var list = storage.getAllItemOfType(itemType, filterItems, isTom);
            for (var j = 0, len = list.length; j < len; j++) {
                returnList[returnList.length] = list[j];
            }
        } else {
            cc.log("NOT FOUND STORAGE FOR " + itemType);
        }
        return returnList;
    },

    getStorageForItemId: function (itemId) {
        var itemConst = defineMap[itemId];
        if (itemConst) {
            return this.getStorageForItemType(itemConst.TYPE);
        }
        return null;
    },

    getStorageForItemType: function (itemType) {
        if (this.mapItemTypeStorage && this.mapItemTypeStorage[itemType] !== undefined) {
            return this.storages[this.mapItemTypeStorage[itemType]];
        }
        return null;
    },

    removeItem: function (itemId, itemAmount) {
        var itemConst = defineMap[itemId];
        if (itemConst) {
            var itemType = itemConst.TYPE;
            var storage = this.getStorageForItemType(itemType);
            if (storage) {
                return storage.removeItem(itemId, itemAmount);
            }
        }
        return false;
    },

    getItemAmount: function (itemId) {
        var storage = this.getStorageForItemId(itemId);
        if (storage) {
            return storage.getItemAmount(itemId);
        }

        return 0;
    },

    addItem: function (itemId, itemAmount, isCheckStock) {//web addItem: function (itemId, itemAmount, isCheckStock = true) {
		
		if(isCheckStock === undefined)
			isCheckStock = true;
		
        var itemConst = defineMap[itemId];
        if (itemConst) {
            var itemType = itemConst.TYPE;
            var storage = this.getStorageForItemType(itemType);
            if (storage) {
                return storage.addItem(itemId, itemAmount, isCheckStock);
            }
        }

        return false;
    },

    updateItem: function (itemId, itemAmount) {
        var itemConst = defineMap[itemId];
        if (itemConst) {
            var itemType = itemConst.TYPE;
            var storage = this.getStorageForItemType(itemType);
            if (storage)
                return storage.updateItem(itemId, itemAmount);
        }

        return false;
    },

    updateItems: function (items) {
        var list = _.pairs(items);
        for (var i = 0, size = list.length; i < size; i++) {
            var pair = list[i];
            var itemId = pair[0];
            var amount = pair[1];
            this.updateItem(itemId, amount);
        }
        Game.refreshUIMain(RF_UIMAIN_ORDER);
        CloudFloors.refreshUpgradeIcons();
		if(gv.gameBuildingStorageInterface && gv.background.floorIndex === -1)
			gv.gameBuildingStorageInterface.refreshNotification();
		//Tutorial.onGameEvent(EVT_UPDATE_ITEMS); no longer used
		Achievement.onItemsUpdated();
    },

    getItem: function (itemId) {
        var itemConst = defineMap[itemId];
        if (itemConst) {
            var itemType = itemConst.TYPE;
            var storage = this.getStorageForItemType(itemType);
            if (storage) {
                return storage.getItem(itemId);
            }
        }

        return null;
    },

    getStorage: function (storageId) {
        return this.storages[storageId];
    },

    getStorageStatus: function (storageId) {
        var storage = this.getStorage(storageId);
        if (storage) {
            return storage.getStorageStatus();
        } else {
            return STORAGE_STATUS_FULL;
        }
    },

    isFullStorage: function (storageId) {
        var storage = this.getStorage(storageId);
        if (storage) {
            return storage.getStorageStatus() === STORAGE_STATUS_FULL;
        } else {
            return true;
        }
    },

    isItemsAvailable: function (requireItemList) {
        var requireItemPairs = _.pairs(requireItemList);
        var listSize = requireItemPairs.length;
        for (var i = 0, size = listSize; i < size; i++) {
            var pair = requireItemPairs[i];
            var itemId = pair[0];
            var amount = pair[1];
            if (this.getItemAmount(itemId) < amount) {
                return false;
            }
        }
        return true;
    },

    willItemExhausted: function (requireItemList) {
        var requireItemPairs = _.pairs(requireItemList);
        var listSize = requireItemPairs.length;
        for (var i = 0, size = listSize; i < size; i++) {
            var pair = requireItemPairs[i];
            var itemId = pair[0];
            var amount = pair[1];
            if (this.getItemAmount(itemId) === amount) {
                return true;
            }
        }
        return false;
    },
});
