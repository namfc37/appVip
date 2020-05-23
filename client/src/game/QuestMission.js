const ENABLE_QUEST_MISSION = g_MISCINFO.QUEST_MISSION_ACTIVE;

var QuestMission =
{
	missionData: null,
	displayData: null,
	currentHintWidget: null,
	checkStockQuests: [], // quests that requires stock checking
	questsToSave: [],
	
	init:function()
	{
		cc.log ("QuestMission", "init", "ENABLE_QUEST_MISSION", ENABLE_QUEST_MISSION);

		if(!ENABLE_QUEST_MISSION)
			return;
			
		this.updateMissionData();
	},
	
	updateMissionData:function()
	{
		cc.log ("QuestMission", "updateMissionData");
		this.missionData = gv.mainUserData.game[GAME_QUEST_MISSION];
		if (!this.missionData)
		{
			cc.log ("QuestMission", "updateMissionData", "DON'T HAVE DATA");
			this.displayData = null;
			return;
		}

		var groupId = this.missionData[QUEST_MISSION_GROUP_ID];
		var rewards = this.missionData[QUEST_MISSION_REWARDS];
		var missions = this.missionData[QUEST_MISSION_ITEMS];
		var GROUP = g_QUEST_MISSION.GROUPS [groupId];

		if (!GROUP)
		{
			cc.log ("QuestMission", "updateMissionData", "GROUP", groupId, "CAN NOT FOUND");
			this.displayData = null;
			return;
		}

		this.displayData = {};
		this.displayData.title = GROUP.TITLE;
		this.displayData.subtitle = GROUP.DESC;
		this.displayData.rewards = FWUtils.getItemsArray(rewards);
		this.displayData.isFinish = true;
		this.displayData.missionRemain = missions.length;
		this.displayData.missions = [];

		for (var i in missions)
		{
			var missionData = missions [i];
			var id = missionData[QUEST_ID];
			var action = missionData[QUEST_ACTION];
			var target = missionData[QUEST_TARGET];
			var require = missionData[QUEST_REQUIRE];
			var current = missionData[QUEST_CURRENT];
			var actionData = Game.getActionById(action);

			var missionDisplay = {};
			missionDisplay.id = id;
			missionDisplay.icon = "ACTION_" + action;
			missionDisplay.isCompleted = (current >= require);
			missionDisplay.progress = current + "/" + require;
			//missionDisplay.hint = FWLocalization.text("TXT_ACHIEVEMENT_ACTION_HINT_" + action);
			missionDisplay.hint = FWLocalization.text(actionData.HINT);
			switch (action)
			{
				case g_ACTIONS.ACTION_PLANT_HARVEST.VALUE:
				case g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE:
					missionDisplay.extend = "hud/icon_harvest.png";
					missionDisplay.extend_scale = 0.5;
				break;
				// case ACTION_MACHINE_UNLOCK:
				// 	missionDisplay.extend = "items/icon_machine_egg_unlock.png";
				// 	missionDisplay.extend_scale = 0.5;
				// break;
				// case ACTION_MACHINE_UNLOCK_FINISH:
				// 	missionDisplay.extend = "items/icon_machine_egg_finish.png";
				// 	missionDisplay.extend_scale = 0.5;
				// break;
				default:
					missionDisplay.extend = false;
					missionDisplay.extend_scale = 1;
				break;
			}
			
			var desc = FWLocalization.text("TXT_MISSION_DESC_" + action);
			var targetName = target ? target : "";
			
			if (defineMap[targetName])
			{
				missionDisplay.icon = target;
				targetName = FWLocalization.text("TXT_" + targetName);
			}
			
			desc = desc.split("|");
			for (var j = 0; j < 5; j++)
			{
				if (desc.length > j)
				{
					if (desc [j].indexOf("[require]") != -1)
					{
						missionDisplay ["lb_" + j] = desc [j].replace ("[require]", "" + require);
						missionDisplay ["lb_" + j + "_style"] = TEXT_STYLE_TEXT_NO_EFFECT_WHITE_DARK;
					}
					else if (desc [j].indexOf("[target]") != -1)
					{
						missionDisplay ["lb_" + j] = desc [j].replace ("[target]", targetName);
						missionDisplay ["lb_" + j + "_style"] = TEXT_STYLE_TEXT_NO_EFFECT_WHITE_DARK;
					}
					else
					{
						missionDisplay ["lb_" + j] = desc [j];
						missionDisplay ["lb_" + j + "_style"] = TEXT_STYLE_QUEST_MISSION_ITEM_DESC;
					}
				}
				else
				{
					missionDisplay ["lb_" + j] = "";
					missionDisplay ["lb_" + j + "_style"] = TEXT_STYLE_QUEST_MISSION_ITEM_DESC;
				}
			}

			if (missionDisplay.isCompleted)
				this.displayData.missionRemain -= 1;

			cc.log ("QuestMission", "updateMissionData", "mission", id, action, target, current + "/" + require, this.displayData.missionRemain);
			this.displayData.missions.push (missionDisplay);
		}

		cc.log ("QuestMission", "updateMissionData", "remain", this.displayData.missionRemain);
		this.displayData.isFinish = this.displayData.missionRemain === 0;
	},
	
	show:function()
	{
		this.checkMissions();
		this.updateMissionData();

		var widget = FWPool.getNode(UI_QUEST_MISSION, false);

		if (!this.displayData)
		{
			if (FWUI.isWidgetShowing(widget))
				this.hide();
			
			return;
		}

		var rewardItemDef = {
			gfx:{type:UITYPE_ITEM, field:"itemId", scale:0.8},
			amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true}
		};
		
		var itemDef = {
			// feedback
			//target_item:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			bgItem:{onTouchBegan:this.showHint.bind(this), onTouchEnded:this.hideHint.bind(this), forceTouchEnd:true},
			icon:{type:UITYPE_ITEM, field:"icon"},
			extend_icon:{type:UITYPE_IMAGE, field:"extend", visible:"data.extend", scale:"data.extend_scale"},
			lb_0:{type:UITYPE_TEXT, field:"lb_0", style:"data.lb_0_style"},
			lb_1:{type:UITYPE_TEXT, field:"lb_1", style:"data.lb_1_style"},
			lb_2:{type:UITYPE_TEXT, field:"lb_2", style:"data.lb_2_style"},
			lb_3:{type:UITYPE_TEXT, field:"lb_3", style:"data.lb_3_style"},
			lb_4:{type:UITYPE_TEXT, field:"lb_4", style:"data.lb_4_style"},
			lb_progress:{type:UITYPE_TEXT, field:"progress", style:TEXT_STYLE_NUMBER, visible:"!data.isCompleted"},
			icon_completed:{visible:"data.isCompleted"}
		};

		var uiDef = {
			lblTitle:{type:UITYPE_TEXT, value:"TXT_MISSION_TITLE"},
			btn_close:{onTouchEnded:this.hide.bind(this)},
			lb_title:{type:UITYPE_TEXT, value:this.displayData.title},
			lb_subtitle:{type:UITYPE_TEXT, value:"TXT_MISSION_SUBTITLE", style:TEXT_STYLE_TEXT_DIALOG},
			list_rewards:{type:UITYPE_2D_LIST, items:this.displayData.rewards, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
			list_mission:{type:UITYPE_2D_LIST, items:this.displayData.missions, itemUI:UI_QUEST_MISSION_ITEM, itemDef:itemDef, itemSize:cc.size(560, 85)},
			btn_claim_reward:{onTouchEnded:this.claimReward.bind(this), visible:true, enabled:this.displayData.isFinish},
			lb_claim_reward:{type:UITYPE_TEXT, value:"TXT_EVENT_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
			hint:{visible:false},
			lb_hint:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_DIALOG},
			lb_npc:{type:UITYPE_TEXT, value:this.displayData.subtitle, style:TEXT_STYLE_TEXT_DIALOG},
			bg:{type:UITYPE_IMAGE, value:"common/images/hud_mission_bg03.png", isLocalTexture:true, discard:true},
		};

		if (FWUI.isWidgetShowing(widget))
		{
			FWUI.fillData(widget, null, uiDef);
		}
		else
		{
			FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);
			
			Game.gameScene.registerBackKey(this.hideFunc);
		}

		this.updateNpc ();
	},
	
	hide:function()
	{
		if (this.currentHintWidget)
			this.currentHintWidget.setVisible(false);

		FWUI.hide(UI_QUEST_MISSION, UIFX_POP);

		if (this.npcAnim)
		{
			this.npcAnim.node.removeFromParent();
			this.npcAnim = null;
		}

		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
	},
	
	uninit:function()
	{
		if(!ENABLE_QUEST_MISSION)
			return;
		
		if(this.iconAlert)
		{
			this.iconAlert.removeFromParent();
			this.iconAlert = null;
		}
	},
	
	check:function()
	{
		if (!this.displayData)
			return false;
        
		return this.checkLevel ();
	},

	checkLevel:function()
	{
		return g_MISCINFO.QUEST_MISSION_USER_LEVEL_MIN <= gv.mainUserData.getLevel() && gv.mainUserData.getLevel() <= g_MISCINFO.QUEST_MISSION_USER_LEVEL_MAX;
	},

	checkMissions:function()
	{
		if(Game.isFriendGarden())
			return;
		
		this.missionData = gv.mainUserData.game[GAME_QUEST_MISSION];
		var missions = this.missionData[QUEST_MISSION_ITEMS];
		for (var i in missions)
		{
			var missionData = missions [i];
			var id = missionData[QUEST_ID];
			var action = missionData[QUEST_ACTION];
			var target = missionData[QUEST_TARGET];
			var require = missionData[QUEST_REQUIRE];
			var current = missionData[QUEST_CURRENT];

			if (current >= require)
				continue;
			
			switch (action)
			{
				case g_ACTIONS.ACTION_MACHINE_UNLOCK.VALUE:
				{
					if (target !== undefined || target !== null)
					{
						var machine = gv.userMachine.getMachineById(target);
						cc.log ("QuestMission", "checkMission", "ACTION_MACHINE_UNLOCK", target, machine ? machine.state : "unknow");
						if (machine && machine.state > MACHINE_STATE_UNLOCKABLE)
							Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UNLOCK.VALUE, target, 1);
					}
				}
				break;
				case g_ACTIONS.ACTION_MACHINE_UNLOCK_FINISH.VALUE:
				{
					if (target !== undefined || target !== null)
					{
						var machine = gv.userMachine.getMachineById(target);
						cc.log ("QuestMission", "checkMission", "ACTION_MACHINE_UNLOCK_FINISH", target, machine ? machine.state : "unknow");
						if (machine && machine.state > MACHINE_STATE_GROWING_FULL)
							Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UNLOCK_FINISH.VALUE, target, 1);
					}
				}
				break;
				case g_ACTIONS.ACTION_MACHINE_SLOT_UNLOCK.VALUE:
				{
					if (target !== undefined || target !== null)
					{
						var machine = gv.userMachine.getMachineById(target);
						cc.log ("QuestMission", "checkMission", "ACTION_MACHINE_SLOT_UNLOCK", target, machine.slotCount);
						if (machine && machine.state > MACHINE_STATE_GROWING_FULL)
						{
							var numSlotUnlocked = machine.slotCount - 2; //ban dau co san 2 slot
							if (current < require && numSlotUnlocked > current)
								Achievement.onAction(g_ACTIONS.ACTION_MACHINE_SLOT_UNLOCK.VALUE, target, numSlotUnlocked - current);
							/*
							var maxSlot = g_MACHINE [target].UNLOCK_REQUIRES_DIAMOND.length;
							var currentSlot = machine.slotCount;
							var remain = require - current;
							cc.log ("QuestMission", "checkMission", "ACTION_MACHINE_SLOT_UNLOCK", currentSlot + "/" + maxSlot, remain);
							if (currentSlot + remain > maxSlot)
								Achievement.onAction(ACTION_MACHINE_SLOT_UNLOCK, target, remain);*/
						}
					}
				}
				break;
				case g_ACTIONS.ACTION_FLOOR_UNLOCK.VALUE:
				{
					if (target !== undefined || target !== null)
					{
						cc.log ("QuestMission", "checkMission", "ACTION_FLOOR_UNLOCK", target, CloudFloors.getLastUnlockedFloorIdx() + 1);
						if (CloudFloors.getLastUnlockedFloorIdx() + 1 >= target)
							Achievement.onAction(g_ACTIONS.ACTION_FLOOR_UNLOCK.VALUE, target, 1);
					}
				}
				break;
				case g_ACTIONS.ACTION_TOM_HIRE.VALUE:
				{
					if (gv.tomkid)
					{
						cc.log ("QuestMission", "checkMission", "ACTION_TOM_HIRE", gv.tomkid.isHiring(), gv.tomkid.getHireType ());
						if (gv.tomkid.isHiring() && require === 1)
							Achievement.onAction(g_ACTIONS.ACTION_TOM_HIRE.VALUE, gv.tomkid.getHireType (), 1);
					}
				}
				break;
				case g_ACTIONS.ACTION_MACHINE_UPGRADE.VALUE:
				{
					if (target !== undefined || target !== null) {
						var machine = gv.userMachine.getMachineById(target);
						var numTimeUpgrade = machine ? machine.level - 1 : 0;
						cc.log("QuestMission", "checkMission", "ACTION_MACHINE_UPGRADE", target, numTimeUpgrade);
						if (current < require && numTimeUpgrade > current)
							Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UPGRADE.VALUE, target, numTimeUpgrade - current);
					}
					break;
				}
			}
		}
	},

	reload:function (callback)
	{
		this.reloadCallback = callback;

		var pk = network.connector.client.getOutPacket(this.RequestQuestMissionGet);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
	refreshHomeIcon:function()
	{
		if(!ENABLE_QUEST_MISSION)
			return;
		if(this.iconAlert) this.iconAlert.removeFromParent();
		var button = Game.gameScene.getDynamicButtonById("questMission");
		if (!button)
			return;
		var spriteButton= FWUI.getChildByName (button, "sprite");



		this.iconAlert = new cc.Sprite("#hud/icon_alert_01.png");
		this.iconAlert.setOpacity(255);
		this.iconAlert.setScale(0.9);
		this.iconAlert.setVisible(false);
		this.iconAlert.setPosition(cc.p(spriteButton.getContentSize().width - 12, spriteButton.getContentSize().height - 15));
		button.addChild(this.iconAlert, 999);

		var levelUser = gv.mainUserData.getLevel();

		if(levelUser < g_MISCINFO.QUEST_MISSION_USER_LEVEL_MIN || levelUser > g_MISCINFO.QUEST_MISSION_USER_LEVEL_MAX)
		{
			return;
		}
		else
		{
			this.iconAlert.setVisible(true);
		}


		var status = QuestMission.btn_status ();

		if(status.notifyNew||status.notifyCompleted){
			var pathImg = status.notifyNew? "#hud/button_new.png":"#hud/button_complete.png";
			this.iconAlert.setVisible(false);
			if(this.notifyMission)
			{
				this.notifyMission.stopAllActions();
				this.notifyMission.removeFromParent();
			}

			var notifyMission = new cc.Sprite(pathImg);
			notifyMission.setOpacity(255);
			notifyMission.setScale(1);
			notifyMission.setAnchorPoint(0.05, 0.5);
			notifyMission.setPosition(cc.p(spriteButton.getContentSize().width - notifyMission.getContentSize().width,spriteButton.getContentSize().height/2));
			notifyMission.stopAllActions();

			notifyMission.runAction(
				cc.sequence(
					cc.moveTo(1,cc.p((spriteButton.getContentSize().width - 12),spriteButton.getContentSize().height/2)),
					cc.delayTime(4),
					cc.moveTo(1,cc.p((spriteButton.getContentSize().width - notifyMission.getContentSize().width),spriteButton.getContentSize().height/2)),
					cc.callFunc(function() {
						notifyMission.removeFromParent();
						if(status.notifyNew)
							QuestMission.notifyNew = false;
						else
							QuestMission.notifyCompleted = true;
						QuestMission.iconAlert.setVisible(true);
						QuestMission.notifyMission = null;
					})
				)
			);
			button.addChild(notifyMission,9);

			this.notifyMission = notifyMission;
		}

		this.iconAlert.removeAllChildren();
		if(status.missionRemain>0){
			var labelNumber	= FWUtils.createUIText(status.missionRemain, cc.p(this.iconAlert.getContentSize().width/2,this.iconAlert.getContentSize().height- 13), cc.size(40, 40), cc.color.WHITE, 22, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER, FONT_DEFAULT);
			labelNumber.setName("labelNumber");
			labelNumber.setVisible(true);
			this.iconAlert.addChild(labelNumber,1);
		}
		else
		{
			var iconCheck = new cc.Sprite("#hud/order_icon_check.png");
			iconCheck.setOpacity(255);
			iconCheck.setScale(1);
			iconCheck.setVisible(true);
			iconCheck.setAnchorPoint(0.5, 0.5);
			iconCheck.setName("iconCheck");
			iconCheck.setPosition(cc.p(this.iconAlert.getContentSize().width/2,this.iconAlert.getContentSize().height/2));
			this.iconAlert.addChild(iconCheck,1);
		}
	},

	btn_status:function ()
	{
		var status = {};

		if(QuestMission.notifyNew)
		{
			status.notifyNew = QuestMission.notifyNew;
		}

		if (QuestMission.displayData){
			status.missionRemain = QuestMission.displayData.missionRemain;
			status.notifyCompleted = QuestMission.displayData.missionRemain == 0 && !QuestMission.notifyCompleted;
		}
		return status;
	},
	
	showHint:function(sender)
	{
		if(!this.currentHintWidget)
		{
			var widget = FWPool.getNode(UI_QUEST_MISSION, false);
			this.currentHintWidget = widget.getChildByName("hint");
		}
		
		var hintText = this.currentHintWidget.getChildByName("lb_hint");
		hintText.setString(sender.uiData.hint);
		
		this.currentHintWidget.setVisible(true);
		
		// feedback
		//var pos = FWUtils.getWorldPosition(sender);
		var pos = FWUtils.getWorldPosition(sender);
		
		pos.y += 45;
		this.currentHintWidget.setPosition(pos);
	},
	
	hideHint:function(sender)
	{
		this.currentHintWidget.setVisible(false);
	},
	
	updateNpc:function()
	{
		var widget = FWPool.getNode(UI_QUEST_MISSION, false);

		if (!this.npc)
			this.npc = FWUI.getChildByName(widget, "NPC");
		
		if (!this.npcAnim || !this.npcAnim.spine)
		{
			this.npcAnim = new FWObject();
			this.npcAnim.initWithSpine(SPINE_NPC_MISSION);
			this.npcAnim.setScale(0.35);
			this.npcAnim.setParent(this.npc);
		}

		var i = this.displayData.isFinish ? 2 : 1;

		switch (i)
		{
			case 1:
			{
				this.npcAnim.setAnimation("red_emo1", true);
				this.npc.setScale(1, 1);
			}
			break;

			case 2:
			{
				this.npcAnim.setAnimation("red_emo2", true);
				this.npc.setScale(1, 1);
			}
			break;
		}
	},

	onAction:function(action, item, count)
	{
		cc.log("QuestMission", "onAction", action, item, count);
		if (!this.check ())
			return;
		
		var missions = this.missionData[QUEST_MISSION_ITEMS];

		for(var i in missions)
		{
			var mission = missions[i];
			
			if (mission[QUEST_ACTION] === action
			&& (!mission [QUEST_TARGET] || mission [QUEST_TARGET] === item)
			&& (mission [QUEST_CURRENT] < mission [QUEST_REQUIRE])
			){
				mission[QUEST_CURRENT] += count;
				if (mission [QUEST_CURRENT] >= mission [QUEST_REQUIRE])
					mission [QUEST_CURRENT] = mission [QUEST_REQUIRE];

				this.saveMission (mission [QUEST_ID], mission [QUEST_CURRENT]);
				// this.queue [mission [QUEST_ID]] = mission [QUEST_CURRENT];
			}
		}
	},
	
	updateStockMission:function()
	{
		if (!this.missionData)
			return;
		
		var missions = this.missionData[QUEST_MISSION_ITEMS];

		for(var i in missions)
		{
			var mission = missions[i];
			if (mission [QUEST_CURRENT] >= mission [QUEST_REQUIRE])
				continue;

			var current = mission [QUEST_CURRENT];
			switch (mission[QUEST_ACTION])
			{
				case g_ACTIONS.ACTION_CHECK_COMBO_POT.VALUE:
				{
					var pots = g_COMBO[mission[QUEST_TARGET]].CHILDREN;
					var count = 0;
					for (var id in pots)
						if (gv.userStorages.getItemAmount(pots[id]) > 0)
							count += 1;
					
					if (current < count)
						current = count;
				}
				break;

				case g_ACTIONS.ACTION_CHECK_DECOR.VALUE:
				{
					var stockDecors = gv.userStorages.getAllItemOfType(defineTypes.TYPE_DECOR);
					if (current < stockDecors.length)
						current < stockDecors.length;
				}
				break;
			}

			if (current <= mission [QUEST_CURRENT])
				continue;
			
			mission[QUEST_CURRENT] = current;
			if (mission [QUEST_CURRENT] >= mission [QUEST_REQUIRE])
				mission [QUEST_CURRENT] = mission [QUEST_REQUIRE];

			this.saveMission (mission [QUEST_ID], mission [QUEST_CURRENT]);
		}
	},

	saveMission:function(misisonId, missionCurrent)
	{
		var pk = network.connector.client.getOutPacket(this.RequestQuestMissionSave);
		pk.pack(misisonId, missionCurrent);
		network.connector.client.sendPacket(pk);

		QuestMission.refreshHomeIcon();
	},

	claimReward:function(sender)
	{
		if (this.missionData[QUEST_MISSION_CLAIM_REWARDS])
			return;

		if (!this.displayData.isFinish)
			return;
		
		Game.showGiftPopup(this.displayData.rewards, "", this.onClaimRewards.bind(this));
	},
	
	onClaimRewards:function()
	{
		// fake
		this.missionData[QUEST_MISSION_CLAIM_REWARDS] = true;
		FWUtils.disableAllTouches(true);

		this.hide();
		// server
		var pk = network.connector.client.getOutPacket(this.RequestQuestMissionClaimReward);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		

	RequestQuestMissionSave:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_MISSION_SAVE_PROGRESS);},
		pack:function(uid, point)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_SLOT_ID, uid);
			PacketHelper.putInt(this, KEY_SLOT_OBJECT, point);
			
			addPacketFooter(this);
		},
	}),

	ResponseQuestMissionSave:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			cc.log("QuestMission", "ResponseQuestMissionSave", "error", this.getError());

			var object = PacketHelper.parseObject(this);
			var id = object[KEY_SLOT_ID];
			var current = object[KEY_SLOT_OBJECT];

			if(id > -1 && current > -1)
			{
				cc.log("QuestMission", "ResponseQuestMissionSave", "quest", id, current);

				var missions = gv.mainUserData.game[GAME_QUEST_MISSION][QUEST_MISSION_ITEMS];
				for (var i in missions)
				{
					var missionData = missions [i];
					if (missionData [QUEST_ID] === id)
					{
						missionData [QUEST_CURRENT] = current;
						break;
					}
				}
			}

			if(FWUI.isShowing(UI_QUEST_MISSION))
				QuestMission.show();
			else
				QuestMission.updateMissionData();
			
			QuestMission.refreshHomeIcon();
		}
	}),
	
	RequestQuestMissionClaimReward:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_MISSION_CLAIM_REWARD);},
		pack:function()
		{
			cc.log("QuestBook::RequestQuestMissionClaimReward");
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseQuestMissionClaimReward:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			cc.log("QuestMission::ResponseQuestMissionClaimReward", "error", this.getError());
			
			var obj = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(obj);
			gv.mainUserData.game[GAME_QUEST_MISSION] = obj [KEY_QUEST_MISSION];
			
			if(FWUI.isShowing(UI_QUEST_MISSION))
				QuestMission.show();
			else
				QuestMission.updateMissionData();

			QuestMission.notifyNew = true;
			QuestMission.notifyCompleted= false;
			QuestMission.refreshHomeIcon();
		}
	}),	
	
	RequestQuestMissionGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.QUEST_MISSION_GET);},
		pack:function(uid)
		{
			addPacketHeader(this);
			addPacketFooter(this);
		},
	}),

	ResponseQuestMissionGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			if(this.getError() !== 0)
				cc.log("QuestMission::ResponseQuestMissionGet", "error", this.getError());
			
			var obj = PacketHelper.parseObject(this);
			gv.mainUserData.game[GAME_QUEST_MISSION] = obj [KEY_QUEST_MISSION];

			if (QuestMission.reloadCallback)
				QuestMission.reloadCallback ();
			else
			{
				if(FWUI.isShowing(UI_QUEST_MISSION))
					QuestMission.show();
				else
					QuestMission.updateMissionData();
				
				QuestMission.refreshHomeIcon();
			}
		}
	}),
};

network.packetMap[gv.CMD.QUEST_MISSION_SAVE_PROGRESS] = QuestMission.ResponseQuestMissionSave;
network.packetMap[gv.CMD.QUEST_MISSION_CLAIM_REWARD] = QuestMission.ResponseQuestMissionClaimReward;
network.packetMap[gv.CMD.QUEST_MISSION_GET] = QuestMission.ResponseQuestMissionGet;