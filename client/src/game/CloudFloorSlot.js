
const DRAG_TAG_SLOT = "slot";
const DRAG_TAG_POT = "pot";
const DRAG_TAG_PLANT = "plant";
const DRAG_TAG_BUG = "bug";
const DRAG_TAG_PRODUCTION_SLOT = "product_slot";
const DRAG_TAG_DECOR = "decor";

const PLANT_STATE_UNKNOWN = -1;
const PLANT_STATE_SEED = 0;
const PLANT_STATE_TEENAGE = 1;
const PLANT_STATE_MATURE = 2;
const PLANT_HARVEST_SCALE = 0.82;

const DECOR_POS = cc.p(0, -80);
const DECOR_POT_UP = cc.p(0, 50);

const Z_EMPTY_SLOT = 0;
const Z_POT = 10;
const Z_PLANT = 20;
const Z_BUG = 30;
//rmdust const Z_DUST = 40;
const Z_DECOR = 350;
const Z_UPGRADE_ICON = 10;

var catchBugSlot = null; // jira#4670
var isShowingWarningText = false; // feedback: should not show duplicated warning texts

var CloudFloorSlot = cc.Class.extend
({
	emptySlot: null,
	pot: null,
	plant: null,
	bug: null,
	//rmdust dust: null,
	plantState: PLANT_STATE_UNKNOWN,
	position: null,
	parentNode: null,
	floorIdx: -1,
	slotIdx: -1,
	upgradeIcon: null, // jira#4685
	
	plantTeenageTime: -1,
	plantMatureTime: -1,
	
	ctor:function()
	{
		this.emptySlot = new FWObject(this);
		this.pot = new FWObject(this);
		this.plant = new FWObject(this);
		this.bug = new FWObject(this);
		//rmdust this.dust = new FWObject(this);
		
		this.emptyDecorSlot = new FWObject(this);
		this.decor = new FWObject(this);
		
		this.emptySlot.name = "emptySlot";
		this.pot.name = "pot";
		this.plant.name = "plant";
		this.bug.name = "bug";
		this.emptyDecorSlot.name = "emptyDecorSlot";
		this.decor.name = "decor";
	},
	
	init:function(parentNode, floorIdx, slotIdx)
	{
		this.parentNode = parentNode;
		this.position = cc.p(0, 0);
		this.floorIdx = floorIdx;
		this.slotIdx = slotIdx;
		
		this.emptySlot.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.emptySlot.setAnimation("effect_pot_slot", true);
		this.emptySlot.setParent(parentNode, Z_EMPTY_SLOT);
		this.emptySlot.setPosition(this.position);
		this.emptySlot.setScale(1);//this.emptySlot.setScale(0.13);
		this.emptySlot.customBoundingBoxes = cc.rect(-30, -10, 60, 60);
		this.emptySlot.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this));
		this.emptySlot.setDroppable(DRAG_TAG_SLOT);
		this.emptySlot.setNotifyBlockedTouch(true);

		this.initDecor();
		
		this.upgradeIcon = new cc.Sprite("#hud/icon_upgrade_alert.png");
		this.upgradeIcon.setLocalZOrder(Z_UPGRADE_ICON);
		this.upgradeIcon.retain();
		
		this.setUpdate(true);
	},
	
	uninit:function()
	{
		if(this.upgradeIcon)
		{
			this.upgradeIcon.removeFromParent();
			this.upgradeIcon.release();
		}
		
		this.emptySlot.uninit();
		this.pot.uninit();
		this.plant.uninit();
		this.bug.uninit();
		this.decor.uninit();
		this.emptyDecorSlot.uninit();
		//rmdust this.dust.uninit();
		this.plantState = PLANT_STATE_UNKNOWN;
		delete this.slotData;
		
		this.setUpdate(false);
		FWPool.returnNode(this);
	},
	
	refresh:function(data)
	{
		this.slotData = data;
		this.pot.setDraggable(false);
		
		if(this.slotData[SLOT_POT] === "")
		{
			// empty slot
			this.emptySlot.setVisible(true);
			this.pot.setVisible(false);
			this.plant.setVisible(false);
			this.bug.setVisible(false);
			//rmdust this.dust.setVisible(false);
		}
		else
		{
			// not empty
			this.emptySlot.setVisible(false);

			// pot
			this.pot.setVisible(true);
			this.pot.initWithSpine(Game.getPotSpineByDefine(this.slotData[SLOT_POT]));
			this.pot.setSkin(Game.getPotSkinByDefine(this.slotData[SLOT_POT]));
			this.pot.setAnimation(this.slotData[SLOT_PLANT] === "" ? "pot_normal" : "pot_plant");
			this.pot.setParent(this.parentNode, Z_POT);
			this.pot.setPosition(this.position);
			this.pot.setScale(1);
			this.pot.customBoundingBoxes = cc.rect(-40, -10, 80, 70); // opt
			this.pot.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this), null, this.onLongTouch.bind(this));
			this.pot.setNotifyBlockedTouch(true);
			this.pot.setDroppable(DRAG_TAG_POT);
			
			// plant
			this.refreshPlant();
			
			/*rmdust // dust
			var dustAnim = Game.getDustAnimationByLevel(9999);
			if(dustAnim === null)
				this.dust.setVisible(false);
			else
			{
				this.dust.setVisible(true);
				this.dust.initWithSpine(SPINE_MACHINE_EGG);
				this.dust.setAnimation(dustAnim, true);
				this.dust.setParent(this.pot.node, Z_POT + 1);
				this.dust.setPosition(0, 0);
				this.dust.setScale(0.5);
			}*/
		}
		
		this.refreshUpgradeIcon();
		this.refreshDecor();
		this.showTouchFx();
	},
	
	refreshUpgradeIcon:function()
	{
		var showUpgradePot = false;
		this.upgradeIcon.removeFromParent();
		
		if(this.slotData[SLOT_POT] && !this.slotData[SLOT_PLANT] && !Game.isFriendGarden())
		{
			if(CloudFloors.potUpgradeIcons[this.slotData[SLOT_POT]] === undefined)
			{
				var potDef = g_POT[this.slotData[SLOT_POT]];
				if(potDef.UPGRADE_NEXT_ID.length > 0)
				{
					var requireItems = FWUtils.getItemsArray(potDef.REQUIRE_ITEM);
					var missingItems = Game.getMissingItemsAndPrices(requireItems);
					showUpgradePot = CloudFloors.potUpgradeIcons[this.slotData[SLOT_POT]] = (missingItems.missingItems.length <= 0);
				}
			}
			else
				showUpgradePot = CloudFloors.potUpgradeIcons[this.slotData[SLOT_POT]];
		}

		if(showUpgradePot)
		{
			if(!this.upgradeIcon.getParent())
			{
				var pos = cc.p(0, 5);
				this.pot.node.addChild(this.upgradeIcon);
				this.upgradeIcon.setPosition(pos);
				this.upgradeIcon.stopAllActions();
				this.upgradeIcon.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 0.9, 1.1), cc.scaleTo(0.4, 1, 1))));
				this.upgradeIcon.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.4, pos.x, pos.y + 5), cc.moveTo(0.4, pos.x, pos.y))));
			}
		}
		else if(this.upgradeIcon.getParent())
			this.upgradeIcon.removeFromParent();
	},
	
	refreshPlant:function()
	{
		if(this.slotData[SLOT_PLANT] === "")
		{
			// no plant
			this.plant.setVisible(false);	
			this.bug.setVisible(false);	
		}
		else
		{
			// has plant
			var plantDefine = g_PLANT[this.slotData[SLOT_PLANT]];
			var potDefine = g_POT[this.slotData[SLOT_POT]];
			var parentNode = this.pot.node;
			this.plant.setVisible(true);
			
			// precalc timers
			var minTime = 10;
			var plantTime = this.slotData[SLOT_TIME_START];
			this.plantMatureTime = (this.slotData[SLOT_TIME_FINISH] > 0 ? this.slotData[SLOT_TIME_FINISH] : plantTime + plantDefine.GROW_TIME - potDefine.TIME_DECREASE_DEFAULT);
			if(this.plantMatureTime < plantTime + minTime)
				this.slotData[SLOT_TIME_FINISH] = this.plantMatureTime = plantTime + minTime;
			this.plantTeenageTime = plantTime + plantDefine.SEED_TIME;
			// jira#5066
			//if(this.plantTeenageTime > this.plantMatureTime - minTime)
			//	this.plantTeenageTime = this.plantMatureTime - minTime;
			// jira#5433
			if(this.slotData[SLOT_PEST] && gv.userData.getLevel() < 3)
				this.plantMatureTime = Number.MAX_SAFE_INTEGER;
				
			this.plantState = this.getPlantState();
			if(this.plantState === PLANT_STATE_SEED)
			{
				this.plant.initWithSpine(SPINE_SEED);
				this.plant.setAnimation("plant_normal", true);
				this.plant.setScale(0.4);
			}
			else
			{
				this.plant.initWithSpine(Game.getPlantSpineByDefine(plantDefine));
				this.plant.setAnimation(this.plantState === PLANT_STATE_TEENAGE ? "plant_teenage" : "plant_mature", true);
				this.plant.setScale(Game.getPlantScaleByDefine(plantDefine));
				this.plant.spine.setMix("plant_mature", "plant_mature_touch", 0.25);
				this.plant.spine.setMix("plant_teenage", "plant_teenage_touch", 0.25);
				this.plant.spine.setTimeScale(1 + this.slotIdx * 0.05);
				this.plant.spine.update(0.1); // jira#5185
			}
			this.plant.customBoundingBoxes = cc.rect(-40, -5, 80, 90); // opt
			this.plant.setParent(parentNode, Z_PLANT);
			this.plant.setPosition(Game.getPotToPlantOffset(this.slotData[SLOT_POT]));
			this.plant.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this), null, this.onLongTouch.bind(this));
			this.plant.setDroppable(DRAG_TAG_PLANT);
			this.plant.setNotifyBlockedTouch(true);
			
			if(this.hasBug() === true)
			{
				// fix: bug scaling
				var bugId = this.slotData[SLOT_PEST];
				var scale = 0.15;
				if(bugId === "B6")
					scale = 0.3;				

				// has bug
				this.bug.setVisible(true);	
				this.bug.initWithSpine(Game.getBugSpineByDefine(bugId), parentNode);
				this.bug.setAnimation("bug_normal", true);
				this.bug.setParent(parentNode, Z_BUG);
				this.bug.setScale(scale);
			}
			else
			{
				// no bug
				this.bug.setVisible(false);
			}

			// jira#4670
			if(this.plantState === PLANT_STATE_MATURE && catchBugSlot === this)
			{
				this.onCloseMenu();
				FWUI.hideDraggedWidget(FWUI.draggedWidget);
				cc.director.getScheduler().scheduleCallbackForTarget(this, this.showHarvestMenu, 0, 0, 0.25, false);
			}
			
			if(this.slotData[SLOT_PEST] !== "")
			{
				if(this.plantState === PLANT_STATE_TEENAGE)
					Tutorial.onGameEvent(EVT_BUG_APPEAR, this.floorIdx, this.slotIdx);
				else if(this.plantState === PLANT_STATE_MATURE)
					Tutorial.onGameEvent(EVT_BUG_DISAPPEAR, this.floorIdx, this.slotIdx);
			}
		}
	},
	
	getPlantState:function()
	{
		var gameTime = Game.getGameTimeInSeconds();
		if(gameTime >= this.plantMatureTime)
			return PLANT_STATE_MATURE;
		else if(gameTime >= this.plantTeenageTime)
			return PLANT_STATE_TEENAGE;
		return PLANT_STATE_SEED;
	},
	
	hasBug:function()
	{
		return (this.slotData[SLOT_PEST] !== "" && (this.plantState === PLANT_STATE_TEENAGE || Game.isFriendGarden()));
	},
	
	getWorldPosition:function()
	{
		return this.emptySlot.getWorldPosition();
	},

	// opt
	setUpdate:function(isUpdate)
	{
		if(isUpdate)
		{
			//cc.director.getScheduler().scheduleUpdateForTarget(this, UPDATE_PRIORITY_CLOUD_FLOOR_SLOT, false);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.1, cc.REPEAT_FOREVER, 0, false);
		}
		else
		{
			//cc.director.getScheduler().unscheduleUpdateForTarget(this);
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		}
	},

	update:function(dt)
	{
		// moved to FWObject
		// opt
		//if(this.floorIdx > gv.background.floorIndex + 1 || this.floorIdx < gv.background.floorIndex)
		//	return;
		
		// debug bounding boxes
		/*if(DEBUG_BOUNDING_BOXES_ZORDER > 0)
		{
			if(this.emptySlot.isVisible() === true)
				this.emptySlot.drawBoundingBoxes();
			if(this.pot.isVisible() === true)
				this.pot.drawBoundingBoxes();
			if(this.plant.isVisible() === true)
				this.plant.drawBoundingBoxes();
			 if(this.decor.isVisible() === true)
				 this.decor.drawBoundingBoxes();
			 if(this.emptyDecorSlot.isVisible() === true)
				 this.emptyDecorSlot.drawBoundingBoxes();
		}*/
		
		if(this.slotData[SLOT_PLANT])
		{
			// plant state
			if(this.plantState !== this.getPlantState())
				this.refreshPlant();
			
			if(this.bug.isVisible())
			{
				// bug position on plant
				// fix: null marker
				// fix: incorrect marker pos
				var plantId = this.slotData[SLOT_PLANT];
				var bugId = this.slotData[SLOT_PEST];
				var bugOffX = 0, bugOffY = 0;
				if((plantId === "T5" || plantId === "T10" || plantId === "T17")
					|| Game.isFriendGarden()) // fix: crash in friend's garden
				{
					this.bug.setPosition(this.plant.getPositionX() + bugOffX, this.plant.getPositionY() + 40 + bugOffY);
				}
				else
				{
					if(plantId === "T3" || plantId === "T6")
						bugOffY -= 15;
					if(plantId === "T8")
						bugOffY -= 30;
					else if(plantId === "T11")
						bugOffY += 40;
					else if(bugId === "B6")
						bugOffY -= 25;

					var bugPosX = this.plant.getPositionX() + bugOffX;
					var bugPosY = this.plant.getPositionY() + bugOffY;

					var plantBugMarker = this.plant.spine.findSlot("marker").bone;
					if (plantBugMarker)
					{
						bugPosX += plantBugMarker.worldX;
						bugPosY += plantBugMarker.worldY;
					}
					this.bug.setPosition(bugPosX, bugPosY);
				}
			}
		}
	},
	
	onTouchBegan:function(touch, sender)
	{
		cc.log("CloudFloorSlot::onTouchBegan: " + this + " " + sender);
		//Game.onGameObjectEvent_touchBegan(this, sender);

		if(sender === this.pot)
		{
            var isPlant = this.slotData[SLOT_PLANT] === "";
        	this.pot.setAnimation(isPlant ? "pot_normal_touch" : "pot_plant_touch", false);
			AudioManager.effect (isPlant ? EFFECT_ITEM_TOUCH : EFFECT_PLANT_TOUCH);
			this.showTouchFx();
		}
		else if(sender === this.plant)
		{
			if(this.plantState === PLANT_STATE_TEENAGE)
			{
				// tmp remove due to crash (missing spine marker)
				//this.plant.spine.setAnimation(0, "plant_teenage_touch", false);	
				//this.plant.spine.addAnimation(0, "plant_teenage", true, 4);
			}
			else if(this.plantState === PLANT_STATE_MATURE)
			{
				this.plant.spine.setAnimation(0, "plant_mature_touch", false);	
				this.plant.spine.addAnimation(0, "plant_mature", true, 4);
			}
			AudioManager.effect (EFFECT_PLANT_TOUCH);
			this.showTouchFx();
		}
		//else if(sender === this.decor)
		//{
		//	this.decor.spine.setAnimation(1, "touch", false);	
		//	this.decor.spine.addAnimation(0, "normal", true, 4);
		//}
	},
	
	onTouchEnded:function(touch, sender)
	{
		cc.log("CloudFloorSlot::onTouchEnded: " + this + " " + sender);
		//Game.onGameObjectEvent_touchEnded(this, sender);
		
		if(!Tutorial.acceptInput(sender.name + this.floorIdx + this.slotIdx))
			return;
		Tutorial.onGameEvent(EVT_TOUCH_END, sender.name, this.floorIdx, this.slotIdx);
		
		if(Game.isFriendGarden())
		{
			if((sender === this.pot || sender === this.plant) && this.hasBug())
				this.showCatchBugMenu();
			return;
		}
		
		if(FWUI.isShowing(UI_POT_MENU)) // fix: show 2 menus
			return;
			
		if(sender === this.pot || sender === this.plant)
		{
			if(Tutorial.currentStep && Tutorial.currentStep.id === TUTO2_STEP_7_POT )
			{
				if(this.floorIdx == 0 && this.slotIdx == 0)
					this.showPotMenu();
				return;
			}

			if(this.slotData[SLOT_PLANT] === "")
				this.showPlantMenu();
			else if(this.plantState === PLANT_STATE_SEED)
				this.showPlantStatus();
			else if(this.plantState === PLANT_STATE_TEENAGE)
			{
				if(this.hasBug())
					this.showCatchBugMenu();
				else
					this.showPlantStatus();

				this.showPotButtonsBegin();
			}
			else if(this.plantState === PLANT_STATE_MATURE)
				this.showHarvestMenu();
		}
		else if(sender === this.emptySlot)
		{
			Tutorial.onGameEvent(EVT_TOUCH_END, "slot", this.floorIdx, this.slotIdx);
			this.showPlacePotMenu();
		}
		else if(sender === this.emptyDecorSlot)
			this.showPlaceDecorMenu();
		else if(sender === this.decor)
			this.showDecorMenu();
	},
	
	onLongTouch:function(touch, sender)
	{
		// jira#5427
		// jira#5781
		if(!Tutorial.isMainTutorialFinished() || Game.isFriendGarden())
			return;

		cc.log("CloudFloorSlot::onLongTouch: " + this + " " + sender);
		//Game.onGameObjectEvent_longTouch(this, sender);
		
		if(sender === this.pot || sender === this.plant)
		{
			this.showPotMenu();
		}
		else if(sender === this.decor){
			this.showDecorMenu();


			//if(this.slotIdx <=4)
			//{
			//	var slot = CloudFloors.slots[this.floorIdx][this.slotIdx + 1].parentNode;
            //
			//	if(slot)
			//	{
			//		slot.setPosition(slot.getPositionX()+DECOR_POT_UP.x,slot.getPositionY()+DECOR_POT_UP.y);
			//	}
			//}
		}
	},	
	
	showHarvestMenu:function()
	{
		if(FWUI.isShowing(UI_PLANT_MENU) || Game.isFriendGarden())
			return;
		
		// def
		var itemList = [{sprite:"hud/icon_harvest.png"}];
		var itemDef =
		{
			ItemSprite:{type:UITYPE_IMAGE, field:"sprite", visible:true},
			ItemSpine:{visible:false},
			Amount:{visible:false},
			UIItem:{dragTag:DRAG_TAG_PLANT, dropOnMove:true, onDrop:this.onHarvest.bind(this), onTouchBegan:this.onStartHarvesting.bind(this), onTouchEnded:this.onFinishedHarvesting.bind(this)},
		};
		var uiDef =
		{
			items:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG, itemDef:itemDef, itemSize:cc.size(100, 100)},
			tapToClose:{onTouchEnded:this.onCloseMenu.bind(this)},
		};
		
		// jira#4702
		var pos = this.getWorldPosition(); 
		pos.x -= 30;
		pos.y += 20;
		if(pos.y > cc.winSize.height - 280)
			pos.y = cc.winSize.height - 280;
		
		// ui
		var widget = FWPool.getNode(UI_PLANT_MENU);
		FWUI.alignWidget(widget, pos, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		
		// pot over ui
		if(!Tutorial.isStepFinished(TUTO_STEP_05B_HARVEST2)||!Tutorial.isStepFinished(TUTO2_STEP_4_HARVEST2)) // jira#5362
			this.showOverUi(this.pot);
	},
	
	showCatchBugMenu:function()
	{
		if(FWUI.isShowing(UI_PLANT_MENU))
			return;
		
		// def
		var netId = (Game.isFriendGarden() ? ID_NET_FRIEND : ID_NET_HOME);
		var item = gv.userStorages.getItem(netId);
		if(item === null)
			item = new StorageItem(netId, 0);
		var itemList = [item];
		// jira#4704
		//var itemDef =
		//{
		//	ItemSprite:{type:UITYPE_IMAGE, field:"itemId", subType:defineTypes.TYPE_MATERIAL, visible:true, scale:0.65},
		//	ItemSpine:{visible:false},
		//	Amount:{type:UITYPE_TEXT, field:"itemAmount", format:"x%s", shadow:SHADOW_DEFAULT, visible:true},
		//	UIItem:{dragTag:DRAG_TAG_PLANT, dropOnMove:true, onDrop:this.onCatchBug.bind(this), onTouchBegan:this.onStartCatchingBug.bind(this), onTouchEnded:this.onFinishedCatchingBug.bind(this)},
		//};
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", color:"data.itemAmount <= 0 ? cc.color(128, 128, 128, 255) : cc.WHITE"},
			amount:{type:UITYPE_TEXT, field:"itemAmount", format:"x%s", style:TEXT_STYLE_NUMBER, visible:"data.itemAmount > 0"},//amount:{type:UITYPE_TEXT, field:"itemAmount", format:"x%s", shadow:SHADOW_DEFAULT, visible:"data.itemAmount > 0"},
			lockedIcon:{visible:false},
			lockedText:{visible:false},
			buyButton:{visible:"data.itemAmount <= 0", onTouchEnded:this.onBuyMissingNet.bind(this)},
			UIItem:{dragTag:DRAG_TAG_PLANT, dropOnMove:true, onDrop:this.onCatchBug.bind(this), dragCondition:"data.itemAmount > 0", onTouchBegan:this.onStartCatchingBug.bind(this), onTouchEnded:this.onFinishedCatchingBug.bind(this)},
		};
		
		var uiDef =
		{
			// jira#4704
			//items:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG, itemDef:itemDef, itemSize:cc.size(100, 100)},
			items:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100)},
			tapToClose:{onTouchEnded:this.onCloseMenu.bind(this)},
		};
		
		// jira#4703
		var pos = this.getWorldPosition(); 
		pos.x -= 20;
		pos.y += 20;
		if(pos.y > cc.winSize.height - 280)
			pos.y = cc.winSize.height - 280;
		
		// ui
		var widget = FWPool.getNode(UI_PLANT_MENU);
		FWUI.alignWidget(widget, pos, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		catchBugSlot = this;
		
		// pot over ui
		this.showOverUi(this.pot);
	},
	
	onBuyMissingNet:function(sender)
	{
		this.onCloseMenu(sender);
		Game.openShop(Game.isFriendGarden() ? ID_NET_FRIEND : ID_NET_HOME);
	},
	
	showPlantMenu:function()
	{
		if(FWUI.isShowing(UI_POT_MENU))
			return;
		
		// data
		var emptyPotsCount = CloudFloors.getEmptyPotsCountOnFloor(this.floorIdx);
		
		// fix: show all unlocked plants, not only plants in stock
		//var plantList = gv.userStorages.getAllItemOfType(defineTypes.TYPE_PLANT);
		var allPlants = [];
		var isInEvent = (GameEvent.currentEvent !== null); // jira#5002
		for (var key in g_PLANT)
		{
			if((g_PLANT[key].EVENT_ID === g_MISCINFO.EV01_ID &&!isInEvent )||(g_PLANT[key].EVENT_ID === g_MISCINFO.EV02_ID && !GameEventTemplate2.getActiveEvent())
				|| g_PLANT[key].EVENT_ID === g_COMMON_ITEM.E0ID.ID)
				continue;

			//if((key === g_MISCINFO.EV01_PLANT && !isInEvent )|| (key === g_MISCINFO.EV02_PLANT&& !GameEventTemplate2.getActiveEvent()))
			//	continue;

			allPlants.push(g_PLANT[key]);
		}
		allPlants = _.sortBy(allPlants, function(val) {return val.LEVEL_UNLOCK;});
		var plantList = [];
		for(var i=0; i<allPlants.length; i++)
		{
			var plant = allPlants[i];
			var amount = gv.userStorages.getItemAmount(plant.ID);
			plantList.push({itemId:plant.ID, amount:amount, displayAmount:"x" + amount, isUnlocked:plant.LEVEL_UNLOCK <= gv.userData.getLevel(), unlockText:cc.formatStr(FWLocalization.text("TXT_LV"), plant.LEVEL_UNLOCK)});
			
			// jira#6377
			//if(plant.LEVEL_UNLOCK > gv.userData.getLevel()
			//	|| (plant.ID === "T1" && !Tutorial.isMainTutorialFinished()))
			//	break;
			if(plant.LEVEL_UNLOCK > gv.userData.getLevel())
				break;
		}
		
		var itemsPos = [[2,0],[1,0],[0,0],[1,1],[0,1]];
		/*rmdust if(this.dust.isVisible())
		{
			// insert brush item if pot has dust
			var brushItem = gv.userStorages.getItem(ID_BRUSH);
			if(brushItem === null)
				brushItem = new StorageItem(ID_BRUSH, 0);
			plantList.unshift(brushItem)
			itemsPos.unshift([2,1]);
		}*/
		
		var canUpgradePot = (this.slotData[SLOT_POT] !== "" && g_POT[this.slotData[SLOT_POT]].UPGRADE_NEXT_ID.length > 0);
		
		// def
		// fix: show all unlocked plants, not only plants in stock
		//var itemDef =
		//{
		//	ItemSprite:{visible:false},
		//	ItemSpine:{type:UITYPE_SPINE, field:"itemId", scale:0.6, anim:"plant_icon_small", subType:defineTypes.TYPE_PLANT, visible:true},
		//	Amount:{type:UITYPE_TEXT, field:"itemAmount", format:"x%s", shadow:SHADOW_DEFAULT, visible:true},
		//	UIItem:{dragTag:DRAG_TAG_POT, dropOnMove:true, onDrop:this.onDropPlantOnPot.bind(this), onTouchBegan:this.onStartDroppingPlantOnPot.bind(this), onTouchEnded:this.onFinishedDroppingPlantOnPot.bind(this)},
		//};
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", color:"data.amount <= 0 || data.isUnlocked === false ? cc.color(128, 128, 128, 255) : cc.WHITE"},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0 && data.isUnlocked === true"},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, visible:"data.amount > 0"},
			lockedIcon:{visible:false},// xiao feedback lockedIcon:{visible:"data.isUnlocked === false"},
			lockedText:{type:UITYPE_TEXT, visible:"data.isUnlocked === false", field:"unlockText", style:TEXT_STYLE_TEXT_NORMAL},
			buyButton:{visible:"data.amount <= 0 && data.isUnlocked === true", onTouchEnded:this.onBuyMissingPlant.bind(this)},
			// new tutor
			//UIItem:{dragTag:DRAG_TAG_POT, dropOnMove:true, onDrop:this.onDropPlantOnPot.bind(this), onTouchBegan:this.onStartDroppingPlantOnPot.bind(this), onTouchEnded:this.onFinishedDroppingPlantOnPot.bind(this), dragCondition:"data.isUnlocked && data.amount > 0 && (!Tutorial.currentStep || Tutorial.currentStep.id !== TUTO_STEP_33B_TOUCH_POT)", forceTouchEnd:true}, // added forceTouchEnd to fix jira#5650
			UIItem:{dragTag:DRAG_TAG_POT, dropOnMove:true, onDrop:this.onDropPlantOnPot.bind(this), onTouchBegan:this.onStartDroppingPlantOnPot.bind(this), onTouchEnded:this.onFinishedDroppingPlantOnPot.bind(this), dragCondition:"data.isUnlocked && data.amount > 0", forceTouchEnd:true}, // added forceTouchEnd to fix jira#5650
		};
		
		var uiDef =
		{
			// fix: show all unlocked plants, not only plants in stock
			//items:{type:UITYPE_2D_LIST, items:plantList, itemUI:UI_ITEM_NO_BG, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png", itemsPosition:itemsPos},
			items:{type:UITYPE_2D_LIST, items:plantList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png",itemsPosition:itemsPos},
			//pageButton:{onTouchEnded:this.onPageButton.bind(this)},
			leftArrow:{onTouchEnded:this.onPageButton.bind(this)},
			rightArrow:{onTouchEnded:this.onPageButton.bind(this)},
			pageText:{style:TEXT_STYLE_TEXT_BUTTON_20},//pageText:{shadow:SHADOW_DEFAULT},
			tapToClose:{visible:true,onTouchEnded:this.onCloseMenu.bind(this)},
			//C:{visible:false},
			potButtons:{visible:false},/// hide potButton (just show when hold Pot)
			//move2StockButton:{onTouchEnded:this.onMovePot2Stock.bind(this), enabled:(this.slotData[SLOT_PLANT] === "")},
			//moveAll2StockButton:{onTouchEnded:this.onMoveAllPots2Stock.bind(this), enabled:(emptyPotsCount > 0)},
			//moveAll2StockCount:{type:UITYPE_TEXT, value:emptyPotsCount, shadow:SHADOW_DEFAULT},
			//upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), visible:true},//upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), enabled:canUpgradePot, visible:true},// jira#4634 upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), enabled:this.slotData[SLOT_PLANT] === ""},
			upgradeButtonBegin:{onTouchEnded:this.onUpgradePot.bind(this)},
			moreButtonBegin:{onTouchEnded:this.showPotMenu2.bind(this)},
			potButtonsBegin:{visible:true},
			//infoButton:{onTouchEnded:this.showPotInfo.bind(this)},
			center:{visible:true},
		};
		// jira#4818
		// jira#4779
		var pos = this.getWorldPosition();
		// pos.x -= 10;
		// pos.y += 45;
		// if(pos.y > cc.winSize.height - 280)
			// pos.y = cc.winSize.height - 280;
		
		// ui
		var widget = FWPool.getNode(UI_POT_MENU);
		FWUI.alignWidget(widget, pos, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		this.onPageButton(null, 0);

		//if(Tutorial.currentStep && Tutorial.currentStep.id === TUTO2_STEP_5_PLANT){
		//	let potButton = FWUI.getChildByName(widget,"potButtons");
		//	potButton.setVisible(false);
		//}
		// pot over ui
		this.showOverUi(this.pot);
		
		// feedback
		this.highlightPotMenuButtons(widget, emptyPotsCount, canUpgradePot);
	},
	
	highlightPotMenuButtons:function(widget, emptyPotsCount, canUpgradePot)
	{
		var move2StockButton = FWUtils.getChildByName(widget, "move2StockButton");
		var moveAll2StockButton = FWUtils.getChildByName(widget, "moveAll2StockButton");
		var upgradeButton = FWUtils.getChildByName(widget, "upgradeButton");
		var upgradeButtonBegin = FWUtils.getChildByName(widget, "upgradeButtonBegin");
		FWUtils.applyGreyscaleNode(move2StockButton, this.slotData[SLOT_PLANT] !== "");
		FWUtils.applyGreyscaleNode(moveAll2StockButton, emptyPotsCount <= 0);
		if(emptyPotsCount > 0)
			FWUtils.getChildByName(moveAll2StockButton, "moveAll2StockCount").setColor(cc.GREEN);
		FWUtils.applyGreyscaleNode(upgradeButton, !canUpgradePot);
		FWUtils.applyGreyscaleNode(upgradeButtonBegin, !canUpgradePot);
	},
	
	showPlacePotMenu:function()
	{
		if(FWUI.isShowing(UI_POT_MENU))
			return;
		
		// def
		// jira#4696, 4694
		//var potList = gv.userStorages.getAllItemOfType(defineTypes.TYPE_POT);
		var potList = [];
		var userLevel = gv.userData.getLevel();
		for(var potId in g_POT)
		{
			var pot = g_POT[potId];
			if(pot.LEVEL_UNLOCK <= userLevel)
			{
				var amount = gv.userStorages.getItemAmount(potId);
				if(amount > 0)
				{
					// in stock
					potList.push({itemId:potId, amount:amount});
				}
				else
				{
					var shopPots = g_IBSHOP[1].ITEMS;
					for(var i=0; i<shopPots.length; i++)
					{
						if(shopPots[i].ITEM_NAME === potId)
						{
							if(shopPots[i].UNLOCK_LEVEL <= userLevel
								&& (Tutorial.isMainTutorialFinished() || potId === "P0"))
							{
								// can buy
								potList.push({itemId:potId, amount:0});
							}
							break;
						}
					}
				}
			}
		}

		//var itemDef =
		//{
		//	ItemSprite:{visible:false},
		//	ItemSpine:{type:UITYPE_SPINE, field:"itemId", scale:1, anim:"pot_icon_small", subType:defineTypes.TYPE_POT, visible:true},
		//	Amount:{type:UITYPE_TEXT, field:"itemAmount", format:"x%s", shadow:SHADOW_DEFAULT, visible:true},
		//	UIItem:{dragTag:DRAG_TAG_SLOT, dropOnMove:true, onDrop:this.onDropPotOnSlot.bind(this), onTouchBegan:this.onStartDroppingPotOnSlot.bind(this), onTouchEnded:this.onFinishedDroppingPotOnSlot.bind(this)},
		//};
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", color:"data.amount <= 0 ? cc.color(128, 128, 128, 255) : cc.WHITE"},
			amount:{type:UITYPE_TEXT, field:"amount", format:"x%s", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0"},//amount:{type:UITYPE_TEXT, field:"amount", format:"x%s", shadow:SHADOW_DEFAULT, visible:"data.amount > 0"},
			lockedIcon:{visible:false},
			lockedText:{visible:false},
			buyButton:{visible:"data.amount <= 0", onTouchEnded:this.onBuyMissingPot.bind(this)},
			UIItem:{dragTag:DRAG_TAG_SLOT, dropOnMove:true, onDrop:this.onDropPotOnSlot.bind(this), onTouchBegan:this.onStartDroppingPotOnSlot.bind(this), onTouchEnded:this.onFinishedDroppingPotOnSlot.bind(this), dragCondition:"data.amount > 0"},
		};
		
		var uiDef =
		{
			//items:{type:UITYPE_2D_LIST, items:potList, itemUI:UI_ITEM_NO_BG, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:6, itemBackground:"#hud/menu_list_slot.png", itemsPosition:[[2,0],[1,0],[0,0],[2,1],[1,1],[0,1]]},
			items:{type:UITYPE_2D_LIST, items:potList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100,100), itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png", itemsPosition:[[2,0],[1,0],[0,0],[1,1],[0,1]]},//items:{type:UITYPE_2D_LIST, items:potList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:6, itemBackground:"#hud/menu_list_slot.png", itemsPosition:[[2,0],[1,0],[0,0],[2,1],[1,1],[0,1]]},
			//pageButton:{onTouchEnded:this.onPageButton.bind(this)},
			leftArrow:{onTouchEnded:this.onPageButton.bind(this)},
			rightArrow:{onTouchEnded:this.onPageButton.bind(this)},
			pageText:{style:TEXT_STYLE_TEXT_BUTTON_20},//pageText:{shadow:SHADOW_DEFAULT},
			tapToClose:{visible:true,onTouchEnded:this.onCloseMenu.bind(this)},
			potButtons:{visible:false},
			potButtonsBegin:{visible:false},
			center:{visible:true},
		};
		
		// jira#4818
		// jira#4779
		var pos = this.getWorldPosition();
		//if(pos.y > cc.winSize.height - 280)
			//pos.y = cc.winSize.height - 280;
		pos.y -= 30;
		
		// ui
		var widget = FWPool.getNode(UI_POT_MENU);
		FWUI.alignWidget(widget, pos, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		this.onPageButton(null, 0);
		
		// slot over ui
		this.showOverUi(this.emptySlot);
	},
	
	onBuyMissingPot:function(sender)
	{
		Game.openShop(sender.uiData.itemId);
		this.onCloseMenu(sender);
	},
	
	showPlantStatus:function()
	{
		var pos = this.getWorldPosition();
		pos.y += 120;
		Game.showSkipTimeEndTime(FWUtils.getCurrentScene(), pos, this.slotData[SLOT_PLANT], this.slotData[SLOT_TIME_FINISH], this.onSkipTime.bind(this),null,"barBlue",this.onCloseMenu.bind(this));//Game.showSkipTime(FWUtils.getCurrentScene(), pos, this.slotData[SLOT_PLANT], this.slotData[SLOT_TIME_START], this.onSkipTime.bind(this));
		
		// fix: progress bar is full when reopening skiptime popup
		if(Game.skipTimeWidget)
		{
			Game.skipTimeStartTime = this.slotData[SLOT_TIME_START];
			Game.onSkipTimeUpdate(0);
			this.onCloseMenu();
		}
	},
	
	showPotMenu:function()
	{
		if(FWUI.isShowing(UI_POT_MENU))
			return;
		
		var canUpgradePot = (this.slotData[SLOT_POT] !== "" && g_POT[this.slotData[SLOT_POT]].UPGRADE_NEXT_ID.length > 0);
		
		// def
		var emptyPotsCount = CloudFloors.getEmptyPotsCountOnFloor(this.floorIdx);
		var uiDef =
		{
			tapToClose:{visible:true,onTouchEnded:this.onCloseMenu.bind(this)},
			potButtons:{visible:true},
			center:{visible:false},
			potButtonsBegin:{visible:false},
			move2StockButton:{onTouchEnded:this.onMovePot2Stock.bind(this)},//move2StockButton:{onTouchEnded:this.onMovePot2Stock.bind(this), enabled:(this.slotData[SLOT_PLANT] === "")},
			moveAll2StockButton:{onTouchEnded:this.onMoveAllPots2Stock.bind(this)},//moveAll2StockButton:{onTouchEnded:this.onMoveAllPots2Stock.bind(this), enabled:(emptyPotsCount > 0)},
			moveAll2StockCount:{type:UITYPE_TEXT, value:emptyPotsCount, shadow:SHADOW_DEFAULT},
			upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), visible:true},//upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), enabled:canUpgradePot, visible:true},// jira#4634 upgradeButton:{onTouchEnded:this.onUpgradePot.bind(this), enabled:this.slotData[SLOT_PLANT] === ""},
			infoButton:{onTouchEnded:this.showPotInfo.bind(this)},
		};
		
		// ui
		var widget = FWPool.getNode(UI_POT_MENU);
		FWUI.alignWidget(widget, this.getWorldPosition(), cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU + 1); // added -1 to make pot draggable
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		
		// pot over ui
		Game.gameScene.background.setDisableScrolling(true); // jira#5234
		this.showOverUi(this.pot, true, this.slotData[SLOT_PLANT] === "");
		
		// feedback
		this.highlightPotMenuButtons(widget, emptyPotsCount, canUpgradePot);
	},
	showPotButtonsBegin:function()
	{
		cc.log("showPotButtonsBegin");
		//if(FWUI.getChildByName(UI_POT_MENU,"potButtons").isVisible()) return;
		if(FWUI.isShowing(UI_POT_MENU))
		{
			cc.log("showPotButtonsBegin 2");
			return;
		}

		var canUpgradePot = (this.slotData[SLOT_POT] !== "" && g_POT[this.slotData[SLOT_POT]].UPGRADE_NEXT_ID.length > 0);

		// def
		var emptyPotsCount = CloudFloors.getEmptyPotsCountOnFloor(this.floorIdx);
		var uiDef =
		{
			tapToClose:{visible:false},
			potButtons:{visible:false},
			center:{visible:false},
			potButtonsBegin:{visible:true},
			upgradeButtonBegin:{onTouchEnded:this.onUpgradePot.bind(this)},
			moreButtonBegin:{onTouchEnded:this.showPotMenu2.bind(this)},
		};

		// ui
		var widget = FWPool.getNode(UI_POT_MENU);
		FWUI.alignWidget(widget, this.getWorldPosition(), cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU + 1); // added -1 to make pot draggable
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);

		// pot over ui
		Game.gameScene.background.setDisableScrolling(true); // jira#5234
		this.showOverUi(this.pot, true, this.slotData[SLOT_PLANT] === "");

		// feedback
		this.highlightPotMenuButtons(widget, emptyPotsCount, canUpgradePot);
	},
	showPotMenu2:function(){
		//this.onCloseMenu();
		FWUI.hide(UI_POT_MENU, UIFX_NONE);
		Game.onCloseSkipTime(null);
		this.onCloseMenu();
		this.showPotMenu();
	},
	// show object over darken background layer
	showOverUiPos: null,
	//showOverUiDelay: 0.15, // jira#5726
	showOverUi:function(object, show, dragPot)//web showOverUi:function(object, show = true, dragPot = false)
	{
		if(show === undefined)
			show = true;
		if(dragPot === undefined)
			dragPot = false;

		if(object.node === null)
			return;
		
		// feedback
		// jira#5012
		//cc.director.getScheduler().scheduleCallbackForTarget(this, function() {this.showOverUi2(object, show, dragPot);}.bind(this), this.showOverUiDelay, 0, 0, false);
		//this.showOverUiDelay = 0.15;
		this.showOverUi2(object, show, dragPot);
	},
	
	showOverUi2:function(object, show, dragPot)//web showOverUi2:function(object, show = true, dragPot = false)
	{
		if(show === undefined)
			show = true;
		if(dragPot === undefined)
			dragPot = false;
		
		var world = FWUtils.getCurrentScene();
		//var worldPosition = this.getWorldPosition();
		if(show === true && object.getParent() !== world)//if(show === true && object.isParentWorld() === false)
		{
			this.showOverUiPos = object.getPosition();
			object.setPosition(object.getWorldPosition());//object.setPosition(worldPosition);
			object.setParent(world, Z_UI_POT_MENU - 1);
		}
		else if(show === false && object.getParent() === world)
		{
			if(object === this.decor || object === this.emptyDecorSlot)
				object.setParent(this.decorParent, Z_DECOR);
			else
				object.setParent(this.parentNode, Z_POT);
			object.setPosition(this.showOverUiPos);//object.setPosition(this.position);
		}
		
		if(show === true)
		{
			// feedback: no dark bg
			//FWUtils.showDarkBg(world, Z_UI_POT_MENU - 2, "darkBgCloudSlot");
			
			// lock scrolling while showing overlay ui
			Game.gameScene.background.setDisableScrolling(true);
			
			Tutorial.currentCloudFloorSlot = this;
		}
		else
		{
			// feedback: no dark bg
			//FWUtils.hideDarkBg(world, "darkBgCloudSlot");
			
			// scroll to correct position when finished
			if(!Tutorial.currentStep)
				Game.gameScene.background.setDisableScrolling(false);
			
			Tutorial.currentCloudFloorSlot = null;
		}
		
		if(object === this.pot)
			this.refreshUpgradeIcon();
		
		// jira#5234
		// drag to re-order empty pot
		if(dragPot)
		{
			this.pot.setDraggable(DRAG_TAG_SLOT, this.onDropPotOnAnotherSlot.bind(this));
			Game.gameScene.draggingPot = this.pot;
		}
	},
	
	onBuyMissingPlant:function(sender)
	{
		Game.openShop(sender.uiData.itemId);
		this.onCloseMenu(sender);
	},
	
	onPageButton:function(sender, offset)//onPageButton:function(sender, offset = 1)
	{
		// jira#4762
		if(offset === undefined)
		{
			if(sender === null)
				offset = 1;
			else
				offset = (sender.getName() === "leftArrow" ? -1 : 1);
		}
		
		var widget = null;
		if(FWUI.isShowing(UI_POT_MENU))
			widget = FWPool.getNode(UI_POT_MENU, false);
		else if(FWUI.isShowing(UI_DECOR_PUT))
			widget = FWPool.getNode(UI_DECOR_PUT, false);
		
		var items = FWUI.getChildByName(widget, "items");
		var pageButton = FWUI.getChildByName(widget, "pageButton");

		var pageText = FWUI.getChildByName(widget, "pageText");
		if(offset === 0)
			pageText.setString((items.uiCurrentPage + 1) + "/" + items.uiPagesCount);
		else
			pageText.setString(FWUI.set2dlistPage(items, offset, true));
		if(items.uiPagesCount > 1)
		{
			pageButton.setVisible(true);

		}
		else
			pageButton.setVisible(false);
	},
	
	onCloseMenu:function(widget)
	{
		if(this.pot.isParentWorld())
			this.showOverUi(this.pot, false);
		if(this.emptySlot.isParentWorld())
			this.showOverUi(this.emptySlot, false);
		if(this.emptyDecorSlot.isParentWorld())
			this.showOverUi(this.emptyDecorSlot, false);
		if(this.decor.isParentWorld())
		{
			this.showOverUi(this.decor, false);
			//if(this.slotIdx <=4)
			//{
			//	var slot = CloudFloors.slots[this.floorIdx][this.slotIdx + 1].parentNode;
			//	if(slot)
			//	{
			//		slot.setPosition(slot.getPositionX() - DECOR_POT_UP.x,slot.getPositionY()- DECOR_POT_UP.y);
			//	}
			//}
		}
		this.pot.setDraggable(false);
		Game.gameScene.draggingPot = null;
		FWUI.hide(UI_POT_MENU, UIFX_FADE);
		FWUI.hide(UI_PLANT_MENU, UIFX_FADE);
		FWUI.hide(UI_DECOR_PUT, UIFX_FADE);
		FWUI.hide(UI_DECOR_MENU, UIFX_FADE);
		catchBugSlot = null;
	},
	
	onDropPlantOnPot:function(draggedWidget, droppedWidget)
	{
		return this.onDropPlantIdOnPotSlot(draggedWidget.uiData["itemId"], droppedWidget.owner, draggedWidget);
	},

	onDropPlantIdOnPotSlot:function(plantId, slot, draggedWidget)
	{
		//var plantId = draggedWidget.uiData["itemId"];
		/*rmdust if(plantId === ID_BRUSH)
			return this.onCleanPot(draggedWidget, droppedWidget);*/
		
		//var slot = droppedWidget.owner;
		if(slot.slotData[SLOT_PLANT] !== "")
			return false; // pot already has plant
		
		if(FWUI.isShowing(UI_POT_MENU))
		{
			this.onCloseMenu();
			gv.hintManagerNew.hideHint(HINT_TYPE_PLANT);
		}
		
		if(!this.dropPlantSlots)
			return false;
		
		var amount = gv.userStorages.getItemAmount(plantId);
		if(amount > 0)
		{
			// success
			gv.userStorages.removeItem(plantId, 1);
			amount--;
			
			if(draggedWidget)
			{
				var text = FWUI.getChildByName(draggedWidget, "amount");
				text.setString(cc.formatStr("x%s", amount));
			}
			
			// plant
			var slotData = CloudFloors.getSlotData(slot.floorIdx, slot.slotIdx);
			slotData[SLOT_PLANT] = plantId;
			slotData[SLOT_TIME_START] = Math.ceil(Game.getGameTimeInSeconds());
			slotData[SLOT_TIME_FINISH] = 0;
			slotData[SLOT_PEST] = "";
			slot.refresh(slotData);
			
			// jira#5145
			slot.plant.setVisible(false);
			slot.plant.node.runAction(cc.sequence(cc.delayTime(0.5), cc.show()));
			
			// pot
			this.dropPlantSlots.push(slot);
			
			// fx
			// jira#5379
			/*var pos = slot.getWorldPosition();
			pos.y += 150;
			//var spine = FWUI.getChildByName(draggedWidget, "gfx").getChildByTag(UI_FILL_DATA_TAG);
			//spine = FWUtils.cloneSpine(spine, FWUtils.getCurrentScene());
			//spine.setScale(spine.getScale() * PLANT_HARVEST_SCALE);
			//FWUtils.flyNodeUp(spine, pos, -100, 0.75);
			var gfx = Game.getItemGfxByDefine(plantId);
			var sprite  = new cc.Sprite("#" + gfx.sprite);
			sprite.setScale(gfx.scale);
			FWUtils.getCurrentScene().addChild(sprite);
			FWUtils.flyNodeUp(sprite, pos, -100, 0.5);*/
			var pos = cc.p(0, 150);
			var gfx = Game.getItemGfxByDefine(plantId);
			var sprite  = new cc.Sprite("#" + gfx.sprite);
			sprite.setScale(gfx.scale);
			sprite.setLocalZOrder(9999);
			slot.parentNode.addChild(sprite);
			FWUtils.flyNodeUp(sprite, pos, -100, 0.5);
			
			// achievement
			if(CloudFloors.plantedPlantsAndCounts[plantId])
				CloudFloors.plantedPlantsAndCounts[plantId]++;
			else
				CloudFloors.plantedPlantsAndCounts[plantId] = 1;
		}
		else // if(amount <= 0)
		{
			// jira#4690
			//this.onFinishedDroppingPlantOnPot(draggedWidget);
			//FWUI.hideDraggedWidget(draggedWidget);
			if(!isShowingWarningText)
			{
				FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_PLANT"), slot.getWorldPosition(), cc.WHITE);
				isShowingWarningText = true;
			}
			return false;
		}

		return true;
	},
	
	onStartDroppingPlantOnPot:function(sender)
	{
		/*rmdust if(sender.uiData.itemId === ID_BRUSH && sender.uiData.itemAmount <= 0)
		{
			// ask user to buy brushes
			this.onCloseMenu();
			Game.showPopup0("TXT_NOT_ENOUGH_BRUSH_TITLE", "TXT_NOT_ENOUGH_BRUSH_CONTENT", Game.getMaterialSpriteByDefine(ID_BRUSH), function() {Game.openShop(ID_BRUSH);}, true, "TXT_BUY");
			FWUI.hideDraggedWidget();
			return;
		}*/
		
		this.dropPlantId = sender.uiData["itemId"];
		this.dropPlantSlots = [];
		isShowingWarningText = false;
		
		// jira#4828
		//var posX = (this.getWorldPosition().x > cc.winSize.width / 2 ? 200 : cc.winSize.width - 100);
		//gv.hint.show(FWUtils.getCurrentScene(), HINT_TYPE_PLANT, sender.uiData.itemId, {posX:posX, cover:false}, Z_FX);
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showPlantHint, 0, 0, DELAY_SHOW_HINT, false);
	},
	
	showPlantHint:function(dt)
	{
		if(this.dropPlantId && FWUI.isShowing(UI_POT_MENU))
		{
			//var widget = FWPool.getNode(UI_DECOR_PUT, false);
			var position = null;
			if(FWUI.touchedWidget){
				position = FWUI.touchedWidget.getTouchBeganPosition();
			}
			//this.currentAchievement = sender.uiData;
			gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_PLANT,  this.dropPlantId,position);

			//// jira#5308
			//var posX = (this.getWorldPosition().x > cc.winSize.width / 2 ? 200 : cc.winSize.width - 100);
			//var slotPosX = this.getWorldPosition().x;
			//var posX = (slotPosX > cc.winSize.width / 2 ? slotPosX - 450 : slotPosX + 340);
			//gv.hint.show(FWUtils.getCurrentScene(), HINT_TYPE_PLANT, this.dropPlantId, {posX:posX, cover:false}, Z_FX);
		}
	},
	
	onFinishedDroppingPlantOnPot:function(sender)
	{
		if(this.dropPlantSlots && this.dropPlantSlots.length > 0)
		{
			// new tutor
			if(Tutorial.currentStep && (Tutorial.currentStep.id === TUTO_STEP_08B_PLANT2 || Tutorial.currentStep.id === TUTO2_STEP_5_PLANT2))
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					var slot = CloudFloors.slots[0][i];
					if(!slot.slotData[SLOT_PLANT])
						this.onDropPlantIdOnPotSlot(this.dropPlantId, slot);
				}
			}
			
			var floors = [];
			var slots = [];
			var times = [];
			for(var i=0; i<this.dropPlantSlots.length; i++)
			{
				floors.push(this.dropPlantSlots[i].floorIdx);
				slots.push(this.dropPlantSlots[i].slotIdx);
				times.push(this.dropPlantSlots[i].slotData[SLOT_TIME_START]);
			}
			
			var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlant);
			pk.pack(this.dropPlantId, floors, slots, times);
			network.connector.client.sendPacket(pk);		
			
			Tutorial.onGameEvent(EVT_PLANT);
		}
		delete this.dropPlantId;
		delete this.dropPlantSlots;

		gv.hintManagerNew.hideHint(HINT_TYPE_PLANT);
	},
	
	/*rmdust onCleanPot:function(draggedWidget, droppedWidget)
	{
		var slot = droppedWidget.owner;
		var dustAnim = Game.getDustAnimationByLevel(999);
		if(dustAnim === null)
			return false; // no dust
		
		if(FWUI.isShowing(UI_POT_MENU))
			this.onCloseMenu();
		
		var amount = gv.userStorages.getItemAmount(ID_BRUSH);
		if(amount > 0)
		{
			// success
			gv.userStorages.removeItem(ID_BRUSH, 1);
			amount--;
			
			var text = FWUI.getChildByName(draggedWidget, "Amount");
			text.setString(cc.formatStr("x%s", amount));
			
			// clean
			//slot.slotData[SLOT_DUST_LEVEL] = 0;
			
			// TODO: server
			
			// fx
			var spine = FWUI.getChildByName(draggedWidget, "ItemSpine").getChildByTag(UI_FILL_DATA_TAG);
			var pos = slot.getWorldPosition();
			spine = FWUtils.cloneSpine(spine, FWUtils.getCurrentScene());
			spine.setAnimation(0, "cleaning", false);
			spine.setCompleteListener(this.onCleanPotFinished.bind(slot));
			FWUtils.flyNode(spine, pos, cc.p(pos.x, pos.y - 10), 3, true, null, false);
		}
		
		if(amount <= 0)
			FWUI.hideDraggedWidget(draggedWidget);
		
		return true;
	},	
	
	onCleanPotFinished:function()
	{
		this.dust.setVisible(false);
	},*/
	
	onDropPotOnSlot:function(draggedWidget, droppedWidget)
	{
		return this.onDropPotIdOnSlot(draggedWidget.uiData["itemId"], droppedWidget.owner, draggedWidget);
	},
	
	onDropPotIdOnSlot:function(potId, slot, draggedWidget)
	{
		//var slot = droppedWidget.owner;
		if(slot.slotData[SLOT_POT] !== "")
			return false; // slot already has pot
		
		if(FWUI.isShowing(UI_POT_MENU))
		{
			this.onCloseMenu();
			gv.hintManagerNew.hideHint(HINT_TYPE_POT);
		}


		if(!this.dropPotSlots)
			return false;
		
		//var potId = draggedWidget.uiData["itemId"];
		var amount = gv.userStorages.getItemAmount(potId);
		if(amount > 0)
		{
			// success
			gv.userStorages.removeItem(potId, 1);
			amount--;
			
			if(draggedWidget)
			{
				var text = FWUI.getChildByName(draggedWidget, "amount");//var text = FWUI.getChildByName(draggedWidget, "Amount");
				text.setString(cc.formatStr("x%s", amount));
			}
			
			// pot
			var slotData = CloudFloors.getSlotData(slot.floorIdx, slot.slotIdx);
			slotData[SLOT_POT] = potId;
			slot.refresh(slotData);
			
			// jira#5145
			slot.pot.setVisible(false);
			slot.pot.node.runAction(cc.sequence(cc.delayTime(0.5), cc.show()));
			
			// slot
			this.dropPotSlots.push(slot);
			
			// fx
			// jira#5379
			/*var spine = FWUI.getChildByName(draggedWidget, "gfx").getChildByTag(UI_FILL_DATA_TAG);//var spine = FWUI.getChildByName(draggedWidget, "ItemSpine").getChildByTag(UI_FILL_DATA_TAG);
			var pos = slot.getWorldPosition();
			spine = FWUtils.cloneSpine(spine, FWUtils.getCurrentScene());
			pos.y += 150;
			FWUtils.flyNodeUp(spine, pos, -100, 0.5);*/
			if(draggedWidget)
			{
				var spine = FWUI.getChildByName(draggedWidget, "gfx").getChildByTag(UI_FILL_DATA_TAG);
				var pos = cc.p(0, 150);
				spine = FWUtils.cloneSpine(spine, slot.parentNode);
				spine.setLocalZOrder(9999);
				FWUtils.flyNodeUp(spine, pos, -100, 0.5);
			}
		}
		else // if(amount <= 0)
		{
			// jira#4690
			//this.onFinishedDroppingPotOnSlot(draggedWidget);
			//FWUI.hideDraggedWidget(draggedWidget);
			if(!isShowingWarningText)
			{
				FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_POT"), slot.getWorldPosition(), cc.WHITE);
				isShowingWarningText = true;
			}
			return false;
		}
		
		return true;
	},
	
	onStartDroppingPotOnSlot:function(sender)
	{
		this.dropPotId = sender.uiData["itemId"];
		this.dropPotSlots = [];
		isShowingWarningText = false;
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showPotHint, 0, 0, DELAY_SHOW_HINT, false);
	},
	showPotHint:function(dt)
	{
		if(this.dropPotId && FWUI.isShowing(UI_POT_MENU))
		{
			var position = null;
			if(FWUI.touchedWidget){
				position = FWUI.touchedWidget.getTouchBeganPosition();
			}
			gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_POT,  this.dropPotId,position);
		}
	},
	onFinishedDroppingPotOnSlot:function(sender)
	{
		if(sender.uiData.amount <= 0)
			this.onBuyMissingPot(sender);
		else if(this.dropPotSlots && this.dropPotSlots.length > 0)
		{
			// new tutor
			if(Tutorial.currentStep && (Tutorial.currentStep.id === TUTO_STEP_29C_PUT_POT || Tutorial.currentStep.id === TUTO2_STEP_13_DROP_POT2))
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					var slot = CloudFloors.slots[1][i];
					if(!slot.slotData[SLOT_POT])
						this.onDropPotIdOnSlot(this.dropPotId, slot);
				}
			}
			
			var floors = [];
			var slots = [];
			for(var i=0; i<this.dropPotSlots.length; i++)
			{
				floors.push(this.dropPotSlots[i].floorIdx);
				slots.push(this.dropPotSlots[i].slotIdx);
			}
			
			var pk = network.connector.client.getOutPacket(CloudFloors.RequestPotPut);
			pk.pack(this.dropPotId, floors, slots);
			network.connector.client.sendPacket(pk);		
			
			Tutorial.onGameEvent(EVT_PUT_POT);
		}
		delete this.dropPotId;
		delete this.dropPotSlots;

		gv.hintManagerNew.hideHint(HINT_TYPE_POT);
	},
	
	onDropPotOnAnotherSlot:function(draggedWidget, droppedWidget)
	{
		var dstSlot = droppedWidget.owner;
		if(dstSlot.slotData[SLOT_POT] !== "")
			return false; // slot already has pot

		this.onCloseMenu();
		// swap
		var srcSlot = draggedWidget.owner;
		var srcSlotData = CloudFloors.getSlotData(srcSlot.floorIdx, srcSlot.slotIdx);
		var dstSlotData = CloudFloors.getSlotData(dstSlot.floorIdx, dstSlot.slotIdx);
		CloudFloors.setSlotData(srcSlot.floorIdx, srcSlot.slotIdx, dstSlotData);
		CloudFloors.setSlotData(dstSlot.floorIdx, dstSlot.slotIdx, srcSlotData);
	
		// server
		var pk = network.connector.client.getOutPacket(CloudFloors.RequestPotMove);
		pk.pack(srcSlot.floorIdx, srcSlot.slotIdx, dstSlot.floorIdx, dstSlot.slotIdx);
		network.connector.client.sendPacket(pk);		
		
		return true;
	},		
	
	onHarvest:function(draggedWidget, droppedWidget)
	{
		return this.onHarvestSlot(draggedWidget, droppedWidget.owner);
	},
	
	onHarvestSlot:function(draggedWidget, slot)
	{
		if(slot.slotData[SLOT_PLANT] === "" || slot.getPlantState() !== PLANT_STATE_MATURE)
			return false; // cannot requestHarvest
		
		if(FWUI.isShowing(UI_PLANT_MENU))
			this.onCloseMenu();
		
		if(!this.requestHarvestSlots)
			return false;
		
		var storage = gv.userStorages.getStorage(STORAGE_TYPE_FARM_PRODUCT);
		if(storage)
		{
			// jira#5031
			//// jira#4765
			////var storageStatus = storage.getStorageStatus();
			////if(storageStatus === STORAGE_STATUS_FULL)
			//if (storage.capacityCurrent + 2 > storage.capacityMax)
			//{
			//	// cannot requestHarvest
			//	this.onFinishedHarvesting(draggedWidget);
			//	FWUI.hideDraggedWidget(draggedWidget);
			//	Game.showUpgradeStock("hud/icon_tab_plants.png", STORAGE_TYPE_FARM_PRODUCT);
			//}
			
			// jira#5299: remove materials if stock is full
			var dropItems = slot.slotData[SLOT_DROP_ITEMS];
			var eventDropItems = slot.slotData[SLOT_EVENT_ITEMS];
			var dropMaterials = [];
			var dropOthers = [];
			for(var key in dropItems)
			{
				if(defineMap[key].TYPE === defineTypes.TYPE_MATERIAL)
					dropMaterials.push({itemId:key, amount:dropItems[key]});
				else
					dropOthers.push({itemId:key, amount:dropItems[key]});
			}
			for(var key in eventDropItems)
				dropOthers.push({itemId:key, amount:eventDropItems[key]});
			
			if(!Game.canReceiveGift(dropOthers))//if(!Game.canReceiveGift(rewardItems))
			{
				// cannot requestHarvest
				if(draggedWidget)
				{
					this.onFinishedHarvesting(draggedWidget);
					FWUI.hideDraggedWidget(draggedWidget);
				}
			}
			else
			{
				// success
				if(!g_PLANT[slot.slotData[SLOT_PLANT]].EVENT_ID) // cannot harvest event plant
					gv.userStorages.addItem(slot.slotData[SLOT_PLANT], 2);
				
				// slot
				this.requestHarvestSlots.push(slot);
				
				// achievement
				var plantId = slot.slotData[SLOT_PLANT];
				if(CloudFloors.harvestedItemsAndCounts[plantId])
					CloudFloors.harvestedItemsAndCounts[plantId]++;
				else
					CloudFloors.harvestedItemsAndCounts[plantId] = 1;
				
				// fx
				// jira#5146
				/*var spine = FWUtils.cloneSpine(slot.plant.spine, FWUtils.getCurrentScene());
				var pos = slot.plant.getWorldPosition();
				var scale = slot.plant.spine.getScale() * PLANT_HARVEST_SCALE;
				spine.setScale(-scale, scale);
				spine.setPosition(pos.x, pos.y + 100);
				spine.setAnimation(0, "plant_icon_small", false);
				spine.runAction(cc.moveTo(0.75, cc.p(pos.x + 25, pos.y + 100)));
				spine.runAction(cc.sequence(
					cc.moveTo(0.75, cc.p(pos.x, pos.y - 25)).easing(cc.easeBounceOut()),
					//cc.delayTime(0.35),
					cc.callFunc(function() {FWPool.returnNode(spine);})//cc.callFunc(function() {Game.flyToStorage(spine);})
				));*/
				
				var pos = slot.plant.getWorldPosition();
				if(slot.slotData[SLOT_PLANT] !== g_MISCINFO.EV01_PLANT && slot.slotData[SLOT_PLANT] !== g_MISCINFO.EV02_PLANT)
				{
					var gfx = Game.getItemGfxByDefine(slot.slotData[SLOT_PLANT]);
					var sprite = new cc.Sprite("#" + gfx.sprite);
					sprite.setScale(PLANT_HARVEST_SCALE * gfx.scale);
					sprite.setPosition(pos.x, pos.y + 100);
					sprite.runAction(cc.moveTo(0.75, cc.p(pos.x + 25, pos.y + 100)));
					sprite.runAction(cc.sequence(cc.moveTo(0.75, cc.p(pos.x, pos.y - 25)).easing(cc.easeBounceOut()), cc.callFunc(function() {sprite.removeFromParent();})));
					FWUtils.getCurrentScene().addChild(sprite);
				}
				
				// exp & gold fx
				//pos = cc.p(pos.x + 25, pos.y - 25);
				//var plantDefine = g_PLANT[slot.slotData[SLOT_PLANT]];
				//var potDefine = g_POT[slot.slotData[SLOT_POT]];
				//var exp = plantDefine.HARVEST_EXP + potDefine.EXP_INCREASE;
				//var gold = plantDefine.HARVEST_GOLD + FWUtils.fastFloor(plantDefine.HARVEST_GOLD * potDefine.GOLD_INCREASE / 100);
				//var rewardItems = [{itemId:ID_EXP, amount:exp}, {itemId:ID_GOLD, amount:gold}];
				//for(var i=0; i<rewardItems.length; i++)
					//FWUtils.showFlyingItemIcon(rewardItems[i].itemId, rewardItems[i].amount, pos, Game.getFlyingDestinationForItem(rewardItems[i].itemId), 1.1 + i * 0.25);
				
				var rewardItems = dropOthers;
				if(Game.canReceiveGift(dropMaterials, false))
					rewardItems = rewardItems.concat(dropMaterials);
				else
					FWUtils.showWarningText(FWLocalization.text("TXT_MATERIAL_STORAGE_FULL"), pos, cc.WHITE);
				
				// drop items fx
				pos = cc.p(pos.x + 25, pos.y - 25);
				for(var i=0; i < rewardItems.length; i++)
				{
					var itemId = rewardItems[i].itemId;
					if (defineMap[itemId].TYPE === defineTypes.TYPE_PLANT)
						FWUtils.showFlyingItemIcon(itemId, rewardItems[i].amount, pos, Game.getFlyingDestinationForItem(rewardItems[i].itemId), 0.75 + (rewardItems.length - i - 1) * 0.25, false, {scale:PLANT_HARVEST_SCALE});
					else
						FWUtils.showFlyingItemIcon(itemId, rewardItems[i].amount, pos, Game.getFlyingDestinationForItem(rewardItems[i].itemId), 0.75 + (rewardItems.length - i - 1) * 0.25, false);
				}

				// remove plant on slot
				var slotData = CloudFloors.getSlotData(slot.floorIdx, slot.slotIdx);
				slotData[SLOT_PLANT] = "";
				slotData[SLOT_TIME_START] = 0;
				slotData[SLOT_TIME_FINISH] = 0;
				slotData[SLOT_PEST] = "";
				slot.refresh(slotData);
			}
		}
		
		return true;
	},
	
	onStartHarvesting:function(sender)
	{
		this.requestHarvestSlots = [];
	},
	
	onFinishedHarvesting:function(sender)
	{
		if(!this.requestHarvestSlots)
			return;
		
		if(this.requestHarvestSlots.length > 0)
		{
			// new tutor
			if(Tutorial.currentStep && (Tutorial.currentStep.id === TUTO_STEP_05B_HARVEST2 || Tutorial.currentStep.id === TUTO2_STEP_4_HARVEST2))
			{
				for(var i=0; i<MAX_SLOTS_PER_FLOOR; i++)
				{
					var slot = CloudFloors.slots[0][i];
					if(slot.slotData[SLOT_PLANT])
						this.onHarvestSlot(null, slot);
				}
			}
			
			var floors = [];
			var slots = [];
			for(var i=0; i<this.requestHarvestSlots.length; i++)
			{
				floors.push(this.requestHarvestSlots[i].floorIdx);
				slots.push(this.requestHarvestSlots[i].slotIdx);
			}
			
			var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlantHarvest);
			pk.pack(floors, slots);
			network.connector.client.sendPacket(pk);
			
			Tutorial.onGameEvent(EVT_HARVEST);
		}
		
		AudioManager.effect (EFFECT_PLAN_HARVEST);
		delete this.requestHarvestSlots;
	},
	
	onCatchBug:function(draggedWidget, droppedWidget)
	{
		var slot = droppedWidget.owner;
		var pestId = slot.slotData[SLOT_PEST];
		if(pestId === "" || (slot.getPlantState() !== PLANT_STATE_TEENAGE && !Game.isFriendGarden()))
			return false; // no bug to catch
		
		if(FWUI.isShowing(UI_PLANT_MENU))
			this.onCloseMenu();
		
		if(!this.catchBugSlots)
			return false;
		
		var netId = (Game.isFriendGarden() ? ID_NET_FRIEND : ID_NET_HOME);
		var amount = gv.userStorages.getItemAmount(netId);
		if(amount > 0)
		{
			var storage = gv.userStorages.getStorage(STORAGE_TYPE_PRODUCT);
			if(storage)
			{
				var storageStatus = storage.getStorageStatus();
				if(storageStatus === STORAGE_STATUS_FULL)
				{
					// cannot requestHarvest
					Game.showUpgradeStock("hud/icon_tab_products.png", STORAGE_TYPE_PRODUCT);
					amount = 0; // failed
				}
				else
				{
					// success
					gv.userStorages.addItem(pestId, 1);
					gv.userStorages.removeItem(netId, 1);
					amount--;

					// jira#4704
					//var text = FWUI.getChildByName(draggedWidget, "Amount");
					var text = FWUI.getChildByName(draggedWidget, "amount");
					text.setString(cc.formatStr("x%s", amount));

					// achievement
					if(CloudFloors.catchPestAndCounts[pestId])
						CloudFloors.catchPestAndCounts[pestId] += 1;
					else
						CloudFloors.catchPestAndCounts[pestId] = 1;
					
					// server
					this.catchBugSlots.push(slot);
					this.catchBugTimes.push(Game.getGameTimeInSeconds());
					
					// fx
					var spine = FWUtils.cloneSpine(slot.bug.spine, FWUtils.getCurrentScene());
					var pos = slot.bug.getWorldPosition();
					spine.bugId = pestId;
					spine.fxStartTime = Game.getGameTimeInSeconds();
					spine.setPosition(pos.x, pos.y);
					//spine.setAnimation(0, "bug_icon_small", true);
					spine.runAction(cc.moveTo(0.75, cc.p(pos.x + 25, pos.y)));
					spine.runAction(cc.sequence(
						cc.moveTo(0.75, cc.p(pos.x, pos.y - 125)).easing(cc.easeBounceOut()),
						cc.delayTime(0.35),
						cc.callFunc(function() {if(!Game.isFriendGarden()) Game.flyToStorage(spine);})
					));
					
					if(Game.isFriendGarden())
					{
						GardenManager.friendBugSpines.push(spine);
						
						// friend garden: check for result immediately
						var pk = network.connector.client.getOutPacket(GardenManager.RequestFriendBugCatch);
						pk.pack(slot.slotData[SLOT_PEST]);
						network.connector.client.sendPacket(pk);
					}
					
					// bug
					var slotData = CloudFloors.getSlotData(slot.floorIdx, slot.slotIdx);
					slotData[SLOT_PEST] = "";
					slot.refresh(slotData);
				}
			}
		}
		
		if(amount <= 0)
		{
			this.onFinishedCatchingBug(draggedWidget);
			FWUI.hideDraggedWidget(draggedWidget);
		}

		return true;
	},	
	
	onStartCatchingBug:function(sender)
	{
		// jira#4704
		/*if(sender.uiData.itemAmount <= 0)
		{
			// ask user to buy nets
			this.onCloseMenu();
			var netId = (Game.isFriendGarden() ? ID_NET_FRIEND : ID_NET_HOME);
			Game.showPopup0("TXT_NOT_ENOUGH_NET_TITLE", "TXT_NOT_ENOUGH_NET_CONTENT", Game.getMaterialSpriteByDefine(netId), function() {Game.openShop(netId);}, true, "TXT_BUY");
			FWUI.hideDraggedWidget();
			return;
		}*/
		
		this.catchBugSlots = [];
		this.catchBugTimes = [];
	},
	
	onFinishedCatchingBug:function(sender)
	{
		if(this.catchBugSlots && this.catchBugSlots.length > 0 && !Game.isFriendGarden())
		{
			var floors = [];
			var slots = [];
			for(var i=0; i<this.catchBugSlots.length; i++)
			{
				floors.push(this.catchBugSlots[i].floorIdx);
				slots.push(this.catchBugSlots[i].slotIdx);
			}
			
			var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlantCatchBug);
			pk.pack(floors, slots, this.catchBugTimes);
			network.connector.client.sendPacket(pk);	

			Tutorial.onGameEvent(EVT_CATCH_BUG);
		}
		delete this.catchBugSlots;
		delete this.catchBugTimes;
	},

	onMovePot2Stock:function(sender, delay)//web onMovePot2Stock:function(sender, delay = 0)
	{
		if(delay === undefined)
			delay = 0;
		
		// jira#6394
		if(this.slotData[SLOT_PLANT] !== "")
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_HARVEST_PLANT_FIRST"), FWUtils.getWorldPosition(sender), cc.WHITE);
			return;
		}
		
		if(FWUI.isShowing(UI_POT_MENU))
			this.onCloseMenu();
		
		var storage = gv.userStorages.getStorage(STORAGE_TYPE_ITEMS);
		if(storage)
		{
			var storageStatus = storage.getStorageStatus();
			if(storageStatus === STORAGE_STATUS_FULL)
			{
				// cannot move pot to stock due to full stock
				Game.showUpgradeStock("hud/icon_tab_items.png", STORAGE_TYPE_ITEMS);
				return false;
			}
			else
			{
				gv.userStorages.addItem(this.slotData[SLOT_POT], 1);
				
				// server
				if(sender !== null)
				{
					// move 1 pot to store => send command immediately
					var pk = network.connector.client.getOutPacket(CloudFloors.RequestPotStore);
					pk.pack([this.floorIdx], [this.slotIdx]);
					network.connector.client.sendPacket(pk);
				}
				
				// fx
				var spine = FWUtils.cloneSpine(this.pot.spine, FWUtils.getCurrentScene());
				spine.setPosition(this.pot.getWorldPosition());
				Game.flyToStorage(spine, delay, 0.65);
				
				// remove pot
				var slotData = CloudFloors.getSlotData(this.floorIdx, this.slotIdx);
				slotData[SLOT_POT] = "";
				this.refresh(slotData);
			}
		}
		
		return true;
	},
	
	onMoveAllPots2Stock:function(sender)
	{
		// jira#6394
		if(CloudFloors.getEmptyPotsCountOnFloor(this.floorIdx) <= 0)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_HARVEST_PLANT_FIRST"), FWUtils.getWorldPosition(sender), cc.WHITE);
			return;
		}
		
		if(FWUI.isShowing(UI_POT_MENU))
			this.onCloseMenu();

		CloudFloors.moveEmptyPots2Stock(this.floorIdx);
	},
	
	onSkipTime:function(sender, res)
	{
		var plantDefine = g_PLANT[this.slotData[SLOT_PLANT]];
		var slotData = CloudFloors.getSlotData(this.floorIdx, this.slotIdx);
		slotData[SLOT_TIME_FINISH] = Game.getGameTimeInSeconds();//slotData[SLOT_TIME_START] = Game.getGameTimeInSeconds() - plantDefine.GROW_TIME;
		this.refresh(slotData);
		
		// server
		var pk = network.connector.client.getOutPacket(CloudFloors.RequestPlantSkipTime);
		pk.pack(this.floorIdx, this.slotIdx, res.diamond);
		network.connector.client.sendPacket(pk);
		
		// jira#4633
		CloudFloors.showNextSlotSkipTime(this);
	},
	
	onUpgradePot:function(sender)
	{
		cc.log("onUpgradePot");
		Game.onCloseSkipTime(null);
		var canUpgradePot = (this.slotData[SLOT_POT] !== "" && g_POT[this.slotData[SLOT_POT]].UPGRADE_NEXT_ID.length > 0);
		if(!canUpgradePot)
			return;
		
		//this.showOverUiDelay = 0;
		if(FWUI.isShowing(UI_POT_MENU))
			this.onCloseMenu();
		UpgradePot.show(this);
	},
	
	showPotInfo:function(sender)
	{
		if(FWUI.isShowing(UI_POT_MENU))
			this.onCloseMenu();
		PotInfo.show(this.slotData[SLOT_POT]);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
//// decor ////////////////////////////////////////////////////////////////////////////	
///////////////////////////////////////////////////////////////////////////////////////

	emptyDecorSlot: null,
	decor: null,
	decorParent: null,
	decorPos: null,
	decorInitialized: false,
	
	initDecor:function()
	{
		if(this.floorIdx <= 0)//change floor if(this.floorIdx >= CloudFloors.getLastUnlockedFloorIdx())
		{
			this.emptyDecorSlot.setVisible(false);
			this.decor.setVisible(false);
			return;
		}
		
		// decor's parent is NO LONGER above slot
		//// decor's parent is above slot
		//var aboveFloorWidget = CloudFloors.firstFloorMarker.getChildByTag(this.floorIdx + 1);
		//this.decorParent = FWUI.getChildByName(aboveFloorWidget, "center");
		//this.decorPos = FWUI.getChildByName(aboveFloorWidget, "slot0" + this.slotIdx).getPosition();
		// opt var floorWidget = CloudFloors.firstFloorMarker.getChildByTag(this.floorIdx);
		this.decorParent = CloudFloors.firstFloorMarker.getChildByTag(this.floorIdx);// opt FWUI.getChildByName(floorWidget, "center");
		this.decorPos = this.decorParent.getChildByName("slot0" + this.slotIdx).getPosition();
		this.decorPos.x += DECOR_POS.x;
		this.decorPos.y += DECOR_POS.y;
		
		//this.emptyDecorSlot.initWithSpine(SPINE_EFFECT_POT_SLOT);
		//this.emptyDecorSlot.setAnimation("effect_light_icon", true);
		this.emptyDecorSlot.initWithSprite("#hud/icon_buff_bg.png");
		this.emptyDecorSlot.setParent(this.decorParent, Z_DECOR);
		this.emptyDecorSlot.setPosition(this.decorPos);
		//this.emptyDecorSlot.setScale(0.1);//this.emptyDecorSlot.setScale(1);
		this.emptyDecorSlot.customBoundingBoxes = cc.rect(-30, -10, 60, 60);
		this.emptyDecorSlot.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this));
		this.emptyDecorSlot.setDroppable(DRAG_TAG_DECOR);
		this.emptyDecorSlot.setNotifyBlockedTouch(true);
		this.emptyDecorSlot.node.setTag(-1);
		this.emptyDecorSlot.node.setOpacity(0);
		this.decorInitialized = true;
	},
	
	refreshDecor:function()
	{
		if(this.floorIdx <= 0)//change floor if(this.floorIdx >= CloudFloors.getLastUnlockedFloorIdx())
			return;
		
		if(!this.decorInitialized)
			this.initDecor();
		
		if(this.slotData[SLOT_DECOR] === "")
		{
			// no decor
			this.decor.setVisible(false);	
			this.emptyDecorSlot.setVisible(true);
		}
		else
		{
			// has decor
			this.decor.setVisible(true);	
			this.emptyDecorSlot.setVisible(false);
			
			var decorDefine = g_DECOR[this.slotData[SLOT_DECOR]];
			var gfx = Game.getItemGfxByDefine(decorDefine);
			this.decor.initWithSpine(gfx.spine);
			this.decor.setSkin(gfx.skin);
			this.decor.setAnimation("normal", true);
			this.decor.setParent(this.decorParent, Z_DECOR);
			this.decor.setPosition(this.decorPos);
			this.decor.setScale(1);
			this.decor.customBoundingBoxes = cc.rect(-40, -55, 80, 60); // opt
			this.decor.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this));
			this.decor.setDroppable(DRAG_TAG_DECOR);
			this.decor.setNotifyBlockedTouch(true);
			this.decor.node.setTag(-1);
			//this.decor.spine.setMix("normal", "touch", 0.25);
			//this.decor.spine.setMix("touch", "normal", 0.25);
		}
	},
	
	showPlaceDecorMenu:function()
	{
		// new tutor
		//if(FWUI.isShowing(UI_DECOR_PUT) || Tutorial.isPlaceDecorStep())
		if(FWUI.isShowing(UI_DECOR_PUT))
			return;
		
		if(CloudFloors.currentFloorNum + 1 !== this.floorIdx)//change floor if(CloudFloors.currentFloorNum !== this.floorIdx)
			return;
		
		// data
		var stockDecors = gv.userStorages.getAllItemOfType(defineTypes.TYPE_DECOR);
		var decorList = [];
		for(var i=0; i<stockDecors.length; i++)
		{
			var decor = stockDecors[i];
			if(decor)
				decorList.push({itemId:decor.itemId, amount:decor.itemAmount, displayAmount:"x" + decor.itemAmount, isUnlocked:true, unlockText:""});
		}
		if(decorList.length <= 0)
			decorList.push({itemId:"D0", amount:0, displayAmount:"", isUnlocked:true, unlockText:""});
		
		// def
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", color:"data.amount <= 0 ? cc.color(128, 128, 128, 255) : cc.WHITE"},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0"},
			lockedIcon:{visible:"data.isUnlocked === false"},
			lockedText:{type:UITYPE_TEXT, visible:"data.isUnlocked === false", field:"unlockText"},
			buyButton:{visible:"data.amount <= 0 && data.isUnlocked === true", onTouchEnded:this.onBuyMissingDecor.bind(this)},
			UIItem:{dragTag:DRAG_TAG_DECOR, dropOnMove:true, onDrop:this.onDropDecor.bind(this), onTouchBegan:this.onStartDroppingDecor.bind(this), onTouchEnded:this.onFinishedDroppingDecor.bind(this), dragCondition:"data.amount > 0"},
		};
		
		var uiDef =
		{
			items:{type:UITYPE_2D_LIST, items:decorList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png", itemsPosition:[[2,0],[1,0],[0,0],[1,1],[0,1]]},//items:{type:UITYPE_2D_LIST, items:decorList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png", itemsPosition:[[1,0],[0,0],[2,1],[1,1],[0,1]]},
			leftArrow:{onTouchEnded:this.onPageButton.bind(this)},
			rightArrow:{onTouchEnded:this.onPageButton.bind(this)},
			pageText:{style:TEXT_STYLE_TEXT_BUTTON_20},
			tapToClose:{onTouchEnded:this.onCloseMenu.bind(this)},
			center:{visible:true},
		};

		// align
		var pos = this.getWorldPosition();
		//pos.x -= 5;
		pos.y -= 72;//change floor pos.y += 220;
		
		// ui
		var widget = FWPool.getNode(UI_DECOR_PUT);
		FWUI.alignWidget(widget, pos, cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		this.onPageButton(null, 0);		
		
		// show over ui
		this.showOverUi(this.emptyDecorSlot);
	},
	
	showDecorMenu:function()
	{
		if(FWUI.isShowing(UI_DECOR_MENU))
			return;
		
		if(CloudFloors.currentFloorNum + 1 !== this.floorIdx)//change floor if(CloudFloors.currentFloorNum !== this.floorIdx)
			return;
		
		// def
		var floorDecorsCount = CloudFloors.getDecorsCountOnFloor(this.floorIdx);
		var uiDef =
		{
			tapToClose:{onTouchEnded:this.onCloseMenu.bind(this)},
			move2StockButton:{onTouchEnded:this.onMoveDecor2Stock.bind(this)},
			moveAll2StockButton:{onTouchEnded:this.onMoveAllDecors2Stock.bind(this), enabled:(floorDecorsCount > 0)},
			moveAll2StockCount:{type:UITYPE_TEXT, value:floorDecorsCount, shadow:SHADOW_DEFAULT},
			infoButton:{onTouchEnded:this.showDecorInfo.bind(this)},
		};
		
		// ui
		var widget = FWPool.getNode(UI_DECOR_MENU);
		FWUI.alignWidget(widget, this.decor.getWorldPosition(), cc.size(cc.winSize.width * 2, cc.winSize.height * 2), cc.p(0.5, 0.5), Z_UI_POT_MENU);
		FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE, false);
		
		// show over ui
if(cc.sys.isNative)
		this.showOverUi(this.decor);
	},
	
	onBuyMissingDecor:function(sender)
	{
		Game.openShop(sender.uiData.itemId);
		this.onCloseMenu(sender);
	},
	
	onDropDecor:function(draggedWidget, droppedWidget)
	{
		var decorId = draggedWidget.uiData["itemId"];
		
		var slot = droppedWidget.owner;
		if(slot.slotData[SLOT_DECOR] !== "")
			return false; // slot already has decor
		
		if(slot.floorIdx !== CloudFloors.currentFloorNum + 1)//change floor if(slot.floorIdx !== CloudFloors.currentFloorNum)
			return false; // jira#5057

		if(FWUI.isShowing(UI_DECOR_PUT))
		{
			this.onCloseMenu();
			gv.hintManagerNew.hideHint(HINT_TYPE_POT);
			//gv.hint.hide();
		}
		
		if(!this.dropDecorSlots)
			return false;
		
		var amount = gv.userStorages.getItemAmount(decorId);
		if(amount > 0)
		{
			// success
			gv.userStorages.removeItem(decorId, 1);
			amount--;
			
			var text = FWUI.getChildByName(draggedWidget, "amount");
			text.setString(cc.formatStr("x%s", amount));
			
			// place decor
			var slotData = CloudFloors.getSlotData(slot.floorIdx, slot.slotIdx);
			slotData[SLOT_DECOR] = decorId;
			slot.refresh(slotData);

			// add to slot
			this.dropDecorSlots.push(slot);
			
			// fx
			var spine = FWUI.getChildByName(draggedWidget, "gfx").getChildByTag(UI_FILL_DATA_TAG);
			var pos = slot.emptyDecorSlot.getWorldPosition();
			spine = FWUtils.cloneSpine(spine, FWUtils.getCurrentScene());
			pos.y += 100;
			FWUtils.flyNodeUp(spine, pos, -100, 0.75);
		}
		else // if(amount <= 0)
		{
			if(!isShowingWarningText)
			{
				FWUtils.showWarningText(FWLocalization.text("TXT_NOT_ENOUGH_DECOR"), slot.emptyDecorSlot.getWorldPosition(), cc.WHITE);
				isShowingWarningText = true;
			}
			return false;
		}

		return true;		
	},
	
	onStartDroppingDecor:function(sender)
	{
		this.dropDecorId = sender.uiData["itemId"];
		this.dropDecorSlots = [];
		isShowingWarningText = false;
		
		// TODO: show hint
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showDecorHint, 0, 0, DELAY_SHOW_HINT, false);
		//var posX = (this.getWorldPosition().x > cc.winSize.width / 2 ? 200 : cc.winSize.width - 100);
		//gv.hint.show(FWUtils.getCurrentScene(), HINT_TYPE_DECOR, sender.uiData.itemId, {posX:posX, cover:false}, Z_FX);
	},

	showDecorHint:function(dt)
	{
		if(this.dropDecorId && FWUI.isShowing(UI_DECOR_PUT))
		{
			//var widget = FWPool.getNode(UI_DECOR_PUT, false);
			var position = null;
			if(FWUI.touchedWidget){
				position = FWUI.touchedWidget.getTouchBeganPosition();
			}
			//this.currentAchievement = sender.uiData;
			gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_POT,  this.dropDecorId,position);

			//// jira#5308
			//var posX = (this.getWorldPosition().x > cc.winSize.width / 2 ? 200 : cc.winSize.width - 100);
			//var slotPosX = this.getWorldPosition().x;
			//var posX = (slotPosX > cc.winSize.width / 2 ? slotPosX - 450 : slotPosX + 340);
			//gv.hint.show(FWUtils.getCurrentScene(), HINT_TYPE_PLANT, this.dropPlantId, {posX:posX, cover:false}, Z_FX);
		}
	},
	onFinishedDroppingDecor:function(sender)
	{
		if(sender.uiData.amount <= 0)
			this.onBuyMissingDecor(sender);
		else if(this.dropDecorSlots && this.dropDecorSlots.length > 0)
		{
			var floors = [];
			var slots = [];
			for(var i=0; i<this.dropDecorSlots.length; i++)
			{
				floors.push(this.dropDecorSlots[i].floorIdx);
				slots.push(this.dropDecorSlots[i].slotIdx);
			}
			
			var pk = network.connector.client.getOutPacket(CloudFloors.RequestDecorPut);
			pk.pack(this.dropDecorId, floors, slots);
			network.connector.client.sendPacket(pk);		
		}
		delete this.dropDecorId;
		delete this.dropDecorSlots;
		gv.hintManagerNew.hideHint(HINT_TYPE_POT);
		//gv.hint.hide();
	},
	
	onMoveDecor2Stock:function(sender, delay)//web onMoveDecor2Stock:function(sender, delay = 0)
	{
		if(delay === undefined)
			delay = 0;
		
		if(FWUI.isShowing(UI_DECOR_MENU))
			this.onCloseMenu();
		
		var storage = gv.userStorages.getStorageForItemType(defineTypes.TYPE_DECOR);
		if(storage)
		{
			var storageStatus = storage.getStorageStatus();
			if(storageStatus === STORAGE_STATUS_FULL)
			{
				// cannot move decor to stock due to full stock
				Game.showUpgradeStock("hud/icon_tab_items.png", STORAGE_TYPE_ITEMS);
				return false;
			}
			else
			{
				gv.userStorages.addItem(this.slotData[SLOT_DECOR], 1);
				
				// server
				if(sender !== null)
				{
					// move 1 decor to store => send command immediately
					var pk = network.connector.client.getOutPacket(CloudFloors.RequestDecorStore);
					pk.pack([this.floorIdx], [this.slotIdx]);
					network.connector.client.sendPacket(pk);
				}
				
				// fx
				var spine = FWUtils.cloneSpine(this.decor.spine, FWUtils.getCurrentScene());
				spine.setPosition(this.decor.getWorldPosition());
				Game.flyToStorage(spine, delay, 0.65);
				
				// remove decor
				var slotData = CloudFloors.getSlotData(this.floorIdx, this.slotIdx);
				slotData[SLOT_DECOR] = "";
				this.refresh(slotData);
			}
		}
		
		return true;
	},
	
	onMoveAllDecors2Stock:function(sender)
	{
		if(FWUI.isShowing(UI_DECOR_MENU))
			this.onCloseMenu();

		CloudFloors.moveFloorDecors2Stock(this.floorIdx);
	},
	
	showDecorInfo:function(sender)
	{
		DecorInfo.show(this.slotData[SLOT_DECOR]);
		if(FWUI.isShowing(UI_DECOR_MENU))
			this.onCloseMenu();
	},
	
	// jira#5012
	showTouchFx:function()
	{
		if(this.parentNode.getNumberOfRunningActions() > 0)
			return;
		
		this.parentNode.runAction(cc.sequence
		(
			cc.scaleTo(0.12, 1, 1.2).easing(cc.easeSineOut()), 
			cc.scaleTo(0.12, 1, 1).easing(cc.easeSineIn())
		));
	}
});
