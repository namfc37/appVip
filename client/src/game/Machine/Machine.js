const MACHINE_STATE_NONE = -1;              // Khởi tạo
const MACHINE_STATE_LOCKED = 0;             // User chưa đủ level để unlock máy
const MACHINE_STATE_UNLOCKABLE = 1;         // User đã đủ level để unlock máy, nhưng chưa rã băng máy
const MACHINE_STATE_GROWING = 2;            // Máy đã rã băng, mới khởi động
const MACHINE_STATE_GROWING_BIG = 3;        // Máy đã rã băng, đã qua 20% thời gian khởi động
const MACHINE_STATE_GROWING_FULL = 4;       // Máy đã khởi động xong, sẵn sàng mở
const MACHINE_STATE_READY = 5;              // Máy đã mở, sẵn sàng để sử dụng
const MACHINE_STATE_PRODUCING = 6;          // Máy đang sản xuất vật phẩm
const MACHINE_STATE_BROKEN = 7;             // Máy đã bị hư, cần sửa

const MACHINE_ANIM_REST = "rest";
const MACHINE_ANIM_WORKING = "work";
const MACHINE_ANIM_BROKEN = "broken";

const MACHINE_ANIM_EGG_LOCK = "machine_01_egg_ice_locked";
const MACHINE_ANIM_EGG_UNLOCK = "machine_01_egg_ice_unlock";
const MACHINE_ANIM_EGG_SMALL = "machine_01_egg_small";
const MACHINE_ANIM_EGG_BIG = "machine_01_egg_big";

const MACHINE_ANIM_EFFECT_UNLOCK = "effect_unlock_machine";
const MACHINE_ANIM_EFFECT_ICE_BREAK = "effect_ice_broken";

const MACHINE_SCALE_EGG = 0.4;
const MACHINE_SCALE_EGG_GROW = 0.5;

const MACHINE_SCALE_POPUP = 0.9;
const MACHINE_SCALE_STARS = 0.6;
const MACHINE_ANIM_SCALES = {
    MA0: 0.23,
    MA1: 0.30,
    MA2: 0.21,
    MA3: 0.23,
    MA4: 0.23,
    MA5: 0.30,
    MA6: 0.28,
    MA7: 0.20,
    MA8: 0.35,
    MA9: 0.18
};

const MACHINE_PRODUCE_SLOT_SIZE = 110;
const MACHINE_PRODUCE_ITEM_SIZE = 100;

const MACHINE_PRODUCE_ITEM_SCALE = 0.6;
const MACHINE_PRODUCE_ITEM_WAIT_SCALE = 0.5;
const MACHINE_PRODUCE_ITEM_STORAGE_SCALE = 0.5;

const MACHINE_ZORDER_BODY = 1;
const MACHINE_ZORDER_EFFECT = 2;

const MACHINE_DEFAULT_DATA = {};
MACHINE_DEFAULT_DATA[MACHINE_LEVEL] = 1;
MACHINE_DEFAULT_DATA[MACHINE_NUM_SLOT] = 0;
MACHINE_DEFAULT_DATA[MACHINE_DURABILITY] = 0;
MACHINE_DEFAULT_DATA[MACHINE_WORKING_TIME] = 0;
MACHINE_DEFAULT_DATA[MACHINE_TIME_START_UNLOCK] = 0;
MACHINE_DEFAULT_DATA[MACHINE_TIME_FINISH_PRODUCE] = 0;
MACHINE_DEFAULT_DATA[MACHINE_STORE] = [];
MACHINE_DEFAULT_DATA[MACHINE_PRODUCE_ITEMS] = [];

var Machine = cc.Class.extend({
    LOGTAG: "[Machine]",

    floorId: -1,
    machineId: -1,

    bodyLocked: null,
    bodyUnlocked: null,

    state: MACHINE_STATE_NONE,

    ctor: function (id) {

        this.machineId = id;
        this.machineDefine = g_MACHINE[this.machineId];

        this.stateCallbacks = [
            { last: null, next: MACHINE_STATE_PRODUCING, callback: this.onProducingBegan.bind(this) },
            { last: MACHINE_STATE_PRODUCING, next: MACHINE_STATE_READY, callback: this.onProducingEnded.bind(this) },
            { last: null, next: MACHINE_STATE_GROWING, callback: this.onGrowingBegan.bind(this) },
            { last: MACHINE_STATE_GROWING, next: MACHINE_STATE_GROWING_FULL, callback: this.onGrowingEnded.bind(this) },
            { last: null, next: MACHINE_STATE_BROKEN, callback: this.onBroken.bind(this) },
            { last: MACHINE_STATE_BROKEN, next: MACHINE_STATE_READY, callback: this.onFixed.bind(this) }
        ];

        this.bodyLocked = new FWObject();
        this.bodyUnlocked = new FWObject();
		this.itemLight = new FWObject();
    },

    init: function (machineContainer, storageContainer, floorId, machineId) {
        cc.log(this.LOGTAG, "init");

        this.machineContainer = machineContainer || this.machineContainer;
        this.storageContainer = storageContainer || this.storageContainer;

        if (!this.machineContainer)
            return;
		
        if (!this.machineStar) {
            this.machineStar = FWPool.getNode(UI_MACHINE_STAR);
            this.machineContainer.addChild(this.machineStar);
            this.machineStar.setPosition(cc.p(-50, 185));
			this.machineStar.setLocalZOrder(9999);
        }

		// jira#5449
		this.itemLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
		this.itemLight.setParent(this.machineContainer);
		this.itemLight.setAnimation("effect_light_icon", true);
		this.itemLight.setPosition(100, 50);
		this.itemLight.setVisible(false);

        this.machineParent = this.machineContainer.getParent();
        FWUI.fillData(this.machineParent, null, {
            machineTouch: { onTouchEnded: this.onMachineTouched.bind(this) }
        });

        this.floorId = floorId;
        this.machineId = machineId || this.machineId;
        this.machineDefine = g_MACHINE[this.machineId];
		
		this.setUpdate(true);
    },

    initBody: function (body, parent, name, scale, anim, skin, loop) {
        if (body) {
            body.initWithSpine(name);
            body.setAnimation(anim, loop);
            body.setScale(scale);
            if (skin !== "")
                body.setSkin(skin);
            if (!body.getParent())
                body.setParent(parent, MACHINE_ZORDER_BODY);
            body.setEventListener(this.onTouchBegan.bind(this), this.onTouchEnded.bind(this));
			body.setNotifyBlockedTouch(body.lastParent === body.getParent());
        }
    },

    uninit: function () {

        this.setState(MACHINE_STATE_NONE);

        this.bodyLocked.uninit();
        this.bodyUnlocked.uninit();
        this.itemLight.uninit();
		if(this.machineStar)
		{
			// remove particle
			//if(this.machineStar.maxLevelParticle)
			//{
			//	this.machineStar.maxLevelParticle.removeFromParent();
			//	this.machineStar.maxLevelParticle = null;
			//}
			FWUI.unfillData(this.machineStar);
			FWPool.returnNode(this.machineStar);
			delete this.machineStar;
		}
		
		// fix: release pool object
		//if(this.storageContainer && this.storageContainer.itemLight)
		//{
		//	this.storageContainer.itemLight.uninit();
		//	delete this.storageContainer.itemLight;
		//}
		
		this.setUpdate(false);
    },

    isUnlocked: function () {
        return this.slotCount > 0;
    },

    isBroken: function () {
        return this.durability <= 0;
    },

    refresh: function (data) {
        cc.log(this.LOGTAG, "refresh", " - data: %j", data);

        this.data = data || MACHINE_DEFAULT_DATA;

        this.level = this.data[MACHINE_LEVEL];
        this.storage = this.data[MACHINE_STORE];

        this.slotCount = this.data[MACHINE_NUM_SLOT];
        this.producingItems = this.data[MACHINE_PRODUCE_ITEMS];

        this.durability = this.data[MACHINE_DURABILITY];
        this.workingTime = this.data[MACHINE_WORKING_TIME];

        this.timeUnlock = this.data[MACHINE_TIME_START_UNLOCK];
        this.timeProduceStart = this.data[MACHINE_TIME_START_PRODUCE];
        this.timeProduceEnd = this.data[MACHINE_TIME_FINISH_PRODUCE];
		
		// should fix serverside
		//// jira#5496
		//if(this.timeProduceEnd - this.timeProduceStart < 11)
		//	this.timeProduceEnd = this.timeProduceStart + 11;

        this.updateState();
        this.updateStorage();
        this.updateStar();
		this.showRepairInfo();
    },

    updateState: function () {
        if (this.isUnlocked()) {
            if (this.isBroken()) {
                this.setState(MACHINE_STATE_BROKEN);
            }
            else {                
                if (this.producingItems.length > 0) {
                    this.updateProducing();
                } else {
                    this.setState(MACHINE_STATE_READY);
                }
            }
        } else {
            if (this.timeUnlock <= 0) {
                if (gv.userData.getLevel() < this.machineDefine.LEVEL_UNLOCK)
                    this.setState(MACHINE_STATE_LOCKED);
                else
                    this.setState(MACHINE_STATE_UNLOCKABLE);
            } else {
                this.timeUnlockEnd = this.timeUnlock + this.machineDefine.TIME_START;
                this.updateUnlocking();
            }
        }
    },

    updateStar: function () {
        if (this.machineStar) {

            // jira#5702, 5724: max level animation
			var nextLevelDefine = this.machineDefine.LEVELS[this.level];
            var nextLevelWorkingTime = nextLevelDefine ? nextLevelDefine.ACTIVE_TIME : 0;
            var nextLevelUpgradeGold = nextLevelDefine ? nextLevelDefine.GOLD_UNLOCK : 0;
            var isUpgradable = (this.level < this.machineDefine.LEVELS.length && nextLevelWorkingTime > 0 && nextLevelUpgradeGold > 0);
			var hasMaxLevelFx = ((!isUpgradable && this.level >= 10) || gv.userData.userId === USER_ID_JACK); // always show fx for jack

            var starSprites = gv.userMachine.getMachineStarSpriteNames(this.data[MACHINE_LEVEL] - 1);
            var starVisible = (this.data[MACHINE_LEVEL] > 1 && !hasMaxLevelFx);
            FWUI.fillData(this.machineStar, null, {
                star1: { type: UITYPE_IMAGE, id: starSprites[0], scale: MACHINE_SCALE_STARS, visible: starVisible },
                star2: { type: UITYPE_IMAGE, id: starSprites[1], scale: MACHINE_SCALE_STARS, visible: starVisible },
                star3: { type: UITYPE_IMAGE, id: starSprites[2], scale: MACHINE_SCALE_STARS, visible: starVisible },
				superstar:{type:UITYPE_SPINE, value:SPINE_STAR_EFFECT, anim:"star_effect", visible:hasMaxLevelFx},
            });
			
			// remove particle
			/*var maxLevelParticle = this.machineStar.maxLevelParticle;
			if(hasMaxLevelFx)
			{
				if(!maxLevelParticle)
				{
					maxLevelParticle = new cc.ParticleSystem("effects/particle_drop.plist");
					maxLevelParticle.setDuration(10);//maxLevelParticle.setDuration(-1);
					maxLevelParticle.setLife(10);
					maxLevelParticle.setPositionType(2);
					maxLevelParticle.setPosition(60, 0);
					//maxLevelParticle.setTotalParticles(15);
					this.machineStar.maxLevelParticle = maxLevelParticle;
					this.machineStar.addChild(maxLevelParticle);
				}
				maxLevelParticle.setVisible(this.state === MACHINE_STATE_PRODUCING);//maxLevelParticle.setVisible(true);
			}
			else if(maxLevelParticle)
				maxLevelParticle.setVisible(false);*/
        }
    },

    updateStorage: function () {
        if (this.storage && this.storageContainer) {

			// fix: return nodes to pool
			//this.storageContainer.removeAllChildren();
			this.itemLight.setParent(this.machineContainer);
			this.itemLight.setVisible(false);
            FWPool.returnNodesFromParent(this.storageContainer);
			
			// tmp remove due to tutorial crash
            /*if (this.storageContainer.itemLight) {
                this.storageContainer.itemLight.setParent(this.storageContainer);
                this.storageContainer.itemLight.setVisible(false);
            } else {
                this.storageContainer.itemLight = new FWObject();
                this.storageContainer.itemLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                this.storageContainer.itemLight.setAnimation("effect_light_icon", true);
                this.storageContainer.itemLight.setScale(0.7);
                this.storageContainer.itemLight.setVisible(false);
            }*/
			
			if(!Game.isFriendGarden())
			{
				if(this.storage.length > 0)
				{
					this.itemLight.setParent(this.storageContainer);
					this.itemLight.setVisible(true);
					
					//web
if(!cc.sys.isNative){
					this.itemLight.spine.init();
					this.itemLight.isAnimating = false;
					this.itemLight.setAnimation("effect_light_icon", true);
}
				}
				
				var startX = this.storageContainer.getBoundingBox().width * 0.5;
				var index = 0, sign = 0, offset = 0, posX = 0, posY = 0;
				for (var i = 0; i < this.storage.length; i++) {

					var item = FWPool.getNode(UI_ITEM_NO_BG);
					this.storageContainer.addChild(item);

					index = i % 9;
					sign = (index % 2 === 0) ? 1 : -1;
					offset = index / 2;

					posX = startX + ((index > 0) ? (sign * offset * MACHINE_PRODUCE_ITEM_SIZE * 0.2) : 0);
					posY = (index > 0) ? (2 * offset) : 0;

					var itemDefine = {
						ItemSprite: { type: UITYPE_IMAGE, id: this.storage[i], subType: defineTypes.TYPE_PRODUCT, scale: MACHINE_PRODUCE_ITEM_STORAGE_SCALE, visible:true },
						ItemSpine: {visible:false},
						Amount: { visible: false },
						UIItem: { onTouchEnded: this.onProductItemTouched.bind(this) }
					};

					item.setContentSize(cc.size(MACHINE_PRODUCE_ITEM_SIZE, MACHINE_PRODUCE_ITEM_SIZE));
					item.setAnchorPoint(cc.ANCHOR_BOTTOM_CENTER());
					item.setPosition(cc.p(posX, posY));
					item.setLocalZOrder(this.storage.length - i);
					item.setTag(i);

					// tmp remove due to tutorial crash
					/*if (i === 0) {
						this.storageContainer.itemLight.setLocalZOrder(-1);
						this.storageContainer.itemLight.setParent(item);
						this.storageContainer.itemLight.setPosition(MACHINE_PRODUCE_ITEM_SIZE * 0.5, MACHINE_PRODUCE_ITEM_SIZE * 0.5);
						this.storageContainer.itemLight.setVisible(true);
					}*/

					FWUI.fillData(item, null, itemDefine);
				}
			}
        }
    },

    updateUnlocking: function () {
        var timeUnlockLeft = this.timeUnlockEnd - Game.getGameTimeInSeconds();
        if (timeUnlockLeft <= 0) {
            this.setState(MACHINE_STATE_GROWING_FULL);
        } else {            
            var unlockingPercent = 1 - (timeUnlockLeft / this.machineDefine.TIME_START);
            this.setState((unlockingPercent <= 0.2) ? MACHINE_STATE_GROWING : MACHINE_STATE_GROWING_BIG);
        }
    },

    updateProducing: function () {
        var producingItem = this.getProducingItem();
        if (producingItem) {
            var producingTime = this.getProducingTime();
            if (producingTime.timeLeft > 0) {
                this.setState(MACHINE_STATE_PRODUCING);
            } else {
                this.setState(MACHINE_STATE_READY);                
                network.connector.sendRequestMachineGet(this.floorId);
            }
        }
    },

    update: function (dt) {        
		// moved to FWObject
		// opt
		//if(this.floorId < gv.background.floorIndex + 1 || this.floorId < gv.background.floorIndex)
		//	return;
	
        if (this.state === MACHINE_STATE_GROWING || this.state === MACHINE_STATE_GROWING_BIG)
            this.updateUnlocking();
        else if (this.state === MACHINE_STATE_PRODUCING)
            this.updateProducing();
    },
	
	setUpdate:function(isUpdate)
	{
		if(isUpdate)
		{
			//cc.director.getScheduler().scheduleUpdateForTarget(this, 1, false);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
			this.update(); // jira#5380 update immedately to show products
		}
		else
		{
			//cc.director.getScheduler().unscheduleUpdateForTarget(this);
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
			
		}
	},

    showPopupInfo: function () {
        gv.userMachine.showPopupMachineInfo(this.floorId, this.machineId);
    },

    showPopupUnlock: function () {        
        // var isLockedFloor = (this.floorId === CloudFloors.getLastUnlockedFloorIdx() + 1);
        // if (isLockedFloor) {
        //     FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_UNLOCK_FLOOR_FIRST"), cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
        // }
        // else {
        //     gv.userMachine.showPopupMachineUnlock(this.floorId, this.machineId);
        // }
        gv.userMachine.showPopupMachineUnlock(this.floorId, this.machineId);
    },

    showPopupUnlockInfo: function () {
        gv.userMachine.showPopupMachineUnlockInfo(this.floorId, this.machineId);
    },

    showPopupUnlockSkipTime: function () {
        var position = FWUtils.getWorldPosition(this.machineContainer);
        position = cc.p(position.x, position.y + 120);
        Game.showSkipTimeEndTime(FWUtils.getCurrentScene(), position, this.machineId, this.timeUnlockEnd, this.onSkipTimeUnlockTouched.bind(this));
    },

    showPopupProduce: function () {
        gv.userMachine.showPopupMachineProduce(this.floorId, this.machineId);
    },

    showPopupUpgrade: function () {
        gv.userMachine.showPopupMachineUpgrade(this.floorId, this.machineId);
    },

    getSkinLevel: function () {
        return gv.userMachine.getSkinLevel(this.data[MACHINE_LEVEL]);
    },

    showTransformEffect: function () {

        var spine = new FWObject();
        spine.initWithSpine(SPINE_EFFECT_UNLOCK);
        spine.setAnimation(MACHINE_ANIM_EFFECT_UNLOCK, false, function () {
            spine.uninit();
        }.bind(this));
        spine.setPosition(cc.VEC2());
        spine.setParent(this.machineContainer, MACHINE_ZORDER_EFFECT);

        this.refreshCallback = setTimeout(function () {
            this.refresh(gv.userData.getMachine(this.floorId));
			
			// jira#5174
			var spineSkinLevel = this.getSkinLevel();
			var spineSkin = cc.formatStr(SPINE_MACHINES_SKIN, spineSkinLevel);			
			this.bodyUnlocked.setSkin(spineSkin);
			
            if (this.refreshCallback)
                clearTimeout(this.refreshCallback);
			
			setTimeout(function() {
				Game.shouldShowRatingPopup = true;
			}, 2000);			

		}.bind(this), 500);
    },

    setState: function (state) {
        if (this.state !== state) {

            var lastState = this.state;
            this.state = state;

            var isUnlocked = this.isUnlocked();
            var isAvailable = state !== MACHINE_STATE_NONE;
            if (isAvailable) {

                var spineName = "";
                var spineAnim = "";
                var spineSkin = "";

                var spineScale = MACHINE_SCALE_EGG;                
                var spineSkinLevel = this.getSkinLevel();

                switch (this.state) {
                    case MACHINE_STATE_LOCKED:
                        spineName = SPINE_MACHINE_EGG;
                        spineAnim = MACHINE_ANIM_EGG_LOCK;
                        spineScale = MACHINE_SCALE_EGG;
                        break;
                    case MACHINE_STATE_UNLOCKABLE:
                        spineName = SPINE_MACHINE_EGG;
                        spineAnim = MACHINE_ANIM_EGG_UNLOCK;
                        spineScale = MACHINE_SCALE_EGG;
                        break;
                    case MACHINE_STATE_GROWING:
                        spineName = SPINE_MACHINE_EGG;
                        spineAnim = MACHINE_ANIM_EGG_SMALL;
                        spineScale = MACHINE_SCALE_EGG;
                        break;
                    case MACHINE_STATE_GROWING_BIG:
                        spineName = SPINE_MACHINE_EGG;
                        spineAnim = MACHINE_ANIM_EGG_SMALL;
                        spineScale = MACHINE_SCALE_EGG_GROW;
                        break;
                    case MACHINE_STATE_GROWING_FULL:
                        spineName = SPINE_MACHINE_EGG;
                        spineAnim = MACHINE_ANIM_EGG_BIG;
                        spineScale = MACHINE_SCALE_EGG;
                        break;
                    case MACHINE_STATE_READY:
                        spineName = Game.getMachineSpineByDefine(this.machineId);
                        spineSkin = cc.formatStr(SPINE_MACHINES_SKIN, spineSkinLevel);
                        spineAnim = MACHINE_ANIM_REST;
                        spineScale = MACHINE_ANIM_SCALES[this.machineId] || 1.0;
                        break;
                    case MACHINE_STATE_PRODUCING:
                        spineName = Game.getMachineSpineByDefine(this.machineId);
                        spineSkin = cc.formatStr(SPINE_MACHINES_SKIN, spineSkinLevel);
                        spineAnim = MACHINE_ANIM_WORKING;
                        spineScale = MACHINE_ANIM_SCALES[this.machineId] || 1.0;
                        break;
                    case MACHINE_STATE_BROKEN:
                        spineName = Game.getMachineSpineByDefine(this.machineId);
                        spineSkin = cc.formatStr(SPINE_MACHINES_SKIN, spineSkinLevel);
                        spineAnim = MACHINE_ANIM_BROKEN;
                        spineScale = MACHINE_ANIM_SCALES[this.machineId] || 1.0;
                        break;
                }

                if (isUnlocked) {
			       this.initBody(this.bodyUnlocked, this.machineContainer, spineName, spineScale, spineAnim, spineSkin, true);
                }
                else {
					this.initBody(this.bodyLocked, this.machineContainer, spineName, spineScale, spineAnim, spineSkin, true);
                }
				
				// remove particle
				// jira#5724
				//if(this.machineStar && this.machineStar.maxLevelParticle)
				//	this.machineStar.maxLevelParticle.setVisible(this.state === MACHINE_STATE_PRODUCING);
            }

            this.bodyLocked && this.bodyLocked.setVisible(isAvailable && !isUnlocked);
            this.bodyUnlocked && this.bodyUnlocked.setVisible(isAvailable && isUnlocked);

            this.onStateChanged(lastState, state);
			
			Tutorial.onGameEvent(EVT_REFRESH_MACHINE, this.floorId, this.state);
        }
    },

    borrowBody: function () {
        var body = (this.isUnlocked()) ? this.bodyUnlocked : this.bodyLocked;
        body.lastParent = body.getParent();
        body.lastPosition = body.getPosition();
		body.setNotifyBlockedTouch(false);
        return body;
    },

    returnBody: function (body) {
        body.setParent(body.lastParent);
        body.setPosition(body.lastPosition);
		body.setNotifyBlockedTouch(true);
    },

    borrowStorage: function () {
        if (this.storageContainer) {
            this.storageContainer.lastParent = this.storageContainer.getParent();
            this.storageContainer.lastPosition = this.storageContainer.getPosition();
            this.storageContainer.lastZOrder = this.storageContainer.getLocalZOrder();
            return this.storageContainer;
        }
        return null;
    },

    borrowStar: function () {
        if (this.machineStar) {
            this.machineStar.lastParent = this.machineStar.getParent();
            this.machineStar.lastPosition = this.machineStar.getPosition();
            this.machineStar.lastZOrder = this.machineStar.getLocalZOrder();
            return this.machineStar;
        }
        return null;
    },

    returnNode: function (container) {
        if (container.lastParent) {
            container.setPosition(container.lastPosition);
            FWUtils.changeParent(container, container.lastParent, container.lastZOrder);
        }
    },

    isFullSlot: function () {
        return this.producingItems.length >= this.slotCount;
    },

    isFullStorage: function () {
        return this.storage.length >= this.getCapacity();
    },

    willFullStorage: function () {
        return this.storage.length + this.producingItems.length >= this.getCapacity();
    },

    getCapacity: function () {
        return this.machineDefine.INIT_STORE + this.slotCount;
    },

    getProducingItem: function () {
        return (this.producingItems && this.producingItems.length > 0) ? this.producingItems[0] : null;
    },

    getProducingTime: function () {

        var duration = 0, timeLeft = 0;
        if (this.producingItems && this.producingItems.length > 0) {
            var productId = this.getProducingItem();
            if (productId) {                
                duration = this.timeProduceEnd - this.timeProduceStart + 1;
                timeLeft = Math.max(this.timeProduceEnd - Game.getGameTimeInSeconds(), 0);
            }
        }

        return { duration: duration, timeLeft: timeLeft, timeEnd: this.timeProduceEnd };
    },

    getNextSlotUnlockPrice: function () {
        var unlockableSlot = this.machineDefine.UNLOCK_REQUIRES_DIAMOND;
        if (this.slotCount >= unlockableSlot.length) {
            return -1;
        } else {
            return unlockableSlot[this.slotCount];
        }
    },

    getWorldPosition: function () {
        if (this.machineContainer)
            return cc.PADD(FWUtils.getWorldPosition(this.machineContainer), cc.p(0, 100));
        return null;
    },

    pullCurrentProduct: function () {
        cc.log(this.LOGTAG, "pullCurrentProduct");
        if (this.producingItems.length > 0) {
            if (this.isFullStorage()) {
                cc.log(this.LOGTAG, "pullCurrentProduct", "Storage is full");
                return false;
            }
            else {
                this.storage.push(this.producingItems.splice(0, 1));
                this.updateStorage();
                return true;
            }
        }
    },

    pushNextProduct: function () {
        cc.log(this.LOGTAG, "pushNextProduct");
        if (this.producingItems.length > 0) {
            if (this.isFullStorage()) {
                cc.log(this.LOGTAG, "pushNextProduct", "Storage is full");
            }
            else {
                gv.userMachine.requestProduce(this.machineId, this.getProducingItem());
            }
        }
    },

    queueProduct: function (productId) {
        cc.log(this.LOGTAG, "queueProduct", "productId:", productId);
        this.producingItems.push(productId);
        if (this.producingItems.length <= 1)
            gv.userMachine.requestProduce(this.machineId, this.getProducingItem());
    },

    harvestProduct: function () {
        cc.log(this.LOGTAG, "harvestProduct");

		// jira#6355
        //if (FWUI.isShowing(UI_MACHINE_PRODUCE) || Game.isFriendGarden())
        if (Game.isFriendGarden())
            return;

        if (gv.userStorages.isFullStorage(STORAGE_TYPE_PRODUCT)) {
            Game.showUpgradeStock("hud/icon_tab_products.png", STORAGE_TYPE_PRODUCT);
        }
        else if(this.storageContainer)
		{
            var products = this.storageContainer.getChildren();
            if (products.length > 0) {
                var product = products[products.length - 1];
                var productPosition = FWUtils.getWorldPosition(this.storageContainer);
                product.setPosition(cc.PADD(productPosition, cc.p(this.storageContainer.width * 0.5, 0)));

                FWUtils.changeParent(product, FWUtils.getCurrentScene());
				product.setLocalZOrder(Z_FX);
                Game.flyToStorage(product);
            }

            gv.userMachine.requestHarvest(this.machineId);
			
			Tutorial.onGameEvent(EVT_COLLECT_PRODUCT);
        }
    },

    onStateChanged: function (lastState, newState) {
        for (var key in this.stateCallbacks) {
            var callbackData = this.stateCallbacks[key];
            if ((callbackData.last === null || callbackData.last === lastState) && callbackData.next === newState) {
                callbackData.callback && callbackData.callback();
            }
        }

        if (lastState === MACHINE_STATE_NONE)
            return;
        
        if (lastState == MACHINE_STATE_UNLOCKABLE && newState == MACHINE_STATE_GROWING)
            AudioManager.effect (EFFECT_MACHINE_BREAK_ICE);
        else if (newState == MACHINE_STATE_READY)
            AudioManager.effect (EFFECT_MACHINE_TRANSFROM);
    },

    onProducingBegan: function () {
        cc.log(this.LOGTAG, "onProducingBegan: productItems: %j", this.producingItems);
		
		// remove particle
		//if(this.machineStar && this.machineStar.maxLevelParticle && !this.machineStar.maxLevelParticle.isActive())
		//	this.machineStar.maxLevelParticle.resetSystem();
    },

    onProducingEnded: function () {
        cc.log(this.LOGTAG, "onProducingEnded: productItems: %j", this.producingItems);        
    },

    onGrowingBegan: function () {
        cc.log(this.LOGTAG, "onGrowingBegan");
        
        // var effect1 = new FWObject();
        // effect1.initWithSpine(SPINE_MACHINE_EGG);
        // effect1.setAnimation(MACHINE_ANIM_EGG_UNLOCK, true);
        // effect1.setScale(MACHINE_SCALE_EGG);
        // effect1.setPosition (cc.p (0, 0));
        // effect1.setParent(this.machineContainer, 10);
        // effect1.node.runAction(
        //     cc.sequence(
        //         cc.fadeOut(0.45),
        //         cc.callFunc (() => effect1.node.removeFromParent())
        //     )
        // );
        
        var effect2 = new FWObject();
        effect2.initWithSpine(SPINE_MACHINES_ICE_BROKEN);
        effect2.setAnimation(MACHINE_ANIM_EFFECT_ICE_BREAK, false, function() {effect2.uninit();});//web effect2.setAnimation(MACHINE_ANIM_EFFECT_ICE_BREAK, false, () => effect2.uninit());//effect2.setAnimation(MACHINE_ANIM_EFFECT_ICE_BREAK, false, () => effect2.node.removeFromParent());
        effect2.setScale(1.1);
        effect2.setParent(this.machineContainer, 9);
    },

    onGrowingEnded: function () {
        cc.log(this.LOGTAG, "onGrowingEnded");
    },

    onHarvested: function () {
        cc.log(this.LOGTAG, "onHarvested");
        if (this.storageContainer) {
            var products = this.storageContainer.getChildren();
            if (products.length > 0 && this.storage.length > 0) {
                this.storage.splice(0, 1);
                this.updateStorage();
            }
        }
    },

    onBroken: function () {
        cc.log(this.LOGTAG, "onBroken");
    },

    onFixed: function () {
        cc.log(this.LOGTAG, "onFixed");
    },

    onTouchBegan: function (sender) {
        return true;
    },

    onTouchEnded: function (touch, object, force) {
        cc.log(this.LOGTAG, "onTouchEnded", " - state:", this.state);

		if(!force && !Tutorial.acceptInput("machine" + this.floorId))
			return;
		Tutorial.onGameEvent(EVT_TOUCH_END, "machine", this.floorId);
		
		if(Game.isFriendGarden())
		{
			// jira#5504
			// jira#5392
			gv.userMachine.showAllRepairInfo(!gv.userMachine.showRepairRequirement);
			//gv.userMachine.showAllRepairInfo(true);
			return;
		}
		else if(this.data[MACHINE_FRIEND_ID])
		{
			var pk = network.connector.client.getOutPacket(GardenManager.RequestMachineUpdateFriendRepair);
			pk.pack(this.floorId);
			network.connector.client.sendPacket(pk);
			return;
		}
		
        if (this.storage.length > 0) {
            this.harvestProduct();
        }
        else {
            switch (this.state) {
                case MACHINE_STATE_LOCKED:
                    this.showPopupUnlockInfo();
                    break;
                case MACHINE_STATE_UNLOCKABLE: {                    
                    // var isLockedFloor = (this.floorId === CloudFloors.getLastUnlockedFloorIdx() + 1);
                    // if (isLockedFloor) {
                    //     FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_UNLOCK_FLOOR_FIRST"), FWUtils.getWorldPosition(sender.node));
                    // }
                    // else {
                    //     this.showPopupUnlock();
                    // }
                    this.showPopupUnlock();
                }
                    break;
                case MACHINE_STATE_GROWING:
                case MACHINE_STATE_GROWING_BIG:
                    this.showPopupUnlockSkipTime();
                    AudioManager.effect (EFFECT_MACHINE_SLEEPING);
                    break;
                case MACHINE_STATE_GROWING_FULL:
                    gv.userMachine.requestFinishUnlockMachine(this.machineId);
                    AudioManager.effect (EFFECT_MACHINE_SLEEPING);
                    break;
                case MACHINE_STATE_READY:
                    this.showPopupProduce();
                    AudioManager.effect (EFFECT_MACHINE_SLEEPING);
                    break;
                case MACHINE_STATE_PRODUCING:
                    this.showPopupProduce();
                    AudioManager.effect (EFFECT_MACHINE_PRODUCING);
                    break;
                case MACHINE_STATE_BROKEN:
                    this.showPopupInfo();
                    AudioManager.effect (EFFECT_MACHINE_SLEEPING);
                    break;
                default:
                    break;
            }
        }
    },

    onMachineTouched: function (sender) {
        cc.log(this.LOGTAG, "onMachineTouched", " - state:", this.state);
		
		// jira#5697
		if(!CloudFloors.isFloorUnlocked(this.floorId))
		{
			if(!Game.isFriendGarden())
			{
				var pos = FWUtils.getWorldPosition(sender);
				FWUtils.showWarningText(FWLocalization.text("TXT_UNLOCK_MACHINE_REQUIRE_FLOOR"), cc.p(pos.x + 100, pos.y + 80));
			}
			return;
		}
		
        if (this.storage.length > 0) {
            this.harvestProduct();
        }
        else {
            if (this.bodyLocked && this.bodyLocked.isVisible())
                this.onTouchEnded(this.bodyLocked);
            else if (this.bodyUnlocked && this.bodyUnlocked.isVisible())
                this.onTouchEnded(this.bodyUnlocked);
        }
    },

    onSkipTimeUnlockTouched: function (object, data, sender) {
		// jira#5456
		if(Game.consumeDiamond(data.diamond, FWUtils.getWorldPosition(sender)))		
        //if (gv.userData.isEnoughCoin(data.diamond)) {
            gv.userMachine.requestSkipMachineUnlockTime(this.machineId, data.diamond);
        //}
        //else {
        //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
        //}
    },

    onProductItemTouched: function (sender) {
        this.harvestProduct();
    },
	
///////////////////////////////////////////////////////////////////////////////////////
// repair friend's machine ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	repairWidget: null,

	showRepairInfo:function()
	{
		this.levelIndex = Math.max(this.level - 1, 0);
        this.maxDurability = this.machineDefine.DURABILITY_INIT + this.levelIndex * this.machineDefine.DURABILITY_ADD;
	
		//if((this.durability >= this.maxDurability && !this.data[MACHINE_FRIEND_ID])
		//	|| (this.durability < this.maxDurability && !Game.isFriendGarden())
		//	|| this.state < MACHINE_STATE_READY)
		var show = (this.state >= MACHINE_STATE_READY && (this.data[MACHINE_FRIEND_ID] || (Game.isFriendGarden() && this.durability < this.maxDurability)));
		
		// jira#5762
		if(show)
		{
			var repairRepu = this.getRepairRepu();
			var limitRepu = json_user_level.FRIEND_REPU_DAILY_LIMIT[gv.mainUserData.getLevel()]
			var usedRepu = gv.mainUserData.game[GAME_FRIEND_REPUTATION];
			if(repairRepu > limitRepu - usedRepu)
				show = false;
		}
		
		if(!show)
		{
			this.hideRepairInfo();
			return;
		}
		
		if(!this.repairWidget)
		{
			this.repairWidget = FWPool.getNode(UI_MACHINE_REPAIR);
			this.repairWidget.state = -1;
		}
		
		var uiDef = null;
		if((this.durability >= this.maxDurability) || this.data[MACHINE_FRIEND_ID])
		{
			if(this.repairWidget.state !== 0)
			{
				uiDef = this.showRepairer();
				this.repairWidget.state = 0;
			}
		}
		else if(gv.userMachine.showRepairRequirement)
		{
			if(this.repairWidget.state !== 1)
			{
				uiDef = this.showRepairRequirement();
				this.repairWidget.state = 1;
			}
		}
		else if(this.repairWidget.state !== 2)
		{
			uiDef = this.showRepairReward();
			this.repairWidget.state = 2;
		}
		if(!uiDef)
			return;

		FWUI.alignWidget(this.repairWidget, cc.p(0, 0), cc.size(cc.winSize.width, cc.winSize.height), cc.p(0.5, 0.5), Z_UI_COMMON);
		FWUI.showWidgetWithData(this.repairWidget, null, uiDef, this.machineContainer, UIFX_POP, false);
		this.repairWidget.setLocalZOrder(Z_UI_COMMON);
	},
	
	showRepairRequirement:function()
	{
        this.repairPrice = (this.maxDurability - this.durability) * this.machineDefine.LEVELS[this.levelIndex].GOLD_MAINTAIN;        
        if (Game.isFriendGarden())
            this.repairPrice = Math.max(1, FWUtils.fastFloor(this.repairPrice * g_MISCINFO.RATE_PRICE_REPAIR_FRIEND_MACHINE / 100));

		var uiDef =
		{
			repairPanel: {visible: true},
			repuPanel: {visible: false},
			repairerPanel: {visible: false},
			bar: {type:UITYPE_PROGRESS_BAR, value:this.durability, maxValue:this.maxDurability},
			barText: {type:UITYPE_TEXT, value:this.durability + "/" + this.maxDurability, style:TEXT_STYLE_NUMBER},
			repairButton: {onTouchEnded:this.onRepairFriendMachine.bind(this)},
			repairPrice: {type:UITYPE_TEXT, value:this.repairPrice, style:TEXT_STYLE_TEXT_BUTTON},
		};
		return uiDef;
	},
	
	getRepairRepu:function()
	{
        var repairRepu = this.maxDurability - this.durability;
		if(gv.userData.userId === USER_ID_JACK && gv.jackMachine[this.floorId] < 0)
			repairRepu *= 2;
		return repairRepu;
	},
	
	showRepairReward:function()
	{	
		var uiDef =
		{
			repairPanel: {visible: false},
			repuPanel: {visible: true},
			repairerPanel: {visible: false},
			repuCount: {type:UITYPE_TEXT, value:this.getRepairRepu(), style:TEXT_STYLE_NUMBER},
		};
		return uiDef;
	},
	
	showRepairer:function()
	{
		var uiDef =
		{
			repairPanel: {visible: false},
			repuPanel: {visible: false},
		};
		
		if(this.data[MACHINE_FRIEND_ID])
		{
			uiDef.repairerPanel = {visible: true};
			uiDef.avatar = {type:UITYPE_IMAGE, value:this.data[MACHINE_FRIEND_AVATAR], size:64}
		}
		else
			uiDef.repairerPanel = {visible: false};

		return uiDef;
	},
	
	hideRepairInfo:function()
	{
		if(this.repairWidget)
		{
			// hideWidget won't work when widget is out of screen
			//FWUI.hideWidget(this.repairWidget, UIFX_POP);
			FWPool.returnNode(this.repairWidget);
			
			this.repairWidget = null;
		}
	},
	
	onRepairFriendMachine:function(sender)
	{
		gv.userMachine.repairFxPos = FWUtils.getWorldPosition(sender);
		this.hideRepairInfo();
		
		if(gv.userData.userId === USER_ID_JACK)
		{
			if(!Game.consumeGold(this.repairPrice, gv.userMachine.repairFxPos))
				return;
			
			var pk = network.connector.client.getOutPacket(GardenManager.RequestJackMachineRepair);
			pk.pack(this.floorId, this.level, this.maxDurability - this.durability);
			network.connector.client.sendPacket(pk);
		}
		else
		{
			 // jira#5818
			if(gv.userData.getGold() < this.repairPrice)
			{
				Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function() {Game.openShop(ID_GOLD);}, true, "TXT_BUY");
				return
			}
			
			var pk = network.connector.client.getOutPacket(GardenManager.RequestFriendRepairMachine);
			pk.pack(gv.userData.userId, this.floorId, this.maxDurability - this.durability);
			network.connector.client.sendPacket(pk);
		}
	},
});