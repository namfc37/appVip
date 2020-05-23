
const NB_TAB_PRIVATE_SHOP = 0;
const NB_TAB_AIRSHIP = 1;

var NewsBoard =
{
	currentTab: NB_TAB_PRIVATE_SHOP,
	privateShopData: null,
	airshipData: null,
	itemList: null,
	pageText: null,
	prevPage: null,
	nextPage: null,
	skipTimePrice: null,
	noItemText: null,
	// jira#5778
	savedPosPS: null,
	savedPosAirship: null,
	
	init:function()
	{
		var widget = FWPool.getNode(UI_NEWSBOARD, false);
		this.itemList = FWUtils.getChildByName(widget, "itemList2");//this.itemList = FWUtils.getChildByName(widget, "itemList"); // jira#5105
		this.pageText = FWUtils.getChildByName(widget, "page");
		this.prevPage = FWUtils.getChildByName(widget, "prevPage");
		this.nextPage = FWUtils.getChildByName(widget, "nextPage");
		this.skipTimePrice = FWUtils.getChildByName(widget, "skipTimePrice");
		this.noItemText = FWUtils.getChildByName(widget, "noItemText");
		this.noItemText.setString(FWLocalization.text("TXT_NB_NO_ITEM"));
		widget.setLocalZOrder(Z_UI_NEWSBOARD);
		FWPool.returnNode(widget);
		
		// jira#5279
		this.currentTab = NB_TAB_AIRSHIP;
		this.onRefresh();
		this.currentTab = NB_TAB_PRIVATE_SHOP;
		this.onRefresh();
	},
	
	// jira#5279
	refreshNewsboardAnim:function()
	{
		if(!gv.background)
			return;
		var hasItems = ((this.privateShopData && this.privateShopData.length > 0) || (this.airshipData && this.airshipData.length > 0));
		if (gv.background.animInbox)
			gv.background.animInbox.setAnimation(hasItems ? "bulding_active" : "bulding_normal", true);
		gv.background.notifyNewsboard.setVisible(false);// feedback: never show gv.background.notifyNewsboard.setVisible(hasItems);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// private shop ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	showPrivateShop:function(sender)
	{
		if(gv.userData.getLevel() < g_MISCINFO.PS_USER_LEVEL)
		{
			// show warning text if user has lower level
			var text = cc.formatStr(FWLocalization.text("TXT_NB_REQUIRE_LEVEL"), g_MISCINFO.PS_USER_LEVEL);
			FWUtils.showWarningText(text, FWUtils.getWorldPosition(sender));
			return;
		}
		
		this.currentTab = NB_TAB_PRIVATE_SHOP;
		
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:NB_SLOT_ITEM},
			amount:{type:UITYPE_TEXT, field:NB_SLOT_NUM, style:TEXT_STYLE_NUMBER},//amount:{type:UITYPE_TEXT, field:NB_SLOT_NUM, shadow:SHADOW_DEFAULT},
			name:{type:UITYPE_TEXT, field:"itemName", style:TEXT_STYLE_TEXT_DIALOG},//name:{type:UITYPE_TEXT, field:"itemName"},
			detailAirship:{visible:false},
			detailPrivateShop:{visible:true},
			psAmountGold:{type:UITYPE_TEXT, field:NB_SLOT_GOLD, style:TEXT_STYLE_NUMBER},//psAmountGold:{type:UITYPE_TEXT, field:NB_SLOT_GOLD, shadow:SHADOW_DEFAULT},
			itemBg:{onTouchEnded:this.onOpenFriendPrivateShop.bind(this)},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_NB_PRIVATE_SHOP"},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP], endTime:gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP] + g_MISCINFO.NB_COUNTDOWN_TIME, countdown:true, onFinished:this.onRefresh.bind(this)},
			skipTimeButton:{onTouchEnded:this.onSkipTime.bind(this)},
			skipTimePrice:{type:UITYPE_TEXT, value:g_MISCINFO.NB_PRICE_REFRESH, style:TEXT_STYLE_TEXT_BUTTON},//skipTimePrice:{type:UITYPE_TEXT, value:g_MISCINFO.NB_PRICE_REFRESH, shadow:SHADOW_DEFAULT},
			// jira#5105
			page:{visible:false},//page:{type:UITYPE_TEXT, value:"", onTouchEnded:this.onChangePage.bind(this), style:TEXT_STYLE_TEXT_DIALOG},//page:{type:UITYPE_TEXT, value:"", onTouchEnded:this.onChangePage.bind(this)},
			nextPage:{visible:false},//nextPage:{onTouchEnded:this.onChangePage.bind(this)},
			prevPage:{visible:false},//prevPage:{onTouchEnded:this.onChangePage.bind(this)},
			privateShopButtonSelected:{visible:true},
			privateShopButtonNotSelected:{visible:false},
			airshipButtonSelected:{visible:false},
			airshipButtonNotSelected:{visible:gv.userData.getLevel() >= g_MISCINFO.NB_AIRSHIP_USER_LEVEL, onTouchEnded:this.onChangeTab.bind(this)},
			closeButton:{onTouchEnded:this.onHide.bind(this)},
			// jira#5105
			//itemList:{visible:false},
			itemList2:{type:UITYPE_2D_LIST, items:null, itemUI:UI_NEWSBOARD_ITEM, itemDef:itemDef, itemSize:cc.size(230, 256), itemDirection:"vertical"},//itemList2:{type:UITYPE_2D_LIST, items:null, itemUI:UI_NEWSBOARD_ITEM, itemDef:itemDef, itemSize:cc.size(230, 256), itemsPerPage:6},
			noItemText:{visible:false},
		};
		
		var widget = FWPool.getNode(UI_NEWSBOARD, false);
		if (!FWUI.isWidgetShowing(widget))
		{
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.onHide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
			
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), !FWUI.isWidgetShowing(widget) ? UIFX_POP : UIFX_NONE);
		
		if(!this.isExpired())
			this.showItems();
		
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "newsboard");
	},
	
	showItems:function()
	{
		var data;
		if(this.currentTab === NB_TAB_PRIVATE_SHOP)
			data = this.privateShopData;
		else // if(this.currentTab === NB_TAB_AIRSHIP)
			data = this.airshipData;
			
		if(data === null)
		{
			this.itemList.setVisible(false);
			this.pageText.setVisible(false);
			this.prevPage.setVisible(false);
			this.nextPage.setVisible(false);
			this.noItemText.setVisible(false);
			
			// TODO: show loading icon while refreshing
			
			// load data
			if(this.currentTab === NB_TAB_PRIVATE_SHOP)
			{
				var pk = network.connector.client.getOutPacket(this.RequestPrivateShopNewsBoard);
				pk.pack(0);
				network.connector.client.sendPacket(pk);
			}
			else // if(this.currentTab === NB_TAB_AIRSHIP)
			{
				var pk = network.connector.client.getOutPacket(this.RequestAirshipNewsBoard);
				pk.pack(0);
				network.connector.client.sendPacket(pk);
			}
			return;
		}
		
		// additional data to display items
		for(var i=0; i<data.length; i++)
		{
			data[i].index = i;
			data[i].itemName = Game.getItemName(data[i][NB_SLOT_ITEM]);
		}
		
		this.itemList.setVisible(true);
		this.itemList.uiDef.items = data;
		FWUI.fillData_2dlist(this.itemList, null, this.itemList.uiDef);
		FWUI.registerEvents(this.itemList);
		
		// jira#5105
		/*var isMultiplePages = (this.itemList.uiPagesCount > 0);
		this.pageText.setString("< " + (this.itemList.uiCurrentPage + 1) + "/" + this.itemList.uiPagesCount + " >");
		this.pageText.setVisible(isMultiplePages);
		this.prevPage.setVisible(isMultiplePages);
		this.nextPage.setVisible(isMultiplePages);*/
		this.noItemText.setVisible(data.length <= 0);

		var savedPos;
		if(this.currentTab === NB_TAB_PRIVATE_SHOP)
			savedPos = this.savedPosPS;
		else // if(this.currentTab === NB_TAB_AIRSHIP)
			savedPos = this.savedPosAirship;
		if(savedPos)
			this.itemList.getInnerContainer().setPosition(savedPos);	
	},
	
	isExpired:function(tab)
	{
		if(tab === undefined)
			tab = this.currentTab;
		if(tab === NB_TAB_PRIVATE_SHOP)
			return (gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP] + g_MISCINFO.NB_COUNTDOWN_TIME < Game.getGameTimeInSeconds());
		else if(tab === NB_TAB_AIRSHIP)
			return (gv.userData.game[GAME_TIME_NB_AIR_SHIP] + g_MISCINFO.NB_COUNTDOWN_TIME < Game.getGameTimeInSeconds());
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// airship ////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	showAirship:function()
	{
		this.currentTab = NB_TAB_AIRSHIP;
		
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:NB_SLOT_ITEM},
			amount:{type:UITYPE_TEXT, field:NB_SLOT_NUM, style:TEXT_STYLE_NUMBER},//amount:{type:UITYPE_TEXT, field:NB_SLOT_NUM, shadow:SHADOW_DEFAULT},
			name:{type:UITYPE_TEXT, field:"itemName", style:TEXT_STYLE_TEXT_DIALOG},//name:{type:UITYPE_TEXT, field:"itemName"},
			detailAirship:{visible:true},
			detailPrivateShop:{visible:false},
			asAmountGold:{type:UITYPE_TEXT, field:NB_SLOT_GOLD, style:TEXT_STYLE_NUMBER},//asAmountGold:{type:UITYPE_TEXT, field:NB_SLOT_GOLD, shadow:SHADOW_DEFAULT},
			asAmountExp:{type:UITYPE_TEXT, field:NB_SLOT_EXP, style:TEXT_STYLE_NUMBER},//asAmountExp:{type:UITYPE_TEXT, field:NB_SLOT_EXP, shadow:SHADOW_DEFAULT},
			itemBg:{onTouchEnded:this.onOpenFriendAirship.bind(this)},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_NB_AIR_SHIP"},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:gv.userData.game[GAME_TIME_NB_AIR_SHIP], endTime:gv.userData.game[GAME_TIME_NB_AIR_SHIP] + g_MISCINFO.NB_COUNTDOWN_TIME, countdown:true, onFinished:this.onRefresh.bind(this)},
			skipTimeButton:{onTouchEnded:this.onSkipTime.bind(this)},
			skipTimePrice:{type:UITYPE_TEXT, value:g_MISCINFO.NB_PRICE_REFRESH, style:TEXT_STYLE_TEXT_BUTTON},//skipTimePrice:{type:UITYPE_TEXT, value:g_MISCINFO.NB_PRICE_REFRESH, shadow:SHADOW_DEFAULT},
			// jira#5105
			page:{visible:false},//page:{type:UITYPE_TEXT, value:"", onTouchEnded:this.onChangePage.bind(this), style:TEXT_STYLE_TEXT_DIALOG},//page:{type:UITYPE_TEXT, value:"", onTouchEnded:this.onChangePage.bind(this)},
			nextPage:{visible:false},//nextPage:{onTouchEnded:this.onChangePage.bind(this)},
			prevPage:{visible:false},//prevPage:{onTouchEnded:this.onChangePage.bind(this)},
			privateShopButtonSelected:{visible:false},
			privateShopButtonNotSelected:{visible:true, onTouchEnded:this.onChangeTab.bind(this)},
			airshipButtonSelected:{visible:true},
			airshipButtonNotSelected:{visible:false},
			closeButton:{onTouchEnded:this.onHide.bind(this)},
			// jira#5105
			//itemList:{visible:false},
			itemList2:{type:UITYPE_2D_LIST, items:null, itemUI:UI_NEWSBOARD_ITEM, itemDef:itemDef, itemSize:cc.size(230, 256), itemDirection:"vertical"},//itemList2:{type:UITYPE_2D_LIST, items:null, itemUI:UI_NEWSBOARD_ITEM, itemDef:itemDef, itemSize:cc.size(230, 256), itemsPerPage:6},
			noItemText:{visible:false},
		};
		
		var widget = FWPool.getNode(UI_NEWSBOARD, false);
		if (!FWUI.isWidgetShowing(widget))
		{
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.onHide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), !FWUI.isWidgetShowing(widget) ? UIFX_POP : UIFX_NONE);

		if(!this.isExpired())
			this.showItems();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// event //////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	onRefresh:function(sender, price)//web onRefresh:function(sender, price = 0)
	{
		if(price === undefined)
			price = 0;
		
		if(this.currentTab === NB_TAB_PRIVATE_SHOP)
		{
			gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP] = 0; // will reset after reciving data from server gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP] = Game.getGameTimeInSeconds();
			
			// server
			var pk = network.connector.client.getOutPacket(this.RequestPrivateShopNewsBoard);
			pk.pack(price);
			network.connector.client.sendPacket(pk);
		}
		else if(this.currentTab === NB_TAB_AIRSHIP)
		{
			gv.userData.game[GAME_TIME_NB_AIR_SHIP] = 0; // will reset after reciving data from server gv.userData.game[GAME_TIME_NB_AIR_SHIP] = Game.getGameTimeInSeconds();
			
			// server
			var pk = network.connector.client.getOutPacket(this.RequestAirshipNewsBoard);
			pk.pack(price);
			network.connector.client.sendPacket(pk);
		}
	},
	
	onSkipTime:function(sender)
	{
		if(Game.consumeDiamond(g_MISCINFO.NB_PRICE_REFRESH, FWUtils.getWorldPosition(sender)))
		{
			this.onRefresh(sender, g_MISCINFO.NB_PRICE_REFRESH);
			AudioManager.effect(EFFECT_GOLD_PAYING);
		}
	},
	
	onChangeTab:function(sender)
	{
		this.saveScrollPos();
		
		var name = sender.getName();
		if(name === "privateShopButtonNotSelected")
			this.showPrivateShop();
		else if(name === "airshipButtonNotSelected")
			this.showAirship();
			
		AudioManager.effect(EFFECT_POPUP_SHOW);
	},
	
	saveScrollPos:function()
	{
		if(this.currentTab === NB_TAB_PRIVATE_SHOP)
			this.savedPosPS = this.itemList.getInnerContainer().getPosition();
		else // if(this.currentTab === NB_TAB_AIRSHIP)
			this.savedPosAirship = this.itemList.getInnerContainer().getPosition();
	},
	
	// jira#5105
	/*onChangePage:function(sender)
	{
		var name = sender.getName();
		var offset = (name === "page" || name === "nextPage" ? 1 : -1);
		this.pageText.setString(FWUI.set2dlistPage(this.itemList, offset, true));
		
		AudioManager.effect(EFFECT_POPUP_SHOW);
	},*/
	
	onHide:function(sender)
	{
		FWUI.hide(UI_NEWSBOARD, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	onOpenFriendPrivateShop:function(sender)
	{
		this.saveScrollPos();
		PrivateShop.showFriendPrivateShop(sender.uiData);
		this.onHide();
	},
	
	onOpenFriendAirship:function(sender)
	{
		this.saveScrollPos();
		Airship.showFriendAirship(sender.uiData);
		//this.onHide(); jira#5304
	},	
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestPrivateShopNewsBoard:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PRIVATE_SHOP_NEWS_BOARD);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePrivateShopNewsBoard:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() === 0)
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				
				// fake data to test, TODO: remove
				NewsBoard.privateShopData = object[KEY_NEWS_BOARD];
				NewsBoard.refreshNewsboardAnim();
				/*NewsBoard.privateShopData = [];
				for(var i=0; i<10; i++)
				{
					var item = {};
					item[NB_SLOT_USER_ID] = i;
					item[NB_SLOT_USER_NAME] = "tao" + i;
					item[NB_SLOT_ID] = i;
					item[NB_SLOT_ITEM] = "T" + i;
					item[NB_SLOT_NUM] = i;
					item[NB_SLOT_GOLD] = i * 200;
					item[NB_SLOT_EXP] = i * 100;
					item[NB_SLOT_TIME_AD] = Game.getGameTimeInSeconds();
					NewsBoard.privateShopData.push(item);
				}*/
			}
			else
				cc.log("NewsBoard.ResponsePrivateShopNewsBoard: error=" + this.getError());
			
			if(NewsBoard.isExpired(NB_TAB_PRIVATE_SHOP))
				gv.userData.game[GAME_TIME_NB_PRIVATE_SHOP] = Game.getGameTimeInSeconds();
			if(FWUI.isShowing(UI_NEWSBOARD))
				NewsBoard.showPrivateShop();
		}
	}),					
	
	RequestAirshipNewsBoard:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_NEWS_BOARD);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponseAirshipNewsBoard:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() === 0)
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				NewsBoard.airshipData = object[KEY_NEWS_BOARD];
				NewsBoard.refreshNewsboardAnim();
			}
			else
				cc.log("NewsBoard.ResponsePrivateShopNewsBoard: error=" + this.getError());
			
			if(NewsBoard.isExpired(NB_TAB_AIRSHIP))
				gv.userData.game[GAME_TIME_NB_AIR_SHIP] = Game.getGameTimeInSeconds();
			if(FWUI.isShowing(UI_NEWSBOARD))
				NewsBoard.showAirship();
		}
	}),						
};

network.packetMap[gv.CMD.PRIVATE_SHOP_NEWS_BOARD] = NewsBoard.ResponsePrivateShopNewsBoard;
network.packetMap[gv.CMD.AIRSHIP_NEWS_BOARD] = NewsBoard.ResponseAirshipNewsBoard;
