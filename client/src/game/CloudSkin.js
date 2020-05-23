
const ENABLE_CLOUD_SKIN = g_MISCINFO.CLOUD_SKIN_ACTIVE;
const SKINID_DEFAULT = "SK0";

var CloudSkin =
{
	floorIdx: -1,
	skinList: null,
	floorSkinData: null,
	selectedSkinId: null,
	
	init:function()
	{
		this.skinList = [];
		this.floorSkinData = [];
		
		for(var key in g_SKIN_ITEM)
		{
			var skin = g_SKIN_ITEM[key];
			if(skin.SUB_TYPE !== defineTypes.SUB_TYPE_CLOUD_SKIN)
				continue;
			
			skin.canBuyInShop = Game.canBuyInShop(skin.ID);
			this.skinList.push(skin);
		}
		
		// load
		for(var i=0; i<MAX_FLOORS; i++)
		{
			var data = {};
			
			var svrSkinData = gv.userData.game[GAME_FLOORS][i];
			if(svrSkinData)
				svrSkinData = svrSkinData[FLOOR_SKIN];
			
			if(svrSkinData && svrSkinData[SKIN_ID])
			{
				data.skinId = svrSkinData[SKIN_ID];
				data.startTime = svrSkinData[SKIN_START_TIME];
				data.endTime = svrSkinData[SKIN_END_TIME];
			}
			else
			{
				data.skinId = SKINID_DEFAULT;
				data.startTime = -1;
				data.endTime = -1;
			}
			
			this.floorSkinData.push(data);
		}

		this.checkSkinExpiration();
		var lastUnlockedFloor = CloudFloors.getLastUnlockedFloorIdx();
		for(var i=0; i<=lastUnlockedFloor; i++)
			this.applySkinToFloor(i, this.floorSkinData[i].skinId);
	},
	
	uninit:function()
	{
		
	},
	
	showSkinSelection:function(sender)
	{
		// jira#6581
		if(gv.background.floorIndex < 0)
			return;
		
		if(gv.userData.getLevel() < g_MISCINFO.CLOUD_SKIN_USER_LEVEL)
			return;
		
		this.floorIdx = sender.getParent().getTag();
		if(this.floorIdx > 0 && this.floorIdx !== CloudFloors.currentFloorNum + 1)
			return; // can only select floor that has cloud num icon
		
		this.selectedSkinId = this.floorSkinData[this.floorIdx].skinId;
		this.showSkinSelection2();
	},
	
	showSkinSelection2:function()
	{
		// update display data
		var len = this.skinList.length;
		for(var i=0; i<len; i++)
		{
			var skin = this.skinList[i];
			skin.amount = gv.userStorages.getItemAmount(skin.ID);
			skin.displayAmount = "x" + skin.amount;
			skin.background = (skin.ID === this.selectedSkinId ? "hud/hud_daily_login_slot_active.png" : "hud/hud_daily_login_slot_done.png");
		}
		
		var itemDef =
		{
			back:{type:UITYPE_IMAGE, field:"background"},
			check:{visible:"data.ID === CloudSkin.floorSkinData[CloudSkin.floorIdx].skinId"},
			textTitle:{visible:false},
			textAmount:{type:UITYPE_TEXT, field:"displayAmount", style: TEXT_STYLE_TEXT_NORMAL, visible:"data.amount > 0"},
			spine:{visible:false},
			buyButton:{visible:"data.ID !== \"SK0\" && data.amount <= 0 && data.canBuyInShop", onTouchEnded:this.buySkin.bind(this)},
			gfx:{type:UITYPE_ITEM, field:"ID", visible:true, color:"data.ID === \"SK0\" || data.amount > 0 ? cc.WHITE : cc.color(128, 128, 128, 255)"},
			container:{onTouchEnded:this.onSkinSelected.bind(this), onTouchBegan:this.showHint.bind(this), forceTouchEnd:true},
		};

		var uiDef =
		{
			backButton:{onTouchEnded:this.hideSkinSelection.bind(this)},
			title:{type:UITYPE_TEXT, value:"TXT_CLOUD_SKIN_TITLE", style:TEXT_STYLE_TITLE_1},
			rightArrow:{visible:len >= 6},
			leftArrow:{visible:len >= 6},
			itemList:{type:UITYPE_2D_LIST, items:this.skinList, itemUI:UI_DAILY_GIFT_ITEM, itemDef:itemDef, itemSize:cc.size(155, 175), singleLine:true},
			okButton:{visible:this.selectedSkinId === SKINID_DEFAULT || (this.selectedSkinId && gv.userStorages.getItemAmount(this.selectedSkinId) > 0), onTouchEnded:this.showConfirm.bind(this)},// jira#5966 okButton:{visible:this.selectedSkinId !== this.floorSkinData[this.floorIdx].skinId, onTouchEnded:this.showConfirm.bind(this)},
			okText:{type:UITYPE_TEXT, value:"TXT_OK", style:TEXT_STYLE_TEXT_BUTTON},
		};
		
		// show
		var widget = FWPool.getNode(UI_CLOUD_SKIN_SELECT, false);
		if(FWUI.isWidgetShowing(widget))
		{
			var scrollPos = this.itemList.getInnerContainer().getPosition();
			FWUI.fillData(widget, null, uiDef);
			this.itemList.getInnerContainer().setPosition(scrollPos);
		}
		else
		{
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgCloudSkin");
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			this.widget = widget;
			this.itemList = FWUtils.getChildByName(this.widget, "itemList");
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hideSkinSelection();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		
		this.showPreview();
	},
	
	hideSkinSelection:function(sender)
	{
		FWUtils.hideDarkBg(null, "darkBgCloudSkin");
		FWUI.hide(UI_CLOUD_SKIN_SELECT, UIFX_POP);
		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	showConfirm:function(sender)
	{
		// jira#5966
		//if(this.floorSkinData[this.floorIdx].skinId === this.selectedSkinId)
		//{
		//	this.hideSkinSelection();
		//	return;
		//}
		
		if(this.floorSkinData[this.floorIdx].skinId !== SKINID_DEFAULT)
		{
			var gfx = Game.getItemGfxByDefine(this.selectedSkinId);
			var displayInfo = {title:"TXT_WARNING", content:"TXT_CLOUD_SKIN_CONFIRM", closeButton:true, okText:"TXT_OK", icon:gfx.sprite, avatar:NPC_AVATAR_WOLF_ARTIST};
			Game.showPopup(displayInfo, this.onConfirmed.bind(this));
			return;
		}
		
		this.onConfirmed(sender);
	},
	
	onConfirmed:function(sender)
	{
		// server
		//this.applySkinToFloor(this.floorIdx, this.selectedSkinId);
		
		if(this.selectedSkinId === SKINID_DEFAULT)
		{
			var pk = network.connector.client.getOutPacket(CloudSkin.RequestCloudSkinClear);
			pk.pack(this.floorIdx);
			network.connector.client.sendPacket(pk);
		}
		else
		{
			var pk = network.connector.client.getOutPacket(CloudSkin.RequestCloudSkinApply);
			pk.pack(this.floorIdx, this.selectedSkinId, this.selectedSkinId === SKINID_DEFAULT ? -1 : gv.userStorages.getItemAmount(this.selectedSkinId));
			network.connector.client.sendPacket(pk);
		}
		
		this.hideSkinSelection();
	},
	
	buySkin:function(sender)
	{
		Game.openShop(sender.uiData.ID, function() {CloudSkin.showSkinSelection2()});
	},
	
	onSkinSelected:function(sender)
	{
		gv.hintManagerNew.hideHint(null,sender.uiData.ID);
		
		var data = sender.uiData;
		if(data.ID !== SKINID_DEFAULT && data.amount <= 0)
		{
			//this.buySkin(sender); // jira#5967
			return;
		}
		
		this.selectedSkinId = data.ID;
		this.showSkinSelection2();
	},
	
	showPreview:function()
	{
		var cloud = FWUtils.getChildByName(this.widget, "cloud");
		var cloudCover = FWUtils.getChildByName(this.widget, "cloud_cover");
		var skin = g_SKIN_ITEM[this.selectedSkinId];
		var nameSuffix = (this.selectedSkinId === SKINID_DEFAULT ? "" : "_" + skin.DISPLAY);
		cloud.loadTexture("cloud_floor/cloud_main" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);
		cloudCover.loadTexture("cloud_floor/cloud_slots_decor" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);

		// basic pos
		cloud.setPosition(0, -52);
		cloudCover.setPosition(-12, -52);
		
		// quick fix cloud position
		if(this.selectedSkinId === "SK0")
			cloud.setPosition(0, -40);
		if(this.selectedSkinId === "SK7")
			cloud.setPosition(0, -57);
		else if(this.selectedSkinId === "SK8")
		{
			cloud.setPosition(0, -65);
			cloudCover.setPosition(-12, -85);
		}
		else if(this.selectedSkinId === "SK9")
		{
			cloud.setPosition(0, -55);
			cloudCover.setPosition(-12, -65);
		}
		else if(this.selectedSkinId === "SK10")
		{
			cloud.setPosition(0, -55);
			cloudCover.setPosition(-12, -75);
		}
		else if(this.selectedSkinId === "SK11")
		{
			cloud.setPosition(0, -42);
			cloudCover.setPosition(-42, -62);
		}
		else if(this.selectedSkinId === "SK12")
		{
			cloud.setPosition(0, -52);
			cloudCover.setPosition(-10, -50);
		}
	},
	
	applySkinToFloor:function(floorIdx, skinId, effect)
	{
		var change = false;
		if(this.floorSkinData[floorIdx].skinId !== skinId)
		{
			this.floorSkinData[floorIdx].skinId = skinId;
			change = true;
		}

		// texture
		var widget = CloudFloors.firstFloorMarker.getChildByTag(floorIdx);
		var mainCloud = widget.getChildByName("mainCloud");
		var cloudCover_decor = widget.getChildByName("cloudCover_decor");
		var cloudCover_noDecor = widget.getChildByName("cloudCover_noDecor");
		var cloudSlots = widget.getChildByName("slots");
		var skin = g_SKIN_ITEM[skinId];
		var nameSuffix = (skinId === SKINID_DEFAULT ? "" : "_" + skin.DISPLAY);
		
		mainCloud.loadTexture("cloud_floor/cloud_main" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);
		cloudCover_noDecor.loadTexture("cloud_floor/cloud_cover" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);
		cloudCover_decor.loadTexture("cloud_floor/cloud_slots_decor" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);
		cloudSlots.loadTexture("cloud_floor/cloud_slots_pot" + nameSuffix + ".png", ccui.Widget.PLIST_TEXTURE);
		
		// basic pos
		mainCloud.setPosition(567, -12);
		cloudCover_decor.setPosition(554, -12);
		
		// quick fix cloud position
		if(this.selectedSkinId !== "SK0")
			mainCloud.setPosition(567, 0);
		if(skinId === "SK7")
			mainCloud.setPosition(567, -15);
		else if(skinId === "SK8")
		{
			mainCloud.setPosition(567, -25);
			cloudCover_decor.setPosition(554, -45);
		}
		else if(skinId === "SK9")
		{
			mainCloud.setPosition(567, -15);
			cloudCover_decor.setPosition(554, -25);
		}
		else if(skinId === "SK10")
		{
			mainCloud.setPosition(567, -22);
			cloudCover_decor.setPosition(554, -42);
			cloudCover_noDecor.setPosition(554, -17);
		}
		else if(skinId === "SK11")
		{
			mainCloud.setPosition(567, -2);
			cloudCover_decor.setPosition(535, -22);
			cloudCover_noDecor.setPosition(545, 3);
		}
		else if(skinId === "SK12")
		{
			mainCloud.setPosition(567, -12);
			cloudCover_decor.setPosition(561, -11);
			cloudCover_noDecor.setPosition(552, 4);
		}

		if(change || effect)
		{
			// fx
			if(skinId !== SKINID_DEFAULT)
			{
				var pos = widget.getPosition();
				pos.y += 60; // center
				FWUtils.showSpine(SPINE_EFFECT_UNLOCK, null, "effect_unlock_cloud", false, widget.getParent(), pos, widget.getLocalZOrder() + 1);
			}
		}
	},
	
	checkSkinExpiration:function()
	{
		var lastUnlockedFloor = CloudFloors.getLastUnlockedFloorIdx();
		var currentTime = Game.getGameTimeInSeconds();
		for(var i=0; i<=lastUnlockedFloor; i++)
		{
			if(this.floorSkinData[i].skinId !== SKINID_DEFAULT && this.floorSkinData[i].endTime >= 0 && this.floorSkinData[i].endTime < currentTime)
				this.applySkinToFloor(i, SKINID_DEFAULT);
		}
	},
	
	showHint:function(sender)
	{
		if(sender.uiData.ID === SKINID_DEFAULT)
			return;
		
        var position = null;
        if(FWUI.touchedWidget){
            //cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
            position = FWUI.touchedWidget.getTouchBeganPosition();
        }
        var widget = FWPool.getNode(UI_CLOUD_SKIN_SELECT, false);
        //UI_CLOUD_SKIN_SELECT

        gv.hintManagerNew.show(widget, null, sender.uiData.ID,position);
	},
	
	updateSkinDataFromServer:function(floorIdx, svrSkinData)
	{
		if(svrSkinData)
		{
			this.applySkinToFloor(floorIdx, svrSkinData[SKIN_ID], true);
			var data = this.floorSkinData[floorIdx];
			data.skinId = svrSkinData[SKIN_ID];
			data.startTime = svrSkinData[SKIN_START_TIME];
			data.endTime = svrSkinData[SKIN_END_TIME];
		}
		else
		{
			this.applySkinToFloor(floorIdx, SKINID_DEFAULT);
			var data = this.floorSkinData[floorIdx];
			data.skinId = SKINID_DEFAULT;
			data.startTime = -1;
			data.endTime = -1;
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestCloudSkinApply:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CLOUD_SKIN_APPLY);},
		pack:function(floor, itemId, num)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FLOOR, floor);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			PacketHelper.putInt(this, KEY_ITEM_NUM, num);
			
			addPacketFooter(this);
		},
	}),

	ResponseCloudSkinApply:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("CloudSkin::ResponseCloudSkinApply: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				CloudSkin.updateSkinDataFromServer(object[KEY_FLOOR], object[KEY_FLOOR_SKIN]);
				
				Achievement.onAction(g_ACTIONS.ACTION_CLOUD_SKIN.VALUE, object[KEY_FLOOR_SKIN][SKIN_ID], 1);
			}
		}
	}),
	
	RequestCloudSkinClear:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CLOUD_SKIN_CLEAR);},
		pack:function(floor)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FLOOR, floor);
			
			addPacketFooter(this);
		},
	}),

	ResponseCloudSkinClear:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(this.getError() !== 0)
				cc.log("CloudSkin::ResponseCloudSkinApply: error=" + this.getError());
			else
			{
				var object = PacketHelper.parseObject(this);
				Game.updateUserDataFromServer(object);
				CloudSkin.updateSkinDataFromServer(object[KEY_FLOOR], null);
			}
		}
	}),	
};

network.packetMap[gv.CMD.CLOUD_SKIN_APPLY] = CloudSkin.ResponseCloudSkinApply;
network.packetMap[gv.CMD.CLOUD_SKIN_CLEAR] = CloudSkin.ResponseCloudSkinClear;
