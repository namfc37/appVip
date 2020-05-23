var TomPopupSearch = cc.Node.extend({
    LOGTAG: "[TomPopupSearch]",

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

        this.useBuffItem = false;
        this.data = {
            findItemId: "",
            buffItemId: g_MISCINFO.TOM_X2_ITEM,
            buffItemRequire: 1
        };

        this.widget = FWPool.getNode(UI_TOM_SEARCH, false);
        if (this.widget) {

            var panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
            if (!this.npcTom) {
                this.npcTom = new FWObject();
                this.npcTom.initWithSpine(SPINE_NPC_TOMKID);
                this.npcTom.setAnimation(TOMKID_ANIM_IDLE, true);
                this.npcTom.setScale(TOMKID_ANIM_SCALE_MEDIUM, TOMKID_ANIM_SCALE_MEDIUM);
                this.npcTom.setParent(panelNPC);
            }

            var panelItem = FWUI.getChildByName(this.widget, "panelItem");
            if (panelItem) {

                if (!this.backLight) {
                    this.backLight = new FWObject();
                    this.backLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                    this.backLight.setAnimation("effect_light_icon", true);
                    this.backLight.setScale(1.2);
                    this.backLight.setParent(panelItem);
                    this.backLight.setPosition(panelItem.width * 0.5, panelItem.height * 0.5);
                }

                var itemContent = FWUI.getChildByName(this.widget, "itemContent");
                if (!itemContent) {
                    itemContent = FWPool.getNode(UI_TOM_ITEM_SLOT, true);
                    panelItem.addChild(itemContent, 999, "itemContent");
                }
            }

            var findItemName = Game.getItemName(this.data.findItemId);
            var findItemIcon = Game.getItemGfxByDefine(this.data.findItemId).sprite;

            var buffItemCount = gv.userStorages.getItemAmount(this.data.buffItemId);
            var buffItemText = cc.formatStr("%d/%d", buffItemCount, this.data.buffItemRequire);
            var buffItemTextColor = (buffItemCount >= this.data.buffItemRequire) ? cc.color.GREEN : cc.color.RED;

            var uiDefine = {
                iconCheck: { visible: this.useBuffItem },
                tagDouble: { visible: this.useBuffItem },
                textBuff: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_DOUBLE_DESC") },
                textSearch: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_TOM_BUTTON_SEARCH"), style: TEXT_STYLE_TEXT_NORMAL },
                textTime: { type: UITYPE_TEXT, id: "0", style: TEXT_STYLE_TEXT_TIME },
                textDouble: { type: UITYPE_TEXT, id: "x2", style: TEXT_STYLE_NUMBER_SALE },
                itemName: { type: UITYPE_TEXT, id: findItemName, style: TEXT_STYLE_TEXT_NORMAL },
                itemIcon: { type: UITYPE_IMAGE, id: findItemIcon, scale: 0.7, visible: this.data.findItemId !== "" },
                itemSpine: { type: UITYPE_IMAGE, id: findItemIcon, scale: 0.7, visible: this.data.findItemId !== "" },
                itemBuffCount: { type: UITYPE_TEXT, id: buffItemText, color: buffItemTextColor, style: TEXT_STYLE_NUMBER },
                itemBuffIcon: { onTouchEnded: this.onButtonItemBuffTouched.bind(this) },
                buttonBuff: { onTouchEnded: this.onButtonItemBuffTouched.bind(this) },
                buttonSearch: { onTouchEnded: this.onButtonSearchTouched.bind(this) },
                buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
                //container: { onTouchEnded: this.onButtonCloseTouched.bind(this) }, // jira#5403
            };

            var itemBuffIcon = FWUI.getChildByName(this.widget, "itemBuffIcon");
            if (itemBuffIcon) {
                FWUI.fillData_image2(itemBuffIcon, Game.getItemGfxByDefine(this.data.buffItemId).sprite, 0.7);
            }

            this.buttonSearch = FWUI.getChildByName(this.widget, "buttonSearch");
            this.textTime = FWUI.getChildByName(this.widget, "textTime");
            this.barTime = FWUI.getChildByName(this.widget, "barTime");

            FWUI.fillData(this.widget, null, uiDefine);
        }

        if (!FWUI.isShowing(UI_TOM_SEARCH)) {

            var storageFilterTypes = [STORAGE_TYPE_FARM_PRODUCT, STORAGE_TYPE_PRODUCT];
            gv.gameBuildingStorageInterface.showStorageUI(true, true, this.onItemSelected.bind(this), Z_UI_STORAGE, storageFilterTypes, g_MISCINFO.TOM_ITEMS, true);
			gv.gameBuildingStorageInterface.changeStorageType(gv.gameBuildingStorageInterface.buttonFarmProduct, STORAGE_TYPE_FARM_PRODUCT);
			
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

        gv.gameBuildingStorageInterface.showStorageUI(false);

        FWUtils.hideDarkBg(FWUtils.getCurrentScene());
        FWUI.hideWidget(this.widget, { fx: UIFX_NONE, callback: callback });

        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateTime);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
    },

    updateTime: function (dt) {

        var hireTimeLeft = gv.tomkid.getHireTimeLeft();
        this.textTime.setString(FWUtils.secondsToTimeString(hireTimeLeft));

        this.buttonSearch && this.buttonSearch.setEnabled(hireTimeLeft > 0);
        this.textTime && this.textTime.setVisible(hireTimeLeft > 0);
        this.barTime && this.barTime.setVisible(hireTimeLeft > 0);
    },

    onButtonItemBuffTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonItemBuffTouched");
        var buffItemCount = gv.userStorages.getItemAmount(this.data.buffItemId);
        if (buffItemCount >= this.data.buffItemRequire) {

            this.useBuffItem = !this.useBuffItem;

            var iconCheck = FWUI.getChildByName(this.widget, "iconCheck");
            iconCheck && iconCheck.setVisible(this.useBuffItem);

            var tagDouble = FWUI.getChildByName(this.widget, "tagDouble");
            tagDouble && tagDouble.setVisible(this.useBuffItem);
        }
        else {

            Game.showQuickBuy([{itemId: this.data.buffItemId, requireAmount: this.data.buffItemRequire}], function() {//web

                // Update amount

                var buffItemCount = gv.userStorages.getItemAmount(this.data.buffItemId);
                var buffItemText = cc.formatStr("%d/%d", buffItemCount, this.data.buffItemRequire);
                var buffItemTextColor = (buffItemCount >= this.data.buffItemRequire) ? cc.color.GREEN : cc.color.RED;

                FWUI.fillData(this.widget, null, {
                    itemBuffCount: { type: UITYPE_TEXT, id: buffItemText, color: buffItemTextColor, style: TEXT_STYLE_NUMBER },
                });

                // Toggle select

                this.useBuffItem = !this.useBuffItem;

                var iconCheck = FWUI.getChildByName(this.widget, "iconCheck");
                iconCheck && iconCheck.setVisible(this.useBuffItem);

                var tagDouble = FWUI.getChildByName(this.widget, "tagDouble");
                tagDouble && tagDouble.setVisible(this.useBuffItem);
            }.bind(this));
        }
    },

    onButtonSearchTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonSearchTouched");

        var hireTimeLeft = gv.tomkid.getHireTimeLeft();
        if (hireTimeLeft > 0) {
            if (this.data.findItemId === "") {
				FWUtils.showWarningText(FWLocalization.text("TXT_TOM_MSG_SELECT_ITEM"), FWUtils.getWorldPosition(sender));
                cc.log(this.LOGTAG, "onButtonSearchTouched:", "Find item is empty");
            }
            else {
                var canFind = true;
                var buffItemId = (this.useBuffItem) ? this.data.buffItemId : "";
                if (buffItemId !== "") {
                    var buffItemCount = gv.userStorages.getItemAmount(buffItemId);
                    if (buffItemCount < this.data.buffItemRequire) {
                        canFind = false;
                        FWUtils.showWarningText(FWLocalization.text("TXT_TOM_MSG_FIND_NOT_ENOUGH_BUFF_ITEM"), FWUtils.getWorldPosition(sender));
                    }
                }
                if (canFind) {
                    gv.tomkid.requestFind(this.data.findItemId, buffItemId);
                }
            }
        }
        else {
            cc.log(this.LOGTAG, "onButtonSearchTouched:", "Tom hiring time is expired");
        }
    },

    onButtonCloseTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonCloseTouched");
        this.hide();
    },

    onItemSelected: function (sender) {
        cc.log(this.LOGTAG, "onItemSelected", "itemId:", sender.uiData.itemId);
        if (sender) {

            this.data.findItemId = sender.uiData.itemId;
            if (gv.tomkid.isFindItemValid(this.data.findItemId)) {

                var findItemName = Game.getItemName(this.data.findItemId);
                var findItemIcon = Game.getItemGfxByDefine(this.data.findItemId);

                var iconSprite = FWUI.getChildByName(this.widget, "itemIcon");
                var iconSpine = FWUI.getChildByName(this.widget, "itemSpine");

                var itemName = FWUI.getChildByName(this.widget, "itemName");
                itemName.setString(findItemName);

                iconSprite && iconSprite.setVisible(findItemIcon.sprite !== undefined);
                iconSpine && iconSpine.setVisible(findItemIcon.spine !== undefined);

                if (findItemIcon.sprite) {
                    FWUI.fillData_image2(iconSprite, findItemIcon.sprite, 0.7);
                }
                else if (findItemIcon.spine) {
                    FWUI.fillData_spine2(iconSpine, findItemIcon.spine, findItemIcon.skin || "", findItemIcon.anim || "", findItemIcon.scale || 1.0);
                }
            }
            else {
                cc.log(this.LOGTAG, "onItemSelected:", "Not supported", "itemId:", sender.uiData.itemId);
            }
        }
    },

    onFindResponse: function (packet) {
        cc.log(this.LOGTAG, "onFindResponse: %j", packet);
        if (packet.error === 0) {
            this.hide(function () {
                gv.background.performNPCTomFinding();
            });
        }
        else {
            cc.log(this.LOGTAG, "onFindResponse", "error:", packet.error);
            // gv.hint.showHintToast(null, cc.formatStr(FWLocalization.text("TXT_TOM_MSG_FIND_ERROR"), packet.error), Z_UI_STORAGE + 1);
        }
    }
});