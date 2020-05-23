
const DARKBG_DURATION = 0.25;
const DARKBG_CLOUD_HEIGHT = 102;
const DARKBG_ALPHA = 185;
const DARKBG_ALPHA_TUTORIAL = 110;

const SCENE_TRANSITION_DURATION = 0.5;

var FWUtils =
{
	/**
	 * Create and return UI text
	 * @param text as String
	 * @param position as cc.p
	 * @param textBoundSize as cc.size
	 * @param color cc.color
	 * @param fontSize as Number
	 * @param hAlign as Number
	 * @param vAlign as Number
	 * @param font as String
	 */
	 //web
	//createUIText: function (text, position, textBoundSize, color = cc.color.WHITE, fontSize = FONT_SIZE_DEFAULT, hAlign = cc.TEXT_ALIGNMENT_CENTER, vAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER, font = FONT_DEFAULT) {
	createUIText: function (text, position, textBoundSize, color, fontSize, hAlign, vAlign, font) {
		
		if(color === undefined)
			color = cc.color.WHITE;
		if(fontSize === undefined)
			fontSize = FONT_SIZE_DEFAULT;
		if(hAlign === undefined)
			hAlign = cc.TEXT_ALIGNMENT_CENTER;
		if(vAlign === undefined)
			vAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER;
		if(font === undefined)
			font = FONT_DEFAULT;
		
		var text = FWLocalization.text(text);
		var aLabel = null;
if(cc.sys.isNative)
		aLabel = ccui.Text();
else
		aLabel = new ccui.Text();
		aLabel.setString(text);
		aLabel.setFontName(font);
		aLabel.setFontSize(fontSize);
		aLabel.setTextAreaSize(textBoundSize);
		aLabel.setTextHorizontalAlignment(hAlign);
		aLabel.setTextVerticalAlignment(vAlign);
		aLabel.setPosition(position);
		aLabel.setTextColor(color);
		return aLabel;
	},

	/**
	 * Create and show UI Text
	 * @param text as String
	 * @param text as cc.Node
	 * @param position as cc.p
	 * @param textBoundSize as cc.size
	 * @param color cc.color
	 * @param fontSize as Number
	 * @param hAlign as Number
	 * @param vAlign as Number
	 * @param font as String
	 */
	 //web
	//showUIText: function (text, parent, position, textBoundSize, color = cc.color.WHITE, fontSize = FONT_SIZE_DEFAULT, hAlign = cc.TEXT_ALIGNMENT_CENTER, vAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER, font = FONT_DEFAULT) {
	showUIText: function (text, parent, position, textBoundSize, color, fontSize, hAlign, vAlign, font) {
		if(color === undefined)
			color = cc.color.WHITE;
		if(fontSize === undefined)
			fontSize = FONT_SIZE_DEFAULT;
		if(hAlign === undefined)
			hAlign = cc.TEXT_ALIGNMENT_CENTER;
		if(vAlign === undefined)
			vAlign = cc.VERTICAL_TEXT_ALIGNMENT_CENTER;
		if(font === undefined)
			font = FONT_DEFAULT;
		
		var uiText = this.createUIText(text, position, textBoundSize, color, fontSize, hAlign, vAlign, font);
		parent.addChild(uiText);
		return uiText;
	},

	/**
	 *
	 * @param nodeThatWillFly cc.Node
	 * @param startPosition cc.p
	 * @param endPosition cc.p
	 * @param totalFlyTime Number
	 * @param removeFromParentAfterFinish boolean
	 * @param callbackAfterFinish function
	 * @param fadeOut boolean
	 */
	 //web
	//flyNode: function (nodeThatWillFly, startPosition, endPosition, totalFlyTime, removeFromParentAfterFinish, callbackAfterFinish, fadeOut, delay = 0) {
	flyNode: function (nodeThatWillFly, startPosition, endPosition, totalFlyTime, removeFromParentAfterFinish, callbackAfterFinish, fadeOut, delay) {
		
		if(delay === undefined)
			delay = 0;
		
		nodeThatWillFly.setPosition(startPosition);
		var seq = cc.sequence(
			cc.delayTime(delay),
			cc.callFunc(function() {nodeThatWillFly.setVisible(true);}),
			cc.moveTo(totalFlyTime, endPosition),
			cc.callFunc(function () {
				if (fadeOut === true) {
					nodeThatWillFly.setOpacity(255);
				}
				if (removeFromParentAfterFinish === true) {
					if (FWPool.returnNode(nodeThatWillFly) === false) {
						nodeThatWillFly.removeFromParent();
					}
				}
				if (callbackAfterFinish && typeof callbackAfterFinish === "function") {
					callbackAfterFinish();
				}
			})
		);
		nodeThatWillFly.runAction(seq);
		if (fadeOut === true) {
			nodeThatWillFly.runAction(cc.sequence(
				cc.delayTime(delay),
				cc.fadeTo(totalFlyTime, 0).easing(cc.easeQuinticActionIn())
			));
		}
	},

	/**
	 *
	 * @param nodeThatWillFly cc.Node
	 * @param startPosition cc.p
	 * @param height Number
	 * @param totalFlyTime Number
	 * @param callbackAfterFinish function
	 */
	 //web
	//flyNodeUp: function (nodeThatWillFly, startPosition, height, totalFlyTime, callbackAfterFinish = null) {
	flyNodeUp: function (nodeThatWillFly, startPosition, height, totalFlyTime, callbackAfterFinish) {
		
		if(callbackAfterFinish === undefined)
			callbackAfterFinish = null;
		
		this.flyNode(nodeThatWillFly, startPosition, cc.p(startPosition.x, startPosition.y + height), totalFlyTime, true, callbackAfterFinish, true);
	},

	/**
	 *
	 * @param text String
	 * @param parent cc.Node
	 * @param fontSize Number
	 * @param color cc.color
	 * @param startPosition cc.p
	 * @param endPosition cc.p
	 * @param totalFlyTime Number
	 * @param removeFromParentAfterFinish boolean
	 * @param callbackAfterFinish function
	 */
	showFlyingText: function (text, parent, fontSize, color, startPosition, endPosition, totalFlyTime, removeFromParentAfterFinish, callbackAfterFinish) {
		var aNode = this.createUIText(text, startPosition, cc.size(100, 100), color, fontSize);
		parent.addChild(aNode);
		this.flyNode(aNode, startPosition, endPosition, totalFlyTime, removeFromParentAfterFinish, callbackAfterFinish, false);
	},

	/**
	 *
	 * @param text String
	 * @param parent cc.Node
	 * @param fontSize Number
	 * @param color cc.color
	 * @param startPosition cc.p
	 * @param height Number
	 * @param totalFlyTime Number
	 * @param callbackAfterFinish function
	 */
	showFlyingUpText: function (text, parent, fontSize, color, boxSize, startPosition, height, totalFlyTime, callbackAfterFinish) {
        boxSize = boxSize || cc.size(0, 0);
		var aNode = this.createUIText(text, startPosition, boxSize, color, fontSize);
		parent.addChild(aNode);
		this.flyNodeUp(aNode, startPosition, height, totalFlyTime, callbackAfterFinish, true);
	},
	
	// avoid showing multiple warning texts
	lastWarningText:null,
	lastWarningPos:null,
	lastWarningTime:null,

	// same as showFlyingUpText but uses pooled text with fixed parameters
	showWarningText: function (text, startPosition, color) {//web showWarningText: function (text, startPosition, color = cc.WHITE) {
		
		if(color === undefined)
			color = cc.WHITE;
		
		if(text === this.lastWarningText && startPosition.x === this.lastWarningPos.x && startPosition.y === this.lastWarningPos.y && Game.getGameTimeInSeconds() - this.lastWarningTime < 1.5)
			return;
		
		var label = FWPool.getNode(POOLKEY_WARNING_TEXTS);
		if (label === null)
			return; // reached pool limit
		label.setString(text);
		label.color = color;
		this.getCurrentScene().addChild(label, Z_FLYING_ITEM);
		this.flyNodeUp(label, startPosition, 200, 1.5);
		
		this.lastWarningText = text;
		this.lastWarningPos = startPosition;
		this.lastWarningTime = Game.getGameTimeInSeconds();
	},
	
	// get item icon and its amount
	getItemIcon:function(itemId, amount, position, info)
	{
		var uiDef =
		{
			gfx:{type:UITYPE_ITEM, value:itemId, scale:(info && info.scale) ? info.scale : 0.75},
			count:{type:UITYPE_TEXT, value:amount > 0 ? "+" + amount : amount, style:TEXT_STYLE_NUMBER, color:(amount >= 0 ? cc.WHITE : cc.WHITE), visible:(amount !== 0)},//count:{type:UITYPE_TEXT, value:amount > 0 ? "+" + amount : amount, shadow:SHADOW_DEFAULT, color:(amount >= 0 ? cc.WHITE : cc.WHITE), visible:(amount !== 0)},
		};
		var widget = FWPool.getNode(UI_FLYING_ICON);
		FWUI.alignWidget(widget, position, cc.size(100, 100), null, info && info.zOrder ? info.zOrder : Z_FLYING_ITEM);
		FWUI.fillData(widget, null, uiDef);
		widget.itemId = itemId;
		widget.amount = amount;
		return widget;
	},
	
	// jira#4881
	flyingAmount:{EXP:0, GOLD:0, COIN: 0, REPU:0},
	
	// show flying item icon and its amount
	//web
	//showFlyingItemIcon:function(itemId, amount, startPosition, endPosition, delay = 0, showBeforeDelay = false, info)
	showFlyingItemIcon:function(itemId, amount, startPosition, endPosition, delay, showBeforeDelay, info)
	{
		if(delay === undefined)
			delay = 0;
		if(showBeforeDelay === undefined)
			showBeforeDelay = false;
		
		var pos = (startPosition.getPosition !== undefined ? startPosition.getPosition() : startPosition);
		var widget = this.getItemIcon(itemId, amount, pos, info);
		this.getCurrentScene().addChild(widget);
		widget.setVisible(showBeforeDelay);
		
		if(!endPosition)
		{
			FWUI.setWidgetCascadeOpacityEnabled(widget, true);
			this.flyNode(widget, pos, cc.p(pos.x, pos.y + (amount > 0 ? 100 : -100)), info && info.duration ? info.duration : 1, true, null, true, delay);
		}
		else
		{
			var node = null;
			if(endPosition.getPosition)
			{
				node = endPosition;
				endPosition = FWUtils.getWorldPosition(node);
			}
			FWUI.setWidgetCascadeOpacityEnabled(widget, false);
			
			var seq = cc.sequence
			(
				cc.delayTime(delay),
				cc.callFunc(function()
				{
					widget.setVisible(true);
					
					if(startPosition.getPosition !== undefined)
						widget.setPosition(startPosition.getPosition());

					if(Game.gameScene)
					{
						var stockPosition = FWUtils.getWorldPosition(Game.gameScene.uiMainImgStock);
						if(endPosition.x === stockPosition.x && endPosition.y === stockPosition.y)
							Game.gameScene.showStockImage();
					}

				}),
				cc.jumpTo(1, endPosition, endPosition.y > pos.y ? -200 : 200, info && info.duration ? info.duration : 1).easing(cc.easeExponentialIn()),//cc.jumpTo(1, endPosition, endPosition.y > pos.y ? -200 : 200, 1),
				cc.callFunc(function() {Game.onItemFlownToDest(widget, node);})
			);
			widget.runAction(seq);

			// jira#4881
			if(amount > 0)
			{
				for(var key in this.flyingAmount)
				{
					if(key === itemId)
					{
						this.flyingAmount[key] += amount;	
						break;
					}
				}
			}
		}
	},
	
	showFlyingItemIcons:function(itemList, startPosition)
	{
		for(var i=0; i<itemList.length; i++)
			this.showFlyingItemIcon(itemList[i].itemId, itemList[i].amount !== undefined ? itemList[i].amount : itemList[i].itemAmount, startPosition, Game.getFlyingDestinationForItem(itemList[i].itemId), i * 0.35);
	},

	// clone a spine using pooled node
	cloneSpine: function (srcSpine, parent) {
		var clone = FWPool.getNode(srcSpine.poolKey);
		if (parent !== undefined)
			parent.addChild(clone);
		if (srcSpine.skin !== undefined)
			clone.setSkin(srcSpine.skin);
		if (srcSpine.animation !== undefined)
			clone.setAnimation(0, srcSpine.animation, false);
		clone.setPosition(srcSpine.getPosition());
		clone.setScale(srcSpine.getScale());
		return clone;
	},
	
	// show spine from pool
	// recommended for fx
	// set autoRemove to false if you plan to use in combination with flyNodeUp
	showSpine:function(name, skin, anim, loop, parent, pos, zOrder, autoRemove)//web showSpine:function(name, skin, anim, loop, parent, pos, zOrder, autoRemove = true)
	{
		if(autoRemove === undefined)
			autoRemove = true;
		
		var spine = FWPool.getNode(name);
		if(skin !== null)
			spine.setSkin(skin);
		if(anim != null)
		{
			spine.setAnimation(0, anim, loop);
			if(autoRemove && !loop)
			{
				spine.setCompleteListener(function(trackIndex, loopCount)
				{
					FWPool.returnNode(spine);
				});
			}
		}
		spine.setPosition(pos);
		spine.setLocalZOrder(zOrder);
		if(parent === null)
			parent = this.getCurrentScene();
		parent.addChild(spine);
		return spine;
	},

	// set current scene with/without transition
	//web
	//setCurrentScene: function (scene, transitionDuration = SCENE_TRANSITION_DURATION, useMidScene = false) {
	setCurrentScene: function (scene, transitionDuration, useMidScene) {
		
		if(transitionDuration === undefined)
			transitionDuration = SCENE_TRANSITION_DURATION;
		if(useMidScene === undefined)
			useMidScene = false;
		
		FWUtils.disableAllTouches(false); // jira#5585
		if(cc.sys.isNative)
			forceGC();
		this.scenesCount++;

		//web
		if(!cc.sys.isNative && !cc.director.replaceScene)
			cc.director.replaceScene = function(scene) {cc.director.runScene(scene);};
		
		if (transitionDuration === 0)
			cc.director.replaceScene(scene);
		else if(useMidScene)
		{
			// perform a transition to a temporary scene then to desired scene, since GameScene will clean up everything
			scene.retain();
			cc.director.replaceScene(new cc.TransitionFade(transitionDuration, new cc.Scene()));
			cc.director.getScheduler().scheduleCallbackForTarget(this, function() {cc.director.replaceScene(new cc.TransitionFade(transitionDuration, scene)); scene.release();}, 0, 0, SCENE_TRANSITION_DURATION + 0.25, false);
		}
		else
			cc.director.replaceScene(new cc.TransitionFade(transitionDuration, scene));

		if (DEBUG_BOUNDING_BOXES_ZORDER > 0) {
			if (this.drawNode === null)
				this.drawNode = new cc.DrawNode();
			else
				this.drawNode.removeFromParent();
			scene.addChild(this.drawNode, DEBUG_BOUNDING_BOXES_ZORDER);
		}
	},

	// get current scene
	getCurrentScene: function () {
		return cc.director.getRunningScene();
	},

	// replacement for Math.floor
	fastFloor: function (num) {
		return ~~num;
	},

	// remove array element
	removeArrayElement: function (array, element) {
		var index = array.indexOf(element);
		if (index >= 0)
		{
			array.splice(index, 1);
			return true;
		}
		return false;
	},
	
	// remove array element by key
	removeArrayElementByKeyValue:function(array, key, value)
	{
		for(var i=0; i<array.length; i++)
		{
			if(array[i][key] === value)
			{
				var element = array[i];
				array.splice(i, 1);	
				return element;
			}
		}
		return null;
	},	

	// debug bounding boxes
	drawNode: null,
	resetBoundingBoxes: function () {
		if (DEBUG_BOUNDING_BOXES_ZORDER <= 0)
			return;

		if (this.drawNode === null) {
			this.drawNode = new cc.DrawNode();
			this.getCurrentScene().addChild(this.drawNode, DEBUG_BOUNDING_BOXES_ZORDER);
		}

		this.drawNode.clear();
	},

	// debug bounding boxes
	addBoundingBox: function (x, y, w, h) {
		if (DEBUG_BOUNDING_BOXES_ZORDER <= 0)
			return;

		if (y === undefined) // passed rect as parameter
			this.drawNode.drawRect(cc.p(x.x, x.y), cc.p(x.x + x.width, x.y + x.height), cc.color(255, 255, 255, 32), 1, cc.color(0, 255, 0, 255));
		else // passed x, y, w, h
			this.drawNode.drawRect(cc.p(x, y), cc.p(x + w, y + h), cc.color(255, 255, 255, 32), 1, cc.color(0, 255, 0, 255));
	},

	// debug object properties
	debugProperties: function (object) {
		for (var key in object)
			cc.log("FWUtils::debugProperties: " + key + "=" + (typeof object[key] === "function" ? "function" : object[key]));
	},
	
	formatNumber:function(num, digits)
	{
		if(digits === 2)
			return ((num > 9 ? "" : "0") + num);
		else if(digits === 3)
			return ((num > 99 ? "" : (num > 9 ? "0" : "00")) + num);
		var str = "" + num;
		while(str.length < digits)
			str = "0" + str;
		return str;
	},

	/**
	 * Convert time to formatted string hh:mm:ss s
	 * @param timeInSecs
	 * @returns {String}
	 */
	secondsToTimeString: function (timeInSecs) {

		//var hours = Math.floor(timeInSecs / SECONDS_IN_HOUR);
		//var mins = Math.floor((timeInSecs - (hours * SECONDS_IN_HOUR)) / SECONDS_IN_MINUTE);
		//var seconds = Math.floor(timeInSecs - (hours * SECONDS_IN_HOUR) - (mins * SECONDS_IN_MINUTE));
		//var hourStr = (hours > 0) ? this.formatNumber(hours, 2) + ":" : "";
		////return hourStr.concat(this.formatNumber(mins, 2), ":", this.formatNumber(seconds, 2), "s");
		//return hourStr.concat(this.formatNumber(mins, 2), ":", this.formatNumber(seconds, 2));



		var timeLeft = timeInSecs;
		var days = Math.floor(timeLeft / SECONDS_IN_DAY);
		timeLeft -= days * SECONDS_IN_DAY;
		var hours = Math.floor(timeLeft / SECONDS_IN_HOUR);
		timeLeft -= hours * SECONDS_IN_HOUR;
		var minutes = Math.floor(timeLeft / SECONDS_IN_MINUTE);
		var seconds = Math.floor(timeLeft - minutes * SECONDS_IN_MINUTE);

		if(days>0)
		{
			return this.formatNumber(days, 2) +"d";
		}
		else
		{
			var hourStr = (hours > 0) ? this.formatNumber(hours, 2) + ":" : "";
			//return hourStr.concat(this.formatNumber(mins, 2), ":", this.formatNumber(seconds, 2), "s");
			return hourStr.concat(this.formatNumber(minutes, 2), ":", this.formatNumber(seconds, 2));
		}



		//var text = "";
		//var count = 0;
		//if (days > 0) {
		//	text += this.formatNumber(days, 2) + "d";
		//	count++;
		//}
		//if (hours > 0) {
		//	if (count > 0) {
		//		text += ":";
		//	}
		//	text += this.formatNumber(hours, 2) + "h";
		//	count++;
		//}
		//if (minutes > 0 && count < 3) {
		//	if (count > 0) {
		//		text += ":";
		//	}
		//	text += this.formatNumber(minutes, 2) + "m";
		//	count++;
		//}
		//if (seconds >= 0 && count < 3) {
		//	if (count > 0) {
		//		text += ":";
		//	}
		//	text += this.formatNumber(seconds, 2) + "s";
		//	count++;
		//}
        //
		//return text;



	},

	/**
	 * Convert Number to money string
	 * @param num
	 * @returns {*}
	 */
	toMoneyString: function (num) {
		var isNegative = false;
		var formattedNumber = num;
		if (num < 0) {
			isNegative = true;
		}
		num = Math.abs(num);
		var hau_to;
		if (num >= 1000000000) {
			hau_to = 'G';
			formattedNumber = (num / 1000000000).toFixed(3);
		} else if (num >= 1000000) {
			hau_to = 'M';
			formattedNumber = (num / 1000000).toFixed(3);
		} else if (num >= 1000) {
			hau_to = 'K';
			formattedNumber = (num / 1000).toFixed(3);
		} else {
			formattedNumber = num.toString();
		}

		formattedNumber = formattedNumber.replace('.000', hau_to).replace('.00', hau_to).replace('.0', hau_to);
		var indexOfDot = formattedNumber.indexOf('.');
		if (indexOfDot > 0) {
			var buff = formattedNumber.substring(indexOfDot + 1);
			if (buff[2] == '0') {
				buff = buff.replace(/0/g, '');
				formattedNumber = formattedNumber.substring(0, indexOfDot + 1) + buff + hau_to;
			}
			else {
				formattedNumber = formattedNumber.replace('.', hau_to).replace(/00$/, '').replace(/0$/, '');
			}
		}
		if (isNegative) {
			formattedNumber = '-' + formattedNumber;
		}
		return formattedNumber;
	},
	
	// return number of seconds until next day 
	secondsUntilNextDay:function()
	{
		var date = new Date();
		date.setTime(Game.getGameTime());
		date.setHours(23, 59, 59, 999);
		return (date.getTime() / 1000 - Game.getGameTimeInSeconds());
	},
	
	// return number of seconds when today starts
	secondsAtStartOfDay:function()
	{
		var date = new Date();
		date.setTime(Game.getGameTime());
		date.setHours(0, 0, 0, 0);
		return (date.getTime() / 1000);
	},
	
	// return number of seconds when today ends
	secondsAtEndOfDay:function()
	{
		var date = new Date();
		date.setTime(Game.getGameTime());
		date.setHours(23, 59, 59, 999);
		return (date.getTime() / 1000);
	},
	
	// convert seconds to DD/MM string
	secondsToDayMonthString:function(seconds)
	{
		var date = new Date(seconds * 1000);
		return date.getDate() + "/" + (date.getMonth() + 1);
	},

	/**
	 * bgImage is parent of textLabel and Image if any
	 * @param newString String
	 * @param bgImage Image (size must be custom in UI Editor)
	 * @param textLabel Label
	 * @param [iconImage] Image
	 */
	setTextAutoExpand: function (string, background, text, icon, fixedWidth) {

        var space = 10;
		var margin = 20;

        text.setString(string);

		var contentWidth = text.getBoundingBox().width;
		if (icon)
			contentWidth += space + icon.getBoundingBox().width - 10;

        background.setScale9Enabled(true);
		background.setContentSize(cc.size(fixedWidth || contentWidth + margin * 2, background.getBoundingBox().height));

		var backgroundBox = background.getBoundingBox();
		var offsetX = (backgroundBox.width - contentWidth) * 0.5;
		text.setPositionX(offsetX + text.getBoundingBox().width * 0.5);
		if (icon)
			icon.setPositionX(backgroundBox.width - offsetX - icon.getBoundingBox().width * 0.5);
	},

	// TODO: use stack to avoid potential bugs
	//web
	//showDarkBg: function (parent = null, zOrder = 1, name = null, alpha = DARKBG_ALPHA, hasCloud = false, blackCloud = false, focus = null, focusScale = 8) {
	showDarkBg: function (parent, zOrder, name, alpha, hasCloud, blackCloud, focus, focusScale) {
		
		if(parent === undefined)
			parent = null;
		if(zOrder === undefined)
			zOrder = 1;
		if(name === undefined)
			name = null;
		if(alpha === undefined)
			alpha = DARKBG_ALPHA;
		if(hasCloud === undefined)
			hasCloud = false;
		if(blackCloud === undefined)
			blackCloud = false;
		if(focus === undefined)
			focus = null;
		if(focusScale === undefined)
			focusScale = 8;
		
		cc.log("FWUtils::showDarkBg: name=" + name);
		if(!parent)
			parent = this.getCurrentScene();
		if(!name)
			name = "darkBg";

		var darkBg = parent.getChildByName(name);//this.getChildByName(parent, name); recursive search is not neccessary
		if (darkBg)
		{
			if(darkBg.isHiding)
				darkBg.removeFromParent();
			else
			{
				cc.log("FWUtils::showDarkBg: skipped");
				return; // already shown
			}
		}
		
		if(!alpha)
			alpha = DARKBG_ALPHA; // jira#6281 200;// jira#5942 alpha = 224;
		if(hasCloud)
			zOrder--;

		// replace DrawNode with Sprite due to lack of opacity support
		/*darkBg = new cc.DrawNode();
		darkBg.setName(name);
		darkBg.drawRect(cc.p(0, 0), cc.p(cc.winSize.width, cc.winSize.height), cc.color(0, 0, 0, alpha), 0, cc.color(0, 0, 0, 0));*/
		
		//darkBg = new cc.Sprite("#hud/board_hint_01.png");
		//darkBg.setScale(13);
		//darkBg.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);

		if(!focus)
		{
			darkBg = new cc.LayerColor(cc.BLACK);
			darkBg.setPosition(0, 0);
			darkBg.setColor(cc.color(0, 0, 0, 255));
		}
		else
		{
			focusScale = focusScale || 8;
			darkBg = new cc.Sprite("#hud/hud_tutorial_mask.png");
			darkBg.setScale(focusScale);
			darkBg.setPosition(focus.x, focus.y);
			darkBg.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1.25, focusScale + 1), cc.scaleTo(1.25, focusScale - 0.5))));
		}
		darkBg.setOpacity(0);
		darkBg.setName(name);
		darkBg.runAction(cc.fadeTo(DARKBG_DURATION, alpha));
		darkBg.setLocalZOrder(zOrder);
		parent.addChild(darkBg);
		
		// jira#5132
		//if(hasCloud) // turn off cloud in UI
		if(false)
		{
			darkBg.hasCloud = true;
			
			var topCloud = new cc.Sprite("#hud/hud_ip_shop_top_menu.png ");
			topCloud.setName(name + "topCloud");
			topCloud.setPosition(cc.winSize.width / 2, cc.winSize.height + DARKBG_CLOUD_HEIGHT / 2);
			topCloud.setLocalZOrder(zOrder + 1);
			topCloud.runAction(cc.moveTo(DARKBG_DURATION, cc.p(cc.winSize.width / 2, cc.winSize.height - DARKBG_CLOUD_HEIGHT / 2)));
			topCloud.setColor(blackCloud ? cc.BLACK : cc.WHITE);
			parent.addChild(topCloud);
			
			var bottomCloud = new cc.Sprite("#hud/hud_ip_shop_top_menu.png");
			bottomCloud.setName(name + "bottomCloud");
			bottomCloud.setPosition(cc.winSize.width / 2, -DARKBG_CLOUD_HEIGHT / 2);
			bottomCloud.setLocalZOrder(zOrder + 1);
			bottomCloud.setScale(1, -1);
			bottomCloud.runAction(cc.moveTo(DARKBG_DURATION, cc.p(cc.winSize.width / 2, DARKBG_CLOUD_HEIGHT / 2)));
			bottomCloud.setColor(blackCloud ? cc.BLACK : cc.WHITE);
			parent.addChild(bottomCloud);
		}
	},

	hideDarkBg: function (parent, name) {//web hideDarkBg: function (parent = null, name = null) {
		
		if(parent === undefined)
			parent = null;
		if(name === undefined)
			name = null;
		
		cc.log("FWUtils::hideDarkBg: name=" + name);
		if(!parent)
			parent = this.getCurrentScene();
		if(!name)
			name = "darkBg";

		var darkBg = parent.getChildByName(name);//this.getChildByName(parent, name); recursive search is not neccessary
		if (!darkBg || darkBg.isHiding)
		{
			cc.log("FWUtils::hideDarkBg: skipped");
			return; // not shown
		}
		
		// replace DrawNode with Sprite due to lack of opacity support
		//darkBg.removeFromParent();
		darkBg.isHiding = true;
		darkBg.stopAllActions();
		darkBg.runAction(cc.sequence(cc.fadeTo(DARKBG_DURATION, 0), cc.callFunc(function() {darkBg.removeFromParent();})));
		
		// jira#5132
		if(darkBg.hasCloud)
		{
			var topCloud = parent.getChildByName(name + "topCloud");
			topCloud.runAction(cc.sequence(cc.moveTo(DARKBG_DURATION, cc.p(cc.winSize.width / 2, cc.winSize.height + DARKBG_CLOUD_HEIGHT / 2)), cc.callFunc(function() {topCloud.removeFromParent();})));
			
			var bottomCloud = parent.getChildByName(name + "bottomCloud");
			bottomCloud.runAction(cc.sequence(cc.moveTo(DARKBG_DURATION, cc.p(cc.winSize.width / 2, -DARKBG_CLOUD_HEIGHT / 2)), cc.callFunc(function() {bottomCloud.removeFromParent();})));
		}
	},

	// get child node by name
	getChildByName: function (parent, name) {
		if (parent.getName() === name)
			return parent;

		var children = parent.getChildren();
		for (var i = 0, len = children.length; i < len; i++) {
			var child = this.getChildByName(children[i], name);
			if (child !== null)
				return child;
		}
		return null;
	},

	// get parent node by name
	getParentByName: function (child, name) {
		var parent = child.getParent();
		if (parent === null)
			return null;
		if (parent.getName() === name)
			return parent;
		return this.getParentByName(parent, name);
	},

	// get world position
	getWorldPosition: function (node) {
		if(!node)
			return cc.p(0, 0);
		
		if (node.getAnchorPoint !== undefined)
			return node.convertToWorldSpaceAR(node.getAnchorPoint());
		else
            return node.convertToWorldSpaceAR(cc.p(0, 0));
	},
	
	// get local position
	// incorrect result
	/*getLocalPosition: function (worldPos, node) {
		if (node.getAnchorPoint !== undefined)
			return node.convertToNodeSpaceAR(worldPos);
		else
            return node.convertToNodeSpace(worldPos);
	},	*/

	// disable/enable all touches by adding/removing touch eating layer
	touchEater: null,
	disableAllTouches:function(disable, color)//web disableAllTouches:function(disable = true, color)
	{
		if(disable === undefined)
			disable = true;
		
		cc.log("FWUtils::disableAllTouches: " + disable);
		if(disable && !this.touchEater)
		{
			if(color !== undefined)
				this.touchEater = cc.LayerColor.create(color, cc.winSize.width, cc.winSize.height);
			else
				this.touchEater = new cc.Layer();
			this.touchEater.setPosition(0 ,0);
			this.touchEater.setContentSize(cc.winSize.width, cc.winSize.height);
			this.touchEater.setLocalZOrder(Z_TOUCH_EATER);
			var listener = cc.EventListener.create
			({
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,
				onTouchBegan: function(touch, event) {cc.log("touch eaten"); return true;},
			});
			this.touchEater.listener = listener;

			this.getCurrentScene().addChild(this.touchEater);
			cc.eventManager.addListener(this.touchEater.listener, this.touchEater);
		}
		else if(!disable && this.touchEater)
		{
			if(cc.sys.isObjectValid(this.touchEater))
			{
				if(cc.sys.isObjectValid(this.touchEater.listener))
					cc.eventManager.removeListener(this.touchEater.listener); //BUG HERE: invalid native object
				this.touchEater.removeFromParent();
			}
			this.touchEater = null;
		}
	},

	// jira#5571
	touchEnableTime: 0,
	disableAllTouchesByDuration:function(duration)
	{
		cc.log("FWUtils::disableAllTouchesByDuration: " + duration);
		this.disableAllTouches();
		
		var endTime = Game.getGameTimeInSeconds() + duration;
		if(this.touchEnableTime < endTime)
		{
			this.touchEnableTime = endTime;
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.enableAllTouches);
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.enableAllTouches, 0, 0, duration, false);
		}
	},
	
	enableAllTouches:function()
	{
		this.disableAllTouches(false);
	},

	getCoinForGold:function(priceGold) {
		var userLevel = gv.userData.getLevel();
		var priceCoin;
		if (userLevel < json_user_level.GOLD_PER_DIAMOND.length) {
			priceCoin = Math.ceil(priceGold / json_user_level.GOLD_PER_DIAMOND[gv.userData.getLevel()]);
		} else {
			priceCoin = 0;
		}
		return priceCoin;
	},
	
	clamp:function(val, min, max)
	{
		if(val <= min)
			return min;
		if(val >= max)
			return max;
		return val;
	},

    formatNumberWithCommas: function (number, delimiter) {//web formatNumberWithCommas: function (number, delimiter = '.') {
		
		if(delimiter === undefined)
			delimiter = '.';
		
        /*if (number < 1000)
            return '' + number;

        var result = "";
        var digit = 0;
        while (number > 0) {
            if (digit > 0 && (digit % 3 === 0))
                result = delimiter + result;
            result = number % 10 + result;
            number = Math.floor(number / 10);
            digit++;
        }

        return result;*/
		
		return ('' + number).replace(/(\d)(?=(?:\d{3})+(?:\.|$))|(\.\d\d?)\d*$/g, function(m, s1, s2) {return s2 || (s1 + delimiter);});
    },

	getPriceTypeIcon: function (priceType) {
		switch (priceType) {
			case ID_COIN:
				return "hud/icon_gem.png";
            case ID_GOLD:
                return "hud/icon_gold.png";
            case ID_REPU:
                return "hud/icon_heart.png";
        }
	},

	//web
	//applyGreyscaleNode: function (node, enabled = true, color = { x: 0.2989, y: 0.5870, z: 0.1140 }, recursive = true) {
	applyGreyscaleNode: function (node, enabled, color, recursive) {
		
		if(enabled === undefined)
			enabled = true;
		if(color === undefined)
			color = { x: 0.2989, y: 0.5870, z: 0.1140 };
		if(recursive === undefined)
			recursive = true;

        var glProgramState = null;
		if (enabled === true) {
            //glProgramState = cc.GLProgramState.getOrCreateWithShaders("common/shaders/generic.vsh", "common/shaders/greyscale.fsh", "");
            //glProgramState.setUniformVec3("u_color", color);
			//glProgramState.applyUniforms();
			//glProgramState = cc.GLProgramState.getOrCreateWithGLProgramName("ShaderUIGrayScale");
			node.setColor(cc.color(96, 96, 96, 255));
		}
		else {
            //glProgramState = cc.GLProgramState.getOrCreateWithShaders("common/shaders/generic.vsh", "common/shaders/generic.fsh", "");
			//glProgramState.applyUniforms();
			//glProgramState = cc.GLProgramState.getOrCreateWithGLProgramName("ShaderPositionTextureColor_noMVP");
			node.setColor(cc.WHITE);
		}

        if (glProgramState) {
            node.setGLProgramState(glProgramState);
            if (node.getVirtualRenderer !== undefined)
            	node.getVirtualRenderer().setGLProgramState(glProgramState);
		}
		
		node.isGreyScaledNode = enabled;

		if(recursive)
		{
			var children = node.getChildren();
			for (var i = 0; i < children.length; i++)
				FWUtils.applyGreyscaleNode(children[i], enabled, color);
		}
	},

    //applyGreyscaleSpine: function (node, enabled = true, color = { x: 0.2989, y: 0.5870, z: 0.1140 }) {
	//web
	//applyGreyscaleSpine: function (node, enabled = true, color = null, recursive = true) {
	applyGreyscaleSpine: function (node, enabled, color, recursive) {
		
		if(enabled === undefined)
			enabled = true;
		if(color === undefined)
			color = null;
		if(recursive === undefined)
			recursive = true;

        var glProgramState = null;
        if (enabled === true) {
            //glProgramState = cc.GLProgramState.getOrCreateWithShaders("common/shaders/generic_mvp.vsh", "common/shaders/greyscale.fsh", "");
			//glProgramState.setUniformVec3("u_color", color);
			//glProgramState.applyUniforms();
			//glProgramState = cc.GLProgramState.getOrCreateWithGLProgramName("ShaderUIGrayScale");
			node.setColor(color || cc.color(96, 96, 96, 255));
        }
        else {
			//glProgramState = cc.GLProgramState.getOrCreateWithShaders("common/shaders/generic_mvp.vsh", "common/shaders/generic.fsh", "");
			//glProgramState.applyUniforms();
			//glProgramState = cc.GLProgramState.getOrCreateWithGLProgramName("ShaderPositionTextureColor_noMVP");            
			node.setColor(cc.WHITE);
        }

        if (glProgramState)
            node.setGLProgramState(glProgramState);		
		
		
		node.isGreyScaledSpine = enabled;

		if(recursive)
		{
			var children = node.getChildren();
			for (var i = 0; i < children.length; i++)
				FWUtils.applyGreyscaleSpine(children[i], enabled, color);
		}
    },

	//web
	//performFlyEffect: function (node, parent, fromPos, toPos, timeAppear, timeMove, timeDelay = 0, callback = null) {
	performFlyEffect: function (node, parent, fromPos, toPos, timeAppear, timeMove, timeDelay, callback) {
		
		if(timeDelay === undefined)
			timeDelay = 0;
		if(callback === undefined)
			callback = null;

		if (!node || !parent)
			return;

		var startScale = 0.3;
		var startPos = fromPos || node.getPosition();
		var endPos = toPos;

		var actionCallback = cc.callFunc(function () {
			callback && callback();
		});

		var appear = cc.spawn(cc.fadeIn(timeAppear), new cc.EaseSineOut(cc.scaleTo(timeAppear, 1.0)));
		var move = cc.spawn(cc.sequence(new cc.EaseSineOut(cc.jumpTo(timeMove, endPos, endPos.y > startPos.y ? 100 : -100, 1)), actionCallback),
			cc.sequence(cc.delayTime(timeMove * 0.8), cc.spawn(cc.fadeOut(timeMove * 0.2), cc.scaleTo(timeMove * 0.2, startScale))));
		var action = cc.sequence(cc.delayTime(timeDelay), cc.place(startPos), cc.show(), appear, move, cc.removeSelf());

		node.setOpacity(0);
		node.setScale(startScale);

		node.stopAllActions();
		node.runAction(action);

		parent.addChild(node);
	},

	performSpringEffect: function (node, minScale, maxScale, time, delay, callback) {//web performSpringEffect: function (node, minScale, maxScale, time, delay, callback = null) {
		
		if(callback === undefined)
			callback = null;

		if (!node)
			return;

		minScale = minScale || 1;
		maxScale = maxScale || minScale * 1.5;

		var actionCallback = cc.callFunc(function () {
			callback && callback();
		});

		var action = cc.sequence(cc.delayTime(delay), cc.show(), new cc.EaseSineOut(cc.scaleTo(time * 0.5, maxScale)), new cc.EaseSineOut(cc.scaleTo(time * 0.5, minScale)), actionCallback, cc.fadeOut(0.1), cc.hide());

        node.setOpacity(255);
		node.setScale(minScale);

		node.stopAllActions();
		node.runAction(action);
	},
	
	// convert items object to array
	// e.g: {ID_GOLD: 500, ID_COIN:1000} => [{itemId:ID_GOLD, amount:500}, {itemId:ID_COIN, amount:1000}]
	getItemsArray:function(itemsObject)
	{
		var itemsArray = [];
		for(var key in itemsObject)
			itemsArray.push({itemId:key, amount:itemsObject[key], displayAmount:"x" + itemsObject[key]});
		return itemsArray;
	},

    changeParent: function (node, parent, zorder) {//web changeParent: function (node, parent, zorder = null) {
		
		if(zorder === undefined)
			zorder = null;
		
        if (node && parent) {
            node.retain();
            node.removeFromParent(false);
            if (zorder)
            	node.setLocalZOrder(zorder);
            parent.addChild(node);
            node.release();
        }
    },
	
	scenesCount: 1,
	onSceneExit:function()
	{
		this.scenesCount--;
		if(this.scenesCount <= 0)
			Game.endGame();
	},
	
	cutLongString:function(string, charsCount)
	{
		if(string.length > charsCount)
			string = string.substring(0, charsCount) + "...";
		return string;
	},
	
	// build a list of require items to use in FWUI.fillData
	buildRequiredItemsListDef:function(uiDef, itemListName, requireItems, buyCallback)
	{
		// item list
		var requireItems = FWUtils.getItemsArray(g_MISCINFO.GUILD_CREATE_REQUIRE_ITEMS);
		
		// display data
		for(var i=0; i<requireItems.length; i++)
		{
			var item = requireItems[i];
			if(item.itemId === ID_GOLD)
				item.stockAmount = gv.userData.getGold();
			else if(item.itemId === ID_COIN)
				item.stockAmount = gv.userData.getCoin();
			else
				item.stockAmount = gv.userStorages.getItemAmount(item.itemId);
			item.displayAmount = "/" + item.amount;
			item.isEnough = (item.stockAmount >= item.amount);
		}
		
		// def
		var requireItemDef = 
		{
			check:{visible:"data.isEnough === true"},
			requireAmount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, color:"cc.GREEN", useK:true, visible:"data.itemId !== ID_GOLD"},
			stockAmount:{type:UITYPE_TEXT, field:"stockAmount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED", useK:true, visible:"data.itemId !== ID_GOLD"},
			gfx:{type:UITYPE_ITEM, field:"itemId"},
			amount:{type:UITYPE_TEXT, field:"amount", style:TEXT_STYLE_NUMBER, color:"data.isEnough ? cc.GREEN : cc.RED", useK:true, visible:"data.itemId === ID_GOLD"},
		};

		// buy button
		if(buyCallback)
		{
			requireItemDef.buyButton = {visible:"data.isEnough === false", onTouchEnded:buyCallback};
			requireItemDef.bg = {onTouchEnded:buyCallback};
		}
		else
			requireItemDef.buyButton = {visible:false};
		
		uiDef[itemListName] = {type:UITYPE_2D_LIST, items:requireItems, itemUI:UI_MINING_REQUIRE_ITEM, itemDef:requireItemDef, itemSize:cc.size(100, 90), itemsAlign:"center", singleLine:true, visible:true};
	},
	
	filterText:function(text)
	{
		// TODO
		return text;
	},
	
	getWeekDayByName:function(name)
	{
		if(name === "SUNDAY")
			return 0;
		else if(name === "MONDAY")
			return 1;
		else if(name === "TUESDAY")
			return 2;
		else if(name === "WEDNESDAY")
			return 3;
		else if(name === "THURSDAY")
			return 4;
		else if(name === "FRIDAY")
			return 5;
		else // if(name === "SATURDAY")
			return 6;
	},
	
	clearAccent:function(str)
	{
		str = str.toLowerCase();
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
		str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
		str = str.replace(/đ/g, "d");
		str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
		str = str.replace(/\u02C6|\u0306|\u031B/g, "");
		return str;
		
		// old code, have issue with some vn keyboard
		/*var str = alias;
		str = str.toLowerCase();
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
		str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
		str = str.replace(/đ/g,"d");
		//str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
		//str = str.replace(/ + /g," ");
		//str = str.trim(); 
		return str;*/
	},
	
	validateEmail:function(email)
	{
		var match = email.match("^\\S+@\\S+\\.\\S+$");
		return (match && match[0] === email);
	},
	
	processingUi: null,
	showProcessingUi:function(show, text)//web showProcessingUi:function(show = true, text = "TXT_PROCESSING")
	{
		if(show === undefined)
			show = true;
		if(text === undefined)
			text = "TXT_PROCESSING";
		
		if(!show)
		{
			// hide
			if(this.processingUi)
			{
				FWUI.hideWidget(this.processingUi, UIFX_FADE);
				this.processingUi = null;
			}
			return;
		}
		
		// show
		if(this.processingUi)
		{
			// already shown
			// update text
			var processingText = FWUtils.getChildByName(this.processingUi, "text");
			processingText.setString(FWLocalization.text(text));
			return;
		}
		
		var uiDef =
		{
			text:{type:UITYPE_TEXT, value:text, style:TEXT_STYLE_TEXT_NORMAL}
		};
		this.processingUi = FWPool.getNode(UI_PROCESSING, false);
		this.processingUi.setLocalZOrder(Z_TOUCH_EATER);
		FWUI.showWidgetWithData(this.processingUi, null, uiDef, FWUtils.getCurrentScene(), UIFX_FADE);
		
		var icon = FWUtils.getChildByName(this.processingUi, "icon");
		icon.runAction(cc.rotateBy(3 * 7200, 360 * 7200));
	},
};
