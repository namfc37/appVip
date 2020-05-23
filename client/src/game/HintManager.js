const HINT_TYPE_POT = 0;
const HINT_TYPE_ITEM = 1;
const HINT_TYPE_PLANT = 2;
const HINT_TYPE_MACHINE = 3;
const HINT_TYPE_PRODUCT = 4;
const HINT_TYPE_PRODUCT_MACHINE = 5;
const HINT_TYPE_DESC = 6;
const HINT_TYPE_ACHIEVEMENT = 7;
const HINT_TYPE_SKIN = 8;
const HINT_TYPE_HOOK = 9;
const HINT_TYPE_TEXT = 10;

const HINT_UI_FLAG_TITLE = 1 << 0;
const HINT_UI_FLAG_TITLE_TIME = 1 << 1;
const HINT_UI_FLAG_TITLE_LEVEL = 1 << 2;
const HINT_UI_FLAG_TITLE_STATS = 1 << 3;
const HINT_UI_FLAG_TITLE_SIMPLE = 1 << 4;
const HINT_UI_FLAG_STATS = 1 << 5;
const HINT_UI_FLAG_DESC = 1 << 6;
const HINT_UI_FLAG_LIST = 1 << 7;
const HINT_UI_FLAG_LONG_DESC = 1 << 8;

const HINT_CONTENT_TOP_PADDING = 15;
const HINT_CONTENT_BOTTOM_PADDING = 20;

const HINT_PANEL_HIDDEN_HEIGHT = 20;

const HINT_ITEM_ROW_MAX = 7;
const HINT_ITEM_COL_MAX = 2;

const HINT_ICON_TYPE_SPRITE = 0;
const HINT_ICON_TYPE_SPINE = 1;

const HINT_ICON_SCALE_POT = 0.9;
const HINT_ICON_SCALE_PLANT = 0.7;
const HINT_ICON_SCALE_PLANT_BUG = 0.4;

const HINT_ICON_SCALE_MACHINE_PRODUCT = 0.5;

const HINT_ICON_SCALE_PRODUCT = 1.0;
const HINT_ICON_SCALE_PRODUCT_INGREDIENT = 0.5;
const HINT_ICON_SCALE_PRODUCT_INGREDIENT_SPINE = 0.6;
const HINT_ICON_SCALE_PRODUCT_MACHINE = 0.13;

const HINT_DEFAULT_FX_PARAMS = {
    posX: 0,
    posY: 0,
    time: 0.2,
    delay: 0.0,
    coverOpacity: 200,
    coverTime: 0.1,
    cover: true
};

const HINT_TOAST_DEFAULT_FX_PARAMS = {
    position: null,
    time: 0.1,
    delay: 0.0,
    opacity: 255,
    scaleEnd: 1.0,
    scaleStart: 0.9,
    scaleDelta: 0.05,
    hideAfter: 3.0,
    align: true,
    alignPadding: 40,
};

var HintManager = cc.Class.extend({
    LOGTAG: "[HintManager]",

    init: function () {
    position = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5);

        this.mapTypeFlag = {};
        this.mapTypeFlag[HINT_TYPE_POT] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_STATS;// feedback this.mapTypeFlag[HINT_TYPE_POT] = HINT_UI_FLAG_TITLE_SIMPLE | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_ITEM] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_DESC | HINT_UI_FLAG_LIST;// jira#5486 this.mapTypeFlag[HINT_TYPE_ITEM] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_STATS | HINT_UI_FLAG_DESC | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_PLANT] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_TITLE_TIME | HINT_UI_FLAG_STATS | HINT_UI_FLAG_DESC | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_MACHINE] = HINT_UI_FLAG_TITLE_SIMPLE | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_PRODUCT] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_TITLE_TIME | HINT_UI_FLAG_STATS | HINT_UI_FLAG_DESC | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_PRODUCT_MACHINE] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_TITLE_TIME | HINT_UI_FLAG_STATS | HINT_UI_FLAG_DESC | HINT_UI_FLAG_LIST;
        this.mapTypeFlag[HINT_TYPE_DESC] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_LONG_DESC;
        this.mapTypeFlag[HINT_TYPE_ACHIEVEMENT] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_LONG_DESC | HINT_UI_FLAG_STATS;
        this.mapTypeFlag[HINT_TYPE_SKIN] = HINT_UI_FLAG_TITLE | HINT_UI_FLAG_TITLE_TIME | HINT_UI_FLAG_LONG_DESC;
    },

    show: function (parent, hintType, itemId, fxParams, zorder) {
        cc.log(this.LOGTAG, "show", " - hintType:", hintType, ", itemId:", itemId);

		var itemType;
		if(hintType === HINT_TYPE_ACHIEVEMENT)
		{
			if(defineMap[itemId])
				itemType = defineMap[itemId].TYPE;
			else
				itemType = defineTypes.TYPE_ACHIEVEMENT;
		}
		else
		{
			var itemType = defineMap[itemId].TYPE;
			if (itemType === defineTypes.TYPE_POT || itemType === defineTypes.TYPE_DECOR)
				hintType = HINT_TYPE_POT;
			else if (itemType === defineTypes.TYPE_PLANT)
				hintType = HINT_TYPE_PLANT;
			else if (itemType === defineTypes.TYPE_PEST)// || itemType === defineTypes.TYPE_DECOR || itemType === defineTypes.TYPE_MATERIAL)
				hintType = HINT_TYPE_ITEM;
			else if (itemType === defineTypes.TYPE_MACHINE)
				hintType = HINT_TYPE_MACHINE;
			else if (itemType === defineTypes.TYPE_PRODUCT || itemType === defineTypes.TYPE_PEARL) {
				if (!hintType) {
					// quick fix jira#5044
					//cc.log(this.LOGTAG, "show", "hintType must be specified with item of TYPE_PRODUCT");
					//return;
					hintType = HINT_TYPE_PRODUCT_MACHINE;
				}
			}
			else if (itemType === defineTypes.TYPE_MATERIAL || itemType === defineTypes.TYPE_MINERAL || itemType === defineTypes.TYPE_EVENT)
				hintType = HINT_TYPE_DESC;
		}

        //if (!this.widget) // fix: incorrect hint if change hints quickly
		{
            this.widget = this.createHint(hintType, itemId, itemType);
			if(this.widget)
			{
				zorder = zorder || 0;
				parent = parent || FWUtils.getCurrentScene();
				if (this.widget.getParent() !== parent) {
					this.widget.removeFromParent();
					parent.addChild(this.widget, zorder);
				}
			}
        }

        this.showHint(this.widget, fxParams);
    },

    hide: function (fxParams) {
        if (this.widget) {
            this.hideHint(this.widget, fxParams);
        }
    },

    showHint: function (widget, fxParams) {
        cc.log(this.LOGTAG, "showHint:", "widget:", widget, "fxParams: %j", fxParams);

        if (!widget)
            return;

        fxParams = fxParams || HINT_DEFAULT_FX_PARAMS;
        this.fxParams = fxParams;

        var timeExecute = fxParams.time || HINT_DEFAULT_FX_PARAMS.time;
        var timeDelay = fxParams.delay || HINT_DEFAULT_FX_PARAMS.delay;

        if (fxParams.cover === undefined)
            fxParams.cover = HINT_DEFAULT_FX_PARAMS.cover;

        var cover = FWUI.getChildByName(widget, "cover");
        var popup = FWUI.getChildByName(widget, "popup");

        FWUI.fillData(widget, null, {
            cover: {
                onTouchEnded: function () {
                    this.hide();
                }.bind(this)
            }
        });

        if (cover) {
            cover.setVisible(false);
            if (fxParams.cover) {
                var coverTime = fxParams.coverTime || HINT_DEFAULT_FX_PARAMS.coverTime;
                var coverOpacity = fxParams.coverOpacity || HINT_DEFAULT_FX_PARAMS.coverOpacity;
                cover.setOpacity(0);
                cover.runAction(cc.sequence(cc.delayTime(timeDelay), cc.show(), cc.fadeTo(coverTime, coverOpacity)));
            }
        }

        if (popup) {

            var actionBegan = cc.callFunc(function () {
                fxParams.onBegan && fxParams.onBegan();
            });

            var actionEnded = cc.callFunc(function () {
                fxParams.onEnded && fxParams.onEnded();
            });

			// jira#6027
			var position, destination;
			if(false)//if(fxParams.fromTop) // TODO
			{
				position = cc.p(fxParams.posX || HINT_DEFAULT_FX_PARAMS.posX, cc.winSize.height + popup.height + HINT_PANEL_HIDDEN_HEIGHT);
				destination = cc.p(position.x, position.y - popup.height);
			}
			else
			{
				position = cc.p(fxParams.posX || HINT_DEFAULT_FX_PARAMS.posX, -HINT_PANEL_HIDDEN_HEIGHT);
				destination = cc.p(position.x, position.y + popup.height - HINT_PANEL_HIDDEN_HEIGHT);
			}

            var action = cc.sequence(cc.delayTime(timeDelay), actionBegan, cc.place(position), cc.show(), new cc.EaseSineOut(cc.moveTo(timeExecute, destination)), actionEnded);

            popup.stopAllActions();
            popup.runAction(action);
        }
    },

    hideHint: function (widget, fxParams) {
        cc.log(this.LOGTAG, "hideHint:", "widget:", widget, "fxParams: %j", fxParams);

        fxParams = fxParams || this.fxParams;

        var cover = FWUI.getChildByName(widget, "cover");
        var popup = FWUI.getChildByName(widget, "popup");

        var timeExecute = fxParams.time || HINT_DEFAULT_FX_PARAMS.time;
        var timeDelay = fxParams.delay || HINT_DEFAULT_FX_PARAMS.delay;

        if (cover) {

            var coverTime = fxParams.coverTime || HINT_DEFAULT_FX_PARAMS.coverTime;

            cover.setOpacity(0);
            cover.runAction(cc.sequence(cc.delayTime(timeDelay), cc.fadeOut(coverTime), cc.hide()));
        }

        if (popup) {

            var actionBegan = cc.callFunc(function () {
                fxParams.onBegan && fxParams.onBegan();
            }.bind(this));

            var actionEnded = cc.callFunc(function () {

                fxParams.onEnded && fxParams.onEnded();

                if (this.widget)
                    this.widget.removeFromParent();

                this.widget = null;

            }.bind(this));

            var destination = cc.p(popup.x, popup.y - popup.height);
            var action = cc.sequence(cc.delayTime(timeDelay), actionBegan, cc.show(), new cc.EaseSineOut(cc.moveTo(timeExecute, destination)), actionEnded);//var action = cc.sequence(cc.delayTime(timeDelay), actionBegan, cc.show(), actionEnded);

            popup.stopAllActions();
            popup.runAction(action);
        }
    },

    showHintToast: function (parent, message, fxParams, zorder) {

        fxParams = fxParams || HINT_TOAST_DEFAULT_FX_PARAMS;
        this.fxToastParams = fxParams;

        var timeExecute = fxParams.time || HINT_TOAST_DEFAULT_FX_PARAMS.time;
        var timeDelay = fxParams.delay || HINT_TOAST_DEFAULT_FX_PARAMS.delay;

        var position = fxParams.position || HINT_TOAST_DEFAULT_FX_PARAMS.position;
        var opacity = fxParams.opacity || HINT_TOAST_DEFAULT_FX_PARAMS.opacity;

        var hideAfter = fxParams.hideAfter || HINT_TOAST_DEFAULT_FX_PARAMS.hideAfter;

        this.toast = FWPool.getNode(UI_HINT_TOAST, false);
        if (this.toast) {

            var panel = FWUI.getChildByName(this.toast, "panel");
            var text = FWUI.getChildByName(this.toast, "text");
            var textPadding = text.x;

            text.setString(message);

            panel.setContentSize(cc.size(text.getBoundingBox().width + textPadding * 2, panel.height));
            panel.setOpacity(opacity);

            this.toast.setContentSize(panel.getContentSize());
            this.toast.setAnchorPoint(cc.p(0.5, 0));
            this.toast.setPosition(position);

            zorder = zorder || 0;
            parent = parent || FWUtils.getCurrentScene();
            if (this.toast.getParent() !== parent) {
                this.toast.removeFromParent();
                parent.addChild(this.toast, zorder);
                FWUI.setWidgetCascadeOpacity(this.toast, true);
            }

            var align = fxParams.align || HINT_TOAST_DEFAULT_FX_PARAMS.align;
            var alignPadding = fxParams.alignPadding || HINT_TOAST_DEFAULT_FX_PARAMS.alignPadding;

            var worldPosition = FWUtils.getWorldPosition(this.toast);
            if (align) {

                var bound = this.toast.getBoundingBox();
                bound.x = worldPosition.x - this.toast.getAnchorPoint().x * bound.width;
                bound.y = worldPosition.y - this.toast.getAnchorPoint().y * bound.height;

                var offsetLeft = alignPadding - cc.rectGetMinX(bound);
                var offsetRight = cc.winSize.width - alignPadding - cc.rectGetMaxX(bound);
                if (offsetLeft > 0)
                    position.x += offsetLeft;
                else if (offsetRight < 0)
                    position.x += offsetRight;

                this.toast.setPosition(position);
            }

            var scaleEnd = fxParams.scaleEnd || 1.0;
            var scaleStart = fxParams.scaleStart || 0.9;
            var scaleDelta = fxParams.scaleDelta || 0.05;

            var actionBegan = cc.callFunc(function () {
                fxParams.onBegan && fxParams.onBegan();
            }.bind(this));

            var actionEnded = cc.callFunc(function () {
                fxParams.onEnded && fxParams.onEnded();
            }.bind(this));

            var delay = cc.delayTime(timeDelay);
            var scaleUp = new cc.EaseSineOut(cc.scaleTo(timeExecute * 0.5, scaleEnd + scaleDelta));
            var scaleDown = new cc.EaseSineOut(cc.scaleTo(timeExecute * 0.5, scaleEnd));
            var scaleExecute = cc.spawn(cc.sequence(scaleUp, scaleDown), cc.fadeIn(timeExecute * 0.5));

            var action = null;
            if (hideAfter > 0)
                action = cc.sequence(delay, actionBegan, cc.place(position), cc.show(), scaleExecute, actionEnded, cc.delayTime(hideAfter), cc.callFunc(this.hideHintToast.bind(this)));
            else
                action = cc.sequence(delay, actionBegan, cc.place(position), cc.show(), scaleExecute, actionEnded);

            this.toast.stopAllActions();

            this.toast.setOpacity(0);
            this.toast.setScale(scaleStart);
            this.toast.setPosition(position);

            this.toast.runAction(action);
        }
        return this.toast;
    },

    hideHintToast: function (fxParams) {

        fxParams = fxParams || this.fxToastParams;

        var timeExecute = fxParams.time || 0.2;
        var timeDelay = fxParams.delay || 0.0;

        if (this.toast) {

            var actionBegan = cc.callFunc(function () {
                fxParams.onBegan && fxParams.onBegan();
            }.bind(this));

            var actionEnded = cc.callFunc(function () {
                fxParams.onEnded && fxParams.onEnded();
            }.bind(this));

            var scaleStart = fxParams.scaleStart || 0.9;
            var scaleDelta = fxParams.scaleDelta || 0.05;

            var delay = cc.delayTime(timeDelay);
            var scaleUp = new cc.EaseSineOut(cc.scaleTo(timeExecute * 0.5, this.toast.getScale() + scaleDelta));
            var scaleDown = new cc.EaseSineOut(cc.scaleTo(timeExecute * 0.5, scaleStart));
            var scaleExecute = cc.spawn(cc.sequence(scaleUp, scaleDown), cc.fadeOut(timeExecute));

            var action = cc.sequence(delay, actionBegan, scaleExecute, actionEnded, cc.hide(), cc.removeSelf());

            this.toast.stopAllActions();
            this.toast.runAction(action);
        }
    },

    createHint: function (hintType, itemId, itemType) {

        var widget = FWPool.getNode(UI_HINT, false);
        if (widget) {

            var flag = this.mapTypeFlag[hintType];

            var itemData = this.getUIFillData(itemId, itemType, hintType);
            if (!itemData || Object.keys(itemData).length <= 0)
                return;

            var popup = FWUI.getChildByName(widget, "popup");

            var panel = FWUI.getChildByName(popup, "panel");
            var panelInner = FWUI.getChildByName(popup, "panelInner");
            var panelStats = FWUI.getChildByName(popup, "panelStats");
            var panelItems = FWUI.getChildByName(popup, "panelItems");

            var panelTitle = FWUI.getChildByName(popup, "panelTitle");
            var panelTitleSimple = FWUI.getChildByName(popup, "panelTitleSimple");

            var textDesc = FWUI.getChildByName(popup, "textDesc");
            var textLongDesc = FWUI.getChildByName(popup, "textLongDesc");

            var haveTitle = flag & HINT_UI_FLAG_TITLE;
            var haveTitleSimple = flag & HINT_UI_FLAG_TITLE_SIMPLE;
            var haveStats = flag & HINT_UI_FLAG_STATS;
            var haveDesc = flag & HINT_UI_FLAG_DESC;
            var haveLongDesc = flag & HINT_UI_FLAG_LONG_DESC;
            var haveList = flag & HINT_UI_FLAG_LIST;

            // setup hint title

            if (haveTitle) {

                if (!panelTitle) {
                    panelTitle = FWPool.getNode(UI_HINT_ITEM_TITLE);
                    popup.addChild(panelTitle, 1, "panelTitle");
                }

                if (!this.backLight) {
                    var lightContainer = FWUI.getChildByName(panelTitle, "iconLight");
                    this.backLight = new FWObject();
                    this.backLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                    this.backLight.setAnimation("effect_light_icon", true);
                    this.backLight.setScale(0.9);
                    this.backLight.setParent(lightContainer);
					this.backLight.skipVisibilityCheck = true;
					this.backLight.setPosition(cc.p(0, 0));
                }
				
                var uiDefine = {
                    icon: {
                        type: UITYPE_IMAGE,
                        id: itemData.itemId,
                        scale: itemData.itemImageScale || 1.0,
                        subType: itemType,
                        visible: itemData.itemIconType === HINT_ICON_TYPE_SPRITE
                    },
                    textName: {type: UITYPE_TEXT, shadow: SHADOW_DEFAULT_THIN, id: itemData.itemName},
                    textStats: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        id: cc.formatStr("+%d%", itemData.itemStat),
                        visible: flag & HINT_UI_FLAG_TITLE_STATS
                    },
                    textLevel: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        id: itemData.itemLevel,
                        visible: flag & HINT_UI_FLAG_TITLE_LEVEL
                    },
                    textTime: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        id: FWUtils.secondsToTimeString(itemData.itemTime),
                        visible: flag & HINT_UI_FLAG_TITLE_TIME
                    },
                    panelTime: {visible: flag & HINT_UI_FLAG_TITLE_TIME},
                };

                FWUI.fillData(panelTitle, null, uiDefine);
				
                var iconSpine = FWUI.getChildByName(panelTitle, "iconSpine");
                if (iconSpine) {
                    iconSpine.setVisible(itemData.itemIconType === HINT_ICON_TYPE_SPINE);
                    if (iconSpine.isVisible()) {
                        FWUI.fillData_spine2(iconSpine, itemData.itemSpine, itemData.itemSpineSkin || "", itemData.itemSpineAnim || "", itemData.itemSpineScale || 1.0);
                    }
                }
            }
            else if (haveTitleSimple) {

                if (!panelTitleSimple) {
                    panelTitleSimple = FWPool.getNode(UI_HINT_ITEM_TITLE_SIMPLE);
                    popup.addChild(panelTitleSimple, 1, "panelTitleSimple");
                }

                FWUI.fillData(panelTitleSimple, null, {
                    textTitle: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        value: itemData.itemTitle
                    }
                });
            }

            // setup hint stats

            if (haveStats) {

                panelStats.removeAllChildren();
				FWPool.returnNodes(UI_HINT_STAT);

                var newHeight = 0;
                for (var i = itemData.itemStats.length - 1; i >= 0; i--) {
                    var statItem = FWPool.getNode(UI_HINT_STAT);
                    if (statItem) {

                        FWUI.fillData(statItem, null, {
                            textValue: {
                                type: UITYPE_TEXT,
                                id: itemData.itemStats[i].text,
                                color: cc.color.GREEN,
                                shadow: SHADOW_GREEN
                            },
                            iconValue: {type: UITYPE_IMAGE, id: itemData.itemStats[i].icon, scale: 0.4}
                        });

                        var statPanel = FWUI.getChildByName(statItem, "panel");

                        var statTextValue = FWUI.getChildByName(statItem, "textValue");
                        var statIconValue = FWUI.getChildByName(statItem, "iconValue");
						if(itemData.itemStats.length > 1)
						{
							statIconValue.setPositionX(-55);
							statTextValue.setPositionX(-40);
						}
						else
						{
							statTextValue.setPositionX(0);
							statIconValue.setPositionX(statTextValue.x + statTextValue.width + statIconValue.width * statIconValue.getScale() * 0.5);	
						}
						
                        statItem.setContentSize(cc.size(cc.rectGetMaxX(statIconValue.getBoundingBox()), statPanel.height));
                        statItem.setAnchorPoint(cc.p(0.5, 0));
                        statItem.setPosition(panelStats.width * 0.5, statItem.height * (itemData.itemStats.length - i - 1));

                        panelStats.addChild(statItem);
                        newHeight += statPanel.height;
                    }
                }

                panelStats.setContentSize(cc.size(panelStats.width, newHeight));
            }

            // setup hint description

            textDesc._setBoundingWidth(textDesc.getContentSize().width);
            //textDesc.setString(itemData.itemDesc || "");
            //textLongDesc.setString(itemData.itemLongDesc || "");

            FWUI.fillData(popup, null, {
                textDesc: {
                    type: UITYPE_TEXT,
                    shadow: SHADOW_DEFAULT_THIN,
                    value: itemData.itemDesc || ""
                },
                textLongDesc: {
                    type: UITYPE_TEXT,
                    shadow: SHADOW_DEFAULT_THIN,
                    value: itemData.itemLongDesc || ""
                }
            });

            // setup hint parts/machines/ingredients list

            if (haveList) {

                itemData.itemParts = itemData.itemParts || [];

                if (!panelItems.originalSize)
                    panelItems.originalSize = panelItems.getContentSize();

                var panelWidth = (itemData.itemParts.length <= 3) ? panelItems.originalSize.width * 0.5 : panelItems.originalSize.width;
                var itemSize = (itemData.itemParts.length <= 3) ? panelWidth : panelWidth * 0.5;
                var panelHeight = (itemData.itemParts.length <= 3) ? itemSize * itemData.itemParts.length : (Math.floor(itemData.itemParts.length / 2) + Math.floor(itemData.itemParts.length % 2)) * itemSize;

                panelItems.setContentSize(cc.size(panelWidth, panelHeight));

                var itemDefine = {
                    icon: {type: UITYPE_IMAGE, field: "icon"},
                    iconLock: {type: UITYPE_IMAGE, visible: false},
                    textTitle: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        field: "text",
                        visible: "data.text !== undefined",
                        color: "data.textColor"
                    },
                    textAmount: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        field: "textAmount",
                        visible: "data.textAmount !== undefined",
                        color: "data.textAmountColor"
                    },
                    textRequire: {
                        type: UITYPE_TEXT,
                        shadow: SHADOW_DEFAULT_THIN,
                        field: "textRequire",
                        visible: "data.textRequire !== undefined",
                        color: "data.textRequireColor"
                    }
                };

                var listDefine = {
                    panelItems: {
                        type: UITYPE_2D_LIST,
                        items: itemData.itemParts,
                        itemUI: UI_HINT_ITEM,
                        itemDef: itemDefine,
                        itemSize: cc.size(itemSize, itemSize)
                    }
                };

                FWUI.fillData(panelItems.getParent(), null, listDefine);

                var totalWidth = 0, startX = 0;
                var children = panelItems.getChildren();
                for (var i = 0; i < children.length; i++) {
                    var data = itemData.itemParts[i];
                    if (data) {

                        var icon = FWUI.getChildByName(children[i], "icon");
                        if (icon) {

                            icon.setVisible(data.iconType === HINT_ICON_TYPE_SPRITE);
                            icon.setScale(data.iconScale || 1.0);

                            var isLocked = (data.isLocked !== undefined) ? data.isLocked : false;
                            FWUtils.applyGreyscaleNode(icon, isLocked);
                        }

                        var iconSpine = FWUI.getChildByName(children[i], "iconSpine");
                        if (iconSpine) {
                            iconSpine.setVisible(data.iconType === HINT_ICON_TYPE_SPINE);
                            if (iconSpine.isVisible()) {

                                var isLocked = (data.isLocked !== undefined) ? data.isLocked : false;
                                var spine = FWUI.fillData_spine2(iconSpine, data.spine, data.spineSkin || "", data.spineAnim || "", data.spineScale || 1.0);
                                FWUtils.applyGreyscaleSpine(spine, isLocked);

                                // TODO: Spine anim is wrong position and anchor point
                                // For machine spine only
                                // Need adjust in animation tool
                                // if (hintType === HINT_TYPE_PRODUCT) {
                                //     var anim = iconSpine.getChildren()[0];
                                //     anim.update(0);
                                //     var animBox = anim.getBoundingBox();
                                //     anim.setPosition(-animBox.width * 0.5 + 35, -animBox.height * 0.5 + 5);
                                // }
                            }
                        }

                        var textAmount = FWUI.getChildByName(children[i], "textAmount");
                        var textRequire = FWUI.getChildByName(children[i], "textRequire");

                        totalWidth = textAmount.getBoundingBox().width + textRequire.getBoundingBox().width;
                        startX = (children[i].getBoundingBox().width - totalWidth) * 0.5;

                        textAmount.setPositionX(startX + textAmount.getBoundingBox().width);
                        textRequire.setPositionX(startX + totalWidth - textRequire.getBoundingBox().width);
                    }
                }
            }

            // turn content on/off

            panelTitle && panelTitle.setVisible(haveTitle);
            panelTitleSimple && panelTitleSimple.setVisible(haveTitleSimple);

            panelStats && panelStats.setVisible(haveStats);
            panelItems && panelItems.setVisible(haveList);

            textDesc && textDesc.setVisible(haveDesc);
            textLongDesc && textLongDesc.setVisible(haveLongDesc);

            // re-layout content

            popup.setAnchorPoint(cc.p(0.5, 1.0));
            popup.setContentSize(cc.size(panel.width, panel.height));

            var posY = 0;
            if (haveTitle && panelTitle) {
                panelTitle.setContentSize(FWUI.getChildByName(panelTitle, "panel").getContentSize());
                panelTitle.setPosition(cc.p((popup.width - panelTitle.width) * 0.5, popup.height - panelTitle.height - HINT_CONTENT_TOP_PADDING));
                posY = panelTitle.y;
                if (!(flag & HINT_UI_FLAG_TITLE_TIME))
                    posY += cc.rectGetMinY(FWUI.getChildByName(panelTitle, "textLevel").getBoundingBox());
            }

            if (haveTitleSimple && panelTitleSimple) {
                panelTitleSimple.setContentSize(FWUI.getChildByName(panelTitleSimple, "panel").getContentSize());
                panelTitleSimple.setPosition(cc.p((popup.width - panelTitleSimple.width) * 0.5, popup.height - panelTitleSimple.height - HINT_CONTENT_TOP_PADDING));
                posY = panelTitleSimple.y;
            }

            if (haveStats) {
                panelStats.setPosition((panel.width - panelStats.width) * 0.5, posY - panelStats.height - 10);
                posY = cc.rectGetMinY(panelStats.getBoundingBox());
            }

            if (haveDesc) {
                textDesc.setPositionY(posY - 10);
                posY = cc.rectGetMinY(textDesc.getBoundingBox());
            }

            if (haveLongDesc) {
               textLongDesc.setPositionY(posY - 10 - 40);
               posY = cc.rectGetMinY(textLongDesc.getBoundingBox());
            }

            if (haveList) {
                var marginTop = (haveTitle) ? 20 : 5;
                panelItems.setPosition((panel.width - panelItems.width) * 0.5, posY - panelItems.height - marginTop);
                posY = cc.rectGetMinY(panelItems.getBoundingBox());
            }

            // re-calculate container size

            var contentOffsetY = posY - panelInner.y;
            var minY = 10000, maxY = -1;

            var children = popup.getChildren();
            for (var i = 0; i < children.length; i++) {

                if (!children[i].isVisible() || children[i] === panel || children[i] === panelInner)
                    continue;

                children[i].setPositionY(children[i].y - contentOffsetY + HINT_CONTENT_BOTTOM_PADDING);

                var bound = children[i].getBoundingBox();
                if (cc.rectGetMinY(bound) < minY)
                    minY = cc.rectGetMinY(bound);
                else if (cc.rectGetMaxY(bound) > maxY)
                    maxY = cc.rectGetMaxY(bound);
            }

            var topInnerPanel = null;
            topInnerPanel = topInnerPanel || ((haveStats) ? panelStats : null);
            topInnerPanel = topInnerPanel || ((haveDesc) ? textDesc : null);
            topInnerPanel = topInnerPanel || ((haveLongDesc) ? textLongDesc : null);
            topInnerPanel = topInnerPanel || ((haveList) ? panelItems : null);

            var panelInnerHeight = cc.rectGetMaxY(topInnerPanel.getBoundingBox()) - cc.rectGetMinY(panelItems.getBoundingBox()) + HINT_CONTENT_BOTTOM_PADDING * 2 - 10;

            // panel.setContentSize(cc.size(panel.width, maxY + HINT_CONTENT_BOTTOM_PADDING));
            panel.setPosition (cc.p (0, 70 - posY));
            panelInner.setContentSize(cc.size(panelInner.width, panelInnerHeight));
			
            if (haveLongDesc)
                textLongDesc.setPosition(panelInner.getPositionX() + panelInner.width / 2, panelInner.getPositionY() + panelInnerHeight / 2);

            FWUI.fillData(popup, {container: {onTouchEnded: this.hide.bind(this)}});
        }

        return widget;
    },

    getUIFillData: function (itemId, itemType, hintType) {

        switch (hintType) {
            case HINT_TYPE_POT:
                return this.getUIPotFillData(itemId);
            case HINT_TYPE_ITEM:
                return this.getUIItemFillData(itemId);
            case HINT_TYPE_PLANT:
                return this.getUIPlantFillData(itemId);
            case HINT_TYPE_MACHINE:
                return this.getUIMachineFillData(itemId);
            case HINT_TYPE_PRODUCT:
                return this.getUIProductFillData(itemId);
            case HINT_TYPE_PRODUCT_MACHINE:
                return this.getUIProductMachineFillData(itemId);
			case HINT_TYPE_DESC:
				return this.getDescFillData(itemId);
			case HINT_TYPE_ACHIEVEMENT:
				return this.getAchievementFillData(itemId);
			case HINT_TYPE_SKIN:
				return this.getSkinFillData(itemId);
        }

        // template data
        // return {
        //     itemId: "itemId",
        //     itemName: "itemName",
        //     itemTitle: "itemTitle",
        //     itemStat: itemStat,
        //     itemTime: itemTime,
        //     itemLevel: "Lv.xxx",
        //     itemIconType: [HINT_ICON_TYPE_SPRITE, HINT_ICON_TYPE_SPINE],
        //     itemImage: "image",
        //     itemImageScale: 1.0,
        //     itemSpine: "spineName",
        //     itemSpineAnim: "spineAnim",
        //     itemSpineScale: spineScale,
        //     itemDesc: "itemDescription",
        //     itemStats: [
        //         { text: cc.formatStr("+%d", number), icon: "icon_path" },
        //         { text: cc.formatStr("+%d", number), icon: "icon_path" }
        //     ],
        //     itemParts: [
        //         {
        //             id: "id",
        //             icon: "icon",
        //             iconScale: 1.0,
        //             iconType: HINT_ICON_TYPE_SPRITE,
        //             text: "Lv.xx",
        //             textColor: textColor,
        //             isLocked: false
        //         },
        //         {
        //             id: "id",
        //             iconType: HINT_ICON_TYPE_SPINE,
        //             spine: "spineName",
        //             spineAnim: "spineAnim",
        //             spineScale: spineScale,
        //             text: "Lv.xx",
        //             textColor: textColor,
        //             isLocked: false
        //         }
        //     ]
        // };
    },

    getUIPotFillData: function (itemId) {
        cc.log(this.LOGTAG, " - getUIPotFillData", "itemId:", itemId);

		// feedback
        /*var sources = [];
        if (g_POT[potId]) {
            for (var key in g_POT) {
                if (g_POT[key].UPGRADE_NEXT_ID.findIndex(function (value) {
                    return value === potId
                }) !== -1) {
                    var itemGfx = Game.getItemGfxByDefine(key);
                    sources.push({
                        id: key,
                        iconType: HINT_ICON_TYPE_SPINE,
                        spine: itemGfx.spine,
                        spineSkin: itemGfx.skin,
                        spineAnim: itemGfx.anim,
                        spineScale: itemGfx.scale || HINT_ICON_SCALE_POT,
                    });
                }
            }
        }
		
		// jira#5051
		if(sources.length <= 0)
			return null;

        return {
            itemId: potId,
            itemTitle: FWLocalization.text("TXT_HINT_UPGRADE_FROM"),
            itemParts: sources
        };*/
		
        var gfx = Game.getItemGfxByDefine(itemId);
		var res = {
            itemId: itemId,
            itemName: Game.getItemName(itemId),
            itemIconType: HINT_ICON_TYPE_SPINE,
            itemSpine: gfx.spine,
            itemSpineAnim: gfx.anim,
            itemSpineScale: 1.5,//jira#6002 gfx.scale,
            itemSpineSkin: gfx.skin,
        };
		
		var itemType = defineMap[itemId].TYPE;
		if(itemType === defineTypes.TYPE_POT)
		{
			var potInfo = g_POT[itemId];
			res.itemStats = [
				{text: "+" + potInfo.BUG_APPEAR_RATIO + "%", icon: "hud/icon_bug.png"},
				{text: "-" + potInfo.TIME_DECREASE_DEFAULT + "s", icon: "hud/icon_time.png"},
				{text: "+" + potInfo.EXP_INCREASE, icon: "hud/icon_exp.png"},
			];
		}
		else if(itemType === defineTypes.TYPE_DECOR)
		{
			var decorInfo = g_DECOR[itemId];
			res.itemStats = [
				{text: "+" + decorInfo.BUG_APPEAR_RATIO + "%", icon: "hud/icon_bug.png"},
				{text: "-" + decorInfo.TIME_DECREASE_DEFAULT + "s", icon: "hud/icon_time.png"},
				{text: "+" + decorInfo.EXP_INCREASE, icon: "hud/icon_exp.png"},
			];
		}
		
		return res;
    },

    getUIPlantFillData: function (plantId) {
        cc.log(this.LOGTAG, " - getUIPlantFillData", "plantId:", plantId);

        var plantGfx = Game.getItemGfxByDefine(plantId);
		var res = {
            itemId: plantId,
            itemName: Game.getItemName(plantId),
            itemTime: g_PLANT[plantId].GROW_TIME,// jira#5904 g_PLANT[plantId].SEED_TIME + g_PLANT[plantId].GROW_TIME,
            //itemIconType: HINT_ICON_TYPE_SPINE,
            //itemSpine: plantGfx.spine,
            //itemSpineAnim: plantGfx.anim,
            //itemSpineScale: plantGfx.scale || HINT_ICON_SCALE_PLANT,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: plantGfx.sprite,
            itemImageScale: 1,// jira#6002 plantGfx.scale,
            itemStats: [
                { text: cc.formatStr("+%d", g_PLANT[plantId].HARVEST_EXP), icon: "hud/icon_exp.png" },
                //{ text: cc.formatStr("+%d", g_PLANT[plantId].HARVEST_GOLD), icon: "hud/icon_gold.png" } // jira#5308
            ],
        };

        if (g_PLANT[plantId].BUG_ID) {
            var plantBugGfx = Game.getItemGfxByDefine(g_PLANT[plantId].BUG_ID);
            res.itemDesc = FWLocalization.text("TXT_HINT_BUG_ATTRACT");
            res.itemParts = [
                {
                    id: g_PLANT[plantId].BUG_ID,
                    //iconType: HINT_ICON_TYPE_SPINE,
                    //spine: plantBugGfx.spine,
                    //spineAnim: plantBugGfx.anim,
                    //spineScale: plantBugGfx.scale || HINT_ICON_SCALE_PLANT_BUG,
                    iconType: HINT_ICON_TYPE_SPRITE,
                    icon: plantBugGfx.sprite,
                    iconScale: plantBugGfx.scale || HINT_ICON_SCALE_PLANT_BUG,
                    isLocked: false
                }
            ];
        }
        else
            res.itemParts = [];
		
		return res;
    },
	
    getSkinFillData: function (skinId) {
        cc.log(this.LOGTAG, " - getSkinFillData", "skinId:", skinId);

        var gfx = Game.getItemGfxByDefine(skinId);
		var res = {
            itemId: skinId,
            itemName: Game.getItemName(skinId),
            itemTime: g_SKIN_ITEM[skinId].EFFECT_DURATION,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: gfx.sprite,
            itemImageScale: gfx.scale,
			//itemDesc: "TXT_HINT_BUY_FROM_STORE",
			itemLongDesc: "",//itemLongDesc: "TXT_HINT_BUY_FROM_STORE",
        };
		
		// jira#5935
		var skin = g_SKIN_ITEM[skinId];
		var combo = g_COMBO[skin.COMBO_ID];
		if(combo)
		{
			var buffInfo = combo.BUFF_INFO[0];
			if(buffInfo)
			{
				// copied from CloudFloors.showFloorBuff2
				var text1 = (buffInfo.type === BUFF_HARVEST_TIME || buffInfo.type === BUFF_PRODUCTION_TIME ? "-" : "+") + buffInfo.value + (buffInfo.unit === PERC ? "% " : " ");
				var text2 = "TXT_BUFF_" + buffInfo.type + (buffInfo.type < 3 || buffInfo.type === 5 ? "_" + buffInfo.area : "");
				res.itemLongDesc = text1 + FWLocalization.text(text2);
			}
		}
		
		return res;
    },

    getUIItemFillData: function (itemId) {

        var itemType = defineMap[itemId].TYPE;
        if (itemType === defineTypes.TYPE_PEST) {

            var gfx = Game.getItemGfxByDefine(itemId);
            var data = {
                itemId: itemId,
                itemName: Game.getItemName(itemId),
                //itemIconType: HINT_ICON_TYPE_SPINE,
                //itemSpine: gfx.spine,
                //itemSpineAnim: gfx.anim,
                //itemSpineScale: gfx.scale,
                itemIconType: HINT_ICON_TYPE_SPRITE,
                itemSprite: gfx.sprite,
                itemSpriteScale: gfx.scale,
                itemDesc: FWLocalization.text("TXT_HINT_BUG_APPEAR"),
                itemStats: [
                    {text: cc.formatStr("+%d%", g_PEST[itemId].EXP_BASIC), icon: "hud/icon_exp.png"},
                    {text: cc.formatStr("+%d%", g_PEST[itemId].GOLD_BASIC), icon: "hud/icon_gold.png"}
                ]
            };

            data.itemParts = [];
            for (var key in g_PLANT) {
                var plant = g_PLANT[key];
                if (plant.BUG_ID === itemId) {
                    var plantGfx = Game.getItemGfxByDefine(plant);
                    data.itemParts.push({
                        id: key,
                        //iconType: HINT_ICON_TYPE_SPINE,
                        //spine: plantGfx.spine,
                        //spineAnim: plantGfx.anim,
                        //spineScale: plantGfx.scale,
                        iconType: HINT_ICON_TYPE_SPRITE,
                        icon: plantGfx.sprite,
                        iconScale: plantGfx.scale,
                        isLocked: false
                    });
                }
            }
			
			// jira#5210
			if(data.itemParts.length <= 0)
				data.itemDesc = FWLocalization.text("TXT_HINT_BUG_APPEAR_FRIEND");

            return data;
        }

        return {};
    },

    getUIMachineFillData: function (machineId) {
        cc.log(this.LOGTAG, " - getUIMachineFillData", "machineId:", machineId);

        var sources = [];
        if (g_MACHINE[machineId]) {

            var products = g_MACHINE[machineId].PRODUCT_ID;
            products = _.sortBy(products, function(item) {return defineMap[item].LEVEL_UNLOCK;});//web

            var count = Math.min(products.length, HINT_ITEM_COL_MAX * HINT_ITEM_ROW_MAX);
            for (var i = 0; i < count; i++) {
                var productGfx = Game.getItemGfxByDefine(products[i]);
                var define = {
                    id: products[i],
                    iconType: HINT_ICON_TYPE_SPRITE,
                    icon: productGfx.sprite,
                    iconScale: HINT_ICON_SCALE_MACHINE_PRODUCT,
                };
                if (!gv.userData.isEnoughLevel(g_PRODUCT[products[i]].LEVEL_UNLOCK)) {
                    define.text = cc.formatStr("Lv.%d", g_PRODUCT[products[i]].LEVEL_UNLOCK);
                    define.textColor = cc.color.GRAY;
                }
                sources.push(define);
            }
        }

        return {
            itemId: machineId,
            itemTitle: FWLocalization.text("TXT_HINT_PRODUCE_TO"),
            itemParts: sources
        };
    },

    getUIProductFillData: function (productId) {
        cc.log(this.LOGTAG, " - getUIProductFillData", "productId:", productId);

        var productGfx = Game.getItemGfxByDefine(productId);
        var machineGfx = Game.getItemGfxByDefine(g_PRODUCT[productId].MACHINE_ID);

        return {
            itemId: productId,
            itemName: Game.getItemName(productId),
            itemTime: g_PRODUCT[productId].PRODUCTION_TIME,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: productGfx.sprite,
            itemImageScale: HINT_ICON_SCALE_PRODUCT,
            itemDesc: FWLocalization.text("TXT_HINT_PRODUCE_FROM"),
            itemStats: [
                { text: cc.formatStr("+%d", g_PRODUCT[productId].EXP_RECEIVE), icon: "hud/icon_exp.png" },
            ],
            itemParts: [
                {
                    id: g_PRODUCT[productId].MACHINE_ID,
                    iconType: HINT_ICON_TYPE_SPINE,
                    spine: machineGfx.spine,
                    spineScale: machineGfx.scale || HINT_ICON_SCALE_PRODUCT_MACHINE,
                    isLocked: false
                }
            ]
        };
    },

    getUIProductMachineFillData: function (productId) {
        cc.log(this.LOGTAG, " - getUIProductMachineFillData", "productId:", productId);

        var sources = [];
        if (g_PRODUCT[productId]) {
            var items = g_PRODUCT[productId].REQUIRE_ITEM;
            for (var itemId in items) {

                var itemAmount = gv.userStorages.getItemAmount(itemId);
                var itemRequire = items[itemId];

                var define = {
                    id: itemId,
                    textAmount: cc.formatStr("%d", itemAmount),
                    textRequire: cc.formatStr("/%d", itemRequire),
                    textAmountColor: (itemAmount >= itemRequire) ? cc.color.GREEN : cc.color.RED,
                    textRequireColor: cc.color.GREEN
                };

                var itemGfx = Game.getItemGfxByDefine(itemId);
                if (itemGfx.spine) {
                    define.iconType = HINT_ICON_TYPE_SPINE;
                    define.spine = itemGfx.spine;
                    define.spineAnim = itemGfx.anim;
                    define.spineScale = itemGfx.scale * HINT_ICON_SCALE_PRODUCT_INGREDIENT_SPINE;
                }
                else {
                    define.iconType = HINT_ICON_TYPE_SPRITE;
                    define.icon = itemGfx.sprite;
                    define.iconScale = HINT_ICON_SCALE_PRODUCT_INGREDIENT;
                }

                sources.push(define);
            }
        }

        var productGfx = Game.getItemGfxByDefine(productId);
        return {
            itemId: productId,
            itemName: Game.getItemName(productId),
            itemTime: g_PRODUCT[productId].PRODUCTION_TIME,
            itemIconType: HINT_ICON_TYPE_SPRITE,
            itemImage: productGfx.sprite,
            itemImageScale: HINT_ICON_SCALE_PRODUCT,
            itemDesc: FWLocalization.text("TXT_HINT_PRODUCT_INGREDIENTS"),
            itemStats: [
                { text: cc.formatStr("+%d", g_PRODUCT[productId].EXP_RECEIVE), icon: "hud/icon_exp.png" },
            ],
            itemParts: sources
        };
    },
	
	getDescFillData:function(itemId)
	{
		var itemType = defineMap[itemId].TYPE;
        var downLine = "";
        switch (COUNTRY)
        {
            case COUNTRY_VIETNAM:
                downLine = "\n\n";
                break;
            case COUNTRY_BRAZIL:
                downLine = "\n\n";
                break;
            case COUNTRY_THAILAND:
                downLine = "\n\n";
                break;
            case COUNTRY_MYANMAR:
                downLine = "\n\n";
                break;
            case COUNTRY_PHILIPPINE:
                downLine = "\n\n";
                break;
            case COUNTRY_GLOBAL:
                downLine = "\n";
                break;
        }

        var result = {
			itemId: itemId,
			itemName: "",
			itemLongDesc: Game.getItemName(itemId) + downLine + FWLocalization.text(itemType === defineTypes.TYPE_DECOR ? "TXT_DESC_D0" : "TXT_DESC_" + itemId),
		};
		
		// event
		if(itemType === defineTypes.TYPE_EVENT)
		{
			if(itemId === EVENT_TOKEN_ITEM_ID)
				result.itemLongDesc = Game.getItemName(itemId) + downLine + FWLocalization.text("TXT_DESC_" + itemId);
			else if(itemId === EVENT_POSM_ITEM_ID)
				result.itemLongDesc = Game.getItemName(EVENT_POSM_ITEM_ID) + downLine + FWLocalization.text("TXT_EVT_HINT_OUTGAME_PUZ");
			else
				result.itemLongDesc = FWLocalization.text("TXT_EVT_HINT_PUZ");
		}
		
		var itemGfx = Game.getItemGfxByDefine(itemId);
		if(itemGfx.sprite)
		{
			result.itemIconType = HINT_ICON_TYPE_SPRITE;
			result.itemImageScale = (itemType === defineTypes.TYPE_EVENT ? (itemGfx.scale * 1.5) : HINT_ICON_SCALE_PRODUCT);
			result.itemImage = itemGfx.sprite;
		}
		else
		{
            result.itemIconType = HINT_ICON_TYPE_SPINE;
            result.itemSpine = itemGfx.spine;
            result.itemSpineAnim = itemGfx.anim;
            result.itemSpineScale = itemGfx.scale;
            result.itemSpineSkin = itemGfx.skin;
		}
		
		return result;
	},
	
	getAchievementFillData:function(itemId)
	{
        var result = {
			itemId: itemId,
			itemName: Achievement.currentAchievement.title,
			itemLongDesc: (Achievement.currentAchievement.isCompletedAll ? "TXT_ACHIEVEMENT_COMPLETE2" : Achievement.currentAchievement.desc),
			itemStats: [],
		};
		
		var itemGfx = Game.getItemGfxByDefine(itemId);
		if(itemGfx.sprite)
		{
			result.itemIconType = HINT_ICON_TYPE_SPRITE;
			result.itemImageScale = itemGfx.scale;
			result.itemImage = itemGfx.sprite;
		}
		else
		{
            result.itemIconType = HINT_ICON_TYPE_SPINE;
            result.itemSpine = itemGfx.spine;
            result.itemSpineAnim = itemGfx.anim;
            result.itemSpineScale = itemGfx.scale;
            result.itemSpineSkin = itemGfx.skin;
		}
		
		return result;
	},	
});

HintManager._instance = null;
HintManager.getInstance = function () {
    if (!HintManager._instance)
        HintManager._instance = new HintManager();
    return HintManager._instance;
};

//web var gv = gv || {};
gv.hint = new HintManager();