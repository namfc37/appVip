
// TODO
// - no grass => link to ibshop to buy

const DRAG_TAG_UPGRADE_POT_GRASS = "grass";

var UpgradePot =
{
	slot: null,
	grassItemId: null,
	requireItems: null,
	requireGold: null,
	srcPotWidget: null,
	dstPotWidget: null,
	grassListBg: null,
	grassSelectBg: null,
	hasEnoughItems: true,
	dstPotIdx: 0,
	potBeforeUpgrade: null,
	upgradeAnimationFinished: true,
	
	show:function(slot)
	{
		if(!this.upgradeAnimationFinished)
			return;
		
		this.slot = slot;
		var data = this.slot.slotData;
		var potDef = g_POT[data[SLOT_POT]];
		this.potBeforeUpgrade = data[SLOT_POT];
		
		// requireItems
		var requireItems = potDef.REQUIRE_ITEM;
		this.requireItems = [];
		this.hasEnoughItems = true;
		for(var key in requireItems)
		{
			var itemId = key;
			var requireAmount = requireItems[key];
			if(itemId === ID_GOLD)
			{
				this.requireGold = (Tutorial.isRunning() ? 0 : requireAmount);
				continue;
			}
			
			var stockAmount = gv.userStorages.getItemAmount(itemId);
			var isEnough = (stockAmount >= requireAmount);
			this.requireItems.push({itemId:itemId, amount:requireAmount, stockAmount:stockAmount, isEnough:isEnough, displayAmount:"/" + requireAmount});
			
			if(!isEnough)
				this.hasEnoughItems = false;
		}
		var requireItemDef = 
		{
			bg:{visible:false},
			check:{visible:false},
			requireAmount:{type:UITYPE_TEXT, field:"displayAmount", color:cc.GREEN, style:TEXT_STYLE_NUMBER},
			stockAmount:{type:UITYPE_TEXT, field:"stockAmount", color:"data.isEnough ? cc.GREEN : cc.RED", style:TEXT_STYLE_NUMBER},
			gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.9},
			buyButton:{visible:"data.isEnough === false", onTouchEnded:this.buyMissingItem.bind(this)},
			item:{onTouchEnded:this.buyMissingItem.bind(this)},
		};

		// success ratio
		var percent = potDef.UPGRADE_RATIO;
		var grassPercent = (this.grassItemId === null ? 0 : g_MATERIAL[this.grassItemId].LUCKY_PERCENT);
		var totalPercent = percent + grassPercent;
		if(gv.vipManager.check())
		{
			totalPercent+= gv.vipManager.updatePotRate;
		}
		if(totalPercent > 100)
			totalPercent = 100;
		
		var uiDef = 
		{
			closeButton:{onTouchEnded:this.hide.bind(this)},
			title:{type:UITYPE_TEXT, value:"TXT_UPPOT_TITLE", style:TEXT_STYLE_TITLE_1},
			totalPercent:{type:UITYPE_PROGRESS_BAR, value:totalPercent},
			percent:{type:UITYPE_PROGRESS_BAR, value:percent},
			percentText:{type:UITYPE_TEXT, value:percent + "%" + (grassPercent > 0 ? " + " + grassPercent + "%" : ""), style:TEXT_STYLE_NUMBER},
			slotBg:{onTouchEnded:this.onSelectGrass.bind(this), dropTag:DRAG_TAG_UPGRADE_POT_GRASS},
			slotItem:{visible:this.grassItemId !== null, type:UITYPE_ITEM, value:this.grassItemId},
			slotNoItem:{enabled:false, visible:this.grassItemId === null},
			slotAddItem:{onTouchEnded:this.onSelectGrass.bind(this), visible:this.grassItemId === null},
			requireText:{type:UITYPE_TEXT, value:"TXT_UPPOT_MATERIAL"},
			requireItems:{type:UITYPE_2D_LIST, items:this.requireItems, itemUI:UI_ORDER_REQUEST_ITEM, itemDef:requireItemDef, itemSize:cc.size(100, 100), itemsPosition:[[1,0],[2,0],[0,0],[1,1],[2,1],[0,1]]},
			upgradeButton:{onTouchEnded:this.onUpgrade.bind(this)},
			upgradePrice:{type:UITYPE_TEXT, value:this.requireGold > 0 ? this.requireGold : "TXT_FREE", style:TEXT_STYLE_TEXT_BUTTON, color:this.requireGold <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND},
			grassSelectBg:{onTouchEnded:this.hideGrassSelection.bind(this)},
			hintText:{type:UITYPE_TEXT, value:"TXT_UPPOT_HINT", style: TEXT_STYLE_TEXT_DIALOG},
			textVipValue: { type: UITYPE_TEXT, value:" + "+ gv.vipManager.updatePotRate + "%", style: TEXT_STYLE_TEXT_NORMAL_GREEN ,visible:gv.vipManager.check()},
			imgIconBuffVip:{type:UITYPE_IMAGE, value:gv.vipManager.iconBuffVip,scale:0.4},
			panelVipPercent:{position:grassPercent>0? cc.p(255,57):cc.p(220,57),visible:false},
			hintLuckyGrass:{visible:false},
			lb_hint:{type:UITYPE_TEXT, value:"TXT_LUCKY_GRASS_HINT", style: TEXT_STYLE_TEXT_DIALOG},
			barBg:{onTouchBegan: function(){var widget = FWPool.getNode(UI_POT_UPGRADE, false); this.showHint(widget, "hintLuckyGrass")}.bind(this), onTouchEnded: function(){var widget = FWPool.getNode(UI_POT_UPGRADE, false); this.hideHint(widget, "hintLuckyGrass")}.bind(this), forceTouchEnd: true },
		};
		
		var widget = FWPool.getNode(UI_POT_UPGRADE, false);


		this.percentText=FWUtils.getChildByName(widget, "percentText");
		this.textVipValue=FWUtils.getChildByName(widget, "textVipValue");
		this.imgIconBuffVip=FWUtils.getChildByName(widget, "imgIconBuffVip");

		//this.textVipValue.setPositionX(6+this.percentText.getVirtualRendererSize().width/2);
		if(FWUI.isWidgetShowing(widget)) {

			FWUI.fillData(widget, null, uiDef);
		}else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Tutorial.isMainTutorialFinished() ? Z_UI_POT_UPGRADE : Z_UI_COMMON);

			this.srcPotWidget = FWUtils.getChildByName(widget, "pot1");
			this.dstPotWidget = FWUtils.getChildByName(widget, "pot2");
			this.grassListBg = FWUtils.getChildByName(widget, "grassListBg");
			this.grassSelectBg = FWUtils.getChildByName(widget, "grassSelectBg");
			this.grassListBg.setVisible(false);
			this.grassSelectBg.setVisible(false);

			this.dstPotIdx = 0;
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 1, false);
			
			// TODO: remove
			/*gv.userStorages.addItem("M20", 1);
			gv.userStorages.addItem("M21", 2);
			gv.userStorages.addItem("M22", 3);
			gv.userStorages.addItem("M33", 4);
			gv.userStorages.addItem("M34", 5);
			gv.userStorages.addItem("M35", 6);*/


			/// TEST
			//cc.log("NAM TEST GET SIZE LABEL percentText :"+this.percentText.getVirtualRendererSize().width );





			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		//var positionPercent = _.clone(this.percentText.getPositionX());
		if(gv.vipManager.check())
		{
			this.percentText.setPositionX(FWUtils.getChildByName(widget, "barBg").getContentSize().width/2 +6- this.textVipValue.getVirtualRendererSize().width/2);
			this.textVipValue.setPositionX(this.percentText.getPositionX()+this.percentText.getVirtualRendererSize().width/2 + this.textVipValue.getVirtualRendererSize().width/2);
			this.imgIconBuffVip.setPositionX(this.textVipValue.getVirtualRendererSize().width + this.imgIconBuffVip.getScale()*this.imgIconBuffVip.getContentSize().width/3);
		}
		else
		{
			this.percentText.setPositionX(FWUtils.getChildByName(widget, "barBg").getContentSize().width/2 +6);
		}

		this.showPotInfo(this.srcPotWidget, potDef);
		//this.showPotInfo(this.dstPotWidget, g_POT[potDef.UPGRADE_NEXT_ID[0]], potDef);
		if(Tutorial.currentStep && Tutorial.currentStep.id === TUTO2_STEP_7_POT2)
		{
			this.showPotInfo(this.dstPotWidget, g_POT.P4, potDef);
		}
		else
		{
			this.showPotInfo(this.dstPotWidget, g_POT[potDef.UPGRADE_NEXT_ID[0]], potDef);
		}

	},
	
	hide:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		FWUI.hide(UI_POT_UPGRADE, UIFX_POP);
		FWUI.unfillData(this.srcPotWidget);
		FWUI.unfillData(this.dstPotWidget);
		this.grassItemId = null;
		
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	update:function(dt)
	{
		// show possible destination pots
		var potDef = g_POT[this.slot.slotData[SLOT_POT]];
		var possibleDstPots = potDef.UPGRADE_NEXT_ID;
		if(possibleDstPots.length > 1)
		{
			this.dstPotIdx++;
			if(this.dstPotIdx >= possibleDstPots.length)
				this.dstPotIdx = 0;
			this.showPotInfo(this.dstPotWidget, g_POT[possibleDstPots[this.dstPotIdx]], potDef);
		}
	},
	
	showPotInfo:function(widget, potInfo, compareInfo)
	{
		var timeUp = (compareInfo !== undefined && compareInfo.TIME_DECREASE_DEFAULT < potInfo.TIME_DECREASE_DEFAULT);
		var bugUp = (compareInfo !== undefined && compareInfo.BUG_APPEAR_RATIO < potInfo.BUG_APPEAR_RATIO);
		var expUp = (compareInfo !== undefined && compareInfo.EXP_INCREASE < potInfo.EXP_INCREASE);
		var goldUp = (compareInfo !== undefined && compareInfo.GOLD_INCREASE < potInfo.GOLD_INCREASE);
		
		var uiDef = 
		{
			name:{type:UITYPE_TEXT, value:Game.getItemName(potInfo.ID), style:TEXT_STYLE_TEXT_NORMAL},
			fx:{type:UITYPE_SPINE, value:SPINE_EFFECT_POT_SLOT, anim:"effect_light_icon", scale:0.8, visible:compareInfo !== undefined},
			gfx:{type:UITYPE_ITEM, value:potInfo.ID},
			time:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"-" + potInfo.TIME_DECREASE_DEFAULT + "s", color:timeUp ? cc.GREEN : cc.WHITE},
			bug:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"+" + potInfo.BUG_APPEAR_RATIO + "%", color:bugUp ? cc.GREEN : cc.WHITE},
			exp:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"+" + potInfo.EXP_INCREASE, color:expUp ? cc.GREEN : cc.WHITE},
			gold:{type:UITYPE_TEXT, style:TEXT_STYLE_NUMBER, value:"+" + potInfo.GOLD_INCREASE + "%", color:goldUp ? cc.GREEN : cc.WHITE},
			timeUp:{visible:timeUp},
			bugUp:{visible:bugUp},
			expUp:{visible:expUp},
			goldUp:{visible:goldUp},
			potClass:{visible:false},
			infoButton:{onTouchEnded:this.showPotInfo_full.bind(this)},

			timeBg: { onTouchBegan: function(sender) {this.showHint (widget, "timeHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "timeHint");}.bind(this), forceTouchEnd: true },//web
			bugBg: { onTouchBegan: function(sender) {this.showHint (widget, "bugHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "bugHint");}.bind(this), forceTouchEnd: true },//web
			expBg: { onTouchBegan: function(sender) {this.showHint (widget, "expHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "expHint");}.bind(this), forceTouchEnd: true },//web
			goldBg:{visible:false},//jira#5688 goldBg: { onTouchBegan: function(sender) {this.showHint (widget, "goldHint"), onTouchEnded: function(sender) {this.hideHint (widget, "goldHint"), forceTouchEnd: true },
			timeIcon: { onTouchBegan: function(sender) {this.showHint (widget, "timeHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "timeHint");}.bind(this), forceTouchEnd: true },//web
			bugIcon: { onTouchBegan: function(sender) {this.showHint (widget, "bugHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "bugHint");}.bind(this), forceTouchEnd: true },//web
			expIcon: { onTouchBegan: function(sender) {this.showHint (widget, "expHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "expHint");}.bind(this), forceTouchEnd: true },//web
			goldIcon: { onTouchBegan: function(sender) {this.showHint (widget, "goldHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint (widget, "goldHint");}.bind(this), forceTouchEnd: true },//web
			timeHint: { visible: false },
			bugHint: { visible: false },
			expHint: { visible: false },
			goldHint: { visible: false },
			timeHintText: { type: UITYPE_TEXT, value:"TXT_POTINFO_HINT_TIME", style: TEXT_STYLE_TEXT_DIALOG },
			bugHintText: { type: UITYPE_TEXT, value:"TXT_POTINFO_HINT_BUG", style: TEXT_STYLE_TEXT_DIALOG },
            expHintText: { type: UITYPE_TEXT, value:"TXT_POTINFO_HINT_EXP", style: TEXT_STYLE_TEXT_DIALOG },
			goldHintText: { type: UITYPE_TEXT, value:"TXT_POTINFO_HINT_GOLD", style: TEXT_STYLE_TEXT_DIALOG }
		};
		
		FWUI.fillData(widget, null, uiDef);
		FWUtils.getChildByName(widget, "infoButton").potInfo = potInfo;
	},
	
	onUpgrade:function(sender)
	{
		// check if enough items
		if(gv.userData.getGold() < this.requireGold)
		{
			Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
			return;
		}
		var fullRequireItems = this.requireItems.concat([{itemId:ID_GOLD, amount:this.requireGold , requireAmount: this.requireGold}]);
		var pos = this.slot.getWorldPosition(); // jira#4685
		pos.y += 100;
		if(!Game.consumeItems(fullRequireItems, pos))
		{
			Game.showQuickBuy(this.requireItems, function() {UpgradePot.show(UpgradePot.slot);});
			return;
		}
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestPotUpgrade);
		pk.pack(this.slot.floorIdx, this.slot.slotIdx, this.grassItemId ? this.grassItemId : "");
		network.connector.client.sendPacket(pk);
		
		this.hide();
		this.upgradeAnimationFinished = false;
	},
	
	onSelectGrass:function(sender, force)//web onSelectGrass:function(sender, force = false)
	{
		if(force === undefined)
			force = false;
		
		if(this.grassSelectBg.isVisible() && !force)
			return;
		
		// remove old grass
		this.grassItemId = null;
		this.show(this.slot);
		
		// grass list
		var grassList = Game.getMaterialsBySubtype(defineTypes.SUB_TYPE_GREEN_GRASS);
		
		// def
		// jira#4740
		//var itemDef =
		//{
		//	gfx:{type:UITYPE_ITEM, field:"itemId"},
		//	amount:{type:UITYPE_TEXT, field:"amount", format:"x%s", shadow:SHADOW_DEFAULT},
		//	item:{dragTag:DRAG_TAG_UPGRADE_POT_GRASS, dropOnMove:false, onDrop:this.onDropGrassOnSlot.bind(this)}, // adjust bounding rect if set dropOnMove = true
		//};
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId", color:"data.amount <= 0 ? cc.color(96, 96, 96, 255) : cc.WHITE"},
			amount:{type:UITYPE_TEXT, field:"amount", format:"x%s", style:TEXT_STYLE_NUMBER, visible:"data.amount > 0"},
			lockedIcon:{visible:false},
			lockedText:{visible:false},
			buyButton:{visible:"data.amount <= 0", onTouchEnded:this.onBuyMissingGrass.bind(this)},
			
			// jira#5685: touch to select, instead of drag/drop
			//UIItem:{dragTag:DRAG_TAG_UPGRADE_POT_GRASS, dropOnMove:false, onDrop:this.onDropGrassOnSlot.bind(this), dragCondition:"data.amount > 0"},
			UIItem:{onTouchEnded:this.onDropGrassOnSlot.bind(this), onTouchBegan:this.showItemHint.bind(this),callBackTouchCancel:this.hideItemHint.bind(this),isCallBackTouchCancel:true,}, // jira#5725: added onTouchBegan to disable hint
		};
		var uiDef =
		{
			// jira#4740
			//grassList:{type:UITYPE_2D_LIST, items:grassList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPosition:[[1,0],[2,0],[0,1],[1,1],[2,1]], itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png"},
			grassList:{type:UITYPE_2D_LIST, items:grassList, itemUI:UI_PLANT_ITEM, itemDef:itemDef, itemSize:cc.size(100, 100), itemsPosition:[[1,0],[2,0],[0,1],[1,1],[2,1]], itemsPerPage:5, itemBackground:"#hud/menu_list_slot.png"},
			// jira#5671
			//pageButton:{onTouchEnded:this.onPageButton.bind(this)},
			leftArrow:{onTouchEnded:this.onPageButton.bind(this)},
			rightArrow:{onTouchEnded:this.onPageButton.bind(this)},
			pageText:{style:TEXT_STYLE_TEXT_BUTTON},//pageText:{shadow:SHADOW_DEFAULT},
		};
		
		FWUI.fillData(this.grassListBg, null, uiDef);
		if(!this.grassSelectBg.isVisible())
		{
			this.grassSelectBg.setVisible(true);
			this.grassListBg.setVisible(true);
			this.grassListBg.setScale(UISCALE_INITIAL);
			this.grassListBg.runAction(cc.scaleTo(UISCALE_DURATION, 1));
			this.onPageButton(null, 0);		
		}
	},
	showItemHint:function(sender)
	{
		//if(this.isShowingHint) return;
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		var name = sender.getName();
		var id = null;
		if(name == "slotItemGrass")
		{
			id = this.data.selectedGrass;
		}
		else if (name == "slotItemGlove")
		{
			id = this.data.selectedGlove;
		}
		else
		{
			id = sender.uiData.id || sender.uiData.potId || sender.uiData.itemId;
		}
		if(id)
		{
			gv.hintManagerNew.show(null, null,id, position);
			this.isShowingHint = true;
		}
	},
	hideItemHint:function(sender){
		gv.hintManagerNew.hideAllHint();
	},
	onBuyMissingGrass:function(sender)
	{
		//this.hide(); feedback: do not hide
		Game.openShop(sender.uiData.itemId, this.onHideShop.bind(this));
	},
	
	onHideShop:function()
	{
		this.onSelectGrass(null, true);
	},
	
	onDropGrassOnSlot:function(sender)
	{
		gv.hintManagerNew.hideAllHint();
		if(sender.uiData.amount <= 0)
			return false;
		
		this.grassItemId = sender.uiData.itemId;
		this.hideGrassSelection();
		this.show(this.slot);
		return true;
	},
	
	onPageButton:function(sender, offset)//web onPageButton:function(sender, offset = 1)
	{
		if(offset === undefined)
			offset = 1;
		
		// jira#5671
		if(offset === 1)
		{
			if(sender.getName() === "leftArrow")
				offset = -1;
			else
				offset = 1;
		}
		
		var items = FWUI.getChildByName(this.grassListBg, "grassList");
		var pageButton = FWUI.getChildByName(this.grassListBg, "pageButton");
		if(items.uiPagesCount > 1)
		{
			pageButton.setVisible(true);
			var pageText = FWUI.getChildByName(this.grassListBg, "pageText");
			if(offset === 0)
				pageText.setString((items.uiCurrentPage + 1) + "/" + items.uiPagesCount);
			else
				pageText.setString(FWUI.set2dlistPage(items, offset, true));
		}
		else
			pageButton.setVisible(false);		
	},
	
	hideGrassSelection:function(sender)
	{
		FWUI.hideDraggedWidget(FWUI.draggedWidget);
		this.grassSelectBg.setVisible(false);
		this.grassListBg.runAction(cc.sequence(cc.scaleTo(UISCALE_DURATION, UISCALE_INITIAL), cc.callFunc(function() {UpgradePot.grassListBg.setVisible(false);})));
	},
	
	showPotInfo_full:function(sender)
	{
		PotInfo.show(sender.potInfo.ID);
	},
	
	buyMissingItem:function(sender)
	{
		if(sender.uiData.isEnough)
			return;
		Game.showQuickBuy([{itemId:sender.uiData.itemId, amount:sender.uiData.amount}], function() {UpgradePot.show(UpgradePot.slot);});
	},
	
	showResult:function()
	{
		// jira#4900
		var parent = CloudFloors.firstFloorMarker;
		var pos = this.slot.getWorldPosition();
		pos = parent.convertToNodeSpace(pos);

		// jira#5028
		pos.y -= 50;
		var spine = FWUtils.showSpine(SPINE_EFFECT_UNLOCK, null, "effect_unlock_pot_win", false, parent, pos, Z_FX);
		spine.setScale(0.75);
		
		// jira#4894
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.showResult2, 0, 0, 1, false);

		var potAfterUpgrade = this.slot.slotData[SLOT_POT];
		AudioManager.effect ((potAfterUpgrade === this.potBeforeUpgrade) ? EFFECT_UPGRADE_FAIL_2 : EFFECT_UPGRADE_SUCCESS_2);
	},
	
	showResult2:function()
	{
		this.upgradeAnimationFinished = true;
		var potAfterUpgrade = this.slot.slotData[SLOT_POT];
		var parent = CloudFloors.firstFloorMarker;
		var pos = this.slot.getWorldPosition();
		pos = parent.convertToNodeSpace(pos);
		
		if(potAfterUpgrade === this.potBeforeUpgrade)
		{
			// failed
			var spine = FWUtils.showSpine(SPINE_EFFECT_POT_SLOT, null, "effect_pot_upgrade_fail", false, parent, pos, Z_FX);
			spine.setScale(1.25);
			Achievement.onAction(g_ACTIONS.ACTION_POT_UPGRADE_FAIL.VALUE, null, 1);
		}
		else
		{
			// success
			var spine2 = FWUtils.showSpine(SPINE_EFFECT_POT_SLOT, null, "effect_pot_upgrade_success_2", false, parent, pos, Z_FX + 1);
			spine2.setScale(1.25);
			Achievement.onAction(g_ACTIONS.ACTION_POT_UPGRADE_SUCCESS.VALUE, this.potBeforeUpgrade, 1);
			
			var comboId = g_POT[potAfterUpgrade].COMBO_ID;
			if(comboId === "CP5" || comboId === "CP6" || comboId === "CP7" || comboId === "CP8" || comboId === "CP9" || comboId === "CP10")
			{
				var combo = g_COMBO[comboId];
				if(combo.CHILDREN.length === 6 && combo.CHILDREN[5] === potAfterUpgrade)
					cc.director.getScheduler().scheduleCallbackForTarget(this, this.showResult3, 0, 0, 1, false);
			}
		}
	},
	
	showResult3:function()
	{
		Game.shouldShowRatingPopup = true;
	},

	showHint:function(widget, name, show)//web showHint:function(widget, name, show = true)
	{
		if(show === undefined)
			show = true;
		
		var hint = FWUtils.getChildByName(widget, name);
		if(show)
		{
			hint.setVisible(true);
			hint.stopAllActions();
			hint.setScale(0);
			hint.runAction(cc.scaleTo(0.15, 1));
		}
		else
		{
			hint.stopAllActions();
			hint.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(function() {hint.setVisible(false);})));
		}
	},
	
	hideHint:function(widget, name)
	{
		this.showHint(widget, name, false);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestPotUpgrade:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.POT_UPGRADE);},
		pack:function(floor, slot, greenGrass)
		{
			FWUtils.disableAllTouches();
			
			addPacketHeader(this);

			PacketHelper.putByte(this, KEY_FLOOR, floor);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			PacketHelper.putString(this, KEY_GREEN_GRASS, greenGrass);
			
			
			addPacketFooter(this);
		},
	}),
	
	ResponsePotUpgrade:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(!Tutorial.currentStep) // jira#5655
				FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			CloudFloors.updateFloorDataFromServer(object);
			Game.updateUserDataFromServer(object);
			UpgradePot.showResult();
			if(this.getError() !== 0)
				cc.log("UpgradePot.ResponsePotUpgrade: error=" + this.getError());
			else
				Achievement.onAction(g_ACTIONS.ACTION_POT_UPGRADE.VALUE, UpgradePot.potBeforeUpgrade, 1);
		}
	}),					
};

network.packetMap[gv.CMD.POT_UPGRADE] = UpgradePot.ResponsePotUpgrade;
