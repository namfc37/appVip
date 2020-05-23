const UI_DAILY_GIFT_MILESTONE_WIDTH = 155;
const UI_DAILY_GIFT_MILESTONE_HEIGHT = 175;

const UI_DAILY_GIFT_REWARD_WIDTH = 190;
const UI_DAILY_GIFT_REWARD_HEIGHT = 175;

const UI_DAILY_GIFT_ICON_PADDING = 30;

const UI_DAILY_GIFT_ICON_CHECK_SCALE_DONE = 1.0;
const UI_DAILY_GIFT_ICON_CHECK_SCALE_ACTIVE = 1.3;

const UI_DAILY_GIFT_SHOW_TIME_DELAY = 0.1;
const UI_DAILY_GIFT_SHOW_TIME_EXECUTE = 0.3;

var DailyGiftPopup = cc.Node.extend({
    LOGTAG: "[DailyGiftPopup]",

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
        cc.log(this.LOGTAG, "show", "milestones: %j", gv.dailygift.getMilestones());
        var milestones = gv.dailygift.getMilestones();
        this.milestone = milestones;
        if (!milestones)
            return;

        if(!FWUI.isShowing(UI_CIRCLE_DAILY_REWARDS))
        {
            this.isBusy = false;
            this.widget = FWPool.getNode(UI_CIRCLE_DAILY_REWARDS, false);
            if (this.widget) {
                var dailygift = gv.userData.getDailyGift();
                milestones.forEach(function(milestone) {
                    milestone.icon = this.getMilestoneIcon(milestone);
                    milestone.frame = this.getMilestoneFrame(milestone);
                    milestone.textTitle = this.getMilestoneTextTitle(milestone);
                    milestone.textAmount = this.getMilestoneTextAmount(milestone);
                    milestone.checked = milestone.isClaimed || milestone.isActive;
                }.bind(this));

                var mileStones6Days = [];
                var mileStonesDays7th = null;

                var isReceived = true;
                for(var i=0;i<milestones.length;i++)
                {
                    if(milestones[i].isActive) isReceived = false;
                    if(i <6)
                    {
                        mileStones6Days.push(milestones[i]);
                    }
                    else
                    {
                        mileStonesDays7th = milestones[i];
                    }
                }

                var uiMilestoneDefine = {
                    back: {type: UITYPE_IMAGE, field: "frame"},
                    check: {visible: "data.checked === true"},
                    textTitle: {type: UITYPE_TEXT, field: "textTitle", visible: true,style:TEXT_STYLE_TEXT_NORMAL},
                    textAmount: {type: UITYPE_TEXT, field: "textAmount", style: TEXT_STYLE_TEXT_NORMAL, visible: true},
                    container: {onTouchEnded:this.claimReward.bind(this)},
                    //buyButton: {visible: false},
                    gfx: {visible: false},
                };

                var uiDefine = {
                    title: {type: UITYPE_TEXT, id: "TXT_DAILY_REWARD_TITLE", style: TEXT_STYLE_TITLE_1},
                    itemList: {type: UITYPE_2D_LIST, items: mileStones6Days, itemUI: UI_CIRCLE_DAILY_ITEM, itemDef: uiMilestoneDefine, itemSize: cc.size(142, 195)},
                    closeButton: {visible: true,onTouchEnded:this.claimReward.bind(this)}, // jira#5291 { onTouchEnded: this.onButtonCloseTouched.bind(this), enabled: true },
                    timerDaily:{type: UITYPE_TIME_BAR, startTime: Game.getGameTimeInSeconds(), endTime: gv.dailygift.isNewUser()? dailygift[DAILY_GIFT_TIME_START]+g_MISCINFO.DAILY_GIFT_NEW_USER_DURATION * 86400: FWUtils.secondsAtEndOfDay(), countdown: true, isVisibleTimeBarBar: false,onFinished: this.checkEndDaily.bind(this)},
                    infoTouchReceive:{type: UITYPE_TEXT, id: isReceived?"TXT_DAILY_REWARD_TOUCH_RECEIVE2":"TXT_DAILY_REWARD_TOUCH_RECEIVE", style: TEXT_STYLE_TEXT_NORMAL},
                };


                FWUI.fillData(this.widget, null, uiDefine);


                var canClaim = false;
                var panelItems = FWUI.getChildByName(this.widget, "itemList");
                if (panelItems) {
                    var listItems = panelItems.getChildren();
                    for (var i = 0; i < listItems.length; i++) {
                        var container = FWUI.getChildByName(listItems[i], "container");
                        var itemBack = FWUI.getChildByName(listItems[i], "back");

                        var itemCheck = FWUI.getChildByName(listItems[i], "check");
                        itemCheck.setScale((milestones[i].isActive) ? 0.9 : 0.75);
                        if(!milestones[i].isActive){
                            container.setTouchEnabled(false);
                        }
                        else
                        {
                            container.setTouchEnabled(true);
                        }
                        var itemIcon = FWUI.getChildByName(listItems[i], "icon");
                        var itemSpine = FWUI.getChildByName(listItems[i], "spine");

                        if (itemIcon)
                            itemIcon.removeFromParent();

                        if (milestones[i].icon.sprite) {

                            itemIcon = new cc.Sprite("#" + milestones[i].icon.sprite);
                            itemIcon.setPosition(itemBack.getPosition());
                            itemIcon.setScale(milestones[i].icon.scale || 0.6);
                            FWUtils.applyGreyscaleNode(itemIcon, !milestones[i].isClaimed && !this.shouldHighlightMilestone(i));
                            listItems[i].addChild(itemIcon, itemBack.getLocalZOrder() + 1, "icon");
                        }
                        else if (milestones[i].icon.spine) {
                            var spine = FWUI.fillData_spine2(itemSpine, milestones[i].icon.spine, milestones[i].icon.skin || "", milestones[i].icon.anim || "", milestones[i].icon.scale || 1.0);
                            FWUtils.applyGreyscaleSpine(spine, !milestones[i].isClaimed);
                        }

                        if (milestones[i]) {

                            // jira#6086
                            var highlight = this.shouldHighlightMilestone(i);

                            if (highlight) {
                                canClaim = true;
                                if (!this.itemLight) {
                                    this.itemLight = new FWObject();
                                    this.itemLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                                    this.itemLight.setAnimation("effect_light_icon", true);
                                    this.itemLight.setScale(1.0);
                                }

                                if (this.itemLight && this.itemLight.node) {
                                    this.itemLight.setPosition(itemSpine.getPosition());
                                    this.itemLight.setVisible(true);
                                    this.itemLight.setParent(listItems[i], 0);
                                }
                            }
                        }
                    }

                }

                var uiMilestone7thReward = {
                    textTitle: {type: UITYPE_TEXT, value: "", visible: true,style:TEXT_STYLE_TEXT_NORMAL},
                    textAmount: {type: UITYPE_TEXT, value: "", style: TEXT_STYLE_TEXT_NORMAL, visible: true},
                    back: {onTouchEnded:this.claimReward.bind(this)},
                    //buyButton: {visible: false},
                    gfx: {visible: false},
                };
                var reward7th = FWUI.getChildByName(this.widget, "rewardDay7");

                FWUI.fillData(reward7th,mileStonesDays7th,uiMilestone7thReward);
                if(reward7th){
                    var itemBack = FWUI.getChildByName(reward7th, "back");
                    var itemCheck = FWUI.getChildByName(reward7th, "check");
                    var gfx = FWUI.getChildByName(reward7th, "gfx");
                    gfx.setVisible(false);
                    itemCheck.setVisible(mileStonesDays7th.checked)
                    itemCheck.setScale((mileStonesDays7th.isActive) ? 0.9 : 0.75);
                    if(!mileStonesDays7th.isActive){
                        itemBack.setTouchEnabled(false);
                    }
                    else
                    {
                        itemBack.setTouchEnabled(true);
                    }
                    var itemIcon = FWUI.getChildByName(reward7th, "icon");
                    var itemSpine = FWUI.getChildByName(reward7th, "spine");
                    //var back = FWUI.getChildByName(reward7th, "back");
                    if (itemIcon)
                        itemIcon.removeFromParent();

                    if (mileStonesDays7th.icon.sprite) {

                        itemIcon = new cc.Sprite("#" + mileStonesDays7th.icon.sprite);
                        itemIcon.setPosition(itemBack.getPosition());
                        //itemIcon.setScale(1.5);
                        itemIcon.setScale(Math.min((itemBack.getBoundingBox().width) / itemIcon.getBoundingBox().width,
                            (itemBack.getBoundingBox().height) / itemIcon.getBoundingBox().height));

                        FWUtils.applyGreyscaleNode(itemIcon, !mileStonesDays7th.isClaimed && !this.shouldHighlightMilestone(6));
                        reward7th.addChild(itemIcon, itemBack.getLocalZOrder() + 1, "icon");
                    }
                    else if (mileStonesDays7th.icon.spine) {
                        var spine = FWUI.fillData_spine2(itemSpine, mileStonesDays7th.icon.spine, mileStonesDays7th.icon.skin || "", mileStonesDays7th.icon.anim || "", (mileStonesDays7th.icon.scale || 1.0)*1.5);
                        FWUtils.applyGreyscaleSpine(spine, !mileStonesDays7th.isClaimed);
                    }
                    if(mileStonesDays7th.frame){
                        cc.log("mileStonesDays7th.frame",mileStonesDays7th.frame);
                        itemBack.loadTexture(mileStonesDays7th.frame, ccui.Widget.PLIST_TEXTURE);
                    }

                    if (mileStonesDays7th) {

                        // jira#6086
                        var highlight = this.shouldHighlightMilestone(6);

                        if (highlight) {
                            canClaim = true;
                            if (!this.itemLight) {
                                this.itemLight = new FWObject();
                                this.itemLight.initWithSpine(SPINE_EFFECT_POT_SLOT);
                                this.itemLight.setAnimation("effect_light_icon", true);
                                this.itemLight.setScale(1.0);
                            }

                            if (this.itemLight && this.itemLight.node) {
                                this.itemLight.setPosition(itemSpine.getPosition());
                                this.itemLight.setVisible(true);
                                this.itemLight.setParent(reward7th, 0);
                            }
                        }

                        var textTitle = FWUI.getChildByName(reward7th, "textTitle");
                        textTitle.setString(mileStonesDays7th.textTitle);

                        var textAmount = FWUI.getChildByName(reward7th, "textAmount");
                        textAmount.setString(mileStonesDays7th.textAmount);
                        //FWUI.applyTextStyle(textTitle, this.getMilestoneTextStyle(milestones[i]));
                    }
                }
                if(!canClaim){
                    if(this.itemLight) this.itemLight.setVisible(false);
                }

                FWUI.setWidgetCascadeOpacity(this.widget, true);
                FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP_SMOOTH, true);
                FWUtils.showDarkBg(null, Z_UI_COMMON - 1, "darkBgDailyRewards");
                this.widget.setLocalZOrder(Z_UI_COMMON); // jira#4755, 5074

                if(!this.hideFunc)
                    this.hideFunc = function() {this.hide()}.bind(this);
                Game.gameScene.registerBackKey(this.hideFunc);
            }
        }


    },
    claimReward:function(sender){
        //cc.log(this.LOGTAG,"claimReward",JSON.stringify(sender)); // error: cyclic object value

        var pos = cc.p(0,0);
        if(sender.getName()== "closeButton")
        {
            pos = cc.p( cc.winSize.width /2, cc.winSize.height /2 )
        }
        else
        {
            pos = FWUtils.getWorldPosition(sender);
        }

        if(gv.dailygift.isNewUser()) {
            cc.log("claimReward,hide",gv.dailygift.isShowInGame,gv.dailygift.isClaimed());
            if (!gv.dailygift.isShowInGame) {

                var mileStones = this.milestone;
                cc.log("claimReward,hide2");
                var rewards = [];
                for(var i = 0; i<mileStones.length;i++)
                {
                    if(mileStones[i].isActive) {
                        for(var key in mileStones[i].rewards)
                        {
                            rewards.push({
                                itemId: key,
                                itemAmount: mileStones[i].rewards[key],
                                itemPosition: pos,
                            });
                        }
                    }
                }

                if (rewards.length > 0) {
                    gv.popup.showFlyingReward(rewards);
                    Game.refreshUIMain(RF_UIMAIN_LEVEL | RF_UIMAIN_EXP | RF_UIMAIN_GOLD | RF_UIMAIN_COIN | RF_UIMAIN_REPU);
                }

                if (mileStones && mileStones.length === 7 && mileStones[6].isClaimed)
                    Game.shouldShowRatingPopup = true;
            }
        }
        else
        {
            var rewards = gv.userData.game[GAME_DAILY_GIFT][DAILY_GIFT_CIRCLE_REWARDS];
            cc.log(this.LOGTAG,"claimReward2",JSON.stringify(rewards));
            if(!rewards || rewards.length <=0 || Object.keys(rewards).length <=0){
            }
            else
            {
                gv.dailygift.requestRewards();
                var i = 0;
                for (var key in rewards) {
                    FWUtils.showFlyingItemIcon(key, rewards[key], pos, Game.gameScene.uiMainBtnMail, i * 0.15, false);
                    i++;
                }
            }

        }
        this.hide();
    },
    checkEndDaily:function(){
        cc.log(this.LOGTAG, "checkEndDaily:");
        this.hide();
        if(!gv.dailygift.isNewUser())
            gv.dailygift.requestDaily();
    },
    hide: function () {

        if (this.isBusy)
            return;


        if (this.itemLight) {
            this.itemLight.uninit();
            this.itemLight = null;
        }
        FWUI.hideWidget(this.widget, UIFX_NONE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
        FWUtils.hideDarkBg(null, "darkBgDailyRewards");
		if(this.isUpdateScheduled)
		{
			this.isUpdateScheduled = false;
			cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateTime);
		}
    },

    updateTime: function (dt) {
        var time = gv.dailygift.getDailyGiftTime();
        cc.log("updateTime",JSON.stringify(time));
        //this.barTime.setPercent(time.timeLeft * 100 / time.timeDuration);
        //this.textTime.setString(FWUtils.secondsToTimeString(time.timeLeft));
    },

    getRewardIcon: function (itemId, itemIndex) {
        if (itemId === ID_GOLD) {
            return {
                sprite: cc.formatStr("items/item_gold_0%d.png", itemIndex + 1),
                scale: 1.0
            };
        }
        else {
            return Game.getItemGfxByDefine(itemId);
        }
    },

    getMilestoneIcon: function (milestone) {
        var rewardIds = Object.keys(milestone.rewards);
        if (rewardIds.length > 1) {
            return {
                sprite: "items/item_gift_box.png",
                scale: 1.0
            };
        }
        else {
            if (rewardIds[0] === ID_GOLD) {
                return {
                    sprite: cc.formatStr("items/item_gold_0%d.png", milestone.index + 1),
                    scale: 1.0
                };
            }
            else if(rewardIds[0] === ID_COIN){
                return{
                    sprite: cc.formatStr("items/item_diamond_0%d.png", milestone.index + 1),
                    scale: 1.0
                };
            }
            else {
                return Game.getItemGfxByDefine(rewardIds[0]);
            }
        }
    },

    getMilestoneFrame: function (milestone) {
        if (this.shouldHighlightMilestone(milestone.index))//if (milestone.isActive || this.shouldHighlightMilestone(milestone.index))
            return "hud/hud_daily_login_rw_slot_active.png";
        return "hud/hud_daily_login_rw_slot_normal.png";
    },

    getMilestoneTextTitle: function (milestone) {
        return (milestone.isActive) ? FWLocalization.text("TXT_DAILY_REWARD_TODAY") : cc.formatStr(FWLocalization.text("TXT_DAILY_REWARD_DAY"), milestone.index + 1)
    },

    getMilestoneTextAmount: function (milestone) {
        var rewardIds = Object.keys(milestone.rewards);
        if (rewardIds.length > 1)
            return "";//return "x1";
		
		//return cc.formatStr("x%s", FWUtils.formatNumberWithCommas(milestone.rewards[rewardIds[0]]));
		var amount = milestone.rewards[rewardIds[0]];
		if(amount > 1)
			return "x" + amount;
		return "";
    },

    getMilestoneTextStyle: function (milestone) {
        if (milestone.isActive)
            return TEXT_STYLE_TEXT_NO_EFFECT_GREEN_DARK;
        else if (milestone.isClaimed)
            return TEXT_STYLE_TEXT_NO_EFFECT_GRAY;
        return TEXT_STYLE_TEXT_NO_EFFECT_GRAY_DARK;
    },

    onButtonCloseTouched: function (sender) {
        cc.log(this.LOGTAG, "onButtonCloseTouched");
        this.hide();
    },

	// jira#6086
	shouldHighlightMilestone:function(i)
	{
		var milestones = gv.dailygift.getMilestones();
		if(gv.dailygift.isShowInGame)
		{
			if(i <= 0)
				return false;
			else if(i < 6)
				return milestones[i - 1].isActive;
			else
				return milestones[i - 1].isActive || milestones[i].isActive;
		}
		return milestones[i].isActive;
	},




});
