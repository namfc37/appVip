var ChatItem = cc.Class.extend(
{
    ctor: function (data, onClick)
    {
        cc.log ("ChatItem", "ctor");
        // this._super();
        
		var isMe = data [KEY_USER_ID] === gv.mainUserData.mainUserId;
        var widgetId = isMe ? UI_CHAT_ITEM_ME : UI_CHAT_ITEM;
        
        this.widget = FWPool.getNode(widgetId, true, true);
        this.widget.setContentSize (cc.size(490, 160));
		this.widget.dontReturnToPool = true;
        // this.addChild (this.widget);

		this.uiDef = {
			bg: {onTouchEnded: this.onClick.bind(this)},//web
			avatar: {type:UITYPE_IMAGE, value:"", size:50},
			lb_name:{type:UITYPE_TEXT, value:"", style:isMe ? TEXT_CHAT_NAME_ME : TEXT_CHAT_NAME},
			lb_role:{type:UITYPE_TEXT, value:"", style:TEXT_CHAT_INFO},
			lb_right_status:{type:UITYPE_TEXT, value:"", style:TEXT_CHAT_INFO},
			lb_right_time:{type:UITYPE_TEXT, value:"", style:TEXT_CHAT_INFO},
			clip:{visible:cc.sys.isNative},
			lb_chat:{type:UITYPE_TEXT, value:"", style:isMe ? TEXT_CHAT_ME : TEXT_CHAT, visible:cc.sys.isNative},
			lb_chat_web:{type:UITYPE_TEXT, value:"", style:isMe ? TEXT_CHAT_ME : TEXT_CHAT, visible:!cc.sys.isNative},
        };
        
        this.update (data);
        this.lb_right_status = FWUtils.getChildByName (this.widget, "lb_right_status");
        this.lb_right_time = FWUtils.getChildByName (this.widget, "lb_right_time");
        this.lb_chat = FWUtils.getChildByName (this.widget, "lb_chat");
        this.lb_chat_web = FWUtils.getChildByName (this.widget, "lb_chat_web");
        this.clip = FWUtils.getChildByName (this.widget, "clip");
        this.bg = FWUtils.getChildByName (this.widget, "bg");
        this.delay = true;
        this.height = 0;
        this.callback = onClick;
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
            var member = Guild.getMember (data [KEY_USER_ID]);
            cc.log ("ChatItem", JSON.stringify (data), data [KEY_USER_ID], JSON.stringify (member));
            if (member)
            {
                this.uiDef.avatar.value = member && member [FRIEND_AVATAR] ? member [FRIEND_AVATAR] : "hud/hud_avatar_default.png";
                this.uiDef.lb_name.value = member ? (member [FRIEND_NAME] ? member[FRIEND_NAME] : member[FRIEND_ID]) : "";
                this.uiDef.lb_role.value = member ? GUILD_ROLE_TEXTS [Guild.getMemberRole (member[FRIEND_ID])] : "";
            }
        }
        else if (this.getId() != data [KEY_UID])
            return;

        var date = new Date (data [KEY_TIME] * 1000);
		var dateStr = Chatbox.dateToDateString (date);
        var hourStr = Chatbox.dateToHourString (date);
        
        this.uiDef.lb_right_status.value = dateStr;
        this.uiDef.lb_right_time.value = hourStr;
        this.uiDef.lb_chat.value = data [KEY_DATA];
        this.uiDef.lb_chat_web.value = data [KEY_DATA];
		FWUI.fillData(this.widget, null, this.uiDef);
    },

    updateTime: function ()
    {
        // var date = new Date (this.data [KEY_TIME] * 1000);
		// var dateStr = Chatbox.dateToDateString (date);
        // var hourStr = Chatbox.dateToHourString (date);
        
        // this.uiDef.lb_right_status.value = dateStr;
        // this.uiDef.lb_right_time.value = hourStr;
        
        // this.lb_right_status.setString (dateStr);
        // this.lb_right_time.setString (hourStr);
    },

    preUpdateHeight: function ()
    {
        // clear height and move it to hide
        this.lb_chat.setContentSize (cc.size(440, 0));
		this.widget.setPosition (-1000, -1000);

        // add to parent to update real height
		var parent = FWUtils.getCurrentScene();
        var oldParent = this.widget.getParent ();
        if (oldParent)
            return;
        
        parent.addChild (this.widget);
    },

    updateHeight: function ()
    {
		if(!cc.sys.isNative)
		{
			this.updateHeightWeb();
			return;
		}
		
        var virtualHeight = this.lb_chat.getVirtualRendererSize().height;
        var contentHeight = this.lb_chat.getContentSize().height;

        this.height = Math.max (virtualHeight, contentHeight);
        if (this.height < 35)
            this.height = 35;

        this.widget.removeFromParent ();
        this.widget.setPosition (0, 0);

        this.lb_chat.setContentSize (cc.size(440, this.height));
		this.lb_chat.setPosition (0, this.height);
        
        this.bg.setContentSize (this.bg.getContentSize().width, this.getHeight ());
        this.bg.setPosition (this.bg.getPositionX (), -this.getOffsetY ());

        this.clip.setContentSize (cc.size(440, this.height));
        this.clip.setPosition (this.clip.getPositionX(), 10 + (35 - this.height));
    },

    updateHeightWeb: function ()
    {
        this.height = this.lb_chat_web.getVirtualRendererSizeKVTM().height;;
        if (this.height < 35)
            this.height = 35;

        this.widget.removeFromParent ();
        this.widget.setPosition (0, 0);

        this.bg.setContentSize (this.bg.getContentSize().width, this.getHeight ());
        this.bg.setPosition (this.bg.getPositionX (), -this.getOffsetY ());
    },

    getId:function ()
    {
        return this.data [KEY_UID];
    },

    getOwner:function ()
    {
        return this.data ? this.data [KEY_USER_ID] : -1;
    },

	getType:function ()
	{
		return GUILD_CHAT_TYPE_CHAT;
    },
    
    getTime:function ()
    {
        return this.data ? this.data [KEY_TIME] : -1;
    },

    getHeight:function ()
    {
        return this.height + 75; //110 - 35 = 15, 110 is default widget height;
    },

    getOffsetY:function ()
    {
        return this.height - 35; //35 is default lb_chat height;
    },

	isChatItem:function ()
	{
		return true;
    },

    onClick: function (sender)//web
    {
        if (this.callback)
            this.callback (this);
    }
});