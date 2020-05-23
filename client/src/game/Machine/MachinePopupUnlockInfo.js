var MachinePopupUnlockInfo = cc.Node.extend({
    LOGTAG: "[MachinePopupUnlockInfo]",

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
        cc.log(this.LOGTAG, "show", "floorId:", floorId, "machineId:", machineId);

        var libraryIsShow = FWUI.isShowing(UI_UTIL_CONTAINER);

        this.floorId = floorId;
        this.machineId = machineId;

        var machineDefine = g_MACHINE[machineId];

        var itemData = [];
        var machineProducts = machineDefine.PRODUCT_ID;
        for (var i = 0; i < machineProducts.length; i++) {
            itemData.push({ itemId: machineProducts[i] });
        }

        var itemDefine = {
            ItemSprite: { type: UITYPE_IMAGE, field: "itemId", subType: defineTypes.TYPE_PRODUCT, scale: 0.6, visible:true },
			ItemSpine: {visible:false},
            Amount: { visible: false },
            UIItem: {
                onTouchBegan: this.onProductSelected.bind(this),
                onTouchEnded: this.onProductReleased.bind(this),
            }
        };

        var uiDefine = {
            textTitle: { type: UITYPE_TEXT, value: Game.getItemName(machineId), style: TEXT_STYLE_TITLE_1 },
            textItemTitle: { type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_PRODUCE_DESC") + ":", style: TEXT_STYLE_TEXT_NORMAL },
            textUnlockLevel: { type: UITYPE_TEXT, color: cc.color.GREEN, value: cc.formatStr(FWLocalization.text("TXT_MACHINE_UNLOCK_DESC"), machineDefine.LEVEL_UNLOCK), style: TEXT_STYLE_TEXT_NORMAL_GREEN },
            buttonLibraryText: { visible: !libraryIsShow, type: UITYPE_TEXT, value: FWLocalization.text("TXT_MACHINE_COLLECTION"), style: TEXT_STYLE_TEXT_NORMAL },
            buttonLibrary: { visible: !libraryIsShow, onTouchEnded: this.onButtonLibraryTouched.bind(this) },
            buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            popup: { onTouchEnded: this.onButtonCloseTouched.bind(this) },
            panelProducts: {
                type: UITYPE_2D_LIST,
                items: itemData,
                itemUI: UI_ITEM_NO_BG,
                itemDef: itemDefine,
                itemSize: cc.size(80, 80),
            }
        };

        this.widget = FWPool.getNode(UI_MACHINE_UNLOCK_INFO, false);
        if (this.widget) {

            this.buttonLibrary = FWUI.getChildByName(this.widget, "buttonLibrary");
            this.buttonLibraryText = FWUI.getChildByName(this.buttonLibrary, "buttonLibraryText");
            FWUtils.setTextAutoExpand(FWLocalization.text("TXT_MACHINE_COLLECTION"), this.buttonLibrary, this.buttonLibraryText);

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

            var panel = FWUI.getChildByName(this.widget, "panel");
            var panelInner = FWUI.getChildByName(this.widget, "panelInner");
            var panelProducts = FWUI.getChildByName(this.widget, "panelProducts");
            var boderFrameCover = FWUI.getChildByName(this.widget, "boderFrameCover");
            if (panel && panelInner && panelProducts && boderFrameCover) {

                var itemSize = 80;

                if (!this.panelProductMargin)
                    this.panelProductMargin = panel.width - panelProducts.width;

                var panelProductWidth = itemSize * Math.ceil(machineProducts.length / 2);

                var panelWidth = Math.max(panelProductWidth + this.panelProductMargin, 440);
                var offset = panelWidth - panel.width;

                panelProducts.setContentSize(panelProductWidth, panelProducts.height);
                panelInner.setContentSize(panelInner.width + offset, panelInner.height);
                panel.setContentSize(panelWidth, panel.height);
                boderFrameCover.setContentSize(panelWidth, panel.height);

                var buttonClose = FWUI.getChildByName(this.widget, "buttonClose");
                buttonClose.x = buttonClose.x + offset / 2;

                // this.widget.requestDoLayout()
            }

            var panelRight = panel.x + panel.getBoundingBox().width * 0.5;
            this.hintPosX = panelRight + (cc.winSize.width - panelRight) * 0.5;
        }

        FWUI.unfillData(this.widget);
        FWUI.fillData(this.widget, null, uiDefine);

        if (!FWUI.isShowing(UI_MACHINE_UNLOCK_INFO)) {
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

    onButtonCloseTouched: function (sender) {
        this.hide();
    },

    onProductSelected: function (sender) {
        var position =null;
        if(FWUI.touchedWidget){
            //cc.log("position",FWUI.draggedWidget.getTouchMovePosition());
            position = FWUI.touchedWidget.getTouchBeganPosition();
        }
        gv.hintManagerNew.show(this.widget, HINT_TYPE_PRODUCT_MACHINE, sender.uiData.itemId,position);
    },

    onProductReleased: function (sender) {
        gv.hintManagerNew.hideHint(HINT_TYPE_PRODUCT_MACHINE);
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