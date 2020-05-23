var TomPopupSleeping = cc.Node.extend({
    LOGTAG: "[TomPopupSleeping]",

    ctor: function () {
        this._super();

        this.data = {
            skipItemId: g_MISCINFO.TOM_REDUCE_TIME_ITEM,
            skipItemRequire: 1
        };
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
    },

    show: function () {

        this.widget = FWPool.getNode(UI_TOM_SLEEPY, false);
        if (this.widget) {

            var panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
            if (!this.npcTom) {
                this.npcTom = new FWObject();
                this.npcTom.initWithSpine(SPINE_NPC_TOMKID);
                this.npcTom.setAnimation(TOMKID_ANIM_IDLE_SLEEPY, true);
                this.npcTom.setAnimationTimeScale(0.5);
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

            var skipItemName = this.data.skipItemId;
            var skipItemIcon = Game.getItemGfxByDefine(this.data.skipItemId).sprite;

            var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
            var skipItemText = cc.formatStr("%d/%d", skipItemCount, this.data.skipItemRequire);
            var skipItemTexColor = (skipItemCount >= this.data.skipItemRequire) ? cc.color.WHITE : cc.color.RED;

            var uiDefine = {
                textTime: { type: UITYPE_TEXT, id: "0", style: TEXT_STYLE_TEXT_TIME },
                textHint: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_HINT_WAKE_UP"), style: TEXT_STYLE_TEXT_DIALOG },
                textDesc: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_WAKE_UP_DESC"), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
                textWakeup: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_BUTTON_WAKE_UP"), style: TEXT_STYLE_TEXT_NORMAL },
                itemSkipIcon: { type: UITYPE_IMAGE, id: skipItemIcon, scale: 0.5, onTouchEnded: this.onItemSkipTouched.bind(this) },
                itemSkipAmount: { type: UITYPE_TEXT, id: skipItemText, color: skipItemTexColor, style: TEXT_STYLE_TEXT_NORMAL },
                panelSkip: { onTouchEnded: this.onItemSkipTouched.bind(this) },
                buttonInfo: { onTouchEnded: this.onButtonInfoTouched.bind(this), visible:false },
                buttonWakeup: { onTouchEnded: this.onButtonWakeupTouched.bind(this) },
                container: { onTouchEnded: this.hide.bind(this) }
            };

            FWUI.fillData(this.widget, null, uiDefine);

            this.buttonWakeup = FWUI.getChildByName(this.widget, "buttonWakeup");
            this.barTimeValue = FWUI.getChildByName(this.widget, "barTimeValue");
            this.barTimeTree = FWUI.getChildByName(this.widget, "barTimeTree");

            this.textTime = FWUI.getChildByName(this.widget, "textTime");
            this.textDesc = FWUI.getChildByName(this.widget, "textDesc");

            this.panelSkip = FWUI.getChildByName(this.widget, "panelSkip");

            if (!this.textDescOrigin)
                this.textDescOrigin = this.textDesc.getPosition();
            if (!this.buttonWakeupOrigin)
                this.buttonWakeupOrigin = this.buttonWakeup.getPosition();
        }

        if (!FWUI.isShowing(UI_TOM_SLEEPY)) {

            FWUtils.showDarkBg(FWUtils.getCurrentScene());

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

            this.updateTime();
            cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateTime, 0.5, cc.REPEAT_FOREVER, 0, false);
            
            AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
        }
    },

    hide: function (callback) {//web hide: function (callback = null) {
		
		if(callback === undefined)
			callback = null;

        FWUtils.hideDarkBg(FWUtils.getCurrentScene());
        FWUI.hideWidget(this.widget, { fx: UIFX_NONE, callback: callback });

        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateTime);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    updateTime: function (dt) {

        var restTimeLeft = gv.tomkid.getRestTimeLeft();
        var canSkip = restTimeLeft >= g_MISCINFO.TOM_LIMIT_REST_DURATION;

        this.textTime.setString(FWUtils.secondsToTimeString(restTimeLeft));

        var percent = 0;
        var fullDuration = gv.tomkid.getRestDurationFull();
        if (fullDuration > 0)
            percent = Math.min(Math.max(restTimeLeft * 100 / fullDuration, 0), 100);

        this.buttonWakeup && this.buttonWakeup.setEnabled(canSkip);
        this.barTimeValue && this.barTimeValue.setPercent(percent);

        this.panelSkip.setVisible(canSkip);
        this.barTimeTree.setVisible(canSkip);

        this.textDesc.setPositionY((canSkip) ? this.textDescOrigin.y : this.panelSkip.y);
        this.buttonWakeup.setPositionY((canSkip) ? this.buttonWakeupOrigin.y : (this.panelSkip.y - (this.textDescOrigin.y - this.buttonWakeupOrigin.y)));

        if (restTimeLeft <= 0)
            this.hide();
    },

    onItemSkipTouched: function (sender) {
        cc.log(this.LOGTAG, "onItemSkipTouched");
        var hireTimeLeft = gv.tomkid.getHireTimeLeft();
        if (hireTimeLeft > 0) {
            var restTimeLeft = gv.tomkid.getRestTimeLeft();
            if (restTimeLeft >= g_MISCINFO.TOM_LIMIT_REST_DURATION) {
                var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
                if (skipItemCount >= this.data.skipItemRequire) {
                    gv.tomkid.requestReduceTime(this.data.skipItemId, this.data.skipItemRequire);
                }
                else {
                    Game.showQuickBuy([{itemId: this.data.skipItemId, requireAmount: this.data.skipItemRequire}], function() {//web

                        var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
                        var skipItemText = cc.formatStr("%d/%d", skipItemCount, this.data.skipItemRequire);
                        var skipItemTexColor = (skipItemCount >= this.data.skipItemRequire) ? cc.color.WHITE : cc.color.RED;

                        FWUI.fillData(this.widget, null, {
                            itemSkipAmount: { type: UITYPE_TEXT, id: skipItemText, color: skipItemTexColor, style: TEXT_STYLE_TEXT_NORMAL },
                        });

                        gv.tomkid.requestReduceTime(this.data.skipItemId, this.data.skipItemRequire);
                    }.bind(this));
                }
            }
            else {
                FWUtils.showWarningText(FWLocalization.text("TXT_TOM_MSG_SKIP_TIME_LIMIT"), FWUtils.getWorldPosition(sender));
            }
        }
    },

    onButtonInfoTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonInfoTouched");
        FWUtils.showWarningText(FWLocalization.text("TXT_COMING_SOON"), FWUtils.getWorldPosition(sender));
    },

    onButtonWakeupTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonWakeupTouched");
        var hireTimeLeft = gv.tomkid.getHireTimeLeft();
        if (hireTimeLeft > 0) {
            var restTimeLeft = gv.tomkid.getRestTimeLeft();
            if (restTimeLeft >= g_MISCINFO.TOM_LIMIT_REST_DURATION) {

                var skipItemAmount = Math.floor(restTimeLeft / g_MISCINFO.TOM_REDUCE_TIME_VALUE);
                var restTimeAfterReduce = restTimeLeft - skipItemAmount * g_MISCINFO.TOM_REDUCE_TIME_VALUE;
                if (restTimeAfterReduce > g_MISCINFO.TOM_LIMIT_REST_DURATION)
                    skipItemAmount++;

                var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
                if (skipItemCount >= skipItemAmount) {
                    gv.tomkid.requestReduceTime(this.data.skipItemId, skipItemAmount);
                }
                else {
                    Game.showQuickBuy([{itemId: this.data.skipItemId, requireAmount: skipItemAmount}], function() {//web

                        var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
                        var skipItemText = cc.formatStr("%d/%d", skipItemCount, skipItemAmount);
                        var skipItemTexColor = (skipItemCount >= skipItemAmount) ? cc.color.WHITE : cc.color.RED;

                        FWUI.fillData(this.widget, null, {
                            itemSkipAmount: { type: UITYPE_TEXT, id: skipItemText, color: skipItemTexColor, style: TEXT_STYLE_TEXT_NORMAL },
                        });

                        gv.tomkid.requestReduceTime(this.data.skipItemId, skipItemAmount);
                    }.bind(this));
                }
            }
            else {
                FWUtils.showWarningText(FWLocalization.text("TXT_TOM_MSG_SKIP_TIME_LIMIT"), FWUtils.getWorldPosition(sender));
            }
        }
    },

    onReduceTimeResponse: function (packet) {
        cc.log(this.LOGTAG, "onReduceTimeResponse: %j", packet);
        if (packet.error === 0) {

            var skipItemCount = gv.userStorages.getItemAmount(this.data.skipItemId);
            var skipItemText = cc.formatStr("%d/%d", skipItemCount, this.data.skipItemRequire);
            var skipItemTexColor = (skipItemCount >= this.data.skipItemRequire) ? cc.color.WHITE : cc.color.RED;

            FWUI.fillData(this.widget, null, {
                itemSkipAmount: { type: UITYPE_TEXT, id: skipItemText, color: skipItemTexColor, style: TEXT_STYLE_TEXT_NORMAL },
            });

            var restTimeLeft = gv.tomkid.getRestTimeLeft();
            if (restTimeLeft <= 0) {
                this.hide();
            }
        }
    },
});