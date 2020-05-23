const BG_FLOOR_OFFSET_Y = 40;
const BG_FLOOR_CHANGE_MIN_OFFSET_Y = 40;

const BG_FLOOR_TOP_CEIL_DISTANCE = 265;
const BG_FLOOR_TOP_SNAP_OFFSET_Y = 0;

const BG_FLOOR_BOTTOM_Y = -10;

const BG_FLOOR_BASE_INDEX = 0;
const BG_FLOOR_SNAP_FLOOR_TIME = 0.2;
const BG_FLOOR_SNAP_GROUND_TIME = 0.3;

const BG_NPC_ANIM_NORMAL = "npc_normal";

const BG_BUILDING_ANIM_NORMAL = "building_normal";
const BG_BUILDING_ANIM_NORMAL_TOUCH = "building_normal_touch";
const BG_BUILDING_ANIM_LOCKED = "building_locked";
const BG_BUILDING_ANIM_LOCKED_TOUCH = "building_locked_touch";

const BG_BUILDING_ANIM_ACTIVE = "building_active";
const BG_BUILDING_ANIM_ACTIVE_TOUCH = "building_active_touch";

const BG_GROUND_OFFSET = 25;
var fixBgPos = 0;

// fix: incorrect cloud pos when changing scene
var bgCloudY = null; 
var bgBaseY = null;
var parallel = null;

// fix: tom running => visit friend => go home => incorrect tom's position
var markerNPCTomStandPosition = null;

var Background = cc.Layer.extend({
	LOGTAG: "[Background]",

	onEnter: function () {
		this._super();
		
		// jira#5887
		this.widget = FWUI.show(UI_BACKGROUND, this);
		/*var uiDef =
		{
			markerTreasure:{type:UITYPE_TIME_BAR, startTime:0, endTime:0, countdown:true, onFinished:this.onTreasureTimerFinished.bind(this)},
		};
		this.widget = FWUI.showWithData(UI_BACKGROUND, null, uiDef, this);
		this.treasureTimer = FWUtils.getChildByName(this.widget, "markerTreasure");
		this.refreshTreasureTimer();*/

		this.base = FWUI.getChildByName(this.widget, "base");
        this.bean = FWUI.getChildByName(this.widget, "bean");
        this.cloud = FWUI.getChildByName(this.widget, "cloud");
		this.ocean = FWUI.getChildByName(this.widget, "ocean");
        this.ground = FWUI.getChildByName(this.widget, "ground");
        this.moutain = FWUI.getChildByName(this.widget, "moutain");

        this.floorIndex = -1;
        this.floorStartY = this.bean.y;
		
		// fix: incorrect cloud pos when changing scene
		if(bgCloudY === null)
		{
			bgCloudY = this.cloud.y;
			bgBaseY = this.base.y;
		}
		else
		{
			this.cloud.y = bgCloudY;
			this.base.y = bgBaseY;
        }

        this.cloudBaseOffset = this.cloud.y - this.base.y;
        this.cloudActualSize = cc.size(this.cloud.width * this.cloud.getScaleX(), this.cloud.height * this.cloud.getScaleY());
        
        if (!parallel)
        {
            parallel = {
                base: {min: this.base.y + BG_GROUND_OFFSET, max: this.base.y + BG_GROUND_OFFSET},
                bean: {min: this.bean.y, max: this.bean.y},
                cloud: {
                    start: -cc.winSize.height - BG_FLOOR_BOTTOM_Y,
                    min: cc.winSize.height * 0.5,
                    max: cc.winSize.height - this.cloudActualSize.height * 0.5
                },
                ocean: {min: this.ocean.y, max: this.ocean.y + 30},
//              ground: {min: this.ground.y, max: this.ground.y - 60},
                moutain: {min: this.moutain.y, max: this.moutain.y + 40}
            };
        }

        this.touchId = -1;
        this.touchStartPoint = cc.p(0, 0);
		this.touchBaseStartPoint = cc.p(0, 0);

		this.disableScrolling = false;
        var isFriendGarden = Game.isFriendGarden();
        
        var isSunray = true;
        if (isSunray)
        {
            this.sunray = new FWObject();
            this.sunray.initWithSpine(SPINE_EFFECT_SUNRAY);
            this.sunray.setAnimation("animation", true);
            this.sunray.setPosition(cc.p (0, cc.winSize.height));
            this.sunray.setScale(0.8);
            this.sunray.setOpacity(255 * 0.5);
            this.sunray.setParent(this.widget);
        }

		if(cc.sys.isNative)
		{
			var markerWave = FWUI.getChildByName(this.widget, "markerWave");
			if (markerWave)
			{
				this.oceanWave = new cc.ParticleSystem("effects/effect_ocean.plist");
				this.oceanWave.setDuration(-1);
				this.oceanWave.setPosition(0, 0);
				markerWave.addChild(this.oceanWave);
			}
		}

        var markerStorage = FWUI.getChildByName(this.widget, "markerStorage");
        if (markerStorage) {
            this.animStorage = new FWObject();
            this.animStorage.initWithSpine(SPINE_BUILDING_STORAGE);
            this.animStorage.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animStorage.setParent(markerStorage);
            this.animStorage.setScale(0.95);
            
            this.effectStorage = new FWObject();
            this.effectStorage.initWithSpine(SPINE_MACHINE_EGG);
            this.effectStorage.setAnimation("cloud_dust_effect_3", true);
            this.effectStorage.setParent(markerStorage);
            this.effectStorage.setPosition (cc.p(0, -20));
            this.effectStorage.setScale(1.3);
            this.effectStorage.setVisible (false);

			if(!isFriendGarden)
			{
				this.animStorage.setEventListener(null, this.onWidgetStorageTouched.bind(this));
				this.animStorage.setNotifyBlockedTouch(true);
			}
				
			this.updateStorageSkin(); // jira#5047
        }

		this.notifyAchievement = FWUI.getChildByName(this.widget, "notifyAchievement");
		var markerAchievement = FWUI.getChildByName(this.widget, "markerAchievement");
		if (markerAchievement) {
            this.animAchievement = new FWObject();
            this.animAchievement.initWithSpine(SPINE_BUILDING_ACHIEVEMENT);
            this.animAchievement.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animAchievement.setParent(markerAchievement);
            this.animAchievement.setScale(0.9);
            this.animAchievement.setEventListener(null, this.onWidgetAchievementTouched.bind(this));
            this.animAchievement.setNotifyBlockedTouch(true);
			this.animAchievement.customBoundingBoxes = cc.rect(-125, -20, 250, 270); // jira#5523
			Achievement.refreshHomeBuilding();
        }

        var markerLeaderboard = FWUI.getChildByName(this.widget, "markerLeaderboard");
        if (markerLeaderboard) {
            this.animLeabderboard = new FWObject();
            this.animLeabderboard.initWithSpine(SPINE_BUILDING_LEADERBOARD);
            this.animLeabderboard.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animLeabderboard.setParent(markerLeaderboard);
            this.animLeabderboard.setScale(1.0);
            this.animLeabderboard.setEventListener(null, this.onWidgetLeaderboardTouched.bind(this));
            this.animLeabderboard.setNotifyBlockedTouch(true);
        }

        var markerGames = FWUI.getChildByName(this.widget, "markerGames");
        if (markerGames) {
            this.animGames = new FWObject();
            this.animGames.initWithSpine(SPINE_BUILDING_GAMES);
            this.animGames.setAnimation(gv.arcade.isUnlocked() ? BG_BUILDING_ANIM_NORMAL : BG_BUILDING_ANIM_LOCKED, true);
            this.animGames.setParent(markerGames);
            this.animGames.setScale(0.93);
			if(!isFriendGarden)
			{
				this.animGames.setEventListener(null, this.onWidgetGamesTouched.bind(this));
				this.animGames.setNotifyBlockedTouch(true);
			}
                
            this.gameUnlock = FWUI.getChildByName(this.widget, "notifyGameUnlock");
            this.gameUnlock.setVisible (gv.arcade.isNeedUnlock ());
        }

        var markerGuild = FWUI.getChildByName(this.widget, "markerGuild");
        if (markerGuild) {
            this.animGuild = new FWObject();
            this.animGuild.initWithSpine(SPINE_BUILDING_GUILD);
            this.animGuild.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animGuild.setParent(markerGuild);
            this.animGuild.setScale(0.9);
			//if(!isFriendGarden)
			{
				this.animGuild.setEventListener(null, this.onWidgetGuildTouched.bind(this));
				this.animGuild.setNotifyBlockedTouch(true);
			}
			
			// guild2
			if(g_MISCINFO.DERBY_ACTIVE)
			{
				var markerDerby = FWUI.getChildByName(this.widget, "markerDerby");
				this.animGuild2 = new FWObject();
				this.animGuild2.initWithSpine(SPINE_BUILDING_GUILD_FROG);
				this.animGuild2.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
				this.animGuild2.setParent(markerDerby);
				this.animGuild2.setScale(1);
				if(!isFriendGarden)
				{
					this.animGuild2.setEventListener(null, this.onWidgetGuild2Touched.bind(this));
					this.animGuild2.setNotifyBlockedTouch(true);
				}
				
				this.animGuild2NPC = new FWObject();
				this.animGuild2NPC.initWithSpine(SPINE_NPC_FROG_GUILD);
				this.animGuild2NPC.setAnimation("animation", true);
				this.animGuild2NPC.setParent(markerDerby);
				this.animGuild2NPC.setScale(0.06);
				this.animGuild2NPC.setPosition(35, -5);
			}
        }

        var markerInbox = FWUI.getChildByName(this.widget, "markerInbox");
        if (markerInbox) {
            this.animInbox = new FWObject();
            this.animInbox.initWithSpine(SPINE_INBOX);
            this.animInbox.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animInbox.setParent(markerInbox);
            this.animInbox.setScale(0.85);
			//if(!isFriendGarden) // jira#5350
			{
				this.animInbox.setEventListener(null, this.onWidgetInboxTouched.bind(this));
				this.animInbox.setNotifyBlockedTouch(true);
			}
        }

        var markerShop = FWUI.getChildByName(this.widget, "markerPShop");
        if (markerShop) {
            this.animShop = new FWObject();
            this.animShop.initWithSpine(SPINE_PSHOP);
            this.animShop.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            this.animShop.setParent(markerShop);
            this.animShop.setScale(1.0);
			this.animShop.setEventListener(null, this.onWidgetPrivateShopTouched.bind(this));
			this.animShop.setNotifyBlockedTouch(true);
        }

        // var markerAirship = FWUI.getChildByName(this.widget, "markerAirship");
        // if (markerAirship) {
        //     this.animAirship = new FWObject();
        //     this.animAirship.initWithSpine(SPINE_AIRSHIP);
        //     this.animAirship.setAnimation("building_normal", true);
        //     this.animAirship.setParent(markerAirship);
        //     this.animAirship.setEventListener(null, this.onWidgetAirShipTouched.bind(this));
        // }

        var markerTreasure = FWUI.getChildByName(this.widget, "markerTreasure");
        if (markerTreasure) {
            this.animTreasure = new FWObject();
            this.animTreasure.initWithSpine(SPINE_TREASURE);
            this.animTreasure.setParent(markerTreasure);
            this.animTreasure.setScale(0.12);
            if (Background.data.shipReady)
            {
                this.animTreasure.play = true;
                this.animTreasure.ready = true;
                this.shipReady (true);
            }
            else
            {
                this.animTreasure.setVisible(false);//this.animTreasure.setOpacity(0);
                this.animTreasure.setPosition(cc.p (0, -11));
                this.animTreasure.play = false;
                this.animTreasure.ready = false;
                if (gv.userData.isEnoughLevel(g_MISCINFO.GACHA_USER_LEVEL))
                    this.shipComing();
            }
        }

        var markerFrog = FWUI.getChildByName(this.widget, "markerFrog");
        if (markerFrog) {
            this.animFrog = new FWObject();
            this.animFrog.initWithSpine(SPINE_FROG);
            this.animFrog.setAnimation("normal", true);
            this.animFrog.setParent(markerFrog);
            this.animFrog.setScale(0.07);
            this.animFrog.setEventListener(null, this.onWidgetFrogTouched.bind(this));
            this.animFrog.setNotifyBlockedTouch(true);
        }

        this.initFishJump ();

        var markerNPCSmith = FWUI.getChildByName(this.widget, "markerNPCSmith");
        if (markerNPCSmith) {
            this.animNPCSmith = new FWObject();
            this.animNPCSmith.initWithSpine(SPINE_NPC_BLACKSMITH);
            this.animNPCSmith.setAnimation(BG_NPC_ANIM_NORMAL, true);
            this.animNPCSmith.setScale(0.05);
            this.animNPCSmith.setParent(markerNPCSmith);
            //this.animNPCSmith.setEventListener(null, this.onWidgetNPCSmithTouched.bind(this));
        }

        var markerNPCFisherman = FWUI.getChildByName(this.widget, "markerNPCFisherman");
        if (markerNPCFisherman) {
            this.animNPCFisherman = new FWObject();
            this.animNPCFisherman.initWithSpine(SPINE_NPC_MINER);//this.animNPCFisherman.initWithSpine(SPINE_NPC_FISHERMAN);
            this.animNPCFisherman.setAnimation("idle", true);//this.animNPCFisherman.setAnimation(BG_NPC_ANIM_NORMAL, true);
            this.animNPCFisherman.setScale(0.05);
            this.animNPCFisherman.setParent(markerNPCFisherman);
            //this.animNPCFisherman.setEventListener(null, this.onWidgetNPCFishermanTouched.bind(this));
			
			// jira#5826
            this.animNPCBee = new FWObject();
            this.animNPCBee.initWithSpine(SPINE_NPC_BEE);
            this.animNPCBee.setAnimation(DICE_BEE_ANIM_WAITING, true);
            this.animNPCBee.setScale(-0.075, 0.075);
            this.animNPCBee.setParent(markerNPCFisherman);
            this.animNPCBee.setPosition(5, 105);
        }

        var markerBrids = FWUI.getChildByName(this.widget, "markerBrids");
        if (markerBrids)
		{
    		Birds.init();
		    Birds.show (markerBrids);
		}
        
		if(!isFriendGarden)
		{
			if(GameEvent.currentEvent)
			{
				var markerNPCEvent = FWUI.getChildByName(this.widget, "markerNPCEvent");
				if (markerNPCEvent) {
					this.animNPCEvent = new FWObject();
					this.animNPCEvent.initWithSpine(SPINE_NPC_WOLF_EVENT);//this.animNPCEvent.initWithSpine(SPINE_NPC_FISHERMAN);
					this.animNPCEvent.setAnimation("animation", true);//this.animNPCEvent.setAnimation("npc_wolf_event", true);//this.animNPCEvent.setAnimation(BG_NPC_ANIM_NORMAL, true);
					this.animNPCEvent.setScale(0.3);//this.animNPCEvent.setScale(0.23);//this.animNPCEvent.setScale(0.25);// new pos this.animNPCEvent.setScale(0.3);
					this.animNPCEvent.setParent(markerNPCEvent);
					this.animNPCEvent.setEventListener(null, this.onWidgetNPCEventTouched.bind(this));
					this.animNPCEvent.setNotifyBlockedTouch(true);
				}
				

			}

            if(!GameEvent.eventItemsLoaded)
            {
                if(cc.sys.isNative)
                {
                    cc.spriteFrameCache.addSpriteFrames(UI_EVENT_ITEMS_DUMMY_PLIST);
                    GameEvent.eventItemsLoaded = true;
                }
                else
                {
                    cc.loader.load([UI_EVENT_ITEMS_DUMMY_PLIST,
                            UI_EVENT_ITEMS_DUMMY_PLIST.replace(".plist", ".png")],
                        function()
                        {
                            cc.spriteFrameCache.addSpriteFrames(UI_EVENT_ITEMS_DUMMY_PLIST);
                            GameEvent.eventItemsLoaded = true;
                        }.bind(this));
                }
            }

            if(GameEventTemplate2.getActiveEvent())
            {
                var markerNPCEvent2 = FWUI.getChildByName(this.widget, "markerNPCEvent2");
                if (markerNPCEvent2) {
                    this.animNPCEvent = new FWObject();
                    this.animNPCEvent.initWithSpine(SPINE_NPC_EVENT2);//this.animNPCEvent.initWithSpine(SPINE_NPC_FISHERMAN);
                    this.animNPCEvent.setAnimation("animation", true);//this.animNPCEvent.setAnimation("npc_wolf_event", true);//this.animNPCEvent.setAnimation(BG_NPC_ANIM_NORMAL, true);
                    this.animNPCEvent.setScale(0.3);//this.animNPCEvent.setScale(0.23);//this.animNPCEvent.setScale(0.25);// new pos this.animNPCEvent.setScale(0.3);
                    this.animNPCEvent.setParent(markerNPCEvent2);
                    this.animNPCEvent.setEventListener(null, this.onWidgetNPCEvent2Touched.bind(this));
                    this.animNPCEvent.setNotifyBlockedTouch(true);
                }
            }
            if(GameEventTemplate3.getActiveEvent())
            {
                var markerNPCEvent3 = FWUI.getChildByName(this.widget, "markerNPCEvent3");
                if (markerNPCEvent3) {
                    this.animNPCEvent = new FWObject();
                    this.animNPCEvent.initWithSpine(SPINE_FISHING_NPC);//this.animNPCEvent.initWithSpine(SPINE_NPC_FISHERMAN);
                    this.animNPCEvent.setAnimation("npc_normal", true);//this.animNPCEvent.setAnimation("npc_wolf_event", true);//this.animNPCEvent.setAnimation(BG_NPC_ANIM_NORMAL, true);
                    this.animNPCEvent.setScale(0.075);//this.animNPCEvent.setScale(0.23);//this.animNPCEvent.setScale(0.25);// new pos this.animNPCEvent.setScale(0.3);
                    this.animNPCEvent.setParent(markerNPCEvent3);
                    this.animNPCEvent.setEventListener(null, this.onWidgetNPCEvent3Touched.bind(this));
                    this.animNPCEvent.setNotifyBlockedTouch(true);
                }
            }

			this.markerNPCTom = FWUI.getChildByName(this.widget, "markerNPCTom");
			if(!markerNPCTomStandPosition)
				markerNPCTomStandPosition = this.markerNPCTom.getPosition();//this.markerNPCTomStandPosition = this.markerNPCTom.getPosition();
			else
				this.markerNPCTom.setPosition(markerNPCTomStandPosition);
			this.markerNPCTomWaitPosition = cc.p(cc.winSize.width + 300, markerNPCTomStandPosition.y);//this.markerNPCTomWaitPosition = cc.p(cc.winSize.width + 300, this.markerNPCTomStandPosition.y);
			if (this.markerNPCTom) {
				this.animNPCTom = new FWObject();
				this.animNPCTom.initWithSpine(SPINE_NPC_TOMKID);
				this.animNPCTom.setAnimation(gv.tomkid.getStatusAnimation().name, true);// jira#5591 this.animNPCTom.setAnimation(TOMKID_ANIM_IDLE, true);
				this.animNPCTom.setScale(TOMKID_ANIM_SCALE_SMALL);
				this.animNPCTom.setFlip(true, false);
				this.animNPCTom.setParent(this.markerNPCTom);
				this.animNPCTom.setEventListener(null, this.onWidgetNPCTomTouched.bind(this));
				this.animNPCTom.setNotifyBlockedTouch(true);
				
				this.tomHireBoard = new FWObject();
				this.tomHireBoard.initWithSpine(SPINE_NPC_TOMKID);
				this.tomHireBoard.setAnimation("kid_for_hire", true);
				this.tomHireBoard.setScale(0.12);
				this.tomHireBoard.setParent(this.markerNPCTom);
				this.tomHireBoard.setPosition(50, -2);
				this.tomHireBoard.setEventListener(null, this.onWidgetNPCTomTouched.bind(this));
				this.tomHireBoard.setNotifyBlockedTouch(true);
			}

			this.markerNPCClown = FWUI.getChildByName(this.widget, "markerNPCClown");
			this.markerNPCClownStandPosition = cc.p(0, 0);//this.markerNPCClown.getPosition();
			this.markerNPCClownWaitPosition = cc.p(300, 0);//cc.p(cc.winSize.width + 300, this.markerNPCClownStandPosition.y);
			if (this.markerNPCClown) {
				this.animNPCClown = new FWObject();
				this.animNPCClown.initWithSpine(SPINE_NPC_CLOWN);
				this.animNPCClown.setAnimation(CLOWN_ANIM_IDLE_2, true);
				this.animNPCClown.setScale(0.07);
				this.animNPCClown.setParent(this.markerNPCClown);
				this.animNPCClown.setEventListener(null, this.onWidgetNPCClownTouched.bind(this));
				this.animNPCClown.setNotifyBlockedTouch(true);

				this.animNPCClown.setPosition(this.markerNPCClownWaitPosition);//this.markerNPCClown.setPosition(this.markerNPCClownWaitPosition);
				this.animNPCClown.setVisible(false);//this.markerNPCClown.setVisible(false);
            }


            this.isNPCClownActive = gv.userData.isEnoughLevel(g_MISCINFO.SPIN_USER_LEVEL) && gv.wheel.haveNext();
            if (this.isNPCClownActive)
                this.performClownWalkIn();


            this.markerNPCPigBank = FWUI.getChildByName(this.widget, "markerNPCPigBank");
            this.markerNPCPigBankStandPosition = cc.p(300, 0);//this.markerNPCClown.getPosition();
            if (this.markerNPCPigBank) {
                this.animNPCPigBank = new FWObject();
                this.animNPCPigBank.initWithSpine(SPINE_NPC_PIGBANK);
                this.animNPCPigBank.setAnimation(gv.pigBankPanel.checkEnoughDiamondPigBank()? PIGBANK_ANIM_WALK_DIAMOND:PIGBANK_ANIM_WALK, true);
                this.animNPCPigBank.setScale(0.15,0.15);
                this.animNPCPigBank.setParent(this.markerNPCPigBank,99);
                this.animNPCPigBank.setEventListener(null, this.onWidgetNPCPigBankTouched.bind(this));
                this.animNPCPigBank.setNotifyBlockedTouch(true);
                this.animNPCPigBank.isRun = true;
                //this.animNPCPigBank.isShowPanel = false;
                this.animNPCPigBank.setPosition(this.markerNPCPigBankStandPosition);//this.markerNPCClown.setPosition(this.markerNPCClownWaitPosition);
                this.animNPCPigBank.setVisible(false);//this.markerNPCClown.setVisible(false);
            }
            this.directionPigBank = 1;
            this.isNPCPigBankActive = gv.pigBankPanel.checkActive();
            if (this.isNPCPigBankActive)
                this.performPigBankWalk();

            AccumulateStore.initNPC();
		}
		
		// jira#5046
		// notification icons
		this.notifySmithy = FWUI.getChildByName(this.widget, "notifySmithy");
		this.notifyMining = FWUI.getChildByName(this.widget, "notifyMining");
		//this.notifyUnlock = FWUI.getChildByName(this.widget, "notifyUnlock");
		this.notifyBee = FWUI.getChildByName(this.widget, "notifyBee");
		this.notifyWolf = FWUI.getChildByName(this.widget, "notifyWolf");
		this.notifyPrivateShop = FWUI.getChildByName(this.widget, "notifyPrivateShop");
		//this.notifyAchievement = FWUI.getChildByName(this.widget, "notifyAchievement");
		this.notifyStorage = FWUI.getChildByName(this.widget, "notifyStorage");
        this.notifyTaskDerby = FWUI.getChildByName(this.widget, "notifyTaskDerby");
		this.notifyChest = FWUI.getChildByName(this.widget, "notifyChest");
		this.notifyTom = FWUI.getChildByName(this.widget, "notifyTom");
		this.notifyNewsboard = FWUI.getChildByName(this.widget, "notifyAlert");
		this.notifyLeaderboard = FWUI.getChildByName(this.widget, "notifyLeaderboard");
		this.notifyLeaderboardIcon = this.notifyLeaderboard.getChildren()[0];
		this.iconTomItem = FWUI.getChildByName(this.widget, "iconTomItem");
		if(!Game.isFriendGarden())
		{
			Ranking.refreshNotification();
			gv.arcade.refreshNotification();
			gv.tomkid.refreshNotification();
			if(this.animTreasure.ready)
				gv.chest.refreshNotification();
		}
		else
		{
			this.notifySmithy.setVisible(false);
			this.notifyMining.setVisible(false);
			//this.notifyUnlock.setVisible(false);
			this.notifyBee.setVisible(false);
			this.notifyWolf.setVisible(false);
			this.notifyPrivateShop.setVisible(false);
			//this.notifyAchievement.setVisible(false);
			this.notifyStorage.setVisible(false);
			this.notifyChest.setVisible(false);
			this.notifyTom.setVisible(false);
			this.notifyLeaderboard.setVisible(false);
            this.notifyTaskDerby.setVisible(false);
			//this.iconTomItem.setVisible(false); // jira#5369
		}
		
		//this.updateNPCSmithy();
		//this.updateNPCFisherman();
		Game.refreshUIMain(RF_UIMAIN_NPC | RF_UIMAIN_DRAGON);

		cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
            onTouchCancelled: this.onTouchEnded.bind(this)
        }, this);

		this.scheduleUpdate();
		fixBgPos = 0;
	},

	onExit: function () {
		FWUI.unfillData(this.widget);
		if(cc.sys.isNative)
			this.oceanWave.removeFromParent();
		this._super();
    },
    
    initFishJump: function ()
    {
        var fj1 = FWUI.getChildByName(this.widget, "markerFishJump_1");
        var fj2 = FWUI.getChildByName(this.widget, "markerFishJump_2");
        var fj3 = FWUI.getChildByName(this.widget, "markerFishJump_3");
        var fj4 = FWUI.getChildByName(this.widget, "markerFishJump_4");
        var fishJumps = [];
        if (fj1) fishJumps.push (fj1);
        if (fj2) fishJumps.push (fj2);
        if (fj3) fishJumps.push (fj3);
        if (fj4) fishJumps.push (fj4);

        if (fishJumps.length > 0)
        {
            this.animFishJump = new FWObject();
            this.animFishJump.initWithSpine(SPINE_FISH);
            this.animFishJump.setParent(fishJumps[0]);

            var replay = function() //web
            {
                var i = Math.round (Math.random () * fishJumps.length) % fishJumps.length;
                this.widget.runAction
                (
                    cc.sequence
                    (
                        cc.delayTime(Math.random() * 3 + 2),
                        cc.callFunc (function() //web
                        {
                            this.animFishJump.setParent (fishJumps[i]);
                            this.animFishJump.setFlip(Math.random() > 0.49, false);
                            this.animFishJump.setAnimation("animation", false, replay);
                        }.bind(this))
                    )
                );
            }.bind(this);

            this.animFishJump.setAnimation("animation", false, replay);
        }
    },

    updateParallel: function ()
    {
        if (this.baseY === this.base.y)
            return;
        
        var groundMinY = this.base.y + this.ground.y - 320;//var groundMinY = this.base.y + this.ground.y - this.ground.height * 0.5;
        if (groundMinY > 0)
            this.base.y -= groundMinY;
        
        if (this.base.y > parallel.cloud.start)
        {
            this.cloud.y = cc.lerp(bgCloudY, parallel.cloud.min, cc.clampf(this.base.y / parallel.cloud.start, 0, 1));
        }
        else
        {
            var current = this.getFloorWorldY (0);
            var range = this.getFloorSnapY (10);
            var index = -current / range;
            this.cloud.y = cc.lerp(parallel.cloud.min, parallel.cloud.max, cc.clampf(index, 0, 1));
        }

        var clamp = cc.clampf(-this.base.y / (CLOUDFLOOR_HEIGHT * 1.25), 0, 1);
        this.ocean.y = cc.lerp(parallel.ocean.min, parallel.ocean.max, clamp);
//      this.ground.y = cc.lerp(parallel.ground.min, parallel.ground.max, clamp);
        this.moutain.y = cc.lerp(parallel.moutain.min, parallel.moutain.max, clamp);
        this.bean.setScale(cc.lerp(2.1, 1, clamp));
        
        this.baseY = this.base.y;
    },
    
    update: function (dt)
    {
		if(this.base.y === 0 && fixBgPos < 1)
		{
			fixBgPos += dt;
			this.base.y = BG_GROUND_OFFSET;
		}

        if (this.touchId === -1)
            this.updateParallel();

		// update npc
		var index = Game.framesCount % 60;
		if(index === 0)
        {
            this.updateNPCTom();
            this.tossDiamondPig();
        }

		else if(index === 20)
        {
            this.updateNPCClown();
            this.updateNPCPigBank();
        }

		else if(index === 59)
		{
			// feedback: skip ship's appear animation
            //if (!this.animTreasure.play && gv.userData.isEnoughLevel(g_MISCINFO.GACHA_USER_LEVEL) && !FWUI.isShowing(UI_LEVEL_UP))
            //    this.shipComing();
            if (!this.animTreasure.play && gv.userData.isEnoughLevel(g_MISCINFO.GACHA_USER_LEVEL))
			{
				this.animTreasure.play = true;
				this.shipReady(true);
				gv.chest.refreshNotification();
				//Tutorial.onGameEvent(EVT_GACHA_SHIP_ARRIVED);
			}
            //else if (this.animTreasure.ready)
            //    gv.chest.refreshNotification();
		
			Ranking.refreshNotification();

            if(g_MISCINFO.DERBY_ACTIVE && this.notifyTaskDerby)
            {
                var arrTask = Guild2.getTaskDoing();
                if(arrTask){
                    if(arrTask.length>0&&!Game.isFriendGarden()){
                        this.notifyTaskDerby.setVisible(true);
                        var uiDef ={
                            icon:{type:UITYPE_IMAGE, field:"actionIcon", scale:"data.actionIconScale * 0.5"},
                        };
                        FWUI.fillData(this.notifyTaskDerby,arrTask[0],uiDef);
                    }
                    else
                    {
                        this.notifyTaskDerby.setVisible(false);
                    }
                }
                else
                {
                    this.notifyTaskDerby.setVisible(false);
                }

            }
        }
		
		// jira#5924
		for(var i=0; i<this.radialProgressList.length; i++)
		{
			var item = this.radialProgressList[i];
			if(Game.getGameTimeInSeconds() > item.endTime)
			{
				this.showRadialProgress(item.name, false);
				i--;
				continue;
			}
			else
			{
				var percent = (Game.getGameTimeInSeconds() - item.startTime) * 100 / (item.endTime - item.startTime)
				item.radialProgress.setPercentage(100 - percent);
			}
		}
	},

    shipComing:function ()
    {
		// jira#5350
		if(Game.isFriendGarden())
		{
			this.animTreasure.play = true;
            this.shipReady (false);
			return;
        }
        
        if (Background.data.shipReady)
        {
			this.animTreasure.play = true;
            this.shipReady (true);
			//gv.chest.refreshNotification();
            return;
        }
		
        Background.data.shipReady = true;
        this.animTreasure.play = true;
        this.animTreasure.node.runAction(
            cc.sequence(
                cc.delayTime(2),
                cc.spawn(
                    cc.callFunc(function() {this.animTreasure.setVisible(true);}.bind(this)),//cc.fadeIn(1),
                    cc.moveTo(3, cc.p(0, 0)),
                    cc.callFunc(function() {//web
                        this.animTreasure.setAnimation("building_init", false, function() //web
                        {
                            this.shipReady (true);
							//this.refreshTreasureTimer();
							gv.chest.refreshNotification();
                        }.bind(this));
                    }.bind(this))
                )
            )
        );
    },

    shipReady: function (canTouch)
    {
        this.animTreasure.ready = true;
        this.animTreasure.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
        this.animTreasure.setPosition(0, 0);
        //this.animTreasure.setOpacity(255);
        this.animTreasure.setVisible(true);

        if (canTouch && !Game.isFriendGarden())
        {
            this.animTreasure.setEventListener(null, this.onWidgetTreasureTouched.bind(this));
            this.animTreasure.setNotifyBlockedTouch(true);
        }
    },

    getFloorSnapY: function (floorIndex) {
	    return floorIndex * CLOUDFLOOR_HEIGHT;
    },

    getFloorWorldY: function (floorIndex) {
        return this.base.y + this.floorStartY + this.getFloorSnapY(floorIndex);
    },

    snapFloor: function (floorIndex, floorTarget, effect, callback)//web snapFloor: function (floorIndex, floorTarget, effect = true, callback = null)
    {
		if(effect === undefined)
			effect = true;
		if(callback === undefined)
			callback = null;
		
        if (floorIndex < 0)
        {
            this.snapGround();
            return;
        }
        
        this.lastFloorIndex = this.floorIndex;
        this.floorIndex = floorIndex;
        var baseTargetY = this.getFloorSnapY(floorTarget) - this.getFloorSnapY(floorIndex) - this.floorStartY + BG_FLOOR_BOTTOM_Y;
        if (floorIndex === CloudFloors.getLastUnlockedFloorIdx() + 1)
            baseTargetY += BG_FLOOR_TOP_SNAP_OFFSET_Y;
        
        if (effect)
        {
            var time = (this.lastFloorIndex  === -1) ? BG_FLOOR_SNAP_GROUND_TIME : BG_FLOOR_SNAP_FLOOR_TIME;
            this.base.stopAllActions();
            this.base.runAction(
                cc.sequence(
                    new cc.EaseSineOut(
                        cc.moveTo(time, cc.p(this.base.x, baseTargetY))
                    ),
                    cc.callFunc(function () {//web
                        callback && callback();
                        Tutorial.onGameEvent(EVT_SCROLL_TO_FLOOR, floorIndex);
                        FWObjectManager.updateVisibility(gv.background.floorIndex);
                    })
                )
            );
        }
        else
        {
            this.base.y = baseTargetY;
            callback && callback();
        }
        
        // jira#5079
        if(this.lastFloorIndex !== this.floorIndex)
        {
            CloudFloors.showFloorNum(floorIndex + 1);
            if(floorIndex <= 0)
                CloudFloors.showFloorNum(floorIndex);
            CloudFloors.currentFloorNum = floorIndex;
        }
        
		if(cc.sys.isNative)
			this.oceanWave.setVisible (false);
    },

    snapGround: function (effect)//web snapGround: function (effect = true)
    {
		if(effect === undefined)
			effect = true;
		
	    this.floorIndex = -1;
        if (effect)
        {
            this.base.stopAllActions();
            this.base.runAction(
                cc.sequence(
                    new cc.EaseSineOut(
                        cc.moveTo(BG_FLOOR_SNAP_GROUND_TIME, cc.p(this.base.x, BG_GROUND_OFFSET))
                    ),
                    cc.callFunc(function() {//web
                        Tutorial.onGameEvent(EVT_SCROLL_TO_FLOOR, -1);
                        FWObjectManager.updateVisibility(gv.background.floorIndex);
                    })
                )
            );
        }
        else
        {
            this.base.y = BG_GROUND_OFFSET;
        }

		CloudFloors.showFloorNum(-1);
        CloudFloors.currentFloorNum = -1;
		gv.gameBuildingStorageInterface.refreshNotification();
		if(cc.sys.isNative)
			this.oceanWave.setVisible (true);
	},

    updateNPCTom: function () {
        if (!gv.tomkid)
            return;

        gv.tomkid.updateStatus();
        var animation = gv.tomkid.getStatusAnimation();
        if (animation) {
            if (this.animNPCTom && this.animNPCTom.spine && this.animNPCTom.spine.animation !== animation.name && !this.animNPCTom.isBusy) {
                this.animNPCTom.setAnimation(animation.name, true);
                this.animNPCTom.setAnimationTimeScale(animation.timeScale);
                this.animNPCTom.setScale(TOMKID_ANIM_SCALE_SMALL, TOMKID_ANIM_SCALE_SMALL);
            }
        }
    },

    updateNPCClown: function () {
	    if (this.isNPCClownActive) {

        }
        else {            
            if (gv.userData.isEnoughLevel(g_MISCINFO.SPIN_USER_LEVEL) && gv.wheel.isUnlocked() && (gv.wheel.haveNext() || gv.wheel.getWaitSlot())) {
                this.isNPCClownActive = true;
                this.performClownWalkIn();
            }
        }
    },

    updateNPCPigBank: function()
    {
        //cc.log("PIGBANK : + ",this.animNPCPigBank.isShowPanel);
        if(this.isNPCPigBankActive)
        {

        }
        else
        {
            if(gv.pigBankPanel.checkActive())
            {
                this.isNPCPigBankActive= true;
                this.performPigBankWalk();
            }
        }
        //if(!this.animNPCPigBank.isShowPanel)
        //{
        //    if(this.animNPCPigBank.isBack)
        //    {
        //        this.performPigBankWalk();
        //        this.animNPCPigBank.isBack = false;
        //    }
        //}
    },
    
    updateNPCDragon: function ()
    {
        AccumulateStore.checkAndShowNPC ();
    },

    checkClownForWalkingOut: function () {
        if (!this.isNPCClownActive)
            return;

        if (!this.animNPCClown || this.animNPCClown.isBusy || !this.animNPCClown.haveSpin)
            return;
            
        if (gv.wheel.haveNext() || gv.wheel.getWaitSlot())
            return;

        this.animNPCClown.haveSpin = false;
        this.performClownWalkOut();
    },

    performNPCTomFinding: function (time) {
	    this.performNPCTomLeaving(0, function () {
            this.performNPCTomReturning(time);
        }.bind(this));
        
        AudioManager.effect (EFFECT_OWL_FLY_AWAY);
    },

    performNPCTomLeaving: function (delay, callback) {//web performNPCTomLeaving: function (delay = 0, callback = null) {
		
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        if (this.markerNPCTom && this.animNPCTom) {
            var moveDistance = Math.abs(this.markerNPCTomWaitPosition.x - markerNPCTomStandPosition.x);//var moveDistance = Math.abs(this.markerNPCTomWaitPosition.x - this.markerNPCTomStandPosition.x);
            var moveCallback = cc.callFunc(function () {
                this.animNPCTom.isBusy = false;
                callback && callback();
            }.bind(this));
            this.animNPCTom.isBusy = true;
            this.animNPCTom.setAnimation(TOMKID_ANIM_RUN, true);
            this.animNPCTom.setAnimationTimeScale(TOMKID_ANIM_RUNNING_TIME_SCALE);
            this.animNPCTom.setScale(TOMKID_ANIM_SCALE_SMALL, TOMKID_ANIM_SCALE_SMALL);
            this.markerNPCTom.runAction(cc.sequence(cc.delayTime(delay), cc.moveTo(moveDistance / TOMKID_ANIM_RUNNING_SPEED, this.markerNPCTomWaitPosition), moveCallback));
        }
    },

    performNPCTomReturning: function (delay, callback) {//web performNPCTomReturning: function (delay = 0, callback = null) {
		
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        if (this.markerNPCTom && this.animNPCTom) {
            var moveDistance = Math.abs(this.markerNPCTomWaitPosition.x - markerNPCTomStandPosition.x);//var moveDistance = Math.abs(this.markerNPCTomWaitPosition.x - this.markerNPCTomStandPosition.x);
            var moveCallback = cc.callFunc(function () {
                var animCallback = function () {
                    this.animNPCTom.setAnimation(TOMKID_ANIM_IDLE_GOODS, true);
                    this.animNPCTom.isBusy = false;
                    callback && callback();
					gv.tomkid.refreshNotification();
                }.bind(this);
                this.animNPCTom.setAnimation(TOMKID_ANIM_RUN_BACK_TIRED, false, animCallback);
                this.animNPCTom.setAnimationTimeScale(TOMKID_ANIM_IDLE_TIME_SCALE);
            }.bind(this));
            this.animNPCTom.isBusy = true;
            this.animNPCTom.setAnimation(TOMKID_ANIM_RUN_BACK, true);
            this.animNPCTom.setAnimationTimeScale(TOMKID_ANIM_RUNNING_TIME_SCALE);
            this.animNPCTom.setScale(-TOMKID_ANIM_SCALE_SMALL, TOMKID_ANIM_SCALE_SMALL);
            this.markerNPCTom.runAction(cc.sequence(cc.delayTime(delay), cc.moveTo(moveDistance / TOMKID_ANIM_RUNNING_SPEED, markerNPCTomStandPosition), moveCallback));//this.markerNPCTom.runAction(cc.sequence(cc.delayTime(delay), cc.moveTo(moveDistance / TOMKID_ANIM_RUNNING_SPEED, this.markerNPCTomStandPosition), moveCallback));
            
            AudioManager.effect (EFFECT_OWL_RETURN);
        }
    },

    performClownWalkIn: function (delay, callback) //web performClownWalkIn: function (delay = 0, callback = null)
    {
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        if (!this.markerNPCClown || !this.animNPCClown)
            return;

        var idle = function() {//web
            this.animNPCClown.setAnimation(CLOWN_ANIM_IDLE_1, true);
            this.animNPCClown.isBusy = false;
            this.animNPCClown.haveSpin = gv.wheel.haveNext();
            callback && callback();
        }.bind(this);

        var stop = function() {//web
            this.animNPCClown.setScale(-0.07, 0.07);
            this.animNPCClown.setAnimation(CLOWN_ANIM_WALK_STOP, false, idle);
            callback && callback();
        }.bind(this);

        if (Background.data.clownReady)
        {
            this.animNPCClown.setVisible(true);
            this.animNPCClown.setPosition (this.markerNPCClownStandPosition);
            idle ();
            return;
        }

        Background.data.clownReady = true;
            
        var moveDistance = Math.abs(this.markerNPCClownStandPosition.x -this.markerNPCClownWaitPosition.x);
        this.animNPCClown.setVisible(true);
        this.animNPCClown.isBusy = true;
        this.animNPCClown.setScale(0.07, 0.07);
        this.animNPCClown.setAnimation(CLOWN_ANIM_WALK_IN, true);
        this.animNPCClown.node.runAction(
            cc.sequence(
                cc.delayTime(delay),
                cc.show(),
                cc.moveTo(moveDistance / 50, this.markerNPCClownStandPosition),
                cc.callFunc(stop)
            )
        );

        // this.markerNPCClown.runAction(cc.sequence(cc.delayTime(delay), cc.show(), cc.moveTo(moveDistance / 50, this.markerNPCClownStandPosition), moveCallback));
    },
    tossDiamondPig:function()
    {
        //cc.log(this.LOGTAG+ " tossDiamon in position"+this.animNPCPigBank.getPositionX()+","+this.animNPCPigBank.getPositionY())
        //if(this.animNPCPigBank.isRun)
        //{
        //    FWUtils.showSpine(SPINE_NPC_PIGBANK,"default",PIGBANK_ANIM_DIAMOND,false,this.markerNPCPigBank,cc.p(this.animNPCPigBank.getPositionX()+10,this.animNPCPigBank.getPositionY()+20),8).setScale(0.15);
        //}
        if(Game.isFriendGarden()) return;
        if(!this.animNPCPigBank.isRun) return;
        if(!gv.pigBankPanel.check()) return;
        if(!gv.pigBankPanel.checkEnoughDiamondPigBank()) return;
        if (this.animNPCPigBank.node)
            FWUtils.showSpine(SPINE_NPC_PIGBANK,"default",PIGBANK_ANIM_DIAMOND,false,this.markerNPCPigBank,cc.p(this.animNPCPigBank.getPositionX()+10*this.directionPigBank,this.animNPCPigBank.getPositionY()+12),10).setScale(0.15*this.directionPigBank,0.15);

    },
    performPigBankWalk: function (delay, callback) //web performPigBankWalk: function (delay = 0, callback = null)
    {
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        var moveDistance = 275;

        if (!this.markerNPCPigBank || !this.animNPCPigBank)
            return;

        if(!gv.pigBankPanel.check())
        {
            this.markerNPCPigBank.setVisible(false);
        }else
        {
            this.markerNPCPigBank.setVisible(true);
        }


        var idle = function() {//web
            this.animNPCPigBank.setAnimation(PIGBANK_ANIM_STAND, true);
            //this.animNPCClown.isBusy = false;
            //this.animNPCClown.haveSpin = gv.wheel.haveNext();
            //callback && callback();
        }.bind(this);

        var sitDown = function() {//web
            // this.animNPCPigBank.setScale(-0.15, 0.15);
            this.animNPCPigBank.isRun = false;
            this.animNPCPigBank.setAnimation(PIGBANK_ANIM_STAND, false);
        }.bind(this);
        var stand = function() {//web
            // this.animNPCPigBank.setScale(-0.15, 0.15);
            this.animNPCPigBank.setAnimation(PIGBANK_ANIM_IDLE, false);
        }.bind(this);

        var stop = function() {//web
            //this.animNPCPigBank.setScale(-0.1, 0.1);
            this.animNPCPigBank.setAnimation(PIGBANK_ANIM_STAND, false, sitDown);
            //callback && callback();
        }.bind(this);
        var comeBack = function() {//web
           // if(this.animNPCPigBank.getPositionX() == 0 || this.animNPCPigBank.getPositionX() == 900) return;

            this.directionPigBank *= -1;
            this.animNPCPigBank.setScale(0.15*this.directionPigBank, 0.15);
            //this.animNPCPigBank.setAnimation(PIGBANK_ANIM_WALK_DIAMOND, true);
            //this.performPigBankWalk();

           // this.animNPCPigBank.setAnimation(PIGBANK_ANIM_STAND, false, sitDown);
            //callback && callback();
        }.bind(this);
        var walk = function() {//web
            cc.log(this.LOGTAG+ " position NPC PigBank :" + this.animNPCPigBank.getPositionX());
            this.animNPCPigBank.isRun = true;
            //this.animNPCPigBank.setAnimation(PIGBANK_ANIM_WALK, true);
            this.performPigBankWalk();
        }.bind(this);
        var checkChangeDirection= function() {//web
            if(this.animNPCPigBank.getPositionX() <=300 ||this.animNPCPigBank.getPositionX() >=850)
            {
                comeBack();
            }
        }.bind(this);
        var tossDiamond = function() {//web
            FWUtils.showSpine(SPINE_NPC_PIGBANK,"default",PIGBANK_ANIM_DIAMOND,false,null,cc.p(20,20),8);
        }.bind(this);


        //if (Background.data.pigBankReady)
        //{
        //    this.animNPCPigBank.setVisible(true);
        //    this.animNPCPigBank.setPosition (this.markerNPCPigBankStandPosition);
        //    idle ();
        //    return;
        //}

        //Background.data.pigBankReady = true;

        this.animNPCPigBank.isRun = true;
        this.animNPCPigBank.setVisible(true);
        //this.animNPCPigBank.isBusy = true;
        //this.animNPCPigBank.setScale(0.15, 0.15);
        this.animNPCPigBank.setAnimation(gv.pigBankPanel.checkEnoughDiamondPigBank()? PIGBANK_ANIM_WALK_DIAMOND:PIGBANK_ANIM_WALK, true);
        this.animNPCPigBank.node.runAction(
            cc.sequence(
                cc.delayTime(delay),
                cc.show(),
                cc.moveTo(moveDistance / 20, cc.p(this.animNPCPigBank.getPositionX() + this.directionPigBank*moveDistance,this.animNPCPigBank.getPositionY())),
                cc.callFunc(sitDown),
                cc.delayTime(2),
                cc.callFunc(stand),
                cc.callFunc(checkChangeDirection),
                cc.callFunc(walk)

                ////cc.callFunc(comeBack),
                //cc.moveTo(moveDistance2 / 50, cc.p(this.animNPCPigBank.getPositionX() + this.directionPigBank*300,this.animNPCPigBank.getPositionY())),
                //cc.callFunc(sitDown),
                //cc.delayTime(2),
                //cc.callFunc(stand),
                //cc.callFunc(walk),
                //cc.moveTo(moveDistance3 / 50, cc.p(this.animNPCPigBank.getPositionX() + this.directionPigBank*300,this.animNPCPigBank.getPositionY())),
                //cc.callFunc(sitDown),
                //cc.delayTime(2),
                //cc.callFunc(stand),
                //cc.callFunc(walk),
                //cc.callFunc(comeBack)
            )
        );

        // this.markerNPCClown.runAction(cc.sequence(cc.delayTime(delay), cc.show(), cc.moveTo(moveDistance / 50, this.markerNPCClownStandPosition), moveCallback));
    },

    performClownWalkOut: function (delay, callback)//web performClownWalkOut: function (delay = 0, callback = null)
    {
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        if (!this.markerNPCClown || !this.animNPCClown)
            return;
        
        var moveDistance = Math.abs(this.markerNPCClownWaitPosition.x + 100 - this.markerNPCClownStandPosition.x);
        var moveCallback = cc.callFunc(function() {//web
            this.animNPCClown.isBusy = false;
			this.animNPCClown.setVisible(false);// jira#5524
            callback && callback();
        }.bind(this));

        this.animNPCClown.isBusy = true;
        this.animNPCClown.setAnimation(CLOWN_ANIM_WALK_OUT, true);
		this.animNPCClown.setScale(0.07, 0.07);
        this.animNPCClown.node.runAction(
            cc.sequence(
                cc.delayTime(delay),
                cc.moveTo(moveDistance / 50, cc.p(this.markerNPCClownWaitPosition.x + 100, this.markerNPCClownWaitPosition.y)),
                // jira#5524 cc.hide(),
                moveCallback
            )
        );
        
        //this.markerNPCClown.runAction(cc.sequence(cc.delayTime(delay), cc.moveTo(moveDistance / 50, this.markerNPCClownWaitPosition), cc.hide(), moveCallback));
    },

    performArcadeUnlockNotify: function ()
    {
        if (!this.animGames)
            return;
            
        this.gameUnlock.setVisible (true);
        // this.animGames.node.runAction(
        //     cc.repeatForever(
        //         cc.sequence(
        //             cc.fadeTo (0.4, 200),
        //             cc.delayTime (0.1),
        //             cc.fadeTo (0.4, 255),
        //             cc.delayTime (0.1)
        //         )
        //     )
        // );
    },

    performArcadeUnlocked: function ()
    {
        if (this.animGames)
        {
            // this.animGames.node.stopAllActions();
            // this.animGames.node.runAction(cc.sequence(cc.fadeOut (0.2), cc.hide()));
            this.gameUnlock.setVisible (false);
        }
		
		//fix: games building wont change animation
		if(this.animGames)
		{
			this.animGames.uninit();
			FWPool.removeNodes(SPINE_BUILDING_GAMES);
		}

        var markerGames = FWUI.getChildByName(this.widget, "markerGames");       
        this.animGames = new FWObject();
        this.animGames.initWithSpine(SPINE_BUILDING_GAMES);
        this.animGames.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
        this.animGames.setParent(markerGames);
        this.animGames.setScale(0.93);
        this.animGames.setEventListener(null, this.onWidgetGamesTouched.bind(this));
        this.animGames.setNotifyBlockedTouch(true);

        var effect = new FWObject();
        effect.initWithSpine(SPINE_MACHINE_EGG);
        effect.setAnimation("cloud_dust_effect_3", true);
        effect.setParent(this.widget);
        effect.setPosition (markerGames.getWorldPosition());
        effect.node.runAction(
            cc.sequence(
                cc.fadeOut(3),
                cc.hide(),
                cc.callFunc (
                    function(target) {//web
                        this.updateNPCSmithy ();
                        this.updateNPCFisherman ();
                    }.bind(this), effect
                )
            )
        );
    },

    updateNPCSmithy: function () {
        if (this.animNPCSmith)
            this.animNPCSmith.setVisible(gv.arcade.isUnlocked());
    },

    updateNPCFisherman: function () {
        if (this.animNPCFisherman)
            this.animNPCFisherman.setVisible(gv.arcade.isUnlocked());
		
        if (this.animNPCBee)
            this.animNPCBee.setVisible(gv.arcade.isUnlocked());
    },
    updateNPCPigBankStatus: function(visible)
    {
        if( this.markerNPCPigBank)
            this.markerNPCPigBank.setVisible(visible);

        if(this.animNPCPigBank)
            this.animNPCPigBank.setVisible(visible);
    },
    updateNPCPigBankMove: function()
    {
        this.animNPCPigBank.node.stopAllActions();
        this.isNPCPigBankActive = false;
    },
    onTouchBegan: function (touch, event) {
        if (Game.gameScene)
		    Game.gameScene.lastActionTime = Game.getGameTimeInSeconds();
		if(cc.sys.isNatve)
			this.oceanWave.setVisible (false);
        if (this.touchId === -1) {
            this.touchId = touch.getID();
            this.touchStartPoint = touch.getLocation();
            this.touchBaseStartPoint = this.base.getPosition();
        }
        return true;
    },

    onTouchMoved: function (touch, event) {
        if (this.disableScrolling)
            return;

        if (this.touchId !== touch.getID())
            return;
            
        var position = touch.getLocation();
        var moveVector = cc.PSUB(position, this.touchStartPoint);
        this.base.y = this.touchBaseStartPoint.y + moveVector.y;
        
        this.updateParallel();
        FWObjectManager.updateVisibility_showAll(this.floorIndex);
    },

    onTouchEnded: function (touch, event)
    {
        if (this.touchId !== touch.getID())
            return;

        this.touchId = -1;
        if (this.disableScrolling)
            return;
        
        var moveVector = cc.PSUB(touch.getLocation(), this.touchStartPoint);
        var moveLength = cc.PLENGTH(moveVector);
		
        if (moveLength <= BG_FLOOR_CHANGE_MIN_OFFSET_Y)
        {
            this.snapFloor(this.floorIndex, BG_FLOOR_BASE_INDEX);
            return;
        }
        
        if (moveVector.y > 0 && this.floorIndex === 0)
        {
            this.snapGround();
            return;
        }
        
        var floorBasePosY = this.getFloorSnapY(BG_FLOOR_BASE_INDEX);

        var startIndex = (moveVector.y > 0) ? Math.max(this.floorIndex - 1, 0) : Math.min(this.floorIndex + 1, CloudFloors.getLastUnlockedFloorIdx());
        var endIndex = (moveVector.y > 0) ? 0 : CloudFloors.getLastUnlockedFloorIdx();

        var floorStartIndex = Math.min(startIndex, endIndex);
        var floorEndIndex = Math.max(startIndex, endIndex);

        var nearestFloor = -1;
        var nearestDistance = 1000000;
        for (var i = floorStartIndex; i <= floorEndIndex; i++)
        {
            var floorPosY = this.getFloorWorldY(i);
            var floorDistance = Math.abs(floorPosY - floorBasePosY);
            if (floorDistance < nearestDistance)
            {
                nearestDistance = floorDistance;
                nearestFloor = i;
            }
        }

        if (nearestFloor >= 0)
        {
            var groundMinY = this.base.y + this.ground.y - 320;//var groundMinY = this.base.y + this.ground.y - this.ground.height * 0.5;
            if (groundMinY >= 0)
                this.snapGround();
            else
                this.snapFloor(nearestFloor, BG_FLOOR_BASE_INDEX);
        }
    },

    onWidgetStorageTouched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgStorage"))
			return;
        
        // Birds.disbane ("storage");
        // this.animStorage.setAnimation(BG_BUILDING_ANIM_NORMAL_TOUCH, false, () =>
        // {
        //     this.animStorage.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
        // });

		// jira#5131
		if(gv.gameBuildingStorageInterface.upgradeableTab)
			gv.gameBuildingStorageInterface.showStorageUIWithType(true, gv.gameBuildingStorageInterface.upgradeableTab, true);
		else
			gv.gameBuildingStorageInterface.showStorageUI(true);
    },

    onWidgetAchievementTouched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgAchievement") || Game.isFriendGarden() || gv.userData.getLevel() < g_MISCINFO.ACHIEVEMENT_USER_LEVEL)
            return;
        
        // this.animAchievement.setAnimation(BG_BUILDING_ANIM_NORMAL_TOUCH, false, () =>
        // {
        //     this.animAchievement.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
        // });
        
        this.onWidgetFrogTouched (touch, sender);
        
		if(ENABLE_ACHIEVEMENT)
		{
			if(cc.sys.isNative)
				Achievement.show();
			else
			{
				showLoadingProgress();
				cc.director.getScheduler().scheduleCallbackForTarget(this, function()
				{
					Achievement.show();
					showLoadingProgress(false);
				}, 0, 0, 0, false);
			}
		}
		else
			gv.miniPopup.showAchievementPresent ();
    },

    onWidgetLeaderboardTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgLeaderboard"))
			return;
		
		if(!g_MISCINFO.RANKING_BOARD_ACTIVE)
			return;
		
		if(gv.mainUserData.getLevel() < g_MISCINFO.RANKING_BOARD_LEVEL)
			gv.miniPopup.showLeaderboardPresent();
		else
			Ranking.show();
    },

    onWidgetFrogTouched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgFrog"))
			return;
		
        this.animFrog.setAnimation ("touch", false, function() {//web
            this.animFrog.setAnimation ("jump", false, function() {//web
                this.animFrog.setAnimation ("normal", true);
            }.bind(this))
        }.bind(this));
    },

    onWidgetGamesTouched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgArcade"))
			return;
		
        if (gv.arcade.isUnlocked())
        {
            // this.animGames.setAnimation(BG_BUILDING_ANIM_NORMAL_TOUCH, false, () =>
            // {
            //     this.animGames.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
            // });

            gv.arcade.showPopup();
            return;
        }

        if (gv.userData.isEnoughLevel(g_MISCINFO.BUILDING_GAME_USER_LEVEL))
        {
            network.connector.sendRequestUnlockArcade();
            return;
        }
        
        // this.animGames.setAnimation(BG_BUILDING_ANIM_LOCKED_TOUCH, false, () =>
        // {
        //     this.animGames.setAnimation(BG_BUILDING_ANIM_LOCKED, true);
        // });

        gv.miniPopup.showGameHousePresent ();
    },

    onWidgetGuildTouched: function (touch, sender)
    {
        if (Game.gameScene)
		    Game.gameScene.showFocusPointer("guild", false);
		if(!Tutorial.acceptInput("bgGuild"))
            return;

        // Birds.disbane ("guild");
        // this.animGuild.setAnimation(BG_BUILDING_ANIM_NORMAL_TOUCH, false, () =>
        // {
        //     this.animGuild.setAnimation(BG_BUILDING_ANIM_NORMAL, true);
        // });

		if(g_MISCINFO.GUILD_ACTIVE && gv.userData.getLevel() >= g_MISCINFO.GUILD_USER_LEVEL)
		{
			if(!Game.isFriendGarden())
			{
				Guild.setData(null); // force reload
				Guild.show();
			}
			else if(gv.userData.guildId >= 0)
				Guild.load(gv.userData.guildId, function(data) {Guild.currentData = data; Guild.currentTab = GUILD_TAB_GUILD; Guild.setState(GUILD_STATE_INFO);});
		}
		else if(!Game.isFriendGarden())
			gv.miniPopup.showGuildPresent ();
    },

    onWidgetGuild2Touched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgGuild2"))
            return;
        
		if(g_MISCINFO.GUILD_ACTIVE && gv.userData.getLevel() >= g_MISCINFO.GUILD_USER_LEVEL)
		{
			if(!Guild.isPlayerInGuild())
            {
                var displayInfo = {title:FWLocalization.text("TXT_CHAT_MISS_GUILD_TITLE"),content:FWLocalization.text("TXT_GUILD2_NOT_IN_GUILD"), closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PUSS,avatarBg:true};
                Game.showPopup(displayInfo, function () { Guild.showTab(GUILD_TAB_SEARCH);});
            }
            else
            {
                var errorMsg = null;
                if(!g_MISCINFO.DERBY_ACTIVE)
                    errorMsg = FWLocalization.text("TXT_GUILD2_WAIT_NEXT_DERBY");
                else if(Guild.getMembersCount < g_MISCINFO.DERBY_JOIN_MEMBER_REQUIRE)
                    errorMsg = cc.formatStr(FWLocalization.text("TXT_GUILD2_DERBY_NOT_ENOUGH_MEMBER"), g_MISCINFO.DERBY_JOIN_MEMBER_REQUIRE);

                if(errorMsg)
                    FWUtils.showWarningText(errorMsg, FWUtils.getWorldPosition(sender.node));
                else
                    Guild2.show();
            }
		}
		else if(!Game.isFriendGarden())
			gv.miniPopup.showGuildPresent();
    },

    onWidgetInboxTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgNewsboard") || Game.isFriendGarden())
			return;
		
        cc.log(this.LOGTAG, "onWidgetInboxTouched");
        NewsBoard.showPrivateShop(sender.node);
		Tutorial.onGameEvent(EVT_TOUCH_END, "bgNewsboard");
    },

    onWidgetPrivateShopTouched: function (touch, sender)
    {
		if(!Tutorial.acceptInput("bgPrivateShop"))
			return;
         
        cc.log(this.LOGTAG, "onWidgetPrivateShopTouched");
        PrivateShop.privateShop = gv.userData.privateShop;
        PrivateShop.friendId = null;
        if(Game.isFriendGarden())
        {
			var friendData = {};
			friendData[NB_SLOT_USER_ID] = gv.userData.userId;
            PrivateShop.showFriendPrivateShop(friendData);
            return;
        }

        var needUpdate = false;
        if (gv.userData.getLevel() >= g_MISCINFO.PS_USER_LEVEL)
        {
            var slots = PrivateShop.privateShop[PS_SLOTS];
            for (i=0; i<slots.length; i++)
            {
                var slot = slots[i];
                if (slot[PS_SLOT_ITEM] !== undefined && slot[PS_SLOT_IS_SOLD] === false)
                    needUpdate = true;
            }
        }

        if (needUpdate)
        {
            var pk = network.connector.client.getOutPacket(PrivateShop.RequestPrivateShopGet);
            pk.pack();
            network.connector.client.sendPacket(pk);
        }
        else
            PrivateShop.show(sender.node);
    },

    onWidgetAirShipTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgAirship"))
			return;
		
        cc.log(this.LOGTAG, "onWidgetAirShipTouched");
        cc.log(this.LOGTAG, "onWidgetAirShipTouched", "size: %j", sender.node.getBoundingBox());
        Airship.setData(gv.userData.airship);
        Airship.friendId = null;
        Airship.show(sender.node);
    },

    onWidgetTreasureTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgChest"))
            return;
		
        if (gv.userData.isEnoughLevel(g_MISCINFO.GACHA_USER_LEVEL)) {
            gv.chest.showPopup();
        }
        else {
            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_CHEST_MSG_LIMIT_LEVEL"), g_MISCINFO.GACHA_USER_LEVEL), FWUtils.getWorldPosition(sender.node));
        }
		Tutorial.onGameEvent(EVT_TOUCH_END, "bgChest");
    },

    onWidgetNPCTomTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgTom") || this.animNPCTom.isBusy)
			return;
		
        if (gv.userData.isEnoughLevel(g_MISCINFO.TOM_USER_LEVEL)) {
            gv.tomkid.showPopup();
        }
        else {
            gv.miniPopup.showTomPresent();
        }
    },

    onWidgetNPCEventTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgEventWolf"))
			return;

		var requiredLevel = g_MISCINFO.EV01_USER_LEVEL;
        if(!gv.userData.isEnoughLevel(requiredLevel))
		{
			// jira#6037
            //FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"), requiredLevel), FWUtils.getWorldPosition(sender.node));
			GameEvent.showInfo();
			return;
        }
		
        GameEvent.show();
    },
    onWidgetNPCEvent2Touched: function (touch, sender) {
        if(!Tutorial.acceptInput("bgEventWolf"))
           return;

        var requiredLevel = g_MISCINFO.EV02_USER_LEVEL;
        if(!gv.userData.isEnoughLevel(requiredLevel))
        {
            // jira#6037
            //FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"), requiredLevel), FWUtils.getWorldPosition(sender.node));
            GameEvent.showInfo();
            return;
        }

        GameEventTemplate2.show();
    },
    onWidgetNPCEvent3Touched: function (touch, sender) {
        if(!Tutorial.acceptInput("bgEventWolf"))
            return;

        var requiredLevel = g_MISCINFO.EV03_USER_LEVEL;
        if(!gv.userData.isEnoughLevel(requiredLevel))
        {
            // jira#6037
            //FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"), requiredLevel), FWUtils.getWorldPosition(sender.node));
            GameEvent.showInfo();
            return;
        }

        GameEventTemplate3.show();
        GameEventTemplate3.changeTab(FISHING_TAB_EVENT);
    },
    onWidgetNPCClownTouched: function (touch, sender) {
		if(!Tutorial.acceptInput("bgClown"))
			return;

        if (gv.userData.isEnoughLevel(g_MISCINFO.SPIN_USER_LEVEL)) {
            gv.wheel.showPopup();
        }
        else {
            FWUtils.showWarningText(cc.formatStr(FWLocalization.text("TXT_WHEEL_HINT_LIMIT_LEVEL"), g_MISCINFO.SPIN_USER_LEVEL), FWUtils.getWorldPosition(sender.node));
        }
    },
    onWidgetNPCPigBankTouched: function (touch, sender) {
        //this.animNPCPigBank.node.stopAllActions();
        //this.animNPCPigBank.setAnimation(PIGBANK_ANIM_IDLE,true);
        //this.animNPCPigBank.isRun = false;
        //this.animNPCPigBank.isBack = false;
        //this.animNPCPigBank.isShowPanel = true;
        gv.pigBankPanel.show();
    },
	
	// jira#5047
	updateStorageSkin:function()
	{
		var level = gv.userData.getLevel();
		var skin = "level_1";
		if(level >= 51)
			skin = "level_4";
		else if(level >= 21)
			skin = "level_3";
		else if(level >= 6)
			skin = "level_2";
		this.animStorage.setSkin(skin);
    },
    
    performStorageUpgrade: function ()
    {
        if (this.effectStorage.isVisible ())
            return;
        
        this.effectStorage.setVisible (true);
        this.effectStorage.setOpacity (255);
        this.effectStorage.node.runAction(cc.sequence(
            cc.fadeOut(2),
            cc.callFunc(function() {this.effectStorage.setVisible (false);}.bind(this))
        ));
    },
	
	setDisableScrolling:function(disable)
	{
		this.disableScrolling = disable;
		if(disable)
			this.touchId = -1;
	},
	
	/*// jira#5887
	onTreasureTimerFinished:function()
	{
		var timeBar = this.treasureTimer.getChildByTag(UI_FILL_DATA_TAG);
		timeBar.setVisible(false);
	},
	
	refreshTreasureTimer:function()
	{
		var timeBar = this.treasureTimer.getChildByTag(UI_FILL_DATA_TAG);
		
		if(Game.isFriendGarden() || !this.animTreasure || !this.animTreasure.ready)
		{
			// n/a
			timeBar.setVisible(false);
			return;
		}
		
		var chests = _.sortBy(gv.chest.getChestAll(), item => g_GACHA_CHEST[item[CHEST_ID]].DISPLAY_ORDER);
		var freeChest = chests[0];
		var timeStart = freeChest[CHEST_TIME_START];
		var timeFinish = freeChest[CHEST_TIME_FINISH];
		if(timeFinish < Game.getGameTimeInSeconds())
		{
			// timer finished
			this.treasureTimer.timeBarFinished = true;
			timeBar.setVisible(false);
		}
		else
		{
			// timer is active
			this.treasureTimer.timeBarFinished = false;
			this.treasureTimer.timeBarStartTime = timeStart;
			this.treasureTimer.timeBarEndTime = timeFinish;
			timeBar.setLocalZOrder(9999);
			timeBar.setVisible(true);
			timeBar.setPosition(-10, -10);
			FWUI.update_timeBar(this.treasureTimer);
		}
	},
	// end: jira#5887*/
	
	// jira#5924
	radialProgressList: [],
	showRadialProgress:function(name, startTime, endTime)
	{
		cc.log("Background::showRadialProgress: name=" + name + " startTime=" + startTime + " endTime=" + endTime);
		if(startTime === false || endTime < Game.getGameTimeInSeconds())
		{
			// remove
			var item = FWUtils.removeArrayElementByKeyValue(this.radialProgressList, "name", name);
			if(item)
				item.radialProgress.removeFromParent();
		}
		else
		{
			var exist = false;
			for(var i=0; i<this.radialProgressList.length; i++)
			{
				if(this.radialProgressList[i].name === name)
				{
					// update
					this.radialProgressList[i].startTime = startTime;
					this.radialProgressList[i].endTime = endTime;
					exist = true;
					break;
				}
			}
			
			if(!exist)
			{
				// add
				var parent = null;
				if(name === "chest")
					parent = this.notifyChest;
				else if(name === "mine")
					parent = this.notifyMining;
				if(parent)
				{
					var item = {name:name, parent:parent, startTime:startTime, endTime:endTime};
					var radialProgress = new cc.ProgressTimer(new cc.Sprite("#hud/bubble_notify_chest.png"));
					radialProgress.setType(cc.ProgressTimer.TYPE_RADIAL);
					radialProgress.setLocalZOrder(100);
					radialProgress.setPosition(30, 42);
					radialProgress.setPercentage(0);
					radialProgress.setScale(-1, 1);
					parent.addChild(radialProgress);
					item.radialProgress = radialProgress;
					this.radialProgressList.push(item);
				}
			}
		}
	},
});

Background.data = Background.data || {
    shipReady: false,
    clownReady: false,

        pigBankReady: false

};