    const CLOWN_ANIM_IDLE_1 = "idle_01";
const CLOWN_ANIM_IDLE_2 = "idle_02";
const CLOWN_ANIM_IDLE_3 = "idle_03";

const CLOWN_ANIM_IDLE_GIFT = "idle_gift";
const CLOWN_ANIM_IDLE_ROLLING = "idle_rolling";

const CLOWN_ANIM_WALK_IN = "walk_in";
const CLOWN_ANIM_WALK_OUT = "walk_out";
const CLOWN_ANIM_WALK_OUT_SAD = "walk_out_sad";
const CLOWN_ANIM_WALK_STOP = "walk_stop";

const WHEEL_SLOT_BASE_COUNT = 7;

const WHEEL_SPIN_ANGLE_SPEED_MIN = 100;
const WHEEL_SPIN_ANGLE_SPEED_MAX = 900;
const WHEEL_SPIN_ANGLE_SPEED_BEGIN = 700;

const WHEEL_SPIN_ANGLE_ACCEL_BEGIN = 700;
const WHEEL_SPIN_ANGLE_ACCEL_END = 200;

const WHEEL_SLOT_LIGHT_RADIUS = 245;
const WHEEL_HAND_MAX_ANGLE = -60;

const WHEEL_SLOT_TYPES = {
    GOLD: 1,
    GREEN: 2,
    GREEN_DARK: 4,
    BLUE: 5,
    RED: 3
};

var WheelPopup = cc.Node.extend({
    LOGTAG: "[WheelPopup]",
	
	disableBackButton: false, // jira#5454

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
        cc.log(this.LOGTAG, "show", "wheel: %j", gv.userData.getWheel(), "winSlot:", gv.wheel.getWinSlot(), "waitSlot:", gv.wheel.getWaitSlot());

        if (!FWUI.isShowing(UI_WHEEL_MAIN)) {

            this.isBusy = false;
            this.widget = FWPool.getNode(UI_WHEEL_MAIN, false);
            if (this.widget) {

                this.panelNPC = FWUI.getChildByName(this.widget, "panelNPC");
                this.panelNPC.setLocalZOrder(1000);
                if (!this.npcClown) {
                    this.npcClown = new FWObject();
                    this.npcClown.initWithSpine(SPINE_NPC_CLOWN_BIG);
                    this.npcClown.setAnimation(CLOWN_ANIM_IDLE_2, true);
                    this.npcClown.setScale(0.3);
                    this.npcClown.setParent(this.panelNPC);
                }

                this.buttonClose = FWUI.getChildByName(this.widget, "buttonClose");
                this.buttonClose.setLocalZOrder(1000);

                this.panelDesc = FWUI.getChildByName(this.widget, "panelDesc");
                this.panelDesc.setLocalZOrder(1000);

                this.textHint = FWUI.getChildByName(this.panelDesc, "textHint");

                if (!this.panelReward) {

                    this.panelReward = FWPool.getNode(UI_REWARD);
                    this.panelReward.setVisible(false);
                    this.panelReward.setContentSize(cc.size(cc.winSize.width, cc.winSize.height));
                    this.widget.addChild(this.panelReward);

                    if (!this.particleReward) {
                        this.particleReward = new cc.ParticleSystem("effects/particle_congrats.plist");
                        this.particleReward.setDuration(-1);
                        this.particleReward.setTotalParticles(15);
                        this.particleReward.setPosVar(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.25));
                        this.particleReward.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 1.25);
                        this.panelReward.addChild(this.particleReward);
                    }
                }

                this.iconDouble = FWUI.getChildByName(this.widget, "iconDouble");
                //this.textDouble = FWUI.getChildByName(this.widget, "textDouble");

                this.panelDoubleLight = FWUI.getChildByName(this.widget, "panelDoubleLight");
                if (!this.doubleLight) {
                    this.doubleLight = new FWObject();
                    this.doubleLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                    this.doubleLight.setAnimation("effect_light_icon", true);
                    this.doubleLight.setScale(1.2);
                    this.doubleLight.setParent(this.panelDoubleLight);
                    this.doubleLight.setPosition(cc.p(0, 0));
                }

                this.wheelHand = FWUI.getChildByName(this.widget, "handSpin");
                this.wheelSlots = FWUI.getChildByName(this.widget, "wheelSlots");
                this.wheelLight = FWUI.getChildByName(this.widget, "wheelLight");
                this.wheelCircle = FWUI.getChildByName(this.widget, "panelWheel");

                this.milestoneCount = FWUI.getChildByName(this.widget, "textCountValue");

                this.milestoneArrowTop = FWUI.getChildByName(this.widget, "panelArrowTop");
                this.milestoneArrowBot = FWUI.getChildByName(this.widget, "panelArrowBot");

                this.milestoneHand = FWUI.getChildByName(this.widget, "handMilestone");
                this.milestoneHand.setPositionX(75);
                this.milestoneHand.runAction(cc.repeatForever(cc.sequence(new cc.EaseSineOut(cc.moveBy(0.5, cc.p(30, 0))), new cc.EaseSineIn(cc.moveBy(0.5, cc.p(-30, 0))))));

                this.milestones = [];
                for (var i = 0; i < g_MISCINFO.SPIN_PRICE_TURN.length; i++) {
                    var milestonePoint = FWUI.getChildByName(this.widget, cc.formatStr("point%d", i));
                    var milestoneLink = FWUI.getChildByName(this.widget, cc.formatStr("link%d", i));
                    this.milestones.push({
                        point: milestonePoint,
                        link: milestoneLink
                    });
                }

                this.textSpin = FWUI.getChildByName(this.widget, "textSpin");
                this.buttonSpin = FWUI.getChildByName(this.widget, "buttonSpin");

                this.iconSpinPrice = FWUI.getChildByName(this.widget, "iconSpinPrice");
                this.textSpinPrice = FWUI.getChildByName(this.widget, "textSpinPrice");

                var uiDefine = {
                    cloudTop:{visible:true},
                    textFreeTop: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_FREE"), style: TEXT_STYLE_TITLE_LUCK_SPIN_FREE },
                    textFreeBot: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_FREE"), style: TEXT_STYLE_TITLE_LUCK_SPIN_FREE },
                    textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_TITLE"), style: TEXT_STYLE_TITLE_1 },
                    textCountTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_TURN"), style: TEXT_STYLE_TEXT_NORMAL },
                    textCountValue: { type: UITYPE_TEXT, id: "0/0", style: TEXT_STYLE_TEXT_NORMAL_GREEN },
                    //textBuffItemCount: { type: UITYPE_TEXT, id: "x0", style: TEXT_STYLE_NUMBER },
                    textSpin: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_ACTION_SPIN"), style: TEXT_STYLE_TITLE_LUCK_SPIN },
                    textSpinPrice: { type: UITYPE_TEXT, id: "0", style: TEXT_STYLE_NUMBER_BIG },
                    iconDouble: { type: UITYPE_IMAGE, id: "items/item_bonus_x2.png", visible: gv.wheel.isDouble() },
                    //textDouble: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_REWARD_ITEM"), style: TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE_ITEM, visible: gv.wheel.isDouble() },
                    textHint: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_HINT_DEFAULT"), style: TEXT_STYLE_TEXT_DIALOG },
                    panelDoubleLight: { visible: gv.wheel.isDouble() },
                    panelBonus: { visible: false },
                    buttonSpin: { onTouchEnded: this.onButtonSpinTouched.bind(this), enabled: true },
                    buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this), enabled: true }
                };
				
				// event
				var data = gv.userData.getWheel();
				for(var key in data[SPIN_EVENT_ITEMS])
				{
					uiDefine.panelBonus = {visible:true};
					uiDefine.textBuffItemCount = {type:UITYPE_TEXT, value:"x" + data[SPIN_EVENT_ITEMS][key], style:TEXT_STYLE_NUMBER, visible:data[SPIN_EVENT_ITEMS][key] > 0};
                    if(GameEvent.currentEvent) {
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV01_POINT, scale: 0.65};
                    }
                    else if(GameEventTemplate2.getActiveEvent())
                    {
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV02_DROP_ITEM, scale: 0.65};
                    }
                    else if(GameEventTemplate3.getActiveEvent())
                    {
                        var id = g_EVENT_03.E03_FEATURE_DROP_LIST.rules["LUCKY_SPIN_" + data[SPIN_NUM_SPIN]]["dropItemID"];
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value:id , scale: 0.65};
                    }
					break;
				}

                FWUI.fillData(this.widget, null, uiDefine);
            }

            FWUI.setWidgetCascadeOpacity(this.widget, true);
            FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
			this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755

            this.updateWheel();
            this.updateWheelButton();
            this.updateMilestone();

            var waitSlot = gv.wheel.getWaitSlot();
            if (waitSlot) {
                this.showReward(waitSlot[SPIN_SLOT_ITEM], waitSlot[SPIN_SLOT_NUM], false);
            }
            AudioManager.effect (EFFECT_LUCKY_SPIN_CLOWN);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide()}.bind(this);
			Game.gameScene.registerBackKey(this.hideFunc);
			
			// jira#5132
			FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgWheel", null, true);
        }
    },

    hide: function () {

        if (this.isBusy)
            return;

        FWUtils.hideDarkBg(null, "darkBgWheel");
        FWUI.hideWidget(this.widget, UIFX_POP);
        AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
        
        gv.background.checkClownForWalkingOut();
		
		// jira#5132
		FWUtils.hideDarkBg();
		
		if (this.isUpdateScheduled)
		{
			this.isUpdateScheduled = false;
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		}
    },

    spin: function (slot) {        
        var slots = this.lastSlots;
        cc.log(this.LOGTAG, "spin", "slots.length", slots.length, "slot:", slot);
        
        if (slot >= 0 && slot < slots.length) {

            this.targetSlot = slot;
            this.targetSlotAngle = slots[slot].angle;

            this.rewardId = slots[slot].itemId;
            this.rewardAmount = slots[slot].itemAmount;
            this.rewardFinalAmount = this.rewardAmount * (gv.wheel.isDouble() ? 2 : 1);

            this.spinAngle = 0;
            this.spinAngleSign = 1;
            this.spinAngleAccel = WHEEL_SPIN_ANGLE_ACCEL_BEGIN;
            this.spinAngleSpeed = WHEEL_SPIN_ANGLE_SPEED_BEGIN;
            this.spinAngleSpeedMin = WHEEL_SPIN_ANGLE_SPEED_MIN;
            this.spinAngleSpeedMax = WHEEL_SPIN_ANGLE_SPEED_MAX;

            this.isBusy = true;
            this.buttonSpin.setEnabled(!this.isBusy);

            if (!this.isUpdateScheduled) {
                this.isUpdateScheduled = true;
                cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1.0 / 60, cc.REPEAT_FOREVER, 0, false);
            }

            this.spinEnded = false;
            this.spinEnding = false;

            AudioManager.effect (EFFECT_LUCKY_SPIN_PLAY);
            this.performLightEffect(true, 0, 0);
        }

        gv.userData.setWheelWinSlot(-1);
    },

    update: function (dt) {

        if (this.spinEnded)
            return;

        this.spinAngle += this.spinAngleSpeed * dt;
        this.spinAngleSpeed += this.spinAngleSign * this.spinAngleAccel * dt;
        this.spinAngleSpeed = Math.min(Math.max(this.spinAngleSpeed, this.spinAngleSpeedMin), this.spinAngleSpeedMax);

        if (this.spinAngleSign > 0 && this.spinAngleSpeed >= WHEEL_SPIN_ANGLE_SPEED_MAX) {
            this.spinAngleSign = -1;
            this.spinAngleAccel = WHEEL_SPIN_ANGLE_ACCEL_END;
        }
        else if (this.spinAngleSign < 0 && this.spinAngleSpeed <= WHEEL_SPIN_ANGLE_SPEED_MIN) {
            if (this.spinEnding) {

                var angleDelta = this.targetSlotAngle - this.spinAngle % 360;
                if (Math.abs(angleDelta) <= 1 || this.spinAngleSpeed <= this.spinAngleSpeedMin) {

                    this.spinEnded = true;

                    this.wheelHand.stopAllActions();
                    this.wheelHand.runAction(cc.sequence(new cc.EaseSineOut(cc.rotateTo(0.2, 0)), cc.callFunc(this.onSpinEnded.bind(this))));
                    // cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
                }
            }
            else {

                var angle = this.spinAngle % 360;
                var angleDelta = this.targetSlotAngle - angle;
                if (angleDelta < 0)
                    angleDelta += 360;

                this.spinAngleSpeedMin = 80;
                this.spinAngleAccel = this.spinAngleSign * (this.spinAngleSpeedMin * this.spinAngleSpeedMin - this.spinAngleSpeed * this.spinAngleSpeed) / (2 * angleDelta);

                this.spinEnding = true;
            }
        }

        // exact but jitter (cause of reset to zero instantly)
        var percent = (this.spinAngle % this.slotAngle) / this.slotAngle;

        // smoother but quite slow at the end
        // var cycleAngle = this.slotAngle * 2.0;
        // var cycleOffset = this.slotAngle;
        // var percent = ((this.spinAngle + cycleOffset) % cycleAngle) / cycleAngle;
        // percent = (percent <= 0.5) ? (percent / 0.5) : (2.0 - percent / 0.5);

        this.wheelHand.setRotation(percent * WHEEL_HAND_MAX_ANGLE);
        this.wheelCircle.setRotation(this.spinAngle);
    },

    updateWheel: function () {
        cc.log(this.LOGTAG, "updateWheel");
        this.slots = gv.wheel.getSlots().map(function (item) {
            return {
                itemId: item[SPIN_SLOT_ITEM],
                itemAmount: item[SPIN_SLOT_NUM]
            }
        });
        
        if (this.wheelCircle && this.wheelSlots) {

            var slotBaseHeight = 0;
            var slotBaseAngle = 360 / WHEEL_SLOT_BASE_COUNT;

            this.slotAngle = 360 / this.slots.length;

            this.wheelSlots.removeAllChildren();
            this.wheelLight.removeAllChildren();

            for (var i = 0; i < this.slots.length; i++) {

                var slotData = this.slots[i];
                slotData.angle = 360 - this.slotAngle * i;

                var minusHeight = 0;
                var pathImg = "";
                if(this.slots.length ==3)
                {
                    pathImg = cc.formatStr("#hud/hud_wheel_slot_0%d_1.png", this.getItemSlotType(slotData.itemId));
                    slotBaseAngle = 360 / 3;
                    minusHeight = -40;
                }
                else if(this.slots.length ==4)
                {
                    pathImg = cc.formatStr("#hud/hud_wheel_slot_0%d_2.png", this.getItemSlotType(slotData.itemId));
                    slotBaseAngle = 360 / 4;
                    minusHeight = 0;
                }
                else
                {
                    pathImg = cc.formatStr("#hud/hud_wheel_slot_0%d.png", this.getItemSlotType(slotData.itemId));
                    minusHeight = 40;
                }
                var slot = new cc.Sprite(pathImg);
                this.wheelSlots.addChild(slot);

                var slotIcon = FWUI.getChildByName(slot, "slotIcon");
                if (!slotIcon) {
                    slotIcon = new ccui.ImageView();
                    slotIcon.setAnchorPoint(cc.ANCHOR_CENTER());
                    slot.addChild(slotIcon, 1, "slotIcon");
                }

                if (i === 0)
                    slotBaseHeight = slot.width * 0.5 / Math.tan(cc.degreesToRadians(slotBaseAngle * 0.5));
                var slotWidth = slotBaseHeight * Math.tan(cc.degreesToRadians(this.slotAngle * 0.5)) * 2;
                var slotScale = slotWidth / slot.width;

                cc.log("updateWheel",i,slot.width,slotBaseHeight,slotWidth,slotScale,slotBaseAngle);
                slot.setAnchorPoint(cc.ANCHOR_BOTTOM_CENTER());
                slot.setRotation(this.slotAngle * i);
                slot.setScaleX(slotScale);

                var itemGfx = Game.getItemGfxByDefine(slotData.itemId);
                if (itemGfx) {
                    if (itemGfx.sprite) {
                        FWUI.fillData_image2(slotIcon, itemGfx.sprite, (itemGfx.scale) ? (itemGfx.scale * 0.8) : 0.8);
                    }
                    else if (itemGfx.spine) {
                        FWUI.fillData_spine2(slotIcon, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", (itemGfx.scale) ? (itemGfx.scale * 0.8) : 0.8);
                    }
                }

                var slotIconPosition = cc.p(slot.width * 0.5, slotBaseHeight - minusHeight);
                slotIcon.setPosition(slotIconPosition);
                slotIcon.setScale(slotIcon.getScaleX() / slotScale, slotIcon.getScaleY());

                var direction = cc.pRotateByAngle(cc.p(0, 1), cc.p(0, 0), cc.degreesToRadians(this.slotAngle * (i + 0.5)));

                var slotLightOn = new cc.Sprite("#hud/hud_wheel_light_on.png");
                var slotLightOff = new cc.Sprite("#hud/hud_wheel_light_off.png");

                slotLightOn.setVisible(false);
                slotLightOn.setPosition(cc.p(direction.x * WHEEL_SLOT_LIGHT_RADIUS, direction.y * WHEEL_SLOT_LIGHT_RADIUS));
                slotLightOff.setPosition(cc.p(direction.x * WHEEL_SLOT_LIGHT_RADIUS, direction.y * WHEEL_SLOT_LIGHT_RADIUS));

                this.wheelLight.addChild(slotLightOff);
                this.wheelLight.addChild(slotLightOn);

                // TEST
                // var slotText = new ccui.Text(slotData.itemId, FONT_DEFAULT, 18);
                // var slotText = new ccui.Text(cc.formatStr("x%d", slotData.itemAmount), FONT_DEFAULT, 18);
                // slotText.setAnchorPoint(cc.ANCHOR_CENTER());
                // slotText.setPosition(cc.p(slot.width * 0.5, slotBaseHeight - 90));
                // slotText.enableShadow(TEXT_STYLE_TEXT_NORMAL.shadow.color, TEXT_STYLE_TEXT_NORMAL.shadow.size);
                // slotText.enableOutline(TEXT_STYLE_TEXT_NORMAL.stroke.color, TEXT_STYLE_TEXT_NORMAL.stroke.size);
                // slotText.setScale(1.0 / slotScale, 1.0);
                // slot.addChild(slotText);

                // TEMP: Will be replaced by images
                // if (slotData.itemId === ID_X2) {
                //     var slotText = FWUI.getChildByName(slot, "slotText");
                //     if (!slotText) {
                //         slotText = new ccui.Text("", FONT_DEFAULT, 30);
                //         slotText.setAnchorPoint(cc.ANCHOR_CENTER());
                //         slotText.setPosition(cc.p(slot.width * 0.5, slotBaseHeight - 35));
                //         slotText.setTextColor(TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE.color);
                //         slotText.enableShadow(TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE.shadow.color, TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE.shadow.size);
                //         slotText.enableOutline(TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE.stroke.color, TEXT_STYLE_TITLE_LUCK_SPIN_DOUBLE.stroke.size);
                //         slotText.setScale(1.0 / slotScale, 1.0);
                //         slot.addChild(slotText, 1, "slotText");
                //     }
                //     if (slotText)
                //         slotText.setString("X2");
                // }
            }

            this.wheelSlots.setScale(1.1);
            this.performLightIdleEffect(0.1, 0.5);
        }

        var clownAnim = (gv.wheel.haveNext() || gv.wheel.haveReward()) ? CLOWN_ANIM_IDLE_2 : CLOWN_ANIM_IDLE_1;
        if (this.npcClown)
            this.npcClown.setAnimation(clownAnim, true);

        if (this.textHint) {
            if (gv.wheel.haveNext()) {
                if (gv.wheel.getSpinPrice() > 0) {
                    var count = gv.wheel.getSpinCount();
                    var countTotal = g_MISCINFO.SPIN_PRICE_TURN.length;
                    this.textHint.setString(cc.formatStr(FWLocalization.text("TXT_WHEEL_HINT_SPIN_MORE"), countTotal - count));
                }
                else {
                    this.textHint.setString(FWLocalization.text("TXT_WHEEL_HINT_SPIN_FREE"));
                }
            }
            else {
                this.textHint.setString(FWLocalization.text("TXT_WHEEL_HINT_SPIN_OUT"));
            }
        }

        this.iconDouble.setVisible(gv.wheel.isDouble());
        //this.textDouble.setVisible(gv.wheel.isDouble());

        this.panelDoubleLight.setVisible(gv.wheel.isDouble());

        this.wheelHand.setRotation(0);
        this.wheelCircle.setRotation(0);
    },

    updateWheelButton: function () {

        var canBuy = gv.wheel.haveNext() && !gv.wheel.haveReward() && gv.wheel.getSpinPrice() > 0;

        this.iconSpinPrice.setVisible(canBuy);
        this.textSpinPrice.setVisible(canBuy);
        this.textSpinPrice.setString(FWUtils.formatNumberWithCommas(gv.wheel.getSpinPrice()));

        this.textSpin.setVisible(!canBuy);
        this.textSpin.setString((canBuy) ? FWLocalization.text("TXT_WHEEL_ACTION_SPIN_NEXT") : (gv.wheel.haveNext() ? FWLocalization.text("TXT_WHEEL_ACTION_SPIN") : FWLocalization.text("TXT_WHEEL_ACTION_SPIN_OVER")));

		// event
		var data = gv.userData.getWheel();
		var panelBonus = FWUtils.getChildByName(this.widget, "panelBonus");
		this.textBuffItemCount = FWUtils.getChildByName(this.widget, "textBuffItemCount");

        var bonusItem = FWUtils.getChildByName(this.widget, "bonusItem");
         //= {type: UITYPE_ITEM, value:id , scale: 0.65};
		if(Object.keys(data[SPIN_EVENT_ITEMS]).length <= 0)
			panelBonus.setVisible(false);
		else
		{
			panelBonus.setVisible(true);
			for(var key in data[SPIN_EVENT_ITEMS])
			{
				if(data[SPIN_EVENT_ITEMS][key] > 0)
				{
                    var uiDefine = {};
                    var id = key;
                    uiDefine.textBuffItemCount = {type:UITYPE_TEXT, value:"x" + data[SPIN_EVENT_ITEMS][key], style:TEXT_STYLE_NUMBER, visible:data[SPIN_EVENT_ITEMS][key] > 0};
                    if(GameEvent.currentEvent) {
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV01_POINT, scale: 0.65};
                    }
                    else if(GameEventTemplate2.getActiveEvent())
                    {
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value: g_MISCINFO.EV02_DROP_ITEM, scale: 0.65};
                    }
                    else if(GameEventTemplate3.getActiveEvent())
                    {
                        //var id = g_EVENT_03.E03_FEATURE_DROP_LIST.rules["LUCKY_SPIN_" + (data[SPIN_NUM_SPIN])]["dropItemID"];
                        uiDefine.bonusItem = {type: UITYPE_ITEM, value:id , scale: 0.65};
                    }


                    //this.textBuffItemCount.setString("x" + data[SPIN_EVENT_ITEMS][key]);
                    //this.textBuffItemCount.setVisible(true);
                    //bonusItem.setVisible(true);
                    //var gfx = Game.getItemGfxByDefine(id).sprite;
                    //bonusItem.loadTexture(gfx);
                    FWUI.fillData(panelBonus,null,uiDefine);
				}
				else
                {
                    bonusItem.setVisible(false);
                    this.textBuffItemCount.setVisible(false);
                }

				break;
			}
		}
    },

    updateMilestone: function () {

        var count = gv.wheel.getSpinCount();
        var countTotal = g_MISCINFO.SPIN_PRICE_TURN.length;
        if (this.milestones) {
            this.milestoneCount.setString(cc.formatStr("%d/%d", count, countTotal));
            for (var i = 0; i < this.milestones.length; i++) {
                this.milestones[i].point && this.milestones[i].point.setVisible(i < count);
                this.milestones[i].link && this.milestones[i].link.setVisible(i < count);
            }
        }

        this.milestoneHand.setPositionY(this.milestones[Math.max(count - 1, 0)].point.y);
        this.milestoneHand.setVisible((count > 0 && count <= countTotal) || gv.wheel.haveReward());

        this.milestoneArrowTop.setVisible(count < countTotal);
        this.milestoneArrowBot.setVisible(count <= 0);
    },

    showReward: function (itemId, itemAmount, itemClaimed) {
        cc.log(this.LOGTAG, "showReward:", "itemId:", itemId, "itemAmount:", itemAmount);

        this.rewardId = itemId;
        this.rewardAmount = itemAmount;
		this.rewardFinalAmount = itemAmount * (gv.wheel.isDouble() ? 2 : 1);
        this.rewardClaimed = itemClaimed;

        if (this.panelReward) {

            var itemStorage = gv.userStorages.getStorageForItemId(itemId);
            var canAddItem = (itemStorage) ? itemStorage.canAddItem(this.rewardFinalAmount, itemId) : true;

            var uiDefine = {
                textTitle: { type: UITYPE_TEXT, id: FWLocalization.text("TXT_WHEEL_REWARD_TITLE"), style: TEXT_STYLE_TEXT_NORMAL },
                textTitleDetail: {
                    type: UITYPE_TEXT,
                    id: Game.getItemName(itemId),
                    style: TEXT_STYLE_TEXT_NORMAL,//style: TEXT_STYLE_TEXT_NORMAL_GREEN,
                    visible: itemId != ID_X2
                },
                textMessage: {
                    type: UITYPE_TEXT,
                    id: FWLocalization.text("TXT_WHEEL_REWARD_STORAGE_FULL").toUpperCase(),
                    style: TEXT_STYLE_TEXT_NORMAL,
                    visible: false //gv.wheel.getWaitSlot() !== null && !canAddItem
                },
                textDesc: {
                    type: UITYPE_TEXT,
                    id: FWLocalization.text("TXT_WHEEL_REWARD_HINT"),
                    style: TEXT_STYLE_TEXT_NORMAL
                },
                textAmount: {
                    type: UITYPE_TEXT,
                    id: cc.formatStr("x%d", this.rewardFinalAmount),
                    style: TEXT_STYLE_TEXT_BIG,//style: TEXT_STYLE_TEXT_BIG_GREEN,
                    visible: itemId != ID_X2
                },
                itemTouch: { onTouchEnded: this.onRewardItemTouched.bind(this) },
                container: { onTouchEnded: function () {} },
                buttonClose: { onTouchEnded: this.onButtonCloseTouched.bind(this), enabled: true },
                cloudBottom:{visible:false},
                cloudTop:{visible:false},
            };

            FWUI.fillData(this.panelReward, null, uiDefine);

            var itemIcon = FWUI.getChildByName(this.panelReward, "itemIcon");
            var itemSpine = FWUI.getChildByName(this.panelReward, "itemSpine");
            var itemLight = FWUI.getChildByName(this.panelReward, "itemLight");

            if (!this.rewardLight) {

                this.rewardLight = new FWObject();
                this.rewardLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                this.rewardLight.setAnimation("effect_light_icon", true);
                this.rewardLight.setScale(1.3);
                this.rewardLight.setParent(itemLight);
                this.rewardLight.setPosition(cc.p(0, 0));

                this.rewardLight.node.setOpacity(0);
                this.rewardLight.node.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeIn(0.3)));
            }

            var itemGfx = Game.getItemGfxByDefine(itemId);
            var itemAction = cc.sequence(cc.show(), cc.spawn(cc.sequence(new cc.EaseSineOut(cc.scaleTo(0.2, 0.9)), new cc.EaseSineOut(cc.scaleTo(0.3, 1.0))), cc.fadeIn(0.3)));
            if (itemGfx.sprite) {

                FWUI.fillData_image2(itemIcon, itemGfx.sprite, 1.0);

                itemIcon.setOpacity(0);
                itemIcon.setScale(2.0);
                itemIcon.runAction(itemAction);
            }
            else if (itemGfx.spine) {

                FWUI.fillData_spine2(itemSpine, itemGfx.spine, itemGfx.skin || "", itemGfx.anim || "", 1.0);

                itemSpine.setOpacity(0);
                itemSpine.setScale(2.0);
                itemSpine.runAction(itemAction);
            }

            itemIcon.setVisible(itemGfx.sprite !== undefined);
            itemSpine.setVisible(itemGfx.spine !== undefined);

            if (this.textHint)
                this.textHint.setString(FWLocalization.text("TXT_WHEEL_HINT_SPIN_REWARD"));

            this.panelReward.setVisible(true);
            this.panelReward.setOpacity(255);
        }

        if (this.npcClown)
            this.npcClown.setAnimation(CLOWN_ANIM_IDLE_GIFT, true);
    },

    hideReward: function (itemId, itemAmount, itemPosition) {
        cc.log(this.LOGTAG, "hideReward");

        if (this.panelReward)
        {
            if (itemId && itemId !== ID_X2) {
                var rewards = [{
                    itemId: itemId,
                    itemAmount: itemAmount || 1,
                    itemPosition: itemPosition
                }];
                gv.popup.showFlyingReward(rewards, 0, function() {//web
                    this.panelReward.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.2), cc.hide()));
                }.bind(this));        
				
				// jira#5849
				if(gv.wheel.tokenCount && gv.wheel.tokenCount > 0 && gv.wheel.tokenId)
					FWUtils.showFlyingItemIcon(gv.wheel.tokenId, gv.wheel.tokenCount, FWUtils.getWorldPosition(this.textBuffItemCount), Game.getFlyingDestinationForItem(gv.wheel.tokenId));
            } else {
                this.panelReward.setVisible(false);
            }
        }
    },

    getItemSlotType: function (itemId) {
        if (itemId === ID_GOLD || itemId === ID_COIN) {
            return WHEEL_SLOT_TYPES.GOLD;
        }
        else if (itemId === ID_X2) {
            return WHEEL_SLOT_TYPES.GREEN;
        }
        else {
            var define = defineMap[itemId];
            switch (define.TYPE) {
                case defineTypes.TYPE_PLANT:
                    return WHEEL_SLOT_TYPES.GREEN_DARK;
                case defineTypes.TYPE_PRODUCT:
                    return WHEEL_SLOT_TYPES.BLUE;
                case defineTypes.TYPE_POT:
                    return WHEEL_SLOT_TYPES.GREEN;
                case defineTypes.TYPE_DECOR:
                    return WHEEL_SLOT_TYPES.GOLD;
                case defineTypes.TYPE_MATERIAL:
                    return WHEEL_SLOT_TYPES.RED;
                default:
                    return WHEEL_SLOT_TYPES.RED;
            }
        }
    },

    performLightEffect: function (value, time, delay, callback) {//web performLightEffect: function (value, time, delay = 0, callback = null) {
		
		if(delay === undefined)
			delay = 0;
		if(callback === undefined)
			callback = null;
		
        if (this.wheelLight) {

            var actionCallback = cc.callFunc(function () {
                callback && callback();
            }.bind(this));

            var lights = this.wheelLight.getChildren();
            for (var i = 0; i < lights.length; i += 2) {

                var lightOn = lights[i + 1];
                lightOn.stopAllActions();
                lightOn.setVisible(!value);
                lightOn.setOpacity((value) ? 0 : 255);

                var action = null;
                if (value)
                    action = cc.sequence(cc.delayTime(delay + i * time * 0.5), cc.show(), cc.fadeIn(time));
                else
                    action = cc.sequence(cc.delayTime(delay + i * time * 0.5), cc.fadeOut(time), cc.hide());

                if (i + 1 === lights.length - 1)
                    lightOn.runAction(cc.sequence(action, actionCallback));
                else
                    lightOn.runAction(action);
            }
        }
    },

    performLightIdleEffect: function (time, delay) {//web performLightIdleEffect: function (time, delay = 0) {
		
		if(delay === undefined)
			delay = 0;
		
        this.performLightEffect(true, time, delay, function () {
            this.performLightEffect(false, time, delay, function () {
                this.performLightIdleEffect(time, delay);
            }.bind(this));
        }.bind(this));
    },

    saveSlots: function () {
        var slots = gv.wheel.getSlots();
        var slotAngle = 360 / slots.length;
        this.lastSlots = slots.map(function(item, index) {//web
            return {
                itemId: item[SPIN_SLOT_ITEM],
                itemAmount: item[SPIN_SLOT_NUM],
                angle: 360 - slotAngle * index
            }
        });
    },

    onSpinResponse: function (packet) {
        cc.log(this.LOGTAG, "onSpinResponse: %j", packet);
        cc.log(this.LOGTAG, "onSpinResponse", "wheel: %j", gv.userData.getWheel(), "winSlot:", gv.wheel.getWinSlot());

        if (packet.error === 0) {

            this.updateWheelButton();
            this.updateMilestone();

            if (gv.wheel.getWinSlot() >= 0)
                this.spin(gv.wheel.getWinSlot());
        }
    },

    onClaimResponse: function (packet) {
        cc.log(this.LOGTAG, "onClaimResponse: %j", packet);
        if (packet.error === 0) {

            this.updateWheel();
            this.updateWheelButton();
            this.updateMilestone();

            this.hideReward(this.rewardId, this.rewardFinalAmount, this.rewardPosition);// jira#5145 this.hideReward(this.rewardId, this.rewardAmount, this.rewardPosition);
        }
    },

    onSpinEnded: function () {
        cc.log(this.LOGTAG, "onSpinEnded");

        this.isBusy = false;
        this.buttonSpin.setEnabled(!this.isBusy);
		this.disableBackButton = false;

        if (this.rewardId && this.rewardAmount > 0) {
            this.showReward(this.rewardId, this.rewardAmount, gv.wheel.getWaitSlotIndex() < 0);
        }
    },

    onRewardItemTouched: function (sender) {
        cc.log(this.LOGTAG, "onRewardItemTouched", "rewardId:", this.rewardId, "rewardAmount:", this.rewardAmount, "isDouble", gv.wheel.isDouble(), "rewardClaimed:", this.rewardClaimed);

        if (this.rewardId && this.rewardAmount) {
            var itemIcon = FWUI.getChildByName(this.panelReward, "itemIcon");
            this.rewardPosition = FWUtils.getWorldPosition(itemIcon);
            this.rewardFinalAmount = this.rewardAmount * (gv.wheel.isDouble() ? 2 : 1);

            if (this.rewardClaimed) {

                this.updateWheel();
                this.updateWheelButton();
                this.updateMilestone();

                this.hideReward(this.rewardId, this.rewardFinalAmount, this.rewardPosition);// jira#5145 this.hideReward(this.rewardId, this.rewardAmount, this.rewardPosition);
            } else if (Game.canReceiveGift([{ itemId: this.rewardId, amount: this.rewardFinalAmount }], true)) {
                gv.wheel.requestWheelClaim();
            }
        }
    },

    onButtonSpinTouched: function (sender) {
        var haveReward = gv.wheel.getWaitSlotIndex() >= 0;
        cc.log(this.LOGTAG, "onButtonSpinTouched", "haveReward", haveReward, "gv.wheel.haveNext()", gv.wheel.haveNext(), "wheel: %j", gv.userData.getWheel(), "winSlot:", gv.wheel.getWinSlot(), "waitSlot:", gv.wheel.getWaitSlot());
        
        if (haveReward) {
            this.saveSlots();
            this.spin(gv.wheel.getWinSlot());
            if (this.npcClown)
                this.npcClown.setAnimation(CLOWN_ANIM_IDLE_ROLLING, true);
        }
        else {
            if (gv.wheel.haveNext()) {
                var spinPrice = g_MISCINFO.SPIN_PRICE_TURN[gv.wheel.getSpinCount()];
                if (spinPrice > 0) {
                    if (Game.consumeDiamond(spinPrice, FWUtils.getWorldPosition(sender))) {
                        this.saveSlots();
						this.disableBackButton = true;
                        gv.wheel.requestWheelSpin(spinPrice);
                    }
                }
                else {
                    this.saveSlots();
					this.disableBackButton = true;
                    gv.wheel.requestWheelSpin(spinPrice);
                }
            }
            else {
                FWUtils.showWarningText(FWLocalization.text("TXT_WHEEL_HINT_SPIN_OVER"), FWUtils.getWorldPosition(sender));
            }
        }
    },

    onButtonCloseTouched: function (sender) {
		if(this.disableBackButton)
			return;
		
        cc.log(this.LOGTAG, "onButtonCloseTouched");
        this.hide();
    }
});