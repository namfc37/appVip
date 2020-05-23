
const CHANGE_GARDEN_DELAY = 1; // wait for transition to finish before actually changing garden
const USER_ID_JACK = 0;

var ChangeGardenScene = cc.Scene.extend
({
	enableAnimation: 0, // 0: none, 1: run left to right, -1: run right to left
	text: null,
	spine: null,

	onEnter:function()
	{
		this._super();

		if(this.enableAnimation)
		{
			var bottomCloud = new cc.Sprite("#hud/hud_ip_shop_top_menu.png");
			bottomCloud.setPosition(cc.winSize.width / 2, DARKBG_CLOUD_HEIGHT / 2);
			bottomCloud.setLocalZOrder(0);
			bottomCloud.setScale(1, -1);
			this.addChild(bottomCloud);

			if(this.text)
			{
				var label = FWUtils.createUIText(this.text, cc.p(cc.winSize.width / 2, 25), cc.size(1000, 100), cc.color.WHITE, FONT_SIZE_DEFAULT, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER, FONT_ITALIC);
				label.setLocalZOrder(10);
				FWUI.applyTextStyle(label, TEXT_STYLE_LOADING);
				this.addChild(label);
			}

			var y = 55;
			var w = 170;
			var duration = 2;
			this.spine = FWLoader.loadSpine(SPINE_LOADING_RUN);
			this.spine.setLocalZOrder(20);
			this.spine.setAnimation(0, "loading_run", true);
			if(this.enableAnimation === 1)
			{
				// ltr
				this.spine.setPosition(w, y);
				this.spine.runAction(cc.repeatForever(cc.sequence(
					cc.callFunc(function() {this.spine.setScale(-1, 1)}.bind(this)),
					cc.moveTo(duration, cc.p(cc.winSize.width - w, y)),
					cc.callFunc(function() {this.spine.setScale(1, 1)}.bind(this)),
					cc.moveTo(duration, cc.p(w, y))
					)));
			}
			else
			{
				// rtl
				this.spine.setPosition(cc.winSize.width - w, y);
				this.spine.runAction(cc.repeatForever(cc.sequence(
					cc.callFunc(function() {this.spine.setScale(1, 1)}.bind(this)),
					cc.moveTo(duration, cc.p(w, y)),
					cc.callFunc(function() {this.spine.setScale(-1, 1)}.bind(this)),
					cc.moveTo(duration, cc.p(cc.winSize.width - w, y))
					)));
			}
			this.addChild(this.spine);
		}
	},

	onExit:function()
	{
		this._super();

		if(this.spine)
			FWPool.returnNode(this.spine);

		FWUtils.onSceneExit();
	},

	// must be set before entering scene
	enableAnimation:function(enable, text)
	{
		this.enableAnimation = enable;
		this.text = text;
	},
});

var GardenManager =
{
	changeGardenScene: null,
	nextUserId: null,
	friendBugs: null,
	friendBugSpines: null,
	visitedFriendIds: [],

	changeGarden:function(userId, userName, avatarUrl,userVip)
	{
		if(userId === gv.userData.userId && Game.gameScene)
		{
			if(userId === gv.mainUserData.mainUserId)
				FriendList.hide(); //newfl gv.friendPanel.panel.hide();
			return;
		}

		cc.log("GardenManager::changeGarden: " + userId);

		this.nextUserId = userId;
		this.nextUserName = userName;
		this.nextAvatarUrl = avatarUrl;
		this.nextUserVip = userVip;

		gv.userData.game[GAME_VIP] = this.nextUserVip;

		var changeGardenScene = new ChangeGardenScene();
		if(userId === gv.mainUserData.mainUserId)
		{
			Truck.canTouchTruckMarker = true;
			changeGardenScene.enableAnimation(-1, FWLocalization.text("TXT_LOADING_GO_HOME"));
		}
		else
			changeGardenScene.enableAnimation(1, FWLocalization.text("TXT_LOADING_VISIT_FRIEND"));
		FWUtils.setCurrentScene(changeGardenScene);

		cc.director.getScheduler().scheduleCallbackForTarget(this, this.changeGarden2, 0, 0, CHANGE_GARDEN_DELAY, false);

		if(userId === USER_ID_JACK)//if(userId !== gv.mainUserData.mainUserId)
		{
			var pk = network.connector.client.getOutPacket(GardenManager.RequestFriendBugGet);
			pk.pack(userId);
			network.connector.client.sendPacket(pk);
		}
		cc.log("USER VIP BEFORE CALL SERVER ",gv.userData.game[GAME_VIP]);
		// jira#6011
		if(Game.gameScene)
		QuestBook.saveQuests();
	},

	changeGarden2:function()
	{
		if(this.nextUserId === gv.mainUserData.mainUserId)
		{
			//gv.userData = gv.mainUserData;
			//this.onFriendGardenLoaded();
			network.connector.sendRequestUserData();
		}
		else
		{
			if(this.nextUserId === USER_ID_JACK)
			{
				// use preset data
				var func = function(error, data)
				{
					Game.loadUserData(data, false);
					gv.userData.userName = FWLocalization.text("TXT_NPC_JACK");
					cc.log("USER VIP BEFORE LOAD JSON ",gv.userData.game[GAME_VIP]);
					// override machine data
					cc.log("GardenManager::changeGarden2: gv.jackMachine=" + JSON.stringify(gv.jackMachine));
					var durability;
					for(var i=0; i<gv.jackMachine.length && i<gv.userData.game[GAME_FLOORS].length; i++) {
						var machineDefine = g_MACHINE[g_FLOOR[i].MACHINE];


						var levelIndex = Math.max(gv.userData.game[GAME_FLOORS][i][FLOOR_MACHINE][MACHINE_LEVEL] - 1, 0);
						durability = machineDefine.DURABILITY_INIT + levelIndex * machineDefine.DURABILITY_ADD;
						if (gv.jackMachine[i] <= 0) {
							var delta = 0;
							for(var level in g_JACKS_GARDEN.MACHINES) {
								if (level > gv.mainUserData.getLevel())
									break;
								delta = _.random(g_JACKS_GARDEN.MACHINES[level].DURABILITY_MIN, g_JACKS_GARDEN.MACHINES[level].DURABILITY_MAX);
							}
							durability -= delta;
						}
						gv.userData.game[GAME_FLOORS][i][FLOOR_MACHINE][MACHINE_DURABILITY] = durability;
					}

					// jira#6152
					for(var i=0; i<MAX_FLOORS; i++)
					{
						//gv.userData.game[GAME_FLOORS][i][FLOOR_MACHINE][MACHINE_LEVEL] = 10; // setting level to 10 will generate error message when repairing

						var skinData = {};
						var idx = (Math.floor(i / 2) + 1);
						if(idx >= 5)
							idx = 0;
						skinData[SKIN_ID] = "SK" + idx;
						skinData[SKIN_START_TIME] = skinData[SKIN_END_TIME] = -1;
						gv.userData.game[GAME_FLOORS][i][FLOOR_SKIN] = skinData;
					}

					cc.log("GardenManager::changeGarden2: gv.jackShop=" + JSON.stringify(gv.jackShop));

					GardenManager.onFriendGardenLoaded();

					if(GardenManager.visitedFriendIds.indexOf(USER_ID_JACK) < 0)
					{
						GardenManager.visitedFriendIds.push(USER_ID_JACK);
						Achievement.onAction(g_ACTIONS.ACTION_FRIEND_VISIT.VALUE, null, 1);
					}
				};
				if(cc.sys.isNative)
					cc.loader.loadJson("res/jack.json", func);//cc.loader.loadJson("src/constants/jack.json", func);
				else
				{
					var data = cc.loader.getRes("jack.json");
					func(null, data);
				}
				
				cc.log("USER VIP BEFORE LOAD JSON 2",gv.userData.game[GAME_VIP]);
			}
			else
			{
				// load
				var pk = network.connector.client.getOutPacket(GardenManager.RequestFriendVisit);
				pk.pack(this.nextUserId);
				network.connector.client.sendPacket(pk);
			}
		}
		cc.log("USER VIP BEFORE LOAD CHANGEGRADEN2 ",gv.userData.game[GAME_VIP]);
	},

	onFriendGardenLoaded:function()
	{
		gv.userData.userId = this.nextUserId;

		if(this.nextUserId !== gv.mainUserData.mainUserId)
		{
			// friend's garden
			// generate bugs
			var bugList = [];
			for(var key in this.friendBugs)
			{
				for(var i=0; i<this.friendBugs[key]; i++)
					bugList.push(key);
			}
			var slotList = [];
			var lastUnlockedFloorIdx = CloudFloors.getLastUnlockedFloorIdx();
			for(var i=0; i<=lastUnlockedFloorIdx; i++)
			{
				for(var j=0; j<MAX_SLOTS_PER_FLOOR; j++)
				{
					var slotData = CloudFloors.getSlotData(i, j);
					if(slotData[SLOT_PLANT])
					{
						slotData[SLOT_PEST] = "";
						slotList.push({floorIdx:i, slotIdx:j, data:slotData});
					}
				}
			}
			for(var i=0; i<bugList.length && slotList.length > 0; i++)
			{
				var j = _.random(0, slotList.length - 1);
				slotList[j]["data"][SLOT_PEST] = bugList[i];
				cc.log("GardenManager::onFriendGardenLoaded: bug " + bugList[i] + " => slot[" + slotList[j].floorIdx + "," + slotList[j].slotIdx + "] plant=" + slotList[j]["data"][SLOT_PLANT]);
				slotList.splice(j, 1);
			}
		}

		Game.gameScene = new GameScene();
		FWUtils.setCurrentScene(Game.gameScene);
		this.friendBugSpines = [];
	},

///////////////////////////////////////////////////////////////////////////////////////
//// server ///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	RequestFriendVisit:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_VISIT);},
		pack:function(userId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, userId);
			
			addPacketFooter(this);
		},
	}),

	ResponseFriendVisit:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(!this.getError())
			{
				var userData;
				if(cc.sys.isNative)
					userData = _.clone(gv.userData);
				else
					userData = cc.clone(gv.userData);
				
				var object = PacketHelper.parseObject(this);
				userData.setGame(object[KEY_FRIEND_GAME]);
				userData.userId = GardenManager.nextUserId;
				userData.userName = userData.game[GAME_NAME] = GardenManager.nextUserName;;
				userData.game[GAME_AVATAR] = GardenManager.nextAvatarUrl;
				userData.game[GAME_RANKING_PR] = gv.mainUserData.game[GAME_RANKING_PR]; // fix: incorrect garden value
				userData.setCoin(gv.mainUserData.getCoin());
				userData.setGold(gv.mainUserData.getGold());
				userData.setReputation(gv.mainUserData.getReputation());
				userData.privateShop = object[KEY_FRIEND_SHOP];
				userData.airship = object[KEY_FRIEND_AIRSHIP];
				userData.game[GAME_VIP] = object[KEY_VIP][VIP_CURRENT_ACTIVE];
				cc.log("[ChangeGardenScene] FriendVisit Vip ",userData.game[GAME_VIP]);
				
				// guild
				userData.guildId = object[KEY_GUILD];
				cc.log("[ChangeGardenScene] guildId=" + userData.guildId);

				var truckData = object[KEY_FRIEND_GAME][GAME_TRUCK];
				Truck.setData(truckData,true);

				gv.userData = userData;
				GardenManager.friendBugs = object[KEY_FRIEND_BUG];
				GardenManager.onFriendGardenLoaded();

				if(GardenManager.visitedFriendIds.indexOf(userData.userId) < 0)
				{
					GardenManager.visitedFriendIds.push(userData.userId);
					Achievement.onAction(g_ACTIONS.ACTION_FRIEND_VISIT.VALUE, null, 1);
				}
			}
			else
			{
				cc.log("GardenManager::ResponseFriendVisit: error=" + this.getError());
				gv.userData.userId = -1;
				GardenManager.changeGarden(gv.mainUserData.mainUserId);
			}
		}
	}),

	RequestFriendBugGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_BUG_GET);},
		pack:function(friendId)
		{
			GardenManager.friendBugs = null;

			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, friendId);
			
			addPacketFooter(this);
		},
	}),

	ResponseFriendBugGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			if(!this.getError())
			{
				var object = PacketHelper.parseObject(this);
				GardenManager.friendBugs = object[KEY_FRIEND_BUG];
				cc.log("GardenManager::ResponseFriendBugGet: friendBugs=" + JSON.stringify(GardenManager.friendBugs));
			}
			else
				cc.log("GardenManager::ResponseFriendBugGet: error=" + this.getError());
		}
	}),

	RequestFriendBugCatch:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_BUG_CATCH);},
		pack:function(itemId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			
			addPacketFooter(this);
		},
	}),

	ResponseFriendBugCatch:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var bugId = object[KEY_ITEM_ID];
			GardenManager.friendBugs = object[KEY_FRIEND_BUG];
			Game.updateUserDataFromServer(object);

			// flying spine
			// - success => fly to storage icon
			// - failure => hide + show message
			var spine = null;
			for(var i=0; i<GardenManager.friendBugSpines.length; i++)
			{
				if(GardenManager.friendBugSpines[i].bugId === bugId)
				{
					spine = GardenManager.friendBugSpines[i];
					break;
				}
			}

			if(this.getError())
			{
				cc.log("GardenManager::ResponseFriendBugCatch: error=" + this.getError());

				// failed
				// revert
				//gv.userStorages.removeItem(bugId, 1);
				//gv.userStorages.addItem(ID_NET_FRIEND, 1);

				if(spine)
				{
					FWUtils.showWarningText(FWLocalization.text("TXT_CATCH_FRIEND_BUG_ERROR"), FWUtils.getWorldPosition(spine), cc.WHITE);
					FWPool.returnNode(spine);
				}
			}
			else
			{
				// success
				if(spine)
				{
					spine.bugId = null; // jira#5679

					var delayTime = spine.fxStartTime + 1.1 - Game.getGameTimeInSeconds();
					if(delayTime <= 0)
						delayTime = 0.1;
					spine.runAction(cc.sequence(
						cc.delayTime(delayTime),
						cc.callFunc(function() {Game.flyToStorage(spine);})
					));

					// jira#5787
					var bonusItems = FWUtils.getItemsArray(object[KEY_BONUS_ITEMS]);
					FWUtils.removeArrayElementByKeyValue(bonusItems, "itemId", bugId);

					FWUtils.showFlyingItemIcons(bonusItems, FWUtils.getWorldPosition(spine));
				}

				Achievement.onAction(g_ACTIONS.ACTION_FRIEND_BUG_CATCH.VALUE, null, 1);
			}
		}
	}),

	RequestJackMachineRepair:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.JACK_MACHINE_REPAIR);},
		pack:function(floor, level, num)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_FLOOR, floor);
			PacketHelper.putByte(this, KEY_LEVEL, level);
			PacketHelper.putInt(this, KEY_NUM, num);
			
			addPacketFooter(this);
			FWUtils.disableAllTouches();
		},
	}),

	ResponseJackMachineRepair:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);

			var oldRepu = gv.userData.getReputation();
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);

			// jira#5762: refresh repair info for all machines
			if(!this.getError())
				gv.mainUserData.game[GAME_FRIEND_REPUTATION] += object[KEY_REPUTATION] - oldRepu;

			// refresh jack's machines
			gv.jackMachine = object[KEY_JACK_MACHINE];
			cc.log("GardenManager::ResponseJackMachineRepair: gv.jackMachine=" + JSON.stringify(gv.jackMachine));
			for(var i=0; i<gv.jackMachine.length; i++)
			{
				var machine = gv.userMachine.getMachineByFloor(i);
				if(machine && machine.state >= MACHINE_STATE_READY)
				{
					if (gv.jackMachine[i] > 0)
						machine.data[MACHINE_DURABILITY] = machine.maxDurability;
					machine.refresh(machine.data);
				}
			}

			var bonusItems = object[KEY_BONUS_ITEMS];
			bonusItems.REPU = object[KEY_REPUTATION] - oldRepu;
			cc.log("GardenManager::ResponseJackMachineRepair: bonus=" + JSON.stringify(bonusItems));
			gv.userMachine.showRepairResult(this.getError(), bonusItems);

			if(this.getError())
				cc.log("GardenManager::ResponseJackMachineRepair: error=" + this.getError());
			else
				Achievement.onAction(g_ACTIONS.ACTION_FRIEND_REPAIR_MACHINE.VALUE, null, 1);
		}
	}),

	RequestFriendRepairMachine:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.FRIEND_REPAIR_MACHINE);},
		pack:function(friendId, floor, num)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_FRIEND_ID, friendId);
			PacketHelper.putByte(this, KEY_FLOOR, floor);
			PacketHelper.putInt(this, KEY_NUM, num);
			
			addPacketFooter(this);
			FWUtils.disableAllTouches();
		},
	}),

	ResponseFriendRepairMachine:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);
			
			// data
			var oldRepu = gv.userData.getReputation();
			var oldGold = gv.userData.getGold();
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);

			// machine
			cc.log("GardenManager::ResponseFriendRepairMachine: machine=" + JSON.stringify(object[KEY_MACHINE]));
			if(Object.keys(object[KEY_MACHINE]).length > 0) //fix: machine => egg if repu exceeds daily repu
			{
				gv.userData.game[GAME_FLOORS][object[KEY_FLOOR]][FLOOR_MACHINE] = object[KEY_MACHINE];
				gv.userMachine.getMachineByFloor(object[KEY_FLOOR]).refresh(object[KEY_MACHINE]);
			}

			// jira#5762: refresh repair info for all machines
			if(!this.getError())
			{
				gv.mainUserData.game[GAME_FRIEND_REPUTATION] += object[KEY_REPUTATION] - oldRepu;
				for(var i=0; i<MAX_FLOORS; i++)
				{
					var machine = gv.userMachine.getMachineByFloor(i);
					if(machine)
						machine.showRepairInfo();
				}

				// jira#5818
				FWUtils.showFlyingItemIcon(ID_GOLD, object[KEY_GOLD] - oldGold, gv.userMachine.repairFxPos);
			}

			// fx
			var bonusItems = object[KEY_BONUS_ITEMS];
			bonusItems.REPU = object[KEY_REPUTATION] - oldRepu;
			cc.log("GardenManager::ResponseFriendRepairMachine: bonus=" + JSON.stringify(bonusItems));
			gv.userMachine.showRepairResult(this.getError(), bonusItems);

			if(this.getError())
				cc.log("GardenManager::ResponseFriendRepairMachine: error=" + this.getError());
			else
				Achievement.onAction(g_ACTIONS.ACTION_FRIEND_REPAIR_MACHINE.VALUE, null, 1);
		}
	}),

	RequestMachineUpdateFriendRepair:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.MACHINE_UPDATE_FRIEND_REPAIR);},
		pack:function(floor)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_FLOOR, floor);
			
			addPacketFooter(this);
			FWUtils.disableAllTouches();
		},
	}),

	ResponseMachineUpdateFriendRepair:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			FWUtils.disableAllTouches(false);

			var object = PacketHelper.parseObject(this);
			cc.log("GardenManager::ResponseMachineUpdateFriendRepair/ResponseNotifyRepairMachine: machine=" + JSON.stringify(object[KEY_MACHINE]));
			if(!Game.isFriendGarden() && FWUtils.getCurrentScene() === Game.gameScene)
			{
				gv.userData.game[GAME_FLOORS][object[KEY_FLOOR]][FLOOR_MACHINE] = object[KEY_MACHINE];
				gv.userMachine.getMachineByFloor(object[KEY_FLOOR]).refresh(object[KEY_MACHINE]);
			}

			if(this.getError())
				cc.log("GardenManager::ResponseMachineUpdateFriendRepair/ResponseNotifyRepairMachine: error=" + this.getError());
		}
	}),

	RequestJackPrivateShopBuy:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.JACK_PRIVATE_SHOP_BUY);},
		pack:function(slot)
		{
			addPacketHeader(this);
			PacketHelper.putByte(this, KEY_SLOT_ID, slot);
			
			addPacketFooter(this);
		},
	}),

	ResponseJackPrivateShopBuy:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			Game.updateUserDataFromServer(object);
			PrivateShop.privateShop = gv.jackShop = object[KEY_JACK_SHOP];
			PrivateShop.showBuyFriendItemFx();//PrivateShop.show(null, true);

			if(this.getError())
				cc.log("GardenManager::ResponseJackPrivateShopBuy: error=" + this.getError());
		}
	}),

///////////////////////////////////////////////////////////////////////////////////////
//// logout sequence //////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	logout:function()
	{
		if(!cc.sys.isNative)
		{
			ZPLogin.logout();
			location.reload(true);
			return;
		}
		
		if (ZPLogin.usePortal) {
			Game.endGameScene();//Game.endGame();
		} else {
			FWUtils.setCurrentScene(new ChangeGardenScene());
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.logout2, 0, 0, CHANGE_GARDEN_DELAY, false);
		}
	},

	logout2:function()
	{
		Game.uninit();
		ZPLogin.logout();

		var loadingScene = new LoadingScene();
		loadingScene.loadResources = false;
		FWUtils.setCurrentScene(loadingScene);

		delete PrivateShop.savedScrollPos;
		isShowTransition = false;
	},
};

network.packetMap[gv.CMD.FRIEND_VISIT] = GardenManager.ResponseFriendVisit;
network.packetMap[gv.CMD.FRIEND_BUG_GET] = GardenManager.ResponseFriendBugGet;
network.packetMap[gv.CMD.FRIEND_BUG_CATCH] = GardenManager.ResponseFriendBugCatch;
network.packetMap[gv.CMD.JACK_MACHINE_REPAIR] = GardenManager.ResponseJackMachineRepair;
network.packetMap[gv.CMD.JACK_PRIVATE_SHOP_BUY] = GardenManager.ResponseJackPrivateShopBuy;
network.packetMap[gv.CMD.FRIEND_REPAIR_MACHINE] = GardenManager.ResponseFriendRepairMachine;
network.packetMap[gv.CMD.MACHINE_UPDATE_FRIEND_REPAIR] = GardenManager.ResponseMachineUpdateFriendRepair;
network.packetMap[gv.CMD.NOTIFY_REPAIR_MACHINE] = GardenManager.ResponseMachineUpdateFriendRepair;
