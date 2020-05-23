var PopupUserInfo = cc.Node.extend({
	LOGTAG: "[PopupUserInfo]",

	ctor: function ()
	{
		this._super();
		
		this.widget = FWPool.getNode(UI_POPUP_USER_INFO, false);
        this.showHintVip =true;
	},

	onEnter: function ()
	{
		this._super();
	},

	onExit: function ()
	{
		this._super();
	},

	show: function ()
	{
        cc.log(this.LOGTAG, "show");

        this.fillUserData ();
		if (FWUI.isShowing(UI_POPUP_USER_INFO))
			return;
			
		FWUI.setWidgetCascadeOpacity(this.widget, true);
		FWUI.showWidget(this.widget, FWUtils.getCurrentScene(), UIFX_POP, true);
		this.widget.setLocalZOrder(Z_UI_COMMON - 1);
		
		AudioManager.effect (EFFECT_POPUP_SHOW);
		FWUtils.showDarkBg(null, Z_UI_COMMON - 2, "darkBgArcade", null, true);
		
		if(!this.hideFunc)
			this.hideFunc = function() {this.hide()}.bind(this);
		Game.gameScene.registerBackKey(this.hideFunc);
		
		// jira#6175
		Ranking.getPR();
	},

	hide: function (sender)//web
	{
		FWUI.hideWidget(this.widget, UIFX_POP);
		AudioManager.effect (EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		
        FWUtils.hideDarkBg(null, "darkBgArcade");
        
        // this.fillUserData (this.nextLevel);
    },
    
    fillUserData: function (level)
    {
        var userName = gv.mainUserData.getDisplayName();
	    var userId = "ID: "+gv.mainUserData.userId +"";
        var userLevel = level ? level : gv.mainUserData.getLevel();
        var expMax = json_user_level.EXP[userLevel];
        var exp = (expMax > 0) ? gv.mainUserData.getExp() : 0;        
		
		// jira#6148
		var gardenValue = Game.getGardenValue();
		
        var nextLevel = userLevel;
        var unlockList = [];
        while (unlockList.length === 0)
        {
            nextLevel += 1;
		    unlockList = gv.userData.getUnlockItems(nextLevel);
            if (nextLevel > json_user_level.EXP.length)
            {
                nextLevel = userLevel + 1;
                break;
            }
        }

		var unlockItemDef =
		{
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
			gfx: { type:UITYPE_ITEM, field:"itemId", scale: 0.9 },
			amount: {visible:false}// { type: UITYPE_TEXT, field:"itemId", style: TEXT_STYLE_NUMBER},//
        };

        var hasUnlock = unlockList.length > 0;
        var p = cc.p (cc.winSize.width * 0.5, cc.winSize.height * 0.5);

        if (!hasUnlock)
            p.y -= 70;
        
		var uiDefine = {
            center: { position: p },
            bg_1: { visible: hasUnlock },
            bg_2: { visible: !hasUnlock },
            boderFrameCover_1: { visible: hasUnlock },
            boderFrameCover_2: { visible: !hasUnlock },
            unlock_item: { visible: hasUnlock },

            lb_username: { type: UITYPE_TEXT, id: userName, style: TEXT_STYLE_TITLE_1 },
            lb_userId: { type: UITYPE_TEXT, id: userId, style: TEXT_STYLE_TITLE_1 },
            defaultavatar: {type:UITYPE_IMAGE, value:gv.userData.getAvatar(), size:77},

            lb_level: { type: UITYPE_TEXT, id: userLevel, style: TEXT_STYLE_LOADING_BLUE },
            lb_level_next_level: { type: UITYPE_TEXT, id: userLevel +1, style: TEXT_STYLE_LOADING_BLUE },
            lb_exp: { type: UITYPE_TEXT, id: exp + "/" + expMax, style: TEXT_STYLE_NUMBER },
            progress_exp : { type:UITYPE_PROGRESS_BAR, maxValue: expMax, value: exp },

			// jira#6148
			// jira#5645
            ////lb_garden_title: { type: UITYPE_TEXT, value: "TXT_GARDEN_VALUE_TITLE", style: TEXT_STYLE_TEXT_DIALOG },
            ////lb_garden_value: { type: UITYPE_TEXT, id: gardenValue, style: TEXT_STYLE_NUMBER },
            //lb_garden_title: { visible:false },
            //lb_garden_value: { visible:false },
            //bg_garden: { visible:false },
            //icon_garden: { visible:false },
            lb_garden_title: { type: UITYPE_TEXT, value: "TXT_GARDEN_VALUE_TITLE", style: TEXT_STYLE_TEXT_DIALOG },
            lb_garden_value: { type: UITYPE_TEXT, value: gardenValue, style: TEXT_STYLE_NUMBER },

            lb_item_unlock: { type: UITYPE_TEXT, id: cc.formatStr(FWLocalization.text("TXT_UNLOCK_ITEMS_AT_LEVEL"), nextLevel), style: TEXT_STYLE_TEXT_DIALOG },
            scrollview_item_unlock: {type:UITYPE_2D_LIST, items:unlockList, itemUI:UI_ITEM_NO_BG2, itemDef:unlockItemDef, itemSize:cc.size(130, 130), itemsAlign:"center", singleLine:true},

			btn_close: { onTouchEnded: this.hide.bind(this) },//web

            avatar:{visible :!gv.vipManager.check()},
            panelIconVip: {visible : gv.vipManager.check()},
            imgIconVip: {type:UITYPE_IMAGE, value:gv.vipManager.iconFrameVip, onTouchBegan: function(sender) {UpgradePot.showHint (this.widget, "boardHint");}.bind(this), onTouchEnded: function(sender) {UpgradePot.hideHint (this.widget, "boardHint");}.bind(this), forceTouchEnd: true, scale:0.72},//web
            time: {type:UITYPE_TIME_BAR, startTime:gv.vipManager.timeBought, endTime:gv.vipManager.timeEndValid, countdown:true},
            lblVipContent:{type: UITYPE_TEXT, id: FWLocalization.text("TXT_BOARD_VIP_TITLE"), style: TEXT_STYLE_HINT_NOTE},
            imgBtnRewardNexLevel:{onTouchEnded:this.showRewardNextLevel.bind(this),forceTouchEnd:true},
            panelReward:{visible:false},
            panelHintValueGarden:{visible:false},
            titleHintValueGarden:{type: UITYPE_TEXT, id: FWLocalization.text("TXT_HINT_VALUE_GARDEN"), style: TEXT_STYLE_HINT_NOTE},
            bg_garden:{onTouchBegan: function(){FWUI.getChildByName(this.widget, "panelHintValueGarden").setVisible(true)}.bind(this) , onTouchEnded: function(){FWUI.getChildByName(this.widget, "panelHintValueGarden").setVisible(false)}.bind(this), forceTouchEnd: true},
		};

        FWUI.fillData(this.widget, null, uiDefine);
        
        this.nextLevel = nextLevel;
    },
    showItemHint:function(sender)
    {
        var position = null;
        position = FWUtils.getWorldPosition(sender);
        gv.hintManagerNew.show(null, null, sender.uiData.itemId, position);
    },
    hideItemHint:function(sender)
    {
        gv.hintManagerNew.hideHint( null, sender.uiData.itemId);
    },
    showRewardNextLevel:function(sender){

        var level = gv.userData.getLevel();
        var panelReward = FWUI.getChildByName(this.widget,"panelReward");
        level++;
        var unlockItem = gv.userData.getUnlockItems(level);

        if(!panelReward) return;

        panelReward.setVisible(true);
        var itemList = [];//var itemList = FWUtils.getItemsArray(data.rewards);
        if(json_user_level.REWARD_ITEM_NAME[level].length >0)
        {
            for(var i=0;i<json_user_level.REWARD_ITEM_NAME[level].length;i++)
            {
                var index = unlockItem.findIndex(function(item) {return item.itemId ===json_user_level.REWARD_ITEM_NAME[level][i];});
                if(index >-1) continue;
                itemList.push({
                    itemId: json_user_level.REWARD_ITEM_NAME[level][i],
                    amount: json_user_level.REWARD_ITEM_NUM[level][i],
                    displayAmount: "x" + json_user_level.REWARD_ITEM_NUM[level][i]
                });
            }
        }

        var itemDef =
        {
            gfx:{type:UITYPE_ITEM, field:"itemId"},//gfx:{type:UITYPE_ITEM, field:"id"},
            amount:{type:UITYPE_TEXT, field:"displayAmount", style:TEXT_STYLE_NUMBER, visible:true, useK:true},
            item:{onTouchBegan:this.showItemHint.bind(this), onTouchEnded:this.hideItemHint.bind(this),onDrop: this.hideItemHint.bind(this),forceTouchEnd: true,},
        };

        var uiDef =
        {
            tapToClose:{onTouchEnded:this.hideRewards.bind(this)},
            title:{type:UITYPE_TEXT, value: "TXT_LEVEP_UP_REWARD", style:TEXT_STYLE_TEXT_DIALOG},
            itemList:{type:UITYPE_2D_LIST, items:itemList, itemUI:UI_ITEM_NO_BG2, itemDef:itemDef, itemSize:cc.size(90, 90), itemsAlign:"center", itemBackground:"#hud/hud_barn_list_slot.png", itemBackgroundScale:0.75, singleLine:true},
        };

        FWUI.fillData(panelReward,null,uiDef);

        if(itemList.length < 5)
        {
            // hide annoying scrollbars
            var itemListWidget = FWUtils.getChildByName(panelReward, "itemList");
            itemListWidget.setDirection(ccui.ScrollView.DIR_NONE);
        }

    },
    hideRewards:function(sender)
    {
        var panelReward = FWUI.getChildByName(this.widget,"panelReward");
        if(!panelReward) return;
        panelReward.setVisible(false);
    },
});