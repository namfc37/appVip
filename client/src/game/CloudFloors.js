
const CLOUDFLOOR_HEIGHT = 300;
const BUFF_SKIN = 0;
const BUFF_POT =1;
const  BUFF_DECOR = 2;

var CloudFloors =
{
	bean: null,
	firstFloorMarker: null,
	lockedFloorWidget: null,
	plantedPlantsAndCounts: {},
	harvestedItemsAndCounts: {},
	catchPestAndCounts: {},
	
	// all slots
	slots: null,
	
	init:function()
	{
		this.bean = FWUI.getChildByName(FWPool.getNode(UI_BACKGROUND, false), "bean");
		this.firstFloorMarker = FWUI.getChildByName(this.bean, "beanFirstFloorMarker");
		this.lockedFloorWidget = null;
		
		this.slots = new Array(MAX_FLOORS);
		for(var i=0; i<MAX_FLOORS; i++)
			this.slots[i] = new Array(MAX_SLOTS_PER_FLOOR);
	},
	
	uninit:function()
	{
		for(var i=0; i<MAX_FLOORS; i++)
			this.removeFloor(i);
	},
	
	show:function()
	{
		for(var i = MAX_FLOORS - 1; i >= 0; i--)//for(var i=0; i<MAX_FLOORS; i++)
			this.showFloor(i);
	},
	
	showFloor:function(idx)
	{
		// validate
		var isVisibleFloor = (idx <= this.getLastUnlockedFloorIdx() + 1);
		if(isVisibleFloor === false)
		{
			this.removeFloor(idx);
			return;
		}
		
		// validate
		var isLockedFloor = (idx === this.getLastUnlockedFloorIdx() + 1);
		var widget = this.firstFloorMarker.getChildByTag(idx);
		if(widget !== null
			&& ((isLockedFloor === true && widget.poolKey === UI_CLOUDFLOOR) // incorrect
				|| (isLockedFloor === false && widget.poolKey === UI_CLOUDFLOOR_TOP))) // incorrect
		{
			this.removeFloor(idx);
			widget = null;
		}
		
		// get floor widget
		var recreateSlots = false;
		if(widget === null)
		{
			widget = FWPool.getNode(isLockedFloor ? UI_CLOUDFLOOR_TOP : UI_CLOUDFLOOR, !isLockedFloor);
			widget.setContentSize(1136, 640);
			widget.setAnchorPoint(cc.p(0.5, 0));
			widget.setPosition(0, idx * CLOUDFLOOR_HEIGHT);
			widget.setLocalZOrder(idx * 100);
			widget.setTag(idx);

			var machineNode = FWUI.getChildByName(widget, "machine");
            var machineStorageNode = FWUI.getChildByName(widget, "machineStorage");

			gv.userMachine.attachMachineToFloor(machineNode, machineStorageNode, idx);
            gv.userMachine.refreshMachineByFloor(idx);

			if(isLockedFloor === false)
			{
				// vary gfx
				var bean01 = FWUI.getChildByName(widget, "bean01");
				var bean02 = FWUI.getChildByName(widget, "bean02");
				var bean03 = FWUI.getChildByName(widget, "bean03");
				var cloudCover_decor = FWUI.getChildByName(widget, "cloudCover_decor");
				var cloudCover_noDecor = FWUI.getChildByName(widget, "cloudCover_noDecor");
				bean01.setVisible((idx & 1) === 0 && idx < MAX_FLOORS - 1);
				bean02.setVisible((idx & 1) === 1 && idx < MAX_FLOORS - 1);
				bean03.setVisible(idx === MAX_FLOORS - 1);
				cloudCover_decor.setVisible(idx > 0);
				cloudCover_noDecor.setVisible(idx <= 0);
				
				var floorDef = 
				{
					skinSelect:{visible:ENABLE_CLOUD_SKIN && !Game.isFriendGarden(), onTouchEnded:CloudSkin.showSkinSelection.bind(CloudSkin)},
				};
				FWUI.fillData(widget, null, floorDef);
			}
			else
			{
				// notifyBlockedTouch to allow scrolling
				var topFloorDef = 
				{
					bean01_lockedFloor:{notifyBlockedTouch:true, onTouchEnded:this.showUnlockFloorMenu.bind(this)},
					leaf_lockedFloor:{notifyBlockedTouch:true, onTouchEnded:this.showUnlockFloorMenu.bind(this)},
				};
				FWUI.fillData(widget, null, topFloorDef);
				this.lockedFloorWidget = widget;
			}
			
			FWUI.showWidget(widget, this.firstFloorMarker, UIFX_NONE, false);
			recreateSlots = true;
		}

		// show slots
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[idx][i];
			if(slot !== undefined
				&& (recreateSlots === true || isLockedFloor === true))
			{
				// invalid slot
				slot.uninit();
				slot = undefined;
				delete this.slots[idx][i];
			}
			
			if(isLockedFloor === true)
				continue;
			
			if(slot === undefined)
			{
				// slot not created => create now
				slot = new CloudFloorSlot();
				slot.init(widget.getChildByName("slot0" + i), idx, i);// opt slot.init(FWUI.getChildByName(widget, "slot0" + i), idx, i);
				this.slots[idx][i] = slot;
			}
			slot.refresh(this.getSlotData(idx, i));
		}
		
		this.showPotSetFx(idx);
	},
	
	removeFloor:function(idx)
	{
		var widget = this.firstFloorMarker.getChildByTag(idx);
		if(widget !== null)
		{
			// remove slots
			for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
			{
				if(this.slots[idx][i] === undefined)
					continue;
				this.slots[idx][i].uninit();
				delete this.slots[idx][i];
			}
			
			// remove machine
			gv.userMachine.detachMachineFromFloor(idx);
			
			// remove floor widget
			FWUI.hideWidget(widget);
		}
	},
	
	// get slot data
	getSlotData:function(floorIdx, slotIdx)
	{
		return gv.userData.game[GAME_FLOORS][floorIdx][FLOOR_SLOTS][slotIdx];
	},

	// set slot data
	setSlotData:function(floorIdx, slotIdx, data, refresh)//web setSlotData:function(floorIdx, slotIdx, data, refresh = true)
	{
		if(refresh === undefined)
			refresh = true;
		
		gv.userData.game[GAME_FLOORS][floorIdx][FLOOR_SLOTS][slotIdx] = data;
		if(refresh === true && this.slots[floorIdx][slotIdx])
			this.slots[floorIdx][slotIdx].refresh(data);
		
		// TODO: optimize: only call showPotSetFx() once where there is data change
		this.showPotSetFx(floorIdx);
	},
	
	getPotsOnFloor:function(idx)
	{
		var list = [];
		for (var i in this.slots[idx])
		{
			var slot = this.slots[idx][i];
			if (slot && slot.slotData && slot.slotData[SLOT_POT] !== "")
				list.push (slot.slotData[SLOT_POT]);
		}

		return list;
	},

	getDecorsOnFloor:function(idx)
	{
		var list = [];
		for (var i in this.slots[idx])
		{
			var slot = this.slots[idx][i];
			if (slot && slot.slotData && slot.slotData[SLOT_DECOR] !== "")
				list.push (slot.slotData[SLOT_DECOR]);
		}
		
		return list;
	},

	getEmptyPotsCountOnFloor:function(idx)
	{
		var count = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[idx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.slotData[SLOT_POT] !== "" && slot.slotData[SLOT_PLANT] === "")
				count++;
		}
		return count;
	},

	getPotsCountOnFloor:function(idx)
	{
		var count = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[idx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.slotData[SLOT_POT] !== "")
				count++;
		}
		return count;
	},

	getDecorsCountOnFloor:function(idx)
	{
		var count = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[idx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.slotData[SLOT_DECOR] !== "")
				count++;
		}
		return count;
	},
	
	getBugsCountOnFloor:function(idx)
	{
		var count = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[idx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.hasBug())
				count++;
		}
		return count;
	},
	
	moveEmptyPots2Stock:function(floorIdx)
	{
		var floors = [];
		var slots = [];
		
		var delay = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[floorIdx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.slotData[SLOT_POT] !== "" && slot.slotData[SLOT_PLANT] === "")
			{
				if(slot.onMovePot2Stock(null, delay) === false)
					break; // failed, perhaps full stock
				
				// success
				delay += SEQUENCE_DELAY;
				floors.push(floorIdx);
				slots.push(i);
			}
		}
		
		// server
		var pk = network.connector.client.getOutPacket(CloudFloors.RequestPotStore);
		pk.pack(floors, slots);
		network.connector.client.sendPacket(pk);
	},
	
	moveFloorDecors2Stock:function(floorIdx)
	{
		var floors = [];
		var slots = [];
		
		var delay = 0;
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[floorIdx][i];
			if(slot !== undefined && slot.slotData !== undefined && slot.slotData[SLOT_DECOR] !== "")
			{
				if(slot.onMoveDecor2Stock(null, delay) === false)
					break; // failed, perhaps full stock
				
				// success
				delay += SEQUENCE_DELAY;
				floors.push(floorIdx);
				slots.push(i);
			}
		}
		
		// server
		var pk = network.connector.client.getOutPacket(CloudFloors.RequestDecorStore);
		pk.pack(floors, slots);
		network.connector.client.sendPacket(pk);
	},	
	
	// jira#4633
	showNextSlotSkipTime:function(currentSlot)
	{
		for(var i=currentSlot.slotIdx + 1; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = this.slots[currentSlot.floorIdx][i];
			if(slot !== undefined && slot.slotData !== undefined
				&& slot.slotData[SLOT_POT] !== "" && slot.slotData[SLOT_PLANT] !== ""
				&& (slot.plantState === PLANT_STATE_SEED || slot.plantState === PLANT_STATE_TEENAGE))
			{
				slot.showPlantStatus();
				break;
			}
		}
	},
	
	potUpgradeIcons: {},
	refreshUpgradeIcons:function()
	{
		if(!this.slots)
			return;
		
		this.potUpgradeIcons = {};
		for(var j=0; j<MAX_FLOORS; j++)
		{
			if(!this.slots[j] || !this.slots[j][0])
				continue;
			
			for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				this.slots[j][i].refreshUpgradeIcon();
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// floor unlocking //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	isFloorUnlocked:function(idx)
	{
		return (idx <= this.getLastUnlockedFloorIdx());
	},
	
	getLastUnlockedFloorIdx:function()
	{
		return gv.userData.game[GAME_FLOORS].length - 1;
	},
	
	unlockFx: null,
	unlockNextFloor:function()
	{
		// fx
		var widget = this.firstFloorMarker.getChildByTag(this.getLastUnlockedFloorIdx() + 1);
		var pos = widget.getPosition();
		pos.y += 60; // center
		this.unlockFx = FWUtils.showSpine(SPINE_EFFECT_UNLOCK, null, "effect_unlock_cloud", false, widget.getParent(), pos, widget.getLocalZOrder() + 1);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.unlockNextFloor2, 0, 0, 1, false);
	},
	
	unlockNextFloor2:function()
	{
		// fix: machine not shown when unlocking new floor
		var floorIdx = gv.userData.game[GAME_FLOORS].length;
		gv.userMachine.detachMachineFromFloor(floorIdx);
		
		// new empty floor data
		var newFloor = {};
		newFloor[FLOOR_MACHINE] = {};
		newFloor[FLOOR_MACHINE][MACHINE_TIME_START_UNLOCK] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_LEVEL] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_NUM_SLOT] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_DURABILITY] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_WORKING_TIME] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_STORE] = [];
        newFloor[FLOOR_MACHINE][MACHINE_TIME_FINISH_PRODUCE] = 0;
		newFloor[FLOOR_MACHINE][MACHINE_PRODUCE_ITEMS] = [];

		newFloor[FLOOR_SLOTS] = [];
		for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
		{
			var slot = {};
			slot[SLOT_DECOR] = "";
			slot[SLOT_POT] = "";
			slot[SLOT_PLANT] = "";
			slot[SLOT_PEST] = "";
			slot[SLOT_TIME_START] = "";
			slot[SLOT_DROP_ITEMS] = {};
			newFloor[FLOOR_SLOTS].push(slot);
		}
		gv.userData.game[GAME_FLOORS].push(newFloor);
		this.show();
		this.unlockFx = null;
		
		// fix: machine not shown when unlocking new floor
		gv.userMachine.refresh();

		// server
		var pk = network.connector.client.getOutPacket(this.RequestFloorUpgrade);
		pk.pack();
		network.connector.client.sendPacket(pk);
		
		// jira#6129
		if(CloudFloors.getLastUnlockedFloorIdx() >= 2)
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {Game.shouldShowRatingPopup = true;}, 0, 0, 2, false);
		
		// fix: newly unlocked cloud has sp skin
		CloudSkin.applySkinToFloor(CloudFloors.getLastUnlockedFloorIdx(), SKINID_DEFAULT, false);
	},
	
	showUnlockFloorMenu:function(sender, isRefresh)//web showUnlockFloorMenu:function(sender, isRefresh = false)
	{
		if(isRefresh === undefined)
			isRefresh = false;
		
		if(Game.isFriendGarden())
			return;
		
		if(this.unlockFx !== null)
			return; // unlocking is in progress

		var floorIdx = this.getLastUnlockedFloorIdx() + 1;

		var floorData = g_FLOOR[floorIdx];
		var topFloor = this.firstFloorMarker.getChildByTag(floorIdx);
		var pos = (topFloor ? FWUtils.getWorldPosition(topFloor) : null);
		
		if(gv.userData.getLevel() < floorData.USER_LEVEL)
		{
			// show warning text if user has lower level
			var text = cc.formatStr(FWLocalization.text("TXT_UNLOCK_FLOOR_REQUIRE_LEVEL"), floorData.USER_LEVEL);
			FWUtils.showWarningText(text, cc.p(pos.x, pos.y + 80));
			return;
		}
		
		// jira#4656
		if(gv.userMachine.getMachineByFloor(this.getLastUnlockedFloorIdx()).state < MACHINE_STATE_READY)
		{
			if(gv.userMachine.getMachineByFloor(this.getLastUnlockedFloorIdx()).state <= MACHINE_STATE_UNLOCKABLE)
			{
				//FWUtils.showWarningText(FWLocalization.text("TXT_UNLOCK_FLOOR_REQUIRE_MACHINE"), cc.p(pos.x, pos.y + 80));
				Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_UNLOCK_FLOOR_REQUIRE_MACHINE"}, function() {gv.userMachine.getMachineByFloor(CloudFloors.getLastUnlockedFloorIdx()).showPopupUnlock();});
			}
			else
			{
				Game.showPopup({title:"TXT_POPUP_TITLE", content:"TXT_UNLOCK_FLOOR_REQUIRE_MACHINE_GROWING"}, function() {});
			}

			return;
		}
		
		// unlock items
		var requireItems = [];
		var hasEnoughItem = true;
		for(var itemId in floorData.REQUIRE_ITEM)
		{
			var require = floorData.REQUIRE_ITEM[itemId];
			var current, price;
			if(itemId === ID_GOLD)
			{
				current = gv.userData.getGold();
				price = (current < require ? 1 : 0);
			}
			else
			{
				var itemInStock = gv.userStorages.getItem(itemId);
				current = (itemInStock ? itemInStock.itemAmount : 0);
				price = (require - current) * g_MATERIAL[itemId].DIAMOND_BUY;
			}
			var itemData = {itemId:itemId, require:require, current:current, price:price, enough:(current >= require), displayAmount:(itemId === ID_GOLD ? require : current + "/" + require)};
			requireItems.push(itemData);
			
			if(require > current)
				hasEnoughItem = false;
		}
		
		// def
		var itemDef =
		{
			check:{visible:"data.enough"},
			item:{type:UITYPE_IMAGE, field:"itemId", subType:defineTypes.TYPE_MATERIAL, scale:0.6},
			amount:{type:UITYPE_TEXT, field:"displayAmount", color:"data.enough ? cc.GREEN : cc.RED", style:TEXT_STYLE_NUMBER},//amount:{type:UITYPE_TEXT, field:"displayAmount", color:"data.enough ? cc.GREEN : cc.RED", shadow:SHADOW_DEFAULT},
			buyButton:{onTouchEnded:this.onBuyUnlockItem.bind(this), scale9:true, visible:"data.enough === false"},
			buyText:{type:UITYPE_TEXT, value:"TXT_BUY", style:TEXT_STYLE_TEXT_BUTTON, visible:"data.enough === false && data.itemId === ID_GOLD"},//buyText:{type:UITYPE_TEXT, value:"TXT_BUY", shadow:SHADOW_DEFAULT, visible:"data.enough === false && data.itemId === ID_GOLD"},
			price:{type:UITYPE_TEXT, field:"price", style:TEXT_STYLE_TEXT_BUTTON, visible:"data.enough === false && data.itemId !== ID_GOLD"},//price:{type:UITYPE_TEXT, field:"price", shadow:SHADOW_DEFAULT, visible:"data.enough === false && data.itemId !== ID_GOLD"},
			diamond:{visible:"data.enough === false && data.itemId !== ID_GOLD"},
			gold:{visible:false},
		};
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_TITLE", style:TEXT_STYLE_TITLE_1},//title:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_TITLE", shadow:SHADOW_DEFAULT},
			title2:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_TITLE2", style:TEXT_STYLE_TITLE_2},//title2:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_TITLE2", shadow:SHADOW_DEFAULT},
			closeButton:{onTouchEnded:this.onCloseUnlockFloor.bind(this)},
			unlockButton:{onTouchEnded:this.onUnlockFloor.bind(this), scale9:true},//web unlockButton:{onTouchEnded:this.onUnlockFloor.bind(this), scale9:true, enabled:hasEnoughItem},
			unlockText:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR", style:TEXT_STYLE_TEXT_BUTTON},//web unlockText:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR", style:TEXT_STYLE_TEXT_BUTTON, enabled:hasEnoughItem},//unlockText:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR", shadow:SHADOW_DEFAULT, enabled:hasEnoughItem},
			fx:{type:UITYPE_SPINE, id:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.9},
			items:{type:UITYPE_2D_LIST, items:requireItems, itemUI:UI_UNLOCK_FLOOR_ITEM, itemDef:itemDef, itemSize:cc.size(170, 190)},
			tomBubbleText:{type:UITYPE_TEXT, value:"TXT_UNLOCK_FLOOR_HINT", style: TEXT_STYLE_TEXT_DIALOG},
		};
		this.hasEnoughItemToUnlockFloor = hasEnoughItem;//web
if(cc.sys.isNative){
uiDef.unlockButton.enabled = hasEnoughItem;
uiDef.unlockText.enabled = hasEnoughItem;
}

		var backgroundFocusCallback = function () {
            var topFloorPosition = (topFloor ? FWUtils.getWorldPosition(topFloor) : null);
            if (isRefresh === true) {
                var widget = FWPool.getNode(UI_UNLOCK_FLOOR, false);
                FWUI.fillData(widget, requireItems, uiDef);
            } else {
                // ui
                var world = FWUtils.getCurrentScene();
                var widget = FWPool.getNode(UI_UNLOCK_FLOOR);
                widget.setLocalZOrder(Z_UI_UNLOCK_FLOOR);
                FWUtils.showDarkBg(null, Z_UI_UNLOCK_FLOOR - 2, "darkBgUnlock");
                FWUI.showWidgetWithData(widget, requireItems, uiDef, world, UIFX_POP, true);

                // show top floor over ui
                topFloor.removeFromParent();
                topFloor.setPosition(topFloorPosition);
                topFloor.setLocalZOrder(Z_UI_UNLOCK_FLOOR - 1);
                FWUI.showWidget(topFloor, world, UIFX_NONE, false);
				FWUI.setWidgetEnabled(topFloor, false);
				
				AudioManager.effect (EFFECT_POPUP_SHOW);
				
				if(!this.hideFuncUnlockFloor)
					this.hideFuncUnlockFloor = function() {this.onCloseUnlockFloor();}.bind(this);
				Game.gameScene.registerBackKey(this.hideFuncUnlockFloor);
            }
		}.bind(this);

        // auto focus locked floor to second base
        if (Game.gameScene.background.floorIndex !== floorIdx - 1) {
			FWObjectManager.updateVisibility_showAll(); // jira#5360
            Game.gameScene.background.snapFloor(floorIdx - 1, 0, true, backgroundFocusCallback);
        //if (Game.gameScene.background.floorIndex !== floorIdx) {
        //    Game.gameScene.background.snapFloor(floorIdx + 1, 1, true, backgroundFocusCallback);
        }
        else {
            backgroundFocusCallback();
		}
	},
	
	onUnlockFloor:function(sender)
	{
		if(!this.hasEnoughItemToUnlockFloor)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_CLOUDFLOOR_UNLOCK_NOT_ENOUGH_ITEM"), FWUtils.getWorldPosition(sender));
			return;
		}
		
		// subtract items
		var floorIdx = this.getLastUnlockedFloorIdx() + 1;
		var floorData = g_FLOOR[floorIdx];
		for(var itemId in floorData.REQUIRE_ITEM)
		{
			var require = floorData.REQUIRE_ITEM[itemId];
			var current, price;
			if(itemId === ID_GOLD)
				gv.userData.addGold(-require);
			else
				gv.userStorages.removeItem(itemId, require);
		}
		
		this.onCloseUnlockFloor();
		this.unlockNextFloor();

		AudioManager.effect (EFFECT_UPGRADE_SUCCESS);
	},
	
	onCloseUnlockFloor:function(sender)
	{
		FWUtils.hideDarkBg(null, "darkBgUnlock");
		FWUI.hide(UI_UNLOCK_FLOOR, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFuncUnlockFloor);
		
		// add top floor to scroll layer again
		var floorIdx = this.getLastUnlockedFloorIdx() + 1;
		var topFloor = FWPool.getNode(UI_CLOUDFLOOR_TOP, false);
		topFloor.removeFromParent();
		topFloor.setPosition(0, this.firstFloorMarker.getPositionY() + (floorIdx * CLOUDFLOOR_HEIGHT));
		topFloor.setLocalZOrder(floorIdx * 100);
		FWUI.showWidget(topFloor, this.firstFloorMarker, UIFX_NONE, false);
		FWUI.setWidgetEnabled(topFloor, true);
		
		// scroll to correct position when finished
		// Game.gameScene.background.rollBack(2);
	},
	
	onBuyUnlockItem:function(sender)
	{
		var uiData = sender.uiData;
		if(uiData.itemId === ID_GOLD)
		{
			this.onCloseUnlockFloor();
			Game.openShop(ID_GOLD);
		}
		// jira#4658
		//else if(Game.quickBuy(uiData.itemId, uiData.require - uiData.current, 0, uiData.price, FWUtils.getWorldPosition(sender)))
		//	this.showUnlockFloorMenu(null, true);
		//else
		//	this.onCloseUnlockFloor();
		else if(Game.quickBuy(uiData.itemId, uiData.require - uiData.current, 0, uiData.price, FWUtils.getWorldPosition(sender), this.onBuyUnlockItemCallback.bind(this)))
			FWUtils.disableAllTouches();
		else
			this.onCloseUnlockFloor();
	},
	
	onBuyUnlockItemCallback:function(error)
	{
		FWUtils.disableAllTouches(false);
		if(error === 0)
			this.showUnlockFloorMenu(null, true);
		else
			this.onCloseUnlockFloor();
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// buff /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	// returns an array of buffs, each element contains following info:
	// - combo id
	// - area
	// - unit
	// - value
	getBuffList:function(floorIdx, potBuff, decorBuff, skinBuff)//web getBuffList:function(floorIdx, potBuff = true, decorBuff = true, skinBuff = true)
	{
		if(potBuff === undefined)
			potBuff = true;
		if(decorBuff === undefined)
			decorBuff = true;
		if(skinBuff === undefined)
			skinBuff = true;
		
		// unneccessary check
		//if(floorIdx < 0)
		//	return [];
		
		var comboCounts = {};
		
		if(potBuff)
		{
			var excludeIds = [];
			for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
			{
				var slot = this.slots[floorIdx][i];
				if(slot && slot.slotData)
				{
					// pot buff
					var potId = slot.slotData[SLOT_POT];
					if(potId !== "" && excludeIds.indexOf(potId) < 0)
					{
						var comboId = g_POT[potId].COMBO_ID;
						if(comboId)
						{
							if(comboCounts[comboId])
								comboCounts[comboId]++;
							else
								comboCounts[comboId] = 1;
							excludeIds.push(potId);
						}
					}
				}
			}
		}

		if(decorBuff)
		{
			excludeIds = [];
			for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
			{
				var slot = this.slots[floorIdx][i];
				if(slot && slot.slotData)
				{
					// decor buff
					var decorId = slot.slotData[SLOT_DECOR];				
					if(decorId !== "" && excludeIds.indexOf(decorId) < 0)
					{
						var comboId = g_DECOR[decorId].COMBO_ID;
						if(comboId)
						{
							if(comboCounts[comboId])
								comboCounts[comboId]++;
							else
								comboCounts[comboId] = 1;
							excludeIds.push(decorId);
						}
					}
				}
			}
		}
		
		if(skinBuff && ENABLE_CLOUD_SKIN)
		{
			var skinId = CloudSkin.floorSkinData[floorIdx].skinId;
			if(skinId !== SKINID_DEFAULT)
			{
				var comboId = g_SKIN_ITEM[skinId].COMBO_ID;
				if(comboCounts[comboId])
					comboCounts[comboId]++;
				else
					comboCounts[comboId] = 1;
			}
		}
		
		var buffList = [];
		for(var key in comboCounts)
		{
			var comboInfo = g_COMBO[key];
			var comboCount = comboCounts[key];
			var step = comboCount - comboInfo.INIT;
			var idx = 0;
			while(step >= 0)
			{
				var srcBuffInfo = comboInfo.BUFF_INFO[idx];
				var buffInfo = {comboId:key, index:idx, type:srcBuffInfo.type, area:srcBuffInfo.area, unit:srcBuffInfo.unit, value:srcBuffInfo.value + srcBuffInfo.bonus * (comboCount - 1), comboCount:comboCount};
				buffList.push(buffInfo);
				
				if(comboInfo.STEP <= 0)
					break;
				step -= comboInfo.STEP;
				idx++;
			}
		}
		
		return buffList;
	},
	
	currentFloorNum: -1,
	showFloorNum:function(num, forceRefresh)//web showFloorNum:function(num, forceRefresh = false)
	{
		if(forceRefresh === undefined)
			forceRefresh = false;
		
		cc.log("CloudFloors::showFloorNum: num=" + num);
		
		// jira#5154
		//Game.gameScene.uiMainBtnScrollDown.setVisible(num >= 2);
		if (!Game.gameScene)
			return;
		Game.gameScene.showScrollDownButton(num >= 2);
		
		if(num < 0 || !this.isFloorUnlocked(num))
		{
			FWPool.returnNodes(UI_CLOUD_NUM);
			FWPool.returnNodes(SPINE_CLOUD_FLAG);
			return;
		}

		var floorWidget = this.firstFloorMarker.getChildByTag(num);
		if(!floorWidget)
			return;
		
		var floorNumMarker = floorWidget.getChildByName("floorNumMarker");//opt var floorNumMarker = floorWidget.getChildByName("center").getChildByName("floorNumMarker");
		if(floorNumMarker && floorNumMarker.getChildren().length > 0)
			return; // already shown
		
		// clean up
		if(num !== 0)
		{
			FWPool.returnNodes(UI_CLOUD_NUM);
			FWPool.returnNodes(SPINE_CLOUD_FLAG);
		}
			
		var widget = FWPool.getNode(UI_CLOUD_NUM);
		widget.stopAllActions();
		
		// jira#4766
		/*var floorWidget = this.firstFloorMarker.getChildByTag(num);
		var floorNumMarker = floorWidget.getChildByName("center").getChildByName("floorNumMarker");
		if(widget.getParent() === floorNumMarker && !forceRefresh)
			return;
		
		var buffList = this.getBuffList(num);
		var types = [];
		for(var i=0; i<buffList.length; i++)
		{
			if(types.indexOf(buffList[i].type) < 0)
				types.push(buffList[i].type);
		}
		
		var uiDef =
		{
			cloudNum:{type:UITYPE_TEXT, value:num + 1, shadow:SHADOW_CLOUD_TEXT},
			bg3:{visible:types.length === 3},
			bg2:{visible:types.length === 2},
			bg1:{visible:types.length === 1},
			icon1:{type:UITYPE_IMAGE, visible:types.length >= 1, value:Game.getBuffIconByType(types[0]), scale:0.5},
			icon2:{type:UITYPE_IMAGE, visible:types.length >= 2, value:Game.getBuffIconByType(types[1]), scale:0.5},
			icon3:{type:UITYPE_IMAGE, visible:types.length >= 3, value:Game.getBuffIconByType(types[2]), scale:0.5},
			clip:{onTouchBegan:function() {CloudFloors.showFloorPotBuff(true, num);}, onTouchEnded:function() {CloudFloors.showFloorPotBuff(false);}},
		};
		
		FWUI.showWidgetWithData(widget, null, uiDef, floorNumMarker, {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(200, 0), toPos:cc.p(0, 0), time:0.5});*/
		
		var uiDef =
		{
			cloudNum:{type:UITYPE_TEXT, value:num + 1, shadow:SHADOW_CLOUD_TEXT},
			bg3:{visible:false},
			bg2:{visible:false},
			bg1:{visible:false},
			icon1:{visible:false},
			icon2:{visible:false},
			icon3:{visible:false},
			clip:{visible:false},
		};
		if(!Game.isFriendGarden())
			uiDef.cloud = {onTouchBegan:function() {CloudFloors.showFloorBuff(true, num);}, onTouchEnded:function() {CloudFloors.showFloorBuff(false);}, forceTouchEnd:true};
		else
			uiDef.cloud = {};
		
		FWUI.showWidgetWithData(widget, null, uiDef, floorNumMarker, {fx:UIFX_SLIDE_SMOOTH, fromPos:cc.p(200, 0), toPos:cc.p(0, 0), time:0.5});
		
		if(ENABLE_CLOUD_SKIN && !Game.isFriendGarden() && gv.userData.getLevel() >= g_MISCINFO.CLOUD_SKIN_USER_LEVEL)
		{
			var skinSelect = floorWidget.getChildByName("skinSelect");
			if(skinSelect && skinSelect.getChildren().length <= 0)
			{
				var spine = FWUtils.showSpine(SPINE_CLOUD_FLAG, null, "cloud_button_int", false, skinSelect, cc.p(40, 60), 0, false);
				spine.addAnimation(0, "cloud_button_normal", true, 1.5);
			}
		}
	},
	
	potBuffWidget: null,

	decorBuffWidget: null,
	skinBuffWidget: null,
	widgetPot: null,
	showFloorBuff:function(show, floorIdx)
	{
		// fix: can scroll while showing buff
		gv.background.disableScrolling = show;
		
		if(this.potBuffWidget)
		{
			FWUI.hideWidget(this.potBuffWidget, UIFX_POP);
			this.potBuffWidget = null;
		}
		//if(this.potBuffWidget2)
		//{
		//	FWUI.hideWidget(this.potBuffWidget2, UIFX_POP);
		//	this.potBuffWidget2 = null;
		//}
		//if(this.potBuffWidget3)
		//{
		//	FWUI.hideWidget(this.potBuffWidget3, UIFX_POP);
		//	this.potBuffWidget3 = null;
		//}
		if(this.decorBuffWidget)
		{
			FWUI.hideWidget(this.decorBuffWidget, UIFX_POP);
			this.decorBuffWidget = null;
		}
		if(this.skinBuffWidget)
		{
			FWUI.hideWidget(this.skinBuffWidget, UIFX_POP);
			this.skinBuffWidget = null;
		}
		if(this.widgetPot)
		{
			for(var i=0;i<this.widgetPot.length;i++)
			{
				FWUI.hideWidget(this.widgetPot[i], UIFX_POP);
			}
			this.widgetPot = [];
		}
		if(!show)
			return;
			
		var decorBuff = this.getBuffList(floorIdx, false, true, false);
		var potBuff = this.getBuffList(floorIdx, true, false, false);
		var skinBuff = this.getBuffList(floorIdx, false, false, true);

		var sizeSceenBuff = cc.size(480,230);

		var numScreen = 0;



		//var numPotBuff = this.countPotBuff(potBuff);

		var detailPotBuff = this.calculatorBuff(potBuff);
		numScreen += Object.keys(detailPotBuff).length;

		var sizeScreens = [];



		for(var key in detailPotBuff)
		{
			var size = this.calculatorSizeScreen(detailPotBuff[key],BUFF_POT);
			sizeScreens.push(size);
		}

		if(decorBuff.length >0){
			numScreen ++;
			sizeScreens.push(this.calculatorSizeScreen(decorBuff,BUFF_DECOR));
		}
		if(skinBuff.length >0) {
			numScreen ++;
			sizeScreens.push(this.calculatorSizeScreen(skinBuff,BUFF_SKIN));
		}


		//var numScreen = sizeScreens.length;

		var sizeScreensLeft = [];
		var sizeScreensRight = [];
		for(var i =0 ;i < sizeScreens.length;i++)
		{
			if(i<Math.floor(sizeScreens.length/2))
			{
				sizeScreensLeft.push(sizeScreens[i]);
			}
			else
			{
				sizeScreensRight.push(sizeScreens[i]);
			}
		}

		var totalSizeHeightLeft  = 0;

		for(var i = 0 ; i< sizeScreensLeft.length;i++)
		{
			totalSizeHeightLeft += sizeScreensLeft[i].height;
		}

		var totalSizeHeightRight  = 0;

		for(var i = 0 ; i< sizeScreensRight.length;i++)
		{
			totalSizeHeightRight += sizeScreensRight[i].height;
		}


		var posBuff = [];
		if(sizeScreensLeft.length>0)
		{
			var posBeginLeft = cc.p(240,0);
			posBeginLeft.y = cc.winSize.height/2.5 +(totalSizeHeightLeft - sizeScreensLeft[0].height)/2;
			posBuff.push(posBeginLeft);

			for(var i = 0 ; i< sizeScreensLeft.length;i++)
			{
				if(i !==0 )
				{
					var pos = cc.p(240,0);
					pos.y = (posBeginLeft.y - sizeScreensLeft[i-1].height);
					posBuff.push(pos);
				}

			}
		}

		if(sizeScreensRight.length>0)
		{
			var posBeginRight = cc.p(720,0);
			posBeginRight.y = cc.winSize.height/2.5 +(totalSizeHeightRight - sizeScreensRight[0].height)/2;
			posBuff.push(posBeginRight);

			for(var i = 0 ; i< sizeScreensRight.length;i++)
			{
				if(i ==1 )
				{
					var pos = cc.p(720,0);
					pos.y = (posBeginRight.y - sizeScreensRight[0].height);
					posBuff.push(pos);
				}
				else if(i ==2)
				{
					var pos = cc.p(720,0);
					pos.y = (posBeginRight.y - sizeScreensRight[0].height- sizeScreensRight[1].height);
					posBuff.push(pos);
				}

			}
		}



		if(numScreen == 1)
		{
			posBuff[0]= cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
		}
		

		this.widgetPot = [];
		var index = 0
		for(var key in detailPotBuff)
		{
			index++;
			this.widgetPot.push(this.potBuffWidget);
		}


		// show
		var idx = 0;
		for(var key in detailPotBuff)
		{
			this.widgetPot[idx]=this.showFloorBuff2(detailPotBuff[key], posBuff[idx].x, posBuff[idx].y,sizeScreens[idx]);
			idx++;
		}

		if(decorBuff.length > 0)
		{
			this.decorBuffWidget = this.showFloorBuff2(decorBuff, posBuff[idx].x, posBuff[idx].y,sizeScreens[idx]);
			idx++;
		}
		if(skinBuff.length > 0)
		{
			this.skinBuffWidget = this.showFloorBuff2(skinBuff, posBuff[idx].x, posBuff[idx].y,sizeScreens[idx], floorIdx);
			idx++;
		}
	},
	calculatorSizeScreen:function(detailData,type)
	{
		var numBuff;
		//= detailData.length;
		if(type === BUFF_POT)
		{
			numBuff = detailData.length;
		}
		else if(type === BUFF_SKIN)
		{
			numBuff = detailData.length +1;
		}
		else if(type === BUFF_DECOR)
		{
			numBuff =  detailData.length;
		}
		return cc.size(480,230-45*(3-numBuff));
	},
	calculatorBuff:function(buffList)
	{
		var numBuff = 0;
		var comboIds = [];
		var arrBuff = {};
		for(var i=0;i<buffList.length;i++)
		{

			if(comboIds.findIndex(function(j) {return (j.nameBuff === buffList[i].comboId);}) < 0)
			{
				var item = {};
				item.nameBuff = buffList[i].comboId;
				item.countBuff= 1;
				arrBuff[buffList[i].comboId] = [];
				arrBuff[buffList[i].comboId].push(buffList[i]);
				comboIds.push(item);
			}
			else
			{
				comboIds[comboIds.findIndex(function(j) {return (j.nameBuff === buffList[i].comboId);})].countBuff++;
				arrBuff[buffList[i].comboId].push(buffList[i]);
			}
		}
		return arrBuff;
	},

	showFloorBuff2:function(buffList, posX, posY, sizeScreen, skinFloorIdx)
	{
		var widget = FWPool.getNode(UI_CLOUD_BUFF_NEW);
		cc.log("CLoudFloors : get UI_CLOUD_BUFF");


		var data = buffList;
		var boardHint = FWUtils.getChildByName(widget, "boardHint");

		boardHint.setContentSize(sizeScreen);

		var combo = g_COMBO[buffList[0].comboId];
		var uiDef =
		{
			lblNameProduct: {type: UITYPE_TEXT, value: Game.getItemName(combo.ID), format: "TXT_POT_BUFF_TITLE",style: TEXT_STYLE_TEXT_NORMAL},
			timerHint: {visible :false},
		};
		for (var j = 0; j < 3; j++) {
			var buffInfo = (j >= combo.BUFF_INFO.length ? null : combo.BUFF_INFO[j]);
			if (buffInfo) {
				var opacity = 128;
				for (var k = 0; k < buffList.length; k++) {
					if (buffList[k].comboId === combo.ID && buffList[k].index === j) {
						// override
						buffInfo = buffList[k];
						opacity = 255;
						break;
					}
				}
				uiDef["icon" + (j + 1)] = {type: UITYPE_IMAGE,scale: 0.5,value: Game.getBuffIconByType(buffInfo.type),opacity: opacity,visible: (opacity >= 255)};
				uiDef["text" + (j + 1)] = {opacity: opacity, visible: (opacity >= 255)};// feedback uiDef["text" + (j + 1)] = {opacity:opacity, visible:true};
				uiDef["value" + (j + 1)] = {type:UITYPE_TEXT, style:TEXT_STYLE_HINT_NOTE, value:(buffInfo.type === BUFF_HARVEST_TIME || buffInfo.type === BUFF_PRODUCTION_TIME ? "-" : "+") + buffInfo.value + (buffInfo.unit === PERC ? "%  " : "  "), visible:true};
				uiDef["desc" + (j + 1)] = {type:UITYPE_TEXT, style:TEXT_STYLE_HINT_NOTE, value:"TXT_BUFF_" + buffInfo.type + (buffInfo.type < 3 || buffInfo.type === 5 ? "_" + buffInfo.area : ""), visible:true};
				uiDef["iconBg" + (j + 1)] = {visible: (opacity >= 255)};
			}
			else {
				uiDef["icon" + (j + 1)] = {visible: false};
				uiDef["text" + (j + 1)] = {visible: false};
				uiDef["value" + (j + 1)] = {visible: false};
				uiDef["desc" + (j + 1)] = {visible: false};
				uiDef["iconBg" + (j + 1)] = {visible: false};
			}
		}

		// jira#5934
		if (skinFloorIdx !== undefined) {
			var timeLeft = CloudSkin.floorSkinData[skinFloorIdx].endTime - Game.getGameTimeInSeconds();
			uiDef.timerHint = {visible:true,type:UITYPE_TIME_BAR, startTime:Game.getGameTimeInSeconds(), endTime:CloudSkin.floorSkinData[skinFloorIdx].endTime, countdown:true};
			
		}

		FWUI.fillData(widget, null, uiDef);

		
		// adapt size
		//var background = FWUtils.getChildByName(widget, "background");
		//var boderFrameCover = FWUtils.getChildByName(widget, "boderFrameCover");
		//var content = FWUtils.getChildByName(widget, "content");
		//var contentH = 200 * comboIds.length;
		//background.setContentSize(background.getContentSize().width, contentH);
		//boderFrameCover.setContentSize(background.getContentSize().width, contentH);
		//content.setContentSize(content.getContentSize().width, 190 * comboIds.length);
		
		FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setPosition(cc.p(posX, posY));
		return widget;
	},
	
	// jira#5301
	showPotSetFx:function(floorIdx)
	{
		if(!this.isFloorUnlocked(floorIdx))
			return;
		
		var widget = this.firstFloorMarker.getChildByTag(floorIdx);
		if(!widget)
			return;

		// jira#5649: use pot set fx for unlockable floor
		var hasFx = false;
		var posY = 80;
		// jira#5687: no longer use pot set fx for unlockable floor
		// if(floorIdx === this.getLastUnlockedFloorIdx() + 1)
		// {
			// if(!Game.isFriendGarden())
			// {
				// var floorData = g_FLOOR[floorIdx];
				// if(gv.userData.getLevel() >= floorData.USER_LEVEL)
				// {
					// hasFx = true;
					// posY = 40;
				// }
			// }
		// }
		// else
		{
			var buff = this.getBuffList(floorIdx, true, false, false);
			hasFx = (buff.length > 0 && buff[0].comboCount === MAX_SLOTS_PER_FLOOR);
		}
		var fx = widget.getChildByName("effect_pot_set");
		
		if(hasFx)
		{
			if(!fx)
			{
				//fx = new cc.ParticleSystem("effects/effect_pot_set.plist");
				fx = FWPool.getNode(SPINE_EFFECT_POT_SET);
				fx.setName("effect_pot_set");
				fx.setPosition(cc.p(680, posY));
				fx.setLocalZOrder(9999);
				fx.setAnimation(0, "animation", true);
				widget.addChild(fx);
			}
			fx.setVisible(true);
		}
		else if(fx)
			fx.setVisible(false);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	updateFloorDataFromServer:function(object)
	{
		if(!object)
			return;
		
		// update stock
		var remainItemCount = object[KEY_REMAIN_ITEM];
		if(remainItemCount !== undefined)
		{
			if(object[KEY_POT])
				gv.userStorages.updateItem(object[KEY_POT], remainItemCount);
			if(object[KEY_PLANT])
				gv.userStorages.updateItem(object[KEY_POT], remainItemCount);
		}
		
		// update floors
		var floors = object[KEY_FLOOR];
		var slotsIdx = object[KEY_SLOT_ID];
		var slotsData = object[KEY_SLOT_OBJECT];
		if(floors !== undefined && slotsIdx !== undefined && slotsData !== undefined)
		{
			if(_.isArray(floors))
			{
				for(var i=0; i<floors.length; i++)
					this.setSlotData(floors[i], slotsIdx[i], slotsData[i]);
			}
			else
				this.setSlotData(floors, slotsIdx, slotsData);
		}
	},	
	
	RequestFloorUpgrade:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FLOOR_UPGRADE);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseFloorUpgrade:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
			{
				// revert
				// crash: this is not reachable at this context
				cc.log("ResponseFloorUpgrade: error=" + this.getError());
				gv.userData.game[GAME_FLOORS].pop();
				// this.show();
			}
			else
			{
				var newFloorId = object[KEY_FLOOR];
				
				// achievement
				Achievement.onAction(g_ACTIONS.ACTION_FLOOR_UNLOCK.VALUE, newFloorId, 1);
			}
		}
	}),
	
	RequestCloudSkinApply:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.CLOUD_SKIN_APPLY);},
		pack:function(floorId, itemId, itemNum)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_FLOOR, floorId);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			PacketHelper.putInt(this, KEY_ITEM_NUM, itemNum);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseCloudSkinApply:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			cc.log("ResponseCloudSkinApply", JSON.stringify (object));

			if(this.getError() !== 0)
			{
				cc.log("ResponseCloudSkinApply", "do something");
			}
		}
	}),
	
	RequestPotPut:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POT_PUT);},
		pack:function(potId, floorIndices, slotIndices)
		{
			addPacketHeader(this);
			
			PacketHelper.putString(this, KEY_POT, potId);
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			
			
			addPacketFooter(this);
		},
	}),
	
	RequestPlant:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PLANT);},
		pack:function(plantId, floorIndices, slotIndices, times)
		{
			addPacketHeader(this);
			
			PacketHelper.putString(this, KEY_PLANT, plantId);
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			PacketHelper.putIntArray(this, KEY_TIME, times);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePlant:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("CloudFloors.ResponsePlant: error=" + this.getError());
			else
			{
				// achievement
				for(var key in CloudFloors.plantedPlantsAndCounts)
				{
					if(CloudFloors.plantedPlantsAndCounts[key] > 0)
					{
						Achievement.onAction(g_ACTIONS.ACTION_PLANT.VALUE, key, CloudFloors.plantedPlantsAndCounts[key]);
						CloudFloors.plantedPlantsAndCounts[key] = 0;
					}
				}
			}
		},
	}),
	
	RequestPlantHarvest:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PLANT_HARVEST);},
		pack:function(floorIndices, slotIndices)
		{
			addPacketHeader(this);
			
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePlantHarvest:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("CloudFloors.ResponsePlantHarvest: error=" + this.getError());
			else
			{
				// achievement
				for(var key in CloudFloors.harvestedItemsAndCounts)
				{
					if(CloudFloors.harvestedItemsAndCounts[key] > 0)
					{
						Achievement.onAction(g_ACTIONS.ACTION_PLANT_HARVEST.VALUE, key, CloudFloors.harvestedItemsAndCounts[key]);
						CloudFloors.harvestedItemsAndCounts[key] = 0;
					}
				}
			}
		},
	}),
	
	RequestPotStore:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POT_STORE);},
		pack:function(floorIndices, slotIndices)
		{
			addPacketHeader(this);
			
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			
			
			addPacketFooter(this);
		},
	}),
	
	RequestPotMove:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POT_MOVE);},
		pack:function(fromFloor, fromSlot, toFloor, toSlot)
		{
			addPacketHeader(this);
			
			PacketHelper.putByte(this, KEY_FROM_FLOOR, fromFloor);
			PacketHelper.putByte(this, KEY_FROM_SLOT_ID, fromSlot);
			PacketHelper.putByte(this, KEY_FLOOR, toFloor);
			PacketHelper.putByte(this, KEY_SLOT_ID, toSlot);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePotMove:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			if(object)
			{
				if(object[KEY_FROM_FLOOR] !== undefined && object[KEY_FROM_SLOT_ID] !== undefined && object[KEY_FROM_SLOT_OBJECT])
					CloudFloors.setSlotData(object[KEY_FROM_FLOOR], object[KEY_FROM_SLOT_ID], object[KEY_FROM_SLOT_OBJECT]);
				if(object[KEY_FLOOR] !== undefined && object[KEY_SLOT_ID] !== undefined && object[KEY_SLOT_OBJECT])
					CloudFloors.setSlotData(object[KEY_FLOOR], object[KEY_SLOT_ID], object[KEY_SLOT_OBJECT]);
			}
			
			if(this.getError() !== 0)
				cc.log("ResponsePotMove: error=" + this.getError());
		}
	}),					
	
	RequestPlantCatchBug:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PLANT_CATCH_BUG);},
		pack:function(floorIndices, slotIndices, times)
		{
			addPacketHeader(this);
			
			CloudFloors.caughtBugsCount = floorIndices.length;
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			PacketHelper.putIntArray(this, KEY_TIME, times);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePlantCatchBug:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);

			if(this.getError() !== 0)
				cc.log("CloudFloors.ResponsePlantCatchBug: error=" + this.getError());
			else
			{
				// event
				var allBonusItems = object[KEY_BONUS_ITEMS];
				for(var i=0; i<allBonusItems.length; i++)
				{
					var bonusItems = FWUtils.getItemsArray(allBonusItems[i]);
					FWUtils.showFlyingItemIcons(bonusItems, CloudFloors.slots[object[KEY_FLOOR][i]][object[KEY_SLOT_ID][i]].getWorldPosition());
				}
				
				// achievement
				for (var pestId in CloudFloors.catchPestAndCounts)
				{
					if (CloudFloors.catchPestAndCounts [pestId] < 1)
						continue;
					
					Achievement.onAction(g_ACTIONS.ACTION_PLANT_CATCH_BUG.VALUE, pestId, CloudFloors.catchPestAndCounts [pestId]);
					CloudFloors.catchPestAndCounts [pestId] = 0;
				}
			}
		},
	}),
	
	RequestPlantSkipTime:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.PLANT_SKIP_TIME);},
		pack:function(floorIdx, slotIdx, price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putByte(this, KEY_FLOOR, floorIdx);
			PacketHelper.putByte(this, KEY_SLOT_ID, slotIdx);
			PacketHelper.putClientCoin(this);

			
			addPacketFooter(this);
		},
	}),
	
	CommonResponseHandler:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);

			if(this.getError() !== 0)
			{
				cc.log("CloudFloors.CommonResponseHandler: error=" + this.getError());
				return;
			}

			if (this.cmd === gv.CMD.POT_PUT)
			{
				var potId = object [KEY_POT];
				var floors = object [KEY_FLOOR];
				var slots = object [KEY_SLOT_ID];
				Achievement.onAction(g_ACTIONS.ACTION_POT_PUT.VALUE, potId, slots.length);
			}
		},
	}),
	
	RequestDecorPut:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.DECOR_PUT);},
		pack:function(decorId, floorIndices, slotIndices)
		{
			addPacketHeader(this);
			
			PacketHelper.putString(this, KEY_DECOR, decorId);
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			
			
			addPacketFooter(this);
		},
	}),
	
	RequestDecorStore:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.DECOR_STORE);},
		pack:function(floorIndices, slotIndices)
		{
			addPacketHeader(this);
			
			PacketHelper.putByteArray(this, KEY_FLOOR, floorIndices);
			PacketHelper.putByteArray(this, KEY_SLOT_ID, slotIndices);
			
			
			addPacketFooter(this);
		},
	}),
};

network.packetMap[gv.CMD.FLOOR_UPGRADE] = CloudFloors.ResponseFloorUpgrade;
network.packetMap[gv.CMD.POT_PUT] = CloudFloors.CommonResponseHandler;
network.packetMap[gv.CMD.PLANT] = CloudFloors.ResponsePlant;
network.packetMap[gv.CMD.PLANT_HARVEST] = CloudFloors.ResponsePlantHarvest;
network.packetMap[gv.CMD.POT_STORE] = CloudFloors.CommonResponseHandler;
network.packetMap[gv.CMD.POT_MOVE] = CloudFloors.ResponsePotMove;
network.packetMap[gv.CMD.PLANT_CATCH_BUG] = CloudFloors.ResponsePlantCatchBug;
network.packetMap[gv.CMD.PLANT_SKIP_TIME] = CloudFloors.CommonResponseHandler;
network.packetMap[gv.CMD.DECOR_PUT] = CloudFloors.CommonResponseHandler;
network.packetMap[gv.CMD.DECOR_STORE] = CloudFloors.CommonResponseHandler;
network.packetMap[gv.CMD.CLOUD_SKIN_APPLY] = CloudFloors.ResponseCloudSkinApply;
