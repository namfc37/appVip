var MachinePopupUpgrade = cc.Node.extend({
    LOGTAG: "[MachinePopupUpgrade]",

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function (floorId, machineId) {

        this.floorId = floorId;
        this.machineId = machineId;

        var machineDefine = g_MACHINE[machineId];
        var machineData = gv.userData.game[GAME_FLOORS][floorId][FLOOR_MACHINE];

        var machineLevel = machineData[MACHINE_LEVEL];
        var machineLevelNext = machineLevel + 1;

        var machineDataLevel = machineDefine.LEVELS[machineLevel - 1];
        var machineDataNextLevel = machineDefine.LEVELS[machineLevelNext - 1];
		
		// fix: exception
		if(!machineDataLevel)
		{
			cc.log("MachinePopupUpgrade::show: error: floorId=" + floorId + " machineId=" + machineId + " machineLevel=" + machineLevel);
			return;
		}
			

        this.widget = FWPool.getNode(UI_MACHINE_UPGRADE, false);
        if (this.widget) {

            if (machineDefine && machineData) {
                if (machineLevelNext <= machineDefine.LEVELS.length) {

                    var currentLevelStars = gv.userMachine.getMachineStarSpriteNames(machineLevel - 1);
                    var nextLevelStars = gv.userMachine.getMachineStarSpriteNames(machineLevelNext - 1);

                    var currentReduceTime = cc.formatStr("-%d%", machineDataLevel.REDUCE_TIME);
                    var currentGoldOrder = cc.formatStr("+%d%", machineDataLevel.GOLD_ORDER);
                    var currentExpOrder = cc.formatStr("+%d%", machineDataLevel.EXP_ORDER);

                    var nextReduceTime = cc.formatStr("-%d%", machineDataNextLevel.REDUCE_TIME);
                    var nextGoldOrder = cc.formatStr("+%d%", machineDataNextLevel.GOLD_ORDER);
                    var nextExpOrder = cc.formatStr("+%d%", machineDataNextLevel.EXP_ORDER);

                    var workingTime = Math.floor(machineData[MACHINE_WORKING_TIME]);
                    var workingTimeNeed = Math.floor(machineDataNextLevel.ACTIVE_TIME);

                    var workingTimeHour = parseInt(workingTime / SECONDS_IN_HOUR);
                    var workingTimeNeedHour = parseInt(workingTimeNeed / SECONDS_IN_HOUR);

                    var workingTimeText = cc.formatStr("%d/%d %s", workingTimeHour, workingTimeNeedHour, FWLocalization.text("TXT_HOUR"));

                    var skipTimeDefines = _.sortBy(g_DIAMON_SKIP_TIME.MACHINE, function (value) {
                        return value.TIME_RANGE;
                    });

                    this.remainTime = workingTimeNeed - workingTime;

                    var timeIndex = skipTimeDefines.length - 1;
                    while (timeIndex >= 0 && this.remainTime < skipTimeDefines[timeIndex].TIME_RANGE)
                        timeIndex--;

                    if (timeIndex < 0)
                        timeIndex = 0;

                    var skipTimeDefine = skipTimeDefines[timeIndex];
                    this.priceFillTime = Math.ceil((this.remainTime - skipTimeDefine.TIME_RANGE) * skipTimeDefine.RATIO / 100 + skipTimeDefine.DIAMOND_DEFAULT);

                    var priceFillTimeText = FWUtils.formatNumberWithCommas(this.priceFillTime);

                    var priceGold = machineDataNextLevel.GOLD_UNLOCK;
                    var priceCoin = FWUtils.getCoinForGold(priceGold);

                    var priceGoldText = FWUtils.formatNumberWithCommas(priceGold, ".");
                    var priceCoinText = FWUtils.formatNumberWithCommas(priceCoin, ".");

                    this.priceUpgradeGold = priceGold;
                    this.priceUpgradeCoin = priceCoin;

                    var uiDefine =  {
                        textTitle: { type: UITYPE_TEXT, shadow: SHADOW_TITLE_BIG, value: cc.formatStr("%s  %s  Lv. %d", FWLocalization.text("TXT_UPGRADE").toUpperCase(), Game.getItemName(machineId), machineLevel) },
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
                            visible: machineDataNextLevel.REDUCE_TIME > 0,
                            color: cc.color.GREEN,
                            shadow: SHADOW_DEFAULT_THIN
                        },
                        textExpOrder: { type: UITYPE_TEXT, value: currentExpOrder },
                        textNextExpOrder: {
                            type: UITYPE_TEXT,
                            value: nextExpOrder,
                            visible: machineDataNextLevel.EXP_ORDER > 0,
                            color: cc.color.GREEN,
                            shadow: SHADOW_DEFAULT_THIN
                        },
                        textGoldOrder: { type: UITYPE_TEXT, value: currentGoldOrder },
                        textNextGoldOrder: {
                            type: UITYPE_TEXT,
                            value: nextGoldOrder,
                            visible: machineDataNextLevel.GOLD_ORDER > 0,
                            color: cc.color.GREEN,
                            shadow: SHADOW_DEFAULT_THIN
                        },
                        barWorkingTime: { type: UITYPE_PROGRESS_BAR, scale9:true, value: workingTime, maxValue: workingTimeNeed },
                        textWorkingTimeTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_WORKING_TIME") + ":" },
                        textWorkingTimeValue: { type: UITYPE_TEXT, value: workingTimeText, shadow: SHADOW_DEFAULT_THIN },
                        panelFillTime: { visible: this.remainTime > 0 },
                        textFillTimeTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_FILL_TIME"), color: cc.color(127, 127, 127, 255) },
                        textFillTimePrice: { type: UITYPE_TEXT, value: priceFillTimeText, shadow: SHADOW_GREY_THIN },
                        textPriceGold: { type: UITYPE_TEXT, value: priceGoldText, shadow: SHADOW_DEFAULT_THIN, color:priceGold <= gv.userData.getGold() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND },
                        textPriceCoin: { type: UITYPE_TEXT, value: priceCoinText, shadow: SHADOW_DEFAULT_THIN, color:priceCoin <= gv.userData.getCoin() ? cc.WHITE : COLOR_NOT_ENOUGH_DIAMOND },
                        textDesc: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_UPGRADE_DESC") },
                        buttonUpgradeGold: { onTouchEnded: this.onButtonUpgradeGoldTouched.bind(this) },
                        buttonUpgradeCoin: { onTouchEnded: this.onButtonUpgradeCoinTouched.bind(this) },
                        buttonFillTime: { onTouchEnded: this.onButtonFillTimeTouched.bind(this) },
                        buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
                        popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) },

			            barTimeReduce:{ onTouchBegan: function(sender) { this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},//web
			            iconTime:{ onTouchBegan: function(sender) { this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},//web
			            barExpOrder:{ onTouchBegan: function(sender) { this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},//web
			            iconExpOrder:{ onTouchBegan: function(sender) { this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},//web
			            barGoldOrder:{ onTouchBegan: function(sender) { this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},//web
			            iconGoldOrder:{ onTouchBegan: function(sender) { this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},//web
                        timeHint: { visible: false },
                        expOrderHint: { visible: false },
                        goldOrderHint: { visible: false },
                        timeHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_TIME" },
                        expOrderHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_EXP_ORDER" },
                        goldOrderHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_GOLD_ORDER" },
                    };

                    this.buttonFillTime = FWUI.getChildByName(this.widget, "buttonFillTime");
                    this.textFillTimePrice = FWUI.getChildByName(this.widget, "textFillTimePrice");
                    this.iconFillTime = FWUI.getChildByName(this.widget, "iconFillTime");
                    FWUtils.setTextAutoExpand(priceFillTimeText, this.buttonFillTime, this.textFillTimePrice, this.iconFillTime);

                    this.buttonUpgradeGold = FWUI.getChildByName(this.widget, "buttonUpgradeGold");
                    this.textPriceGold = FWUI.getChildByName(this.widget, "textPriceGold");
                    this.iconGold = FWUI.getChildByName(this.widget, "iconGold");
                    // jira#7278 FWUtils.setTextAutoExpand(priceGoldText, this.buttonUpgradeGold, this.textPriceGold, this.iconGold);

                    this.buttonUpgradeCoin = FWUI.getChildByName(this.widget, "buttonUpgradeCoin");
                    this.textPriceCoin = FWUI.getChildByName(this.widget, "textPriceCoin");
                    this.iconCoin = FWUI.getChildByName(this.widget, "iconCoin");
                    // jira#7278 FWUtils.setTextAutoExpand(priceCoinText, this.buttonUpgradeCoin, this.textPriceCoin, this.iconCoin);

					// jira#7278
					var func = function() {
						var buttonGap = 100;
						var centerX = cc.rectGetMidX(FWUI.getChildByName(this.widget, "panel").getBoundingBox());
						var maxWidth = Math.max(this.buttonUpgradeGold.width, this.buttonUpgradeCoin.width);

						FWUtils.setTextAutoExpand(priceGoldText, this.buttonUpgradeGold, this.textPriceGold, this.iconGold, maxWidth);
						FWUtils.setTextAutoExpand(priceCoinText, this.buttonUpgradeCoin, this.textPriceCoin, this.iconCoin, maxWidth);

						this.buttonUpgradeGold.x = centerX - maxWidth * 0.5 - buttonGap * 0.5;
						this.buttonUpgradeCoin.x = centerX + maxWidth * 0.5 + buttonGap * 0.5;
					}.bind(this);
					if(cc.sys.isNative)
						func();
					else
						cc.director.getScheduler().scheduleCallbackForTarget(this, func, 0, 0, 0, false);

                    var machineAnimLeft = FWUI.getChildByName(this.widget, "machineAnimLeft");
                    var machineAnimRight = FWUI.getChildByName(this.widget, "machineAnimRight");

                    if (!this.machineSpineLeft) {
                        this.machineSpineLeft = new FWObject();
                    }

                    var machineSkinLevel = gv.userMachine.getSkinLevel(machineLevel);
                    var machineSkinLevelNext = gv.userMachine.getSkinLevel(machineLevelNext);

                    if (this.machineSpineLeft) {
                        this.machineSpineLeft.initWithSpine(Game.getMachineSpineByDefine(this.machineId));
                        this.machineSpineLeft.setAnimation(MACHINE_ANIM_WORKING, true);
                        this.machineSpineLeft.setSkin(cc.formatStr(SPINE_MACHINES_SKIN, machineSkinLevel));
                        this.machineSpineLeft.setScale(MACHINE_ANIM_SCALES[machineId] * MACHINE_SCALE_POPUP);
                        this.machineSpineLeft.setParent(machineAnimLeft);
                    }

                    if (!this.machineSpineRight) {
                        this.machineSpineRight = new FWObject();
                    }

                    if (this.machineSpineRight) {
                        this.machineSpineRight.initWithSpine(Game.getMachineSpineByDefine(this.machineId));
                        this.machineSpineRight.setAnimation(MACHINE_ANIM_WORKING, true);
                        this.machineSpineRight.setSkin(cc.formatStr(SPINE_MACHINES_SKIN, machineSkinLevelNext));
                        this.machineSpineRight.setScale(MACHINE_ANIM_SCALES[machineId] * MACHINE_SCALE_POPUP);
                        this.machineSpineRight.setParent(machineAnimRight);
                    }

                    if (!this.backLight) {
                        var lightContainer = FWUI.getChildByName(this.widget, "lightContainer");
                        this.backLight = new FWObject();
                        this.backLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                        this.backLight.setAnimation("effect_light_icon", true);
                        this.backLight.setScale(1.1);
                        this.backLight.setParent(lightContainer);
                        this.backLight.setPosition(cc.p(0, 0));
                    }

                    FWUI.unfillData(this.widget);
                    FWUI.fillData(this.widget, null, uiDefine);

                    if (!FWUI.isShowing(UI_MACHINE_UPGRADE)) {

						//FWUtils.showDarkBg(null, Z_UI_COMMON - 1);
						this.widget.setLocalZOrder(Z_UI_COMMON);

                        //FWUI.setWidgetCascadeOpacity(this.widget, true);
                        FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);
                
                        AudioManager.effect (EFFECT_POPUP_SHOW);
						
						if(!this.hideFunc)
							this.hideFunc = function() {this.hide()}.bind(this);
						Game.gameScene.registerBackKey(this.hideFunc);
                    }
                }
            }
        }
    },

    hide: function () {
        //FWUtils.hideDarkBg();
        FWUI.hideWidget(this.widget, UIFX_POP_SMOOTH);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    fillTime: function (machineId, price, sender) {

        var machineDefine = g_MACHINE[this.machineId];
        var machine = gv.userMachine.getMachineById(this.machineId);

        if (machineDefine && machine) {

            if (this.remainTime > 0) {
				// jira#5456
				if(Game.consumeDiamond(price, FWUtils.getWorldPosition(sender)))
                //if (gv.userData.isEnoughCoin(price)) {
                    gv.userMachine.requestBuyMachineWorkingTime(this.machineId, price);
                //}
                //else {
                //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                //}
            }
        }
    },

    upgrade: function (sender, machineId, price, useGold) {//web upgrade: function (sender, machineId, price, useGold = true) {
		
		if(useGold === undefined)
			useGold = true;

        var machineDefine = g_MACHINE[this.machineId];
        var machine = gv.userMachine.getMachineById(this.machineId);

        if (machineDefine && machine) {

            if (this.remainTime > 0) {
                FWUtils.showWarningText(FWLocalization.text("TXT_MACHINE_NOT_ENOUGH_WORKING_TIME"), FWUtils.getWorldPosition(sender));
            }
            else {
                if (useGold) {
					// jira#5456
					if(Game.consumeGold(price, FWUtils.getWorldPosition(sender))) {
                    //if (gv.userData.isEnoughGold(price)) {
                        gv.userMachine.requestUpgradeMachine(this.machineId);
                        this.hide();
                    }
                    //else {
                    //    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
                    //}
                }
                else {
					// jira#5456
					if(Game.consumeDiamond(price, FWUtils.getWorldPosition(sender))) {
                    //if (gv.userData.isEnoughCoin(price)) {
                        gv.userMachine.requestUpgradeMachine(this.machineId, price);
                        this.hide();
                    }
                    //else {
                    //    Game.showPopup0("TXT_NOT_ENOUGH_DIAMOND_TITLE", "TXT_NOT_ENOUGH_DIAMOND_CONTENT", null, function () { Game.openShop(ID_COIN); }, true, "TXT_BUY_DIAMOND");
                    //}
                }
            }
        }
    },

    onButtonUpgradeGoldTouched: function (sender) {
        this.upgrade(sender, this.machineId, this.priceUpgradeGold);
    },

    onButtonUpgradeCoinTouched: function (sender) {
        this.upgrade(sender, this.machineId, this.priceUpgradeCoin, false);
    },

    onButtonFillTimeTouched: function (sender) {
        this.fillTime(this.machineId, this.priceFillTime, sender);
    },

    onButtonCloseTouched: function (sender) {
        this.hide();
    },

	showHint:function(name, show)//web showHint:function(name, show = true)
	{
		if(show === undefined)
			show = true;
		
		var hint = FWUtils.getChildByName(this.widget, name);
		
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
});