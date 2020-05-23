var ChatItem_Notify = cc.Class.extend(
{
    ctor: function (data)
    {
        cc.log ("ChatItem_Notify", "ctor");
        
        var widgetId = UI_CHAT_NOTIFY;
        
        this.widget = FWPool.getNode(widgetId, true, true);
        this.widget.setContentSize (cc.size(490, 160));
        this.widget.dontReturnToPool = true;

        this.uiDef = {
			clip:{visible:cc.sys.isNative},
            lb_chat:{type:UITYPE_TEXT, value:"", style: TEXT_CHAT, visible:cc.sys.isNative},
            lb_chat_web:{type:UITYPE_TEXT, value:"", style: TEXT_CHAT, visible:!cc.sys.isNative},
        };
        
        this.update (data);
        this.lb_chat = FWUtils.getChildByName (this.widget, "lb_chat");
        this.lb_chat_web = FWUtils.getChildByName (this.widget, "lb_chat_web");
        this.clip = FWUtils.getChildByName (this.widget, "clip");
        this.bg = FWUtils.getChildByName (this.widget, "bg");
        this.delay = true;
        this.height = 0;
    },

    hide: function ()
    {
        this.widget.dontReturnToPool = false;
        FWUI.unfillData(this.widget);
        FWPool.returnNode(this.widget);
    },

    update: function (data)
    {
        this.data = data;
        var msg = data [KEY_DATA].split (",");
        var txt = msg.shift ();
        var mems = [];
        for (var i in msg)
        {
            var mid = msg [i];
            var member = Guild.getMember (mid);
            if (member)
                mems.push (member [FRIEND_NAME] ? member[FRIEND_NAME] : member[FRIEND_ID]);
            else
                mems.push (mid);
        }

        mems = mems.join (", ");
        var text = cc.formatStr(FWLocalization.text(txt), mems);
        
        this.uiDef.lb_chat.value = text;
        this.uiDef.lb_chat_web.value = text;
        FWUI.fillData(this.widget, null, this.uiDef);
    },

    updateTime: function ()
    {
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
        if (this.height < 25)
            this.height = 25;

        this.widget.removeFromParent ();
        this.widget.setPosition (0, 0);

        this.lb_chat.setContentSize (cc.size(440, this.height));
        this.lb_chat.setPosition (0, this.height);
        
        this.bg.setContentSize (this.bg.getContentSize().width, this.getHeight ());
        this.bg.setPosition (this.bg.getPositionX (), -this.getOffsetY ());

        this.clip.setContentSize (cc.size(440, this.height));
        this.clip.setPosition (this.clip.getPositionX(), 10 + (25 - this.height));
    },

    updateHeightWeb: function ()
    {
        this.height = this.lb_chat_web.getVirtualRendererSizeKVTM().height;
        if (this.height < 25)
            this.height = 25;

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
        return -1;
    },

    getType:function ()
    {
        return GUILD_CHAT_TYPE_NOTIFY;
    },
    
    getTime:function ()
    {
        return this.data ? this.data [KEY_TIME] : -1;
    },

    getHeight:function ()
    {
        return this.height + 15; //40 - 25 = 15, 40 is default widget height;
    },

    getOffsetY:function ()
    {
        return this.height - 25; //25 is default lb_chat height;
    },

    isChatItem:function ()
    {
        return false;
    },

    onClick: function ()
    {
    }
});