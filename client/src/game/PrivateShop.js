
// TODO:
// - limit gold income per day (server)
// TEST
// - avatars
// - gv.CMD.PRIVATE_SHOP_GET_MONEY ok
// - gv.CMD.PRIVATE_SHOP_FRIEND_BUY ok
// - gv.CMD.PRIVATE_SHOP_FRIEND_GET ok

const PS_SLOT_UID_UNLOCK_DIAMOND = -9998;
const PS_SLOT_UID_UNLOCK_FRIEND = -9999;

const PS_SELL_TO_GUEST = 0;
const PS_SELL_TO_FRIEND = 1;
const PS_SELL_TO_JACK = 2; // unused

var PrivateShop =
{
	currentSlotWidget: null,
	currentItemWidget: null,
	sellItem: null,
	sellAmount: 0,
	sellMinAmount: 0,
	sellMaxAmount: 0,
	sellTotalPrice: 0,
	sellMinPricePerItem: 0,
	sellMaxPricePerItem: 0,
	lblAmount: null,
	lblPrice: null,
	btnAmountInc: null,
	btnAmountDec: null,
	btnPriceInc: null,
	btnPriceDec: null,
	adsCheckIcon: null,
	setAdsButton: null,
	lblSkipTimePrice: null,
	friendId: null,
	friendData: null,
	privateShop: null,
	showAfterLoad: false, // jira#5638
	
	// jira#5754
	lastSoldItem: null,
	lastSoldAvgPrice: null,
	
	init:function()
	{
		this.refreshNotification();
	},
	
	uninit:function()
	{
		this.friendId = null;
	},
	
	show:function(sender, refresh, resetScrollPos)
	{
		if(gv.userData.getLevel() < g_MISCINFO.PS_USER_LEVEL)
		{
			if(!Game.isFriendGarden())
			{
				if(!sender)
					sender = gv.background.animShop.node;
				
				// show warning text if user has lower level
				var text = cc.formatStr(FWLocalization.text("TXT_PS_REQUIRE_LEVEL"), g_MISCINFO.PS_USER_LEVEL);
				FWUtils.showWarningText(text, FWUtils.getWorldPosition(sender));
			}
			return;
		}
		
		var slotList = this.getSlotList();
		
		// slot def
		var slotUIDef =
		{
			// locked
			lockedSlot:{visible:"data.index < 0"},
			unlockButton:{visible:"data.index < 0", onTouchEnded:this.onSlotUnlocking.bind(this)},
			unlockDiamond:{visible:"data.index === PS_SLOT_UID_UNLOCK_DIAMOND", onTouchEnded:this.onSlotUnlocking.bind(this)},
			unlockDiamondPrice:{visible:"data.index === PS_SLOT_UID_UNLOCK_DIAMOND", type:UITYPE_TEXT, field:"text", color:"data.textColor", style:TEXT_STYLE_TEXT_BUTTON},
			unlockDiamondIcon:{visible:"data.index === PS_SLOT_UID_UNLOCK_DIAMOND"},
			unlockFriend:{visible:"data.index === PS_SLOT_UID_UNLOCK_FRIEND", onTouchEnded:this.onSlotUnlocking.bind(this)},
			unlockFriendCount:{visible:"data.index === PS_SLOT_UID_UNLOCK_FRIEND", type:UITYPE_TEXT, field:"text", color:"data.textColor", style:TEXT_STYLE_TEXT_BUTTON},
			unlockFriendIcon:{visible:"data.index === PS_SLOT_UID_UNLOCK_FRIEND"},
			
			// unlocked
			unlockedSlot:{visible:"data.index >= 0"},
			slotButton:{visible:"data.index >= 0", onTouchEnded:this.onSlotSelected.bind(this)},
			gfx:{visible:"data.isEmpty === false && (data[PS_SLOT_IS_SOLD] === false || PrivateShop.isFriendPrivateShop() === true)", type:UITYPE_ITEM, field:PS_SLOT_ITEM, opacity:"(data.isUnlocked && data[PS_SLOT_IS_SOLD] === false) ? 255 : 64"},
			amount:{visible:"data.isEmpty === false && data[PS_SLOT_IS_SOLD] === false", type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER},
			ads:{visible:"data.isAdvertising === true && PrivateShop.isFriendPrivateShop() === false"},
			gold:{visible:false},//gold:{visible:"data.isEmpty === false && data[PS_SLOT_IS_SOLD] === true && PrivateShop.isFriendPrivateShop() === false"},
			goldAnim:{visible:"data.isEmpty === false && data[PS_SLOT_IS_SOLD] === true && PrivateShop.isFriendPrivateShop() === false", type:UITYPE_SPINE, value:SPINE_PSHOP_SLOT_GOLD_ANIM, anim:"gold_effect"},
			boughtAvatarFrame:{visible:"data[PS_SLOT_BUYER_AVATAR]"},
			boughtAvatar:{visible:"data[PS_SLOT_BUYER_AVATAR]", type:UITYPE_IMAGE, field:PS_SLOT_BUYER_AVATAR, size:64},
			priceBg:{visible:"data.isEmpty === false && (data[PS_SLOT_IS_SOLD] === false || PrivateShop.isFriendPrivateShop() === false)"},
			price:{visible:"data.isEmpty === false && (data[PS_SLOT_IS_SOLD] === false || PrivateShop.isFriendPrivateShop() === false)", type:UITYPE_TEXT, field:PS_SLOT_PRICE, color:"data[PS_SLOT_IS_SOLD] === true ? cc.GREEN : (PrivateShop.isFriendPrivateShop() === true && data[PS_SLOT_PRICE] > gv.userData.getGold() ? COLOR_NOT_ENOUGH_DIAMOND : cc.WHITE)", style:TEXT_STYLE_NUMBER},
			highlight:{visible:"data.isAdvertising === true"},
			soldText:{visible:"PrivateShop.isFriendPrivateShop() === true && data[PS_SLOT_IS_SOLD] === true", type:UITYPE_TEXT, value:"TXT_PS_SOLD", style:TEXT_STYLE_TEXT_NORMAL},
		};

		var avatar;
		if(PrivateShop.isFriendPrivateShop()) {
			if (this.friendId === USER_ID_JACK)
				avatar = "hud/hud_avatar_jack.png";
			else if(Game.isFriendGarden())
				avatar = Game.getFriendAvatarById(this.friendId);
			else
				avatar = this.friendData[NB_SLOT_USER_AVATAR];
		}

		// def
		var uiDef =
		{
			btnClose:{onTouchEnded:this.hide.bind(this)},
			friend:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden()},
			rightBg:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden() && NewsBoard.privateShopData.length > 1, onTouchEnded:this.onChangeFriend.bind(this)},
			leftBg:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden() && NewsBoard.privateShopData.length > 1, onTouchEnded:this.onChangeFriend.bind(this)},
			// TODO rightAvatar must scale 0.5
			// TODO leftAvatar must scale 0.5
			leftAvatar:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden() && NewsBoard.privateShopData.length > 1, type:UITYPE_IMAGE, value:Game.getFriendAvatarById(this.friendId), scale:0.5},
			rightAvatar:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden() && NewsBoard.privateShopData.length > 1, type:UITYPE_IMAGE, value:Game.getFriendAvatarById(this.friendId), scale:0.5},
			avatar:{visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden(), type:UITYPE_IMAGE, value:avatar, size:64},
			itemList:{type:UITYPE_2D_LIST, items:slotList, itemUI:UI_PRIVATE_SHOP_ITEM, itemDef:slotUIDef, itemSize:cc.size(180, 260), itemDirection:"vertical"},
			// jira#6106
			avatarFrame:{onTouchEnded:this.onAddFriend.bind(this)},
			addFriend:{onTouchEnded:this.onAddFriend.bind(this), visible:PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden() && FriendList.canAddFriend(this.friendId)},
		};
		if(PrivateShop.isFriendPrivateShop())
		{
			if(Game.isFriendGarden())
				uiDef.title = {type:UITYPE_TEXT, value:gv.userData.userName.toUpperCase(), format:"TXT_PS_OF", style:TEXT_STYLE_TITLE_1};
			else
				uiDef.title = {type:UITYPE_TEXT, value:this.friendData[NB_SLOT_USER_NAME].toUpperCase(), format:"TXT_PS_OF", style:TEXT_STYLE_TITLE_1};
		}
		else
			uiDef.title = {type:UITYPE_TEXT, value:"TXT_PS_TITLE", style:TEXT_STYLE_TITLE_1};		
		
		if(refresh)
		{
			// no pop fx + keep scrolling pos
			var widget = FWPool.getNode(UI_PRIVATE_SHOP, false);
			var scrollView = FWUtils.getChildByName(widget, "itemList");
			var scrollPos = scrollView.getInnerContainer().getPosition();
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_NONE);
			if(resetScrollPos)
				scrollView.scrollToPercentHorizontal(0, 0.01, false);
			else
				scrollView.getInnerContainer().setPosition(scrollPos);
		}
		else
		{
			var widget = FWUI.showWithData(UI_PRIVATE_SHOP, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_PRIVATE_SHOP);
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			var scrollView = FWUtils.getChildByName(widget, "itemList");
			if(gv.userData.userId === gv.mainUserData.mainUserId && this.savedScrollPos)
				scrollView.getInnerContainer().setPosition(this.savedScrollPos);
			else
				scrollView.scrollToPercentHorizontal(0, 0.01, false);
		}
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
		
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "privateShop");
	},
	
	hide:function()
	{
		// jira#5274
		if(gv.userData.userId === gv.mainUserData.mainUserId)
		{
			var widget = FWPool.getNode(UI_PRIVATE_SHOP, false);
			var scrollView = FWUtils.getChildByName(widget, "itemList");
			this.savedScrollPos = scrollView.getInnerContainer().getPosition();
		}
		
		FWUI.hide(UI_PRIVATE_SHOP, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		if(this.isFriendPrivateShop() && !Game.isFriendGarden())
			NewsBoard.showPrivateShop();
		
		this.refreshNotification();
		
		this.lastSoldItem = null;
	},
	
	getSlotList:function()
	{
		var slots = this.privateShop[PS_SLOTS];
		var slotList = [];
		var i;
		for(i=0; i<slots.length; i++)
		{
			var slot = slots[i];
			this.updateSlotDisplay(slot);
			slot.index = i;
			slotList.push(slot);
			
			// assume PS_SLOT_IS_SOLD = false if not exist
			if(!slot[PS_SLOT_IS_SOLD])
				slot[PS_SLOT_IS_SOLD] = false;
		}
		
		if(!PrivateShop.isFriendPrivateShop())
		{
			var friendSlot = null, diamondSlot = null;
			if(this.privateShop[PS_NUM_FRIEND_SLOT] < g_MISCINFO.PS_REQUIRED_FRIEND.length)
			{
				// can unlock by friends count
				friendSlot = {};
				friendSlot.index = PS_SLOT_UID_UNLOCK_FRIEND;
				friendSlot.current = FriendList.friendsCount;
				friendSlot.require = g_MISCINFO.PS_REQUIRED_FRIEND[this.privateShop[PS_NUM_FRIEND_SLOT]];
				friendSlot.text = (friendSlot.current + "/" + friendSlot.require);
				friendSlot.textColor = (friendSlot.current >= friendSlot.require ? cc.WHITE : cc.RED);
				friendSlot.isEmpty = true;
			}
			if(this.privateShop[PS_NUM_BUY_SLOT] < g_MISCINFO.PS_PRICE_SLOTS.length)
			{
				// can unlock by diamond
				diamondSlot = {};
				diamondSlot.index = PS_SLOT_UID_UNLOCK_DIAMOND;
				diamondSlot.current = gv.userData.getCoin();
				diamondSlot.require = g_MISCINFO.PS_PRICE_SLOTS[this.privateShop[PS_NUM_BUY_SLOT]];
				diamondSlot.text = diamondSlot.require;
				diamondSlot.textColor = cc.WHITE;// (diamondSlot.current >= diamondSlot.require ? cc.WHITE : cc.RED);
				diamondSlot.isEmpty = true;
			}
			
			// add locked slots
			// diamond slot on first row, friend slot on second row
			//if((i % 2) === 0)
			//	slotList.push(diamondSlot, friendSlot);
			//else
			//	slotList.push(null, diamondSlot, friendSlot);
			if((i % 2) === 0)
				slotList.push(diamondSlot, friendSlot);
			else
				slotList.push(friendSlot, diamondSlot);
		}
		
		return slotList;
	},
	
	updateSlotDisplay:function(slot)
	{
		if(!slot[PS_SLOT_ITEM])
		{
			slot.isEmpty = true;
			return;
		}
			
		slot.isEmpty = false;
		slot.displayAmount = "x" + slot[PS_SLOT_NUM];
		slot.isAdvertising = this.isSlotAdvertising(slot);

		if (PrivateShop.isFriendPrivateShop()) {
			var itemDefine = defineMap[slot[PS_SLOT_ITEM]];			
			if (itemDefine.LEVEL_UNLOCK) {
				if (Game.isFriendGarden())
					slot.isUnlocked = gv.mainUserData.getLevel() >= itemDefine.LEVEL_UNLOCK;
				else 
					slot.isUnlocked = gv.userData.getLevel() >= itemDefine.LEVEL_UNLOCK;
			} else
				slot.isUnlocked = true;
		} else {
			slot.isUnlocked = true;
		}		
		
		// jira#5143
		if(slot[PS_SLOT_IS_SOLD] && !slot[PS_SLOT_BUYER_AVATAR] && !Game.isFriendGarden())
			slot[PS_SLOT_BUYER_AVATAR] = "hud/hud_avatar_default.png";
	},
	
	selectItemToSell:function(sender)
	{
		this.onItemSelected(null);
		gv.gameBuildingStorageInterface.showStorageUI(true, true, this.onItemSelected.bind(this), Z_UI_PRIVATE_SHOP_SELECT_ITEM + 1);
		
		// jira#5839
		if(gv.gameBuildingStorageInterface.storageCurrentType === STORAGE_TYPE_EVENTS)
			gv.gameBuildingStorageInterface.changeStorageType(gv.gameBuildingStorageInterface.buttonFarmProduct, STORAGE_TYPE_FARM_PRODUCT);
	},
	
	getMoney:function(sender)
	{
		// fx
		var data = this.currentSlotWidget.uiData;
		FWUtils.showFlyingItemIcon(ID_GOLD, data[PS_SLOT_PRICE], FWUtils.getWorldPosition(sender), Game.getFlyingDestinationForItem(ID_GOLD));
		//gv.userData.addGold(data[PS_SLOT_PRICE]); jira#5988
		
		// fake
		this.cleanupSlot(data.index);
		
		// refresh
		this.show(null, true);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestPrivateShopGetMoney);
		pk.pack(data.index);
		network.connector.client.sendPacket(pk);
	},
	
	showSlotInfo:function(sender, isRefresh)
	{
		var data = sender.uiData;
		var isAdsAvailable = (data.isAdvertising === false);
		var canPlaceAds = (this.privateShop[PS_TIME_AD] + g_MISCINFO.PS_COUNTDOWN_AD <= Game.getGameTimeInSeconds());
		
		var uiDef =
		{
			bg:{scale9:true},
			bg2:{scale9:true},
			closeButton:{onTouchEnded:this.hideSlotInfo.bind(this)},
			slotHighlight:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.8},
			gfx:{type:UITYPE_ITEM, value:data[PS_SLOT_ITEM]},
			name:{type:UITYPE_TEXT, value:Game.getItemName(data[PS_SLOT_ITEM]), style:TEXT_STYLE_TEXT_NORMAL},
			amount:{type:UITYPE_TEXT, value:"x" + data[PS_SLOT_NUM], style:TEXT_STYLE_NUMBER},
			priceTitle:{type:UITYPE_TEXT, value:"TXT_PS_PRICE", style:TEXT_STYLE_TEXT_NORMAL},
			price:{type:UITYPE_TEXT, value:data[PS_SLOT_PRICE], style:TEXT_STYLE_NUMBER},
			cancelPrice:{type:UITYPE_TEXT, value:g_MISCINFO.PS_PRICE_CANCEL, style:TEXT_STYLE_TEXT_BUTTON},
			cancelButton:{onTouchEnded:this.onCancelSelling.bind(this)},
			
			adsTitle:{visible:isAdsAvailable, type:UITYPE_TEXT, value:(canPlaceAds ? "TXT_PS_ADS_NOW" : "TXT_PS_ADS_WAIT"), style:TEXT_STYLE_TEXT_NORMAL},
			adsCheckButton:{visible:isAdsAvailable && canPlaceAds, onTouchEnded:this.onToggleAds.bind(this)},
			adsCheckIcon:{visible:isAdsAvailable && canPlaceAds},
			adsIcon:{visible:isAdsAvailable && canPlaceAds},
			setAdsButton:{visible:isAdsAvailable, enabled:canPlaceAds, onTouchEnded:this.onSetAds.bind(this)},
			setAdsText:{visible:isAdsAvailable, enabled:canPlaceAds, type:UITYPE_TEXT, value:"TXT_PS_ADS_SET", style:TEXT_STYLE_TEXT_BUTTON},
			
			adsTimerMarker:{type:UITYPE_TIME_BAR, visible:isAdsAvailable && !canPlaceAds, startTime:this.privateShop[PS_TIME_AD], endTime:this.privateShop[PS_TIME_AD] + g_MISCINFO.PS_COUNTDOWN_AD, countdown:true, onFinished:function() {this.showSlotInfo(this.currentSlotWidget, true);}.bind(this), onTick:this.updateSkipTimeDiamond.bind(this)},
			adsSkipTimeBg:{visible:isAdsAvailable && !canPlaceAds, scale9:true},
			adsSkipTimeBg2:{visible:isAdsAvailable && !canPlaceAds},
			adsSkipTimeButton:{visible:isAdsAvailable && !canPlaceAds, onTouchEnded:this.onAdsSkipTime.bind(this)},
			adsSkipTimePrice:{visible:isAdsAvailable && !canPlaceAds, type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_BUTTON},
		};

		var widget = FWPool.getNode(UI_PRIVATE_SHOP_ITEM_INFO, false);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), isRefresh ? UIFX_NONE : UIFX_POP);
		widget.setLocalZOrder(Z_UI_PRIVATE_SHOP_INFO);
		
		// children
		this.adsCheckIcon = FWUtils.getChildByName(widget, "adsCheckIcon");
		this.lblSkipTimePrice = FWUtils.getChildByName(widget, "adsSkipTimePrice");
		this.setAdsButton = FWUtils.getChildByName(widget, "setAdsButton");
		this.updateSkipTimeDiamond(null);
		
		if(!this.hideFunc3)
			this.hideFunc3 = function() {this.hideSlotInfo()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc3);
	},
	
	hideSlotInfo:function(sender)
	{
		this.setAdsButton = null;
		FWUI.hide(UI_PRIVATE_SHOP_ITEM_INFO, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc3);
	},
	
	// jira#5637
	buyFriendItemPos: null, 
	buyFriendItem:function(sender)
	{
		var data = this.currentSlotWidget.uiData;
		if(!Game.checkEnoughGold(data[PS_SLOT_PRICE]))
			return;
		
		this.buyFriendItemPos = FWUtils.getWorldPosition(sender);
		FWUtils.disableAllTouches();
		
		// server
		if(this.friendId === USER_ID_JACK)
		{
			var pk = network.connector.client.getOutPacket(GardenManager.RequestJackPrivateShopBuy);
			pk.pack(data.index);
			network.connector.client.sendPacket(pk);
		}
		else
		{
			var pk = network.connector.client.getOutPacket(this.RequestPrivateFriendBuy);
			pk.pack(this.friendId, data.index);
			network.connector.client.sendPacket(pk);
		}
	},
	
	showBuyFriendItemFx:function()
	{
		FWUtils.disableAllTouches(false);
		
		var data = this.currentSlotWidget.uiData;
		if (data) {
			FWUtils.showFlyingItemIcon(data[PS_SLOT_ITEM], data[PS_SLOT_NUM], this.buyFriendItemPos, Game.getFlyingDestinationForItem(data[PS_SLOT_ITEM]));
			FWUtils.showFlyingItemIcon(ID_GOLD, -data[PS_SLOT_PRICE], this.buyFriendItemPos, null, 0, false, {duration:0.5});
		}
		
		// refresh
		this.show(null, true);
	},
	// end: jira#5637
	
	canSell2Friend:function(item)
	{
		if(_.isString(item))
			item = defineMap[item];
		if(item.SELL_FEE !== undefined && item.SELL_FEE > 0)
			return true;
		return false;
	},
	
	canSell2Jack:function(item)
	{
		if(_.isString(item))
			item = defineMap[item];
		return (this.getSell2JackPrice(item) > 0)
	},
	
	getSell2JackPrice:function(item)
	{
		if(_.isString(item))
			item = defineMap[item];
		if(item.GOLD_JACK === undefined || item.GOLD_JACK < 0)
			return 0;
		return (item.GOLD_JACK > 0 ? item.GOLD_JACK : item.GOLD_DEFAULT);
	},
	
	updateSkipTimeDiamond:function(sender)
	{
		if(!this.lblSkipTimePrice)
			return;
		var res = Game.getSkipTimeDiamond("AD", this.privateShop[PS_TIME_AD], g_MISCINFO.PS_COUNTDOWN_AD);
		this.lblSkipTimePrice.setString(res.diamond);
	},
	
	cleanupSlot:function(uid)
	{
		//var privateShopSlots = this.privateShop[PS_SLOTS];
		//for(var i=0; i<privateShopSlots.length; i++)
		//{
		//	if(privateShopSlots[i].index === uid)
		//	{
		//		privateShopSlots[i] = {};
		//		return true; // ok
		//	}
		//}
		//return false; // slot not found
		this.privateShop[PS_SLOTS][uid] = {};
	},
	
	isSlotAdvertising:function(slot)
	{
		return (slot[PS_SLOT_TIME_AD] + g_MISCINFO.PS_DURATION_AD > Game.getGameTimeInSeconds());
	},
	
	isFriendPrivateShop:function()
	{
		return (this.friendId !== null);
	},
	
	showFriendPrivateShop:function(friendData)
	{
		this.friendData = friendData;
		this.friendId = friendData[NB_SLOT_USER_ID];
		
		if(this.friendId === USER_ID_JACK)
		{
			PrivateShop.privateShop = gv.jackShop;
			PrivateShop.show(null, FWUI.isShowing(UI_PRIVATE_SHOP));
		}
		// jira#5927
		// else if(Game.isFriendGarden())
		// {
			// PrivateShop.privateShop = gv.userData.privateShop;
			// PrivateShop.show(null, FWUI.isShowing(UI_PRIVATE_SHOP));
		// }
		else
		{
			// server
			var pk = network.connector.client.getOutPacket(this.RequestPrivateFriendGet);
			pk.pack(this.friendId, friendData[NB_SLOT_USER_BUCKET]);
			network.connector.client.sendPacket(pk);
		}
	},
	
	getNextFriend:function(offset)
	{
		if(!this.friendData)
			return null;
		
		var friendList = NewsBoard.privateShopData;
		var nextIndex = this.friendData.index + offset;
		if(nextIndex < 0)
			nextIndex = friendList.length - 1;
		if(nextIndex >= friendList.length)
			nextIndex = 0;
		return friendList[nextIndex];
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// event //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	onSlotUnlocking:function(sender)
	{
		var data = sender.uiData;
		if(data.index === PS_SLOT_UID_UNLOCK_DIAMOND)
		{
			if(Game.consumeDiamond(data.require, FWUtils.getWorldPosition(sender)) === true)
			{
				// unlock
				// fake
				this.privateShop[PS_NUM_BUY_SLOT]++;
				this.privateShop[PS_SLOTS].push({});
				this.show(null, true);
				
				// server
				var pk = network.connector.client.getOutPacket(this.RequestPrivateShopUnlockCoin);
				pk.pack(data.require);
				network.connector.client.sendPacket(pk);
			}
		}
		else if(data.index === PS_SLOT_UID_UNLOCK_FRIEND)
		{
			if(FriendList.friendsCount >= data.require)
			{
				// unlock
				// fake
				this.privateShop[PS_NUM_FRIEND_SLOT]++;
				this.privateShop[PS_SLOTS].push({});
				this.show(null, true);
				
				// server
				var pk = network.connector.client.getOutPacket(this.RequestPrivateShopUnlockFriend);
				pk.pack();
				network.connector.client.sendPacket(pk);
			}
			else
			{
				// show friend list
				var displayInfo = {title:"TXT_PS_INVITE_TITLE", content:cc.formatStr(FWLocalization.text("TXT_PS_INVITE_CONTENT"), data.require), closeButton:true, okText:"TXT_PS_INVITE"};
				Game.showPopup(displayInfo, function() {PrivateShop.hide(); FriendList.show();});
			}
		}
	},
	
	onSlotSelected:function(sender)
	{
		this.currentSlotWidget = sender;
		if(PrivateShop.isFriendPrivateShop())
		{
			if(sender.uiData.isEmpty === false && sender.uiData[PS_SLOT_IS_SOLD] === false && sender.uiData.isUnlocked) {
				if (Game.canReceiveGift([{ itemId: sender.uiData[PS_SLOT_ITEM], amount: sender.uiData[PS_SLOT_NUM] }], true)) {
					this.buyFriendItem(sender);
				}
			}
		}
		else
		{
			if(sender.uiData.isEmpty === true)
				this.selectItemToSell(sender);
			else if(sender.uiData[PS_SLOT_IS_SOLD] === true)
				this.getMoney(sender);
			else
				this.showSlotInfo(sender);
		}
	},
	
	onChangeFriend:function(sender)
	{
		var name = sender.getName();
		var friendData = this.getNextFriend(name === "rightBg" ? 1 : -1);
		this.showFriendPrivateShop(friendData);
	},
	
	onItemSelected:function(sender)
	{
		var item = null, itemId = null, uiDef = null;
		this.currentItemWidget = sender;
		if(sender)
		{
			// has selected item
			itemId = sender.uiData.itemId;
			item = this.sellItem = defineMap[itemId];
			
			// check if item is being sold
			//var slots = this.privateShop[PS_SLOTS];
			//for(var i=0; i<slots.length; i++)
			//{
			//	if(slots[i][PS_SLOT_ITEM] === itemId)
			//	{
			//		FWUtils.showWarningText(FWLocalization.text("TXT_PS_BEING_SOLD"), FWUtils.getWorldPosition(sender));
			//		return;
			//	}
			//}
			
			// default amount
			this.sellAmount = gv.userStorages.getItemAmount(itemId);
			if(this.sellAmount <= 0)
				return;
			else
			{
				this.sellMinAmount = 1;
				this.sellMaxAmount = (this.sellAmount > g_MISCINFO.PS_NUM_ITEM_PER_SLOT ? g_MISCINFO.PS_NUM_ITEM_PER_SLOT : this.sellAmount);
				this.sellAmount = FWUtils.clamp(Math.floor(this.sellAmount / 2), this.sellMinAmount, this.sellMaxAmount);
			}
			
			// check if item is allowed to be sold
			if(item.GOLD_MIN <= 0 || item.GOLD_MAX <= 0)
			{
				FWUtils.showWarningText(FWLocalization.text("TXT_PS_CANNOT_SELL"), FWUtils.getWorldPosition(sender));
				return;
			}
			this.sellMinPricePerItem = item.GOLD_MIN;
			this.sellMaxPricePerItem = item.GOLD_MAX;

			// ui
			uiDef = 
			{
				noItem:{visible:false},
				hasItem:{visible:true},
				gfx:{type:UITYPE_ITEM, value:itemId},
				name:{type:UITYPE_TEXT, value:Game.getItemName(itemId), style:TEXT_STYLE_TEXT_NORMAL},
				amountTitle:{type:UITYPE_TEXT, value:"TXT_PS_AMOUNT", style:TEXT_STYLE_TEXT_NORMAL},
				amount:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER},
				amountInc:{onTouchBegan:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)},//amountInc:{onTouchEnded:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)},
				amountDec:{onTouchBegan:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)},//amountDec:{onTouchEnded:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)},
				priceTitle:{type:UITYPE_TEXT, value:"TXT_PS_PRICE", style:TEXT_STYLE_TEXT_NORMAL},
				price:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_NUMBER},
			};
			
			var canSell2Friend = this.canSell2Friend(item);
			var canSell2Jack = this.canSell2Jack(item);
			if(canSell2Friend || canSell2Jack)
			{
				this.sellTotalPrice = this.getSell2JackPrice(item) * this.sellAmount;
				
				// sp item
				uiDef.normalSale = {visible:false};
				uiDef.spSale = {visible:true};
				uiDef.sale2FriendButton = {visible:canSell2Friend, onTouchEnded:this.onSell2Friend.bind(this)};
				uiDef.sale2FriendText = {visible:canSell2Friend, type:UITYPE_TEXT, value:"TXT_PS_SELL2FRIEND", style:TEXT_STYLE_TEXT_BUTTON};
				uiDef.sale2FriendIcon = {visible:canSell2Friend};
				uiDef.sale2JackButton = {visible:canSell2Jack, onTouchEnded:this.onSell2Jack.bind(this)};
				uiDef.sale2JackText = {visible:canSell2Jack, type:UITYPE_TEXT, value:"TXT_PS_SELL2JACK", style:TEXT_STYLE_TEXT_BUTTON};
 				uiDef.jack = {visible:canSell2Jack};
				uiDef.priceInc = {visible:false};
				uiDef.priceDec = {visible:false};
			}
			else
			{
				if(itemId !== this.lastSoldItem)
				{
					this.sellTotalPrice = this.sellAmount * item.GOLD_DEFAULT; //FWUtils.clamp(Math.floor((this.sellMinPricePerItem + this.sellMaxPricePerItem) * 2 / 3) * this.sellAmount, item.GOLD_MIN * this.sellMinAmount, item.GOLD_MAX * this.sellMaxAmount);
					this.lastSoldItem = null;
				}
				else
					this.sellTotalPrice = this.sellAmount * this.lastSoldAvgPrice;
		
				var canPlaceAds = (this.privateShop[PS_TIME_AD] + g_MISCINFO.PS_COUNTDOWN_AD <= Game.getGameTimeInSeconds());
				
				// normal item
				uiDef.spSale = {visible:false};
				uiDef.normalSale = {visible:true};
				uiDef.adsTitle = {type:UITYPE_TEXT, value:(canPlaceAds ? "TXT_PS_ADS_NOW" : "TXT_PS_ADS_WAIT"), style:TEXT_STYLE_TEXT_NORMAL};
				uiDef.adsCheckButton = {visible:canPlaceAds, onTouchEnded:this.onToggleAds.bind(this)};
				uiDef.adsCheckIcon = {visible:canPlaceAds};
				uiDef.adsIcon = {visible:canPlaceAds};
				uiDef.normalSaleButton = {onTouchEnded:this.onSell.bind(this)};
				uiDef.normalSaleText = {type:UITYPE_TEXT, value:"TXT_PS_SELL", style:TEXT_STYLE_TEXT_BUTTON};
				uiDef.adsTimerMarker = {type:UITYPE_TIME_BAR, visible:!canPlaceAds, startTime:this.privateShop[PS_TIME_AD], endTime:this.privateShop[PS_TIME_AD] + g_MISCINFO.PS_COUNTDOWN_AD, countdown:true, onFinished:function() {this.onItemSelected(this.currentItemWidget);}.bind(this), onTick:this.updateSkipTimeDiamond.bind(this)};
				uiDef.adsSkipTimeBg = {visible:!canPlaceAds};
				uiDef.adsSkipTimeBg2 = {visible:!canPlaceAds};
				uiDef.adsSkipTimeButton = {visible:!canPlaceAds, onTouchEnded:this.onAdsSkipTime.bind(this)};
				uiDef.adsSkipTimePrice = {visible:!canPlaceAds, type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_BUTTON};
				uiDef.priceInc = {visible:true, onTouchBegan:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)};//uiDef.priceInc = {visible:true, onTouchEnded:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)};
				uiDef.priceDec = {visible:true, onTouchBegan:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)};//uiDef.priceDec = {visible:true, onTouchEnded:this.onChangeAmount.bind(this), onTouchHold:this.onChangeAmount.bind(this)};
			}
		}
		else
		{
			// no item selected
			uiDef = 
			{
				noItem:{visible:true, type:UITYPE_TEXT, value:"TXT_PS_SELECT_ITEM", style:TEXT_STYLE_TEXT_NORMAL},
				hasItem:{visible:false},
			};
		}
		
		uiDef.slotHighlight = {type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.8};
		uiDef.closeButton = {onTouchEnded:this.onHideItemSelection.bind(this)};
		
		var widget = FWPool.getNode(UI_PRIVATE_SHOP_SELECT_ITEM, false);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_NONE);
		widget.setLocalZOrder(Z_UI_PRIVATE_SHOP_SELECT_ITEM);
		
		// children
		this.lblAmount = FWUtils.getChildByName(widget, "amount");
		this.lblPrice = FWUtils.getChildByName(widget, "price");
		this.btnAmountInc = FWUtils.getChildByName(widget, "amountInc");
		this.btnAmountDec = FWUtils.getChildByName(widget, "amountDec");
		this.btnPriceInc = FWUtils.getChildByName(widget, "priceInc");
		this.btnPriceDec = FWUtils.getChildByName(widget, "priceDec");
		this.adsCheckIcon = FWUtils.getChildByName(widget, "adsCheckIcon");
		this.lblSkipTimePrice = FWUtils.getChildByName(widget, "adsSkipTimePrice");
		this.onChangeAmount(null);
		this.updateSkipTimeDiamond(null);
		
		if(!this.hideFunc2)
			this.hideFunc2 = function() {this.onHideItemSelection()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc2);
	},
	
	onHideItemSelection:function(sender)
	{
		// storage
		gv.gameBuildingStorageInterface.showStorageUI(false);		
		
		// item detail
		var widget = FWPool.getNode(UI_PRIVATE_SHOP_SELECT_ITEM, false);
		FWUI.hideWidget(widget, UIFX_NONE);
		
		Game.gameScene.unregisterBackKey(this.hideFunc2);
	},
	
	onChangeAmount:function(sender)
	{
		if(this.sellItem === null)
			return;

		var minPrice, maxPrice;
		var canSell2FriendOrJack = (this.canSell2Friend(this.sellItem) || this.canSell2Jack(this.sellItem));
		if(sender)
		{
			var name = sender.getName();
			if(name === "amountInc" || name === "amountDec")
			{
				// change amount
				var avgPrice = this.sellTotalPrice / this.sellAmount;
				this.sellAmount += (name === "amountInc" ? 1 : -1);
				this.sellAmount = FWUtils.clamp(this.sellAmount, this.sellMinAmount, this.sellMaxAmount);
				if(canSell2FriendOrJack)
					this.sellTotalPrice = this.getSell2JackPrice(this.sellItem) * this.sellAmount;
				else
					this.sellTotalPrice = FWUtils.fastFloor(avgPrice * this.sellAmount);
			}
			else if(name === "priceInc" || name === "priceDec")
			{
				// change price
				maxPrice = this.sellAmount * this.sellMaxPricePerItem;
				var step = 1;
				if(maxPrice > 2000)
					step = 100;
				else if(maxPrice > 200)
					step = 10;
				this.sellTotalPrice += (name === "priceInc" ? step : -step);
			}
		}
		
		if(!canSell2FriendOrJack)
		{
			// limit price if selling 2 guest
			minPrice = this.sellAmount * this.sellMinPricePerItem;
			maxPrice = this.sellAmount * this.sellMaxPricePerItem;
			this.sellTotalPrice = FWUtils.clamp(this.sellTotalPrice, minPrice, maxPrice);
			FWUI.setWidgetEnabled(this.btnPriceInc, this.sellTotalPrice < maxPrice);
			FWUI.setWidgetEnabled(this.btnPriceDec, this.sellTotalPrice > minPrice);
		}
		else if(this.canSell2Friend(this.sellItem))
			this.sellTotalPrice = this.sellItem.GOLD_DEFAULT * this.sellAmount;

		FWUI.setWidgetEnabled(this.btnAmountInc, this.sellAmount < this.sellMaxAmount);
		FWUI.setWidgetEnabled(this.btnAmountDec, this.sellAmount > this.sellMinAmount);
		
		this.lblAmount.setString(this.sellAmount);
		FWUI.setLabelString(this.lblPrice, this.sellTotalPrice);//this.lblPrice.setString(this.sellTotalPrice);
	},
	
	onSell:function(sender, sellTo)//web onSell:function(sender, sellTo = PS_SELL_TO_GUEST)
	{
		if(sellTo === undefined)
			sellTo = PS_SELL_TO_GUEST;
		
		// fake
		// subtract from storage
		gv.userStorages.removeItem(this.sellItem.ID, this.sellAmount);
		// selling info
		var slot = this.currentSlotWidget.uiData;
		slot[PS_SLOT_ITEM] = this.sellItem.ID;
		slot[PS_SLOT_NUM] = this.sellAmount;
		slot[PS_SLOT_PRICE] = this.sellTotalPrice;
		slot[PS_SLOT_IS_SOLD] = false;	
		slot[PS_SLOT_BUYER_AVATAR] = null;
		slot[PS_SLOT_TIME_AD] = 0;
		if(sellTo === PS_SELL_TO_GUEST && this.adsCheckIcon.isVisible())
		{
			// place ads and reset ads time
			this.privateShop[PS_TIME_AD] = slot[PS_SLOT_TIME_AD] = Game.getGameTimeInSeconds();
		}
		
		// fx
		var pos = FWUtils.getWorldPosition(this.currentSlotWidget);
		FWUtils.showFlyingItemIcon(this.sellItem.ID, -this.sellAmount, cc.p(pos.x, pos.y + 100), null, 0, false, {duration:0.5});

		// go back
		this.onHideItemSelection(sender);
		this.show(null, true);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestPrivateShopPut);
		pk.pack(slot.index, sellTo === PS_SELL_TO_FRIEND ? this.sellItem.SELL_FEE : 0, slot[PS_SLOT_ITEM], slot[PS_SLOT_NUM], slot[PS_SLOT_PRICE], slot[PS_SLOT_TIME_AD] > 0);
		network.connector.client.sendPacket(pk);
		
		this.lastSoldItem = this.sellItem.ID;
		this.lastSoldAvgPrice = this.sellTotalPrice / this.sellAmount;
	},
	
	onSell2Friend:function(sender)
	{
		// confirm
		var uiDef =
		{
			bg:{scale9:true},
			bg2:{scale9:true},
			title:{type:UITYPE_TEXT, value:"TXT_PS_SELL2FRIEND_CONFIRM_TITLE", style:TEXT_STYLE_TITLE_1},
			content:{type:UITYPE_TEXT, value:"TXT_PS_SELL2FRIEND_CONFIRM_CONTENT", style:TEXT_STYLE_TEXT_NORMAL},
			actionText:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
			actionButton:{onTouchEnded:this.onSell2FriendConfirmed.bind(this)},
			closeButton:{onTouchEnded:this.hideSell2FriendConfirm.bind(this)},
			gfx:{type:UITYPE_ITEM, value:this.sellItem.ID},
			amount:{type:UITYPE_TEXT, value:"x" + this.sellAmount, style:TEXT_STYLE_NUMBER},
			price:{type:UITYPE_TEXT, value:(this.sellItem.SELL_FEE * this.sellAmount), style:TEXT_STYLE_TEXT_BUTTON},
			diamondIcon:{visible:true},
			goldIcon:{visible:false},
			avatar:{visible:true, type:UITYPE_IMAGE, value:"npc/npc_red_03.png"},
		};
		
		// ui
		var widget = FWUI.showWithData(UI_CONFIRM_USE_DIAMOND, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_PRIVATE_SHOP_CONFIRM_SELL);
		
		if(!this.hideFunc5)
			this.hideFunc5 = function() {this.hideSell2FriendConfirm()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc5);
	},
	
	hideSell2FriendConfirm:function()
	{
		FWUI.hide(UI_CONFIRM_USE_DIAMOND, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc5);
	},
	
	onSell2FriendConfirmed:function(sender)
	{
		var pos = FWUtils.getWorldPosition(this.currentSlotWidget);
		if(Game.consumeDiamond(this.sellItem.SELL_FEE * this.sellAmount, cc.p(pos.x, pos.y + 140)))
		{
			FWUI.hide(UI_CONFIRM_USE_DIAMOND, UIFX_POP);
			this.onSell(sender, PS_SELL_TO_FRIEND);
		}
	},
	
	onSell2Jack:function(sender)
	{
		// confirm
		var uiDef =
		{
			bg:{scale9:true},
			bg2:{scale9:true},
			title:{type:UITYPE_TEXT, value:"TXT_PS_SELL2JACK_CONFIRM_TITLE", style:TEXT_STYLE_TITLE_1},
			content:{type:UITYPE_TEXT, value:"TXT_PS_SELL2JACK_CONFIRM_CONTENT", style:TEXT_STYLE_TEXT_NORMAL},
			actionText:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
			actionButton:{onTouchEnded:this.onSell2JackConfirmed.bind(this)},
			closeButton:{onTouchEnded:this.hideSell2JackConfirm.bind(this)},
			gfx:{type:UITYPE_ITEM, value:this.sellItem.ID},
			amount:{type:UITYPE_TEXT, value:"x" + this.sellAmount, style:TEXT_STYLE_NUMBER},
			price:{type:UITYPE_TEXT, value:this.sellTotalPrice, style:TEXT_STYLE_NUMBER},
			diamondIcon:{visible:false},
			goldIcon:{visible:true},
			avatar:{visible:true, type:UITYPE_IMAGE, value:"npc/npc_Jack_01.png"},
		};
		
		// ui
		var widget = FWUI.showWithData(UI_CONFIRM_USE_DIAMOND, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_PRIVATE_SHOP_CONFIRM_SELL);
		
		if(!this.hideFunc4)
			this.hideFunc4 = function() {this.hideSell2JackConfirm()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc4);
	},
	
	hideSell2JackConfirm:function()
	{
		FWUI.hide(UI_CONFIRM_USE_DIAMOND, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc4);
	},
	
	onSell2JackConfirmed:function(sender)
	{
		// fake
		// subtract from storage
		gv.userStorages.removeItem(this.sellItem.ID, this.sellAmount);
		// add gold
		gv.userData.addGold(this.sellTotalPrice);
		
		// fx
		var widget = FWPool.getNode(UI_CONFIRM_USE_DIAMOND, false);
		var priceText = FWUtils.getChildByName(widget, "price");
		FWUtils.showFlyingItemIcon(ID_GOLD, this.sellTotalPrice, FWUtils.getWorldPosition(priceText), Game.getFlyingDestinationForItem(ID_GOLD));
		
		// go back
		FWUI.hide(UI_CONFIRM_USE_DIAMOND, UIFX_POP);
		this.onHideItemSelection(sender);
		this.show(null, true);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestSellForJack);
		pk.pack(this.sellItem.ID, this.sellAmount);
		network.connector.client.sendPacket(pk);
	},
	
	onToggleAds:function(sender)
	{
		this.adsCheckIcon.setVisible(!this.adsCheckIcon.isVisible());
		if(this.setAdsButton)
			FWUI.setWidgetEnabled(this.setAdsButton, this.adsCheckIcon.isVisible());
	},
	
	onAdsSkipTime:function(sender)
	{
		var res = Game.getSkipTimeDiamond("AD", this.privateShop[PS_TIME_AD], g_MISCINFO.PS_COUNTDOWN_AD);
		if(Game.consumeDiamond(res.diamond, FWUtils.getWorldPosition(sender)) === true)
		{
			// skip time
			// fake
			this.privateShop[PS_TIME_AD] = 0;
			AudioManager.effect (EFFECT_GOLD_PAYING);
			
			// back to correct ui
			if(FWUI.isShowing(UI_PRIVATE_SHOP_ITEM_INFO))
				this.showSlotInfo(this.currentSlotWidget, true);
			else
				this.onItemSelected(this.currentItemWidget);

			// server
			var pk = network.connector.client.getOutPacket(this.RequestPrivateShopSkipTime);
			pk.pack(res.diamond);
			network.connector.client.sendPacket(pk);
		}
	},
	
	onCancelSelling:function(sender)
	{
		Game.showPopup({title:"TXT_PS_CANCEL_CONFIRM_TITLE", content:"TXT_PS_CANCEL_CONFIRM_CONTENT", closeButton:true}, this.onCancelSellingConfirmed.bind(this));
	},
	
	onCancelSellingConfirmed:function(sender)
	{
		if(Game.consumeDiamond(g_MISCINFO.PS_PRICE_CANCEL, FWUtils.getWorldPosition(this.currentSlotWidget)) === true)
		{
			// fake
			var data = this.currentSlotWidget.uiData;
			this.cleanupSlot(data.index);
			
			this.hideSlotInfo();
			this.show(null, true);

			// server
			var pk = network.connector.client.getOutPacket(this.RequestPrivateShopCancel);
			pk.pack(data.index, g_MISCINFO.PS_PRICE_CANCEL);
			network.connector.client.sendPacket(pk);
		}
	},	
	
	onSetAds:function(sender)
	{
		// fake
		var data = this.currentSlotWidget.uiData;
		this.privateShop[PS_TIME_AD] = data[PS_SLOT_TIME_AD] = Game.getGameTimeInSeconds();
		
		this.hideSlotInfo();
		this.show(null, true);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestPrivateShopAd);
		pk.pack(data.index);
		network.connector.client.sendPacket(pk);
	},
	
	refreshNotification:function()
	{
		var privateShop = (Game.isFriendGarden() && gv.userData.userId === USER_ID_JACK ? gv.jackShop : gv.userData.privateShop);
		var slots = privateShop[PS_SLOTS];
		
		// jira#5316
		var hasSellingItem = false;
		for(var i=0; i<slots.length; i++)
		{
			if(slots[i][PS_SLOT_ITEM])
			{
				hasSellingItem = true;
				break;
			}
		}
		gv.background.animShop.setAnimation(hasSellingItem ? "building_active" : "building_normal", true);
	
		var isNotificationVisible = false; // jira#5626
		if(!Game.isFriendGarden() && !this.isFriendPrivateShop())
		{
			for(var i=0; i<slots.length; i++)
			{
				if(slots[i][PS_SLOT_IS_SOLD] === true)
				{
					isNotificationVisible = true;
					break;
				}
			}
		}
		if (Game.gameScene)
			Game.gameScene.background.notifyPrivateShop.setVisible(isNotificationVisible);
	},
	
	onAddFriend:function(sender)
	{
		if(!this.friendId || !FriendList.canAddFriend(this.friendId))
			return;
		
		// hide add friend button
		var widget = FWPool.getNode(UI_PRIVATE_SHOP, false);
		var addFriend = FWUtils.getChildByName(widget, "addFriend");
		addFriend.setVisible(false);
		
		FriendList.sendRequestId = this.friendId; // set this to show result popup
		var pk = network.connector.client.getOutPacket(FriendList.RequestFriendSendRequest);
		pk.pack([this.friendId]);
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestPrivateShopPut:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_PUT);},
		pack:function(slot, fee, item, num, price, ad)
		{
			addPacketHeader(this);
			
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			PacketHelper.putInt(this, KEY_FEE, fee);
			PacketHelper.putString(this, KEY_ITEM_ID, item);
			PacketHelper.putInt(this, KEY_ITEM_NUM, num);
			PacketHelper.putInt(this, KEY_PRICE_SELL, price);
			PacketHelper.putBoolean(this, KEY_USE_AD, ad);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopPut:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			gv.userStorages.updateItem(object[KEY_ITEM_ID], object[KEY_REMAIN_ITEM]);
			PrivateShop.show(null, true);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopPut: error=" + this.getError());
			else
				Achievement.onAction(g_ACTIONS.ACTION_PRIVATE_SHOP_PUT.VALUE, object[KEY_ITEM_ID], 1);
		}
	}),
	
	RequestSellForJack:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.SELL_FOR_JACK);},
		pack:function(item, num)
		{
			addPacketHeader(this);
			
			PacketHelper.putString(this, KEY_ITEM_ID, item);
			PacketHelper.putInt(this, KEY_ITEM_NUM, num);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponseSellForJack:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			gv.userStorages.updateItem(object[KEY_ITEM_ID], object[KEY_REMAIN_ITEM]);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponseSellForJack: error=" + this.getError());
			else
			{
				Achievement.onAction(g_ACTIONS.ACTION_SHOP_GET_MONEY.VALUE, null, PrivateShop.sellTotalPrice); // jira#6013
				Achievement.onAction(g_ACTIONS.ACTION_PRIVATE_SHOP_PUT.VALUE, object[KEY_ITEM_ID], 1); // jira#6010
			}
		}
	}),
	
	RequestPrivateShopGetMoney:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_GET_MONEY);},
		pack:function(slot)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopGetMoney:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var prevGold = gv.userData.getGold();
			
			Game.updateUserDataFromServer(object);
			PrivateShop.show(null, true);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopGetMoney: error=" + this.getError());
			
			var newGold = gv.userData.getGold();
			if(newGold > prevGold)
				Achievement.onAction(g_ACTIONS.ACTION_SHOP_GET_MONEY.VALUE, null, newGold - prevGold);
		}
	}),	
	
	RequestPrivateFriendBuy:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_FRIEND_BUY);},
		pack:function(friend, slot)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_FRIEND_ID, friend);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateFriendBuy:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			PrivateShop.privateShop = object[KEY_FRIEND_SHOP];
			
			if(Game.isFriendGarden())
			{
				if(gv.userData.userId === USER_ID_JACK)
					gv.jackShop = object[KEY_FRIEND_SHOP];
				else
					gv.userData.privateShop = object[KEY_FRIEND_SHOP];
			}
			
			if(this.getError() !== 0)
			{
				cc.log("PrivateShop.ResponsePrivateFriendBuy: error=" + this.getError());
				FWUtils.showWarningText(FWLocalization.text("TXT_PS_CANNOT_BUY"), PrivateShop.buyFriendItemPos);
				FWUtils.disableAllTouches(false);
				PrivateShop.show(null, true);
			}
			else
			{
				PrivateShop.showBuyFriendItemFx();
				
				if(PrivateShop.isFriendPrivateShop() && !Game.isFriendGarden())
					Achievement.onAction(g_ACTIONS.ACTION_PRIVATE_SHOP_FRIEND_BUY.VALUE, null, 1);
			}
		}
	}),	
	
	RequestPrivateShopUnlockCoin:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_UNLOCK_COIN);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopUnlockCoin:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			PrivateShop.show(null, true);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopUnlockCoin/ResponsePrivateShopUnlockFriend: error=" + this.getError());
		}
	}),
	
	RequestPrivateShopUnlockFriend:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_UNLOCK_FRIEND);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	RequestPrivateShopSkipTime:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_SKIP_TIME);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopSkipTime:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopSkipTime: error=" + this.getError());
		}
	}),				
	
	RequestPrivateShopCancel:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_CANCEL);},
		pack:function(slot, price)
		{
			addPacketHeader(this);
			
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopCancel:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			PrivateShop.show(null, true);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopCancel: error=" + this.getError());
		}
	}),					

	RequestPrivateShopAd:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_AD);},
		pack:function(slot)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopAd:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);

			Game.updateUserDataFromServer(object);
			PrivateShop.show(null, true);
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopAd: error=" + this.getError());
		}
	}),	

	RequestPrivateFriendGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_FRIEND_GET);},
		pack:function(friend, bucket)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, friend);
			PacketHelper.putString(this, KEY_BUCKET, bucket);
			
			addPacketFooter(this);
			FWUtils.disableAllTouches();
		},
	}),
	
	ResponsePrivateFriendGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);

			if(this.getError() === 0)
			{
				var object = PacketHelper.parseObject(this);
				PrivateShop.privateShop = object[KEY_FRIEND_SHOP];
				PrivateShop.show(null, FWUI.isShowing(UI_PRIVATE_SHOP), true);
			}
			else
			{
				cc.log("PrivateShop.ResponsePrivateFriendGet: error=" + this.getError());
				PrivateShop.hide();
			}
		}
	}),	
	
	RequestPrivateShopGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_GET);},
		pack:function()
		{
			addPacketHeader(this);

			cc.log("PrivateShop.RequestPrivateShopGet");
			PrivateShop.showAfterLoad = true;
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			
			var isShowing = (FWUI.isShowing(UI_PRIVATE_SHOP) === true);
			if(PrivateShop.showAfterLoad || (isShowing && !PrivateShop.isFriendPrivateShop()))
			{
				PrivateShop.show(null, isShowing);
				PrivateShop.showAfterLoad = false;
			}
			
			if(this.getError() !== 0)
				cc.log("PrivateShop.ResponsePrivateShopGet: error=" + this.getError());
		}
	}),
};

network.packetMap[gv.CMD.PRIVATE_SHOP_PUT] = PrivateShop.ResponsePrivateShopPut;
network.packetMap[gv.CMD.SELL_FOR_JACK] = PrivateShop.ResponseSellForJack;
network.packetMap[gv.CMD.PRIVATE_SHOP_GET_MONEY] = PrivateShop.ResponsePrivateShopGetMoney;
network.packetMap[gv.CMD.PRIVATE_SHOP_FRIEND_BUY] = PrivateShop.ResponsePrivateFriendBuy;
network.packetMap[gv.CMD.PRIVATE_SHOP_FRIEND_GET] = PrivateShop.ResponsePrivateFriendGet;
network.packetMap[gv.CMD.PRIVATE_SHOP_UNLOCK_COIN] = PrivateShop.ResponsePrivateShopUnlockCoin;
network.packetMap[gv.CMD.PRIVATE_SHOP_UNLOCK_FRIEND] = PrivateShop.ResponsePrivateShopUnlockCoin;
network.packetMap[gv.CMD.PRIVATE_SHOP_SKIP_TIME] = PrivateShop.ResponsePrivateShopSkipTime;
network.packetMap[gv.CMD.PRIVATE_SHOP_CANCEL] = PrivateShop.ResponsePrivateShopCancel;
network.packetMap[gv.CMD.PRIVATE_SHOP_AD] = PrivateShop.ResponsePrivateShopAd;
network.packetMap[gv.CMD.PRIVATE_SHOP_GET] = PrivateShop.ResponsePrivateShopGet;