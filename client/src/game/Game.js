const BLOCKED_TOUCH_ID = 99999; // id of touches that are swallowed by ui or game objects
const LONG_TOUCH_ID = 99998; // id of touches that are swallowed by ui or game objects

var Game =
{
	gameScene: null,
	deltaServerTime: 0,
	gameActions: null,
	init: function () {
		if (this.blockedTouch === null) {
			this.blockedTouch = new cc.Touch(0, 0, BLOCKED_TOUCH_ID);
			if(cc.sys.isNative)
				this.blockedTouch.retain();
		}
		if (this.longTouch === null) {
			this.longTouch = new cc.Touch(0, 0, LONG_TOUCH_ID);
			if(cc.sys.isNative)
				this.longTouch.retain();
		}
		this.registerHandleAppEnterBackground();				
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0, cc.REPEAT_FOREVER, 0, false);//web cc.director.getScheduler().scheduleUpdateForTarget(this);
		cc.director.getScheduler().scheduleCallbackForTarget(network, network.sendRequestPing, 30, cc.REPEAT_FOREVER, 0, false);
		cc.director.getScheduler().scheduleCallbackForTarget(network, network.chatBase.sendPing, 30, cc.REPEAT_FOREVER, 0, false);
		Payment.init0();
		
		this.loadResourcesOnDemand = (!cc.sys.isNative); // only load resources when needed
		this.gameActions = {};
		for(var key in g_ACTIONS)
		{
			var actionId = g_ACTIONS[key].VALUE;
			var action = g_ACTIONS[key];
			action.NAME = key;
			this.gameActions[actionId] = action;
		}
		//cc.log("ACTIONS CACHE:", JSON.stringify(this.gameActions));
	},

	uninit: function () {
		Achievement.uninit();
		QuestBook.uninit();
		//NewsBoard.uninit();
		Tutorial.uninit();
		Ranking.uninit();
		gv.hintManagerNew.uninit();
		Guild.uninit();
		CardPayment.uninit();

		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);//web cc.director.getScheduler().unscheduleUpdateForTarget(this);
		cc.director.getScheduler().unscheduleCallbackForTarget(network, network.sendRequestPing);
		cc.director.getScheduler().unscheduleCallbackForTarget(network, network.chatBase.sendPing);
		
		if (this.blockedTouch !== null)
		{
			this.blockedTouch.release();
			this.blockedTouch = null;
		}
		if (this.longTouch !== null)
		{
			this.longTouch.release();
			this.longTouch = null;
		}
	},
	
	framesCount: 0,
	totalTime: 0,
	update:function(dt)
	{
		this.gameTimeMs = _.now() + Game.deltaServerTime;
		this.gameTimeS = this.gameTimeMs / 1000;
		
		if(this.gameScene)
		{
			if(this.shouldShowRatingPopup)
			{
				if(!this.isAnyPopupShowing())
				{
					if(Tutorial.isMainTutorialFinished() && !FWUtils.touchEater && gv.mainUserData.getLevel() >= 15)
						this.showRatingPopup();
					this.shouldShowRatingPopup = false;
				}
				else if(FWUI.isShowing(UI_POPUP_GAME_UPGRADE))
					this.shouldShowRatingPopup = false;
			}
			
			if(FWUI.isContextMenuShowing())
			{
				var parentPos = FWUtils.getWorldPosition(FWUI.cmParent);
				
				// jira#6878
				var y = parentPos.y + FWUI.cmPos.y;
				if(y < 100)
				{
					var y2 = y - 100;
					if(y2 < -75)
						y2 = -75;
					FWUI.cmArrow.setPosition(16, y2);
				
					y = 100;
				}
				else
					FWUI.cmArrow.setPosition(16, 0);
				
				FWUI.cmWidget.setPosition(parentPos.x + FWUI.cmPos.x, y);
			}
		}
		
		FWUI.hasTouchedUI = false;
	},
	
	getAvgFps:function()
	{
		return (this.framesCount / this.totalTime);
	},

///////////////////////////////////////////////////////////////////////////////////////
// logic //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	gameTimeMs: 0,
	getGameTime:function()
	{
		return this.gameTimeMs;
	},

	gameTimeS: 0,
	getGameTimeInSeconds: function ()
	{
		return this.gameTimeS;
	},

	// check if enough diamond
	// subtract diamond
	// show dropping diamond icon at fxPos
	// return true on success, false on failure (not enough diamond)
	consumeDiamond:function(count, fxPos)
	{
		if(count <= 0)
			return true;
		
		if(gv.userData.getCoin() >= count)
		{
			// success
			gv.userData.addCoin(-count);
			if(fxPos)
				FWUtils.showFlyingItemIcon(ID_COIN, -count, fxPos);
			return true;
		}
		else
		{
			// failure
			this.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function() {Game.openShop(ID_COIN);}, true, "TXT_BUY_DIAMOND");
			return false;
		}
	},
	
	checkEnoughDiamond:function(coin, showPopup)//web checkEnoughDiamond:function(coin, showPopup = true)
	{
		if(showPopup === undefined)
			showPopup = true;
		
		if(gv.userData.getCoin() >= coin)
			return true;
		else if(showPopup)
		{
			// failure
			this.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function() {Game.openShop(ID_COIN);}, true, "TXT_BUY_DIAMOND");
			return false;
		}
	},

    consumeReputation:function(count, fxPos)
    {
        if(gv.userData.getReputation() >= count)
        {
            // success
            gv.userData.addReputation(-count);
            if(fxPos)
                FWUtils.showFlyingItemIcon(ID_REPU, -count, fxPos);
            return true;
        }
        else
        {
			// jira#6388
            // failure
			// jira#5940
            //this.showPopup0("TXT_NOT_ENOUGH_REPU_TITLE", "TXT_NOT_ENOUGH_REPU_CONTENT", null, function() {}, true, "TXT_SEEK_REPUTATION");
            //this.showPopup0("TXT_NOT_ENOUGH_REPU_TITLE", "TXT_NOT_ENOUGH_REPU_CONTENT", null, null, true);
			FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_REPU_TITLE"), fxPos, cc.WHITE);
            return false;
        }
    },
	
	// check if enough gold
	// subtract gold
	// show dropping gold icon at fxPos
	// return true on success, false on failure (not enough gold)
	consumeGold:function(count, fxPos)
	{
		if(count <= 0)
			return true;
		
		if(gv.userData.getGold() >= count)
		{
			// success
			gv.userData.addGold(-count);
			if(fxPos)
				FWUtils.showFlyingItemIcon(ID_GOLD, -count, fxPos);
			return true;
		}
		else
		{
			// failure
			this.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
			return false;
		}
	},
	
	checkEnoughGold:function(gold, showPopup)//web checkEnoughGold:function(gold, showPopup = true)
	{
		if(showPopup === undefined)
			showPopup = true;
		
		if(gv.userData.getGold() >= gold)
			return true;
		else if(showPopup)
		{
			// failure
			this.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
			return false;
		}
	},
	
	// check if enough items
	// subtract items
	// warning: this function will NOT show popup on failure
	consumeItems:function(itemList, fxPos)
	{
		var missingItems = this.getMissingItemsAndPrices(itemList);
		if(missingItems.missingItems.length > 0)
			return false; // not enough items
		
		for(var i=0; i<itemList.length; i++)
		{
			var itemId = itemList[i].itemId;
			var requireAmount = (itemList[i].amount || itemList[i].requireAmount);
			
			// subtract item
			if(itemId === ID_GOLD)
				gv.userData.addGold(-requireAmount);
			else if(itemId === ID_COIN)
				gv.userData.addCoin(-requireAmount);
			else if(itemId === ID_REPU)
				gv.userData.addReputation(-requireAmount);
			else
				gv.userStorages.removeItem(itemId, requireAmount);

			// fx
			if(fxPos)
				FWUtils.showFlyingItemIcon(itemId, -requireAmount, cc.p(fxPos.x, fxPos.y + i * 50));
		}
		return true;
	},
	
	// add items
	addItems:function(itemList, fxPos, delay, isCheckStock)//web addItems:function(itemList, fxPos, delay, isCheckStock = true)
	{
		if(isCheckStock === undefined)
			isCheckStock = true;
		
		for(var i=0; i<itemList.length; i++)
		{
			var itemId = itemList[i].itemId;
			var amount = itemList[i].amount;
			
			// add item
			if(itemId === ID_GOLD)
				gv.userData.addGold(amount);
			else if(itemId === ID_COIN)
				gv.userData.addCoin(amount);
			else if(itemId === ID_REPU)
				gv.userData.addReputation(amount);
			else if(itemId === ID_EXP)
				gv.userData.addExp(amount);
			else
				gv.userStorages.addItem(itemId, amount, isCheckStock);

			if(fxPos)
				FWUtils.showFlyingItemIcon(itemId, amount, fxPos, Game.getFlyingDestinationForItem(itemId), i * 0.35 + (delay || 0));
		}
	},	
	
	openShop:function(itemId, onHide)//web openShop:function(itemId, onHide = null)
	{
		if(onHide === undefined)
			onHide = null;
		
		if(itemId === ID_COIN)
		{
			Payment.showTab(PAYMENT_TAB_COIN, onHide);
			return;
		}
		if(itemId === ID_GOLD)
		{
			Payment.showTab(PAYMENT_TAB_GOLD, onHide);
			return;
		}

		// TODO: use constants for IBShop instead of hardcoding
		var itemDef = defineMap[itemId];
		var type = itemDef.TYPE;
		var subtype = itemDef.SUB_TYPE;
		var tab = 4;
		if(type === defineTypes.TYPE_PLANT)
			tab = 0;
		else if(type === defineTypes.TYPE_POT)
			tab = 1;
		else if(type === defineTypes.TYPE_DECOR || type === defineTypes.TYPE_SKIN)
			tab = 2;
		else if(type === defineTypes.TYPE_MATERIAL)
		{
			if(subtype === defineTypes.SUB_TYPE_GREEN_GRASS || subtype === defineTypes.SUB_TYPE_PURPLE_GRASS || subtype === defineTypes.SUB_TYPE_GLOVES)
			tab = 3;
		}
		else if(type === defineTypes.TYPE_PEARL)
			tab = 3;
		
		// fix: incorrect focus because item M27 does not exist in ibshop
		if(itemId === "M27")
			itemId = "M26";

		cc.log("Game::openShop: itemId=" + itemId + " tab=" + tab);
		gv.ibshop.showPopup(null, tab, onHide);
		gv.ibshop.popupMain.scrollToItem(itemId);
	},
	
	canBuyInShop:function(itemId)
	{
		// TODO
		return true;
	},
	
	// - returned success value is only a fake
	// - to get correct value, use callback
	quickBuy:function(itemId, amount, totalGoldPrice, totalCoinPrice, fxPos, callback)
	{
		var success = false;
		
		if(totalCoinPrice > 0 && this.consumeDiamond(totalCoinPrice, fxPos) === true)
		{
			// server
			var pk = network.connector.client.getOutPacket(network.BuyItemRequest);
			var itemMap = {};
			if(_.isArray(itemId))
			{
				for(var i=0; i<itemId.length; i++)
					itemMap[itemId[i]] = amount[i];
			}
			else
				itemMap[itemId] = amount;
			pk.pack(itemMap, totalCoinPrice, callback);
			network.connector.client.sendPacket(pk);
			success = true;
		}
			
		if(totalGoldPrice > 0 && this.consumeGold(totalGoldPrice, fxPos) === true)
		{
			// TODO: server
			success = true;
		}
		
		if(success === true)
		{
			// fake
			if(_.isArray(itemId))
			{
				for(var i=0; i<itemId.length; i++)
					gv.userStorages.addItem(itemId[i], amount[i]);
			}
			else
				gv.userStorages.addItem(itemId, amount);
			
			AudioManager.effect (EFFECT_GOLD_PAYING);
			return true;
		}
		return false;
	},
	
	updateUserDataFromServer:function(object)
	{
		if(!object)
			return;
		
		// update stock
        if (object[KEY_UPDATE_ITEMS])
            gv.userStorages.updateItems(object[KEY_UPDATE_ITEMS]);

        // update private shop
        if (object[KEY_PRIVATE_SHOP]) {
			gv.userData.privateShop = object[KEY_PRIVATE_SHOP];
			PrivateShop.privateShop = gv.userData.privateShop;
            cc.log("Game::updateUserDataFromServer: new private shop data: " + JSON.stringify(object[KEY_PRIVATE_SHOP]));
        }

        // update airship
        if (object[KEY_AIRSHIP]) {
            gv.userData.airship = object[KEY_AIRSHIP];
			Airship.setData(gv.userData.airship);
            cc.log("Game::updateUserDataFromServer: new airship data: " + JSON.stringify(object[KEY_AIRSHIP]));
        }

        // update ib shop
        if (object[KEY_IBSHOP_COUNT])
			gv.userData.setIBShop(object[KEY_IBSHOP_COUNT]);

        // update tom kid
        if (object[KEY_TOM])
            gv.userData.setTomkid(object[KEY_TOM]);

        // user data
        if (object[KEY_EXP] !== undefined)
		{
			gv.mainUserData.setExp(object[KEY_EXP]);
			if(gv.userData !== gv.mainUserData)
				gv.userData.setExp(object[KEY_EXP]);
		}
        if (object[KEY_LEVEL] !== undefined)
		{
			gv.mainUserData.setLevel(object[KEY_LEVEL]);
			if(gv.userData !== gv.mainUserData)
				gv.userData.setLevel(object[KEY_LEVEL]);
		}
        if (object[KEY_COIN] !== undefined)
		{
			gv.mainUserData.setCoin(object[KEY_COIN]);
			if(gv.userData !== gv.mainUserData)
				gv.userData.setCoin(object[KEY_COIN]);
		}
        if (object[KEY_GOLD] !== undefined)
		{
			gv.mainUserData.setGold(object[KEY_GOLD]);
			if(gv.userData !== gv.mainUserData)
				gv.userData.setGold(object[KEY_GOLD]);
		}
        if (object[KEY_REPUTATION] !== undefined)
		{
			gv.mainUserData.setReputation(object[KEY_REPUTATION]);
			if(gv.userData !== gv.mainUserData)
				gv.userData.setReputation(object[KEY_REPUTATION]);
		}
		if(object[KEY_PIG_BANK] !== undefined)
		{
			var test = object;
			cc.log("Update Diamond ", object[KEY_PIG_BANK][PIG_CURRENT_DIAMOND]);
			gv.mainUserData.setPigBank(object[KEY_PIG_BANK][PIG_CURRENT_DIAMOND]);
			gv.mainUserData.timeGetReward = object[KEY_PIG_BANK][PIG_TIME_GET_REWARD];
			if(gv.userData !== gv.mainUserData)
				gv.userData.setPigBank(object[KEY_PIG_BANK][PIG_CURRENT_DIAMOND]);
		}
		if(object[KEY_VIP] !== undefined)
		{
			cc.log("Update VIP ", object[KEY_VIP][VIP_CURRENT_ACTIVE]);
			gv.vipManager.init(object[KEY_VIP][VIP_CURRENT_ACTIVE]);
			gv.vipManager.timeEndValid = object[KEY_VIP][VIP_CURRENT_ACTIVE_TIME_EXPIRE];
			gv.vipManager.timeBought= object[KEY_VIP][VIP_CURRENT_ACTIVE_TIME_ACTIVE];
			Game.refreshUIMain(RF_UIMAIN_VIP);
			cc.log("VIP UPDATE : ICON : "+ object[KEY_VIP][VIP_CURRENT_ACTIVE]+ " , EXPIRE :"+object[KEY_VIP][VIP_CURRENT_ACTIVE_TIME_EXPIRE] +" , BEGIN :"+object[KEY_VIP][VIP_CURRENT_ACTIVE_TIME_ACTIVE]);
		}
		
		if(object[KEY_TRUCK] !== undefined)
		{
			cc.log("Update Truck ", JSON.stringify(object[KEY_TRUCK]))
			Truck.setData(object[KEY_TRUCK]);
		}
		// jira#4725
		// moved to UserStorage
		//this.refreshUIMain(RF_UIMAIN_ORDER);
	},
	
	isFriendGarden:function()
	{
		return (gv.userData.userId !== gv.mainUserData.mainUserId);
	},
	
	getFriendAvatarById:function(id)
	{
		// TODO
		return "hud/hud_avatar_default.png";
	},	
	
	getItemName:function(itemId)
	{
		if(!itemId)
			return itemId;
		
		// use cloud skin name as combo name
		if(itemId.startsWith("CK"))
			itemId = g_COMBO[itemId].CHILDREN[0];
		
		return FWLocalization.text("TXT_" + itemId);
	},
	
	getItemDesc:function(itemId)
	{
		if(!itemId)
			return itemId;
		return FWLocalization.text("TXT_DESC_" + itemId);
	},
	
	// get materials and amount by subtype
	getMaterialsBySubtype:function(subtype, onlyReturnMaterialsThatAreInStock)//web getMaterialsBySubtype:function(subtype, onlyReturnMaterialsThatAreInStock = false)
	{
		if(onlyReturnMaterialsThatAreInStock === undefined)
			onlyReturnMaterialsThatAreInStock = false;
		
		var res = [];
		for(var key in g_MATERIAL)
		{
			if(g_MATERIAL[key].SUB_TYPE === subtype)
			{
				var amount = gv.userStorages.getItemAmount(key);
				if(amount > 0 || !onlyReturnMaterialsThatAreInStock)
					res.push({itemId:key, amount:amount});
			}
		}
		return res;
	},
	
	loadUserData:function(object, isMainUser)//web loadUserData:function(object, isMainUser = true)
	{
		if(isMainUser === undefined)
			isMainUser = true;
		
		// - modify destination path
		// - uncomment to save jack's data
		// - remove xml tags
		//jsb.fileUtils.writeToFile({data:JSON.stringify(object)}, "d:/sgm20182/client/src/constants/jack.json");
		
		var userData = new UserData();
		userData.setGame(object[KEY_GAME]);
		userData.privateShop = object[KEY_PRIVATE_SHOP];
		MailBox.updateMailBoxDataFromServer(userData, object[KEY_MAIL_BOX], isMainUser);//userData.mailBox = object[KEY_MAIL_BOX];
		userData.airship = object[KEY_AIRSHIP];
		userData.userId = object[KEY_USER_ID];
		userData.userName = object[KEY_GAME][GAME_NAME];//userData.userName = object[KEY_USER_NAME];
		userData.realUserName = object[KEY_USER_NAME];
		
		if(isMainUser)
		{
			gv.mainUserData = userData;
			gv.mainUserData.mainUserId = userData.userId;

			Guild.setPlayerGuildData(object[KEY_GUILD]);
			Guild.loadPlayerGuildData(); // feedback: load to get most recent data
			
			// fix: disconnect while in friend's garden => game reloads main user's garden
			if(FWUtils.getCurrentScene() === Game.gameScene)
			{
				// reconnected
				if(!Game.isFriendGarden())
					gv.userData = userData;
			}
			else
				gv.userData = userData;
			
			userData.setCoin(object[KEY_COIN]);
			gv.jackMachine = object[KEY_JACK_MACHINE];
			gv.jackShop = object[KEY_JACK_SHOP];
			Game.deltaServerTime = object[KEY_TIME_MILLIS] - _.now();
			
			if(cc.sys.isNative)
			{
				cc.log("Login.KEY_USE_LOCAL_PAYMENT", object[KEY_USE_LOCAL_PAYMENT]);
				if(fr && fr.NativePortal && fr.NativePortal.getInstance().isShowLocalShop) {
					var isShowLocalShop = fr.NativePortal.getInstance().isShowLocalShop();	
					cc.log("NativePortal.isShowLocalShop", isShowLocalShop);			
					Payment.hasLocalPayment = isShowLocalShop && object[KEY_USE_LOCAL_PAYMENT];
				} else {
					Payment.hasLocalPayment = object[KEY_USE_LOCAL_PAYMENT];
				}
				
				if(fr && fr.NativePortal && fr.NativePortal.getInstance().isShowInappShop){
					var isShowInappShop = fr.NativePortal.getInstance().isShowInappShop();
					cc.log("isShowInappShop", isShowInappShop);			
					Payment.hasIAP = isShowInappShop && g_PAYMENT_DATA.ACTIVE_IAP;
				} else {
					Payment.hasIAP = g_PAYMENT_DATA.ACTIVE_IAP;
				}
			}
			else
			{
				//web
				Payment.hasLocalPayment = true;
				Payment.hasIAP = false; 
			}
			
			cc.log("Payment.hasIAP", Payment.hasIAP);	
			cc.log("Payment.hasLocalPayment", Payment.hasLocalPayment);			
			
			gv.userStorages = new UserStorage();
			for (var i = 0, size = g_STOCK.length; i < size; i++)
				gv.userStorages.load(i, userData.game[GAME_STOCK_LEVEL]);
			gv.userStorages.updateItems(userData.game[GAME_STOCK_MAP]);

			if (gv.dailygift.haveDailyGift())
				gv.dailygift.requestRewards();

			// moved to MailBox.updateMailBoxDataFromServer
			// update mail text
			// var mailList = gv.userData.getMailList();
			// for(var i in mailList)
			// {
				// var mail = mailList[i];
				// if (mail[MAIL_TYPE] === MAIL_OFFER)
					// mail[MAIL_TITLE] = gv.offerPanel.offerName (mail[MAIL_TITLE]);
				// else if (mail[MAIL_TYPE] === MAIL_FIRST_CHARGE_ITEM)
					// mail[MAIL_TITLE] = Payment.getFirstChargeMailTitle(mail[MAIL_TITLE]);
			// }
			
			this.trackLoginGSN(userData.userId, object[KEY_USER_NAME]);				
			this.checkBonusOldUser();
		
			// fix: exception 		
			if(Payment.isLocalPaymentEnabled !== null)
				Payment.setLocalPaymentEnabled(Payment.isLocalPaymentEnabled);


			// set Data pigbank
			var pigBank = object[KEY_GAME][GAME_PIG_BANK];
			userData.currentDiamond = pigBank[PIG_CURRENT_DIAMOND];
			userData.timeGetReward  = pigBank[PIG_TIME_GET_REWARD];
			cc.log("PIGBANK: GET DIAMOND NETWORK : ",userData.currentDiamond);
			userData.setPigBank(pigBank[PIG_CURRENT_DIAMOND]);


			//set DataVip
			var vip = object[KEY_GAME][GAME_VIP];
			gv.vipManager.init(vip[VIP_CURRENT_ACTIVE]);
			gv.vipManager.timeEndValid = vip[VIP_CURRENT_ACTIVE_TIME_EXPIRE];
			gv.vipManager.timeBought= vip[VIP_CURRENT_ACTIVE_TIME_ACTIVE];
			cc.log("VIP CREATE : ICON : "+ vip[VIP_CURRENT_ACTIVE]+ " , EXPIRE :"+ vip[VIP_CURRENT_ACTIVE_TIME_EXPIRE] +" , BEGIN :"+vip[VIP_CURRENT_ACTIVE_TIME_ACTIVE]);
			
			// fix: incorrect quest counts due to reference mismatch
			QuestBook.init();

			// set DataTruck
			var truck = object[KEY_GAME][GAME_TRUCK];
			Truck.setData(truck);
		}
		else
		{
			userData.setCoin(gv.mainUserData.getCoin());
			userData.setGold(gv.mainUserData.getGold());
			userData.setReputation(gv.mainUserData.getReputation());
			userData.game[GAME_PAYMENT] = gv.mainUserData.game[GAME_PAYMENT]; // jira#5669
			userData.game[GAME_TUTORIAL] = gv.mainUserData.game[GAME_TUTORIAL]; // fix: visit friend => trigger friend's tutorial
			userData.game[GAME_RANKING_PR] = gv.mainUserData.game[GAME_RANKING_PR]; // fix: incorrect garden value
			gv.userData = userData;
		}
	},	

	isTrackLoginGSN: false,
	trackLoginGSN:function (_userId, _userName) {   		
		if (this.isTrackLoginGSN)
			return;
		this.isTrackLoginGSN = true;
					
		/*
        switch (_accountType)
        {
            case ZPLOGIN_FACEBOOK:
                _openAccount = fr.facebook.getCurrentUsername();
                break;
            case ZPLOGIN_GOOGLE:
                _openAccount = fr.google.getCurrentUsername();
                break;
            case ZPLOGIN_ZINGME:
                _openAccount = fr.zacc.getCurrentUsername();
                break;
		}*/
		
		fr.platformWrapper.trackLoginGSN(_userId, FWClientConfig.socialType, "", _userName);		
	},
	
	isCheckBonusOldUser: false,
	checkBonusOldUser:function () {
		if (!g_MISCINFO.CONVERT_OLD_USER)
			return;

		if (this.isCheckBonusOldUser)
			return;
		this.isCheckBonusOldUser = true;	

		//test
		// var oldFacebookId = ""; //100000152695587 1508867709397512;
		// var pk = network.connector.client.getOutPacket(network.RequestConvertOldUser);
		// pk.pack(oldFacebookId);
		// network.connector.client.sendPacket(pk);

		cc.log("[BonusOldUser]", "socialType", FWClientConfig.socialType);
		if (FWClientConfig.socialType != ZPLOGIN_FACEBOOK)
			return;

		cc.log("[BonusOldUser]", "isConvert", gv.userData.game[GAME_IS_CONVERT]);
		if (gv.userData.game[GAME_IS_CONVERT])
			return;
			
		var token = fr.portalState.getAccessToken();
		cc.log("[BonusOldUser]", "token", token);
		if (!token)
			return;		
		
		var url = "https://graph.facebook.com/me/ids_for_apps?app=375025142630446&access_token=" + token;
		cc.log("[BonusOldUser]", "url", url);
		ZPLogin.httpRequest(url, this.handleOldFacebookId.bind(this));
	},	
	handleOldFacebookId:function(response) {
		if (response) {
			cc.log("[BonusOldUser]", "ids_for_apps", response);
			var obj = JSON.parse(response);			
			if (obj.error) {
				cc.log("[BonusOldUser]", "ERROR");
			} else {
				var oldFacebookId = "";
				if (obj.data && obj.data.length > 0) {
					var oldFacebookId = obj.data[0].id;
					cc.log("[BonusOldUser]", "oldFacebookId", oldFacebookId);			
				} else {					
					cc.log("[BonusOldUser]", "It's not old user");			
				}					
				var pk = network.connector.client.getOutPacket(network.RequestConvertOldUser);
				pk.pack(oldFacebookId);
				network.connector.client.sendPacket(pk);
			}
		} else {			
			cc.log("[BonusOldUser]", "ids_for_apps", "FAIL");
		}				
	},
	
	pendingPopup: null,
	isAnyPopupShowing:function()
	{
		// fix: game freezes if tutorial is shown while skip-time popup is showing
		if(this.skipTimeWidget)
			return true;
		
		if(this.pendingPopup)
			return true;
		
		if (this.gameScene)
			return (this.gameScene.backKeyStack && this.gameScene.backKeyStack.length > 0);
		return false;
	},
	
	getGardenValue:function()
	{
		return Ranking.getUserRankData(RANKING_TAB_VALUE, RANK_POINT);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// gfx ////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	// below code is kept for compatibility only, TODO: remove ////////////////////////
	// next time, use getItemGfxByDefine instead //////////////////////////////////////
	getPlantSpineByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_PLANT[def].GFX;
		return cc.formatStr(SPINE_PLANTS, gfx, gfx);
	},

	getPlantScaleByDefine: function (def) {
		var scale = def.SCALE;
		if (scale === undefined && g_PLANT[def] !== undefined)
			scale = g_PLANT[def].SCALE;
		if (scale === undefined)
			return 0.6;
		return scale;
	},

	getPotSpineByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_POT[def].GFX;
		return cc.formatStr(SPINE_POTS, gfx, gfx);
	},

	getPotSkinByDefine: function (def) {
		var skin = def.SKIN;
		if (skin === undefined)
			skin = g_POT[def].SKIN;
		return skin;
	},

	getPotToPlantOffset: function (def) {
		var posY = def.PLANT_POS;
		if(posY === undefined)
			posY = g_POT[def].PLANT_POS;
		return cc.p(0, posY || 37);
	},

	getBugSpineByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_PEST[def].GFX;
		return cc.formatStr(SPINE_BUGS, gfx, gfx);
	},

	getDecorSpineByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_DECOR[def].GFX;
		return cc.formatStr(SPINE_DECORS, gfx, gfx);
	},

	getDecorSkinByDefine: function (def) {
		var skin = def.SKIN;
		if (skin === undefined)
			skin = g_DECOR[def].SKIN;
		return skin;
	},

	getMachineSpineByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_MACHINE[def].GFX;
		return cc.formatStr(SPINE_MACHINES, gfx, gfx);
	},

	getProductSpriteByDefine: function (def) {
		var gfx = def.GFX;
		if (gfx === undefined)
			gfx = g_PRODUCT[def].GFX;
		return cc.formatStr(SPRITE_PRODUCTS, gfx);
	},

	getMaterialSpriteByDefine: function (def) {
		if(def === ID_GOLD)
			return cc.formatStr(SPRITE_MATERIALS, "item_gold_01.png");
		
		var gfx = def.GFX;
		if(gfx === undefined)
			gfx = g_MATERIAL[def].GFX;
		return cc.formatStr(SPRITE_MATERIALS, gfx);
	},
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////

	getActionById: function(id)
	{
		//cc.log("ACTION ID :", id);
		return this.gameActions[id];
	},

	// returns: sprite, spine, skin, anim, scale
	getItemGfxByDefine:function(def, options)
	{
		if(_.isString(def))
		{
			var id = def;
			def = defineMap[def];
			
			if(!def)
			{
				if(id.startsWith("ACHIEVEMENT_"))
				{

					// achievement icons
					var task = g_ACHIEVEMENT.tasks[Number(id.substring(12))];
					var action = task.ACTION;
					//cc.log("ACHIEVEMENT:",JSON.stringify(action), JSON.stringify(this.getActionNameById(action)));
					return this.getActionIcon(this.getActionById(action), task);
				}
				else if(id.startsWith("ACTION_"))
				{
					// action icons
					return this.getActionIcon(this.getActionById(Number(id.substring(7))));
				}
				else if(id === "TROPHY")
				{
					var res = {};
					res.sprite = "items/item_trophy.png",
					res.scale = 0.65;
					return res;
				}
				else if(id === "PACK")
				{
					var res = {};
					res.spine = SPINE_GIFT_BOX_EVENT;
					//res.anim = "gift_box_normal_active";
					return res;
				}
			}
		}

		if (def === undefined)
			return { sprite: "items/item_lost.png" };
		
		var res = {};
		var type = def.TYPE;
		if(type === defineTypes.TYPE_NONE)
		{
			var id = def.ID;
			if(id === ID_GOLD)
			{
				if(options)
				{
					if(options.isBigIcon)
						res.sprite = cc.formatStr(SPRITE_MATERIALS, "item_gold_01.png");
					else if(options.isBonus)
						res.sprite = "hud/icon_gold_bonus.png";
					else if(options.isPackGold)
						res.sprite = "items/item_gold_01.png";
				}
				if(res.sprite === undefined)
					res.sprite = "hud/icon_gold.png";
			}
			else if(id === ID_EXP)
			{
				if(options)
				{
					if(options.isBonus)
						res.sprite = "hud/icon_exp_bonus.png";
					else if(options.isPackExp)
						res.sprite = "items/item_exp.png";
				}
				if(res.sprite === undefined)
					res.sprite = "hud/icon_exp.png";
			}
			else if(id === ID_COIN)
				res.sprite = "hud/icon_gem.png";
			else if(id === ID_REPU)
				res.sprite = "hud/icon_heart.png";
            else if(id === ID_X2) {
                res.sprite = "items/item_bonus_x2.png";
                res.scale = 0.6;
			}
            else if(id === ID_DICE) {
				res.sprite = "items/item_soul_seed.png",
				res.scale = 0.5;
			}
		}
		else
		{
			if(type === defineTypes.TYPE_PLANT)
			{
				// jira#5601
				//res.spine = cc.formatStr(SPINE_PLANTS, def.GFX, def.GFX);
				//res.scale = (def.SCALE || 0.6);
				//res.anim = "plant_icon_small";
				res.sprite = this.getPlantGfxMap()[def.ID];
				res.scale = 0.6;
			}
			else if(type === defineTypes.TYPE_PEST)
			{
				/*res.spine = cc.formatStr(SPINE_BUGS, def.GFX, def.GFX);
				res.scale = (def.SCALE || 0.3);
				if(def.ID === "B6")
					res.scale = 0.5;
				res.anim = "bug_icon_small";*/
				switch (def.ID)
				{
					case "B0": res.sprite = "items/item_bug_red.png"; break;
					case "B1": res.sprite = "items/item_bug_yellow.png"; break;
					case "B2": res.sprite = "items/item_bug_blue.png"; break;
					case "B3": res.sprite = "items/item_bug_orange.png"; break;
					case "B4": res.sprite = "items/item_bug_pink.png"; break;
					case "B5": res.sprite = "items/item_bug_violet.png"; break;
					case "B6": res.sprite = "items/item_bug_green.png"; break;
				}
				res.scale = 0.65;
			}
			else if(type === defineTypes.TYPE_POT)
			{
				res.spine = cc.formatStr(SPINE_POTS, def.GFX, def.GFX);
				res.skin = def.SKIN;
				res.anim = "pot_icon_small";
			}
			else if(type === defineTypes.TYPE_PRODUCT)
			{
				res.sprite = cc.formatStr(SPRITE_PRODUCTS, def.GFX);
				res.scale = 0.65;
			}
			else if(type === defineTypes.TYPE_MACHINE)
			{
				// res.spine = cc.formatStr(SPINE_MACHINES, def.GFX, def.GFX);
				switch (def.ID)
				{
					case "MA0": res.sprite = "items/icon_machine_02_dryer.png"; break;
					case "MA1": res.sprite = "items/icon_machine_03_juice.png"; break;
					case "MA2": res.sprite = "items/icon_machine_03_looms.png"; break;
					case "MA3": res.sprite = "items/icon_machine_05_gems.png"; break;
					case "MA4": res.sprite = "items/icon_machine_06_oil.png"; break;
					case "MA5": res.sprite = "items/icon_machine_07_tea.png"; break;
					case "MA6": res.sprite = "items/icon_machine_08_flowers.png"; break;
					case "MA7": res.sprite = "items/icon_machine_09_perfume.png"; break;
					case "MA8": res.sprite = "items/icon_machine_10_aromatic.png"; break;
					case "MA9": res.sprite = "items/icon_machine_11_sewing.png"; break;
				}
				res.scale = 0.65;
			}
			else if(type === defineTypes.TYPE_MATERIAL || type === defineTypes.TYPE_MINIGAME|| type === defineTypes.TYPE_GACHAPON)
			{
				res.sprite = cc.formatStr(SPRITE_MATERIALS, def.GFX);
				res.scale = 0.65;
			}
			else if(type === defineTypes.TYPE_DECOR)
			{
				res.spine = cc.formatStr(SPINE_DECORS, def.GFX, def.GFX);
				res.skin = def.SKIN;
                res.scale = 0.6;
				res.anim = "icon_big";
			}
            else if(type === defineTypes.TYPE_MINERAL)
            {
                res.sprite = cc.formatStr(SPRITE_MINERAL, def.GFX);
                res.scale = 0.6;
            }
            else if(type === defineTypes.TYPE_PEARL)
            {
                res.sprite = cc.formatStr(SPRITE_PEARL, def.GFX);
                res.scale = 0.6;
            }
            else if(type === defineTypes.TYPE_SKIN)
            {
                res.sprite = cc.formatStr(SPRITE_SKIN, def.GFX);
                res.scale = 0.65;
            }
            else if (type === defineTypes.TYPE_CHEST) {
                res.spine = SPINE_CHEST;
                res.skin = UI_CHEST_SKINS[def.ID];
                res.anim = UI_CHEST_ANIM_IDLE;
                res.scale = 0.15;
				res.offset = cc.p(0, -25);
			}
			else if(type === defineTypes.TYPE_EVENT)
			{
				res.sprite = cc.formatStr(SPRITE_EVENT, def.GFX);
				if(def.ID === EVENT_POSM_ITEM_ID)
					res.scale = 0.5;
				else if(def.ID === EVENT_TOKEN_ITEM_ID ||EVENT2_TOKEN_ITEM_IDS.indexOf(def.ID)>-1)
					res.scale = 0.6;
				else
					res.scale = 0.55;

				if(def.SUB_TYPE === defineTypes.SUB_TYPE_POSM)
				{
					res.scale = 0.35;
				}

			}
			else if (type === defineTypes.TYPE_HOOK ||type === defineTypes.TYPE_FISHING_ITEM)
			{
				//cc.log("getItemGfxByDefine",JSON.stringify(def));
				res.sprite = cc.formatStr(SPRITE_HOOK, def.GFX);
				res.scale = 0.7;
				//let id = def.ID;
			}
		}
		
		return res;
	},
	
	getPlantGfxMap:function()
	{
		if(!this.plantGfxMap && g_PLANT)
		{
			this.plantGfxMap ={};
			for(var key in g_PLANT)
			{
				this.plantGfxMap[key] = g_PLANT[key].ICON_PATH;
			}
			//this.plantGfxMap =
			//{
			//	T0:"items/item_plant_event.png",//T0:"items/item_plant_event_00.png",
			//	T1:"items/item_plant_01_red_rose.png",
			//	T2:"items/item_plant_02_apple.png",
			//	T3:"items/item_plant_03_cotton.png",
			//	T4:"items/item_plant_04_snowflakes.png",
			//	T5:"items/item_plant_05_lavender.png",
			//	T6:"items/item_plant_06_coconut.png",
			//	T7:"items/item_plant_07_lemon.png",
			//	T8:"items/item_plant_08_water_melon.png",
			//	T9:"items/item_plant_09_tea.png",
			//	T10:"items/item_plant_10_jackfruit.png",
			//	T11:"items/item_plant_11_pineapple.png",
			//	T12:"items/item_plant_12_mango.png",
			//	T13:"items/item_plant_13_grapes.png",
			//	T14:"items/item_plant_14_jasmine.png",
			//	T15:"items/item_plant_15_chrysanthemum.png",
			//	T16:"items/item_plant_16_baby.png",
			//	T17:"items/item_plant_17_lotus.png",
			//	T18:"items/item_plant_18_sunflower.png",
			//	T19:"items/item_plant_19_blueberry.png",
			//	T20:"items/item_plant_20_strawberry.png",
			//	T100:"items/item_plant_20_strawberry.png",
			//}
		}
		return this.plantGfxMap;
	},
	
	getActionIcon:function(action, task, target)
	{
		/*
		if(action === ACTION_ORDER_DELIVERY || action === ACTION_ORDER_DAILY_DELIVERY || action === ACTION_ORDER_NORMAL_DELIVERY)
			return {sprite:"items/item_achievement_01.png", scale:0.6};
		else if(action === ACTION_SHOP_GET_MONEY || action === ACTION_PRIVATE_SHOP_PUT || action === ACTION_PRIVATE_SHOP_FRIEND_BUY)
			return {sprite:"items/item_achievement_02.png", scale:0.6};
		else if(action === ACTION_FRIEND_BUG_CATCH)
			return {sprite:"items/item_bug_net_green.png", scale:0.6};
		else if(action === ACTION_PLANT_CATCH_BUG)
			return {sprite:"items/item_bug_net_gold.png", scale:0.6};
		else if(action === ACTION_POT_UPGRADE_SUCCESS || action === ACTION_POT_UPGRADE)
			return {sprite:"items/item_achievement_15.png", scale:0.6};
		else if(action === ACTION_POT_UPGRADE_FAIL)
			return {sprite:"items/item_achievement_14.png", scale:0.6};
		else
		if(action === ACTION_CHECK_COMBO_POT)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else if(action === ACTION_FRIEND_ACCEPTED_REQUEST)
			return {sprite:"items/item_achievement_20.png", scale:0.6};
		else if(action === ACTION_AIRSHIP_DELIVERY)
			return {sprite:"items/item_achievement_03.png", scale:0.6};
		else if(action === ACTION_DICE_SPIN)
			return {sprite:"items/item_achievement_23.png", scale:0.6};
		else if(action === ACTION_LUCKY_SPIN)
			return {sprite:"items/item_achievement_24.png", scale:0.6};
		else if(action === ACTION_FRIEND_SEND_REQUEST)
			return {sprite:"items/item_achievement_22.png", scale:0.6};
		else if(action === ACTION_MACHINE_REPAIR)
			return {sprite:"items/item_achievement_18.png", scale:0.6};
		else if(action === ACTION_FRIEND_REPAIR_MACHINE)
			return {sprite:"items/items_quest_07.png", scale:0.6};
		else if(action === ACTION_FRIEND_VISIT)
			return {sprite:"items/item_achievement_21.png", scale:0.6};
		else if(action === ACTION_AIRSHIP_FRIEND_PACK)
			return {sprite:"items/items_quest_10.png", scale:0.6};
		else if(action === ACTION_AIRSHIP_PACK)
			return {sprite:"items/items_quest_09.png", scale:0.6};
		else if(action === ACTION_AIRSHIP_REQUEST_HELP)
			return {sprite:"items/item_achievement_19.png", scale:0.6};
		else if(action === ACTION_MINE_START)
			return {sprite:"items/item_achievement_17.png", scale:0.6};
		else if(action === ACTION_GACHA_OPEN)
			return {sprite:"items/item_achievement_25.png", scale:0.6};
		else if(action === ACTION_MAKE_POT_FAIL || action === ACTION_MAKE_POT)
			return {sprite:"items/item_achievement_16.png", scale:0.6};
		else if(action === ACTION_TOM_BUY || action === ACTION_TOM_FIND)
			return {sprite:"items/item_achievement_26.png", scale:0.6};
		else if(action === ACTION_CHECK_DECOR)
			return {sprite:"items/item_achievement_27.png", scale:0.6};
		else if(action === ACTION_MACHINE_UPGRADE)
			return {sprite:"items/items_quest_05.png", scale:0.6};
		else if(action === ACTION_STOCK_UPGRADE)
			return {sprite:"items/items_quest_06.png", scale:0.6};
		else if(action === ACTION_MACHINE_PRODUCE)
			return {sprite:"items/items_quest_08.png", scale:0.6};
		else if(action === ACTION_DAILY_LOGIN)
			return {sprite:"hud/icon_daily_gift.png", scale:1};
		else if(action === ACTION_COIN_CONSUME)
			return {sprite:"hud/icon_gem.png", scale:1};
		else if(action === ACTION_MACHINE_UNLOCK)
			return {sprite: "items/icon_machine_egg_unlock.png", scale: 1};
		else if(action === ACTION_MACHINE_UNLOCK_FINISH)
			return {sprite: "items/icon_machine_egg_finish.png", scale: 1};
		else if(action === ACTION_FLOOR_UNLOCK)
			return {sprite: "items/item_floor_unlock.png", scale: 0.65};
		else if(action === ACTION_ORDER_CANCEL)
			return {sprite: "items/item_order_cancel.png", scale: 0.65};
		else if(action === ACTION_REPU_COLLECT)
			return {sprite: "hud/icon_heart.png", scale: 1};
		else if(action === ACTION_IBSHOP_BUY)
			return {sprite: "items/icon_tab_ibshop_buy.png", scale: 1};
		else if(action === ACTION_POT_PUT)
			return {sprite: "items/item_pot_put.png", scale: 0.65};
		else if(action === ACTION_MACHINE_SLOT_UNLOCK)
			return {sprite: "items/items_machine_slot_unlock.png", scale: 0.65};
		else if(action === ACTION_TOM_HIRE)
			return {sprite: "items/item_tom_hire.png", scale: 0.6};
		else if(action === ACTION_LEVEL_UP)
			return {sprite: "items/item_levelup.png", scale: 0.6};
		else if(action === ACTION_TRUCK_PACK)
			return {sprite: "items/items_quest_11.png", scale: 0.6};
		else if(action === ACTION_TRUCK_DELIVERY)
			return {sprite: "items/items_quest_12.png", scale: 0.6};
		else if(action === ACTION_PLANT_HARVEST)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else if(action === ACTION_MACHINE_HARVEST)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else if(action === ACTION_PLANT)
			return {sprite: "items/items_quest_00.png", scale: 0.6};
		else if(action === ACTION_FLIPPING_CARD)
			return {sprite: "hud/hud_minigame_reward_top.png", scale: 0.25};
		else if(action === ACTION_CLOUD_SKIN)
			return {sprite: "items/item_cloud_skin_00.png", scale: 0.6};
			*/

		if(action.VALUE === g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else if(action.VALUE === g_ACTIONS.ACTION_PLANT_HARVEST.VALUE)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else if(action.VALUE === g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE)
			return this.getItemGfxByDefine(target || g_COMBO[task.TARGET_ID].CHILDREN[0]);
		else
		if (action != null)
		{
			return {sprite: action.GFX, scale: action.SCALE};
		}
		return {sprite:"hud/icon_questbook.png"};
	},

	getDustAnimationByLevel: function (level) {
		/*if (level === undefined || level < 2)
			return null;
		else if (level < 4)
			return "cloud_dust_effect_1";
		else if (level < 6)
			return "cloud_dust_effect_2";
		else
			return "cloud_dust_effect_3";*/
		return null;
	},

	// move node to stock position
	flyToStorage: function (node, delay, scale) {//web flyToStorage: function (node, delay = 0, scale) {
		
		if(delay === undefined)
			delay = 0;
		
		var endPosition = FWUtils.getWorldPosition(Game.gameScene.uiMainImgStock);
		var seq = cc.sequence
		(
			cc.delayTime(delay),
			cc.jumpTo(0.8, endPosition, endPosition.y > node.getPositionY() ? -200 : 200, 1).easing(cc.easeQuadraticActionIn()),//cc.jumpTo(1, endPosition, endPosition.y > node.getPositionY() ? -200 : 200, 1),
			cc.callFunc(function() {Game.onItemFlownToDest(node, Game.gameScene.uiMainImgStock);})
		);
		node.runAction(seq);
		this.gameScene.showStockImage();
		
		if(scale !== undefined)
			node.runAction(cc.scaleTo(1, scale));
	},
	
	// get destination node that collected items will fly to
	getFlyingDestinationForItem:function(itemId)
	{
		var dest = null;
		if(itemId === ID_EXP)
			dest = Game.gameScene.uiMainImgExp;
		else if(itemId === ID_GOLD)
		{
			if(FWUI.isShowing(UI_PAYMENT))
			{
				var widget = FWPool.getNode(UI_PAYMENT, false);
				dest = FWUtils.getChildByName(widget, "goldIcon");
				
				if(!dest.originalScale)
					dest.originalScale = dest.getScale();
			}
			else
				dest = Game.gameScene.uiMainImgGold;
		}
		else if(itemId === ID_COIN)
		{
			if(FWUI.isShowing(UI_PAYMENT))
			{
				var widget = FWPool.getNode(UI_PAYMENT, false);
				dest = FWUtils.getChildByName(widget, "coinIcon");
				
				if(!dest.originalScale)
					dest.originalScale = dest.getScale();
			}
			else
				dest = Game.gameScene.uiMainImgCoin;
		}
		else if(itemId === ID_REPU)
			dest = Game.gameScene.uiMainImgHeart;
		else
			dest = Game.gameScene.uiMainImgStock;
		return dest;
	},
	
	// get destination position that collected items will fly to
	getFlyingDestinationPositionForItem:function(itemId)
	{
		var dest = this.getFlyingDestinationForItem(itemId);
		return FWUtils.getWorldPosition(dest);
	},
	
	onItemFlownToDest:function(item, dest)
	{
		if(dest)
		{
			var scale = (dest.originalScale || 1);
			dest.stopAllActions();
			dest.setScale(scale * 1.25);
			dest.runAction(cc.scaleTo(0.5, scale).easing(cc.easeBounceOut()));
			
			// feedback: fx must be behind stock image
			/*var sprite = new cc.Sprite("#hud/icon_effect.png");
			sprite.setOpacity(255);
			sprite.setScale(1.5);
			sprite.setPosition(item.getPosition());
			sprite.setLocalZOrder(item.getLocalZOrder() + 1);
			sprite.runAction(cc.scaleTo(0.25, 2));
			sprite.runAction(cc.sequence(cc.fadeTo(0.25, 0), cc.callFunc(function() {sprite.removeFromParent();})));
			item.getParent().addChild(sprite);*/
			var sprite = new cc.Sprite("#hud/icon_effect.png");
			sprite.setOpacity(255);
			sprite.setScale(2.5);
			sprite.setPosition(dest.getPosition());
			sprite.setLocalZOrder(dest.getLocalZOrder() - 1);
			sprite.runAction(cc.scaleTo(0.25, 3));
			sprite.runAction(cc.sequence(cc.fadeTo(0.25, 0), cc.callFunc(function() {sprite.removeFromParent();})));
			dest.getParent().addChild(sprite);
			
			// jira#6444
			if(dest === Game.gameScene.uiMainImgStock)
				Game.gameScene.uiMainImgStockTimer = 2;
		}
		
		// jira#4881
		var itemId = item.itemId;
		var amount = item.amount;
		if(itemId && amount)
		{
			if(amount > 0)
			{
				for(var key in FWUtils.flyingAmount)
				{
					if(key === itemId)
					{
						FWUtils.flyingAmount[key] -= amount;
						if(key === ID_EXP)
						{
							Game.refreshUIMain(RF_UIMAIN_EXP);
							// AudioManager.effect (EFFECT_GOLD_FLY_TO_STOCK_1);
						}
						else if(key === ID_GOLD)
						{
							Game.refreshUIMain(RF_UIMAIN_GOLD);
							AudioManager.effect (EFFECT_GOLD_COLLECT);
						}
						else if(key === ID_COIN)
						{
							Game.refreshUIMain(RF_UIMAIN_COIN);
							AudioManager.effect (EFFECT_GOLD_COLLECT);
						}
						else if(key === ID_REPU)
						{
							Game.refreshUIMain(RF_UIMAIN_REPU);
							// AudioManager.effect (EFFECT_GOLD_FLY_TO_STOCK_1);
						}
						break;
					}
				}
			}
		}
		
		item.removeFromParent();
		FWPool.returnNode(item);
	},
	
	uiMainRefreshFlags: RF_NONE,
	refreshUIMain:function(flag)
	{
		this.uiMainRefreshFlags |= flag;
	},
	
	getBuffIconByType:function(type)
	{
		if(type === BUFF_HARVEST_EXP)
			return "hud/icon_buff_plant_exp.png";
		else if(type === BUFF_HARVEST_GOLD)
			return "hud/icon_buff_plant_gold.png";
		else if(type === BUFF_HARVEST_TIME)
			return "hud/icon_buff_plant_time.png";
		else if(type === BUFF_ORDER_EXP)
			return "hud/icon_buff_order_exp.png";
		else if(type === BUFF_ORDER_GOLD)
			return "hud/icon_buff_order_gold.png";
		else if(type === BUFF_PRODUCTION_TIME)
			return "hud/icon_buff_machine_time.png";
		else if(type === BUFF_AIRSHIP_EXP)
			return "hud/icon_buff_carret_exp.png";
		else if(type === BUFF_AIRSHIP_GOLD)
			return "hud/icon_buff_carret_gold.png";
		else if(type === BUFF_PRODUCT_COLLECT_EXP)
			return "hud/icon_buff_plant_exp.png";
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// popup ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	popupZOrder:Z_POPUP,

	// displayInfo keys:
	// - title
	// - content
	// - icon: sprite name
	// - item: itemId
	// - iconBg: sprite name
	// - iconBgScale
	// - okText
	// - closeButton: true/false
	// - amount
	// - avatar: sprite name
	showPopup:function(displayInfo, okCallback, cancelCallback)//web showPopup:function(displayInfo, okCallback = null, cancelCallback = null)
	{
		if(okCallback === undefined)
			okCallback = null;
		if(cancelCallback === undefined)
			cancelCallback = null;
		
		// def
		var invisible = {visible:false};
		var uiDef =
		{
			bg:{scale9:true},
			bg2:{scale9:true},
		};
		
		// title
		if(displayInfo.title)
			uiDef.title = {type:UITYPE_TEXT, value:displayInfo.title, style:TEXT_STYLE_TITLE_1, visible:true};//uiDef.title = {type:UITYPE_TEXT, value:displayInfo.title, shadow:SHADOW_DEFAULT, visible:true};
		else
			uiDef.title = invisible;
		
		// content
		if(displayInfo.content)
		{
			var displayContent = {type:UITYPE_TEXT, value:displayInfo.content, style:TEXT_STYLE_TEXT_NORMAL_GREEN, visible:true};//var displayContent = {type:UITYPE_TEXT, value:displayInfo.content, shadow:SHADOW_DEFAULT, visible:true};
			if(displayInfo.icon || displayInfo.item)
			{
				uiDef.contentWicon = displayContent;
				uiDef.content = invisible;
			}
			else
			{
				uiDef.contentWicon = invisible;
				uiDef.content = displayContent;
			}
		}
		else
			uiDef.contentWicon = uiDef.content = invisible;
		
		// icon or item gfx
		if(displayInfo.icon)
		{
			uiDef.gfx = {visible:true};
			uiDef.sprite = {type:UITYPE_IMAGE, value:displayInfo.icon, visible:true};
		}
		else if(displayInfo.item)
			uiDef.gfx = {type:UITYPE_ITEM, value:displayInfo.item, visible:true};
		else
			uiDef.gfx = invisible;
		
		// icon bg
		if(displayInfo.iconBg && (displayInfo.icon || displayInfo.item))
		{
			uiDef.iconBg = {type:UITYPE_IMAGE, value:displayInfo.iconBg, visible:true, scale:displayInfo.iconBgScale || 0.75};
		}
		else
			uiDef.iconBg = invisible;
		
		// ok button
		if(okCallback)
		{
			uiDef.actionButton = {onTouchEnded:this.onPopupCallback.bind(this), visible:true, scale9:true, type:UITYPE_IMAGE, value:displayInfo.actionButtonSprite ? displayInfo.actionButtonSprite : "hud/btn_normal_green.png", width:160, height:53};
			uiDef.actionText = {type:UITYPE_TEXT, value:displayInfo.okText || "TXT_OK", style:TEXT_STYLE_TEXT_BUTTON, visible:true};//uiDef.actionText = {type:UITYPE_TEXT, value:displayInfo.okText || "TXT_OK", shadow:SHADOW_DEFAULT, visible:true};
		}
		else
			uiDef.actionButton = uiDef.actionText = invisible;
		
		// close button
		var hasCloseButton = false;
		if(displayInfo.closeButton || cancelCallback)
		{
			uiDef.closeButton = {onTouchEnded:this.onPopupCallback.bind(this), visible:true};
			hasCloseButton = true;
		}
		else
			uiDef.closeButton = invisible;
		
		// amount
		if(displayInfo.amount)
			uiDef.amount = {type:UITYPE_TEXT, value:displayInfo.amount, style:TEXT_STYLE_NUMBER, visible:true};//uiDef.amount = {type:UITYPE_TEXT, value:displayInfo.amount, shadow:SHADOW_DEFAULT, visible:true};
		else
			uiDef.amount = invisible;
		
		// avatar
		if(displayInfo.avatar)
		{
			if(displayInfo.avatar == NPC_NO_NPC)
			{
				uiDef.avatar2 = invisible;
				uiDef.avatar_bg = {visible:false};
				uiDef.avatar = {  visible:false };
			}
			else
			{
				if(displayInfo.avatarBg)
				{
					uiDef.avatar2 = invisible;
					uiDef.avatar_bg = {visible:true};
					uiDef.avatar = { type:UITYPE_IMAGE, value:displayInfo.avatar, visible:true };
				}
				else
				{
					uiDef.avatar_bg = invisible;
					uiDef.avatar2 = { type:UITYPE_IMAGE, value:displayInfo.avatar, visible:true };
				}
			}
		}
		else
		{
			uiDef.avatar2 = invisible;
			uiDef.avatar_bg = {visible:true};
			uiDef.avatar = { type:UITYPE_IMAGE, value:"npc/npc_Jack_01.png", visible:true };
		}

		// ui
		var widget = FWPool.getNode(UI_POPUP);
		if(!widget)
			return; // not loaded
		widget.setLocalZOrder(this.popupZOrder++);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);

		AudioManager.effect (EFFECT_POPUP_SHOW);

		widget.popupOkCallback = okCallback;
		widget.popupCancelCallback = cancelCallback;
		
		if((hasCloseButton || okCallback === true) && Game.gameScene)
		{
			widget.hideFunc = function() {Game.onPopupCallback(FWUtils.getChildByName(widget, "closeButton"));};
			Game.gameScene.registerBackKey(widget.hideFunc);
		}
		else
			delete widget.hideFunc;
		
		return widget;
	},

	onPopupCallback: function (sender) {
		var widget = FWUtils.getParentByName(sender, "popup");

		var name = (sender ? sender.getName() : "closeButton");
		if (name === "actionButton" && widget.popupOkCallback !== null && widget.popupOkCallback !== true)
			widget.popupOkCallback(sender);
		else if (name === "closeButton" && widget.popupCancelCallback !== null)
			widget.popupCancelCallback(sender);
		
		FWUI.hideWidget(widget, UIFX_POP);
		this.popupZOrder--;
		
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		
		if(widget.hideFunc)
		{
			Game.gameScene.unregisterBackKey(widget.hideFunc);
			delete widget.hideFunc;
		}
	},
	
	// called by old code
	// new code please use showPopup instead
	showPopup0:function(title, content, icon, okCallback, cancelCallback, okText)//web showPopup0:function(title, content, icon = null, okCallback = null, cancelCallback = null, okText = "OK")
	{
		if(icon === undefined)
			icon = null;
		if(okCallback === undefined)
			okCallback = null;
		if(cancelCallback === undefined)
			cancelCallback = null;
		if(okText === undefined)
			okText = "OK";
		
		this.showPopup({title:title, content:content, icon:icon, okText:okText, closeButton:cancelCallback !== null}, okCallback, typeof cancelCallback === "function" ? cancelCallback : null);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// quick buy popup //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	quickBuySuccessCallback: null,
	quickBuyMissingItems: null,
	quickBuyTotalPrice: null,
	
	// result object:
	// - missingAmount
	// - missingAmountPrice
	getMissingAmountAndPrice:function(itemId, requireAmount)
	{
		if(itemId === ID_GOLD)
		{
			if(gv.userData.getGold() < requireAmount)
				return {missingAmount:requireAmount - gv.userData.getGold(), missingAmountPrice:0};
		}
		else if(itemId === ID_COIN)
		{
			if(gv.userData.getCoin() < requireAmount)
				return {missingAmount:requireAmount - gv.userData.getCoin(), missingAmountPrice:requireAmount - gv.userData.getCoin()};
		}
		else if(itemId === ID_REPU)
		{
			if(gv.userData.getReputation() < requireAmount)
				return {missingAmount:requireAmount - gv.userData.getReputation(), missingAmountPrice:0};
		}
		else
		{
			// stock items
			var stockAmount = gv.userStorages.getItemAmount(itemId);
			if(stockAmount < requireAmount)
				return {missingAmount:requireAmount - stockAmount, missingAmountPrice:(requireAmount - stockAmount) * (defineMap[itemId].DIAMOND_BUY || 0)};
		}
		return {missingAmount:0, missingAmountPrice:0};
	},
	
	// requireItemList: array:
	// - itemId
	// - amount or requireAmount
	// result object:
	// - totalPrice
	// - missingItems: array:
	//		- itemId
	//		- amount or requireAmount
	//		- missingAmount, displayMissingAmount
	//		- missingAmountPrice
	getMissingItemsAndPrices:function(requireItemList)
	{
		var totalPrice = 0;
		var missingItemList = []
		for(var i=0; i<requireItemList.length; i++)
		{
			var requireItem = requireItemList[i];
			var missing = this.getMissingAmountAndPrice(requireItem.itemId, (requireItem.amount || requireItem.requireAmount));
			if(missing.missingAmount > 0)
			{
				requireItem.missingAmount = missing.missingAmount;
				requireItem.missingAmountPrice = missing.missingAmountPrice;
				requireItem.displayMissingAmount = "x" + requireItem.missingAmount;
				missingItemList.push(requireItem);
				totalPrice += requireItem.missingAmountPrice;
			}
		}
		return {totalPrice:totalPrice, missingItems:missingItemList};
	},

	// items in requireItemList must contain: itemId, amount or requireAmount
	showQuickBuy:function(requireItemList, successCallback, npc)//web showQuickBuy:function(requireItemList, successCallback = null, npc = null)
	{
		if(successCallback === undefined)
			successCallback = null;
		if(npc === undefined)
			npc = null;
		
		var missingItemsAndPrices = this.getMissingItemsAndPrices(requireItemList);
		this.quickBuyMissingItems = missingItemsAndPrices.missingItems;
		this.quickBuyTotalPrice = missingItemsAndPrices.totalPrice;
		
		if(this.quickBuyMissingItems.length <= 0 || this.quickBuyTotalPrice <= 0)
		{
			// no need to buy
			if(successCallback)
				successCallback();
			return;
		}
		
		// def
		var itemsPerPage = 6;
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"displayMissingAmount", style:TEXT_STYLE_NUMBER, visible:true},//amount:{type:UITYPE_TEXT, field:"displayMissingAmount", shadow:SHADOW_DEFAULT},
		};
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_QUICK_BUY_POPUP_TITLE", style:TEXT_STYLE_TITLE_1},//title:{type:UITYPE_TEXT, value:"TXT_QUICK_BUY_POPUP_TITLE", shadow:SHADOW_DEFAULT},
			content:{type:UITYPE_TEXT, value:"TXT_QUICK_BUY_POPUP_CONTENT", style:TEXT_STYLE_TEXT_NORMAL_GREEN},
			price:{type:UITYPE_TEXT, value:this.quickBuyTotalPrice, style:TEXT_STYLE_TEXT_BUTTON, color:this.quickBuyTotalPrice <= gv.userData.getCoin() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND},//price:{type:UITYPE_TEXT, value:this.quickBuyTotalPrice, shadow:SHADOW_DEFAULT},
			buyButton:{onTouchEnded:this.onQuickBuyCallback.bind(this), scale9:true},
			closeButton:{onTouchEnded: this.onQuickBuyCallback.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:this.quickBuyMissingItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
			npc:{visible:npc !== null, type:UITYPE_IMAGE, value:npc},
			nextPage:{visible:this.quickBuyMissingItems.length > itemsPerPage},
			prevPage:{visible:this.quickBuyMissingItems.length > itemsPerPage},
		};

		// ui
		var widget = FWUI.showWithData(UI_QUICK_BUY, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_UI_QUICK_BUY);

		this.quickBuySuccessCallback = successCallback;
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		
		if(!this.quickBuyHideFunc)
			this.quickBuyHideFunc = function() {this.onQuickBuyCallback(FWUtils.getChildByName(widget, "closeButton"))}.bind(this);
		Game.gameScene.registerBackKey(this.quickBuyHideFunc);
	},

	onQuickBuyCallback:function(sender)
	{
		var widget = FWUtils.getParentByName(sender, "popup");
		FWUI.hideWidget(widget, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.quickBuyHideFunc);

		var name = sender.getName();
		if (name === "buyButton")
		{
			var idList = [];
			var amountList = [];
			for(var i=0; i<this.quickBuyMissingItems.length; i++)
			{
				idList.push(this.quickBuyMissingItems[i].itemId);
				amountList.push(this.quickBuyMissingItems[i].missingAmount);
			}

			AudioManager.effect (EFFECT_GOLD_PAYING);

			//if(this.quickBuy(idList, amountList, 0, this.quickBuyTotalPrice, FWUtils.getWorldPosition(sender)) && this.quickBuySuccessCallback)
			//	this.quickBuySuccessCallback();
			var success = this.quickBuy(idList, amountList, 0, this.quickBuyTotalPrice, FWUtils.getWorldPosition(sender), function(error)
			{
				FWUtils.disableAllTouches(false);
				if(error === 0 && Game.quickBuySuccessCallback)
					Game.quickBuySuccessCallback();
			});

			if(success)
				FWUtils.disableAllTouches();
		}
		else
			AudioManager.effect (EFFECT_POPUP_CLOSE);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// empty stock warning //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	// jira#4751
	emptyStockWarningOkCallback: null,
	emptyStockWarningCancelCallback: null,
	
	showEmtpyStockWarning:function(itemList, okCallback, cancelCallback)
	{
		// def
		var itemsPerPage = 6;
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER, visible:true},//amount:{type:UITYPE_TEXT, value:"", shadow:SHADOW_DEFAULT},
		};
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_EMPTY_PLANT_WARNING_TITLE", style:TEXT_STYLE_TITLE_1},//title:{type:UITYPE_TEXT, value:"TXT_EMPTY_PLANT_WARNING_TITLE", shadow:SHADOW_DEFAULT},
			content:{type:UITYPE_TEXT, value:"TXT_EMPTY_PLANT_WARNING", style:TEXT_STYLE_TEXT_NORMAL_GREEN},//content:{type:UITYPE_TEXT, value:"TXT_EMPTY_PLANT_WARNING", shadow:SHADOW_DEFAULT},
			okText:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},//okText:{type:UITYPE_TEXT, value:"TXT_OK", shadow:SHADOW_DEFAULT},
			okButton:{onTouchEnded:this.onEmptyStockWarningCallback.bind(this)},
			closeButton:{onTouchEnded: this.onEmptyStockWarningCallback.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
			nextPage:{visible:itemList.length > itemsPerPage},
			prevPage:{visible:itemList.length > itemsPerPage},
		};

		// ui
		var widget = FWUI.showWithData(UI_EMPTY_STOCK_WARNING, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_UI_EMPTY_STOCK_WARNING);

		this.emptyStockWarningOkCallback = okCallback;
		this.emptyStockWarningCancelCallback = cancelCallback;
	},

	onEmptyStockWarningCallback:function(sender)
	{
		var widget = FWUtils.getParentByName(sender, "popup");
		FWUI.hideWidget(widget, UIFX_POP);

		var name = sender.getName();
		if (name === "okButton" && this.emptyStockWarningOkCallback)
			this.emptyStockWarningOkCallback();
		if (name === "closeButton" && this.emptyStockWarningCancelCallback)
			this.emptyStockWarningCancelCallback();
	},	
	
///////////////////////////////////////////////////////////////////////////////////////
//// gift popup ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	giftPopupReceiveCallback: null,
	giftPopupCancelCallback: null,
	giftPopupGiftList: null,
	giftPopupGiftPos: null,
	giftPopupReceiveInMailbox: false,
	giftPopupParticle: null,
	
	// giftList: {itemId1:amount1, itemId2:amount2, ...} or [{itemId:itemId1, amount:amount1}, {itemId:itemId2, amount:amount2}, ...]
	// return: widget
	showGiftPopup:function(giftList, title, receiveCallback, cancelCallback, receiveInMailbox, needCheckStock, isPOSM)//web showGiftPopup:function(giftList, title, receiveCallback, cancelCallback, receiveInMailbox = false, needCheckStock = true, isPOSM = false)
	{
		if(receiveInMailbox === undefined)
			receiveInMailbox = false;
		if(needCheckStock === undefined)
			needCheckStock = true;
		if(isPOSM === undefined)
			isPOSM = false;
		
		if(_.isArray(giftList) === false)
			giftList = FWUtils.getItemsArray(giftList);
			
		var itemDef =
		{
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9},
			fx2:{visible:"data.hasSmokeFx === true", type:UITYPE_SPINE, id:SPINE_EFFECT_SMOKE_PARTICLE, anim:"animation", scale:0.35, loop:false},
			gfx:{type:UITYPE_ITEM, field:"itemId", options:{isBigIcon:true}},
			amount:{type:UITYPE_TEXT, format:"x%s", field:"amount", style:TEXT_STYLE_NUMBER, visible: "data.amount > 0"},//amount:{type:UITYPE_TEXT, field:"amount", shadow:SHADOW_DEFAULT},
			bg:{visible:false}
		};
		
		var uiDef = 
		{
			tap2Receive:{onTouchEnded:this.receiveGiftFromPopup.bind(this)},
			btnBack:{onTouchEnded:this.hideGiftPopup.bind(this), visible:receiveInMailbox === false},
			title:{type:UITYPE_TEXT, value:title, style:TEXT_STYLE_TITLE_1},//title:{type:UITYPE_TEXT, value:title, shadow:SHADOW_DEFAULT},
			subtitle:{type:UITYPE_TEXT, value:isPOSM ? "TXT_EVT_HINT_OUTGAME_PUZ" : "TXT_MAILBOX_TOUCH_TO_RECEIVE", style:TEXT_STYLE_TEXT_NORMAL},//subtitle:{type:UITYPE_TEXT, value:"TXT_MAILBOX_TOUCH_TO_RECEIVE", shadow:SHADOW_DEFAULT},
			itemList:{type:UITYPE_2D_LIST, itemUI:UI_MAILBOX_RECEIVE_ITEM, itemDef:itemDef, itemSize:cc.size(200, 200), items:giftList, singleLine:true, itemsAlign:"center", onTouchEnded:this.receiveGiftFromPopup.bind(this)},
		};
		
		this.giftPopupReceiveCallback = receiveCallback;
		this.giftPopupCancelCallback = cancelCallback;
		this.giftPopupGiftList = giftList;
		this.giftPopupReceiveInMailbox = receiveInMailbox;
		this.giftPopupNeedCheckStock = needCheckStock;
		
		var widget = FWUI.showWithData(UI_MAILBOX_RECEIVE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_POPUP);
		
		this.giftPopupGiftPos = [];
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var children = itemList.getChildren();
		for(var i=0; i<children.length; i++)
			this.giftPopupGiftPos.push(FWUtils.getWorldPosition(children[i]));
		
		// fx
		if(!this.giftPopupParticle)
		{
			this.giftPopupParticle = new cc.ParticleSystem("effects/particle_congrats.plist");
			this.giftPopupParticle.retain();
			this.giftPopupParticle.setPosition(cc.p(0, 0));
			this.giftPopupParticle.setLocalZOrder(-1);
			this.giftPopupParticle.setDuration(-1);
			this.giftPopupParticle.setTotalParticles(15);
			this.giftPopupParticle.setPosVar(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
		}
		this.giftPopupParticle.removeFromParent();
		var center = FWUtils.getChildByName(widget, "center");
		center.addChild(this.giftPopupParticle);
		
		// jira#5132
		FWUtils.showDarkBg(null, Z_POPUP - 1, "darkBgGiftPopup", null, true);
		
		if(!this.giftPopupHideFunc)
			this.giftPopupHideFunc = function() {if(!this.giftPopupReceiveInMailbox) this.hideGiftPopup();}.bind(this);
		Game.gameScene.registerBackKey(this.giftPopupHideFunc);
		
		return widget;
	},
	
	hideGiftPopup:function(sender)
	{
		FWUI.hide(UI_MAILBOX_RECEIVE, UIFX_POP);
		if(this.giftPopupCancelCallback)
			this.giftPopupCancelCallback();
		
		// jira#5132
		FWUtils.hideDarkBg(null, "darkBgGiftPopup");
		
		Game.gameScene.unregisterBackKey(this.giftPopupHideFunc);
	},
	
	canReceiveGift:function(giftList, showMessage)//web canReceiveGift:function(giftList, showMessage = true)
	{
		if(showMessage === undefined)
			showMessage = true;
		
		// check storage capacity
		var amountByStorage = {};
		for(var i=0; i<giftList.length; i++)
		{
			var itemId = giftList[i].itemId;
			var amount = giftList[i].amount;
			var itemConst = defineMap[itemId];
			if (itemConst)
			{
				var storage = gv.userStorages.getStorageForItemType(itemConst.TYPE);
				if(storage && storage.stockDefine.CAPACITY_INIT >= 0 && storage.isCountToCapacity(itemId))
				{
					if(amountByStorage[storage.type])
						amountByStorage[storage.type] += amount;
					else
						amountByStorage[storage.type] = amount;
					
					if(storage.capacityCurrent + amountByStorage[storage.type] > storage.capacityMax)
					{
						// debug log
						cc.log("Game::canReceiveGift: full stock: giftList=" + JSON.stringify(giftList) + " storage.type=" + storage.type + " capacityCurrent=" + storage.capacityCurrent + " capacityMax=" + storage.capacityMax + " amount=" + amountByStorage[storage.type]);
						
						// full
						if(showMessage)
						{
							Game.showUpgradeStock(null, itemConst.STOCK);
							//var storage2 = gv.userStorages.storages[0];
							//Game.showUpgradeStock (null, itemConst.STOCK, storage.type + " " + storage.capacityCurrent + " " + storage.capacityMax + " " + (storage === storage2) + " " + gv.userData.userId + " " + gv.mainUserData.mainUserId + " " + JSON.stringify(giftList));
						}
						return false;
					}
				}
			}
		}
		return true;
	},

	receiveGiftFromPopup:function(sender)
	{
		if(this.giftPopupReceiveInMailbox === false)
		{
			//this.hideGiftPopup(sender); // jira#5613
			if (this.giftPopupNeedCheckStock && !this.canReceiveGift(this.giftPopupGiftList))
				return;
		}
		
		// jira#5132
		FWUtils.hideDarkBg(null, "darkBgGiftPopup");		
		
		FWUI.hide(UI_MAILBOX_RECEIVE, UIFX_POP);
		if(this.giftPopupReceiveCallback)
			this.giftPopupReceiveCallback();
		Game.gameScene.unregisterBackKey(this.giftPopupHideFunc);

		// fx
		if(this.giftPopupReceiveInMailbox)
		{
			// fly to mail box
			for(var i=0; i<this.giftPopupGiftList.length; i++)
				FWUtils.showFlyingItemIcon(this.giftPopupGiftList[i].itemId, this.giftPopupGiftList[i].amount, this.giftPopupGiftPos[i], Game.gameScene.uiMainBtnMail, i * 0.15, false);
		}
		else
		{
			// fly to correct pos
			for(var i=0; i<this.giftPopupGiftList.length; i++)
				this.addItems([this.giftPopupGiftList[i]], this.giftPopupGiftPos[i], i * 0.15, this.giftPopupNeedCheckStock);
		}
	},

	showUpgradeStock: function (iconTab, stockType, customMessage)
	{
		// jira#6945
		if(!customMessage)
		{
			if(stockType === STORAGE_TYPE_FARM_PRODUCT)
				customMessage = "TXT_STORAGE_FULL_FARM";
			else if(stockType === STORAGE_TYPE_PRODUCT)
				customMessage = "TXT_STORAGE_FULL_PRODUCT";
			else if(stockType === STORAGE_TYPE_ITEMS)
				customMessage = "TXT_STORAGE_FULL_ITEMS";
			else if(stockType === STORAGE_TYPE_EVENTS)
				customMessage = "TXT_STORAGE_FULL_EVENTS";
			else if(stockType === STORAGE_TYPE_MINERALS)
				customMessage = "TXT_STORAGE_FULL_MINERALS";
			else
				customMessage = "TXT_STORAGE_FULL_CONTENT";
		}
		
		Game.showPopup0(
			"TXT_STORAGE_FULL_TITLE",
			customMessage ? customMessage : "TXT_STORAGE_FULL_CONTENT",
			iconTab, 
			function() {gv.gameBuildingStorageInterface.showStorageUIWithType(true, stockType, true, Z_POPUP + 1);},//web
			true,
			"TXT_UPGRADE"
		);
	},
	
	showFireworks:function(parent, option)//web showFireworks:function(parent, option = null)
	{
		if(option === undefined)
			option = null; 
		
		//if(parent.hasFireworks)
		//	return;
		//parent.hasFireworks = true;
		
		// clean up
		if(parent.firework_objs && parent.firework_objs.length > 0)
		{
			for(var i=0; i<parent.firework_objs.length; i++)
				parent.firework_objs[i].uninit();
		}
		
		var x = 200;
		var y = cc.winSize.height * 0.33;
		var w = cc.winSize.width - 400;
		var h = cc.winSize.height * 0.5;
		if (option)
		{
			if (option.x) x = option.x;
			if (option.y) y = option.y;
			if (option.w) w = option.width;
			if (option.h) h = option.height;
		}

		var firework = function(obj)//web
		{
			var play = cc.callFunc(function()//web
			{
				if (obj.node)
				{
					obj.setPosition (cc.p(Math.random() * w + x, Math.random() * h + y));
					obj.setAnimation("animation", false, function() {firework(obj);});
				}
			});

			parent.runAction (cc.sequence(cc.delayTime(Math.random() + 1), play));
		};

		var firework_objs = [];
		for (var i = 0; i < 6; i++)
		{
			var effect = new FWObject();
			effect.initWithSpine(SPINE_EFFECT_FIREWORK);
			effect.setParent(parent, 0);
			effect.setScale (0.6);
			effect.node.setTimeScale (1);

			firework_objs.push (effect);
			firework (effect);
		}
		
		parent.firework_objs = firework_objs;
	},
	
	getComboPotsCount:function(comboId)
	{
		var pots = g_COMBO[comboId].CHILDREN;
		var count = 0;
		for(var j=0; j<pots.length; j++)
		{
			var potId = pots[j];
			if(gv.userStorages.getItemAmount(potId) > 0)
				count++;
			else
			{
				// jira#6024: must check on floors too
				var floorsCount = CloudFloors.getLastUnlockedFloorIdx();
				var hasPot = false;
				for(var k=0; k<=floorsCount && !hasPot; k++)
				for(var l=0; l<MAX_SLOTS_PER_FLOOR; l++)
				{
					var slotData = CloudFloors.getSlotData(k, l);
					if(slotData && slotData[SLOT_POT] === potId)
					{
						hasPot = true;
						break;
					}
				}
				if(hasPot)
					count++;
			}
		}
		return count;
	},
	
	getAllDecorsCount:function()
	{
		var stockDecors = gv.userStorages.getAllItemOfType(defineTypes.TYPE_DECOR);
		var totalDecorsCount = 0;
		for(var j=0; j<stockDecors.length; j++)
			totalDecorsCount += stockDecors[j].itemAmount;
		
		// jira#6024: must check on floors too
		var floorsCount = CloudFloors.getLastUnlockedFloorIdx();
		for(var k=0; k<=floorsCount; k++)
		for(var l=0; l<MAX_SLOTS_PER_FLOOR; l++)
		{
			var slotData = CloudFloors.getSlotData(k, l);
			if(slotData && slotData[SLOT_DECOR])
				totalDecorsCount++;
		}
		
		return totalDecorsCount;
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// hint popup ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	showCommonHint:function(title, content)
	{
		var uiDef =
		{
			tapToClose:{onTouchEnded:this.hideCommonHint.bind(this)},
			title:{type:UITYPE_TEXT, value:title, style:TEXT_STYLE_TEXT_DIALOG_TITLE},
			content:{type:UITYPE_TEXT, value:content, style:TEXT_STYLE_TEXT_DIALOG},
		};
		
		var widget = FWUI.showWithData(UI_COMMON_HINT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_FX);
		
		FWUtils.showDarkBg(null, Z_FX - 1, "darkBgCommonHint");		

		AudioManager.effect (EFFECT_POPUP_SHOW);
		
		if(!this.hideFuncCommonHint)
			this.hideFuncCommonHint = function() {this.hideCommonHint();}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncCommonHint);
	},
	
	hideCommonHint:function()
	{
		if(FWUI.isShowing(UI_COMMON_HINT))
		{
			FWUI.hide(UI_COMMON_HINT, UIFX_POP);
			FWUtils.hideDarkBg(null, "darkBgCommonHint");
		}
		
		Game.gameScene.unregisterBackKey(this.hideFuncCommonHint);
	},

///////////////////////////////////////////////////////////////////////////////////////
//// skip time ////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	skipTimeWidget: null,
	skipTimeObject: null,
	skipTimeItemId: -1,
	skipTimeStartTime: -1,
	skipTimeEndTime: -1,
	skipTimeBar: null,
	skipTimeCallback: null,
	skipTimeButton: null,
	lblSkipTimePrice: null,
	lblSkipTimeProgress: null,
	
	// get amount of diamond required to skip time
	// also return finish time
	getSkipTimeDiamond: function (itemId, startTime, duration, endTime) {
		if(itemId === "ORDER" || itemId === "AD" || itemId === "AIRSHIP" || itemId === "MINER" || itemId === "TRUCK" || itemId === "DERBYTASK")
			skipTimeDefines = g_DIAMON_SKIP_TIME[itemId];
		else
		{
			var itemConst = defineMap[itemId];
			var skipTimeDefines;
			if (itemConst.TYPE === defineTypes.TYPE_PLANT) {
				duration = itemConst.GROW_TIME;
				skipTimeDefines = g_DIAMON_SKIP_TIME.PLANT;
			}
			else if (itemConst.TYPE === defineTypes.TYPE_MACHINE) {
				duration = itemConst.TIME_START;
				skipTimeDefines = g_DIAMON_SKIP_TIME.MACHINE;
			}
            else {
                duration = itemConst.PRODUCTION_TIME;
                skipTimeDefines = g_DIAMON_SKIP_TIME.PRODUCT;
            }
		}

		// get correct time range
		var sortedSkipTimeDefines = _.sortBy(skipTimeDefines, function (val) {
			return val.TIME_RANGE;
		});
		var i;
		for (i = 1; i < sortedSkipTimeDefines.length; i++) {
			if (sortedSkipTimeDefines[i].TIME_RANGE > duration) {
				i--;
				break;
			}
		}
		if (i >= sortedSkipTimeDefines.length)
			i = sortedSkipTimeDefines.length - 1;
		var skipTimeDefine = sortedSkipTimeDefines[i];

		// calc endTime or use passed endTime
		if(!endTime || endTime <= 0)
			endTime = startTime + duration;

		// calc return values
		var remainTime = endTime - Game.getGameTimeInSeconds();
		if (remainTime < 0)
			remainTime = 0;
		var diamond = Math.ceil((remainTime - skipTimeDefine.TIME_RANGE) * skipTimeDefine.RATIO / 100 + skipTimeDefine.DIAMOND_DEFAULT);
		
		// jira#5925
		if(Tutorial.isRunning())
			diamond = 0;
		
		return {endTime: endTime, diamond: diamond, remainTime: remainTime};
	},

	showSkipTimeEndTime: function (parent, position, itemId, endTime, skipTimeCallback, skipTimeObject, barName,callBackWhenHide) {//web showSkipTimeEndTime: function (parent, position, itemId, endTime, skipTimeCallback, skipTimeObject = null, barName = "barBlue") {
		
		if(skipTimeObject === undefined)
			skipTimeObject = null;
		if(barName === undefined)
			barName = "barBlue";
		
		this.skipTimeEndTime = endTime;
		this.callBackWhenHide = callBackWhenHide;
		this.showSkipTime(parent, position, itemId, Game.getGameTimeInSeconds(), skipTimeCallback, skipTimeObject, barName);
	},

	// show skip time ui
	showSkipTime: function (parent, position, itemId, startTime, skipTimeCallback, skipTimeObject, barName) {//web showSkipTime: function (parent, position, itemId, startTime, skipTimeCallback, skipTimeObject = null, barName = "barBlue") {
		
		if(skipTimeObject === undefined)
			skipTimeObject = null;
		if(barName === undefined)
			barName = "barBlue";
		
		// def
		var uiDef =
		{
			bg: {scale9: cc.rect()},
			barBlue: {visible: (barName === "barBlue")},
			barGreen: {visible: (barName === "barGreen")},
			barYellow: {visible: (barName === "barYellow")},
			barColors: {visible: (barName === "barColors")},
			btnSkipGold: {visible: false},
			btnSkipCoin: {onTouchEnded: this.onSkipTime.bind(this), visible: true},
			lblPrice: {style:TEXT_STYLE_TEXT_BUTTON},//lblPrice: {shadow: SHADOW_DEFAULT},
			lblProgress: {style:TEXT_STYLE_NUMBER},//lblProgress: {shadow: SHADOW_DEFAULT},
			tapToClose: {onTouchBegan: this.onCloseSkipTime.bind(this)},
		};

		// ui
		var widget = FWPool.getNode(UI_SKIP_TIME);
		FWUI.alignWidget(widget, position, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5));
		FWUI.showWidgetWithData(widget, null, uiDef, parent, UIFX_POP, false);
		widget.setSwallowTouches(false);

		this.skipTimeWidget = widget;
		this.skipTimeObject = skipTimeObject;
		this.skipTimeCallback = skipTimeCallback;
		this.skipTimeItemId = itemId;
		this.skipTimeStartTime = startTime;
		this.skipTimeBar = FWUI.getChildByName(widget, barName);
		this.lblSkipTimePrice = FWUI.getChildByName(widget, "lblPrice");
		this.lblSkipTimeProgress = FWUI.getChildByName(widget, "lblProgress");
		this.skipTimeButton = FWUI.getChildByName(widget, "btnSkipCoin");

		// update
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.onSkipTimeUpdate, 1, cc.REPEAT_FOREVER, 0, false);
		this.onSkipTimeUpdate(0);
		return widget;
	},

	onSkipTimeUpdate: function (dt) {
		var res = this.getSkipTimeDiamond(this.skipTimeItemId, this.skipTimeStartTime, 0, this.skipTimeEndTime);
		var remainTime = FWUtils.fastFloor(res.remainTime);
		if (remainTime <= 0) {
			res.endTime = Game.getGameTimeInSeconds();
			res.diamond = 0;
			this.onCloseSkipTime();
		}
		this.lblSkipTimePrice.setString(res.diamond > 0 ? res.diamond : FWLocalization.text("TXT_FREE"));
		this.lblSkipTimePrice.setColor(res.diamond <= gv.userData.getCoin() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
		this.lblSkipTimeProgress.setString(FWUtils.secondsToTimeString(remainTime));
		
        //BUG HERE: p can be infinite or NaN, need check logic
		var p = (res.endTime - Game.getGameTimeInSeconds()) / (res.endTime - this.skipTimeStartTime);
		if (isFinite(p) && p >= 0)//if (isNaN(p) && !isFinite (p))
			this.skipTimeBar.setPercent(100 * p);//this.skipTimeBar.setPercent(100 - ((Game.getGameTimeInSeconds() - this.skipTimeStartTime) * 100 / (res.endTime - this.skipTimeStartTime)));
	},

	onCloseSkipTime: function (sender) {
		if(sender && !Tutorial.acceptInput("closeSkipTime"))
			return;
		
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.onSkipTimeUpdate);
		
		if(this.skipTimeWidget)
		{
			FWUI.hideWidget(this.skipTimeWidget, UIFX_POP);
			this.skipTimeWidget = null;
		}
		if(this.callBackWhenHide) this.callBackWhenHide();
		this.callBackWhenHide = null;
		this.skipTimeEndTime = -1;
	},

	onSkipTime: function (sender) {
		var res = this.getSkipTimeDiamond(this.skipTimeItemId, this.skipTimeStartTime, 0, this.skipTimeEndTime);
		if (this.consumeDiamond(res.diamond, FWUtils.getWorldPosition(this.skipTimeButton)) === true)
		{
			this.onCloseSkipTime();
			this.skipTimeCallback(this.skipTimeObject, res, sender);
		}
		else
			this.onCloseSkipTime();
	},

///////////////////////////////////////////////////////////////////////////////////////
//// event handling ///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	onWidgetEvent_touchBegan: function (widget) {
		//var widgetName = widget.getName();
		//switch (widgetName) {
		//	case "UIItem"://case "UIItemContainer":
		//		if(!gv.gameBuildingStorageInterface.selectItemCallback && widget.uiData) {
		//			gv.hint.show(null, null, widget.uiData.itemId, { posX: cc.winSize.width * 0.75 });
		//		}
		//		break;
		//}
	},

	onWidgetEvent_touchEnded: function (widget) {
		var widgetName = widget.getName();
		switch (widgetName) {
			case "UpgradeButton":
				{
					var type = gv.gameBuildingStorageInterface.storageCurrentType;
					var coin = gv.gameBuildingStorageInterface.buyAllMissingCoinAmount;
					cc.log("UpgradeButton", type, coin);
					if (gv.userData.getCoin() < coin)
					{
						// jira#6447
						if(FWUI.isShowing(UI_MAILBOX_RECEIVE))
						{
							this.hideGiftPopup();
							gv.gameBuildingStorageInterface.showStorageUI(false);
						}
						
						Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function() {Game.openShop(ID_COIN);}, true, "TXT_BUY_DIAMOND");
					}
					else
					{
						if (coin)
							Game.consumeDiamond(coin, widget.getWorldPosition());
                            
						AudioManager.effect (coin ? EFFECT_GOLD_PAYING : EFFECT_ITEM_TOUCH);
						network.connector.sendRequestUpgradeStorage(type, coin);
					}
				}
				break;

			//case "UIItem"://case "UIItemContainer":
             //   //gv.hint.hide();
			//	if (gv.gameBuildingStorageInterface.selectItemCallback)
			//		gv.gameBuildingStorageInterface.selectItemCallback(widget);
			//	break;
		}

		if (widgetName.endsWith("tapToClose") === true) {
			// close popup when tapping outside
			FWUI.hideWidget(widget, UIFX_POP);
		}
	},

	// return true if dropping is successful
	// return false if you want to cancel dropping
	// and draggedObject will be moved back to its original position
	onWidgetEvent_drop: function (draggedObject, droppedObject) {
		return true;
	},

	onGameObjectEvent_touchBegan: function (object, fwObject) {

	},

	onGameObjectEvent_touchEnded: function (object, fwObject) {

	},

	onGameObjectEvent_longTouch: function (object, fwObject) {
	},

	blockedTouch: null, // swallowed touches, use this variable instead of creating new cc.Touch on every touch event
	longTouch: null,

	onBlockedTouchBegan: function (x, y) {
		if(cc.sys.isNative)
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, cc.winSize.height - y);
		else
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, y);
		if (FWUtils.getCurrentScene() === this.gameScene)
			this.gameScene.background.onTouchBegan(this.blockedTouch, null);
	},

	onBlockedTouchEnded: function (x, y) {
		if(cc.sys.isNative)
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, cc.winSize.height - y);
		else
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, y);
		if (FWUtils.getCurrentScene() === this.gameScene)
			this.gameScene.background.onTouchEnded(this.blockedTouch, null);
	},

	onBlockedTouchMoved: function (x, y) {
		if(cc.sys.isNative)
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, cc.winSize.height - y);
		else
			this.blockedTouch.setTouchInfo(BLOCKED_TOUCH_ID, x, y);
		if (FWUtils.getCurrentScene() === this.gameScene)
			this.gameScene.background.onTouchMoved(this.blockedTouch, null);
	},
	registerHandleAppEnterBackground: function () {
		cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, this.onRunBackground.bind(this));
		cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, this.onBackFromBackground.bind(this));
	},
	onRunBackground: function () {
		cc.log("onRunBackground");
		this.timePause = _.now();
		
		if (gv.notificationMgr)
			gv.notificationMgr.onHide();
	},
	onBackFromBackground: function () {
		var delta = this.timePause - _.now();
		cc.log("onBackFromBackground", delta);
		if(!isNaN(delta)) // fix: mature plants become seeds after connection lost
			this.deltaServerTime += delta;
		if (gv.gameClient.isConnected)
			network.sendRequestPing();

		if (gv.notificationMgr)
			gv.notificationMgr.onShow();
	},
	endGame: function () {
		cc.log("endGame");
		try {
			if (gv.gameClient.tcpClient)
				gv.gameClient.tcpClient.disconnect();			
		} catch(e) {
		}
		try {
			if (gv.chatClient)
				gv.chatClient.disconnect();
		} catch(e) {
		}
	
		Game.uninit();
		//cc.director.getScheduler().unscheduleAllCallbacks();
		FWObjectManager.cleanup();
		FWPool.removeNodes();
		cc.spriteFrameCache.removeUnusedSpriteFrames();
		cc.textureCache.removeUnusedTextures();
		
		if (ZPLogin.usePortal) {			
			cc.log("Back to portal");
			if(cc.sys.isNative) //native
				fr.NativeService.endGame();
			else if(fr.NativePortal) //web portal
				fr.NativePortal.backToPortal();
			else //web single
				fr.NativeService.endGame();
		} else {
			cc.log("End app");
			cc.director.end();
		}
	},
	
	// - fix: game crashes when quitting game using logout button or exit button
	// - to quit game, we must first finish game scene
	endGameScene:function()
	{
		//cc.director.popScene();
		if(cc.sys.isNative)
			cc.director.replaceScene(new cc.Scene());
		else
		{
			// jira#7413
			//location.reload(true);
			//window.open(FWLocalization.text("TXT_EVENT_FANPAGE_LINK").replace(/\|/g, "/"), "_self");
			if(ZPLogin.usePortal)
			{
				fr.NativePortal.backToPortal();
			}
			else
			{
				window.open("https://kvtm.vn", "_self");
			}
		}
	},
	
	onTouchEndedWrongWidget:function(widget)
	{
		if(FWUI.isShowing(UI_QUEST_BOOK))
			QuestBook.hideQuestHint();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// rating ///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	shouldShowRatingPopup: false,

	canRate:function()
	{
		return (g_MISCINFO.RATING_ACTIVE && !gv.userData.game[GAME_IS_RATING]);
	},

	showRatingPopup:function()
	{
		if(!this.canRate())
			return;
		
        var uiDef =
		{
			lb_title:{visible:false},
			lb_content:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_RATING_CONTENT"},
			lb_upgrade:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_RATING_BUTTON"},
			btn_upgrade:{onTouchEnded:this.onRating.bind(this)},
			btn_close:{onTouchEnded:this.hideRatingPopup.bind(this)},
			stars:{visible:true},
        };
		
		var widget = FWUI.showWithData(UI_POPUP_GAME_UPGRADE, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_POPUP);

		FWUtils.showDarkBg(null, Z_POPUP - 1, "darkBgRating", null, true);	
		AudioManager.effect (EFFECT_POPUP_SHOW);		
		
		if(!this.hideFuncRating)
			this.hideFuncRating = function() {this.hideRatingPopup()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFuncRating);
	},
	
	onRating:function(sender)
	{
		gv.userData.game[GAME_IS_RATING] = true;
		this.hideRatingPopup();
		if(gv.utilPanel.popupMain)
			gv.utilPanel.popupMain.hide();
		
		// open rating page
		cc.sys.openURL(FWLocalization.text("TXT_RATING_PAGE_LINK").replace(/\|/g, "/"));
		
		// server
		var pk = network.connector.client.getOutPacket(Game.RequestRatingGetReward);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	hideRatingPopup:function(sender)
	{
		if(FWUI.isShowing(UI_POPUP_GAME_UPGRADE))
		{
			FWUI.hide(UI_POPUP_GAME_UPGRADE, UIFX_POP);
			FWUtils.hideDarkBg(null, "darkBgRating");
			AudioManager.effect(EFFECT_POPUP_CLOSE);
			Game.gameScene.unregisterBackKey(this.hideFuncRating);
		}
	},

	RequestRatingGetReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.RATING_GET_REWARD);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
};


showLoadingProgress = function(show)
{
	if(cc.sys.isNative)
		return;
	
	if(show === undefined || show === true)
		document.getElementById("loading").style.display = "block";
	else
		document.getElementById("loading").style.display = "none";
};
