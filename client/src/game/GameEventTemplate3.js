const DRAG_TAG_HOOK = "hook";
const DRAG_TAG_HOOK_UI = "hook_ui";
const SHOP_SLOT_STATUS_NOTACTIVE = 0;
const SHOP_SLOT_STATUS_WAITING = 1;
const SHOP_SLOT_STATUS_COMPLETE = 2;
const SHOP_SLOT_STATUS_EMPTY = 3;

const TAB_SHOP_MAIN = 0;
const TAB_SHOP_EVENT = 1;
const TAB_SHOP_RANKING = 2;

const FISHING_TAB_GAME = 1;
const FISHING_TAB_SHOP = 2;
const FISHING_TAB_EVENT = 3;
const FISHING_TAB_RANKING = 4;

const ANIM_NPC_FISHING_IDLE = "idle";
const ANIM_NPC_FISHING_PULL = "pull";
const ANIM_NPC_FISHING_THROW = "throw";
const ANIM_NPC_UI_FISHING_BG = "animation_background";
const ANIM_NPC_UI_FISHING_WATER = "animation_water";
const SKIN_NPC_FISHING = {};
SKIN_NPC_FISHING.H1 = "moi_cau_3";
SKIN_NPC_FISHING.H2 = "moi_cau_2";
SKIN_NPC_FISHING.H3 = "moi_cau_1";

const TIME_SHOW_TUTO = 10;

const FISHING_HOOK_TUTO = "H1";
const FISH_MOVE_DISTANCE = 500;
//
//
const EVENT3_PROGRESS_HEIGHT_MAX = 303;
const EVENT3_PROGRESS_HEIGHT_MIN = 80;
//
const POINT_HOOK_FISHING = cc.p(420, 264);

var fishClass = cc.Node.extend({
    ctor: function (positionFish, index, randomIndex) {
        this._super();
        this.widget = FWPool.getNode(UI_EVENT3_FISH, true, true);
        this.addChild(this.widget);
        this.index = index;
        this.randomIndex = randomIndex;
        this.posCurrentFish = positionFish;
        this.random = Math.random();
        this.directionFish = this.random >= 0.5 ? 1 : -1;
        this.randomScale = (this.randomIndex % 2 + 9) * 0.04;
        this.iconFish = null;
    },

    onExit: function () {
        //this.removeFish();
        this.stopAllActions();
        this._super();
    },
    removeFish:function(){
        cc.log("fishClass",this.index);

        FWUI.unfillData(this.widget);
        FWPool.returnNode(this.widget);
        this.iconFish.uninit();
        this.iconFish = null;
    },
    endMove: function () {
        //cc.log("fishClass","endMove",this.index);
        this.posCurrentFish.x = this.x;
        this.random = Math.random();
        //this.directionFish  = this.random >= 0.5 ? 1: -1;

        if (this.posCurrentFish.x >= cc.winSize.width + 200) {
            this.posCurrentFish.x = cc.winSize.width + 200;

            this.directionFish = -1;
        }
        else if (this.posCurrentFish.x <= -200) {

            this.posCurrentFish.x = -200;

            this.directionFish = 1;
        }

        if (this.iconFish) this.iconFish.setScale(-1 * this.randomScale * this.directionFish, this.randomScale);

        this.runFishAction();
    },
    load: function (type) {
        //cc.log("load");

        var uiDefine = {
            //Image_1:{visible:true ,type:UITYPE_IMAGE,value:cc.formatStr("items/fish_0%d.png",(index%4 +1))},
        };

        var spine = "";
        switch (type) {
            case "F1":
            {
                spine = SPINE_FISHING_FISH_01;
                break;
            }
            case "F2":
            {
                spine = SPINE_FISHING_FISH_02;
                break;
            }
            case "F3":
            {
                spine = SPINE_FISHING_FISH_03;
                break;
            }
            case "F4":
            {
                spine = SPINE_FISHING_FISH_04;
                break;
            }
        }

        var panelBallon = FWUI.getChildByName(this.widget, "panelBallon");
        panelBallon.removeAllChildren();
        if (!this.iconFish || !this.iconFish.spine) {
            this.iconFish = new FWObject();
            this.iconFish.initWithSpine(spine);
            this.iconFish.setSkin("default");
            this.iconFish.setAnimation("swim", true);
            this.iconFish.setScale(-1 * this.randomScale * this.directionFish, this.randomScale);
            this.iconFish.setParent(panelBallon, 1);


            //this.iconFish = new FWObject();
            //this.iconFish.initWithSpine(GOBLINS);
            //this.iconFish.setSkin("goblingirl");
            //this.iconFish.setAnimation("walk", true);
            //this.iconFish.setScale(-0.5 * this.directionFish, 0.5);
            //this.iconFish.setParent(panelBallon, 1);
        }

        if (!this.iconFish.isVisible()) this.iconFish.setVisible(true);

        FWUI.fillData(this.widget, null, uiDefine);

        this.runFishAction();

    },
    runFishAction: function () {
        var randomIndex = this.random * 3;
        var time = randomIndex > 2 ? randomIndex : 2;
        var timeMove = time > 2 ? time * 2 : time * 4;
        timeMove -= this.index / 50;

        if(randomIndex< 0.75)
        {
            var isUp = 2*(this.index %2) -1;
            var controlPoint =[cc.p(this.posCurrentFish.x,this.posCurrentFish.y),
                cc.p(this.posCurrentFish.x + this.directionFish * FISH_MOVE_DISTANCE/2,this.posCurrentFish.y +isUp*100),
                cc.p(this.posCurrentFish.x + this.directionFish * FISH_MOVE_DISTANCE,this.posCurrentFish.y)];
            this.runAction(cc.sequence(cc.bezierTo(timeMove-0.5,controlPoint), cc.callFunc(function() {
                this.endMove();
            }.bind(this))));
        }
        else
        {
            this.runAction(cc.sequence(cc.moveTo(timeMove, cc.p(this.posCurrentFish.x + this.directionFish * FISH_MOVE_DISTANCE, this.posCurrentFish.y)), cc.callFunc(function() {
                this.endMove();
            }.bind(this))));
        }

    },
    resetFish: function (isRight) {
        this.stopAllActions();
        this.directionFish = isRight == 0 ? 1 : -1;
        this.random = Math.random();
        this.posCurrentFish.x = isRight == 0 ? -200 : (cc.winSize.width + 200);
        this.posCurrentFish.x += this.directionFish * this.random * 300;
        if (this.iconFish) this.iconFish.setScale(-1 * this.randomScale * this.directionFish, this.randomScale);
        this.runFishAction();
    },
    runOutRangeHook: function (pos, goRight) {
        var randomIndex = this.random * 3;
        var time = randomIndex > 2 ? randomIndex : 2;
        var timeMove = time > 2 ? time * 2 : time * 4;
        timeMove -= (this.index / 40 + 0.3);
        this.directionFish = -1;
        if (goRight) this.directionFish = 1;

        if (this.iconFish) this.iconFish.setScale(-1 * this.randomScale * this.directionFish, this.randomScale);
        this.posCurrentFish = pos;
        this.stopAllActions();
        this.runAction(cc.sequence(cc.moveTo(timeMove, cc.p(this.posCurrentFish.x + this.directionFish * (FISH_MOVE_DISTANCE - 100), this.posCurrentFish.y)).easing(cc.easeOut(3.0)), cc.callFunc(function() {
            this.endMove()
        }.bind(this))));
    },
    ravenousFishClass: function (time) {
        if (!this.iconFish) return;
        this.stopAllActions();
        this.posCurrentFish.x = this.x;

        var pos = cc.p(0,0);

        var arrMinusPos = [cc.p(-25,-35),cc.p(-30,-20),cc.p(-30,0),cc.p(-30,20),cc.p(-25,35),cc.p(25,20),cc.p(30,0),cc.p(30,-20)];

        var direct = this.calculationDirection();

        pos.x = POINT_HOOK_FISHING.x + arrMinusPos[direct].x;
        pos.y = POINT_HOOK_FISHING.y + arrMinusPos[direct].y;



        if (direct > 4) this.directionFish = -1;
        else this.directionFish = 1;
        if (this.iconFish)  this.iconFish.setScale(-1 * this.randomScale * this.directionFish, this.randomScale);

        this.runAction(cc.moveTo(time - 0.2, cc.p(pos.x, pos.y)));
    },
    calculationDirection:function() {
        var corner = Math.atan((this.posCurrentFish.y-POINT_HOOK_FISHING.y)/(this.posCurrentFish.x-POINT_HOOK_FISHING.x))/Math.PI *180;

        if(this.posCurrentFish.x<POINT_HOOK_FISHING.x)
        {
            corner+= 180;
        }

        var part = Math.floor(corner /45);
        var residual =  corner-part*45 ;

        var direction = 6 -part;
        if(residual>(45/2)) direction--;
        return direction%8;
    },
    endFishing:function(isDelete) {
        if (!this.iconFish) return;
        this.stopAllActions();
        if(isDelete)
        {
            cc.log("endFishing","Deleting",this.index);
            this.iconFish.setVisible(false);
        }
        else
        {
            this.endMove();
        }
    }
});

var FishMgr = cc.Class.extend({
    ctor: function (arrPositionFish, arrPositionFishIndex) {
        this.FISHS = {};
        this.arrPositionFish = arrPositionFish;
        this.arrPositionFishIndex = arrPositionFishIndex;
    },
    createFish: function (type, index) {
        var positionFish = this.arrPositionFish[this.arrPositionFishIndex[index]];
        var fish = new fishClass(positionFish, index, this.arrPositionFishIndex[index]);
        fish.load(type);
        if (!this.FISHS[type]) this.FISHS[type] = [];
        this.FISHS[type].push(fish);
        return fish;
    },
    removeAllFish: function () {
        for (var key in this.FISHS) {
            for (var i = 0; i < this.FISHS[key].length; i++) {
                cc.log("FishMgr","removeAllFish",key,i);
                this.FISHS[key][i].removeFish();
                delete this.FISHS[key][i];
            }
            this.FISHS[key] = [];
        }
    },
    //removeFish: function (idFish) {
    //    if (!this.FISHS[idFish]) return false;
    //    var fish = this.FISHS[idFish][0];
    //    this.FISHS[idFish].splice(0, 1);
    //    return fish;
    //},
    runOutRangeHook: function () {
        cc.log("runOutRangeHook");
        for (var key in this.FISHS) {
            for (var i = 0; i < this.FISHS[key].length; i++) {
                var fish = this.FISHS[key][i];
                var fishPos = fish.getPosition();
                if (this.checkPointInRectangle(fishPos)) {
                    var goRight = fishPos.x >= 630; // POINT DROP HOOK
                    fish.runOutRangeHook(fishPos, goRight);
                }
            }
        }
    },
    checkPointInRectangle: function (point) {
        var p1 = cc.p(850, 400); // point TOP_RIGHT
        var p3 = cc.p(450, 200); // point BOT_LEFT

        if (point.x > p1.x) return false;
        if (point.y > p1.y) return false;
        if (point.x < p3.x) return false;
        if (point.y < p3.y) return false;

        return true;

    },
    ravenousFish: function (idFish,time) {
        this.arrFishPos = [];
        for (var key in this.FISHS) {
            if (idFish == key) {
                var fish = this.getFishNearestPointById(idFish);
                if (!fish) return false;
                var itemFish = {};
                itemFish.fish = fish;
                itemFish.type = key;
                itemFish.distance = 0;
                this.arrFishPos.push(itemFish);
            }
            else {
                for (var i = 0; i < this.FISHS[key].length; i++) {
                    var fish = this.FISHS[key][i];
                    var fishPos = fish.getPosition();
                    var distance = (fishPos.x - POINT_HOOK_FISHING.x) * (fishPos.x - POINT_HOOK_FISHING.x) + (fishPos.y - POINT_HOOK_FISHING.y) * (fishPos.y - POINT_HOOK_FISHING.y);
                    var itemFish = {};
                    itemFish.fish = fish;
                    itemFish.type = key;
                    itemFish.distance = distance;
                    this.arrFishPos.push(itemFish);
                }
            }
        }
        if (this.arrFishPos.length >= 4) {
            this.arrFishPos.sort(function (a, b) {
                return a.distance - b.distance;
            });

            for (var i = 0; i < 4; i++) {
                this.arrFishPos[i].fish.ravenousFishClass(time);
            }
            return;
        }
        else {
            for (var i = 0; i < this.arrFishPos.length; i++) {
                this.arrFishPos[i].fish.ravenousFishClass(time);
            }
        }

    },
    getFishNearestPointById: function (idFish) {
        if (this.FISHS[idFish]) {
            var arrFishPos = [];
            for (var i = 0; i < this.FISHS[idFish].length; i++) {
                var fish = this.FISHS[idFish][i];
                var fishPos = fish.getPosition();
                var distance = (fishPos.x - POINT_HOOK_FISHING.x) * (fishPos.x - POINT_HOOK_FISHING.x) + (fishPos.y - POINT_HOOK_FISHING.y) * (fishPos.y - POINT_HOOK_FISHING.y);
                var itemFish = {};
                itemFish.fish = fish;
                itemFish.distance = distance;
                arrFishPos.push(itemFish);
            }
            arrFishPos.sort(function (a, b) {
                return a.distance - b.distance;
            });
            return arrFishPos[0].fish;
        }
        else {
            return null;
        }
    },
    endFishing:function(idFish){
        if(idFish !== "F1")
        {
            if (!this.FISHS[idFish]) return false;
        }
        cc.log("FishMgr","endFishing2",idFish,this.FISHS[idFish].length);
        if(this.arrFishPos)
        {
            var numFish = 0;
            for (var i = 0; i < this.arrFishPos.length; i++) {
                if(this.arrFishPos[i].type ==idFish && numFish ==0 && idFish !== "F1")
                {
                    cc.log("FishMgr","delete in arrFishPos");
                    this.arrFishPos[i].fish.endFishing(true);
                    this.arrFishPos.splice(i,1);
                    for(var fishI =0 ;fishI < this.FISHS[idFish].length;fishI++)
                    {
                        var fish = this.FISHS[idFish][fishI];
                        if(!fish.iconFish.isVisible()){
                            this.FISHS[idFish].splice(fishI, 1);
                            break;
                        }
                    }
                    cc.log("FishMgr","delete in arrFishPos 2",this.FISHS[idFish].length,this.arrFishPos.length);
                    //this.FISHS[idFish].splice(0, 1);
                    i-=1;
                    numFish++;
                }
                else
                {
                    this.arrFishPos[i].fish.endFishing(false);
                }
            }
        }
        else if (idFish !== "F1")
        {
            cc.log("FishMgr","delete");
            var fish = this.FISHS[idFish][0];
            this.FISHS[idFish].splice(0, 1);
            fish.endFishing(true);
            cc.log("FishMgr","delete2",this.FISHS[idFish].length);
        }
    },
});


var GameEventTemplate3 = {
    isRun: false,
    resetFish: false,
    inTutorial: false,
    canDropHook: true,
    hasRewards : false,
    init: function () {
        if (!this.arrHook) {
            this.arrHook = [];
            this.fishingItem = null;
            var dataHookFile = g_FISHING_ITEMS;

            for (var key in dataHookFile) {
                if (dataHookFile[key].TYPE == defineTypes.TYPE_HOOK) {
                    this.arrHook.push(dataHookFile[key]);
                }

                if (key == g_MISCINFO.FISHING_BAIT) {
                    this.fishingItem = dataHookFile[key];
                }
            }
        }

        if (!this.arrHook || this.arrHook.length <= 0) return;

        for (var i = 0; i < this.arrHook.length; i++) {
            this.arrHook[i].amount = gv.userStorages.getItemAmount(this.arrHook[i].ID);
        }

        if (gv.userData.game[GAME_FISHING]) {
            this.dataFishing = gv.userData.game[GAME_FISHING];
        }
        cc.log("FISHING INIT", JSON.stringify(gv.userData.game[GAME_FISHING]));


        this.arrFish = null;
        this.arrFish = this.dataFishing[FISHING_POND][FISHING_POND_FISH];


        var arrHook = this.dataFishing[FISHING_HOOK_PRODUCE_LIST_NAME];
        var arrRequire = this.dataFishing[FISHING_HOOK_PRODUCE_LIST_REQUIRE];

        this.getDataMaterialHook(arrHook, arrRequire);

        this.canUpdate = true;
        this.prevSlotMakedHook = -1;


        if (!this.arrPositionFish) this.arrPositionFish = this.getRandomArrPosition();
        if (!this.arrPositionFishIndex) this.arrPositionFishIndex = this.generateArrRandom0toN(99);
        //this.currentHook =  null;
        this.showUIShop = false;

        this.fishMgr = new FishMgr(this.arrPositionFish, this.arrPositionFishIndex);


        this.prevLevel = gv.userData.getLevel();


        this.dataReceiveRewards = [];


        for (var point in g_EVENT_03.E03_REWARDS) {
            this.dataReceiveRewards[point] = 0;
        }

        this.arrAllGift = {};
        for (var point in g_EVENT_03.E03_REWARDS) {
            for (var groupLevel in g_EVENT_03.E03_REWARDS[point]) {
                var reward = g_EVENT_03.E03_REWARDS[point][groupLevel];
                reward.groupLevel = groupLevel;
                reward.point = point;
                this.arrAllGift[reward.id] = reward;
            }
        }


        this.getdataReceiveRewards();


        if (!this.dataRewards) {
            this.dataRewards = this.getDataRewardsByGroupLevel();
        }
        this.canExit = true;
        this.canTutoDrop = false;
        this.clickFloat = false;
        this.timeTutoDropHook = TIME_SHOW_TUTO;
    },
    getdataReceiveRewards: function () {
        if (!this.dataReceiveRewards) return;

        var dataReceive = gv.userData.game[GAME_FESTIVAL][EVENT_03_RECEIVED_REWARDS];

        cc.log("GameTemplateEvent3", "getdataReceiveRewards", JSON.stringify(dataReceive));
        if (!dataReceive) return;

        for (var i = 0; i < dataReceive.length; i++) {
            var id = dataReceive[i];
            var point = this.arrAllGift[id].point;
            cc.log("sss", id, point);
            //this.dataReceiveRewards[point] += dataReceive[key][index];
            this.dataReceiveRewards[point]++;
        }
    },
    getDataRewardsByGroupLevel: function () {
        var dataEvent = g_EVENT_03.E03_REWARDS;
        var arrRewards = [];
        for (var group in dataEvent) {
            var infoReward = this.getRewardInfoByGroup(group);

            var data = {};
            data.rewardId = infoReward.id;
            data.groupLv = infoReward.groupLv;
            data.num = this.dataReceiveRewards[group];
            data.pointRequire = group;
            data.enoughRequire = data.pointRequire <= gv.userStorages.getItemAmount(g_EVENT_03.E03_POINT);
            data.anim = (data.enoughRequire && data.num <=0) ? "gift_box_random_active":"gift_box_random_default";
            data.dppointRequire =data.pointRequire / 100;
            //data.anim = "gift_box_random_active";
            var arrItem = [];
            for (var key in infoReward.items) {
                var item = {};
                item.itemId = infoReward.items[key].id;
                item.amount = infoReward.items[key].quantity;
                arrItem.push(item);
            }
            data.dataRewards = arrItem;
            arrRewards.push(data);
        }
        return arrRewards;
    },
    getRewardInfoByGroup: function (group) {
        var info = g_EVENT_03.E03_REWARDS[group];
        var level = gv.userData.getLevel();

        for (var key in info) {
            if (level <= key)
            {
                info[key].groupLv = key;
                return info[key]; // get info nearestReward levelUser
            }
        }
        return null;
    },
    getDataMaterialHook: function (arrHook, arrRequire) {
        this.dataMaterialHook = {};
        if (arrHook.length === arrRequire.length) {
            if (arrHook.length !== 0) {
                for (var i = 0; i < arrHook.length; i++) {
                    this.dataMaterialHook[arrHook[i]] = arrRequire[i];
                }
            }
        }
    },
    getRandomArrPosition: function () {
        var arrPos = [];

        var areaPosXRandom = 10;
        var areaPosYRandom = 10;
        var sizeScreen = cc.winSize;
        var height = 380;


        for (var j = 0; j < areaPosXRandom; j++) {
            var posX = this.getRandomInt(sizeScreen.width * (j / areaPosXRandom), sizeScreen.width * ((j + 1) / areaPosXRandom));
            for (var i = 0; i < areaPosYRandom; i++) {
                var posY = this.getRandomInt(height * (i / areaPosYRandom), height * ((i + 1) / areaPosYRandom));
                arrPos.push(cc.p(posX, posY));
            }
        }
        return arrPos;
    },
    generateArrRandom0toN: function (n) {
        var arr = [];
        for (var i = 0; i <= n; i++) {
            arr[i] = i;
        }
        arr = _.shuffle(arr);

        return arr;
    },
    fakeDataTutorial: function () {
        this.dataFishing = {
            "1": {}, "2": 0, "3": [], "4": [],
            "5": {"6": 1, "7": 1, "8": false, "9": 1576256400, "10": {"F2": 10, "F3": 5, "F4": 5}},
            "11": [{"12": 2, "13": "", "14": 0}, {"12": 2, "13": "", "14": 0}, {"12": 2, "13": "", "14": 0}, {
                "12": 1,
                "13": "",
                "14": 0
            }, {"12": 1, "13": "", "14": 0}, {"12": 1, "13": "", "14": 0}],
            "15": {"16": 1, "17": "", "18": "", "19": 0, "20": {}, "21": "BRONZE", "22": 43, "23": 70}
        }

    },

	resourcesLoaded:false,
    show: function () {
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			FWLoader.addSpriteFrames(EVENT_TEMPLATE3_DUMMY_PLIST);	
			
			var spineFiles = SPINE_UI_FISHING.split("|");
			var spineFiles2 = SPINE_FISHING_NPC_UI.split("|");
			cc.loader.load([EVENT_TEMPLATE3_DUMMY_PLIST,
							EVENT_TEMPLATE3_DUMMY_PLIST.replace(".plist", ".png"),
							UI_EVENT3,
                            GUILD2_DUMMY_PLIST,
                            GUILD2_DUMMY_PLIST.replace(".plist", ".png"),
							UI_EVENT3_ITEM,
							UI_EVENT3_ITEM_SHOP,
							UI_EVENT3_RESULT_FISHING,
							UI_EVENT3_ITEM_EVENT,
							UI_EVENT3_FISH,
                            UI_EVENT3_RANKING_ITEM,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png"), 
							spineFiles2[0],
							spineFiles2[1],
							spineFiles2[0].replace(".json", ".png")], 
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(EVENT_TEMPLATE3_DUMMY_PLIST);
                    cc.spriteFrameCache.addSpriteFrames(GUILD2_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}
		
        var widget = FWPool.getNode(UI_EVENT3, false);
        if (Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "fishing")) {
            this.fakeDataTutorial();
            this.inTutorial = true;
            //this.timeTutoDropHook = 999999999;
            //this.timeTutoClick = 999999999;
        }

        this.pondStatus = this.dataFishing[FISHING_POND][FISHING_POND_STATUS];
        this.minigameStatus = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_STATUS];
        var showInfoNotice = this.pondStatus === FISHING_POND_STATUS_ACTIVE;
        this.currentHook = null;
        if(!this.currentTab) this.currentTab = FISHING_TAB_GAME;


        this.currentShopTab = TAB_SHOP_MAIN;
        var uiDef ={
            backButton:{onTouchEnded:this.hide.bind(this)},
            infoButton: {onTouchEnded:this.showInfo.bind(this)},
            panelShop:{visible:false},//onTouchEnded: this.hidePanelShop.bind(this)},
            panelGame:{visible:true},
            panelNotification:{visible:!showInfoNotice},
            panelFish:{visible:showInfoNotice},
            panelDropFish: {dropTag: DRAG_TAG_HOOK_UI},
            bg_npc:{visible:false},
            titleFishingReset:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_FISHING_TITLE_RESET_1"),style:TEXT_STYLE_HINT_NOTE},
            titleFishingReset2:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_FISHING_TITLE_RESET_2"),style:TEXT_STYLE_HINT_NOTE},
            timerReset:{type:UITYPE_TIME_BAR, startTime:Game.getGameTimeInSeconds(), endTime:this.dataFishing[FISHING_POND][FISHING_POND_TIME_RESET], countdown:true,isVisibleTimeBarBar: false,onFinished: this.resetPond.bind(this)},
            contentNPC:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_FISHING_NPC_CONTENT_IDLE"),style:TEXT_STYLE_HINT_NOTE},
            eventTitle:{visible: true,type: UITYPE_TEXT, value:"" ,style:TEXT_STYLE_TITLE_1},
            tabGame:{onTouchEnded:function(){GameEventTemplate3.changeTab(FISHING_TAB_GAME)} },
            tabShop:{onTouchEnded:function(){GameEventTemplate3.changeTab(FISHING_TAB_SHOP)} },
            tabEvent:{onTouchEnded:function(){GameEventTemplate3.changeTab(FISHING_TAB_EVENT)} },
            tabRanking:{onTouchEnded:function(){GameEventTemplate3.changeTab(FISHING_TAB_RANKING)},visible:!(!GameEventTemplate3.getActiveEvent()) },
        };

        if (!this.imgPos) this.imgPos = FWUI.getChildByName(widget, "imgPos");
        if (!this.panelListHook) this.panelListHook = FWUI.getChildByName(widget, "panelListHook");
        if (!this.imgRangeFishing) this.imgRangeFishing = FWUI.getChildByName(widget, cc.sys.isNative ? "imgRangeFishing" : "imgRangeFishingWeb");
        if (!this.fishingProgressBar) this.fishingProgressBar = FWUI.getChildByName(widget, "fishingProgressBar");
        if (!this.panelShop) this.panelShop = FWUI.getChildByName(widget, "panelShop");
        if (!this.panelFish) this.panelFish = FWUI.getChildByName(widget, "panelFish");
        if (!this.panelNotification) this.panelNotification = FWUI.getChildByName(widget, "panelNotification");
        if (!this.bg_npc) this.bg_npc = FWUI.getChildByName(widget, "bg_npc");
        if (!this.contentNPC) this.contentNPC = FWUI.getChildByName(widget, "contentNPC");
        if (!this.eventNotifyUnActive) this.eventNotifyUnActive = FWUI.getChildByName(widget, "eventNotifyUnActive");
        if (!this.eventNotifyActive) this.eventNotifyActive = FWUI.getChildByName(widget, "eventNotifyActive");

        var panelBg = FWUI.getChildByName(widget, "panelBg");
        var panelNpc = FWUI.getChildByName(widget, "panelNpc");
        var panelWater = FWUI.getChildByName(widget, "panelWater");


        if (!this.panelBg || !this.panelBg.spine) {
            this.panelBg = new FWObject();
            this.panelBg.initWithSpine(SPINE_UI_FISHING);
            this.panelBg.setScale(0.7,1);
            this.panelBg.setAnimation(ANIM_NPC_UI_FISHING_BG, true);
            this.panelBg.setParent(panelBg);
        }
        if (!this.panelBgWater || !this.panelBgWater.spine) {
            this.panelBgWater = new FWObject();
            this.panelBgWater.initWithSpine(SPINE_UI_FISHING);
            this.panelBgWater.setScale(0.7,1);
            this.panelBgWater.setAnimation(ANIM_NPC_UI_FISHING_WATER, true);
            this.panelBgWater.setParent(panelWater);
        }
        if (!this.panelNpc || !this.panelNpc.spine) {
            this.panelNpc = new FWObject();
            this.panelNpc.initWithSpine(SPINE_FISHING_NPC_UI);
            this.panelNpc.setScale(0.102);
            this.panelNpc.setSkin(SKIN_NPC_FISHING.H1);
            this.panelNpc.setAnimation(ANIM_NPC_FISHING_IDLE, true);
            //this.panelBg.setPosition(panelBg.getContentSize().width/2,panelBg.getContentSize().height/2);
            this.panelNpc.setParent(panelNpc);
            //this.panelBg.setVisible(true);
        }

        if (FWUI.isWidgetShowing(widget))
            FWUI.fillData(widget, null, uiDef);
        else {
            FWUtils.showDarkBg(null, Z_UI_AIRSHIP - 1, "darkBgEvent3");
            //FWUtils.showDarkBg(this.panelShop, 0, "darkBgShopEvent3");

            FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
            widget.setLocalZOrder(Z_UI_AIRSHIP);
            AudioManager.effect(EFFECT_POPUP_SHOW);

            cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);

            if(!this.hideFunc)
                this.hideFunc = function() {this.hide()}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc);
        }


        var arrBtnTabName = ["tabGame","tabShop","tabEvent","tabRanking"];
        this.arrBtnTab = [];
        for(var i = 1; i <= arrBtnTabName.length;i++)
        {
            //cc.log("aaaaaaa",arrBtnTabName[i-1]);
            var btn = FWUI.getChildByName(widget,arrBtnTabName[i-1]);
            btn.tabIndex = i;
            this.arrBtnTab.push(btn);
        }

        this.fillDisplayTab(this.currentTab);



        //var to = cc.progressFromTo(2,0,100);

        if (!this.progressClock) {
            this.progressClock = new cc.ProgressTimer(new cc.Sprite("#event_template_3/hud_pos_clock_red.png"));
            this.progressClock.type = cc.ProgressTimer.TYPE_RADIAL;
            this.imgPos.addChild(this.progressClock, 999);
            this.progressClock.x = 28;
            this.progressClock.y = 29;
            this.progressClock.setScale(-1, 1);

            //widget.addChild(this.progressClock,999);
            //this.progressClock.x = 500;
            //this.progressClock.y = 400;
        }

        //this.progressClock.runAction(to.repeatForever());
        this.updateNoticeHasRewards();
        this.resetCountDown();
        this.showProcessBar();
        this.showListSentence();
        if (showInfoNotice) this.showListFish();

        if (this.minigameStatus === FISHING_MINIGAME_STATUS_FINISH) {
            this.canDropHook = false;
            this.showResultFishing();
        }
        else if (this.minigameStatus === FISHING_MINIGAME_STATUS_ACTIVE) {
            if (this.pondStatus === FISHING_POND_STATUS_INACTIVE) return;
            cc.log("onSelectHook Begin", this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_HOOK]);
            this.currentHook = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_HOOK];
            this.showProcessBar();
            this.canDropHook = false;
        }
        else if(this.minigameStatus === FISHING_MINIGAME_STATUS_INACTIVE){
            this.canTutoDrop = true;
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }

    },
    update: function (dt) {

        if (this.updateBarWeight) {  // show popup result fishing
            if (this.randomRange) {
                if (this.bgInfoWeight && this.weightProgress) {
                    if(this.randomRange>=9.8) this.randomRange = 9.8;
                    //weightProgress.setContentSize(cc.size(weightProgress.getContentSize().width,randomRange*32.9));
                    //bgInfoWeight.runAction(cc.moveTo(1,cc.p(bgInfoWeight.getPositionX(),randomRange*32.9)));
                    var pos = this.randomRange * 32.9 / 60;
                    this.bgInfoWeight.setPosition(cc.p(this.bgInfoWeight.getPositionX(), this.bgInfoWeight.getPositionY() + pos));
                    this.weightProgress.setContentSize(cc.size(this.weightProgress.getContentSize().width, this.weightProgress.getContentSize().height + pos));

                    if (this.weightProgress.getContentSize().height >= this.randomRange * 32.9) {
                        this.panelEffectLight.setVisible(true);
                        this.updateBarWeight = false;
                    }
                }
            }
        }

        if(!this.canDropHook)
        {
            if(this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_STATUS] === FISHING_MINIGAME_STATUS_INACTIVE && this.panelShop && !this.panelShop.isVisible())
            {
                if(this.timeTutoDropHook >0 && !this.inTutorial)
                {
                    this.canTutoDrop = true;
                }
            }
        }
        else
        {
            this.timeTutoDropHook -=dt;
            if (this.timeTutoDropHook <= 0) {
                //this.showResultFishing();
                this.canTutoDrop = false;
                this.showTutoDropHook();
                return;
            }
        }


        if (!this.currentHook) return;
        if (!this.canUpdate) return;


        this.timerCountDown -= dt;
        if (this.inTutorial && this.timerCountDown <= 2) {
            if (!Tutorial.isStepFinished(TUTO_STEP_56_FISHING_CLICK_1)) {
                Tutorial.onGameEvent(EVT_CLICK_BTN_FISHING);
                this.canUpdate = false;
                return;
            }
        }

        if(!this.clickFloat && this.timerCountDown <= this.appearTimeEvent/2 &&!this.inTutorial){
            this.showTutoClickFloat();
        }

        if (this.timerCountDown <= 0) {
            if (this.inTutorial) Tutorial.onGameEvent(EVT_CLICK_BTN_FISHING2);
            this.sendResultToServer();
            //this.showResultFishing();
            this.canUpdate = false;
            return;
        }
        if (this.progressClock) {
            var percent = Math.min(Math.max(100 * this.timerCountDown / this.appearTimeEvent, 0), 100);
            this.progressClock.setPercentage(percent);
        }


        var posY = this.imgPos.getPositionY();


        if (this.isRun) {
            posY += this.sliderSpeed * (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN) / 6000;
            if (posY > EVENT3_PROGRESS_HEIGHT_MAX) posY = EVENT3_PROGRESS_HEIGHT_MAX;
        }
        else {
            posY -= this.sliderSpeed * (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN) / 12000;
            if (posY < EVENT3_PROGRESS_HEIGHT_MIN) posY = EVENT3_PROGRESS_HEIGHT_MIN;
        }
        this.imgPos.setPosition(cc.p(this.imgPos.getPositionX(), posY));
    },
    hide: function () {
        this.hideTutoDropHook();
        if(!this.canExit) return;
        //if (this.panelShop) {
        //    if (this.panelShop.isVisible()) {
        //        this.hidePanelShop();
        //        return;
        //    }
        //}
        if (FWUI.isShowing(UI_EVENT3_RESULT_FISHING)) {
            this.hideResultFishing();
        }
        if (FWUI.isShowing(UI_EVENT3)) {
            this.fishMgr.removeAllFish();
            this.currentTab = null;
            FWUtils.hideDarkBg(null, "darkBgEvent3");
            FWUI.hide(UI_EVENT3, UIFX_POP);
            AudioManager.effect(EFFECT_POPUP_CLOSE);
            Game.gameScene.unregisterBackKey(this.hideFunc);
            cc.director.getScheduler().unscheduleUpdateForTarget(this);
        }
    },
	
    showInfo:function(sender) {
        this.hideTutoDropHook();
        gv.miniPopup.showLeaderInfoFishing();
    },
    resetPond:function(){
        // Server
        var pk = network.connector.client.getOutPacket(this.RequestFishingGet);
        cc.log("resetPond RequestFishingGet");
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    showProcessBar: function () {
        this.canUpdate = false;
        var hasHook = false;
        if (this.currentHook && this.dataFishing[FISHING_POND][FISHING_POND_STATUS] == FISHING_POND_STATUS_ACTIVE) hasHook = true;

        var rangeMin = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_BAR_MIN];
        var rangeMax = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_BAR_MAX];

        var posRatio = (rangeMax + rangeMin) / 2;
        var heightRatio = (rangeMax - rangeMin);


        var heightRange =(heightRatio / 100 ) * (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN);
        var posRange =(posRatio / 100) * (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN) + EVENT3_PROGRESS_HEIGHT_MIN;


        cc.log("posRange", posRange, "hasHook", hasHook);

        this.fillFishingProgressBar(hasHook, posRange, heightRange);

        if (this.panelNpc && this.panelNpc.spine) {
            if (this.panelNpc.getAnimation() !== ANIM_NPC_FISHING_THROW && hasHook) {
                this.panelNpc.setSkin(SKIN_NPC_FISHING[this.currentHook]);
                cc.log("showProcessBar", "set ANIM_NPC_FISHING_THROW");
                this.bg_npc.setVisible(false);
                this.panelNpc.setAnimation(ANIM_NPC_FISHING_THROW, false, function() {
                    this.canUpdate = true;
                    this.fillFishingProgressBar(hasHook, posRange, heightRange);
                    this.ravenousFish();
                    this.panelNpc.setAnimation(ANIM_NPC_FISHING_PULL, true);
                    this.clickFloat = false;
                }.bind(this));
                this.panelNpc.node.stopAllActions();
                this.panelNpc.node.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(function() {
                    this.fishMgr.runOutRangeHook();
                }.bind(this))))
            }
            else if (this.panelNpc.getAnimation() !== ANIM_NPC_FISHING_IDLE) {
                this.panelNpc.setAnimation(ANIM_NPC_FISHING_IDLE, true);
                this.fillFishingProgressBar(hasHook, posRange, heightRange);
            }
        }

    },
    showTutoDropHook:function(){

        cc.log("showTutoDropHook");
        if(this.panelShop.isVisible()) {
            cc.log("err Showing Shop");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_STATUS] === FISHING_MINIGAME_STATUS_FINISH){
            cc.log("err FISHING_MINIGAME_STATUS_FINISH");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(this.dataFishing[FISHING_POND][FISHING_POND_STATUS] === FISHING_POND_STATUS_INACTIVE){
            cc.log("err FISHING_POND_STATUS_INACTIVE");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(!this.canDropHook){
            cc.log("err can't drop hook");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(FWUI.isShowing(UI_IB_SHOP_MAIN)){
            cc.log("UI_IB_SHOP_MAIN showing");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(FWUI.isShowing(UI_FEATURE_PRESENT)){
            cc.log("UI_FEATURE_PRESENT showing");
            this.timeTutoDropHook = TIME_SHOW_TUTO;
        }
        else if(this.canDropHook)
        {
            var pos = cc.p(229,486);
            var focus = pos;
            focus.x2 = 500;
            focus.y2 = 300;
            Game.gameScene.showFocusPointer2("fishing", focus.x, focus.y, focus.x2, focus.y2);
            this.timeTutoDropHook = TIME_SHOW_TUTO;
            //this.canTutoDrop = true;
            this.bg_npc.setVisible(true);
            this.contentNPC.setString(FWLocalization.text("TXT_FISHING_NPC_CONTENT_IDLE"));
            return;
        }
        return;

        //Game.gameScene.showFocusPointer2("fishing", false);




    },
    showTutoClickFloat:function(){
        if(this.canUpdate && !this.clickFloat)
        {
            var pos = cc.p(887,72);
            var focus = pos;
            Game.gameScene.showFocusPointer("fishing", focus.x, focus.y);
            //this.canTutoDrop = true;
            this.bg_npc.setVisible(true);
            this.contentNPC.setString(FWLocalization.text("TXT_FISHING_NPC_CONTENT_PULL"));
            this.clickFloat = true;
            return;
        }
    },
    hideTutoDropHook:function(){
        cc.log("hideTutoDropHook");
        //this.resetCountDownTuto();
        this.timeTutoDropHook = TIME_SHOW_TUTO;
        Game.gameScene.showFocusPointer2("fishing", false);
        this.bg_npc.setVisible(false);
        this.canTutoDrop = false;
    },
    resetCountDownTuto:function(){
        this.timeTutoDropHook = TIME_SHOW_TUTO;
        this.canTutoDrop = true;
    },
    fillFishingProgressBar: function (hasHook, posRange, heightRange) {
        if (this.fishingProgressBar) {
            var gfxRange;
            if (hasHook) {
                gfxRange = g_FISHING_ITEMS[this.currentHook].COLOR_MINIGAME_BAR;
            }
            var uiDef ={
                btnFishingActive:{visible:hasHook&&this.canUpdate,onTouchBegan:function() {this.isRun= true ; this.clickFloat = true; this.hideTutoDropHook();}.bind(this), onTouchEnded:function() {this.isRun = false}.bind(this),forceTouchEnd: true},
                btnFishingUnActive:{visible:!hasHook||!this.canUpdate,enabled:false},
                imgPos:{visible:hasHook&&this.canUpdate},
                imgRangeFishing:{type:UITYPE_IMAGE, value:cc.formatStr("event_template_3/%s",gfxRange),visible:hasHook&&this.canUpdate&&cc.sys.isNative},
                imgRangeFishingWeb:{type:UITYPE_IMAGE, value:cc.formatStr("event_template_3/%s",gfxRange),visible:hasHook&&this.canUpdate&&!cc.sys.isNative, scale:cc.p(1, heightRange / 84)},
            };

            if (this.imgRangeFishing && hasHook) {
                this.imgRangeFishing.setPosition(this.imgRangeFishing.getPositionX(), posRange);
				if(cc.sys.isNative)
					this.imgRangeFishing.setContentSize(cc.size(this.imgRangeFishing.getContentSize().width, heightRange));
            }

            if (Tutorial.currentStep) {
                if (Tutorial.currentStep.id === TUTO_STEP_56_FISHING_INTRODUCE_3)
                    this.canUpdate = false;
            }
            FWUI.fillData(this.fishingProgressBar, null, uiDef);
        }
    },
    fillDataDropBoit: function () {
        if (this.panelNotification) this.panelNotification.setVisible(false);
        if (this.panelFish) this.panelFish.setVisible(true);
        this.pondStatus = this.dataFishing[FISHING_POND][FISHING_POND_STATUS];
        this.minigameStatus = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_STATUS];
        this.resetFish = true;
        this.showListFish();
    },
    ravenousFish: function () {
        cc.log("ravenousFish");
        if (!this.currentHook) return;

        var idFish = g_FISHING_ITEMS[this.currentHook].FISH;
        this.fishMgr.ravenousFish(idFish,this.appearTimeEvent);
    },
    showListSentence: function () {
        if (this.panelListHook) {
            if (!this.arrHook || this.arrHook.length <= 0) return;
            for (var i = 0; i < this.arrHook.length; i++) {
                this.arrHook[i].amount = gv.userStorages.getItemAmount(this.arrHook[i].ID);
                this.arrHook[i].amountDisplay = "x" + this.arrHook[i].amount;
            }

            this.fishingItem.amount = gv.userStorages.getItemAmount(this.fishingItem.ID);
            this.fishingItem.amountDisplay = "x" + this.fishingItem.amount;

            var arrItem = _.clone(this.arrHook);

            arrItem.push(this.fishingItem);

            if (this.inTutorial) {
                for (var i = 0; i < arrItem.length; i++) {
                    arrItem[i].amount = 0;
                    if (arrItem[i].ID === FISHING_HOOK_TUTO) {
                        if (!Tutorial.isStepFinished(TUTO_STEP_56_FISHING_SELECT_HOOK)) {
                            arrItem[i].amount = 1;
                            arrItem[i].amountDisplay = "x" + arrItem[i].amount;
                        }
                    }
                }

            }
            var tokenDef = {
                ////check:{visible:false},
                gfx: {type: UITYPE_ITEM, field: "ID"},
                buyButton: {visible: "data.amount <= 0", onTouchEnded: this.buySentence.bind(this)},
                stockAmount: {
                    type: UITYPE_TEXT,
                    field: "amountDisplay",
                    style: TEXT_STYLE_TEXT_NORMAL,
                    visible: "data.amount > 0"
                },
                item: {
                    dragTag: DRAG_TAG_HOOK_UI,
                    dropOnMove: false,
                    onDrop: this.onDropHook.bind(this),
                    onTouchBegan: this.onStartDroppingHookOnPond.bind(this),
                    onTouchEnded: this.onFinishedDroppingHookOnPond.bind(this),
                    dragCondition: "data.amount > 0",
                    forceTouchEnd: true
                }, // added forceTouchEnd to fix jira#5650
            };
            var uiDef = {
                itemListToken: {type: UITYPE_2D_LIST,items: arrItem,itemUI: UI_EVENT3_ITEM,itemDef: tokenDef,itemSize: cc.size(100, 110),itemBackground: "#event_template_3/hud_slot_items_fish.png"},
            };

            FWUI.fillData(this.panelListHook, arrItem, uiDef);
        }
    },
    onStartDroppingHookOnPond: function (sender) {
        if (!this.canDropHook) return;
        this.hideTutoDropHook();
        var data = sender.uiData;
        if (this.inTutorial) {
            if (Tutorial.currentStep) {
                if (Tutorial.currentStep.id == TUTO_STEP_56_FISHING_SELECT_HOOK) {
                    if (data.ID !== FISHING_HOOK_TUTO) return;
                }
            }
        }
        if (data.amount <= 0) {
            this.buySentence(sender);
            return;
        }
    },
    onFinishedDroppingHookOnPond: function (sender) {

    },
    onDropHook: function (draggedWidget, droppedWidget) {
        if (!this.canDropHook) {
            cc.log("canDropHook");
            return false;
        }

        if (!this.onSelectHook(draggedWidget)) return false;
        if (this.inTutorial) {
            cc.log("inTutorial", "Tutorial.onGameEvent(EVT_REFRESH_LISTHOOK)",this.currentHook);
            Tutorial.onGameEvent(EVT_REFRESH_LISTHOOK, this.currentHook);
            this.canUpdate = false;
            this.canDropHook = false;
            this.showProcessBar();
        }

        FWUI.hideDraggedWidget(FWUI.draggedWidget);
        cc.log("onDropHookOnSlot");
        this.showListSentence();

        return true;
    },
    showListFish: function () {
        if (this.panelFish) {
            //if(this.bg_npc && !this.bg_npc.isVisible()) this.bg_npc.setVisible(true);
            this.arrFish = this.dataFishing[FISHING_POND][FISHING_POND_FISH];
            if (this.arrFish.length <= 0) return;
            this.panelFish.removeAllChildren();
            this.fishMgr.removeAllFish();

            if (!this.arrFish["F1"]) this.arrFish["F1"] = g_MISCINFO.FISHING_NUM_FISH_F1;
            cc.log("showListFish", JSON.stringify(this.arrFish))
            var numFish = 0;
            for (var key in this.arrFish) {
                numFish += this.arrFish[key];
            }

            var arrIndexFish = [];
            for (var i = 0; i < numFish; i++) {
                arrIndexFish[i] = i;
            }
            arrIndexFish = _.shuffle(arrIndexFish);
            var indexFish = 0;
            for (var key in this.arrFish) {
                for (var i = 0; i < this.arrFish[key]; i++) {
                    var fish = this.fishMgr.createFish(key, arrIndexFish[indexFish]);
                    var pos = this.arrPositionFish[this.arrPositionFishIndex[arrIndexFish[indexFish]]];
                    if (this.resetFish) {
                        fish.resetFish(indexFish % 2 == 0);
                    }

                    fish.setPosition(pos);
                    this.panelFish.addChild(fish, arrIndexFish[indexFish]);
                    indexFish++;
                }
            }
            this.resetFish = false;
        }
    },
    sendResultToServer: function () {
        var pos = this.imgPos.getPositionY();
        cc.log("sendResultToServer", "Pos",pos, (pos - EVENT3_PROGRESS_HEIGHT_MIN) / (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN) * 100);
        var result = (pos - EVENT3_PROGRESS_HEIGHT_MIN) / (EVENT3_PROGRESS_HEIGHT_MAX - EVENT3_PROGRESS_HEIGHT_MIN) * 100;

        var rangeMin = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_BAR_MIN];
        var rangeMax = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_BAR_MAX];

        if(result > rangeMax){
            result = rangeMax +1;
        }
        else if (result < rangeMin){
            result = rangeMin -1;
        }
        else{
            if(result >= (rangeMax+rangeMin)/2){
                result = Math.floor(result);
            }
            else
            {
                result = Math.ceil(result);
            }
        }

        if (this.inTutorial) {
            this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_REWARD] = {
                GOLD: 1000,
                EXP: 1000,
                M12: 5,
                M13: 5,
                M0: 10
            };
            this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_FISH] = "F2";
            this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_WEIGHT] = 500;
            this.showResultFishing();
            return;
        }
        cc.log("sendResultToServer", rangeMin, rangeMax, result);
        // Server
        var pk = network.connector.client.getOutPacket(this.RequestFishingFish);
        cc.log("RequestFishingFish point", result);
        pk.pack(result);
        network.connector.client.sendPacket(pk);

    },
    showResultFishing: function () {
        this.hideTutoDropHook();
        var widget = FWPool.getNode(UI_EVENT3_RESULT_FISHING, false);
        var arrRewards = [];
        for (var key in this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_REWARD]) {
            if (key == g_EVENT_03.E03_POINT) continue;
            var item = {};
            item.itemId = key;
            item.amount = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_REWARD][key];
            item.amountDisplay = "x" + item.amount;
            arrRewards.push(item);
        }

        var idFish = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_FISH];

        var idType = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_TYPE];
        var gfxIcon = null;
        var arrType = g_FISHING.FISHING_MINIGAME_BAR;
        for (var i = 0; i < arrType.length; i++) {
            if (arrType[i].TYPE === idType) {
                gfxIcon = arrType[i].GFX;
            }
        }
        var iconPath = "event_template_3/%s.png";

        var itemDef =
        {
            gfx: {type: UITYPE_ITEM, field: "itemId"},
            amount: {type: UITYPE_TEXT, field: "amountDisplay", style: TEXT_STYLE_NUMBER, visible: true, useK: true},
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
        };

        var spine = "";
        switch (idFish) {
            case "F1":
            {
                spine = SPINE_FISHING_FISH_01;
                break;
            }
            case "F2":
            {
                spine = SPINE_FISHING_FISH_02;
                break;
            }
            case "F3":
            {
                spine = SPINE_FISHING_FISH_03;
                break;
            }
            case "F4":
            {
                spine = SPINE_FISHING_FISH_04;
                break;
            }
        }


        var dataNearestFishCanReceivedRewards = this.getDataNearestFishCanReceivedRewards(idFish);
        cc.log("dataNearestFishCanReceivedRewards",JSON.stringify(dataNearestFishCanReceivedRewards));

        var textTest = cc.formatStr(FWLocalization.text("TXT_FISHING_CAN_RECEIVE_POT"),dataNearestFishCanReceivedRewards.numFish, FWLocalization.text("TXT_FISH_"+dataNearestFishCanReceivedRewards.idFish));
        var hasShow = true;
        if(!dataNearestFishCanReceivedRewards.idFish) hasShow = false;
        var uiDefine = {
            iconItemWeight: {type: UITYPE_IMAGE, value: cc.formatStr(iconPath, gfxIcon), scale: 0.35},
            iconItemWeightMain: {type: UITYPE_IMAGE, value: cc.formatStr(iconPath, gfxIcon), scale: 0.8},
            info: {onTouchEnded: this.hideResultFishing.bind(this)},
            listItem: {type: UITYPE_2D_LIST, items: arrRewards, itemUI: UI_ITEM_NO_BG2, itemDef: itemDef, itemSize: cc.size(100, 80), itemsAlign: "center", singleLine: true},
            //imgFishInfo1: {visible: idFish == "F1"},
            //imgFishInfo2: {visible: idFish == "F2"},
            //imgFishInfo3: {visible: idFish == "F3"},
            //imgFishInfo4: {visible: idFish == "F4"},
            panelFishInfo:{type: UITYPE_SPINE, id: spine, anim: "swim", scale: 0.8},
            panelEffectLight: {type: UITYPE_SPINE, id: SPINE_EFFECT_POT_SLOT, anim: "effect_light_icon", scale: 0.8},
            title:{type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISH_"+idFish)},
            infoRewardFish:{type: UITYPE_TEXT, value:textTest,style:TEXT_STYLE_HINT_NOTE,visible:hasShow},
            lblWeight:{type: UITYPE_TEXT, value:"",style:TEXT_STYLE_TEXT_NORMAL_GREEN},
        };


        FWUI.unfillData(widget);
        FWUI.fillData(widget, null, uiDefine);

        if (!FWUI.isShowing(UI_EVENT3_RESULT_FISHING)) {

            FWUtils.showDarkBg(null, Z_UI_COMMON, "darkBgPopupResult");
            widget.setLocalZOrder(Z_UI_COMMON + 1);

            //FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);

            AudioManager.effect(EFFECT_POPUP_SHOW);

            if (!this.hideFunc2)
                this.hideFunc2 = function () {
                    this.hideResultFishing()
                }.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc2);
        }

        if (!this.bgInfoWeight) this.bgInfoWeight = FWUI.getChildByName(widget, "bgInfoWeight");
        if (!this.weightProgress) this.weightProgress = FWUI.getChildByName(widget, "weightProgress");
        if (!this.panelEffectLight) this.panelEffectLight = FWUI.getChildByName(widget, "panelEffectLight");

        this.bgInfoWeight.setPosition(cc.p(this.bgInfoWeight.getPositionX(), 0));
        this.weightProgress.setContentSize(cc.size(this.weightProgress.getContentSize().width, 0));
        this.panelEffectLight.setVisible(false);
        var lblWeight = FWUI.getChildByName(widget, "lblWeight");


        var weight = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_WEIGHT] / 10;
        cc.log("showResult", weight);
        weight = Math.round(weight);
        weight /=10;
        lblWeight.setString(weight);
        var height = 329;


        this.updateBarWeight = true;
        this.randomRange = weight;

        this.fishMgr.endFishing(idFish);
        //bgInfoWeight.setPosition(cc.p(bgInfoWeight.getPositionX(),randomRange*32.9));


    },
    hideResultFishing: function (sender) {
        var widget = FWPool.getNode(UI_EVENT3_RESULT_FISHING, false);

        if (!this.inTutorial) {
            

            // Server
            var pk = network.connector.client.getOutPacket(this.RequestFishingCollectFish);
            cc.log("RequestFishingCollectFish");
            pk.pack();
            network.connector.client.sendPacket(pk);

            var center = FWUI.getChildByName(widget, "center");
            var pos = FWUtils.getWorldPosition(center);
            //cc.log("hideResultFishing",JSON.stringify(sender));
            var dataReward = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_REWARD];
            var rewardItems = [];
            for (var key in dataReward) {
                if (key == g_EVENT_03.E03_POINT) continue;
                var item = {};
                item.itemId = key;
                item.amount = dataReward[key];
                rewardItems.push(item);
            }

            //var pos = cc.winSize;
            Game.addItems(rewardItems, pos, 0.3);
        }

        //FWUtils.showFlyingItemIcon(idHook,1, FWUtils.getWorldPosition(sender), Game.getFlyingDestinationForItem(idHook), 0.1, false);
        FWUtils.hideDarkBg(null, "darkBgPopupResult");
        FWUI.hideWidget(widget, UIFX_POP_SMOOTH);
        AudioManager.effect(EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc2);
        this.canUpdate = true;
        this.canDropHook = true;
        this.resetCountDown();
    },
    getDataNearestFishCanReceivedRewards:function(idFishIsFishing){
        if(this.dataFishing){
            var numFishDaily = this.dataFishing[FISHING_DAILY_FISH];

            var fishId = null;
            var numFish = 9999;
            for(var idFish in g_FISHING.FISHING_REWARD){
                var numFishing =  numFishDaily[idFish] || 0;
                if(idFishIsFishing == idFish) numFishing++;
                if(this.getMileStoneFishRewards(idFish,numFishing) < numFish){
                    numFish = this.getMileStoneFishRewards(idFish,numFishing);
                    fishId = idFish;
                }
            }
            return {idFish :fishId,numFish: numFish};
        }
    },
    getMileStoneFishRewards: function(idFish,numFish){
        var data = g_FISHING.FISHING_REWARD[idFish];
        for(var key in data)
        {
            if(numFish < key)
                return key - numFish;
        }
        return 9999999;
    },
    updateNoticeHasRewards:function(){
        //this.dataRewards = this.getDataRewardsByGroupLevel();
        //this.hasRewards = false;
        //for(var i=0;i<this.dataRewards.length;i++){
        //    if(this.dataRewards[i].enoughRequire && this.dataRewards[i].num <=0) {
        //        this.hasRewards = true;
        //        break;
        //    }
        //}
        //
        //if(this.hasRewards)
        //{
        //    if(this.eventNotifyActive) this.eventNotifyActive.setVisible(true);
        //    if(this.eventNotifyUnActive) this.eventNotifyUnActive.setVisible(true);
        //}
        //else
        //{
        //    if(this.eventNotifyActive) this.eventNotifyActive.setVisible(false);
        //    if(this.eventNotifyUnActive) this.eventNotifyUnActive.setVisible(false);
        //}
    },
    resetCountDown: function () {

        var idType = this.dataFishing[FISHING_MINIGAME][FISHING_MINIGAME_TYPE];
        this.appearTimeEvent = 0;
        this.sliderSpeed = 0;
        var arrType = g_FISHING.FISHING_MINIGAME_BAR;
        for (var i = 0; i < arrType.length; i++) {
            if (arrType[i].TYPE === idType) {
                this.appearTimeEvent = arrType[i].APPEAR_TIME;
                this.sliderSpeed = arrType[i].SLIDER_SPEED;
            }
        }

        this.timerCountDown = this.appearTimeEvent;
        //if(this.lblResult) this.lblResult.setVisible(false);


        this.imgPos.setPosition(cc.p(this.imgPos.getPositionX(), EVENT3_PROGRESS_HEIGHT_MIN));
        this.currentHook = null;
        this.showProcessBar();
        //if(this.progress) this.progress.setContentSize(this.progress.getContentSize().width, EVENT3_PROGRESS_HEIGHT_MIN);

    },
    getRandomInt: function (min, max) {
        var numMin = Math.ceil(min);
        var numMax = Math.floor(max);
        return Math.floor(Math.random() * (numMax - numMin + 1)) + numMin;
    },
    onSelectHook: function (sender) {

        var data = sender.uiData;
        if (data.TYPE === defineTypes.TYPE_HOOK) {
            if (this.dataFishing[FISHING_POND][FISHING_POND_STATUS] === FISHING_POND_STATUS_INACTIVE) {
                cc.log("onSelectHook", "Pond InActive", data.ID);
                FWUtils.showWarningText(FWLocalization.text("TXT_EVENT3_POND_INACTIVE"), FWUtils.getWorldPosition(sender));
                return false;
            }

            var idFish = data.FISH;
            //cc.log("ID FISH",idFish)

            if (!this.dataFishing[FISHING_POND][FISHING_POND_FISH][idFish]) {
                cc.log("onSelectHook", "Out Of Fish", data.ID, idFish);
                FWUtils.showWarningText(FWLocalization.text("TXT_EVENT3_OUT_OF_FISH"), FWUtils.getWorldPosition(sender));
                return false;
            }

            cc.log("onSelectHook", data.ID);
            this.currentHook = data.ID;


            if (this.inTutorial){
                this.canDropHook = false;
                return true;
            }
            // Server
            var pk = network.connector.client.getOutPacket(this.RequestFishingDropHook);
            cc.log("onSelectHook idHook", data.ID);
            pk.pack(data.ID);
            network.connector.client.sendPacket(pk);
            return true;
        }
        else if (data.TYPE === defineTypes.TYPE_FISHING_ITEM) {
            cc.log("onSelectItem", data.ID);
            if (this.dataFishing[FISHING_POND][FISHING_POND_STATUS] === FISHING_POND_STATUS_ACTIVE) {
                //if(this.dataFishing[FISHING_POND][FISHING_POND_IS_DROPED_HOOK] == false)
                //{
                //
                //}
                //else
                //{
                //    cc.log("onSelectHook", "Pond Active", data.ID);
                //    FWUtils.showWarningText(FWLocalization.text("TXT_EVENT3_POND_ACTIVE"), FWUtils.getWorldPosition(sender));
                //    return false;
                //}
                var displayInfo = {content:FWLocalization.text("TXT_FISHING_CONFIRMED_DROP_BAIT"), closeButton:true, okText:"TXT_OK", avatar:NPC_NO_NPC,title:"TXT_FISHING_DROP_BAIT"}; // feedback: remove title //var displayInfo = {title:"TXT_AS_CANCEL", content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO};
                Game.showPopup(displayInfo,function() { this.sendServerDropBoit(data.ID)}.bind(this));
            }
            else
            {
                this.sendServerDropBoit(data.ID);
            }
            return true;
        }

    },
    sendServerDropBoit: function (id) {
        // Server
        var pk = network.connector.client.getOutPacket(this.RequestFishingDropBait);
        cc.log("onSelectHook idBait", id);
        pk.pack(id);
        network.connector.client.sendPacket(pk);
    },
    buySentence: function (sender) {
        //cc.log("showUIShopMain",JSON.stringify(sender));
        if (!this.canDropHook) return;
        this.hideTutoDropHook();
        Game.openShop(sender.uiData.ID, function () {
            GameEventTemplate3.showListSentence()
        });
    },
    changeTab:function(tab){
        cc.log("gameEvent3","changeTab",tab);
        this.currentTab = tab;
        this.fillDisplayTab(tab);


        if(tab === FISHING_TAB_GAME) this.hidePanelShop();
        else if(tab === FISHING_TAB_SHOP ) this.showUIShopMain();
        else if(tab === FISHING_TAB_EVENT ) this.showUIShopEvent();
        else if(tab === FISHING_TAB_RANKING ) this.showUIShopRanking();
    },
    fillDisplayTab:function(tab) {
        cc.log("fillDisplayTab",tab);
        var normalScale = 0.65;
        var selectedScale = 0.75;
        var normalZoder = 100;
        var selectedZoder = 150;

        if(this.arrBtnTab && this.arrBtnTab.length>0)
        {
            for(var i =0;i< this.arrBtnTab.length;i++)
            {
                var btn = this.arrBtnTab[i];
                var icon =  FWUI.getChildByName(btn,"icon")
                if(btn.tabIndex === tab) {
                    icon.setScale(-1*selectedScale,selectedScale);
                    btn.setLocalZOrder(selectedZoder);
                    btn.setBright(false);
                    icon.setColor(cc.WHITE);
                }
                else
                {
                    btn.setBright(true);
                    icon.setScale(-1*normalScale,normalScale);
                    btn.setLocalZOrder(normalZoder);
                    icon.setColor(cc.color(185, 94, 7, 255));
                }
            }
        }


        var title = "";

        if(tab === FISHING_TAB_GAME){
            title = "TXT_FISHING_TITLE_GAME";
        }
        else if(tab === FISHING_TAB_SHOP){
            title = "TXT_FISHING_TITLE_SHOP_MAIN";
        }
        else if(tab === FISHING_TAB_EVENT){
            title = "TXT_FISHING_TITLE_SHOP_EVENT";
        }
        else if(tab === FISHING_TAB_RANKING){
            title = "TXT_FISHING_TITLE_RANKING";
        }

        var widget = FWPool.getNode(UI_EVENT3, false);
        var eventTitle = FWUtils.getChildByName(widget, "eventTitle");
        eventTitle.setString(FWLocalization.text(title));

        //eventTitle

    },

    showUIShopMain: function (sender) {
        if(this.inTutorial) return;
        this.showUIShop = true;
        this.currentShopTab = TAB_SHOP_MAIN;
        this.showUIPanelShop();
    },
    showUIShopEvent: function (sender) {
        if(this.inTutorial) return;
        this.showUIEvent = true;
        this.currentShopTab = TAB_SHOP_EVENT;
        this.showUIPanelShop();
    },
    showUIShopRanking: function (sender) {
        if(this.inTutorial) return;
        this.currentShopTab = TAB_SHOP_RANKING;
        this.showUIPanelShop();
    },
    fillDataShopMain: function () {
        if (this.showUIShop) {
            this.currentShopTab = TAB_SHOP_MAIN;
            this.showUIPanelShop();
        }
    },
    fillDataShopEvent: function () {
        if (this.showUIEvent) {
            this.currentShopTab = TAB_SHOP_EVENT;
            this.showUIPanelShop();
        }
    },
    showUIPanelShop: function () {
        if (this.panelShop) {
            this.hideTutoDropHook();
            //this.tabLureShopActive.setVisible(this.currentShopTab == TAB_SHOP_MAIN);
            //this.tabCollectionActive.setVisible(this.currentShopTab == TAB_SHOP_EVENT);
            //this.tabCollectionUnActive.setVisible(this.currentShopTab != TAB_SHOP_EVENT);
            this.panelShop.setVisible(true);
            if (this.currentShopTab == TAB_SHOP_MAIN) {
                FWUI.unfillData(this.panelShop);
                var arrSlotShop = [];
                var data = this.dataFishing[FISHING_SLOTS];
                var priceSlot = g_MISCINFO.FISHING_SLOTS_PRICE;
                var hasRentSLot = false;
                var numColum = 3;
                for (var i = 0; i < data.length; i++) {
                    var item = {};
                    var status = data[i][FISHING_SLOT_STATUS];
                    //if(data[i][FISHING_SLOT_STATUS] == )
                    item.checked = (data[i][FISHING_SLOT_HOOK]!="")  && (data[i][FISHING_SLOT_TIME_FINISH] < Game.getGameTimeInSeconds());
                    item.slotLock = status === FISHING_SLOT_STATUS_LOCK && data[i][FISHING_SLOT_HOOK]=="";
                    item.waiting = (data[i][FISHING_SLOT_HOOK]!="") && (data[i][FISHING_SLOT_TIME_FINISH] >= Game.getGameTimeInSeconds());
                    item.empty = status === FISHING_SLOT_STATUS_EMPTY;
                    item.index = i;
                    item.zOrder = 90 - i % numColum + Math.floor(i / numColum);
                    item.endTime = Game.getGameTimeInSeconds() + 10;
                    item.priceSlot = priceSlot[i];
                    if (data[i][FISHING_SLOT_HOOK]) item.idHook = data[i][FISHING_SLOT_HOOK];
                    if (data[i][FISHING_SLOT_TIME_FINISH] && item.waiting) {
                        item.endTime = data[i][FISHING_SLOT_TIME_FINISH];
                    }
                    arrSlotShop.push(item);
                    if(i>=3){
                        if(!item.slotLock) hasRentSLot = true;
                    }
                }

                var slotDef = {
                    slotNormal: {visible: "!data.slotLock", dropTag: DRAG_TAG_HOOK, onTouchEnded: this.showInfoSlot.bind(this)},
                    panelShowHook: {visible: false},
                    btnBuySlot: {visible: "data.slotLock ", onTouchEnded: this.buySlotMaking.bind(this)},
                    slotAdd: {visible: "data.slotLock", onTouchEnded: this.buySlotMaking.bind(this)},
                    checked: {visible: "data.checked"},
                    price: {type: UITYPE_TEXT, field: "priceSlot", style: TEXT_STYLE_TEXT_BUTTON},
                    gfx2: {type: UITYPE_ITEM, field: "idHook", visible: "data.idHook "},
                    timerSlot: {visible: "data.waiting", type: UITYPE_TIME_BAR, startTime: Game.getGameTimeInSeconds(), endTime: "data.endTime", countdown: true, isVisibleTimeBarBar: false, onFinished: this.endMakeHook.bind(this)},
                    arrowSlot: {visible: false},
                };

                var uiDef = {
                    panelShopMain:{visible: true},
                    panelRanking:{visible:false},
                    itemList: {visible: true, type: UITYPE_2D_LIST, items: arrSlotShop, itemUI: UI_EVENT3_ITEM_SHOP, itemDef: slotDef, itemSize: cc.size(240, 190)},
                    panelEvent: {visible: false},
                    panelEventUnActive: {visible: false},
                    lblInfoTabShopMain: {visible: true,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_SHOP_MAIN") ,style:TEXT_STYLE_TEXT_NORMAL},
                    lblTimerRent:{visible: true,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_SHOP_MAIN_TIMER") ,style:TEXT_STYLE_TEXT_NORMAL},
                    timerRentSlot:{visible: hasRentSLot, type: UITYPE_TIME_BAR, startTime: Game.getGameTimeInSeconds(), endTime: FWUtils.secondsAtEndOfDay(), countdown: true, isVisibleTimeBarBar: false,onFinished: this.checkEndRentSlot.bind(this)},
                    bg6: {visible: true},
                    bg7: {visible: true},
                    panelInfoRewards: {visible: false},
                    //titleShop:{visible: false,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_TITLE_SHOP_MAIN") ,style:TEXT_STYLE_TITLE_1},
                    titleShop:{visible: false},
                    panelTimerRentSlotHook:{visible:hasRentSLot},
                };

                //cc.log("fillDataPanelShop",JSON.stringify(arrSlotShop));
                FWUI.fillData(this.panelShop, null, uiDef);
            }
            else if (this.currentShopTab == TAB_SHOP_EVENT) {
                var activeEvent = false;

                var event = this.getActiveEvent();
                if (event) activeEvent = true;

                var itemEvent = g_EVENT_03.E03_POINT;
                var weight = Math.floor(gv.userStorages.getItemAmount(itemEvent) / 100);

                this.dataRewards = this.getDataRewardsByGroupLevel();
                if (gv.userData.getLevel() > this.prevLevel) {
                    this.prevLevel = gv.userData.getLevel();
                    this.fillDataShopEvent();
                }

                var limitMilestones = 2;

                var dataRewardShow =[];
                var lastFarRewardNotReceive =-1;
                var i;
                //var lastNearRewardNotReceive =-1;
                for(i=0;i<this.dataRewards.length&& limitMilestones >= 0;i++)
                {
                    var item = this.dataRewards[i];

                    if(item.num <= 0 && lastFarRewardNotReceive === -1)
                    {
                        //lastNearRewardNotReceive = i;
                        lastFarRewardNotReceive = i;
                    }
                    if(!item.enoughRequire) limitMilestones--;

                    if(limitMilestones<0) item.isLocked = true;
                    dataRewardShow.push(item);

                }
                cc.log("lastFarRewardNotReceive",lastFarRewardNotReceive,dataRewardShow.length,i);
                if(i < this.dataRewards.length && dataRewardShow.length >5)
                {

                    if(i - lastFarRewardNotReceive >=5)
                    {
                        dataRewardShow = dataRewardShow.slice(lastFarRewardNotReceive, i);
                    }
                    else
                    {
                        if(lastFarRewardNotReceive == -1)
                        {
                            dataRewardShow = dataRewardShow.slice(0, i);
                        }
                        else
                        {
                            dataRewardShow = dataRewardShow.slice(i-5 >0? i-5:0, i);
                        }

                    }

                }


                //var enoughReceive = data.pointRequire < gv.userStorages.getItemAmount(g_EVENT_03.E03_POINT);

                var slotDef = {
                    iconBucketFish: {onTouchEnded: this.changeRewardsEvent.bind(this),visible:"data.isLocked",scale:0.5},
                    lock:{visible:"data.isLocked"},
                    pointText:{type:UITYPE_TEXT, field:"dppointRequire", style:TEXT_STYLE_TEXT_NORMAL, visible:"data.pointRequire > 0"},

                    //iconBucketFish: {visible:false},
                    panelBucketFish:{onTouchEnded:this.changeRewardsEvent.bind(this), visible:"!data.isLocked", type:UITYPE_SPINE, id:SPINE_GIFT_BOX_EVENT_3,animField:"anim",
                        color:"data.num > 0 ? cc.color(128, 128, 128, 255) : cc.color(255, 255, 255, 255)"}
                };

                var uiDef = {
                    panelShopMain:{visible: false},
                    panelRanking:{visible:false},
                    panelEvent: {visible: activeEvent},
                    timerEvent: {visible: activeEvent, type: UITYPE_TIME_BAR, startTime: g_EVENT_03.E03_UNIX_START_TIME, endTime: g_EVENT_03.E03_UNIX_END_TIME, countdown: true, onFinished: this.checkEndEvent.bind(this)},
                    itemListRewardsChange: {type: UITYPE_2D_LIST, items: dataRewardShow, itemUI: UI_EVENT3_ITEM_EVENT, itemDef: slotDef, itemSize: cc.size(180, 200), singleLine: true},
                    tapToClose: {onTouchEnded: this.hidePanelInfoRewards.bind(this)},
                    bg6: {visible: activeEvent},
                    bg7: {visible: activeEvent},
                    lblInfoTabShop: {visible: activeEvent,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_SHOP_EVENT"),style:TEXT_STYLE_TEXT_NORMAL},
                    panelEventUnActive: {visible: !activeEvent},
                    lblTotalWeightFish: {type: UITYPE_TEXT, value: weight,style:TEXT_STYLE_TEXT_NORMAL_GREEN},
                    panelInfoRewards: {visible: false},
                    titleEventUnActive:{type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_EVENT_UNACTIVE"),style:TEXT_STYLE_TEXT_NORMAL},
                    lblTotalWeight:{type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_EVENT_TOTAL_WEIGHT"),style:TEXT_STYLE_TEXT_NORMAL},
                    //titleShop:{visible: false,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_TITLE_SHOP_EVENT") ,style:TEXT_STYLE_TITLE_1},
                    titleShop:{visible: false},
                };

                if (!this.panelInfoRewards) this.panelInfoRewards = FWUI.getChildByName(this.panelShop, "panelInfoRewards");
                FWUI.fillData(this.panelShop, null, uiDef);
            }
            else if (this.currentShopTab == TAB_SHOP_RANKING){
                var dataRanking = g_RANKING.TOP_EVENTS.TOP_EVENT_E3ID;
                var userLevel = gv.userData.getLevel();
                var ceilLevel = -1;
                for(var i =0 ; i < dataRanking.LEVELS.length;i++)
                {
                    if(userLevel <= dataRanking.LEVELS[i]) {
                        ceilLevel = dataRanking.LEVELS[i];
                        break;
                    }
                }
                var dataRewards = dataRanking.REWARDS[ceilLevel];
                var dataBonus = dataRanking.BONUS[ceilLevel];

                var arrSlotShop = [];
                for(var top in dataRewards)
                {
                    var item = {};
                    item.topNumber = top;
                    item.rewards = dataRewards[top];
                    if(dataBonus[top] && COUNTRY === COUNTRY_VIETNAM) item.bonus =dataBonus[top];

                    item.imgIcon = top >3 ? "hud/icon_top4_evt.png":"hud/icon_top"+top+"_evt.png";
                    arrSlotShop.push(item);
                }

                var slotDef = {
                    icon:{type:UITYPE_IMAGE, field:"imgIcon"},
                    rank:{type:UITYPE_TEXT, field:"topNumber", style:TEXT_STYLE_TEXT_NORMAL,visible:"data.topNumber >3"},
                };
                var uiDef = {
                    panelShopMain:{visible: false},
                    panelEvent: {visible: false},
                    panelEventUnActive: {visible: false},
                    bg6: {visible: false},
                    bg7: {visible: false},
                    panelRanking:{visible:true},
                    lblInfoRanking: {visible: true,type: UITYPE_TEXT, value:FWLocalization.text("TXT_FISHING_INFO_RANKING") ,style:TEXT_STYLE_TEXT_NORMAL},
                    itemListRanking: {visible: true, type: UITYPE_2D_LIST, items: arrSlotShop, itemUI: UI_EVENT3_RANKING_ITEM, itemDef: slotDef, itemSize: cc.size(720, 110)},
                };

                FWUI.fillData(this.panelShop, null, uiDef);

                var itemListRanking = FWUI.getChildByName(this.panelShop,"itemListRanking");
                var children =itemListRanking.getChildren();
                for (var i = 0, len = children.length; i < len; i++) {
                    var dataItem = children[i].uiBaseData;
                    var rewards = FWUtils.getItemsArray(dataItem.rewards);

                    if(dataItem.bonus)
                    {
                        var bonus = FWUtils.getItemsArray(dataItem.bonus);
                        for(var k =0;k<bonus.length;k++)
                        {
                            rewards.push(bonus[k]);
                        }
                    }
                    var itemDef =
                    {
                        gfx: {type: UITYPE_ITEM, field: "itemId", scale: 0.8},
                        amount: {type: UITYPE_TEXT, field: "displayAmount", style: TEXT_STYLE_NUMBER, visible: true, useK: true, scale: 0.7},
                        //item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
                    };

                    var uiDef = {
                        itemList: {type: UITYPE_2D_LIST, items: rewards, itemUI: UI_ITEM_NO_BG2, itemDef: itemDef, itemSize: cc.size(97, 95), itemsAlign: "center", singleLine: true},
                    };

                    FWUI.fillData(children[i],null,uiDef);
                }
            }
        }
    },
    checkEndRentSlot:function(){
        if(this.dataFishing[FISHING_SLOTS])
        {
            for(var i =3 ;i<this.dataFishing[FISHING_SLOTS].length;i++)
            {
                this.dataFishing[FISHING_SLOTS][i][FISHING_SLOT_STATUS] = FISHING_SLOT_STATUS_LOCK;
            }

            this.fillDataShopMain();
        }
    },
    changeRewardsEvent: function (sender) {
        if (!this.panelInfoRewards)
            return;

        var data = sender.uiData;

        var posCenter = FWUI.getChildByName(this.panelShop, "center").getPosition();
        var pos = FWUtils.getWorldPosition(sender);
        this.panelInfoRewards.setPosition(cc.p(pos.x - posCenter.x, pos.y - posCenter.y));
        this.panelInfoRewards.setVisible(true);
        this.fillDataRewardsChange(data);
        //cc.log("changeRewardsEvent", JSON.stringify(sender));
    },
    hidePanelInfoRewards: function (sender) {
        if (!this.panelInfoRewards)
            return;
        this.panelInfoRewards.setVisible(false);
    },
    fillDataRewardsChange: function (data) {
        if (!this.panelInfoRewards || !data)
            return;

        var enoughReceive = data.pointRequire <= gv.userStorages.getItemAmount(g_EVENT_03.E03_POINT);

        var itemDef =
        {
            gfx: {type: UITYPE_ITEM, field: "itemId", scale: 0.8},
            amount: {type: UITYPE_TEXT, field: "amount", style: TEXT_STYLE_NUMBER, visible: true, useK: true, scale: 0.8},
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
        };

        var uiDefine = {
            listItemRewardsChange: {type: UITYPE_2D_LIST, items: data.dataRewards, itemUI: UI_ITEM_NO_BG2, itemDef: itemDef, itemSize: cc.size(80, 75), itemsAlign: "center", singleLine: true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
            lblTextButton:{type:UITYPE_TEXT,value:FWLocalization.text("TXT_MAILBOX_RECEIVE_ALL"),style:TEXT_STYLE_TEXT_NORMAL},
            exchangeButton: {onTouchEnded: this.exchangeRewards.bind(this), enabled: data.num <= 0 && enoughReceive}
        };

        FWUI.fillData(this.panelInfoRewards, data, uiDefine);


    },
    exchangeRewards: function (sender) {
        cc.log("exchangeRewards", JSON.stringify(sender));
        var data = sender.uiData;

        this.dataReceiveRewards[data.pointRequire]++;
        this.dataRewards = this.getDataRewardsByGroupLevel();


        this.fillDataShopEvent();
        this.updateNoticeHasRewards();
        //var pos = FWUtils.getWorldPosition(sender);
        var spine = FWUtils.showSpine(SPINE_GIFT_BOX_EVENT_3, null, "gift_box_random_default", true, this.panelInfoRewards.getParent(), this.panelInfoRewards.getPosition(), this.panelInfoRewards.getLocalZOrder() + 1, false);
        spine.setScale(0.9);
        spine.runAction(cc.sequence(
            cc.callFunc(function() {GameEventTemplate3.setCanExit(false);}),
            cc.jumpTo(1, FWUtils.getWorldPosition(Game.gameScene.uiMainBtnMail), 200, 1.5).easing(cc.easeExponentialIn()),
            cc.removeSelf(),
            cc.callFunc(function() {GameEventTemplate3.setCanExit(true);})
        ));


        // Server
        var pk = network.connector.client.getOutPacket(this.RequestEvent03ReceiveRewards);
        cc.log("exchangeRewards pointRequire", data.pointRequire);
        pk.pack(data.pointRequire);
        network.connector.client.sendPacket(pk);
    },
    setCanExit:function(boolen) {
        this.canExit = boolen;
    },
    hidePanelShop: function (sender) {
        this.showUIShop = false;
        this.showUIEvent = false;
        if(!this.canExit) return;
        if (this.panelShop) this.panelShop.setVisible(false);
        //if (this.tabLureShopActive) this.tabLureShopActive.setVisible(false);
        //if (this.tabCollectionActive) this.tabCollectionActive.setVisible(false);
        //if (this.tabCollectionUnActive) this.tabCollectionUnActive.setVisible(true);
    },
    showInfoSlot: function (sender) {
        //cc.log("showInfoSlot", JSON.stringify(sender)); // cyclic object value

        if (sender.uiData.checked) {
            cc.log("showInfoSlot", "receiveHookMaked");
            this.receiveHookMaked(sender);
            return;
        }

        if (!sender.uiData.empty) {
            cc.log("showInfoSlot", "SlotMakeHook is Empty");
            return;
        }

        if (this.prevSlotMakedHook == -1) {
            this.prevSlotMakedHook = sender.uiData.index;
        }
        else {
            if (this.prevSlotMakedHook != sender.uiData.index) {
                this.prevSlotMakedHook = sender.uiData.index;
                if (this.panelShowHook && this.arrowSlot) {
                    this.panelShowHook.setVisible(false);
                    this.arrowSlot.setVisible(false);
                }
            }
        }


        this.panelShowHook = sender.getParent().getChildByName("panelShowHook");
        if (this.panelShowHook.isVisible()) this.panelShowHook.setVisible(false);
        else this.panelShowHook.setVisible(true);

        this.arrowSlot = sender.getParent().getChildByName("arrowSlot");
        if (this.arrowSlot.isVisible()) this.arrowSlot.setVisible(false);
        else this.arrowSlot.setVisible(true);


        //arrow.setVisible(true);

        if (!this.arrHook || this.arrHook.length <= 0) return;

        var arrHook = _.clone(this.arrHook);

        for (var i = 0; i < arrHook.length; i++) {
            arrHook[i].itemBox = sender.uiData.index;
        }
        //var itemsPos = [[0, 0], [1, 0], [1, 1]];

        var itemDef =
        {
            gfx: {type: UITYPE_ITEM, field: "ID"},
            amount: {visible: false},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, visible:"data.amount > 0"},
            lockedIcon: {visible: false},// xiao feedback lockedIcon:{visible:"data.isUnlocked === false"},
            lockedText: {visible: false},
            buyButton: {visible: false},
            //// new tutor
            ////UIItem:{dragTag:DRAG_TAG_POT, dropOnMove:true, onDrop:this.onDropPlantOnPot.bind(this), onTouchBegan:this.onStartDroppingPlantOnPot.bind(this), onTouchEnded:this.onFinishedDroppingPlantOnPot.bind(this), dragCondition:"data.isUnlocked && data.amount > 0 && (!Tutorial.currentStep || Tutorial.currentStep.id !== TUTO_STEP_33B_TOUCH_POT)", forceTouchEnd:true}, // added forceTouchEnd to fix jira#5650
            UIItem: {
                dragTag: DRAG_TAG_HOOK,
                dropOnMove: false,
                onDrop: this.onDropHookOnSlot.bind(this),
                onTouchBegan: this.onStartDroppingHookOnSlot.bind(this),
                onTouchEnded: this.onFinishedDroppingHookOnSlot.bind(this),
                dragCondition: true,
                forceTouchEnd: true
            }, // added forceTouchEnd to fix jira#5650
        };

        var uiDef =
        {
            items: {type: UITYPE_2D_LIST, items: arrHook, itemUI: UI_PLANT_ITEM, itemDef: itemDef, itemSize: cc.size(92, 90) ,itemBackgroundScale:0.9,itemBackground: "#hud/menu_list_slot.png",singleLine: true},
        }

        FWUI.fillData(this.panelShowHook, null, uiDef);
    },
    buySlotMaking: function (sender) {

        var displayInfo = {content:FWLocalization.text("TXT_FISHING_CONFIRMED_BUY_SLOT"), closeButton:true, okText:"TXT_OK", avatar:NPC_NO_NPC,title:"TXT_FISHING_BUY_SLOT"}; // feedback: remove title //var displayInfo = {title:"TXT_AS_CANCEL", content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO};
        Game.showPopup(displayInfo,function() { this.confirmBuySlot(sender)}.bind(this));
        //if()
    },
    confirmBuySlot:function(sender){
        //cc.log("buySlotMaking", JSON.stringify(sender)); // cyclic object value

        if (Game.consumeDiamond(sender.uiData.priceSlot, FWUtils.getWorldPosition(sender))) {
            var index = sender.uiData.index;


            // Server
            var pk = network.connector.client.getOutPacket(this.RequestFishingHireSlot);
            cc.log("RequestFishingHireSlot ", gv.userData.getCoin(), sender.uiData.priceSlot, index);
            pk.pack(gv.userData.getCoin() + sender.uiData.priceSlot, sender.uiData.priceSlot, index);
            network.connector.client.sendPacket(pk);


            //this.dataFishing[FISHING_SLOTS][index][FISHING_SLOT_HOOK] = "";
            //this.dataFishing[FISHING_SLOTS][index][FISHING_SLOT_STATUS] = FISHING_SLOT_STATUS_EMPTY;
            //this.showUIPanelShop();
        }
    },
    receiveHookMaked: function (sender) {

        var index = sender.uiData.index;
        var idHook = sender.uiData.idHook;

        var storage = gv.userStorages.getStorage(STORAGE_TYPE_ITEMS);
        if (storage)
        {
            var storageStatus = storage.getStorageStatus();
            if (storageStatus === STORAGE_STATUS_FULL)
            {
                Game.showUpgradeStock("hud/icon_tab_items.png", STORAGE_TYPE_ITEMS);
                return;
            }
        }

        // Server
        var pk = network.connector.client.getOutPacket(this.RequestFishingCollectHook);
        cc.log("RequestFishingCollectHook ", index);
        pk.pack(index);
        network.connector.client.sendPacket(pk);

        //this.dataFishing[FISHING_SLOTS][index][FISHING_SLOT_HOOK] = "";
        //this.dataFishing[FISHING_SLOTS][index][FISHING_SLOT_STATUS] = FISHING_SLOT_STATUS_EMPTY;

        FWUtils.showFlyingItemIcon(idHook, 1, FWUtils.getWorldPosition(sender), Game.getFlyingDestinationForItem(idHook), 0.1, false);

        //this.showUIPanelShop();
        //this.showListSentence();
    },
    endMakeHook: function (sender) {
        //var index = sender.uiData.index;
        //var idHook = sender.uiData.idHook;
        //this.dataFishing[FISHING_SLOTS][index][FISHING_SLOT_STATUS] = FISHING_SLOT_STATUS_PROCESS;
        this.fillDataShopMain();
    },
    onDropHookOnSlot: function (draggedWidget, droppedWidget) {

        //return false ... notDrop

        //return true .. Drop

        // example onDropDecor

        gv.hintManagerNew.hideHint(HINT_TYPE_HOOK);
        if (draggedWidget.uiBaseData.itemBox != droppedWidget.uiData.index) return false;

        var arrItems = [];
        for (var key in g_FISHING_ITEMS[draggedWidget.uiBaseData.ID].REQUIRE_DEFAULT) {
            var item = {};
            item.itemId = key;
            item.requireAmount = g_FISHING_ITEMS[draggedWidget.uiBaseData.ID].REQUIRE_DEFAULT[key];
            arrItems.push(item);
        }

        if (this.dataMaterialHook[draggedWidget.uiBaseData.ID]) {
            var arrItem = this.dataMaterialHook[draggedWidget.uiBaseData.ID];
            for (var key in arrItem) {
                var item = {};
                item.itemId = key;
                item.requireAmount = arrItem[key];
                arrItems.push(item);
            }

        }

        cc.log("onDropHookOnSlot require", JSON.stringify(arrItems));

        if (!Game.consumeItems(arrItems)) {
            Game.showQuickBuy(arrItems,function(){GameEventTemplate3.onDropHookOnSlot(draggedWidget,droppedWidget)});
            return false;
        }


        // Server
        var pk = network.connector.client.getOutPacket(this.RequestFishingProduceHook);
        cc.log("RequestFishingProduceHook ", draggedWidget.uiBaseData.itemBox, draggedWidget.uiBaseData.ID);
        pk.pack(draggedWidget.uiBaseData.itemBox, draggedWidget.uiBaseData.ID);
        network.connector.client.sendPacket(pk);


        /////// Fake client
        //this.dataFishing[FISHING_SLOTS][draggedWidget.uiBaseData.itemBox][FISHING_SLOT_HOOK] = draggedWidget.uiBaseData.ID;
        //this.dataFishing[FISHING_SLOTS][draggedWidget.uiBaseData.itemBox][FISHING_SLOT_STATUS] = FISHING_SLOT_STATUS_PROCESS;
        //this.dataFishing[FISHING_SLOTS][draggedWidget.uiBaseData.itemBox][FISHING_SLOT_TIME_FINISH] = Game.getGameTimeInSeconds() + g_FISHING_ITEMS[draggedWidget.uiBaseData.ID].PRODUCTION_TIME;
        //this.showUIPanelShop();


        FWUI.hideDraggedWidget(FWUI.draggedWidget);
        cc.log("onDropHookOnSlot");
        return true;

        //cc.log("onDropHookOnSlot","draggedWidget",JSON.stringify(draggedWidget));
        // Server

        // Reset UI

    },
    onStartDroppingHookOnSlot: function (sender) {
        //cc.log("onStartDroppingHookOnSlot",JSON.stringify(sender.uiData));
        this.dropHookId = sender.uiData["ID"];
        //this.dropPlantSlots = [];
        //isShowingWarningText = false;
        //
        //// jira#4828
        ////var posX = (this.getWorldPosition().x > cc.winSize.width / 2 ? 200 : cc.winSize.width - 100);
        ////gv.hint.show(FWUtils.getCurrentScene(), HINT_TYPE_PLANT, sender.uiData.itemId, {posX:posX, cover:false}, Z_FX);
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.showHookHint, 0, 0, 0, false);

    },
    onFinishedDroppingHookOnSlot: function (sender) {
        cc.log("onFinishedDroppingHookOnSlot");
        this.dropHookId = null;
        gv.hintManagerNew.hideHint(HINT_TYPE_HOOK);
    },
    showHookHint: function (dt) {
        if (this.dropHookId && FWUI.isShowing(UI_EVENT3)) {
            //var widget = FWPool.getNode(UI_DECOR_PUT, false);
            var position = null;
            if (FWUI.touchedWidget) {
                position = FWUI.touchedWidget.getTouchBeganPosition();
            }
            //this.currentAchievement = sender.uiData;
            gv.hintManagerNew.show(FWUtils.getCurrentScene(), HINT_TYPE_HOOK, this.dropHookId, position);

        }
    },
    getActiveEvent: function () {
        var time = Game.getGameTimeInSeconds();

        var event = g_EVENT_03;
        if (!event)
            return null;

        if (time >= event.E03_UNIX_START_TIME && time < event.E03_UNIX_END_TIME)
            return event;

        return null;
    },
    checkEndEvent: function () {
        FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_END_TITLE"), cc.p(600, 300), cc.WHITE);
        this.fillDataShopEvent();
    },
    endTutorial: function () {
        this.inTutorial = false;
        this.isRun = false;
        this.init();
        //this.showListSentence();
        this.show();
    },
    showItemHint:function(sender)
    {
        cc.log("showItemHint",JSON.stringify(sender));
        var position = null;
        position = FWUtils.getWorldPosition(sender);
        gv.hintManagerNew.show(null, null, sender.uiData.id, position);
    },
    hideItemHint:function(sender)
    {
        cc.log("hideItemHint",JSON.stringify(sender));
        gv.hintManagerNew.hideHint( null, sender.uiData.id);
    },
    /////// SERVER ///////////////
    RequestFishingGet: fr.OutPacket.extend
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_GET);
        },
        pack: function () {
            this.packHeader();
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingGet: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingGet");
            var object = PacketHelper.parseObject(this);

            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingGet: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingGet", JSON.stringify(object));
                GameEventTemplate3.dataFishing = object[KEY_FISHING];
                GameEventTemplate3.fillDataDropBoit();
            }
        }
    }),


    RequestFishingHireSlot: fr.OutPacket.extend /// thue slot
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_HIRE_SLOT);
        },
        pack: function (clientCoin, priceCoin, indexSlot) {
            this.packHeader();
            PacketHelper.putInt(this, KEY_CLIENT_COIN, clientCoin);
            PacketHelper.putInt(this, KEY_PRICE_COIN, priceCoin)
            PacketHelper.putInt(this, KEY_FISHING_SLOT_INDEX, indexSlot);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingHireSlot: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingHireSlot");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingHireSlot: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingHireSlot", JSON.stringify(object));
                gv.userData.setCoin(object[KEY_COIN]);
                GameEventTemplate3.dataFishing[FISHING_SLOTS] = object[KEY_FISHING_SLOTS];
                GameEventTemplate3.fillDataShopMain();
            }
        }
    }),

    RequestFishingProduceHook: fr.OutPacket.extend  /// che tao luoi cau
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_PRODUCE_HOOK);
        },
        pack: function (indexSlot, fishingHook) {
            this.packHeader();
            PacketHelper.putInt(this, KEY_FISHING_SLOT_INDEX, indexSlot);
            PacketHelper.putString(this, KEY_FISHING_HOOK, fishingHook);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingProduceHook: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingProduceHook");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingProduceHook: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingProduceHook", JSON.stringify(object));
                var updateItems = object[KEY_UPDATE_ITEMS];
                if (updateItems)
                    gv.userStorages.updateItems(updateItems);

                GameEventTemplate3.dataFishing[FISHING_SLOTS] = object[KEY_FISHING_SLOTS];
                GameEventTemplate3.fillDataShopMain();
                GameEventTemplate3.getDataMaterialHook(object[KEY_FISHING_HOOK_PRODUCE_LIST_NAME], object[KEY_FISHING_HOOK_PRODUCE_LIST_REQUIRE]);
            }

            //var data = object[KEY_FISHING];
            //

        }
    }),


    RequestFishingFish: fr.OutPacket.extend /// % position 1-100 % tha cau
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_FISH);
        },
        pack: function (point) {
            this.packHeader();
            PacketHelper.putInt(this, KEY_FISHING_POINT, point);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingFish: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingFish");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingFish: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingFish", JSON.stringify(object));
                GameEventTemplate3.dataFishing[FISHING_MINIGAME] = object[KEY_FISHING_MINIGAME];
                GameEventTemplate3.showResultFishing();
            }
        }
    }),


    RequestFishingDropHook: fr.OutPacket.extend  /// tha cau
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_DROP_HOOK);
        },
        pack: function (hook) {
            this.packHeader();
            PacketHelper.putString(this, KEY_FISHING_HOOK, hook);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingDropHook: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingDropHook");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingDropHook: error=" + this.getError());

            else {
                cc.log("GameEventTemplate3.ResponseFishingDropHook", JSON.stringify(object));
                var updateItems = object[KEY_UPDATE_ITEMS];
                if (updateItems)
                    gv.userStorages.updateItems(updateItems);
                GameEventTemplate3.showListSentence();
                GameEventTemplate3.canDropHook = false;
                GameEventTemplate3.showProcessBar();
                GameEventTemplate3.dataFishing[FISHING_POND] = object[KEY_FISHING_POND];
                GameEventTemplate3.dataFishing[FISHING_MINIGAME] = object[KEY_FISHING_MINIGAME];
            }
        }
    }),


    RequestFishingDropBait: fr.OutPacket.extend  /// tha moi
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_DROP_BAIT);
        },
        pack: function (itemId) {
            this.packHeader();
            PacketHelper.putString(this, KEY_ITEM_ID, itemId);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingDropBait: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingDropBait");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingDropBait: error=" + this.getError());

            else {
                cc.log("GameEventTemplate3.ResponseFishingDropBait", JSON.stringify(object));
                var updateItems = object[KEY_UPDATE_ITEMS];
                if (updateItems)
                    gv.userStorages.updateItems(updateItems);
                GameEventTemplate3.showListSentence();
                GameEventTemplate3.dataFishing[FISHING_POND] = object[KEY_FISHING_POND];
                GameEventTemplate3.dataFishing[FISHING_MINIGAME] = object[KEY_FISHING_MINIGAME];
                GameEventTemplate3.fillDataDropBoit();

            }

        }
    }),


    RequestFishingCollectHook: fr.OutPacket.extend  /// nhan luoi cau
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_COLLECT_HOOK);
        },
        pack: function (indexSlot) {
            this.packHeader();
            PacketHelper.putInt(this, KEY_FISHING_SLOT_INDEX, indexSlot);
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingCollectHook: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingCollectHook");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingCollectHook: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingCollectHook", JSON.stringify(object));
                var updateItems = object[KEY_UPDATE_ITEMS];
                if (updateItems)
                    gv.userStorages.updateItems(updateItems);
                GameEventTemplate3.dataFishing[FISHING_SLOTS] = object[KEY_FISHING_SLOTS];
                GameEventTemplate3.fillDataShopMain();
                GameEventTemplate3.showListSentence();
            }
        }
    }),


    RequestFishingCollectFish: fr.OutPacket.extend  /// nhan ca
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.FISHING_COLLECT_FISH);
        },
        pack: function () {
            this.packHeader();
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
    ResponseFishingCollectFish: fr.InPacket.extend
    ({
        ctor: function () {
            this._super();
        },
        readData: function () {
            cc.log("GameEventTemplate3.ResponseFishingCollectFish");
            var object = PacketHelper.parseObject(this);
            if (this.getError() !== 0)
                cc.log("GameEventTemplate3.ResponseFishingCollectFish: error=" + this.getError());
            else {
                cc.log("GameEventTemplate3.ResponseFishingCollectFish", JSON.stringify(object));
                var updateItems = object[KEY_UPDATE_ITEMS];
                if (updateItems)
                    gv.userStorages.updateItems(updateItems);
                Game.updateUserDataFromServer(object);
                GameEventTemplate3.dataFishing = object[KEY_FISHING];
                if (object[KEY_FISHING][FISHING_POND][FISHING_POND_STATUS] == FISHING_POND_STATUS_INACTIVE) {
                    GameEventTemplate3.show();
                }
                GameEventTemplate3.updateNoticeHasRewards();

            }

        }
    }),


    RequestEvent03ReceiveRewards: fr.OutPacket.extend
    ({
        ctor: function () {
            this._super();
            this.initData(100);
            this.setCmdId(gv.CMD.EVENT_03_RECEIVE_REWARDS);
        },
        pack: function (pointRequest) {
            this.packHeader();
            PacketHelper.putInt(this, KEY_EVENT_REWARD_ID, pointRequest)
            PacketHelper.markEndObject(this);
            this.updateSize();
        },
    }),
}

network.packetMap[gv.CMD.FISHING_GET] = GameEventTemplate3.ResponseFishingGet;
network.packetMap[gv.CMD.FISHING_PRODUCE_HOOK] = GameEventTemplate3.ResponseFishingProduceHook;
network.packetMap[gv.CMD.FISHING_HIRE_SLOT] = GameEventTemplate3.ResponseFishingHireSlot;
network.packetMap[gv.CMD.FISHING_FISH] = GameEventTemplate3.ResponseFishingFish;
network.packetMap[gv.CMD.FISHING_DROP_HOOK] = GameEventTemplate3.ResponseFishingDropHook;
network.packetMap[gv.CMD.FISHING_DROP_BAIT] = GameEventTemplate3.ResponseFishingDropBait;
network.packetMap[gv.CMD.FISHING_COLLECT_HOOK] = GameEventTemplate3.ResponseFishingCollectHook;
network.packetMap[gv.CMD.FISHING_COLLECT_FISH] = GameEventTemplate3.ResponseFishingCollectFish;
