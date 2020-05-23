var ChatItem_Emoji = cc.Class.extend(
{
    ctor: function (data, onClick)
    {
        cc.log ("ChatItem_Emoji", "ctor");
        // this._super();
        
		var isMe = data [KEY_USER_ID] === gv.mainUserData.mainUserId;
        var widgetId = isMe ? UI_EMOJI_ITEM_ME : UI_EMOJI_ITEM;
        
        this.widget = FWPool.getNode(widgetId, true, true);
        this.widget.setContentSize (cc.size(490, 180));
		this.widget.dontReturnToPool = true;
        // this.addChild (this.widget);

        this.uiDef = {
			bg: {onTouchEnded: this.onClick.bind(this)},//web
            emoji: {type:UITYPE_IMAGE, value:""},
            lb_name:{type:UITYPE_TEXT, value:"", style:isMe ? TEXT_CHAT_NAME_ME : TEXT_CHAT_NAME},
        };
        
        this.update (data);
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
                this.uiDef.lb_name.value = member ? (member [FRIEND_NAME] ? member[FRIEND_NAME] : member[FRIEND_ID]) : "";
        }
        else if (this.getId() != data.owner)
            return;
        
        this.uiDef.emoji.value = data [KEY_DATA];
        FWUI.fillData(this.widget, null, this.uiDef);
    },

    updateTime: function ()
    {
    },

    preUpdateHeight: function ()
    {
    },

    updateHeight: function ()
    {
    },

    getId:function ()
    {
        return this.data ? this.data [KEY_UID] : -1;
    },

    getOwner:function ()
    {
        return this.data ? this.data [KEY_USER_ID] : -1;
    },

    getType:function ()
    {
        return GUILD_CHAT_TYPE_EMOJI;
    },
    
    getTime:function ()
    {
        return this.data ? this.data [KEY_TIME] : -1;
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
		return true;
	},

    onClick: function (sender)//web
    {
        if (this.callback)
            this.callback (this);
    }
});