var MachineManager = cc.Class.extend({
    LOGTAG: "[MachineManager]",

    ctor: function () {

        this.machineList = {};
        this.machineFloorMap = {};

        for (var i = 0; i < g_FLOOR.length; i++) {
            this.addMachine(i, g_FLOOR[i].MACHINE);
        }
    },

    // command

    requestUnlockMachine: function (machineId) {
        network.connector.sendRequestMachineUnlock(machineId);
    },

    requestFinishUnlockMachine: function (machineId) {
        network.connector.sendRequestMachineUnlockFinish(machineId);
    },

    requestRepairMachine: function (machineId) {
        network.connector.sendRequestMachineRepair(machineId);
    },

    requestUpgradeMachine: function (machineId, price) {
        network.connector.sendRequestMachineUpgrade(machineId, price || 0);
    },

    requestSkipMachineUnlockTime: function (machineId, price) {
        network.connector.sendRequestMachineSkipTimeUnlock(machineId, price);
    },

    requestSkipMachineProduceTime: function (machineId, price) {
        network.connector.sendRequestMachineSkipTimeProduce(machineId, price);
    },

    requestBuyMachineWorkingTime: function (machineId, price) {
        network.connector.sendRequestMachineBuyWorkingTime(machineId, price);
    },

    requestBuyMachineProduceSlot: function (machineId, price) {
        network.connector.sendRequestMachineBuySlot(machineId, price);
    },

    requestProduce: function (machineId, productId) {
        network.connector.sendRequestMachineProduce(machineId, productId);
    },

    requestHarvest: function (machineId) {
        network.connector.sendRequestMachineHarvest(machineId);
    },

    // game state

    addMachine: function (floorId, machineId) {

        var machine = new Machine(machineId);

        this.machineList[machineId] = machine;
        this.machineFloorMap[floorId] = machine;

        return this.machineList[machineId];
    },

    getMachineById: function (machineId) {
        return this.machineList[machineId];
    },

    getMachineByFloor: function (floorId) {
        return this.machineFloorMap[floorId];
    },

    refresh: function () {
		// fix: exception if refresh machines outside game scene
		if(FWUtils.getCurrentScene() !== Game.gameScene)
			return;
		
        var curFloor = this.popupMachineProduce ? this.popupMachineProduce.floorId : -1;        
        cc.log(this.LOGTAG, "refresh all machine", "curFloor", curFloor);        

        var floors = gv.userData.game[GAME_FLOORS];
        for (var i = 0; i < floors.length; i++) {
            if (i == curFloor)
                continue;
            this.refreshMachineByFloor(i);
            this.refreshMachinePopupByFloor(i);
        }

        if (curFloor >= 0) {
            this.refreshMachineByFloor(curFloor);
            this.refreshMachinePopupByFloor(curFloor);
        }
    },

    refreshMachine: function (floorId) {
        var curFloor = this.popupMachineProduce ? this.popupMachineProduce.floorId : -1;        
        cc.log(this.LOGTAG, "refresh floor", floorId, "curFloor", curFloor);        

        if (floorId != curFloor) {
            this.refreshMachineByFloor(floorId);
            this.refreshMachinePopupByFloor(floorId);
        }

        if (curFloor >= 0) {
            this.refreshMachineByFloor(curFloor);
            this.refreshMachinePopupByFloor(curFloor);
        }
    },

    refreshMachineById: function (machineId) {
        cc.log(this.LOGTAG, "refreshMachineById", "- machineId:", machineId);
        var machine = this.getMachineById(machineId);
        var machineData = (gv.userData.game[GAME_FLOORS][machine.floorId]) ? gv.userData.game[GAME_FLOORS][machine.floorId][FLOOR_MACHINE] : null;
        if (machine && machineData) {
            machine.refresh(machineData);
        }
    },

    refreshMachineByFloor: function (floorId) {
        cc.log(this.LOGTAG, "refreshMachineByFloor", "- floorId:", floorId);
        var machine = this.getMachineByFloor(floorId);
        var machineData = (gv.userData.game[GAME_FLOORS][machine.floorId]) ? gv.userData.game[GAME_FLOORS][machine.floorId][FLOOR_MACHINE] : null;
        if (machine) {
            machine.refresh(machineData);
        }
    },

    refreshMachinePopupByFloor: function (floorId, popupName) {
        cc.log(this.LOGTAG, "refreshMachinePopup", " - floorId:", floorId);
        var machineId = this.getMachineByFloor(floorId).machineId;
        var popups = [
            { name: UI_MACHINE_INFO, callback: this.showPopupMachineInfo.bind(this) },
            { name: UI_MACHINE_PRODUCE, callback: this.showPopupMachineProduce.bind(this) },
            { name: UI_MACHINE_UNLOCK, callback: this.showPopupMachineUnlock.bind(this) },
            { name: UI_MACHINE_UNLOCK_INFO, callback: this.showPopupMachineUnlockInfo.bind(this) },
            { name: UI_MACHINE_UPGRADE, callback: this.showPopupMachineUpgrade.bind(this) },
        ];
        for (var i = 0; i < popups.length; i++) {
            if (FWUI.isShowing(popups[i].name, true) && (!popupName || popupName === popups[i].name)) {
                popups[i].callback(floorId, machineId);
            }
        }
    },

    attachMachineToFloor: function (machineContainer, storageContainer, floorId) {
        cc.log(this.LOGTAG, "attachMachineToFloor", "- floorId:", floorId);
        var machine = this.getMachineByFloor(floorId);
        if (machine) {
            machine.init(machineContainer, storageContainer, floorId);
        }
    },

    detachMachineFromFloor: function (floorId) {
        cc.log(this.LOGTAG, "detachMachineFromFloor", "- floorId:", floorId);
        var machine = this.getMachineByFloor(floorId);
        if (machine) {
            machine.uninit();
        }
    },

    dispatchMachineHarvested: function (floorId) {
        cc.log(this.LOGTAG, "dispatchMachineHarvested", "- floorId:", floorId);
        var machine = this.getMachineByFloor(floorId);
        if (machine) {
            machine.onHarvested();
        }
    },

    // popup

    showPopupMachineInfo: function (floorId, machineId) {
        if (!this.popupMachineInfo)
            this.popupMachineInfo = new MachinePopupInfo();
        this.popupMachineInfo.show(floorId, machineId);
    },

    showPopupMachineUnlock: function (floorId, machineId) {
        if (!this.popupMachineUnlock)
            this.popupMachineUnlock = new MachinePopupUnlock();
        this.popupMachineUnlock.show(floorId, machineId);
    },

    showPopupMachineUnlockInfo: function (floorId, machineId) {
        if (!this.popupMachineUnlockInfo)
            this.popupMachineUnlockInfo = new MachinePopupUnlockInfo();
        this.popupMachineUnlockInfo.show(floorId, machineId);
    },

    showPopupMachineProduce: function (floorId, machineId) {
		// jira#6473
		var widget = FWPool.getNode(UI_MACHINE_PRODUCE, false);
		if(widget.isHiding)
		{
			// wait until popup is completely hidden
			return;
		}
		
        if (!this.popupMachineProduce)
            this.popupMachineProduce = new MachinePopupProduce();
        this.popupMachineProduce.show(floorId, machineId);
    },

    showPopupMachineUpgrade: function (floorId, machineId) {
        if (!this.popupMachineUpgrade)
            this.popupMachineUpgrade = new MachinePopupUpgrade();
        this.popupMachineUpgrade.show(floorId, machineId);
    },

    showMachineTransformEffect: function (floorId) {
        var machine  = this.getMachineByFloor(floorId);
        if (machine) {
            if (this.popupMachineProduce)
                this.popupMachineProduce.hide();
            if (this.popupMachineUpgrade)
                this.popupMachineUpgrade.hide();
            machine.showTransformEffect();
        }
    },
	
	showRepairRequirement: false,
	showAllRepairInfo:function(forceShowRequirement)//web showAllRepairInfo:function(forceShowRequirement = false)
	{
		if(forceShowRequirement === undefined)
			forceShowRequirement = false;
		
		this.showRepairRequirement = forceShowRequirement;
		for(var machine in this.machineList)
			this.machineList[machine].showRepairInfo();
	},

    // utilities

    getSkinLevel: function (level) {        
        if (level > 7)
            return 3;
        if (level > 4)
            return 2;
        return 1;
    },
	
	//web
    //getMachineStarSpriteNames: function (machineLevel, spriteName = "hud/icon_star.png", spriteEmptyName = "hud/icon_star_empty.png") {        
    getMachineStarSpriteNames: function (machineLevel, spriteName, spriteEmptyName) {        
	
		if(spriteName === undefined)
			spriteName = "hud/icon_star.png";
		if(spriteEmptyName === undefined)
			spriteEmptyName = "hud/icon_star_empty.png";
	
        var skin = this.getSkinLevel(machineLevel + 1);
        if (skin == 1)
            spriteName = "hud/icon_star.png";
        else if (skin == 2)
            spriteName = "hud/icon_star_red.png";
        else
            spriteName = "hud/icon_star_violet.png";

        var starSprites = [];
        for (var i = 0; i < 3; i++)
            starSprites.push(spriteEmptyName);

        if (machineLevel > 0) {
            if (machineLevel % 3 === 1) {
                starSprites[0] = spriteName;
            } else if (machineLevel % 3 === 2) {
                starSprites[0] = starSprites[1] = spriteName;
            } else {
                starSprites[0] = starSprites[1] = starSprites[2] = spriteName;
            }
        }

        return starSprites;
    },

    // callback

    onUnlockResponse: function (packet) {
        cc.log(this.LOGTAG, "onUnlockResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setGold(packet.gold);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachineByFloor(packet.floorId);
			
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UNLOCK.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
        }
    },

    onUnlockFinishResponse: function (packet) {
        cc.log(this.LOGTAG, "onUnlockFinishResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.showMachineTransformEffect(packet.floorId);
			
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UNLOCK_FINISH.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
        }
    },

    onRepairResponse: function (packet) {
        cc.log(this.LOGTAG, "onRepairResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setGold(packet.gold);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
			
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_REPAIR.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
        }
    },

    onProduceResponse: function (packet) {
        cc.log(this.LOGTAG, "onProduceResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setMachine(packet.floorId, packet.machine);
            gv.userStorages.updateItems(packet.updateItems);
            this.refreshMachine(packet.floorId);
			
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_PRODUCE.VALUE, packet.productId, 1);
        }
    },

    onHarvestResponse: function (packet) {
        cc.log(this.LOGTAG, "onHarvestResponse", "packet: %j", packet);
        if (packet.error === 0) {
			var machine = this.getMachineByFloor(packet.floorId);
			
			// jira#6012
			var harvestedProduct = null;
			if(machine.storage.length > 0)
				harvestedProduct = machine.storage[0];
			
			var prevExp = gv.userData.getExp();
            gv.userData.setExp(packet.exp);
            gv.userData.setLevel(packet.level);
            gv.userData.setMachine(packet.floorId, packet.machine);
            gv.userStorages.updateItems(packet.updateItems);
            this.dispatchMachineHarvested(packet.floorId);
            this.refreshMachineByFloor(packet.floorId);
			
			// jira#5135
			var incExp = packet.exp - prevExp;
			if(incExp > 0)
			{
				var pos = FWUtils.getWorldPosition(machine.storageContainer);
				pos.x += 100;
				pos.y += 50;
				FWUtils.showFlyingItemIcon(ID_EXP, incExp, pos, Game.getFlyingDestinationForItem(ID_EXP));
			}

            var delay=1;
            for(var key in packet.eventItem)
            {
                FWUtils.showFlyingItemIcon(key, packet.eventItem[key], pos, Game.getFlyingDestinationForItem(key),delay * 0.2);
                delay+=1;
            }
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
			if(harvestedProduct)
				Achievement.onAction(g_ACTIONS.ACTION_MACHINE_HARVEST.VALUE, harvestedProduct, 1);
        }
    },

    onUpgradeResponse: function (packet) {
        cc.log(this.LOGTAG, "onUpgradeResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setGold(packet.gold);
            gv.userData.setCoin(packet.coin);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.showMachineTransformEffect(packet.floorId);
			
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_UPGRADE.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
        }
    },

    onBuySlotResponse: function (packet) {
        cc.log(this.LOGTAG, "onBuySlotResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
            
			// achievement
			Achievement.onAction(g_ACTIONS.ACTION_MACHINE_SLOT_UNLOCK.VALUE, this.getMachineByFloor(packet.floorId).machineId, 1);
        }
    },

    onBuyWorkingTimeResponse: function (packet) {
        cc.log(this.LOGTAG, "onBuyWorkingTimeResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
        }
    },

    onSkipTimeUnlockResponse: function (packet) {
        cc.log(this.LOGTAG, "onSkipTimeUnlockResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
        }
    },

    onSkipTimeProduceResponse: function (packet) {
        cc.log(this.LOGTAG, "onSkipTimeProduceResponse", "packet: %j", packet);
        if (packet.error === 0) {
            gv.userData.setCoin(packet.coin);
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
        }
    },

    onGetResponse: function (packet) {
        cc.log(this.LOGTAG, Game.getGameTimeInSeconds(), "onGetResponse", "packet: %j", packet);
        if (packet.error === 0) {            
            gv.userData.setMachine(packet.floorId, packet.machine);
            this.refreshMachine(packet.floorId);
        }
    },

///////////////////////////////////////////////////////////////////////////////////////
// repair friend's machine ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	repairFxPos: null,
	repairPrice: null,
	
	showRepairResult:function(error, rewards)
	{
		if(error)
		{
			FWUtils.showWarningText(FWLocalization.text("TXT_REPAIR_FRIEND_MACHINE_ERROR"), this.repairFxPos, cc.WHITE);
			return;
		}
		
		FWUtils.showFlyingItemIcons(FWUtils.getItemsArray(rewards), this.repairFxPos);
	},
});

MachineManager._instance = null;
MachineManager.getInstance = function () {
    if (!MachineManager._instance)
        MachineManager._instance = new MachineManager();
    return MachineManager._instance;
};

//web var gv = gv || {};
gv.userMachine = MachineManager.getInstance();