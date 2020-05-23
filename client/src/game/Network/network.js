/**
 * Created by KienVN on 10/2/2017.
 */

//web var gv = gv || {};
var network = network || {};

network.Connector = cc.Class.extend({
    LOGTAG: "[Connector]",
	isSendLogStepStart: false,
	isSendLogStepEnd: false,

	ctor: function (client) {
		this.client = client;
		client.packetFactory.addPacketMap(network.packetMap);
		client.receivePacketSignal.add(this.onReceivedPacket, this);
	},

	onReceivedPacket: function (cmd, packet) {
		cc.log(this.LOGTAG, "onReceivedPacket:", cmd);
		switch (cmd) {
			case gv.CMD.HAND_SHAKE: {
                cc.log(this.LOGTAG, "CMD.HAND_SHAKE:", "token:", packet.token);
                this.token = packet.token || "";
				
				if(cc.sys.isNative && !this.isSendLogStepStart) {
					fr.platformWrapper.logGameStep("INIT_500_LOGIN_GAME", "START", "SUCC", 0, "");
					this.isSendLogStepStart = true;
				}
                this.sendRequestLogin();
            }
				break;
			case gv.CMD.USER_LOGIN: {
                cc.log(this.LOGTAG, "CMD.USER_LOGIN", packet.error);
                if (packet.error === 0) {
                    this.sendRequestUserData();
					
					if(cc.sys.isNative && !this.isSendLogStepEnd) {
						fr.platformWrapper.logGameStep("INIT_500_LOGIN_GAME", "END", "SUCC", 0, "");
						this.isSendLogStepEnd = true;
					}
                }
            }
				break;
			case gv.CMD.GET_USER_DATA: {
                cc.log(this.LOGTAG, "CMD.GET_USER_DATA");

				// moved to Game.loadUserData
                /*if (!gv.userStorages) {
                    gv.userStorages = new UserStorage();
                    for (var i = 0, size = g_STOCK.length; i < size; i++) {
                        gv.userStorages.load(i);
                    }
                    gv.userStorages.updateItems(gv.userData.game[GAME_STOCK_MAP]);
                }

                if (gv.dailygift.haveDailyGift())
                    gv.dailygift.requestRewards();*/

				if(FWLoader.continueLoading === false)
				{
					// continue loading screen
					FWLoader.continueLoading = true; 
				}
				else if(FWUtils.getCurrentScene() === Game.gameScene)
				{
					// reconnected
				}
				else
				{
					// go back home from friend's garden
					GardenManager.onFriendGardenLoaded();
				}
            }
				break;

            case gv.CMD.LEVEL_UP: {
                cc.log(this.LOGTAG, "CMD.LEVEL_UP");               

                gv.userMachine.refresh();

                //AudioManager.effect (EFFECT_LEVEL_UP);

                if (gv.dailygift.haveDailyGift())
                    gv.dailygift.requestRewards();

            }
                break;

			case gv.CMD.STOCK_UPGRADE: {
                if (packet.error === 0) {
                    var storage = gv.userStorages.getStorage(packet.stockId);
                    if (storage) {
                        storage.updateLevel(packet.stockLevel);
                    }
                    gv.userData.setCoin(packet.clientCoin);
                    gv.userStorages.updateItems(packet.updateItems);
                    gv.gameBuildingStorageInterface.updateStorageUIInfo();
                    gv.gameBuildingStorageInterface.showSubTabPanel(gv.gameBuildingStorageInterface.isSubTabPanelShow);
                    gv.background.performStorageUpgrade();
                }
            }
				break;

            case gv.CMD.OPEN_BUILDING_GAME:
                gv.arcade.onUnlockResponse(packet);
                break;

			case gv.CMD.MACHINE_UNLOCK:
				gv.userMachine.onUnlockResponse(packet);
				break;
            case gv.CMD.MACHINE_FINISH_UNLOCK:
                gv.userMachine.onUnlockFinishResponse(packet);
                break;
			case gv.CMD.MACHINE_REPAIR:
                gv.userMachine.onRepairResponse(packet);
				break;
            case gv.CMD.MACHINE_PRODUCE:
                gv.userMachine.onProduceResponse(packet);
                break;
            case gv.CMD.MACHINE_HARVEST:
                gv.userMachine.onHarvestResponse(packet);
                break;
			case gv.CMD.MACHINE_UPGRADE:
                gv.userMachine.onUpgradeResponse(packet);
				break;
			case gv.CMD.MACHINE_BUY_SLOT:
                gv.userMachine.onBuySlotResponse(packet);
				break;
			case gv.CMD.MACHINE_BUY_WORKING_TIME:
                gv.userMachine.onBuyWorkingTimeResponse(packet);
				break;
            case gv.CMD.MACHINE_SKIP_TIME_UNLOCK:
                gv.userMachine.onSkipTimeUnlockResponse(packet);
                break;
			case gv.CMD.MACHINE_SKIP_TIME_PRODUCE:
                gv.userMachine.onSkipTimeProduceResponse(packet);
                break;
            case gv.CMD.MACHINE_GET:
				if(gv.userMachine)
					gv.userMachine.onGetResponse(packet);
				break;

            case gv.CMD.BUY_IBSHOP:
                gv.ibshop.onBuyItemResponse(packet);
                break;

            case gv.CMD.TOM_HIRE:
                gv.tomkid.onHireResponse(packet);
                break;
            case gv.CMD.TOM_FIND:
                gv.tomkid.onFindResponse(packet);
                break;
            case gv.CMD.TOM_BUY:
                gv.tomkid.onBuyResponse(packet);
                break;
            case gv.CMD.TOM_CANCEL:
                gv.tomkid.onCancelResponse(packet);
                break;
            case gv.CMD.TOM_REDUCE_TIME:
                gv.tomkid.onReduceTimeResponse(packet);
                break;

            case gv.CMD.LUCKY_SPIN:
                gv.wheel.onWheelSpinResponse(packet);
                break;
            case gv.CMD.LUCKY_SPIN_GET_REWARD:
                gv.wheel.onWheelClaimResponse(packet);
                break;

            case gv.CMD.DICE_SPIN:
                gv.dice.onDiceSpinResponse(packet);
                break;
            case gv.CMD.DICE_GET_REWARD:
                gv.dice.onDiceClaimResponse(packet);
                break;

            case gv.CMD.BLACKSMITH_MAKE_POT:
                gv.smithy.onForgeResponse(packet);
                break;

            case gv.CMD.DAILY_GIFT_GET_REWARD:
                gv.dailygift.onDataResponse(packet);
                break;
            case gv.CMD.DAILY_GIFT_GET:
                gv.dailygift.onDataResponseDailyGet(packet);
                break;

            case gv.CMD.GACHA_OPEN:
                gv.chest.onOpenResponse(packet);
                break;
            case gv.CMD.GACHA_GET_REWARD:
                gv.chest.onGetRewardResponse(packet);
                break;
            case gv.CMD.PIG_UPDATE_DIAMOND:

                break;
		}
	},

    // Base operations

	sendRequestLogin: function () {
		cc.log(this.LOGTAG, "sendRequestLogin");
		
		var pk = this.client.getOutPacket(network.base.UserLoginRequest);
		pk.pack(this.token || "");
		this.client.sendPacket(pk);
	},

	sendRequestUserData: function () {
		cc.log(this.LOGTAG, "sendRequestUserData");
		var pk = this.client.getOutPacket(network.base.UserDataRequest);
		pk.pack();
		this.client.sendPacket(pk);
	},

    // Storage operations

	sendRequestUpgradeStorage: function (storageId, price) {
		cc.log(this.LOGTAG, "sendRequestUpgradeStorage");
		//if (gv.userData.isEnoughCoin(price)) // already checked in Game.js onWidgetEvent_touchEnded
		{
			var pk = this.client.getOutPacket(network.storage.UpgradeStorageRequest);
			pk.pack(storageId, price);
			this.client.sendPacket(pk);
		}
	},

    // Machine operations

    sendRequestMachineUnlock: function (machineId) {
        cc.log(this.LOGTAG, "sendRequestUnlockMachine:", "machineId:", machineId);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.UnlockRequest);
            pk.pack(machineInfo.FLOOR);
            this.client.sendPacket(pk);
		}
    },

    sendRequestMachineUnlockFinish: function (machineId) {
        cc.log(this.LOGTAG, "sendRequestMachineUnlockFinish:", "machineId:", machineId);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.UnlockFinishRequest);
            pk.pack(machineInfo.FLOOR);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineRepair: function (machineId) {
        cc.log(this.LOGTAG, "sendRequestMachineRepair:", "machineId:");
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.RepairRequest);
            pk.pack(machineInfo.FLOOR);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineProduce: function (machineId, productId) {
        cc.log(this.LOGTAG, "sendRequestMachineProduce:", "machineId:", machineId, "productId:", productId);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.ProduceRequest);
            pk.pack(machineInfo.FLOOR, productId);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineHarvest: function (machineId) {
        cc.log(this.LOGTAG, "sendRequestMachineHarvest:", "machineId:", machineId);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.HarvestRequest);
            pk.pack(machineInfo.FLOOR);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineUpgrade: function (machineId, price) {
        cc.log(this.LOGTAG, "sendRequestMachineUpgrade:", "machineId:", machineId, "price:", price);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.UpgradeRequest);
            pk.pack(machineInfo.FLOOR, price);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineSkipTimeUnlock: function (machineId, price) {
        cc.log(this.LOGTAG, "sendRequestMachineSkipTimeUnlock:", "machineId:", machineId, "price:", price);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.SkipTimeUnlockRequest);
            pk.pack(machineInfo.FLOOR, price);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineSkipTimeProduce: function (machineId, price) {
        cc.log(this.LOGTAG, "sendRequestMachineSkipTimeProduce:", "machineId:", machineId, "price:", price);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.SkipTimeProduceRequest);
            pk.pack(machineInfo.FLOOR, price);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineBuySlot: function (machineId, price) {
        cc.log(this.LOGTAG, "sendRequestMachineBuySlot:", "machineId:", machineId, "price:", price);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.BuySlotRequest);
            pk.pack(machineInfo.FLOOR, price);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineBuyWorkingTime: function (machineId, price) {
        cc.log(this.LOGTAG, "sendRequestMachineBuyWorkingTime:", "machineId:", machineId, "price:", price);
        var machineInfo = defineMap[machineId];
        if (machineInfo) {
            var pk = this.client.getOutPacket(network.machine.BuyWorkingTimeRequest);
            pk.pack(machineInfo.FLOOR, price);
            this.client.sendPacket(pk);
        }
    },

    sendRequestMachineGet: function (floorId) {        
        cc.log(this.LOGTAG, "sendRequestMachineGet:", "floorId:", floorId, "isFriendGarden", Game.isFriendGarden());        
        if (Game.isFriendGarden())
            return;
        var pk = this.client.getOutPacket(network.machine.GetRequest);
        pk.pack(floorId);
        this.client.sendPacket(pk);
    },

    // IBShop operations

    sendRequestBuyIBShopItem: function (itemId, itemAmount, priceType, priceValue) {
        // cc.log(this.LOGTAG, "sendRequestBuyIBShopItem:", "itemId:", itemId, "itemAmount:", itemAmount, "priceType:", priceType, "priceValue:", priceValue);
        var pk = this.client.getOutPacket(network.ibshop.BuyIBShopRequest);
        pk.pack(itemId, itemAmount, priceType, priceValue);
        this.client.sendPacket(pk);
    },

    // Tom kid operations

    sendRequestTomkidHire: function (type, price) {
        cc.log(this.LOGTAG, "sendRequestTomkidHire:", "type:", type, "price:", price);
        var pk = this.client.getOutPacket(network.tomkid.HireRequest);
        pk.pack(type, price);
        this.client.sendPacket(pk);
    },

    sendRequestTomkidFind: function (findItemId, buffItemId) {
        cc.log(this.LOGTAG, "sendRequestTomkidFind:", "findItemId:", findItemId, "buffItemId:", buffItemId);
        var pk = this.client.getOutPacket(network.tomkid.FindRequest);
        pk.pack(findItemId, buffItemId);
        this.client.sendPacket(pk);
    },

    sendRequestTomkidBuy: function (slotId) {
        cc.log(this.LOGTAG, "sendRequestTomkidBuy:", "slotId:", slotId);
        var pk = this.client.getOutPacket(network.tomkid.BuyRequest);
        pk.pack(slotId);
        this.client.sendPacket(pk);
    },

    sendRequestTomkidCancel: function () {
        cc.log(this.LOGTAG, "sendRequestTomkidCancel:");
        var pk = this.client.getOutPacket(network.tomkid.CancelRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },

    sendRequestTomkidReduceTime: function (itemId, itemAmount) {
        cc.log(this.LOGTAG, "sendRequestTomkidReduceTime:", "itemId:", itemId, "itemAmount:", itemAmount);
        var pk = this.client.getOutPacket(network.tomkid.ReduceTimeRequest);
        pk.pack(itemId, itemAmount);
        this.client.sendPacket(pk);
    },

    // Wheel spin operations

    sendRequestWheelSpin: function (price) {
        cc.log(this.LOGTAG, "sendRequestWheelSpin:", "price:", price);
        var pk = this.client.getOutPacket(network.wheel.SpinRequest);
        pk.pack(price || 0);
        this.client.sendPacket(pk);
    },

    sendRequestWheelClaim: function () {
        cc.log(this.LOGTAG, "sendRequestWheelClaim:");
        var pk = this.client.getOutPacket(network.wheel.ClaimRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },

    // Dice spin operations

    sendRequestDiceSpin: function () {
        cc.log(this.LOGTAG, "sendRequestDiceSpin:");
        var pk = this.client.getOutPacket(network.dice.SpinRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },

    sendRequestDiceClaim: function () {
        cc.log(this.LOGTAG, "sendRequestDiceClaim:");
        var pk = this.client.getOutPacket(network.dice.ClaimRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },

    // Smithy operations

    sendRequestSmithyForge: function (potId, potMaterials) {
        cc.log(this.LOGTAG, "sendRequestSmithyForge:", "potId:", potId, "potMaterials: %j", potMaterials);
        var pk = this.client.getOutPacket(network.smithy.ForgeRequest);
        pk.pack(potId, potMaterials);
        this.client.sendPacket(pk);
    },

    // Dailygift operations

    sendRequestDailyGift: function () {
        cc.log(this.LOGTAG, "sendRequestDailyGift:");
        var pk = this.client.getOutPacket(network.dailygift.DailyGiftRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },

    sendRequestDailyGiftGet: function () {
        cc.log(this.LOGTAG, "requestDailyGiftGet:");
        var pk = this.client.getOutPacket(network.dailygift.RequestDailyGiftGet);
        pk.pack();
        this.client.sendPacket(pk);
    },

    // Chest operations

    sendRequestOpenChest: function (chestId, chestPrice) {
        cc.log(this.LOGTAG, "sendRequestOpenChest:", "chestId:", chestId, "chestPrice:", chestPrice);
        var pk = this.client.getOutPacket(network.chest.OpenRequest);
        pk.pack(chestId, chestPrice);
        this.client.sendPacket(pk);
    },

    sendRequestGetRewardChest: function (chestId) {
        cc.log(this.LOGTAG, "sendRequestGetRewardChest:", "chestId:", chestId);
        var pk = this.client.getOutPacket(network.chest.GetRewardRequest);
        pk.pack(chestId);
        this.client.sendPacket(pk);
    },

    // Misc operations

    sendRequestUnlockArcade: function () {
        cc.log(this.LOGTAG, "sendRequestUnlockArcade:");
        var pk = this.client.getOutPacket(network.UnlockArcadeRequest);
        pk.pack();
        this.client.sendPacket(pk);
    },
});



