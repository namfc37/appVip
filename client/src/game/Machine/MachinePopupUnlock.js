var MachinePopupUnlock = cc.Node.extend({
    LOGTAG: "[MachinePopupUnlock]",

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
		
		// jira#5925
		this.price = machineDefine.GOLD_START;
		if(machineId === "MA0" && Tutorial.isRunning())
			this.price = 0;

        var uiDefine = {
            textTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_UNLOCK_TITLE").toUpperCase(), style: TEXT_STYLE_TITLE_1 },
            textUnlockDesc: { type: UITYPE_TEXT, value: cc.formatStr(FWLocalization.text("TXT_MACHINE_UNLOCK_NAME"), Game.getItemName(machineId)), style: TEXT_STYLE_TEXT_NORMAL },
            textPrice: { type: UITYPE_TEXT, value: this.price > 0 ? FWUtils.formatNumberWithCommas(this.price) : "TXT_FREE", style: TEXT_STYLE_TEXT_NORMAL },
            buttonUnlock: { onTouchEnded: this.onButtonUnlockTouched.bind(this), enabled:true },
            buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) }
        };

        this.widget = FWPool.getNode(UI_MACHINE_UNLOCK, false);
        if (this.widget) {

            this.buttonUnlock = FWUI.getChildByName(this.widget, "buttonUnlock");
            this.buttonUnlockText = FWUI.getChildByName(this.buttonUnlock, "textPrice");
            this.buttonUnlockIcon = FWUI.getChildByName(this.buttonUnlock, "iconGold");
            FWUtils.setTextAutoExpand(this.price > 0 ? FWUtils.formatNumberWithCommas(this.price) : FWLocalization.text("TXT_FREE"), this.buttonUnlock, this.buttonUnlockText, this.buttonUnlockIcon);

            if (!this.machineAnim) {
                this.machineContainer = FWUI.getChildByName(this.widget, "machineContainer");
                this.machineAnim = new FWObject(this);
            }

            if (this.machineAnim) {
                this.machineAnim.initWithSpine(Game.getMachineSpineByDefine(machineId));
                this.machineAnim.setAnimation(MACHINE_ANIM_WORKING, true);
                this.machineAnim.setSkin(cc.formatStr(SPINE_MACHINES_SKIN, 1));
                this.machineAnim.setScale(MACHINE_ANIM_SCALES[machineId] * MACHINE_SCALE_POPUP);
                this.machineAnim.setParent(this.machineContainer);
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

            if (!this.eggAnim) {
                this.eggContainer = FWUI.getChildByName(this.widget, "eggContainer");
                this.eggAnim = new FWObject(this);
                this.eggAnim.initWithSpine(SPINE_MACHINE_EGG);
                this.eggAnim.setAnimation(MACHINE_ANIM_EGG_UNLOCK, true);
                this.eggAnim.setScale(0.35);
                this.eggAnim.setParent(this.eggContainer);
            }
        }

        FWUI.unfillData(this.widget);
        FWUI.fillData(this.widget, null, uiDefine);

        if (!FWUI.isShowing(UI_MACHINE_UNLOCK)) {
            FWUtils.showDarkBg(null, Z_UI_COMMON - 2);
			this.widget.setLocalZOrder(Z_UI_COMMON);

            //FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);

			// fix: hint is scaled with popup
			// fix: actionEnded is not called when hiding hint
            //gv.hint.show(this.widget, null, machineId, { posX: cc.winSize.width * 5 / 6, cover: false });
			gv.hint.show(FWUtils.getCurrentScene(), null, machineId, { posX: cc.winSize.width * 5 / 6, cover: false }, Z_UI_COMMON - 1);
    
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }
    },

    hide: function () {

        FWUtils.hideDarkBg();
        FWUI.hideWidget(this.widget, UIFX_POP_SMOOTH);

        gv.hint.hide();
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    onButtonUnlockTouched: function (sender) {          
        var isLockedFloor = (this.floorId === CloudFloors.getLastUnlockedFloorIdx() + 1);
        if (isLockedFloor) {                
			// jira#5466
            //Game.showPopup0("TXT_MACHINE_UNLOCK_TITLE", "TXT_MACHINE_UNLOCK_FLOOR_FIRST", null, null, true, "");
			Game.showPopup0("TXT_MACHINE_UNLOCK_TITLE", "TXT_MACHINE_UNLOCK_FLOOR_FIRST", null, function() {this.hide(); CloudFloors.showUnlockFloorMenu();}.bind(this), true, "TXT_UNLOCK_FLOOR");
        } else {
            var machineDefine = g_MACHINE[this.machineId];
			// jira#5456
			if(machineDefine && Game.consumeGold(this.price, FWUtils.getWorldPosition(sender))) {
            //if (machineDefine && gv.userData.isEnoughGold(machineDefine.GOLD_START)) {
                gv.userMachine.requestUnlockMachine(this.machineId);
                this.hide();
            }
            //else {
            //    Game.showPopup0("TXT_NOT_ENOUGH_GOLD_TITLE", "TXT_NOT_ENOUGH_GOLD_CONTENT", null, function () { Game.openShop(ID_GOLD); }, true, "TXT_BUY");
            //}
        }
    },

    onButtonCloseTouched: function (sender) {
        this.hide();
    },

    // TEST ONLY
    switchMachine: function (machineId) {
        if (this.machineAnim) {
            this.machineAnim.initWithSpine(Game.getMachineSpineByDefine(machineId));
            this.machineAnim.setAnimation(MACHINE_ANIM_WORKING, true);
            this.machineAnim.setSkin(cc.formatStr(SPINE_MACHINES_SKIN, 1));
            this.machineAnim.setScale(MACHINE_ANIM_SCALES[machineId] * MACHINE_SCALE_POPUP);
            this.machineAnim.setParent(this.machineContainer);
        }
    }
});