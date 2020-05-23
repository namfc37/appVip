const CONSUME_TAB_GOLD = 0;
const CONSUME_TAB_REPULATION = 1;
const CONSUME_TAB_DIAMOND = 2;
const RANGE_RANDOM_POS_BALLOON = 40;

var countBalloon = 9;
var skinsArrow = ["arrow_yellow","arrow_red","arrow_pink"];
var statusBalloon = [{scale:1,zoder:4},{scale:0.8,zoder:3},{scale:0.6,zoder:2},{scale:0.5,zoder:1}];
var rangeFly = [50,1000];
//var posHitBallon = [cc.p(300,380),cc.p(420,430),cc.p(500,500),cc.p(555,450),cc.p(670,600),cc.p(730,465),cc.p(800,450),cc.p(880,350),cc.p(920,360)];
var indexRandom = 50;
var maxCurnerRotate = 40;
var numBalloonFly = 30;
var ComsumeEventScene= cc.Scene.extend
({
    tabComsume: null,
    arrPositionBalloon: null,
    arrBallon:null,
    data:null,
    numBalloonfly:0,
    canTouch:true,
    turnRight:true,
    canReceiveRewards:true,
    isShowRewards:false,
    onEnter:function() {
        this._super();

        cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);

        // ui
        if(!this.tabComsume) this.tabComsume = CONSUME_TAB_DIAMOND;


        this.init();
        this.getDataFromServer();

        //this.show();

        //back key
        var keyboardListener = cc.EventListener.create
        ({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode, event)
            {
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.escape)
                    this.handleBackKey();
                event.stopPropagation();
            }.bind(this)
        });
        cc.eventManager.addListener(keyboardListener, this);
    },
    onExit:function() {
        this._super();

        cc.director.getScheduler().unscheduleUpdateForTarget(this);

        FWObjectManager.cleanup();
        FWPool.returnNodes();
        FWUtils.onSceneExit();
    },
    handleBackKey:function() {
        if(FWUI.isShowing(UI_COMSUMEEVENT_INFO))
        {
            // do nothing
            this.hideInfo();
        }
        else{
            this.confirmQuit();
        }
        //else if(FWUI.isShowing(UI_MGM_HELP))
        //    this.hideHelp();
        //else
        //    this.showConfirmQuit();

    },
    init:function() {
        if(!this.arrPositionBalloon) this.arrPositionBalloon = this.getRandomArrPosition();
        if(!this.arrPositionHitBalloon) this.arrPositionHitBalloon= this.getRandomArrPositionHit()
    },

	resourcesLoaded: false,
    show:function() {
        if(!this.dataConsume) return;
		
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			var spineFiles = SPINE_CONSUME_EVENT.split("|");
			var spineFiles2 = SPINE_BALLOON.split("|");
			cc.loader.load([UI_COMSUMEEVENT,
							UI_COMSUMEEVENT_INFO,
							UI_BALLOON,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png"), 
							spineFiles2[0],
							spineFiles2[1],
							spineFiles2[0].replace(".json", ".png"),
							"common/images/hud_consume_event_bg.png",
							"common/images/hud_consume_event_bg_01.png"], 
				function()
				{
					this.resourcesLoaded = true;
					this.show();
				}.bind(this));				
			return;
		}

        var dataType = this.dataConsume[this.tabComsume];
        if( this.dataConsume.length == 0) {this.fakeData();}
        var uiDef = {

            closeButtonEvent:{onTouchEnded:this.confirmQuit.bind(this)},
            helpButton:{onTouchEnded:this.showInfoEvent.bind(this)},
            tabDiamondActive:{visible:this.tabComsume === CONSUME_TAB_DIAMOND},
            tabGoldActive:{visible:this.tabComsume === CONSUME_TAB_GOLD},
            tabReputationActive:{visible:this.tabComsume === CONSUME_TAB_REPULATION},
            tabDiamondUnActive:{visible:this.tabComsume !== CONSUME_TAB_DIAMOND,onTouchEnded:this.changeTab.bind(this)},
            tabGoldUnActive:{visible:this.tabComsume !== CONSUME_TAB_GOLD,onTouchEnded:this.changeTab.bind(this)},
            tabRepulationUnActive:{visible:this.tabComsume !== CONSUME_TAB_REPULATION,onTouchEnded:this.changeTab.bind(this)},
            timerConsume:{type:UITYPE_TIME_BAR, startTime:gv.consumEventMgr.getTimeEvent().start, endTime:gv.consumEventMgr.getTimeEvent().end, countdown:true,scaleTime : 1.2,onFinished: this.checkEndEventConsume.bind(this)},
            panelBtnShoot:{onTouchEnded:this.shootBalloon.bind(this)},
            lblPointDiamond:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_DIAMOND].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            lblPointGold:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_GOLD].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            lblPointReputation:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_REPULATION].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            lblCurrentPoint:{type:UITYPE_TEXT, value:this.dataConsume[this.tabComsume][CONSUME_TYPE_CONSUMED],style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblTotalDiamondUsed:{type:UITYPE_TEXT, value:this.dataConsume[this.tabComsume].desc,style:TEXT_STYLE_HINT_NOTE},
            imgDiamond:{type:UITYPE_IMAGE,value:this.dataConsume[this.tabComsume].spriteIcon,scale:0.45},
            iconType:{type:UITYPE_IMAGE, value:cc.formatStr("items/item_consume_event_0%d.png",this.tabComsume+1), scale: 0.3,visible:true},
            lblCount:{type:UITYPE_TEXT, value:g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT, style:TEXT_STYLE_NUMBER, color: cc.WHITE},
        };
        this.widget = FWPool.getNode(UI_COMSUMEEVENT, false);

        this.panelTabs = FWUtils.getChildByName(this.widget, "panelTabs");
        this.panelBalloon = FWUtils.getChildByName(this.widget, "panelBalloon");
        this.panelArrow = FWUtils.getChildByName(this.widget, "panelArrow");

        if (!this.animLongBow) {
            this.animLongBow = new FWObject();
        }
        this.animLongBow.initWithSpine(SPINE_CONSUME_EVENT);
        this.animLongBow.setSkin(skinsArrow[this.tabComsume]);
        this.animLongBow.setAnimation("anim_idle", true);
        var panelLongBow = FWUI.getChildByName(this.widget, "panelLongBow");
        this.animLongBow.setParent(panelLongBow, 1);

        if(!this.animArrow)
        {
            this.animArrow = new FWObject();
        }
        this.animArrow.initWithSpine(SPINE_CONSUME_EVENT);
        this.animArrow.setSkin(skinsArrow[this.tabComsume]);
        this.animArrow.setAnimation("anim_shoot_arrow", false);
        this.animArrow.setVisible(false);
        this.animArrow.setParent(this.panelArrow, 1);
        //this.animArrow.spine.setRotation(45);


        if (!this.animButtonShoot) {
            this.animButtonShoot = new FWObject();
        }
        this.animButtonShoot.initWithSpine(SPINE_CONSUME_EVENT);
        this.animButtonShoot.setSkin("default");
        this.animButtonShoot.setAnimation("button_unactive", true);
        var panelBtnShoot = FWUI.getChildByName(this.widget, "panelBtnShoot");
        this.animButtonShoot.setParent(this.widget, 7);
        //this.animButtonShoot.setPosition(panelBtnShoot.getContentSize().width / 2,0);
        this.animButtonShoot.setPosition(panelBtnShoot.getPositionX(),0);

        var backGround = new FWObject();
        backGround.initWithSprite("common/images/hud_consume_event_bg.png");//backGround.initWithSprite("#hud/hud_consume_event_bg.png");
        backGround.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2));
        backGround.setScale((cc.winSize.width/backGround.getBoundingBox().width),(cc.winSize.height/backGround.getBoundingBox().height));
        backGround.setParent(this.panelBalloon,0);


        var backGround2 = new FWObject();
        backGround2.initWithSprite("common/images/hud_consume_event_bg_01.png");//backGround2.initWithSprite("#hud/hud_consume_event_bg_01.png");
        backGround2.setPosition(cc.p(cc.winSize.width/2,(cc.winSize.height/backGround.getBoundingBox().height)*backGround2.getBoundingBox().height/2));
        //backGround.setAnchorPoint();
        backGround2.setScale((cc.winSize.width/backGround.getBoundingBox().width),(cc.winSize.height/backGround.getBoundingBox().height));
        backGround2.setParent(this.panelBalloon,10);

        if (!this.panelReward || !this.panelReward.spine) {

            this.panelReward = FWPool.getNode(UI_REWARD);
            this.panelReward.setVisible(false);
            this.panelReward.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
            this.widget.addChild(this.panelReward,99999);

            if (!this.particleReward) {
                this.particleReward = new cc.ParticleSystem("effects/particle_congrats.plist");
                this.particleReward.setDuration(-1);
                this.particleReward.setTotalParticles(15);
                this.particleReward.setPosVar(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.25));
                this.particleReward.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 1.25);
                this.panelReward.addChild(this.particleReward);
            }
        }

        //FWUI.showWidgetWithData(this.widget, null, uiDef, this, UIFX_POP);
        if(FWUI.isWidgetShowing(this.widget))
            FWUI.fillData(this.widget, null, uiDef);
        else
        {
            FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgConsume");
            FWUI.showWidgetWithData(this.widget, null, uiDef, this, UIFX_POP);
            this.widget.setLocalZOrder(Z_UI_COMMON);

            AudioManager.effect (EFFECT_POPUP_SHOW);

            //if(!this.hideFunc)
            //    this.hideFunc = function() {this.hide()}.bind(this);
            //Game.gameScene.registerBackKey(this.hideFunc);
        }


        for(var i=0;i<this.dataConsume.length;i++)
        {
            if(this.dataConsume[i][CONSUME_TYPE_STATUS] === CONSUME_TYPE_STATUS_OPEN)
            {
                var indexReward = this.dataConsume[i][CONSUME_TYPE_WINSLOT];
                var winSlot = this.dataConsume[i][CONSUME_TYPE_SLOTS][indexReward];
                for (var key in winSlot) {
                    cc.log("winSLot",key,winSlot[key]);
                    this.tabComsume = i;
                    this.isShowRewards = true;
                    this.showReward(key, winSlot[key]);
                    break;
                };
                break;
            }
        }

        this.animLongBow.node.runAction(cc.sequence(cc.rotateTo(2.5,60,60),cc.callFunc(function() {this.rotateLongBow();}.bind(this))));//web
        this.rotateLongBow();

    },
    update:function(dt) {
        if(!this.panelBalloon) return;
        if(!this.dataConsume) return;

        if(this.numBalloonfly <= numBalloonFly)
        {
            var posRandom = this.arrPositionBalloon[indexRandom];
            var status = this.getRandomInt(0,3);
            var delay = Math.random()*3;
            var color = this.getRandomInt(1,4);
            if(status>statusBalloon.length) status = statusBalloon.length;

            this.flyBalloon(posRandom,status,delay,color);
            this.numBalloonfly++;
            indexRandom ++;
            if(indexRandom > 250) indexRandom =0;
        }


    },
    flyBalloon:function(posX,status,delay,color,desPosY,detonating) {//web flyBalloon:function(posX,status,delay,color,desPosY = null,detonating = null) {
		
		if(desPosY === undefined)
			desPosY = null;
		if(detonating === undefined)
			detonating = null;
		
        //cc.log("ConsumeEvent","flyBalloon","color:",color,"status:",status,"delay:",delay);
        if(!this.arrBallon) this.arrBallon = [];
        var balloon = FWPool.getNode(UI_BALLOON);
        var panelBallon = FWUI.getChildByName(balloon, "panelBallon")

        panelBallon.removeAllChildren();

        var animBalloon =  new FWObject();
        animBalloon.initWithSpine(SPINE_CONSUME_EVENT);
        animBalloon.setSkin("default");
        animBalloon.setAnimation(cc.formatStr("bubble_%d",color),true);
        animBalloon.setScale(statusBalloon[status].scale,statusBalloon[status].scale);
        animBalloon.setParent(panelBallon,1);

        balloon.setPosition(posX,-250);
        balloon.setVisible(true);

        this.panelBalloon.addChild(balloon, statusBalloon[status].zoder, UI_FILL_DATA_TAG);
        var boomBalloon =  new FWObject();

        var endBoom = function() {//web
            cc.log("endBoom");
            boomBalloon.uninit();
            animBalloon.uninit();
            FWPool.returnNode(balloon);
        }.bind(this);
        var detonatingBallon = function() {//web

            cc.log("ConsumeEvent","detonatingBallon :",animBalloon.getPositionX(),animBalloon.getPositionY()+513*statusBalloon[status].scale/3);
            cc.log("ConsumeEvent","positionBallon :",balloon.getPositionX(),balloon.getPositionY());

            boomBalloon.initWithSpine(SPINE_BALLOON);
            boomBalloon.setPosition(animBalloon.getPositionX(),animBalloon.getPositionY());
            boomBalloon.setSkin("default");
            boomBalloon.setAnimation(cc.formatStr("effect_boom_bubble_%d",color),false,endBoom);
            boomBalloon.setParent(panelBallon,1);
            boomBalloon.setScale(statusBalloon[status].scale/3,statusBalloon[status].scale/3);
            animBalloon.setVisible(false);
            cc.log("detonatingBallon");
            //cc.callFunc(endBoom);
        }.bind(this);
        var endFly = function() {

            if(detonating)
            {
                cc.log("endFly-detonating");
                detonatingBallon();
            }
            else
            {
                FWPool.returnNode(balloon);
                animBalloon.uninit();
                this.numBalloonfly--;
            }
        }.bind(this);
        var desPosition = cc.p(posX,cc.winSize.height+250);

        if(desPosY) desPosition.y= desPosY;
        if(detonating)
        {
            balloon.runAction(cc.sequence(cc.delayTime(delay) ,cc.moveTo(2.0,desPosition),cc.callFunc(endFly)));
        }
        else
        {
            balloon.runAction(cc.sequence(cc.delayTime(delay) ,cc.moveTo(1.8 + status*1 + delay/4,desPosition),cc.callFunc(endFly)));
        }
        this.arrBallon.push(balloon);
    },
    rotateLongBow:function(){
        if(this.canTouch)
        {
            if(this.animLongBow && this.animLongBow.spine)
            {
                var curner = this.animLongBow.node.getRotation();
                var ratio = 1;
                cc.log("curner LongBow",curner,this.turnRight);
                if(curner >= maxCurnerRotate)
                {
                    this.turnRight = false;
                }
                else if(curner <= -maxCurnerRotate)
                {
                    this.turnRight = true;
                }

                if(this.turnRight)
                {
                    ratio = (maxCurnerRotate-curner) / (maxCurnerRotate*2);
                    this.animLongBow.node.runAction(cc.sequence(cc.rotateTo(5*ratio,maxCurnerRotate,maxCurnerRotate),cc.callFunc(function() {this.rotateLongBow();}.bind(this))));
                }
                else
                {
                    ratio = (-maxCurnerRotate-curner) / -(maxCurnerRotate*2);
                    this.animLongBow.node.runAction(cc.sequence(cc.rotateTo(5*ratio,-maxCurnerRotate,-maxCurnerRotate),cc.callFunc(function() {this.rotateLongBow();}.bind(this))));
                }

            }
        }
    },
    getRandomInt:function(min,max) {
        var numMin = Math.ceil(min);
        var numMax = Math.floor(max);
        return Math.floor(Math.random()*(numMax-numMin+1))+numMin;
    },
    getDataFromServer:function() {
        if(!this.dataConsume) {
            var pk = network.connector.client.getOutPacket(gv.consumEventMgr.RequestConsumeEventGet);
            pk.pack();
            network.connector.client.sendPacket(pk);
        }
        //this.convertData();
    },
    setDataFromServerBegin:function(data) {
        if(!data) return;
        this.dataConsume = data;
        this.convertData();
        this.show();
    },
    setData:function(data) {
        if(!gv.consumEventMgr.check()) return;
        if(!data) return;
        this.dataConsume = data;
        this.convertData();
        this.refreshUI();
    },
    refreshUI:function(){
        if(this.tabComsume == null) this.tabComsume = CONSUME_TAB_DIAMOND;
        this.showTab();
    },
    convertData:function() {
        var arrType = ['GOLD','REPU','COIN'];
        var arrSprite = [];
        for(var i=0 ;i <this.dataConsume.length;i++)
        {
            var item = this.dataConsume[i];
            item.type = arrType[i];
            item.numPoints = Math.floor((this.dataConsume[i][CONSUME_TYPE_CONSUMED]- item[CONSUME_TYPE_POINT_CONSUMED]) / g_CONSUME_EVENT.types[item.type].CONSUME_CONVERT);
            item.numShots = Math.floor(item.numPoints / g_CONSUME_EVENT.types[item.type].POINT_CONVERT);
            item.desc = "TXT_TITLE_TYPE_USED_" + item.type;
            item.spriteIcon =FWUtils.getPriceTypeIcon(g_COMMON_ITEM[item.type].ID);
        }
    },
    getRandomArrPosition:function() {
        var arrPos = [];

        var numPosRandom = 50;
        var areaPosRandom = 5;
        var sizeScreen = cc.winSize;
        for(var j=0;j<numPosRandom;j++)
        {
            for(var i = 0;i<areaPosRandom;i++)
            {
                var pos;
                if(sizeScreen.width*(i/areaPosRandom)==0)
                {
                    pos = this.getRandomInt(sizeScreen.width*(i/areaPosRandom)+100,sizeScreen.width*((i+1)/areaPosRandom));
                }
                else if(sizeScreen.width*((i+1)/areaPosRandom) == cc.winSize.width)
                {
                    pos = this.getRandomInt(sizeScreen.width*(i/areaPosRandom),sizeScreen.width*((i+1)/areaPosRandom)-100);
                }
                else
                {
                    pos = this.getRandomInt(sizeScreen.width*(i/areaPosRandom),sizeScreen.width*((i+1)/areaPosRandom));
                }
                arrPos.push(pos);
            }
        }

        return arrPos;
    },
    getRandomArrPositionHit:function() {
        var arrPos = [];
        var numPosHitRandom = 20;
        for(var j =0;j<numPosHitRandom;j++)
        {

            var index1 = this.getRandomInt(0,3);
            arrPos.push(index1);
            var index3=  this.getRandomInt(6,8);
            arrPos.push(index3);
            var index2= this.getRandomInt(4,5);
            arrPos.push(index2);
        }


        return arrPos;
    },
    getPosRandom :function(currentPoint,ratio) {
        var maxY = currentPoint.y + currentPoint.x * Math.abs(ratio);
        if(maxY>cc.winSize.height -150 ) maxY =  cc.winSize.height -150;
        var minY =  currentPoint.y + currentPoint.x * Math.abs(ratio)/2;
        if(Math.abs(ratio)>1) minY =  (cc.winSize.height - currentPoint.y)/1.5+ currentPoint.y;
        var randomY = this.getRandomInt(minY,maxY);

        var randomX = (randomY - currentPoint.y) / ratio + currentPoint.x;


        cc.log("RandomPos",randomX,randomY,minY,maxY);
        return cc.p(randomX,randomY);
        //var maxY = cc.winSize.height -70;
    },
    showBalloon:function() {

        this.panelBalloon.removeAllChildren();

        if(this.arrBallon)
        {
            if(this.arrBallon.length>0)
            {
                for(var i=0;i<this.arrBallon.length;i++)
                {
                    FWPool.returnNode(this.arrBallon[i]);
                }
            }
        }

        this.arrBallon = [];
        for(var i=0 ;i< this.arrPositionBalloon.length;i++)
        {
            //var layer = new cc.Layer();

            //var name = cc.formatStr("ballon_%d",i);
            var balloon = FWPool.getNode(UI_BALLOON);
            balloon.setPosition(this.arrPositionBalloon[i].x,this.arrPositionBalloon[i].y-cc.winSize.height);
            balloon.setVisible(true);
            this.panelBalloon.addChild(balloon,1, UI_FILL_DATA_TAG);

            balloon.runAction(cc.moveTo((2+i/10),this.arrPositionBalloon[i]));

            this.arrBallon.push(balloon);
        }

        this.arrPositionBalloon = this.getRandomArrPosition();

    },
    changeTab:function(sender) {
        if(!this.canTouch) return;
        var name = sender.getName();
        switch (name)
        {
            case "tabDiamondUnActive": this.tabComsume = CONSUME_TAB_DIAMOND;this.showTab(); break;
            case "tabGoldUnActive": this.tabComsume = CONSUME_TAB_GOLD;this.showTab(); break;
            case "tabRepulationUnActive": this.tabComsume = CONSUME_TAB_REPULATION;this.showTab(); break;
        }

        if(this.animLongBow && this.animLongBow.spine) {
            this.canTouch = false;
            this.animLongBow.setSkin(skinsArrow[this.tabComsume]);
            this.animLongBow.node.stopAllActions();
            this.animLongBow.setAnimation("anim_shoot_reset",false,function() {
                this.canTouch = true;
                this.animLongBow.setAnimation("anim_idle",true);
                this.rotateLongBow();
            }.bind(this));
        }
        if(this.animArrow) {
            this.animArrow.setSkin(skinsArrow[this.tabComsume]);
        }
    },
    showTab:function() {
        var uiDef = {
            tabDiamondActive:{visible:this.tabComsume === CONSUME_TAB_DIAMOND},
            tabGoldActive:{visible:this.tabComsume === CONSUME_TAB_GOLD},
            tabReputationActive:{visible:this.tabComsume === CONSUME_TAB_REPULATION},
            tabDiamondUnActive:{visible:this.tabComsume !== CONSUME_TAB_DIAMOND,onTouchEnded:this.changeTab.bind(this)},
            tabGoldUnActive:{visible:this.tabComsume !== CONSUME_TAB_GOLD,onTouchEnded:this.changeTab.bind(this)},
            tabRepulationUnActive:{visible:this.tabComsume !== CONSUME_TAB_REPULATION,onTouchEnded:this.changeTab.bind(this)},
            lblCurrentPoint:{type:UITYPE_TEXT, value:this.dataConsume[this.tabComsume][CONSUME_TYPE_CONSUMED],style:TEXT_STYLE_TEXT_NORMAL_GREEN},
            lblTotalDiamondUsed:{type:UITYPE_TEXT, value:this.dataConsume[this.tabComsume].desc},
            imgDiamond:{type:UITYPE_IMAGE,value:this.dataConsume[this.tabComsume].spriteIcon,scale:0.45},
            lblPointGold:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_GOLD].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            lblPointReputation:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_REPULATION].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            lblPointDiamond:{type:UITYPE_TEXT, value:this.dataConsume[CONSUME_TAB_DIAMOND].numPoints,style:TEXT_STYLE_TEXT_NORMAL},
            iconType:{type:UITYPE_IMAGE, value:cc.formatStr("items/item_consume_event_0%d.png",this.tabComsume+1), scale: 0.3,visible:true},
            lblCount:{type:UITYPE_TEXT, value:g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT, style:TEXT_STYLE_NUMBER, color: cc.WHITE},
        };

        FWUI.fillData(this.panelTabs, null, uiDef);

    },
    confirmQuit:function(sender) {
        if(!this.canTouch) return;
        GardenManager.changeGarden(gv.mainUserData.mainUserId);

    },
    shootBalloon:function(sender) {
        if(!this.canTouch) return;
        cc.log("ShootBalloon");
        if(this.arrBallon)
        {
            if(this.dataConsume[this.tabComsume].numPoints < g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT)
            {
                FWUtils.showWarningText(FWLocalization.text("TXT_CONSUME_NOT_ENOUGH_BULLET"), FWUtils.getWorldPosition(sender));
                return;
            }
            var indexBalloon = this.dataConsume[this.tabComsume][CONSUME_TYPE_WINSLOT];

            //var numPosHit = this.getRandomInt(0,59);
            var status = this.getRandomInt(0,3);
            //var posHit = posHitBallon[this.arrPositionHitBalloon[numPosHit]];
            //var posHit = this.arrPositionHitBalloon[numPosHit];
            var currentPoint = cc.p(613,202);

            var curnerLongBow = this.animLongBow.node.getRotation();
            if(curnerLongBow >0) curnerLongBow = 90 -curnerLongBow;
            else curnerLongBow = -curnerLongBow - 90;

            var ratioBalloon = Math.tan(curnerLongBow/180 * Math.PI);


            var posHit=  this.getPosRandom(currentPoint,ratioBalloon);

            this.posHit = posHit;

            var curner = Math.atan((posHit.y+513*statusBalloon[status].scale/3 -currentPoint.y)/(posHit.x-currentPoint.x))/Math.PI *180;

            if(curner>0) curner= 90-curner;
            else curner= -curner - 90;
            //if(this.arrBallon[indexBalloon]) this.arrBallon[indexBalloon].setVisible(false);
            cc.log("curner",curner);
            cc.log("curnerLongBow",curnerLongBow);
            cc.log("position",JSON.stringify(posHit));
            cc.log("ratioBalloon",ratioBalloon);
            var showReward = function()
            {
                // showReward
                var winSlot = this.dataConsume[this.tabComsume][CONSUME_TYPE_SLOTS][indexBalloon];
                for (var key in winSlot) {
                    cc.log("winSLot",key,winSlot[key]);
                    this.showReward(key, winSlot[key]);
                }
            }.bind(this);

            numBalloonFly += 5;
            var rotateLongBow = function() {


            };
            var animShot = function() {
                this.canTouch = false;
                this.animLongBow.node.stopAllActions();
                this.animLongBow.node.runAction(cc.rotateTo(1,curner,curner));
                //this.animLongBow.spine.setRotation(curner);

                this.animLongBow.setAnimation("anim_shoot",false);
                this.animButtonShoot.setAnimation("button_active",false);

                var pos = cc.p(1008, 245);
                var flyIcon = this.getFlyIcon(pos);
                this.widget.addChild(flyIcon,999999);
                FWUI.setWidgetCascadeOpacityEnabled(flyIcon, true);
                FWUtils.flyNode(flyIcon, pos, cc.p(pos.x, pos.y - 100),  1, true, null, true, 0);

                cc.log ("ConsumeEvent :","RequestShootBalloon ", this.dataConsume[this.tabComsume].type);
                var pk = network.connector.client.getOutPacket(gv.consumEventMgr.RequestShootBalloon);
                pk.pack(this.dataConsume[this.tabComsume].type);
                network.connector.client.sendPacket(pk);

                this.dataConsume[this.tabComsume].numPoints -= g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT;
                this.showTab();

                cc.log("flyBallon",posHit.x,posHit.y);
                this.flyBalloon(posHit.x,status,0,this.dataConsume[this.tabComsume][CONSUME_TYPE_WINSLOT_TYPE],posHit.y,true);
            }.bind(this);
            var arrowFly = function() {
                this.animArrow.setVisible(true);
                this.animArrow.setPosition(cc.p(0,0));
                this.animArrow.setScale(1);
                this.animArrow.spine.setRotation(curner);
                var posTmp = cc.p(613,16);

                cc.log("rotation",this.animLongBow.node.getRotation());

                var posArrowHit = cc.p(posHit.x- posTmp.x,posHit.y-posTmp.y);
                this.animArrow.setAnimation("anim_shoot_arrow",false);
                //this.animArrow.node.runAction(cc.sequence( cc.spawn(cc.moveTo(1,posArrowHit).easing(cc.easeSineOut()),cc.scaleTo(1,0.1)),cc.callFunc(()=>{this.animArrow.setVisible(false);})));
                this.animArrow.node.runAction(cc.sequence( cc.spawn(cc.moveTo(0.5,posArrowHit),cc.scaleTo(0.5,0.05*statusBalloon[status].zoder)),cc.callFunc(function() {this.animArrow.setVisible(false);}.bind(this))));
                //this.animArrow.setScale((posHit.x-currentPoint.x)/(this.animArrow.spine.getContentSize().width*this.animArrow.getScaleX()),(posHit.y-currentPoint.y)/(this.animArrow.spine.getContentSize().height*this.animArrow.getScaleY()))
            }.bind(this);
            this.animButtonShoot.node.runAction(
                cc.sequence(
                    cc.callFunc(animShot),
                    cc.delayTime(1.6),
                    cc.callFunc(arrowFly),
                    cc.delayTime(1.5),
                    cc.callFunc(showReward)
                )
            );


            // call server
        }
    },
    showReward: function (itemId, itemAmount, itemClaimed){
        cc.log("ConsumeEvent", "showReward:", "itemId:", itemId, "itemAmount:", itemAmount);

        this.idReward = itemId;
        this.amountReward = itemAmount;


        if(this.isShowRewards)
        {
            var uiDefine = {
                textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_REWARD_TITLE"), style: TEXT_STYLE_TEXT_NORMAL },
                textTitleDetail: {
                    type: UITYPE_TEXT,
                    id: Game.getItemName(itemId),
                    style: TEXT_STYLE_TEXT_NORMAL,//style: TEXT_STYLE_TEXT_NORMAL_GREEN,
                    visible: itemId != ID_X2
                },
                textMessage: {
                    type: UITYPE_TEXT,
                    id: FWLocalization.text("TXT_WHEEL_REWARD_STORAGE_FULL").toUpperCase(),
                    style: TEXT_STYLE_TEXT_NORMAL,
                    visible: false //gv.wheel.getWaitSlot() !== null && !canAddItem
                },
                textDesc: {
                    type: UITYPE_TEXT,
                    id: FWLocalization.text("TXT_WHEEL_REWARD_HINT"),
                    style: TEXT_STYLE_TEXT_NORMAL
                },
                textAmount: {
                    type: UITYPE_TEXT,
                    id: cc.formatStr("x%d", itemAmount),
                    style: TEXT_STYLE_TEXT_BIG,//style: TEXT_STYLE_TEXT_BIG_GREEN,
                    visible: itemId != ID_X2
                },
                itemTouch: { onTouchEnded: this.onRewardItemTouched.bind(this) },
                container: { onTouchEnded: function () {} },
                buttonClose : { onTouchEnded: this.confirmQuit.bind(this) },
                cloudBottom:{visible:false},
                cloudTop:{visible:false},
            };

            FWUI.fillData(this.panelReward, null, uiDefine);

            var itemIcon = FWUI.getChildByName(this.panelReward, "itemIcon");
            var itemSpine = FWUI.getChildByName(this.panelReward, "itemSpine");
            var itemLight = FWUI.getChildByName(this.panelReward, "itemLight");

            if (!this.rewardLight) {

                this.rewardLight = new FWObject();
                this.rewardLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                this.rewardLight.setAnimation("effect_light_icon", true);
                this.rewardLight.setScale(1.3);
                this.rewardLight.setParent(itemLight);
                this.rewardLight.setPosition(cc.p(0, 0));

                this.rewardLight.node.setOpacity(0);
                this.rewardLight.node.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeIn(0.3)));
            }

            var itemGfx = Game.getItemGfxByDefine(itemId);
            var itemAction = cc.sequence(cc.show(), cc.spawn(cc.sequence(new cc.EaseSineOut(cc.scaleTo(0.2, 0.9)), new cc.EaseSineOut(cc.scaleTo(0.3, 1.0))), cc.fadeIn(0.3)));
            if (itemGfx.sprite) {

                FWUI.fillData_image2(itemIcon, itemGfx.sprite, 1.0);

                itemIcon.setOpacity(0);
                itemIcon.setScale(2.0);
                itemIcon.runAction(itemAction);
            }
            else if (itemGfx.spine) {

                FWUI.fillData_spine2(itemSpine, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", 1.0);

                itemSpine.setOpacity(0);
                itemSpine.setScale(2.0);
                itemSpine.runAction(itemAction);
            }

            itemIcon.setVisible(itemGfx.sprite !== undefined);
            itemSpine.setVisible(itemGfx.spine !== undefined);

            //if (this.textHint)
            //    this.textHint.setString(FWLocalization.text("TXT_WHEEL_HINT_SPIN_REWARD"));

            this.panelReward.setVisible(true);
            this.panelReward.setOpacity(255);
        }
        else
        {
            this.onRewardItemTouched();
        }


    },
    onRewardItemTouched: function (sender) {
        if(!this.canReceiveRewards) return;
        this.canReceiveRewards = false;
        cc.log("ConsumeEvent", "onRewardItemTouched", "rewardId:", this.idReward, "rewardAmount:", this.amountReward, this.rewardClaimed);

        if (this.idReward && this.amountReward) {

            var itemIcon = FWUI.getChildByName(this.panelReward, "itemIcon");
            this.rewardPosition = FWUtils.getWorldPosition(itemIcon);
            if(this.posHit) this.rewardPosition = this.posHit;

            if(this.isShowRewards)
            {
                FWUtils.showFlyingItemIcon(this.idReward, this.amountReward, this.rewardPosition, cc.p(1180,700),0.15, false);
            }
            else
            {
                var icon = FWUtils.getItemIcon(this.idReward, this.amountReward, this.rewardPosition);
                FWUI.setWidgetCascadeOpacityEnabled(icon, false);
                FWUtils.getCurrentScene().addChild(icon);
                icon.setPosition(this.rewardPosition.x, this.rewardPosition.y + 20);
                icon.runAction(cc.moveTo(0.75, cc.p(this.rewardPosition.x + 25, this.rewardPosition.y + 20)));
                icon.runAction(cc.sequence(cc.moveTo(0.75, cc.p(this.rewardPosition.x, this.rewardPosition.y - 25)).easing(cc.easeBounceOut()), cc.callFunc(function() {icon.removeFromParent();})));

                FWUtils.showFlyingItemIcon(this.idReward, this.amountReward, cc.p(this.rewardPosition.x + 25, this.rewardPosition.y - 25), cc.p(1180,700),0.75, false);

            }

            cc.log ("ConsumeEvent :","RequestClaimRewards ", this.dataConsume[this.tabComsume].type);
            var pk = network.connector.client.getOutPacket(gv.consumEventMgr.RequestClaimRewards);
            pk.pack(this.dataConsume[this.tabComsume].type);
            network.connector.client.sendPacket(pk);

            this.hideReward(this.idReward, this.amountReward, this.rewardPosition);

        }
    },
    hideReward: function (itemId, itemAmount, itemPosition) {
        cc.log("ConsumeEvent", "hideReward",itemId,itemAmount);

        if(this.isShowRewards)
        {
            if (this.panelReward)
            {
                if (itemId && itemId !== ID_X2) {
                    var rewards = [{
                        itemId: itemId,
                        itemAmount: itemAmount || 1,
                        itemPosition: itemPosition
                    }];
                    this.panelReward.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.2), cc.hide()));
                } else {
                    this.panelReward.setVisible(false);
                }
                if(this.animLongBow && this.animButtonShoot)
                {
                    this.animLongBow.setAnimation("anim_shoot_reset",false,function(){
                        this.canReceiveRewards = true;
                        this.canTouch = true;
                        this.animLongBow.setAnimation("anim_idle",true);
                        this.rotateLongBow();
                        numBalloonFly -=5;
                    }.bind(this));
                    this.animButtonShoot.setAnimation("button_unactive",true);

                }
            }
            this.isShowRewards = false;
        }
        else
        {
            if(this.animLongBow && this.animButtonShoot)
            {
                this.animLongBow.setAnimation("anim_shoot_reset",false,function(){
                    this.canReceiveRewards = true;
                    this.canTouch = true;
                    this.animLongBow.setAnimation("anim_idle",true);
                    this.rotateLongBow();
                    numBalloonFly -=5;
                }.bind(this));
                this.animButtonShoot.setAnimation("button_unactive",true);

            }
        }

    },
    getFlyIcon:function(position) {
        var widget = FWPool.getNode(UI_FLYING_ICON);
        FWUI.unfillData(widget);
        var uiDef =
        {
            sprite:{type:UITYPE_IMAGE, value:cc.formatStr("items/item_consume_event_0%d.png",this.tabComsume+1), scale: 0.5,visible:true},
            count:{type:UITYPE_TEXT, value:-1*g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT, style:TEXT_STYLE_NUMBER, color: cc.WHITE},
        };

        FWUI.alignWidget(widget, position, cc.size(100, 100), null,Z_FLYING_ITEM);
        FWUI.fillData(widget, null, uiDef);
        return widget;
    },
    getInfoIcon:function(position) {
        var widget = FWPool.getNode(UI_HINT_STAT);
        FWUI.unfillData(widget);
        var uiDef =
        {
            iconValue:{type:UITYPE_IMAGE, value:cc.formatStr("items/item_consume_event_0%d.png",this.tabComsume+1), scale: 0.25,visible:true},
            textValue:{type:UITYPE_TEXT, value:-1*g_CONSUME_EVENT.types[this.dataConsume[this.tabComsume].type].POINT_CONVERT, style:TEXT_STYLE_NUMBER, color: cc.WHITE},
        };

        FWUI.alignWidget(widget, position, cc.size(100, 100), null,Z_FLYING_ITEM);
        FWUI.fillData(widget, null, uiDef);
        return widget;
    },
    checkEndEventConsume:function() {
        GardenManager.changeGarden(gv.mainUserData.mainUserId);
    },
    showInfoEvent:function() {
        var itemConsume = {};
        if(gv.consumEventMgr.checkActive())
        {
            var timeConsume =  gv.consumEventMgr.getTimeEvent();

            itemConsume.content = "common/images/hud_consumeevent_news_bg.png";
            itemConsume.startTime = timeConsume.start;
            itemConsume.endTime=timeConsume.end;
            itemConsume.title = "TXT_CONSUME_BOARD_NEWS";
            itemConsume.isConsume = true;
            itemConsume.requiredLevel = cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"),g_MISCINFO.CONSUME_USER_LEVEL);
            itemConsume.isEnoughLevel=gv.userData.isEnoughLevel(g_MISCINFO.CONSUME_USER_LEVEL);
            itemConsume.infoEvent1= "TXT_CONSUME_NEWS_INFO1";
            itemConsume.infoEvent2= "TXT_CONSUME_NEWS_INFO2";
            itemConsume.infoEvent3= "TXT_CONSUME_NEWS_INFO3";
            itemConsume.infoEvent4= "";
        }
        var uiDef =
        {
            info:{visible:true},
            title:{type:UITYPE_TEXT, value:"TXT_EVENT_NEWS"},
            closeButton:{onTouchEnded:this.hideInfo.bind(this)},
            unlockText:{type:UITYPE_TEXT, value:itemConsume.requiredLevel, style:TEXT_STYLE_TEXT_BUTTON, visible:!itemConsume.isEnoughLevel},
            content:{type:UITYPE_IMAGE, value:itemConsume.content, isLocalTexture:true, discard:true,visible:true},
            titleEvent:{type:UITYPE_TEXT, value:itemConsume.title, style:TEXT_STYLE_TEXT_DIALOG},
            infoEvent1:{type:UITYPE_TEXT, value:itemConsume.infoEvent1, style:TEXT_STYLE_NEWS},
            infoEvent2:{type:UITYPE_TEXT, value:itemConsume.infoEvent2, style:TEXT_STYLE_NEWS},
            infoEvent3:{type:UITYPE_TEXT, value:itemConsume.infoEvent3, style:TEXT_STYLE_NEWS},
            infoEvent4:{type:UITYPE_TEXT, value:itemConsume.infoEvent4, style:TEXT_STYLE_TEXT_DIALOG},
        };

        var widget = FWUI.showWithData(UI_COMSUMEEVENT_INFO, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        widget.setLocalZOrder(Z_POPUP);
        FWUtils.showDarkBg(null, Z_POPUP - 1, "darkConsumeInfo");
    },
    hideInfo:function() {
        if(FWUI.isShowing(UI_COMSUMEEVENT_INFO))
        {
            FWUI.hide(UI_COMSUMEEVENT_INFO,UIFX_POP);
            FWUtils.hideDarkBg(null, "darkConsumeInfo");
        }
    },
    fakeData:function(){
        this.dataConsume = [{"2":0,"4":2,"5":[{"A2":1},{"A1":1},{"A0":1},{"M8":2},{"M4":2},{"M22":1},{"P5":1},{"M5":2},{"P12":1}],"7":0,"8":20000,"9":1,"10":2,"type":"GOLD","numPoints":0,"numShots":0,"desc":"TXT_TITLE_TYPE_USED_GOLD","spriteIcon":"hud/icon_gold.png"},{"2":0,"4":2,"5":[{"GOLD":1000},{"A3":1},{"A4":1},{"A5":1},{"M2":2},{"M22":1},{"P7":1},{"P8":1},{"GOLD":4000}],"7":0,"8":50,"9":1,"10":1,"type":"REPU","numPoints":0,"numShots":0,"desc":"TXT_TITLE_TYPE_USED_REPU","spriteIcon":"hud/icon_heart.png"},{"2":0,"4":2,"5":[{"P25":1},{"EXP":500},{"GOLD":5000},{"P30":1},{"P35":1},{"GOLD":6000},{"P36":1},{"EXP":1000},{"EXP":1500}],"7":0,"8":100,"9":1,"10":0,"type":"COIN","numPoints":0,"numShots":0,"desc":"TXT_TITLE_TYPE_USED_COIN","spriteIcon":"hud/icon_gem.png"}];
    },
});