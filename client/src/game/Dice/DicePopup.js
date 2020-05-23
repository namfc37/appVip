const DICE_BEE_ANIM_FLY = "fly_1";
const DICE_BEE_ANIM_LANDING = "landing_1";
const DICE_BEE_ANIM_TAKE_OFF = "take_off_1";
const DICE_BEE_ANIM_WAITING = "waiting_1";
const DICE_BEE_ANIM_COLLECT = "collect_1";

const DICE_FLOWER_ANIM_ACTIVE = "active";
const DICE_FLOWER_ANIM_ACTIVE_LIGHT = "light_active";
const DICE_FLOWER_ANIM_NORMAL = "normal";
const DICE_FLOWER_ANIM_TOUCH = "touch";

const DICE_BEE_SCALE_NORMAL = 0.8;
const DICE_BEE_SCALE_SMALL = 0.35;

const DICE_SLOT_SPINE_POSITION = cc.p (0, 53);

const DICE_SLOT_ITEM_SCALE_NORMAL = 0.7;
const DICE_SLOT_ITEM_SCALE_ANCHOR = 0.8;

const DICE_SLOT_ITEM_SPRING_SCALE = 0.1;
const DICE_SLOT_ITEM_SPRING_TIME = 0.4;

const DICE_SLOT_ITEM_EFFECT_TIME = 0.4;
const DICE_SLOT_LIGHT_EFFECT_TIME = 0.8;

const DICE_BEE_MOVE_SPEED = 200;

const DICE_FIREFLY_NUM = 10;

var DicePopup = cc.Node.extend({
	LOGTAG: "[DicePopup]",
	
	disableBackButton: false, // jira#5454

	ctor: function ()
	{
		this._super();
		cc.log(this.LOGTAG, "ctor");

		//this.isBusy = false;
		this.widget = FWPool.getNode(UI_DICE, false);
		if (this.widget)
		{
			// init npc
			this.panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
			this.panelNPCWait = FWUI.getChildByName(this.widget, "panelNPCWait");

			if (!this.npcBee)
			{
				this.npcBee = new FWObject();
				this.npcBee.initWithSpine(SPINE_NPC_BEE);
				this.npcBee.setAnimation(DICE_BEE_ANIM_WAITING, true);
				this.npcBee.setScale(DICE_BEE_SCALE_NORMAL);
				this.npcBee.setParent(this.panelNPC);
			}

			// init bonus
			this.doubleIcon = FWUI.getChildByName(this.widget, "doubleIcon");
			this.doubleLightContainer = FWUI.getChildByName(this.widget, "doubleLight");

			if (!this.doubleLight) {
				this.doubleLight = new FWObject();
				this.doubleLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
				this.doubleLight.setAnimation("effect_light_icon", true);
				this.doubleLight.setScale(1.0);
				this.doubleLight.setParent(this.doubleLightContainer);
				this.doubleLight.setPosition(cc.p(0, 0));
			}

			// init flower

			this.panelFlower = FWUI.getChildByName(this.widget, "panelFlower");
			if (!this.flower) {
				this.flower = new FWObject();
				this.flower.initWithSpine(SPINE_DICE_FLOWER);
				this.flower.setAnimation(DICE_FLOWER_ANIM_ACTIVE, true);
				this.flower.setScale(1.0);
				this.flower.setPosition(cc.p(this.panelFlower.width * 0.5, 0));
				this.flower.setParent(this.panelFlower);
			}

			// init sunray effect

			// this.sunray = new FWObject();
			// this.sunray.initWithSpine(SPINE_EFFECT_SUNRAY);
			// this.sunray.setPosition (cc.p(cc.winSize.width * 0.5, cc.winSize.height));
			// this.sunray.setAnimation("animation", true);
			// this.sunray.setParent(this.widget);

			// get elements

			this.buttonClose = FWUI.getChildByName(this.widget, "buttonClose");

			this.panelHint = FWUI.getChildByName(this.widget, "panelHint");
			this.panelBoard = FWUI.getChildByName(this.widget, "panelBoard");

			this.barGem = FWUI.getChildByName(this.widget, "barGemValue");

			this.textGem = FWUI.getChildByName(this.widget, "textGem");
			this.textHint = FWUI.getChildByName(this.widget, "textHint");
			this.textSeed = FWUI.getChildByName(this.widget, "textSeed");
			this.textTime = FWUI.getChildByName(this.widget, "textTime");

			this.doubleIcon = FWUI.getChildByName(this.widget, "doubleIcon");
			this.doubleLight = FWUI.getChildByName(this.widget, "doubleLight");

			this.fireflies = [];
			for (var i = 0; i < DICE_FIREFLY_NUM; i++)
			{
				//opt
				//var firefly = FWPool.getNode(UI_FIREFLY);
				//firefly.setContentSize (cc.size(40, 40));
				var firefly = new cc.Sprite("#effects/fire_fly.png");
				
				firefly.setVisible(true);
				firefly.setLocalZOrder(2);
				
				this.widget.addChild (firefly);
				this.fireflies.push (firefly);
			}

			// get slots

			if (this.panelBoard && !this.slots)
			{
				this.slots = [];
				for (var i = 0; i < g_MISCINFO.DICE_SPIN_SIZE; i++)
				{
					var isAnchor = this.getSlotAnchor(i);
					var slot = FWUI.getChildByName(this.panelBoard, cc.formatStr("cell%d", i + 1));
					if (!slot)
						continue;

					var slotItem = FWPool.getNode(UI_DICE_ITEM);
					this.panelBoard.addChild (slotItem, 1);

					slotItem.setVisible(i > 0);
					slotItem.setPosition(slot.getPosition());
					slotItem.setScale((isAnchor) ? DICE_SLOT_ITEM_SCALE_ANCHOR : DICE_SLOT_ITEM_SCALE_NORMAL);

					var slotLight = FWUI.getChildByName(slotItem, "itemLight");
					if (isAnchor) {
						if (!slotLight.lightAnchor) {
							slotLight.lightAnchor = new FWObject();
							slotLight.lightAnchor.initWithSpine(SPINE_EFFECT_POT_SLOT);
							slotLight.lightAnchor.setAnimation("effect_light_icon", true);
							slotLight.lightAnchor.setScale(0.8);
							slotLight.lightAnchor.setParent(slotLight);
							slotLight.lightAnchor.setPosition(cc.p(0, 0));
						}
					}
					
					// jira#5575
					delete slotItem.lightFocus;

					if (!slotItem.lightFocus) {
						slotItem.lightFocus = new FWObject();
						slotItem.lightFocus.initWithSpine(SPINE_DICE_FLOWER);
						slotItem.lightFocus.setAnimation(DICE_FLOWER_ANIM_ACTIVE_LIGHT, true);
						slotItem.lightFocus.setScale(1.0);
						slotItem.lightFocus.setPosition(cc.PADD(slot.getPosition(), cc.p(0, 20)));
						slotItem.lightFocus.setLocalZOrder(this.panelNPC.getLocalZOrder());
						slotItem.lightFocus.setParent(this.widget);
					}

					slot.index = i;
					slot.addTouchEventListener(this.onSlotTouched.bind(this), this);

					this.slots.push(slotItem);
				}
			}
                
       		this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755
		}
		FWUI.setWidgetCascadeOpacity(this.widget, true);
	},

	onEnter: function () {
		this._super();
		cc.log(this.LOGTAG, "onEnter");
	},

	onExit: function () {
		this._super();
		cc.log(this.LOGTAG, "onExit");
	},

	show: function ()
	{
		cc.log(this.LOGTAG, "show", FWUI.isShowing(UI_DICE), "dice: %j", gv.userData.getDice(), "winSlot:", gv.userData.getDiceWinSlot(), "activeSlot:", gv.dice.getActiveSlot());

		if (!FWUI.isShowing(UI_DICE))
		{
			if (this.widget)
			{
				// init ui
				var uiDefine = {
					textGem: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
					textHint: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_DIALOG },
					textSeed: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
					textTime: { type: UITYPE_TEXT, id: "", style: TEXT_STYLE_TEXT_NORMAL },
					doubleIcon: { visible: false, opacity: 0 },
					doubleLight: { visible: false, opacity: 0 },
					panelFlower: { onTouchEnded: this.onButtonSpinTouched.bind(this), enabled: true },
					buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this), enabled: true },
					eventItemBg: {visible:false},
					background:{type:UITYPE_IMAGE, value:"common/images/hud_magic_dice_bg.png", isLocalTexture:true, discard:true, scale:2},
					backgroundCover:{type:UITYPE_IMAGE, value:"common/images/hud_magic_dice_bg_cover.png", isLocalTexture:true, discard:true, scale:2},
				};
				
				// jira#5814: event
				var eventRewards = gv.dice.getFestivalReward();
				uiDefine.eventItemBg = {visible:false};
				for(var key in eventRewards)
				{
					uiDefine.eventItemBg = {visible:true};
					uiDefine.eventItemAmount = {type:UITYPE_TEXT, value:"x" + eventRewards[key], style:TEXT_STYLE_NUMBER, visible:eventRewards[key] > 0};
					//uiDefine.eventItem = {type:UITYPE_ITEM, value:g_MISCINFO.EV01_POINT, scale:0.65};
					if(GameEvent.currentEvent) {
						uiDefine.eventItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV01_POINT, scale: 0.65};
					}
					else if(GameEventTemplate2.getActiveEvent())
					{
						uiDefine.eventItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV02_DROP_ITEM, scale: 0.65};
					}
					else if(GameEventTemplate3.getActiveEvent())
					{
						//let id = g_EVENT_03.E03_FEATURE_DROP_LIST.rules["DICE_SPIN_" + 3]["dropItemID"];
						var id = key;
						uiDefine.eventItem = {type: UITYPE_ITEM, value: id, scale: 0.65};
					}
					break;
				}

				FWUI.fillData(this.widget, null, uiDefine);
			}

			FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_NONE, true);
			AudioManager.effect (EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {return this.onButtonCloseTouched();}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
		}

		this.toggleSlotItemAll(true, true);
		this.toggleSlotLightAll(false, true);

		this.setActiveSlot(gv.dice.getActiveSlot(), true);
		this.setActiveSlotList(gv.dice.getSlots(), true);

		this.update();
		this.updateBoard();
		this.updateDouble();
		this.updateWidget();
		this.updateSlots();
		this.playfireflies();

		if (!this.isUpdateScheduled) {
			this.isUpdateScheduled = true;
			cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.5, cc.REPEAT_FOREVER, 0, false);
		}
		
		if (gv.dice.getWaitSlot() > -1)
			this.onShowReward ();

		this.refreshEventItems();
	},
	
	refreshEventItems:function()
	{
		// jira#5814: event: refresh amount
		var eventItemBg = FWUtils.getChildByName(this.widget, "eventItemBg");
		var eventRewards = FWUtils.getItemsArray(gv.dice.getFestivalReward());
		if(eventRewards.length > 0)
		{
			eventItemBg.setVisible(true);
			var item = eventRewards[0];
			var eventItemAmount = FWUtils.getChildByName(eventItemBg, "eventItemAmount");
			if(item.amount > 0)
			{
				var uiDefine = {};
				//eventItemAmount.setVisible(true);
				//eventItemAmount.setString(item.displayAmount);
				uiDefine.eventItemAmount = {type:UITYPE_TEXT, value:item.displayAmount, style:TEXT_STYLE_NUMBER, visible:true};
				uiDefine.eventItem = {type: UITYPE_ITEM, value: item.itemId, scale: 0.65};
				FWUI.fillData(eventItemBg,null,uiDefine);
			}
			else
				eventItemAmount.setVisible(false);
		}
		else
			eventItemBg.setVisible(false);
	},
	
	hide: function () {
		cc.log(this.LOGTAG, "hide");
		//if (this.isBusy)
		//	return true;

		if (this.collectTimer)
			clearTimeout(this.collectTimer);

		if (this.npcTimer)
			clearTimeout(this.npcTimer);

		for (var i in this.slots)
		{
			var slot = this.slots [i];
			slot.stopAllActions();//BUG HERE: invalid native object
		}

		for (var i in this.fireflies)
		{
			var firefly = this.fireflies [i];
			
			//opt
			//var skin = FWUI.getChildByName(firefly, "skin");
			//firefly.stopAllActions();
			//skin.stopAllActions();
			firefly.stopAllActions();
		}

		if (this.hintToast && this.hintToast.getParent() === this.widget)
			this.hintToast.removeFromParent();

		FWUI.hideWidget(this.widget, UIFX_NONE);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		gv.arcade.refreshNotification();
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
		if(this.isUpdateScheduled)
		{
			this.isUpdateScheduled = false;
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		}
	},

	update: function (dt)
	{
		var time = gv.dice.getTime();
		if (time)
		{
			var timeLeft = Math.max(time.timeEnd - Game.getGameTimeInSeconds(), 0);
			this.textTime.setString(FWUtils.secondsToTimeString(timeLeft));
		}
	},

	updateBoard: function ()
	{
		var slots = gv.dice.getSlots();
		if (!slots)
			return;
		
		for (var i = 0; i < slots.length; i++)
			this.updateSlotItem (i);
	},

	updateWidget: function ()
	{
		var coinSpent = gv.dice.getSpentCoin();
		if (coinSpent.require > 0)
		{
			this.barGem.setPercent(coinSpent.current * 100 / coinSpent.require);
			this.textGem.setString(cc.formatStr("%d/%d", coinSpent.current, coinSpent.require));
		}
		else
		{
			this.barGem.setPercent(100);
			this.textGem.setString("");
		}
	
		if (coinSpent.require > coinSpent.current)
			this.textHint.setString(cc.formatStr(FWLocalization.text("TXT_DICE_HINT_SPEND_MORE_DIAMOND"), coinSpent.require - coinSpent.current));
		else
			this.textHint.setString(FWLocalization.text("TXT_DICE_HINT_COMEBACK"));
	
		this.textSeed.setString(cc.formatStr("x %d", gv.dice.getTicket()));
		this.flower.setAnimation((gv.dice.getTicket() > 0) ? DICE_FLOWER_ANIM_ACTIVE : DICE_FLOWER_ANIM_NORMAL, true);
	},

	updateDouble:function ()
	{
		var isDouble = gv.dice.isDouble();
		if (isDouble === this.doubleIcon.isVisible())
			return;
			
		if (isDouble)
		{
			var action = cc.spawn(cc.sequence(cc.show(), cc.fadeTo(1, 255)));
			this.doubleIcon.setOpacity (0);
			this.doubleIcon.runAction(action);
			
			action = cc.spawn(cc.sequence(cc.show(), cc.fadeTo(1, 255)));
			this.doubleLight.setOpacity (0);
			this.doubleLight.runAction(action);
		}
		else
		{
			var action = cc.spawn(cc.sequence(cc.fadeOut(1), cc.hide()));
			this.doubleIcon.runAction(action);
			
			action = cc.spawn(cc.sequence(cc.fadeOut(1), cc.hide()));
			this.doubleLight.runAction(action);
		}
	},

	updateSlots: function ()
	{
		for (var i in this.slots)
		{
			var slotItem = this.slots [i];
			slotItem.stopAllActions ();
			
			slotItem.runAction(
				cc.sequence(
					cc.delayTime(i * 0.1),
					cc.callFunc(
						function(target) {//web
							var scaleBase = target.getScale();
							var scaleWidth = cc.scaleTo(DICE_SLOT_ITEM_SPRING_TIME, scaleBase + DICE_SLOT_ITEM_SPRING_SCALE, scaleBase - DICE_SLOT_ITEM_SPRING_SCALE);
							var scaleHeight = cc.scaleTo(DICE_SLOT_ITEM_SPRING_TIME, scaleBase - DICE_SLOT_ITEM_SPRING_SCALE, scaleBase + DICE_SLOT_ITEM_SPRING_SCALE);
							var scaleWidthSlow = cc.scaleTo(DICE_SLOT_ITEM_SPRING_TIME * 2, scaleBase + DICE_SLOT_ITEM_SPRING_SCALE, scaleBase - DICE_SLOT_ITEM_SPRING_SCALE);
							var scaleHeightSlow = cc.scaleTo(DICE_SLOT_ITEM_SPRING_TIME * 2, scaleBase - DICE_SLOT_ITEM_SPRING_SCALE, scaleBase + DICE_SLOT_ITEM_SPRING_SCALE);
							var scaleRestore = cc.scaleTo(DICE_SLOT_ITEM_SPRING_TIME * 2, scaleBase, scaleBase);
							target.runAction(cc.repeatForever(new cc.EaseSineInOut(cc.sequence(scaleWidth, scaleHeight, scaleWidthSlow, scaleHeightSlow, scaleRestore, cc.delayTime(3.0)))));
						},
						slotItem
					)
				)
			);
		}
	},

	updateSlotItem: function (slotId)
	{
		var slotSpine = FWUI.getChildByName(this.slots[slotId], "itemSpine");
		var slotSprite = FWUI.getChildByName(this.slots[slotId], "itemSprite");
		
		var slots = gv.dice.getSlots();
		var slotIcon = this.getSlotIcon(slots[slotId][DICE_SLOT_ITEM]);
		
		cc.log(this.LOGTAG, "updateSlotItem", "slotId", slotId, JSON.stringify (slots[slotId]));

		if (slotIcon.sprite)
		{
			FWUI.fillData_image2(slotSprite, slotIcon.sprite, slotIcon.scale || 1.0);
		}
		else if (slotIcon.spine)
		{
			FWUI.fillData_spine2(slotSpine, slotIcon.spine, slotIcon.skin || "", slotIcon.anim || "", slotIcon.scale || 1.0);
			if (slotIcon.offset)
				slotSpine.setPosition(cc.PADD(DICE_SLOT_SPINE_POSITION, slotIcon.offset));
			else
				slotSpine.setPosition(DICE_SLOT_SPINE_POSITION);
		}

		slotSpine.setVisible(slotIcon.spine !== undefined);
		slotSprite.setVisible(slotIcon.sprite !== undefined);
	},

	playfireflies: function ()
	{
		var act = function(widget, x, y, width, height)//web
		{
			var time = Math.random () * 2 + 5;
			var distance = Math.random() * 50 + 50;
			var p = widget.getPosition ();
			var nX = p.x + Math.random() * distance * (Math.random() > 0.5 ? 1 : -1);
			if (nX < x)
				nX = x;
			else if (nX > width)
				nX = width;
			
			var nY = p.y + Math.random() * distance * (Math.random() > 0.5 ? 1 : -1);
			if (nY < y)
				nY = y;
			else if (nY > height)
				nY = height;

			var moveTo = cc.moveTo (time, cc.p(nX, nY));
			// var roll = cc.rotateTo(Math.random() * time, Math.random() * 360);
			var back = cc.callFunc(function() {act(widget, x, y, width, height);});//web

			var fadeOut = cc.fadeTo(time * 0.5, Math.random() * 75 + 180);
			var fadeIn = cc.fadeTo(time * 0.5, 255);
			
			var scaleOut = cc.scaleTo(time * 0.5, (Math.random() + 0.5));
			var scaleIn = cc.scaleTo(time * 0.5, 1);

			var acts = [
				cc.spawn (
					moveTo,//cc.spawn (moveTo, roll),
					cc.sequence(cc.spawn (fadeOut, scaleOut), cc.spawn (fadeIn, scaleIn))), back];

			widget.stopAllActions ();
			widget.runAction(cc.sequence(acts));
		};

		for (var i in this.fireflies)
		{
			var firefly = this.fireflies [i];
			//opt var skin = FWUI.getChildByName(firefly, "skin");

			firefly.setPosition (cc.winSize.width * Math.random(), cc.winSize.height * Math.random());
			act (firefly, cc.winSize.width * 0.0, cc.winSize.height * 0.75, cc.winSize.width * 1, cc.winSize.height * 1);

			//opt
			//skin.setOpacity (Math.random() * 255);
			//act (skin, -15, -15, 30, 30);
			firefly.setOpacity (Math.random() * 255);
		}
	},

	performDice: function (slotActive, slotTarget)
	{
		cc.log(this.LOGTAG, "performDice", "slotActive:", slotActive, "slotTarget:", slotTarget);

		if (this.isDicing)
			return;

		this.isDicing = true;

		var slotFinal = slotTarget % g_MISCINFO.DICE_SPIN_SIZE;

		var slotBegin = slotFinal;
		var slotEnd = slotFinal + 1;

		if (this.getSlotEdge(slotActive) === this.getSlotEdge(slotFinal)) {
			slotBegin = slotActive + 1;
			slotEnd = slotActive + 7;
		}
		else {
			while (slotBegin > 0 && !this.getSlotAnchor(slotBegin))
				slotBegin--;
			while (slotEnd < g_MISCINFO.DICE_SPIN_SIZE && !this.getSlotAnchor(slotEnd))
				slotEnd++;
		}

		var delayLight = 1.5;
		var delayCollect = 5.0;

		var slots = [];
		for (var i = slotBegin; i <= slotEnd; i++) {
			this.toggleSlotLight(i, true, false, delayLight);
			if (i !== slotFinal)
				slots.push(i);
		}

		this.flower.setAnimation(DICE_FLOWER_ANIM_TOUCH, false, function()//web
		{
			this.flower.setAnimation((gv.dice.getTicket() > 0) ? DICE_FLOWER_ANIM_ACTIVE : DICE_FLOWER_ANIM_NORMAL, true);

			var i = 0;
			while (slots.length > 0)
			{
				var index = Math.floor(cc.random0To1() * (slots.length - 1));
				this.toggleSlotLight(slots[index], false, false, i * DICE_SLOT_LIGHT_EFFECT_TIME * 0.8);
				slots.splice(index, 1);
				i++;
			}
		}.bind(this));

		this.collectTimer = setTimeout(function()//web
		{
			clearTimeout(this.collectTimer);
			this.collectTimer = null;
			this.performCollect(slotActive, slotTarget);
		}.bind(this), delayCollect * 1000);

		this.npcTimer = setTimeout(function()//web
		{
			clearTimeout(this.npcTimer);
			this.npcTimer = null;
			this.placeNPCToSlot(slotActive);
		}.bind(this), delayLight * 1000);
	},

	performCollect: function (slotBegin, slotEnd)
	{
		cc.log(this.LOGTAG, "performCollect", slotBegin, slotEnd);
		var collectCallback = function() {
			this.toggleSlotLight(slotEnd % g_MISCINFO.DICE_SPIN_SIZE, false, false);
			this.toggleSlotItem(slotEnd % g_MISCINFO.DICE_SPIN_SIZE, false, false, DICE_SLOT_ITEM_EFFECT_TIME);
		}.bind(this);

		var finishCallback = function() {this.onSpinEnd (slotEnd);}.bind(this);

		this.moveNPCToSlot(slotBegin, slotEnd, true, null, collectCallback, finishCallback);

		for (var i = slotBegin; i < slotEnd; i++)
		{
			var slotIndex = i % g_MISCINFO.DICE_SPIN_SIZE;
			var slotOffset = (i - slotBegin);

			var slotItemReplace = function(sid) {this.updateSlotItem (sid);}.bind(this);

			var timeOffset = (i > slotBegin) ? slotOffset * 0.4 : 0;
			this.toggleSlotItem(slotIndex, false, false, DICE_SLOT_ITEM_EFFECT_TIME, 1.0 + timeOffset, slotItemReplace.bind(this, slotIndex));
			this.toggleSlotItem(slotIndex, true, false, DICE_SLOT_ITEM_EFFECT_TIME * 0.5, 6.0 + timeOffset * 0.5);
		}
	},
	
	toggleSlotItem: function (index, value, instant, time, delay, callback)//web toggleSlotItem: function (index, value, instant = false, time = 0, delay = 0, callback = null)
	{
		if(instant === undefined)
			instant = false;
		if(time === undefined)
			time = 0;
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
		if (!this.slots || index < 0 || index >= this.slots.length)
			return;
			
		var slotScale = (this.getSlotAnchor(index)) ? DICE_SLOT_ITEM_SCALE_ANCHOR : DICE_SLOT_ITEM_SCALE_NORMAL;
		if (instant) {

			this.slots[index].setScale(slotScale);
			this.slots[index].setOpacity(255);
			this.slots[index].setVisible(value);

			callback && callback();
			return;
		}
		
		var actionDelay = cc.delayTime(delay);
		var actionExecute = null;
		if (value)
		{
			actionExecute = cc.callFunc(function()//web
			{
				var action = cc.spawn(cc.sequence(cc.show(), new cc.EaseSineOut(cc.scaleTo(time, slotScale + 0.2)),
					new cc.EaseSineOut(cc.scaleTo(time, slotScale))), cc.fadeIn(time));

				this.slots[index].setOpacity(0);
				this.slots[index].setScale(0);

				if (callback)
					this.slots[index].runAction(cc.sequence(action, cc.callFunc(callback)));
				else
					this.slots[index].runAction(action);
			}.bind(this));
		}
		else
			actionExecute = cc.callFunc(function()//web
			{
				var action = cc.spawn(cc.sequence(new cc.EaseSineIn(cc.scaleTo(time * 0.4, slotScale + 0.1)),
					new cc.EaseSineOut(cc.scaleTo(time * 0.6, 0)), cc.hide()), cc.fadeOut(time));

				if (callback)
					this.slots[index].runAction(cc.sequence(action, cc.callFunc(callback)));
				else
					this.slots[index].runAction(action);
			}.bind(this));

		this.slots[index].runAction(cc.sequence(actionDelay, actionExecute));
	},

	toggleSlotItemAll: function (value, instant, time, delay) {//web toggleSlotItemAll: function (value, instant = false, time = 0, delay = 0) {
		
		if(instant === undefined)
			instant = false;
		if(time === undefined)
			time = 0;
		if(delay === undefined)
			delay = 0;
		
		for (var i = 0; i < this.slots.length; i++)
			this.toggleSlotItem(i, value, instant, time, delay);
	},

	toggleSlotLight: function (index, value, instant, delay, callback) {//web toggleSlotLight: function (index, value, instant = false, delay = 0, callback = null) {
		
		if(instant === undefined)
			instant = false;
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
		if (this.slots && index >= 0 && index < this.slots.length) {
			var light = this.slots[index].lightFocus;
			if(cc.sys.isNative)
			{
				if (instant) {
					light.setOpacity(255);
					light.setVisible(value);
				}
				else {
					if (value) {
						light.node.setOpacity(0);
						light.node.setScaleX(0.7);
						light.node.runAction(cc.sequence(cc.delayTime(delay), cc.show(), cc.spawn(new cc.EaseSineOut(cc.scaleTo(DICE_SLOT_LIGHT_EFFECT_TIME, 1, 1)), cc.fadeIn(DICE_SLOT_LIGHT_EFFECT_TIME))));
					}
					else {
						light.node.setOpacity(255);
						light.node.setScaleX(1.0);
						light.node.runAction(cc.sequence(cc.delayTime(delay), cc.show(), cc.spawn(new cc.EaseSineOut(cc.scaleTo(DICE_SLOT_LIGHT_EFFECT_TIME, 0.7, 1)), cc.fadeOut(DICE_SLOT_LIGHT_EFFECT_TIME))));
					}
				}
			}
			else // web jira#7260
			{
				if (instant) {
					light.setVisible(value);
					light.node.setScaleX(1);
				}
				else {
					if (value) {
						light.node.setScaleX(0);
						light.node.runAction(cc.sequence(cc.delayTime(delay), cc.show(), cc.scaleTo(DICE_SLOT_LIGHT_EFFECT_TIME, 1, 1)));
					}
					else {
						light.node.setScaleX(1.0);
						light.node.runAction(cc.sequence(cc.delayTime(delay), cc.scaleTo(DICE_SLOT_LIGHT_EFFECT_TIME, 0, 1), cc.hide()));
					}
				}
			}
		}
	},

	toggleSlotLightAll: function (value, instant, delay) {//web toggleSlotLightAll: function (value, instant = false, delay = 0) {
		
		if(instant === undefined)
			instant = false;
		if(delay === undefined)
			delay = 0;
		
		for (var i = 0; i < this.slots.length; i++)
			this.toggleSlotLight(i, value, instant, delay);
	},

	placeNPCToSlot: function (slotIndex)
	{
		cc.log(this.LOGTAG, "placeNPCToSlot", "slotIndex:", slotIndex);

		var flip = (slotIndex >= 10) ? -1 : 1;
		var scaleX = (slotIndex < 0) ? DICE_BEE_SCALE_NORMAL : DICE_BEE_SCALE_SMALL * flip;
		var scaleY = (slotIndex < 0) ? DICE_BEE_SCALE_NORMAL : DICE_BEE_SCALE_SMALL;

		this.panelNPC.setScale(scaleX, scaleY);

		var p = this.getSlotPosition(slotIndex);
		this.panelNPC.setPosition(p);

		this.toggleSlotItem(slotIndex, false, true);
		this.toggleSlotLight(slotIndex, false, true);
	},

	moveNPCToPole: function (callback)//web moveNPCToPole: function (callback = null)
	{
		if(callback === undefined)
			callback = null;
		
		cc.log(this.LOGTAG, "moveNPCToPole");
		this.placeNPCToSlot(-1);
		this.npcBee.setAnimation(DICE_BEE_ANIM_TAKE_OFF, false, function()//web
		{
			this.npcBee.setAnimation(DICE_BEE_ANIM_FLY, true);

			var pointStart = this.getSlotPosition(-1);
			var pointReady = this.getSlotPosition(0);

			var moveTime = cc.PLENGTH(cc.PSUB(pointReady, pointStart)) / DICE_BEE_MOVE_SPEED;
			var moveAction = cc.spawn(cc.moveTo(moveTime, pointReady), new cc.EaseSineOut(cc.scaleTo(moveTime, DICE_BEE_SCALE_SMALL)));

			if (callback)
				this.panelNPC.runAction(cc.sequence(moveAction, cc.callFunc(callback)));
			else
				this.panelNPC.runAction(cc.sequence(moveAction));
		}.bind(this));
	},

	moveNPCToSlot: function (slotBegin, slotEnd, takeOff, collectBegan, collectEnded, landEnded)//web moveNPCToSlot: function (slotBegin, slotEnd, takeOff = true, collectBegan = null, collectEnded = null, landEnded = null)
	{
		if(takeOff === undefined)
			takeOff = true;
		if(collectBegan === undefined)
			collectBegan = null;
		if(collectEnded === undefined)
			collectEnded = null;
		if(landEnded === undefined)
			landEnded = null;
		
		cc.log(this.LOGTAG, "moveNPCToSlot", slotBegin, slotEnd, takeOff);
		if (slotBegin < 0)
		{
			this.moveNPCToPole(function() {//web
				this.moveNPCToSlot(0, slotEnd, false, collectBegan, collectEnded, landEnded);
			}.bind(this));
			return;
		}
		
		this.placeNPCToSlot(slotBegin);

		var startFly = function()//web
		{
			var moveCallback = cc.callFunc(function()//web
			{
				collectBegan && collectBegan();
				this.npcBee.setAnimation(DICE_BEE_ANIM_COLLECT, false, function()//web
				{
					collectEnded && collectEnded();
					this.npcBee.setAnimation(DICE_BEE_ANIM_LANDING, false, function()//web
					{
						landEnded && landEnded();
						this.npcBee.setAnimation(DICE_BEE_ANIM_WAITING, true);
					}.bind(this));
				}.bind(this));
			}.bind(this));

			var actions = [];
			var stations = this.getSlotRoute(slotBegin, slotEnd);
			stations.forEach(function(station)//web
			{
				actions.push(cc.moveTo(station.distance / DICE_BEE_MOVE_SPEED, station.destination));
				actions.push(cc.scaleTo(0, station.flip * DICE_BEE_SCALE_SMALL, DICE_BEE_SCALE_SMALL));
			}.bind(this));

			actions.push(moveCallback);

			this.npcBee.setAnimation(DICE_BEE_ANIM_FLY, true);
			this.panelNPC.runAction(cc.sequence(actions));
		}.bind(this);

		if (takeOff) {
			this.npcBee.setAnimation(DICE_BEE_ANIM_TAKE_OFF, false, function() {
				startFly();
			}.bind(this));
		}
		else {
			startFly();
		}
	},

	setActiveSlot: function (slotIndex, refresh) {//web setActiveSlot: function (slotIndex, refresh = false) {
		
		if(refresh === undefined)
			refresh = false;
		
		cc.log(this.LOGTAG, "setActiveSlot", "slotIndex:", slotIndex);
		this.activeSlot = slotIndex % g_MISCINFO.DICE_SPIN_SIZE;
		if (refresh)
			this.placeNPCToSlot(this.activeSlot);
	},

	setActiveSlotList: function (slotList, refresh) {//web setActiveSlotList: function (slotList, refresh = false) {
		
		if(refresh === undefined)
			refresh = false;
		
		cc.log(this.LOGTAG, "setActiveSlotList", "slotList: %j", slotList);
		this.activeSlotList = slotList;
	},

	getSlotEdge: function (slotIndex) {
		if (slotIndex >= 0 && slotIndex <= 5)
			return 0;
		if (slotIndex >= 5 && slotIndex <= 10)
			return 1;
		if (slotIndex >= 10 && slotIndex <= 15)
			return 2;
		if (slotIndex >= 15 && slotIndex <= 20)
			return 3;
	},

	getSlotAnchor: function (slotIndex) {
		return slotIndex === 0 || slotIndex === 5 || slotIndex === 10 || slotIndex === 15;
	},

	getSlotPosition: function (slotIndex, isNPC)//web getSlotPosition: function (slotIndex, isNPC = true)
	{
		if(isNPC === undefined)
			isNPC = true;
		
		if (slotIndex < 0 || !this.slots[slotIndex])
			return this.panelNPCWait.getPosition();
		
		// var isAnchor = this.getSlotAnchor(slotIndex);
		var p = this.slots[slotIndex].getPosition();
		
		if (isNPC)
		{
			p.x += (slotIndex < 10) ? 10 : (-10);
			p.y += 10;
		}

		return p;
	},

	getSlotRoute: function (slotBegin, slotEnd) {

		var stations = [];
		var position = this.getSlotPosition(slotBegin);

		for (var i = slotBegin + 1; i < slotEnd; i++) {
			var index = i % g_MISCINFO.DICE_SPIN_SIZE;
			if (this.getSlotAnchor(index)) {
				stations.push({
					distance: cc.PLENGTH(cc.PSUB(this.getSlotPosition(index), position)),
					destination: this.getSlotPosition(index),
					flip: (index >= 10) ? -1 : 1
				});
				position = this.getSlotPosition(index);
			}
		}

		slotEnd = slotEnd % g_MISCINFO.DICE_SPIN_SIZE;
		stations.push({
			distance: cc.PLENGTH(cc.PSUB(this.getSlotPosition(slotEnd), position)),
			destination: this.getSlotPosition(slotEnd),
			flip: (slotEnd >= 10) ? -1 : 1
		});

		return stations;
	},

	getSlotIcon: function (itemId) {
		if (itemId === ID_DICE) {
			return {
				sprite: "items/item_soul_seed.png",
				scale: 0.5
			}
		}
		else if (itemId === ID_X2) {
			return {
				sprite: "items/item_bonus_x2.png",
				scale: 0.5
			}
		}
		else {
			return Game.getItemGfxByDefine(itemId);
		}
	},
	
	onSpinResponse: function (packet) {
		cc.log(this.LOGTAG, "onSpinResponse: %j", packet);
		cc.log(this.LOGTAG, "onSpinResponse", "dice: %j", gv.userData.getDice(), "winSlot:", gv.userData.getDiceWinSlot(), "activeSlot:", gv.dice.getActiveSlot());
		if (packet.error !== 0)
			return;

		var targetSlot = gv.dice.getActiveSlot();
		if (targetSlot < this.activeSlot)
			targetSlot = targetSlot + g_MISCINFO.DICE_SPIN_SIZE;

		this.updateWidget();

		this.performDice(this.activeSlot, targetSlot);
		this.setActiveSlot(gv.dice.getActiveSlot());
		
		// gv.dice.requestDiceClaim();
	},

	onClaimResponse: function (packet)
	{
		this.disableBackButton = false;
		cc.log(this.LOGTAG, "onClaimResponse: %j", packet);
		if (packet.error !== 0)
			return;

		this.updateDouble();
		this.updateWidget();
		this.refreshEventItems();
	},

	onSpentCoinChanged: function (newSpent, newTicket) {
		cc.log(this.LOGTAG, "onSpentCoinChanged", "newSpent:", newSpent, "newTicket:", newTicket);
		this.updateWidget();
	},

	onSlotTouched: function (sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			cc.log(this.LOGTAG, "onSlotTouched", "slotIndex:", sender.index);
		}
	},

	onButtonSpinTouched: function (sender) {
		cc.log(this.LOGTAG, "onButtonSpinTouched"
		, "dice", JSON.stringify (gv.userData.getDice())
		, "winSlot", gv.userData.getDiceWinSlot()
		, "activeSlot", gv.dice.getActiveSlot()
		, "waitSlot", gv.dice.getWaitSlot()
		, "ticket", gv.dice.getTicket()
		, "isDicing", this.isDicing
		);

		if (this.isDicing)
			return;
		
		if (gv.dice.getWaitSlot() > -1)
		{
			cc.log (this.LOGTAG, "onButtonSpinTouched", gv.dice.getWaitSlot());
			this.onShowReward ();
		}
		else if (gv.dice.getTicket() > 0) {
			this.disableBackButton = true;
			gv.dice.requestDiceSpin();
		}
		else {
			var coinSpent = gv.dice.getSpentCoin();
			if (coinSpent.require == coinSpent.current)
				this.hintToast = gv.hint.showHintToast(this.widget, FWLocalization.text("TXT_DICE_HINT_NO_MORE_SEED"), {}, 5);
		}

		AudioManager.effect (EFFECT_GOLD_FLY_TO_STOCK_1);
	},

	onButtonCloseTouched: function (sender) {
		if(this.disableBackButton)
			return true;
		
		cc.log(this.LOGTAG, "onButtonCloseTouched");
		return this.hide();
	},

	onSpinEnd: function (slotId)
	{
		cc.log(this.LOGTAG, "onSpinEnd", "pos", gv.dice.getActiveSlot(), "wait", gv.dice.getWaitSlot());
		AudioManager.effect (EFFECT_UPGRADE_SUCCESS);
		this.onShowReward ();
	},

	onShowReward: function ()
	{
		this.disableBackButton = false;
		var items = gv.dice.getReward ();
		Game.showGiftPopup(items, FWLocalization.text("TXT_DICE_REWARD_TITLE"),
			function() {//web
				this.isDicing = false;
				gv.dice.requestDiceClaim()
			}.bind(this),
			function() {this.onButtonCloseTouched();}.bind(this)//() => {this.hide();}
		);
	}
});