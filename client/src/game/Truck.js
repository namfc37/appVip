var displacementTruck = 30;

var Truck = {
    LOGTAG : "[Truck]",
    data: null,
    level: null,

    truckMarker: null,
    truckUnlock: null,
    canTouchTruckMarker : true,
    isTouched:false,
    nearestTimeStay:0,
    isFullPack:false,
    showSkipRepairingTimeButton: false,

    init:function() // khởi tạo data , lấy cái thuộc tính về giao diện
    {
        this.possitionOxcart =[-300,180,1050];

        this.oxcartMarker = FWUtils.getChildByName(Game.gameScene.background, "markerNPCOxcart");
        this.oxcartMarker.setVisible(true);


        this.truckMarker = FWUtils.getChildByName(Game.gameScene.background, "markerNPCTruck");
        this.truckMarker.setVisible(true);

        //cc.log("namTest");
        //this.truckMarker.setVisible=  function() {cc.log(new Error().stack)};

        this.truckUnlock = FWUtils.getChildByName(this.truckMarker, "notifyTruckUnlock");
        this.truckUnlock.setVisible(false);


        this.nearestTimeStay = Game.getGameTimeInSeconds();
        // setData từ userData
        //this.data = {"1":2,"4":1566802607,"5":1576835078,"6":{"COIN":9999,"EXP":9999,"GOLD":9999},"8":[{"9":false,"10":"T8","11":10,"7":{ "COIN":999,"EXP":133,"GOLD":257},"12":{}},{"9":false,"10":"R13","11":10,"7":{"EXP":999,"GOLD":678},"12":{}},{"9":false,"10":"R15","11":10,"7":{"EXP":333,"GOLD":222},"12":{}}],"15":{}};
        if(!Game.isFriendGarden())
            cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
    },
    uninit:function()
    {
		// fix: skipTimeWidget not shown when coming back from friend's garden
		if (this.skipTimeWidget) {
			FWUI.hideWidget(this.skipTimeWidget, UIFX_POP);
			this.skipTimeWidget = null;
		}
		
        // Tắt update
        //if(this.truckMarker)
        //{
        //    this.truckMarker.uninit();
        //    this.truckMarker = null;
        //}
        // uninit và gán null giao diện
    },
    setData:function(data,isDataFriend)//web setData:function(data,isDataFriend =false)
    {
		if(isDataFriend === undefined)
			isDataFriend = false;
		
        // set data cho this.data


        this.data = data;

        var status = this.data[TRUCK_STATUS];
        if(status === TRUCK_STATUS_UNLOCK || status === TRUCK_STATUS_INACTIVE)
        {
            this.leavingTime = this.data[TRUCK_TIME_START];//this.leavingTime = Game.getGameTimeInSeconds();
            this.arrivalTime = this.data[TRUCK_TIME_FINISH];
        }
        else if(status === TRUCK_STATUS_ACTIVE)
        {
            this.arrivalTime = this.data[TRUCK_TIME_START];//this.arrivalTime = Game.getGameTimeInSeconds();
            this.leavingTime = this.data[TRUCK_TIME_FINISH];
        }

		if(!Game.loadResourcesOnDemand || this.resourcesLoaded)
		{
			var widget = FWPool.getNode(UI_TRUCK, false);
			if(FWUI.isWidgetShowing(widget))
			{
				if(this.canTouchTruckMarker)
				{
					this.show();
				}
			}
		}
    },
    update:function(dt)
    {

        if(Game.isFriendGarden()) return;

        if(this.buildingOxcart.spine)
        {
            if(this.isTouched)
            {
                if (this.buildingOxcart.getAnimation() !== "building_normal_touch")
                    this.buildingOxcart.setAnimation("building_normal_touch", true);

            }
            else
            {
                var status = this.data[TRUCK_STATUS];
                if(status === TRUCK_STATUS_UNLOCK)
                {

                    if (this.buildingOxcart.getAnimation() !== "building_oxcart_built")
                        this.buildingOxcart.setAnimation("building_oxcart_built", true);


                }
                else
                {

                    if (this.buildingOxcart.getAnimation() !== "building_normal")
                        this.buildingOxcart.setAnimation("building_normal", true);


                }
            }
        }

        var time = Game.getGameTimeInSeconds();
        if(this.data[TRUCK_STATUS] === TRUCK_STATUS_ACTIVE)
        {

            if(time >= this.nearestTimeStay +30)
            {
                if(this.truck.spine)
                {
                    var slotList= this.data[TRUCK_BAGS];
                    //this.packedCount
                    //for(var key in slotList)
                    //{
                    //    if(slotList[key][TRUCK_BAG_IS_PACKED]) this.packedCount++;
                    //}

                    if(this.packedCount === slotList.length)
                    {
                        if(this.truck.spine.animation !== "idle_sleeping_fill")
                            this.truck.setAnimation("idle_sleeping_fill", true);
                    }
                    else
                    {
                        if(this.truck.spine.animation !== "idle_sleeping_empty")
                            this.truck.setAnimation("idle_sleeping_empty", true);
                    }


                    //if(this.truck.getAnimation() !== "idle_sleeping_empty")
                    //    this.truck.setAnimation("idle_sleeping_empty", true);
                }
            }
        }
        //var time = Game.getGameTimeInSeconds();

        //var status = this.data[TRUCK_STATUS];
        //if(status === TRUCK_STATUS_ACTIVE && time > this.leavingTime)
        //    this.onDeliver();
        //else
        // if(status === TRUCK_STATUS_INACTIVE && time > this.arrivalTime && !FWUI.isShowing(UI_AIRSHIP_NEXTTIME)
        //    && !Game.isFriendGarden()) // friend: do not arrive, wait for logging in
        //{
        //    //this.onArrive();
        //    this.refreshTruck();
        //}
        if(this.data[TRUCK_STATUS] === TRUCK_STATUS_INACTIVE && time > this.arrivalTime && !FWUI.isShowing(UI_AIRSHIP_NEXTTIME)
            && !Game.isFriendGarden()) // friend: do not arrive, wait for logging in
        {
            this.onArrive();
            this.refreshTruck();
        }

        //this.refreshUIMain();
        // update liên tục kiểm tra status của Truck
    },
	
	resourcesLoaded: false,
    show:function()
    {
		if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			showLoadingProgress();
			cc.loader.load([UI_TRUCK,
							UI_TRUCK_ITEM,
							UI_TRUCK_PACK,
							UI_TRUCK_UPGRADE],
				function()
				{
					this.resourcesLoaded = true;
					this.show();
					showLoadingProgress(false);
				}.bind(this));				
			return;
		}
		
        cc.log("Truck::show");

        var status = this.data[TRUCK_STATUS];
        cc.log("Truck status" , status);
        //if(status !== TRUCK_STATUS_ACTIVE)
        //{
        //    //if(!Game.isFriendGarden())
        //    //{
        //    //    cc.log("Airship::show: error: attempt to show friend's airship which is not active");
        //    //    this.hide();
        //    //    var displayInfo = {title:"TXT_AS_FRIEND_DONE_TITLE", content:"TXT_AS_FRIEND_DONE_CONTENT", closeButton:true, avatar:NPC_AVATAR_PEOPEO};
        //    //    Game.showPopup(displayInfo);
        //    //}
        //    return false;
        //}


        if(gv.userData.getLevel() < g_MISCINFO.TRUCK_UNLOCK_LEVEL)
        {
            this.showUnlockInfo();
            return false;
        }

        if(status === TRUCK_STATUS_LOCK)
        {
            this.showRepairInfo();
            return false;
        }


        if(status === TRUCK_STATUS_UNLOCK)
        {
            this.showSkipRepairingTimeButton = !this.showSkipRepairingTimeButton;
            this.refreshUIMain();
            return false;
        }
        //
        //
        //if(status === AIRSHIP_STATUS_LIMIT)
        //{
        //    var displayInfo = {title:"TXT_AS_LIMIT_TITLE", content:"TXT_AS_LIMIT_CONTENT", closeButton:true, avatar:NPC_AVATAR_PEOPEO};
        //    Game.showPopup(displayInfo);
        //    return false;
        //}
        this.isTouched = true;
        Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "truck");

        if(status === TRUCK_STATUS_INACTIVE)
        {
            this.showNextInfo();
            return false;
        }

        if(!this.dataLevelTruck)
        {
            this.dataLevelTruck = [];
            //var indexLevel = 1;
            //for(var key in g_TRUCK.LEVELS)
            //{
            //    var item={};
            //    item.level = indexLevel;
            //    item.dataLevel = g_TRUCK.LEVELS[key];
            //    this.dataLevelTruck.push(item);
            //}

            this.dataLevelTruck = g_TRUCK.LEVELS;
        }

        this.canUpgrade =false;

        if(this.data[TRUCK_LEVEL] < this.dataLevelTruck.length )
        {
            if(this.data[TRUCK_DELIVERY_COUNT] >= this.dataLevelTruck[this.data[TRUCK_LEVEL]].DELIVERY_REQ)
            {
                this.canUpgrade = true;
            }
        }


        var slotList = this.data[TRUCK_BAGS];
        var requireData = this.data[TRUCK_DELIVERY_REWARD];

        if(!requireData) return;

        var rewardDelivery= [];
        for(var key in requireData)
        {
            var item ={};
            item.itemId = key;
            item.displayAmount = "x"+requireData[key];
            rewardDelivery.push(item);
        }


        this.packedCount = 0;

        var slotListData = [];
        for(var key in slotList)
        {
            var item = slotList[key];
            item.index = key;
            item.amount = gv.userStorages.getItemAmount(item[TRUCK_BAG_ITEM]);
            item.displayAmount = "/" + item[TRUCK_BAG_NUM];
            item.isEnough = (item[TRUCK_BAG_NUM] <= gv.userStorages.getItemAmount(item[TRUCK_BAG_ITEM]));
            if(item[TRUCK_BAG_IS_PACKED]) this.packedCount++;
            slotListData.push(key);
        }

        cc.log("Truck : packedCount",this.packedCount);
        this.canDelivery = this.packedCount >= slotListData.length;

        //for(var i=1;i<7;i++)
        //{
        //    slotList.push(i);
        //}
        var itemDef =
        {
            gfxItem:{ type:UITYPE_ITEM, field:TRUCK_BAG_ITEM,scale:0.6},
            requireAmount:{visible:"data[TRUCK_BAG_IS_PACKED] === false ", type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, color:cc.GREEN},//amount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, color:"data.isEnough ? cc.GREEN : cc.RED"},
            stockAmount:{visible:"data[TRUCK_BAG_IS_PACKED] === false ", type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED"},//amount:{visible:"data[AS_SLOT_IS_PACKED] === false && (data[AS_SLOT_IS_REQUEST] === true || Airship.isFriendAirship() === false)", type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT, color:"data.isEnough ? cc.GREEN : cc.RED"},
            //check:{visible:false},
            //avatarFrame:{visible:"data[AS_SLOT_IS_PACKED] === true && data[AS_SLOT_IS_REQUEST] === true && data[AS_SLOT_HELPER_ID]"},
            //avatar:{visible:"data[AS_SLOT_IS_PACKED] === true && data[AS_SLOT_IS_REQUEST] === true && data[AS_SLOT_HELPER_ID]", type:UITYPE_IMAGE, field:AS_SLOT_HELPER_AVATAR, size:64},
            touch:{onTouchEnded:this.showSlotInfo.bind(this)},
            imgPackageNotFull:{visible:"data[TRUCK_BAG_IS_PACKED] === false"},
            imgPackageFull:{visible:"data[TRUCK_BAG_IS_PACKED] === true"},
        };
        var rewardItemDef =
        {
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
            gfx:{type:UITYPE_ITEM, field:"itemId"},
            amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true},//amount:{type:UITYPE_TEXT, field:"displayAmount", shadow:SHADOW_DEFAULT},
        };
        var uiDef ={
            backButton:{onTouchEnded:this.hide.bind(this)},
            receiveText:{ type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_DIALOG, value:"TXT_AS_REWARD_ALL"},
            deliverText:{type:UITYPE_TEXT, value:"TXT_AS_DELIVER", style:TEXT_STYLE_TEXT_BUTTON},
            cancelText:{type:UITYPE_TEXT, value:"TXT_AS_CANCEL", style:TEXT_STYLE_TEXT_BUTTON},
            timeTruck:{type:UITYPE_TIME_BAR, startTime:this.data[TRUCK_TIME_START], endTime:this.data[TRUCK_TIME_FINISH], countdown:true,onFinished:this.onEndTruck.bind(this)},
            requireList:{type:UITYPE_2D_LIST, items:rewardDelivery, itemUI:UI_ITEM_NO_BG2, itemDef:rewardItemDef, itemSize:cc.size(90, 90), itemsAlign:"center", singleLine:true, itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75},
            itemList:{type:UITYPE_2D_LIST, items:slotList, itemUI:UI_TRUCK_ITEM, itemDef:itemDef, itemSize:cc.size(153, 185)},
            updateButton:{onTouchEnded:this.showUIUpgradeTruck.bind(this)},
            deliverButton:{visible:this.packedCount > 0,enabled:this.canDelivery ,onTouchEnded:this.onDeliver.bind(this)},
            cancelButton:{visible: this.packedCount <= 0, onTouchEnded:this.onCancel.bind(this)},
            notifyBg:{visible:this.canUpgrade},
			imgOxcartBg:{type:UITYPE_IMAGE, value:"common/images/hud_oxcart_bg.png", isLocalTexture:true, discard:true},
        };


        var widget = FWPool.getNode(UI_TRUCK, false);

        var npcCow = FWUI.getChildByName(widget, "npcCow");
        var npcOldMan = FWUI.getChildByName(widget, "npcOldMan");


        if (!this.npcCow || !this.npcCow.spine) {
            this.npcCow = new FWObject();
            ///////////
            this.npcCow.initWithSpine(SPINE_NPC_OXCART_PIG);
            this.npcCow.setAnimation("idle_cow", true);
            this.npcCow.setSkin("level_1");
            this.npcCow.setScale(-1,1);
            this.npcCow.setParent(npcCow);
            /////////
        }

        //if(!this.npcCow.spine)
        //{
        //    this.npcCow.initWithSpine(SPINE_NPC_OXCART_PIG);
        //}

        if (!this.npcOldMan || !this.npcOldMan.spine) {
            this.npcOldMan = new FWObject();
            ////////////
            this.npcOldMan.initWithSpine(SPINE_NPC_OXCART_PIG);
            this.npcOldMan.setAnimation("idle_oldman", true);
            this.npcOldMan.setSkin("level_1");
            this.npcOldMan.setScale(-1,1);
            this.npcOldMan.setParent(npcOldMan);
            //////////////
        }
        if(!this.npcOldMan.spine)
        {
            this.npcOldMan.initWithSpine(SPINE_NPC_OXCART_PIG);
        }

        //if (this.npcCow) {
        //    this.npcCow.initWithSpine(SPINE_NPC_OXCART_PIG);
        //    this.npcCow.setAnimation("idle_cow", true);
        //    this.npcCow.setSkin("level_1");
        //    this.npcCow.setScale(-1,1);
        //    this.npcCow.setParent(npcCow);
        //}
        //if (this.npcOldMan) {
        //    this.npcOldMan.initWithSpine(SPINE_NPC_OXCART_PIG);
        //    this.npcOldMan.setAnimation("idle_oldman", true);
        //    this.npcOldMan.setSkin("level_1");
        //    this.npcOldMan.setScale(-1,1);
        //    this.npcOldMan.setParent(npcOldMan);
        //}





        if(FWUI.isWidgetShowing(widget))
            FWUI.fillData(widget, null, uiDef);
        else
        {
            FWUtils.showDarkBg(null, Z_UI_AIRSHIP - 1, "darkBgTruck");
            FWUI.showWidgetWithData(widget, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
            widget.setLocalZOrder(Z_UI_AIRSHIP);
            AudioManager.effect (EFFECT_POPUP_SHOW);

            if(!this.hideFunc)
                this.hideFunc = function() {this.hide()}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc);
        }
    },
    checkAllSlotsPacked:function()
    {
        //cc.log("Truck::checkAllSlotsPacked");
        //this.packedCount = 0;
        //for(var i=0; i<this.slotList.length; i++)
        //{
        //    if(this.slotList[i][AS_SLOT_IS_PACKED] === true)
        //        this.packedCount++;
        //}
        //
        //var widget = FWPool.getNode(UI_AIRSHIP, false);
        //var deliverButton = FWUtils.getChildByName(widget, "deliverButton");
        //deliverButton.setEnabled(this.packedCount >= this.slotList.length);
    },

    showNextInfo:function()
    {
        cc.log("Truck::showNextInfo");
        // jira#4664
        // jira#4808: sorting is now serverside
        var slotList = this.data[TRUCK_BAGS];
        var itemList = {};
        for(var i=0; i<slotList.length; i++)
            itemList[slotList[i][TRUCK_BAG_ITEM]] = 1;
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
            npc:{type:UITYPE_IMAGE,value:NPC_AVATAR_FARMER},
            title:{type:UITYPE_TEXT, value:"TXT_TRUCK_NEXT_TITLE", style:TEXT_STYLE_TEXT_NORMAL_GREEN},//title:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_TITLE", shadow:SHADOW_DEFAULT},
            title2:{type:UITYPE_TEXT, value:"TXT_TRUCK_NEXT_CONTENT", style:TEXT_STYLE_TEXT_NORMAL_GREEN},//title2:{type:UITYPE_TEXT, value:"TXT_AS_NEXT_CONTENT", shadow:SHADOW_DEFAULT},
            skipTimePrice:{type:UITYPE_TEXT, value:"", style:TEXT_STYLE_TEXT_BUTTON},//skipTimePrice:{type:UITYPE_TEXT, value:"", shadow:SHADOW_DEFAULT},
            closeButton:{onTouchEnded:this.hideNextInfo.bind(this)},
            itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},//itemList:{type:UITYPE_2D_LIST, items:this.slotList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/menu_list_slot.png", singleLine:true, itemsAlign:"center"},
            nextPage:{visible:itemList.length > itemsPerPage},//nextPage:{visible:this.slotList.length > itemsPerPage},
            prevPage:{visible:itemList.length > itemsPerPage},//prevPage:{visible:this.slotList.length > itemsPerPage},
            timerMarker:{type:UITYPE_TIME_BAR, startTime:this.leavingTime, endTime:this.arrivalTime, countdown:true, onFinished:function() {Truck.hideNextInfo();Truck.onArrive();Truck.refreshTruck();}, onTick:this.updateSkipTimeDiamond.bind(this)},
            skipTimeButton:{onTouchEnded:this.skipTime.bind(this)},
        };

        // ui
        var widget = FWUI.showWithData(UI_AIRSHIP_NEXTTIME, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP, true);
        widget.setLocalZOrder(Z_UI_AIRSHIP);
        this.skipTimeLabel = FWUtils.getChildByName(widget, "skipTimePrice");

        if(!this.hideFunc6)
            this.hideFunc6 = function() {this.hideNextInfo()}.bind(this);
        Game.gameScene.registerBackKey(this.hideFunc6);
    },
    hideNextInfo:function()
    {
        cc.log("Truck::hideNextInfo");
        if(FWUI.isShowing(UI_AIRSHIP_NEXTTIME))
        {
            FWUI.hide(UI_AIRSHIP_NEXTTIME, UIFX_POP);
            Game.gameScene.unregisterBackKey(this.hideFunc6);
        }

        this.isTouched = false;
    },
    initUIMain:function()
    {
        if (!this.truck) {
            this.truck = new FWObject();
            this.truck.initWithSpine(SPINE_NPC_OXCART);
            this.truck.setParent(this.oxcartMarker, Z_AIRSHIP);//this.airship.setParent(Game.gameScene.background.base, Z_AIRSHIP);
            this.truck.setEventListener(null, this.onTruckTouched.bind(this));
            this.truck.setNotifyBlockedTouch(true);
            this.truck.setPosition(cc.p(180, 0));//this.airship.setPosition(this.airshipMarker.getPosition());
            this.truck.setScale(AIRSHIP_SCALE);
            this.truck.setSkin("level_1");
            this.truck.setAnimation("idle_sleeping_fill", true);
            this.truck.customBoundingBoxes = cc.rect(-100, 0, 200, 100);
            this.truck.setVisible(status === TRUCK_STATUS_ACTIVE);

            this.buildingOxcart = new FWObject();
            this.buildingOxcart.initWithSpine(SPINE_BUILDING_OXCART);
            this.buildingOxcart.setParent(this.truckMarker, Z_AIRSHIP + 1);//this.stone.setParent(Game.gameScene.background.base, Z_AIRSHIP_STONE);
            this.buildingOxcart.setEventListener(null, this.onTruckTouched.bind(this));
            this.buildingOxcart.setNotifyBlockedTouch(true);
            this.buildingOxcart.setPosition(cc.p(0, 0));//this.stone.setPosition(this.airshipMarker.getPosition());
            this.buildingOxcart.setScale(0.3);
            this.buildingOxcart.setSkin("default");
            this.buildingOxcart.setAnimation("building_normal", true);
            this.buildingOxcart.customBoundingBoxes = cc.rect(-60, -30, 100, 80);
            //this.buildingOxcart.setScale= function() {cc.log(new Error().stack)};
        }
    },

    refreshUIMain:function(){
        //cc.log("Truck::refreshUIMain");
        var isFriendGarden = Game.isFriendGarden();

        /// get status
        var status = this.data[AS_STATUS];

        if(!this.truck) {


            this.truck = new FWObject();
            this.truck.initWithSpine(SPINE_NPC_OXCART);
            this.truck.setParent(this.oxcartMarker, Z_AIRSHIP);//this.airship.setParent(Game.gameScene.background.base, Z_AIRSHIP);
            this.truck.setEventListener(null, this.onTruckTouched.bind(this));
            this.truck.setNotifyBlockedTouch(true);
            this.truck.setPosition(cc.p(180, 0));//this.airship.setPosition(this.airshipMarker.getPosition());
            this.truck.setScale(AIRSHIP_SCALE);
            this.truck.setSkin("level_1");
            this.truck.setAnimation("idle_sleeping_fill", true);
            this.truck.customBoundingBoxes = cc.rect(-100, 0, 200, 100);
            this.truck.setVisible(status === TRUCK_STATUS_ACTIVE);

            this.buildingOxcart = new FWObject();
            this.buildingOxcart.initWithSpine(SPINE_BUILDING_OXCART);
            this.buildingOxcart.setParent(this.truckMarker, Z_AIRSHIP + 1);//this.stone.setParent(Game.gameScene.background.base, Z_AIRSHIP_STONE);
            this.buildingOxcart.setEventListener(null, this.onTruckTouched.bind(this));
            this.buildingOxcart.setNotifyBlockedTouch(true);
            this.buildingOxcart.setPosition(cc.p(0, 0));//this.stone.setPosition(this.airshipMarker.getPosition());
            this.buildingOxcart.setScale(0.3);
            this.buildingOxcart.setSkin("default");
            this.buildingOxcart.setAnimation("building_normal", true);
            this.buildingOxcart.customBoundingBoxes = cc.rect(-60, -30, 100, 80);
            //this.buildingOxcart.setScale= function() {cc.log(new Error().stack)};
        }
        if (!this.truck.spine) {
            this.truck = null;
            this.refreshUIMain();
        }

        if(isFriendGarden)
        {
            this.truck.setAnimation("idle_normal_fill", true)
            if(gv.userData.userId === USER_ID_JACK)
            {
                this.truck.setVisible(true);
                this.truck.setSkin("level_4");
                this.buildingOxcart.setAnimation("building_normal", true);
            }
            else
            {
                if(status === TRUCK_STATUS_LOCK || status === TRUCK_STATUS_LOCK)
                {
                    this.truck.setVisible(false);
                    this.buildingOxcart.setAnimation("building_normal", true);
                }
                else if (status === TRUCK_STATUS_ACTIVE||status === TRUCK_STATUS_INACTIVE)
                {
                    this.truck.setVisible(true);
                }
            }


        }
        else {

            //cc.log("possitionX :",this.truck.getPositionX());
            if (this.truck) {
                if (this.truck.getSkin() !== this.getSkinByLevel(this.data[TRUCK_LEVEL])) {
                    this.truck.setSkin(this.getSkinByLevel(this.data[TRUCK_LEVEL]));
                }
            }

            if (status === TRUCK_STATUS_LOCK) {
                this.truck.setVisible(false);
                this.truckUnlock.setVisible(gv.userData.getLevel() >= g_MISCINFO.TRUCK_UNLOCK_LEVEL && !isFriendGarden);
                this.buildingOxcart.setAnimation("building_normal", true);
            }
            else if (status === TRUCK_STATUS_UNLOCK) {
                this.truck.setVisible(false);
                this.truckUnlock.setVisible(false);
                if (this.buildingOxcart.getAnimation() !== "building_oxcart_built")
                    this.buildingOxcart.setAnimation("building_oxcart_built", true);
            }
            else if (status === TRUCK_STATUS_ACTIVE) {
                this.truck.setVisible(true);
                this.truckUnlock.setVisible(false);
                var slotList = this.data[TRUCK_BAGS];
                this.packedCount = 0;


                for (var key in slotList) {
                    if (slotList[key][TRUCK_BAG_IS_PACKED]) this.packedCount++;
                }

                if (this.packedCount === slotList.length) {
                    if (this.truck.spine.animation !== "idle_normal_fill")
                        this.truck.setAnimation("idle_normal_fill", true);
                }
                else {
                    if (this.truck.spine.animation !== "idle_normal_empty")
                        this.truck.setAnimation("idle_normal_empty", true);
                }


                if (this.buildingOxcart.animation !== "building_normal") {
                    this.buildingOxcart.setAnimation("building_normal", true);
                }

            }
            else if (status === TRUCK_STATUS_INACTIVE) {
                this.truck.setVisible(false);
                this.truckUnlock.setVisible(false);
                //this.buildingOxcart.setAnimation("building_normal", true);
            }


            //skip time
            if (status !== TRUCK_STATUS_UNLOCK || isFriendGarden) {
                if (this.skipTimeWidget) {
                    FWUI.hideWidget(this.skipTimeWidget, UIFX_POP);
                    this.skipTimeWidget = null;
                }
                return;
            }

            var uiDef =
            {
                bg: {visible: this.showSkipRepairingTimeButton},
                bg2: {visible: this.showSkipRepairingTimeButton},
                button: {onTouchEnded: this.skipTime.bind(this), visible: this.showSkipRepairingTimeButton},
                timerMarker: {
                    type: UITYPE_TIME_BAR,
                    startTime: this.arrivalTime - g_MISCINFO.TRUCK_UNLOCK_TIME,
                    endTime: this.arrivalTime,
                    countdown: true,
                    onFinished: this.onFinishedRepairing.bind(this),
                    onTick: this.updateSkipTimeDiamond.bind(this)
                },
                price: {style: TEXT_STYLE_TEXT_BUTTON},//price:{shadow:SHADOW_DEFAULT},
            };
            if (!this.skipTimeWidget) {
                this.skipTimeWidget = FWUI.showWithData(UI_TRUCK_SKIPTIME, null, uiDef, this.truckMarker, UIFX_POP);//this.skipTimeWidget = FWUI.showWithData(UI_AIRSHIP_REPAIR_SKIPTIME, null, uiDef, Game.gameScene.background.base, UIFX_POP);
                this.skipTimeWidget.setLocalZOrder(Z_UI_AIRSHIP_REPAIR_SKIPTIME);
                this.skipTimeWidget.setPosition(cc.p(0, 0));
                this.skipTimeLabel = FWUtils.getChildByName(this.skipTimeWidget, "price");
            }
            else
				FWUI.fillData(this.skipTimeWidget, null, uiDef);
        }
    },
    skipTime:function(sender)
    {
        cc.log("Truck::skipTime");
        if(Game.consumeDiamond(this.skipTimeData.diamond, FWUtils.getWorldPosition(sender)) === false)
            return;

        cc.log("skiptime diamond", this.skipTimeData.diamond);
        this.hideNextInfo();
        AudioManager.effect (EFFECT_GOLD_PAYING);

        // fake
        var status = this.data[AS_STATUS];
        this.onArrive();

        // server
        if(status === TRUCK_STATUS_UNLOCK)
        {
            // skip repair time
            var pk = network.connector.client.getOutPacket(this.RequestTruckSkipTimeUnlock);
            pk.pack(this.skipTimeData.diamond);
            network.connector.client.sendPacket(pk);
        }
        else
        {
            // skip arrival time
            var pk = network.connector.client.getOutPacket(this.RequestTruckSkipTimeInactive);
            pk.pack(this.skipTimeData.diamond);
            network.connector.client.sendPacket(pk);
        }
    },
    onFinishedRepairing:function(sender)
    {
        cc.log("Truck::onFinishRepairing");
        // fake
        gv.userData.game[GAME_TRUCK][TRUCK_TIME_FINISH] = this.data[TRUCK_TIME_FINISH] = Game.getGameTimeInSeconds() + g_MISCINFO.TRUCK_LEAVE_DURATION_MAX;
        this.onArrive(sender);

        this.refreshTruck();
    },
    refreshTruck:function(sender)
    {
        cc.log("Truck::refreshTruck");


        var pk = network.connector.client.getOutPacket(this.RequestTruckGet);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    onArrive:function(sender)
    {

        cc.log("Truck::onArrive");

        this.data[AS_STATUS] = TRUCK_STATUS_ACTIVE;
        this.arrivalTime = Game.getGameTimeInSeconds();
        this.leavingTime = this.arrivalTime + g_MISCINFO.TRUCK_LEAVE_DURATION_MAX;

        this.refreshUIMain();

        this.truck.setVisible(true);
        //this.truck.setAnimation("idle_normal_fill", false);
        this.truck.setPosition(this.possitionOxcart[0],this.truck.getPositionY());
        this.truck.setAnimation("moving_empty_happy",true);
        this.canTouchTruckMarker = false;
        this.nearestTimeStay = Game.getGameTimeInSeconds();
        var stand = function(){//web
            //cc.log(this.LOGTAG+ " position NPC PigBank :" + this.animNPCPigBank.getPositionX());

            //this.animNPCPigBank.setAnimation(PIGBANK_ANIM_WALK, true);
            //this.performPigBankWalk();
            this.truck.setAnimation("idle_normal_empty",true);
        }.bind(this);
        var endMove = function(){//web
            this.canTouchTruckMarker = true;
            this.nearestTimeStay = Game.getGameTimeInSeconds();
        }.bind(this);

        this.truck.node.runAction(
            cc.sequence(
                cc.delayTime(0),
                cc.show(),
                cc.moveTo(300 / displacementTruck,cc.p(this.possitionOxcart[1],this.truck.getPositionY())),
                cc.callFunc(stand),
                cc.callFunc(endMove)
            )
        );


        //this.truck.spine.addAnimation(0, "airship_idle", true);

        AudioManager.effect (EFFECT_OWL_RETURN);
    },
    updateSkipTimeDiamond:function(sender)
    {
        cc.log("Truck::updateSkipTimeDiamond");
        // skip time diamond
        this.skipTimeData = Game.getSkipTimeDiamond("TRUCK", this.leavingTime, this.arrivalTime - this.leavingTime);
        this.skipTimeLabel.setString(this.skipTimeData.diamond);
        this.skipTimeLabel.setColor(gv.userData.getCoin() >= this.skipTimeData.diamond ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND);
    },

    onDeliver:function(sender)
    {
        cc.log("Truck::onDeliver");
        if(this.data[TRUCK_STATUS] !== TRUCK_STATUS_ACTIVE)
            return;
        this.hide();

        var requireData = this.data[TRUCK_DELIVERY_REWARD];

        if(!requireData) return;

        var rewardDelivery= [];
        for(var key in requireData)
        {
            var item ={};
            item.itemId = key;
            item.amount = requireData[key];
            rewardDelivery.push(item);
        }

        Game.addItems(rewardDelivery, FWUtils.getWorldPosition(this.truckMarker));


        this.truck.setAnimation("moving_fill",true);
        this.canTouchTruckMarker =false;
        this.nearestTimeStay = Game.getGameTimeInSeconds();
        var endMove = function() {//web
            this.canTouchTruckMarker = true;
            this.nearestTimeStay = Game.getGameTimeInSeconds();
        }.bind(this);
        this.truck.node.runAction(
            cc.sequence(
                cc.delayTime(0),
                cc.show(),
                cc.moveTo(550 / displacementTruck,cc.p(this.possitionOxcart[2],this.truck.getPositionY())),
                cc.callFunc(endMove)
            )
        );


        // server
        var pk = network.connector.client.getOutPacket(this.RequestTruckDelivery);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    endMove:function()
    {
        this.canTouchTruckMarker = true;
        this.nearestTimeStay = Game.getGameTimeInSeconds();
    },
    onCancel:function(sender)
    {
        cc.log("Truck::onCancel");
        var displayInfo = {content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_FARMER}; // feedback: remove title //var displayInfo = {title:"TXT_AS_CANCEL", content:"TXT_AS_CANCEL_CONTENT", closeButton:true, okText:"TXT_OK", avatar:NPC_AVATAR_PEOPEO};
        Game.showPopup(displayInfo, this.onCancelConfirmed.bind(this));
    },
    onCancelConfirmed:function(sender)
    {
        cc.log("Truck::onCancelConfirmed");
        FWUtils.disableAllTouches();
        this.hide();
        this.canTouchTruckMarker = false;
        this.nearestTimeStay = Game.getGameTimeInSeconds();
        var endMove = function(){//web
            this.canTouchTruckMarker = true;
            this.nearestTimeStay = Game.getGameTimeInSeconds();
        }.bind(this);
        this.truck.setAnimation("moving_empty_sad",true);
        this.truck.node.runAction(
            cc.sequence(
                cc.delayTime(0),
                cc.show(),
                cc.moveTo(550 / displacementTruck,cc.p(this.possitionOxcart[2],this.truck.getPositionY())),
                cc.callFunc(endMove)
            )
        );

        //this.show();
        // server
        var pk = network.connector.client.getOutPacket(this.RequestTruckCancel);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    onEndTruck:function(sender)
    {
        cc.log("Truck::onEndTruck");
        //FWUtils.disableAllTouches();
        this.hide();
        this.canTouchTruckMarker = false;
        this.nearestTimeStay = Game.getGameTimeInSeconds();
        var endMove = function(){//web
            this.canTouchTruckMarker = true;
            this.nearestTimeStay = Game.getGameTimeInSeconds();
        }.bind(this);
        this.truck.setAnimation("moving_empty_sad",true);
        this.truck.node.runAction(
            cc.sequence(
                cc.delayTime(0),
                cc.show(),
                cc.moveTo(550 / displacementTruck,cc.p(this.possitionOxcart[2],this.truck.getPositionY())),
                cc.callFunc(endMove)
            )
        );

        //this.show();
        // server
        var pk = network.connector.client.getOutPacket(this.RequestTruckGet);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },

    onTruckTouched:function(){

        if(!this.canTouchTruckMarker) return;

        cc.log("Truck::onTruckTouched");

        if(!Tutorial.acceptInput("truck"))
            return;
        Tutorial.onGameEvent(EVT_TOUCH_END, "truck");

        if(!Game.isFriendGarden())
        {
            Truck.show();
        }
        else
        {
            //var friendData = {};
            //friendData[NB_SLOT_USER_ID] = gv.userData.userId;
            //Airship.showFriendAirship(friendData);
        }
    },
    hide:function()
    {
        cc.log("Truck::hide");
        if(FWUI.isShowing(UI_TRUCK))
        {
            FWUtils.hideDarkBg(null, "darkBgTruck");
            FWUI.hide(UI_TRUCK, UIFX_POP);
            AudioManager.effect (EFFECT_POPUP_CLOSE);
            Game.gameScene.unregisterBackKey(this.hideFunc);
            Game.gameScene.unregisterBackKey(this.hideFunc3);
        }

        this.isTouched = false;
        //this.setData(gv.userData.airship);
        //this.friendId = null;

        this.nearestTimeStay = Game.getGameTimeInSeconds();
        this.refreshUIMain();

    },
    showSlotInfo:function(sender)
    {

        cc.log("Truck::showSlotInfo");

        this.currentSlot = FWUtils.getParentByName(sender, "item");
        var data = this.currentSlot.uiBaseData;
        if(data[TRUCK_BAG_IS_PACKED]) return;
        var dataReward = data[TRUCK_PACK_REWARD];
        cc.log(dataReward);
        if(!dataReward) return;

        var rewardItems= [];
        for(var key in dataReward)
        {
            var item ={};
            item.itemId = key;
            item.displayAmount = "x"+dataReward[key];
            rewardItems.push(item);
        }


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
            title:{type:UITYPE_TEXT, value:"TXT_TRUCK_REWARD", style:TEXT_STYLE_TEXT_DIALOG},//title:{type:UITYPE_TEXT, value:"TXT_AS_REWARD"},
            itemList:{type:UITYPE_2D_LIST, items:rewardItems, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(85, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75,singleLine:true},
            //askFriendButton:{visible:this.isFriendAirship() === false && slotData[AS_SLOT_IS_REQUEST] === false, enabled:this.data[AS_NUM_REQUEST] < g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP, onTouchEnded:this.onAskFriend.bind(this)},
            packButton:{onTouchEnded:this.onPack.bind(this)},
            tapToClose:{onTouchEnded:this.hideSlotInfo.bind(this)},
            //askFriendText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:cc.formatStr(FWLocalization.text("TXT_AS_ASK_FRIEND"), this.data[AS_NUM_REQUEST], g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP)},//askFriendText:{type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:cc.formatStr(FWLocalization.text("TXT_AS_ASK_FRIEND"), this.data[AS_NUM_REQUEST], g_MISCINFO.AS_REQUEST_LIMIT_PER_AIRSHIP)},
            packText:{type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_BUTTON, value:"TXT_TRUCK_PACK"},//packText:{type:UITYPE_TEXT, shadow:SHADOW_DEFAULT, value:"TXT_AS_PACK"},
        };
        // show
        var widget = FWUI.showWithData(UI_TRUCK_PACK, null, uiDef, FWUtils.getCurrentScene(), UIFX_POP);
        //FWUtils.showDarkBg(null, Z_UI_AIRSHIP_PACK - 1, "darkBgTruckItem");
        widget.setLocalZOrder(Z_UI_AIRSHIP_PACK);
        widget.setContentSize(cc.size(cc.winSize.width * 2, cc.winSize.height * 2));

        if(!this.hideFunc2)
            this.hideFunc2 = function() {this.hideSlotInfo()}.bind(this);
        Game.gameScene.registerBackKey(this.hideFunc2);

        // pos
        //var pos = sender.getTouchEndPosition();
        var pos = FWUtils.getWorldPosition(sender);
        cc.log("posSender",pos.x,pos.y);
        pos.x += 120;
        pos.y += 65;

        var h = cc.winSize.height / 5;
        if(pos.y < h)
            pos.y = h;
        else if(pos.y > cc.winSize.height - h)
            pos.y = cc.winSize.height - h;
        widget.setPosition(pos);
    },
    onPack:function(sender)
    {
        cc.log("Truck::onPack");

        var slotData = this.currentSlot.uiBaseData;
        if(!slotData.isEnough)
        {
            Game.showQuickBuy([{itemId:slotData[TRUCK_BAG_ITEM], amount:slotData[TRUCK_BAG_NUM]}], this.onOk2Pack.bind(this), NPC_AVATAR_FARMER);
            return;
        }

        if(!this.boughtItemToDeliver)
        {
            cc.log("Truck : show warning");
            if(g_PLANT[slotData[TRUCK_BAG_ITEM]] !== undefined && slotData[TRUCK_BAG_NUM] === gv.userStorages.getItemAmount(slotData[TRUCK_BAG_ITEM]))
            {
                cc.log("Truck::showEmptyStock");
                Game.showEmtpyStockWarning([{itemId:slotData[TRUCK_BAG_ITEM]}], this.onPack2.bind(this));
                return;
            }
        }
        this.onPack2(sender);
    },

    onPack2:function(sender)
    {
        cc.log("Truck::onPack2");
        FWUtils.disableAllTouches();
        this.hideSlotInfo();
        var slotData = this.currentSlot.uiBaseData;

        // server
        var pk;
        //if(this.friendId)
        //{
        //    pk = network.connector.client.getOutPacket(this.RequestAirshipFriendPack);
        //    pk.pack(this.friendId, slotData.index);
        //}
        //else
        //{
            pk = network.connector.client.getOutPacket(this.RequestTruckPack);
            pk.pack(slotData.index);
        //}
        network.connector.client.sendPacket(pk);
    },
    onPack3:function()
    {
        cc.log("Truck::onPack3");
        // fake
        var pos = FWUtils.getWorldPosition(this.currentSlot);
        var slotData = this.currentSlot.uiBaseData;
        slotData[TRUCK_BAG_IS_PACKED] = true;

        var dataReward = slotData[TRUCK_PACK_REWARD];
        var rewardItems= [];
        for(var key in dataReward)
        {
            var item ={};
            item.itemId = key;
            item.amount = dataReward[key];
            rewardItems.push(item);
        }

        // subtract items
        Game.consumeItems([{itemId:slotData[TRUCK_BAG_ITEM], amount:slotData[TRUCK_BAG_NUM]}], cc.p(pos.x, pos.y + 80));
        // receive rewards
        Game.addItems(rewardItems, pos, 1);

        FWUtils.getChildByName(this.currentSlot, "imgPackageFull").setVisible(true);
        FWUtils.getChildByName(this.currentSlot, "imgPackageNotFull").setVisible(false);



        AudioManager.effect(EFFECT_GOLD_PAYING); // jira#5592
    },
    onOk2Pack:function(sender)
    {
        cc.log("Truck::onOk2Pack");
        // refresh display
        var test = this.currentSlot;
        //cc.log(JSON.stringify(this.currentSlot)); // cyclic object value
        var slotData = this.currentSlot.uiBaseData;
        var amount = FWUtils.getChildByName(this.currentSlot, "stockAmount");//var amount = FWUtils.getChildByName(this.currentSlot, "amount");
        amount.color = cc.GREEN;
        amount.setString(gv.userStorages.getItemAmount(slotData[TRUCK_BAG_ITEM]));//amount.setString(gv.userStorages.getItemAmount(slotData[AS_SLOT_ITEM]) + "/" + slotData[AS_SLOT_NUM]);
        slotData.isEnough = true;
        this.boughtItemToDeliver = true;

        // feedback: auto pack after buying item
        this.onPack(sender);
    },
    hideSlotInfo:function(sender)
    {
        cc.log("Truck::hideSlotInfo");
        //FWUtils.hideDarkBg(null, "darkBgTruckItem");
        FWUI.hide(UI_TRUCK_PACK, UIFX_POP);
        Game.gameScene.unregisterBackKey(this.hideFunc2);

    },
    showUIUpgradeTruck:function(sender)
    {
        if(!this.dataLevelTruck)
        {
            return;
        }
        var isTruckMaxLevel = false;
        var levelTruck = this.data[TRUCK_LEVEL];
        var levelTruckNext = levelTruck +1;
        if(levelTruckNext > this.dataLevelTruck.length)
        {
            levelTruckNext = levelTruck;
            isTruckMaxLevel = true;
            //FWUtils.showWarningText(FWLocalization.text("TXT_TRUCK_MAX_LEVEL"), FWUtils.getWorldPosition(sender));
            //return;
        }


        var truckDataLevel = this.dataLevelTruck[levelTruck - 1];
        var truckDataNextLevel = this.dataLevelTruck[levelTruckNext - 1];


        var textSumDelivery = "";
        var numDelivery = this.data[TRUCK_DELIVERY_COUNT];
        var numDeliveryLevel = truckDataNextLevel.DELIVERY_REQ;

        var ratioDelivery = Math.ceil(numDelivery*100/numDeliveryLevel);

        if(ratioDelivery>100) ratioDelivery = 100;
        if(ratioDelivery<0) ratioDelivery = 0;

        textSumDelivery = cc.formatStr(FWLocalization.text("TXT_TRUCK_UPGRADE_REQUIRE_CONTENT"), numDelivery, numDeliveryLevel );

        var widget = FWPool.getNode(UI_TRUCK_UPGRADE, false);

        var currentLevelStars = gv.userMachine.getMachineStarSpriteNames(levelTruck-1);
        var nextLevelStars = gv.userMachine.getMachineStarSpriteNames(levelTruckNext-1);


        var currentReduceTime = cc.formatStr("-%d%", truckDataLevel.ARRIVE_REDUCE_TIME);
        var currentGoldOrder = cc.formatStr("+%d%", truckDataLevel.GOLD_BONUS);
        var currentExpOrder = cc.formatStr("+%d%", truckDataLevel.EXP_BONUS);

        var nextReduceTime = cc.formatStr("-%d%", truckDataNextLevel.ARRIVE_REDUCE_TIME);
        var nextGoldOrder = cc.formatStr("+%d%", truckDataNextLevel.GOLD_BONUS);
        var nextExpOrder = cc.formatStr("+%d%", truckDataNextLevel.EXP_BONUS);

        var priceGold = truckDataNextLevel.GOLD_UPGRADE;
        var priceCoin = FWUtils.getCoinForGold(priceGold);

        var priceGoldText = FWUtils.formatNumberWithCommas(priceGold, ".");
        var priceCoinText = FWUtils.formatNumberWithCommas(priceCoin, ".");

        this.priceCoin = priceCoin;
        this.priceGold = priceGold;

        var uiDefine ={
            textTitle: { type: UITYPE_TEXT, shadow: SHADOW_TITLE_BIG, value: cc.formatStr( FWLocalization.text("TXT_TRUCK_UPGRADE_TITLE"),  levelTruckNext) },
            star11: { type: UITYPE_IMAGE, id: currentLevelStars[0], scale: MACHINE_SCALE_STARS },
            star12: { type: UITYPE_IMAGE, id: currentLevelStars[1], scale: MACHINE_SCALE_STARS },
            star13: { type: UITYPE_IMAGE, id: currentLevelStars[2], scale: MACHINE_SCALE_STARS },
            star21: { type: UITYPE_IMAGE, id: nextLevelStars[0], scale: MACHINE_SCALE_STARS },
            star22: { type: UITYPE_IMAGE, id: nextLevelStars[1], scale: MACHINE_SCALE_STARS },
            star23: { type: UITYPE_IMAGE, id: nextLevelStars[2], scale: MACHINE_SCALE_STARS },

            textTimeReduce: { type: UITYPE_TEXT, value: currentReduceTime },
            textNextTimeReduce: {
                type: UITYPE_TEXT,
                value: nextReduceTime,
                visible: truckDataNextLevel.ARRIVE_REDUCE_TIME > 0 && !isTruckMaxLevel,
                color: cc.color.GREEN,
                shadow: SHADOW_DEFAULT_THIN
            },
            textExpOrder: { type: UITYPE_TEXT, value: currentExpOrder },
            textNextExpOrder: {
                type: UITYPE_TEXT,
                value: nextExpOrder,
                visible: truckDataNextLevel.EXP_BONUS > 0 && !isTruckMaxLevel,
                color: cc.color.GREEN,
                shadow: SHADOW_DEFAULT_THIN,
            },
            textGoldOrder: { type: UITYPE_TEXT, value: currentGoldOrder },
            textNextGoldOrder: {
                type: UITYPE_TEXT,
                value: nextGoldOrder,
                visible: truckDataNextLevel.GOLD_BONUS > 0 && !isTruckMaxLevel,
                color: cc.color.GREEN,
                shadow: SHADOW_DEFAULT_THIN
            },

            textPriceGold: { type: UITYPE_TEXT, value: priceGoldText, shadow: SHADOW_DEFAULT_THIN, color:priceGold <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND },
            textPriceCoin: { type: UITYPE_TEXT, value: priceCoinText, shadow: SHADOW_DEFAULT_THIN, color:priceCoin <= gv.userData.getCoin() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND },
            buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            buttonUpgradeGold: { onTouchEnded: this.onButtonUpgradeGoldTouched.bind(this) , visible: !isTruckMaxLevel },
            buttonUpgradeCoin: { onTouchEnded: this.onButtonUpgradeCoinTouched.bind(this) , visible: !isTruckMaxLevel },
            textWorkingTimeValue: { type: UITYPE_TEXT, value: textSumDelivery, shadow: SHADOW_DEFAULT_THIN },
            barWorkingTime: { type: UITYPE_PROGRESS_BAR, scale9:true, value: ratioDelivery },
            textWorkingTimeTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_TRUCK_UPGRADE_REQUIRE") },
            textDesc: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_TRUCK_UPGRADE_CONTENT") },
            barTimeReduce:{ onTouchBegan: function(sender) {this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},
            iconTime:{ onTouchBegan: function(sender) {this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},
            barExpOrder:{ onTouchBegan: function(sender) {this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},
            iconExpOrder:{ onTouchBegan: function(sender) {this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},
            barGoldOrder:{ onTouchBegan: function(sender) {this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},
            iconGoldOrder:{ onTouchBegan: function(sender) {this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) {this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},
            timeHintText: { type: UITYPE_TEXT, value:"TXT_TRUCK_UPGRADE_HINT_TIME" },
            expOrderHintText: { type: UITYPE_TEXT, value:"TXT_TRUCK_UPGRADE_HINT_EXP_ORDER" },
            goldOrderHintText: { type: UITYPE_TEXT, value:"TXT_TRUCK_UPGRADE_HINT_GOLD_ORDER" },
        };


        this.buttonUpgradeGold = FWUI.getChildByName(widget, "buttonUpgradeGold");
        this.textPriceGold = FWUI.getChildByName(widget, "textPriceGold");
        this.iconGold = FWUI.getChildByName(widget, "iconGold");
        //jira#7281 FWUtils.setTextAutoExpand(priceGoldText, this.buttonUpgradeGold, this.textPriceGold, this.iconGold);

        this.buttonUpgradeCoin = FWUI.getChildByName(widget, "buttonUpgradeCoin");
        this.textPriceCoin = FWUI.getChildByName(widget, "textPriceCoin");
        this.iconCoin = FWUI.getChildByName(widget, "iconCoin");
        //jira#7281 FWUtils.setTextAutoExpand(priceCoinText, this.buttonUpgradeCoin, this.textPriceCoin, this.iconCoin);
		
		//jira#7281
		var func = function() {

			var buttonGap = 100;
			var centerX = cc.rectGetMidX(FWUI.getChildByName(widget, "panel").getBoundingBox());
			var maxWidth = Math.max(this.buttonUpgradeGold.width, this.buttonUpgradeCoin.width);

			//jira#7281
			//FWUtils.setTextAutoExpand(priceGoldText, this.buttonUpgradeGold, this.textPriceGold, this.iconGold, maxWidth);
			//FWUtils.setTextAutoExpand(priceCoinText, this.buttonUpgradeCoin, this.textPriceCoin, this.iconCoin, maxWidth);

			this.buttonUpgradeGold.x = centerX - maxWidth * 0.5 - buttonGap * 0.5;
			this.buttonUpgradeCoin.x = centerX + maxWidth * 0.5 + buttonGap * 0.5;
		}.bind(this);
		if(cc.sys.isNative)
			func();
		else
			cc.director.getScheduler().scheduleCallbackForTarget(this, func, 0, 0, 0, false);

        var machineAnimLeft = FWUI.getChildByName(widget, "machineAnimLeft");
        var machineAnimRight = FWUI.getChildByName(widget, "machineAnimRight");

        if (!this.machineSpineLeft) {
            this.machineSpineLeft = new FWObject();
        }
        if (!this.machineSpineRight) {
            this.machineSpineRight = new FWObject();
        }

        if (this.machineSpineLeft) {
            this.machineSpineLeft.initWithSpine(SPINE_NPC_OXCART);
            this.machineSpineLeft.setAnimation("idle_normal_fill", true);
            this.machineSpineLeft.setSkin(this.getSkinByLevel(levelTruck));
            this.machineSpineLeft.setScale(0.22);
            this.machineSpineLeft.setParent(machineAnimLeft);
        }
        if (this.machineSpineRight) {
            this.machineSpineRight.initWithSpine(SPINE_NPC_OXCART);
            this.machineSpineRight.setAnimation("idle_normal_fill", true);
            this.machineSpineRight.setSkin(this.getSkinByLevel(levelTruckNext));
            this.machineSpineRight.setScale(0.22);
            this.machineSpineRight.setParent(machineAnimRight);
        }

        if (!this.backLight) {
            var lightContainer = FWUI.getChildByName(widget, "lightContainer");
            this.backLight = new FWObject();
            this.backLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
            this.backLight.setAnimation("effect_light_icon", true);
            this.backLight.setScale(1.1);
            this.backLight.setParent(lightContainer);
            this.backLight.setPosition(cc.p(0, 0));
        }
        FWUI.unfillData(widget);
        FWUI.fillData(widget, null, uiDefine);

        if (!FWUI.isShowing(UI_MACHINE_UPGRADE)) {

            //FWUtils.showDarkBg(null, Z_UI_COMMON - 1);
            widget.setLocalZOrder(Z_UI_COMMON);

            //FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);

            AudioManager.effect (EFFECT_POPUP_SHOW);

            if(!this.hideFunc3)
                this.hideFunc3 = function() {this.onButtonCloseTouched()}.bind(this);
            Game.gameScene.registerBackKey(this.hideFunc3);
        }
    },
    showTransformEffect:function()
    {
        var spine = new FWObject();
        spine.initWithSpine(SPINE_EFFECT_UNLOCK);
        spine.setAnimation(MACHINE_ANIM_EFFECT_UNLOCK, false, function () {
            spine.uninit();
        }.bind(this));
        spine.setPosition(cc.VEC2());
        spine.setParent(this.truckMarker, MACHINE_ZORDER_EFFECT);
    },
    getSkinByLevel:function(level)
    {
        if(level <= 4)
        {
            return "level_1";
        }
        else if(level === 10)
        {
            return "level_4";
        }
        var skin = Math.floor((level-2)/3)+1;
        return "level_"+skin;
    },
    showHint:function(name, show)//web showHint:function(name, show = true)
    {
		if(show === undefined)
			show = true;
		
        var widget = FWPool.getNode(UI_TRUCK_UPGRADE, false);
        var hint = FWUtils.getChildByName(widget, name);

        if(show)
        {
            hint.setVisible(true);
            hint.stopAllActions();
            hint.setScale(0);
            hint.runAction(cc.scaleTo(0.15, 1));
        }
        else
        {
            hint.stopAllActions();
            hint.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(function() {hint.setVisible(false);})));
        }
    },

    hideHint:function(name)
    {
        this.showHint(name, false);
    },
    upgradeTruck: function (sender, price, useGold) {//web upgradeTruck: function (sender, price, useGold = true) {
		
		if(useGold === undefined)
			useGold = true;

        if (!this.canUpgrade) {
            FWUtils.showWarningText(FWLocalization.text("TXT_TRUCK_NOT_ENOUGH_DELIVERY"), FWUtils.getWorldPosition(sender));
        }
        else {

            if (useGold) {
                // jira#5456
                if (Game.consumeGold(price, FWUtils.getWorldPosition(sender))) {
                    //if (gv.userData.isEnoughGold(price)) {
                    //gv.userMachine.requestUpgradeMachine(this.machineId);
                    //this.hide();
                    this.onButtonCloseTouched();
                    this.hide();
                    var pk = network.connector.client.getOutPacket(this.RequestTruckUpgarde);
                    pk.pack(0);
                    network.connector.client.sendPacket(pk);
                }
                //else {
                //    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
                //}
            }
            else {
                // jira#5456
                if (Game.consumeDiamond(price, FWUtils.getWorldPosition(sender))) {
                    this.onButtonCloseTouched();
                    this.hide();
                    var pk = network.connector.client.getOutPacket(this.RequestTruckUpgarde);
                    pk.pack(price);
                    network.connector.client.sendPacket(pk);
                    //if (gv.userData.isEnoughCoin(price)) {
                    //gv.userMachine.requestUpgradeMachine(this.machineId, price);
                    //this.hide();
                }
                //else {
                //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                //}
            }


        }
    },
    onButtonUpgradeGoldTouched: function (sender) {
        this.upgradeTruck(sender, this.priceGold);
    },
    onButtonUpgradeCoinTouched: function (sender) {
        this.upgradeTruck(sender, this.priceCoin, false);
    },
    onButtonCloseTouched: function (sender) {
        var widget = FWPool.getNode(UI_TRUCK_UPGRADE, false);
        FWUtils.hideDarkBg();
        FWUI.hideWidget(widget, UIFX_POP_SMOOTH);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc3);
    },
    showUnlockInfo:function()
    {
        cc.log("Truck::showUnlockInfo");
        gv.miniPopup.showTruckPresent ();
        this.isTouched = false;

        //if(!this.hideFunc4)
        //    this.hideFunc4 = function() {this.hideUnlockInfo()}.bind(this);
        //Game.gameScene.registerBackKey(this.hideFunc4);
    },

    hideUnlockInfo:function()
    {
        cc.log("Truck::hideUnlockInfo");
        this.isTouched = false;
        FWUI.hide(UI_AIRSHIP_UNLOCK, UIFX_POP);
        Game.gameScene.unregisterBackKey(this.hideFunc4);

    },

///////////////////////////////////////////////////////////////////////////////////////
// repair /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

    showRepairInfo:function()
    {
        cc.log("Truck::showRepairInfo");
        // items
        this.repairGold = 0;
        this.repairItemList = [];
        for(var key in g_MISCINFO.TRUCK_UNLOCK_REQUIRE_ITEMS)
        {
            var missing = Game.getMissingAmountAndPrice(key, g_MISCINFO.TRUCK_UNLOCK_REQUIRE_ITEMS[key]);
            if(key === ID_GOLD)
                this.repairGold = g_MISCINFO.TRUCK_UNLOCK_REQUIRE_ITEMS[key];
            else
                this.repairItemList.push({itemId:key, amount:g_MISCINFO.TRUCK_UNLOCK_REQUIRE_ITEMS[key], stockAmount:gv.userStorages.getItemAmount(key), displayAmount:"/" + g_MISCINFO.TRUCK_UNLOCK_REQUIRE_ITEMS[key], enough:missing.missingAmount <= 0});
        }

        // item def
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
            title:{type:UITYPE_TEXT, value:"TXT_TRUCK_REPAIR_TITLE", style:TEXT_STYLE_TITLE_2},//title:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE", shadow:SHADOW_DEFAULT},
            title2:{type:UITYPE_TEXT, value:"TXT_TRUCK_REPAIR_TITLE2", style:TEXT_STYLE_TITLE_1},//title2:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_TITLE2", shadow:SHADOW_DEFAULT},
            content:{type:UITYPE_TEXT, value:"TXT_TRUCK_REPAIR_CONTENT", style:TEXT_STYLE_TEXT_HINT},//content:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_CONTENT", shadow:SHADOW_DEFAULT},
            repairButton:{onTouchEnded:this.repairTruck.bind(this)},
            repairText:{type:UITYPE_TEXT, value:this.repairGold, style:TEXT_STYLE_TEXT_BUTTON, color:this.repairGold <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND},//repairText:{type:UITYPE_TEXT, value:this.repairGold, shadow:SHADOW_DEFAULT},//repairText:{type:UITYPE_TEXT, value:"TXT_AS_REPAIR_NOW", shadow:SHADOW_DEFAULT},
            closeButton:{onTouchEnded:this.hideRepairInfo.bind(this)},
            itemList:{type:UITYPE_2D_LIST, items:this.repairItemList, itemUI:UI_ORDER_REQUEST_ITEM, itemDef:requireItemDef, itemSize:cc.size(100, 100), itemBackground:"#hud/hud_barn_list_slot.png", itemsAlign:"center", singleLine:true},
            npc2:{ visible:false,type:UITYPE_SPINE, value:SPINE_AIRSHIP, anim:"airship_stone_idle", scale:AIRSHIP_SCALE},
            npc3:{type:UITYPE_SPINE, value:SPINE_NPC_OXCART, anim:"idle_normal_empty",skin:"level_1", scale:0.3},
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

        if(!this.hideFunc5)
            this.hideFunc5 = function() {this.hideRepairInfo()}.bind(this);
        Game.gameScene.registerBackKey(this.hideFunc5);
    },
    buyMissingRepairItem:function(sender)
    {
        cc.log("Truck::buyMissingRepairItem");
        if(sender.uiData.enough)
            return;
        Game.showQuickBuy([{itemId:sender.uiData.itemId, amount:sender.uiData.amount}], function() {Truck.showRepairInfo();});
    },
    repairTruck:function(sender)
    {
        cc.log("Truck::repairAirship");
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
                Game.showQuickBuy(this.repairItemList, function() {Truck.showRepairInfo();});
                return;
            }
        }

        // fake
        this.data[TRUCK_STATUS] = TRUCK_STATUS_UNLOCK;
        this.leavingTime = Game.getGameTimeInSeconds();
        this.arrivalTime = this.leavingTime + g_MISCINFO.TRUCK_UNLOCK_TIME;

        this.hideRepairInfo();
        this.refreshUIMain();

        //server
        var pk = network.connector.client.getOutPacket(this.RequestTruckUnlock);
        pk.pack();
        network.connector.client.sendPacket(pk);
    },
    hideRepairInfo:function()
    {
        cc.log("Truck::hideRepairInfo");
        FWUI.hide(UI_AIRSHIP_REPAIR, UIFX_POP);
        delete this.repairItemList;
        AudioManager.effect (EFFECT_POPUP_CLOSE);
        Game.gameScene.unregisterBackKey(this.hideFunc5);

        this.isTouched = false;
        // jira#5132
        FWUtils.hideDarkBg();
    },
    replaceFakedTimeWithServerTime:function(object)
    {
        cc.log("Truck::replaceFakedTimeWithServerTime");
        // replace faked time
        var truck = object[KEY_TRUCK];
        if(truck && truck[TRUCK_TIME_FINISH])
        {
            if(Truck.arrivalTime > Truck.leavingTime)
            {
                Truck.leavingTime = truck[TRUCK_TIME_START];
                Truck.arrivalTime = truck[TRUCK_TIME_FINISH];
            }
            else
            {
                Truck.leavingTime = truck[TRUCK_TIME_FINISH];
                Truck.arrivalTime = truck[TRUCK_TIME_START];
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

    RequestTruckUnlock:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_UNLOCK);},
        pack:function()
        {
            cc.log("Airship::RequestTruckUnlock");
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),

    ResponseTruckUnlock:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Airship::ResponseAirshipUnlock");
            var object = PacketHelper.parseObject(this);

            //Game.updateUserDataFromServer(object);
            //Airship.leavingTime = Game.getGameTimeInSeconds();
            //Airship.arrivalTime = Airship.data[AS_TIME_FINISH];
            //Airship.refreshUIMain();

            if(this.getError() !== 0)
                cc.log("Truck.ResponseTruckUnlock: error=" + this.getError());
        }
    }),

    RequestTruckPack:fr.OutPacket.extend
    ({

        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_PACK);},
        pack:function(slot)
        {
            cc.log("Truck::RequestTruckPack");
            addPacketHeader(this);
            PacketHelper.putByte(this, KEY_SLOT_ID, slot);
            
            addPacketFooter(this);
        },
    }),

    ResponseTruckPack:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Airship::ResponseTruckPack");
            FWUtils.disableAllTouches(false);

            var object = PacketHelper.parseObject(this);
            if(this.getError() !== 0)
            {
                cc.log("Truck.ResponseTruckPack: error=" + this.getError());
                Game.updateUserDataFromServer(object);
                // ResponseAirshipFriendPack // jira#5609
                //if(object[KEY_FRIEND_AIRSHIP])
                //    Airship.setData(object[KEY_FRIEND_AIRSHIP]);

                Truck.show();
                FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_DONE_CONTENT"), FWUtils.getWorldPosition(Truck.currentSlot), cc.WHITE);
            }
            else
            {
                Truck.onPack3();
                Game.updateUserDataFromServer(object);
                Achievement.onAction(g_ACTIONS.ACTION_TRUCK_PACK.VALUE, null, 1);
                //Truck.replaceFakedTimeWithServerTime(object);

                // ResponseAirshipFriendPack
                //if(object[KEY_FRIEND_AIRSHIP])
                //{
                //    Truck.setData(object[KEY_FRIEND_AIRSHIP]);
                //    Achievement.onAction(ACTION_AIRSHIP_FRIEND_PACK, null, 1);
                //}
                //else
                //    Achievement.onAction(ACTION_AIRSHIP_PACK, null, 1);

            }
        }
    }),

    RequestTruckDelivery:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_DELIVERY);},
        pack:function()
        {
            cc.log("Truck::RequestTruckDelivery");
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),

    ResponseTruckDelivery:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckDelivery");
            var object = PacketHelper.parseObject(this);
            Game.updateUserDataFromServer(object);
            if(this.getError() !== 0)
                cc.log("Truck.ResponseTruckDelivery: error=" + this.getError());
            else
            {
                Achievement.onAction(g_ACTIONS.ACTION_TRUCK_DELIVERY.VALUE, null, 1);
                //Airship.replaceFakedTimeWithServerTime(object);
                //Achievement.onAction(ACTION_AIRSHIP_DELIVERY, null, 1);
            }
            if(FWUI.isShowing(UI_TRUCK, true))
                Truck.show();
        }
    }),

    RequestTruckCancel:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_CANCEL);},
        pack:function()
        {
            cc.log("Truck::RequestTruckCancel");
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),

    ResponseTruckCancel:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckCancel");
            FWUtils.disableAllTouches(false);

            var object = PacketHelper.parseObject(this);
            if(this.getError() !== 0)
            {
                cc.log("Truck.ResponseTruckCancel: error=" + this.getError());
                Game.updateUserDataFromServer(object);
                Truck.show();

                var widget = FWPool.getNode(UI_TRUCK, false);
                var cancelButton = FWUtils.getChildByName(widget, "cancelButton");
                FWUtils.showWarningText(FWLocalization.text("TXT_AS_FRIEND_DONE_CONTENT"), FWUtils.getWorldPosition(cancelButton), cc.WHITE);
            }
            else
            {
                //Airship.onCancelConfirmed2();
                Game.updateUserDataFromServer(object);
                //Airship.replaceFakedTimeWithServerTime(object);
            }
        }
    }),


    RequestTruckUpgarde:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_UPGRADE);},
        pack:function(price)
        {
            cc.log("Truck::RequestTruckUpgarde");
            addPacketHeader(this);

            PacketHelper.putInt(this, KEY_PRICE_COIN, price);
            PacketHelper.putClientCoin(this);

            
            addPacketFooter(this);
        },
    }),
    ResponseTruckUpgarde:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckUpgarde");
            var object = PacketHelper.parseObject(this);
            Game.updateUserDataFromServer(object);
            Truck.showTransformEffect();
            Truck.refreshUIMain();
            cc.log(JSON.stringify(object[KEY_TRUCK]));
        }
    }),


    RequestTruckSkipTimeInactive:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_SKIP_TIME_INACTIVE);},
        pack:function(price)
        {
            cc.log("Truck::RequestAirshipSkipTimeInactive");
            addPacketHeader(this);

            PacketHelper.putInt(this, KEY_PRICE_COIN, price);
            PacketHelper.putClientCoin(this);

            
            addPacketFooter(this);
        },
    }),

    ResponseTruckSkipTime:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckSkipTime");
            var object = PacketHelper.parseObject(this);

            Game.updateUserDataFromServer(object);
            Truck.arrivalTime = Game.getGameTimeInSeconds();
            Truck.leavingTime = Truck.data[TRUCK_TIME_FINISH];
            //Truck.refreshUIMain();

            if(this.getError() !== 0)
                cc.log("Truck.ResponseTruckSkipTime: error=" + this.getError());
        }
    }),
    RequestTruckUnlock:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_UNLOCK);},
        pack:function()
        {
            cc.log("Truck::RequestTruckUnlock");
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),
    ResponseTruckUnlock:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckUnlock");
            var object = PacketHelper.parseObject(this);

            Game.updateUserDataFromServer(object);
            Truck.leavingTime = Game.getGameTimeInSeconds();
            Truck.arrivalTime = Truck.data[TRUCK_TIME_FINISH];
            Truck.refreshUIMain();

            if(this.getError() !== 0)
                cc.log("Truck.ResponseTruckUnlock: error=" + this.getError());
        }
    }),
    RequestTruckSkipTimeUnlock:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_SKIP_TIME_UNLOCK);},
        pack:function(price)
        {
            cc.log("Truck::RequestTruckSkipTimeUnlock");
            addPacketHeader(this);

            PacketHelper.putInt(this, KEY_PRICE_COIN, price);
            PacketHelper.putClientCoin(this);

            
            addPacketFooter(this);
        },
    }),

    RequestTruckGet:fr.OutPacket.extend
    ({
        ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.TRUCK_GET);},
        pack:function()
        {
            cc.log("Truck::RequestTruckGet");
            addPacketHeader(this);
            
            addPacketFooter(this);
        },
    }),
    ResponseTruckCommon:fr.InPacket.extend
    ({
        ctor:function() {this._super();},
        readData:function()
        {
            cc.log("Truck::ResponseTruckCommon");
            var object = PacketHelper.parseObject(this);
            Game.updateUserDataFromServer(object);
            if(this.getError() !== 0)
                cc.log("Truck.ResponseTruckCommon: error=" + this.getError());
            else
                Truck.replaceFakedTimeWithServerTime(object);
            if(FWUI.isShowing(UI_TRUCK, true))
                Truck.show();
        }
    }),



}
network.packetMap[gv.CMD.TRUCK_UNLOCK] = Truck.ResponseTruckUnlock;
network.packetMap[gv.CMD.TRUCK_PACK] = Truck.ResponseTruckPack;
network.packetMap[gv.CMD.TRUCK_DELIVERY] = Truck.ResponseTruckDelivery;
network.packetMap[gv.CMD.TRUCK_CANCEL] = Truck.ResponseTruckCancel;
network.packetMap[gv.CMD.TRUCK_SKIP_TIME_INACTIVE] = Truck.ResponseTruckSkipTime;
network.packetMap[gv.CMD.TRUCK_SKIP_TIME_UNLOCK] = Truck.ResponseTruckSkipTime;
network.packetMap[gv.CMD.TRUCK_UPGRADE] = Truck.ResponseTruckUpgarde;
network.packetMap[gv.CMD.TRUCK_GET] = Truck.ResponseTruckCommon;