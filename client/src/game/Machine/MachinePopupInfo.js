var MachinePopupInfo = cc.Node.extend({
    LOGTAG: "[MachinePopupInfo]",

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
        var machineLevelIndex = Math.max(machineLevel - 1, 0);

        var machineLevelData = machineDefine.LEVELS[machineLevelIndex];
        var machineNextLevelData = machineDefine.LEVELS[machineLevelIndex + 1];

        var workingTime = machineData[MACHINE_WORKING_TIME];
        var workingTimeNeed = (machineNextLevelData.ACTIVE_TIME > 0) ? machineNextLevelData.ACTIVE_TIME : machineLevelData.ACTIVE_TIME;

        var workingTimeHour = Math.round(workingTime / SECONDS_IN_HOUR);
        var workingTimeHourNeed = Math.floor(workingTimeNeed / SECONDS_IN_HOUR);

        var durability = machineDefine.DURABILITY_INIT + machineLevelIndex * machineDefine.DURABILITY_ADD;
        this.repairPrice = (durability - machineData[MACHINE_DURABILITY]) * machineLevelData.GOLD_MAINTAIN;

        var textRepairPriceColor = gv.userData.isEnoughGold(this.repairPrice) ? cc.color.WHITE : COLOR_NOT_ENOUGH_DIAMOND;
        var starSprites = gv.userMachine.getMachineStarSpriteNames(machineLevelIndex);

        var uiDefine = {
            textTitle: { type: UITYPE_TEXT, value: cc.formatStr("%s Lv.%d", Game.getItemName(machineId), machineLevel), style: TEXT_STYLE_TITLE_1 },
            star1: { type: UITYPE_IMAGE, id: starSprites[0], scale: MACHINE_SCALE_STARS },
            star2: { type: UITYPE_IMAGE, id: starSprites[1], scale: MACHINE_SCALE_STARS },
            star3: { type: UITYPE_IMAGE, id: starSprites[2], scale: MACHINE_SCALE_STARS },
            textTimeReduce: { type: UITYPE_TEXT, value: cc.formatStr("-%d%", machineLevelData.REDUCE_TIME), style: TEXT_STYLE_TEXT_NORMAL },
            textExpOrder: { type: UITYPE_TEXT, value: cc.formatStr("+%d%", machineLevelData.EXP_ORDER), style: TEXT_STYLE_TEXT_NORMAL },
            textGoldOrder: { type: UITYPE_TEXT, value: cc.formatStr("+%d%", machineLevelData.GOLD_ORDER), style: TEXT_STYLE_TEXT_NORMAL },
            textDurabilityTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_DURABILITY") + ":", style: TEXT_STYLE_TEXT_NORMAL },
            textDurabilityValue: { type: UITYPE_TEXT, value: cc.formatStr("%d/%d", machineData[MACHINE_DURABILITY], durability), style: TEXT_STYLE_TEXT_NORMAL },
            textWorkingTimeTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_WORKING_TIME") + ":", style: TEXT_STYLE_TEXT_NORMAL },
            textWorkingTimeValue: { type: UITYPE_TEXT, value: cc.formatStr("%d/%d %s", workingTimeHour, workingTimeHourNeed, FWLocalization.text("TXT_HOUR")), style: TEXT_STYLE_TEXT_NORMAL },
            barTimeReduce: { scale9:true, onTouchBegan: function(sender) { this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},//web
            iconTimeReduce: { onTouchBegan: function(sender) { this.showHint ("timeHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("timeHint");}.bind(this), forceTouchEnd: true},//web
            barTimeReduceCover: { scale9:true },
            barExpOrder: { scale9:true, onTouchBegan: function(sender) { this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},//web
            iconExpOrder: { onTouchBegan: function(sender) { this.showHint ("expOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("expOrderHint");}.bind(this), forceTouchEnd: true},//web
            barExpOrderCover: { scale9:true },
            barGoldOrder: { scale9:true, onTouchBegan: function(sender) { this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},//web
            iconGoldOrder: { onTouchBegan: function(sender) { this.showHint ("goldOrderHint");}.bind(this), onTouchEnded: function(sender) { this.hideHint ("goldOrderHint");}.bind(this), forceTouchEnd: true},//web
            barGoldOrderCover: { scale9:true },
            barDurability: { scale9:true },
            barDurabilityValue: { type: UITYPE_PROGRESS_BAR, scale9:true, value: machineData[MACHINE_DURABILITY], maxValue: durability },
            barWorkingTime: { scale9:true },
            barWorkingTimeValue: { type: UITYPE_PROGRESS_BAR, scale9:true, value: workingTime, maxValue: workingTimeNeed },
            buttonLibraryText: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_COLLECTION"), style: TEXT_STYLE_TEXT_NORMAL },
            buttonLibrary: { onTouchEnded: this.onButtonLibraryTouched.bind(this) },
            buttonRepair: { onTouchEnded: this.onButtonRepairTouched.bind(this) },
            buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            // popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            panelRepair: { visible: this.repairPrice > 0 },
            panelRepairLeft: { visible: this.repairPrice > 0 },
            textRepairPrice: { type: UITYPE_TEXT, value: FWUtils.formatNumberWithCommas(this.repairPrice), style: TEXT_STYLE_TEXT_NORMAL, color: textRepairPriceColor },
            
            timeHint: { visible: false },
            expOrderHint: { visible: false },
            goldOrderHint: { visible: false },
            timeHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_TIME" },
            expOrderHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_EXP_ORDER" },
            goldOrderHintText: { type: UITYPE_TEXT, value:"TXT_MACHINE_UNGRADE_HINT_GOLD_ORDER" },
        };

        this.widget = FWPool.getNode(UI_MACHINE_INFO, false);
        if (this.widget) {

            this.buttonLibrary = FWUI.getChildByName(this.widget, "buttonLibrary");
            this.buttonLibraryText = FWUI.getChildByName(this.buttonLibrary, "buttonLibraryText");
            FWUtils.setTextAutoExpand(FWLocalization.text("TXT_MACHINE_COLLECTION"), this.buttonLibrary, this.buttonLibraryText);

            if (!this.machineAnim) {
                this.machineContainer = FWUI.getChildByName(this.widget, "machineContainer");
                this.machineAnim = this.machineAnim || new FWObject(this);
            }

            if (this.machineAnim) {
                this.machineAnim.initWithSpine(Game.getMachineSpineByDefine(machineId));
                this.machineAnim.setAnimation(MACHINE_ANIM_WORKING, true);
                this.machineAnim.setSkin(cc.formatStr(SPINE_MACHINES_SKIN, gv.userMachine.getSkinLevel(machineLevel)));
                this.machineAnim.setScale(MACHINE_ANIM_SCALES[machineId] * MACHINE_SCALE_POPUP);
                this.machineAnim.setParent(this.machineContainer);
            }
        }

        FWUI.unfillData(this.widget);
        FWUI.fillData(this.widget, null, uiDefine);

        if (!FWUI.isShowing(UI_MACHINE_INFO)) {
            FWUtils.showDarkBg(null, Z_UI_COMMON - 1);
			this.widget.setLocalZOrder(Z_UI_COMMON);

            //FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);
            
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }
    },

    hide: function () {
        FWUtils.hideDarkBg();
        FWUI.hideWidget(this.widget, UIFX_POP_SMOOTH);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    onButtonLibraryTouched: function (sender)
    {
		this.hide();
		gv.utilPanel.show (UTIL_LIBRARY, UTIL_LIBRARY_MACHINE);
    },

    onButtonRepairTouched: function (sender) {
		// jira#5456
		if(this.repairPrice > 0 && Game.consumeGold(this.repairPrice, FWUtils.getWorldPosition(sender)))
        //if (this.repairPrice > 0 && gv.userData.isEnoughGold(this.repairPrice)) {
            gv.userMachine.requestRepairMachine(this.machineId);
        //}
        //else {
        //    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
        //}
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