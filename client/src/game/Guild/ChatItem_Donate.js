var ChatItem_Donate = cc.Class.extend(
{
	ctor: function (data)
	{
		cc.log ("ChatItem_Donate", "ctor");
		// this._super();
        
		var isMe = data.owner === gv.mainUserData.mainUserId;
		var widgetId = isMe ? UI_DONATE_ITEM_ME : UI_DONATE_ITEM;
        
        this.widget = FWPool.getNode(widgetId, true, true);
        this.widget.setContentSize (cc.size(490, 180));
		this.widget.dontReturnToPool = true;
        // this.addChild (this.widget);

		this.uiDef = {
			donateitem: {},
			avatar: {type:UITYPE_IMAGE, value:"", size:50},
			lb_name:{type:UITYPE_TEXT, value:"", style:isMe ? TEXT_CHAT_NAME_ME : TEXT_CHAT_NAME},
			lb_role:{type:UITYPE_TEXT, value:"", style:TEXT_CHAT_INFO},
			lb_right_status:{type:UITYPE_TEXT, value:"", style:TEXT_CHAT_INFO},
			lb_donate_request:{type:UITYPE_TEXT, value:"TXT_CHAT_DONATE_ITEM_SUBTITLE", style:isMe ? TEXT_CHAT_ME : TEXT_CHAT},
			gfx:{type:UITYPE_ITEM, value:data.itemId},
			progress_quantity: {type:UITYPE_PROGRESS_BAR, value:data.itemCurrent, maxValue:data.itemNum},
			lb_quantity:{type:UITYPE_TEXT, value:data.itemCurrent + "/" + data.itemNum, style:TEXT_STYLE_NUMBER},
			lb_stock_remain:{type:UITYPE_TEXT, value:0, style:isMe ? TEXT_CHAT_ME : TEXT_CHAT}
		};

		if (!isMe)
		{
			this.uiDef.btn_donate = {visible:true, enabled:true, onTouchBegan: this.onClick.bind(this)};//web
			this.uiDef.lb_donate = {type:UITYPE_TEXT, value:"TXT_CHAT_DONATE_BTN_GIVE", style:TEXT_STYLE_TEXT_NORMAL};
		}
		
		this.update (data);

		this.lb_right_status = FWUtils.getChildByName (this.widget, "lb_right_status");
		this.lb_stock_remain = FWUtils.getChildByName (this.widget, "lb_stock_remain");
	},

	hide: function ()
	{
		this.widget.dontReturnToPool = false;
		FWUI.unfillData(this.widget);
		FWPool.returnNode(this.widget);
	},

	update: function (data)
	{
        if (!this.data)
        {
            this.data = data;
            var member = Guild.getMember (data.owner);
            
            if (member)
            {
                this.uiDef.avatar.value = member && member [FRIEND_AVATAR] ? member [FRIEND_AVATAR] : "hud/hud_avatar_default.png";
                this.uiDef.lb_name.value = member ? (member [FRIEND_NAME] ? member[FRIEND_NAME] : member[FRIEND_ID]) : "";
                this.uiDef.lb_role.value = member ? GUILD_ROLE_TEXTS [Guild.getMemberRole (member[FRIEND_ID])] : "";
            }
        }
        else if (this.getId() != data.owner)
            return;

		// var isMe = data.owner === gv.mainUserData.mainUserId;
		var time = Chatbox.timeToCountdown (data.end);
		var status = cc.formatStr(FWLocalization.text("TXT_CHAT_DONATE_TIME_REMAIN"), time);
		var remain = cc.formatStr(FWLocalization.text("TXT_CHAT_DONATE_ITEM_STOCK"), gv.userStorages.getItemAmount(data.itemId));
		// var total = g_GUILD.DONATE_ITEMS [data.itemId] ? g_GUILD.DONATE_ITEMS [data.itemId].DONATE_LIMIT : 0;
		// var donated = data.donators [gv.mainUserData.mainUserId] ? data.donators [gv.mainUserData.mainUserId] : 0;
		// var remainDonate = isMe ? 0 : Math.max (0, total - donated);
		// var canDonate = remainDonate > 0;
		// var enable = data.itemCurrent < data.itemNum;

		this.uiDef.lb_right_status.value = status;
		this.uiDef.progress_quantity.value = data.itemCurrent;
		this.uiDef.lb_quantity.value = data.itemCurrent + "/" + data.itemNum;
		this.uiDef.lb_stock_remain.value = remain;

		// if (!isMe)
		// {
		// 	this.uiDef.btn_donate.visible = canDonate;
		// 	this.uiDef.btn_donate.enabled = enable;
		// }
		
		FWUI.fillData(this.widget, null, this.uiDef);
	},

	updateTime: function ()
	{
		var remain = cc.formatStr(FWLocalization.text("TXT_CHAT_DONATE_ITEM_STOCK"), gv.userStorages.getItemAmount(this.data.itemId));
		var time = Chatbox.timeToCountdown (this.data.end);
		var status = cc.formatStr(FWLocalization.text("TXT_CHAT_DONATE_TIME_REMAIN"), time);
		
		this.lb_right_status.setString (status);
		this.lb_stock_remain.setString (remain);
	},

	getId:function ()
	{
		if (!this.data)
			return -1;

		return this.data.owner;
	},

    getOwner:function ()
    {
        return this.data.owner;
    },

	getType:function ()
	{
		return GUILD_CHAT_TYPE_DONATE;
	},
    
    getTime:function ()
    {
        return this.data ? this.data.start : -1;
    },
    
    getHeight:function ()
    {
        return 173;
    },

    getOffsetY:function ()
    {
        return 0;
    },

	isChatItem:function ()
	{
		return false;
	},

	onClick: function (sender)
	{
		if (!this.data)
			return;

		var itemId = this.data.itemId;
		var info = g_GUILD.DONATE_ITEMS [itemId];
		if (!info)
			return;

		// cc.log ("ChatItem_Donate", "item remain", Donate.itemRemain());
        
		if (Donate.itemRemain () < 1)
		{
			var pos = sender ? FWUtils.getWorldPosition(sender) : cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
			FWUtils.showWarningText(FWLocalization.text("TXT_DONATE_WARNING_LIMIT_GIVE_AWAY_DAILY"), pos, cc.RED);
			return;
		}

		// cc.log ("ChatItem_Donate", JSON.stringify(this.data));

		var receiveMember = this.data.owner;
		var remain = info.DONATE_LIMIT;
		var donated = this.data.donators [gv.mainUserData.mainUserId];
		if (donated) remain -= donated;
		
		if (remain < 1)
		{
			var pos = sender ? FWUtils.getWorldPosition(sender) : cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
			FWUtils.showWarningText(FWLocalization.text("TXT_DONATE_WARNING_LIMIT_GIVE_AWAY"), pos, cc.RED);
			return;
		}
		
		if (gv.userStorages.getItemAmount(itemId) < 1)
		{
			// var fxPos = FWUtils.getWorldPosition(sender);
			// FWUtils.showWarningText(FWLocalization.text("TXT_CHAT_DONATE_MISS_ITEM"), fxPos, cc.WHITE);
			
			Game.showQuickBuy([{itemId:itemId, amount:1}], function() {this.updateTime();}.bind(this));//web
			return;
		}

		Donate.sendDonate (receiveMember);
	},
});