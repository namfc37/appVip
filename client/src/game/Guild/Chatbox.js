var Chatbox =
{
	ROLE: {
		GUILD_ROLE_PRESIDENT:	"TXT_GUILD_ROLE_PRESIDENT",
		GUILD_ROLE_DEPUTY:		"TXT_GUILD_ROLE_DEPUTY",
		GUILD_ROLE_MEMBER:		"TXT_GUILD_ROLE_MEMBER",
	},

	items: [],
	pre_items: [],
	users: {},
	tree: null,

	init:function()
	{
		cc.log ("Chatbox", "init", "g_MISCINFO.GUILD_ACTIVE", g_MISCINFO.GUILD_ACTIVE);

		if(!g_MISCINFO.GUILD_ACTIVE)
			return;

		this.tree = this.filterInit (g_CHAT_FILTER);
		this.unread = 0;
		this.currentDonate = null;
	},

	resourcesLoaded: false,
	loadAndShow:function ()
	{
		cc.log ("Chatbox", "loadAndShow", "gv.chatClient.isConnected", gv.chatClient.isConnected);
		
		// jira#7419
		/*if(Game.loadResourcesOnDemand && !this.resourcesLoaded)
		{
			cc.loader.load([GUILD_DUMMY_PLIST,
							GUILD_DUMMY_PLIST.replace(".plist", ".png")],
				function()
				{
					cc.spriteFrameCache.addSpriteFrames(GUILD_DUMMY_PLIST);
					this.resourcesLoaded = true;
					this.loadAndShow();
				}.bind(this));				
			return;
		}*/
		
		if (Guild.getGuildId() > -1 && !gv.chatClient.isConnected)
			FWLoader.connectChat();

		var isLoaded = Guild.isLoaded() || Guild.getGuildId() == -1;
		if (isLoaded)
		{
			Chatbox.show();
			return;
		}
		
		Guild.load(
			Guild.getGuildId(),
			function(data) {//web
				Guild.setData(data);
				Chatbox.show();
			}
		);
	},
	
	show:function()
	{
		var inGuild = Guild.isPlayerInGuild() && Guild.isLoaded();
		var name = inGuild ? Guild.getGuildName() : "TXT_CHAT_MISS_GUILD_TITLE";
		var avatar = inGuild ? Guild.getGuildAvatar() : "guild/btn_icon_guild_default.png";
		var avatarScale = inGuild ? 0.45 : 1;

		var canStart = Donate.canStart();
		var canStop = Donate.canStop();
		var remain = Donate.remain();
		var isCooldown = Donate.isCooldown();
		var cooldown = Chatbox.timeToCountdown (Donate.getCooldown ());
		var lbStart = remain > 0 ? (canStop ? "TXT_DONATE_STOP" : "TXT_DONATE_CHAT_START") : "TXT_DONATE_CHAT_OUT_OF_DAY";

		this.uiDef =
		{
			panel: {onTouchEnded:this.hide.bind(this)},
			
			// guild name
			lb_title: {type:UITYPE_TEXT, value:name, style:TEXT_STYLE_TEXT_BIG},
			icon_guild: {type:UITYPE_IMAGE, value:avatar, scale:avatarScale, onTouchEnded:this.avatar.bind(this)},
			
			// need join guild
			suggest: {visible:!inGuild},
			btn_search:{onTouchEnded:this.search.bind(this)},
			lb_suggest:{type:UITYPE_TEXT, value:"TXT_CHAT_MISS_GUILD_DESC", style:TEXT_STYLE_TEXT_NO_EFFECT_GRAY_DARK},
			lb_search:{type:UITYPE_TEXT, value:"TXT_CHAT_MISS_GUILD_BTN", style:TEXT_STYLE_TEXT_BUTTON},
			
			// input control
			clip:{ onTouchEnded:this.onClip.bind(this) },
			input:{enabled: inGuild, type:UITYPE_TEXT, style:TEXT_STYLE_TEXT_NORMAL, placeHolder:"TXT_CHAT_PLACEHOLDER", placeHolderColor:cc.color.WHITE, value:"", listener:[this.onChat, this], lengthLimit:g_MISCINFO.GUILD_CHAT_ITEM_LENGTH},
			btn_send:{enabled: inGuild, onTouchEnded:this.send.bind(this)},
			btn_sticker:{enabled: inGuild, onTouchEnded:this.sticker.bind(this)},

			// donate control
			btn_donate_wait: {visible: inGuild && isCooldown, onTouchEnded:this.donateEnd.bind(this), enabled: false},
			lb_donate_wait: {type:UITYPE_TEXT, value:"TXT_DONATE_START_AFTER", style:TEXT_STYLE_TEXT_BUTTON_20},
			lb_time_cooldown: {type:UITYPE_TEXT, value:cooldown, style:TEXT_STYLE_TEXT_SMALL},

			btn_donate_start: {visible: inGuild && (canStart || canStop), onTouchEnded:this.donateStart.bind(this)},
			lb_donate_start: {type:UITYPE_TEXT, value:lbStart, style:TEXT_STYLE_TEXT_BUTTON_20},

			btn_donate_shortcut: {visible:false, onTouchEnded:this.donateShortcut.bind(this)},
			
			// chat log
			logs: {visible:inGuild}
		};
		
		if(this.currentTab === GUILD_TAB_GUILD)
			this.showGuildCreation(this.uiDef);
		
		// show
		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		FWUI.fillData(widget, null, this.uiDef);
		if(!FWUI.isWidgetShowing(widget))
		{
			FWUI.showWidget(widget, FWUtils.getCurrentScene(), UIFX_NONE);
			widget.setLocalZOrder(Z_UI_COMMON);
			AudioManager.effect(EFFECT_POPUP_SHOW);
			
			if(!this.hideFunc)
				this.hideFunc = function() {this.hide();}.bind(this);

			Game.gameScene.registerBackKey(this.hideFunc);
			Game.gameScene.registerEnterKey(function() {this.onEnterPressed();}.bind(this));//web
		}

		this.btn_donate_start = FWUtils.getChildByName (widget, "btn_donate_start");
		this.btn_donate_wait = FWUtils.getChildByName (widget, "btn_donate_wait");
		this.btn_donate_shortcut = FWUtils.getChildByName (widget, "btn_donate_shortcut");
		this.lb_time_cooldown = FWUtils.getChildByName (widget, "lb_time_cooldown");
		this.lb_donate_start = FWUtils.getChildByName (widget, "lb_donate_start");
		this.input = FWUtils.getChildByName (widget, "input");
		
		widget.stopAllActions();
		widget.runAction(
			cc.sequence(
				cc.callFunc(function() {this.reload();}.bind(this)),//web
				cc.callFunc(function() {//web
					widget.setPositionX(0);
					widget.runAction(cc.moveBy(0.25, cc.p(569, 0)));
					this.unread = 0;

					if (inGuild)
					{
						cc.director.getScheduler().scheduleCallbackForTarget(this, this.updateHeight, 0.05, cc.REPEAT_FOREVER, 0, false);
						cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
					}
				}.bind(this))
			)
		);
	},
	
	hide:function()
	{
		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		widget.stopAllActions();
		widget.runAction(
			cc.sequence(
				cc.moveBy(0.25, cc.p(-569, 0)), 
				cc.callFunc(function() {//web
					FWUI.hide(UI_CHAT_BOX, UIFX_NONE);
				}),
				cc.callFunc(function() {//web
					var logs = FWUtils.getChildByName(widget, "logs");
					logs.removeAllChildren ();
				})
			)
		);
        
		this.currentDonate = null;

		AudioManager.effect(EFFECT_POPUP_CLOSE);
		Game.gameScene.unregisterBackKey(this.hideFunc);
		Game.gameScene.unregisterEnterKey();
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
		cc.director.getScheduler().unscheduleCallbackForTarget(this, this.updateHeight);
	},

	leave:function ()
	{
		cc.log ("Chatbox", "leave", "gv.chatClient.isConnected", gv.chatClient.isConnected);

		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		if (widget)
		{
			if(FWUI.isWidgetShowing(widget))
				this.hide ();
			
			var logs = FWUtils.getChildByName(widget, "logs");
			logs.removeAllChildren ();
		}
		
		gv.chatClient.disconnect ();	
		Chatbox.items = [];
		Chatbox.pre_items = [];
		
		Donate.leave ();
		this.currentDonate = null;
	},

	reload:function ()
	{
		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		var logs = FWUtils.getChildByName(widget, "logs");
		if (!logs)
			return;
			
		logs.removeAllChildren ();
		for (var i in Chatbox.items)
		{
			var item = Chatbox.items [i];
			if (item && item.widget)
			{
				if (item.data)
					item.update (item.data);

				if (item.widget.getParent ())
					item.widget.removeFromParent ();
				
				logs.addChild (item.widget);
			}
		}

		this.updateItemPosition (false);
	},

	update:function ()
	{
		var inGuild = Guild.isPlayerInGuild() && Guild.isLoaded();
		if (!inGuild)
			return;
			
		var canStart = Donate.canStart();
		var canStop = Donate.canStop();
		var remain = Donate.remain();
		var isCooldown = Donate.isCooldown();

		this.btn_donate_start.setVisible (canStart || canStop);
		this.btn_donate_wait.setVisible (isCooldown);

		// cc.log ("ChatBox", "update", "cooldown", isCooldown, canStart, canStop, Donate.getCooldown (), Chatbox.timeToCountdown (Donate.getCooldown ()));

		if (isCooldown)
		{
			var cooldown = Chatbox.timeToCountdown (Donate.getCooldown ());
			this.lb_time_cooldown.setString (cooldown);
			FWUI.setWidgetEnabled(this.btn_donate_wait, false);
		}
		else
		{
			var lbStart = remain > 0 ? (canStop ? "TXT_DONATE_STOP" : "TXT_DONATE_CHAT_START") : "TXT_DONATE_CHAT_OUT_OF_DAY";
			this.lb_donate_start.setString (FWLocalization.text(lbStart));
		}

		var showDonateShortcut = false;
		for (var i in this.items)
		{
			var item = this.items [i];
			if (item)
				item.updateTime ();

			if (item.getType () === GUILD_CHAT_TYPE_DONATE)
				showDonateShortcut = true;
		}

		this.btn_donate_shortcut.setVisible (showDonateShortcut);
	},

	updateHeight: function ()
	{
		if (this.pre_items.length == 0)
			return;
		
		var item = this.pre_items.pop ();
		if (item)
			item.updateHeight ();

		Chatbox.add (item);
	},

	updateDonates:function ()
	{
		var removes = [];
		for (var i in this.items)
		{
			var item = this.items [i];
			if (item.getType () != GUILD_CHAT_TYPE_DONATE)
				continue;

			var owner = item.getId ();
			if (owner === gv.mainUserData.mainUserId)
			{
				if (!Donate.me || !Donate.me.isExpire ())
					removes.push (item);
			}
			else
			{
				if (!Donate.data [owner] || !Donate.data [owner].isExpire ())
					removes.push (item)
			}
		}

		for (var i in removes)
			this.removeItem (removes [i]);

		if (Donate.me)
		{
			var item = this.createDonateItem (Donate.me);
			if (item)
				this.add (item);
		}

		for (var id in Donate.data)
		{
			var donateData = Donate.data [id];
			var item = this.createDonateItem (donateData);
			if (item)
				this.add (item);
		}
	},

	search:function(sender)
	{
		this.hide ();
		Guild.showTab(GUILD_TAB_SEARCH);
	},

	check: function ()
	{
		return (gv.mainUserData.getLevel () >= g_MISCINFO.GUILD_USER_LEVEL && !Game.isFriendGarden());
	},

	haveNew: function ()
	{
		return this.unread > 0;
	},

	send:function(sender)
	{
		var msg = this.input.getString();

		if(!msg)
		{
			cc.log("Chatbox", "send", "msg is empty");
			return;
		}

		if (msg.length >= g_MISCINFO.GUILD_CHAT_ITEM_LENGTH)
		{
			var pos = sender ? FWUtils.getWorldPosition(sender) : cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
			FWUtils.showWarningText(FWLocalization.text("TXT_CHAT_LIMIT_LENGTH"), pos, cc.WHITE);
			return;
		}
		
		if (!gv.chatClient.isConnected)
		{
			cc.log("Chatbox", "send", "chat server is not connect");
			return;
		}
		
		cc.log("Chatbox", "sendChatGuild", msg.length, g_MISCINFO.GUILD_CHAT_ITEM_LENGTH, msg);
		network.chatBase.sendChatGuild (msg, GUILD_CHAT_TYPE_CHAT);
	},

	sticker:function(sender)
	{
		EmojiChoose.show (
			function(emoji)//web
			{
				cc.log("Chatbox", "sticker", emoji);

				if (emoji)
					network.chatBase.sendChatGuild (emoji, GUILD_CHAT_TYPE_EMOJI);
			}
		);
	},

	avatar:function(sender)
	{
		this.hide ();
		Guild.showTab(GUILD_TAB_GUILD);
	},

	donateShortcut:function(sender)
	{
		// cc.log("Chatbox", "donateShortcut");
		var start = this.items.indexOf (this.currentDonate);
		if (start < 0)
			start = 0;
			
		var length = this.items.length;
		for (var i = 0; i < length; i++)
		{
			var index = (i + start) % length;

			var item = this.items [index];
			if (item.getType() != GUILD_CHAT_TYPE_DONATE)
				continue;
			
			this.currentDonate = item;
		}

		// cc.log("Chatbox", "donateShortcut", (this.currentDonate ? "ready" : "cannot found"));
		if (!this.currentDonate)
			return;

		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		var logs = FWUtils.getChildByName(widget, "logs");
		var size = logs.getInnerContainerSize ();
		var position = this.currentDonate.widget.getPosition ();
		var logHeight = 530;
		var padding = (logHeight - this.currentDonate.getHeight ()) * 0.5;
		var percent = 100 - 100 * ((position.y - padding) / (size.height - logHeight));
		if (percent < 0)
			percent = 0;
		else if (percent > 100)
			percent = 100;

		// cc.log("Chatbox", "donateShortcut", percent);
		logs.jumpToPercentVertical (percent);
	},

	donateStart:function(sender)
	{
		cc.log ("Chatbox", "donateStart");
		var point = FWUtils.getWorldPosition(sender);
		point.y -= 60;

		Donate.checkStart (point);
	},

	donateEnd:function(sender)
	{
		cc.log ("Chatbox", "donateEnd");
		// Donate.endDonate ();
	},

	onChatItem:function(item)
	{
        var userId = item.getOwner ();
        if (userId === gv.mainUserData.mainUserId)
            return;

		var buttons = [
            {sprite:"hud/btn_blue.png", text:"TXT_GUILD_VISIT", callback:this.onVisit.bind(this), id:userId}
        ];

		FWUI.showContextMenu(item.widget, cc.p(470, item.getHeight () * 0.5), buttons);
	},
	
	onVisit:function(srcData)
	{
        var userId = srcData.id;
        
		var member = Guild.getMember (userId)
		if (member)
            GardenManager.changeGarden(member[FRIEND_ID], member[FRIEND_NAME], member[FRIEND_AVATAR]);
        else
            GardenManager.changeGarden(userId);
	},

	onClip:function(sender)
	{
		// this is cheat, the clip will swallow touch first, so i take that touch and change focus to input
		//this.input.attachWithIME();
	},

	onChat:function(sender)
	{
		var str = sender.getString();
		if (!str || str === "")
			return;
		
		var str2 = this.filter (this.tree, str);
		sender.setString (str2);
	},

	onEnterPressed: function ()
	{
		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		if(!FWUI.isWidgetShowing(widget))
			return;
        
		var msg = this.input.getString();
		if (!msg || msg === "")
			return;

		this.send (null);
	},

	createChatItem:function(chatData)
	{
		if (!chatData)
			return null;
		
		for (var i in this.items)
		{
			if (this.items [i].isChatItem() && this.items [i].getId() === chatData [KEY_UID])
				return null;
		}

		var widget = new ChatItem (chatData, function(item) {this.onChatItem (item);}.bind(this));//web
		return widget;
	},

	createEmojiItem:function(emojiData)
	{
		if (!emojiData)
			return null;
		
		for (var i in this.items)
		{
			if (this.items [i].isChatItem() && this.items [i].getId() === emojiData [KEY_UID])
				return null;
		}

		var widget = new ChatItem_Emoji (emojiData, function(item) {this.onChatItem (item);}.bind(this));//web
		return widget;
	},

	createDonateItem:function(donateData)
	{
		if (!donateData || donateData.isExpire())
			return null;
		
		for (var i in this.items)
		{
			var item = this.items [i];
			if (item.getType() == GUILD_CHAT_TYPE_DONATE && item.getId() === donateData.owner)
			{
				item.update (donateData);
				return;
			}
		}

		var widget = new ChatItem_Donate (donateData);
		return widget;
	},

	createChatNotify:function(chatData)
	{
		if (!chatData)
			return null;
		
		for (var i in this.items)
		{
			var item = this.items [i];
			if (item.getType() == GUILD_CHAT_TYPE_NOTIFY && item.getId() === chatData [KEY_UID])
				return null;
		}

		var widget = new ChatItem_Notify (chatData);
		return widget;
	},

	pre_add:function(item)
	{
//		cc.log ("Chatbox", "pre_add", "item", (item) ? item.getType () : "null");
		if (!item)
			return;

		Chatbox.pre_items.push (item);
		item.preUpdateHeight ();
	},

	add:function(item, autoScroll)//web add:function(item, autoScroll = false)
	{
		if(autoScroll === undefined)
			autoScroll = false;
		cc.log ("Chatbox", "add", "item", (item) ? item.getType () : "null");
		if (!item)
			return;

		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		var logs = FWUtils.getChildByName(widget, "logs");

		if (!logs)
			return;

		if (item.isChatItem ())
		{
			var remain = g_MISCINFO.GUILD_CHAT_LINE_LIMIT;
			var remove = [];
			var keep = [];
			while (Chatbox.items.length > 0)
			{
				var item2 = Chatbox.items.pop();
				if (item2.isChatItem ())
				{
					remain -= 1;
					if (remain < 1)
					{
						remove.push (item2);
						continue;
					}
				}

				keep.push (item2);
			}

			for (var i in remove)
			{
				var item3 = remove [i];
				logs.removeChild (item3.widget);
				item3.hide();
			}

			Chatbox.items = keep;
		}
		
		if (item.widget.getParent ())
			item.widget.removeFromParent ();
		
		Chatbox.items.push (item);
		Chatbox.items.sort(function(a, b) {return this.itemSort (a, b);}.bind(this));//web
		logs.addChild (item.widget);
		this.updateItemPosition (autoScroll);

		if(!FWUI.isWidgetShowing(widget))
			this.unread += 1;
	},

	updateItemPosition: function(autoScroll)//web updateItemPosition: function(autoScroll = false)
	{
		if(autoScroll === undefined)
			autoScroll = false;
		
		var totalHeight = 0;
		var startY = 0;
		for (var i in Chatbox.items)
		{
			var item = Chatbox.items [i];
			var widget = item.widget;
			var current = widget.getPosition ();
			var height = item.getHeight ();
			var pos = cc.p (current.x, startY + item.getOffsetY ());
			startY += height;

			// cc.log ("chatbox", i, height, item.getType (), totalHeight);
			totalHeight += Math.abs (height);
			if (autoScroll)
			{
				var moveTo = cc.moveTo(0.05, pos);
				widget.runAction(moveTo);
			}
			else
			{
				widget.setPosition (pos);
			}
		}

		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		var logs = FWUtils.getChildByName(widget, "logs");
		logs.setInnerContainerSize(cc.size(530, totalHeight + 30));
	},

	removeItem: function (item)
	{
		if (!item)
			return;

		var index = this.items.indexOf (item);
//		cc.log ("Chatbox", "removeItem", item.getType (), item.getId(), index);
		if (index < 0)
			return;
		
		this.items.splice(index, 1);

		var widget = FWPool.getNode(UI_CHAT_BOX, false);
		var logs = FWUtils.getChildByName(widget, "logs");
		logs.removeChild (item.widget);

		this.updateItemPosition ();
	},

	removeDonate: function (userId)
	{
//		cc.log ("Chatbox", "removeDonate", userId);
		for (var i in this.items)
		{
			var item = this.items [i];
			if (item.getType () != GUILD_CHAT_TYPE_DONATE)
				continue;

			var owner = item.getId ();
			if (owner != userId)
				continue;

			this.removeItem (item);
//			cc.log ("Chatbox", "removeDonate", userId, "done");
		}
	},

	onReceive:function(package)
	{
		if (!package || !package [KEY_TIME])
			return;

		var timeFilter = Guild.playerGuildData[GUILD_USER_JOIN_AT];
		if (timeFilter)
		{
			var time = package [KEY_TIME];
			if (time < timeFilter)
				return;
		}

		var type = package [KEY_TYPE];
		var item = null;

		cc.log ("onReceive", type);
		switch (type)
		{
			case GUILD_CHAT_TYPE_CHAT:
				item = Chatbox.createChatItem (package);
			break;
			
			case GUILD_CHAT_TYPE_NOTIFY:
				item = Chatbox.createChatNotify (package);
			break;

			case GUILD_CHAT_TYPE_EMOJI:
				item = Chatbox.createEmojiItem (package);
			break;
		}

		if (item)
			Chatbox.pre_add (item);

		if (this.input)
			this.input.setString("");
	},

	addUserOnline:function (userIds)
	{
		for (var i in userIds)
		{
			var userId = userIds [i];
			this.users [userId] = true;
		}
	},

	removeUserOnline:function (userId)
	{
		this.users [userId] = false;
	},

	getOnline:function (userId)
	{
		return this.users [userId];
	},

	itemSort:function (a, b)
	{
		var aT = a ? a.getTime () : -1;
		var bT = b ? b.getTime () : -1;
		
		return aT > bT ? 1 : -1;
	},

	dateToString:function (date)
	{
		if (!date)
			return;
		
		var yy = date.getFullYear();
		var mo = date.getMonth() + 1;	if (mo < 10) mo = "0" + mo;
		var da = date.getDate();		if (da < 10) da = "0" + da;
		var hh = date.getHours();		if (hh < 10) hh = "0" + hh;
		var mm = date.getMinutes();		if (mm < 10) mm = "0" + mm;

		return yy + "/" + mo + "/" + da + " " + hh + ":" + mm;
	},

	dateToDateString:function (date)
	{
		if (!date)
			return;
		
		var yy = date.getFullYear();
		var mo = date.getMonth() + 1;	if (mo < 10) mo = "0" + mo;
		var da = date.getDate();		if (da < 10) da = "0" + da;

		return da + "/" + mo + "/" + yy;
	},

	dateToHourString:function (date)
	{
		if (!date)
			return;
		
		var hh = date.getHours();		if (hh < 10) hh = "0" + hh;
		var mm = date.getMinutes();		if (mm < 10) mm = "0" + mm;
		var ss = date.getSeconds();		if (ss < 10) ss = "0" + ss;

		return hh + ":" + mm + ":" + ss;
	},

	timeToCountdown:function (time)
	{
		var current = Game.getGameTimeInSeconds();
		current = Math.floor (current);

		var offset = time - current;
		if (offset < 0)
			return "00:00:00";

		if (offset > 24 * 3600)
		{
			var day = Math.floor (offset / (24 * 3600));
			return day + "d";
		}

		var hour = Math.floor (offset / 3600);
		offset -= hour * 3600;

		var minute = Math.floor (offset / 60);
		var seconds = offset - minute * 60;

		if (hour < 10) hour = "0" + hour;
		if (minute < 10) minute = "0" + minute;
		if (seconds < 10) seconds = "0" + seconds;
		return hour + ":" + minute + ":" + seconds;
	},
	
	filterInit:function (database)
	{
		var tree = {};
		for (var i in database)
		{
			var str = database [i].toLowerCase ();
			var current = tree;
			for (var ci in str)
			{
				var char = str [ci];
				if (!current [char])
					current [char] = {};

				current = current [char];
			}

			current ["stop"] = true;
		}

//		cc.log ("chatbox", "filterInit", JSON.stringify (tree));
		return tree;
	},

	filter:function (tree, str)
	{
		var temp = str.toLowerCase ();
		var result = [];
		var i = 0;
		while (i < temp.length)
		{
			var char = temp [i];

			if (!tree [char])
			{
				result.push (str [i]);
				i += 1;
				continue;
			}

			var current = tree [char];
			var j = i + 1;
			while (j < temp.length)
			{
				if (current ["stop"])
					break;
				
				char = temp [j];
				if (!current [char])
					break;
				
				current = current [char];
				j += 1;
			}
			
			if (current ["stop"])
			{
				for (var c = i; c < j; c++)
					result.push ("*");
				
				i = j;
				continue;
			}
			
			result.push (str [i]);
			i += 1;
		}

		var str2 = result.join ("");

//		cc.log ("chatbox", "filter", str, str2);
		return str2;
	},
};