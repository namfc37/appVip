var TomPopupUnlock = cc.Node.extend({
    LOGTAG: "[TomPopupUnlock]",

    ctor: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function () {

        this.widget = FWPool.getNode(UI_TOM_UNLOCK, false);
        if (this.widget) {

            var panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
            if (!this.npcTom) {
                this.npcTom = new FWObject();
                this.npcTom.initWithSpine(SPINE_NPC_TOMKID);
                this.npcTom.setAnimation(TOMKID_ANIM_IDLE, true);
                this.npcTom.setScale(-TOMKID_ANIM_SCALE_POPUP, TOMKID_ANIM_SCALE_POPUP);
                this.npcTom.setParent(panelNPC);
            }

            var panelHint = FWUI.getChildByName(this.widget, "panelHint");
            if (panelHint) {
                var panelContent = FWUI.getChildByName(this.widget, "panelContent");
                if (!panelContent) {
                    panelContent = FWPool.getNode(UI_TOM_HINT, true);
                    panelHint.addChild(panelContent, 0, "panelContent");
                }
            }

            var isUnlockable = gv.userData.isEnoughLevel(g_MISCINFO.TOM_USER_LEVEL);
            var textUnlockButton = FWLocalization.text((isUnlockable) ? "TXT_TOM_BUTTON_UNLOCK_READY" : "TXT_TOM_BUTTON_UNLOCK");

            var uiDefine = {
                textHint: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_HINT_UNLOCK"), style: TEXT_STYLE_TEXT_DIALOG },
                textUnlock: { type: UITYPE_TEXT, id: textUnlockButton, style: TEXT_STYLE_TEXT_NORMAL },
                buttonInfo: { onTouchEnded: this.onButtonInfoTouched.bind(this), visible:false },
                buttonUnlock: { onTouchEnded: this.onButtonUnlockTouched.bind(this) },
                container: { onTouchEnded: this.hide.bind(this) }
            };

            FWUI.fillData(this.widget, null, uiDefine);

            var textUnlock = FWUI.getChildByName(this.widget, "textUnlock");
            var buttonUnlock = FWUI.getChildByName(this.widget, "buttonUnlock");
            FWUtils.setTextAutoExpand(textUnlockButton, buttonUnlock, textUnlock);
        }

        if (!FWUI.isShowing(UI_TOM_UNLOCK)) {

            FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgTomUnlock");

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }
    },

	hide: function (callback) {//web hide: function (callback = null) {
		
		if(callback === undefined)
			callback = null;
		
        FWUtils.hideDarkBg(null, "darkBgTomUnlock");
        FWUI.hideWidget(this.widget, { fx: UIFX_NONE, callback: callback });
        
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    onButtonInfoTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonInfoTouched");
        FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
    },

    onButtonUnlockTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonUnlockTouched");

        if (gv.tomkid.isUnlocked()) {
            cc.log(this.LOGTAG, "Tom is already unlocked");
        }
        else {
            if (gv.userData.isEnoughLevel(g_MISCINFO.TOM_USER_LEVEL)) {
                gv.tomkid.requestUnlock();
				gv.tomkid.lastButton = sender;
            }
            else {
                FWUtils.showWarningText(FWLocalization.text("TXT_TOM_MSG_UNLOCK_LEVEL_LIMIT"), FWUtils.getWorldPosition(sender));
            }
        }
    },

    onUnlockResponse: function (packet) {
        cc.log(this.LOGTAG, "onUnlockResponse: %j", packet);
        if (packet.error === 0) {
            this.hide(function () {
                gv.tomkid.showPopupSearch();
				Tutorial.onGameEvent(EVT_UNLOCK_FEATURE, "tom");
            });
        }
        else {
            // gv.hint.showHintToast(null, cc.formatStr(FWLocalization.text("TXT_TOM_MSG_UNLOCK_LEVEL_LIMIT"), packet.error));
        }
    }
});