
var Airship =
{
	state: AIRSHIP_STATUS_LOCK,
	skipTimeWidget: null,
	skipTimeLabel: null,
	skipTimeData: null,
	arrivalTime: 0,
	leavingTime: 0,
	itemList: null,
	data: null,
	slotList: null,
	rewardList: null,
	friendId: null,
	friendData: null,
	packedCount: 0,
	currentSlot: null,
	repairItemList: null,
	repairGold: 0,
	boughtItemToDeliver: false, // jira#4751
	showSkipRepairingTimeButton: false, // jira#5315

	airshipMarker: null,
	airshipUnlock: null,
	airship: null,
	stone: null,
	
	init:function()
	{
		this.airshipMarker = FWUtils.getChildByName(Game.gameScene.background, "markerAirship");
		this.airshipMarker.setVisible(true);

		this.airshipUnlock = FWUtils.getChildByName(this.airshipMarker, "notifyAirshipUnlock");
        this.airshipUnlock.setVisible(true);
		
		this.setData(gv.userData.airship);
		if(!Game.isFriendGarden() || gv.userData.userId !== USER_ID_JACK)
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
		
		cc.log("Airship::init: airship data: " + JSON.stringify(gv.userData.airship));

		// TODO: remove fake data
		/*var slots = [];
		for(var i=0; i<2; i++)
		{
			var slot = {};
			slot[AS_SLOT_IS_PACKED] = false;
			slot[AS_SLOT_IS_REQUEST] = false;
			slot[AS_SLOT_ITEM] = "T" + i;
			slot[AS_SLOT_NUM] = i + 1;
			slot[AS_SLOT_HELPER_ID] = "";
			slot[AS_SLOT_HELPER_AVATAR] = "";
			slot[AS_SLOT_REWARD_ITEMS] = {GOLD:100, EXP:10};
			slot[AS_SLOT_EVENT_ITEMS] = {P0:1};
			slots.push(slot);
		}
		this.data[AS_SLOTS] = slots;*/
	},
	
	uninit:function()
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		if(this.airship)
		{
			this.airship.uninit();
			this.stone.uninit();
			this.airship = this.stone = null;
		}
		if (this.skipTimeWidget) {
			FWUI.hideWidget(this.skipTimeWidget, UIFX_POP);
			this.skipTimeWidget = null;
		}
		this.friendId = null;
	},
	
	setData:function(data)
	{
		this.data = data;
		
		var status = this.data[AS_STATUS];
		if(status === AIRSHIP_STATUS_UNLOCK || status === AIRSHIP_STATUS_INACTIVE)
		{
			this.leavingTime = this.data[AS_TIME_START];//this.leavingTime = Game.getGameTimeInSeconds();
			this.arrivalTime = this.data[AS_TIME_FINISH];
		}
		else if(status === AIRSHIP_STATUS_ACTIVE)
		{
			this.arrivalTime = this.data[AS_TIME_START];//this.arrivalTime = Game.getGameTimeInSeconds();
			this.leavingTime = this.data[AS_TIME_FINISH];
		}
	},
	
	update:function(dt)
	{
		var time = Game.getGameTimeInSeconds();
		var status = this.data[AS_STATUS];
		if(status === AIRSHIP_STATUS_ACTIVE && time > this.leavingTime)
			this.onDeliver();
		else if(status === AIRSHIP_STATUS_INACTIVE && time > this.arrivalTime && !FWUI.isShowing(UI_AIRSHIP_NEXTTIME)
			&& !Game.isFriendGarden()) // friend: do not arrive, wait for logging in
		{
			this.onArrive();
			this.refreshAirship();
		}
	
		if(this.airship && this.airship.isVisible() && this.airship.isAnimating === false && status !== AIRSHIP_STATUS_ACTIVE)
			this.airship.setVisible(false);
		
		// uncomment and set update timer to 0 to debug
		//this.airship.drawBoundingBoxes();
		//this.stone.drawBoundingBoxes();
	},
	
	show:function(sender)
	{
		var status = this.data[AS_STATUS];
		if(this.isFriendAirship() && status !== AIRSHIP_STATUS_ACTIVE)
		{
			if(!Game.isFriendGarden())
			{
				cc.log("Airship::show: error: attempt to show friend's airship which is not active");
				this.hide();
				// jira#6388
				//var displayInfo = {title:"TXT_AS_FRIEND_DONE_TITLE", content:"TXT_AS_FRIEND_DONE_CONTENT", closeButton:true, avatar:NPC_AVATAR_PEOPEO};
				//Game.showPopup(displayInfo);
				var pos = (sender ? FWUtils.getWorldPosition(sender) : cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
				FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_DONE_CONTENT"), pos);
			}
			return false;
		}

		if(gv.userData.getLevel() < g_MISCINFO.AS_UNLOCK_LEVEL)
		{
			this.showUnlockInfo();
			return false;
		}

		if(status === AIRSHIP_STATUS_LOCK)
		{
			this.showRepairInfo();
			return false;
		}

		if(status === AIRSHIP_STATUS_UNLOCK)
		{
			this.showSkipRepairingTimeButton = !this.showSkipRepairingTimeButton;
			this.refreshUIMain();
			return false;
		}

		if(status === AIRSHIP_STATUS_LIMIT)
		{
			var displayInfo = {title:"TXT_AS_LIMIT_TITLE", content:"TXT_AS_LIMIT_CONTENT", closeButton:true, avatar:NPC_AVATAR_PEOPEO};
			Game.showPopup(displayInfo);
			return false;
		}
		
		Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "airship");

		// show main ui of airship
		this.updateSlotList();

		if(status === AIRSHIP_STATUS_INACTIVE)
		{
			this.showNextInfo();
			return false;
		}
		
		// jira#5609
		this.hideSlotInfo();

		// jira#4664 sort
		// jira#4808: sorting is now serverside
		// var slotList = _.sortByDecent(this.slotList, function (val)
		// {
			// return val[AS_SLOT_ITEM];
		// });
		var slotList = this.slotList;
		
		var itemDef =
		{
			cargo:{type:UITYPE_SPINE, value:SPINE_HUD_AIRSHIP_CARRET_ANIM, animField:"anim"},
			gfx:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_ITEM, field:AS_SLOT_ITEM, scale:0.75},
			requireAmount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, color:cc.GREEN},//amount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, color:"data.isEnough ? cc.GREEN : cc.RED"},
			stockAmount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED"},//amount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, color:"data.isEnough ? cc.GREEN : cc.RED"},
			check:{visible:false},
			avatarFrame:{visible:"data[AS_SLOT_IS_PACKED] === true && data[AS_SLOT_IS_REQUEST] === true && data[AS_SLOT_HELPER_ID]"},
			avatar:{visible:"data[AS_SLOT_IS_PACKED] === true && data[AS_SLOT_IS_REQUEST] === true && data[AS_SLOT_HELPER_ID]", type:UITYPE_IMAGE, field:AS_SLOT_HELPER_AVATAR, size:64},
			touch:{onTouchEnded:this.showSlotInfo.bind(this)},
		};
		
		var rewardItemDef =
		{
			item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT},
			iconVip:{type:UITYPE_IMAGE,visible:gv.vipManager.check()&&"data.itemId === ID_GOLD",value:gv.vipManager.iconBuffVip,size:55}
		};

		var avatar;
		if(this.isFriendAirship()) {
			if (this.friendId === USER_ID_JACK)
				avatar = "hud/hud_avatar_jack.png";
			else if(Game.isFriendGarden())
				avatar = Game.getFriendAvatarById(this.friendId);
			else
				avatar = this.friendData[NB_SLOT_USER_AVATAR];
		}

		var uiDef =
		{
			closeButton:{onTouchEnded:this.hide.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:slotList, itemUI:UI_AIRSHIP_ITEM, itemDef:itemDef, itemSize:cc.size(140, 210)},//itemList:{type:UITYPE_2D_LIST, items:this.slotList, itemUI:UI_AIRSHIP_ITEM, itemDef:itemDef, itemSize:cc.size(140, 210)},
			cover1:{visible:this.slotList.length < 5},
			cover2:{visible:this.slotList.length < 9},
			flyawayText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL_GREEN, value:"TXT_AS_FLY_AWAY"},//flyawayText:{type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:"TXT_AS_FLY_AWAY"},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:this.arrivalTime, endTime:this.leavingTime, countdown:true, onFinished:this.onDeliver.bind(this)},
			receiveText:{visible:this.isFriendAirship() === false, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, value:"TXT_AS_REWARD_ALL"},//receiveText:{visible:this.isFriendAirship() === false, type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:"TXT_AS_REWARD_ALL"},
			requireList:{visible:this.isFriendAirship() === false, type:UITYPE_2D_LIST, items:this.rewardList, itemUI:UI_ITEM_NO_BG3, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
			bg8:{visible:this.isFriendAirship() === false},
			bg9:{visible:this.isFriendAirship() === false},
			deliverButton:{visible:this.isFriendAirship() === false && this.packedCount > 0, onTouchEnded:this.onDeliver.bind(this)},
			deliverText:{type:UITYPE_TEXT, value:"TXT_AS_DELIVER", style:TEXT_STYLE_TEXT_BUTTON},//deliverText:{type:UITYPE_TEXT, value:"TXT_AS_DELIVER", shadow:SHADOW_DEFAULT},
			cancelButton:{visible:this.isFriendAirship() === false && this.packedCount <= 0, onTouchEnded:this.onCancel.bind(this)},
			cancelText:{type:UITYPE_TEXT, value:"TXT_AS_CANCEL", style:TEXT_STYLE_TEXT_BUTTON},//cancelText:{type:UITYPE_TEXT, value:"TXT_AS_CANCEL", shadow:SHADOW_DEFAULT},
			npc2:{type:UITYPE_SPINE, value:SPINE_AIRSHIP, anim:"airship_idle_fly", scale:0.25},
			//panelFriendAirship:{visible:this.isFriendAirship() && !Game.isFriendGarden()},
			panelFriendAirship:{visible:false},
			avatarFriend:{visible:this.isFriendAirship() && !Game.isFriendGarden(),type:UITYPE_IMAGE, value:avatar, size:90},
			panelTouchLeft:{visible:this.isFriendAirship() && !Game.isFriendGarden() && NewsBoard.airshipData.length > 1, onTouchEnded:this.onChangeFriend.bind(this)},
			panelTouchRight:{visible:this.isFriendAirship() && !Game.isFriendGarden() && NewsBoard.airshipData.length > 1, onTouchEnded:this.onChangeFriend.bind(this)},
		};
		
		var widget = FWPool.getNode(UI_AIRSHIP, false);
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_AIRSHIP);
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}
		
		this.checkAllSlotsPacked();
		
		// xiao's feedback: automatically resize reward panel
		var bg8 = FWUtils.getChildByName(widget, "bg8");
		if(this.rewardList.length<=4)//if(this.rewardList.length<=5)
		{
			bg8.setContentSize(cc.size(this.rewardList.length * 90 + 25, 100));
		}
		else
		{
			bg8.setContentSize(cc.size(440, 100));//bg8.setContentSize(cc.size(475, 100));
		}

		return true;
	},
	
	showNextInfo:function()
	{
		// jira#4664
		// jira#4808: sorting is now serverside
		var itemList = {};
		for(var i=0; i<this.slotList.length; i++)
			itemList[this.slotList[i][AS_SLOT_ITEM]] = 1;
		itemList = FWUtils.getItemsArray(itemList);
		// itemList = _.sortByDecent(itemList, function(val)
		// {
			// return val.itemId;
		// });
		
		// def
		var itemsPerPage = 6;
		var itemDef =
		{
			gfx:{type:UITYPE_ITEM, field:"itemId"},//gfx:{type:UITYPE_ITEM, field:AS_SLOT_ITEM},
			amount:{visible:false},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT},
		};
		var uiDef =
		{
			npc:{type:UITYPE_IMAGE,value:NPC_AVATAR_PEOPEO},
			title:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_TITLE", style:TEXT_STYLE_TEXT_NORMAL_GREEN},//title:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_TITLE", shadow:SHADOW_DEFAULT},
			title2:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_CONTENT", style:TEXT_STYLE_TEXT_NORMAL_GREEN},//title2:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_CONTENT", shadow:SHADOW_DEFAULT},
			skipTimePrice:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_BUTTON},//skipTimePrice:{type:UITYPE_TEXT, value:"", shadow:SHADOW_DEFAULT},
			closeButton:{onTouchEnded:this.hideNextInfo.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},//itemList:{type:UITYPE_2D_LIST, items:this.slotList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
			nextPage:{visible:itemList.length > itemsPerPage},//nextPage:{visible:this.slotList.length > itemsPerPage},
			prevPage:{visible:itemList.length > itemsPerPage},//prevPage:{visible:this.slotList.length > itemsPerPage},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:this.leavingTime, endTime:this.arrivalTime, countdown:true, onFinished:function() {Airship.hideNextInfo();Airship.onArrive();Airship.refreshAirship();}, onTick:this.updateSkipTimeDiamond.bind(this)},
			skipTimeButton:{onTouchEnded:this.skipTime.bind(this)},
		};

		// ui
		var widget = FWUI.showWithData(UI_AIRSHIP_NEXTTIME, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
		widget.setLocalZOrder(Z_UI_AIRSHIP);
		this.skipTimeLabel = FWUtils.getChildByName(widget, "skipTimePrice");
		
		if(!this.hideFunc5)
			this.hideFunc5 = function() {this.hideNextInfo()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc5);
	},
	
	hide:function()
	{
		if(FWUI.isShowing(UI_AIRSHIP))
		{
			FWUI.hide(UI_AIRSHIP, UIFX_POP);
			AudioManager.effect (EFFECT_POPUP_CLOSE);
			Game.gameScene.unregisterBackKey(this.hideFunc);
		}
		
		// jira#5304
		var openNewsBoard = (this.isFriendAirship() === true && !Game.isFriendGarden());
		
		this.setData(gv.userData.airship);
		this.friendId = null;
		this.refreshUIMain();
		
		if(openNewsBoard)//if(this.isFriendAirship())
			NewsBoard.showAirship();
	},
	
	hideNextInfo:function()
	{
		if(FWUI.isShowing(UI_AIRSHIP_NEXTTIME))
		{
			FWUI.hide(UI_AIRSHIP_NEXTTIME, UIFX_POP);	
			Game.gameScene.unregisterBackKey(this.hideFunc5);
		}
	},
	
	updateSlotList:function(reload)//web updateSlotList:function(reload = true)
	{
		if(reload === undefined)
			reload = true;
		
		// slots
		if(reload)
			this.slotList = this.data[AS_SLOTS];
		this.rewardList = [];
		this.packedCount = 0;
		if(!this.slotList || this.slotList.length <= 0)
			return;
		
		// additional display info
		for(var i=0; i<this.slotList.length; i++)
		{
			var slot = this.slotList[i];
			slot.index = i;
			
			if(slot[AS_SLOT_IS_PACKED] === true)
				// jira#5528
				//slot.anim = (slot[AS_SLOT_IS_REQUEST] === true && slot[AS_SLOT_HELPER_ID] ? "carret_friend_done" : "carret_normal_done");
				slot.anim = (slot[AS_SLOT_IS_REQUEST] === true ? "carret_friend_done" : "carret_normal_done");
			else
				slot.anim = (slot[AS_SLOT_IS_REQUEST] === true ? "carret_friend" : "carret_normal");
			
			slot.amount = gv.userStorages.getItemAmount(slot[AS_SLOT_ITEM]);
			slot.displayAmount = "/" + slot[AS_SLOT_NUM];//slot.displayAmount = gv.userStorages.getItemAmount(slot[AS_SLOT_ITEM]) + "/" + slot[AS_SLOT_NUM];
			slot.isEnough = (slot[AS_SLOT_NUM] <= gv.userStorages.getItemAmount(slot[AS_SLOT_ITEM]));
			
			slot.rewardList = [];
			for(var key in slot[AS_SLOT_REWARD_ITEMS])
				slot.rewardList.push({itemId:key, amount:slot[AS_SLOT_REWARD_ITEMS][key], displayAmount:"x" + slot[AS_SLOT_REWARD_ITEMS][key]});
			for(var key in slot[AS_SLOT_EVENT_ITEMS])
				slot.rewardList.push({itemId:key, amount:slot[AS_SLOT_EVENT_ITEMS][key], displayAmount:"x" + slot[AS_SLOT_EVENT_ITEMS][key]});
			
			// removed, event items are returned in AS_SLOT_EVENT_ITEMS
			// event
			//var event = GameEvent.currentEvent;
			//if(event)
			//{
			//	var dropItems = (this.isFriendAirship() ? event.FEATURE_DROP_LIST.rules.AIRSHIP_FRIEND_PACK : event.FEATURE_DROP_LIST.rules.AIRSHIP_PACK);
			//	slot.rewardList.push({itemId:event.FEATURE_DROP_LIST.dropItemID, amount:dropItems.quantity, displayAmount:"x" + dropItems.quantity});
			//}
			
			if(slot[AS_SLOT_IS_PACKED] === true)
				this.packedCount++;
			
			// jira#5587
			if(typeof slot[AS_SLOT_HELPER_AVATAR] !== "string" || !slot[AS_SLOT_HELPER_AVATAR])
				slot[AS_SLOT_HELPER_AVATAR] = "hud/hud_avatar_default.png";
		}
		
		// rewards
		var level = gv.userData.getLevel();
		var rewardNames = json_user_level.AIRSHIP_REWARD_NAME[level];
		var rewardCounts = json_user_level.AIRSHIP_REWARD_NUM[level];
		for(var i=0; i<rewardNames.length; i++)
			this.rewardList.push({itemId:rewardNames[i], amount:rewardCounts[i], displayAmount:"x" + rewardCounts[i]});

		// fake ticket gachapon
		this.rewardList.push({itemId:ITEM_ID_TICKET,amount:g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET,displayAmount:"x"+g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET});
		//this.rewardList.push({itemId:ITEM_ID_TICKET,amount:g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET,displayAmount:"x"+g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET});
		//this.rewardList.push({itemId:ITEM_ID_TICKET,amount:g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET,displayAmount:"x"+g_MISCINFO.GACHAPON_AIRSHIP_DELIVERY_TICKET});




		// event
		if(!this.isFriendAirship())
		{
			var event = GameEvent.currentEvent;
			if(event)
			{
				// use data returned from server instead of constants
				//var dropItems = event.FEATURE_DROP_LIST.rules.AIRSHIP_DELIVERY;
				//this.rewardList.push({itemId:event.FEATURE_DROP_LIST.dropItemID, amount:dropItems.quantity, displayAmount:"x" + dropItems.quantity});
				
				var eventItems = FWUtils.getItemsArray(this.data[AS_DELIVERY_EVENT_ITEMS]);
				if(eventItems.length > 0)
					this.rewardList = this.rewardList.concat(eventItems);
			}
			if(gv.vipManager.check())
			{
				for(var key in this.rewardList)
				{
					if(this.rewardList[key].itemId === ID_GOLD)
					{
						this.rewardList[key].amount = Math.floor( this.rewardList[key].amount* (100+gv.vipManager.airshipGoldBonus)/100);
						this.rewardList[key].displayAmount = "x" + this.rewardList[key].amount;
						cc.log("GOLD IN AIRSHIP VIP:"+ this.rewardList[key].amount);
						//this.rewardList[key].isGold = true;
					}
					else
					{
						//this.rewardList[key].isGold = false;
					}
				}
			}
			if(GameEventTemplate2.getActiveEvent())
			{
				var eventItems = FWUtils.getItemsArray(this.data[AS_DELIVERY_EVENT_ITEMS]);
				if(eventItems.length > 0)
					this.rewardList = this.rewardList.concat(eventItems);
			}

			if(GameEventTemplate3.getActiveEvent()){
				var eventItems = FWUtils.getItemsArray(this.data[AS_DELIVERY_EVENT_ITEMS]);
				if(eventItems.length > 0)
					this.rewardList = this.rewardList.concat(eventItems);
			}

			if(g_FISHING.FEATURE_DROP_LIST.rules.AIRSHIP_DELIVERY && g_MISCINFO.FISHING_ACTIVE)
			{
				var id = g_FISHING.FEATURE_DROP_LIST.rules.AIRSHIP_DELIVERY.dropItemID;
				var index = this.rewardList.findIndex(function(x) {return (x.itemId === id);});
				if(index >=0)
				{
					var item = this.rewardList[index];
					item.amount +=  g_FISHING.FEATURE_DROP_LIST.rules.AIRSHIP_DELIVERY.quantity;
					item.displayAmount = "x" + item.amount;
				}
				else
				{
					var item = {};
					item.itemId = id;
					item.amount = g_FISHING.FEATURE_DROP_LIST.rules.AIRSHIP_DELIVERY.quantity;
					item.displayAmount = "x" + item.amount;
					this.rewardList.push(item);
				}

			}
		}
	},
	
	checkAllSlotsPacked:function()
	{
		this.packedCount = 0;
		for(var i=0; i<this.slotList.length; i++)
		{
			if(this.slotList[i][AS_SLOT_IS_PACKED] === true)
				this.packedCount++;
		}
		
		var widget = FWPool.getNode(UI_AIRSHIP, false);
		var deliverButton = FWUtils.getChildByName(widget, "deliverButton");
		deliverButton.setEnabled(this.packedCount >= this.slotList.length);
	},
	
	showUnlockInfo:function()
	{
		gv.miniPopup.showAirshipPresent ();
		
		//if(!this.hideFunc3)
		//	this.hideFunc3 = function() {this.hideUnlockInfo()}.bind(this);
		//Game.gameScene.registerBackKey(this.hideFunc3);
	},
	
	hideUnlockInfo:function()
	{
		FWUI.hide(UI_AIRSHIP_UNLOCK, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc3);
	},
	
	onFinishedRepairing:function(sender)
	{
		// fake
		gv.userData.airship[AS_TIME_FINISH] = this.data[AS_TIME_FINISH] = Game.getGameTimeInSeconds() + g_MISCINFO.AS_LEAVE_DURATION_MAX;
		this.onArrive(sender);
		
		this.refreshAirship();
	},
	
	onArrive:function(sender)
	{
		if(this.isFriendAirship())
			return;
		
		cc.log("Airship::onArrive");
		
		this.data[AS_STATUS] = AIRSHIP_STATUS_ACTIVE;
		this.arrivalTime = Game.getGameTimeInSeconds();
		this.leavingTime = this.arrivalTime + g_MISCINFO.AS_LEAVE_DURATION_MAX;

		this.refreshUIMain();
		
		this.airship.setVisible(true);
		this.airship.setAnimation("airship_fly_back", false);
		this.airship.spine.addAnimation(0, "airship_idle", true);

		AudioManager.effect (EFFECT_OWL_RETURN);
	},
	
	onLeave:function(sender)
	{
		cc.log("Airship::onLeave");
		
		this.data[AS_STATUS] = AIRSHIP_STATUS_INACTIVE;
		this.leavingTime = Game.getGameTimeInSeconds();
		this.arrivalTime = this.leavingTime + g_MISCINFO.AS_LEAVE_DURATION_MAX;
		
		this.refreshUIMain();
		
		this.airship.setVisible(true);
		this.airship.setAnimation("airship_fly_away", false);

		AudioManager.effect (EFFECT_OWL_FLY_AWAY);
	},
	
	// refresh airship info in ui main
	refreshUIMain:function()
	{
		var isFriendGarden = Game.isFriendGarden();
		
		// anim
		var status = this.data[AS_STATUS];
		if(!this.airship)
		{
			this.airship = new FWObject();
			this.airship.initWithSpine(SPINE_AIRSHIP);
			this.airship.setParent(this.airshipMarker, Z_AIRSHIP);//this.airship.setParent(Game.gameScene.background.base, Z_AIRSHIP);
			this.airship.setEventListener(null, this.onAirshipTouched.bind(this));
			this.airship.setNotifyBlockedTouch(true);
			this.airship.setPosition(cc.p(0, 0));//this.airship.setPosition(this.airshipMarker.getPosition());
			this.airship.setScale(AIRSHIP_SCALE);
			this.airship.customBoundingBoxes = cc.rect(-50, 0, 100, 200);
			
			this.stone = new FWObject();
			this.stone.initWithSpine(SPINE_AIRSHIP);
			this.stone.setParent(this.airshipMarker, Z_AIRSHIP_STONE);//this.stone.setParent(Game.gameScene.background.base, Z_AIRSHIP_STONE);
			this.stone.setEventListener(null, this.onAirshipTouched.bind(this));
			this.stone.setNotifyBlockedTouch(true);
			this.stone.setPosition(cc.p(0, 0));//this.stone.setPosition(this.airshipMarker.getPosition());
			this.stone.setScale(AIRSHIP_SCALE);
			this.stone.customBoundingBoxes = cc.rect(-60, -50, 120, 80);
		}

		if (!this.airship.spine) {
			this.airship = null;
			this.refreshUIMain();
		}

		if(isFriendGarden && gv.userData.userId === USER_ID_JACK)
		{
			this.airship.setVisible(true);
			this.airshipUnlock.setVisible(false);
			this.airship.setAnimation("airship_idle", true);
			this.stone.setAnimation("airship_stone_idle", true);
		}
		else if(status === AIRSHIP_STATUS_LOCK)
		{
			this.airship.setVisible(false);
			this.airshipUnlock.setVisible(gv.userData.getLevel() >= g_MISCINFO.AS_UNLOCK_LEVEL && !isFriendGarden);
			this.stone.setAnimation("airship_stone_lock", true);
		}
		else if(status === AIRSHIP_STATUS_UNLOCK)
		{
			this.airship.setVisible(false);
			this.airshipUnlock.setVisible(false);
			if(this.stone.getAnimation() !== "airship_stone_built")
				this.stone.setAnimation("airship_stone_built", true);
		}
		else if(status === AIRSHIP_STATUS_ACTIVE)
		{
			this.airship.setVisible(true);
			this.airshipUnlock.setVisible(false);
			if(this.airship.spine.animation !== "airship_fly_back" || !this.airship.isAnimating)
				this.airship.setAnimation("airship_idle", true);
			this.stone.setAnimation("airship_stone_idle", true);
		}
		else if(status === AIRSHIP_STATUS_INACTIVE || status === AIRSHIP_STATUS_LIMIT)
		{
			this.airship.setVisible(false);
			this.airshipUnlock.setVisible(false);
			this.stone.setAnimation("airship_stone_waiting", true);
		}			
		
		// skip time
		if(status !== AIRSHIP_STATUS_UNLOCK || isFriendGarden)
		{
			if(this.skipTimeWidget)
			{
				FWUI.hideWidget(this.skipTimeWidget, UIFX_POP);
				this.skipTimeWidget = null;
			}
			return;
		}

		var uiDef =
		{
			bg:{visible:this.showSkipRepairingTimeButton},
			bg2:{visible:this.showSkipRepairingTimeButton},
			button:{onTouchEnded:this.skipTime.bind(this), visible:this.showSkipRepairingTimeButton},
			timerMarker:{type:UITYPE_TIME_BAR, startTime:this.arrivalTime - g_MISCINFO.AS_UNLOCK_TIME, endTime:this.arrivalTime, countdown:true, onFinished:this.onFinishedRepairing.bind(this), onTick:this.updateSkipTimeDiamond.bind(this)},
			price:{style:TEXT_STYLE_TEXT_BUTTON},//price:{shadow:SHADOW_DEFAULT},
		};
		if(!this.skipTimeWidget)
		{
			this.skipTimeWidget = FWUI.showWithData(UI_AIRSHIP_REPAIR_SKIPTIME, null, uiDef, this.airshipMarker, UIFX_POP);//this.skipTimeWidget = FWUI.showWithData(UI_AIRSHIP_REPAIR_SKIPTIME, null, uiDef, Game.gameScene.background.base, UIFX_POP);
			this.skipTimeWidget.setLocalZOrder(Z_UI_AIRSHIP_REPAIR_SKIPTIME);
			this.skipTimeWidget.setPosition(cc.p(0, 0));
			this.skipTimeLabel = FWUtils.getChildByName(this.skipTimeWidget, "price");
		}
		else
			FWUI.fillData(this.skipTimeWidget, null, uiDef);
	},
	
	skipTime:function(sender)
	{
		if(Game.consumeDiamond(this.skipTimeData.diamond, FWUtils.getWorldPosition(sender)) === false)
			return;
		
		this.hideNextInfo();
		AudioManager.effect (EFFECT_GOLD_PAYING);
		
		// fake
		var status = this.data[AS_STATUS];
		this.onArrive();
		
		// server
		if(status === AIRSHIP_STATUS_UNLOCK)
		{
			// skip repair time
			var pk = network.connector.client.getOutPacket(this.RequestAirshipSkipTimeUnlock);
			pk.pack(this.skipTimeData.diamond);
			network.connector.client.sendPacket(pk);
		}
		else
		{
			// skip arrival time
			var pk = network.connector.client.getOutPacket(this.RequestAirshipSkipTimeInactive);
			pk.pack(this.skipTimeData.diamond);
			network.connector.client.sendPacket(pk);
		}
	},
	
	updateSkipTimeDiamond:function(sender)
	{
		// skip time diamond
		this.skipTimeData = Game.getSkipTimeDiamond("AIRSHIP", this.leavingTime, this.arrivalTime - this.leavingTime);
		this.skipTimeLabel.setString(this.skipTimeData.diamond);
		this.skipTimeLabel.setColor(gv.userData.getCoin() >= this.skipTimeData.diamond ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
	},
	
	isFriendAirship:function()
	{
		return (this.friendId !== null);
	},
	
	// jira#5698
	currentSlotDisplayInfo: null,
	
	showSlotInfo:function(sender)
	{
		this.currentSlot = FWUtils.getParentByName(sender, "item");
		var slotData = this.currentSlot.uiBaseData;
		
		if(slotData[AS_SLOT_IS_PACKED] || (this.isFriendAirship() === true && slotData[AS_SLOT_IS_REQUEST] === false))
			return;
		
		// jira#5527
		var slotList = this.data[AS_SLOTS];
		if(this.isFriendAirship() === true && slotData[AS_SLOT_IS_REQUEST] === true)
		{
			for(var i=0; i<slotList.length; i++)
			{
				var slot = slotList[i];
				if(slot[AS_SLOT_IS_PACKED] === true && slot[AS_SLOT_IS_REQUEST] === true && slot[AS_SLOT_HELPER_ID] === gv.mainUserData.mainUserId)
				{
					FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_HELP_LIMIT"), sender.getTouchEndPosition(), cc.WHITE);
					return;
				}
			}
		}
		
		this.currentSlotDisplayInfo = {widget:this.currentSlot, parent:this.currentSlot.getParent(), pos:this.currentSlot.getPosition()};
		this.boughtItemToDeliver = false;


		// def
		var itemDef =
		{
			item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT},
		};
		
		var uiDef =
		{
			title:{type:UITYPE_TEXT, value:"TXT_AS_REWARD", style:TEXT_STYLE_TEXT_DIALOG},//title:{type:UITYPE_TEXT, value:"TXT_AS_REWARD"},
			itemList:{type:UITYPE_2D_LIST, items:slotData.rewardList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(80, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75,singleLine:true},
			askFriendButton:{visible:this.isFriendAirship() === false && slotData[AS_SLOT_IS_REQUEST] === false, enabled:this.data[AS_NUM_REQUEST] < g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP, onTouchEnded:this.onAskFriend.bind(this)},
			packButton:{onTouchEnded:this.onPack.bind(this)},
			tapToClose:{onTouchEnded:this.hideSlotInfo.bind(this)},
			askFriendText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:cc.formatStr(FWLocalization.text("TXT_AS_ASK_FRIEND"), this.data[AS_NUM_REQUEST], g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP)},//askFriendText:{type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:cc.formatStr(FWLocalization.text("TXT_AS_ASK_FRIEND"), this.data[AS_NUM_REQUEST], g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP)},
			packText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_AS_PACK"},//packText:{type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:"TXT_AS_PACK"},
		};
		
		// show
		var widget = FWUI.showWithData(UI_AIRSHIP_PACK, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
		widget.setLocalZOrder(Z_UI_AIRSHIP_PACK);
		widget.setContentSize(cc.size(cc.winSize.width * 2, cc.winSize.height * 2));

		// pos
		//var pos = sender.getTouchEndPosition();
		var pos = FWUtils.getWorldPosition(sender);
		pos.x += 120;
		pos.y += 65;
		
		var h = cc.winSize.height / 5;
		if(pos.y < h)
			pos.y = h;
		else if(pos.y > cc.winSize.height - h)
			pos.y = cc.winSize.height - h;
		widget.setPosition(pos);
		
		// resize container
		var askFriendButton = FWUtils.getChildByName(widget, "askFriendButton");
		var bg = FWUtils.getChildByName(widget, "bg");
		bg.setContentSize(320, askFriendButton.isVisible() ? 260 : 200);
		
		if(!this.hideFunc2)
			this.hideFunc2 = function() {this.hideSlotInfo()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc2);
		
		// jira#5698
		//FWUtils.showDarkBg(null, Z_UI_AIRSHIP_PACK - 2, "darkBgPack");
		var pos = FWUtils.getWorldPosition(this.currentSlot);
		this.currentSlot.removeFromParent();
		FWUtils.getCurrentScene().addChild(this.currentSlot);
		this.currentSlot.setPosition(pos);
		this.currentSlot.setLocalZOrder(Z_UI_AIRSHIP_PACK - 1);
	},
	
	hideSlotInfo:function(sender)
	{
		FWUI.hide(UI_AIRSHIP_PACK, UIFX_POP);
		Game.gameScene.unregisterBackKey(this.hideFunc2);
		
		// jira#5698
		if(this.currentSlotDisplayInfo)
		{
			//FWUtils.hideDarkBg(null, "darkBgPack");
			var widget = this.currentSlotDisplayInfo.widget;
			widget.removeFromParent();
			this.currentSlotDisplayInfo.parent.addChild(widget);
			widget.setPosition(this.currentSlotDisplayInfo.pos);
			this.currentSlotDisplayInfo = null;
		}
	},
	
	onDeliver:function(sender)
	{
		if(this.data[AS_STATUS] !== AIRSHIP_STATUS_ACTIVE)
			return;
		
		//web?
		/*if(this.packedCount < this.slotList.length)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_AIRSHIP_NOT_ENOUGH_CARGO"), FWUtils.getWorldPosition(sender));
			return;
		}*/
		
		this.hide();
		this.onLeave();
		
		if(this.isFriendAirship() || !this.slotList)
			return;
		
		var packedCount = 0;
		for(var i=0; i<this.slotList.length; i++)//BUG HERE: this.slotList === null ?
		{
			if(this.slotList[i][AS_SLOT_IS_PACKED] === true)
				packedCount++;
		}
		if(packedCount <= 0)
		{
			this.refreshAirship();
			return;
		}
		
		// fake: "pack-all" bonus
		if(packedCount >= this.slotList.length)
			Game.addItems(this.rewardList, FWUtils.getWorldPosition(this.airshipMarker));

		// server
		var pk = network.connector.client.getOutPacket(this.RequestAirshipDelivery);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},

	onCancel:function(sender)
	{
		var displayInfo = {content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO}; // feedback: remove title //var displayInfo = {title:"TXT_AS_CANCEL", content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO};
		Game.showPopup(displayInfo, this.onCancelConfirmed.bind(this));
	},
	
	onCancelConfirmed:function(sender)
	{
		FWUtils.disableAllTouches();
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestAirshipCancel);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	onCancelConfirmed2:function(sender)
	{
		this.hide();
		this.onLeave();
	},	
	
	onAskFriend:function(sender)
	{
		// fake
		this.data[AS_NUM_REQUEST]++;
		var slotData = this.currentSlot.uiBaseData;
		slotData[AS_SLOT_IS_REQUEST] = true;
		
		// refresh display
		this.hideSlotInfo();
		var spine = FWUtils.getChildByName(this.currentSlot, "cargo").getChildByTag(UI_FILL_DATA_TAG);
		spine.setAnimation(0, "carret_friend_init", false);
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestAirshipRequestHelp);
		pk.pack(slotData.index);
		network.connector.client.sendPacket(pk);
	},
	
	onPack:function(sender)
	{
		// check if enough item
		var slotData = this.currentSlot.uiBaseData;
		if(!slotData.isEnough)
		{
			Game.showQuickBuy([{itemId:slotData[AS_SLOT_ITEM], amount:slotData[AS_SLOT_NUM]}], this.onOk2Pack.bind(this), NPC_AVATAR_PEOPEO);
			return;
		}
		
		if(!this.boughtItemToDeliver)
		{
			if(g_PLANT[slotData[AS_SLOT_ITEM]] !== undefined && slotData[AS_SLOT_NUM] === gv.userStorages.getItemAmount(slotData[AS_SLOT_ITEM]))
			{
				Game.showEmtpyStockWarning([{itemId:slotData[AS_SLOT_ITEM]}], this.onPack2.bind(this));
				return;
			}
		}
		
		this.onPack2(sender);
	},
	
	onPack2:function(sender)
	{
		FWUtils.disableAllTouches();
		this.hideSlotInfo();
		var slotData = this.currentSlot.uiBaseData;
		
		// server
		var pk;
		if(this.friendId)
		{
			pk = network.connector.client.getOutPacket(this.RequestAirshipFriendPack);
			pk.pack(this.friendId, slotData.index);
		}
		else
		{
			pk = network.connector.client.getOutPacket(this.RequestAirshipPack);
			pk.pack(slotData.index);
		}
		network.connector.client.sendPacket(pk);
	},
	
	onPack3:function()
	{
		// fake
		var pos = FWUtils.getWorldPosition(this.currentSlot);
		var slotData = this.currentSlot.uiBaseData;
		slotData[AS_SLOT_IS_PACKED] = true;
		
		// subtract items
		Game.consumeItems([{itemId:slotData[AS_SLOT_ITEM], amount:slotData[AS_SLOT_NUM]}], cc.p(pos.x, pos.y + 80));
		// receive rewards
		Game.addItems(slotData.rewardList, pos, 1);
		
		// refresh display
		var spine = FWUtils.getChildByName(this.currentSlot, "cargo").getChildByTag(UI_FILL_DATA_TAG);
		//spine.setAnimation(0, slotData[AS_SLOT_IS_REQUEST] ? "carret_friend_packing" : "carret_normal_packing", false);
		FWUtils.getChildByName(this.currentSlot, "gfx").setVisible(false);
		FWUtils.getChildByName(this.currentSlot, "requireAmount").setVisible(false);
		FWUtils.getChildByName(this.currentSlot, "stockAmount").setVisible(false);
		if(this.isFriendAirship() === false)
		{
			var widget = FWPool.getNode(UI_AIRSHIP, false);
			FWUtils.getChildByName(widget, "deliverButton").setVisible(true);
			FWUtils.getChildByName(widget, "cancelButton").setVisible(false);
			spine.setAnimation(0, slotData[AS_SLOT_IS_REQUEST] === true ? "carret_friend_packing" : "carret_normal_packing", false);
		}
		else
		{
			spine.setAnimation(0, "carret_friend_packing", false);
			
			// packer avatar
			var avatarFrame = FWUtils.getChildByName(this.currentSlot, "avatarFrame");
			var avatar = FWUtils.getChildByName(this.currentSlot, "avatar");
			avatarFrame.setVisible(true);
			avatar.setVisible(true);
			FWUI.fillData_imageFromUrl(avatar, gv.userData.getAvatar(), undefined, undefined, undefined, 64);
		}
		
		AudioManager.effect(EFFECT_GOLD_PAYING); // jira#5592
		this.checkAllSlotsPacked();
		
		// jira#4720
		this.updateSlotList(false);
		var widget = FWPool.getNode(UI_AIRSHIP, false);
		var itemList = FWUtils.getChildByName(widget, "itemList");
		var children = itemList.getChildren();
		for(var i=0; i<children.length; i++)
		{
			var child = children[i];
			var amount = FWUtils.getChildByName(child, "stockAmount");//var amount = FWUtils.getChildByName(child, "amount");
			FWUI.setTextColor(amount, amount.uiData.isEnough ? cc.GREEN : cc.RED);//amount.setColor(amount.uiData.isEnough ? cc.GREEN : cc.RED);
			amount.setString(amount.uiData.amount);//amount.setString(amount.uiData.displayAmount);
		}
	},
	
	onOk2Pack:function(sender)
	{
		// refresh display
		var slotData = this.currentSlot.uiBaseData;
		var amount = FWUtils.getChildByName(this.currentSlot, "stockAmount");//var amount = FWUtils.getChildByName(this.currentSlot, "amount");
		amount.color = cc.GREEN;
		amount.setString(gv.userStorages.getItemAmount(slotData[AS_SLOT_ITEM]));//amount.setString(gv.userStorages.getItemAmount(slotData[AS_SLOT_ITEM]) + "/" + slotData[AS_SLOT_NUM]);
		slotData.isEnough = true;
		this.boughtItemToDeliver = true;
		
		// feedback: auto pack after buying item
		this.onPack(sender);
	},
	
	showFriendAirship:function(friendData)
	{
		this.friendData = friendData;
		this.friendId = friendData[NB_SLOT_USER_ID];
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestAirshipFriendGet);
		pk.pack(this.friendId, friendData[NB_SLOT_USER_BUCKET]);
		network.connector.client.sendPacket(pk);
	},

	onChangeFriend:function(sender)
	{
		var name = sender.getName();
		var friendData = this.getNextFriend(name === "panelTouchRight" ? 1 : -1);
		this.showFriendAirship(friendData);
	},
	getNextFriend:function(offset)
	{
		if(!this.friendData)
			return null;

		var friendList = NewsBoard.airshipData;
		var nextIndex = this.friendData.index + offset;
		if(nextIndex < 0)
			nextIndex = friendList.length - 1;
		if(nextIndex >= friendList.length)
			nextIndex = 0;
		return friendList[nextIndex];
	},
///////////////////////////////////////////////////////////////////////////////////////
// repair /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	
	
	showRepairInfo:function()
	{
		// items
		this.repairGold = 0;
		this.repairItemList = [];
		for(var key in g_MISCINFO.AS_UNLOCK_REQUIRE_ITEMS)
		{
			var missing = Game.getMissingAmountAndPrice(key, g_MISCINFO.AS_UNLOCK_REQUIRE_ITEMS[key]);
			if(key === ID_GOLD)
				this.repairGold = g_MISCINFO.AS_UNLOCK_REQUIRE_ITEMS[key];
			else
				this.repairItemList.push({itemId:key, amount:g_MISCINFO.AS_UNLOCK_REQUIRE_ITEMS[key], stockAmount:gv.userStorages.getItemAmount(key), displayAmount:"/" + g_MISCINFO.AS_UNLOCK_REQUIRE_ITEMS[key], enough:missing.missingAmount <= 0});
		}
		
		// item def
		// jira#4805
		var requireItemDef = 
		{
			bg:{visible:false},
			check:{visible:false},
			requireAmount:{type:UITYPE_TEXT, field:"displayAmount", color:cc.GREEN, style:TEXT_STYLE_NUMBER},
			stockAmount:{type:UITYPE_TEXT, field:"stockAmount", color:"data.enough ? cc.GREEN : cc.RED", style:TEXT_STYLE_NUMBER},
			gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.9},
			buyButton:{visible:"data.enough === false", onTouchEnded:this.buyMissingRepairItem.bind(this)},
			item:{onTouchEnded:this.buyMissingRepairItem.bind(this)},
		};
		
		// ui def
		var uiDef = 
		{
			title:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE", style:TEXT_STYLE_TITLE_2},//title:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE", shadow:SHADOW_DEFAULT},
			title2:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE2", style:TEXT_STYLE_TITLE_1},//title2:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE2", shadow:SHADOW_DEFAULT},
			content:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_CONTENT", style:TEXT_STYLE_TEXT_HINT},//content:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_CONTENT", shadow:SHADOW_DEFAULT},
			repairButton:{onTouchEnded:this.repairAirship.bind(this)},
			repairText:{type:UITYPE_TEXT, value:this.repairGold, style:TEXT_STYLE_TEXT_BUTTON, color:this.repairGold <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND},//repairText:{type:UITYPE_TEXT, value:this.repairGold, shadow:SHADOW_DEFAULT},//repairText:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_NOW", shadow:SHADOW_DEFAULT},
			closeButton:{onTouchEnded:this.hideRepairInfo.bind(this)},
			itemList:{type:UITYPE_2D_LIST, items:this.repairItemList, itemUI:UI_ORDER_REQUEST_ITEM, itemDef:requireItemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/hud_barn_list_slot.png", itemsAlign:"center", singleLine:true},
			npc2:{type:UITYPE_SPINE, value:SPINE_AIRSHIP, anim:"airship_stone_idle", scale:AIRSHIP_SCALE},
			npc3:{type:UITYPE_SPINE, value:SPINE_AIRSHIP, anim:"airship_idle", scale:AIRSHIP_SCALE},
		};
		
		// show
		var widget = FWPool.getNode(UI_AIRSHIP_REPAIR, false);
		if(FWUI.isWidgetShowing(widget))
			FWUI.fillData(widget, null, uiDef);
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_AIRSHIP);
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			//// jira#5132
			//FWUtils.showDarkBg(null, Z_UI_AIRSHIP - 1, null, null, true);
		}
		
		if(!this.hideFunc4)
			this.hideFunc4 = function() {this.hideRepairInfo()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc4);
	},
	
	hideRepairInfo:function()
	{
		FWUI.hide(UI_AIRSHIP_REPAIR, UIFX_POP);
		delete this.repairItemList;
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc4);
		
		//// jira#5132
		//FWUtils.hideDarkBg();
	},
	
	repairAirship:function(sender)
	{
		AudioManager.effect (EFFECT_ITEM_TOUCH);

		// check & consume items
		if(gv.userData.getGold() < this.repairGold)
		{
			Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
			this.hideRepairInfo();
			return;
		}
		else
		{
			this.repairItemList.push({itemId:ID_GOLD, amount:this.repairGold});
			if(!Game.consumeItems(this.repairItemList, FWUtils.getWorldPosition(sender)))
			{
				Game.showQuickBuy(this.repairItemList, function() {Airship.showRepairInfo();});
				return;
			}
		}
			
		// fake
		this.data[AS_STATUS] = AIRSHIP_STATUS_UNLOCK;
		this.leavingTime = Game.getGameTimeInSeconds();
		this.arrivalTime = this.leavingTime + g_MISCINFO.AS_UNLOCK_TIME;
		
		this.hideRepairInfo();
		this.refreshUIMain();
		
		// server
		var pk = network.connector.client.getOutPacket(this.RequestAirshipUnlock);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	buyMissingRepairItem:function(sender)
	{
		if(sender.uiData.enough)
			return;
		Game.showQuickBuy([{itemId:sender.uiData.itemId, amount:sender.uiData.amount}], function() {Airship.showRepairInfo();});
	},
	
	onAirshipTouched:function(touch, sender)
	{
		if(!Tutorial.acceptInput("airship") || gv.userData.userId === USER_ID_JACK)
			return;
		Tutorial.onGameEvent(EVT_TOUCH_END, "airship");
		
		if(!Game.isFriendGarden())
		{
			Airship.setData(gv.userData.airship);
			Airship.friendId = null;			

			//cc.log(JSON.stringify(gv.userData.airship, null, 4));
			
			var needUpdate = false;
			var slots = gv.userData.airship[AS_SLOTS];
			if (slots && slots.length > 0)
			{	
				for(var i=0; i<slots.length; i++)
				{
					var slot = slots[i];
					if (slot[AS_SLOT_IS_PACKED] === false && slot[AS_SLOT_IS_REQUEST])
						needUpdate = true;
				}
			}				
				
			Airship.show();
			if (needUpdate)
				this.refreshAirship();				
		}
		else
		{
			var friendData = {};
			friendData[NB_SLOT_USER_ID] = gv.userData.userId;
			Airship.showFriendAirship(friendData);
		}
	},
	
	refreshAirship:function()
	{
		if(Game.isFriendGarden())
			return; // RequestAirshipGet will override friend's airship with main user's airship
		
		var pk = network.connector.client.getOutPacket(this.RequestAirshipGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	replaceFakedTimeWithServerTime:function(object)
	{
		// replace faked time
		var airship = object[KEY_AIRSHIP];
		if(airship && airship[AS_TIME_FINISH])
		{
			if(Airship.arrivalTime > Airship.leavingTime)
			{
				Airship.leavingTime = airship[AS_TIME_START];
				Airship.arrivalTime = airship[AS_TIME_FINISH];
			}
			else
			{
				Airship.leavingTime = airship[AS_TIME_FINISH];
				Airship.arrivalTime = airship[AS_TIME_START];
			}
		}
	},
	showItemHint:function(sender)
	{
		var position = null;
		position = FWUtils.getWorldPosition(sender);
		gv.hintManagerNew.show(null, null, sender.uiData.itemId, position);
	},
	hideItemHint:function(sender)
	{
		gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////	

	RequestAirshipUnlock:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_UNLOCK);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),
	
	ResponseAirshipUnlock:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			Airship.leavingTime = Game.getGameTimeInSeconds();
			Airship.arrivalTime = Airship.data[AS_TIME_FINISH];
			Airship.refreshUIMain();
			
			if(this.getError() !== 0)
				cc.log("Airship.ResponseAirshipUnlock: error=" + this.getError());
		}
	}),
	
	RequestAirshipSkipTimeUnlock:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_SKIP_TIME_UNLOCK);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),
	
	RequestAirshipSkipTimeInactive:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_SKIP_TIME_INACTIVE);},
		pack:function(price)
		{
			addPacketHeader(this);
			
			PacketHelper.putInt(this, KEY_PRICE_COIN, price);
			PacketHelper.putClientCoin(this);
			
			
			addPacketFooter(this);
		},
	}),	
	
	ResponseAirshipSkipTime:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			Game.updateUserDataFromServer(object);
			Airship.arrivalTime = Game.getGameTimeInSeconds();
			Airship.leavingTime = Airship.data[AS_TIME_FINISH];
			Airship.refreshUIMain();
			
			if(this.getError() !== 0)
				cc.log("Airship.ResponseAirshipSkipTime: error=" + this.getError());
		}
	}),	
	
	RequestAirshipPack:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_PACK);},
		pack:function(slot)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),	
	
	ResponseAirshipPack:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
			{
				cc.log("Airship.ResponseAirshipPack: error=" + this.getError());
				Game.updateUserDataFromServer(object);
				// ResponseAirshipFriendPack // jira#5609
				if(object[KEY_FRIEND_AIRSHIP])
					Airship.setData(object[KEY_FRIEND_AIRSHIP]);
				
				Airship.show();
				FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_DONE_CONTENT"), FWUtils.getWorldPosition(Airship.currentSlot), cc.WHITE);
			}
			else
			{
				Airship.onPack3();
				Game.updateUserDataFromServer(object);
				Airship.replaceFakedTimeWithServerTime(object);
				
				// ResponseAirshipFriendPack
				if(object[KEY_FRIEND_AIRSHIP])
				{
					Airship.setData(object[KEY_FRIEND_AIRSHIP]);
					Achievement.onAction(g_ACTIONS.ACTION_AIRSHIP_FRIEND_PACK.VALUE, null, 1);
				}
				else
					Achievement.onAction(g_ACTIONS.ACTION_AIRSHIP_PACK.VALUE, null, 1);
			}
		}
	}),
	
	RequestAirshipFriendPack:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_FRIEND_PACK);},
		pack:function(friend, slot)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, friend);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),		
	
	RequestAirshipRequestHelp:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_REQUEST_HELP);},
		pack:function(slot)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),		
	
	ResponseAirshipRequestHelp:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("Airship.ResponseAirshipRequestHelp: error=" + this.getError());
			else
			{
				Airship.replaceFakedTimeWithServerTime(object);
				Achievement.onAction(g_ACTIONS.ACTION_AIRSHIP_REQUEST_HELP.VALUE, null, 1);
			}
			if(FWUI.isShowing(UI_AIRSHIP, true))
				Airship.show();
		}
	}),
	
	RequestAirshipDelivery:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_DELIVERY);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),	
	
	ResponseAirshipDelivery:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("Airship.ResponseAirshipDelivery: error=" + this.getError());
			else
			{
				Airship.replaceFakedTimeWithServerTime(object);
				Achievement.onAction(g_ACTIONS.ACTION_AIRSHIP_DELIVERY.VALUE, null, 1);
			}
			if(FWUI.isShowing(UI_AIRSHIP, true))
				Airship.show();
		}
	}),
	
	RequestAirshipCancel:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_CANCEL);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),	
	
	ResponseAirshipCancel:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			var object = PacketHelper.parseObject(this);
			if(this.getError() !== 0)
			{
				cc.log("Airship.ResponseAirshipCancel: error=" + this.getError());
				Game.updateUserDataFromServer(object);
				Airship.show();
				
				var widget = FWPool.getNode(UI_AIRSHIP, false);
				var cancelButton = FWUtils.getChildByName(widget, "cancelButton");
				FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_DONE_CONTENT"), FWUtils.getWorldPosition(cancelButton), cc.WHITE);
			}
			else
			{
				Airship.onCancelConfirmed2();
				Game.updateUserDataFromServer(object);
				Airship.replaceFakedTimeWithServerTime(object);
			}
		}
	}),

	ResponseAirshipCommon:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			if(this.getError() !== 0)
				cc.log("Airship.ResponseAirshipCommon: error=" + this.getError());
			else
				Airship.replaceFakedTimeWithServerTime(object);
			if(FWUI.isShowing(UI_AIRSHIP, true))
				Airship.show();
		}
	}),
	
	RequestAirshipFriendGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_FRIEND_GET);},
		pack:function(friend, bucket)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, friend);
			PacketHelper.putString(this, KEY_BUCKET, bucket);
			
			addPacketFooter(this);
			FWUtils.disableAllTouches();
		},
	}),	

	ResponseAirshipFriendGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			if(this.getError() === 0)
			{
				var object = PacketHelper.parseObject(this);
				Airship.setData(object[KEY_FRIEND_AIRSHIP]);
				if(Airship.show() === true)
					NewsBoard.onHide(); // jira#5304
			}
			else
			{
				cc.log("Airship.ResponseAirshipFriendGet: error=" + this.getError());
				Airship.hide();
			}
		}
	}),	
	
	RequestAirshipGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.AIRSHIP_GET);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),	
};

network.packetMap[gv.CMD.AIRSHIP_UNLOCK] = Airship.ResponseAirshipUnlock;
network.packetMap[gv.CMD.AIRSHIP_SKIP_TIME_UNLOCK] = Airship.ResponseAirshipSkipTime;
network.packetMap[gv.CMD.AIRSHIP_SKIP_TIME_INACTIVE] = Airship.ResponseAirshipSkipTime;
network.packetMap[gv.CMD.AIRSHIP_PACK] = Airship.ResponseAirshipPack;
network.packetMap[gv.CMD.AIRSHIP_FRIEND_PACK] = Airship.ResponseAirshipPack;
network.packetMap[gv.CMD.AIRSHIP_REQUEST_HELP] = Airship.ResponseAirshipRequestHelp;
network.packetMap[gv.CMD.AIRSHIP_DELIVERY] = Airship.ResponseAirshipDelivery;
network.packetMap[gv.CMD.AIRSHIP_CANCEL] = Airship.ResponseAirshipCancel;
network.packetMap[gv.CMD.AIRSHIP_FRIEND_GET] = Airship.ResponseAirshipFriendGet;
network.packetMap[gv.CMD.AIRSHIP_GET] = Airship.ResponseAirshipCommon;
