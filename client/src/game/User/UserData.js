var UserData = cc.Class.extend({
    LOGTAG: "[UserData]",

    ctor: function () {
        this.coin = -1;
        this.gold = -1;
        this.currentDiamond= -1;
        this.timeGetReward =-1;
    },

    // checking functions

    isEnoughGold: function (amount, notify) {//web isEnoughGold: function (amount, notify = false) {
		if(notify === undefined)
			notify = false;
		
        var result = amount <= this.getGold();
        if (!result && notify) {
            cc.log(this.LOGTAG, "NOT ENOUGH GOLD");
        }
        return result;
    },

    isEnoughCoin: function (amount, notify) {
		if(notify === undefined)
			notify = false;
		
        var result = amount <= this.getCoin();
        if (!result && notify) {
            cc.log(this.LOGTAG, "NOT ENOUGH COIN");
        }
        return result;
    },

    isEnoughLevel: function (amount, notify) {
		if(notify === undefined)
			notify = false;
		
        var result = amount <= this.getLevel();
        if (!result && notify) {
            cc.log(this.LOGTAG, "NOT ENOUGH LEVEL");
        }
        return result;
    },

    isEnoughReputation: function (amount, notify) {
		if(notify === undefined)
			notify = false;
		
        var result = amount <= this.getReputation();
        if (!result && notify) {
            cc.log(this.LOGTAG, "NOT ENOUGH REPUTATION");
        }
        return result;
    },

    isEnoughForPrice: function (priceType, priceValue, notify) {
		if(notify === undefined)
			notify = false;
		
        switch (priceType) {
            case ID_COIN:
                return this.isEnoughCoin(priceValue, notify);
            case ID_GOLD:
                return this.isEnoughGold(priceValue, notify);
            case ID_REPU:
                return this.isEnoughReputation(priceValue, notify);
        }
    },

    // user game

    getGame: function () {
        return this.game;
    },

    setGame: function (data) {
        this.game = data;
    },

    // user resoucres

    getCoin: function () {
        return this.coin;
    },

    setCoin: function (value) {
        var change = (this.coin == -1) ? 0 : (value - this.coin);
        this.coin = value;
        this.clientCoin = value;
        Game.refreshUIMain(RF_UIMAIN_COIN);
		if(change < 0)
		{
			if(gv.dice)
				gv.dice.onCoinAdded(change);
			Achievement.onAction(g_ACTIONS.ACTION_COIN_CONSUME.VALUE, null, -change);
		}
    },

    addCoin: function (value) {
        this.coin += value;
        Game.refreshUIMain(RF_UIMAIN_COIN);
        Game.refreshUIMain(RF_UIMAIN_PIGBANK);
		if(gv.dice)
        gv.dice.onCoinAdded(value);
		if(value < 0)
			Achievement.onAction(g_ACTIONS.ACTION_COIN_CONSUME.VALUE, null, -value);
    },

    getGold: function () {
        return this.game[GAME_GOLD];
    },

    setGold: function (value) {
        this.game[GAME_GOLD] = value;
        Game.refreshUIMain(RF_UIMAIN_GOLD);
    },

    addGold: function (value) {
        this.game[GAME_GOLD] += value;
        Game.refreshUIMain(RF_UIMAIN_GOLD);
    },

    getLevel: function () {
        return this.game[GAME_LEVEL];
    },

    setLevel: function (value) {
        if (this.game[GAME_LEVEL] !== value) {
            this.game[GAME_LEVEL] = value;
            Game.refreshUIMain(RF_UIMAIN_LEVEL);
        }
    },
    checkFriendVip:function()
    {   
        return this.game[GAME_VIP] && this.game[GAME_VIP] !== VIP_INACTIVE;
    },
    getIconVip:function()
    {
        return imgFrameVip[this.game[GAME_VIP]];
    },

    getExp: function () {
        return this.game[GAME_EXP];
    },

    setExp: function (value) {
        this.game[GAME_EXP] = value;
        Game.refreshUIMain(RF_UIMAIN_EXP);
		if(gv.userMachine)
			gv.userMachine.refresh();
    },

    addExp: function (value) {
        this.game[GAME_EXP] += value;
        Game.refreshUIMain(RF_UIMAIN_EXP);
		if(gv.userMachine)
			gv.userMachine.refresh();
    },

    getReputation: function () {
        return this.game[GAME_REPUTATION];
    },

    setReputation: function (value) {
        this.game[GAME_REPUTATION] = value;
        Game.refreshUIMain(RF_UIMAIN_REPU);
    },

    addReputation: function (value) {
        this.game[GAME_REPUTATION] += value;
        Game.refreshUIMain(RF_UIMAIN_REPU);
    },

    // user machine

    getMachine: function (floorId) {
        return this.game[GAME_FLOORS][floorId][FLOOR_MACHINE];
    },

    setMachine: function (floorId, value) {
        this.game[GAME_FLOORS][floorId][FLOOR_MACHINE] = value;
    },

    // user ibshop

    getIBShop: function () {
        return this.game[GAME_IBSHOP_COUNT];
    },

    setIBShop: function (data) {
        this.game[GAME_IBSHOP_COUNT] = data;
    },

    canBuyIBShopItem: function (itemId) {
        var itemInfo = gv.ibshop.getItem(itemId);
        if (itemInfo) {
            if (this.game[GAME_IBSHOP_COUNT][itemId])
                return this.game[GAME_IBSHOP_COUNT][itemId] < itemInfo.LIMIT_DAY;
        }
        return true;
    },

    canBuyIBShopItemU:function(itemId, priceType, priceNum)
	{
        var itemInfo = gv.ibshop.getItemU(itemId, priceType, priceNum);

        if(itemInfo && itemInfo.LIMIT_DAY > 0 && this.game[GAME_IBSHOP_COUNT][itemId])
			return (this.game[GAME_IBSHOP_COUNT][itemId] < itemInfo.LIMIT_DAY);
        return true;
    },

    // user tomkid

    getTomkid: function () {
        return this.game[GAME_TOM];
    },

    setTomkid: function (data) {
        this.game[GAME_TOM] = data;
    },

    // user wheel

    getWheel: function () {
        return this.game[GAME_LUCKY_SPIN];
    },

    setWheel: function (data) {
        this.game[GAME_LUCKY_SPIN] = data;
    },

    getWheelWinSlot: function () {
        return (this.wheelWinSlot !== undefined) ? this.wheelWinSlot : -1;
    },

    setWheelWinSlot: function (data) {
        this.wheelWinSlot = data;
    },

    // user dice

    getDice: function () {
        return this.game[GAME_DICE];
    },

    setDice: function (data) {
        this.game[GAME_DICE] = data;
    },

    getDiceWinSlot: function () {
        return (this.diceWinSlot !== undefined) ? this.diceWinSlot : -1;
    },

    setDiceWinSlot: function (data) {
        this.diceWinSlot = data;
    },

    addSpentCoin: function (data) {
        if (this.game[GAME_DICE])
            this.game[GAME_DICE][DICE_SPENT_COIN] += data;
    },

    addTicket: function (data) {
        if (this.game[GAME_DICE])
            this.game[GAME_DICE][DICE_NUM_TICKET] += data;
    },

    // user daily gift

    getDailyGift: function () {
        return this.game[GAME_DAILY_GIFT];
    },

    setDailyGift: function (data) {
        this.game[GAME_DAILY_GIFT] = data;
    },

    // user game arcade

    isArcadeUnlocked: function () {
        return this.game[GAME_OPEN_BUILDING_GAME] || false;
    },

    setArcadeUnlocked: function (data) {
        this.game[GAME_OPEN_BUILDING_GAME] = data;
    },

    // user gacha

    getGacha: function () {
        return this.game[GAME_GACHA];
    },

    setGacha: function (data) {
        this.game[GAME_GACHA] = data;
    },

    getGachaChests: function () {
        var data = this.getGacha();
        return (data) ? data[GACHA_CHESTS] : [];
    },

    getGachaChest: function (chestId) {
        var chests = this.getGachaChests();
        return chests.find(function(item) {return item[CHEST_ID] === chestId;});
    },

    setGachaChest: function (chest) {
        var chests = this.getGachaChests();
        var index = chests.findIndex(function(item) {return item[CHEST_ID] === chest[CHEST_ID];});
        if (index >= 0)
            chests[index] = chest;
    },

    getGachaWinItems: function () {
        return this.gachaWinItems || [];
    },

    setGachaWinItems: function (data) {
        this.gachaWinItems = data;
    },

    getUnlockItems: function (level)
    {
		var unlockList = [];
		var unlockListList = [json_user_level.SEED_UNLOCK, json_user_level.POT_UNLOCK, json_user_level.PROD_UNLOCK, json_user_level.MACHINE_UNLOCK];
		for(var i=0; i<unlockListList.length; i++)
		{
			if(!unlockListList[i][level])
				continue;
				
			var items = unlockListList[i][level];
			if (typeof (items) === "string")
				unlockList.push({itemId: items});
			else
				for(var j in items)
					unlockList.push({itemId: items[j]});
        }
        
        return unlockList;
    },
    getDisplayName: function () {
        return this.game[GAME_NAME];
    },
    getAvatar: function () {
        return this.game[GAME_AVATAR];
    },

    getMailList: function ()
    {
        if (this.mailBox && this.mailBox[MAIL_LIST_MAIL])
            return this.mailBox[MAIL_LIST_MAIL];

        return [];
    },

    mailRemove: function (mail)
    {
        if (this.mailBox && this.mailBox[MAIL_LIST_MAIL])
            FWUtils.removeArrayElement(this.mailBox[MAIL_LIST_MAIL], mail);
    },



    // Event PigBank

    setPigBank: function(value)
    {
        this.currentDiamond =value;
        //this.pigBank.currentDiamond = value;
        Game.refreshUIMain(RF_UIMAIN_PIGBANK);
    },

    getPigBank:function()
    {
        return this.currentDiamond;
    },
    addDiamondPigBank:function( value)
    {
        this.currentDiamond += value;
        Game.refreshUIMain(RF_UIMAIN_PIGBANK);
    }
});