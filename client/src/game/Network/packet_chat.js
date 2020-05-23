
network.chatBase.HandshakeRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.HAND_SHAKE);
        this.setControllerId(gv.CONTROLLER_ID.SPECIAL_CONTROLLER);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    }
});

network.chatBase.HandshakeResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        if (this.error === 0)
            network.chatBase.sendRequestLogin();
    }
});

network.chatBase.sendRequestLogin = function () {
    cc.log("sendRequestLogin");
    var pk = gv.chatClient.getOutPacket(network.chatBase.UserLoginRequest);
    pk.pack(this.token || "");
    gv.chatClient.sendPacket(pk);
};

network.chatBase.UserLoginRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(512);
        this.setCmdId(gv.CMD.USER_LOGIN);
    },
    pack: function (user) {
        addPacketHeader(this);

        PacketHelper.putString(this, KEY_SESSION_PORTAL, ZPLogin.getCurrentSessionKey());
        //PacketHelper.putString(this, KEY_USER_ID, 2008);
        PacketHelper.putInt(this, KEY_GUILD, Guild.getGuildId ());

        PacketHelper.putString(this, KEY_CLIENT_VERSION, FWClientConfig.scriptVersion);        
        PacketHelper.putString(this, KEY_DEVICE_ID, fr.platformWrapper.getDeviceID());        
        PacketHelper.putString(this, KEY_PACKAGE_NAME, fr.platformWrapper.getPackageName());
        PacketHelper.putString(this, KEY_COUNTRY, COUNTRY);

        
        addPacketFooter(this);
    }
});

network.chatBase.UserLoginResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function ()
    {
        this.error = this.getError();

        if (this.error === 0)
            Chatbox.addUserOnline ([gv.mainUserData.mainUserId]);
    }
});

network.chatBase.sendPing = function () {        
    if (!gv.chatClient.isConnected)
        return;
    cc.log("CHAT PING");
    var pk = gv.chatClient.getOutPacket(network.chatBase.PingRequest);
    pk.pack();
    gv.chatClient.sendPacket(pk);
};

network.chatBase.PingRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setCmdId(gv.CMD.CHAT_PING);
    },
    pack: function () {
        addPacketHeader(this);
        addPacketFooter(this);
    },
});

network.chatBase.PingResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        
    }
});

network.chatBase.KickResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        cc.log("[ChatClient]", "KickResponse");
        gv.chatClient.useReconect = false;
    }
});

network.chatBase.sendChatPrivate = function (toUser, data) {        
    if (!gv.chatClient.isConnected)
        return;
    var pk = gv.chatClient.getOutPacket(network.chatBase.ChatPrivateRequest);
    pk.pack(toUser, data);
    gv.chatClient.sendPacket(pk);
};

network.chatBase.ChatPrivateRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(512);
        this.setCmdId(gv.CMD.CHAT_SEND_PRIVATE);
    },
    pack: function (toUser, data) {
        addPacketHeader(this);
        
        PacketHelper.putInt(this, KEY_FRIEND_ID, toUser);
        PacketHelper.putString(this, KEY_DATA, data);

        
        addPacketFooter(this);
    },
});

network.chatBase.ChatPrivateResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);        
        
        this.fromUser = payload[KEY_USER_ID];
        this.toUser = payload[KEY_FRIEND_ID];
        this.data = payload[KEY_DATA];
    }
});

network.chatBase.sendChatGuild = function (data, type) {        
    if (!gv.chatClient.isConnected)
        return;
    var pk = gv.chatClient.getOutPacket(network.chatBase.ChatGuildRequest);
    pk.pack(data, type);
    gv.chatClient.sendPacket(pk);
};

network.chatBase.ChatGuildRequest = fr.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(512);
        this.setCmdId(gv.CMD.CHAT_SEND_GUILD);
    },
    pack: function (data, type) {//web pack: function (data, type = 0) {
		
		if(type === undefined)
			type = 0;
		
        addPacketHeader(this);        
        
        PacketHelper.putString(this, KEY_DATA, data);
        PacketHelper.putInt(this, KEY_TYPE, type);

        
        addPacketFooter(this);
    },
});

network.chatBase.ChatGuildResponse = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);        
        cc.log ("ChatGuildResponse", JSON.stringify (payload));

        if (this.error === 0)
            Chatbox.onReceive (payload);
    }
});

network.chatBase.ChatOnline = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);

        if (this.error === 0)
            Chatbox.addUserOnline (payload [KEY_USER_ID]);
    }
});

network.chatBase.ChatOffline = fr.InPacket.extend({
    ctor: function () {
        this._super();
    },
    readData: function () {
        this.error = this.getError();
        var payload = PacketHelper.parseObject(this);

        if (this.error === 0)
            Chatbox.removeUserOnline (payload [KEY_USER_ID]);
    }
});

network.chatMap[gv.CMD.HAND_SHAKE] = network.chatBase.HandshakeResponse;
network.chatMap[gv.CMD.USER_LOGIN] = network.chatBase.UserLoginResponse;
network.chatMap[gv.CMD.CHAT_PING] = network.chatBase.PingResponse;
network.chatMap[gv.CMD.CHAT_KICK] = network.chatBase.KickResponse;
network.chatMap[gv.CMD.CHAT_SEND_PRIVATE] = network.chatBase.ChatPrivateResponse;
network.chatMap[gv.CMD.CHAT_SEND_GUILD] = network.chatBase.ChatGuildResponse;
network.chatMap[gv.CMD.CHAT_ONLINE] = network.chatBase.ChatOnline;
network.chatMap[gv.CMD.CHAT_OFFLINE] = network.chatBase.ChatOffline;