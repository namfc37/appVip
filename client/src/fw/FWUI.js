// TODO:
// - show loading icon while loading

const UISCALE_INITIAL = 0.9;
const UISCALE_DURATION = 0.35;
const UISCALE_EASE_FACTOR = 1.0;
const UISCALE_POP_DELTA = 0.1;
const UISLIDE_DURATION = 0.15;
const UIFX_POP_SMOOTH_TIME_SCALE = 1.2;

const UIFX_NONE = 0; // no fx
const UIFX_POP = 1; // pop-up and pop-down
const UIFX_POP_SMOOTH = 3; // pop-up and pop-down
//const UIFX_SLIDE = 2; // slide from screen edges
const UIFX_SLIDE_SMOOTH = 4;
const UIFX_FADE = 5;

// single
const UITYPE_TEXT = 0;
const UITYPE_IMAGE = 1;
const UITYPE_SPINE = 2;
const UITYPE_PROGRESS_BAR = 3;
const UITYPE_TIME_BAR = 4;
const UITYPE_ITEM = 5;
const UITYPE_MASK = 6;
const UITYPE_TIME_TEXT = 7;
const UITYPE_PANEL = 8;
// list
const UITYPE_LIST = 10;
const UITYPE_2D_LIST = 11;
// external types, not managed by FWUI
const UITYPE_FWOBJECT = 12;

// element anim
const UIANIM_NONE = 0;
const UIANIM_BLINK = 1;

const UI_FILL_DATA_TAG = 9999;
const UI_FILL_DATA_TAG_BG = 9998;
const UI_CANCEL_DRAG_DURATION = 0.15;

var FWUI =
{
	validScrollGap: 0,
    validHoldOffset: 0,
	hasTouchedUI: false, // fix: can touch on ui and fwobject at the same time
	
	// web
	init:function()
	{
		this.validScrollGap = cc.winSize.height / 25;
		this.validHoldOffset = cc.winSize.height / 10;
	},

	// show ui by name
	// only apply for pooled ui
	show: function (name, parent, fxParams) {//web show: function (name, parent, fxParams = UIFX_NONE) {
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		
		var widget = FWPool.getNode(name, false);
		this.showWidget(widget, parent, fxParams);
		return widget;
	},

	// fill data and show
	// only apply for pooled ui
	showWithData: function (name, data, def, parent, fxParams) {//web showWithData: function (name, data, def, parent, fxParams = UIFX_NONE) {
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		
		var widget = FWPool.getNode(name, false);
		this.showWidgetWithData(widget, data, def, parent, fxParams);
		return widget;
	},

	// check if widget is being shown
	isShowing: function (name, checkHiding) {//web isShowing: function (name, checkHiding = false) {
		
		if(!FWPool.poolObjects[name] || FWPool.poolObjects[name].length <= 0)
			return false;
		
		if(checkHiding === undefined)
			checkHiding = false;
		
		var widget = FWPool.getNode(name, false);
		if(!widget.getParent())
		{
			FWPool.returnNode(widget);
			return false;
		}
		return this.isWidgetShowing(widget, checkHiding);
	},

	// hide ui by name
	// only apply for pooled ui
	hide: function (name, fxParams) {//web hide: function (name, fxParams = UIFX_NONE) {
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		
		var widget = FWPool.getNode(name, false);
		this.hideWidget(widget, fxParams);
		return widget;
	},

	// show ui
	// must provide fxParams.fromPos, fxParams.toPos for UIFX_SLIDE
	showWidget: function (widget, parent, fxParams, align, callback) {//web showWidget: function (widget, parent, fxParams = UIFX_NONE, align = true, callback = null) {
		
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		if(align === undefined)
			align = true;
		if(callback === undefined)
			callback = null;
		
		if (align === true)
			this.alignWidget(widget);

		if (widget.getParent() !== parent) {
			widget.removeFromParent();
			parent.addChild(widget);
		}

		var fx = fxParams.fx;
		if (fx === undefined)
			fx = fxParams;

		var actionCallback = cc.callFunc(function () {
			callback && callback();
		});

		widget.stopAllActions();
		widget.isHiding = false;
		switch (fx) {
			// jira#5209
			/*case UIFX_POP:
			case UIFX_POP_SMOOTH:
				// jira#5132
				// var fadeTo = cc.fadeTo(UISCALE_DURATION, 255);
				// var scaleTo = cc.scaleTo(UISCALE_DURATION, 1);
				// scaleTo = scaleTo.easing(cc.easeSineOut());
				// widget.setScale(UISCALE_INITIAL);
				// widget.setOpacity(0);
				// widget.runAction(cc.sequence(scaleTo, actionCallback));
				// widget.runAction(fadeTo);
				var fadeTo = cc.fadeTo(UISCALE_DURATION, 255);
				this.setWidgetCascadeOpacity(widget, true);
				widget.setOpacity(0);
				widget.runAction(cc.sequence(fadeTo, actionCallback));
				break;*/
			case UIFX_POP:
			case UIFX_POP_SMOOTH:
			
				// fade
				if(!widget.isCascadeOpacitySet)
				{
					this.setWidgetCascadeOpacity(widget, true);
					widget.isCascadeOpacitySet = true;
				}
				var fadeTo = cc.fadeTo(0.15, 255);
				widget.setOpacity(0);
				widget.runAction(cc.sequence(cc.delayTime(0.01), fadeTo));
				
				// scale
				widget.setScale(UISCALE_INITIAL);
				//var scaleTo = cc.scaleTo(UISCALE_DURATION, 1);
				//scaleTo = scaleTo.easing(cc.easeBounceOut());
				//widget.runAction(cc.sequence(cc.delayTime(0.01), scaleTo, actionCallback));
				widget.runAction(cc.sequence(cc.delayTime(0.01), cc.scaleTo(UISCALE_DURATION / 2, 1), cc.scaleTo(UISCALE_DURATION / 4, 0.985).easing(cc.easeSineOut()), cc.scaleTo(UISCALE_DURATION / 4, 1).easing(cc.easeSineIn()), actionCallback));
				
				break;
			/*case UIFX_SLIDE:
				var fromPosition = fxParams.fromPos;
				var toPosition = fxParams.toPos;
				widget.setPosition(fromPosition);
				var slideTo = cc.sequence(cc.moveTo(UISLIDE_DURATION, toPosition).easing(cc.easeBackOut()), actionCallback);
				widget.runAction(slideTo);
				break;*/
            /*case UIFX_POP_SMOOTH:
                var fadeIn = cc.fadeIn(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE);
                var scaleUp = new cc.EaseSineOut(cc.scaleTo(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE * 0.5, 1.0 + UISCALE_POP_DELTA));
                var scaleDown = new cc.EaseSineOut(cc.scaleTo(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE * 0.5, 1.0));
                widget.setScale(0.95);
                widget.setOpacity(0);
                widget.setCascadeOpacityEnabled(true);
                widget.runAction(cc.spawn(cc.sequence(scaleUp, scaleDown, actionCallback), fadeIn));
                break;*/
            case UIFX_SLIDE_SMOOTH:
                var fromPos = fxParams.fromPos || widget.getPosition();
                var toPos = fxParams.toPos || widget.getPosition();
                var time = 0.3;// fxParams.time || 0.3;
                if (fxParams.ignoreX) {
                    fromPos.x = widget.x;
                    toPos.x = widget.x;
				}
                if (fxParams.ignoreY) {
                    fromPos.y = widget.y;
                    toPos.y = widget.y;
				}
                widget.setPosition(fromPos);
                //widget.runAction(cc.sequence(new cc.EaseSineOut(cc.moveTo(time, toPos)), actionCallback));
                widget.runAction(cc.sequence(cc.moveTo(time, toPos).easing(cc.easeOut(6.0)), actionCallback));
                break;

			case UIFX_FADE:
				if(!widget.isCascadeOpacitySet)
				{
					this.setWidgetCascadeOpacity(widget, true);
					widget.isCascadeOpacitySet = true;
				}
				var fadeTo = cc.fadeTo(0.15, 255);
				widget.setOpacity(0);
				widget.runAction(cc.sequence(cc.delayTime(0.01), fadeTo, actionCallback));
				break;
				
			default :
				widget.setScale(1);
				widget.setOpacity(255);
				callback && callback();
		}
		widget.fxParams = fxParams;
		
		Tutorial.onGameEventWithDelay(EVT_SHOW_WIDGET, UISCALE_DURATION, widget.poolKey, widget);
		
		// jira#6281
		if(widget.hasDarkBg)
		{
			if(fx !== UIFX_NONE) // fix: do not block touches if not neccessary
				FWUtils.disableAllTouchesByDuration(0.25); // fix: user can touch on ui while darkBg is yet to be shown
			cc.director.getScheduler().scheduleCallbackForTarget(this, function()
			{	
				var parent = widget.getParent();
				if(Game.gameScene && cc.sys.isObjectValid(widget) && (parent === null || cc.sys.isObjectValid(parent)))
					FWUtils.showDarkBg(parent, widget.getLocalZOrder() - 1, "darkBgWidget" + widget.getName());
			}, 0, 0, 0.01, false);
		}
	},

	// fill data and show
	showWidgetWithData: function (widget, data, def, parent, fxParams, align) {//web showWidgetWithData: function (widget, data, def, parent, fxParams = UIFX_NONE, align = true) {
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		if(align === undefined)
			align = true;
			
		this.fillData(widget, data, def);
		this.showWidget(widget, parent, fxParams, align);
	},

	// check if widget is being shown
	isWidgetShowing: function (widget, checkHiding) {//web isWidgetShowing: function (widget, checkHiding = false) {
		if(checkHiding === undefined)
			checkHiding = false;
		
		if (checkHiding === true && widget.isHiding === true)
			return false; // widget is visible but running hide fx
		if (widget.isVisible() === false)
			return false;
		if (widget.getParent() === null)
			return (widget === FWUtils.getCurrentScene());
		return (this.isWidgetShowing(widget.getParent(), checkHiding) === true);
	},

	// hide ui
	hideWidget: function (widget, fxParams) {//web hideWidget: function (widget, fxParams = UIFX_NONE) {
		if(fxParams === undefined)
			fxParams = UIFX_NONE;
		
		if (this.isWidgetShowing(widget, true) === false)
			return;

		// jira#6281
		if(widget.hasDarkBg)
		{
			//FWUtils.hideDarkBg(widget.getParent(), "darkBgWidget" + widget.getName());
			cc.director.getScheduler().scheduleCallbackForTarget(this, function()
			{
				var parent = widget.getParent();
				if(Game.gameScene && cc.sys.isObjectValid(widget) && (parent === null || cc.sys.isObjectValid(parent)))
					FWUtils.hideDarkBg(parent, "darkBgWidget" + widget.getName());
			}, 0, 0, 0.02, false);
		}

		widget.isHiding = true;
		this.unregisterEvents(widget);
		this.unregisterDroppables(widget);

		var fx = fxParams.fx;
		if (fx === undefined)
			fx = fxParams;

		var hideCallback = function () {
			if (fxParams.callback && typeof fxParams.callback === 'function')
                fxParams.callback();
		}.bind(this);

		widget.stopAllActions();
		// jira#5209
		/*if (fx === UIFX_POP || fx === UIFX_POP_SMOOTH) {
			// jira#5132
            // pop-down
            // var fadeTo = cc.fadeTo(UISCALE_DURATION, 0);
            // var scaleTo = cc.scaleTo(UISCALE_DURATION, UISCALE_INITIAL);
            // scaleTo = scaleTo.easing(cc.easeSineIn());
            // var sequence = cc.sequence(scaleTo, cc.callFunc(this.actuallyHideWidget.bind(this), widget), cc.callFunc(hideCallback));
            // widget.runAction(sequence);
            // widget.runAction(fadeTo);
            var fadeTo = cc.fadeTo(UISCALE_DURATION, 0);
            widget.runAction(cc.sequence(fadeTo, cc.callFunc(this.actuallyHideWidget.bind(this), widget), cc.callFunc(hideCallback)));
        }*/
        /*else if (fx === UIFX_POP_SMOOTH) {
            var fadeOut = cc.fadeOut(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE);
            var scaleUp = new cc.EaseSineOut(cc.scaleTo(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE * 0.5, 1.0 + UISCALE_POP_DELTA));
            var scaleDown = new cc.EaseSineOut(cc.scaleTo(UISCALE_DURATION * UIFX_POP_SMOOTH_TIME_SCALE * 0.5, 0.95));
            widget.setCascadeOpacityEnabled(true);
            widget.runAction(cc.spawn(cc.sequence(scaleUp, scaleDown, cc.callFunc(this.actuallyHideWidget.bind(this)), cc.callFunc(hideCallback), fadeOut)));
        }
        else*/
		if (fx === UIFX_POP || fx === UIFX_POP_SMOOTH) {
            widget.runAction(cc.sequence(cc.fadeTo(0.15, 0), cc.callFunc(this.actuallyHideWidget.bind(this), widget), cc.callFunc(hideCallback)));
            widget.runAction(cc.scaleTo(0.15, UISCALE_INITIAL));
        }
		else if (fx === UIFX_SLIDE_SMOOTH) {
            var fromPos = fxParams.fromPos || widget.getPosition();
            var toPos = fxParams.toPos || widget.getPosition();
            var time = 0.3;//fxParams.time || 0.3;
            if (fxParams.ignoreX) {
                fromPos.x = widget.x;
                toPos.x = widget.x;
            }
            if (fxParams.ignoreY) {
                fromPos.y = widget.y;
                toPos.y = widget.y;
            }
            widget.setPosition(fromPos);
            //widget.runAction(cc.sequence(new cc.EaseSineOut(cc.moveTo(time, toPos)), cc.callFunc(this.actuallyHideWidget.bind(this)), cc.callFunc(hideCallback)));
            widget.runAction(cc.sequence(cc.moveTo(time, toPos).easing(cc.easeSineIn()), cc.callFunc(this.actuallyHideWidget.bind(this)), cc.callFunc(hideCallback)));
        }
		else if (fx === UIFX_FADE) {
            widget.runAction(cc.sequence(cc.fadeTo(0.15, 0), cc.callFunc(this.actuallyHideWidget.bind(this), widget), cc.callFunc(hideCallback)));
        }
		else {
            this.actuallyHideWidget(widget);
            hideCallback();
        }
		
		Tutorial.onGameEventWithDelay(EVT_HIDE_WIDGET, UISCALE_DURATION, widget.poolKey, widget);
	},

	// actually hide widget
	actuallyHideWidget: function (widget) {
		this.unfillData(widget);
		widget.removeFromParent();
		FWPool.returnNode(widget);
		widget.isHiding = false;
		
		// fix: loses input when touching on a closing widget
		var touchedWidget = this.touchedWidget;
		while(touchedWidget)
		{
			if(touchedWidget === widget)
			{
				this.touchedWidget = null;
				break;
			}
			touchedWidget = touchedWidget.getParent();
		}
	},

	// align widget
	alignWidget: function (widget, position, size, anchor, zOrder) {//web alignWidget: function (widget, position = null, size = null, anchor = null, zOrder = -1) {
		
		if(position === undefined)
			position = null;
		if(size === undefined)
			size = null;
		if(anchor === undefined)
			anchor = null;
		if(zOrder === undefined)
			zOrder = -1;

		if (position === null)
			widget.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
		else
			widget.setPosition(position);

		if (size === null)
			widget.setContentSize(cc.winSize.width, cc.winSize.height);
		else
			widget.setContentSize(size);

		if (anchor === null)
			widget.setAnchorPoint(cc.p(0.5, 0.5));
		else
			widget.setAnchorPoint(anchor);

		if (zOrder >= 0)
			widget.setLocalZOrder(zOrder);
	},

	// TODO: remove and use FWUtils.getChildByName instead ////////////////////////////
	// get ui child by its name recursively
	getChildByName: function (widget, name) {
		return ccui.helper.seekWidgetByName(widget, name);
	},
	///////////////////////////////////////////////////////////////////////////////////

	// fill data to ui using provided definition
	fillData: function (widget, data, def) {
		
		//web only
		if(!cc.sys.isNative && data !== null)
			eval("var data = arguments[1];");
		
		widget.uiBaseData = data;
		widget.uiBaseDef = def;
		
		for (var childName in def) {
			var child = this.getChildByName(widget, childName);
			if (child === null) {
				cc.log("FWUI::fillData: child not found: " + childName);
				continue;
			}

			var childDef = def[childName];

			child.uiData = data;
			child.uiDef = childDef;
			
			var visible = childDef["visible"];
			if (visible !== undefined)
			{
				if(_.isString(visible))
					visible = eval(visible);
				child.setVisible(visible);
				if(!visible)
					continue;
			}
			
			var type = childDef["type"];
			if (type === UITYPE_TEXT || type === UITYPE_TIME_TEXT)
				this.fillData_text(child, data, childDef);
			else if (type === UITYPE_IMAGE)
				this.fillData_image(child, data, childDef);
			else if (type === UITYPE_SPINE)
				this.fillData_spine(child, data, childDef);
			else if (type === UITYPE_LIST)
				this.fillData_list(child, data, childDef);
			else if (type === UITYPE_2D_LIST)
				this.fillData_2dlist(child, data, childDef);
			else if (type === UITYPE_PROGRESS_BAR)
				this.fillData_progressBar(child, data, childDef);
			else if (type === UITYPE_TIME_BAR)
				this.fillData_timeBar(child, data, childDef);
			else if (type === UITYPE_ITEM)
				this.fillData_item(child, data, childDef);
			else if(type === UITYPE_MASK)
			{
				var height = this.getDataToFill(data, childDef);
				child.setContentSize(child.getContentSize().width, height);
			}
			else if(type === UITYPE_PANEL)
			{
				if(childDef["alignChild"] === true)
					this.alignPanelItemsHorizontally(child);
			}

			// TODO: (next game) set directly in editor and remove code
			var scale9 = childDef["scale9"];
			if (scale9 !== undefined) {
				if (child.setScale9Enabled !== undefined) {
					//child.setScale9Enabled(true);
					//child.setCapInsets(scale9);
					child.setScale9Enabled(scale9);
				}
				else
					cc.log("FWUI::fillData: cannot apply scale9 for " + childName);
			}

			var shadow = childDef["shadow"];
			if (shadow !== undefined) {
				if (child.enableShadow !== undefined)
				{
					child.enableShadow(shadow[0], shadow[1]);
					if(shadow.length >= 4)
						child.enableOutline(shadow[2], shadow[3]);
				}
				else
					cc.log("FWUI::fillData: cannot apply shadow for " + childName);
			}

			var enabled = childDef["enabled"];
			if (enabled !== undefined)
				this.setWidgetEnabled(child, enabled);

			var position = childDef["position"];
			if (position !== undefined)
				child.setPosition(position);
			
			var opacity = childDef["opacity"];
			if (opacity !== undefined)
			{
				this.setWidgetCascadeOpacityEnabled(child, true);
				if(_.isString(opacity))
					opacity = eval(opacity);
				child.setOpacity(opacity);
			}

			var style = childDef["style"];
			if (_.isString(style))
				style = eval(style);
			
			if (style) //if (style && child.textStyle !== style) //web
			{
            	if (child.setFontSize !== undefined)
                	style.size && child.setFontSize(style.size);
                if (child.setColor !== undefined)
                	style.color && child.setColor(style.color);
                if (child.enableOutline !== undefined && style.stroke && style.stroke.size && style.stroke.color)
                    child.enableOutline(style.stroke.color, style.stroke.size);
                if (child.enableShadow !== undefined && style.shadow && style.shadow.size && style.shadow.color)
                    child.enableShadow(style.shadow.color, style.shadow.size);
				if(style.uppercase === true && child.setString !== undefined)
					child.setString(child.getString().toUpperCase());
				//if(child.setTextYOffset)
				//	child.setTextYOffset(style.yOffset || 3);
				//child.textStyle = style;
            }
			
			if(childDef["dragTag"] !== undefined && childDef["dragCondition"] !== undefined)
			{
				var canDrag = eval(childDef["dragCondition"]);
				if(!canDrag)
				{
					child.uiDef = _.clone(childDef);
					delete child.uiDef.dragTag;
					delete child.uiDef.dragCondition;
				}
			}
			
			// duplicate
			if(cc.sys.isNative)
			{
				var color = childDef["color"];
				if(color !== undefined)
				{
					if(_.isString(color))
						color = eval(color);
					child.setColor(color);
				}
			}
			
			var anim = childDef["anim"];
			if(anim !== undefined)
			{
				child.stopAllActions();
				
				var type = anim.type || anim;
				if(type === UIANIM_BLINK)
					child.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(anim.duration || 0.75, anim.scale || 1.25), cc.scaleTo(anim.duration || 0.75, 1))));
			}
			
			var width = childDef["width"];
			var height = childDef["height"];
			if(width !== undefined || height !== undefined)
			{
				var size = child.getContentSize();
				if(width === undefined)
					width = size.width;
				else if(_.isString(width))
					width = eval(width);
				if(height === undefined)
					height = size.height;
				else if(_.isString(height))
					height = eval(height);
				child.setContentSize(width, height);
			}
			
			var posX = childDef["posX"];
			var posY = childDef["posY"];
			if(posX !== undefined || posY !== undefined)
			{
				var pos = child.getPosition();
				if(posX === undefined)
					posX = pos.x;
				else if(_.isString(posX))
					posX = eval(posX);
				if(posY === undefined)
					posY = pos.y;
				else if(_.isString(posY))
					posY = eval(posY);
				child.setPosition(posX, posY);
			}			
		}

		this.registerEvents(widget);
		this.registerDroppables(widget);
	},

	// remove all children that are added to ui while filling data
	unfillData: function (widget) {
		var def = widget.uiBaseDef;
		if (def === undefined)
			return; // not filled with data

		for (var childName in def) {
			var child = this.getChildByName(widget, childName)
			if (child === null)
				continue;

			var type = def[childName]["type"];
			if (type === UITYPE_SPINE)
				this.unfillData_spine(child);
			else if (type === UITYPE_LIST || type === UITYPE_2D_LIST)
				this.unfillData_list(child);
			else if (type === UITYPE_TIME_BAR)
				this.unfillData_timeBar(child);
			else if (type === UITYPE_TIME_TEXT)
				this.unfillData_timeText(child);
			else if (type === UITYPE_ITEM)
				this.unfillData_item(child);
			else if (type === UITYPE_IMAGE)
				this.unfillData_image(child);

			delete child.uiData;
			delete child.uiDef;
		}

		delete widget.uiBaseData;
		delete widget.uiBaseDef;
	},

	// fill text
	fillData_text: function (widget, data, def) {
		
		var textToFill = this.getDataToFill(data, def);
		if(textToFill !== null && textToFill !== undefined)
		{
			textToFill = FWLocalization.text(textToFill);
			
			var format = def["format"];
			if (format !== undefined) {
				// format
				format = FWLocalization.text(format);
				textToFill = cc.formatStr(format, textToFill);
			}
			
			if(def.useK === true)
			{
				textToFill = "" + textToFill; // convert number to string to use endsWith function
				if(textToFill.endsWith("000"))
					textToFill = textToFill.substring(0, textToFill.length - 3) + "K";
			}
			
			if(def.maxWordLength !== undefined && def.maxWordLength > 0)
			{
				// insert white spaces to long words so they will be broken to new lines
				var i1 = 0;
				var i2;
				do
				{
					i2 = textToFill.indexOf(' ', i1);
					if(i2 < 0)
						i2 = textToFill.length;
					
					if(i2 - i1 > def.maxWordLength)
						textToFill = textToFill.substring(0, i1 + def.maxWordLength) + " " + textToFill.substring(i1 + def.maxWordLength, textToFill.length);
					
					i1 = i1 + def.maxWordLength + 1;
				}
				while(i1 < textToFill.length);
			}
			
			this.setLabelString(widget, textToFill, def.splitNumber !== false);
		}

		var color = def["color"];
		if (color !== undefined) {
			if (data && data[def["color"]]) {
				color = data[def["color"]];
			}
			else if (_.isString(color))
			{
				//web only
				if(!cc.sys.isNative && data !== null) // added data !== null check to fix obfucsation bug
					eval("var data = arguments[1];");
				color = eval(color);			
			}
			
			if(cc.sys.isNative)
				widget.color = color;
			else // jira#7434
				widget._labelRenderer.setFontFillColor(color);
		}
		
		if(def.placeHolder !== undefined && widget.setPlaceHolder)
		{
			widget.setPlaceHolder(FWLocalization.text(def.placeHolder));

			var placeHolderColor = def.placeHolderColor ? def.placeHolderColor : cc.color(128, 128, 128, 255);
			widget.setPlaceHolderColor(placeHolderColor);
		}
		
		if(def.listener) {
if(cc.sys.isNative)
			widget.addEventListener(def.listener[0], def.listener[1]);
else
			widget.setDelegate(this);
}
		
		if(def.type === UITYPE_TIME_TEXT)
		{
			widget.timeTextUpdate = function(dt) {FWUI.update_timeText(this, dt);}
			widget.timeTextFinished = false;
			cc.director.getScheduler().scheduleCallbackForTarget(widget, widget.timeTextUpdate, 1, cc.REPEAT_FOREVER, 0.01, false); // intentionally delay 0.01 to update display asap
		}
		
		if(def.lengthLimit)
		{
			widget.setMaxLengthEnabled(true);
			widget.setMaxLength(def.lengthLimit);
		}
		
		// jira#7248: reset editbox when showing 2nd time
		if(!cc.sys.isNative && widget.setInputMode && !widget._renderCmd._edTxt)
		{
			var _editBoxInputMode = widget._editBoxInputMode;
			widget._editBoxInputMode = null
			widget.setInputMode(_editBoxInputMode);
			widget.setInputFlag(widget._editBoxInputFlag);
			widget.resetListener();
		}
	},
	
	//web
    editBoxTextChanged: function (editBox, text) {
		var func = editBox.uiDef.listener[0].bind(editBox.uiDef.listener[1]);
		func(editBox);
    },
	
	unfillData_timeText:function(widget)
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(widget, widget.timeTextUpdate);
		delete widget.timeTextUpdate;
	},
	
	update_timeText:function(widget, dt)//web update_timeText:function(widget, dt = 0)
	{
		if(dt === undefined)
			dt = 0;
		
		var data = widget.uiDef;
		
		if(data.endTime)
		{
			// countdown
			var finished = false;
			var remainTime = data.endTime - Game.getGameTimeInSeconds();
			if(remainTime < 0)
			{
				remainTime = 0;
				finished = true;
			}
			
			widget.setString(cc.formatStr(FWLocalization.text(data.value), FWUtils.secondsToTimeString(remainTime)));

			if(finished === true)
			{
				if(widget.timeTextFinished === false)
				{
					widget.timeTextFinished = true;
					if(data.onFinished)
						data.onFinished(widget);
				}
			}
		}
		else if(data.startTime)
			widget.setString(cc.formatStr(FWLocalization.text(data.value), FWUtils.secondsToTimeString(Game.getGameTimeInSeconds() - data.startTime)));
		
		if(data.onTick)
			data.onTick(widget, remainTime);
	},	
	
	setLabelString:function(label, string, splitNumber)//web setLabelString:function(label, string, splitNumber = true)
	{
		if(splitNumber === undefined)
			splitNumber = true;
		
		if(splitNumber && typeof(string) === "number")//if(Number(string) !== NaN)//if(_.isNumber(string) === true)
			string = FWUtils.formatNumberWithCommas(string);
		label.string = string;
	},

	// fill image
	fillData_image: function (widget, data, def) {

		//web only
if(!cc.sys.isNative)
		eval("var data = arguments[1];");	
		
		var isLocked = def["locked"];
		if (typeof isLocked === "string")
            isLocked = eval(isLocked);

		var scale = def.scale;
		if(_.isString(scale))
			scale = eval(scale);

		var color = null;
		if (typeof def.color === "string")
			color = eval(def.color);
		color = color || cc.WHITE;
		
		var imageName = this.getDataToFill(data, def);
		this.fillData_image2(widget, imageName, scale, color, isLocked, def.size, def.isLocalTexture === true ? ccui.Widget.LOCAL_TEXTURE : ccui.Widget.PLIST_TEXTURE);
		
		// button
		//if(def.isLRButton && widget.loadTexturePressed)
		//	widget.loadTexturePressed(imageName, ccui.Widget.PLIST_TEXTURE);
	},

	// common func for fillData_image and fillData_item
	fillData_image2:function(widget, imageName, scale, color, locked, size, textureType)
	{
		if(textureType === undefined || textureType === ccui.Widget.PLIST_TEXTURE)
		{
			textureType = ccui.Widget.PLIST_TEXTURE;
			
			var frame = null;
			if(cc.sys.isNative)
				frame = (imageName ? cc.SpriteFrameCache.getInstance().getSpriteFrame(imageName) : null);
			else
				frame = (imageName ? cc.spriteFrameCache.getSpriteFrame(imageName) : null);
			if (!frame)
			{
				if(imageName.startsWith("http"))
				{
					this.fillData_imageFromUrl(widget, imageName, scale, color, locked, size, textureType);
					return;
				}
				
				cc.log("FWUI::fillData_image2: sprite not found: " + imageName);
				if(widget.getName().toLowerCase().indexOf("avatar") >= 0)
					imageName = "hud/hud_avatar_default.png";
				else
					imageName = "hud/item_lost.png";
			}
		}
		else
		{
			cc.log("FWUtils::fillData_image2: loading local texture: " + imageName);
			if(widget.uiDef.discard)
				widget.discardTexture = imageName;
			
			if(!cc.sys.isNative)
			{
				// web: must preload, then load
				cc.loader.load([imageName], 
					function()
					{
						if(widget.loadTexture)
							widget.loadTexture(imageName, ccui.Widget.LOCAL_TEXTURE);
						else if(widget.loadTextureNormal)
							widget.loadTextureNormal(imageName, ccui.Widget.LOCAL_TEXTURE);
						FWUI.fillData_image3(widget, scale, color, locked, size);
					});				
				return;
			}
		}
		
		if(widget.loadTexture)
			widget.loadTexture(imageName, textureType); // image	//BUG HERE: invaild native object
		else if(widget.loadTextureNormal)
			widget.loadTextureNormal(imageName, textureType); // button

		this.fillData_image3(widget, scale, color, locked, size);
	},
	
	fillData_image3:function(widget, scale, color, locked, size)
	{
		//already set in fillData_image
        /*if (typeof color === "string")
		{
			//web only
if(!cc.sys.isNative)
			eval("var data = arguments[1];");
			
			color = eval(color);
		}*/
		widget.setColor(color || cc.WHITE);//widget.setColor(cc.WHITE);

		if(scale)
		{
			if(scale.x !== undefined && scale.y !== undefined)	
				widget.setScale(scale.x, scale.y);
			else
				widget.setScale(scale);
		}
		else if(size)
		{
			if(size.width !== undefined && size.height !== undefined)
				widget.setContentSize(size.width, size.height);
			else
				widget.setScale(size / widget.getContentSize().width);
		}
		else
			widget.setScale(1);

		if (locked !== undefined)
            FWUtils.applyGreyscaleNode(widget, locked);
	},
	
	fillData_imageFromUrl:function(widget, imageName, scale, color, locked, size, textureType)
	{
		if(textureType === undefined) textureType = ccui.Widget.PLIST_TEXTURE;
		
		// placeholder
		FWUI.fillData_image2(widget, "hud/hud_avatar_default.png", scale, color, locked, size);
		
		if(!cc.sys.isNative)
		{
			var url;
			if (imageName == 'http://zingplay.static.g6.zing.vn/images/zpp/zpdefault.png')
				url = 'https://cdn-kvtmh5-vn.zingplay.com/images/zpdefault.png';
			else
				url = imageName;//"https://crossorigin.me/" + imageName;
			
			cc.log("FWUI::fillData_imageFromUrl: imageName=" + imageName + ", url=" + url);
            cc.loader.loadImg(url, {isCrossOrigin:true}, function(err, img){

				if(err)
				{
					cc.log("FWUI::fillData_imageFromUrl failed: " + imageName);
					return;
				}
				
				var texture2d = new cc.Texture2D();
				texture2d.initWithElement(img);
				texture2d.handleLoadedTexture();
				var frame = new cc.SpriteFrame(texture2d, cc.rect(0 ,0 ,img.width, img.height));
				cc.spriteFrameCache.addSpriteFrame(frame, imageName);
				
				if(cc.sys.isObjectValid(widget))
				{
					if(widget.loadTexture)
						widget.loadTexture(imageName, textureType); // image
					else if(widget.loadTextureNormal)
						widget.loadTextureNormal(imageName, textureType); // button			
					FWUI.fillData_image3(widget, scale, color, locked, size);
				}				
            });
			
			return;
		}
		
		// fix: cannot load avatar on iOS
		if(fr.platformWrapper.getOsName() === "IOS")
		{
			cc.loader.loadImg(imageName, {isCrossOrigin:true}, function(err, img)
			{
				if(err)
				{
					cc.log("FWUI::fillData_imageFromUrl failed: " + imageName);
					return;
				}
				
				var frame = new cc.SpriteFrame(img, cc.rect(0 ,0 ,img.width, img.height));
				cc.spriteFrameCache.addSpriteFrame(frame, imageName);
				
				if(cc.sys.isObjectValid(widget))
				{
					if(widget.loadTexture)
						widget.loadTexture(imageName, textureType); // image
					else if(widget.loadTextureNormal)
						widget.loadTextureNormal(imageName, textureType); // button			
					FWUI.fillData_image3(widget, scale, color, locked, size);
				}
			});	
			
			return;
		}

		cc.loader.loadImg(imageName, function(err, img)
		{
            if(err)
			{
				cc.log("FWUI::fillData_imageFromUrl failed: " + imageName);
				return;
			}
			
			var frame = new cc.SpriteFrame(img, cc.rect(0 ,0 ,img.width, img.height));
			cc.spriteFrameCache.addSpriteFrame(frame, imageName);
				
			if(cc.sys.isObjectValid(widget))
			{
				if(widget.loadTexture)
					widget.loadTexture(imageName, textureType); // image
				else if(widget.loadTextureNormal)
					widget.loadTextureNormal(imageName, textureType); // button			
				FWUI.fillData_image3(widget, scale, color, locked, size);
			}
        });	
	},

	// fill spine
	fillData_spine: function (widget, data, def) {

		//web only
if(!cc.sys.isNative)
		eval("var data = arguments[1];");
	
		var spineToFill = null;
		if ("spineToFill" in def)
			spineToFill = def ["spineToFill"];
		else
			spineToFill = this.getDataToFill(data, def);
		
		// jira#4686: try to reuse existing spine to avoid flicker
		if(spineToFill === SPINE_EFFECT_POT_SLOT || spineToFill === SPINE_NPC_QUEST)
		{
			var filledSpine = widget.getChildByTag(UI_FILL_DATA_TAG);
			if(filledSpine && filledSpine.poolKey === spineToFill)
				return;
		}

        var isLocked = def["locked"];
        if (typeof isLocked === "string")
            isLocked = eval(isLocked);
		
		var color = def.color;
		if(_.isString(color))
			color = eval(color);

		var scale = spineToFill.scale || def.scale;
		if(_.isString(scale))
			scale = eval(scale);

		var rotate = spineToFill.rotate || def.rotate;
		if(_.isString(rotate))
			rotate = eval(rotate);

		this.fillData_spine2(widget, spineToFill.spine || spineToFill, spineToFill.skin || def.skin, spineToFill.anim || def.anim || data[def.animField], scale, rotate, color, isLocked, def.loop === false ? false : true);
	},
	
	// common func for fillData_spine and fillData_item
	fillData_spine2:function(widget, spineName, skin, anim, scale, rotate, color, locked, loop, offset)
	{
		this.unfillData_spine(widget);
		
		var spine = FWPool.getNode(spineName);
		spine.setTag(UI_FILL_DATA_TAG);
		spine.setPosition(0, 0);
		if(scale !== undefined)
		{
			if(scale.x !== undefined && scale.y !== undefined)
				spine.setScale(scale.x, scale.y);
			else
				spine.setScale(scale);
		}
		else
			spine.setScale(1);
		
		if(rotate !== undefined)
			spine.setRotation(rotate);
		
		spine.animation = anim;
		if (anim !== undefined)
			spine.setAnimation(0, anim, loop);

		spine.skin = skin;
		if (skin !== undefined)
			spine.setSkin(skin);

		spine.setColor(color || cc.WHITE);
		widget.addChild(spine);
		var size = widget.getContentSize();
		if(offset !== undefined)
			spine.setPosition(size.width / 2 + offset.x, size.height / 2 + offset.y);
		else
			spine.setPosition(size.width / 2, size.height / 2);

		if (locked !== undefined)
			FWUtils.applyGreyscaleSpine(spine, locked);
		
		return spine;
	},

	// unfill spine
	unfillData_spine: function (widget) {
		var filledSpine = widget.getChildByTag(UI_FILL_DATA_TAG);
		if (filledSpine !== null) {
			widget.removeChild(filledSpine);
			FWPool.returnNode(filledSpine);
		}
	},

	// fill list
	fillData_list: function (widget, data, def) {
		this.unfillData_list(widget);

		var itemsToFill = this.getDataToFill(data, def);
		var itemUIName = def["itemUI"];
		var itemDef = def["itemDef"];
		var itemSize = def["itemSize"];
		var len = itemsToFill.length;
		var child = null;

		for (var i = 0; i < itemsToFill.length; i++) {
			if(!itemsToFill[i])
				continue;
			
			child = FWPool.getNode(itemUIName);
			child.setContentSize(itemSize);
			child.setScale(1);
			child.setTag(UI_FILL_DATA_TAG);
			this.fillData(child, itemsToFill[i], itemDef);
			widget.addChild(child);
		}
		
		if(widget.setScrollBarOpacity) //web
			widget.setScrollBarOpacity(0);
	},

	// unfill list
	unfillData_list: function (widget) {
		var child;
		var children = _.clone(widget.getChildren());
		for (var i = 0, len = children.length; i < len; i++) {
			child = children[i];
			if (child.getTag() === UI_FILL_DATA_TAG) {
				this.unfillData(child);
				widget.removeChild(child);
				FWPool.returnNode(child);
			}
			else if (child.getTag() === UI_FILL_DATA_TAG_BG)
				widget.removeChild(child);
		}
	},
	
	// TODO: define in use uiDef
	alignPanelItemsHorizontally:function(panel, space)
	{
		var children = panel.getChildren();
		if(children.length <= 0)
			return;
		
		if(space === undefined)
			space = 5;
		
		var w = -space;
		for(var i=0; i<children.length; i++)
		{
			if(!children[i].isVisible())
				continue;
			w += children[i].getContentSize().width + space;
		}
		
		var x = -w / 2
		for(var i=0; i<children.length; i++)
		{
			if(!children[i].isVisible())
				continue;
			children[i].setPositionX(x + children[i].getAnchorPoint().x * children[i].getContentSize().width);
			x += children[i].getContentSize().width + space;
		}
	},

	// fill 2d list
	// TODO:
	// - full support for alignment
	// - auto process pageButton
	fillData_2dlist: function (widget, data, def) {
		this.unfillData_list(widget);
		
		var itemsToFill = this.getDataToFill(data, def);
		if(!itemsToFill)
			return;
		
		// def
		var itemUIName = def["itemUI"];
		var itemDef = def["itemDef"];
		var itemSize = def["itemSize"];
		var isVertical = (def["itemDirection"] === "vertical");
		var isSingleLine = (def["singleLine"] === true);
		var itemBackground = def["itemBackground"];
		var itemBackgroundScale = (def["itemBackgroundScale"] || 1);
		var itemsPosition = def["itemsPosition"];
		var itemsAlign = def["itemsAlign"];
		var cancelDragDuration = def["cancelDragDuration"];
		var innerContainerWAdd = def["innerContainerWAdd"];
		var child = null;

		if(!innerContainerWAdd) innerContainerWAdd = 0;
		// paging?
		var startIndex, endIndex, len;
		var itemsPerPage = def["itemsPerPage"];
		if (itemsPerPage === undefined) {
			// no paging
			startIndex = 0;
			endIndex = itemsToFill.length;
			len = endIndex;
		}
		else {
			// paging
			widget.uiPagesCount = FWUtils.fastFloor(itemsToFill.length / itemsPerPage) + ((itemsToFill.length % itemsPerPage) === 0 ? 0 : 1);
			var currentPage = widget.uiCurrentPage;
			if (currentPage === undefined || currentPage >= widget.uiPagesCount)
				widget.uiCurrentPage = currentPage = 0;
			startIndex = currentPage * itemsPerPage;
			endIndex = startIndex + itemsPerPage;
			if (endIndex > itemsToFill.length)
				endIndex = itemsToFill.length;
			len = endIndex - startIndex;
		}

		// align
		var containerW = widget.getContentSize().width, containerH = widget.getContentSize().height;
		var itemHalfWidth = itemSize.width / 2, itemHalfHeight = itemSize.height / 2;
		var colsCount, rowsCount, dir;
		if (isVertical) {
			if(isSingleLine)
			{
				dir = ccui.ScrollView.DIR_VERTICAL;
				rowsCount = len;
				colsCount = 1;
			}
			else
			{
				dir = ccui.ScrollView.DIR_HORIZONTAL;
				rowsCount = FWUtils.fastFloor(containerH / itemSize.height);
				if(rowsCount > len)
					rowsCount = len;
				colsCount = FWUtils.fastFloor(len / rowsCount);
				if (colsCount * rowsCount < len)
					colsCount++;
			}
		}
		else {
			if(isSingleLine)
			{
				dir = ccui.ScrollView.DIR_HORIZONTAL;
				colsCount = len;
				rowsCount = 1;
			}
			else
			{
				dir = ccui.ScrollView.DIR_VERTICAL;
				colsCount = FWUtils.fastFloor(containerW / itemSize.width);
				if(colsCount > len)
					colsCount = len;
				rowsCount = FWUtils.fastFloor(len / colsCount);
				if (colsCount * rowsCount < len)
					rowsCount++;
			}
		}
		var x = itemHalfWidth, y = rowsCount * itemSize.height - itemHalfHeight;
		var innerContainerW = colsCount * itemSize.width + innerContainerWAdd, innerContainerH = rowsCount * itemSize.height;
		if (innerContainerH < containerH) {//if (!isVertical && innerContainerH < containerH) {
			y += containerH - innerContainerH;
			innerContainerH = containerH;
		}

		// items align
		// currently support horizontal center
		if(itemsAlign === "center" && innerContainerW <= containerW && isVertical === false)
		{
			x = (containerW - innerContainerW + itemSize.width) / 2;
			dir = ccui.ScrollView.DIR_NONE;
		}
		
		// scroll view
		if (widget.setDirection !== undefined)
		{
			widget.setDirection(dir);
			
			// fix: can scroll although direction is set to DIR_NONE			
			//widget.setTouchEnabled(widget.getDirection() !== ccui.ScrollView.DIR_NONE && (innerContainerW > containerW || innerContainerH > containerH));
			var canScroll = (widget.getDirection() !== ccui.ScrollView.DIR_NONE && (innerContainerW > containerW || innerContainerH > containerH));
			widget.setBounceEnabled(canScroll);
			if(widget.setScrollBarEnabled) //web
				widget.setScrollBarEnabled(canScroll);
			
			widget.setInnerContainerSize(cc.size(innerContainerW, innerContainerH));
			if(canScroll && widget.setScrollBarOpacity) widget.setScrollBarOpacity(0);
		}
		var startX = x, startY = y;
			
		// fill
		for (var i = startIndex; i < endIndex; i++) {
			// undefined item: skip
			// null item: skip but leave a blank slot
			if(itemsToFill[i] === undefined)
				continue;
			
			if (itemsPosition !== undefined) {
				// custom item pos
				var pos = itemsPosition[i - startIndex];
				x = startX + pos[0] * itemSize.width;
				y = startY - pos[1] * itemSize.height;
			}

			if(itemsToFill[i])
			{
				if (itemBackground !== undefined) {
					// item background
					var bg = new cc.Sprite(itemBackground);
					bg.setPosition(x, y);
					bg.setAnchorPoint(0.5, 0.5);
					bg.setScale(itemBackgroundScale);
					widget.addChild(bg, 0, UI_FILL_DATA_TAG_BG);
				}

				// item
				child = FWPool.getNode(itemUIName);
				child.setContentSize(itemSize);
				child.setScale(1);
				child.setPosition(x, y);
				child.setAnchorPoint(0.5, 0.5);
				if (cancelDragDuration !== null) {
					child.cancelDragDuration = cancelDragDuration;
				}
				this.fillData(child, itemsToFill[i], itemDef);
				widget.addChild(child, 1, UI_FILL_DATA_TAG);
				if(itemsToFill[i].zOrder !== undefined)
					child.setLocalZOrder(itemsToFill[i].zOrder);
			}

			// next item pos
			if (itemsPosition === undefined) {
				if (isVertical) {
					y -= itemSize.height;
					if (!isSingleLine && y - itemHalfHeight < 0) {
						y = startY;
						x += itemSize.width;
					}
				}
				else {
					x += itemSize.width;
					if (!isSingleLine && x + itemHalfWidth > containerW) {
						x = startX;
						y -= itemSize.height;
					}
				}
			}
		}
	},

	// fill progress bar
	fillData_progressBar: function (widget, data, def) {
		var value = this.getDataToFill(data, def);
		var maxValue = def["maxValue"];
		if (maxValue === undefined)
			maxValue = 100;

		// fill bar
		var valueToFill = FWUtils.fastFloor(value * 100 / maxValue);
		widget.setPercent(valueToFill);

		// show text
		var text = this.getChildByName(widget, "text");
		if (text !== null) {
			// TODO: replace hardcoded texts
			if (maxValue === 100)
				text.string = valueToFill + "%";
			else
				text.string = value + "/" + maxValue;
		}
	},
	
	// fill time bar
	fillData_timeBar:function(widget, data, def)
	{
		//web only
if(!cc.sys.isNative)
		eval("var data = arguments[1];");
		
		this.unfillData_timeBar(widget);
		
		var uiTime;
		if(def.useExisting)
		{
			// use designed time bar instead of adding new one
			uiTime = widget;
		}
		else
		{
			uiTime = FWPool.getNode(UI_TIME);
			uiTime.setTag(UI_FILL_DATA_TAG);
			uiTime.setPosition(0, 0);
			uiTime.setAnchorPoint(0.5, 0.5);
			uiTime.setContentSize(cc.size(140, 40));
			
			var scaleTime = def.scaleTime;
			if(!scaleTime) scaleTime=1;
			uiTime.setScale(scaleTime);
			widget.addChild(uiTime);
		}

		if(_.isString(def.startTime))
		{
			if(data && data[def.startTime])
				widget.timeBarStartTime = data[def.startTime];
			else
				widget.timeBarStartTime = eval(def.startTime);
		}
		else
			widget.timeBarStartTime = def.startTime;
		if(_.isString(def.endTime))
		{
			if(data && data[def.endTime])
				widget.timeBarEndTime = data[def.endTime];
			else
				widget.timeBarEndTime = eval(def.endTime);
		}
		else
			widget.timeBarEndTime = def.endTime;
		widget.timeBarEndTime++; // + missing sec
		
		widget.timeBarCountdown = def.countdown;
		widget.timeBarText = this.getChildByName(uiTime, "timeText");
		widget.timeBarBar = this.getChildByName(uiTime, "timeBar");
		if(def.isVisibleTimeBarBar == null) def.isVisibleTimeBarBar = true;
		if(def.isVisibleTimeBg == null) def.isVisibleTimeBg = true;
		this.getChildByName(uiTime, "timeBg").setVisible(def.isVisibleTimeBg);
		widget.timeBarBar.setVisible(def.isVisibleTimeBarBar);
		widget.timeBarUpdate = function(dt) {FWUI.update_timeBar(this, dt);}
		widget.timeBarFinished = false;
		this.applyTextStyle(widget.timeBarText, def.timeTextStyle || TEXT_STYLE_TEXT_SMALL);//widget.timeBarText.enableShadow(SHADOW_DEFAULT[0], SHADOW_DEFAULT[1]);
		
		cc.director.getScheduler().scheduleCallbackForTarget(widget, widget.timeBarUpdate, 1, cc.REPEAT_FOREVER, 0.01, false); // intentionally delay 0.01 to update display asap
	},

	// unfill time bar
	unfillData_timeBar:function(widget)
	{
		cc.director.getScheduler().unscheduleCallbackForTarget(widget, widget.timeBarUpdate);
		
		var uiTime = widget.getChildByTag(UI_FILL_DATA_TAG);
		if (uiTime !== null)
		{
			widget.removeChild(uiTime);
			FWPool.returnNode(uiTime);
		}
		
		delete widget.timeBarStartTime;
		delete widget.timeBarEndTime;
		delete widget.timeBarCountdown;
		delete widget.timeBarText;
		delete widget.timeBarBar;
		delete widget.timeBarUpdate;
		delete widget.timeBarFinished;
	},

	// update time bar
	update_timeBar:function(widget, dt)//web update_timeBar:function(widget, dt = 0)
	{
		if(dt === undefined)
			dt = 0;
		
		var finished = false;
		var remainTime = widget.timeBarEndTime - Game.getGameTimeInSeconds();
		if(remainTime < 0)
		{
			remainTime = 0;
			finished = true;
		}
		
		var duration = widget.timeBarEndTime - widget.timeBarStartTime;
		if(widget.timeBarCountdown === true)
		{
			widget.timeBarBar.setPercent(remainTime * 100 / duration);

			widget.timeBarText.setString(FWUtils.secondsToTimeString(remainTime));
		}
		else
		{
			widget.timeBarBar.setPercent(100 - remainTime * 100 / duration);
			widget.timeBarText.setString(FWUtils.secondsToTimeString(duration - remainTime));
		}
		//widget.timeBarText.setVisible(true);
		// callback
		if(finished === true)
		{
			if(widget.timeBarFinished === false)
			{
				widget.timeBarFinished = true;
				if(widget.uiDef.onFinished)
					widget.uiDef.onFinished(widget);
			}
		}
		else if(widget.uiDef && widget.uiDef.onTick)
			widget.uiDef.onTick(widget, remainTime);
	},	
	
	// fill item gfx
	fillData_item:function(widget, data, def)
	{
		this.unfillData_item(widget);
		
		var itemId = this.getDataToFill(data, def);
		var gfx = Game.getItemGfxByDefine(itemId, def.options);
		var childSprite = this.getChildByName(widget, "sprite");
		var color = def.color;
		if(color !== undefined && _.isString(color))
		{
			//web only
			if(!cc.sys.isNative && data !== null) // added data !== null check to fix obfucsation bug
				eval("var data = arguments[1];");
			color = eval(color);
		}
		
		if(gfx.sprite)
		{
			childSprite.setVisible(true);
			this.fillData_image2(childSprite, gfx.sprite, (def.scale || 1) * (gfx.scale || 1), color);
		}
		else
		{
			childSprite.setVisible(false);
			this.fillData_spine2(widget, gfx.spine, def.skin || gfx.skin, def.anim || gfx.anim, (def.scale || 1) * (gfx.scale || 1), undefined, color, undefined, def.loop?true:undefined, gfx.offset);
		}
		widget.itemGfx = gfx;
	},

	// unfill item
	unfillData_item:function(widget)
	{
		if(widget.itemGfx && widget.itemGfx.spine)
			this.unfillData_spine(widget);
		delete widget.itemGfx;
	},
	
	unfillData_image:function(widget)
	{
		if(widget.discardTexture)
		{
			FWLoader.discardTexture(widget.discardTexture);
			delete widget.discardTexture;
			
			if(widget.loadTexture)
				widget.loadTexture("hud/hud_loading_circle.png", ccui.Widget.PLIST_TEXTURE);
			else if(widget.loadTextureNormal)
				widget.loadTextureNormal("hud/hud_loading_circle.png", ccui.Widget.PLIST_TEXTURE);
		}
	},
	
	// get data to fill in ui
	getDataToFill: function (data, def) {
		var type = def["type"];
		if (type < UITYPE_LIST) {
			// single item
			var value = undefined;
			if (def["field"] !== undefined)
				value = data[def["field"]];
			else if (def["id"] !== undefined)
				value = def["id"];
			else if (def["value"] !== undefined)
				value = def["value"];
			var subType = def["subType"];
			if (value !== undefined && subType !== undefined) {
				// below code is kept for compatibility only, TODO: remove ////////////
				// next time, use UITYPE_ITEM + getItemGfxByDefine instead ////////////
				if (subType === defineTypes.TYPE_PLANT) {
					/*removed if (value === ID_BRUSH) // sp case: brush in plant list :(
						value = {spine: SPINE_BRUSH, anim: "icon_menu_active", scale: 1};
					else*/
						value = Game.getItemGfxByDefine(value).sprite;//value = Game.getPlantSpineByDefine(value);
				}
				else if (subType === defineTypes.TYPE_POT)
					value = {spine: Game.getPotSpineByDefine(value), skin: Game.getPotSkinByDefine(value)};
				else if (subType === defineTypes.TYPE_DECOR)
					value = {spine: Game.getDecorSpineByDefine(value), skin: Game.getDecorSkinByDefine(value)};
				else if (subType === defineTypes.TYPE_MATERIAL)
					value = Game.getMaterialSpriteByDefine(value);
				else if (subType === defineTypes.TYPE_PRODUCT)
					value = Game.getProductSpriteByDefine(value);
				else if (subType === defineTypes.TYPE_PEST)
				{
					if(type === UITYPE_SPINE)
						value = Game.getBugSpineByDefine(value);
					else
						value = Game.getItemGfxByDefine(value).sprite;
				}
                else if (subType === defineTypes.TYPE_MINERAL)
                    value = Game.getItemGfxByDefine(value).sprite;
                else if (subType === defineTypes.TYPE_PEARL)
                    value = Game.getItemGfxByDefine(value).sprite;
                else if (subType === defineTypes.TYPE_MACHINE)
                    value = Game.getItemGfxByDefine(value).sprite;
                else if (subType === defineTypes.TYPE_ACHIEVEMENT)
                    value = Game.getItemGfxByDefine(value).sprite;
                else if (subType === defineTypes.TYPE_EVENT)
                    value = Game.getItemGfxByDefine(value).sprite;
                else if (subType === defineTypes.TYPE_SKIN)
                    value = Game.getItemGfxByDefine(value).sprite;
				///////////////////////////////////////////////////////////////////////
				///////////////////////////////////////////////////////////////////////
			}

			return value;
		}
		else {
			// list
			var itemsToFill = def["items"];
			if (!itemsToFill)
				if (def["field"] !== undefined)
					itemsToFill = data[def["field"]];

			if (!itemsToFill || itemsToFill.constructor === Array)
				return itemsToFill;
			else {
				// convert object properties to array
				var arrayToFill = [];
				for (var key in itemsToFill)
					arrayToFill.push(itemsToFill[key]);
				return arrayToFill;
			}
		}
		return undefined;
	},

	getUiDef: function (widget, name) {
		if (!widget || !widget.uiDef)
			return undefined;
		return widget.uiDef[name];
	},

	setUiDef: function (widget, name, value) {
		if (!widget.uiDef)
			widget.uiDef = {};
		widget.uiDef[name] = value;
	},

	removeUiDef: function (widget, name) {
		if (!widget.uiDef)
			return;
		delete widget.uiDef[name];
	},

	// set current page and return a string indicating current page
	set2dlistPage: function (widget, page, offset) {//web set2dlistPage: function (widget, page, offset = false) {
		if(offset === undefined)
			offset = false;
		
		var data = widget.uiData;
		var def = widget.uiDef;
		var itemsToFill = this.getDataToFill(data, def);
		if (itemsToFill === undefined || itemsToFill === null || itemsToFill.length <= 0)
			return "0/0";

		if (offset === false)
			widget.uiCurrentPage = page;
		else {
			widget.uiCurrentPage += page;
			if (widget.uiCurrentPage < 0)
				widget.uiCurrentPage = widget.uiPagesCount - 1;
			else if (widget.uiCurrentPage >= widget.uiPagesCount)
				widget.uiCurrentPage = 0;
		}

		this.fillData_2dlist(widget, data, def);
		return ((widget.uiCurrentPage + 1) + "/" + widget.uiPagesCount);
	},

	dragParent: null, // parent of dragging object
	dragOffset: null, // to keep correct offset when dragging
	dragStartPos: null, // position before dragging
	dragStartPosLocal: null, // local position before dragging
	dragStartZLocal: 0, // local z order before dragging
	draggedWidget: null,
	touchedWidget: null,

	// register events for ui and its children
	registerEvents: function (widget) {
		if (widget.isTouchEnabled !== undefined && widget.isTouchEnabled())
			widget.addTouchEventListener(this.onWidgetEvent, this);

		var children = widget.getChildren();
		for (var i = 0; i < children.length; i++)
			this.registerEvents(children[i]);
	},

	// unregister events for ui and its children
	unregisterEvents: function (widget) {
		if (widget.isTouchEnabled !== undefined && widget.isTouchEnabled())
		{
			widget.addTouchEventListener(null, null);
			if(widget === this.touchedWidget)
				this.touchedWidget = null; // fix: touching on a closing widget freezes game
		}

		var children = widget.getChildren();
		for (var i = 0; i < children.length; i++)
			this.unregisterEvents(children[i]);
	},

	// handle ui events
	onWidgetEvent: function (widget, type) {
		if (type === ccui.Widget.TOUCH_BEGAN) {
			if (this.touchedWidget !== null || this.draggedWidget !== null)
				return;

			if (Game.gameScene)
				Game.gameScene.lastActionTime = Game.getGameTimeInSeconds();			
			this.touchedWidget = widget;
			this.dragOffset = cc.p(widget.getTouchBeganPosition().x - widget.getPosition().x, widget.getTouchBeganPosition().y - widget.getPosition().y);
			this.dragStartPos = widget.getPosition();
			this.onWidgetEvent_touchBegan(widget);

			if (this.getUiDef(widget, "notifyBlockedTouch") === true)
				Game.onBlockedTouchBegan(widget.getTouchBeganPosition().x, widget.getTouchBeganPosition().y);

			// jira#4989
            /*this.holdBeganCallback = this.getUiDef(widget, "onHoldBegan");
            this.holdEndedCallback = this.getUiDef(widget, "onHoldEnded");

            this.holdTouchTime = this.holdTouchTime || 0;
            if (this.holdTouchTime <= 0) {
                this.holdBegan = false;
                this.holdTouchTime = _.now();
			}

            if (!this.isUpdateHoldScheduled) {
                this.isUpdateHoldScheduled = true;
                cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateHoldWidget, 0.1, cc.REPEAT_FOREVER, 0, false);
			}*/
			if(this.getUiDef(widget, "onTouchHold"))
				cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateHoldWidget, 0.1, cc.REPEAT_FOREVER, 0.5, false);
		}
		else if (type === ccui.Widget.TOUCH_ENDED || type === ccui.Widget.TOUCH_CANCELED) {
			if (this.touchedWidget !== widget)
			{
				Game.onTouchEndedWrongWidget(widget);
				return;
			}

			// jira#4989
			/*if (this.holdTouchTime > 0) {
                this.holdTouchTime = 0;
                if (this.holdBegan) {
                    this.holdBegan = false;
                    this.holdEndedCallback && this.holdEndedCallback(this.touchedWidget);
				}
			}*/
			if(this.getUiDef(widget, "onTouchHold"))
				cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateHoldWidget);

			var notifyBlockedTouch = this.getUiDef(widget, "notifyBlockedTouch");
			if (notifyBlockedTouch === true)
				Game.onBlockedTouchEnded(widget.getTouchEndPosition().x, widget.getTouchEndPosition().y);
			
			// jira#4989
			/*if(this.getUiDef(widget, "onTouchHold"))
			{
				cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateHoldWidget);
				this.isUpdateHoldScheduled = false;
			}*/
			
			// only trigger event if touch end position is inside ui
			var dragTag = this.getUiDef(widget, "dragTag");
			if ((this.widgetContainsPoint(widget, widget.getTouchEndPosition())
				//&& (notifyBlockedTouch !== true || cc.PLENGTH(cc.PSUB(widget.getTouchBeganPosition(), widget.getTouchEndPosition())) < FWUI.validScrollGap)) // do not trigger event if user is scrolling
				&& (dragTag !== undefined || cc.PLENGTH(cc.PSUB(widget.getTouchBeganPosition(), widget.getTouchEndPosition())) < FWUI.validScrollGap)) // do not trigger event if user is scrolling
				|| this.getUiDef(widget, "forceTouchEnd") === true)
					this.onWidgetEvent_touchEnded(widget);	

			var isCallBackTouchCancel = this.getUiDef(widget, "isCallBackTouchCancel");
			if(isCallBackTouchCancel && type === ccui.Widget.TOUCH_CANCELED){
				var name = widget.getName();
				cc.log("FWUI::onWidgetEvent_touchCancel: " + name);

				var callback = this.getUiDef(widget, "callBackTouchCancel");
				if (callback !== undefined) {
					callback(widget);
				}
			}

			// check for dropping
			if (dragTag !== undefined && this.draggedWidget === widget) {
				if (this.checkDrop(widget) === false) {
					if (this.dragParent !== null && this.isWidgetShowing(this.dragParent, true) === false)
						this.hideDraggedWidget(widget);
					else {
						var duration;
						if (widget.cancelDragDuration) {
							duration = widget.cancelDragDuration;
						} else {
							duration = UI_CANCEL_DRAG_DURATION;
						}
						// move to original position
						var moveTo = cc.moveTo(duration, this.dragStartPos);
						var sequence = cc.sequence(moveTo, cc.callFunc(this.onDraggedWidgetMovedToOriginalPosition.bind(this), widget));
						widget.runAction(sequence);
					}
				}
			}
			
			this.touchedWidget = null;
		}
		else if (type === ccui.Widget.TOUCH_MOVED) {
			if (this.touchedWidget !== widget)
				return;

			if (this.getUiDef(widget, "dragTag")) {
				// drag
				this.draggedWidget = widget;
				if (widget.getTag() === UI_FILL_DATA_TAG && this.dragParent === null) {
					// for filled list item, we must detach it from list before dragging
					this.dragStartPosLocal = widget.getPosition();
					this.dragStartZLocal = widget.getLocalZOrder();
					this.dragOffset = cc.p(widget.getTouchBeganPosition().x - widget.getWorldPosition().x, widget.getTouchBeganPosition().y - widget.getWorldPosition().y);
					this.dragParent = widget.getParent();
					this.dragParent.removeChild(widget);

					// add item to new parent, TODO: get correct parent node
					var newParent = FWUtils.getCurrentScene();
					newParent.addChild(widget, Z_UI_DRAG);

					// reset position
					this.dragStartPos = cc.p(widget.getTouchMovePosition().x - this.dragOffset.x, widget.getTouchMovePosition().y - this.dragOffset.y);
					widget.setPosition(this.dragStartPos);
				}
				else
					widget.setPosition(widget.getTouchMovePosition().x - this.dragOffset.x, widget.getTouchMovePosition().y - this.dragOffset.y);

				// check if widget can be dropped while moving
				if (this.getUiDef(widget, "dropOnMove") === true)
					this.checkDrop(widget);
			}

			// jira#4989
            /*if (this.holdTouchTime > 0) {
            	var distance = cc.PLENGTH(cc.PSUB(widget.getTouchMovePosition(), widget.getTouchBeganPosition()));
            	if (distance >= 40) {
            		this.holdTouchTime = 0;
            		if (this.holdBegan) {
                        this.holdBegan = false;
                        this.holdEndedCallback && this.holdEndedCallback(this.touchedWidget);
					}
				}
            }*/

			if (this.getUiDef(widget, "notifyBlockedTouch") === true)
				Game.onBlockedTouchMoved(widget.getTouchMovePosition().x, widget.getTouchMovePosition().y);
		}
	},

	onWidgetEvent_touchBegan: function (widget) {
		var name = widget.getName();
		cc.log("FWUI::onWidgetEvent_touchBegan: " + name);
		
		if(!Tutorial.acceptInput(name))
			return;

		var callback = this.getUiDef(widget, "onTouchBegan");
		if (callback !== undefined) {
			callback(widget);
			return;
		}

		Game.onWidgetEvent_touchBegan(widget);
	},

	onWidgetEvent_touchEnded: function (widget) {
		if(this.hasTouchedUI && Game.gameScene)
			return;
		this.hasTouchedUI = true;
		
		var name = widget.getName();
		cc.log("FWUI::onWidgetEvent_touchEnded: " + name);

		if(!Tutorial.acceptInput(name))
			return;

		Tutorial.onGameEvent(EVT_TOUCH_END, name, widget);

		var callback = this.getUiDef(widget, "onTouchEnded");
		if (callback !== undefined) {
			callback(widget);
			return;
		}

		Game.onWidgetEvent_touchEnded(widget);
	},

	// return true if dropping is successful
	// return false if you want to cancel dropping
	// and draggedWidget will be moved back to its original position
	onWidgetEvent_drop: function (draggedWidget, droppedWidget) {
		cc.log("FWUI::onWidgetEvent_drop: " + (draggedWidget.getName === undefined ? draggedWidget : draggedWidget.getName()) + " " + (droppedWidget.getName === undefined ? droppedWidget : droppedWidget.getName()));

		var callback = this.getUiDef(draggedWidget, "onDrop");
		if (callback !== undefined)
			return callback(draggedWidget, droppedWidget);
		callback = this.getUiDef(droppedWidget, "onDrop");
		if (callback !== undefined)
			return callback(draggedWidget, droppedWidget);

		return Game.onWidgetEvent_drop(draggedWidget, droppedWidget);
	},

	onDraggedWidgetMovedToOriginalPosition: function (widget) {
		// cancelled dragging item, add it to list again
		if (this.dragParent !== null) {
			widget.removeFromParent();
			this.dragParent.addChild(widget, this.dragStartZLocal);
			this.dragParent = null;
			widget.setPosition(this.dragStartPosLocal);
		}
		this.draggedWidget = null;
	},

	getWidgetBoundingBox: function (widget) {
		var type = this.getUiDef(widget, "type");
		if (type === UITYPE_SPINE) {
			// fix: use panel's bounding box instead of spine's bounding box
			//var child = widget.getChildByTag(UI_FILL_DATA_TAG);
			//if (child !== null)
			//	return child.getBoundingBox();
			return widget.getBoundingBoxToWorld();
		}
		else if (type === UITYPE_FWOBJECT) {
			// TODO: support multiple bounding boxes of FWObject
			return widget.getBoundingBox();
		}
		else if(!cc.sys.isNative && widget.getTag() === UI_FILL_DATA_TAG) //web
		{
			var pos = FWUtils.getWorldPosition(widget);
			var size = widget.getContentSize();
			return cc.rect(pos.x - size.width / 2, pos.y - size.height / 2, size.width, size.height);
		}
		return widget.getBoundingBoxToWorld();
	},

	// check if widget contains point
	widgetContainsPoint: function (widget, point) {
		return cc.rectContainsPoint(this.getWidgetBoundingBox(widget), point);
	},

	// check if widget1 intersects widget2
	widgetIntersectsWidget: function (widget1, widget2) {
		return cc.rectIntersectsRect(this.getWidgetBoundingBox(widget1), this.getWidgetBoundingBox(widget2));
	},

	// get interect rect of widget1 and widget2
	getWidgetIntersectionWidget: function (widget1, widget2) {
		return cc.rectIntersection(this.getWidgetBoundingBox(widget1), this.getWidgetBoundingBox(widget2));
	},

	// register droppables
	droppables: {},
	registerDroppables: function (widget, recursive) {//web registerDroppables: function (widget, recursive = true) {
		if(recursive === undefined)
			recursive = true;
		
		var dropTag = this.getUiDef(widget, "dropTag");
		if(dropTag)
		{
			var droppablesList = this.droppables[dropTag];
			if(!droppablesList)
				this.droppables[dropTag] = droppablesList = [];
			if(droppablesList.indexOf(widget) < 0)
				droppablesList.push(widget);
		}
		
		if(recursive)
		{
			var children = widget.getChildren();
			for(var i=0, len=children.length; i<len; i++)
				this.registerDroppables(children[i]);
		}
	},

	// unregister droppables
	unregisterDroppables: function (widget, recursive) {//web unregisterDroppables: function (widget, recursive = true) {
		if(recursive === undefined)
			recursive = true;
		
		var dropTag = this.getUiDef(widget, "dropTag");
		if(dropTag)
		{
			var droppablesList = this.droppables[dropTag];
			if(droppablesList)
				FWUtils.removeArrayElement(droppablesList, widget);
		}

		if(recursive)
		{
			var children = widget.getChildren();
			for (var i=0, len=children.length; i<len; i++)
				this.unregisterDroppables(children[i]);
		}
	},

	// check if we can drop widget
	checkDrop: function (widget) {
		var dragTag = this.getUiDef(widget, "dragTag");
		if(dragTag)
		{
			var droppablesList = this.droppables[dragTag];
			if(droppablesList)
			{
				var widgetBoundingBox = this.getWidgetBoundingBox(widget);
				for(var i=0, len=droppablesList.length; i<len; i++)
				{
                    //BUG HERE: widgetBoundingBox, rectB can be null
					var rectB = this.getWidgetBoundingBox(droppablesList[i]);
					if (!rectB)
						continue;
					
					if(cc.rectIntersectsRect(widgetBoundingBox, rectB))
						return this.onWidgetEvent_drop(widget, droppablesList[i]);
				}
			}
		}
		return false;
	},

	// get snappable widget while dragging
	getSnapWidget: function (widget) {
		var dragTag = this.getUiDef(widget, "dragTag");
		if(dragTag)
		{
			var droppablesList = this.droppables[dragTag];
			if(droppablesList)
			{
				for(var i=0, len=droppablesList.length; i<len; i++)
				{
					if(this.widgetIntersectsWidget(widget, droppablesList[i]))
						return droppablesList[i];
				}
			}
		}
		return null;
	},

	// unfill data and hide dragged widget
	hideDraggedWidget: function (widget) {
		if(widget)
			this.actuallyHideWidget(widget);
		this.dragParent = null;
		this.draggedWidget = null;
		this.touchedWidget = null;
	},
	
	// recursively set widget's casecade opacity
	setWidgetCascadeOpacityEnabled:function(widget, enabled)
	{
		if(!cc.sys.isNative || widget.disableOpacityCascade)
			return;
		
		widget.setCascadeOpacityEnabled(enabled);
		var children = widget.getChildren();
		for(var i=0; i<children.length; i++)
			this.setWidgetCascadeOpacityEnabled(children[i], enabled);
	},

	// enable/disable widget
	setWidgetEnabled:function(widget, enabled, recursive)//web setWidgetEnabled:function(widget, enabled, recursive = true)
	{
		if(recursive === undefined)
			recursive = true;
		
		if(widget.isEnabled() === enabled)
			return;

		if(_.isString(enabled))
		{
			//web only
if(!cc.sys.isNative)
			eval("var data = arguments[1];");
			
			var data = widget.uiData; // data is used by eval(), do NOT delete!	
			enabled = eval(enabled);
		}

		//var opacity = (enabled ? 255 : 128);
		widget.setEnabled(enabled);
		//widget.setOpacity(opacity);
		
		if(recursive)
		{
			var children = widget.getChildren();
			for(var i=0, len=children.length; i<len; i++)
			{
				if(children[i].setEnabled)
					children[i].setEnabled(enabled);
				//if(children[i].setOpacity)
				//	children[i].setOpacity(opacity);
			}
		}
	},

    updateHoldWidget: function (dt) {
		// jira#4989
		/*if (this.holdTouchTime > 0) {
			if (!this.holdBegan && (_.now() - this.holdTouchTime) >= 300) {
				this.holdBegan = true;
				this.holdBeganCallback && this.holdBeganCallback(this.touchedWidget);
			}
		}*/
		if(this.touchedWidget)
		{
			var callback = this.getUiDef(this.touchedWidget, "onTouchHold");
			callback && callback(this.touchedWidget);
		}
    },

	// TODO: replace with setWidgetCascadeOpacityEnabled
	setWidgetCascadeOpacity: function (widget, value, recursive) {//web setWidgetCascadeOpacity: function (widget, value = true, recursive = true) {
		if(value === undefined)
			value = true;
		if(recursive === undefined)
			recursive = true;
		
        /*if (recursive) {
        	widget.setCascadeOpacityEnabled(value);
            var children = widget.getChildren();
            for (var i = 0; i < children.length; i++) {
                FWUI.setWidgetCascadeOpacity(children[i], value, recursive);
            }
        }*/
		this.setWidgetCascadeOpacityEnabled(widget, value);
	},

    performSlideTo: function (widget, fromPos, toPos, time) {
		if (widget) {
			var action = cc.sequence(new cc.EaseSineOut(cc.moveTo(time, toPos)));
			if (fromPos)
				widget.setPosition(fromPos);
			widget.runAction(action);
		}
	},

	performSlideBy: function (widget, offset, time) {
        if (widget) {
            var action = cc.sequence(new cc.EaseSineOut(cc.moveBy(time, offset)));
            widget.runAction(action);
        }
	},

	applyTextStyle: function (text, style) {
		if (text && style) {//if (text && style && text.textStyle !== style) {
            if (text.setFontSize !== undefined)
                style.size && text.setFontSize(style.size);
            //if (text.setTextColor !== undefined)
            //    style.color && text.setTextColor(style.color);
            if (text.setColor !== undefined)
                style.color && text.setColor(style.color);
            if (text.enableOutline !== undefined && style.stroke && style.stroke.size && style.stroke.color)
                text.enableOutline(style.stroke.color, style.stroke.size);
            if (text.enableShadow !== undefined && style.shadow && style.shadow.size && style.shadow.color)
                text.enableShadow(style.shadow.color, style.shadow.size);
			//if(text.setTextYOffset)
			//	text.setTextYOffset(style.yOffset || 3);
			//text.textStyle = style;
		}
	},
	
	setTextColor:function(widget, color)
	{
		if(widget.setColor !== undefined)
			widget.setColor(color);
		if(!cc.sys.isNative)
		{
			if(widget.setTextColor !== undefined)
				widget.setTextColor(color);
			if(widget._labelRenderer)
				widget._labelRenderer.setFontFillColor(color);
		}
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// context menu ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
	
	cmWidget: null,
	
	showContextMenu:function(parent, pos, buttons)
	{
		this.cmParent = parent;
		this.cmPos = pos;
		this.cmButtons = buttons;
		this.cmWidget = FWPool.getNode(UI_GUILD_CONTEXT_MENU, false);
		this.cmArrow = FWUtils.getChildByName(this.cmWidget, "arrow");
		
		// def
		var buttonsH = 60;
		var uiDef = {tapToClose:this.hideContextMenu.bind(this)};
		var buttonsCount = buttons.length;
		var buttonsY = (buttonsCount - 1) / 2 * buttonsH;
		for(var i=0; i<3; i++, buttonsY -= buttonsH)
		{
			if(i < buttonsCount)
			{
				uiDef["button" + i] = {type:UITYPE_IMAGE, value:buttons[i].sprite ? buttons[i].sprite : "hud/btn_normal_green.png", onTouchEnded:this.onContextMenuButton.bind(this), visible:true, width:160, height:53, srcData:buttons[i]};
				uiDef["buttonText" + i] = {type:UITYPE_TEXT, value:buttons[i].text, style:TEXT_STYLE_TEXT_BUTTON};
				
				var button = FWUtils.getChildByName(this.cmWidget, "button" + i);
				button.setPosition(117, buttonsY);
			}
			else
				uiDef["button" + i] = {visible:false};
		}
		FWUtils.getChildByName(this.cmWidget, "bg").setContentSize(195, buttonsCount * buttonsH + 20);
		
		// show
		FWUI.showWidgetWithData(this.cmWidget, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE);
		this.cmWidget.setLocalZOrder(Z_POPUP);
		this.cmWidget.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
		//this.cmWidget.setSwallowTouches(false);
	},
	
	hideContextMenu:function(sender)
	{
		FWUI.hideWidget(this.cmWidget, UIFX_FADE);
		this.cmParent = this.cmPos = this.cmButtons = this.cmWidget = null;
	},
	
	onContextMenuButton:function(sender)
	{
		sender.uiDef.srcData.callback(sender.uiDef.srcData);
		this.hideContextMenu();
	},
	
	isContextMenuShowing:function()
	{
		return (this.cmWidget !== null);
	},

///////////////////////////////////////////////////////////////////////////////////////
// checkbox group /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	checkboxGroups: [],
	addCheckboxGroup:function(group)
	{
		// add to list
		var i;
		for(i=0; i<this.checkboxGroups.length; i++)
		{
			if(this.checkboxGroups[i].id === group.id)
			{
				this.checkboxGroups[i] = group;
				break;
			}
		}
		if(i >= this.checkboxGroups.length)
			this.checkboxGroups.push(group);

		// add touch event
		for(var i=0; i<group.checkboxes.length; i++)
		{
			var checkbox = FWUtils.getChildByName(group.widget, group.checkboxes[i]);
			checkbox.group = group;
			checkbox.addTouchEventListener(this.onCheckboxEvent, this);
		}
	},
	
	removeCheckboxGroup:function(id)
	{
		for(var i=0; i<this.checkboxGroups.length; i++)
		{
			var group = this.checkboxGroups[i];
			if(group.id === id)
			{
				// remove touch event
				for(var j=0; j<group.checkboxes.length; j++)
				{
					var checkbox = FWUtils.getChildByName(group.widget, group.checkboxes[j]);
					checkbox.addTouchEventListener(null, null);
				}
				
				this.checkboxGroups.splice(i, 1);
				return;
			}
		}
	},
	
	getCheckboxGroup:function(id)
	{
		for(var i=0; i<this.checkboxGroups.length; i++)
		{
			if(this.checkboxGroups[i].id === id)
				return this.checkboxGroups[i];
		}
		
		return null;
	},
	
	selectCheckbox:function(groupId, name)
	{
		var group = this.getCheckboxGroup(groupId);
		if(!group)
			return;
		
		for(var i=0; i<group.checkboxes.length; i++)
		{
			var tick = FWUtils.getChildByName(group.widget, group.checkboxes[i] + "Check");
			tick.setVisible(group.checkboxes[i] === name);
		}
	},
	
	getSelectedCheckbox:function(groupId)
	{
		var group = this.getCheckboxGroup(groupId);
		if(!group)
			return;
		
		for(var i=0; i<group.checkboxes.length; i++)
		{
			var tick = FWUtils.getChildByName(group.widget, group.checkboxes[i] + "Check");
			if(tick.isVisible())
				return group.checkboxes[i];
		}
	},
	
	selectCheckboxById:function(groupId, id)
	{
		var group = this.getCheckboxGroup(groupId);
		if(!group)
			return;
		
		for(var i=0; i<group.checkboxes.length; i++)
		{
			var tick = FWUtils.getChildByName(group.widget, group.checkboxes[i] + "Check");
			tick.setVisible(group.checkboxIds[i] === id);
		}
	},
	
	getSelectedCheckboxById:function(groupId)
	{
		var group = this.getCheckboxGroup(groupId);
		if(!group)
			return;
		
		for(var i=0; i<group.checkboxes.length; i++)
		{
			var tick = FWUtils.getChildByName(group.widget, group.checkboxes[i] + "Check");
			if(tick.isVisible())
				return group.checkboxIds[i];
		}
	},
	
	onCheckboxEvent:function(widget, type)
	{
		if (type === ccui.Widget.TOUCH_ENDED)
			this.selectCheckbox(widget.group.id, widget.getName());
	}
};
