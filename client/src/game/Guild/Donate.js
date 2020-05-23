var Donate =
{
	data: null,
	me: null,

	init:function()
	{
		cc.log("Donate", "init");

		if (!Guild.playerGuildData)
		{
			cc.log("Donate", "init", "Guild.playerGuildData", "null");
			return;
		}
		
		if (!Guild.playerGuildData [GUILD_USER_DONATE])
		{
			cc.log("Donate", "init", "Guild.playerGuildData [GUILD_USER_DONATE]", Guild.playerGuildData [GUILD_USER_DONATE]);
			this.me = null;
			return;
		}

		var pk = network.connector.client.getOutPacket(this.RequestGuildDonateGet);
		pk.pack(gv.mainUserData.mainUserId);
		network.connector.client.sendPacket(pk);
	},

	leave: function ()
	{
		this.data = null;
		this.me = null;
	},

	remain:function ()
	{
		if (!Guild.playerGuildData)
			return 0;
		
		return Guild.playerGuildData[GUILD_USER_DONATE_REMAIN];
	},

	itemRemain:function ()
	{
		if (!Guild.playerGuildData)
			return 0;
		
		return g_MISCINFO.GUILD_DONATE_ITEM_LIMIT - Guild.playerGuildData[GUILD_USER_DONATE_ITEM_REMAIN];
	},

	nextTime:function ()
	{
		if (!Guild.playerGuildData)
			return 0;
		
		return Guild.playerGuildData[GUILD_USER_DONATE_NEXT_TIME];
	},

	updateData:function (donates)
	{
		cc.log("Donate", "updateData", JSON.stringify(donates));
		
		if (!donates || donates.length === 0)
			return;

		if (!Donate.data)
			Donate.data = {};

		for (var i in donates)
		{
			var donate = Donate.parserDonate (donates [i]);
			if (donate.itemCurrent >= donate.itemNum)
				continue;
			
			if (donate.owner !== gv.mainUserData.mainUserId)
			{
				Donate.data [donate.owner] = donate;
				continue;
			}
			
			Donate.me = donate;
		}

		if (Donate.me && Donate.me.isExpire ())
			Donate.endDonate ();
		
		Chatbox.updateDonates();
		cc.log("Donate", "updateData", JSON.stringify(Donate.data), JSON.stringify(Donate.me));
	},

	remove:function (ownerId)
	{
		if (ownerId !== gv.mainUserData.mainUserId)
		{
			if (Donate.data [ownerId])
				delete Donate.data [ownerId];
		}
		else if (Donate.me)
			Donate.me = null;

		Chatbox.removeDonate (ownerId);
	},

	parserDonate:function (object)
	{
		if (!object)
			return null;

		var donate = {};
		donate.owner = object [GUILD_DONATE_OWNER];
		donate.itemId = object [GUILD_DONATE_ITEM];
		donate.itemNum = object [GUILD_DONATE_NUM];
		donate.itemCurrent = object [GUILD_DONATE_CURRENT] ? object [GUILD_DONATE_CURRENT] : 0;
		donate.start = object [GUILD_DONATE_TIME_START];
		donate.end = object [GUILD_DONATE_TIME_END];
		donate.donators = {};
		donate.isActive = function() {return (donate.start < Game.getGameTimeInSeconds() && Game.getGameTimeInSeconds() < donate.end);};//web donate.isActive = () => donate.start < Game.getGameTimeInSeconds() && Game.getGameTimeInSeconds() < donate.end;
		donate.isExpire = function() {return (Game.getGameTimeInSeconds() > donate.end);};//web donate.isExpire = () => Game.getGameTimeInSeconds() > donate.end;
		donate.timeRemain = function() {return Math.max (donate.end - Game.getGameTimeInSeconds(), 0);};//web donate.timeRemain = () => Math.max (donate.end - Game.getGameTimeInSeconds(), 0);
		donate.timeNext = donate.start + g_MISCINFO.GUILD_DONATE_COOLDOWN;

		if (object [GUILD_DONATE_DONATORS])
		for (var i = 0; i < object [GUILD_DONATE_DONATORS].length; i += 2)
		{
			var donatorId = object [GUILD_DONATE_DONATORS] [i];
			var gived = object [GUILD_DONATE_DONATORS] [i + 1];
			donate.donators [donatorId] = gived;
		}

		return donate;
	},

	isActive:function (memberId)
	{
		if (!memberId || memberId === gv.mainUserData.mainUserId)
		{
			cc.log ("Donate", "isActive", Guild.playerGuildData [GUILD_USER_DONATE]);
			cc.log ("Donate", "Donate.me", JSON.stringify (Donate.me));
			
			return (Donate.me) ? true : false;
		}

		if (Donate.data [memberId])
			return true;

		return false;
	},

	canStart:function ()
	{
		if (Donate.isCooldown())
			return false;

		if (!Donate.remain())
			return false;
		
		if (!Donate.me)
			return true;

		return !Donate.me.isActive();
	},

	canStop:function ()
	{
		if (!Donate.me)
			return false;
		
		return !Donate.isCooldown();
	},

	isCooldown:function ()
	{
		return Donate.nextTime () > Game.getGameTimeInSeconds();
	},

	getCooldown:function ()
	{
		return Donate.nextTime ();
	},

	chooseItem:function ()
	{
		cc.log ("Donate", "chooseItem");
		
		var items = [];
		for (var itemId in g_GUILD.DONATE_ITEMS)
		{
			if(!defineMap[itemId])
				continue;
			
			var level = defineMap[itemId].LEVEL_UNLOCK;
			if (level && level > gv.mainUserData.getLevel())
				continue;

			items.push (itemId);
		}
		
		DonateChooseItem.show(items, function(itemId) {this.startDonate (itemId);}.bind(this));//web
	},

	checkStart:function (point)
	{
		var inGuild = Guild.isPlayerInGuild() && Guild.isLoaded();
		if (!inGuild)
			return;
		
		var remain = Donate.remain ();
		
		if (!Donate.me)
		{
			if (remain > 0)
				Donate.chooseItem ();
			else
				FWUtils.showWarningText(FWLocalization.text("TXT_DONATE_OUT_OF_DAY"), point, cc.WHITE);
			
			return;
		}

		var itemName = Game.getItemName (Donate.me.itemId);
		var collect = Donate.me.itemCurrent + " " + itemName;
		remain = Donate.remain ();//web var remain = Donate.remain ();
		var content = cc.formatStr(FWLocalization.text("TXT_DONATE_DID_YOUR_WANT_STOP"), collect, remain);
		var displayInfo = {content:content, closeButton:true, okText:"TXT_OK", avatar:"npc/npc_06.png"};
		Game.showPopup(displayInfo, function(sender) {Donate.endDonate ();});//web
	},

	startDonate:function (itemId)
	{
		var canStart = Donate.canStart ();
		cc.log ("Donate", "startDonate", canStart, itemId);
		if (!canStart)
			return;
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildDonateStart);
		pk.pack(itemId);
		network.connector.client.sendPacket(pk);
	},

	sendDonate:function (receiveMember)
	{
		cc.log ("Donate", "sendDonate", receiveMember);
		var pk = network.connector.client.getOutPacket(this.RequestGuildDonate);
		pk.pack(receiveMember);
		network.connector.client.sendPacket(pk);
	},

	endDonate:function ()
	{
		var canStop = Donate.canStop ();
		cc.log ("Donate", "endDonate", canStop);
		if (!canStop)
			return;
		
		var pk = network.connector.client.getOutPacket(this.RequestGuildDonateEnd);
		pk.pack();
		network.connector.client.sendPacket(pk);
	},
	
///////////////////////////////////////////////////////////////////////////////////////
// server /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////		
	
	RequestGuildDonateGet:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_DONATE_GET);},
		pack:function(targetId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_USER_ID, targetId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildDonateGet:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Donate", "ResponseGuildDonateGet", "error", this.getError());
				return;
			}

			var donate = object [KEY_DATA];
			cc.log("Donate", "ResponseGuildDonateGet", JSON.stringify (donate));

			if (donate)
				Donate.updateData ([donate]);
		}
	}),

	RequestGuildDonateStart:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_DONATE_START);},
		pack:function(itemId)
		{
			addPacketHeader(this);
			PacketHelper.putString(this, KEY_ITEM_ID, itemId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildDonateStart:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Donate", "ResponseGuildDonateStart", "error", this.getError());
				return;
			}

			var donate = object [KEY_DATA];
			var userGuild = object [KEY_GUILD];
			cc.log("Donate", "ResponseGuildDonateStart", JSON.stringify (donate));
			
			if (donate)
				Donate.updateData ([donate]);

			if (userGuild)
				Guild.setPlayerGuildData (userGuild);
		}
	}),

	RequestGuildDonate:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_DONATE);},
		pack:function(targetId)
		{
			addPacketHeader(this);
			PacketHelper.putInt(this, KEY_USER_ID, targetId);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildDonate:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			
			if(this.getError() !== 0)
			{
				cc.log("Donate", "ResponseGuildDonate", "error", this.getError());
				return;
			}

			var donator = object [KEY_USER_ID];
			var donate = object [KEY_DATA];
			var updateItems = object [KEY_UPDATE_ITEMS];
			var remainItems = object [KEY_REMAIN_ITEM];

			cc.log("Donate", "ResponseGuildDonate", donator, JSON.stringify (donate), JSON.stringify (updateItems));
			
			if (updateItems)
			{
				gv.userStorages.updateItems(updateItems);
				Guild.playerGuildData[GUILD_USER_DONATE_ITEM_REMAIN] = remainItems;
			}

			if (donate)
				Donate.updateData ([donate]);

			if (donator)
			{
				// add notify someone donate item to ...
			}

			// try remove touch end
			FWUI.touchedWidget = null;
			FWUI.draggedWidget = null;
		}
	}),

	RequestGuildDonateEnd:fr.OutPacket.extend
	({
		ctor:function() {this._super(); this.initData(100); this.setCmdId(gv.CMD.GUILD_MEMBER_DONATE_END);},
		pack:function()
		{
			addPacketHeader(this);
			
			addPacketFooter(this);
		},
	}),

	ResponseGuildDonateEnd:fr.InPacket.extend
	({
		ctor:function() {this._super();},
		readData:function()
		{
			var object = PacketHelper.parseObject(this);
			var memberId = object [KEY_USER_ID];
			
			cc.log("Donate", "ResponseGuildDonateEnd", memberId, this.getError());
			Donate.remove (memberId);
		}
	}),
};

network.packetMap[gv.CMD.GUILD_MEMBER_DONATE_GET] = Donate.ResponseGuildDonateGet;
network.packetMap[gv.CMD.GUILD_MEMBER_DONATE_START] = Donate.ResponseGuildDonateStart;
network.packetMap[gv.CMD.GUILD_MEMBER_DONATE] = Donate.ResponseGuildDonate;
network.packetMap[gv.CMD.GUILD_MEMBER_DONATE_END] = Donate.ResponseGuildDonateEnd;

network.chatMap[gv.CMD.GUILD_MEMBER_DONATE_GET] = Donate.ResponseGuildDonateGet;
network.chatMap[gv.CMD.GUILD_MEMBER_DONATE_START] = Donate.ResponseGuildDonateStart;
network.chatMap[gv.CMD.GUILD_MEMBER_DONATE] = Donate.ResponseGuildDonate;
network.chatMap[gv.CMD.GUILD_MEMBER_DONATE_END] = Donate.ResponseGuildDonateEnd;