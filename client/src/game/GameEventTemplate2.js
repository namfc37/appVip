const EVENT2_TOKEN_ITEM_IDS = [g_EVENT_02.E02_POINT,"E2T1","E2T2","E2T3","E2T4"];

const MIN_COUNT_INDEX_COMBO = 5;
const INDEX_MILESTONE_H = 100;
const ANIM_GIFT2_NORMAL_ACTIVE = "gift_box_normal_active";
const ANIM_GIFT2_NORMAL_DEFAULT = "gift_box_normal_default";
const ANIM_GIFT2_RANDOM_ACTIVE = "gift_box_random_active";
const ANIM_GIFT2_RANDOM_DEFAULT = "gift_box_random_default";
const ANIM_GIFT2_RANDOM_IDLE = ANIM_GIFT2_RANDOM_DEFAULT;

const ANIM_EVENT_COLLECTION_ACTIVE = "idle_gift_active";
const ANIM_EVENT_COLLECTION_NORMAL = "idle_normal";
const ANIM_EVENT_COLLECTION_MOVE_UP = "moving_up";
const ANIM_EVENT_COLLECTION_MOVE_DOWN = "moving_down";


var tree = cc.Node.extend({
    ctor:function() {
        this._super();
        this.widget = FWPool.getNode(UI_EVENT2_TREE, true,true);
        this.addChild (this.widget);
    },
    onEnter: function () {
        this._super();
    },
    onExit: function () {
        FWPool.returnNode(this.widget);
        this._super();
    },
    load: function (index) {
        cc.log("ssss",index);

        var uiDefine = {
        };

        if(index%2 ==0) {
            var Tree1 = FWUtils.getChildByName(this.widget, "Tree1");
            var Tree2 = FWUtils.getChildByName(this.widget, "Tree2");
            var Mushroom1 = FWUtils.getChildByName(this.widget, "Mushroom1");
            var Mushroom2 = FWUtils.getChildByName(this.widget, "Mushroom2");

            this.flipTree(Tree1);
            this.flipTree(Tree2);
            this.flipTree(Mushroom1);
            this.flipTree(Mushroom2);
        }
        FWUI.fillData(this.widget, null, uiDefine);
    },
    flipTree:function(item) {
        item.setPosition(-1*item.getPositionX()+358,item.getPositionY());
        item.setScale(-1*item.getScaleX(),item.getScaleY());
    },
});


var combo = cc.Node.extend({
    ctor:function(onClick,onShowInfo) {
        this._super();
        this.widget = FWPool.getNode(UI_EVENT2_COMBO_2, true,true);
        this.addChild (this.widget);

        this.callback = onClick;
        this.showInfoCallBack = onShowInfo;
        this.isShowBoardReward =false;
        this.iconReward =  null;
    },
    onEnter: function () {
        this._super();
    },
    onExit: function () {
        FWUI.unfillData(this.widget);
        FWPool.returnNode(this.widget);
        this.iconReward.uninit();
        this.iconReward = null;
        this._super();
    },
    load: function (index,data) {
        cc.log("ssss2",index,this.widget.isFlip);
        this.data = data;
        var uiDefine = {
            panelRewardTouch:{onTouchEnded:this.showInfoCombo.bind(this)},
            panelReward:{visible:true},

        };

        if(this.widget.isFlip){

        }
        else {
            if (index % 2 == 0) {
                var container = FWUtils.getChildByName(this.widget, "container");
                var panelReward = FWUtils.getChildByName(this.widget, "panelReward");
                //var panelInfoRewards = FWUtils.getChildByName(this.widget, "panelInfoRewards");

                this.flipTree(container);
                this.flipTree(panelReward, false);
                //this.flipTree(panelInfoRewards, false);
            }
            this.widget.isFlip = true;
            this.widget.index = index;

        }


        var panelReward = FWUtils.getChildByName(this.widget, "panelReward");
        panelReward.removeAllChildren();
        if(!this.iconReward || !this.iconReward.spine)
        {
            this.iconReward = new FWObject();
            this.iconReward.initWithSpine(SPINE_GIFT_BOX_EVENT2);
            this.iconReward.setScale(0.9);
            this.iconReward.setAnimation(ANIM_GIFT2_NORMAL_DEFAULT,true);
            this.iconReward.setPosition(panelReward.getContentSize().width/2,panelReward.getContentSize().height/2);
            this.iconReward.setParent(panelReward);
            this.iconReward.setVisible(true);
            this.iconReward.skipVisibilityCheck = true;
        }

        this.setAutoAnimationRewards();

        FWUI.fillData(this.widget, null, uiDefine);
    },
    flipTree:function(item,changePos) {//web flipTree:function(item,changePos = true) {
		
		if(changePos === undefined)
			changePos = true;
		
        if(changePos) {
            item.setPosition(-1 * item.getPositionX() + 358, item.getPositionY());
        }
        item.setScale(-1*item.getScaleX(),item.getScaleY());
    },
    setAutoAnimationRewards: function () {
        if(!this.data|| !this.iconReward ) return;
        var enoughCombo = true;
        var missingItems = Game.getMissingItemsAndPrices(this.data.dataItem);
        if (missingItems.missingItems.length > 0)
            enoughCombo = false;
        if(this.data.numTurn >= this.data.maxTurn)
        {
            this.iconReward.node.setColor(cc.color(128, 128, 128, 255));
            this.setAnimationRewards(ANIM_GIFT2_NORMAL_DEFAULT);
            return;
            //this.iconReward.setAnimation("gift_box_normal_default",true);
        }

        if(enoughCombo)
        {
            this.setAnimationRewards(ANIM_GIFT2_NORMAL_ACTIVE);
        }
        else this.setAnimationRewards(ANIM_GIFT2_NORMAL_DEFAULT);
    },
    setAnimationRewards:function(anim,loop) {//web setAnimationRewards:function(anim = null,loop = true) {
		
		if(anim === undefined)
			anim = null;
		if(loop === undefined)
			loop = true;
		
        if(this.iconReward.spine)
        {
            if(anim)
            {
                this.iconReward.setAnimation(anim,loop);
            }
        }
    },
    showInfoCombo:function(){

        var data= this.data;
        data.isFlip = this.widget.isFlip;
        data.index = this.widget.index;
        //this.setAnimationRewards(ANIM_GIFT2_NORMAL_ACTIVE);
        if (this.showInfoCallBack)
            this.showInfoCallBack (data);


    },
    hideRewards:function(){
        var panelInfoRewards = FWUtils.getChildByName(this.widget, "panelInfoRewards");
        panelInfoRewards.visible = false;
        FWUI.hide(UI_EVENT2_REWARDS,UIFX_POP_SMOOTH);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc2);
    },
    exchangeRewards:function() {
        this.showInfoCombo(null,true);
    },
    setVisibleCombo:function(visible) {
        var panelRewardTouch = FWUI.getChildByName(this.widget,"panelRewardTouch");
        panelRewardTouch.setVisible(visible);
    },

});



var GameEventTemplate2 = {
	
	snowParticle: null,
	
    init:function(){

        this.dataReceiveRewardsPack = [];
        for(var group in g_EVENT_02.E02_REWARDS_PACK )
        {
            this.dataReceiveRewardsPack[group] = 0;
        }
        this.dataReceiveRewards = [];
        for(var point in g_EVENT_02.E02_REWARDS )
        {
            this.dataReceiveRewards[point] = 0;
        }





        this.getAllDataFromFile();


        this.getdataReceiveRewardsPack();
        this.getdataReceiveRewards();

        this.prevLevel = gv.userData.getLevel();

        if(!this.dataCombo || this.dataLine)
        {
           this.getAllDataByGroupLevel();
        }

		// moved to show
        /*if(!this.widget) {
            //this.widget = FWPool.getNode(UI_EVENT_TEMPLATE2, false);
            this.widget = FWPool.getNode(UI_EVENT2_TEST, false);
        }

        if(!this.panelTouch)
        {
            this.panelTouch = FWUtils.getChildByName(this.widget, "panelTouch");
        }

        if(!this.panelGift)
        {
            this.panelGift = FWUtils.getChildByName(this.widget, "panelGift");
        }*/
        this.touchId = -1;
        this.currentCombo = -1;
        this.oldCombo = 0;
        this.arrItem = [];
        this.canScroll = true;
        this.canExit = true;
        //this.setUpdate(true);
		
		// fx
		this.snowParticle = new cc.ParticleSystem("effects/effect_snow.plist");
		this.snowParticle.retain();
		this.snowParticle.setTotalParticles(15);
    },
    getAllDataFromFile:function(){
        this.arrAllCombo = {};

        for(var group in g_EVENT_02.E02_REWARDS_PACK )
        {
            for(var groupLevel in g_EVENT_02.E02_REWARDS_PACK[group])
            {
                var combo = g_EVENT_02.E02_REWARDS_PACK[group][groupLevel];
                this.arrAllCombo[combo.REWARD_ID] = combo;
                //this.arrAllCombo.push(g_EVENT_02.E02_REWARDS_PACK[group][item]);
            }
        }

        this.arrAllGift = {};
        for(var point in g_EVENT_02.E02_REWARDS )
        {
            for(var groupLevel in g_EVENT_02.E02_REWARDS[point])
            {
                var reward = g_EVENT_02.E02_REWARDS[point][groupLevel];
                reward.groupLevel = groupLevel;
                reward.point = point;
                this.arrAllGift[reward.id] = reward;
            }
        }
    },
    getAllDataByGroupLevel:function(){
        var arrCombo = [];
        var arrDataLine = [];
        var dataEvent = g_EVENT_02.E02_REWARDS_PACK;
        for(var group in dataEvent)
        {
            var infoReward = this.getRewardInfoByGroup(group);

            var combo = {};
            combo.idCombo = infoReward.REWARD_ID;
            combo.groupLv = infoReward.GROUP_LV;
            combo.numTurn = this.dataReceiveRewardsPack[group];
            combo.group = infoReward.GROUP;
            combo.rewards = infoReward.REWARD_PACK;
            combo.bonus = infoReward.BONUS;
            combo.maxTurn = infoReward.EXCHANGE_LIMIT;
            var arrItem = [];
            for (var key in infoReward.REQUIRE_PACK) {
                var item = {};
                item.itemId = key;
                item.amount = infoReward.REQUIRE_PACK[key];
                item.displayAmount = cc.formatStr("%d", item.amount);
                item.stockAmount = gv.userStorages.getItemAmount(item.itemId);
                var missing = Game.getMissingAmountAndPrice(item.itemId, item.amount);
                item.enough = missing.missingAmount <= 0;
                arrItem.push(item);
            }
            combo.dataItem = arrItem;
            arrCombo.push(combo);


        }

        var dataReward = g_EVENT_02.E02_REWARDS;
        for(var point in dataReward)
        {
            var infoReward = this.getRewardInfo(point);

            var data = {};
            data.rewardId = infoReward.id;
            data.groupLv = infoReward.groupLv;
            data.num = this.dataReceiveRewards[point];
            data.pointRequire = point;
            var arrItem = [];
            for(var key in infoReward.items)
            {
                var item = {};
                item.itemId = infoReward.items[key].id;
                item.amount = infoReward.items[key].quantity;
                arrItem.push(item);
            }
            data.dataRewards = arrItem;
            arrDataLine.push(data);
        }
        this.dataCombo = arrCombo;
        this.dataLine = arrDataLine;
    },

    getdataReceiveRewardsPack:function() {
        if (!this.dataReceiveRewardsPack) return;

        var dataReceive = gv.userData.game[GAME_FESTIVAL][EVENT_02_RECEIVED_REWARDS_PACK];

        //cc.log("GameTemplateEvent2","getdataReceiveRewardsPack", JSON.stringify(dataReceive));
        if(!dataReceive) return;
        for(var key in dataReceive)
        {
            for(var index in dataReceive[key])
            {
                var group = this.arrAllCombo[index].GROUP;
                this.dataReceiveRewardsPack[group] += dataReceive[key][index] ;
            }

        }

    },
    getdataReceiveRewards:function() {

        if (!this.dataReceiveRewards) return;

        var dataReceive = gv.userData.game[GAME_FESTIVAL][EVENT_02_RECEIVED_REWARDS];

        //cc.log("GameTemplateEvent2","getdataReceiveRewards", JSON.stringify(dataReceive));
        if(!dataReceive) return;
        for(var key in dataReceive)
        {
            for(var index in dataReceive[key])
            {
                var point = this.arrAllGift[index].point;
                this.dataReceiveRewards[point] +=dataReceive[key][index] ;
            }

        }

    },
    getActiveEvent:function() {
        var time = Game.getGameTimeInSeconds();

        var event = g_EVENT_02;
        if(!event)
            return null;

        if(time >= event.E02_UNIX_START_TIME && time < event.E02_UNIX_END_TIME)
            return event;

        return null;
    },
	
	resourcesLoaded: false,
    show : function(){
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			var spineFiles = SPINE_EVENT2_COLLECTION.split("|");
			cc.loader.load([EVENT_TEMPLATE2_DUMMY_PLIST,
							EVENT_TEMPLATE2_DUMMY_PLIST.replace(".plist", ".png"),
							UI_EVENT2_TEST,
							UI_EVENT2_TREE,
							UI_EVENT2_COMBO_2,
							UI_EVENT2_ITEM,
							UI_EVENT2_INDEX,
							spineFiles[0],
							spineFiles[1],
							spineFiles[0].replace(".json", ".png")], 
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(EVENT_TEMPLATE2_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}		
				
        if(!this.widget) {
            //this.widget = FWPool.getNode(UI_EVENT_TEMPLATE2, false);
            this.widget = FWPool.getNode(UI_EVENT2_TEST, false);
        }

        if(!this.panelTouch)
        {
            this.panelTouch = FWUtils.getChildByName(this.widget, "panelTouch");
        }

        if(!this.panelGift)
        {
            this.panelGift = FWUtils.getChildByName(this.widget, "panelGift");
        }

        if(this.currentCombo ==-1) this.currentCombo = 0;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved.bind(this),
            onTouchEnded: this.onTouchEnded.bind(this),
            onTouchCancelled: this.onTouchEnded.bind(this)
        }, this.panelTouch);


        if(gv.userData.getLevel() > this.prevLevel)
        {
            this.getAllDataByGroupLevel();
            this.prevLevel = gv.userData.getLevel();
        }
        //if(!this.currentTab)  this.currentTab = EVENT2_TAB_GIFT;

        var uiDef= {
            backButton:{onTouchEnded:this.hide.bind(this)},
            itemList:{visible:true},
            panelInfoRewards:{visible:false},
            helpButton:{onTouchEnded:this.showInfoEvent.bind(this)},
            timerEvent2:{visible: true,type:UITYPE_TIME_BAR, startTime:g_EVENT_02.E02_UNIX_START_TIME, endTime:g_EVENT_02.E02_UNIX_END_TIME, countdown:true,onFinished: this.checkEndEvent2.bind(this)},
        };

        if(!this.listTree)
        {
            this.listTree = FWUtils.getChildByName(this.widget, "itemList");
        }

        if(!this.panelListIndex)
        {
            this.panelListIndex = FWUI.getChildByName(this.widget,"panelListIndex");
        }

        if(!this.panelInfoRewards)
        {
            this.panelInfoRewards = FWUtils.getChildByName(this.widget, "panelInfoRewards");
        }

        if(!this.bgSlotToken)
        {
            this.bgSlotToken = FWUtils.getChildByName(this.widget, "bgSlotToken");
        }

        this.showListTree();
        this.fillDataTokens();

        if(FWUI.isWidgetShowing(this.widget)) {
            FWUI.fillData(this.widget, null, uiDef);
        }
        else {
            FWUtils.showDarkBg(null, Z_UI_EVENT - 1, "darkBgGameEvent2");
            FWUI.showWidgetWithData(this.widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
            this.widget.setLocalZOrder(Z_UI_EVENT);
            AudioManager.effect (EFFECT_POPUP_SHOW);
            cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);

            if(!this.hideFunc)
                this.hideFunc = function() {this.hide()}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc);
			
			// fx
			if(!this.snowParticle.getParent())
			{
				this.widget.addChild(this.snowParticle);
				this.snowParticle.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
				this.snowParticle.setLocalZOrder(Z_TOUCH_EATER);
			}			
        }

        //this.itemListMilestone.setScrollBarOpacity(0);
        //this.listTree.getInnerContainer().setPosition(0, 0)
        this.listTree.getInnerContainer().setPosition(cc.p(0, -1*this.currentCombo*280));


        //var panelGift =  FWUI.getChildByName(this.widget,"panelGift");

        if(!this.spineGift|| !this.spineGift.spine)
        {
            this.spineGift = new FWObject();
            this.spineGift.initWithSpine(SPINE_EVENT2_COLLECTION);
            this.spineGift.setSkin("default");
            this.spineGift.setAnimation("idle_normal",true);
            this.spineGift.setPosition(568,0);
            this.spineGift.setParent(this.widget,99);
        }


        if(!this.arrItem || this.arrItem.length == 0)
        {
            this.arrItem = [];
            for(var i=1;i<=4;i++)
            {
                var slotItem = this.spineGift.spine.findSlot(cc.formatStr("slot_item_%d",i)).bone;
                var spineSlotItem = FWPool.getNode(UI_EVENT2_ITEM, true,true);
                spineSlotItem.setPosition( slotItem.x+ slotItem.worldX ,slotItem.y + slotItem.worldY);
                this.spineGift.node.addChild(spineSlotItem,999)//.setParent(this.listTree);
                this.arrItem.push(spineSlotItem);
            }
        }


        for(var i=0;i<=3;i++)
        {
            if(!this.arrItem[i]|| this.arrItem[i].poolFree) {
                var slotItem = this.spineGift.spine.findSlot(cc.formatStr("slot_item_%d", i+1)).bone;
                this.arrItem[i] = FWPool.getNode(UI_EVENT2_ITEM, true, true);
                this.arrItem[i].setPosition(slotItem.x + slotItem.worldX, slotItem.y + slotItem.worldY);
                this.spineGift.node.addChild(this.arrItem[i], 999)//.setParent(this.listTree);
            }
        }





        var panelSpineReward = FWUI.getChildByName(this.widget,"panelSpineReward");
        if(!this.iconReward|| !this.iconReward.spine) {
            this.iconReward = new FWObject();
            this.iconReward.initWithSpine(SPINE_GIFT_BOX_EVENT2);
            this.iconReward.setAnimation(ANIM_GIFT2_RANDOM_DEFAULT, true);
            this.iconReward.setPosition(panelSpineReward.getContentSize().width / 2, panelSpineReward.getContentSize().height / 2);
            this.iconReward.setParent(panelSpineReward,2);
        }

        if(!this.effectGenieLamp)
        {
            this.effectGenieLamp = new cc.ParticleSystem("effects/effect_light_lamp.plist");
            this.effectGenieLamp.setDuration(-1);//maxLevelParticle.setDuration(-1);
            this.effectGenieLamp.setLife(10);
            this.effectGenieLamp.setVisible(false);
            this.effectGenieLamp.setPositionType(2);
            this.effectGenieLamp.setPosition(panelSpineReward.getContentSize().width / 2, panelSpineReward.getContentSize().height / 2 +20);
            this.effectGenieLamp.setScale(1);
            //maxLevelParticle.setTotalParticles(15);
			this.effectGenieLamp.retain();
		}
		if(!this.effectGenieLamp.getParent())
            panelSpineReward.addChild(this.effectGenieLamp,0);



        this.fillDataCombo();

        this.fillDataGift();
    },
    // opt
    setUpdate:function(isUpdate) {
        if(isUpdate)
        {
            //cc.director.getScheduler().scheduleUpdateForTarget(this, UPDATE_PRIORITY_CLOUD_FLOOR_SLOT, false);
            //cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
        }
        else
        {
            //cc.director.getScheduler().unscheduleUpdateForTarget(this);
            cc.director.getScheduler().unscheduleUpdateForTarget(this);
        }
    },
    update:function(dt){
        if(this.arrItem&&this.spineGift.spine)
        {
            for(var i=0;i<this.arrItem.length;i++)
            {
                var slotItem = this.spineGift.spine.findSlot(cc.formatStr("slot_item_%d",i+1)).bone;
                //cc.log("PosSSS",JSON.stringify(cc.p(slotItem.worldX,slotItem.worldY)));
                this.arrItem[i].setPosition(cc.p(slotItem.worldX -45 ,slotItem.worldY -45));
                //this.arrItem[i].setRotation(-slotItem.parent.worldRotation); // -slot.parent.worldRotation is null
            }

            if(this.currentCombo != this.oldCombo)
            {
                this.oldCombo = this.currentCombo;
                this.fillDataCombo();
            }

        }
    },
    hide: function(){
        if(!this.canExit) return;
        if(FWUI.isShowing(UI_EVENT2_TEST))
        {
            FWUtils.hideDarkBg(null, "darkBgGameEvent2");
            FWUI.hide(UI_EVENT2_TEST, UIFX_POP);
            AudioManager.effect (EFFECT_POPUP_CLOSE);
            Game.gameScene.unregisterBackKey(this.hideFunc);
            this.setUpdate(false);
        }
    },
	
    showTab:function(tab) {
        this.currentTab = tab;
        this.show();
    },
    showGiftList:function(uiDef){

        cc.log("GameEvent2","showGiftList");
        var itemDef = {
            imgGift:{onTouchEnded:this.showRewards.bind(this)},
            lblAmount:{type:UITYPE_TEXT, field:"pointRequire", style:TEXT_STYLE_NUMBER, visible:true},
        };

        uiDef.itemListMilestone={visible:true, type:UITYPE_2D_LIST, items:this.dataLine, itemUI:UI_EVENT2_MILESTONE, itemDef:itemDef, itemSize:cc.size(200, 200), singleLine:true};
    },
    showRewards:function(sender){
        if(this.isReceivingReward)
            return;

        var data = sender.uiData;

        var itemList = data.dataRewards;

        var itemDef =
        {
            gfx:{type:UITYPE_ITEM, field:"itemId"},
            amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
        };

        var uiDef =
        {
            title:{type:UITYPE_TEXT, value:"TXT_EVT_POSSIBLE_GIFT" , style:TEXT_STYLE_TEXT_DIALOG},
            //receiveButton:{onTouchEnded:(function() {this.hideRewards(); this.receiveRewards(sender);}).bind(this)},
            receiveText:{type:UITYPE_TEXT, value:"TXT_EVENT_RECEIVE", style:TEXT_STYLE_TEXT_BUTTON},
            itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(90, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75, singleLine:true},
            tapToClose:{onTouchEnded:this.hideRewards.bind(this)},
        };

        var widget = FWUI.showWithData(UI_EVENT_MILESTONE_GIFT, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        widget.setLocalZOrder(Z_POPUP);
        widget.setPosition(FWUtils.getWorldPosition(sender));
        widget.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);

        if(itemList.length <= 5)
        {
            // hide annoying scrollbars
            var itemListWidget = FWUtils.getChildByName(widget, "itemList");
            itemListWidget.setDirection(ccui.ScrollView.DIR_NONE);
        }

        // jira#6408
        if(!this.hideFuncRewards)
            this.hideFuncRewards = function() {this.hideRewards()}.bind(this);
        Game.gameScene.registerBackKey(this.hideFuncRewards);
    },
    hideRewards:function(sender) {
        FWUI.hide(UI_EVENT_MILESTONE_GIFT, UIFX_POP);
        Game.gameScene.unregisterBackKey(this.hideFuncRewards);
    },
    showListTree:function(){
        FWUI.unfillData_list(this.listTree);
        var temps = this.dataCombo;

        var numWidgetTree = Math.ceil(280 * temps.length/639);
        cc.log("numWidgetTree",numWidgetTree);

        var arrWidgetTrees = [];
        for (var i = numWidgetTree; i >=0 ; i--)
        {
            var item = new tree();
            item.load (i);
            arrWidgetTrees.push (item);
        }

        for (var i in arrWidgetTrees)
        {
            var item = arrWidgetTrees [i];
            item.setPosition (cc.p (0, 639 * i ));
            if(this.listTree)
            {
                this.listTree.addChild (item);
            }
            item.setTag(UI_FILL_DATA_TAG);
        }


        var arrWidgetCombo = [];
        for (var i = 0; i <=temps.length-1 ; i++)
        {
            var data = temps[i];
            var item = new combo(function(comboData) {this.onExchangeItem (comboData);}.bind(this), function(comboData) {this.showInfoReward (comboData);}.bind(this));//web
            item.load (i,data);
            arrWidgetCombo.push (item);
        }

        this.arrCombo = arrWidgetCombo;

        for (var i in arrWidgetCombo)
        {
            var item = arrWidgetCombo [i];
            item.setPosition (cc.p (0,180+ 280 * i ));
            if(this.listTree)
            {
                this.listTree.addChild(item,9999-i);
            }
            item.setTag(UI_FILL_DATA_TAG);
        }


        this.listTree.setInnerContainerSize(cc.size(500, arrWidgetTrees.length * 639));
		if(this.listTree.setScrollBarOpacity) //web
			this.listTree.setScrollBarOpacity(0);


    },
    showListIndexCombo:function(){

        if(this.panelListIndex)
        {
            cc.log("showListIndexCombo");
            var temps = this.dataCombo;
            var arrIndex = [];

            var min = MIN_COUNT_INDEX_COMBO;
            if(this.dataCombo.length < MIN_COUNT_INDEX_COMBO) min = this.dataCombo.length-1;

            var space = (this.dataCombo.length-1) / (min);

            for(var j = min; j >= 0; j--)
            {
                var item = {};

                var i = Math.ceil(j*space);
                cc.log("index BigGift",i);
                item.zOrder = 999 - i;
                item.index = i;
                item.isSelected = item.index == this.currentCombo;
                item.scale = item.isSelected ? 0.7 : 0.5;
                item.itemColor = item.isSelected ? cc.color(255, 255, 255, 255) : cc.color(128, 128, 128, 255);
                //temps[i].sprite = "hud/icon_tab_gift.png";
                item.enoughCombo = true;
                var missingItems = Game.getMissingItemsAndPrices(temps[i].dataItem);
                if (missingItems.missingItems.length > 0)
                    item.enoughCombo = false;

                if(item.index == 0)
                {
                    item.showArrow = false;
                    item.arrowPos = 0;
                }
                else
                {
                    var belowIndex = Math.ceil((j-1)*space);
                    item.showArrow = item.index > this.currentCombo && this.currentCombo > belowIndex;
                    item.arrowPos = (this.currentCombo - belowIndex) / (item.index - belowIndex) * INDEX_MILESTONE_H ;
                }



                arrIndex.push(item);
            }

            var itemDef =
            {
                imgBgIndex:{visible:"data.index !== 0"},
                panelTouchIndex:{onTouchEnded:this.onClickIndex.bind(this)},
                imgGiftIndex:{type:UITYPE_IMAGE,id:"hud/icon_tab_gift.png" ,scale:"data.scale",color:"data.itemColor"},
                imgCheckedIndex:{visible:"data.enoughCombo"},
                imgArrowBar:{visible:"data.showArrow",posY :"data.arrowPos"},
                //imgGiftIndex:{color:"data.itemColor"},
            }
            var uiDef ={
                itemListIndexCombo:{type:UITYPE_2D_LIST, items:arrIndex, itemUI:UI_EVENT2_INDEX, itemDef:itemDef, itemSize:cc.size(100, 100)}
            }

            FWUI.fillData(this.panelListIndex, null, uiDef);

        }
        //FWUI.unfillData_list(this.itemListIndexCombo);
    },
    onClickIndex:function(sender){
        //cc.log("onClickIndex",JSON.stringify(sender)); error: cycle object value
        if(this.panelInfoRewards.isVisible()) this.panelInfoRewards.setVisible(false);
        var panel = FWUI.getChildByName(this.panelGift,"panelInfoRewardsItem");
        if(panel&&panel.isVisible()) panel.setVisible(false);
        if(!this.canScroll) return;
        var dataIndex = sender.uiData;
        if(!dataIndex) return;

        var index = dataIndex.index;
        this.scrollToIndex(index);
    },
    scrollToIndex:function(index){
        var step = 0;
        if(index!= this.currentCombo)
        {
            step = index - this.currentCombo;
            this.currentCombo = index;
        }

        var anim = ANIM_EVENT_COLLECTION_NORMAL;
        if(this.arrCombo)
        {
            if(this.arrCombo[this.currentCombo].iconReward.getAnimation() == ANIM_GIFT2_NORMAL_ACTIVE)
                anim = ANIM_EVENT_COLLECTION_ACTIVE;
        }

        if(step == 0) return;
        this.canScroll = false;
        var listTree = this.listTree.getInnerContainer();
        if(step >0)
        {
            listTree.runAction(cc.spawn(
				cc.moveTo(1,cc.p(0, listTree.getPositionY() - step*280)).easing(cc.easeSineOut()),
				cc.callFunc(function()//web
				{
					this.spineGift.setAnimation(ANIM_EVENT_COLLECTION_MOVE_UP,false, function()//web
					{
						this.spineGift.setAnimation(anim,true);
						this.canScroll= true;
					}.bind(this));
				}.bind(this))
			));
        }
        else
        {
            listTree.runAction(cc.spawn(
				cc.moveTo(1,cc.p(0, listTree.getPositionY() - step*280)).easing(cc.easeSineOut()),
				cc.callFunc(function()//web
				{
					this.spineGift.setAnimation(ANIM_EVENT_COLLECTION_MOVE_DOWN,false, function()//web
					{
						this.spineGift.setAnimation(anim,true);
						this.canScroll= true;
					}.bind(this));
				}.bind(this))
			));
        }


    },
    getRewardInfoByGroup:function(group) {
        var info = g_EVENT_02.E02_REWARDS_PACK[group];
        var level = gv.userData.getLevel();

        for(var key in info)
        {
            if(level <= key)
                return info[key]; // get info nearestReward levelUser
        }
        return null;
    },
    getRewardInfo:function(group) {
        var info = g_EVENT_02.E02_REWARDS[group];
        var level = gv.userData.getLevel();

        for(var key in info)
        {
            if(level <= key)
            {
                info[key].groupLv = key;
                return info[key]; // get info nearestReward levelUser
            }
        }
        return null;
    },
    onExchangeItem:function(data){

        //
        var pk = network.connector.client.getOutPacket(this.RequestEvent02ExchangePack);
        cc.log("onExchangeItem",g_EVENT_02.E02_ID,data.idCombo,data.group);
        pk.pack(g_EVENT_02.E02_ID,data.idCombo,data.group);
        network.connector.client.sendPacket(pk);

    },
    showInfoReward:function(data){
        //cc.log("showInfoReward",JSON.stringify(data));
        //if(data.index!== this.currentCombo) return;
        if(this.panelInfoRewards.isVisible()) {
            this.panelInfoRewards.setVisible(false);
            return;
        }
        if(data){
            var id = data.idCombo;
            cc.log ("ComBo", "showInfoCombo", id,"numTurn :",data.numTurn,"maxTurn",data.maxTurn);
            var rewards = [];
            for(var key in data.rewards)
            {
                var itemRewards = {};
                itemRewards.itemId = key;
                itemRewards.amount = data.rewards[key];
                rewards.push(itemRewards);
            }

            for(var key in data.bonus)
            {
                var itemBonus = {};
                itemBonus.itemId = key;
                itemBonus.amount = data.bonus[key];
                rewards.push(itemBonus);
            }

            data.totalRewards = rewards;
            var itemDef = {
                gfx:{type:UITYPE_ITEM, field:"itemId"},
                amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, visible:true,useK:true},
                item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
            };


            var uiDefine ={
                exchangeButton:{visible:true,onTouchEnded:this.changeCombo.bind(this),enabled:data.numTurn < data.maxTurn},
                listItem:{type:UITYPE_2D_LIST, items:rewards, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
                lblTitle:{type:UITYPE_TEXT,value:"TXT_EVENT2_TITLE_INFO_REWARDS",style:TEXT_STYLE_HINT_NOTE},
                lblNote:{type:UITYPE_TEXT,value:cc.formatStr(FWLocalization.text("TXT_EVENT2_RATIO_CHANGE_COMBO"),data.numTurn,data.maxTurn),style:TEXT_STYLE_HINT_NOTE},
                lblTextButton:{type:UITYPE_TEXT,value:data.numTurn>= data.maxTurn?"TXT_IB_SHOP_OUT_LIMIT_TITLE":"TXT_EVENT2_CHANGE_COMBO",style:TEXT_STYLE_NUMBER},
            };

            //TXT_IB_SHOP_OUT_LIMIT_TITLE
            FWUI.fillData(this.panelInfoRewards, null, uiDefine);
            this.panelInfoRewards.setVisible(true);
            if(data.index %2==0){
                this.panelInfoRewards.setPosition(cc.p(757,483));
            }
            else {
                this.panelInfoRewards.setPosition(cc.p(667,483));
            }
        }
    },
    onTouchBegan: function (touch, event) {
        cc.log("onTouchBegan");
		if(cc.sys.isNative)
		{
			if (this.touchId === -1) {
				this.touchId = touch.getID();
				this.touchStartPoint = touch.getLocation();
				cc.log("touchId",this.touchId);
			}
		}
		else
		{
			// jira#7257
			this.touchId = touch.getID();
			this.touchStartPoint = touch.getLocation();
		}
        if(this.panelInfoRewards.isVisible()) this.panelInfoRewards.setVisible(false);
        var panel = FWUI.getChildByName(this.panelGift,"panelInfoRewardsItem");
        if(panel&&panel.isVisible()) panel.setVisible(false);
        cc.log("onTouchBegan","canScroll",this.canScroll);
        if(!this.canScroll) return false;
        return true;
    },
    onTouchMoved: function (touch, event) {
        //cc.log("onTouchMoved");
        if (this.touchId !== touch.getID()) {
            cc.log("touchId", this.touchId);
            return;
        }
        //var position = touch.getLocation();
        //var moveVector = cc.PSUB(position, this.touchStartPoint);
        //
    },

    onTouchEnded: function (touch, event) {
        //cc.log("onTouchEnded");
		if (this.touchId !== touch.getID()) {
			cc.log("touchId", this.touchId);
			return;
		}
		this.touchId = -1;

        var moveVector = cc.PSUB(touch.getLocation(), this.touchStartPoint);
        var moveLength = cc.PLENGTH(moveVector);
        //cc.log("onTouchEnded",JSON.stringify(touch.getLocation()),JSON.stringify(this.touchStartPoint),moveLength);
        var step = Math.floor((moveLength+80)/220);

        if(touch.getLocation().y < this.touchStartPoint.y)
        {
            if(this.currentCombo >= this.arrCombo.length - 1) return;
            if(this.currentCombo + step >= this.arrCombo.length -1 )
            {
                step = this.arrCombo.length-1 - this.currentCombo;
            }
            this.currentCombo += step;
            cc.log("currentCombo",this.currentCombo);

            var anim = ANIM_EVENT_COLLECTION_NORMAL;
            if(this.arrCombo)
            {
                if(this.arrCombo[this.currentCombo].iconReward.getAnimation() == ANIM_GIFT2_NORMAL_ACTIVE)
                    anim = ANIM_EVENT_COLLECTION_ACTIVE;
            }
            var listTree = this.listTree.getInnerContainer();
            if(step> 0)
            {
                this.canScroll = false;
                listTree.runAction(cc.spawn(
					cc.moveTo(1,cc.p(0, listTree.getPositionY() - step*280)).easing(cc.easeSineOut()),
					cc.callFunc(function()//web
					{
						this.spineGift.setAnimation(ANIM_EVENT_COLLECTION_MOVE_UP,false, function()//web
						{
							this.spineGift.setAnimation(anim,true);
							this.canScroll= true;
						}.bind(this));
					}.bind(this))
				));
            }
        }
        else
        {
            if(this.currentCombo <= 0) return;
            if(this.currentCombo - step <= 0)
            {
                step = this.currentCombo;
            }
            this.currentCombo -= step;
            cc.log("currentCombo",this.currentCombo);
            var anim = ANIM_EVENT_COLLECTION_NORMAL;
            if(this.arrCombo)
            {
                if(this.arrCombo[this.currentCombo].iconReward.getAnimation() == ANIM_GIFT2_NORMAL_ACTIVE)
                anim = ANIM_EVENT_COLLECTION_ACTIVE;
            }
            var listTree = this.listTree.getInnerContainer();
            if(step>0){
                this.canScroll = false;
                listTree.runAction(cc.spawn(
					cc.moveTo(1,cc.p(0, listTree.getPositionY() + step*280)).easing(cc.easeSineOut()),
					cc.callFunc(function()//web
					{
						this.spineGift.setAnimation(ANIM_EVENT_COLLECTION_MOVE_DOWN,false,function()//web
						{
							this.spineGift.setAnimation(anim,true);
							this.canScroll= true;
						}.bind(this));
					}.bind(this))
				));
            }
        }
        return;

    },
    showInfoEvent:function(){
        this.hide();
        GameEvent.showInfo();
    },
    fillDataCombo:function() {
        cc.log("GameEventTemplate2","fillDataCombo");
        if (!this.arrItem || this.arrItem.length == 0) return;
        if(!this.arrCombo || this.arrCombo.length == 0) return;

        for(var i=0; i< this.dataCombo[this.oldCombo].dataItem.length;i++)
        {
            var dataItem = this.dataCombo[this.oldCombo].dataItem[i];
            //cc.log("fillDataCombo",JSON.stringify(dataItem)); // cyclic object value
            dataItem.stockAmount = gv.userStorages.getItemAmount(dataItem.itemId);
            var missing = Game.getMissingAmountAndPrice(dataItem.itemId, dataItem.amount);
            dataItem.enough = missing.missingAmount <= 0;

            var uiItemDef = {
                bg:{visible:true},
                //check:{visible:false},
                requireAmount:{type:UITYPE_TEXT, value:dataItem.displayAmount, color:dataItem.enough ? cc.GREEN : cc.RED ,style:TEXT_STYLE_NUMBER_EVENT2},
                stockAmount:{visible:false},
                gfx:{type:UITYPE_ITEM, value:dataItem.itemId},
                buyButton:{visible:dataItem.enough === false, onTouchEnded:this.buyMissingRepairItem.bind(this)},
                item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
            };
            FWUI.fillData(this.arrItem[i], dataItem, uiItemDef);
        }

        for(var i=0;i<this.arrCombo.length;i++)
        {
            if(i == this.oldCombo) this.arrCombo[this.oldCombo].setVisibleCombo(true);
            else this.arrCombo[i].setVisibleCombo(false);

            this.arrCombo[i].setAutoAnimationRewards();
        }


        var anim = ANIM_EVENT_COLLECTION_NORMAL;
        if (this.arrCombo) {
            if (this.arrCombo[this.currentCombo].iconReward.getAnimation() == ANIM_GIFT2_NORMAL_ACTIVE)
                anim = ANIM_EVENT_COLLECTION_ACTIVE;
        }
        if (this.spineGift.getAnimation() != anim && this.canScroll==true) this.spineGift.setAnimation(anim, true);




        this.showListIndexCombo();
        this.fillDataTokens();
    },
    fillDataGift:function(){
        cc.log("fillDataGift");
        if(!this.dataLine || this.dataLine==0) return;

        var data = this.dataLine[this.dataLine.length-1];
        data.isRecive = true;

        for(var i=0;i<this.dataLine.length;i++)
        {
            if(this.dataLine[i].num == 0) {
                data = this.dataLine[i];
                data.isRecive = false;
                data.index = i;
                break;
            }
        }

        data.stockAmount = gv.userStorages.getItemAmount(g_EVENT_02.E02_POINT);
        var missing = Game.getMissingAmountAndPrice(g_EVENT_02.E02_POINT, data.pointRequire);
        data.enough = missing.missingAmount <= 0;
        data.displayAmount = "/"+ data.pointRequire;

        var itemDef =
        {
            gfx:{type:UITYPE_ITEM, field:"itemId"},
            amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
        };

        var uiDef = {
            requireItem:{type:UITYPE_TEXT, value:data.displayAmount, color:cc.GREEN, style:TEXT_STYLE_NUMBER},
            stockItem:{type:UITYPE_TEXT, value:data.stockAmount, color:data.enough ? cc.GREEN : cc.RED, style:TEXT_STYLE_NUMBER},
            panelSpineReward:{onTouchEnded:this.showGift.bind(this)},
            listItem:{type:UITYPE_2D_LIST, items:data.dataRewards, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(90, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75, singleLine:true},
            //listItem:{type:UITYPE_2D_LIST, items:data.dataRewards, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(90, 90), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
            lblTitle:{type:UITYPE_TEXT, value:"TXT_EVENT2_TITLE_GIFT", style:TEXT_STYLE_HINT_NOTE},
            lblTextButtonGift:{type:UITYPE_TEXT, value:data.isRecive? "TXT_IB_SHOP_OUT_LIMIT_TITLE":"TXT_EVENT2_CHANGE_COMBO", style:TEXT_STYLE_TEXT_NORMAL},
            exchangeButtonGift:{onTouchEnded:this.changeGift.bind(this),enabled:data.enough&&!data.isRecive},
            panelInfoRewardsItem:{visible:false},
            giftTouch:{visible:false}//onTouchEnded:this.hideInfoGift.bind(this)}
        };

        FWUI.fillData(this.panelGift, data, uiDef);

        if(this.iconReward && this.iconReward.spine)
        {
            if(data.enough && !data.isRecive){
                this.iconReward.setAnimation(ANIM_GIFT2_RANDOM_ACTIVE,true);
                if(this.effectGenieLamp) this.effectGenieLamp.setVisible(true);
            }
            else
            {
                this.iconReward.setAnimation(ANIM_GIFT2_RANDOM_DEFAULT,true);
                if(this.effectGenieLamp) this.effectGenieLamp.setVisible(false);
            }
        }


    },
    fillDataTokens:function(){
        cc.log("GameEventTemplate2","fillDataTokens");

        if(this.bgSlotToken)
        {
            var arrTokens=[];
            for(var i = 1 ; i< EVENT2_TOKEN_ITEM_IDS.length;i++)
            {
                var token ={};
                token.tokenId = EVENT2_TOKEN_ITEM_IDS[i];
                token.stockAmount = gv.userStorages.getItemAmount(token.tokenId);
                token.stockDisplay ="x"+ gv.userStorages.getItemAmount(token.tokenId);
                arrTokens.push(token);

            }

            //cc.log("arrTokens",JSON.stringify(arrTokens));

            var tokenDef ={
                bg:{visible:false},
                ////check:{visible:false},
                requireAmount:{visible:false},
                stockAmount:{type:UITYPE_TEXT, visible:true,field:"stockDisplay",style:TEXT_STYLE_NUMBER_EVENT2,color:cc.WHITE},
                gfx:{type:UITYPE_ITEM, field:"tokenId"},
                buyButton:{visible:false},
                //item:{visible:false},
            };
            var uiDef ={
                itemListToken:{type:UITYPE_2D_LIST, items:arrTokens, itemUI:UI_EVENT2_ITEM, itemDef:tokenDef, itemSize:cc.size(90, 100)},
            };

            FWUI.fillData(this.bgSlotToken, null, uiDef);
        }

    },
    buyMissingRepairItem:function(sender){
        cc.log("ComBoEvent2::buyMissingRepairItem");
        var data = sender;
        if(sender.uiData.enough)
            return;
        Game.showQuickBuy([{itemId:sender.uiData.itemId, amount:sender.uiData.amount}], function() {GameEventTemplate2.fillDataCombo()},NPC_AVATAR_WOLF_TARZAN);
    },
    showGift:function(sender){
        //cc.log("showww");

        var panelInfoRewardsItem= FWUI.getChildByName(this.panelGift,"panelInfoRewardsItem");
        if(panelInfoRewardsItem.isVisible())panelInfoRewardsItem.setVisible(false);
        else panelInfoRewardsItem.setVisible(true);

    },
    hideInfoGift:function(){
        var panelInfoRewardsItem= FWUI.getChildByName(this.panelGift,"panelInfoRewardsItem").setVisible(false);
    },
    changeGift:function(sender){
        //cc.log("changeGift",JSON.stringify(sender)); // cyclic object value

        var data = sender.uiData;
        if(!data) return;
        if(data.isRecive) {
            //FWUtils.showWarningText(FWLocalization.text("TXT_EVENT2_REWARDS_RECEIVED"), FWUtils.getWorldPosition(sender));
            return;
        }
        this.dataLine[data.index].isRecive = true;
        this.dataLine[data.index].num ++;
        this.dataReceiveRewards[data.pointRequire]++;
        //Game.showGiftPopup(data.dataRewards, "TXT_EVENT2_TITLE_CHANGE_GIFT", null, null, true);



        var panelSpineReward = FWUI.getChildByName(this.widget,"panelSpineReward");

        var pos = panelSpineReward.getPosition();
        //pos.y -= 50;
        var spine = FWUtils.showSpine(SPINE_GIFT_BOX_EVENT2, null, "gift_box_random_default", true, panelSpineReward.getParent(), pos, panelSpineReward.getLocalZOrder() + 1, false);
        spine.runAction(cc.sequence(
            cc.callFunc(function() {GameEventTemplate2.setCanExit(false);}),
            cc.jumpTo(1, FWUtils.getWorldPosition(Game.gameScene.uiMainBtnMail), 200, 1.5).easing(cc.easeExponentialIn()),
            cc.removeSelf(),
            cc.callFunc(function() {GameEventTemplate2.setCanExit(true);})
        ));
		
		//feedback
		spine.setScale(1);
		spine.runAction(cc.scaleTo(1, 0.15).easing(cc.easeExponentialIn()));

        //var iconItem = FWUI.getChildByName(this.widget,"iconItem");
        //var pos2 = iconItem.getPosition();
        //var flyIcon = this.getFlyIcon(pos,data.pointRequire);
        //this.widget.addChild(flyIcon,999999);
        //FWUI.setWidgetCascadeOpacityEnabled(flyIcon, true);
        //FWUtils.flyNode(flyIcon, pos2, cc.p(pos2.x, pos2.y - 100),  1, true, null, true, 0);

        // Server
        var pk = network.connector.client.getOutPacket(this.RequestEvent02ReceiveRewards);
        cc.log("changeGift pointRequire",data.pointRequire);
        pk.pack(data.pointRequire);
        network.connector.client.sendPacket(pk);
        this.fillDataGift();
    },
    setCanExit:function(boolen) {
        this.canExit = boolen;
    },
    changeCombo:function(sender){
        var data = this.dataCombo[this.currentCombo];
        //cc.log("changeCombo",JSON.stringify(data));
        if(data.numTurn>= data.maxTurn )
        {
            FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_MAX_EXCHANGE"), FWUtils.getWorldPosition(sender));
            return;
        }

        cc.log("changeCombo : idComBo :" , data.idCombo, "numTurn :",data.numTurn,"maxTurn",data.maxTurn );
        var fullRequireItems = data.dataItem;
        var pos = FWUtils.getWorldPosition(sender);
        pos.y += 100;
        if(!Game.consumeItems(fullRequireItems, pos))
        {
            Game.showQuickBuy(fullRequireItems, function() { GameEventTemplate2.fillDataCombo();},NPC_AVATAR_WOLF_TARZAN);
            //return;
        }
        else{
            this.dataReceiveRewardsPack[data.group]++; // fake data
            data.numTurn++;
            if(this.panelInfoRewards.isVisible()) this.panelInfoRewards.setVisible(false);

            //Game.showGiftPopup(data.totalRewards, "TXT_EVENT2_TITLE_CHANGE_COMBO", null, null, true);
            var dataBonus = data.bonus;

            var pos = this.panelInfoRewards.getPosition();
            pos.y -= 180;
            var spine = FWUtils.showSpine(SPINE_GIFT_BOX_EVENT2, null, "gift_box_normal_default", true, this.panelInfoRewards.getParent(), pos, this.panelInfoRewards.getLocalZOrder() + 1, false);
            spine.setScale(0.9);
            spine.runAction(cc.sequence(
                cc.callFunc(function() {GameEventTemplate2.setCanExit(false);}),
                cc.jumpTo(1, FWUtils.getWorldPosition(Game.gameScene.uiMainBtnMail), 200, 1.5).easing(cc.easeExponentialIn()),
                cc.removeSelf(),
                cc.callFunc(function() {GameEventTemplate2.setCanExit(true);})
            ));
			
			//feedback
			spine.runAction(cc.scaleTo(1, 0.15).easing(cc.easeExponentialIn()));

            var iconItem = FWUI.getChildByName(this.widget,"iconItem");
            var panelGift = FWUI.getChildByName(this.widget,"panelGift");

            var endPosition = cc.p(iconItem.getPositionX()+panelGift.getPositionX(),iconItem.getPositionY()+panelGift.getPositionY())
            //cc.log("posAAA",JSON.stringify(iconItem.getPosition()),JSON.stringify(panelGift.getPosition()));
            FWUtils.showFlyingItemIcon(g_EVENT_02.E02_POINT, dataBonus[g_EVENT_02.E02_POINT],pos, endPosition);


            GameEventTemplate2.fillDataCombo();
            //server
            this.onExchangeItem(data);
        }
    },
    checkEndEvent2:function(){
        FWUtils.showWarningText(FWLocalization.text("TXT_EVENT_END_TITLE"),cc.p(600,500), cc.WHITE);
        this.hide();
    },
    showItemHint:function(sender)
    {
        //cc.log("showItemHint",JSON.stringify(sender));
        var position = null;
        position = FWUtils.getWorldPosition(sender);
        gv.hintManagerNew.show(null, null, sender.uiData.itemId, position);
    },
    hideItemHint:function(sender)
    {
        //cc.log("hideItemHint",JSON.stringify(sender));
        gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
    },
    //getFlyIcon:function(position,amount) {
    //    var widget = FWPool.getNode(UI_FLYING_ICON);
    //    FWUI.unfillData(widget);
    //    var uiDef =
    //    {
    //        sprite:{type:UITYPE_IMAGE, value:"items/item_event02_token05.png", scale: 0.5,visible:true},
    //        count:{type:UITYPE_TEXT, value:amount, style:TEXT_STYLE_NUMBER, color: cc.WHITE},
    //    };
    //
    //    FWUI.alignWidget(widget, position, cc.size(100, 100), null,Z_FLYING_ITEM);
    //    FWUI.fillData(widget, null, uiDef);
    //    return widget;
    //},

    /////// SERVER ///////////////
    RequestEvent02ExchangePack:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.EVENT02_EXCHANGE_PACK);},
        pack:function(eventId, itemId,group)
        {
            addPacketHeader(this);
            PacketHelper.putString(this, KEY_EVENT_ID, eventId);
            PacketHelper.putInt(this, KEY_EVENT_REWARD_ID, itemId)
            PacketHelper.putInt(this, KEY_EVENT_GROUP, group);
            
            addPacketFooter(this);
        },
    }),


    RequestEvent02ReceiveRewards:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.EVENT_02_RECEIVE_REWARDS);},
        pack:function(pointRequest)
        {
            addPacketHeader(this);
            PacketHelper.putInt(this, KEY_EVENT_REWARD_ID, pointRequest)
            
            addPacketFooter(this);
        },
    }),

    ResponseEvent02ExchangePack:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("GameEventTemplate2.ResponseEvent02ExchangePack");
            var object = PacketHelper.parseObject(this);
            if(this.getError() !== 0)
                cc.log("GameEventTemplate2.ResponseEvent02ExchangePack: error=" + this.getError());

            var updateItems = object[KEY_UPDATE_ITEMS];
            if (updateItems)
                gv.userStorages.updateItems(updateItems);

            GameEventTemplate2.fillDataGift();
        }
    }),
};

network.packetMap[gv.CMD.EVENT02_EXCHANGE_PACK] = GameEventTemplate2.ResponseEvent02ExchangePack;