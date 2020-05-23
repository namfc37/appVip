package test.logic 
{
	import constanst.*;
	import flash.utils.*;

	public class UserData 
	{
		private var _game:Object = null;
		
		public function UserData() 
		{
		}
		
		public function isEnoughGold (amount:int):Boolean
		{
			return amount <= this.gold;
		}

		public function isEnoughCoin (amount:int):Boolean
		{
			return amount <= this.coin;
		}

		public function isEnoughLevel (amount:int):Boolean
		{
			return amount <= this.level;
		}

		public function isEnoughReputation (amount:int):Boolean
		{
			return amount <= this.reputation;
		}

		// isEnoughForPrice (priceType, priceValue, notify = false)
		// {
		// 	switch (priceType)
		// 	{
		// 		case ID_COIN:
		// 			return this.isEnoughCoin(priceValue, notify);
		// 		case ID_GOLD:
		// 			return this.isEnoughGold(priceValue, notify);
		// 		case ID_REPU:
		// 			return this.isEnoughReputation(priceValue, notify);
		// 	}
		// }

		// user game

		public function get game ():Object
		{
			return this._game;
		}

		public function set game (data:Object):void
		{
			this._game = data;
		}

		// user resoucres

		public function get coin ():int
		{
			return this._game [KeyDefine.KEY_COIN];
		}

		public function set coin (value:int):void
		{
			this._game [KeyDefine.KEY_COIN] = value;
			// let change = (this.coin == -1) ? 0 : (value - this.coin);
			// this.coin = value;
			// this.clientCoin = value;
			// Game.refreshUIMain(RF_UIMAIN_COIN);
			// if(gv.dice)
			// 	gv.dice.onCoinAdded(change);
		}

		// addCoin (value)
		// {
		// 	this.coin += value;
		// 	Game.refreshUIMain(RF_UIMAIN_COIN);
		// 	gv.dice.onCoinAdded(value);
		// }

		public function get gold ():int
		{
			return this._game[KeyDefine.GAME_GOLD];
		}

		// setGold (value)
		// {
		// 	this._game[KeyDefine.GAME_GOLD] = value;
		// 	Game.refreshUIMain(RF_UIMAIN_GOLD);
		// }

		// addGold (value)
		// {
		// 	this._game[KeyDefine.GAME_GOLD] += value;
		// 	Game.refreshUIMain(RF_UIMAIN_GOLD);
		// }

		public function get level ():int
		{
			return this._game[KeyDefine.GAME_LEVEL];
		}

		// setLevel (value)
		// {
		// 	if (this._game[KeyDefine.GAME_LEVEL] !== value) {
		// 		this._game[KeyDefine.GAME_LEVEL] = value;
		// 		Game.refreshUIMain(RF_UIMAIN_LEVEL);
		// 	}
		// }

		// getExp ()
		// {
		// 	return this._game[KeyDefine.GAME_EXP];
		// }

		// setExp (value)
		// {
		// 	this._game[KeyDefine.GAME_EXP] = value;
		// 	Game.refreshUIMain(RF_UIMAIN_EXP);
		// 	gv.userMachine.refresh();
		// }

		// addExp (value)
		// {
		// 	this._game[KeyDefine.GAME_EXP] += value;
		// 	Game.refreshUIMain(RF_UIMAIN_EXP);
		// 	gv.userMachine.refresh();
		// }

		public function get reputation ():int
		{
			return this._game[KeyDefine.GAME_REPUTATION];
		}

		// setReputation (value)
		// {
		// 	this._game[KeyDefine.GAME_REPUTATION] = value;
		// 	Game.refreshUIMain(RF_UIMAIN_REPU);
		// }

		// addReputation (value)
		// {
		// 	this._game[KeyDefine.GAME_REPUTATION] += value;
		// 	Game.refreshUIMain(RF_UIMAIN_REPU);
		// }

		// user machine

		// getMachine (floorId)
		// {
		// 	return this._game[KeyDefine.GAME_FLOORS][floorId][FLOOR_MACHINE];
		// }

		// setMachine (floorId, value)
		// {
		// 	this._game[KeyDefine.GAME_FLOORS][floorId][FLOOR_MACHINE] = value;
		// }

		// user ibshop

		// getIBShop ()
		// {
		// 	return this._game[KeyDefine.GAME_IBSHOP_COUNT];
		// }

		// setIBShop (data)
		// {
		// 	this._game[KeyDefine.GAME_IBSHOP_COUNT] = data;
		// }

		// canBuyIBShopItem (itemId)
		// {
		// 	let itemInfo = gv.ibshop.getItem(itemId);
		// 	if (itemInfo) {
		// 		if (this._game[KeyDefine.GAME_IBSHOP_COUNT][itemId])
		// 			return this._game[KeyDefine.GAME_IBSHOP_COUNT][itemId] < itemInfo.LIMIT_DAY;
		// 	}
		// 	return true;
		// }

		// user tomkid

		// getTomkid ()
		// {
		// 	return this._game[KeyDefine.GAME_TOM];
		// }

		// setTomkid (data) {
		// 	this._game[KeyDefine.GAME_TOM] = data;
		// }

		// // user wheel

		// getWheel ()
		// {
		// 	return this._game[KeyDefine.GAME_LUCKY_SPIN];
		// }

		// setWheel (data)
		// {
		// 	this._game[KeyDefine.GAME_LUCKY_SPIN] = data;
		// }

		// getWheelWinSlot ()
		// {
		// 	return (this.wheelWinSlot !== undefined) ? this.wheelWinSlot : -1;
		// }

		// setWheelWinSlot (data)
		// {
		// 	this.wheelWinSlot = data;
		// }

		// user dice

		// public function get dice ():Object
		// {
		// 	return this._game[KeyDefine.GAME_DICE];
		// }

		// public function set dice (data:Object):void
		// {
		// 	this._game[KeyDefine.GAME_DICE] = data;
		// }

		// public function get diceWinSlot ():int
		// {
		// 	return (this.diceWinSlot !== undefined) ? this.diceWinSlot : -1;
		// }

		// public function set diceWinSlot (data:Object):void
		// {
		// 	this.diceWinSlot = data;
		// }

		// public function addSpentCoin (data:int):void
		// {
		// 	if (this._game[KeyDefine.GAME_DICE])
		// 		this._game[KeyDefine.GAME_DICE][DICE_SPENT_COIN] += data;
		// }

		// public function addTicket (data:int):void
		// {
		// 	if (this._game[KeyDefine.GAME_DICE])
		// 		this._game[KeyDefine.GAME_DICE][DICE_NUM_TICKET] += data;
		// }

		// user daily gift

		// public function get dailyGift ():Object
		// {
		// 	return this._game[KeyDefine.GAME_DAILY_GIFT];
		// }

		// public function set dailyGift (data:Object)
		// {
		// 	this._game[KeyDefine.GAME_DAILY_GIFT] = data;
		// }

		// user game arcade

		// public function isArcadeUnlocked ():Boolean
		// {
		// 	return this._game[KeyDefine.GAME_OPEN_BUILDING_GAME] || false;
		// }

		// public function setArcadeUnlocked (data:Object):void
		// {
		// 	this._game[KeyDefine.GAME_OPEN_BUILDING_GAME] = data;
		// }

		// user gacha

		// public function get gacha ():Object
		// {
		// 	return this._game[KeyDefine.GAME_GACHA];
		// }

		// public function set gacha (data:Object):void
		// {
		// 	this._game[KeyDefine.GAME_GACHA] = data;
		// }

		// public function get gachaChests ():Array
		// {
		// 	let data = this.getGacha();
		// 	return (data) ? data[GACHA_CHESTS] : [];
		// }

		// public function get gachaChest (chestId:int):Object
		// {
		// 	let chests = this.getGachaChests();
		// 	return chests.find((item) => item[CHEST_ID] === chestId);
		// }

		// public function set gachaChest (chest:Object):void
		// {
		// 	let chests = this.getGachaChests();
		// 	let index = chests.findIndex((item) => item[CHEST_ID] === chest[CHEST_ID]);
		// 	if (index >= 0)
		// 		chests[index] = chest;
		// }

		// public function get gachaWinItems ():Array
		// {
		// 	return this.gachaWinItems || [];
		// }

		// public function setGachaWinItems (data):void
		// {
		// 	this.gachaWinItems = data;
		// }

		// public function getUnlockItems (level):Array
		// {
		// 	var unlockList = [];
		// 	var unlockListList = [json_user_level.SEED_UNLOCK, json_user_level.POT_UNLOCK, json_user_level.PROD_UNLOCK, json_user_level.MACHINE_UNLOCK];
		// 	for(var i=0; i<unlockListList.length; i++)
		// 	{
		// 		if(!unlockListList[i][level])
		// 			continue;
					
		// 		let items = unlockListList[i][level];
		// 		if (typeof (items) === "string")
		// 			unlockList.push({itemId: items});
		// 		else
		// 			for(let j in items)
		// 				unlockList.push({itemId: items[j]});
		// 	}
			
		// 	return unlockList;
		// }

		public function get displayName ():String
		{
			return this._game[KeyDefine.GAME_NAME];
		}

		public function get avatar ():String
		{
			return this._game[KeyDefine.GAME_AVATAR];
		}
	}
}